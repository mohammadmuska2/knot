const fs = require('fs');

// 1. Add translations to translations.ts
let transContent = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');

if (!transContent.includes('footer_made_with: string;')) {
  transContent = transContent.replace(/export interface Translations \{([\s\S]*?)\}/, (match, p1) => {
    return 'export interface Translations {' + p1.replace(/,?(\s*)$/, ';$1') + '\n  footer_made_with: string;\n  footer_for_communities: string;\n}';
  });

  transContent = transContent.replace(/const en: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const en: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  footer_made_with: "Made with",\n  footer_for_communities: "for vocational communities",\n};';
  });
  
  transContent = transContent.replace(/const te: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const te: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  footer_made_with: "దీనితో తయారు చేయబడింది",\n  footer_for_communities: "వృత్తిపరమైన సంఘాల కోసం",\n};';
  });

  transContent = transContent.replace(/const hi: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const hi: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  footer_made_with: "से बना",\n  footer_for_communities: "व्यावसायिक समुदायों के लिए",\n};';
  });

  transContent = transContent.replace(/const ml: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const ml: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  footer_made_with: "ഉണ്ടാക്കിയത്",\n  footer_for_communities: "തൊഴിലധിഷ്ഠിത കമ്മ്യൂണിറ്റികൾക്കായി",\n};';
  });

  transContent = transContent.replace(/const kn: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const kn: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  footer_made_with: "ಇದರೊಂದಿಗೆ ಮಾಡಲಾಗಿದೆ",\n  footer_for_communities: "ವೃತ್ತಿಪರ ಸಮುದಾಯಗಳಿಗಾಗಿ",\n};';
  });

  fs.writeFileSync('src/frontend/src/utils/translations.ts', transContent);
  console.log('Translations for footer added.');
}

// 2. Update Footer.tsx
let footerContent = fs.readFileSync('src/frontend/src/components/Footer.tsx', 'utf8');
footerContent = footerContent.replace(
  /Made with <Heart className="w-3 h-3 text-accent fill-accent" \/> for\s+vocational communities/,
  '{t("footer_made_with")} <Heart className="w-3 h-3 text-accent fill-accent" /> {t("footer_for_communities")}'
);
fs.writeFileSync('src/frontend/src/components/Footer.tsx', footerContent);
console.log('Footer.tsx updated.');
