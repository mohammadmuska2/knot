const fs = require('fs');
let content = fs.readFileSync('src/backend/routes/admin.js', 'utf8');

// Remove plaintext declaration
content = content.replace(/const ADMIN_PASSWORD_PLAINTEXT = 'knot@admin2026';\r?\n?/g, '');

// Remove plaintext check
content = content.replace(
  /\(passwordHash === ADMIN_PASSWORD_HASH \|\| passwordHash === ADMIN_PASSWORD_PLAINTEXT\)/g,
  'passwordHash === ADMIN_PASSWORD_HASH'
);

fs.writeFileSync('src/backend/routes/admin.js', content);
console.log('Enforced SHA-256 for admin login!');
