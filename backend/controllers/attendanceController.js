import Attendance from '../models/attendanceModel.js';
import Student from '../models/studentModel.js';
import Faculty from '../models/facultyModel.js';
import Stream from '../models/streamModel.js';
import mongoose from 'mongoose';
import XLSX from 'xlsx';
import { isDateWithinSemester } from '../utils/academicUtils.js';
import { calculateAttendancePercentage, isPresentLikeStatus } from '../utils/attendanceUtils.js';

const ensureTeacherScope = async ({ user, streamName, semester, section, subject }) => {
    if (user.role !== 'Teacher') return { ok: true };
    const faculty = await Faculty.findById(user.profileId);
    if (!faculty) return { ok: false, message: 'Faculty profile not found.' };
    const isAssigned = faculty.workload.some(work => 
        work.stream === streamName &&
        work.semester === parseInt(semester) &&
        work.section === section &&
        work.subject === subject
    );
    if (!isAssigned) {
        return { ok: false, message: `Access Denied: You are not assigned to Section ${section} for ${subject}.` };
    }
    return { ok: true };
};

// @desc    Get daily records for a specific stream/date/subject/section
// @route   GET /api/attendance/:streamName/:date
const getAttendance = async (req, res) => {
    try {
        const { streamName, date } = req.params;
        const { subject, subjectId, semester, section, academicYear } = req.query;
        if (req.user.role === 'Teacher') {
            if (!subject || !semester || !section) {
                return res.status(400).json({ message: 'Subject, semester, and section are required.' });
            }
            const scope = await ensureTeacherScope({
                user: req.user,
                streamName,
                semester,
                section,
                subject
            });
            if (!scope.ok) return res.status(403).json({ message: scope.message });
        }


        const streamDoc = await Stream.findOne({ name: streamName }).select('_id').lean();
        const streamId = streamDoc?._id || null;
        let query = streamId ? { streamId, date } : { stream: streamName, date: date };
        if (subject) query.subject = subject;
        if (subjectId) query.subjectId = subjectId;
        if (semester) query.semester = parseInt(semester);
        if (section) query.section = section;
        if (academicYear) query.academicYear = academicYear;

        const attendanceRecords = await Attendance.find(query).populate('student', 'firstName lastName');
        res.json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Server Error during registry fetch' });
    }
};

const getMyAttendance = async (req, res) => {
    try {
        if (req.user.role !== 'Student') {
            return res.status(403).json({ message: 'Access Restricted to Student Nodes.' });
        }
        const attendanceRecords = await Attendance.find({ student: req.user.profileId }).sort({ date: -1 });
        res.json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Internal Registry Error' });
    }
};

const getStudentAttendanceSummary = async (req, res) => {
    try {
        const { studentId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: 'Invalid ID sequence' });
        }

        const summary = await Attendance.aggregate([
            { $match: { student: new mongoose.Types.ObjectId(studentId) } },
            {
                $group: {
                    _id: "$subject",
                    total: { $sum: 1 },
                    present: { $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] } }
                }
            },
            {
                $project: {
                    subject: "$_id",
                    percentage: { 
                        $round: [
                            { $multiply: [{ $divide: ["$present", "$total"] }, 100] },
                            1
                        ]
                    },
                    total: 1,
                    present: 1
                }
            },
            { $sort: { subject: 1 } }
        ]);
        
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Dossier aggregation failed' });
    }
};

// @desc    Commit attendance sequence (Bulk Write)
// @route   POST /api/attendance
const saveAttendance = async (req, res) => {
    try {
        const { date, streamName, semester, section, subject, subjectId, academicYear, attendanceData } = req.body;
        
        if (!subject || !semester || !streamName || !section) {
            return res.status(400).json({ message: 'Incomplete sequence headers: stream, semester, section, and subject required.' });
        }

        // Faculty workload validation
        const scope = await ensureTeacherScope({ user: req.user, streamName, semester, section, subject });
        if (!scope.ok) return res.status(403).json({ message: scope.message });

        const streamDoc = await Stream.findOne({ name: streamName }).select('_id').lean();
        const streamId = streamDoc?._id || null;
        const markedAt = new Date();
        const facultyId = req.user.role === 'Teacher' ? req.user.profileId : undefined;

        const studentIds = Object.keys(attendanceData || {});
        const students = await Student.find({ _id: { $in: studentIds } })
            .select('_id academicYear currentSemester')
            .lean();
        const studentMap = new Map(students.map(s => [s._id.toString(), s]));

        const mismatched = students.filter(s => parseInt(s.currentSemester) !== parseInt(semester));
        if (mismatched.length > 0) {
            return res.status(400).json({
                message: `Some students are not in Semester ${semester}. Update their current semester before marking attendance.`,
                count: mismatched.length
            });
        }

        const operations = Object.keys(attendanceData).map(studentId => {
            const status = attendanceData[studentId];
            if (!status) return null; 
            
            const studentInfo = studentMap.get(studentId);
            const resolvedAcademicYear = studentInfo?.academicYear || academicYear;
            if (!resolvedAcademicYear) return null;

            return {
                updateOne: {
                    filter: { student: studentId, date: date, subject: subject, section: section },
                    update: { 
                        $set: { 
                            student: studentId, 
                            date: date, 
                            stream: streamName, 
                            ...(streamId ? { streamId } : {}),
                            academicYear: resolvedAcademicYear,
                            semester: parseInt(semester),
                            section: section,
                            subject: subject,
                            ...(subjectId ? { subjectId } : {}),
                            status: status,
                            markedBy: req.user._id,
                            markedAt,
                            ...(facultyId ? { faculty: facultyId } : {})
                        }
                    },
                    upsert: true
                }
            };
        }).filter(Boolean);

        if (operations.length === 0) {
            return res.status(400).json({ message: 'No valid attendance records to save. Check student academic year and semester.' });
        }

        await Attendance.bulkWrite(operations);
        
        res.status(201).json({ message: 'Registry updated successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Registry commit failed', error: error.message });
    }
};

const getAttendanceAnalytics = async (req, res) => {
    try {
        const { stream, streamId, semester, section, subject, academicYear } = req.query;

        let matchStage = {};
        if (streamId) matchStage.streamId = streamId;
        if (!streamId && stream && stream !== 'all') matchStage.stream = stream;
        if (semester && semester !== 'all') matchStage.semester = parseInt(semester);
        if (section && section !== 'all') matchStage.section = section;
        if (subject && subject !== 'all') matchStage.subject = subject;
        if (academicYear && academicYear !== 'all') matchStage.academicYear = academicYear;

        if (req.user.role === 'Teacher') {
            const scope = await ensureTeacherScope({
                user: req.user,
                streamName: stream,
                semester,
                section,
                subject
            });
            if (!scope.ok) return res.status(403).json({ message: scope.message });
        }

        const studentStats = await Attendance.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$student",
                    total: { $sum: 1 },
                    present: { $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] } }
                }
            },
            {
                $lookup: {
                    from: "students",
                    localField: "_id",
                    foreignField: "_id",
                    as: "info"
                }
            },
            { $unwind: "$info" },
            {
                $project: {
                    name: { $concat: ["$info.firstName", " ", "$info.lastName"] },
                    roll: "$info._id",
                    registrationNumber: "$info.registrationNumber",
                    percentage: { $multiply: [{ $divide: ["$present", "$total"] }, 100] },
                    total: 1,
                    present: 1
                }
            },
            { $sort: { percentage: 1 } }
        ]);

        const subjectStats = await Attendance.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$subject",
                    total: { $sum: 1 },
                    present: { $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] } }
                }
            },
            {
                $project: {
                    subject: "$_id",
                    percentage: { $round: [{ $multiply: [{ $divide: ["$present", "$total"] }, 100] }, 1] },
                    total: 1,
                    present: 1
                }
            }
        ]);

        const monthlyStats = await Attendance.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: { $substr: ["$date", 0, 7] },
                    total: { $sum: 1 },
                    present: { $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] } }
                }
            },
            {
                $project: {
                    month: "$_id",
                    percentage: { $round: [{ $multiply: [{ $divide: ["$present", "$total"] }, 100] }, 1] },
                    total: 1,
                    present: 1,
                    _id: 0
                }
            },
            { $sort: { month: 1 } }
        ]);

        const facultyStats = await Attendance.aggregate([
            { $match: matchStage },
            { $group: { _id: "$faculty", total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] } } } },
            { $lookup: { from: "faculties", localField: "_id", foreignField: "_id", as: "info" } },
            { $unwind: { path: "$info", preserveNullAndEmptyArrays: true } },
            { $project: { facultyId: "$_id", facultyName: "$info.name", percentage: { $round: [{ $multiply: [{ $divide: ["$present", "$total"] }, 100] }, 1] }, total: 1, present: 1, _id: 0 } },
            { $sort: { facultyName: 1 } }
        ]);

        const studentQuery = {};
        if (streamId) studentQuery.streamId = streamId;
        if (!streamId && stream && stream !== 'all') studentQuery.stream = stream;
        if (section && section !== 'all') studentQuery.section = section;
        const totalStudents = await Student.countDocuments(studentQuery);

        const defaulters = studentStats.filter(s => s.percentage < 75).length;
        const avgAttendance = studentStats.length > 0 
            ? Math.round((studentStats.reduce((acc, s) => acc + s.percentage, 0) / studentStats.length) * 10) / 10
            : 0;

        res.json({ 
            studentStats, 
            subjectStats,
            monthlyStats,
            facultyStats,
            summary: {
                totalEnrolled: totalStudents,
                avgAttendance,
                defaulters
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Matrix analysis failure' });
    }
};

const updateAttendanceRecord = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid attendance ID.' });
        }
        const update = {
            ...req.body,
            markedBy: req.user._id,
            markedAt: new Date()
        };
        const updated = await Attendance.findByIdAndUpdate(id, update, { new: true });
        if (!updated) return res.status(404).json({ message: 'Attendance record not found.' });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: 'Attendance update failed', error: error.message });
    }
};

const uploadAttendance = async (req, res) => {
    try {
        if (!req.file?.buffer) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const errors = [];
        const inserts = [];
        const seen = new Set();
        const streamIdCache = new Map();

        for (const [index, row] of rows.entries()) {
            const rowIndex = index + 2;
            const studentId = row.studentId || row.student || row.student_id || '';
            const registrationNumber = row.registrationNumber || row.registration_no || '';
            const date = row.date || row.Date;
            const streamName = row.stream || row.streamName || row.Stream;
            const academicYear = row.academicYear || row.academic_year || '';
            const semester = parseInt(row.semester || row.Semester, 10);
            const section = row.section || row.Section || 'A';
            const subject = row.subject || row.Subject;
            const subjectId = row.subjectId || row.subject_id || undefined;
            const statusRaw = (row.status || row.Status || '').toString().toLowerCase();
            const status = ['present', 'absent', 'late'].includes(statusRaw) ? statusRaw : null;

            if (!date || !streamName || !semester || !section || !subject || !status) {
                errors.push({ row: rowIndex, reason: 'Missing required fields.' });
                continue;
            }

            if (req.user.role === 'Teacher') {
                const scope = await ensureTeacherScope({ user: req.user, streamName, semester, section, subject });
                if (!scope.ok) {
                    errors.push({ row: rowIndex, reason: scope.message });
                    continue;
                }
            }

            let student = null;
            if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
                student = await Student.findById(studentId).select('_id');
            } else if (registrationNumber) {
                student = await Student.findOne({ registrationNumber }).select('_id');
            }
            if (!student) {
                errors.push({ row: rowIndex, reason: 'Student not found.' });
                continue;
            }

            if (student.currentSemester && parseInt(student.currentSemester) !== parseInt(semester)) {
                errors.push({ row: rowIndex, reason: `Student is not in Semester ${semester}.` });
                continue;
            }

            const key = `${student._id}-${date}-${subject}-${section}`;
            if (seen.has(key)) {
                errors.push({ row: rowIndex, reason: 'Duplicate row in upload.' });
                continue;
            }
            seen.add(key);

            let streamId = streamIdCache.get(streamName);
            if (!streamIdCache.has(streamName)) {
                const streamDoc = await Stream.findOne({ name: streamName }).select('_id').lean();
                streamId = streamDoc?._id || null;
                streamIdCache.set(streamName, streamId);
            }

            const resolvedAcademicYear = academicYear || student.academicYear;
            if (!resolvedAcademicYear) {
                errors.push({ row: rowIndex, reason: 'Academic year missing for student.' });
                continue;
            }

            inserts.push({
                student: student._id,
                date,
                stream: streamName,
                ...(streamId ? { streamId } : {}),
                academicYear: resolvedAcademicYear,
                semester,
                section,
                subject,
                ...(subjectId ? { subjectId } : {}),
                status,
                markedBy: req.user._id,
                markedAt: new Date(),
                ...(req.user.role === 'Teacher' ? { faculty: req.user.profileId } : {})
            });
        }

        if (inserts.length === 0) {
            return res.status(201).json({
                insertedCount: 0,
                skippedDuplicates: 0,
                errorCount: errors.length,
                errors
            });
        }

        const existing = await Attendance.find({
            $or: inserts.map(i => ({ student: i.student, date: i.date, subject: i.subject, section: i.section }))
        }).select('student date subject section');

        const existingKeys = new Set(existing.map(i => `${i.student}-${i.date}-${i.subject}-${i.section}`));
        const finalInserts = inserts.filter(i => !existingKeys.has(`${i.student}-${i.date}-${i.subject}-${i.section}`));
        const skipped = inserts.length - finalInserts.length;

        if (finalInserts.length > 0) {
            await Attendance.insertMany(finalInserts, { ordered: false });
        }

        res.status(201).json({
            insertedCount: finalInserts.length,
            skippedDuplicates: skipped,
            errorCount: errors.length,
            errors
        });
    } catch (error) {
        res.status(400).json({ message: 'Attendance upload failed', error: error.message });
    }
};

const downloadAttendance = async (req, res) => {
    try {
        const { stream, streamId, academicYear, semester, section, subject, startDate, endDate, format } = req.query;
        const match = {};
        if (streamId) match.streamId = streamId;
        if (!streamId && stream && stream !== 'all') match.stream = stream;
        if (academicYear && academicYear !== 'all') match.academicYear = academicYear;
        if (semester && semester !== 'all') match.semester = parseInt(semester);
        if (section && section !== 'all') match.section = section;
        if (subject && subject !== 'all') match.subject = subject;
        if (startDate || endDate) {
            match.date = {};
            if (startDate) match.date.$gte = startDate;
            if (endDate) match.date.$lte = endDate;
        }

        const records = await Attendance.find(match)
            .populate('student', 'firstName lastName registrationNumber')
            .populate('faculty', 'name')
            .lean();

        const rows = records.map(r => ({
            studentId: r.student?._id,
            studentName: r.student ? `${r.student.firstName} ${r.student.lastName}` : '',
            registrationNumber: r.student?.registrationNumber || '',
            facultyId: r.faculty?._id || '',
            facultyName: r.faculty?.name || '',
            date: r.date,
            stream: r.stream,
            academicYear: r.academicYear,
            semester: r.semester,
            section: r.section,
            subject: r.subject,
            status: r.status,
            markedAt: r.markedAt ? new Date(r.markedAt).toISOString() : ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

        const isCsv = (format || 'csv').toLowerCase() === 'csv';
        if (isCsv) {
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="attendance.csv"');
            return res.status(200).send(csv);
        }

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="attendance.xlsx"');
        return res.status(200).send(buffer);
    } catch (error) {
        res.status(500).json({ message: 'Attendance export failed', error: error.message });
    }
};

export { 
    getAttendance, 
    saveAttendance, 
    getMyAttendance, 
    getAttendanceAnalytics, 
    getStudentAttendanceSummary,
    updateAttendanceRecord,
    uploadAttendance,
    downloadAttendance
};