const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password by default
    },
    role: {
        type: String,
        enum: ['User', 'SuperAdmin'],
        default: 'User'
    },
    avatar: {
        type: String,
        default: 'https://ui-avatars.com/api/?background=3b82f6&color=fff&name='
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot be more than 500 characters'],
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Hash password before saving
// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Set default avatar with user's name
UserSchema.pre('save', async function () {
    if (this.isNew && this.avatar === 'https://ui-avatars.com/api/?background=3b82f6&color=fff&name=') {
        this.avatar = `https://ui-avatars.com/api/?background=3b82f6&color=fff&name=${encodeURIComponent(this.name)}`;
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        { id: this._id, email: this.email, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Removed duplicate index creation since unique: true on email field handles it

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
