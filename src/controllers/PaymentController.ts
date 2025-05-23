// controllers/PaymentController.ts
import { Request, Response } from "express";
import { createWorker, RecognizeResult } from "tesseract.js";
import { PrismaClient } from "@prisma/client";
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Define the fee structure based on keywords in class name
const sectionFees = {
  nursery: 30000, // Fee for Nursery section
  primary: 35000, // Fee for Primary section
  secondary: 42000, // Fee for Secondary section
};

export const uploadReceipt = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    const result = await Tesseract.recognize(filePath, "eng", {
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

    let amountMatch: RegExpMatchArray | null = null;

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

    const payment = await prisma.payment.create({
      data: {
        studentId,
        parentId,
        amountPaid: finalAmount,
        receiptUrl,
        verified: false,
      },
    });

    try {
      fs.unlinkSync(path.resolve(filePath));
    } catch (cleanupError) {
      console.error("File cleanup error:", cleanupError);
    }

    res.status(200).json({
      message: "Receipt uploaded successfully",
      payment,
      currency: "NGN",
    });
  } catch (error) {
    console.error("Error processing receipt:", error);
    res.status(500).json({ error: "Error processing receipt" });
  }
};

// Function to handle payment verification
export const verifyPayment = async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  try {
    // Update the payment status to verified
    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: { verified: true },
    });

    // Respond with a success message and the updated payment details
    res.status(200).json({ message: "Payment verified", updated });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Unable to verify payment" });
  }
};

// Function to check payment status
export const checkPaymentStatus = async (req: Request, res: Response) => {
  const { studentId } = req.params;

  try {
    // Fetch student and class name
    const student:any = await prisma.student.findUnique({
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
    } else if (className.includes("primary")) {
      feeAmount = sectionFees.primary;
    } else if (className.includes("secondary") || className.includes("ss")) {
      feeAmount = sectionFees.secondary;
    } else {
      return res
        .status(400)
        .json({ error: "Could not determine section from class name" });
    }

    // Fetch all payments made by this student
    const payments = await prisma.payment.findMany({
      where: { studentId },
    });

    const totalPaid = payments.reduce((sum:any, p:any) => sum + p.amountPaid, 0);

    let status = "";
    if (totalPaid === 0) status = "Not Paid";
    else if (totalPaid < feeAmount) status = "Partially Paid";
    else status = "Fully Paid";

    res.status(200).json({
      studentId,
      class: className,
      totalPaid,
      feeAmount,
      status,
      payments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error checking payment status" });
  }
};

export const getPaymentSummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const students = await prisma.student.findMany({
      include: {
        class: true,
        payments: true,
      },
    });

    const fullyPaid: any[] = [];
    const awaitingVerification: any[] = [];
    const notPaid: any[] = [];

    for (const student of students) {
      const className = student.class.name.toLowerCase();

      // Determine fee based on class name
      let expectedFee = 0;
      if (className.includes("nursery")) {
        expectedFee = 30000;
      } else if (className.includes("primary")) {
        expectedFee = 35000;
      } else if (className.includes("ss") || className.includes("secondary")) {
        expectedFee = 42000;
      }

      const verifiedPayments = student.payments.filter((p:any) => p.verified);
      const totalVerified = verifiedPayments.reduce(
        (sum:any, p:any) => sum + p.amountPaid,
        0
      );

      if (student.payments.length === 0) {
        notPaid.push(student);
      } else if (verifiedPayments.length === 0) {
        awaitingVerification.push(student);
      } else if (totalVerified >= expectedFee) {
        fullyPaid.push(student);
      } else {
        awaitingVerification.push(student); // or you could create a new `partiallyPaid` array
      }
    }

    res.status(200).json({
      fullyPaid,
      awaitingVerification,
      notPaid,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Something went wrong while generating summary" });
  }
};

export const getPaymentHistoryByParentId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { parentId } = req.params;

  try {
    // Find all students belonging to the parent
    const students = await prisma.student.findMany({
      where: { parentId },
    });

    if (!students || students.length === 0) {
      res.status(404).json({ message: "No students found for this parent." });
      return;
    }

    const studentIds = students.map((student:any) => student.id);

    // Fetch all payments for those students
    const payments = await prisma.payment.findMany({
      where: { studentId: { in: studentIds } },
      orderBy: { createdAt: "desc" },
    });

    const response = payments.map((payment:any) => ({
      date: payment.createdAt.toISOString().split("T")[0], // assuming createdAt field exists
      receiptUrl: payment.receiptUrl,
      amount: payment.amountPaid,
      verified: payment.verified,
      studentId: payment.studentId,
    }));

    res.json({ payments: response });
  } catch (error) {
    console.error("Error getting payment history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
