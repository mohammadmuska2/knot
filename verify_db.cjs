const fs = require('fs');
const db = JSON.parse(fs.readFileSync('src/backend/db.json', 'utf8'));

console.log("Current Users in DB:", db.users.map(u => u.id));
console.log("Current Videos in DB:", db.practicalVideoSubmissions.length);
db.practicalVideoSubmissions.forEach(s => {
  console.log(`- Worker ${s.workerId}: status=${s.status}, video length=${s.videoDataURI ? s.videoDataURI.length : 0}`);
});
