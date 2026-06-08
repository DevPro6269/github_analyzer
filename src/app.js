require('dotenv').config();
const express = require('express');
const profileRoutes = require('./routes/profile.routes');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', profileRoutes);

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  res.status(status).json({ error: message });
});

module.exports = app;
