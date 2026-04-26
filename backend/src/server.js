const express = require('express');
const cors = require('cors');
const { connectDatabase } = require('./config/db');
const { port, clientOrigin } = require('./config/env');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const recommendationRoutes = require('./routes/recommendations');

const app = express();

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'course-compass-backend' });
});
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/recommendations', recommendationRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Unexpected server error.',
  });
});

connectDatabase()
  .then(() => {
    app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  });
