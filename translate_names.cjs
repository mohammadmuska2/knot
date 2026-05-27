const fs = require('fs');

// 1. UPDATE translations.ts
let transContent = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');

const interfaceAdd = `
  name_musaveer: string;
  name_lathika: string;
  name_chandana: string;
  name_chetan: string;
  name_raviteja: string;
  name_amit: string;
  name_vikram: string;
  name_query: string;
  ad_materials_title: string;
  ad_materials_desc: string;
  ad_materials_cta: string;
  ad_tools_title: string;
  ad_tools_desc: string;
  ad_tools_cta: string;
  ad_insurance_title: string;
  ad_insurance_desc: string;
  ad_insurance_cta: string;
  ad_loan_title: string;
  ad_loan_desc: string;
  ad_loan_cta: string;`;

if (!transContent.includes('name_musaveer: string;')) {
  transContent = transContent.replace(/export interface Translations \{([\s\S]*?)\}/, (match, p1) => {
    return 'export interface Translations {' + p1.replace(/,?(\s*)$/, ';$1') + interfaceAdd + '\n}';
  });

  const enAdd = `
  name_musaveer: "Md. Musaveer",
  name_lathika: "G. Lathika",
  name_chandana: "B. Chandana",
  name_chetan: "M. Chetan",
  name_raviteja: "G. Ravi Teja",
  name_amit: "Amit Patel",
  name_vikram: "Vikram Singh",
  name_query: "query",
  ad_materials_title: "Raw Materials at Wholesale",
  ad_materials_desc: "Wood, fabric, pipes, paint & more at factory prices. Free delivery on orders above ₹500.",
  ad_materials_cta: "Order Now →",
  ad_tools_title: "Pro Tools for Craftsmen",
  ad_tools_desc: "Drills, saws, hammers & more — factory prices delivered to your door. Used by 50,000+ skilled workers.",
  ad_tools_cta: "Shop Tools →",
  ad_insurance_title: "Worker Income Protection",
  ad_insurance_desc: "Special insurance plans for carpenters, tailors, plumbers & more. Low monthly premiums across India.",
  ad_insurance_cta: "Get Covered Today →",
  ad_loan_title: "Business Loan for Workers",
  ad_loan_desc: "Grow your craft business. Get up to ₹5 lakhs with minimal documentation. Quick approval.",
  ad_loan_cta: "Apply for Loan →",`;

  transContent = transContent.replace(/const en: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const en: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n' + enAdd + '\n};';
  });

  const teAdd = `
  name_musaveer: "ఎండి. ముసావీర్",
  name_lathika: "జి. లతిక",
  name_chandana: "బి. చందన",
  name_chetan: "ఎం. చేతన్",
  name_raviteja: "జి. రవితేజ",
  name_amit: "అమిత్ పటేల్",
  name_vikram: "విక్రమ్ సింగ్",
  name_query: "క్వెరీ",
  ad_materials_title: "టోకు ధరలో ముడి పదార్థాలు",
  ad_materials_desc: "కర్ర, బట్ట, పైపులు మరియు రంగులు ఫ్యాక్టరీ ధరలకే. ₹500 పైన ఆర్డర్‌లకి ఉచిత డెలివరీ.",
  ad_materials_cta: "ఇప్పుడే ఆర్డర్ చేయండి →",
  ad_tools_title: "హస్తకళాకారుల కోసం ప్రో టూల్స్",
  ad_tools_desc: "డ్రిల్స్, రంపాలు మరియు సుత్తులు - మీ ఇంటికే ఫ్యాక్టరీ ధరలకే.",
  ad_tools_cta: "టూల్స్ కొనండి →",
  ad_insurance_title: "కార్మికుల ఆదాయ రక్షణ",
  ad_insurance_desc: "వడ్రంగులు, టైలర్లు, ప్లంబర్ల కోసం ప్రత్యేక బీమా. తక్కువ నెలవారీ ప్రీమియం.",
  ad_insurance_cta: "బీమా పొందండి →",
  ad_loan_title: "కార్మికుల కోసం వ్యాపార రుణాలు",
  ad_loan_desc: "మీ వ్యాపారాన్ని పెంచుకోండి. కనీస పత్రాలతో ₹5 లక్షల వరకు పొందండి.",
  ad_loan_cta: "రుణం కోసం దరఖాస్తు చేయండి →",`;

  transContent = transContent.replace(/const te: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const te: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n' + teAdd + '\n};';
  });

  const hiAdd = `
  name_musaveer: "एमडी. मुसावीर",
  name_lathika: "जी. लतिका",
  name_chandana: "बी. चंदना",
  name_chetan: "एम. चेतन",
  name_raviteja: "जी. रवि तेजा",
  name_amit: "अमित पटेल",
  name_vikram: "विक्रम सिंह",
  name_query: "क्वेरी",
  ad_materials_title: "थोक मूल्य पर कच्चा माल",
  ad_materials_desc: "लकड़ी, कपड़े, पाइप, पेंट और बहुत कुछ कारखाने की कीमतों पर। ₹500 से ऊपर की डिलीवरी मुफ्त।",
  ad_materials_cta: "अभी ऑर्डर करें →",
  ad_tools_title: "कारीगरों के लिए प्रो उपकरण",
  ad_tools_desc: "ड्रिल, आरी, हथौड़े और बहुत कुछ - कारखाने की कीमतों पर।",
  ad_tools_cta: "उपकरण खरीदें →",
  ad_insurance_title: "श्रमिक आय सुरक्षा",
  ad_insurance_desc: "बढ़ई, दर्जी, प्लंबर के लिए विशेष बीमा। कम मासिक प्रीमियम।",
  ad_insurance_cta: "आज ही बीमा कराएं →",
  ad_loan_title: "श्रमिकों के लिए व्यापार ऋण",
  ad_loan_desc: "अपना व्यवसाय बढ़ाएं। न्यूनतम दस्तावेजों के साथ ₹5 लाख तक प्राप्त करें।",
  ad_loan_cta: "ऋण के लिए आवेदन करें →",`;

  transContent = transContent.replace(/const hi: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const hi: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n' + hiAdd + '\n};';
  });

  const mlAdd = `
  name_musaveer: "എംഡി. മുസാവീർ",
  name_lathika: "ജി. ലതിക",
  name_chandana: "ബി. ചന്ദന",
  name_chetan: "എം. ചേതൻ",
  name_raviteja: "ജി. രവി തേജ",
  name_amit: "അമിത് പട്ടേൽ",
  name_vikram: "വിക്രം സിംഗ്",
  name_query: "ക്വറി",
  ad_materials_title: "മൊത്തവിലയ്ക്ക് അസംസ്കൃത വസ്തുക്കൾ",
  ad_materials_desc: "തടി, തുണി, പൈപ്പുകൾ, പെയിൻ്റ് എന്നിവ ഫാക്ടറി വിലയിൽ. ₹500-ന് മുകളിലുള്ള ഓർഡറുകൾക്ക് സൗജന്യ ഡെലിവറി.",
  ad_materials_cta: "ഇപ്പോൾ ഓർഡർ ചെയ്യുക →",
  ad_tools_title: "കരകൗശല വിദഗ്ധർക്കുള്ള പ്രോ ടൂളുകൾ",
  ad_tools_desc: "ഡ്രില്ലുകൾ, ഈർച്ചവാളുകൾ, ചുറ്റികകൾ എന്നിവ - ഫാക്ടറി വിലയിൽ വീട്ടിലെത്തിക്കുന്നു.",
  ad_tools_cta: "ടൂളുകൾ വാങ്ങുക →",
  ad_insurance_title: "തൊഴിലാളികളുടെ വരുമാന സംരക്ഷണം",
  ad_insurance_desc: "ആശാരിമാർ, തയ്യൽക്കാർ, പ്ലംബർമാർ എന്നിവർക്കുള്ള പ്രത്യേക ഇൻഷുറൻസ്. കുറഞ്ഞ പ്രതിമാസ പ്രീമിയം.",
  ad_insurance_cta: "ഇൻഷുറൻസ് എടുക്കുക →",
  ad_loan_title: "തൊഴിലാളികൾക്കുള്ള ബിസിനസ്സ് ലോൺ",
  ad_loan_desc: "നിങ്ങളുടെ ബിസിനസ്സ് വളർത്തുക. കുറഞ്ഞ രേഖകളോടെ ₹5 ലക്ഷം വരെ നേടുക.",
  ad_loan_cta: "ലോണിനായി അപേക്ഷിക്കുക →",`;

  transContent = transContent.replace(/const ml: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const ml: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n' + mlAdd + '\n};';
  });

  const knAdd = `
  name_musaveer: "ಎಂಡಿ. ಮುಸಾವೀರ್",
  name_lathika: "ಜಿ. ಲತಿಕಾ",
  name_chandana: "ಬಿ. ಚಂದನಾ",
  name_chetan: "ಎಂ. ಚೇತನ್",
  name_raviteja: "ಜಿ. ರವಿ ತೇಜ",
  name_amit: "ಅಮಿತ್ ಪಟೇಲ್",
  name_vikram: "ವಿಕ್ರಮ್ ಸಿಂಗ್",
  name_query: "ಕ್ವೆರಿ",
  ad_materials_title: "ಸಗಟು ದರದಲ್ಲಿ ಕಚ್ಚಾ ವಸ್ತುಗಳು",
  ad_materials_desc: "ಮರ, ಬಟ್ಟೆ, ಪೈಪ್‌ಗಳು, ಬಣ್ಣ ಮತ್ತು ಇನ್ನಷ್ಟು ಫ್ಯಾಕ್ಟರಿ ದರದಲ್ಲಿ. ₹500 ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಆರ್ಡರ್‌ಗಳಿಗೆ ಉಚಿತ ವಿತರಣೆ.",
  ad_materials_cta: "ಈಗಲೇ ಆರ್ಡರ್ ಮಾಡಿ →",
  ad_tools_title: "ಕುಶಲಕರ್ಮಿಗಳಿಗಾಗಿ ಪ್ರೊ ಪರಿಕರಗಳು",
  ad_tools_desc: "ಡ್ರಿಲ್‌ಗಳು, ಗರಗಸಗಳು, ಸುತ್ತಿಗೆಗಳು ಮತ್ತು ಇನ್ನಷ್ಟು - ನಿಮ್ಮ ಮನೆಗೆ ಫ್ಯಾಕ್ಟರಿ ದರದಲ್ಲಿ.",
  ad_tools_cta: "ಪರಿಕರಗಳನ್ನು ಖರೀದಿಸಿ →",
  ad_insurance_title: "ಕಾರ್ಮಿಕರ ಆದಾಯ ರಕ್ಷಣೆ",
  ad_insurance_desc: "ಬಡಗಿಗಳು, ದರ್ಜಿಗಳು, ಪ್ಲಂಬರ್‌ಗಳಿಗಾಗಿ ವಿಶೇಷ ವಿಮೆ. ಕಡಿಮೆ ಮಾಸಿಕ ಪ್ರೀಮಿಯಂ.",
  ad_insurance_cta: "ಇಂದು ವಿಮೆ ಪಡೆಯಿರಿ →",
  ad_loan_title: "ಕಾರ್ಮಿಕರಿಗಾಗಿ ವ್ಯಾಪಾರ ಸಾಲ",
  ad_loan_desc: "ನಿಮ್ಮ ವ್ಯಾಪಾರವನ್ನು ಬೆಳೆಸಿ. ಕನಿಷ್ಠ ದಾಖಲಾತಿಯೊಂದಿಗೆ ₹5 ಲಕ್ಷದವರೆಗೆ ಪಡೆಯಿರಿ.",
  ad_loan_cta: "ಸಾಲಕ್ಕಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ →",`;

  transContent = transContent.replace(/const kn: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const kn: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n' + knAdd + '\n};';
  });

  fs.writeFileSync('src/frontend/src/utils/translations.ts', transContent);
  console.log('Translations for names and all ads updated.');
}

// 2. UPDATE helpers.tsx
let helpers = fs.readFileSync('src/frontend/src/utils/helpers.tsx', 'utf8');

// Fix the case insensitivity bug in getTranslatedSkillName
helpers = helpers.replace('const key = map[skill];', 'const key = map[skill] || map[skill.toLowerCase()] || map[skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase()];');

// Add getTranslatedName
if (!helpers.includes('export function getTranslatedName')) {
  const getNameFn = `
export function getTranslatedName(
  name: string,
  t: (key: string) => string
): string {
  if (!name) return "";
  const nMap: Record<string, string> = {
    "md. musaveer": "name_musaveer",
    "g. lathika": "name_lathika",
    "b. chandana": "name_chandana",
    "m. chetan": "name_chetan",
    "g. ravi teja": "name_raviteja",
    "amit patel": "name_amit",
    "vikram singh": "name_vikram",
    "query": "name_query"
  };
  const key = nMap[name.toLowerCase()];
  return key ? t(key) : name;
}
`;
  helpers += '\n' + getNameFn;
  fs.writeFileSync('src/frontend/src/utils/helpers.tsx', helpers);
  console.log('Helpers updated with getTranslatedName and case insensitivity fix.');
}

// 3. UPDATE Footer.tsx to use translated names
let footer = fs.readFileSync('src/frontend/src/components/Footer.tsx', 'utf8');
footer = footer.replace(/"Md\. Musaveer"/g, 't("name_musaveer")');
footer = footer.replace(/"G\. Lathika"/g, 't("name_lathika")');
footer = footer.replace(/"B\. Chandana"/g, 't("name_chandana")');
footer = footer.replace(/"M\. Chetan"/g, 't("name_chetan")');
footer = footer.replace(/"G\. Ravi Teja"/g, 't("name_raviteja")');
fs.writeFileSync('src/frontend/src/components/Footer.tsx', footer);

// 4. UPDATE PopupAd.tsx to handle ALL fallback ads dynamically
let popupAd = fs.readFileSync('src/frontend/src/components/PopupAd.tsx', 'utf8');

// BannerAd mapping
const bannerAdMapping = `const ad = {
    ...baseAd,
    title: baseAd.id === "ad_training" ? t("ad_title") : (baseAd.id === "ad_materials" ? t("ad_materials_title") : (baseAd.id === "ad_tools" ? t("ad_tools_title") : (baseAd.id === "ad_insurance" ? t("ad_insurance_title") : (baseAd.id === "ad_loan" ? t("ad_loan_title") : baseAd.title)))),
    description: baseAd.id === "ad_training" ? t("ad_desc") : (baseAd.id === "ad_materials" ? t("ad_materials_desc") : (baseAd.id === "ad_tools" ? t("ad_tools_desc") : (baseAd.id === "ad_insurance" ? t("ad_insurance_desc") : (baseAd.id === "ad_loan" ? t("ad_loan_desc") : baseAd.description)))),
    cta: baseAd.id === "ad_training" ? t("ad_btn") : (baseAd.id === "ad_materials" ? t("ad_materials_cta") : (baseAd.id === "ad_tools" ? t("ad_tools_cta") : (baseAd.id === "ad_insurance" ? t("ad_insurance_cta") : (baseAd.id === "ad_loan" ? t("ad_loan_cta") : baseAd.cta)))),
    tag: t("ad_sponsored")
  };`;

// Replace the mapping in BannerAd
popupAd = popupAd.replace(/const ad = \{\s*\.\.\.baseAd,\s*title: baseAd\.id === "ad_training" \? t\("ad_title"\) : baseAd\.title,\s*description: baseAd\.id === "ad_training" \? t\("ad_desc"\) : baseAd\.description,\s*cta: baseAd\.id === "ad_training" \? t\("ad_btn"\) : baseAd\.cta,\s*tag: t\("ad_sponsored"\)\s*\};/g, bannerAdMapping);

fs.writeFileSync('src/frontend/src/components/PopupAd.tsx', popupAd);
console.log('PopupAd updated with all fallback ads.');

// 5. UPDATE HomePage.tsx to translate authUser.name
let homePage = fs.readFileSync('src/frontend/src/pages/HomePage.tsx', 'utf8');
if (!homePage.includes('getTranslatedName')) {
  homePage = homePage.replace(/getTranslatedLocation/g, 'getTranslatedLocation, getTranslatedName');
  homePage = homePage.replace(/\{authUser\.name\}/g, '{getTranslatedName(authUser.name, t)}');
  fs.writeFileSync('src/frontend/src/pages/HomePage.tsx', homePage);
  console.log('HomePage updated.');
}

// 6. UPDATE UserCard.tsx to translate user.name
let userCard = fs.readFileSync('src/frontend/src/components/UserCard.tsx', 'utf8');
if (!userCard.includes('getTranslatedName')) {
  userCard = userCard.replace(/getTranslatedLocation/g, 'getTranslatedLocation, getTranslatedName');
  userCard = userCard.replace(/\{user\.name\}/g, '{getTranslatedName(user.name, t)}');
  fs.writeFileSync('src/frontend/src/components/UserCard.tsx', userCard);
  console.log('UserCard updated.');
}

// 7. UPDATE ProfilePage.tsx to translate user.name
let profilePage = fs.readFileSync('src/frontend/src/pages/ProfilePage.tsx', 'utf8');
if (!profilePage.includes('getTranslatedName')) {
  profilePage = profilePage.replace(/getTranslatedLocation/g, 'getTranslatedLocation, getTranslatedName');
  profilePage = profilePage.replace(/\{user\.name\}/g, '{getTranslatedName(user.name, t)}');
  fs.writeFileSync('src/frontend/src/pages/ProfilePage.tsx', profilePage);
  console.log('ProfilePage updated.');
}

// 8. UPDATE Navbar.tsx to translate authUser.name
let navbar = fs.readFileSync('src/frontend/src/components/Navbar.tsx', 'utf8');
if (!navbar.includes('getTranslatedName')) {
  navbar = navbar.replace('import { useLang } from "../contexts/LanguageContext";', 'import { useLang } from "../contexts/LanguageContext";\nimport { getTranslatedName } from "../utils/helpers";');
  navbar = navbar.replace(/\{authUser\.name\}/g, '{getTranslatedName(authUser.name, t)}');
  navbar = navbar.replace(/\{userInitials\}/g, '{getTranslatedName(authUser.name, t).substring(0, 2).toUpperCase()}');
  fs.writeFileSync('src/frontend/src/components/Navbar.tsx', navbar);
  console.log('Navbar updated.');
}

// 9. UPDATE AdminDashboardPage.tsx to translate worker names
let adminDash = fs.readFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', 'utf8');
if (!adminDash.includes('getTranslatedName')) {
  adminDash = adminDash.replace('import { getTranslatedSkillName } from "../utils/helpers";', 'import { getTranslatedSkillName, getTranslatedName } from "../utils/helpers";');
  adminDash = adminDash.replace(/\{worker\.name\}/g, '{getTranslatedName(worker.name, t)}');
  adminDash = adminDash.replace(/\{citizen\.name\}/g, '{getTranslatedName(citizen.name, t)}');
  fs.writeFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', adminDash);
  console.log('AdminDash updated.');
}
