import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { connect } from "http2";

const prisma = new PrismaClient();

export const createTeacher = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      username,
      name,
      surname,
      email,
      phone,
      address,
      img,
      bloodType,
      sex,
      birthday,
      subjectIds,
      lessonIds,
      classIds,
    } = req.body;

    // Check if the username already exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { username },
    });
    if (existingTeacher) {
      res
        .status(400)
        .json({ error: "Teacher with this username already exists" });
      return;
    }


    // Validate birthday format
    const parsedBirthday = new Date(birthday);
    if (isNaN(parsedBirthday.getTime())) {
      res.status(400).json({ error: "Invalid birthday format" });
      return;
    }

    // Create teacher
    const teacher = await prisma.teacher.create({
      data: {
        id: crypto.randomUUID(),
        username,
        name,
        surname,
        email,
        phone,
        address,
        img,
        bloodType,
        sex: sex.toUpperCase(),
        birthday: parsedBirthday,
        ...(subjectIds && subjectIds.length > 0
          ? { subjects: { connect: subjectIds.map((id: string) => ({ id })) } }
          : {}),
        ...(lessonIds && lessonIds.length > 0
          ? { lessons: { connect: lessonIds.map((id: string) => ({ id })) } }
          : {}),
        ...(classIds && classIds.length > 0
          ? { classes: { connect: classIds.map((id: string) => ({ id })) } }
          : {}),
      },
    });

    res.status(201).json(teacher);
  } catch (error) {
    console.error("Error creating teacher:", error);
    res.status(500).json({ error: "Failed to create teacher" });
  }
};

// ✅ Get All Teachers
export const getTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await prisma.teacher.findMany();
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch teachers" });
  }
};


export const getTeacherById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log("Received request for teacher ID:", id); // Debugging

    if (!id) {
      console.log("ID is missing in request");
      res.status(400).json({ error: "Missing teacher ID" });
      return;
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      console.log("No teacher found with ID:", id);
      res.status(404).json({ error: "Teacher not found" });
      return;
    }

    res.status(200).json(teacher);
  } catch (error) {
    console.error("Error fetching teacher:", error);
    res.status(500).json({ error: "Failed to fetch teacher" });
  }
};



// ✅ Update a Teacher
export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedTeacher = await prisma.teacher.update({
      where: { id },
      data: req.body,
    });

    res.status(200).json(updatedTeacher);
  } catch (error) {
    res.status(500).json({ error: "Failed to update teacher" });
  }
};

// ✅ Delete a Teacher
export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.teacher.delete({ where: { id } });
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete teacher" });
  }
};
