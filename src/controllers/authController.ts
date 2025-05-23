import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient, Role } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();
const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Register SuperAdmin
export const registerSuperAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Check required fields
    if (!username || !email || !password) {
      res
        .status(400)
        .json({ error: "Username, email, and password are required" });
      return;
    }

    // Check if username or email already exists
    const existingUser = await prisma.superAdmin.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });
    if (existingUser) {
      res.status(400).json({ error: "Username or email already exists" });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the superadmin
    const superAdmin = await prisma.superAdmin.create({
      data: {
        username,
        email,
        password: hashedPassword,
        // role defaults to SUPERADMIN in schema
      },
    });

    res.status(201).json({
      message: "SuperAdmin created successfully",
      superAdminId: superAdmin.id,
    });
  } catch (error) {
    console.error("Error registering SuperAdmin:", error);
    res.status(500).json({ error: "Failed to register SuperAdmin" });
  }
};

// Register Admin
export const registerAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, password, schoolId } = req.body;

    if (!username || !password || !schoolId) {
      res
        .status(400)
        .json({ error: "Username, password and schoolId are required" });
      return;
    }

    // Check if school exists (optional but recommended)
    const schoolExists = await prisma.school.findUnique({
      where: { id: schoolId },
    });
    if (!schoolExists) {
      res.status(404).json({ error: "School not found" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        schoolId,
      },
      include: {
        school: true, // This includes the school details in the response
      },
    });

    res.status(201).json({ message: "Admin registered", admin });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Failed to register admin" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password, surname } = req.body;

    if (!identifier) {
      res.status(400).json({ error: "Username or email is required" });
      return;
    }

    let user: any;
    let role: Role | undefined;
    let schoolId: string | null = null;
    let schoolName: string | null = null;

    // Admin or Superadmin login using username
    if (!identifier.includes("@")) {
      user = await prisma.admin.findUnique({
        where: { username: identifier },
        include: { school: true },
      });

      if (user) {
        role = user.role;
        schoolId = user.schoolId || null;
        schoolName = user.school?.name || null;
      }
    } else {
      // Non-admin login using email and surname
      if (!surname) {
        res.status(400).json({ error: "Surname is required for non-admin login" });
        return;
      }

      user = await prisma.teacher.findFirst({
        where: { email: identifier, surname },
        include: { school: true },
      });
      if (user) {
        role = Role.TEACHER;
        schoolId = user.schoolId || null;
        schoolName = user.school?.name || null;
      }

      if (!user) {
        user = await prisma.student.findFirst({
          where: { email: identifier, surname },
          include: { school: true },
        });
        if (user) {
          role = Role.STUDENT;
          schoolId = user.schoolId || null;
          schoolName = user.school?.name || null;
        }
      }

      if (!user) {
        user = await prisma.parent.findFirst({
          where: { email: identifier, surname },
          include: { school: true },
        });
        if (user) {
          role = Role.USER;
          schoolId = user.schoolId || null;
          schoolName = user.school?.name || null;
        }
      }
    }

    if (!user || !role) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Password validation for admin/superadmin
    if (role === Role.ADMIN || role === Role.SUPERADMIN) {
      if (!password) {
        res.status(400).json({ error: "Password is required for admin login" });
        return;
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role, schoolId },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.setHeader("Authorization", `Bearer ${token}`);

    res.status(200).json({
      message: "Login successful",
      token,
      role,
      schoolId,
      schoolName,
      user: {
        id: user.id,
        username: user.username || null,
        name: user.name || null,
        surname: user.surname || null,
        email: user.email || null,
        phone: user.phone || null,
        address: user.address || null,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

