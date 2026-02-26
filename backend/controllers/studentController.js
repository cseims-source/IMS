import Student from '../models/studentModel.js';
import Faculty from '../models/facultyModel.js';
import Marksheet from '../models/marksheetModel.js';
import AdmissionInquiry from '../models/admissionInquiryModel.js';
import User from '../models/userModel.js';
import Stream from '../models/streamModel.js';
import { GoogleGenAI } from '@google/genai';
import XLSX from 'xlsx';
import mongoose from 'mongoose';

const resolveStreamId = async (payload) => {
    const streamName = payload.stream || payload.branch;
    if (!streamName) return null;
    const stream = await Stream.findOne({ name: streamName }).select('_id').lean();
    return stream?._id || null;
};

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
            const assignedStreamIds = teacher.assignedStreamIds?.length
                ? teacher.assignedStreamIds
                : [...new Set((teacher.workload || []).map(w => w.streamId).filter(Boolean))];
            const assignedStreams = [...new Set((teacher.workload || []).map(w => w.stream).filter(Boolean))];
            const query = assignedStreamIds.length > 0
                ? { streamId: { $in: assignedStreamIds } }
                : { stream: { $in: assignedStreams } };
            const students = assignedStreams.length || assignedStreamIds.length
                ? await Student.find(query).sort({ createdAt: -1 })
                : [];
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
        const activeNodes = await Student.countDocuments({ status: 'Approved' });
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
        const email = req.body.email.toLowerCase();
        const studentExists = await Student.findOne({ email });
        if (studentExists) {
            return res.status(400).json({ message: 'Identity Node already exists with this email.' });
        }

        const streamId = await resolveStreamId(req.body);
        const student = new Student({ 
            ...req.body,
            email,
            ...(streamId ? { streamId } : {})
        });
        const createdStudent = await student.save();

        if (req.body.status === 'Pending') {
            try {
                await AdmissionInquiry.create({
                    name: `${req.body.firstName} ${req.body.lastName || ''}`.trim(),
                    email: email,
                    mobile: req.body.phone || '0000000000',
                    course: req.body.course || 'B.Tech',
                    branch: req.body.branch || 'General',
                    academicYear: req.body.academicYear || '2025-26',
                    state: req.body.presentAddress?.state || 'Odisha',
                    city: req.body.presentAddress?.city || 'Bhubaneswar',
                    address: req.body.presentAddress?.address || 'Registry Entry',
                    status: 'New',
                    gender: req.body.gender,
                    dob: req.body.dob,
                    notes: 'Auto-generated from Manual Student Registry'
                });
            } catch (inquiryErr) {
                console.error("Failed to bridge Inquiry Node:", inquiryErr);
            }
        }

        res.status(201).json(createdStudent);
    } catch (error) {
        console.error("Student Add Error:", error);
        res.status(400).json({ message: 'Invalid data sequence', error: error.message });
    }
};

const updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (student) {
            Object.assign(student, req.body);
            if (req.body.email) student.email = req.body.email.toLowerCase();
            const streamId = await resolveStreamId(req.body);
            if (streamId) student.streamId = streamId;
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
            await User.deleteOne({ email: student.email });
            await student.deleteOne();
            res.json({ message: 'Node purged' });
        } else {
            res.status(404).json({ message: 'Node not identified' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Purge protocol error' });
    }
};

const bulkDeleteStudents = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: 'Invalid ID sequence provided.' });
        }
        
        const students = await Student.find({ _id: { $in: ids } });
        const emails = students.map(s => s.email);
        
        await User.deleteMany({ email: { $in: emails } });
        await Student.deleteMany({ _id: { $in: ids } });
        
        res.json({ message: `${ids.length} nodes successfully purged from registry.` });
    } catch (error) {
        res.status(500).json({ message: 'Bulk purge protocol failed.' });
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
        const { semester, section } = req.query;
        const query = mongoose.Types.ObjectId.isValid(streamName)
            ? { streamId: streamName }
            : { stream: { $regex: streamName, $options: 'i' } };
        if (semester) query.currentSemester = parseInt(semester);
        if (section) query.section = section;

        if (req.user.role === 'Teacher') {
            const teacher = await Faculty.findById(req.user.profileId);
            const canAccess = teacher.workload.some(work => 
                work.stream.toLowerCase().includes(streamName.toLowerCase()) &&
                (!semester || work.semester === parseInt(semester)) &&
                (!section || work.section === section)
            );
            
            if (!canAccess) {
                return res.status(403).json({ message: "Access Denied: Node not assigned to your Faculty workload." });
            }
        }

        const students = await Student.find(query).sort({ registrationNumber: 1 });
        res.json(students);
    } catch (error) { 
        res.status(500).json({ message: 'Server Error during student lookup' }); 
    }
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

const getFeesStats = async (req, res) => {
    try {
        const { stream, streamId } = req.query;
        const studentFilter = streamId
            ? { streamId }
            : (stream && stream !== 'all' ? { stream } : {});

        const students = await Student.find(studentFilter).select('fees').lean();
        const allFees = students.flatMap(s => s.fees || []);

        const total = allFees.length;
        const pending = allFees.filter(f => f.status === 'Pending');
        const paid = allFees.filter(f => f.status === 'Paid');
        const pendingAmount = pending.reduce((sum, f) => sum + (f.amount || 0), 0);
        const paidAmount = paid.reduce((sum, f) => sum + (f.amount || 0), 0);
        const today = new Date();
        const overdue = pending.filter(f => f.dueDate && new Date(f.dueDate) < today).length;

        res.json({ total, pending: pending.length, paid: paid.length, pendingAmount, paidAmount, overdue });
    } catch (error) {
        res.status(500).json({ message: 'Fee stats failed.' });
    }
};

const exportFees = async (req, res) => {
    try {
        const { status, stream, streamId } = req.query;
        const studentFilter = streamId
            ? { streamId }
            : (stream && stream !== 'all' ? { stream } : {});

        const students = await Student.find(studentFilter).lean();
        const rows = [];
        students.forEach(s => {
            (s.fees || []).forEach(f => {
                if (status && status !== 'All' && f.status !== status) return;
                rows.push({
                    studentId: s._id,
                    studentName: `${s.firstName} ${s.lastName}`.trim(),
                    email: s.email,
                    stream: s.stream,
                    feeType: f.type,
                    amount: f.amount,
                    dueDate: f.dueDate,
                    status: f.status
                });
            });
        });
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="fees.csv"');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Export failed.' });
    }
};

const importFees = async (req, res) => {
    try {
        if (!req.file?.buffer) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const errors = [];
        let imported = 0;

        for (const [index, row] of rows.entries()) {
            const rowIndex = index + 2;
            const studentId = row.studentId || row.student_id || '';
            const registrationNumber = row.registrationNumber || row.registration_no || '';
            const email = (row.email || row.Email || '').toString().toLowerCase();
            const type = row.type || row.feeType || row.FeeType;
            const amount = Number(row.amount || row.Amount || 0);
            const dueDate = row.dueDate || row.DueDate || '';
            const status = row.status || row.Status || 'Pending';

            if (!type || !amount || !dueDate) {
                errors.push({ row: rowIndex, reason: 'Missing fee fields.' });
                continue;
            }

            let student = null;
            if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
                student = await Student.findById(studentId);
            } else if (registrationNumber) {
                student = await Student.findOne({ registrationNumber });
            } else if (email) {
                student = await Student.findOne({ email });
            }
            if (!student) {
                errors.push({ row: rowIndex, reason: 'Student not found.' });
                continue;
            }

            student.fees.push({
                type,
                amount,
                dueDate: new Date(dueDate),
                status: status === 'Paid' ? 'Paid' : 'Pending'
            });
            await student.save();
            imported += 1;
        }

        res.status(201).json({ imported, errorCount: errors.length, errors });
    } catch (error) {
        res.status(400).json({ message: 'Import failed.', error: error.message });
    }
};

export { 
    getStudents, getStudentStats, getStudentsByStream, addStudent, updateStudent, deleteStudent, bulkDeleteStudents,
    getStudentProfile, getStudentByIdForView, updateStudentProfilePhoto, importStudents,
    getStudentFees, addStudentFee, updateFeeStatus, getMyFees, payMyFee,
    getAcademicAdvice,
    getFeesStats, exportFees, importFees
};