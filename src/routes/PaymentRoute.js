"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/paymentRoutes.ts
const express_1 = __importDefault(require("express"));
const upload_1 = __importDefault(require("../middleware/upload"));
const PaymentController_1 = require("../controllers/PaymentController");
const router = express_1.default.Router();
router.post('/upload-receipt', upload_1.default.single('receipt'), PaymentController_1.uploadReceipt);
router.patch('/verify/:paymentId', PaymentController_1.verifyPayment);
router.get('/summary', PaymentController_1.getPaymentSummary);
router.get('/history/:parentId', PaymentController_1.getPaymentHistoryByParentId);
exports.default = router;
