const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../utils/db');
const { requireUser } = require('../middleware/auth');
const { pushNotification } = require('./notifications');

// GET /api/learning-requests — all learning requests
router.get('/', (req, res) => {
  const db = readDB();
  res.json(db.learningRequests);
});

// GET /api/learning-requests/worker/:workerId — requests for a specific worker
router.get('/worker/:workerId', (req, res) => {
  const db = readDB();
  const workerId = parseInt(req.params.workerId, 10);
  const results = db.learningRequests.filter(r => r.targetUserId === workerId);
  res.json(results);
});

// POST /api/learning-requests — submit a learning request (requires auth)
router.post('/', requireUser, (req, res) => {
  const db = readDB();
  const { requesterId, targetUserId, message } = req.body;

  if (!requesterId || targetUserId === undefined || targetUserId === null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = db.nextRequestId;
  db.nextRequestId += 1;

  const newRequest = {
    id,
    requesterId,
    targetUserId: parseInt(targetUserId, 10),
    message: message || '',
    timestamp: Date.now(),
  };

  db.learningRequests.push(newRequest);
  writeDB(db);

  // Push real-time notification to the target worker
  pushNotification(String(parseInt(targetUserId, 10)), {
    type: 'learning_request',
    message: `You have a new learning request! Someone wants to learn from you. 📚`,
  });

  res.json({ success: true, id });
});

module.exports = router;
