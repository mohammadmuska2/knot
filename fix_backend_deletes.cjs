const fs = require('fs');

// Patch users.js
let usersContent = fs.readFileSync('src/backend/routes/users.js', 'utf8');
if (!usersContent.includes('router.delete')) {
  const usersDeleteRoute = `
// DELETE /api/users/:id
router.delete('/:id', (req, res) => {
  const { readDB, writeDB } = require('../utils/db');
  const db = readDB();
  const id = parseInt(req.params.id, 10);
  db.users = db.users.filter(u => u.id !== id);
  // Also remove their credentials
  db.workerCredentials = db.workerCredentials.filter(c => c.userId !== id);
  // Remove practical submissions
  db.practicalVideoSubmissions = db.practicalVideoSubmissions.filter(s => s.workerId !== id);
  // Remove certs
  db.certificationResults = db.certificationResults.filter(c => c.workerId !== id);
  writeDB(db);
  res.json({ success: true });
});

module.exports = router;`;
  usersContent = usersContent.replace(/module\.exports = router;[\s\S]*$/, usersDeleteRoute);
  fs.writeFileSync('src/backend/routes/users.js', usersContent);
}

// Patch citizens.js
let citizensContent = fs.readFileSync('src/backend/routes/citizens.js', 'utf8');
if (!citizensContent.includes('router.delete')) {
  const citizensDeleteRoute = `
// DELETE /api/citizens/:id
router.delete('/:id', (req, res) => {
  const { readDB, writeDB } = require('../utils/db');
  const db = readDB();
  const id = parseInt(req.params.id, 10);
  db.citizens = db.citizens.filter(c => c.id !== id);
  // Also remove their credentials
  db.citizenCredentials = db.citizenCredentials.filter(c => c.citizenId !== id);
  writeDB(db);
  res.json({ success: true });
});

module.exports = router;`;
  citizensContent = citizensContent.replace(/module\.exports = router;[\s\S]*$/, citizensDeleteRoute);
  fs.writeFileSync('src/backend/routes/citizens.js', citizensContent);
}

console.log("Delete routes injected successfully!");
