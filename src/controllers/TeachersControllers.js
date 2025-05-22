"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignClassesAndSubjectsToTeacher = exports.deleteTeacher = exports.updateTeacher = exports.getTeacherById = exports.getTeachers = exports.createTeacher = void 0;
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
const prisma = new client_1.PrismaClient();
const createTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, name, surname, email, phone, address, img, bloodType, sex, birthday, subjectIds, lessonIds, classIds, } = req.body;
        // Check if the username already exists
        const existingTeacher = yield prisma.teacher.findUnique({
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
        const teacher = yield prisma.teacher.create({
            data: Object.assign(Object.assign(Object.assign({ id: crypto.randomUUID(), username,
                name,
                surname,
                email,
                phone,
                address,
                img,
                bloodType, sex: sex.toUpperCase(), birthday: parsedBirthday }, (subjectIds && subjectIds.length > 0
                ? { subjects: { connect: subjectIds.map((id) => ({ id })) } }
                : {})), (lessonIds && lessonIds.length > 0
                ? { lessons: { connect: lessonIds.map((id) => ({ id })) } }
                : {})), (classIds && classIds.length > 0
                ? { classes: { connect: classIds.map((id) => ({ id })) } }
                : {})),
        });
        res.status(201).json(teacher);
    }
    catch (error) {
        console.error("Error creating teacher:", error);
        res.status(500).json({ error: "Failed to create teacher" });
    }
});
exports.createTeacher = createTeacher;
// ✅ Get All Teachers
// export const getTeachers = async (req: Request, res: Response) => {
//   try {
//     const teachers = await prisma.teacher.findMany();
//     res.status(200).json(teachers);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch teachers" });
//   }
// };
const getTeachers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teachers = yield prisma.teacher.findMany({
            include: {
                classes: {
                    select: {
                        id: true,
                        name: true, // Only fetch the class ID and name
                    },
                },
                subjects: true, // Fetch all subjects taught by the teacher
                lessons: true, // Fetch all lessons taken by the teacher
            },
        });
        res.status(200).json(teachers);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch teachers" });
    }
});
exports.getTeachers = getTeachers;
const getTeacherById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        console.log("Received request for teacher ID:", id); // Debugging
        if (!id) {
            console.log("ID is missing in request");
            res.status(400).json({ error: "Missing teacher ID" });
            return;
        }
        // const teacher = await prisma.teacher.findUnique({
        //   where: { id },
        // });
        const teacher = yield prisma.teacher.findUnique({
            where: { id },
            include: {
                classes: {
                    include: {
                        students: true, // Assuming a Class model has a students relation
                    },
                },
                subjects: true, // Fetching subjects taught by the teacher
                lessons: true, // Fetching lessons taken by the teacher
            },
        });
        if (!teacher) {
            console.log("No teacher found with ID:", id);
            res.status(404).json({ error: "Teacher not found" });
            return;
        }
        res.status(200).json(teacher);
    }
    catch (error) {
        console.error("Error fetching teacher:", error);
        res.status(500).json({ error: "Failed to fetch teacher" });
    }
});
exports.getTeacherById = getTeacherById;
// ✅ Update a Teacher
const updateTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Ensure the teacher exists
        const existingTeacher = yield prisma.teacher.findUnique({ where: { id } });
        if (!existingTeacher) {
            res.status(404).json({ error: "Teacher not found" });
            return;
        }
        // Validate req.body fields
        if (!req.body.name || !req.body.email) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }
        // Update teacher
        const updatedTeacher = yield prisma.teacher.update({
            where: { id },
            data: req.body,
        });
        res.status(200).json(updatedTeacher);
    }
    catch (error) {
        console.error("Error updating teacher:", error);
        if (error instanceof library_1.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                res.status(404).json({ error: 'Teacher not found' });
                return;
            }
        }
        res.status(500).json({ error: "Failed to update teacher", details: error });
    }
});
exports.updateTeacher = updateTeacher;
// ✅ Delete a Teacher
const deleteTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.teacher.delete({ where: { id } });
        res.status(200).json({ message: "Teacher deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete teacher" });
    }
});
exports.deleteTeacher = deleteTeacher;
const assignClassesAndSubjectsToTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teacherId, classes, subjectIds } = req.body;
        // Ensure teacherId, classes, and subjectIds are provided
        if (!teacherId || (!Array.isArray(classes) && !Array.isArray(subjectIds))) {
            res.status(400).json({ error: "Invalid request data" });
            return;
        }
        // Update the teacher to assign new classes and subjects without removing old ones
        const teacher = yield prisma.teacher.update({
            where: { id: teacherId },
            data: {
                // Add new classes to teacher (does not remove existing classes)
                classes: { connect: classes === null || classes === void 0 ? void 0 : classes.map((classIds) => ({
                        id: classIds,
                    })),
                },
                // Add new subjects to teacher (does not remove existing subjects)
                subjects: {
                    connect: subjectIds === null || subjectIds === void 0 ? void 0 : subjectIds.map((subjectId) => ({
                        id: subjectId,
                    })),
                },
            },
        });
        res.status(200).json({
            message: "Classes and subjects successfully assigned to teacher",
            teacher,
        });
    }
    catch (error) {
        console.error("Error assigning classes and subjects:", error);
        res.status(500).json({ error: "Failed to assign classes and subjects to teacher" });
    }
});
exports.assignClassesAndSubjectsToTeacher = assignClassesAndSubjectsToTeacher;
