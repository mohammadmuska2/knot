const fs = require('fs');
let content = fs.readFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', 'utf8');

// Replace table headers using robust regex string
const headerReplacements = [
  ['>\\s*ID\\s*<\\/TableHead>', '>{t("admin_th_id")}</TableHead>'],
  ['>\\s*Name\\s*<\\/TableHead>', '>{t("admin_th_name")}</TableHead>'],
  ['>\\s*Skill\\s*<\\/TableHead>', '>{t("admin_th_skill")}</TableHead>'],
  ['>\\s*Location\\s*<\\/TableHead>', '>{t("admin_th_location")}</TableHead>'],
  ['>\\s*Badge\\s*<\\/TableHead>', '>{t("admin_th_badge")}</TableHead>'],
  ['>\\s*Trust\\s*<\\/TableHead>', '>{t("admin_th_trust")}</TableHead>'],
  ['>\\s*Endorsements\\s*<\\/TableHead>', '>{t("admin_th_endorsements")}</TableHead>'],
  ['>\\s*Contact\\s*<\\/TableHead>', '>{t("admin_th_contact", "Contact")}</TableHead>'],
  ['>\\s*Requester\\s*<\\/TableHead>', '>{t("admin_th_requester")}</TableHead>'],
  ['>\\s*Target Worker\\s*<\\/TableHead>', '>{t("admin_th_target")}</TableHead>'],
  ['>\\s*Message\\s*<\\/TableHead>', '>{t("admin_th_message")}</TableHead>'],
  ['>\\s*Time\\s*<\\/TableHead>', '>{t("admin_th_time")}</TableHead>'],
  ['>\\s*Worker\\s*<\\/TableHead>', '>{t("admin_th_worker")}</TableHead>'],
  ['>\\s*Video\\s*<\\/TableHead>', '>{t("admin_th_video")}</TableHead>'],
  ['>\\s*Status\\s*<\\/TableHead>', '>{t("admin_th_status")}</TableHead>'],
  ['>\\s*Actions\\s*<\\/TableHead>', '>{t("admin_th_actions")}</TableHead>'],
  ['>\\s*Certificate ID\\s*<\\/TableHead>', '>{t("admin_th_cert_id")}</TableHead>'],
  ['>\\s*Level\\s*<\\/TableHead>', '>{t("admin_th_level")}</TableHead>'],
  ['>\\s*MCQ Score\\s*<\\/TableHead>', '>{t("admin_th_mcq")}</TableHead>'],
  ['>\\s*Certified On\\s*<\\/TableHead>', '>{t("admin_th_issued")}</TableHead>']
];

for (const [find, replace] of headerReplacements) {
  content = content.replace(new RegExp(find, 'g'), replace);
}

// Ensure getTranslatedSkillName is imported
if (!content.includes('getTranslatedSkillName')) {
  content = content.replace('import { clearAuthUser, getAuthUser } from "../utils/auth";', 'import { clearAuthUser, getAuthUser } from "../utils/auth";\nimport { getTranslatedSkillName } from "../utils/translations";');
}

// Replace skill display with translated skill display
content = content.replace(/\{worker\.skill\}/g, '{getTranslatedSkillName(worker.skill, t)}');
content = content.replace(/\{cert\.skill\}/g, '{getTranslatedSkillName(cert.skill, t)}');

// Fix the card titles which are hardcoded "Registered Workers", etc.
content = content.replace(/>\s*Registered Workers\s*<\/CardTitle>/g, '>{t("admin_tab_workers")}</CardTitle>');
content = content.replace(/>\s*Registered Citizens\s*<\/CardTitle>/g, '>{t("admin_tab_citizens")}</CardTitle>');
content = content.replace(/>\s*Learning Requests\s*<\/CardTitle>/g, '>{t("admin_tab_requests")}</CardTitle>');
content = content.replace(/>\s*Practical Video Submissions\s*<\/CardTitle>/g, '>{t("admin_tab_practical")}</CardTitle>');
content = content.replace(/>\s*Platform Certifications\s*<\/CardTitle>/g, '>{t("admin_tab_certified")}</CardTitle>');

fs.writeFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', content);
console.log('Headers and Skills fixed!');
