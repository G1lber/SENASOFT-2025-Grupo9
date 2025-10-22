const express = require('express');
const userRoutes = require('./userRoutes');
const mcpRoutes = require('./mcpRoutes');
const a2aRoutes = require('./a2aRoutes');
const ragRoutes = require('./ragRoutes');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/mcp', mcpRoutes);
router.use('/a2a', a2aRoutes);
router.use('/rag', ragRoutes);

module.exports = router;
