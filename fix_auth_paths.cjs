const fs = require('fs');

function fixAuthPath(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const updated = content.replace(/require\('\.\.\/utils\/auth'\)/g, "require('../middleware/auth')");
  if (updated !== content) {
    fs.writeFileSync(filePath, updated);
    console.log("Fixed auth path in", filePath);
  } else {
    console.log("Auth path already correct in", filePath);
  }
}

fixAuthPath('src/backend/routes/certification.js');
fixAuthPath('src/backend/routes/videos.js');
