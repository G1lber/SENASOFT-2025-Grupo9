const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const profileRoutes = require('./routes/profileRoutes');

// Use routes
app.use('/api', authRoutes);
app.use('/api', chatRoutes);
app.use('/api', profileRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'SENASOFT Backend is running',
    timestamp: new Date().toISOString() 
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SENASOFT Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/login',
      chat: '/api/chat',
      profile: '/api/profile/:userId'
    }
  });
});

// Initialize MCP Service
const mcpService = require('./services/mcpService');

// Función async para inicializar correctamente
async function startServer() {
  try {
    // Esperar a que el MCP Service se inicialice
    console.log('⏳ Initializing MCP Service...');
    await mcpService.ensureInitialized();
    console.log('✅ MCP Service ready');

    // Start server después de que el MCP esté listo
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`💾 Database: ${process.env.DB_NAME || 'Not configured'}`);
      console.log(`🤖 Groq API: ${process.env.GROQ_API_KEY ? 'Configured' : 'Not configured'}`);
      console.log(`✅ Backend with MCP ready to handle requests`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();

module.exports = app;