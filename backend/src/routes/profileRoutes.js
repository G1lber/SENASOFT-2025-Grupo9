const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Get user profile
router.get('/profile/:userId', profileController.getProfile);

// Save user profile
router.post('/profile', profileController.saveProfile);

// Analyze user profile
router.get('/profile/:userId/analyze', profileController.analyzeProfile);

module.exports = router;
