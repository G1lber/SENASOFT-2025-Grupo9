const express = require('express');
const app = express();
const chatRoutes = require('./routes/chat');
const profileRoutes = require('./routes/profile');
const investmentRoutes = require('./routes/investment');
const errorHandler = require('./middleware/errorHandler');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/investment', investmentRoutes);

app.use(errorHandler);

module.exports = app;