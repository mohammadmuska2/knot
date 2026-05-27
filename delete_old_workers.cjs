const fs = require('fs');
const db = JSON.parse(fs.readFileSync('src/backend/db.json', 'utf8'));

db.users = db.users.filter(u => ![5, 6, 7].includes(u.id));
db.practicalVideoSubmissions = db.practicalVideoSubmissions.filter(s => ![5, 6, 7].includes(s.workerId));
db.workerCredentials = db.workerCredentials.filter(c => ![5, 6, 7].includes(c.userId));

fs.writeFileSync('src/backend/db.json', JSON.stringify(db, null, 2));
console.log("Deleted workers 5, 6, 7");
