const fs = require('fs');

let adminContent = fs.readFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', 'utf8');

// Replace {idx + 1} with {worker.id.toString()} for the ID column in the workers table
const updated = adminContent.replace(
  /<TableCell className="text-slate-500 font-mono text-xs">\s*\{idx \+ 1\}\s*<\/TableCell>/g,
  '<TableCell className="text-slate-500 font-mono text-xs">\n                                {worker.id.toString()}\n                              </TableCell>'
);

if (updated !== adminContent) {
  fs.writeFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', updated);
  console.log("Fixed worker ID display in AdminDashboardPage.tsx");
} else {
  console.log("Could not find the target string.");
}
