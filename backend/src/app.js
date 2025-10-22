const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection on startup
testConnection().catch(console.error);

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SENASOFT Backend with MCP and Groq integration',
    timestamp: new Date().toISOString()
  });
});

// Test MCP endpoint
app.get('/api/test-mcp', async (req, res) => {
  try {
    const mcpService = require('./services/mcpService');
    const tools = mcpService.getAvailableTools();
    
    res.json({
      success: true,
      message: 'MCP Service is working',
      availableTools: tools,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'MCP Service error',
      message: error.message
    });
  }
});

// Import routes after middleware setup
try {
  const chatRoutes = require('./routes/chat');
  const profileRoutes = require('./routes/profile');
  
  // API Routes
  app.use('/api/chat', chatRoutes);
  app.use('/api/profile', profileRoutes);
} catch (error) {
  console.log('⚠️  Routes not loaded yet, creating them...');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💾 Database: ${process.env.DB_NAME}`);
  console.log(`🤖 Groq API: ${process.env.GROQ_API_KEY ? 'Configured' : 'Not configured'}`);
});

module.exports = app;