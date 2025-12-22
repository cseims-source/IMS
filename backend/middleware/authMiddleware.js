import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Faculty from '../models/facultyModel.js';
import Student from '../models/studentModel.js';

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                // This handles the case where the user for the token has been deleted.
                return res.status(401).json({ message: 'Not authorized, user for this token no longer exists' });
            }

            next();
        } catch (error) {
            console.error(error);
            // Even if token is invalid, we don't want to proceed.
            // So we send a response and don't call next().
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

const teacherOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'Admin' || req.user.role === 'Teacher')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a teacher or admin' });
    }
}

const checkStreamAssignment = async (req, res, next) => {
    // Admins can do anything
    if (req.user.role === 'Admin') {
        return next();
    }
    
    // Teachers need to be checked
    if (req.user.role === 'Teacher') {
        const streamName = req.params.streamName || req.body.streamName;

        if (!streamName) {
            return res.status(400).json({ message: 'Stream name not provided.' });
        }

        try {
            const teacher = await Faculty.findById(req.user.profileId);
            if (teacher && teacher.assignedStreams.includes(streamName)) {
                return next();
            } else {
                return res.status(403).json({ message: 'You are not assigned to this stream.' });
            }
        } catch (error) {
             return res.status(500).json({ message: 'Server error while checking stream assignment.' });
        }
    }
    
    res.status(403).json({ message: 'Access denied.' });
};

const canViewStudentProfile = async (req, res, next) => {
    const studentId = req.params.id || req.params.studentId;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: 'Invalid student ID' });
    }

    // Admin can view any profile
    if (req.user.role === 'Admin') {
        return next();
    }

    // A student can only view their own profile
    if (req.user.role === 'Student') {
        if (req.user.profileId && req.user.profileId.toString() === studentId) {
            return next();
        } else {
            return res.status(403).json({ message: 'You can only view your own profile.' });
        }
    }
    
    // A teacher can only view profiles of students in their assigned streams
    if (req.user.role === 'Teacher') {
        try {
            const teacher = await Faculty.findById(req.user.profileId);
            const student = await Student.findById(studentId);

            if (!teacher || !student) {
                 return res.status(404).json({ message: 'Teacher or student not found.' });
            }

            if (teacher.assignedStreams.includes(student.stream)) {
                return next();
            } else {
                return res.status(403).json({ message: 'You are not authorized to view this student\'s profile.' });
            }
        } catch (error) {
             return res.status(500).json({ message: 'Server error while checking permissions.' });
        }
    }
    
    return res.status(403).json({ message: 'Access denied.' });
};


export { protect, admin, teacherOrAdmin, checkStreamAssignment, canViewStudentProfile };