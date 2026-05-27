const fs = require('fs');

// 1. Update translations.ts
let transContent = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');

const interfaceAdd = `
  ad_sponsored: string;
  ad_title: string;
  ad_desc: string;
  ad_btn: string;
  ad_close: string;
  ad_demo: string;
  ad_demo_banner: string;
  footer_role_md: string;
  footer_role_lead: string;`;

if (!transContent.includes('ad_sponsored: string;')) {
  transContent = transContent.replace(/export interface Translations \{([\s\S]*?)\}/, (match, p1) => {
    return 'export interface Translations {' + p1.replace(/,?(\s*)$/, ';$1') + interfaceAdd + '\n}';
  });

  const enAdd = `
  ad_sponsored: "SPONSORED",
  ad_title: "Free Skill Certification Videos",
  ad_desc: "Master advanced techniques. 200+ hours of free vocational training content from India's top craftsmen.",
  ad_btn: "Start Learning Free →",
  ad_close: "No thanks, close ad",
  ad_demo: "Demo ad - Configure Propeller Ads to earn real revenue (subdomain-friendly)",
  ad_demo_banner: "Demo ad - Sign up at propellerads.com to earn real revenue (works on subdomains!)",
  footer_role_md: "Managing Director & Developer",
  footer_role_lead: "Software Lead & Research",`;
  transContent = transContent.replace(/const en: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const en: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n' + enAdd + '\n};';
  });

  const teAdd = `
  ad_sponsored: "స్పాన్సర్ చేయబడినది",
  ad_title: "ఉచిత స్కిల్ సర్టిఫికేషన్ వీడియోలు",
  ad_desc: "అధునాతన పద్ధతులను నేర్చుకోండి. భారతదేశపు ఉత్తమ నైపుణ్య నిపుణుల నుండి 200+ గంటల ఉచిత శిక్షణ.",
  ad_btn: "ఉచితంగా నేర్చుకోవడం ప్రారంభించండి →",
  ad_close: "వద్దు, యాడ్ మూసివేయండి",
  ad_demo: "డెమో యాడ్ - నిజమైన ఆదాయం కోసం ప్రోపెల్లర్ యాడ్స్‌ను కాన్ఫిగర్ చేయండి",
  ad_demo_banner: "డెమో యాడ్ - నిజమైన ఆదాయం కోసం propellerads.com లో సైన్ అప్ చేయండి",
  footer_role_md: "మేనేజింగ్ డైరెక్టర్ & డెవలపర్",
  footer_role_lead: "సాఫ్ట్‌వేర్ లీడ్ & రీసెర్చ్",`;
  transContent = transContent.replace(/const te: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const te: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n' + teAdd + '\n};';
  });

  const hiAdd = `
  ad_sponsored: "प्रायोजित",
  ad_title: "मुफ्त कौशल प्रमाणन वीडियो",
  ad_desc: "उन्नत तकनीकें सीखें। भारत के शीर्ष कारीगरों से 200+ घंटे का मुफ्त व्यावसायिक प्रशिक्षण।",
  ad_btn: "मुफ्त में सीखना शुरू करें →",
  ad_close: "नहीं धन्यवाद, विज्ञापन बंद करें",
  ad_demo: "डेमो विज्ञापन - वास्तविक राजस्व कमाने के लिए प्रोपेलर विज्ञापन कॉन्फ़िगर करें",
  ad_demo_banner: "डेमो विज्ञापन - वास्तविक राजस्व कमाने के लिए propellerads.com पर साइन अप करें",
  footer_role_md: "प्रबंध निदेशक और डेवलपर",
  footer_role_lead: "सॉफ्टवेयर लीड और रिसर्च",`;
  transContent = transContent.replace(/const hi: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const hi: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n' + hiAdd + '\n};';
  });

  const mlAdd = `
  ad_sponsored: "സ്പോൺസർ ചെയ്തത്",
  ad_title: "സൗജന്യ സ്കിൽ സർട്ടിഫിക്കേഷൻ വീഡിയോകൾ",
  ad_desc: "നൂതന സാങ്കേതികവിദ്യകൾ പഠിക്കുക. ഇന്ത്യയിലെ മികച്ച കരകൗശല വിദഗ്ധരിൽ നിന്നുള്ള 200+ മണിക്കൂർ സൗജന്യ പരിശീലനം.",
  ad_btn: "സൗജന്യമായി പഠിക്കാൻ തുടങ്ങുക →",
  ad_close: "വേണ്ട, പരസ്യം അടയ്ക്കുക",
  ad_demo: "ഡെമോ പരസ്യം - യഥാർത്ഥ വരുമാനം നേടുന്നതിന് പ്രൊപ്പല്ലർ പരസ്യങ്ങൾ ക്രമീകരിക്കുക",
  ad_demo_banner: "ഡെമോ പരസ്യം - യഥാർത്ഥ വരുമാനം നേടുന്നതിന് propellerads.com-ൽ സൈൻ അപ്പ് ചെയ്യുക",
  footer_role_md: "മാനേജിംഗ് ഡയറക്ടർ & ഡെവലപ്പർ",
  footer_role_lead: "സോഫ്റ്റ്‌വെയർ ലീഡ് & റിസർച്ച്",`;
  transContent = transContent.replace(/const ml: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const ml: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n' + mlAdd + '\n};';
  });

  const knAdd = `
  ad_sponsored: "ಪ್ರಾಯೋಜಿತ",
  ad_title: "ಉಚಿತ ಕೌಶಲ್ಯ ಪ್ರಮಾಣೀಕರಣ ವೀಡಿಯೊಗಳು",
  ad_desc: "ಸುಧಾರಿತ ತಂತ್ರಗಳನ್ನು ಕಲಿಯಿರಿ. ಭಾರತದ ಅತ್ಯುತ್ತಮ ಕುಶಲಕರ್ಮಿಗಳಿಂದ 200+ ಗಂಟೆಗಳ ಉಚಿತ ವೃತ್ತಿಪರ ತರಬೇತಿ.",
  ad_btn: "ಉಚಿತವಾಗಿ ಕಲಿಯಲು ಪ್ರಾರಂಭಿಸಿ →",
  ad_close: "ಬೇಡ, ಜಾಹೀರಾತು ಮುಚ್ಚಿ",
  ad_demo: "ಡೆಮೊ ಜಾಹೀರಾತು - ನೈಜ ಆದಾಯ ಗಳಿಸಲು ಪ್ರೊಪೆಲ್ಲರ್ ಜಾಹೀರಾತುಗಳನ್ನು ಕಾನ್ಫಿಗರ್ ಮಾಡಿ",
  ad_demo_banner: "ಡೆಮೊ ಜಾಹೀರಾತು - ನೈಜ ಆದಾಯ ಗಳಿಸಲು propellerads.com ನಲ್ಲಿ ಸೈನ್ ಅಪ್ ಮಾಡಿ",
  footer_role_md: "ವ್ಯವಸ್ಥಾಪಕ ನಿರ್ದೇಶಕ ಮತ್ತು ಡೆವಲಪರ್",
  footer_role_lead: "ಸಾಫ್ಟ್‌ವೇರ್ ಲೀಡ್ ಮತ್ತು ರಿಸರ್ಚ್",`;
  transContent = transContent.replace(/const kn: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const kn: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n' + knAdd + '\n};';
  });

  fs.writeFileSync('src/frontend/src/utils/translations.ts', transContent);
  console.log('Translations for ads and footer updated.');
}

// 2. Update Footer.tsx
let footer = fs.readFileSync('src/frontend/src/components/Footer.tsx', 'utf8');
if (!footer.includes('{t("footer_role_md")}')) {
  // Ensure useLang is imported
  if (!footer.includes('useLang')) {
    footer = 'import { useLang } from "../contexts/LanguageContext";\\n' + footer;
  }
  if (!footer.includes('const { t } = useLang();')) {
    footer = footer.replace('export default function Footer() {', 'export default function Footer() {\\n  const { t } = useLang();');
  }
  
  footer = footer.replace('"Managing Director & Developer"', 't("footer_role_md")');
  footer = footer.replace('"Software Lead & Research"', 't("footer_role_lead")');
  fs.writeFileSync('src/frontend/src/components/Footer.tsx', footer);
  console.log('Footer updated.');
}

// 3. Update PopupAd.tsx
let popupAd = fs.readFileSync('src/frontend/src/components/PopupAd.tsx', 'utf8');
if (!popupAd.includes('useLang')) {
  popupAd = 'import { useLang } from "../contexts/LanguageContext";\\n' + popupAd;
}
if (!popupAd.includes('const { t } = useLang();')) {
  popupAd = popupAd.replace('export function PopupAd() {', 'export function PopupAd() {\\n  const { t } = useLang();');
  popupAd = popupAd.replace('export function HorizontalAd() {', 'export function HorizontalAd() {\\n  const { t } = useLang();');
}

// Replace strings in PopupAd
popupAd = popupAd.replace(/>SPONSORED</g, '>{t("ad_sponsored")}<');
popupAd = popupAd.replace(/"Free Skill Certification Videos"/g, 't("ad_title")');
popupAd = popupAd.replace(/"Master advanced techniques\. 200\+ hours of free vocational training content from India\'s top craftsmen\."/g, 't("ad_desc")');
popupAd = popupAd.replace(/>Start Learning Free →</g, '>{t("ad_btn")}<');
popupAd = popupAd.replace(/>No thanks, close ad</g, '>{t("ad_close")}<');
popupAd = popupAd.replace(/>Demo ad - Configure Propeller Ads to earn real revenue \(subdomain-friendly\)</g, '>{t("ad_demo")}<');
popupAd = popupAd.replace(/>Demo ad - Sign up at propellerads\.com to earn real revenue \(works on subdomains!\)</g, '>{t("ad_demo_banner")}<');

// Replace strings in HorizontalAd which uses adConfig
popupAd = popupAd.replace(/>\{adConfig\.title\}</g, '>{t("ad_title")}<');
popupAd = popupAd.replace(/>\{adConfig\.description\}</g, '>{t("ad_desc")}<');
popupAd = popupAd.replace(/>\{adConfig\.ctaText\}</g, '>{t("ad_btn")}<');

fs.writeFileSync('src/frontend/src/components/PopupAd.tsx', popupAd);
console.log('PopupAd updated.');

// 4. Update helpers.tsx to be case-insensitive for getTranslatedSkillName
let helpers = fs.readFileSync('src/frontend/src/utils/helpers.tsx', 'utf8');
helpers = helpers.replace('const key = skillMap[skill];', 'const key = skillMap[skill] || skillMap[skill.toLowerCase()] || skillMap[skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase()];');
fs.writeFileSync('src/frontend/src/utils/helpers.tsx', helpers);
console.log('Helpers updated to be case-insensitive.');
