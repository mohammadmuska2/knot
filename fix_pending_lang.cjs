const fs = require('fs');

// 1. Update translations.ts
let transContent = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');

// Add to interface
transContent = transContent.replace(
  /dashboard_badge_progress: string;/g,
  'dashboard_badge_progress: string;\n  dashboard_pending_title: string;\n  dashboard_pending_desc: string;\n  dashboard_refresh_status: string;\n  dashboard_log_out: string;'
);

// English
transContent = transContent.replace(
  /dashboard_badge_progress: "Badge Progress",/g,
  'dashboard_badge_progress: "Badge Progress",\n  dashboard_pending_title: "Registration Pending",\n  dashboard_pending_desc: "Your registration is currently under review by our administration team. Please wait for some time to get approved.",\n  dashboard_refresh_status: "Refresh Status",\n  dashboard_log_out: "Log Out",'
);

// Telugu
transContent = transContent.replace(
  /dashboard_badge_progress: "బ్యాడ్జ్ పురోగతి",/g,
  'dashboard_badge_progress: "బ్యాడ్జ్ పురోగతి",\n  dashboard_pending_title: "నమోదు పెండింగ్‌లో ఉంది",\n  dashboard_pending_desc: "మీ నమోదు ప్రస్తుతం మా అడ్మినిస్ట్రేషన్ బృందం పరిశీలనలో ఉంది. దయచేసి ఆమోదం పొందడానికి కొంత సమయం వేచి ఉండండి.",\n  dashboard_refresh_status: "స్థితిని రిఫ్రెష్ చేయండి",\n  dashboard_log_out: "లాగ్ అవుట్",'
);

// Hindi
transContent = transContent.replace(
  /dashboard_badge_progress: "बैज प्रगति",/g,
  'dashboard_badge_progress: "बैज प्रगति",\n  dashboard_pending_title: "पंजीकरण लंबित है",\n  dashboard_pending_desc: "आपका पंजीकरण वर्तमान में हमारी प्रशासन टीम द्वारा समीक्षाधीन है। कृपया स्वीकृत होने के लिए कुछ समय प्रतीक्षा करें।",\n  dashboard_refresh_status: "स्थिति ताज़ा करें",\n  dashboard_log_out: "लॉग आउट",'
);

// Malayalam
transContent = transContent.replace(
  /dashboard_badge_progress: "ബാഡ്ജ് പുരോഗതി",/g,
  'dashboard_badge_progress: "ബാഡ്ജ് പുരോഗതി",\n  dashboard_pending_title: "രജിസ്ട്രേഷൻ തീർപ്പുകൽപ്പിച്ചിട്ടില്ല",\n  dashboard_pending_desc: "നിങ്ങളുടെ രജിസ്ട്രേഷൻ നിലവിൽ ഞങ്ങളുടെ അഡ്മിനിസ്ട്രേഷൻ ടീമിന്റെ അവലോകനത്തിലാണ്. അംഗീകാരം ലഭിക്കാൻ ദയവായി കുറച്ച് സമയം കാത്തിരിക്കുക.",\n  dashboard_refresh_status: "സ്റ്റാറ്റസ് പുതുക്കുക",\n  dashboard_log_out: "ലോഗ് ഔട്ട്",'
);

// Kannada
transContent = transContent.replace(
  /dashboard_badge_progress: "ಬ್ಯಾಡ್ಜ್ ಪ್ರಗತಿ",/g,
  'dashboard_badge_progress: "ಬ್ಯಾಡ್ಜ್ ಪ್ರಗತಿ",\n  dashboard_pending_title: "ನೋಂದಣಿ ಬಾಕಿ ಇದೆ",\n  dashboard_pending_desc: "ನಿಮ್ಮ ನೋಂದಣಿಯನ್ನು ಪ್ರಸ್ತುತ ನಮ್ಮ ಆಡಳಿತ ತಂಡವು ಪರಿಶೀಲಿಸುತ್ತಿದೆ. ಅನುಮೋದನೆ ಪಡೆಯಲು ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯ ಕಾಯಿರಿ.",\n  dashboard_refresh_status: "ಸ್ಥಿತಿಯನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಿ",\n  dashboard_log_out: "ಲಾಗ್ ಔಟ್",'
);

fs.writeFileSync('src/frontend/src/utils/translations.ts', transContent);

// 2. Update WorkerDashboardPage.tsx
let workerContent = fs.readFileSync('src/frontend/src/pages/WorkerDashboardPage.tsx', 'utf8');

workerContent = workerContent.replace(
  '<h1 className="font-display font-bold text-2xl text-white mb-3">Registration Pending</h1>',
  '<h1 className="font-display font-bold text-2xl text-white mb-3">{t("dashboard_pending_title")}</h1>'
);
workerContent = workerContent.replace(
  '<p className="font-body text-slate-400 mb-6">\n            Your registration is currently under review by our administration team. Please wait for some time to get approved.\n          </p>',
  '<p className="font-body text-slate-400 mb-6">\n            {t("dashboard_pending_desc")}\n          </p>'
);
workerContent = workerContent.replace(
  '<RefreshCw className="w-4 h-4 mr-2" /> Refresh Status',
  '<RefreshCw className="w-4 h-4 mr-2" /> {t("dashboard_refresh_status")}'
);
workerContent = workerContent.replace(
  /Log Out\s*<\/Button>/g,
  '{t("dashboard_log_out")}\n            </Button>'
);

// Also fix the button text visibility on light themes. We'll remove text-white from variant="outline" because it inherits the text color properly, or we explicitly use text-foreground.
workerContent = workerContent.replace(
  /className="w-full border-slate-700 hover:bg-slate-800 text-white"/g,
  'className="w-full border-slate-700 hover:bg-slate-800 text-foreground"'
);

fs.writeFileSync('src/frontend/src/pages/WorkerDashboardPage.tsx', workerContent);

console.log("Translations added to the Pending state!");
