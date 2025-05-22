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
exports.getAllAttendanceByClassStats = exports.getAllAttendanceByClass = exports.getAllAttendance = exports.createAttendance = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId, present } = req.body;
    if (!studentId || typeof present !== "boolean") {
        res
            .status(400)
            .json({ error: "Missing required fields: studentId and present" });
        return;
    }
    try {
        const attendance = yield prisma.attendance.create({
            data: {
                studentId,
                present,
                date: new Date(),
            },
        });
        res.status(201).json({
            message: `Attendance marked as ${present ? "present" : "absent"} for student with ID ${studentId}.`,
            data: attendance,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create attendance" });
    }
});
exports.createAttendance = createAttendance;
const getAllAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all attendance records
        const attendanceRecords = yield prisma.attendance.findMany();
        res.status(200).json({
            message: "Attendance records fetched successfully",
            data: attendanceRecords,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch attendance records" });
    }
});
exports.getAllAttendance = getAllAttendance;
const getAllAttendanceByClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all attendance records with associated student and class information
        const attendanceRecords = yield prisma.attendance.findMany({
            include: {
                student: {
                    include: {
                        class: true, // Ensure class data is included
                    },
                },
            },
        });
        // Define the type for grouped attendance
        const groupedAttendance = {}; // Use the GroupedAttendance interface
        attendanceRecords.forEach((record) => {
            const classId = record.student.class.id;
            const className = record.student.class.name;
            // Initialize the group if it doesn't exist
            if (!groupedAttendance[classId]) {
                groupedAttendance[classId] = {
                    className, // Store the class name
                    attendanceRecords: [],
                };
            }
            // Add the attendance record to the group
            groupedAttendance[classId].attendanceRecords.push(record);
        });
        // Convert the object into an array format
        const formattedResponse = Object.values(groupedAttendance);
        res.status(200).json({
            message: "Attendance records grouped by class fetched successfully",
            data: formattedResponse,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch attendance records" });
    }
});
exports.getAllAttendanceByClass = getAllAttendanceByClass;
const getAllAttendanceByClassStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const attendanceRecords = yield prisma.attendance.findMany({
            include: {
                student: {
                    include: {
                        class: true,
                    },
                },
            },
        });
        const groupedAttendance = {};
        attendanceRecords.forEach((record) => {
            const classId = record.student.class.id;
            const className = record.student.class.name;
            const gender = record.student.sex;
            const dayOfWeek = new Date(record.date).toLocaleString("en-us", {
                weekday: "short",
            });
            // Only include Monday to Friday
            const validDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
            if (!validDays.includes(dayOfWeek))
                return;
            if (!groupedAttendance[classId]) {
                groupedAttendance[classId] = {
                    className,
                    attendanceRecords: [],
                    statistics: {
                        Mon: {
                            male: { present: 0, absent: 0 },
                            female: { present: 0, absent: 0 },
                        },
                        Tue: {
                            male: { present: 0, absent: 0 },
                            female: { present: 0, absent: 0 },
                        },
                        Wed: {
                            male: { present: 0, absent: 0 },
                            female: { present: 0, absent: 0 },
                        },
                        Thu: {
                            male: { present: 0, absent: 0 },
                            female: { present: 0, absent: 0 },
                        },
                        Fri: {
                            male: { present: 0, absent: 0 },
                            female: { present: 0, absent: 0 },
                        },
                    },
                };
            }
            const genderKey = (gender === null || gender === void 0 ? void 0 : gender.toUpperCase()) === "MALE" ? "male" : "female";
            const dayStats = groupedAttendance[classId].statistics[dayOfWeek];
            if (record.present) {
                dayStats[genderKey].present += 1;
            }
            else {
                dayStats[genderKey].absent += 1;
            }
            groupedAttendance[classId].attendanceRecords.push(record);
        });
        const formattedResponse = Object.values(groupedAttendance);
        res.status(200).json({
            message: "Attendance records grouped by class and gender fetched successfully",
            data: formattedResponse,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch attendance records" });
    }
});
exports.getAllAttendanceByClassStats = getAllAttendanceByClassStats;
