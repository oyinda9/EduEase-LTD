import { Request, Response } from "express";
import { PrismaClient ,Role } from "@prisma/client";

const prisma = new PrismaClient();

// export const createAdmin = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { username } = req.body;

//     // Count the existing admins to generate unique admin IDs
//     const count = await prisma.admin.count();
//     const newAdminId = `admin${count + 1}`;

//     const admin = await prisma.admin.create({
//       data: {
//         id: newAdminId,
//         username,
//       },
//     });

//     res.status(201).json(admin);
//   } catch (error) {
//     console.error("Error creating admin:", error);
//     res.status(500).json({ error: "Failed to create admin" });
//   }
// };

// ✅ Get all Admins
export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await prisma.admin.findMany();

    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch admins" });
  }
};

// ✅ Get a single Admin by ID
export const getAdminById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const admin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch admin" });
  }
};

// ✅ Update an Admin
export const updateAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    const admin = await prisma.admin.update({
      where: { id },
      data: { username },
    });

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ error: "Failed to update admin" });
  }
};

// ✅ Delete an Admin
export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.admin.delete({
      where: { id },
    });

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete admin" });
  }
};
