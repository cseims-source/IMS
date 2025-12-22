
import Student from '../models/studentModel.js';
import Marksheet from '../models/marksheetModel.js';
import PlacementApplication from '../models/placementApplicationModel.js';
import PlacementJob from '../models/placementJobModel.js';
import { GoogleGenAI } from '@google/genai';

// @desc    Get AI-powered career advice
// @route   POST /api/career/ask-ai
// @access  Student
export const getCareerAdvice = async (req, res) => {
    try {
        if (!process.env.API_KEY) {
            console.error('Google AI API Key not found in environment variables.');
            return res.status(500).json({ message: 'AI service is not configured.' });
        }
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ message: 'Query is required.' });
        }
        
        // 1. Fetch student data
        const student = await Student.findById(req.user.profileId).lean();
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found.' });
        }
        
        const marksheets = await Marksheet.find({ student: req.user.profileId }).lean();
        
        // Fetch placement data relevant to the student's stream
        const relevantJobs = await PlacementJob.find({}).populate('company').lean(); // Simplified for demo
        const placementsInStream = relevantJobs.filter(job => {
            // This is a simplification. A real app might have stream tags on jobs.
            return job.title.toLowerCase().includes('developer') || job.title.toLowerCase().includes('engineer');
        });

        // 2. Summarize data for the AI
        const dataSummary = {
            studentProfile: {
                stream: student.stream,
                currentSemester: student.currentSemester,
            },
            academicPerformance: marksheets.map(m => ({
                exam: m.exam,
                overallPercentage: m.percentage,
                grade: m.grade,
                subjects: m.marks.map(s => ({ subject: s.subjectName, score: s.marksObtained, maxMarks: s.maxMarks }))
            })),
            historicalPlacementsInStream: placementsInStream.map(p => ({
                jobTitle: p.title,
                company: p.company.name,
                sector: p.company.sector
            }))
        };
        
        // 3. Prepare prompt and call Gemini
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `You are a friendly and encouraging AI Career Counselor for a student at an engineering and management institute. Your goal is to provide personalized, actionable career advice.

        Here is the student's profile and academic data:
        ${JSON.stringify(dataSummary, null, 2)}

        The student has asked the following question:
        "${query}"

        Based ONLY on the data provided, answer the student's question. Your response should be:
        1.  Personalized: Directly reference their stream, performance in specific subjects, etc.
        2.  Actionable: Suggest concrete next steps, skills to learn, or project ideas.
        3.  Positive and encouraging.
        4.  Formatted in clear markdown with headings, lists, and bold text.
        Do not invent any data not present in the summary.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        res.json({ answer: response.text });
        
    } catch (error) {
        console.error('AI Career Advice Error:', error);
        res.status(500).json({ message: 'Failed to generate AI career advice.' });
    }
};
