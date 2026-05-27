const fs = require('fs');

let content = fs.readFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', 'utf8');

// 1. Remove Certified Workers and Practical Approval Tabs
content = content.replace(
  /<TabsTrigger\s+value="certified"\s+className="[^"]*"\s+data-ocid="admin\.tab\.certified"\s*>\s*<Award className="w-4 h-4 mr-2" \/>\s*\{t\("admin_tab_certified"\)\}\s*\(\{certs\.length\}\)\s*<\/TabsTrigger>/g,
  ''
);

content = content.replace(
  /<TabsTrigger\s+value="practical"\s+className="[^"]*"\s+data-ocid="admin\.tab\.practical"\s*>\s*<Video className="w-4 h-4 mr-2" \/>\s*\{t\("admin_practical_approval"\)\}\s*\(\{practicalSubmissions\.length\}\)\s*<\/TabsTrigger>/g,
  ''
);

// 2. Remove the actual TabsContent blocks for certified and practical
// This is trickier with regex, so we'll remove them by matching the start and end of the block.
// Instead of risky regex, I'll use a hack to split the file, or just replace specific strings.
const certifiedStart = '<TabsContent value="certified" className="mt-4">';
const certifiedEnd = '</TabsContent>';
const practicalStart = '<TabsContent value="practical" className="mt-4">';

// We can just wipe out everything from <TabsContent value="certified" to the next </TabsContent> that closes it.
// Actually, it's easier to just match the outer container. Let's find the exact string indices.
let certStartIndex = content.indexOf(certifiedStart);
if (certStartIndex !== -1) {
  let certEndIndex = content.indexOf('</TabsContent>', certStartIndex);
  if (certEndIndex !== -1) {
    content = content.substring(0, certStartIndex) + content.substring(certEndIndex + '</TabsContent>'.length);
  }
}

let pracStartIndex = content.indexOf(practicalStart);
if (pracStartIndex !== -1) {
  let pracEndIndex = content.indexOf('</TabsContent>', pracStartIndex);
  if (pracEndIndex !== -1) {
    content = content.substring(0, pracStartIndex) + content.substring(pracEndIndex + '</TabsContent>'.length);
  }
}

// 3. Fix the ADMIN badge in the title
content = content.replace(
  /<span className="bg-red-500 text-white text-\[10px\] font-bold px-2 py-0\.5 rounded-full uppercase tracking-wider">\s*ADMIN\s*<\/span>/g,
  '<span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{t("admin_badge")}</span>'
);

// 4. Fix the Administrator string
content = content.replace(
  /\{t\("admin_welcome"\)\} \{authUser\?\.name \?\? t\("admin_administrator"\)\}/g,
  '{t("admin_welcome")} {t("admin_administrator")}'
);

// 5. Empty States
content = content.replace(
  />No workers registered yet\.</g,
  '>{t("admin_no_workers")}<'
);
content = content.replace(
  />No citizens registered yet\.</g,
  '>{t("admin_no_citizens")}<'
);
content = content.replace(
  />No learning requests yet\.</g,
  '>{t("admin_no_requests")}<'
);

// 6. Remove certification hooks and imports (optional but good for cleanup)
// We'll leave the hooks for now so we don't break the build if they are referenced elsewhere,
// but we'll remove them in a deeper pass later if needed.

fs.writeFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', content);
console.log("AdminDashboardPage cleaned and translated!");
