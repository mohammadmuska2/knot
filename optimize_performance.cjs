const fs = require('fs');

function removeRefetchInterval(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Remove lines like: refetchInterval: 1000 * 15,
  const updated = content.replace(/\s*refetchInterval:\s*\d+\s*\*\s*\d+,?/g, '');
  if (updated !== content) {
    fs.writeFileSync(filePath, updated);
    console.log("Removed refetchIntervals from " + filePath);
  } else {
    console.log("No refetchIntervals found in " + filePath);
  }
}

removeRefetchInterval('src/frontend/src/pages/AdminDashboardPage.tsx');
removeRefetchInterval('src/frontend/src/pages/WorkerDashboardPage.tsx');

console.log("Performance optimization complete!");
