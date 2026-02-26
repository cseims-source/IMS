import Stream from '../models/streamModel.js';
import mongoose from 'mongoose';
import XLSX from 'xlsx';

// --- Stream Controllers ---
const getStreams = async (req, res) => {
    try {
        const streams = await Stream.find({}).sort({ name: 1 });
        res.json(streams);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getStreamByName = async (req, res) => {
    try {
        const stream = await Stream.findOne({ name: req.params.name });
        if (stream) {
            res.json(stream);
        } else {
            res.status(404).json({ message: 'Stream not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const addStream = async (req, res) => {
    try {
        const { name, level, durationYears, description } = req.body;
        
        // Calculate semesters: 1 year = 2 semesters
        const totalSemesters = parseInt(durationYears) * 2;
        const semesters = [];
        for (let i = 1; i <= totalSemesters; i++) {
            semesters.push({ semesterNumber: i, subjects: [] });
        }

        const stream = new Stream({ 
            name, 
            level, 
            duration: `${durationYears} Years`, 
            description, 
            semesters 
        });
        
        const createdStream = await stream.save();
        res.status(201).json(createdStream);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
};

const exportStreams = async (req, res) => {
    try {
        const streams = await Stream.find({}).lean();
        const rows = streams.map(s => ({
            name: s.name,
            level: s.level,
            duration: s.duration,
            description: s.description,
            semesters: s.semesters?.length || 0,
            subjects: s.semesters?.flatMap(sem => sem.subjects.map(sub => `${sem.semesterNumber}:${sub.code || ''}-${sub.name}`)).join('; ')
        }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="streams.csv"');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Export failed.' });
    }
};

const updateStream = async (req, res) => {
    try {
        const { name, level, duration, description } = req.body;
        const stream = await Stream.findById(req.params.id);
        if (stream) {
            stream.name = name;
            stream.level = level;
            stream.duration = duration;
            stream.description = description;
            const updatedStream = await stream.save();
            res.json(updatedStream);
        } else {
            res.status(404).json({ message: 'Stream not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

const deleteStream = async (req, res) => {
    try {
        const stream = await Stream.findById(req.params.id);
        if (stream) {
            await stream.deleteOne();
            res.json({ message: 'Stream removed' });
        } else {
            res.status(404).json({ message: 'Stream not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- Semester Controllers ---
const addSemester = async (req, res) => {
    try {
        const stream = await Stream.findById(req.params.streamId);
        if (stream) {
            const existingSemesters = stream.semesters.map(s => s.semesterNumber);
            const nextSemester = existingSemesters.length > 0 ? Math.max(...existingSemesters) + 1 : 1;
            
            stream.semesters.push({ semesterNumber: nextSemester, subjects: [] });
            await stream.save();
            res.status(201).json(stream);
        } else {
            res.status(404).json({ message: 'Stream not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Could not add semester' });
    }
};

const deleteSemester = async (req, res) => {
    try {
        const stream = await Stream.findById(req.params.streamId);
        if (stream) {
            const semester = stream.semesters.id(req.params.semesterId);
            if (semester) {
                semester.deleteOne();
                await stream.save();
                res.json(stream);
            } else {
                res.status(404).json({ message: 'Semester not found' });
            }
        } else {
            res.status(404).json({ message: 'Stream not found' });
        }
    } catch(error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Subject Controllers ---
const addSubject = async (req, res) => {
    try {
        const stream = await Stream.findById(req.params.streamId);
        if (stream) {
            const semester = stream.semesters.id(req.params.semesterId);
            if (semester) {
                const subject = { name: req.body.name, code: req.body.code, credits: req.body.credits };
                semester.subjects.push(subject);
                await stream.save();
                res.status(201).json(stream);
            } else {
                res.status(404).json({ message: 'Semester not found' });
            }
        } else {
            res.status(404).json({ message: 'Stream not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

const updateSubject = async (req, res) => {
    try {
        const stream = await Stream.findById(req.params.streamId);
        if (stream) {
            const semester = stream.semesters.id(req.params.semesterId);
            if(semester) {
                const subject = semester.subjects.id(req.params.subjectId);
                if (subject) {
                    subject.name = req.body.name || subject.name;
                    subject.code = req.body.code || subject.code;
                    subject.credits = req.body.credits || subject.credits;
                    await stream.save();
                    res.json(stream);
                } else {
                    res.status(404).json({ message: 'Subject not found' });
                }
            } else {
                 res.status(404).json({ message: 'Semester not found' });
            }
        } else {
            res.status(404).json({ message: 'Stream not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

const deleteSubject = async (req, res) => {
    try {
        const stream = await Stream.findById(req.params.streamId);
        if (stream) {
            const semester = stream.semesters.id(req.params.semesterId);
            if (semester) {
                const subject = semester.subjects.id(req.params.subjectId);
                if (subject) {
                    subject.deleteOne();
                    await stream.save();
                    res.json(stream);
                } else {
                     res.status(404).json({ message: 'Subject not found' });
                }
            } else {
                res.status(404).json({ message: 'Semester not found' });
            }
        } else {
            res.status(404).json({ message: 'Stream not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAllSubjects = async (req, res) => {
    try {
        const streams = await Stream.find({});
        const allSubjects = streams.flatMap(stream => 
            stream.semesters.flatMap(semester => 
                semester.subjects.map(s => ({ name: s.name, code: s.code }))
            )
        );
        
        // Deduplicate subjects based on name to ensure a unique list for selection.
        const uniqueSubjectsMap = new Map();
        allSubjects.forEach(subject => {
            if (!uniqueSubjectsMap.has(subject.name)) {
                uniqueSubjectsMap.set(subject.name, subject);
            }
        });
        
        const uniqueSubjects = Array.from(uniqueSubjectsMap.values());
        res.json(uniqueSubjects);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getSubjectsForSemester = async (req, res) => {
    try {
        const stream = await Stream.findOne({ name: req.params.streamName });
        if (stream) {
            const semester = stream.semesters.find(s => s.semesterNumber == req.params.semester);
            if (semester) {
                res.json(semester.subjects);
            } else {
                // Return empty array if semester not found, it's not an error state
                res.json([]);
            }
        } else {
            res.status(404).json({ message: 'Stream not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const importStreams = async (req, res) => {
    try {
        if (!req.file?.buffer) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const inserts = [];
        const errors = [];

        rows.forEach((row, index) => {
            const name = row.name || row.Name;
            const level = row.level || row.Level;
            const durationYears = row.duration || row.Duration || 4;
            const description = row.description || row.Description || '';

            if (!name) {
                errors.push({ row: index + 2, reason: 'Stream name is required.' });
                return;
            }

            const totalSemesters = parseInt(durationYears) * 2;
            const semesters = [];
            for (let i = 1; i <= totalSemesters; i++) {
                semesters.push({ semesterNumber: i, subjects: [] });
            }

            inserts.push({ name, level, duration: `${durationYears} Years`, description, semesters });
        });

        if (inserts.length > 0) {
            await Stream.insertMany(inserts, { ordered: false });
        }
        res.status(201).json({ imported: inserts.length, errorCount: errors.length, errors });
    } catch (error) {
        res.status(400).json({ message: 'Import failed.', error: error.message });
    }
};

export { 
    getStreams, getStreamByName, addStream, updateStream, deleteStream, 
    addSemester, deleteSemester,
    addSubject, updateSubject, deleteSubject, getAllSubjects, getSubjectsForSemester,
    exportStreams, importStreams
};