import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createSection = async (req: Request, res: Response) => {
  const { name, schoolId } = req.body;
  try {
    const section = await prisma.section.create({
      data: {
        name,
        school: { connect: { id: schoolId } },
      },
    });
    res.status(201).json(section);
  } catch (error: any) {
    res.status(400).json({ error: "Failed to create section", details: error.message });
  }
};

//get all sections with classes and student count 
export const getAllSectionsAndClasses = async (req: Request, res: Response) => {
  try {
    const sections = await prisma.section.findMany({
      include: {
        classes: {
          include: {
            _count: {
              select: { students: true },
            },
          },
        },
      },
    });

    // Build custom response
    const response = sections.map(section => {
      const totalStudents = section.classes.reduce((sum, cls) => sum + cls._count.students, 0);

      return {
        sectionId: section.id,
        sectionName: section.name,
        numberOfClasses: section.classes.length,
        totalStudentsInSection: totalStudents,
        classes: section.classes.map(cls => ({
          classId: cls.id,
          className: cls.name,
          numberOfStudents: cls._count.students,
        })),
      };
    });

    res.status(200).json({
      message: "Sections fetched successfully",
      sections: response,
    });

  } catch (error: any) {
    console.error("Error fetching sections:", error);
    res.status(500).json({ error: "Failed to fetch sections", details: error.message });
  }
};
//get all sections

export const getAllSections = async (req: Request, res: Response) => {
  try {
    const sections = await prisma.section.findMany();

    res.status(200).json({
      message: "Sections fetched successfully",
      sections,
    });
  } catch (error: any) {
    console.error("Error fetching sections:", error);
    res.status(500).json({
      error: "Failed to fetch sections",
      details: error.message,
    });
  }
};