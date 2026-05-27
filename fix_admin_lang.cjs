const fs = require('fs');

// 1. Update translations.ts
let transContent = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');

const newKeys = `
  badge_none: string;
  badge_bronze: string;
  badge_silver: string;
  badge_gold: string;
  admin_tab_verifications: string;
  admin_verifications_title: string;
  admin_verifications_empty: string;
  admin_verifications_col_worker: string;
  admin_verifications_col_submitted: string;
  admin_verifications_col_actions: string;
  admin_verifications_btn_approve: string;
  admin_verifications_btn_reject: string;
`;

transContent = transContent.replace(/dashboard_log_out: string;/g, `dashboard_log_out: string;${newKeys}`);

// English
transContent = transContent.replace(
  /dashboard_log_out: "Log Out",/g,
  `dashboard_log_out: "Log Out",
  badge_none: "None",
  badge_bronze: "Bronze",
  badge_silver: "Silver",
  badge_gold: "Gold",
  admin_tab_verifications: "Worker Verifications",
  admin_verifications_title: "Pending Video Verifications",
  admin_verifications_empty: "No pending video verifications.",
  admin_verifications_col_worker: "Worker",
  admin_verifications_col_submitted: "Submitted",
  admin_verifications_col_actions: "Actions",
  admin_verifications_btn_approve: "Approve",
  admin_verifications_btn_reject: "Reject",`
);

// Telugu
transContent = transContent.replace(
  /dashboard_log_out: "లాగ్ అవుట్",/g,
  `dashboard_log_out: "లాగ్ అవుట్",
  badge_none: "ఏదీ లేదు",
  badge_bronze: "కాంస్యం",
  badge_silver: "వెండి",
  badge_gold: "బంగారం",
  admin_tab_verifications: "కార్మికుల ధృవీకరణలు",
  admin_verifications_title: "పెండింగ్ వీడియో ధృవీకరణలు",
  admin_verifications_empty: "పెండింగ్ వీడియో ధృవీకరణలు లేవు.",
  admin_verifications_col_worker: "కార్మికుడు",
  admin_verifications_col_submitted: "సమర్పించబడింది",
  admin_verifications_col_actions: "చర్యలు",
  admin_verifications_btn_approve: "ఆమోదించండి",
  admin_verifications_btn_reject: "తిరస్కరించండి",`
);

// Hindi
transContent = transContent.replace(
  /dashboard_log_out: "लॉग आउट",/g,
  `dashboard_log_out: "लॉग आउट",
  badge_none: "कोई नहीं",
  badge_bronze: "कांस्य",
  badge_silver: "रजत",
  badge_gold: "स्वर्ण",
  admin_tab_verifications: "कार्यकर्ता सत्यापन",
  admin_verifications_title: "लंबित वीडियो सत्यापन",
  admin_verifications_empty: "कोई लंबित वीडियो सत्यापन नहीं।",
  admin_verifications_col_worker: "कार्यकर्ता",
  admin_verifications_col_submitted: "प्रस्तुत",
  admin_verifications_col_actions: "कार्रवाई",
  admin_verifications_btn_approve: "स्वीकृत करें",
  admin_verifications_btn_reject: "अस्वीकृत करें",`
);

// Malayalam
transContent = transContent.replace(
  /dashboard_log_out: "ലോഗ് ഔട്ട്",/g,
  `dashboard_log_out: "ലോഗ് ഔട്ട്",
  badge_none: "ഒന്നുമില്ല",
  badge_bronze: "വെങ്കലം",
  badge_silver: "വെള്ളി",
  badge_gold: "സ്വർണ്ണം",
  admin_tab_verifications: "തൊഴിലാളി പരിശോധനകൾ",
  admin_verifications_title: "തീർപ്പുകൽപ്പിക്കാത്ത വീഡിയോ പരിശോധനകൾ",
  admin_verifications_empty: "തീർപ്പുകൽപ്പിക്കാത്ത വീഡിയോ പരിശോധനകളില്ല.",
  admin_verifications_col_worker: "തൊഴിലാളി",
  admin_verifications_col_submitted: "സമർപ്പിച്ചു",
  admin_verifications_col_actions: "പ്രവർത്തനങ്ങൾ",
  admin_verifications_btn_approve: "അംഗീകരിക്കുക",
  admin_verifications_btn_reject: "നിരസിക്കുക",`
);

// Kannada
transContent = transContent.replace(
  /dashboard_log_out: "ಲಾಗ್ ಔಟ್",/g,
  `dashboard_log_out: "ಲಾಗ್ ಔಟ್",
  badge_none: "ಯಾವುದೂ ಇಲ್ಲ",
  badge_bronze: "ಕಂಚು",
  badge_silver: "ಬೆಳ್ಳಿ",
  badge_gold: "ಚಿನ್ನ",
  admin_tab_verifications: "ಕೆಲಸಗಾರರ ಪರಿಶೀಲನೆಗಳು",
  admin_verifications_title: "ಬಾಕಿ ಇರುವ ವೀಡಿಯೊ ಪರಿಶೀಲನೆಗಳು",
  admin_verifications_empty: "ಯಾವುದೇ ಬಾಕಿ ಇರುವ ವೀಡಿಯೊ ಪರಿಶೀಲನೆಗಳಿಲ್ಲ.",
  admin_verifications_col_worker: "ಕೆಲಸಗಾರ",
  admin_verifications_col_submitted: "ಸಲ್ಲಿಸಲಾಗಿದೆ",
  admin_verifications_col_actions: "ಕ್ರಿಯೆಗಳು",
  admin_verifications_btn_approve: "ಅನುಮೋದಿಸಿ",
  admin_verifications_btn_reject: "ತಿರಸ್ಕರಿಸಿ",`
);

fs.writeFileSync('src/frontend/src/utils/translations.ts', transContent);

// 2. Update AdminDashboardPage.tsx
let adminContent = fs.readFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', 'utf8');

adminContent = adminContent.replace(
  'Worker Verifications ({practicalVideos.length})',
  '{t("admin_tab_verifications")} ({practicalVideos.length})'
);
adminContent = adminContent.replace(
  '<CardTitle className="font-display text-base text-white">Pending Video Verifications</CardTitle>',
  '<CardTitle className="font-display text-base text-white">{t("admin_verifications_title")}</CardTitle>'
);
adminContent = adminContent.replace(
  'No pending video verifications.',
  '{t("admin_verifications_empty")}'
);
adminContent = adminContent.replace(
  '<TableHead className="text-slate-400 font-body text-xs uppercase tracking-wider">Worker</TableHead>',
  '<TableHead className="text-slate-400 font-body text-xs uppercase tracking-wider">{t("admin_verifications_col_worker")}</TableHead>'
);
adminContent = adminContent.replace(
  '<TableHead className="text-slate-400 font-body text-xs uppercase tracking-wider">Submitted</TableHead>',
  '<TableHead className="text-slate-400 font-body text-xs uppercase tracking-wider">{t("admin_verifications_col_submitted")}</TableHead>'
);
adminContent = adminContent.replace(
  '<TableHead className="text-slate-400 font-body text-xs uppercase tracking-wider text-right">Actions</TableHead>',
  '<TableHead className="text-slate-400 font-body text-xs uppercase tracking-wider text-right">{t("admin_verifications_col_actions")}</TableHead>'
);
adminContent = adminContent.replace(
  '<Check className="w-4 h-4 mr-1" /> Approve',
  '<Check className="w-4 h-4 mr-1" /> {t("admin_verifications_btn_approve")}'
);
adminContent = adminContent.replace(
  '<X className="w-4 h-4 mr-1" /> Reject',
  '<X className="w-4 h-4 mr-1" /> {t("admin_verifications_btn_reject")}'
);

fs.writeFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', adminContent);

console.log("Admin Dashboard language bug fixed!");
