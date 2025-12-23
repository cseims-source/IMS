import Student from '../models/studentModel.js';
import Faculty from '../models/facultyModel.js';
import Marksheet from '../models/marksheetModel.js';
import { GoogleGenAI } from '@google/genai';

const getStudents = async (req, res) => {
    try {
        if (req.user.role === 'Admin') {
            const students = await Student.find({});
            return res.json(students);
        }
        if (req.user.role === 'Teacher') {
            const teacher = await Faculty.findById(req.user.profileId);
            if (!teacher) {
                return res.status(404).json({ message: 'Teacher profile not found.' });
            }
            const students = await Student.find({ stream: { $in: teacher.assignedStreams } });
            return res.json(students);
        }
        res.json([]);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getStudentsByStream = async (req, res) => {
    try {
        const { streamName } = req.params;
        const { semester } = req.query;

        if (req.user.role === 'Teacher') {
            const teacher = await Faculty.findById(req.user.profileId);
            if (!teacher.assignedStreams.includes(streamName)) {
                return res.status(403).json({ message: "You are not assigned to this stream." });
            }
        }

        const query = { stream: streamName };
        if (semester) {
            query.currentSemester = parseInt(semester);
        }

        const students = await Student.find(query);
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getStudentProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user.profileId);
        if (student) {
            res.json(student);
        } else {
            res.status(404).json({ message: 'Student profile not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getStudentByIdForView = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (student) {
            res.json(student);
        } else {
            res.status(404).json({ message: 'Student profile not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


const addStudent = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, dob, gender, address, stream, currentSemester, photo } = req.body;
        const studentExists = await Student.findOne({ email: email.toLowerCase() });
        if (studentExists) {
            return res.status(400).json({ message: 'Student with this email already exists' });
        }
        const student = new Student({ firstName, lastName, email: email.toLowerCase(), phone, dob, gender, address, stream, currentSemester, photo });
        const createdStudent = await student.save();
        res.status(201).json(createdStudent);
    } catch (error) {
        res.status(400).json({ message: 'Invalid student data' });
    }
};

const updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (student) {
            student.firstName = req.body.firstName || student.firstName;
            student.lastName = req.body.lastName || student.lastName;
            student.email = req.body.email ? req.body.email.toLowerCase() : student.email;
            student.phone = req.body.phone || student.phone;
            student.dob = req.body.dob || student.dob;
            student.gender = req.body.gender || student.gender;
            student.address = req.body.address || student.address;
            student.stream = req.body.stream || student.stream;
            student.currentSemester = req.body.currentSemester || student.currentSemester;
            if (req.body.photo !== undefined) {
                student.photo = req.body.photo;
            }
            
            const updatedStudent = await student.save();
            res.json(updatedStudent);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid student data' });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (student) {
            await student.deleteOne();
            res.json({ message: 'Student removed' });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateStudentProfilePhoto = async (req, res) => {
    try {
        if (req.user.role !== 'Student') {
            return res.status(403).json({ message: 'Only students can update their profile photo.' });
        }
        const student = await Student.findById(req.user.profileId);
        if (student) {
            student.photo = req.body.photo; 
            const updatedStudent = await student.save();
            res.json(updatedStudent);
        } else {
            res.status(404).json({ message: 'Student profile not found' });
        }
    } catch (error) {
        console.error('Error updating photo:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const importStudents = async (req, res) => {
    const { students } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ message: 'No student data provided.' });
    }

    const newStudents = [];
    const failedImports = [];
    const incomingEmails = students.map(s => s.email.toLowerCase()).filter(Boolean);

    try {
        const existingStudents = await Student.find({ email: { $in: incomingEmails } });
        const existingEmails = new Set(existingStudents.map(s => s.email));

        students.forEach((student, index) => {
            const normalizedEmail = student.email.toLowerCase();
            if (!normalizedEmail || !student.firstName) {
                failedImports.push({ student, reason: `Missing required fields on row ${index + 2}.` });
            } else if (existingEmails.has(normalizedEmail)) {
                failedImports.push({ student, reason: `Email '${normalizedEmail}' already exists.` });
            } else {
                newStudents.push({ ...student, email: normalizedEmail });
                existingEmails.add(normalizedEmail);
            }
        });

        let insertedCount = 0;
        if (newStudents.length > 0) {
            const result = await Student.insertMany(newStudents, { ordered: false });
            insertedCount = result.length;
        }

        res.status(201).json({
            message: 'Import process completed.',
            importedCount: insertedCount,
            failedCount: failedImports.length,
            errors: failedImports,
        });

    } catch (error) {
        res.status(500).json({ message: 'An error occurred during the import process.', error: error.message });
    }
};

const getStudentFees = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.findById(studentId).select('fees');
        if (student) {
            res.json(student.fees);
        } else {
            res.status(404).json({ message: 'Student profile not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getMyFees = async (req, res) => {
    try {
        const student = await Student.findById(req.user.profileId).select('fees');
        if (student) {
            res.json(student.fees);
        } else {
            res.status(404).json({ message: 'Student profile not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

const addStudentFee = async (req, res) => {
    try {
        const { type, amount, dueDate, status } = req.body;
        const student = await Student.findById(req.params.id);
        if (student) {
            student.fees.push({ type, amount, dueDate, status: status || 'Pending' });
            await student.save();
            res.status(201).json(student.fees);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid fee data.' });
    }
};

const updateFeeStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const student = await Student.findById(req.params.id);
        if (student) {
            const fee = student.fees.id(req.params.feeId);
            if (fee) {
                fee.status = status;
                await student.save();
                res.json(student.fees);
            } else {
                res.status(404).json({ message: 'Fee not found' });
            }
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid status data.' });
    }
};

const payMyFee = async (req, res) => {
     try {
        const student = await Student.findById(req.user.profileId);
        if (student) {
            const fee = student.fees.id(req.params.feeId);
            if (fee) {
                if(fee.status === 'Pending') {
                    fee.status = 'Paid';
                    await student.save();
                    res.json(student);
                } else {
                    res.status(400).json({ message: 'This fee is not pending payment.' });
                }
            } else {
                res.status(404).json({ message: 'Fee record not found' });
            }
        } else {
            res.status(404).json({ message: 'Student profile not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getAcademicAdvice = async (req, res) => {
    try {
        if (req.user.role !== 'Student') {
            return res.status(403).json({ message: 'Only students can access this feature.' });
        }
        if (!process.env.API_KEY) {
            return res.status(500).json({ message: 'AI service is not configured.' });
        }

        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ message: 'Query is required.' });
        }
        
        const student = await Student.findById(req.user.profileId).lean();
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found.' });
        }
        const marksheets = await Marksheet.find({ student: req.user.profileId }).lean();
        
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
        };
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `You are an AI Academic Advisor for a university student. Your tone should be helpful, encouraging, and clear. Your goal is to provide personalized academic guidance.

        Here is the student's academic profile:
        ${JSON.stringify(dataSummary, null, 2)}

        The student has asked the following question:
        "${query}"

        Based ONLY on the data provided, answer the student's question. Your response should:
        1. Directly address the student's query.
        2. Analyze their performance, pointing out strengths (high scores) and areas for improvement (low scores).
        3. Provide specific, actionable advice. For example, suggest study techniques, recommend focusing on certain subjects, or explain how their current performance relates to their career goals within their stream.
        4. Use markdown for formatting (bolding, lists) to make the response easy to read. Use lists for suggestions.
        Do not invent information or make promises. Keep the advice grounded in the provided academic data.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        res.json({ advice: response.text });
        
    } catch (error) {
        console.error('AI Academic Advice Error:', error);
        res.status(500).json({ message: 'Failed to generate AI academic advice.' });
    }
};


export { 
    getStudents, getStudentsByStream, addStudent, updateStudent, deleteStudent, 
    getStudentProfile, getStudentByIdForView, updateStudentProfilePhoto, importStudents,
    getStudentFees, addStudentFee, updateFeeStatus, getMyFees, payMyFee,
    getAcademicAdvice
};