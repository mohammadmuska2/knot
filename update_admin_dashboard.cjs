const fs = require('fs');
let content = fs.readFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', 'utf8');

const replacements = [
  ['label="Total Workers"', 'label={t("admin_stat_workers")}'],
  ['label="Total Citizens"', 'label={t("admin_stat_citizens")}'],
  ['label="Certified Workers"', 'label={t("admin_stat_certified")}'],
  ['label="Learning Requests"', 'label={t("admin_stat_requests")}'],
  ['>Refresh<', '>{t("admin_refresh")}<'],
  ['>Clear All Data<', '>{t("admin_clear_data")}<'],
  ['>Cancel<', '>{t("admin_cancel")}<'],
  ['>Logout<', '>{t("nav_logout")}<'], // using nav_logout
  ['Workers ({workers.length})', '{t("admin_tab_workers")} ({workers.length})'],
  ['Citizens ({citizens.length})', '{t("admin_tab_citizens")} ({citizens.length})'],
  ['Requests ({requests.length})', '{t("admin_tab_requests")} ({requests.length})'],
  ['Practical Videos ({practicalVideos.length})', '{t("admin_tab_practical")} ({practicalVideos.length})'],
  ['Certified ({certs.length})', '{t("admin_tab_certified")} ({certs.length})'],
  ['>ID<', '>{t("admin_th_id")}<'],
  ['>Name<', '>{t("admin_th_name")}<'],
  ['>Skill<', '>{t("admin_th_skill")}<'],
  ['>Location<', '>{t("admin_th_location")}<'],
  ['>Trust Score<', '>{t("admin_th_trust")}<'],
  ['>Endorsements<', '>{t("admin_th_endorsements")}<'],
  ['>Badge Level<', '>{t("admin_th_badge")}<'],
  ['>Username<', '>{t("admin_th_username")}<'],
  ['>Address<', '>{t("admin_th_address")}<'],
  ['>Requester<', '>{t("admin_th_requester")}<'],
  ['>Target Worker<', '>{t("admin_th_target")}<'],
  ['>Message<', '>{t("admin_th_message")}<'],
  ['>Time<', '>{t("admin_th_time")}<'],
  ['>Worker<', '>{t("admin_th_worker")}<'],
  ['>Video<', '>{t("admin_th_video")}<'],
  ['>MCQ Score<', '>{t("admin_th_mcq")}<'],
  ['>Status<', '>{t("admin_th_status")}<'],
  ['>Actions<', '>{t("admin_th_actions")}<'],
  ['>Certificate ID<', '>{t("admin_th_cert_id")}<'],
  ['>Issued<', '>{t("admin_th_issued")}<'],
  ['>Level<', '>{t("admin_th_level")}<'],
  ['>Approve<', '>{t("admin_btn_approve")}<'],
  ['>Reject<', '>{t("admin_btn_reject")}<'],
];

for (const [find, replace] of replacements) {
  content = content.split(find).join(replace);
}

fs.writeFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', content);
console.log('Admin Dashboard translations applied.');
