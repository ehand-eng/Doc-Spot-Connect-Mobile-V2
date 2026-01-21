const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    mobileNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster mobile number lookups
userSchema.index({ mobileNumber: 1 });

module.exports = mongoose.model('User', userSchema);
