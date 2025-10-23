const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Chat endpoint
router.post('/chat', chatController.chat);

// Get conversation history
router.get('/chat/history/:userId', chatController.getHistory);

// Clear conversation history
router.delete('/chat/history/:userId', chatController.clearHistory);

// Investment advice endpoint
router.post('/chat/investment-advice', chatController.getInvestmentAdvice);

module.exports = router;
