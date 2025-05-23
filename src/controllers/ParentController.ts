import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const createParent = async (req: Request, res: Response) => {
  const { username, name, surname, email, phone, address, schoolId } = req.body;

  try {
    const parent = await prisma.parent.create({
      data: {
        id: crypto.randomUUID(),
        username,
        name,
        surname,
        email,
        phone,
        address,
        school: {
          connect: { id: schoolId },
        },
      },
      include: {
        school: true,
      },
    });

    res.status(201).json({
      message: "Parent created successfully",
      parent: {
        id: parent.id,
        username: parent.username,
        name: parent.name,
        surname: parent.surname,
        email: parent.email,
        phone: parent.phone,
        address: parent.address,
        schoolId: parent.schoolId,
        schoolName: parent.school?.name || null,
      },
    });
  } catch (error: any) {
    console.error(error);
    res
      .status(400)
      .json({ error: "Failed to create parent", details: error.message });
  }
};


export const getAllParents = async (req: Request, res: Response) => {
  try {
    const parents = await prisma.parent.findMany({
      include: { students: true , school:true}, // Include children details
    });

    res.status(200).json(parents);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch parents", details: error.message });
  }
};

export const getParentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { schoolId } = req.query; // or wherever you get it from

  if (!schoolId || typeof schoolId !== "string") {
    res.status(400).json({ error: "Missing or invalid schoolId" });
    return;
  }

  try {
    const parent = await prisma.parent.findFirst({
      where: { id, schoolId },
      include: { students: true , school:true},

    });

    if (!parent) {
      res.status(404).json({ error: "Parent not found" });
      return;
    }

    res.status(200).json(parent);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch parent", details: error.message });
  }
};

export const updateParent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, name, surname, email, phone, address, schoolId } = req.body;

  try {
    const parent = await prisma.parent.update({
      where: { id },
      data: { username, name, surname, email, phone, address, schoolId },
    });

    res.status(200).json(parent);
  } catch (error: any) {
    res
      .status(400)
      .json({ error: "Failed to update parent", details: error.message });
  }
};

export const deleteParent = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.parent.delete({
      where: { id },
    });

    res.status(200).json({ message: "Parent deleted successfully" });
  } catch (error: any) {
    res
      .status(400)
      .json({ error: "Failed to delete parent", details: error.message });
  }
};
