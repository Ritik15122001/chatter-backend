// app.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user.routes');

const app = express();

// Apply CORS middleware FIRST - before any routes
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const messageRoutes = require('./routes/message.routes');
app.use('/api/messages', messageRoutes);



app.use('/api/users', userRoutes);

// Add other routes as needed...

module.exports = app;