// server.js
require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/message.model');

const app = require('./app'); // Your Express app
const server = http.createServer(app); // HTTP server from app

// Create Socket.IO instance
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Track online users and their socket IDs
const onlineUsers = new Map(); // userId -> socketId

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Socket.IO event handling
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
    let currentUserId = null;

    // User joins and provides their ID
    socket.on('join', (userId) => {
        // Store user ID and socket ID mapping
        currentUserId = userId;
        onlineUsers.set(userId, socket.id);
        socket.join(userId);

        console.log(`User ${userId} joined and is now online`);
        console.log('Current online users:', Array.from(onlineUsers.keys()));

        // Broadcast to all users that this user is online
        io.emit('userOnline', userId);

        // Send the current online users list to the newly connected user
        const onlineUsersList = Array.from(onlineUsers.keys());
        socket.emit('onlineUsers', onlineUsersList);
    });

    socket.on('sendMessage', async (message) => {
        console.log('sendMessage received:', message);

        try {
            // Save to DB
            const newMessage = new Message(message);
            await newMessage.save();

            // Emit to receiver
            io.to(message.receiverId).emit('receiveMessage', message);
        } catch (err) {
            console.error('Error saving message:', err);
        }
    });

    socket.on('typing', ({ senderId, receiverId }) => {
        io.to(receiverId).emit('userTyping', { senderId });
    });

    socket.on('stopTyping', ({ senderId, receiverId }) => {
        io.to(receiverId).emit('userStoppedTyping', { senderId });
    });

    socket.on('getMessages', async ({ user1Id, user2Id }) => {
        try {
            const messages = await Message.find({
                $or: [
                    { senderId: user1Id, receiverId: user2Id },
                    { senderId: user2Id, receiverId: user1Id }
                ]
            }).sort({ timestamp: 1 });

            socket.emit('messagesHistory', { chatId: user2Id, messages });
        } catch (err) {
            console.error('Error fetching messages:', err);
            socket.emit('messagesHistory', { chatId: user2Id, messages: [] });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        if (currentUserId) {
            console.log(`User ${currentUserId} disconnected and is now offline`);
            // Remove from online users
            onlineUsers.delete(currentUserId);

            // Broadcast to all that this user is offline
            io.emit('userOffline', currentUserId);
        }
        console.log('Client disconnected');
    });
});