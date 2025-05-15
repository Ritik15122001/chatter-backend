const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');

// Create a new user
router.post('/', userController.createUser);

// Get user details by ID
router.get('/:id', userController.getUser);

// Update user status (e.g., online, offline)
router.put('/:id/status', userController.updateStatus);

// Get all users
router.get('/', userController.getAllUsers);

module.exports = router;
