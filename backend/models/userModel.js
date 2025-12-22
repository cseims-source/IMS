
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['Admin', 'Teacher', 'Student']
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'pending'],
        default: 'pending'
    },
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true
});

// Method to compare entered password with the hashed password in the DB
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving a user
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    
    // Hash the password
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    return resetToken;
};

// Set Admin users to 'active' by default on creation
userSchema.pre('save', function(next) {
    if (this.isNew && this.role === 'Admin') {
        this.status = 'active';
    }
    next();
});

const User = mongoose.model('User', userSchema);
export default User;