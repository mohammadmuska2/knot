const fs = require('fs');

// 1. Add nav_admin to translations.ts
let transContent = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');

if (!transContent.includes('nav_admin: string;')) {
  transContent = transContent.replace(/export interface Translations \{([\s\S]*?)\}/, (match, p1) => {
    return 'export interface Translations {' + p1.replace(/,?(\s*)$/, ';$1') + '\n  nav_admin: string;\n}';
  });

  transContent = transContent.replace(/const en: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const en: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  nav_admin: "Admin",\n};';
  });
  
  transContent = transContent.replace(/const te: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const te: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  nav_admin: "అడ్మిన్",\n};';
  });

  transContent = transContent.replace(/const hi: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const hi: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  nav_admin: "एडमिन",\n};';
  });

  transContent = transContent.replace(/const ml: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const ml: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  nav_admin: "അഡ്മിൻ",\n};';
  });

  transContent = transContent.replace(/const kn: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const kn: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  nav_admin: "ಅಡ್ಮಿನ್",\n};';
  });

  fs.writeFileSync('src/frontend/src/utils/translations.ts', transContent);
  console.log('Translations for nav_admin added.');
}

// 2. Update Navbar.tsx
let navbar = fs.readFileSync('src/frontend/src/components/Navbar.tsx', 'utf8');

// Replace {authUser.name.split(" ")[0]} with {getTranslatedName(authUser.name, t).split(" ")[0]}
navbar = navbar.replace(/\{authUser\.name\.split\(" "\)\[0\]\}/g, '{getTranslatedName(authUser.name, t).split(" ")[0]}');

// Replace the hardcoded "Admin" in the desktop and mobile badges
// It looks like:
// ? "Admin"
// : t("nav_citizen")
navbar = navbar.replace(/\?\s*"Admin"\s*:\s*t\("nav_citizen"\)/g, '? t("nav_admin") : t("nav_citizen")');

fs.writeFileSync('src/frontend/src/components/Navbar.tsx', navbar);
console.log('Navbar updated.');
