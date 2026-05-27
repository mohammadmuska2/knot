const fs = require('fs');

let content = fs.readFileSync('src/backend/routes/users.js', 'utf8');

// Add crypto import
content = content.replace(
  "const { pushNotification } = require('./notifications');",
  "const { pushNotification } = require('./notifications');\nconst { encrypt, decrypt } = require('../utils/crypto');\n\n// Helper to decrypt sensitive user fields before sending\nfunction sanitizeUser(u) {\n  if (!u) return u;\n  return { ...u, contact: decrypt(u.contact) };\n}"
);

// Update /api/users
content = content.replace(
  "res.json(sorted);",
  "res.json(sorted.map(sanitizeUser));"
);

// Update /search
content = content.replace(
  "return res.json(sorted);",
  "return res.json(sorted.map(sanitizeUser));"
);
content = content.replace(
  "res.json(results);",
  "res.json(results.map(sanitizeUser));"
);

// Update /skill
content = content.replace(
  "return res.json(db.users.sort((a, b) => rankScore(b) - rankScore(a)));",
  "return res.json(db.users.sort((a, b) => rankScore(b) - rankScore(a)).map(sanitizeUser));"
);

// Update /distance
content = content.replace(
  /res\.json\(results\);/g,
  "res.json(results.map(sanitizeUser));"
);

// Update /stats/:id and /:id
content = content.replace(
  /res\.json\(user\);/g,
  "res.json(sanitizeUser(user));"
);

// Update /find-by-name
content = content.replace(
  /res\.json\(user \|\| null\);/g,
  "res.json(user ? sanitizeUser(user) : null);"
);

// Update /register
content = content.replace(
  "contact: contact || '',",
  "contact: encrypt(contact || ''),"
);

// Update /login
content = content.replace(
  "res.json({ ...user, token });",
  "res.json({ ...sanitizeUser(user), token });"
);

fs.writeFileSync('src/backend/routes/users.js', content);
console.log("users.js updated with encryption!");
