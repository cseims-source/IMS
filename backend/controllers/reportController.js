
import Student from '../models/studentModel.js';
import Attendance from '../models/attendanceModel.js';
import Marksheet from '../models/marksheetModel.js';
import Stream from '../models/streamModel.js';
import { GoogleGenAI } from '@google/genai';

// Helper to get date range from query filter
const getDateFilter = (dateRangeQuery) => {
    const now = new Date();
    let startDate;
    if (dateRangeQuery === 'last30') {
        startDate = new Date(now.setDate(now.getDate() - 30));
    } else if (dateRangeQuery === 'last90') {
        startDate = new Date(now.setDate(now.getDate() - 90));
    } else {
        return {}; // No date filter
    }
    return { date: { $gte: startDate.toISOString().split('T')[0] } };
};

// @desc    Generate Attendance Defaulters Report
// @route   GET /api/reports/attendance
// @access  Admin
export const getAttendanceReport = async (req, res) => {
    try {
        const { stream: streamName, dateRange } = req.query;
        const studentFilter = streamName !== 'all' ? { stream: streamName } : {};
        const dateFilter = getDateFilter(dateRange);

        const students = await Student.find(studentFilter);
        const studentIds = students.map(s => s._id);

        const attendanceData = await Attendance.aggregate([
            { $match: { student: { $in: studentIds }, ...dateFilter } },
            { $group: {
                _id: '$student',
                presentDays: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
                totalDays: { $sum: 1 }
            }},
            { $project: {
                attendancePercentage: { $multiply: [{ $divide: ['$presentDays', '$totalDays'] }, 100] }
            }}
        ]);

        const defaulters = attendanceData
            .filter(item => item.attendancePercentage < 75)
            .map(item => {
                const student = students.find(s => s._id.equals(item._id));
                return {
                    studentId: item._id,
                    studentName: `${student.firstName} ${student.lastName}`,
                    stream: student.stream,
                    attendancePercentage: item.attendancePercentage.toFixed(2)
                };
            });

        res.json(defaulters);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Generate Pending Fees Report
// @route   GET /api/reports/fees
// @access  Admin
export const getFeesReport = async (req, res) => {
    try {
        const { stream: streamName } = req.query;
        const studentFilter = streamName !== 'all' ? { stream: streamName, 'fees.status': 'Pending' } : { 'fees.status': 'Pending' };

        const studentsWithPendingFees = await Student.find(studentFilter);
        
        const report = studentsWithPendingFees.flatMap(student => 
            student.fees
                .filter(fee => fee.status === 'Pending')
                .map(fee => ({
                    studentId: student._id,
                    studentName: `${student.firstName} ${student.lastName}`,
                    stream: student.stream,
                    feeType: fee.type,
                    amount: fee.amount,
                    dueDate: fee.dueDate ? fee.dueDate.toISOString().split('T')[0] : 'N/A'
                }))
        );

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


// @desc    Generate Academic Performance Report
// @route   GET /api/reports/academic
// @access  Admin
export const getAcademicReport = async (req, res) => {
    try {
        const { stream: streamName } = req.query;
        const studentFilter = streamName !== 'all' ? { stream: streamName } : {};

        const students = await Student.find(studentFilter);
        const studentIds = students.map(s => s._id);

        const academicData = await Marksheet.aggregate([
            { $match: { student: { $in: studentIds } } },
            { $group: {
                _id: '$student',
                averageGrade: { $avg: '$percentage' },
                examCount: { $sum: 1 }
            }}
        ]);

        const report = academicData.map(item => {
            const student = students.find(s => s._id.equals(item._id));
            return {
                studentId: item._id,
                studentName: `${student.firstName} ${student.lastName}`,
                stream: student.stream,
                averageGrade: `${item.averageGrade.toFixed(2)}%`,
                examCount: item.examCount
            };
        });
        
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get AI-powered insights on institute data
// @route   POST /api/reports/ai-insights
// @access  Admin
export const getAiInsights = async (req, res) => {
    try {
        if (!process.env.API_KEY) {
            console.error('Google AI API Key not found in environment variables.');
            return res.status(500).json({ message: 'AI service is not configured.' });
        }
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ message: 'Query is required.' });
        }

        // 1. Aggregate more detailed data
        const students = await Student.find({}).select('stream fees').lean();
        const streams = await Stream.find({}).select('name level').lean();
        const marksheets = await Marksheet.find({}).select('stream percentage grade').lean();
        const attendance = await Attendance.find({}).select('status').lean();
        
        const totalAttendanceRecords = attendance.length;
        const presentCount = attendance.filter(a => a.status === 'present').length;

        const dataSummary = {
            totalStudents: students.length,
            totalStreams: streams.length,
            studentsPerStream: students.reduce((acc, s) => {
                acc[s.stream] = (acc[s.stream] || 0) + 1;
                return acc;
            }, {}),
            academic: {
                averagePerformance: marksheets.length > 0 ? (marksheets.reduce((acc, m) => acc + m.percentage, 0) / marksheets.length).toFixed(2) + '%' : 'N/A',
                gradeDistribution: marksheets.reduce((acc, m) => {
                    acc[m.grade] = (acc[m.grade] || 0) + 1;
                    return acc;
                }, {}),
            },
            attendance: {
                overallPercentage: totalAttendanceRecords > 0 ? ((presentCount / totalAttendanceRecords) * 100).toFixed(2) + '%' : 'N/A',
            },
            fees: {
                statusCounts: students.flatMap(s => s.fees).reduce((acc, f) => {
                    acc[f.status] = (acc[f.status] || 0) + 1;
                    return acc;
                }, {})
            }
        };
        
        // 2. Prepare the prompt for the Gemini API
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = 'gemini-2.5-flash';

        const prompt = `You are an expert data analyst for an educational institute. Your task is to provide a clear, concise, and insightful answer to the user's question based on the summarized data provided.

        Here is the summary of the institute's current data:
        ${JSON.stringify(dataSummary, null, 2)}

        User's Question: "${query}"

        Based on this data, provide your analysis. Be professional and data-driven in your response. If the data doesn't contain the answer, state that the specific information is not available in the summary.`;
        
        // 3. Call the Gemini API
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        // 4. Send the response back to the client
        res.json({ insight: response.text });

    } catch (error) {
        console.error('AI Insight Error:', error);
        res.status(500).json({ message: 'Failed to generate AI insight.' });
    }
};
