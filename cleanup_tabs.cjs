const fs = require('fs');
let content = fs.readFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', 'utf8');

// Find all occurrences of the practical tab content and remove the duplicate
const parts = content.split('<TabsContent value="practical">');
if (parts.length > 2) {
  console.log("Found duplicate practical tabs, cleaning up...");
  // Keep everything up to the first practical tab content, plus the first one.
  // We'll just replace the second one onwards with nothing.
  
  // A cleaner way is just to use regex to remove the second block
  const blockRegex = /\{\/\* Worker Verification \(Practical Approval\) Table \*\/\}\s*<TabsContent value="practical">[\s\S]*?<\/TabsContent>/g;
  
  const matches = content.match(blockRegex);
  if (matches && matches.length > 1) {
    // Replace all but the first one
    for (let i = 1; i < matches.length; i++) {
      content = content.replace(matches[i], '');
    }
    fs.writeFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', content);
    console.log("Cleaned up duplicate tabs.");
  }
}
