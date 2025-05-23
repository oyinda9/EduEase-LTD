// routes/schoolRoutes.ts
import express from "express";
import { getSchoolOverview } from "../controllers/SchoolOverviewController";

const router = express.Router();

router.get("/schools/:schoolId", getSchoolOverview);

export default router;
