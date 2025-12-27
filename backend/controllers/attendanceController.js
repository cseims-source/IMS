import Attendance from '../models/attendanceModel.js';
import Student from '../models/studentModel.js';

// Get daily records for the entry screen
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
        res.status(500).json({ message: 'Server Error' });
    }
};

const getMyAttendance = async (req, res) => {
    try {
        if (req.user.role !== 'Student') {
            return res.status(403).json({ message: 'This route is only for students.' });
        }
        const attendanceRecords = await Attendance.find({ student: req.user.profileId });
        res.json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching your attendance.' });
    }
}

const getAttendanceForStudent = async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find({ student: req.params.studentId });
        res.json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching attendance.' });
    }
}

const saveAttendance = async (req, res) => {
    try {
        const { date, streamName, semester, subject, attendanceData } = req.body;
        
        if (!subject || !semester || !streamName) {
            return res.status(400).json({ message: 'Missing core criteria (Subject, Semester, or Stream)' });
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
        
        res.status(201).json({ message: 'Attendance saved successfully' });
    } catch (error) {
        console.error("Save Attendance Error:", error);
        res.status(400).json({ message: 'Failed to save attendance', error: error.message });
    }
};

const getAttendanceAnalytics = async (req, res) => {
    try {
        const { stream, semester, subject } = req.query;

        let matchStage = {};
        if (stream && stream !== 'all') matchStage.stream = stream;
        if (semester && semester !== 'all') matchStage.semester = parseInt(semester);
        if (subject && subject !== 'all') matchStage.subject = subject;

        // 1. Defaulter & Student Percentage
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

        // 2. Subject Matrix for Chart
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
                    percentage: { $multiply: [{ $divide: ["$present", "$total"] }, 100] }
                }
            }
        ]);

        const totalStudents = await Student.countDocuments(stream !== 'all' ? { stream } : {});
        const defaulters = studentStats.filter(s => s.percentage < 75).length;
        const avgAttendance = studentStats.length > 0 
            ? studentStats.reduce((acc, s) => acc + s.percentage, 0) / studentStats.length 
            : 0;

        res.json({ 
            studentStats, 
            subjectStats,
            summary: {
                totalEnrolled: totalStudents,
                avgAttendance: avgAttendance.toFixed(1),
                defaulters
            }
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ message: 'Server Error fetching analytics' });
    }
};

export { getAttendance, saveAttendance, getMyAttendance, getAttendanceForStudent, getAttendanceAnalytics };