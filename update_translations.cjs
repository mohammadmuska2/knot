const fs = require('fs');
let content = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');

const interfaceAdditions = `
  admin_panel_title: string;
  admin_welcome: string;
  admin_refresh: string;
  admin_clear_data: string;
  admin_clear_warning: string;
  admin_cancel: string;
  admin_continue: string;
  admin_stat_workers: string;
  admin_stat_citizens: string;
  admin_stat_certified: string;
  admin_stat_requests: string;
  admin_tab_dashboard: string;
  admin_tab_workers: string;
  admin_tab_citizens: string;
  admin_tab_requests: string;
  admin_tab_practical: string;
  admin_tab_certified: string;
  admin_th_id: string;
  admin_th_name: string;
  admin_th_skill: string;
  admin_th_location: string;
  admin_th_trust: string;
  admin_th_endorsements: string;
  admin_th_badge: string;
  admin_th_username: string;
  admin_th_address: string;
  admin_th_requester: string;
  admin_th_target: string;
  admin_th_message: string;
  admin_th_time: string;
  admin_th_worker: string;
  admin_th_video: string;
  admin_th_mcq: string;
  admin_th_status: string;
  admin_th_actions: string;
  admin_th_cert_id: string;
  admin_th_issued: string;
  admin_th_level: string;
  admin_btn_approve: string;
  admin_btn_reject: string;
  admin_status_pending: string;
  admin_status_approved: string;
  admin_status_rejected: string;`;

const additions = {
  en: `  admin_panel_title: "Admin Panel",
  admin_welcome: "Welcome,",
  admin_refresh: "Refresh",
  admin_clear_data: "Clear All Data",
  admin_clear_warning: "This will permanently delete all users, citizens, learning requests, and certifications. This action cannot be undone.",
  admin_cancel: "Cancel",
  admin_continue: "Continue",
  admin_stat_workers: "Total Workers",
  admin_stat_citizens: "Total Citizens",
  admin_stat_certified: "Certified Workers",
  admin_stat_requests: "Learning Requests",
  admin_tab_dashboard: "Dashboard Overview",
  admin_tab_workers: "Workers",
  admin_tab_citizens: "Citizens",
  admin_tab_requests: "Learning Requests",
  admin_tab_practical: "Practical Videos",
  admin_tab_certified: "Certified Workers",
  admin_th_id: "ID",
  admin_th_name: "Name",
  admin_th_skill: "Skill",
  admin_th_location: "Location",
  admin_th_trust: "Trust",
  admin_th_endorsements: "Endorsements",
  admin_th_badge: "Badge Level",
  admin_th_username: "Username",
  admin_th_address: "Address",
  admin_th_requester: "Requester",
  admin_th_target: "Target Worker",
  admin_th_message: "Message",
  admin_th_time: "Time",
  admin_th_worker: "Worker",
  admin_th_video: "Video",
  admin_th_mcq: "MCQ Score",
  admin_th_status: "Status",
  admin_th_actions: "Actions",
  admin_th_cert_id: "Certificate ID",
  admin_th_issued: "Issued",
  admin_th_level: "Level",
  admin_btn_approve: "Approve",
  admin_btn_reject: "Reject",
  admin_status_pending: "Pending",
  admin_status_approved: "Approved",
  admin_status_rejected: "Rejected",`,

  te: `  admin_panel_title: "అడ్మిన్ ప్యానెల్",
  admin_welcome: "స్వాగతం,",
  admin_refresh: "రిఫ్రెష్",
  admin_clear_data: "మొత్తం డేటాను క్లియర్ చేయి",
  admin_clear_warning: "ఇది వినియోగదారులు, పౌరులు, అభ్యర్థనలు మరియు ధృవపత్రాలన్నింటినీ శాశ్వతంగా తొలగిస్తుంది. ఈ చర్యను వెనక్కి తీసుకోలేము.",
  admin_cancel: "రద్దు చేయి",
  admin_continue: "కొనసాగించు",
  admin_stat_workers: "మొత్తం కార్మికులు",
  admin_stat_citizens: "మొత్తం పౌరులు",
  admin_stat_certified: "ధృవీకరించబడిన కార్మికులు",
  admin_stat_requests: "నేర్చుకోవడం అభ్యర్థనలు",
  admin_tab_dashboard: "డాష్‌బోర్డ్",
  admin_tab_workers: "కార్మికులు",
  admin_tab_citizens: "పౌరులు",
  admin_tab_requests: "అభ్యర్థనలు",
  admin_tab_practical: "ప్రాక్టికల్ వీడియోలు",
  admin_tab_certified: "ధృవీకరించబడినవారు",
  admin_th_id: "ID",
  admin_th_name: "పేరు",
  admin_th_skill: "నైపుణ్యం",
  admin_th_location: "స్థానం",
  admin_th_trust: "నమ్మకం",
  admin_th_endorsements: "సమర్థనలు",
  admin_th_badge: "బ్యాడ్జ్",
  admin_th_username: "వినియోగదారు పేరు",
  admin_th_address: "చిరునామా",
  admin_th_requester: "అభ్యర్థించినవారు",
  admin_th_target: "కార్మికుడు",
  admin_th_message: "సందేశం",
  admin_th_time: "ಸಮಯ",
  admin_th_worker: "ಕಾರ್ಮಿಕ",
  admin_th_video: "ವೀಡಿಯೊ",
  admin_th_mcq: "MCQ ಸ್ಕೋರ್",
  admin_th_status: "ಸ್ಥಿತಿ",
  admin_th_actions: "ಚರ್ಯೆಗಳು",
  admin_th_cert_id: "ಸರ್ಟಿಫಿಕೆಟ್ ID",
  admin_th_issued: "ನೀಡಿದ ದಿನಾಂಕ",
  admin_th_level: "ಮಟ್ಟ",
  admin_btn_approve: "ಅನುಮೋದಿಸಿ",
  admin_btn_reject: "ತಿರಸ್ಕರಿಸಿ",
  admin_status_pending: "ಬಾಕಿ ಇದೆ",
  admin_status_approved: "ಆಮೋದಿಸಲಾಗಿದೆ",
  admin_status_rejected: "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",`,

  hi: `  admin_panel_title: "एडमिन पैनल",
  admin_welcome: "स्वागत है,",
  admin_refresh: "रिफ्रेश",
  admin_clear_data: "सभी डेटा साफ़ करें",
  admin_clear_warning: "यह सभी उपयोगकर्ताओं, नागरिकों, अनुरोधों और प्रमाणपत्रों को स्थायी रूप से हटा देगा। यह क्रिया पूर्ववत नहीं की जा सकती।",
  admin_cancel: "रद्द करें",
  admin_continue: "जारी रखें",
  admin_stat_workers: "कुल कर्मचारी",
  admin_stat_citizens: "कुल नागरिक",
  admin_stat_certified: "प्रमाणित कर्मचारी",
  admin_stat_requests: "सीखने के अनुरोध",
  admin_tab_dashboard: "डैशबोर्ड",
  admin_tab_workers: "कर्मचारी",
  admin_tab_citizens: "नागरिक",
  admin_tab_requests: "अनुरोध",
  admin_tab_practical: "व्यावहारिक वीडियो",
  admin_tab_certified: "प्रमाणित",
  admin_th_id: "ID",
  admin_th_name: "नाम",
  admin_th_skill: "कौशल",
  admin_th_location: "स्थान",
  admin_th_trust: "विश्वास",
  admin_th_endorsements: "समर्थन",
  admin_th_badge: "बैज",
  admin_th_username: "उपयोगकर्ता नाम",
  admin_th_address: "पता",
  admin_th_requester: "अनुरोधकर्ता",
  admin_th_target: "कर्मचारी",
  admin_th_message: "संदेश",
  admin_th_time: "समय",
  admin_th_worker: "कर्मचारी",
  admin_th_video: "वीडियो",
  admin_th_mcq: "MCQ स्कोर",
  admin_th_status: "स्थिति",
  admin_th_actions: "कार्रवाइयां",
  admin_th_cert_id: "प्रमाणपत्र ID",
  admin_th_issued: "जारी किया गया",
  admin_th_level: "स्तर",
  admin_btn_approve: "मंजूर करें",
  admin_btn_reject: "अस्वीकार करें",
  admin_status_pending: "लंबित",
  admin_status_approved: "मंजूर",
  admin_status_rejected: "अस्वीकृत",`,

  ml: `  admin_panel_title: "അഡ്മിൻ പാനൽ",
  admin_welcome: "സ്വാഗതം,",
  admin_refresh: "പുതുക്കുക",
  admin_clear_data: "എല്ലാ ഡാറ്റയും മായ്‌ക്കുക",
  admin_clear_warning: "ഇത് എല്ലാ ഉപയോക്താക്കളെയും പൗരന്മാരെയും അഭ്യർത്ഥനകളെയും സർട്ടിഫിക്കറ്റുകളെയും ശാശ്വതമായി ഇല്ലാതാക്കും. ഇത് പഴയപടിയാക്കാൻ കഴിയില്ല.",
  admin_cancel: "റദ്ദാക്കുക",
  admin_continue: "തുടരുക",
  admin_stat_workers: "മൊത്തം തൊഴിലാളികൾ",
  admin_stat_citizens: "മൊത്തം പൗരന്മാർ",
  admin_stat_certified: "സർട്ടിഫൈഡ് തൊഴിലാളികൾ",
  admin_stat_requests: "പഠന അഭ്യർത്ഥനകൾ",
  admin_tab_dashboard: "ഡാഷ്‌ബോർഡ്",
  admin_tab_workers: "തൊഴിലാളികൾ",
  admin_tab_citizens: "പൗരന്മാർ",
  admin_tab_requests: "അഭ്യർത്ഥനകൾ",
  admin_tab_practical: "പ്രായോഗിക വീഡിയോകൾ",
  admin_tab_certified: "സർട്ടിഫൈഡ്",
  admin_th_id: "ID",
  admin_th_name: "പേര്",
  admin_th_skill: "നൈപുണ്യം",
  admin_th_location: "സ്ഥലം",
  admin_th_trust: "വിശ്വാസം",
  admin_th_endorsements: "പിന്തുണകൾ",
  admin_th_badge: "ബാഡ്ജ്",
  admin_th_username: "ഉപയോക്തൃനാമം",
  admin_th_address: "വിലാസം",
  admin_th_requester: "അഭ്യർത്ഥിക്കുന്നയാൾ",
  admin_th_target: "തൊഴിലാളി",
  admin_th_message: "സന്ദേശം",
  admin_th_time: "സമയം",
  admin_th_worker: "തൊഴിലാളി",
  admin_th_video: "വീഡിയോ",
  admin_th_mcq: "MCQ സ്കോർ",
  admin_th_status: "പദവി",
  admin_th_actions: "പ്രവർത്തനങ്ങൾ",
  admin_th_cert_id: "സർട്ടിഫിക്കറ്റ് ID",
  admin_th_issued: "നൽകിയ തീയതി",
  admin_th_level: "നില",
  admin_btn_approve: "അംഗീകരിക്കുക",
  admin_btn_reject: "നിരസിക്കുക",
  admin_status_pending: "തീരുമാനമാകാത്ത",
  admin_status_approved: "അംഗീകരിച്ചു",
  admin_status_rejected: "നിരസിച്ചു",`,

  kn: `  admin_panel_title: "ಅಡ್ಮಿನ್ ಪ್ಯಾನೆಲ್",
  admin_welcome: "ಸ್ವಾಗತ,",
  admin_refresh: "ರಿಫ್ರೆಶ್",
  admin_clear_data: "ಎಲ್ಲಾ ಡೇಟಾವನ್ನು ತೆರವುಗೊಳಿಸಿ",
  admin_clear_warning: "ಇದು ಎಲ್ಲಾ ಬಳಕೆದಾರರು, ನಾಗರಿಕರು, ವಿನಂತಿಗಳು ಮತ್ತು ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸುತ್ತದೆ. ಈ ಕ್ರಿಯೆಯನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗುವುದಿಲ್ಲ.",
  admin_cancel: "ರದ್ದುಗೊಳಿಸಿ",
  admin_continue: "ಮುಂದುವರಿಸಿ",
  admin_stat_workers: "ಒಟ್ಟು ಕಾರ್ಮಿಕರು",
  admin_stat_citizens: "ಒಟ್ಟು ನಾಗರಿಕರು",
  admin_stat_certified: "ಪ್ರಮಾಣೀಕೃತ ಕಾರ್ಮಿಕರು",
  admin_stat_requests: "ಕಲಿಕೆ ವಿನಂತಿಗಳು",
  admin_tab_dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
  admin_tab_workers: "ಕಾರ್ಮಿಕರು",
  admin_tab_citizens: "ನಾಗರಿಕರು",
  admin_tab_requests: "ವಿನಂತಿಗಳು",
  admin_tab_practical: "ಪ್ರಾಯೋಗಿಕ ವೀಡಿಯೊಗಳು",
  admin_tab_certified: "ಪ್ರಮಾಣೀಕೃತ",
  admin_th_id: "ID",
  admin_th_name: "ಹೆಸರು",
  admin_th_skill: "ಕೌಶಲ್ಯ",
  admin_th_location: "ಸ್ಥಳ",
  admin_th_trust: "ನಂಬಿಕೆ",
  admin_th_endorsements: "ಬೆಂಬಲಗಳು",
  admin_th_badge: "ಬ್ಯಾಡ್ಜ್",
  admin_th_username: "ಬಳಕೆದಾರ ಹೆಸರು",
  admin_th_address: "ವಿಳಾಸ",
  admin_th_requester: "ವಿನಂತಿಸುವವರು",
  admin_th_target: "ಕಾರ್ಮಿಕ",
  admin_th_message: "ಸಂದೇಶ",
  admin_th_time: "ಸಮಯ",
  admin_th_worker: "ಕಾರ್ಮಿಕ",
  admin_th_video: "ವೀಡಿಯೊ",
  admin_th_mcq: "MCQ ಸ್ಕೋರ್",
  admin_th_status: "ಸ್ಥಿತಿ",
  admin_th_actions: "ಕ್ರಿಯೆಗಳು",
  admin_th_cert_id: "ಪ್ರಮಾಣಪತ್ರ ID",
  admin_th_issued: "ನೀಡಿದ ದಿನಾಂಕ",
  admin_th_level: "ಮಟ್ಟ",
  admin_btn_approve: "ಅನುಮೋದಿಸಿ",
  admin_btn_reject: "ತಿರಸ್ಕರಿಸಿ",
  admin_status_pending: "ಬಾಕಿ ಇದೆ",
  admin_status_approved: "ಅನುಮೋದಿಸಲಾಗಿದೆ",
  admin_status_rejected: "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",`
};

// Check if already injected
if (!content.includes('admin_panel_title: string;')) {
  // Inject interface
  content = content.replace(/export interface Translations \{([\s\S]*?)\}/, (match, p1) => {
    return 'export interface Translations {' + p1.replace(/,?(\s*)$/, ';$1') + interfaceAdditions + '\n}';
  });

  // Inject translations
  for (const lang in additions) {
    const regex = new RegExp('const ' + lang + ': Translations = \\{([\\s\\S]*?)\\};');
    content = content.replace(regex, (match, p1) => {
      return 'const ' + lang + ': Translations = {' + p1.replace(/,?(\\s*)$/, ',$1') + '\\n' + additions[lang] + '\\n};';
    });
  }

  fs.writeFileSync('src/frontend/src/utils/translations.ts', content);
  console.log('Translations updated successfully.');
} else {
  console.log('Already updated');
}
