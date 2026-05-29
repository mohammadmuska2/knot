const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { readDB, writeDB } = require('../utils/db');
const { signToken } = require('../utils/jwt');
const { requireAuth, requireAdmin } = require('../middleware/auth');

function isApproved(db, userId) {
  return db.certificationResults.some(c => c.workerId === userId && c.passed);
}

// GET /api/users
router.get('/', (req, res) => {
  try {
    const db = readDB();
    const showAll = req.query.all === 'true';
    let results = db.users;
    if (!showAll) results = results.filter(u => isApproved(db, u.id));
    results.sort((a, b) => ((b.trustScore * 2) + b.endorsementCount) - ((a.trustScore * 2) + a.endorsementCount));
    res.json(results);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/users/stats/:id
router.get('/stats/:id', (req, res) => {
  try {
    const db = readDB();
    const id = parseInt(req.params.id, 10);
    const user = db.users.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: 'Not found' });

    // Optional self/admin bypass for unapproved worker stats
    const { verifyToken } = require('../utils/jwt');
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    let isSelfOrAdmin = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { valid, payload } = verifyToken(token);
      if (valid && (payload.id === id || payload.role === 'admin')) {
        isSelfOrAdmin = true;
      }
    }

    if (!isApproved(db, id) && !isSelfOrAdmin) {
      return res.status(403).json({ error: 'Forbidden: Worker not approved yet' });
    }

    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/users/search
router.get('/search', (req, res) => {
  try {
    const db = readDB();
    const { q } = req.query;
    let results = db.users.filter(u => isApproved(db, u.id));
    if (q) {
      const qs = q.toLowerCase();
      results = results.filter(u => u.name.toLowerCase().includes(qs) || u.skill.toLowerCase().includes(qs));
    }
    res.json(results);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/users/find-by-name/:name
router.get('/find-by-name/:name', (req, res) => {
  try {
    const db = readDB();
    const user = db.users.find(u => u.name.toLowerCase() === req.params.name.toLowerCase());
    if (!user) return res.status(404).json({ error: 'Not found' });

    // Optional self/admin bypass for unapproved worker profiles
    const { verifyToken } = require('../utils/jwt');
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    let isSelfOrAdmin = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { valid, payload } = verifyToken(token);
      if (valid && (payload.id === user.id || payload.role === 'admin')) {
        isSelfOrAdmin = true;
      }
    }

    if (!isApproved(db, user.id) && !isSelfOrAdmin) {
      return res.status(403).json({ error: 'Forbidden: Worker not approved yet' });
    }

    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/users/skill/:skill
router.get('/skill/:skill', (req, res) => {
  try {
    const db = readDB();
    const skill = req.params.skill.toLowerCase();
    const results = db.users.filter(u => isApproved(db, u.id) && u.skill.toLowerCase() === skill);
    res.json(results);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/users/distance/:maxKm
router.get('/distance/:maxKm', (req, res) => {
  try {
    const db = readDB();
    const max = parseFloat(req.params.maxKm);
    const results = db.users.filter(u => isApproved(db, u.id) && u.distance <= max);
    res.json(results);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/users/register
router.post('/register', (req, res) => {
  try {
    const db = readDB();
    const { username, passwordHash, name, skill, location, bio, videoURL, distance, contact } = req.body;
    if (db.workerCredentials.some(c => c.username === username.toLowerCase())) {
      return res.status(400).json({ error: 'Username taken' });
    }
    const id = db.nextUserId++;
    db.users.push({
      id, name, skill, location, trustScore: 0, endorsementCount: 0, badgeLevel: 'None',
      distance: distance || 5, bio: bio || '', videoURL: videoURL || '', contact: contact || '',
      verified: false
    });
    db.workerCredentials.push({ userId: id, username: username.toLowerCase(), passwordHash });
    writeDB(db);
    const token = signToken({ id, role: 'worker', username: username.toLowerCase() });
    res.json({ success: true, token, user: db.users.find(u => u.id === id) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/users/login
router.post('/login', (req, res) => {
  try {
    const db = readDB();
    const { username, passwordHash } = req.body;
    const cred = db.workerCredentials.find(c => c.username === username.toLowerCase() && c.passwordHash === passwordHash);
    if (!cred) return res.status(401).json({ error: 'Invalid credentials' });
    const user = db.users.find(u => u.id === cred.userId);
    const token = signToken({ id: cred.userId, role: 'worker', username: cred.username });
    res.json({ success: true, token, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/users/:id/verify
router.post('/:id/verify', requireAdmin, (req, res) => {
  try {
    const db = readDB();
    const id = parseInt(req.params.id, 10);
    const user = db.users.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    const { verified } = req.body;
    user.verified = !!verified;
    writeDB(db);
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/users/:id
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const db = readDB();
    const id = parseInt(req.params.id, 10);
    db.users = db.users.filter(u => u.id !== id);
    db.workerCredentials = db.workerCredentials.filter(c => c.userId !== id);
    db.practicalVideoSubmissions = db.practicalVideoSubmissions.filter(s => s.workerId !== id);
    db.certificationResults = db.certificationResults.filter(c => c.workerId !== id);
    if (db.notifications) {
      delete db.notifications[id];
      delete db.notifications[id.toString()];
    }
    writeDB(db);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
