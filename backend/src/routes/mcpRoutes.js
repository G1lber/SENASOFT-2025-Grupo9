const express = require('express');
const { mcpService } = require('../services/mcp');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/connect', auth, async (req, res) => {
    try {
        const result = await mcpService.connect(req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/status', auth, async (req, res) => {
    try {
        const status = await mcpService.getStatus();
        res.json({ success: true, status });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
