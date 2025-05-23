import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();
export const getSchoolOverview = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { schoolId } = req.params;

  try {
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        Admin: true,
        teachers: true,
        students: true,
        Section: {
          include: {
            classes: {
              include: {
                students: true,
                supervisor: true,
              },
            },
          },
        },
        parents: true,
      },
    });

    if (!school) {
      res.status(404).json({ message: "School not found" });
      return;
    }

    // Calculate total students per section
    const sections = school.Section.map((section) => {
      const totalStudentsInSection = section.classes.reduce(
        (total, classItem) => total + classItem.students.length,
        0
      );

      return {
        ...section,
        totalStudents: totalStudentsInSection,
        classes: section.classes.map((classItem) => ({
          ...classItem,
          studentCount: classItem.students.length,
        })),
      };
    });

    res.status(200).json({
      message: "School overview fetched successfully",
      school: {
        ...school,
        sections,
      },
    });
  } catch (error) {
    console.error("Error fetching school overview:", error);
    res.status(500).json({
      message: "Error fetching school overview",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
