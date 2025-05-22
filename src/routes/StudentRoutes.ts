import express from "express";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/StudentController";
import {
  authenticateAdmin,
  authorizeAdmin,
  authorizeStudentCreation,
} from "../middleware/authMiddleware";

const router = express.Router();

// Student routes
router.get("/", getAllStudents);
router.get("/:id" , getStudentById);
router.post(
  "/",
  authenticateAdmin,
  authorizeAdmin,
  authorizeStudentCreation,
  createStudent
);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;
