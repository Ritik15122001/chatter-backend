const express = require('express');
const router = express.Router();
const Message = require('../models/message.model');

// GET /api/messages/:user1Id/:user2Id
router.get('/:user1Id/:user2Id', async (req, res) => {
    const { user1Id, user2Id } = req.params;

    try {
        const messages = await Message.find({
            $or: [
                { senderId: user1Id, receiverId: user2Id },
                { senderId: user2Id, receiverId: user1Id }
            ]
        }).sort({ timestamp: 1 }); // ascending order

        res.json(messages);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
