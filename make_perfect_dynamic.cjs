const fs = require('fs');

// 1. Add user_view_profile to translations.ts
let transContent = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');

if (!transContent.includes('user_view_profile: string;')) {
  transContent = transContent.replace(/export interface Translations \{([\s\S]*?)\}/, (match, p1) => {
    return 'export interface Translations {' + p1.replace(/,?(\s*)$/, ';$1') + '\n  user_view_profile: string;\n}';
  });

  transContent = transContent.replace(/const en: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const en: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  user_view_profile: "View Profile",\n};';
  });
  
  transContent = transContent.replace(/const te: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const te: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  user_view_profile: "ప్రొఫైల్ చూడండి",\n};';
  });

  transContent = transContent.replace(/const hi: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const hi: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  user_view_profile: "प्रोफ़ाइल देखें",\n};';
  });

  transContent = transContent.replace(/const ml: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const ml: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  user_view_profile: "പ്രൊഫൈൽ കാണുക",\n};';
  });

  transContent = transContent.replace(/const kn: Translations = \{([\s\S]*?)\};/, (match, p1) => {
    return 'const kn: Translations = {' + p1.replace(/,?(\s*)$/, ',$1') + '\n  user_view_profile: "ಪ್ರೊಫೈಲ್ ನೋಡಿ",\n};';
  });

  fs.writeFileSync('src/frontend/src/utils/translations.ts', transContent);
  console.log('Translations for user_view_profile added.');
}

// 2. Fix UserCard.tsx
let userCard = fs.readFileSync('src/frontend/src/components/UserCard.tsx', 'utf8');
userCard = userCard.replace(/\{t\("cert_view_cert"\)\.replace\("Certificate", "Profile"\)\.replace\("ಸರ್ಟಿಫಿಕೇಟ್", "ಪ್ರೊಫೈಲ್"\)\}/g, '{t("user_view_profile")}');
userCard = userCard.replace(/\{getTranslatedSkillName\(user\.skill, t\)\}/g, '<DynamicText text={getTranslatedSkillName(user.skill, t)} />');
fs.writeFileSync('src/frontend/src/components/UserCard.tsx', userCard);
console.log('UserCard updated');

// 3. Fix HomePage.tsx
let homePage = fs.readFileSync('src/frontend/src/pages/HomePage.tsx', 'utf8');
homePage = homePage.replace(/\{getTranslatedSkillName\(skill, t\)\}/g, '<DynamicText text={getTranslatedSkillName(skill, t)} />');
homePage = homePage.replace(/\{getTranslatedSkillName\(selectedSkill, t\)\}/g, '<DynamicText text={getTranslatedSkillName(selectedSkill, t)} />');
fs.writeFileSync('src/frontend/src/pages/HomePage.tsx', homePage);
console.log('HomePage updated');

// 4. Fix ProfilePage.tsx
let profilePage = fs.readFileSync('src/frontend/src/pages/ProfilePage.tsx', 'utf8');
profilePage = profilePage.replace(/\{getTranslatedSkillName\(user\.skill, t\)\}/g, '<DynamicText text={getTranslatedSkillName(user.skill, t)} />');
profilePage = profilePage.replace(/\{getTranslatedName\(user\.name, t\)\}/g, '{translatedUserName}');
profilePage = profilePage.replace(/\{getTranslatedLocation\(user\.location, t\)\}/g, '{translatedUserLocation}');
fs.writeFileSync('src/frontend/src/pages/ProfilePage.tsx', profilePage);
console.log('ProfilePage updated');

// 5. Fix AdminDashboardPage.tsx
let adminDash = fs.readFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', 'utf8');
adminDash = adminDash.replace(/\{getTranslatedSkillName\(worker\.skill, t\)\}/g, '<DynamicText text={getTranslatedSkillName(worker.skill, t)} />');
adminDash = adminDash.replace(/\{getTranslatedSkillName\(cert\.skill, t\)\}/g, '<DynamicText text={getTranslatedSkillName(cert.skill, t)} />');
fs.writeFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', adminDash);
console.log('AdminDash updated');
