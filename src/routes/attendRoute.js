"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AttendController_1 = require("../controllers/AttendController");
const router = express_1.default.Router();
router.post('/', AttendController_1.createAttendance);
router.get('/', AttendController_1.getAllAttendance);
router.get('/class', AttendController_1.getAllAttendanceByClass);
router.get('/stat', AttendController_1.getAllAttendanceByClassStats);
exports.default = router;
