
import Timetable from '../models/timetableModel.js';
import Stream from '../models/streamModel.js';
import Faculty from '../models/facultyModel.js';
import { GoogleGenAI, Type } from '@google/genai';

// Constants for timetable generation
const timeSlots = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const defaultSchedules = {
    'B.Tech in Computer Science': {
        1: {
            Monday: { '9:00 AM': { subject: 'Introduction to C Programming', teacher: 'Mr. John' }},
            Tuesday: { '10:00 AM': { subject: 'Engineering Mathematics-I', teacher: 'Ms. Curie' }}
        },
        3: {
            Monday: { '9:00 AM': { subject: 'Data Structures', teacher: 'Mr. Newton' }},
            Wednesday: { '11:00 AM': { subject: 'Database Management Systems', teacher: 'Mr. Shakespeare' }}
        }
    },
    'MBA': {
        1: {
            Monday: { '9:00 AM': { subject: 'Principles of Management', teacher: 'Mr. Smith' }},
            Tuesday: { '10:00 AM': { subject: 'Managerial Economics', teacher: 'Ms. Jones' }}
        }
    }
};

const getTimetable = async (req, res) => {
    try {
        const { streamName, semester } = req.params;
        const semesterNum = parseInt(semester, 10);
        
        let timetable = await Timetable.findOne({ stream: streamName, semester: semesterNum });
        
        if (!timetable) {
            // If no timetable exists, create a default one and save it
            const defaultSchedule = defaultSchedules[streamName]?.[semesterNum] || {};
            timetable = new Timetable({ stream: streamName, semester: semesterNum, schedule: defaultSchedule });
            await timetable.save();
        }

        res.json(timetable);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateTimetable = async (req, res) => {
    try {
        const { streamName, semester } = req.params;
        const semesterNum = parseInt(semester, 10);
        const { schedule } = req.body;
        
        const timetable = await Timetable.findOneAndUpdate(
            { stream: streamName, semester: semesterNum },
            { schedule: schedule },
            { new: true, upsert: true }
        );

        res.json(timetable);
    } catch (error) {
        console.error("Timetable update error:", error);
        res.status(400).json({ message: 'Failed to update timetable' });
    }
};

const suggestTimetable = async (req, res) => {
    try {
        if (!process.env.API_KEY) {
            console.error('Google AI API Key not found in environment variables.');
            return res.status(500).json({ message: 'AI service is not configured.' });
        }
        const { streamName, semester } = req.params;
        const semesterNum = parseInt(semester, 10);

        // 1. Gather data (constraints)
        const stream = await Stream.findOne({ name: streamName });
        if (!stream) {
            return res.status(404).json({ message: 'Stream not found.' });
        }
        const semesterData = stream.semesters.find(s => s.semesterNumber === semesterNum);
        if (!semesterData || semesterData.subjects.length === 0) {
            return res.status(400).json({ message: 'No subjects found for this semester to generate a timetable.' });
        }
        const subjects = semesterData.subjects.map(s => s.name);
        const teachers = await Faculty.find({}).select('name subject').lean();
        const teacherNames = teachers.map(t => t.name);

        // 2. Define the response schema for the AI
        const timeSlotProperties = {};
        timeSlots.forEach(time => {
            timeSlotProperties[time] = {
                type: Type.OBJECT,
                properties: {
                    subject: { type: Type.STRING, description: "The subject name." },
                    teacher: { type: Type.STRING, description: "The teacher's name." }
                },
                required: ['subject', 'teacher'],
                description: `Schedule for ${time}.`
            };
        });

        const dayProperties = {};
        days.forEach(day => {
            dayProperties[day] = {
                type: Type.OBJECT,
                properties: timeSlotProperties,
                description: `Schedule for ${day}. Only include time slots that have a class. Do not include empty time slots.`
            };
        });

        const responseSchema = {
            type: Type.OBJECT,
            properties: dayProperties,
            description: "The complete weekly timetable."
        };

        // 3. Construct the prompt
        const prompt = `
            You are an expert academic scheduler. Create a weekly timetable for a specific university stream and semester.
            
            **Constraints & Rules:**
            1.  **Days:** The timetable runs from Monday to Friday.
            2.  **Time Slots:** Available class times are: ${timeSlots.join(', ')}.
            3.  **Subjects to Schedule:** You must schedule classes for the following subjects: ${subjects.join(', ')}. Try to schedule each subject at least once. If there are more slots than subjects, you can schedule some subjects multiple times.
            4.  **Available Teachers:** You can assign any of the following teachers: ${teacherNames.join(', ')}.
            5.  **CRITICAL RULE 1:** A teacher cannot be scheduled for two different classes at the exact same day and time.
            6.  **CRITICAL RULE 2:** The class (stream/semester) cannot have two different subjects at the same day and time.
            7.  **Guideline:** Spread the classes out across the week as evenly as possible. Avoid leaving large gaps in a day if possible.
            
            Based on these rules, generate a complete and valid timetable. The output must be a JSON object that strictly follows the provided schema.
        `;

        // 4. Call the Gemini API
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const suggestedSchedule = JSON.parse(jsonText);

        res.json({ schedule: suggestedSchedule });

    } catch (error) {
        console.error("AI Timetable Suggestion Error:", error);
        res.status(500).json({ message: 'Failed to generate AI timetable suggestion.' });
    }
};

const getTeacherScheduleByDate = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ message: "Date is required" });

        const teacher = await Faculty.findById(req.user.profileId);
        if (!teacher) return res.status(404).json({ message: "Teacher profile not found" });

        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dateObj = new Date(date);
        const dayName = daysOfWeek[dateObj.getDay()];

        // Find all timetables for streams this teacher is assigned to
        const timetables = await Timetable.find({ stream: { $in: teacher.assignedStreams } });
        
        let dailyClasses = [];

        timetables.forEach(tt => {
            if (tt.schedule && tt.schedule.has(dayName)) {
                const daySchedule = tt.schedule.get(dayName);
                
                for (const [time, slot] of Object.entries(daySchedule)) {
                    // Check if the teacher matches OR if the teacher teaches this subject (fallback)
                    const isAssignedTeacher = slot.teacher === teacher.name;
                    const isAssignedSubject = teacher.assignedSubjects.includes(slot.subject);

                    if (isAssignedTeacher || isAssignedSubject) {
                        dailyClasses.push({
                            time,
                            stream: tt.stream,
                            semester: tt.semester,
                            subject: slot.subject,
                            teacher: slot.teacher
                        });
                    }
                }
            }
        });

        // Sort by time
        dailyClasses.sort((a, b) => {
            const timeToMinutes = (timeStr) => {
                const [time, modifier] = timeStr.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                if (modifier === 'PM' && hours < 12) hours += 12;
                if (modifier === 'AM' && hours === 12) hours = 0;
                return hours * 60 + (minutes || 0);
            };
            return timeToMinutes(a.time) - timeToMinutes(b.time);
        });

        res.json(dailyClasses);

    } catch (error) {
        console.error("Fetch teacher schedule error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export { getTimetable, updateTimetable, suggestTimetable, getTeacherScheduleByDate };