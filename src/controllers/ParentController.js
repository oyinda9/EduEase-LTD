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
exports.deleteParent = exports.updateParent = exports.getParentById = exports.getAllParents = exports.createParent = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createParent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, name, surname, email, phone, address, schoolId } = req.body;
    try {
        const parent = yield prisma.parent.create({
            data: {
                id: crypto.randomUUID(), // Ensure `id` is generated or remove if Prisma auto-generates it
                username,
                name,
                surname,
                email,
                phone,
                address,
                school: {
                    connect: { id: schoolId }, // Make sure you have schoolId available
                },
            },
        });
        res.status(201).json(parent);
    }
    catch (error) {
        console.error(error);
        res
            .status(400)
            .json({ error: "Failed to create parent", details: error.message });
    }
});
exports.createParent = createParent;
const getAllParents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parents = yield prisma.parent.findMany({
            include: { students: true }, // Include children details
        });
        res.status(200).json(parents);
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "Failed to fetch parents", details: error.message });
    }
});
exports.getAllParents = getAllParents;
const getParentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { schoolId } = req.query; // or wherever you get it from
    if (!schoolId || typeof schoolId !== "string") {
        res.status(400).json({ error: "Missing or invalid schoolId" });
        return;
    }
    try {
        const parent = yield prisma.parent.findFirst({
            where: { id, schoolId },
            include: { students: true },
        });
        if (!parent) {
            res.status(404).json({ error: "Parent not found" });
            return;
        }
        res.status(200).json(parent);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch parent", details: error.message });
    }
});
exports.getParentById = getParentById;
const updateParent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { username, name, surname, email, phone, address, schoolId } = req.body;
    try {
        const parent = yield prisma.parent.update({
            where: { id },
            data: { username, name, surname, email, phone, address, schoolId },
        });
        res.status(200).json(parent);
    }
    catch (error) {
        res
            .status(400)
            .json({ error: "Failed to update parent", details: error.message });
    }
});
exports.updateParent = updateParent;
const deleteParent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.parent.delete({
            where: { id },
        });
        res.status(200).json({ message: "Parent deleted successfully" });
    }
    catch (error) {
        res
            .status(400)
            .json({ error: "Failed to delete parent", details: error.message });
    }
});
exports.deleteParent = deleteParent;
