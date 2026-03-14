const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    githubId: {
        type: String,
        unique: true,
        sparse: true, // Allows null/undefined values to not conflict
        default: undefined // Use undefined instead of null for better sparse index handling
    },
    username: {
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
        select: false // Hide by default
    },
    name: {
        type: String
    },
    avatarUrl: {
        type: String
    },
    accessToken: {
        type: String,
        select: false // Start secure
    },
    lastSynced: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
