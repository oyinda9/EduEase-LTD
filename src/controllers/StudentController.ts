import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all students
export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      include: { parent: true, class: true, subject: true },
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

// Get a student by ID
export const getStudentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: { parent: true, class: true, subject: true },
    });
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch student" });
  }
};

// Create a new student

export const createStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    parentId,
    classId,
    birthday,
    subjectIds = [],
    schoolId,
  } = req.body;

  try {
    // Check if the username already exists
    const existingStudent = await prisma.student.findUnique({
      where: { username },
    });

    if (existingStudent) {
      res
        .status(400)
        .json({ error: "Student with this username already exists" });
      return;
    }

    // Validate birthday format
    const parsedBirthday = new Date(birthday);
    if (isNaN(parsedBirthday.getTime())) {
      res.status(400).json({ error: "Invalid birthday format" });
      return;
    }

    // Validate if classId exists
    let classData = null;
    if (classId) {
      classData = await prisma.class.findUnique({ where: { id: classId } });
      if (!classData) {
        res.status(404).json({ error: "Class not found" });
        return;
      }
    }

    // Validate if parentId exists
    let parentData = null;
    if (parentId) {
      parentData = await prisma.parent.findUnique({ where: { id: parentId } });
      if (!parentData) {
        res.status(404).json({ error: "Parent not found" });
        return;
      }
    }

    // Validate subjects
    const validSubjectIds = await prisma.subject.findMany({
      where: {
        id: { in: subjectIds },
      },
      select: { id: true },
    });

    if (validSubjectIds.length !== subjectIds.length) {
      res.status(400).json({ error: "Some subjectIds are invalid" });
      return;
    }

    const studentData: any = {
      id: crypto.randomUUID(),
      username,
      name,
      surname,
      email: email || null,
      phone: phone || null,
      address,
      img: img || null,
      bloodType,
      sex: sex.toUpperCase(),
      birthday: parsedBirthday,
      school: {
        connect: { id: schoolId },
      },
      subject: {
        connect: validSubjectIds.map((s: any) => ({ id: s.id })), 
      },
    };

    if (parentData) studentData.parent = { connect: { id: parentId } };
    if (classData) studentData.class = { connect: { id: classId } };

    const student = await prisma.student.create({
      data: studentData,
      include: { subject: true, class: true, parent: true,school:true },
    });

    res.status(201).json({message:"student created sucessfully",student});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create student" });
  }
};

// Update a student
export const updateStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
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
    parentId,
    classId,
    birthday,
  } = req.body;
  try {
    const student = await prisma.student.update({
      where: { id },
      data: {
        username,
        name,
        surname,
        email,
        phone,
        address,
        img,
        bloodType,
        sex,
        parentId,
        classId,
        birthday,
      },
    });
    res.json(student);
  } catch (error) {
    res.status(400).json({ error: "Failed to update student" });
  }
};

// Delete a student
export const deleteStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.student.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: "Failed to delete student" });
  }
};
