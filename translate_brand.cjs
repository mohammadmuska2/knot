const fs = require('fs');

// 1. Add brand_name to translations.ts
let transContent = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');

if (!transContent.includes('brand_name: string;')) {
  transContent = transContent.replace(/export interface Translations \{([\s\S]*?)\}/, (match, p1) => {
    return 'export interface Translations {' + p1.replace(/,?(\s*)$/, ';$1') + '\n  brand_name: string;\n}';
  });

  transContent = transContent.replace(/const en: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const en: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  brand_name: "KNOT",\n};';
  });
  
  transContent = transContent.replace(/const te: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const te: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  brand_name: "నాట్",\n};';
  });

  transContent = transContent.replace(/const hi: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const hi: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  brand_name: "नॉट",\n};';
  });

  transContent = transContent.replace(/const ml: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const ml: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  brand_name: "നോട്ട്",\n};';
  });

  transContent = transContent.replace(/const kn: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const kn: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  brand_name: "ನಾಟ್",\n};';
  });

  fs.writeFileSync('src/frontend/src/utils/translations.ts', transContent);
  console.log('Translations for brand_name added.');
}

// Helper to replace literal 'KNOT' in TSX
function replaceKnot(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Ensure useLang is imported if t() is going to be used, but all these files already have useLang except maybe it's not destructured.
    // Navbar, Footer, LoginPage, AdminLoginPage, AdminDashboardPage already have `const { t } = useLang();`
    
    // Replace >KNOT< (HTML content)
    content = content.replace(/>\s*KNOT\s*</g, '>{t("brand_name")}<');
    
    // Replace KNOT <span (in AdminLoginPage)
    content = content.replace(/KNOT\s*<span/g, '{t("brand_name")} <span');

    // Replace © 2026 KNOT.
    content = content.replace(/© (.*?) KNOT\./g, '© $1 {t("brand_name")}.');
    
    // Replace © {new Date().getFullYear()} KNOT · 
    content = content.replace(/© \{new Date\(\)\.getFullYear\(\)\} KNOT/g, '© {new Date().getFullYear()} {t("brand_name")}');

    // In LoginPage: `Welcome to KNOT, name!`
    content = content.replace(/to KNOT, \$\{name\}!/g, 'to ${t("brand_name")}, ${name}!');

    fs.writeFileSync(filePath, content);
    console.log('Updated', filePath);
  }
}

replaceKnot('src/frontend/src/components/Navbar.tsx');
replaceKnot('src/frontend/src/components/Footer.tsx');
replaceKnot('src/frontend/src/pages/LoginPage.tsx');
replaceKnot('src/frontend/src/pages/AdminLoginPage.tsx');
replaceKnot('src/frontend/src/pages/AdminDashboardPage.tsx');
