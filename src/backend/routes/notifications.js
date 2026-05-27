/**
 * Real-time Notifications via Server-Sent Events (SSE).
 * No external dependencies — uses Node's built-in HTTP streaming.
 *
 * In-memory SSE client registry: Map<userId, Set<Response>>
 * Persistent store: db.json notifications field
 */

const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../utils/db');

// ─── In-memory SSE client registry ────────────────────────────────────────
// Map<userId (string), Set<SSEClient>>
const sseClients = new Map();

/**
 * Push a notification to a user instantly via all their open SSE connections.
 * Also persists it to db.json for reconnecting clients.
 * @param {string} userId
 * @param {{ type: string, message: string }} notification
 */
function pushNotification(userId, notification) {
  const notif = {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: notification.type,
    message: notification.message,
    timestamp: Date.now(),
    read: false,
  };

  // Persist to db
  const db = readDB();
  if (!db.notifications) db.notifications = {};
  if (!db.notifications[userId]) db.notifications[userId] = [];
  db.notifications[userId] = [notif, ...db.notifications[userId]].slice(0, 100); // Keep last 100
  writeDB(db);

  // Push to all open SSE streams for this user
  const clients = sseClients.get(userId);
  if (clients && clients.size > 0) {
    const payload = `event: notification\ndata: ${JSON.stringify(notif)}\n\n`;
    for (const res of clients) {
      try {
        res.write(payload);
      } catch {
        // Client disconnected, remove below
      }
    }
  }
}

// ─── SSE Stream Endpoint ──────────────────────────────────────────────────

// GET /api/notifications/stream/:userId
// Keeps an open SSE connection for the given user
router.get('/stream/:userId', (req, res) => {
  const { userId } = req.params;

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering if proxied
  res.flushHeaders();

  // Send initial heartbeat so client knows connection is live
  res.write('event: connected\ndata: {"status":"connected"}\n\n');

  // Register this client
  if (!sseClients.has(userId)) {
    sseClients.set(userId, new Set());
  }
  sseClients.get(userId).add(res);

  // Heartbeat every 25s to keep connection alive through proxies
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  // Clean up on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    const clients = sseClients.get(userId);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) sseClients.delete(userId);
    }
  });
});

// ─── REST endpoints ────────────────────────────────────────────────────────

// GET /api/notifications/:userId — fetch stored notifications
router.get('/:userId', (req, res) => {
  const db = readDB();
  const notifs = (db.notifications || {})[req.params.userId] || [];
  res.json(notifs);
});

// POST /api/notifications/:userId/read — mark all as read
router.post('/:userId/read', (req, res) => {
  const db = readDB();
  if (!db.notifications) db.notifications = {};
  if (db.notifications[req.params.userId]) {
    db.notifications[req.params.userId] = db.notifications[req.params.userId].map(n => ({ ...n, read: true }));
    writeDB(db);
  }
  res.json({ success: true });
});

// DELETE /api/notifications/:userId — clear all
router.delete('/:userId', (req, res) => {
  const db = readDB();
  if (!db.notifications) db.notifications = {};
  db.notifications[req.params.userId] = [];
  writeDB(db);
  res.json({ success: true });
});

module.exports = { router, pushNotification };
