const fs = require('fs');

// 1. Add missing names to translations.ts
let transContent = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');

const interfaceAdd = `
  name_rajesh: string;
  name_pooja: string;
  name_sanjay: string;
  name_ioioo: string;`;

if (!transContent.includes('name_rajesh: string;')) {
  transContent = transContent.replace(/export interface Translations \{([\s\S]*?)\}/, (match, p1) => {
    return 'export interface Translations {' + p1.replace(/,?(\s*)$/, ';$1') + interfaceAdd + '\n}';
  });

  transContent = transContent.replace(/const en: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const en: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  name_rajesh: "Rajesh Kumar",\n  name_pooja: "Pooja Sharma",\n  name_sanjay: "Sanjay Chef",\n  name_ioioo: "ioioo",\n};';
  });
  
  transContent = transContent.replace(/const te: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const te: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  name_rajesh: "రాజేష్ కుమార్",\n  name_pooja: "పూజా శర్మ",\n  name_sanjay: "సంజయ్ చెఫ్",\n  name_ioioo: "ఇఓఇఓఒ",\n};';
  });

  transContent = transContent.replace(/const hi: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const hi: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  name_rajesh: "राजेश कुमार",\n  name_pooja: "पूजा शर्मा",\n  name_sanjay: "संजय शेफ",\n  name_ioioo: "इओइओओ",\n};';
  });

  transContent = transContent.replace(/const ml: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const ml: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  name_rajesh: "രാജേഷ് കുമാർ",\n  name_pooja: "പൂജ ശർമ്മ",\n  name_sanjay: "സഞ്ജയ് ഷെഫ്",\n  name_ioioo: "ഇഓഇഓഒ",\n};';
  });

  transContent = transContent.replace(/const kn: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const kn: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  name_rajesh: "ರಾಜೇಶ್ ಕುಮಾರ್",\n  name_pooja: "ಪೂಜಾ ಶರ್ಮಾ",\n  name_sanjay: "ಸಂಜಯ್ ಚೆಫ್",\n  name_ioioo: "ಐಒಐಒಒ",\n};';
  });

  fs.writeFileSync('src/frontend/src/utils/translations.ts', transContent);
  console.log('Translations for remaining dummy names added.');
}

// 2. Add remaining dummy names to helpers.tsx getTranslatedName map
let helpers = fs.readFileSync('src/frontend/src/utils/helpers.tsx', 'utf8');
if (!helpers.includes('"rajesh kumar": "name_rajesh"')) {
  helpers = helpers.replace(/"query": "name_query"/g, '"query": "name_query",\n    "rajesh kumar": "name_rajesh",\n    "pooja sharma": "name_pooja",\n    "sanjay chef": "name_sanjay",\n    "ioioo": "name_ioioo"');
  fs.writeFileSync('src/frontend/src/utils/helpers.tsx', helpers);
  console.log('Helpers updated with remaining dummy names.');
}

// 3. Fix comma operator bug in UserCard.tsx
let userCard = fs.readFileSync('src/frontend/src/components/UserCard.tsx', 'utf8');
userCard = userCard.replace(/\{getTranslatedLocation, getTranslatedName\(user\.location, t\)\}/g, '{getTranslatedLocation(user.location, t)}');
fs.writeFileSync('src/frontend/src/components/UserCard.tsx', userCard);
console.log('UserCard comma operator bug fixed.');

// 4. Fix comma operator bug in ProfilePage.tsx
let profilePage = fs.readFileSync('src/frontend/src/pages/ProfilePage.tsx', 'utf8');
profilePage = profilePage.replace(/\{getTranslatedLocation, getTranslatedName\((.*?)\.location, t\)\}/g, '{getTranslatedLocation($1.location, t)}');
// Ensure any remaining bad comma operator replacements on getTranslatedLocation are reverted, except in imports
profilePage = profilePage.replace(/getTranslatedLocation, getTranslatedName\((.*?)\)/g, 'getTranslatedLocation($1)');
// Re-apply the import fix just in case it messed it up
profilePage = profilePage.replace(/import { ([\s\S]*?)getTranslatedLocation\((.*?)\)([\s\S]*?) } from "\.\.\/utils\/helpers";/g, 'import { $1getTranslatedLocation, getTranslatedName$3 } from "../utils/helpers";');
fs.writeFileSync('src/frontend/src/pages/ProfilePage.tsx', profilePage);
console.log('ProfilePage comma operator bug fixed.');

// 5. Fix comma operator bug in HomePage.tsx
let homePage = fs.readFileSync('src/frontend/src/pages/HomePage.tsx', 'utf8');
homePage = homePage.replace(/\{getTranslatedLocation, getTranslatedName\((.*?)\.location, t\)\}/g, '{getTranslatedLocation($1.location, t)}');
// Revert any other bad replacements
homePage = homePage.replace(/getTranslatedLocation, getTranslatedName\((.*?)\)/g, 'getTranslatedLocation($1)');
fs.writeFileSync('src/frontend/src/pages/HomePage.tsx', homePage);
console.log('HomePage comma operator bug fixed.');
