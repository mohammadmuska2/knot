const fs = require('fs');
let content = fs.readFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', 'utf8');

const regexReplacements = [
  [/([>\\n\\s]+)ID([<\\n\\s]+)/g, '$1{t("admin_th_id")}$2'],
  [/([>\\n\\s]+)Name([<\\n\\s]+)/g, '$1{t("admin_th_name")}$2'],
  [/([>\\n\\s]+)Skill([<\\n\\s]+)/g, '$1{t("admin_th_skill")}$2'],
  [/([>\\n\\s]+)Location([<\\n\\s]+)/g, '$1{t("admin_th_location")}$2'],
  [/([>\\n\\s]+)Trust([<\\n\\s]+)/g, '$1{t("admin_th_trust")}$2'],
  [/([>\\n\\s]+)Endorsements([<\\n\\s]+)/g, '$1{t("admin_th_endorsements")}$2'],
  [/([>\\n\\s]+)Badge([<\\n\\s]+)/g, '$1{t("admin_th_badge")}$2'],
  [/([>\\n\\s]+)Contact([<\\n\\s]+)/g, '$1Contact$2'], // Leaving contact as is since it wasn't requested initially, or I can translate it too but wait, I didn't add admin_th_contact.
  [/([>\\n\\s]+)Username([<\\n\\s]+)/g, '$1{t("admin_th_username")}$2'],
  [/([>\\n\\s]+)Address([<\\n\\s]+)/g, '$1{t("admin_th_address")}$2'],
  [/([>\\n\\s]+)Requester([<\\n\\s]+)/g, '$1{t("admin_th_requester")}$2'],
  [/([>\\n\\s]+)Target Worker([<\\n\\s]+)/g, '$1{t("admin_th_target")}$2'],
  [/([>\\n\\s]+)Message([<\\n\\s]+)/g, '$1{t("admin_th_message")}$2'],
  [/([>\\n\\s]+)Time([<\\n\\s]+)/g, '$1{t("admin_th_time")}$2'],
  [/([>\\n\\s]+)Worker([<\\n\\s]+)/g, '$1{t("admin_th_worker")}$2'],
  [/([>\\n\\s]+)Video([<\\n\\s]+)/g, '$1{t("admin_th_video")}$2'],
  [/([>\\n\\s]+)MCQ Score([<\\n\\s]+)/g, '$1{t("admin_th_mcq")}$2'],
  [/([>\\n\\s]+)Status([<\\n\\s]+)/g, '$1{t("admin_th_status")}$2'],
  [/([>\\n\\s]+)Actions([<\\n\\s]+)/g, '$1{t("admin_th_actions")}$2'],
  [/([>\\n\\s]+)Certificate ID([<\\n\\s]+)/g, '$1{t("admin_th_cert_id")}$2'],
  [/([>\\n\\s]+)Issued([<\\n\\s]+)/g, '$1{t("admin_th_issued")}$2'],
  [/([>\\n\\s]+)Level([<\\n\\s]+)/g, '$1{t("admin_th_level")}$2'],
  [/([>\\n\\s]+)Approve([<\\n\\s]+)/g, '$1{t("admin_btn_approve")}$2'],
  [/([>\\n\\s]+)Reject([<\\n\\s]+)/g, '$1{t("admin_btn_reject")}$2'],
  [/([>\\n\\s]+)Pending([<\\n\\s]+)/g, '$1{t("admin_status_pending")}$2'],
  [/([>\\n\\s]+)Approved([<\\n\\s]+)/g, '$1{t("admin_status_approved")}$2'],
  [/([>\\n\\s]+)Rejected([<\\n\\s]+)/g, '$1{t("admin_status_rejected")}$2']
];

for (const [find, replace] of regexReplacements) {
  content = content.replace(find, replace);
}

fs.writeFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', content);
console.log('Admin Dashboard Regex translations applied.');
