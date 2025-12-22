
import Student from '../models/studentModel.js';
import Faculty from '../models/facultyModel.js';
import Stream from '../models/streamModel.js';
import Timetable from '../models/timetableModel.js';
import TransportRoute from '../models/transportRouteModel.js';
import Notice from '../models/noticeModel.js';
import Event from '../models/eventModel.js';
import { GoogleGenAI, Type } from '@google/genai';
import Attendance from '../models/attendanceModel.js';
import Marksheet from '../models/marksheetModel.js';

const getDashboardStats = async (req, res) => {
    try {
        const studentCount = await Student.countDocuments();
        const facultyCount = await Faculty.countDocuments();
        const streamCount = await Stream.countDocuments();
        const routeCount = await TransportRoute.countDocuments();
        
        res.json({
            students: studentCount,
            faculty: facultyCount,
            courses: streamCount, // Keep 'courses' key for frontend compatibility or change frontend
            routes: routeCount,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getTeacherDashboardStats = async (req, res) => {
    try {
        if (req.user.role !== 'Teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        const teacher = await Faculty.findById(req.user.profileId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher profile not found' });
        }

        const assignedStreams = teacher.assignedStreams || [];
        
        const studentCount = assignedStreams.length > 0 ? await Student.countDocuments({ stream: { $in: assignedStreams } }) : 0;
        
        // Get today's schedule
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = daysOfWeek[new Date().getDay()];

        const timetables = await Timetable.find({ stream: { $in: assignedStreams } });
        
        let scheduleToday = [];
        timetables.forEach(tt => {
            if (tt.schedule && tt.schedule.has(today)) {
                const daySchedule = tt.schedule.get(today);
                for (const time in daySchedule) {
                    const subjectIsAssigned = teacher.assignedSubjects && teacher.assignedSubjects.includes(daySchedule[time].subject);
                    const noSubjectsAssigned = !teacher.assignedSubjects || teacher.assignedSubjects.length === 0;

                    if (subjectIsAssigned || noSubjectsAssigned) {
                         scheduleToday.push({
                            time,
                            class: tt.stream, // Use stream but key it as 'class' for frontend
                            subject: daySchedule[time].subject,
                        });
                    }
                }
            }
        });
        
        // Sort schedule by time
        scheduleToday.sort((a, b) => {
            const timeToMinutes = (timeStr) => {
                const [time, modifier] = timeStr.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                if (modifier === 'PM' && hours < 12) hours += 12;
                if (modifier === 'AM' && hours === 12) hours = 0;
                return hours * 60 + (minutes || 0);
            };
            return timeToMinutes(a.time) - timeToMinutes(b.time);
        });

        res.json({
            students: studentCount,
            classesAssigned: assignedStreams.length,
            schedule: scheduleToday,
        });

    } catch (error) {
        console.error("Teacher stats error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getDashboardCharts = async (req, res) => {
    try {
        // Data for Students per Stream chart
        const studentsPerStream = await Student.aggregate([
            { $group: { _id: '$stream', count: { $sum: 1 } } },
            { $project: { name: '$_id', students: '$count', _id: 0 } },
            { $sort: { students: -1 } }
        ]);

        // Data for Fee Status chart
        const feeStatus = await Student.aggregate([
            { $unwind: '$fees' },
            { $group: { _id: '$fees.status', count: { $sum: 1 } } },
            { $project: { name: '$_id', value: '$count', _id: 0 } }
        ]);

        res.json({
            studentsPerCourse: studentsPerStream, // Keep key for frontend, but data is per stream
            feeStatus
        });
    } catch (error) {
        console.error("Dashboard chart error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getStudentDashboardSummary = async (req, res) => {
    try {
        if (req.user.role !== 'Student') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const student = await Student.findById(req.user.profileId).lean();
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found.' });
        }

        // 1. Today's Timetable
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = daysOfWeek[new Date().getDay()];
        const timetable = await Timetable.findOne({ stream: student.stream, semester: student.currentSemester });
        let scheduleToday = [];
        if (timetable && timetable.schedule && timetable.schedule.has(today)) {
            const daySchedule = timetable.schedule.get(today);
            for (const time in daySchedule) {
                scheduleToday.push({ time, subject: daySchedule[time].subject, teacher: daySchedule[time].teacher });
            }
             scheduleToday.sort((a, b) => {
                const timeToMinutes = (timeStr) => {
                    const [time, modifier] = timeStr.split(' ');
                    let [hours] = time.split(':').map(Number);
                    if (modifier === 'PM' && hours < 12) hours += 12;
                    return hours;
                };
                return timeToMinutes(a.time) - timeToMinutes(b.time);
            });
        }
        
        // 2. Recent Grades
        const recentMarksheet = await Marksheet.findOne({ student: student._id }).sort({ createdAt: -1 });

        // 3. Upcoming Deadlines
        const todayString = new Date().toISOString().split('T')[0];
        const upcomingEvents = await Event.find({ date: { $gte: todayString } }).sort({ date: 1 }).limit(5);

        // 4. Pending Fees
        const pendingFees = student.fees.filter(f => f.status === 'Pending');

        // 5. Latest Notices
        const latestNotices = await Notice.find({}).sort({ date: -1 }).limit(3);

        res.json({
            scheduleToday,
            recentMarksheet,
            upcomingEvents,
            pendingFees,
            latestNotices
        });

    } catch (error) {
        console.error("Student dashboard summary error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getTeacherInsights = async (req, res) => {
    try {
        if (!process.env.API_KEY) {
            console.error('Google AI API Key not found in environment variables.');
            return res.status(500).json({ message: 'AI service is not configured.' });
        }
        if (req.user.role !== 'Teacher') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        // 1. Get teacher's streams
        const teacher = await Faculty.findById(req.user.profileId).lean();
        if (!teacher || !teacher.assignedStreams || teacher.assignedStreams.length === 0) {
            return res.json({ summary: "No streams assigned. AI analysis cannot be performed." });
        }

        // 2. Get students and their data
        const students = await Student.find({ stream: { $in: teacher.assignedStreams } }).select('firstName lastName stream').lean();
        const studentIds = students.map(s => s._id);

        const allMarksheets = await Marksheet.find({ student: { $in: studentIds } }).sort({ student: 1, createdAt: 1 }).lean();
        const allAttendance = await Attendance.find({ student: { $in: studentIds } }).lean();
        
        // 3. Process data to find trends
        // Process performance
        const studentPerformance = {};
        allMarksheets.forEach(m => {
            const id = m.student.toString();
            if (!studentPerformance[id]) studentPerformance[id] = [];
            studentPerformance[id].push({ exam: m.exam, percentage: m.percentage });
        });

        const performanceTrends = Object.keys(studentPerformance).map(studentId => {
            const perfs = studentPerformance[studentId];
            const studentInfo = students.find(s => s._id.toString() === studentId);
            if (perfs.length < 2) return null; // Need at least two data points for a trend
            const latest = perfs[perfs.length - 1];
            const previous = perfs[perfs.length - 2];
            const change = latest.percentage - previous.percentage;
            return {
                name: `${studentInfo.firstName} ${studentInfo.lastName}`,
                stream: studentInfo.stream,
                trend: change > 5 ? 'Improved' : (change < -10 ? 'Declined' : 'Stable'),
                change: change.toFixed(1)
            };
        }).filter(Boolean);
        
        // Process attendance
        const attendanceSummary = {};
        allAttendance.forEach(att => {
            const id = att.student.toString();
            if (!attendanceSummary[id]) {
                attendanceSummary[id] = { present: 0, total: 0 };
            }
            attendanceSummary[id].total++;
            if (att.status === 'present') {
                attendanceSummary[id].present++;
            }
        });

        const lowAttendanceStudents = Object.keys(attendanceSummary).map(studentId => {
            const summary = attendanceSummary[studentId];
            const percentage = summary.total > 0 ? (summary.present / summary.total) * 100 : 100;
            if (percentage < 75) {
                const studentInfo = students.find(s => s._id.toString() === studentId);
                return {
                    name: `${studentInfo.firstName} ${studentInfo.lastName}`,
                    stream: studentInfo.stream,
                    attendance: percentage.toFixed(1) + '%'
                };
            }
            return null;
        }).filter(Boolean);


        // 4. Create prompt for Gemini
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const promptData = { performanceTrends, lowAttendanceStudents };

        const prompt = `You are an analytical assistant for a teacher. Analyze student data to identify trends and suggest actionable interventions.

        Data:
        ${JSON.stringify(promptData, null, 2)}

        Task:
        1.  Identify up to 3 "at-risk" students. An at-risk student has "Declined" significantly in performance OR has low attendance.
        2.  For each at-risk student, provide a simple, actionable "suggestedIntervention" for the teacher. Examples: "Schedule a 1-on-1 meeting to discuss study habits." or "Contact parents to discuss attendance."
        3.  Identify up to 3 "top improvers" based on performance trends.
        4.  Provide a brief, overall summary of the class trends.
        
        Format your response as a JSON object with three keys: "atRiskStudents", "topImprovers", and "summary".
        - "atRiskStudents" should be an array of objects, each containing "name", "stream", a "reason", and the "suggestedIntervention".
        - "topImprovers" should be an array of objects, each with "name", "stream", and "change".
        - "summary" should be a string.
        
        Example response: {"atRiskStudents": [{"name": "John Doe", "stream": "B.Tech CSE", "reason": "Attendance is 65.0%", "suggestedIntervention": "Contact parents to discuss the importance of regular attendance."}], "topImprovers": [], "summary": "Low attendance is a concern for a few students."}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        
        let jsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        res.json(JSON.parse(jsonStr));
        
    } catch (error) {
        console.error("Teacher AI Insight Error:", error);
        res.status(500).json({ message: 'Failed to generate teacher insights.' });
    }
};

export const generateQuiz = async (req, res) => {
    try {
        if (!process.env.API_KEY) {
            console.error('Google AI API Key not found in environment variables.');
            return res.status(500).json({ message: 'AI service is not configured.' });
        }
        const { topic, numQuestions = 5 } = req.body;
        if (!topic) {
            return res.status(400).json({ message: 'Topic is required.' });
        }

        const quizSchema = {
            type: Type.OBJECT,
            properties: {
                quiz: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            answer: { type: Type.STRING },
                        },
                        required: ['question', 'options', 'answer']
                    }
                }
            },
            required: ['quiz']
        };

        const prompt = `Create a multiple-choice quiz about "${topic}".
        - The quiz should have exactly ${numQuestions} questions.
        - Each question must have exactly 4 options.
        - One of the options must be the correct answer.
        - Ensure the 'answer' field exactly matches one of the strings in the 'options' array.
        
        Generate the quiz in the specified JSON format.`;
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
            },
        });

        const jsonText = response.text.trim();
        res.json(JSON.parse(jsonText));

    } catch (error) {
        console.error("AI Quiz Generation Error:", error);
        res.status(500).json({ message: 'Failed to generate quiz.' });
    }
};


export { getDashboardStats, getTeacherDashboardStats, getDashboardCharts };
