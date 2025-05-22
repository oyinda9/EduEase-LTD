"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeStudentCreation = exports.authorizeTeacherCreation = exports.authorizeParentCreation = exports.authorizeAdmin = exports.authenticateAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
    throw new Error("JWT_SECRET environment variable is not set");
}
// Middleware to verify the JWT and extract user information
const authenticateAdmin = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
        if (!token) {
            res.status(401).json({ error: "Access denied. No token provided." });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        if (!decoded.id || !decoded.role || !decoded.schoolId) {
            res.status(400).json({ error: "Invalid token payload" });
            return;
        }
        req.user = {
            id: decoded.id,
            role: decoded.role,
            schoolId: decoded.schoolId,
        };
        next();
    }
    catch (error) {
        console.error("Token Verification Error:", error);
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ error: "Token expired" });
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ error: "Invalid token" });
        }
        else {
            res.status(500).json({ error: "Authentication failed" });
        }
    }
};
exports.authenticateAdmin = authenticateAdmin;
// Middleware: Only allow access if the user is an admin
const authorizeAdmin = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== client_1.Role.ADMIN) {
        res.status(403).json({
            error: "Forbidden. You do not have permission to perform this action.",
        });
        return;
    }
    next();
};
exports.authorizeAdmin = authorizeAdmin;
// Middleware: Prevent a parent (USER role) from creating another parent
const authorizeParentCreation = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === client_1.Role.USER) {
        res.status(403).json({
            error: "Unauthorized: You are not allowed to create a parent.",
        });
        return;
    }
    next();
};
exports.authorizeParentCreation = authorizeParentCreation;
// Middleware: Prevent a teacher from creating another teacher
const authorizeTeacherCreation = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === client_1.Role.TEACHER) {
        res.status(403).json({
            error: "Unauthorized: You are not allowed to create a teacher.",
        });
        return;
    }
    next();
};
exports.authorizeTeacherCreation = authorizeTeacherCreation;
// Middleware: Prevent a student from creating another student
const authorizeStudentCreation = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === client_1.Role.STUDENT) {
        res.status(403).json({
            error: "Unauthorized: You are not allowed to create a student.",
        });
        return;
    }
    next();
};
exports.authorizeStudentCreation = authorizeStudentCreation;
