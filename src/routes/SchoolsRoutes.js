"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SchoolsControllers_1 = require("../controllers/SchoolsControllers");
const router = express_1.default.Router();
router.post('/create', SchoolsControllers_1.createSchool);
router.get('/', SchoolsControllers_1.getAllSchools);
router.get('/:id', SchoolsControllers_1.getSchoolById);
router.put('/:id', SchoolsControllers_1.updateSchool);
router.delete('/:id', SchoolsControllers_1.deleteSchool);
exports.default = router;
