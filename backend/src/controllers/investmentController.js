module.exports = {
	listOptions: async (req, res, next) => {
		try {
			// ...implementar...
			res.json({ instruments: [] });
		} catch (err) {
			next(err);
		}
	}
};
