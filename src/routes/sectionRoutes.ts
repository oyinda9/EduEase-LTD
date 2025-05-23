import express from "express";
import { createSection, getAllSections ,getAllSectionsAndClasses } from "../controllers/SectionController"; 

const router = express.Router();

// Create a new section
router.post("/create", createSection);

// Get all sections
router.get("/", getAllSections);

// Get all sections
router.get("/sectionClasses", getAllSectionsAndClasses);

export default router;
