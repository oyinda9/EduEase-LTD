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
exports.getAllSubjects = exports.createSubject = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ================== SUBJECT CONTROLLERS ==================
const createSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const subject = yield prisma.subject.create({ data: { name } });
        res.status(201).json(subject);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create subject' });
    }
});
exports.createSubject = createSubject;
const getAllSubjects = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subjects = yield prisma.subject.findMany({ include: { teachers: true, lessons: true, exams: true } });
        res.json(subjects);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});
exports.getAllSubjects = getAllSubjects;
