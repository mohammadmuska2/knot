const fs = require('fs');

// 1. Update translations.ts
let transContent = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');

const interfaceAdd = `
  nav_subtitle: string;
  loc_bangalore: string;
  loc_hyderabad: string;
  loc_delhi: string;
  loc_mumbai: string;
  loc_pune: string;
  loc_kashmir: string;
  loc_pakisthan: string;`;

if (!transContent.includes('nav_subtitle: string;')) {
  transContent = transContent.replace(/export interface Translations \{([\s\S]*?)\}/, (match, p1) => {
    return 'export interface Translations {' + p1.replace(/,?(\s*)$/, ';$1') + interfaceAdd + '\n}';
  });

  const enAdd = `
  nav_subtitle: "Skills • Trust • Community",
  loc_bangalore: "Bangalore",
  loc_hyderabad: "Hyderabad",
  loc_delhi: "Delhi",
  loc_mumbai: "Mumbai",
  loc_pune: "Pune",
  loc_kashmir: "Kashmir",
  loc_pakisthan: "pakisthan",`;
  transContent = transContent.replace(/const en: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const en: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n' + enAdd + '\n};';
  });

  const teAdd = `
  nav_subtitle: "నైపుణ్యాలు • నమ్మకం • సమాజం",
  loc_bangalore: "బెంగళూరు",
  loc_hyderabad: "హైదరాబాద్",
  loc_delhi: "ఢిల్లీ",
  loc_mumbai: "ముంబై",
  loc_pune: "పూణే",
  loc_kashmir: "కాశ్మీర్",
  loc_pakisthan: "పాకిస్థాన్",`;
  transContent = transContent.replace(/const te: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const te: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n' + teAdd + '\n};';
  });

  const hiAdd = `
  nav_subtitle: "कौशल • विश्वास • समुदाय",
  loc_bangalore: "बैंगलोर",
  loc_hyderabad: "हैदराबाद",
  loc_delhi: "दिल्ली",
  loc_mumbai: "मुंबई",
  loc_pune: "पुणे",
  loc_kashmir: "कश्मीर",
  loc_pakisthan: "पाकिस्तान",`;
  transContent = transContent.replace(/const hi: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const hi: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n' + hiAdd + '\n};';
  });

  const mlAdd = `
  nav_subtitle: "നൈപുണ്യങ്ങൾ • വിശ്വാസം • സമൂഹം",
  loc_bangalore: "ബാംഗ്ലൂർ",
  loc_hyderabad: "ഹൈദരാബാദ്",
  loc_delhi: "ഡൽഹി",
  loc_mumbai: "മുംബൈ",
  loc_pune: "പൂനെ",
  loc_kashmir: "കാശ്മീർ",
  loc_pakisthan: "പാകിസ്ഥാൻ",`;
  transContent = transContent.replace(/const ml: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const ml: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n' + mlAdd + '\n};';
  });

  const knAdd = `
  nav_subtitle: "ಕೌಶಲ್ಯಗಳು • ನಂಬಿಕೆ • ಸಮುದಾಯ",
  loc_bangalore: "ಬೆಂಗಳೂರು",
  loc_hyderabad: "ಹೈದರಾಬಾದ್",
  loc_delhi: "ದೆಹಲಿ",
  loc_mumbai: "ಮುಂಬೈ",
  loc_pune: "ಪುಣೆ",
  loc_kashmir: "ಕಾಶ್ಮೀರ",
  loc_pakisthan: "ಪಾಕಿಸ್ತಾನ",`;
  transContent = transContent.replace(/const kn: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const kn: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n' + knAdd + '\n};';
  });

  fs.writeFileSync('src/frontend/src/utils/translations.ts', transContent);
  console.log('Translations updated.');
}

// 2. Update helpers.tsx
let helpersContent = fs.readFileSync('src/frontend/src/utils/helpers.tsx', 'utf8');
if (!helpersContent.includes('export function getTranslatedLocation')) {
  helpersContent += `

export function getTranslatedLocation(
  location: string,
  t: (key: string) => string
): string {
  if (!location) return "";
  const locMap: Record<string, string> = {
    "bangalore": "loc_bangalore",
    "hyderabad": "loc_hyderabad",
    "delhi": "loc_delhi",
    "mumbai": "loc_mumbai",
    "pune": "loc_pune",
    "kashmir": "loc_kashmir",
    "pakisthan": "loc_pakisthan"
  };
  const key = locMap[location.toLowerCase()];
  return key ? t(key) : location;
}
`;
  fs.writeFileSync('src/frontend/src/utils/helpers.tsx', helpersContent);
  console.log('Helpers updated.');
}
