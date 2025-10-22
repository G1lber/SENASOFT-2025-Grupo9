const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

// Chat with AI
router.post('/', chatController.chat);

// Get investment advice
router.post('/investment-advice', chatController.getInvestmentAdvice);

module.exports = router;
