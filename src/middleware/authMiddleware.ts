import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Role } from "@prisma/client";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
  throw new Error("JWT_SECRET environment variable is not set");
}

// Extend Request to Include `user` information (id, role, schoolId)
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
    schoolId: string;
  };
}

// Middleware to verify the JWT and extract user information
export const authenticateAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ error: "Access denied. No token provided." });
      return;
    }

    const decoded = jwt.verify(token, SECRET_KEY) as {
      id: string;
      role: string;
      schoolId: string;
    };

    if (!decoded.id || !decoded.role || !decoded.schoolId) {
      res.status(400).json({ error: "Invalid token payload" });
      return;
    }

    req.user = {
      id: decoded.id,
      role: decoded.role as Role,
      schoolId: decoded.schoolId,
    };

    next();
  } catch (error) {
    console.error("Token Verification Error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Token expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid token" });
    } else {
      res.status(500).json({ error: "Authentication failed" });
    }
  }
};

// Middleware: Only allow access if the user is an admin
export const authorizeAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== Role.ADMIN) {
    res.status(403).json({
      error: "Forbidden. You do not have permission to perform this action.",
    });
    return;
  }
  next();
};

// Middleware: Prevent a parent (USER role) from creating another parent
export const authorizeParentCreation = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role === Role.USER) {
    res.status(403).json({
      error: "Unauthorized: You are not allowed to create a parent.",
    });
    return;
  }
  next();
};

// Middleware: Prevent a teacher from creating another teacher
export const authorizeTeacherCreation = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role === Role.TEACHER) {
    res.status(403).json({
      error: "Unauthorized: You are not allowed to create a teacher.",
    });
    return;
  }
  next();
};

// Middleware: Prevent a student from creating another student
export const authorizeStudentCreation = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role === Role.STUDENT) {
    res.status(403).json({
      error: "Unauthorized: You are not allowed to create a student.",
    });
    return;
  }
  next();
};
