const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../utils/db');
const { requireAdmin } = require('../middleware/auth');
const { verifyToken } = require('../utils/jwt');

function isApproved(db, workerId) {
  return db.certificationResults.some(c => c.workerId === workerId && c.passed);
}

function getSelfOrAdminStatus(req, workerId) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const { valid, payload } = verifyToken(token);
    if (valid && (payload.id === workerId || payload.role === 'admin')) {
      return true;
    }
  }
  return false;
}

// ─── SPECIFIC ROUTES MUST COME BEFORE PARAMETERIZED ROUTES ───────────────────

// GET /api/certification/practical-pending  (Admin only in practice)
// Includes videoDataURI so admin can watch the submitted video
router.get('/practical-pending', (req, res) => {
  try {
    const dbData = readDB();
    const pending = dbData.practicalVideoSubmissions
      .filter(s => s.status === 'pending');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/certification/practical-status/:workerId
// Check a worker's own practical video submission status
router.get('/practical-status/:workerId', (req, res) => {
  try {
    const workerId = Number(req.params.workerId);
    const db = readDB();

    // Self or admin only
    if (!getSelfOrAdminStatus(req, workerId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const sub = db.practicalVideoSubmissions.find(s => s.workerId === workerId);
    res.json({ status: sub ? sub.status : 'none' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/certification/submit-practical
router.post('/submit-practical', (req, res) => {
  try {
    const workerId = Number(req.body.workerId); // always normalize to number
    const { workerName, skill, videoDataURI } = req.body;
    const dbData = readDB();

    const existingIndex = dbData.practicalVideoSubmissions.findIndex(s => s.workerId === workerId);
    const submission = {
      status: 'pending',
      workerId: workerId,
      workerName: workerName || 'Unknown',
      skill: skill || 'Unknown',
      videoDataURI: videoDataURI || '',
      submittedAt: Date.now()
    };

    if (existingIndex >= 0) {
      dbData.practicalVideoSubmissions[existingIndex] = submission;
    } else {
      dbData.practicalVideoSubmissions.push(submission);
    }

    writeDB(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/certification/approve/:workerId  (Admin only)
router.post('/approve/:workerId', requireAdmin, (req, res) => {
  try {
    const workerId = Number(req.params.workerId);
    const dbData = readDB();

    // Update submission status
    const sub = dbData.practicalVideoSubmissions.find(s => s.workerId === workerId);
    if (sub) {
      sub.status = 'approved';
    }

    // Update or create certification record
    const existingCertIndex = dbData.certificationResults.findIndex(c => c.workerId === workerId);
    if (existingCertIndex >= 0) {
      dbData.certificationResults[existingCertIndex].practicalPassed = true;
      dbData.certificationResults[existingCertIndex].passed = true;
    } else {
      dbData.certificationResults.push({
        workerId,
        practicalPassed: true,
        passed: true,
        certificateId: `KNOT-${Date.now()}`
      });
    }

    // Automatically verify the worker in users array too
    const user = dbData.users.find(u => u.id === workerId);
    if (user) {
      user.verified = true;
    }

    writeDB(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/certification/reject/:workerId  (Admin only)
router.post('/reject/:workerId', requireAdmin, (req, res) => {
  try {
    const workerId = Number(req.params.workerId);
    const dbData = readDB();

    // Update submission status
    const sub = dbData.practicalVideoSubmissions.find(s => s.workerId === workerId);
    if (sub) {
      sub.status = 'rejected';
    }

    // Update certification record if exists
    const existingCertIndex = dbData.certificationResults.findIndex(c => c.workerId === workerId);
    if (existingCertIndex >= 0) {
      dbData.certificationResults[existingCertIndex].practicalPassed = false;
      dbData.certificationResults[existingCertIndex].passed = false;
    }

    writeDB(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PARAMETERIZED ROUTES LAST ────────────────────────────────────────────────

// GET /api/certification/:workerId - get full certification record
// Self and admin can see their own cert (even if pending); others only see approved workers
router.get('/:workerId', (req, res) => {
  try {
    const workerId = Number(req.params.workerId);
    const db = readDB();

    const isSelfOrAdmin = getSelfOrAdminStatus(req, workerId);

    const cert = db.certificationResults.find(c => c.workerId === workerId);
    if (!cert) return res.status(404).json({ error: 'Certification not found' });

    if (!cert.passed && !isSelfOrAdmin) {
      return res.status(403).json({ error: 'Forbidden: Worker not approved yet' });
    }

    res.json(cert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;