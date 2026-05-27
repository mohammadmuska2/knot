const fs = require('fs');
const dbPath = 'src/backend/db.json';

try {
  const raw = fs.readFileSync(dbPath, 'utf8');
  const db = JSON.parse(raw);
  
  // Clear out all users, citizens, credentials, and videos
  db.users = [];
  db.citizens = [];
  db.workerCredentials = [];
  db.citizenCredentials = [];
  db.practicalVideoSubmissions = [];
  db.certificationResults = [];
  
  // Write it back
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log("Database cleared successfully!");
} catch (err) {
  console.error("Error clearing DB:", err);
}
