module.exports = {
	embed: async (text) => { return [/* vector */]; },
	save: async (id, vector, metadata) => { /* ... */ },
	search: async (vector, k = 5) => { return []; }
};
