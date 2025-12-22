import Stream from '../models/streamModel.js';
import mongoose from 'mongoose';

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

export { 
    getStreams, getStreamByName, addStream, updateStream, deleteStream, 
    addSemester, deleteSemester,
    addSubject, updateSubject, deleteSubject, getAllSubjects, getSubjectsForSemester
};