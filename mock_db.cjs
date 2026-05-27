const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'src/backend/db.json');
let db = {
  "users": [
    {
      "id": 1,
      "username": "worker1",
      "passwordHash": "hash",
      "name": "Alice Worker",
      "location": "New York",
      "skill": "Plumbing",
      "distance": 10,
      "bio": "Experienced plumber.",
      "contact": "555-0101",
      "videoURL": "data:video/webm;base64,mock",
      "status": "pending",
      "createdAt": Date.now()
    },
    {
      "id": 2,
      "username": "worker2",
      "passwordHash": "hash",
      "name": "Bob Builder",
      "location": "London",
      "skill": "Carpentry",
      "distance": 5,
      "bio": "Expert carpenter.",
      "contact": "555-0102",
      "videoURL": "data:video/webm;base64,mock",
      "status": "approved",
      "createdAt": Date.now()
    }
  ],
  "citizens": [
    {
      "id": 1,
      "username": "citizen1",
      "passwordHash": "hash",
      "name": "Charlie Citizen",
      "location": "New York"
    }
  ],
  "learningRequests": [
    {
      "id": 1,
      "citizenId": 1,
      "skill": "Plumbing",
      "description": "Need to fix a leak",
      "status": "open",
      "createdAt": Date.now()
    }
  ],
  "certificationResults": [],
  "practicalVideoSubmissions": [
    {
      "status": "pending",
      "workerId": 1,
      "workerName": "Alice Worker",
      "skill": "Plumbing",
      "videoDataURI": "data:video/webm;base64,mockvideo123",
      "submittedAt": Date.now()
    }
  ],
  "videoStore": [],
  "workerCredentials": [],
  "citizenCredentials": [],
  "notifications": {},
  "nextUserId": 3,
  "nextCitizenId": 2,
  "nextRequestId": 2
};

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Database populated with mock data.');
