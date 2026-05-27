const fs = require('fs');
const db = JSON.parse(fs.readFileSync('src/backend/db.json', 'utf8'));

console.log("Total Users:", db.users.length);
db.users.forEach(u => console.log(`User ${u.id} - ${u.name}`));

console.log("Total Practical Submissions:", db.practicalVideoSubmissions.length);
db.practicalVideoSubmissions.forEach(s => console.log(`Submission ${s.workerId} - Status: ${s.status}`));

// Now strip the Base64 strings to fix the DB size
let sizeReduced = false;
db.users.forEach(u => {
  if (u.videoURL && u.videoURL.length > 1000) {
    u.videoURL = "OVERSIZED_BASE64_STRING_REMOVED_FOR_DEBUGGING";
    sizeReduced = true;
  }
});

db.practicalVideoSubmissions.forEach(s => {
  if (s.videoDataURI && s.videoDataURI.length > 1000) {
    s.videoDataURI = "OVERSIZED_BASE64_STRING_REMOVED_FOR_DEBUGGING";
    sizeReduced = true;
  }
});

if (sizeReduced) {
  fs.writeFileSync('src/backend/db.json', JSON.stringify(db, null, 2));
  console.log("DB Size Reduced Successfully!");
}
