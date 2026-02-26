import QuestionPaper from '../models/questionPaperModel.js';
import Stream from '../models/streamModel.js';
import { GoogleGenAI, Type } from '@google/genai';
import XLSX from 'xlsx';

export const getQuestionPapers = async (req, res) => {
    try {
        const { course, branch, academicYear, search } = req.query;
        let query = {};
        if (course && course !== 'All Courses') query.course = course;
        if (branch && branch !== 'All Branches') query.branch = branch;
        if (academicYear && academicYear !== 'All Academic Years') query.academicYear = academicYear;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } }
            ];
        }

        const papers = await QuestionPaper.find(query).populate('uploadedBy', 'name');
        res.json(papers);
    } catch (error) {
        res.status(500).json({ message: 'Sync failed' });
    }
};

export const getQuestionPaperMetadata = async (req, res) => {
    try {
        const streams = await Stream.find({});
        const totalPapers = await QuestionPaper.countDocuments();
        
        // Extract unique courses and branches from Stream module
        const uniqueCourses = [...new Set(streams.map(s => s.level))]; // Level like Bachelors/Masters or manually extract if Course is distinct
        const uniqueBranches = [...new Set(streams.map(s => s.name))];
        
        // Extract all subjects from all semesters
        const subjectsSet = new Set();
        streams.forEach(stream => {
            stream.semesters.forEach(sem => {
                sem.subjects.forEach(sub => subjectsSet.add(sub.name));
            });
        });

        // Get unique academic years from the existing papers
        const academicYears = await QuestionPaper.distinct('academicYear');

        res.json({
            stats: {
                totalPapers,
                totalCourses: uniqueBranches.length, // In this app, Stream is essentially the Course/Branch node
                totalBranches: uniqueBranches.length,
                totalSubjects: subjectsSet.size
            },
            filters: {
                courses: ['All Courses', ...uniqueBranches],
                branches: ['All Branches', ...uniqueBranches],
                academicYears: ['All Academic Years', ...academicYears.sort().reverse()]
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to aggregate metadata' });
    }
};

export const addQuestionPaper = async (req, res) => {
    try {
        const streamName = req.body.branch || req.body.course;
        const streamDoc = streamName
            ? await Stream.findOne({ name: streamName }).select('_id').lean()
            : null;
        const paper = new QuestionPaper({
            ...req.body,
            ...(streamDoc?._id ? { streamId: streamDoc._id } : {}),
            uploadedBy: req.user._id
        });
        const created = await paper.save();
        res.status(201).json(created);
    } catch (error) {
        res.status(400).json({ message: 'Logic error in upload sequence' });
    }
};

export const deleteQuestionPaper = async (req, res) => {
    try {
        const paper = await QuestionPaper.findById(req.params.id);
        if (paper) {
            await paper.deleteOne();
            res.json({ message: 'Node purged' });
        } else {
            res.status(404).json({ message: 'Node not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Purge failed' });
    }
};

export const generateAIQuestions = async (req, res) => {
    try {
        const { subject, topic, count = 5 } = req.body;
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const schema = {
            type: Type.OBJECT,
            properties: {
                questions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            marks: { type: Type.NUMBER },
                            complexity: { type: Type.STRING }
                        }
                    }
                }
            }
        };

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate ${count} university-level exam questions for the subject "${subject}" specifically on the topic "${topic}". Include marks for each. Output must be strictly JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });

        res.json(JSON.parse(response.text));
    } catch (error) {
        res.status(500).json({ message: 'AI Synthesis Interrupted' });
    }
};

export const exportQuestionPapers = async (req, res) => {
    try {
        const papers = await QuestionPaper.find({}).lean();
        const rows = papers.map(p => ({
            title: p.title,
            course: p.course,
            branch: p.branch,
            semester: p.semester,
            subject: p.subject,
            academicYear: p.academicYear,
            difficulty: p.difficulty,
            fileUrl: p.fileUrl || ''
        }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="question-papers.csv"');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Export failed.' });
    }
};

export const importQuestionPapers = async (req, res) => {
    try {
        if (!req.file?.buffer) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const errors = [];
        const inserts = [];

        for (const [index, row] of rows.entries()) {
            const rowIndex = index + 2;
            const title = row.title || row.Title;
            const course = row.course || row.Course;
            const branch = row.branch || row.Branch;
            const semester = parseInt(row.semester || row.Semester, 10);
            const subject = row.subject || row.Subject;
            const academicYear = row.academicYear || row.AcademicYear || row.academic_year;
            const difficulty = row.difficulty || row.Difficulty || 'Medium';
            const fileUrl = row.fileUrl || row.FileUrl || row.file_url || '';

            if (!title || !course || !branch || !semester || !subject || !academicYear) {
                errors.push({ row: rowIndex, reason: 'Missing required fields.' });
                continue;
            }

            const streamName = branch || course;
            const streamDoc = streamName
                ? await Stream.findOne({ name: streamName }).select('_id').lean()
                : null;

            inserts.push({
                title,
                course,
                branch,
                semester,
                subject,
                academicYear,
                difficulty,
                fileUrl,
                ...(streamDoc?._id ? { streamId: streamDoc._id } : {}),
                uploadedBy: req.user._id
            });
        }

        if (inserts.length > 0) {
            await QuestionPaper.insertMany(inserts, { ordered: false });
        }

        res.status(201).json({ imported: inserts.length, errorCount: errors.length, errors });
    } catch (error) {
        res.status(400).json({ message: 'Import failed.', error: error.message });
    }
};