"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentHistoryByParentId = exports.getPaymentSummary = exports.checkPaymentStatus = exports.verifyPayment = exports.uploadReceipt = void 0;
const client_1 = require("@prisma/client");
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
// Define the fee structure based on keywords in class name
const sectionFees = {
    nursery: 30000, // Fee for Nursery section
    primary: 35000, // Fee for Primary section
    secondary: 42000, // Fee for Secondary section
};
const uploadReceipt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId, parentId } = req.body;
    const file = req.file;
    if (!file || !studentId || !parentId) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        res.status(400).json({ error: "Only JPEG and PNG images are allowed" });
        return;
    }
    const filePath = file.path;
    const receiptUrl = `/uploads/${file.filename}`;
    try {
        const result = yield tesseract_js_1.default.recognize(filePath, "eng", {
            logger: (m) => console.log(m),
        });
        // Clean up and normalize the extracted text
        let text = result.data.text
            .replace(/[#%]+(?=\d)/g, "#") // fix '#%20,000' style glitches
            .replace(/[^a-zA-Z0-9₦#.,\s]/g, "") // remove noisy OCR symbols
            .replace(/\s+/g, " ")
            .trim();
        console.log("Cleaned OCR Text:", text);
        // Patterns to match Naira amounts
        const amountPatterns = [
            /₦\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/i,
            /#\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/i,
            /NGN\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/i,
            /\b(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\b/, // fallback
        ];
        let amountMatch = null;
        for (const pattern of amountPatterns) {
            const match = text.match(pattern);
            if (match) {
                const rawAmount = match[1].replace(/,/g, "");
                const amount = parseFloat(rawAmount);
                if (!isNaN(amount) && amount > 0) {
                    console.log(`Pattern matched: ${pattern}`);
                    console.log(`Raw match: ${match[0]}, Extracted amount: ${match[1]}`);
                    amountMatch = match;
                    break;
                }
            }
        }
        if (!amountMatch) {
            res
                .status(400)
                .json({ error: "Could not extract a valid Naira amount from receipt" });
            return;
        }
        const finalAmount = parseFloat(amountMatch[1].replace(/,/g, ""));
        const payment = yield prisma.payment.create({
            data: {
                studentId,
                parentId,
                amountPaid: finalAmount,
                receiptUrl,
                verified: false,
            },
        });
        try {
            fs_1.default.unlinkSync(path_1.default.resolve(filePath));
        }
        catch (cleanupError) {
            console.error("File cleanup error:", cleanupError);
        }
        res.status(200).json({
            message: "Receipt uploaded successfully",
            payment,
            currency: "NGN",
        });
    }
    catch (error) {
        console.error("Error processing receipt:", error);
        res.status(500).json({ error: "Error processing receipt" });
    }
});
exports.uploadReceipt = uploadReceipt;
// Function to handle payment verification
const verifyPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { paymentId } = req.params;
    try {
        // Update the payment status to verified
        const updated = yield prisma.payment.update({
            where: { id: paymentId },
            data: { verified: true },
        });
        // Respond with a success message and the updated payment details
        res.status(200).json({ message: "Payment verified", updated });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: "Unable to verify payment" });
    }
});
exports.verifyPayment = verifyPayment;
// Function to check payment status
const checkPaymentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId } = req.params;
    try {
        // Fetch student and class name
        const student = yield prisma.student.findUnique({
            where: { id: studentId },
            select: {
                class: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        if (!student || !student.class) {
            return res.status(404).json({ error: "Student or class not found" });
        }
        const className = student.class.name.toLowerCase(); // Now safe to call toLowerCase
        let feeAmount = 0;
        if (className.includes("nursery")) {
            feeAmount = sectionFees.nursery;
        }
        else if (className.includes("primary")) {
            feeAmount = sectionFees.primary;
        }
        else if (className.includes("secondary") || className.includes("ss")) {
            feeAmount = sectionFees.secondary;
        }
        else {
            return res
                .status(400)
                .json({ error: "Could not determine section from class name" });
        }
        // Fetch all payments made by this student
        const payments = yield prisma.payment.findMany({
            where: { studentId },
        });
        const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
        let status = "";
        if (totalPaid === 0)
            status = "Not Paid";
        else if (totalPaid < feeAmount)
            status = "Partially Paid";
        else
            status = "Fully Paid";
        res.status(200).json({
            studentId,
            class: className,
            totalPaid,
            feeAmount,
            status,
            payments,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error checking payment status" });
    }
});
exports.checkPaymentStatus = checkPaymentStatus;
const getPaymentSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const students = yield prisma.student.findMany({
            include: {
                class: true,
                payments: true,
            },
        });
        const fullyPaid = [];
        const awaitingVerification = [];
        const notPaid = [];
        for (const student of students) {
            const className = student.class.name.toLowerCase();
            // Determine fee based on class name
            let expectedFee = 0;
            if (className.includes("nursery")) {
                expectedFee = 30000;
            }
            else if (className.includes("primary")) {
                expectedFee = 35000;
            }
            else if (className.includes("ss") || className.includes("secondary")) {
                expectedFee = 42000;
            }
            const verifiedPayments = student.payments.filter((p) => p.verified);
            const totalVerified = verifiedPayments.reduce((sum, p) => sum + p.amountPaid, 0);
            if (student.payments.length === 0) {
                notPaid.push(student);
            }
            else if (verifiedPayments.length === 0) {
                awaitingVerification.push(student);
            }
            else if (totalVerified >= expectedFee) {
                fullyPaid.push(student);
            }
            else {
                awaitingVerification.push(student); // or you could create a new `partiallyPaid` array
            }
        }
        res.status(200).json({
            fullyPaid,
            awaitingVerification,
            notPaid,
        });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ error: "Something went wrong while generating summary" });
    }
});
exports.getPaymentSummary = getPaymentSummary;
const getPaymentHistoryByParentId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { parentId } = req.params;
    try {
        // Find all students belonging to the parent
        const students = yield prisma.student.findMany({
            where: { parentId },
        });
        if (!students || students.length === 0) {
            res.status(404).json({ message: "No students found for this parent." });
            return;
        }
        const studentIds = students.map((student) => student.id);
        // Fetch all payments for those students
        const payments = yield prisma.payment.findMany({
            where: { studentId: { in: studentIds } },
            orderBy: { createdAt: "desc" },
        });
        const response = payments.map((payment) => ({
            date: payment.createdAt.toISOString().split("T")[0], // assuming createdAt field exists
            receiptUrl: payment.receiptUrl,
            amount: payment.amountPaid,
            verified: payment.verified,
            studentId: payment.studentId,
        }));
        res.json({ payments: response });
    }
    catch (error) {
        console.error("Error getting payment history:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getPaymentHistoryByParentId = getPaymentHistoryByParentId;
