import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

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

    // Calculate total students per section and count classes and subjects
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

    // Calculate totals for the entire school
    const totalParents = school.parents.length;
    const totalTeachers = school.teachers.length;
    const totalAdmins = school.Admin.length;
    const totalStudents = school.students.length;
    const totalSections = school.Section.length;

    // Sum all classes across all sections
    const totalClasses = school.Section.reduce(
      (total, section) => total + section.classes.length,
      0
    );

    res.status(200).json({
      message: "School overview fetched successfully",
      school: {
        ...school,
        sections,
        totals: {
          parents: totalParents,
          teachers: totalTeachers,
          admins: totalAdmins,
          students: totalStudents,
          sections: totalSections,
          classes: totalClasses,
        },
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
