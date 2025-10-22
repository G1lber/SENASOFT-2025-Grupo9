const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SENASOFT Backend with MCP and AI integration',
    timestamp: new Date().toISOString()
  });
});

// Test MCP endpoint
app.get('/api/test-mcp', async (req, res) => {
  try {
    const mcpService = require('./services/mcpService');
    const tools = await mcpService.listTools();
    
    res.json({
      success: true,
      message: 'MCP Service is working',
      availableTools: tools,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'MCP Service error',
      error: error.message
    });
  }
});

// Import and register routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const chatRoutes = require('./routes/chat');
const mcpRoutes = require('./routes/mcp');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/mcp', mcpRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
async function startServer() {
  try {
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth login: http://localhost:${PORT}/api/auth/login`);
      console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
      console.log(`👤 Profile endpoint: http://localhost:${PORT}/api/profile`);
      console.log(`🔧 MCP endpoint: http://localhost:${PORT}/api/mcp\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;