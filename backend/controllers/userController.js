
import User from '../models/userModel.js';
import Student from '../models/studentModel.js';
import Faculty from '../models/facultyModel.js';

// @desc    Get all users with 'pending' status
// @route   GET /api/users/pending
// @access  Admin
const getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Approve a user's registration
// @route   PUT /api/users/:id/approve
// @access  Admin
const approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (req.body?.role && req.body.role !== user.role) {
                await updateUserRoleInternal(user, req.body.role);
            }
            user.status = 'active';
            await user.save();
            res.json({ message: 'User approved successfully.' });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Deny and delete a user's registration
// @route   DELETE /api/users/:id/deny
// @access  Admin
const denyUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Also delete the associated profile if it exists
        if (user.profileId) {
            if (user.role === 'Student') {
                await Student.findByIdAndDelete(user.profileId);
            } else if (user.role === 'Teacher') {
                await Faculty.findByIdAndDelete(user.profileId);
            }
        }

        await user.deleteOne();
        res.json({ message: 'User denied and deleted successfully.' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Change user password
// @route   PUT /api/users/profile/password
// @access  Private
const changeUserPassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { oldPassword, newPassword } = req.body;

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (await user.matchPassword(oldPassword)) {
            user.password = newPassword;
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Invalid old password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const updateUserRoleInternal = async (user, newRole) => {
    const role = newRole;
    if (!['Admin', 'Teacher', 'Student'].includes(role)) {
        throw new Error('Invalid role');
    }
    if (user.status !== 'pending') {
        throw new Error('Role update only allowed for pending users.');
    }

    // If role changes, rebuild profile
    if (user.profileId) {
        if (user.role === 'Student') {
            await Student.findByIdAndDelete(user.profileId);
        } else if (user.role === 'Teacher') {
            await Faculty.findByIdAndDelete(user.profileId);
        }
    }

    let profileId = null;
    if (role === 'Student') {
        const nameParts = user.name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        const profile = await Student.create({ firstName, lastName, email: user.email });
        profileId = profile._id;
    } else if (role === 'Teacher') {
        const profile = await Faculty.create({ name: user.name, email: user.email, subject: 'Not Assigned' });
        profileId = profile._id;
    }

    user.role = role;
    user.profileId = profileId;
};

const updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        await updateUserRoleInternal(user, req.body.role);
        await user.save();
        res.json({ message: 'User role updated.' });
    } catch (error) {
        res.status(400).json({ message: error.message || 'Role update failed.' });
    }
};


export { getPendingUsers, approveUser, denyUser, changeUserPassword, updateUserRole };
