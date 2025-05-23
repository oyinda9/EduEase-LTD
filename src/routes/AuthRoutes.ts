import express from "express";
import {login, registerAdmin,  registerSuperAdmin} from "../controllers/authController";

const router = express.Router();

// Define routes
router.post("/superadmin/register", registerSuperAdmin);
router.post("/register", registerAdmin);
router.post("/login", login);
// router.post("/loginUser", loginUser);

export default  router ;