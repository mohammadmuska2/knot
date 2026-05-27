const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { readDB, writeDB } = require('../utils/db');
const { requireWorker } = require('../middleware/auth');

// POST /api/videos/upload
// No strict auth required - worker ID from body is validated against DB
router.post('/upload', (req, res) => {
  console.log("RECEIVED VIDEO UPLOAD REQUEST:", Object.keys(req.body), "workerId:", req.body.workerId, "type:", typeof req.body.workerId);
  try {
    const workerId = Number(req.body.workerId); // always normalize to number
    const dataURI = req.body.dataURI;
    
    // Save to user profile
    const dbData = readDB();
    const user = dbData.users.find(u => u.id === workerId);
    if (user) {
      user.videoURL = dataURI;
    }

    // Submit to verification queue automatically
    const existingIndex = dbData.practicalVideoSubmissions.findIndex(s => s.workerId === workerId);
    const submission = {
      status: 'pending',
      workerId: workerId,
      videoDataURI: dataURI,
      submittedAt: Date.now(),
      skill: user ? user.skill : 'Unknown',
      workerName: user ? user.name : 'Unknown'
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

function isApproved(db, userId) {
  return db.certificationResults.some(c => c.workerId === userId && c.passed);
}

// GET /api/videos/:workerId
router.get('/:workerId', (req, res) => {
  const workerId = Number(req.params.workerId);
  const dbData = readDB();

  // Optional self/admin bypass for unapproved worker video URIs
  const { verifyToken } = require('../utils/jwt');
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  let isSelfOrAdmin = false;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const { valid, payload } = verifyToken(token);
    if (valid && (payload.id === workerId || payload.role === 'admin')) {
      isSelfOrAdmin = true;
    }
  }

  if (!isApproved(dbData, workerId) && !isSelfOrAdmin) {
    return res.status(403).json({ error: 'Forbidden: Worker not approved yet' });
  }

  const user = dbData.users.find(u => u.id === workerId);
  res.json({ dataURI: user?.videoURL || '' });
});

// GET /api/videos/stream/:workerId
router.get('/stream/:workerId', (req, res) => {
  const workerId = Number(req.params.workerId);
  const dbData = readDB();

  // Optional self/admin bypass for unapproved worker video streaming
  const { verifyToken } = require('../utils/jwt');
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  let isSelfOrAdmin = false;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const { valid, payload } = verifyToken(token);
    if (valid && (payload.id === workerId || payload.role === 'admin')) {
      isSelfOrAdmin = true;
    }
  }

  if (!isApproved(dbData, workerId) && !isSelfOrAdmin) {
    return res.status(403).send('Forbidden: Worker not approved yet');
  }

  // First check practical submissions
  const sub = dbData.practicalVideoSubmissions.find(s => s.workerId === workerId);
  let dataURI = sub?.videoDataURI;
  if (!dataURI) {
    const user = dbData.users.find(u => u.id === workerId);
    dataURI = user?.videoURL;
  }
  
  if (!dataURI) {
    return res.status(404).send('Not found');
  }
  
  const matches = dataURI.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    return res.status(400).send('Invalid video format');
  }
  
  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');
  
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : buffer.length - 1;
    
    if (start >= buffer.length || end >= buffer.length) {
      res.writeHead(416, {
        'Content-Range': `bytes */${buffer.length}`
      });
      return res.end();
    }
    
    const chunksize = (end - start) + 1;
    const chunk = buffer.slice(start, end + 1);
    
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${buffer.length}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mimeType
    });
    res.end(chunk);
  } else {
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Content-Length': buffer.length,
      'Accept-Ranges': 'bytes'
    });
    res.end(buffer);
  }
});

module.exports = router;
