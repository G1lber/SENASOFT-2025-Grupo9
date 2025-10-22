const express = require('express');
const { a2aService } = require('../services/a2a');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/authenticate', async (req, res) => {
    try {
        const result = await a2aService.authenticate(req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/refresh', auth, async (req, res) => {
    try {
        const result = await a2aService.refreshToken(req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
