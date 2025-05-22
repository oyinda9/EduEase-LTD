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
exports.deleteSchool = exports.updateSchool = exports.getSchoolById = exports.getAllSchools = exports.createSchool = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create a new school
const createSchool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, address, logo } = req.body;
        const existingSchool = yield prisma.school.findUnique({ where: { name } });
        if (existingSchool) {
            res
                .status(400)
                .json({ message: "School with this name already exists." });
            return;
        }
        const school = yield prisma.school.create({
            data: {
                name,
                address,
                logo,
            },
        });
        res.status(201).json(school);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create school", details: error });
    }
});
exports.createSchool = createSchool;
// Get all schools
const getAllSchools = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schools = yield prisma.school.findMany();
        res.status(200).json(schools);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch schools", details: error });
    }
});
exports.getAllSchools = getAllSchools;
// Get a single school by ID
const getSchoolById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const school = yield prisma.school.findUnique({
            where: { id },
            include: {
                students: true,
                teachers: true,
                parents: true,
                classes: true,
                announcements: true,
            },
        });
        if (!school) {
            res.status(404).json({ message: "School not found" });
            return;
        }
        res.status(200).json(school);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch school", details: error });
    }
});
exports.getSchoolById = getSchoolById;
// Update a school
const updateSchool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, address, logo } = req.body;
        const updated = yield prisma.school.update({
            where: { id },
            data: {
                name,
                address,
                logo,
            },
        });
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update school", details: error });
    }
});
exports.updateSchool = updateSchool;
// Delete a school
const deleteSchool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.school.delete({ where: { id } });
        res.status(200).json({ message: "School deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete school", details: error });
    }
});
exports.deleteSchool = deleteSchool;
