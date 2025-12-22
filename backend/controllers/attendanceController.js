import Attendance from '../models/attendanceModel.js';
import Student from '../models/studentModel.js';

// Get daily records for the entry screen
const getAttendance = async (req, res) => {
    try {
        const { streamName, date } = req.params;
        const { subject, semester } = req.query;

        let query = { stream: streamName, date: date };
        if (subject) query.subject = subject;
        if (semester) query.semester = semester;

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
        
        const operations = Object.keys(attendanceData).map(studentId => {
            const status = attendanceData[studentId];
            if (!status) return null; 
            
            return {
                updateOne: {
                    filter: { student: studentId, date: date, subject: subject }, // Unique by subject too
                    update: { 
                        $set: { 
                            student: studentId, 
                            date: date, 
                            stream: streamName, 
                            semester: semester,
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
        
        // Specific check for the duplicate key error
        if (error.code === 11000 || (error.writeErrors && error.writeErrors.some(e => e.code === 11000))) {
            return res.status(400).json({ 
                message: 'Database Error: Old restrictions are still active. Please RESTART the backend server to apply the fix.' 
            });
        }

        res.status(400).json({ message: 'Failed to save attendance', error: error.message });
    }
};

// New: Aggregated Analytics for Admin View
const getAttendanceAnalytics = async (req, res) => {
    try {
        const { stream, semester, subject, startDate, endDate } = req.query;

        let matchStage = {};
        
        if (stream) matchStage.stream = stream;
        if (semester) matchStage.semester = parseInt(semester);
        if (subject && subject !== 'All') matchStage.subject = subject;
        
        if (startDate && endDate) {
            matchStage.date = { $gte: startDate, $lte: endDate };
        }

        // Aggregate to calculate percentage per student
        const analytics = await Attendance.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$student",
                    totalClasses: { $sum: 1 },
                    presentClasses: { 
                        $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } 
                    }
                }
            },
            {
                $lookup: {
                    from: "students",
                    localField: "_id",
                    foreignField: "_id",
                    as: "studentInfo"
                }
            },
            { $unwind: "$studentInfo" },
            {
                $project: {
                    _id: 1,
                    name: { $concat: ["$studentInfo.firstName", " ", "$studentInfo.lastName"] },
                    rollNo: "$studentInfo._id", // Using ID as roll for now
                    totalClasses: 1,
                    presentClasses: 1,
                    percentage: { 
                        $multiply: [
                            { $divide: ["$presentClasses", "$totalClasses"] }, 
                            100 
                        ] 
                    }
                }
            },
            { $sort: { percentage: 1 } } // Sort by lowest attendance first (to catch defaulters)
        ]);

        // Aggregate to calculate Subject-wise performance (for Charts)
        const subjectStats = await Attendance.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$subject",
                    totalRecords: { $sum: 1 },
                    presentRecords: { 
                        $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } 
                    }
                }
            },
            {
                $project: {
                    subject: "$_id",
                    percentage: { 
                        $multiply: [
                            { $divide: ["$presentRecords", "$totalRecords"] }, 
                            100 
                        ] 
                    }
                }
            }
        ]);

        res.json({ studentStats: analytics, subjectStats });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ message: 'Server Error fetching analytics' });
    }
};

export { getAttendance, saveAttendance, getMyAttendance, getAttendanceForStudent, getAttendanceAnalytics };