const { createMCPServer } = require('../../mcp-server/index.js');

class MCPService {
	constructor() {
		this.server = null;
		this.initialize();
	}

	async initialize() {
		try {
			this.server = await createMCPServer();
			console.log('✅ MCP Service initialized');
		} catch (error) {
			console.error('❌ Failed to initialize MCP Service:', error.message);
		}
	}

	async getUserProfile(userId) {
		if (!this.server) {
			throw new Error('MCP Server not initialized');
		}
		
		return await this.server.callTool('get_user_profile', { userId });
	}

	async saveUserProfile(profileData) {
		if (!this.server) {
			throw new Error('MCP Server not initialized');
		}
		
		return await this.server.callTool('save_user_profile', profileData);
	}

	async getInvestmentOptions(riskLevel, amount = 0) {
		if (!this.server) {
			throw new Error('MCP Server not initialized');
		}
		
		return await this.server.callTool('get_investment_options', { riskLevel, amount });
	}

	async analyzeWithGroq(prompt, context = '') {
		if (!this.server) {
			throw new Error('MCP Server not initialized');
		}
		
		return await this.server.callTool('analyze_with_groq', { prompt, context });
	}

	getAvailableTools() {
		if (!this.server) {
			return [];
		}
		
		return this.server.listTools();
	}
}

module.exports = new MCPService();
