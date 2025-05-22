"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const StudentController_1 = require("../controllers/StudentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Student routes
router.get("/", StudentController_1.getAllStudents);
router.get("/:id", StudentController_1.getStudentById);
router.post("/", authMiddleware_1.authenticateAdmin, authMiddleware_1.authorizeAdmin, authMiddleware_1.authorizeStudentCreation, StudentController_1.createStudent);
router.put("/:id", StudentController_1.updateStudent);
router.delete("/:id", StudentController_1.deleteStudent);
exports.default = router;
