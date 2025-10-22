const express = require('express');
const router = express.Router();
const { login, verifySession, logout } = require('../controllers/authController');

router.post('/login', login);
router.get('/verify/:userId', verifySession);
router.post('/logout', logout);

module.exports = router;
