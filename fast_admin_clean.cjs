const fs = require('fs');

let content = fs.readFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', 'utf8');

// Fix ADMIN badge in Header
content = content.replace(
  /<Badge className="bg-red-600 text-white text-\[10px\] px-1\.5 py-0 font-body font-bold border-0">\s*ADMIN\s*<\/Badge>/g,
  '<Badge className="bg-red-600 text-white text-[10px] px-1.5 py-0 font-body font-bold border-0">{t("admin_badge")}</Badge>'
);

// Fix Welcome, Administrator
content = content.replace(
  /\{t\("admin_welcome"\)\} \{authUser\?\.name \?\? t\("admin_administrator"\)\}/g,
  '{t("admin_welcome")} {t("admin_administrator")}'
);

// Fix Empty States
content = content.replace(
  /No workers registered yet\./g,
  '{t("admin_no_workers")}'
);
content = content.replace(
  /No citizens registered yet\./g,
  '{t("admin_no_citizens")}'
);
content = content.replace(
  /No learning requests yet\./g,
  '{t("admin_no_requests")}'
);

// Remove StatCard for Certified Workers
// <StatCard icon={Award} label={t("admin_stat_certified")} ... />
const statCardRegex = /<StatCard\s*icon=\{Award\}\s*label=\{t\("admin_stat_certified"\)\}\s*value=\{[^}]*\}\s*colorClass="[^"]*"\s*bgClass="[^"]*"\s*\/>/g;
content = content.replace(statCardRegex, '');

// Remove TabsTriggers
const certTabRegex = /<TabsTrigger\s*value="certs"[^>]*>[\s\S]*?<\/TabsTrigger>/g;
content = content.replace(certTabRegex, '');

const practicalTabRegex = /<TabsTrigger\s*value="practical"[^>]*>[\s\S]*?<\/TabsTrigger>/g;
content = content.replace(practicalTabRegex, '');

// Remove TabsContents
function removeTabsContent(value) {
  const startStr = `<TabsContent value="${value}"`;
  let startIndex = content.indexOf(startStr);
  if (startIndex === -1) return;
  
  // Find the matching </TabsContent>
  // We'll search for the next </TabsContent>
  let endIndex = content.indexOf('</TabsContent>', startIndex);
  if (endIndex !== -1) {
    content = content.substring(0, startIndex) + content.substring(endIndex + '</TabsContent>'.length);
  }
}

removeTabsContent('certs');
removeTabsContent('practical');

fs.writeFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', content);
console.log("AdminDashboardPage forcefully cleaned!");
