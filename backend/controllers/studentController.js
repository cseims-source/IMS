import Student from '../models/studentModel.js';
import Faculty from '../models/facultyModel.js';
import Marksheet from '../models/marksheetModel.js';
import { GoogleGenAI } from '@google/genai';

const getStudents = async (req, res) => {
    try {
        if (req.user.role === 'Admin') {
            const students = await Student.find({}).sort({ createdAt: -1 });
            return res.json(students);
        }
        if (req.user.role === 'Teacher') {
            const teacher = await Faculty.findById(req.user.profileId);
            if (!teacher) {
                return res.status(404).json({ message: 'Teacher profile not found.' });
            }
            const students = await Student.find({ stream: { $in: teacher.assignedStreams } }).sort({ createdAt: -1 });
            return res.json(students);
        }
        res.json([]);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getStudentStats = async (req, res) => {
    try {
        const totalNodes = await Student.countDocuments();
        const pendingNodes = await Student.countDocuments({ status: 'Pending' });
        const activeNodes = await Student.countDocuments({ status: 'Active' });
        const recentNodes = await Student.countDocuments({ 
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
        });

        res.json({
            total: totalNodes,
            pending: pendingNodes,
            active: activeNodes,
            weeklyGrowth: recentNodes
        });
    } catch (error) {
        res.status(500).json({ message: 'Stats aggregation failed' });
    }
};

const addStudent = async (req, res) => {
    try {
        const studentExists = await Student.findOne({ email: req.body.email.toLowerCase() });
        if (studentExists) {
            return res.status(400).json({ message: 'Identity Node already exists with this email.' });
        }
        const student = new Student({ 
            ...req.body,
            email: req.body.email.toLowerCase() 
        });
        const createdStudent = await student.save();
        res.status(201).json(createdStudent);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data sequence', error: error.message });
    }
};

const updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (student) {
            Object.assign(student, req.body);
            if (req.body.email) student.email = req.body.email.toLowerCase();
            const updatedStudent = await student.save();
            res.json(updatedStudent);
        } else {
            res.status(404).json({ message: 'Node not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Update protocol failed', error: error.message });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (student) {
            await student.deleteOne();
            res.json({ message: 'Node purged' });
        } else {
            res.status(404).json({ message: 'Node not identified' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Purge protocol error' });
    }
};

const importStudents = async (req, res) => {
    const { students } = req.body;
    if (!students || !Array.isArray(students)) return res.status(400).json({ message: 'Missing data array' });

    const newStudents = [];
    const failedImports = [];
    const incomingEmails = students.map(s => s.email?.toLowerCase()).filter(Boolean);

    try {
        const existingEmails = new Set((await Student.find({ email: { $in: incomingEmails } })).map(s => s.email));

        students.forEach((s, idx) => {
            const email = s.email?.toLowerCase();
            if (!email || !s.firstName) {
                failedImports.push({ student: s, reason: 'Incomplete Identity' });
            } else if (existingEmails.has(email)) {
                failedImports.push({ student: s, reason: 'Duplicate Logic' });
            } else {
                newStudents.push({ ...s, email });
                existingEmails.add(email);
            }
        });

        let insertedCount = 0;
        if (newStudents.length > 0) {
            insertedCount = (await Student.insertMany(newStudents, { ordered: false })).length;
        }

        res.status(201).json({ importedCount: insertedCount, failedCount: failedImports.length, errors: failedImports });
    } catch (error) {
        res.status(500).json({ message: 'Registry injection failed', error: error.message });
    }
};

const getStudentsByStream = async (req, res) => {
    try {
        const { streamName } = req.params;
        const { semester } = req.query;
        if (req.user.role === 'Teacher') {
            const teacher = await Faculty.findById(req.user.profileId);
            if (!teacher.assignedStreams.includes(streamName)) return res.status(403).json({ message: "Access Denied" });
        }
        const query = { stream: streamName };
        if (semester) query.currentSemester = parseInt(semester);
        res.json(await Student.find(query));
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const getStudentProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user.profileId);
        student ? res.json(student) : res.status(404).json({ message: 'Profile not found' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const getStudentByIdForView = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        student ? res.json(student) : res.status(404).json({ message: 'Profile not found' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const updateStudentProfilePhoto = async (req, res) => {
    try {
        const student = await Student.findById(req.user.profileId);
        if (student) { student.photo = req.body.photo; res.json(await student.save()); }
        else res.status(404).json({ message: 'Profile not found' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const getStudentFees = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).select('fees');
        student ? res.json(student.fees) : res.status(404).json({ message: 'Profile not found' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const getMyFees = async (req, res) => {
    try {
        const student = await Student.findById(req.user.profileId).select('fees');
        student ? res.json(student.fees) : res.status(404).json({ message: 'Profile not found' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
}

const addStudentFee = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (student) {
            student.fees.push(req.body);
            await student.save();
            res.status(201).json(student.fees);
        } else res.status(404).json({ message: 'Node not found' });
    } catch (error) { res.status(400).json({ message: 'Invalid data' }); }
};

const updateFeeStatus = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (student) {
            const fee = student.fees.id(req.params.feeId);
            if (fee) { fee.status = req.body.status; await student.save(); res.json(student.fees); }
            else res.status(404).json({ message: 'Fee not found' });
        } else res.status(404).json({ message: 'Node not found' });
    } catch (error) { res.status(400).json({ message: 'Invalid status' }); }
};

const payMyFee = async (req, res) => {
     try {
        const student = await Student.findById(req.user.profileId);
        if (student) {
            const fee = student.fees.id(req.params.feeId);
            if (fee && fee.status === 'Pending') { fee.status = 'Paid'; await student.save(); res.json(student); }
            else res.status(400).json({ message: 'Invalid status' });
        } else res.status(404).json({ message: 'Profile not found' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const getAcademicAdvice = async (req, res) => {
    try {
        if (req.user.role !== 'Student') return res.status(403).json({ message: 'Denied' });
        const student = await Student.findById(req.user.profileId).lean();
        const marksheets = await Marksheet.find({ student: req.user.profileId }).lean();
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Student advice context: ${JSON.stringify({ profile: student, marks: marksheets })} Query: ${req.body.query}`;
        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
        res.json({ advice: response.text });
    } catch (error) { res.status(500).json({ message: 'AI Error' }); }
};

export { 
    getStudents, getStudentStats, getStudentsByStream, addStudent, updateStudent, deleteStudent, 
    getStudentProfile, getStudentByIdForView, updateStudentProfilePhoto, importStudents,
    getStudentFees, addStudentFee, updateFeeStatus, getMyFees, payMyFee,
    getAcademicAdvice
};