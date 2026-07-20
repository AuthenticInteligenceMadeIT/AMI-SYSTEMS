const express = require('express');
const { load, save } = require('../store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/saves/:slot  — 세이브 데이터 조회 (slot: main, slot1, slot2 ...)
router.get('/:slot', (req, res) => {
  const db = load();
  const data = db.saves[req.user.id]?.[req.params.slot];
  if (!data) {
    return res.status(404).json({ error: 'not_found', message: '해당 슬롯에 세이브 데이터가 없습니다.' });
  }
  res.json(data);
});

// PUT /api/saves/:slot  { data: {...} }  — 세이브 데이터 저장/덮어쓰기
router.put('/:slot', (req, res) => {
  const { data } = req.body || {};
  if (data === undefined) {
    return res.status(400).json({ error: 'bad_request', message: 'body에 data 필드가 필요합니다.' });
  }
  const db = load();
  db.saves[req.user.id] ||= {};
  const record = {
    slot: req.params.slot,
    data,
    updatedAt: new Date().toISOString(),
  };
  db.saves[req.user.id][req.params.slot] = record;
  save(db);
  res.json(record);
});

// DELETE /api/saves/:slot  — 세이브 삭제
router.delete('/:slot', (req, res) => {
  const db = load();
  if (!db.saves[req.user.id]?.[req.params.slot]) {
    return res.status(404).json({ error: 'not_found', message: '해당 슬롯에 세이브 데이터가 없습니다.' });
  }
  delete db.saves[req.user.id][req.params.slot];
  save(db);
  res.status(204).end();
});

module.exports = router;
