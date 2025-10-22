const express = require('express');
const { ragService } = require('../services/rag');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/query', auth, async (req, res) => {
    try {
        const { query } = req.body;
        const result = await ragService.query(query);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/ingest', auth, async (req, res) => {
    try {
        const { documents } = req.body;
        const result = await ragService.ingestDocuments(documents);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
