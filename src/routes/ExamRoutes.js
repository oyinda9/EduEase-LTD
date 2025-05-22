"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ExamsController_1 = require("../controllers/ExamsController");
const router = express_1.default.Router();
router.post('/create', ExamsController_1.createExamScore);
router.post('/score', ExamsController_1.getExamScoreById);
router.get('/all', ExamsController_1.getAllExamScores);
exports.default = router;
