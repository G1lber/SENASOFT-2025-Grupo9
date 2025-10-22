module.exports = {
	getProfile: async (req, res, next) => {
		try {
			// ...implementar...
			res.json({ profile: null });
		} catch (err) {
			next(err);
		}
	},
	saveProfile: async (req, res, next) => {
		try {
			// ...implementar...
			res.status(201).json({ ok: true });
		} catch (err) {
			next(err);
		}
	}
};
