"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
require('dotenv').config();
const StudentRoutes_1 = __importDefault(require("./routes/StudentRoutes"));
const ParentRoutes_1 = __importDefault(require("./routes/ParentRoutes"));
const AdminRoutes_1 = __importDefault(require("./routes/AdminRoutes"));
const TeacherRoutes_1 = __importDefault(require("./routes/TeacherRoutes"));
const LessonRoutes_1 = __importDefault(require("./routes/LessonRoutes"));
const ResultRoutes_1 = __importDefault(require("./routes/ResultRoutes"));
const ClassRoute_1 = __importDefault(require("./routes/ClassRoute"));
const EventRoutes_1 = __importDefault(require("./routes/EventRoutes"));
const AuthRoutes_1 = __importDefault(require("./routes/AuthRoutes"));
const subjectRoute_1 = __importDefault(require("./routes/subjectRoute"));
const attendRoute_1 = __importDefault(require("./routes/attendRoute"));
const ExamRoutes_1 = __importDefault(require("./routes/ExamRoutes"));
const PaymentRoute_1 = __importDefault(require("./routes/PaymentRoute"));
const SchoolsRoutes_1 = __importDefault(require("./routes/SchoolsRoutes"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const port = 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// Use student routes
app.use("/students", StudentRoutes_1.default);
app.use("/parents", ParentRoutes_1.default);
app.use("/admin", AdminRoutes_1.default);
app.use("/teachers", TeacherRoutes_1.default);
app.use("/lesson", LessonRoutes_1.default);
app.use("/results", ResultRoutes_1.default);
app.use("/class", ClassRoute_1.default);
app.use("/events", EventRoutes_1.default);
app.use("/subject", subjectRoute_1.default);
app.use('/attendance', attendRoute_1.default);
app.use('/exam', ExamRoutes_1.default);
app.use('/payment', PaymentRoute_1.default);
app.use("/auth", AuthRoutes_1.default);
app.use("/school", SchoolsRoutes_1.default);
// Health check endpoint
app.get("/", (req, res) => {
    res.send("EduEase backend is running");
});
// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
