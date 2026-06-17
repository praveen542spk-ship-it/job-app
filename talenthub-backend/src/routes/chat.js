// src/routes/chat.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat - Contextual AI query
router.post('/', chatController.handleChatQuery);

module.exports = router;
