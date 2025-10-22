const express = require('express');
const profileController = require('../controllers/profileController');

const router = express.Router();

// Get user profile
router.get('/:userId', profileController.getProfile);

// Save user profile
router.post('/', profileController.saveProfile);

// Analyze user profile
router.get('/:userId/analyze', profileController.analyzeProfile);

module.exports = router;
