import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new school
export const createSchool = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, address, logo } = req.body;

    const existingSchool = await prisma.school.findUnique({ where: { name } });
    if (existingSchool) {
      res
        .status(400)
        .json({ message: "School with this name already exists." });
      return;
    }

    const school = await prisma.school.create({
      data: {
        name,
        address,
        logo,
      },
    });

    res.status(201).json(school);
  } catch (error) {
    res.status(500).json({ error: "Failed to create school", details: error });
  }
};

// Get all schools
export const getAllSchools = async (_req: Request, res: Response) => {
  try {
    const schools = await prisma.school.findMany();
    res.status(200).json(schools);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch schools", details: error });
  }
};

// Get a single school by ID
export const getSchoolById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        students: true,
        teachers: true,
        parents: true,
        classes: true,
        announcements: true,
      },
    });

    if (!school) {
      res.status(404).json({ message: "School not found" });
      return;
    }

    res.status(200).json(school);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch school", details: error });
  }
};

// Update a school
export const updateSchool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, address, logo } = req.body;

    const updated = await prisma.school.update({
      where: { id },
      data: {
        name,
        address,
        logo,
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update school", details: error });
  }
};

// Delete a school
export const deleteSchool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.school.delete({ where: { id } });

    res.status(200).json({ message: "School deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete school", details: error });
  }
};
