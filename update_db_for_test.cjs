const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'src/backend/db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Find user with ID 3
const user3 = db.users.find(u => u.id === 3);

if (user3) {
  // If there's an approved submission for ID 2, let's update it to be pending for ID 3
  const sub2 = db.practicalVideoSubmissions.find(s => s.workerId === 2);
  if (sub2) {
    sub2.workerId = 3;
    sub2.workerName = user3.name;
    sub2.skill = user3.skill;
    sub2.status = 'pending';
    sub2.submittedAt = Date.now();
    console.log("Successfully mapped submission to worker 3 and set status to pending");
  } else {
    // Create one if not exists
    db.practicalVideoSubmissions.push({
      status: "pending",
      workerId: 3,
      workerName: user3.name,
      skill: user3.skill,
      videoDataURI: "data:video/webm;base64,GkXfowEAAAAAAAAfQoaBAUL3gQFC8oEEQvOBCEKChHdlYm1Ch4EEQoWBAhhTgGcBAAAAAAAVkhFNm3RALE27i1OrhBVJqWZTrIHfTbuMU6uEFlSua1OsggEwTbuMU6uEHFO7a1OsghV17AEAAAAAAACkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmAQAAAAAAAEUq17GDD0JATYCNTGF2ZjU1LjMzLjEwMFdBjUxhdmY1NS4zMy4xMDBzpJBlrrXf3DCDVB8KcgbMpcr+RImIQJBgAAAAAAAWVK5rAQAAAAAAD++uAQAAAAAAADLXgQFzxYEBnIEAIrWcg3VuZIaFVl9WUDiDgQEj44OEAmJaAOABAAAAAAAABrCBsLqBkK4BAAAAAAAPq9eBAnPFgQKcgQAitZyDdW5khohBX1ZPUkJJU4OBAuEBAAAAAAAAEZ+BArWIQOdwAAAAAABiZIEgY6JPbwIeVgF2b3JiaXMAAAAAAoC7AAAAAAAAgLUBAAAAAAC4AQN2b3JiaXM=",
      submittedAt: Date.now()
    });
    console.log("Created new pending video submission for worker 3");
  }
} else {
  console.log("User 3 not found in DB!");
}

// Write back DB
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log("Database updated successfully");
