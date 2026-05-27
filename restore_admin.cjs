const fs = require('fs');

const logPath = 'C:/Users/Lenovo/.gemini/antigravity/brain/a422df18-ec4a-45c5-89b4-772919defaac/.system_generated/logs/overview.txt';
const logs = fs.readFileSync(logPath, 'utf8');

const reconstructedLines = {};

// We can search for all occurrences of "The following code has been modified" and "AdminDashboardPage.tsx"
// Since the file is huge, let's just use regex on the whole file to find view_file output blocks
const regex = /"name":"view_file","output":"(.*?)"/gs;
let match;
while ((match = regex.exec(logs)) !== null) {
  let outputStr = match[1];
  if (outputStr.includes('AdminDashboardPage.tsx') && outputStr.includes('The following code has been modified')) {
    // Unescape the string properly
    try {
      const parsed = JSON.parse(`"${outputStr}"`);
      const lines = parsed.split('\n');
      for (const line of lines) {
        const lineMatch = line.match(/^(\d+):\s(.*)$/);
        if (lineMatch) {
          reconstructedLines[parseInt(lineMatch[1], 10)] = lineMatch[2];
        }
      }
    } catch (e) {}
  }
}

const maxLine = Math.max(...Object.keys(reconstructedLines).map(Number));
let finalContent = "";
for (let i = 1; i <= maxLine; i++) {
  finalContent += (reconstructedLines[i] !== undefined ? reconstructedLines[i] : "") + "\n";
}

fs.writeFileSync('d:/knot/src/frontend/src/pages/AdminDashboardPage.tsx', finalContent);
console.log(`Restored AdminDashboardPage.tsx with ${Object.keys(reconstructedLines).length} lines, up to line ${maxLine}`);
