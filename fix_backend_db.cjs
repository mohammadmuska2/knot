const fs = require('fs');

// Patch videos.js
let videosContent = fs.readFileSync('src/backend/routes/videos.js', 'utf8');
videosContent = videosContent.replace(
  "const db = require('../utils/db');",
  "const { readDB, writeDB } = require('../utils/db');"
);
videosContent = videosContent.replace(
  "    const user = db.users.find(u => u.id === workerId);",
  "    const dbData = readDB();\n    const user = dbData.users.find(u => u.id === workerId);"
);
videosContent = videosContent.replace(/db\.practicalVideoSubmissions/g, 'dbData.practicalVideoSubmissions');
videosContent = videosContent.replace(
  "fs.writeFileSync(path.join(__dirname, '../db.json'), JSON.stringify(db, null, 2));",
  "writeDB(dbData);"
);
videosContent = videosContent.replace(
  "const user = db.users.find(u => u.id === workerId);",
  "const dbData = readDB();\n  const user = dbData.users.find(u => u.id === workerId);"
);
fs.writeFileSync('src/backend/routes/videos.js', videosContent);

// Patch certification.js
let certContent = fs.readFileSync('src/backend/routes/certification.js', 'utf8');
certContent = certContent.replace(
  "const db = require('../utils/db');",
  "const { readDB, writeDB } = require('../utils/db');"
);
certContent = certContent.replace(/db\.practicalVideoSubmissions/g, 'dbData.practicalVideoSubmissions');
certContent = certContent.replace(/db\.certificationResults/g, 'dbData.certificationResults');
certContent = certContent.replace(
  "const pending = dbData.practicalVideoSubmissions.filter",
  "const dbData = readDB();\n    const pending = dbData.practicalVideoSubmissions.filter"
);
certContent = certContent.replace(
  "const workerId = Number(req.params.workerId);",
  "const workerId = Number(req.params.workerId);\n    const dbData = readDB();"
);
certContent = certContent.replace(
  /fs\.writeFileSync\(DB_PATH, JSON\.stringify\(db, null, 2\)\);/g,
  "writeDB(dbData);"
);
fs.writeFileSync('src/backend/routes/certification.js', certContent);

console.log("Backend DB access bugs fixed!");
