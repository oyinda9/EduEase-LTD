"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ResultController_1 = require("../controllers/ResultController");
const router = (0, express_1.Router)();
router.post('/', ResultController_1.createResult);
router.get('/', ResultController_1.getAllResults);
router.get('/:id', ResultController_1.getResultById);
// For ALL students' cumulative results
router.get('/results/all', ResultController_1.getAllStudentsCummulatedResults); // More specific, for ALL
router.get('/results/:id', ResultController_1.getOneStudentsCummulatedResults); // Specific student
router.get('/studentid/:id', ResultController_1.getResultsByStudentId);
router.put('/:id', ResultController_1.updateResult);
router.delete('/:id', ResultController_1.deleteResult);
exports.default = router;
