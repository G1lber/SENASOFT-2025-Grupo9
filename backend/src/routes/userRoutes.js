const express = require('express');
const { userController } = require('../controllers');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', auth, userController.getProfile);

module.exports = router;
