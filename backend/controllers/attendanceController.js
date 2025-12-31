import Attendance from '../models/attendanceModel.js';
import Student from '../models/studentModel.js';
import Faculty from '../models/facultyModel.js';
import mongoose from 'mongoose';

// @desc    Get daily records for a specific stream/date/subject
// @route   GET /api/attendance/:streamName/:date
const getAttendance = async (req, res) => {
    try {
        const { streamName, date } = req.params;
        const { subject, semester } = req.query;

        let query = { stream: streamName, date: date };
        if (subject) query.subject = subject;
        if (semester) query.semester = parseInt(semester);

        const attendanceRecords = await Attendance.find(query).populate('student', 'firstName lastName');
        res.json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Server Error during registry fetch' });
    }
};

// @desc    Get logged in student's own attendance records
// @route   GET /api/attendance/my-records
const getMyAttendance = async (req, res) => {
    try {
        if (req.user.role !== 'Student') {
            return res.status(403).json({ message: 'Access Restricted to Student Nodes.' });
        }
        const attendanceRecords = await Attendance.find({ student: req.user.profileId });
        res.json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Internal Registry Error' });
    }
};

// @desc    Aggregated Subject-wise summary for student dossier
// @route   GET /api/attendance/summary/:studentId
const getStudentAttendanceSummary = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: 'Invalid ID sequence' });
        }

        const summary = await Attendance.aggregate([
            { $match: { student: new mongoose.Types.ObjectId(studentId) } },
            {
                $group: {
                    _id: "$subject",
                    total: { $sum: 1 },
                    present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } }
                }
            },
            {
                $project: {
                    subject: "$_id",
                    percentage: { 
                        $round: [
                            { $multiply: [{ $divide: ["$present", "$total"] }, 100] }, 
                            1
                        ] 
                    },
                    total: 1,
                    present: 1
                }
            },
            { $sort: { subject: 1 } }
        ]);
        
        res.json(summary);
    } catch (error) {
        console.error("Aggregation Error:", error);
        res.status(500).json({ message: 'Dossier aggregation failed' });
    }
};

// @desc    Commit attendance sequence (Bulk Write)
// @route   POST /api/attendance
const saveAttendance = async (req, res) => {
    try {
        const { date, streamName, semester, subject, attendanceData } = req.body;
        
        if (!subject || !semester || !streamName) {
            return res.status(400).json({ message: 'Incomplete sequence headers' });
        }

        // Faculty assignment check
        if (req.user.role === 'Teacher') {
            const faculty = await Faculty.findById(req.user.profileId);
            const isAssigned = faculty.assignedStreams.includes(streamName) && 
                               faculty.assignedSubjects.includes(subject);
            
            if (!isAssigned) {
                return res.status(403).json({ message: 'Access Denied: You are not assigned to this Stream/Subject node.' });
            }
        }

        const operations = Object.keys(attendanceData).map(studentId => {
            const status = attendanceData[studentId];
            if (!status) return null; 
            
            return {
                updateOne: {
                    filter: { student: studentId, date: date, subject: subject },
                    update: { 
                        $set: { 
                            student: studentId, 
                            date: date, 
                            stream: streamName, 
                            semester: parseInt(semester),
                            subject: subject,
                            status: status 
                        } 
                    },
                    upsert: true
                }
            };
        }).filter(Boolean);

        if (operations.length > 0) {
            await Attendance.bulkWrite(operations);
        }
        
        res.status(201).json({ message: 'Registry updated successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Registry commit failed', error: error.message });
    }
};

// @desc    Stream-wide performance matrix analytics
// @route   GET /api/attendance/analytics
const getAttendanceAnalytics = async (req, res) => {
    try {
        const { stream, semester, subject } = req.query;

        let matchStage = {};
        if (stream && stream !== 'all') matchStage.stream = stream;
        if (semester && semester !== 'all') matchStage.semester = parseInt(semester);
        if (subject && subject !== 'all') matchStage.subject = subject;

        const studentStats = await Attendance.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$student",
                    total: { $sum: 1 },
                    present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } }
                }
            },
            {
                $lookup: {
                    from: "students",
                    localField: "_id",
                    foreignField: "_id",
                    as: "info"
                }
            },
            { $unwind: "$info" },
            {
                $project: {
                    name: { $concat: ["$info.firstName", " ", "$info.lastName"] },
                    roll: "$info._id",
                    percentage: { $multiply: [{ $divide: ["$present", "$total"] }, 100] },
                    total: 1,
                    present: 1
                }
            },
            { $sort: { percentage: 1 } }
        ]);

        const subjectStats = await Attendance.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$subject",
                    total: { $sum: 1 },
                    present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } }
                }
            },
            {
                $project: {
                    subject: "$_id",
                    percentage: { $round: [{ $multiply: [{ $divide: ["$present", "$total"] }, 100] }, 1] }
                }
            }
        ]);

        const totalStudents = await Student.countDocuments(stream && stream !== 'all' ? { stream } : {});
        const defaulters = studentStats.filter(s => s.percentage < 75).length;
        const avgAttendance = studentStats.length > 0 
            ? (studentStats.reduce((acc, s) => acc + s.percentage, 0) / studentStats.length).toFixed(1)
            : 0;

        res.json({ 
            studentStats, 
            subjectStats,
            summary: {
                totalEnrolled: totalStudents,
                avgAttendance,
                defaulters
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Matrix analysis failure' });
    }
};

export { 
    getAttendance, 
    saveAttendance, 
    getMyAttendance, 
    getAttendanceAnalytics, 
    getStudentAttendanceSummary 
};