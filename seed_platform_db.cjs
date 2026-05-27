const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'src/backend/db.json');

// SHA-256 of "password123"
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const passwordHash = hashPassword('password123');

const mockDb = {
  "users": [
    {
      "id": 1,
      "name": "Alice Worker",
      "location": "Bangalore",
      "skill": "Plumbing",
      "trustScore": 0,
      "endorsementCount": 0,
      "badgeLevel": "None",
      "distance": 8,
      "bio": "Certified commercial plumber with over 5 years of experience in residential leaks, piping, and repairs.",
      "contact": "9876543210",
      "videoURL": "data:video/webm;base64,GkXfowEAAAAAAAAfQoaBAUL3gQFC8oEEQvOBCEKChHdlYm1Ch4EEQoWBAhhTgGcBAAAAAAAVkhFNm3RALE27i1OrhBVJqWZTrIHfTbuMU6uEFlSua1OsggEwTbuMU6uEHFO7a1OsghV17AEAAAAAAACk"
    },
    {
      "id": 2,
      "name": "Bob Carpenter",
      "location": "New York",
      "skill": "Carpentry",
      "trustScore": 4,
      "endorsementCount": 8,
      "badgeLevel": "Silver",
      "distance": 3,
      "bio": "Artisan woodworker specializing in modular furniture, custom study tables, cabinet fittings, and home decor.",
      "contact": "8765432109",
      "videoURL": "data:video/webm;base64,GkXfowEAAAAAAAAfQoaBAUL3gQFC8oEEQvOBCEKChHdlYm1Ch4EEQoWBAhhTgGcBAAAAAAAVkhFNm3RALE27i1OrhBVJqWZTrIHfTbuMU6uEFlSua1OsggEwTbuMU6uEHFO7a1OsghV17AEAAAAAAACk"
    }
  ],
  "citizens": [
    {
      "id": 1,
      "name": "Charlie Citizen",
      "location": "Bangalore",
      "address": "123 Green Glen Layout, Bangalore",
      "trust": 5
    },
    {
      "id": 2,
      "name": "Daisy Citizen",
      "location": "New York",
      "address": "456 Lexington Ave, New York",
      "trust": 5
    }
  ],
  "learningRequests": [
    {
      "id": 1,
      "requesterId": "Charlie Citizen",
      "citizenId": 1,
      "skill": "Plumbing",
      "message": "Need to learn how to fix a slow-draining kitchen sink and replace a basic rubber washer in a leaky faucet.",
      "status": "pending",
      "createdAt": Date.now() - 3600000 * 2
    },
    {
      "id": 2,
      "requesterId": "Daisy Citizen",
      "citizenId": 2,
      "skill": "Carpentry",
      "message": "Looking for some basic tutoring on how to build a small wall shelf and safely operate a manual hand saw.",
      "status": "pending",
      "createdAt": Date.now() - 3600000 * 4
    }
  ],
  "certificationResults": [
    {
      "workerId": 2,
      "skill": "Carpentry",
      "level": "Basic",
      "passed": true,
      "issuedDate": Date.now() - 3600000 * 24,
      "certificateId": "KNOT-1784918239",
      "mcqScore": 90,
      "practicalPassed": true
    }
  ],
  "practicalVideoSubmissions": [
    {
      "status": "pending",
      "workerId": 1,
      "workerName": "Alice Worker",
      "skill": "Plumbing",
      "videoDataURI": "data:video/webm;base64,GkXfowEAAAAAAAAfQoaBAUL3gQFC8oEEQvOBCEKChHdlYm1Ch4EEQoWBAhhTgGcBAAAAAAAVkhFNm3RALE27i1OrhBVJqWZTrIHfTbuMU6uEFlSua1OsggEwTbuMU6uEHFO7a1OsghV17AEAAAAAAACk",
      "submittedAt": Date.now()
    }
  ],
  "videoStore": [],
  "workerCredentials": [
    {
      "userId": 1,
      "username": "alice",
      "passwordHash": passwordHash
    },
    {
      "userId": 2,
      "username": "bob",
      "passwordHash": passwordHash
    }
  ],
  "citizenCredentials": [
    {
      "citizenId": 1,
      "username": "charlie",
      "passwordHash": passwordHash
    },
    {
      "citizenId": 2,
      "username": "daisy",
      "passwordHash": passwordHash
    }
  ],
  "notifications": {},
  "nextUserId": 3,
  "nextCitizenId": 3,
  "nextRequestId": 3
};

fs.writeFileSync(dbPath, JSON.stringify(mockDb, null, 2), 'utf8');
console.log("Database seeded successfully!");
console.log("\nAvailable login accounts (Password is: password123):");
console.log("-----------------------------------------");
console.log("1. Worker Alice (Plumbing, Awaiting Approval) -> Username: alice");
console.log("2. Worker Bob (Carpentry, Approved/Active)     -> Username: bob");
console.log("3. Citizen Charlie (Bangalore)                 -> Username: charlie");
console.log("4. Citizen Daisy (New York)                    -> Username: daisy");
