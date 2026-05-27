const fs = require('fs');

// 1. Navbar.tsx
let navbar = fs.readFileSync('src/frontend/src/components/Navbar.tsx', 'utf8');
navbar = navbar.replace(
  '<span className="text-xs text-white/70 font-body tracking-wider">',
  '<span className="text-xs text-white/70 font-body tracking-wider whitespace-nowrap">'
);
navbar = navbar.replace('Skills • Trust • Community', '{t("nav_subtitle")}');
fs.writeFileSync('src/frontend/src/components/Navbar.tsx', navbar);

// 2. Footer.tsx
let footer = fs.readFileSync('src/frontend/src/components/Footer.tsx', 'utf8');
// It might not have 't' imported or used. Let's check if it uses useLang.
if (footer.includes('const { t } = useLang();')) {
  footer = footer.replace('Skills • Trust • Community', '{t("nav_subtitle")}');
  fs.writeFileSync('src/frontend/src/components/Footer.tsx', footer);
}

// 3. LoginPage.tsx
let login = fs.readFileSync('src/frontend/src/pages/LoginPage.tsx', 'utf8');
if (login.includes('const { t } = useLang();')) {
  login = login.replace(/Skills • Trust • Community/g, '{t("nav_subtitle")}');
  fs.writeFileSync('src/frontend/src/pages/LoginPage.tsx', login);
}

// 4. AdminLoginPage.tsx
let adminLogin = fs.readFileSync('src/frontend/src/pages/AdminLoginPage.tsx', 'utf8');
if (adminLogin.includes('const { t } = useLang();')) {
  adminLogin = adminLogin.replace(/Skills • Trust • Community/g, '{t("nav_subtitle")}');
  fs.writeFileSync('src/frontend/src/pages/AdminLoginPage.tsx', adminLogin);
}

// 5. HomePage.tsx
let home = fs.readFileSync('src/frontend/src/pages/HomePage.tsx', 'utf8');
if (!home.includes('getTranslatedLocation')) {
  home = home.replace('getTranslatedSkillName,', 'getTranslatedSkillName,\n  getTranslatedLocation,');
}
home = home.replace(/\{user\.location\}/g, '{getTranslatedLocation(user.location, t)}');
home = home.replace(/\{worker\.location\}/g, '{getTranslatedLocation(worker.location, t)}');
home = home.replace(/\{selectedLocation\}/g, '{getTranslatedLocation(selectedLocation, t)}');
home = home.replace(/\{location\}/g, '{getTranslatedLocation(location, t)}');

// Also update the "Welcome, query! Showing workers near pakisthan." text
// In HomePage, it is likely: Showing workers near {selectedLocation}.
fs.writeFileSync('src/frontend/src/pages/HomePage.tsx', home);

// 6. UserCard.tsx
let userCard = fs.readFileSync('src/frontend/src/components/UserCard.tsx', 'utf8');
if (!userCard.includes('getTranslatedLocation')) {
  userCard = userCard.replace('getTranslatedSkillName,', 'getTranslatedSkillName,\n  getTranslatedLocation,');
}
userCard = userCard.replace(/\{user\.location\}/g, '{getTranslatedLocation(user.location, t)}');
fs.writeFileSync('src/frontend/src/components/UserCard.tsx', userCard);

// 7. ProfilePage.tsx
let profile = fs.readFileSync('src/frontend/src/pages/ProfilePage.tsx', 'utf8');
if (!profile.includes('getTranslatedLocation')) {
  profile = profile.replace('getTranslatedSkillName,', 'getTranslatedSkillName,\n  getTranslatedLocation,');
}
profile = profile.replace(/\{user\.location\}/g, '{getTranslatedLocation(user.location, t)}');
fs.writeFileSync('src/frontend/src/pages/ProfilePage.tsx', profile);

console.log('UI updated.');
