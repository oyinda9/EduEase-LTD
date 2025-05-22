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
exports.deleteResult = exports.updateResult = exports.getOneStudentsCummulatedResults = exports.getAllStudentsCummulatedResults = exports.getResultsByStudentId = exports.getResultById = exports.getAllResults = exports.createResult = void 0;
// @ts-ignore
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create a new result
const createResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { examScore, studentId, subjectId, assignment = 0, classwork = 0, midterm = 0, attendance = 0, } = req.body;
        // Step 1: Fetch student and check if enrolled in the subject
        const student = yield prisma.student.findUnique({
            where: { id: studentId },
            include: {
                subject: true,
            },
        });
        if (!student) {
            res.status(404).json({ message: "Student not found" });
            return;
        }
        const isTakingSubject = student.subject.some((subject) => subject.id === subjectId);
        if (!isTakingSubject) {
            res
                .status(400)
                .json({ message: "Student is not enrolled in this subject" });
            return;
        }
        // Step 2: Calculate total score and average score
        const totalScore = examScore + assignment + classwork + midterm + attendance;
        const averageScore = totalScore / 5;
        const score = totalScore; // Set score to be equal to totalScore
        // Step 3: Create the result
        const result = yield prisma.result.create({
            data: {
                score, // The score is the same as the totalScore
                examScore,
                assignment,
                classwork,
                midterm,
                attendance,
                totalScore,
                averageScore,
                student: { connect: { id: studentId } },
                subject: { connect: { id: subjectId } },
            },
        });
        res.status(201).json(result);
    }
    catch (error) {
        console.error("Error creating result:", error);
        res.status(500).json({ message: "Failed to create result" });
    }
});
exports.createResult = createResult;
// Get all results
const getAllResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield prisma.result.findMany({
            include: {
                student: true,
                exam: true,
                subject: true,
            },
        });
        res.status(200).json(results); // Respond with the list of results
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch results" });
    }
});
exports.getAllResults = getAllResults;
// Get a result by ID
const getResultById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield prisma.result.findUnique({
            where: { id: Number(id) },
            include: {
                student: true,
                exam: true,
                subject: true,
            },
        });
        if (!result) {
            res.status(404).json({ message: "Result not found" });
            return;
        }
        res.status(200).json(result); // Respond with the result
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch result" });
    }
});
exports.getResultById = getResultById;
const getResultsByStudentId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId } = req.params;
        // Fetch all results for the student including subject details
        const results = yield prisma.result.findMany({
            where: { studentId },
            include: {
                subject: true,
            },
        });
        if (results.length === 0) {
            res.status(404).json({ message: "No results found for this student" });
            return;
        }
        const groupedResults = {};
        let totalScore = 0;
        let totalSubjects = 0;
        results.forEach((result) => {
            var _a, _b, _c, _d, _e;
            const subjectName = (_a = result.subject) === null || _a === void 0 ? void 0 : _a.name; // Ensure subject is present
            if (!subjectName) {
                console.error(`No subject name found for result with id: ${result.id}`);
                return; // Skip if subject name is missing
            }
            // Sum up the individual result score
            const totalResultScore = result.score; // If score is the total, don't add components again
            if (!groupedResults[subjectName]) {
                groupedResults[subjectName] = {
                    subjectId: result.subjectId,
                    subjectName,
                    scores: [],
                };
            }
            groupedResults[subjectName].scores.push({
                resultId: result.id,
                score: result.score,
                assignment: (_b = result.assignment) !== null && _b !== void 0 ? _b : 0,
                classwork: (_c = result.classwork) !== null && _c !== void 0 ? _c : 0,
                midterm: (_d = result.midterm) !== null && _d !== void 0 ? _d : 0,
                attendance: (_e = result.attendance) !== null && _e !== void 0 ? _e : 0,
                total: totalResultScore, // Total is just the score here
            });
            totalScore += totalResultScore;
            totalSubjects += 1;
        });
        const averageScore = totalSubjects > 0 ? totalScore / totalSubjects : 0;
        res.status(200).json({
            studentId,
            totalScore,
            averageScore,
            subjects: Object.values(groupedResults),
        });
    }
    catch (error) {
        console.error("Error fetching results:", error);
        res.status(500).json({ message: "Failed to fetch results" });
    }
});
exports.getResultsByStudentId = getResultsByStudentId;
// Get cumulative results for ALL students (no ID needed)
const getAllStudentsCummulatedResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield prisma.result.findMany({
            include: { student: true },
        });
        if (!results.length) {
            res.status(404).json({ message: "No results found" });
            return;
        }
        const studentResults = results.reduce((acc, result) => {
            var _a, _b;
            const studentId = result.studentId;
            if (!acc[studentId]) {
                acc[studentId] = {
                    studentId,
                    studentName: `${((_a = result.student) === null || _a === void 0 ? void 0 : _a.name) || ''} ${((_b = result.student) === null || _b === void 0 ? void 0 : _b.surname) || ''}`.trim(),
                    totals: { assignment: 0, classwork: 0, midterm: 0, attendance: 0, exam: 0 },
                    overallTotal: 0,
                    subjectCount: 0
                };
            }
            const student = acc[studentId];
            student.totals.assignment += result.assignment || 0;
            student.totals.classwork += result.classwork || 0;
            student.totals.midterm += result.midterm || 0;
            student.totals.attendance += result.attendance || 0;
            student.totals.exam += result.examScore || 0;
            student.overallTotal += (result.assignment || 0) + (result.classwork || 0) +
                (result.midterm || 0) + (result.attendance || 0) +
                (result.examScore || 0);
            student.subjectCount++;
            return acc;
        }, {}); // TypeScript now knows this will be Record<string, StudentResult>
        res.status(200).json(Object.values(studentResults));
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getAllStudentsCummulatedResults = getAllStudentsCummulatedResults;
// Get cumulative results for ONE specific student
const getOneStudentsCummulatedResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { id } = req.params;
        // Get all results for the specified student
        const results = yield prisma.result.findMany({
            where: {
                studentId: id,
            },
            include: {
                student: true,
                exam: true,
                subject: true,
            },
        });
        if (results.length === 0) {
            res.status(404).json({ message: "No results found for this student" });
            return;
        }
        // Initialize accumulator for the single student
        const studentResult = {
            studentId: id,
            studentName: `${(_b = (_a = results[0].student) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : ''} ${(_d = (_c = results[0].student) === null || _c === void 0 ? void 0 : _c.surname) !== null && _d !== void 0 ? _d : ''}`.trim(),
            totalAssignment: 0,
            totalClasswork: 0,
            totalMidterm: 0,
            totalAttendance: 0,
            totalExam: 0,
            totalSubjects: 0,
            overallTotal: 0,
            averageScore: 0, // Add this field for the average score
            subjectDetails: [],
        };
        const uniqueSubjects = new Set(); // Track unique subject IDs
        results.forEach((result) => {
            var _a, _b, _c, _d, _e, _f;
            const assignment = (_a = result.assignment) !== null && _a !== void 0 ? _a : 0;
            const classwork = (_b = result.classwork) !== null && _b !== void 0 ? _b : 0;
            const midterm = (_c = result.midterm) !== null && _c !== void 0 ? _c : 0;
            const attendance = (_d = result.attendance) !== null && _d !== void 0 ? _d : 0;
            const examScore = (_e = result.examScore) !== null && _e !== void 0 ? _e : 0;
            const total = assignment + classwork + midterm + attendance + examScore;
            studentResult.totalAssignment += assignment;
            studentResult.totalClasswork += classwork;
            studentResult.totalMidterm += midterm;
            studentResult.totalAttendance += attendance;
            studentResult.totalExam += examScore;
            studentResult.overallTotal += total;
            // Track unique subjects
            if (result.subjectId) {
                uniqueSubjects.add(result.subjectId);
            }
            // Add subject details
            studentResult.subjectDetails.push({
                subjectId: result.subjectId,
                subjectName: (_f = result.subject) === null || _f === void 0 ? void 0 : _f.name,
                examId: result.examId,
                examName: result.exam,
                assignment,
                classwork,
                midterm,
                attendance,
                examScore,
                total,
            });
        });
        // Set the correct totalSubjects count
        studentResult.totalSubjects = uniqueSubjects.size;
        // Calculate average score
        if (studentResult.totalSubjects > 0) {
            studentResult.averageScore = studentResult.overallTotal / studentResult.totalSubjects;
        }
        res.status(200).json(studentResult);
    }
    catch (error) {
        console.error("Error fetching student results:", error);
        res.status(500).json({ message: "Failed to fetch results" });
    }
});
exports.getOneStudentsCummulatedResults = getOneStudentsCummulatedResults;
// Update a result
const updateResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { score, examId, studentId, subjectId } = req.body;
        const result = yield prisma.result.update({
            where: { id: Number(id) },
            data: {
                score,
                exam: examId ? { connect: { id: examId } } : undefined,
                student: studentId ? { connect: { id: studentId } } : undefined,
                subject: subjectId ? { connect: { id: subjectId } } : undefined,
            },
        });
        res.status(200).json(result); // Respond with the updated result
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update result" });
    }
});
exports.updateResult = updateResult;
// Delete a result
const deleteResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.result.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ message: "Result deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete result" });
    }
});
exports.deleteResult = deleteResult;
