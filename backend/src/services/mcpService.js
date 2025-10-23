const { createMCPServer } = require('../../mcp-server');

class MCPService {
	constructor() {
		this.mcpServer = null;
		this.initialize();
	}

	async initialize() {
		try {
			this.mcpServer = await createMCPServer();
			console.log('✅ MCP Service initialized');
		} catch (error) {
			console.error('❌ Failed to initialize MCP Service:', error);
			throw error;
		}
	}

	async ensureInitialized() {
		if (!this.mcpServer) {
			await this.initialize();
		}
	}

	async getUserProfile(userId) {
		await this.ensureInitialized();
		return await this.mcpServer.callTool('get_user_profile', { userId });
	}

	async saveUserProfile(profileData) {
		await this.ensureInitialized();
		return await this.mcpServer.callTool('save_user_profile', profileData);
	}

	async getInvestmentOptions(riskLevel, amount = 0) {
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

	getAvailableTools() {
		if (!this.mcpServer) {
			return [];
		}
		
		return this.mcpServer.listTools();
	}
}

module.exports = new MCPService();
