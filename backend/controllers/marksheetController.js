import Marksheet from '../models/marksheetModel.js';
import Student from '../models/studentModel.js';
import Faculty from '../models/facultyModel.js';

const getMarksheet = async (req, res) => {
    try {
        const { studentId, exam, semester } = req.params;

        if (req.user.role === 'Student' && req.user.profileId.toString() !== studentId) {
            return res.status(403).json({ message: "You are not authorized to view this marksheet." });
        }

        const marksheet = await Marksheet.findOne({ student: studentId, exam, semester });
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
        const marksheets = await Marksheet.find({ student: req.user.profileId }).sort({ createdAt: 1 });
        res.json(marksheets);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching your marksheets.' });
    }
};

const getMarksheetsForStudent = async (req, res) => {
    try {
        const marksheets = await Marksheet.find({ student: req.params.studentId }).sort({ createdAt: 1 });
        res.json(marksheets);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching marksheets.' });
    }
};

const saveMarksheet = async (req, res) => {
    try {
        const { student, exam, semester, marks, total, percentage, grade } = req.body;

        const studentData = await Student.findById(student);
        if(!studentData) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        if (req.user.role === 'Teacher') {
            const teacher = await Faculty.findById(req.user.profileId);
            if (!teacher.assignedStreams.includes(studentData.stream)) {
                return res.status(403).json({ message: "You cannot enter marks for a student in a stream you are not assigned to." });
            }
        }

        const marksheetData = {
            student,
            exam,
            stream: studentData.stream,
            semester,
            marks,
            total,
            percentage,
            grade
        };

        const updatedMarksheet = await Marksheet.findOneAndUpdate(
            { student: student, exam: exam, semester: semester },
            marksheetData,
            { new: true, upsert: true }
        );

        res.status(201).json(updatedMarksheet);
    } catch (error) {
        res.status(400).json({ message: 'Failed to save marksheet' });
    }
};

export { getMarksheet, saveMarksheet, getMyMarksheets, getMarksheetsForStudent };