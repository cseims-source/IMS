import Exam from '../models/examModel.js';
import Student from '../models/studentModel.js';
import Faculty from '../models/facultyModel.js';
import Stream from '../models/streamModel.js';
import { getSemesterDateRange } from '../utils/academicUtils.js';

const resolveStreamId = async (streamName) => {
    if (!streamName) return null;
    const stream = await Stream.findOne({ name: streamName }).select('_id').lean();
    return stream?._id || null;
};

const getExams = async (req, res) => {
    try {
        const { stream, streamId, semester, section, subject, academicYear, status, fromDate, toDate } = req.query;
        const filter = {};

        if (streamId) filter.streamId = streamId;
        if (!streamId && stream && stream !== 'all') filter.stream = stream;
        if (semester && semester !== 'all') filter.semester = parseInt(semester);
        if (section && section !== 'all') filter.section = section;
        if (subject && subject !== 'all') filter.subject = subject;
        if (academicYear && academicYear !== 'all') filter.academicYear = academicYear;
        if (status && status !== 'all') filter.status = status;
        if (fromDate || toDate) {
            filter.startDate = {};
            if (fromDate) filter.startDate.$gte = fromDate;
            if (toDate) filter.startDate.$lte = toDate;
        }

        if (req.user.role === 'Student') {
            const student = await Student.findById(req.user.profileId).lean();
            if (!student) return res.status(404).json({ message: 'Student profile not found.' });
            filter.stream = student.stream;
            filter.semester = student.currentSemester;
            filter.section = student.section || 'A';
            filter.status = { $in: ['scheduled', 'ongoing'] };
            if (student.academicYear) filter.academicYear = student.academicYear;
        }

        if (req.user.role === 'Teacher') {
            const teacher = await Faculty.findById(req.user.profileId);
            const workloadStreams = (teacher?.workload || []).map(w => w.stream).filter(Boolean);
            const assignedStreams = teacher?.assignedStreams || [];
            filter.stream = filter.stream || { $in: [...new Set([...workloadStreams, ...assignedStreams])] };
        }

        const exams = await Exam.find(filter).sort({ startDate: 1 });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch exams.' });
    }
};

const createExam = async (req, res) => {
    try {
        const { name, type, stream, semester, section, subject, subjectId, academicYear, startDate, endDate, status, notes } = req.body;
        if (!name || !stream || !semester || !startDate) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        if (req.user.role === 'Teacher') {
            const teacher = await Faculty.findById(req.user.profileId);
            const canAccess = (teacher?.workload || []).some(w =>
                w.stream === stream &&
                w.semester === parseInt(semester) &&
                (section ? w.section === section : true)
            ) || (teacher?.assignedStreams || []).includes(stream);
            if (!canAccess) {
                return res.status(403).json({ message: 'You are not assigned to this stream/semester/section.' });
            }
        }

        const streamId = await resolveStreamId(stream);
        const created = await Exam.create({
            name,
            type: type || 'custom',
            stream,
            ...(streamId ? { streamId } : {}),
            semester: parseInt(semester),
            section: section || 'A',
            subject: subject || undefined,
            subjectId: subjectId || undefined,
            academicYear,
            startDate,
            endDate,
            status: status || 'scheduled',
            notes: notes || '',
            createdBy: req.user._id,
            createdByFaculty: req.user.role === 'Teacher' ? req.user.profileId : undefined
        });

        res.status(201).json(created);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create exam.', error: error.message });
    }
};

const updateExam = async (req, res) => {
    try {
        const updated = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Exam not found.' });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update exam.' });
    }
};

const deleteExam = async (req, res) => {
    try {
        await Exam.findByIdAndDelete(req.params.id);
        res.json({ message: 'Exam deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete exam.' });
    }
};

const autoScheduleExams = async (req, res) => {
    try {
        const { stream, academicYear, semesters, section, subjects, subjectWise } = req.body;
        if (!stream || !academicYear || !Array.isArray(semesters) || semesters.length === 0) {
            return res.status(400).json({ message: 'Missing scheduling parameters.' });
        }

        const streamId = await resolveStreamId(stream);
        let streamDoc = null;
        if (subjectWise && !Array.isArray(subjects)) {
            streamDoc = await Stream.findOne({ name: stream }).lean();
        }
        const created = [];

        for (const sem of semesters) {
            const range = getSemesterDateRange(academicYear, sem);
            if (!range) continue;
            const midPoint = new Date(range.start.getTime() + (range.end.getTime() - range.start.getTime()) / 2);
            const finalDate = new Date(range.end.getTime() - 7 * 24 * 60 * 60 * 1000);

            const basePayload = {
                stream,
                ...(streamId ? { streamId } : {}),
                semester: parseInt(sem),
                section: section || 'A',
                academicYear,
                createdBy: req.user._id,
                createdByFaculty: req.user.role === 'Teacher' ? req.user.profileId : undefined
            };

            let targets = Array.isArray(subjects) && subjects.length > 0 ? subjects : [null];
            if (subjectWise && streamDoc) {
                const semesterNode = (streamDoc.semesters || []).find(s => s.semesterNumber === parseInt(sem));
                targets = (semesterNode?.subjects || []).map(s => ({ name: s.name, id: s._id })) || [null];
                if (targets.length === 0) targets = [null];
            }
            for (const subj of targets) {
                const subjectName = subj?.name;
                const subjectId = subj?.id;
                const unitTest1Date = new Date(range.start.getTime() + (range.end.getTime() - range.start.getTime()) * 0.25);
                const unitTest2Date = new Date(range.start.getTime() + (range.end.getTime() - range.start.getTime()) * 0.75);
                const surpriseDate = new Date(range.start.getTime() + (range.end.getTime() - range.start.getTime()) * 0.33);

                const midExam = await Exam.findOneAndUpdate(
                    { name: `${stream} Sem ${sem} Mid-Term`, stream, semester: parseInt(sem), section: basePayload.section, academicYear, ...(subjectName ? { subject: subjectName } : {}) },
                    {
                        $set: {
                            ...basePayload,
                            name: `${stream} Sem ${sem} Mid-Term`,
                            type: 'mid-term',
                            subject: subjectName,
                            subjectId: subjectId,
                            startDate: midPoint.toISOString().split('T')[0],
                            endDate: midPoint.toISOString().split('T')[0],
                            status: 'scheduled'
                        }
                    },
                    { upsert: true, new: true }
                );
                created.push(midExam);

                const finalExam = await Exam.findOneAndUpdate(
                    { name: `${stream} Sem ${sem} Final`, stream, semester: parseInt(sem), section: basePayload.section, academicYear, ...(subjectName ? { subject: subjectName } : {}) },
                    {
                        $set: {
                            ...basePayload,
                            name: `${stream} Sem ${sem} Final`,
                            type: 'final',
                            subject: subjectName,
                            subjectId: subjectId,
                            startDate: finalDate.toISOString().split('T')[0],
                            endDate: range.end.toISOString().split('T')[0],
                            status: 'scheduled'
                        }
                    },
                    { upsert: true, new: true }
                );
                created.push(finalExam);

                if (subjectName) {
                    const unitTest1 = await Exam.findOneAndUpdate(
                        { name: `${stream} Sem ${sem} Unit Test 1`, stream, semester: parseInt(sem), section: basePayload.section, academicYear, subject: subjectName },
                        {
                            $set: {
                                ...basePayload,
                                name: `${stream} Sem ${sem} Unit Test 1`,
                                type: 'unit-test',
                                subject: subjectName,
                                subjectId: subjectId,
                                startDate: unitTest1Date.toISOString().split('T')[0],
                                endDate: unitTest1Date.toISOString().split('T')[0],
                                status: 'scheduled'
                            }
                        },
                        { upsert: true, new: true }
                    );
                    created.push(unitTest1);

                    const unitTest2 = await Exam.findOneAndUpdate(
                        { name: `${stream} Sem ${sem} Unit Test 2`, stream, semester: parseInt(sem), section: basePayload.section, academicYear, subject: subjectName },
                        {
                            $set: {
                                ...basePayload,
                                name: `${stream} Sem ${sem} Unit Test 2`,
                                type: 'unit-test',
                                subject: subjectName,
                                subjectId: subjectId,
                                startDate: unitTest2Date.toISOString().split('T')[0],
                                endDate: unitTest2Date.toISOString().split('T')[0],
                                status: 'scheduled'
                            }
                        },
                        { upsert: true, new: true }
                    );
                    created.push(unitTest2);

                    const surprise = await Exam.findOneAndUpdate(
                        { name: `${stream} Sem ${sem} Surprise Test`, stream, semester: parseInt(sem), section: basePayload.section, academicYear, subject: subjectName },
                        {
                            $set: {
                                ...basePayload,
                                name: `${stream} Sem ${sem} Surprise Test`,
                                type: 'surprise',
                                subject: subjectName,
                                subjectId: subjectId,
                                startDate: surpriseDate.toISOString().split('T')[0],
                                endDate: surpriseDate.toISOString().split('T')[0],
                                status: 'scheduled'
                            }
                        },
                        { upsert: true, new: true }
                    );
                    created.push(surprise);
                }
            }
        }

        res.status(201).json({ createdCount: created.length, exams: created });
    } catch (error) {
        res.status(500).json({ message: 'Auto scheduling failed.', error: error.message });
    }
};

export { getExams, createExam, updateExam, deleteExam, autoScheduleExams };
