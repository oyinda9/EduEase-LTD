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
exports.getAllExamScores = exports.getExamScoreById = exports.createExamScore = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create a new exam
const createExamScore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { score, studentId, subjectId } = req.body;
        // Fetch the exam that the score will be associated with (e.g., by a default or predefined exam logic)
        const exam = yield prisma.exam.findFirst();
        if (!exam) {
            res.status(400).json({ error: 'No exam found to associate the score with' });
            return;
        }
        const result = yield prisma.result.create({
            data: {
                score,
                exam: {
                    connect: { id: exam.id },
                },
                student: {
                    connect: { id: studentId },
                },
                subject: {
                    connect: { id: subjectId },
                },
            },
        });
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ error });
    }
});
exports.createExamScore = createExamScore;
// Get a specific exam score (result) by its ID
const getExamScoreById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Fetch the result by its ID, including student, exam, and subject details
        const result = yield prisma.result.findUnique({
            where: { id: Number(id) },
            include: {
                student: true, // Include student details
                exam: true, // Include exam details
                subject: true, // Include subject details
            },
        });
        if (!result) {
            res.status(404).json({ message: 'Result not found' });
            return;
        }
        res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch exam score' });
    }
});
exports.getExamScoreById = getExamScoreById;
// Get all exam scores (results) for all students
const getAllExamScores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all results with student, exam, and subject information
        const results = yield prisma.result.findMany({
            include: {
                student: true, // Include student details for each result
                exam: true, // Include exam details for each result
                subject: true, // Include subject details for each result
            },
        });
        res.status(200).json(results); // Respond with the list of results
    }
    catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Failed to fetch exam scores' }); // Respond with an error message
    }
});
exports.getAllExamScores = getAllExamScores;
