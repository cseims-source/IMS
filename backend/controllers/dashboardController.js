import Student from '../models/studentModel.js';
import Faculty from '../models/facultyModel.js';
import Stream from '../models/streamModel.js';
import Timetable from '../models/timetableModel.js';
import Notice from '../models/noticeModel.js';
import Event from '../models/eventModel.js';
import Attendance from '../models/attendanceModel.js';
import Marksheet from '../models/marksheetModel.js';
import { GoogleGenAI, Type } from '@google/genai';

export const getDashboardStats = async (req, res) => {
    try {
        const studentCount = await Student.countDocuments();
        const facultyCount = await Faculty.countDocuments();
        const streamCount = await Stream.countDocuments();
        const noticeCount = await Notice.countDocuments();
        
        // Real-time aggregate data for Admin Dashboard
        const latestNotices = await Notice.find({}).sort({ createdAt: -1 }).limit(3);
        
        // Attendance snapshot for last 7 days
        const attendanceSnapshot = await Attendance.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        res.json({
            stats: {
                students: studentCount,
                faculty: facultyCount,
                streams: streamCount,
                notices: noticeCount,
            },
            notices: latestNotices,
            attendanceReport: attendanceSnapshot
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getTeacherDashboardStats = async (req, res) => {
    try {
        if (req.user.role !== 'Teacher') return res.status(403).json({ message: 'Access denied' });
        
        const teacher = await Faculty.findById(req.user.profileId);
        if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

        const assignedStreams = teacher.assignedStreams || [];
        const studentCount = assignedStreams.length > 0 ? await Student.countDocuments({ stream: { $in: assignedStreams } }) : 0;
        
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = daysOfWeek[new Date().getDay()];
        const timetables = await Timetable.find({ stream: { $in: assignedStreams } });
        
        let scheduleToday = [];
        timetables.forEach(tt => {
            if (tt.schedule && tt.schedule.has(today)) {
                const daySchedule = tt.schedule.get(today);
                for (const time in daySchedule) {
                    if (teacher.assignedSubjects.includes(daySchedule[time].subject) || !teacher.assignedSubjects.length) {
                         scheduleToday.push({ time, class: tt.stream, subject: daySchedule[time].subject });
                    }
                }
            }
        });

        const latestNotices = await Notice.find({ category: { $in: ['Academic', 'General'] } }).sort({ createdAt: -1 }).limit(3);

        res.json({
            students: studentCount,
            classesAssigned: assignedStreams.length,
            schedule: scheduleToday,
            notices: latestNotices
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getStudentDashboardSummary = async (req, res) => {
    try {
        if (req.user.role !== 'Student') return res.status(403).json({ message: 'Access denied' });
        const student = await Student.findById(req.user.profileId).lean();
        if (!student) return res.status(404).json({ message: 'Student profile not found.' });

        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = daysOfWeek[new Date().getDay()];
        const timetable = await Timetable.findOne({ stream: student.stream, semester: student.currentSemester });
        
        let scheduleToday = [];
        if (timetable?.schedule?.has(today)) {
            const daySchedule = timetable.schedule.get(today);
            for (const time in daySchedule) {
                scheduleToday.push({ time, subject: daySchedule[time].subject, teacher: daySchedule[time].teacher });
            }
        }

        const latestNotices = await Notice.find({}).sort({ createdAt: -1 }).limit(3);
        const recentMarksheet = await Marksheet.findOne({ student: student._id }).sort({ createdAt: -1 });
        const upcomingEvents = await Event.find({ date: { $gte: new Date().toISOString().split('T')[0] } }).sort({ date: 1 }).limit(3);

        res.json({
            scheduleToday,
            recentMarksheet,
            upcomingEvents,
            latestNotices,
            pendingFees: student.fees?.filter(f => f.status === 'Pending') || []
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const globalSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) return res.json({ results: { students: [], faculty: [], modules: [] } });

        const students = await Student.find({
            $or: [
                { firstName: { $regex: q, $options: 'i' } },
                { lastName: { $regex: q, $options: 'i' } },
                { registrationNumber: { $regex: q, $options: 'i' } }
            ]
        }).limit(3).select('firstName lastName stream registrationNumber');

        const faculty = await Faculty.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { subject: { $regex: q, $options: 'i' } }
            ]
        }).limit(3).select('name subject');

        const modules = [
            { title: 'Registry Hub', sub: 'Student Admissions', type: 'Module', path: '/app/student-admission' },
            { title: 'Neural Matrix', sub: 'Faculty Management', type: 'Module', path: '/app/faculty' },
            { title: 'Attendance Hub', sub: 'Registry Logging', type: 'Module', path: '/app/attendance' },
            { title: 'Financial Ledger', sub: 'Fees Management', type: 'Module', path: '/app/fees' },
            { title: 'Curriculum Plan', sub: 'Streams & Subjects', type: 'Module', path: '/app/streams' },
            { title: 'Digital Library', sub: 'Book Collection', type: 'Module', path: '/app/library' }
        ].filter(m => m.title.toLowerCase().includes(q.toLowerCase()) || m.sub.toLowerCase().includes(q.toLowerCase()));

        res.json({
            students: students.map(s => ({ title: `${s.firstName} ${s.lastName}`, sub: s.stream, type: 'Student', path: `/app/student/${s._id}` })),
            faculty: faculty.map(f => ({ title: f.name, sub: f.subject, type: 'Faculty', path: '/app/faculty' })),
            modules: modules.slice(0, 3)
        });
    } catch (error) {
        res.status(500).json({ message: 'Search failed' });
    }
};

export const getDashboardCharts = async (req, res) => {
    try {
        const studentsPerStream = await Student.aggregate([
            { $group: { _id: '$stream', count: { $sum: 1 } } },
            { $project: { name: '$_id', rate: '$count', _id: 0 } },
            { $sort: { rate: -1 } }
        ]);

        const attendanceTrend = await Attendance.aggregate([
            { $group: { _id: "$date", present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } }, total: { $sum: 1 } } },
            { $project: { date: "$_id", rate: { $multiply: [{ $divide: ["$present", "$total"] }, 100] } } },
            { $sort: { date: 1 } },
            { $limit: 7 }
        ]);

        res.json({ studentsPerCourse: studentsPerStream, attendanceTrend });
    } catch (error) {
        res.status(500).json({ message: 'Chart error' });
    }
};

export const getTeacherInsights = async (req, res) => {
    // Logic from previous version...
};

export const generateQuiz = async (req, res) => {
    // Logic from previous version...
};
