const express = require('express');
const crypto = require('crypto');
const { load, save } = require('../store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/leaderboard?limit=10  — 상위 랭킹 조회 (인증 불필요)
router.get('/', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
  const db = load();
  const top = [...db.scores]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s, i) => ({ rank: i + 1, username: s.username, score: s.score, at: s.at }));
  res.json({ entries: top });
});

// POST /api/leaderboard  { score }  — 점수 제출 (본인 최고 기록만 유지)
router.post('/', requireAuth, (req, res) => {
  const score = Number(req.body?.score);
  if (!Number.isFinite(score) || score < 0) {
    return res.status(400).json({ error: 'bad_request', message: 'score는 0 이상의 숫자여야 합니다.' });
  }
  const db = load();
  const existing = db.scores.find((s) => s.userId === req.user.id);
  if (existing) {
    if (score > existing.score) {
      existing.score = score;
      existing.at = new Date().toISOString();
    }
  } else {
    db.scores.push({
      id: crypto.randomUUID(),
      userId: req.user.id,
      username: req.user.username,
      score,
      at: new Date().toISOString(),
    });
  }
  save(db);
  const sorted = [...db.scores].sort((a, b) => b.score - a.score);
  const rank = sorted.findIndex((s) => s.userId === req.user.id) + 1;
  const best = sorted[rank - 1].score;
  res.status(201).json({ accepted: score >= best, best, rank });
});

// GET /api/leaderboard/me  — 내 순위/최고 점수 조회
router.get('/me', requireAuth, (req, res) => {
  const db = load();
  const sorted = [...db.scores].sort((a, b) => b.score - a.score);
  const idx = sorted.findIndex((s) => s.userId === req.user.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'not_found', message: '아직 제출한 점수가 없습니다.' });
  }
  res.json({ rank: idx + 1, score: sorted[idx].score, at: sorted[idx].at });
});

module.exports = router;
