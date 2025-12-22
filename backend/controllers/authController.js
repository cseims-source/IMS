import User from '../models/userModel.js';
import Student from '../models/studentModel.js';
import Faculty from '../models/facultyModel.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found with this email.' });
        }
        
        if (user.role !== role) {
             return res.status(401).json({ message: `This email is not registered as a ${role}.` });
        }

        if (!(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid password.' });
        }

        if (user.status === 'pending') {
            return res.status(403).json({ message: 'Your account is pending approval from an administrator.' });
        }
        
        if (user.status === 'active') {
            res.json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token: generateToken(user._id),
            });
        } else {
             res.status(401).json({ message: 'Invalid user status.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        }
        
        let profile;
        if (role === 'Student') {
            // A basic student profile is created, can be filled out later by admin
            const [firstName, ...lastNameParts] = name.split(' ');
            profile = await Student.create({
                firstName,
                lastName: lastNameParts.join(' '),
                email
            });
        } else if (role === 'Teacher') {
             // A basic faculty profile is created
            profile = await Faculty.create({
                name,
                email,
                subject: 'Not Assigned' // Default value
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            profileId: profile ? profile._id : null,
            status: (role === 'Admin') ? 'active' : 'pending'
        });

        if (user) {
             res.status(201).json({
                message: "Registration successful. Your account is pending approval."
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found with this email.' });
        }
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // In a real app, you'd email this link. For this project, we'll log it.
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
        console.log('--- PASSWORD RESET LINK ---');
        console.log(resetUrl);
        console.log('---------------------------');
        
        res.status(200).json({ success: true, message: 'Password reset link has been logged to the console.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        
        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


export { authUser, registerUser, forgotPassword, resetPassword };
