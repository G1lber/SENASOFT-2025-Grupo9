const fetch = require('node-fetch');
const { mcpBaseUrl } = require('../config/mcp');

module.exports = {
	call: async (path, options = {}) => {
		const res = await fetch(`${mcpBaseUrl}${path}`, options);
		return res.json();
	}
};
