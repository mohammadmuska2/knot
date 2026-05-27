const fs = require('fs');

// 1. Add translations to translations.ts
let transContent = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');

if (!transContent.includes('footer_role_ceo: string;')) {
  transContent = transContent.replace(/export interface Translations \{([\s\S]*?)\}/, (match, p1) => {
    return 'export interface Translations {' + p1.replace(/,?(\s*)$/, ';$1') + '\n  footer_role_ceo: string;\n  footer_role_research: string;\n  footer_role_comms: string;\n}';
  });

  transContent = transContent.replace(/const en: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const en: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  footer_role_ceo: "CEO & Founder",\n  footer_role_research: "Research & Testing",\n  footer_role_comms: "Communication Lead & Testing",\n};';
  });
  
  transContent = transContent.replace(/const te: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const te: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  footer_role_ceo: "CEO & వ్యవస్థాపకుడు",\n  footer_role_research: "రీసెర్చ్ & టెస్టింగ్",\n  footer_role_comms: "కమ్యూనికేషన్ లీడ్ & టెస్టింగ్",\n};';
  });

  transContent = transContent.replace(/const hi: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const hi: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  footer_role_ceo: "CEO और संस्थापक",\n  footer_role_research: "रिसर्च एंड टेस्टिंग",\n  footer_role_comms: "कम्युनिकेशन लीड एंड टेस्टिंग",\n};';
  });

  transContent = transContent.replace(/const ml: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const ml: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  footer_role_ceo: "CEO & സ്ഥാപകൻ",\n  footer_role_research: "ഗവേഷണം & ടെസ്റ്റിംഗ്",\n  footer_role_comms: "കമ്മ്യൂണിക്കേഷൻ ലീഡ് & ടെസ്റ്റിംഗ്",\n};';
  });

  transContent = transContent.replace(/const kn: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const kn: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  footer_role_ceo: "CEO ಮತ್ತು ಸಂಸ್ಥಾಪಕ",\n  footer_role_research: "ಸಂಶೋಧನೆ ಮತ್ತು ಪರೀಕ್ಷೆ",\n  footer_role_comms: "ಸಂವಹನ ಲೀಡ್ ಮತ್ತು ಪರೀಕ್ಷೆ",\n};';
  });

  fs.writeFileSync('src/frontend/src/utils/translations.ts', transContent);
  console.log('Translations for static roles added.');
}

// 2. Revert Footer.tsx to use static translations
let footerContent = fs.readFileSync('src/frontend/src/components/Footer.tsx', 'utf8');
footerContent = footerContent.replace(
  /role: <DynamicText text="CEO & Founder" \/>/g,
  'role: t("footer_role_ceo")'
);
footerContent = footerContent.replace(
  /role: <DynamicText text="Research & Testing" \/>/g,
  'role: t("footer_role_research")'
);
footerContent = footerContent.replace(
  /role: <DynamicText text="Communication Lead & Testing" \/>/g,
  'role: t("footer_role_comms")'
);
fs.writeFileSync('src/frontend/src/components/Footer.tsx', footerContent);
console.log('Footer.tsx updated.');
