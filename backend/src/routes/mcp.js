const express = require('express');
const router = express.Router();
const mcpService = require('../services/mcpService');

// Endpoint principal para procesar peticiones MCP
router.post('/', async (req, res) => {
  try {
    const { action, payload, metadata } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'Action is required'
      });
    }

    // Procesar la petición a través del servicio MCP
    const result = await mcpService.processRequest({
      action,
      payload: payload || {},
      metadata: metadata || {}
    });

    res.json(result);

  } catch (error) {
    console.error('MCP endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

module.exports = router;
