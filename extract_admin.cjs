const fs = require('fs');

const logPath = 'C:/Users/Lenovo/.gemini/antigravity/brain/a422df18-ec4a-45c5-89b4-772919defaac/.system_generated/logs/overview.txt';
const logs = fs.readFileSync(logPath, 'utf8');
const lines = logs.split('\n');

for (const line of lines) {
  if (line.includes('TOOL_RESPONSE') && line.includes('AdminDashboardPage.tsx') && line.includes('The following code has been modified')) {
    try {
      // The line is a JSON string of the log entry.
      // Wait, the overview.txt lines look like:
      // {"step_index":..., "source":"MODEL", "type":"TOOL_RESPONSE", "tool_calls": [...]}
      // Actually it's just raw text with JSON inside or it's a JSON array.
      // Let's regex extract the 'Showing lines ...' block.
      const match = line.match(/"output":"(.*?)"/);
      if (match) {
        let outputStr = match[1];
        // unescape JSON string
        outputStr = JSON.parse(`"${outputStr}"`);
        if (outputStr.includes('The following code has been modified') && outputStr.includes('AdminDashboardPage.tsx')) {
           // This contains lines from the file
           console.log("FOUND VIEW_FILE RESPONSE");
           // I will just append this block to a file to manually reconstruct if needed
           fs.appendFileSync('d:/knot/admin_blocks.txt', "\n---BLOCK---\n" + outputStr);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
}
