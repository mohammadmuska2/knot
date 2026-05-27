const fs = require('fs');
const logs = fs.readFileSync('C:/Users/Lenovo/.gemini/antigravity/brain/a422df18-ec4a-45c5-89b4-772919defaac/.system_generated/logs/overview.txt', 'utf8');
const lines = logs.split('\n');

function extractFile(fileName, outName) {
  const matches = lines.filter(l => l.includes('TOOL_RESPONSE') && l.includes(fileName) && l.includes('view_file'));
  if (matches.length > 0) {
    fs.writeFileSync(`d:/knot/${outName}`, matches.join('\n'));
    console.log(`Extracted ${matches.length} tool responses for ${fileName}`);
  }
}

extractFile('users.js', 'users_logs.txt');
extractFile('AdminDashboardPage.tsx', 'admin_logs.txt');
