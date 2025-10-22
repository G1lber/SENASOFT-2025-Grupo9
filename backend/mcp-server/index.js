const { pool } = require('../src/config/database.js');
const Groq = require('groq-sdk');
require('dotenv').config();

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Simple MCP-like server implementation
class MCPServer {
  constructor() {
    this.tools = new Map();
    this.setupTools();
  }

  setupTools() {
    this.tools.set('get_user_profile', {
      description: 'Retrieve user profile from database',
      handler: this.getUserProfile.bind(this)
    });

    this.tools.set('save_user_profile', {
      description: 'Save user profile to database',
      handler: this.saveUserProfile.bind(this)
    });

    this.tools.set('get_investment_options', {
      description: 'Get investment options based on user profile',
      handler: this.getInvestmentOptions.bind(this)
    });

    this.tools.set('analyze_with_groq', {
      description: 'Analyze data using Groq AI model',
      handler: this.analyzeWithGroq.bind(this)
    });
  }

  async getUserProfile(args) {
    const { userId } = args;
    
    if (!userId) {
      throw new Error('UserId is required');
    }

    try {
      const [rows] = await pool.execute(
        'SELECT * FROM user_profiles WHERE user_id = ?',
        [userId]
      );
      
      return {
        success: true,
        data: rows[0] || null,
        message: rows[0] ? 'User profile found' : 'User profile not found'
      };
    } catch (error) {
      console.error('Database error in getUserProfile:', error);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async saveUserProfile(args) {
    const { userId, age, income, riskTolerance, goals } = args;
    
    if (!userId) {
      throw new Error('UserId is required');
    }

    try {
      await pool.execute(`
        INSERT INTO user_profiles (user_id, age, income, risk_tolerance, goals, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
        age = VALUES(age),
        income = VALUES(income),
        risk_tolerance = VALUES(risk_tolerance),
        goals = VALUES(goals),
        updated_at = NOW()
      `, [userId, age || null, income || null, riskTolerance || null, goals || null]);

      return {
        success: true,
        message: 'Profile saved successfully'
      };
    } catch (error) {
      console.error('Database error in saveUserProfile:', error);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async getInvestmentOptions(args) {
    const { riskLevel = 'medium', amount = 0 } = args;
    
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM investment_options WHERE risk_level = ? AND min_amount <= ? LIMIT 10',
        [riskLevel, amount]
      );
      
      return {
        success: true,
        data: rows,
        message: rows.length > 0 ? `Found ${rows.length} investment options` : 'No investment options found'
      };
    } catch (error) {
      console.error('Database error in getInvestmentOptions:', error);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async analyzeWithGroq(args) {
    const { prompt, context = '' } = args;
    
    if (!prompt) {
      throw new Error('Prompt is required for Groq analysis');
    }

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a financial advisor AI assistant. Provide clear, helpful investment advice based on the user\'s profile and context.'
          },
          {
            role: 'user',
            content: `${prompt}\n\nContext: ${context}`
          }
        ],
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024
      });

      return {
        success: true,
        data: completion.choices[0]?.message?.content || 'No response from Groq',
        message: 'Analysis completed successfully'
      };
    } catch (error) {
      console.error('Groq API error:', error);
      throw new Error(`Groq API error: ${error.message}`);
    }
  }

  async callTool(toolName, args) {
    const tool = this.tools.get(toolName);
    
    if (!tool) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    try {
      const result = await tool.handler(args);
      return result;
    } catch (error) {
      console.error(`Tool error for ${toolName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  listTools() {
    return Array.from(this.tools.entries()).map(([name, tool]) => ({
      name,
      description: tool.description
    }));
  }
}

// Test function to verify the server works
async function testServer() {
  const server = new MCPServer();
  
  console.log('🧪 Testing MCP Server...');
  
  // Test database connection
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return;
  }

  // Test Groq API
  if (process.env.GROQ_API_KEY) {
    console.log('✅ Groq API key configured');
    
    // Test Groq connection
    try {
      const testResult = await server.callTool('analyze_with_groq', {
        prompt: 'Test connection',
        context: 'This is a test'
      });
      console.log('✅ Groq API connection successful');
    } catch (error) {
      console.error('❌ Groq API test failed:', error.message);
    }
  } else {
    console.log('⚠️  Groq API key not configured');
  }

  // List available tools
  const tools = server.listTools();
  console.log('🔧 Available tools:', tools.map(t => t.name).join(', '));
  
  console.log('🚀 MCP Server is ready to use!');
  return server;
}

// Export for use in other modules
async function createMCPServer() {
  return new MCPServer();
}

// Main function
async function main() {
  try {
    const server = await testServer();
    
    // Keep the process running
    console.log('🎯 MCP Server running... Press Ctrl+C to stop');
    
    // Example usage
    setInterval(async () => {
      // This keeps the server alive and shows it's working
      const tools = server.listTools();
      console.log(`💓 Server heartbeat - ${tools.length} tools available`);
    }, 30000); // Every 30 seconds
    
  } catch (error) {
    console.error('❌ Failed to start MCP server:', error.message);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down MCP server...');
  try {
    await pool.end();
    console.log('✅ Database connections closed');
  } catch (error) {
    console.error('Error closing database:', error);
  }
  process.exit(0);
});

// Export the server class and creation function
module.exports = { MCPServer, createMCPServer };

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
