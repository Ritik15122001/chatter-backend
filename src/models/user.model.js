const mongoose = require('mongoose');

// Define User schema
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        status: {
            type: String,
            enum: ['offline', 'online', 'away'],
            default: 'offline',
        },
    },
    {
        timestamps: true,
    }
);

// Create and export User model
const User = mongoose.model('User', userSchema);
module.exports = User;
