const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const saveRoutes = require('./routes/saves');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
app.use(cors());
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/saves', saveRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'not_found', message: `${req.method} ${req.path} 라우트가 없습니다.` });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error', message: '서버 오류가 발생했습니다.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Game backend listening on http://localhost:${PORT}`);
});
