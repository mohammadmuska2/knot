const fs = require('fs');

// 1. Fix db.json
let dbContent = fs.readFileSync('src/backend/db.json', 'utf8');
dbContent = dbContent.replace(/"address": "pakisthan"/g, '"address": "pakistan"');
fs.writeFileSync('src/backend/db.json', dbContent);

// 2. Fix helpers.tsx
let helpersContent = fs.readFileSync('src/frontend/src/utils/helpers.tsx', 'utf8');
helpersContent = helpersContent.replace(/"pakisthan": "loc_pakisthan"/g, '"pakistan": "loc_pakistan"');
fs.writeFileSync('src/frontend/src/utils/helpers.tsx', helpersContent);

// 3. Fix translations.ts
let transContent = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');
transContent = transContent.replace(/loc_pakisthan/g, 'loc_pakistan');
transContent = transContent.replace(/: "pakisthan"/g, ': "pakistan"');
fs.writeFileSync('src/frontend/src/utils/translations.ts', transContent);

console.log("Typo fixed across db.json, helpers.tsx, and translations.ts!");
