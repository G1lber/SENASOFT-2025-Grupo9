const { createMCPServer } = require('../../mcp-server');

class MCPService {
  constructor() {
    this.mcpServer = null;
    this.initPromise = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        console.log('🔧 Creating MCP Server instance...');
        this.mcpServer = await createMCPServer();
        this.isInitialized = true;
        console.log('✅ MCP Service initialized successfully');
        return this.mcpServer;
      } catch (error) {
        console.error('❌ Failed to initialize MCP Service:', error);
        this.isInitialized = false;
        throw error;
      }
    })();

    return this.initPromise;
  }

  async ensureInitialized() {
    if (!this.isInitialized || !this.mcpServer) {
      await this.initialize();
    }
    return this.mcpServer;
  }

  async getUserProfile(userId) {
    await this.ensureInitialized();
    return await this.mcpServer.callTool('get_user_profile', { userId });
  }

  async saveUserProfile(profileData) {
    await this.ensureInitialized();
    return await this.mcpServer.callTool('save_user_profile', profileData);
  }

  async getInvestmentOptions(riskLevel, amount) {
    await this.ensureInitialized();
    return await this.mcpServer.callTool('get_investment_options', { 
      riskLevel, 
      amount 
    });
  }

  async analyzeWithGroq(prompt, context = '', userProfile = null, userId = null, conversationHistory = []) {
    await this.ensureInitialized();
    return await this.mcpServer.callTool('analyze_with_groq', {
      prompt,
      context,
      userProfile,
      userId,
      conversationHistory
    });
  }

  async clearConversationHistory(userId) {
    await this.ensureInitialized();
    return await this.mcpServer.callTool('clear_conversation', { userId });
  }

  async getConversationHistory(userId) {
    await this.ensureInitialized();
    return await this.mcpServer.callTool('get_conversation_history', { userId });
  }

  async analyzeInvestmentProfile(userId, investmentAmount) {
    await this.ensureInitialized();
    return await this.mcpServer.callTool('analyze_investment_profile', {
      userId,
      investmentAmount
    });
  }

  async getUserObjectives(userId) {
    await this.ensureInitialized();
    return await this.mcpServer.callTool('get_user_objectives', { userId });
  }
}

// Exportar una instancia única (singleton)
const mcpServiceInstance = new MCPService();

// Inicializar inmediatamente al cargar el módulo
mcpServiceInstance.initialize().catch(err => {
  console.error('Failed to initialize MCP Service on module load:', err);
});

module.exports = mcpServiceInstance;
