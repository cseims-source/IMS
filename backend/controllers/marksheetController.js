import Marksheet from '../models/marksheetModel.js';
import Student from '../models/studentModel.js';
import Faculty from '../models/facultyModel.js';
import Stream from '../models/streamModel.js';
import XLSX from 'xlsx';
import mongoose from 'mongoose';

const getGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
};

const resolveStreamId = async (streamName) => {
    if (!streamName) return null;
    const stream = await Stream.findOne({ name: streamName }).select('_id').lean();
    return stream?._id || null;
};

const canTeacherAccessStudent = async (teacherId, studentData, semester) => {
    const teacher = await Faculty.findById(teacherId);
    if (!teacher) return false;
    const hasWorkload = Array.isArray(teacher.workload) && teacher.workload.length > 0;
    if (hasWorkload) {
        return teacher.workload.some(work =>
            work.stream === studentData.stream &&
            work.semester === parseInt(semester) &&
            work.section === studentData.section
        );
    }
    return (teacher.assignedStreams || []).includes(studentData.stream);
};

const getMarksheet = async (req, res) => {
    try {
        const { studentId, exam, semester } = req.params;
        const { academicYear } = req.query;

        if (req.user.role === 'Student' && req.user.profileId.toString() !== studentId) {
            return res.status(403).json({ message: "You are not authorized to view this marksheet." });
        }

        const studentData = await Student.findById(studentId).select('academicYear').lean();
        const resolvedAcademicYear = academicYear || studentData?.academicYear;

        const query = { student: studentId, exam, semester: parseInt(semester) };
        if (resolvedAcademicYear) query.academicYear = resolvedAcademicYear;

        const marksheet = await Marksheet.findOne(query);
        if (marksheet) {
            res.json(marksheet);
        } else {
            res.json(null); // Return null if not found, client can handle it
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getMyMarksheets = async (req, res) => {
    try {
        if (req.user.role !== 'Student') {
            return res.status(403).json({ message: 'This route is only for students.' });
        }
        const { stream, semester, section, exam, academicYear } = req.query;
        const filter = { student: req.user.profileId, status: 'published' };
        if (stream && stream !== 'all') filter.stream = stream;
        if (semester && semester !== 'all') filter.semester = parseInt(semester);
        if (section && section !== 'all') filter.section = section;
        if (exam && exam !== 'all') filter.exam = exam;
        if (academicYear && academicYear !== 'all') filter.academicYear = academicYear;

        const marksheets = await Marksheet.find(filter).sort({ createdAt: -1 });
        res.json(marksheets);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching your marksheets.' });
    }
};

const getMarksheetsForStudent = async (req, res) => {
    try {
        const { status, stream, semester, section, exam, academicYear } = req.query;
        const filter = { student: req.params.studentId };
        if (status) filter.status = status;
        if (stream && stream !== 'all') filter.stream = stream;
        if (semester && semester !== 'all') filter.semester = parseInt(semester);
        if (section && section !== 'all') filter.section = section;
        if (exam && exam !== 'all') filter.exam = exam;
        if (academicYear && academicYear !== 'all') filter.academicYear = academicYear;
        const marksheets = await Marksheet.find(filter).sort({ createdAt: 1 });
        res.json(marksheets);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching marksheets.' });
    }
};

const saveMarksheet = async (req, res) => {
    try {
        const { student, exam, examId, semester, academicYear, section, examDate, status, remarks, marks, total, percentage, grade } = req.body;

        if (!student || !exam || !semester || !Array.isArray(marks) || marks.length === 0) {
            return res.status(400).json({ message: 'Missing required marksheet fields.' });
        }

        const studentData = await Student.findById(student);
        if(!studentData) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (studentData.currentSemester && parseInt(studentData.currentSemester) !== parseInt(semester)) {
            return res.status(400).json({ message: 'Student is not in the selected semester.' });
        }
        
        if (req.user.role === 'Teacher') {
            const canAccess = await canTeacherAccessStudent(req.user.profileId, studentData, semester);
            if (!canAccess) {
                return res.status(403).json({ message: "You cannot enter marks for a student in a stream you are not assigned to." });
            }
        }

        const streamId = studentData.streamId || await resolveStreamId(studentData.stream);
        const resolvedAcademicYear = academicYear || studentData.academicYear;
        const resolvedSection = section || studentData.section || 'A';
        const totalMarks = total ?? marks.reduce((acc, m) => acc + (Number(m.marksObtained) || 0), 0);
        const maxTotal = marks.reduce((acc, m) => acc + (Number(m.maxMarks) || 0), 0);
        const computedPercentage = percentage ?? (maxTotal > 0 ? ((totalMarks / maxTotal) * 100) : 0);
        const computedGrade = grade || getGrade(computedPercentage);

        const marksheetData = {
            student,
            exam,
            ...(examId ? { examId } : {}),
            stream: studentData.stream,
            ...(streamId ? { streamId } : {}),
            ...(resolvedAcademicYear ? { academicYear: resolvedAcademicYear } : {}),
            semester: parseInt(semester),
            section: resolvedSection,
            examDate,
            status: status || 'published',
            remarks: remarks || '',
            marks,
            total: totalMarks,
            percentage: Number(computedPercentage.toFixed(2)),
            grade: computedGrade,
            markedBy: req.user._id,
            markedAt: new Date(),
            ...(req.user.role === 'Teacher' ? { faculty: req.user.profileId } : {})
        };

        const updatedMarksheet = await Marksheet.findOneAndUpdate(
            { student: student, exam: exam, semester: parseInt(semester), ...(resolvedAcademicYear ? { academicYear: resolvedAcademicYear } : {}) },
            marksheetData,
            { new: true, upsert: true }
        );

        res.status(201).json(updatedMarksheet);
    } catch (error) {
        res.status(400).json({ message: 'Failed to save marksheet' });
    }
};

const getMarksheets = async (req, res) => {
    try {
        const { stream, streamId, semester, section, exam, academicYear, status, studentId } = req.query;
        const filter = {};
        if (studentId && mongoose.Types.ObjectId.isValid(studentId)) filter.student = studentId;
        if (streamId) filter.streamId = streamId;
        if (!streamId && stream && stream !== 'all') filter.stream = stream;
        if (semester && semester !== 'all') filter.semester = parseInt(semester);
        if (section && section !== 'all') filter.section = section;
        if (exam && exam !== 'all') filter.exam = exam;
        if (academicYear && academicYear !== 'all') filter.academicYear = academicYear;
        if (status && status !== 'all') filter.status = status;

        if (req.user.role === 'Teacher') {
            const teacher = await Faculty.findById(req.user.profileId);
            const assignedStreams = teacher?.assignedStreams || [];
            const workloadStreams = (teacher?.workload || []).map(w => w.stream).filter(Boolean);
            const allowedStreams = [...new Set([...assignedStreams, ...workloadStreams])];
            filter.stream = filter.stream || { $in: allowedStreams };
        }

        const marksheets = await Marksheet.find(filter)
            .populate('student', 'firstName lastName registrationNumber section')
            .sort({ createdAt: -1 });
        res.json(marksheets);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching marksheets.' });
    }
};

const updateMarksheet = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid marksheet ID.' });
        }
        const update = {
            ...req.body,
            markedBy: req.user._id,
            markedAt: new Date()
        };
        const updated = await Marksheet.findByIdAndUpdate(id, update, { new: true });
        if (!updated) return res.status(404).json({ message: 'Marksheet not found.' });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: 'Marksheet update failed.' });
    }
};

const getMarksheetAnalytics = async (req, res) => {
    try {
        const { stream, streamId, semester, section, exam, academicYear } = req.query;
        const match = {};
        if (streamId) match.streamId = streamId;
        if (!streamId && stream && stream !== 'all') match.stream = stream;
        if (semester && semester !== 'all') match.semester = parseInt(semester);
        if (section && section !== 'all') match.section = section;
        if (exam && exam !== 'all') match.exam = exam;
        if (academicYear && academicYear !== 'all') match.academicYear = academicYear;

        const gradeDistribution = await Marksheet.aggregate([
            { $match: match },
            { $group: { _id: '$grade', count: { $sum: 1 } } },
            { $project: { grade: '$_id', count: 1, _id: 0 } },
            { $sort: { grade: 1 } }
        ]);

        const subjectAverages = await Marksheet.aggregate([
            { $match: match },
            { $unwind: '$marks' },
            { $group: { _id: '$marks.subjectName', avgMarks: { $avg: '$marks.marksObtained' }, maxMarks: { $avg: '$marks.maxMarks' } } },
            { $project: { subject: '$_id', avgMarks: { $round: ['$avgMarks', 2] }, maxMarks: { $round: ['$maxMarks', 2] }, _id: 0 } },
            { $sort: { subject: 1 } }
        ]);

        const toppers = await Marksheet.find(match)
            .sort({ percentage: -1 })
            .limit(5)
            .populate('student', 'firstName lastName registrationNumber')
            .lean();

        res.json({ gradeDistribution, subjectAverages, toppers });
    } catch (error) {
        res.status(500).json({ message: 'Analytics aggregation failed.' });
    }
};

const uploadMarksheets = async (req, res) => {
    try {
        if (!req.file?.buffer) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const errors = [];
        const grouped = new Map();

        for (const [index, row] of rows.entries()) {
            const rowIndex = index + 2;
            const studentId = row.studentId || row.student || row.student_id || '';
            const registrationNumber = row.registrationNumber || row.registration_no || '';
            const exam = row.exam || row.Exam;
            const semester = parseInt(row.semester || row.Semester, 10);
            const academicYear = row.academicYear || row.academic_year || '';
            const section = row.section || row.Section || '';
            const examDate = row.examDate || row.exam_date || '';
            const status = (row.status || 'published').toString().toLowerCase();
            const subjectName = row.subject || row.subjectName || row.Subject;
            const subjectId = row.subjectId || row.subject_id || undefined;
            const marksObtained = Number(row.marksObtained || row.marks || 0);
            const maxMarks = Number(row.maxMarks || row.max || 0);

            if (!exam || !semester || !subjectName) {
                errors.push({ row: rowIndex, reason: 'Missing exam, semester, or subject.' });
                continue;
            }

            let student = null;
            if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
                student = await Student.findById(studentId).lean();
            } else if (registrationNumber) {
                student = await Student.findOne({ registrationNumber }).lean();
            }
            if (!student) {
                errors.push({ row: rowIndex, reason: 'Student not found.' });
                continue;
            }
            if (student.currentSemester && parseInt(student.currentSemester) !== semester) {
                errors.push({ row: rowIndex, reason: `Student is not in Semester ${semester}.` });
                continue;
            }

            const resolvedAcademicYear = academicYear || student.academicYear;
            if (!resolvedAcademicYear) {
                errors.push({ row: rowIndex, reason: 'Academic year missing.' });
                continue;
            }

            const key = `${student._id}-${exam}-${semester}-${resolvedAcademicYear}`;
            if (!grouped.has(key)) {
                grouped.set(key, {
                    student: student._id,
                    exam,
                    semester,
                    academicYear: resolvedAcademicYear,
                    section: section || student.section || 'A',
                    examDate,
                    status: status === 'draft' ? 'draft' : 'published',
                    stream: student.stream,
                    streamId: student.streamId || await resolveStreamId(student.stream),
                    marks: []
                });
            }
            grouped.get(key).marks.push({ subjectName, subjectId, marksObtained, maxMarks });
        }

        const upserts = [];
        for (const entry of grouped.values()) {
            const total = entry.marks.reduce((acc, m) => acc + (Number(m.marksObtained) || 0), 0);
            const maxTotal = entry.marks.reduce((acc, m) => acc + (Number(m.maxMarks) || 0), 0);
            const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
            const grade = getGrade(percentage);

            upserts.push({
                updateOne: {
                    filter: { student: entry.student, exam: entry.exam, semester: entry.semester, academicYear: entry.academicYear },
                    update: {
                        $set: {
                            ...entry,
                            total,
                            percentage: Number(percentage.toFixed(2)),
                            grade,
                            markedBy: req.user._id,
                            markedAt: new Date(),
                            ...(req.user.role === 'Teacher' ? { faculty: req.user.profileId } : {})
                        }
                    },
                    upsert: true
                }
            });
        }

        if (upserts.length > 0) {
            await Marksheet.bulkWrite(upserts);
        }

        res.status(201).json({
            processed: upserts.length,
            errorCount: errors.length,
            errors
        });
    } catch (error) {
        res.status(400).json({ message: 'Marksheet upload failed', error: error.message });
    }
};

const downloadMarksheets = async (req, res) => {
    try {
        const { stream, streamId, semester, section, exam, academicYear, status, format } = req.query;
        const filter = {};
        if (streamId) filter.streamId = streamId;
        if (!streamId && stream && stream !== 'all') filter.stream = stream;
        if (semester && semester !== 'all') filter.semester = parseInt(semester);
        if (section && section !== 'all') filter.section = section;
        if (exam && exam !== 'all') filter.exam = exam;
        if (academicYear && academicYear !== 'all') filter.academicYear = academicYear;
        if (status && status !== 'all') filter.status = status;

        const marksheets = await Marksheet.find(filter)
            .populate('student', 'firstName lastName registrationNumber')
            .lean();

        const rows = marksheets.flatMap(m =>
            m.marks.map(mark => ({
                studentId: m.student?._id,
                studentName: m.student ? `${m.student.firstName} ${m.student.lastName}` : '',
                registrationNumber: m.student?.registrationNumber || '',
                exam: m.exam,
                semester: m.semester,
                academicYear: m.academicYear || '',
                section: m.section || '',
                examDate: m.examDate || '',
                status: m.status,
                subject: mark.subjectName,
                marksObtained: mark.marksObtained,
                maxMarks: mark.maxMarks
            }))
        );

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Marksheets');

        const isCsv = (format || 'csv').toLowerCase() === 'csv';
        if (isCsv) {
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="marksheets.csv"');
            return res.status(200).send(csv);
        }

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="marksheets.xlsx"');
        return res.status(200).send(buffer);
    } catch (error) {
        res.status(500).json({ message: 'Marksheet export failed', error: error.message });
    }
};

export {
    getMarksheet,
    saveMarksheet,
    getMyMarksheets,
    getMarksheetsForStudent,
    getMarksheets,
    updateMarksheet,
    uploadMarksheets,
    downloadMarksheets,
    getMarksheetAnalytics
};