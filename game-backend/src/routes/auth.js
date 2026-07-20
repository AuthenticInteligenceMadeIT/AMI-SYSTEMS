const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { load, save } = require('../store');
const { signToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register  { username, password }
router.post('/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'bad_request', message: 'username과 password가 필요합니다.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'weak_password', message: 'password는 6자 이상이어야 합니다.' });
  }
  const db = load();
  if (db.users.some((u) => u.username === username)) {
    return res.status(409).json({ error: 'username_taken', message: '이미 사용 중인 username입니다.' });
  }
  const user = {
    id: crypto.randomUUID(),
    username,
    passwordHash: await bcrypt.hash(password, 10),
    isGuest: false,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  save(db);
  res.status(201).json({ token: signToken(user), user: { id: user.id, username: user.username } });
});

// POST /api/auth/login  { username, password }
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  const db = load();
  const user = db.users.find((u) => u.username === username);
  if (!user || user.isGuest || !(await bcrypt.compare(password || '', user.passwordHash))) {
    return res.status(401).json({ error: 'invalid_credentials', message: 'username 또는 password가 올바르지 않습니다.' });
  }
  res.json({ token: signToken(user), user: { id: user.id, username: user.username } });
});

// POST /api/auth/guest  — 계정 없이 바로 플레이 (게스트 토큰 발급)
router.post('/guest', (req, res) => {
  const db = load();
  const user = {
    id: crypto.randomUUID(),
    username: `guest_${crypto.randomBytes(4).toString('hex')}`,
    passwordHash: null,
    isGuest: true,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  save(db);
  res.status(201).json({ token: signToken(user), user: { id: user.id, username: user.username } });
});

module.exports = router;
