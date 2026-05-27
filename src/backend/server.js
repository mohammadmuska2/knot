const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '500mb' })); // large for base64 video

// ── Tunnel bypass headers (localtunnel + ngrok) ──────────────────────────────
// These tell localtunnel and ngrok NOT to show their interstitial/warning pages
// for any request — so the site works perfectly when tunnelled.
app.use((req, res, next) => {
  res.setHeader('bypass-tunnel-reminder', 'true');
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/citizens', require('./routes/citizens'));
app.use('/api/learning-requests', require('./routes/learning'));
app.use('/api/certification', require('./routes/certification'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/admin', require('./routes/admin'));
const { router: notificationsRouter } = require('./routes/notifications');
app.use('/api/notifications', notificationsRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── Serve built frontend static files ────────────────────────────────────────
// The frontend is built with `vite build` into src/frontend/dist.
// Express serves those static files so the entire app runs from one port.
const FRONTEND_DIST = path.join(__dirname, '../frontend/dist');
app.use(express.static(FRONTEND_DIST));

// For React Router — serve index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`KNOT backend running on port ${PORT}`));
