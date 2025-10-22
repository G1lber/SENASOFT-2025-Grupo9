const profileAgent = require('../agents/profileAgent');
const investmentAgent = require('../agents/investmentAgent');
const educationAgent = require('../agents/educationAgent');

module.exports = {
	orchestrate: async (userData) => {
		// ...implementar flujo A2A...
		const profile = await profileAgent.analyzeProfile(userData);
		const proposals = await investmentAgent.generateProposal(profile, []);
		const content = await educationAgent.recommendContent(profile);
		return { profile, proposals, content };
	}
};
