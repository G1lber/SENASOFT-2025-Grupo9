const express = require('express');
const app = express();
app.use(express.json());

app.get('/tools/getUserProfile', (req, res) => {
	res.json({ profile: null });
});
app.post('/tools/saveProfile', (req, res) => {
	res.status(201).json({ ok: true });
});
app.get('/tools/getInvestmentOptions', (req, res) => {
	res.json({ options: [] });
});

if (require.main === module) {
	const port = process.env.MCP_PORT || 4000;
	app.listen(port, () => console.log(`MCP server listening ${port}`));
}

module.exports = app;
