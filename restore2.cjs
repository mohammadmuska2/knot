const fs = require('fs');
const logs = fs.readFileSync('C:/Users/Lenovo/.gemini/antigravity/brain/a422df18-ec4a-45c5-89b4-772919defaac/.system_generated/logs/overview.txt', 'utf8');

// We want to extract ALL `TOOL_RESPONSE` outputs for view_file that have `AdminDashboardPage.tsx`
// The structure in overview.txt is JSON.
const lines = logs.split('\n');
const linesMap = {};

for (const line of lines) {
  if (line.includes('TOOL_RESPONSE') && line.includes('AdminDashboardPage.tsx') && line.includes('view_file')) {
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls && obj.tool_calls.length > 0) {
        for (const call of obj.tool_calls) {
          if (call.name === 'view_file' && call.output && call.output.includes('AdminDashboardPage.tsx')) {
            const outLines = call.output.split('\n');
            for (const outLine of outLines) {
              const m = outLine.match(/^(\d+):\s(.*)$/);
              if (m) {
                linesMap[parseInt(m[1])] = m[2];
              }
            }
          }
        }
      }
    } catch (e) {}
  }
}

const maxLine = Math.max(0, ...Object.keys(linesMap).map(Number));
console.log(`Found ${Object.keys(linesMap).length} lines for AdminDashboardPage.tsx, max ${maxLine}`);
if (maxLine > 0) {
  let content = "";
  for (let i = 1; i <= maxLine; i++) {
    content += (linesMap[i] !== undefined ? linesMap[i] : "") + "\n";
  }
  fs.writeFileSync('d:/knot/src/frontend/src/pages/AdminDashboardPage.tsx', content);
  console.log("Restored successfully!");
}
