import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import streamRoutes from './routes/streamRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import marksheetRoutes from './routes/marksheetRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import hostelRoutes from './routes/hostelRoutes.js';
import libraryRoutes from './routes/libraryRoutes.js';
import canteenRoutes from './routes/canteenRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import placementRoutes from './routes/placementRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import transportRoutes from './routes/transportRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import careerRoutes from './routes/careerRoutes.js';
import admissionRoutes from './routes/admissionRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

if (!process.env.MONGO_URI) {
    console.error('\nFATAL ERROR: MONGO_URI is not defined.');
    process.exit(1);
}
if (!process.env.JWT_SECRET) {
    console.error('\nFATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}

connectDB();

const app = express();

// Basic CORS setup - allowing all for easy deployment, 
// you can restrict this to your Vercel URL later for security.
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
    res.send('AIET Institute API is running...');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/streams', streamRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marksheet', marksheetRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/hostel', hostelRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/canteen', canteenRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/admission', admissionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));