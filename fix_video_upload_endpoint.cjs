const fs = require('fs');

let apiContent = fs.readFileSync('src/frontend/src/utils/api.ts', 'utf8');

// Replace /videos/save with /videos/upload
const updated = apiContent.replace(/"\/videos\/save"/g, '"/videos/upload"');

if (updated !== apiContent) {
  fs.writeFileSync('src/frontend/src/utils/api.ts', updated);
  console.log("Fixed saveWorkerVideo endpoint in api.ts to point to /videos/upload");
} else {
  console.log("Endpoint already fixed or not found.");
}
