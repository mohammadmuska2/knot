const fs = require('fs');

let content = fs.readFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', 'utf8');

// 1. Welcome, Administrator
content = content.replace(
  /Welcome, \{authUser\?\.name \?\? "Administrator"\}/g,
  '{t("admin_welcome")} {authUser?.name ?? t("admin_administrator")}'
);

// 2. Refresh
content = content.replace(
  /<RefreshCw className="w-3\.5 h-3\.5" \/>\s*Refresh/g,
  '<RefreshCw className="w-3.5 h-3.5" />\n                {t("admin_refresh")}'
);

// 3. Clear All Data
content = content.replace(
  /<Trash2 className="w-3\.5 h-3\.5" \/>\s*Clear All Data/g,
  '<Trash2 className="w-3.5 h-3.5" />\n                    {t("admin_clear_data")}'
);

// 4. Logout
content = content.replace(
  /<LogOut className="w-3\.5 h-3\.5" \/>\s*Logout/g,
  '<LogOut className="w-3.5 h-3.5" />\n                {t("admin_logout")}'
);

// 5. Practical Approval
content = content.replace(
  /Practical Approval \(\{practicalSubmissions\.length\}\)/g,
  '{t("admin_practical_approval")} ({practicalSubmissions.length})'
);

// 6. ADMIN_TH_CONTACT
content = content.replace(
  />ADMIN_TH_CONTACT</g,
  '>{t("admin_th_contact")}<'
);

// 7. Dynamic location in table
// The table cell renders {worker.location} and {citizen.address}
content = content.replace(
  /\{worker\.location\}/g,
  '<DynamicText text={worker.location || ""} />'
);
content = content.replace(
  /\{citizen\.address\}/g,
  '<DynamicText text={citizen.address || ""} />'
);

// 8. BadgePill translation logic
// Let's add useLang hook inside BadgePill
if (!content.includes('const { t } = useLang();')) {
  content = content.replace(
    /function BadgePill\(\{ level \}: \{ level: string \}\) \{/g,
    'function BadgePill({ level }: { level: string }) {\n  const { t } = useLang();'
  );
  content = content.replace(
    />\s*\{level\}\s*<\/span>/g,
    '>\n        {t(("badge_" + level.toLowerCase()) as any) || level}\n      </span>'
  );
}

// 9. Secure Administrator Access
content = content.replace(
  />\s*Secure Administrator Access\s*<\/p>/g,
  '>\n          {t("admin_secure_access")}\n        </p>'
);

fs.writeFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', content);
console.log("Admin Dashboard updated successfully!");
