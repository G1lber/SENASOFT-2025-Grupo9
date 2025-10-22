const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');

router.get('/', investmentController.listOptions);

module.exports = router;
