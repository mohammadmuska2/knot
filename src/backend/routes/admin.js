const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../utils/db');
const { signToken } = require('../utils/jwt');
const { requireAdmin } = require('../middleware/auth');

// Admin credentials (plain text check — frontend already handles hash)
const ADMIN_USERNAME = 'admin';
// SHA-256 of "knot@admin2026"
const ADMIN_PASSWORD_HASH = '49f80693093d34f60244239d827e4152df6049aeff3a2ca298db5331b9097d85';

// GET /api/admin/stats — admin stats
router.get('/stats', (req, res) => {
  const db = readDB();
  const totalCertified = db.certificationResults.filter(c => c.passed).length;
  const totalEndorsements = db.users.reduce((sum, u) => sum + (u.endorsementCount || 0), 0);
  res.json({
    totalWorkers: db.users.length,
    totalCitizens: db.citizens.length,
    totalCertified,
    totalLearningRequests: db.learningRequests.length,
    totalEndorsements,
  });
});

// POST /api/admin/login — returns JWT token on success
router.post('/login', (req, res) => {
  const { username, passwordHash } = req.body;
  if (
    username === ADMIN_USERNAME &&
    passwordHash === ADMIN_PASSWORD_HASH
  ) {
    const token = signToken({ id: 0, role: 'admin', username: ADMIN_USERNAME });
    return res.json({ success: true, token });
  }
  res.json({ success: false });
});

// POST /api/admin/clear — clear all data
router.post('/clear', (req, res) => {
  writeDB({
    users: [],
    citizens: [],
    learningRequests: [],
    certificationResults: [],
    practicalVideoSubmissions: [],
    videoStore: [],
    workerCredentials: [],
    citizenCredentials: [],
    notifications: {},
    nextUserId: 1,
    nextCitizenId: 1,
    nextRequestId: 1,
  });
  res.json({ success: true });
});

module.exports = router;
