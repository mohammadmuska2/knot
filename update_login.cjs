const fs = require('fs');

// 1. Update translations.ts
let transContent = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');

// Add to English
transContent = transContent.replace(/login_join_community: "Join the KNOT Community",/g, 'login_join_community: "Join the KNOT Community",\n  login_secure_auth: "Secure Authentication",');

// Add to Telugu
transContent = transContent.replace(/login_join_community: "KNOT కమ్యూనిటీలో చేరండి",/g, 'login_join_community: "KNOT కమ్యూనిటీలో చేరండి",\n  login_secure_auth: "సురక్షిత ప్రమాణీకరణ",');

// Add to Hindi
transContent = transContent.replace(/login_join_community: "KNOT समुदाय में शामिल हों",/g, 'login_join_community: "KNOT समुदाय में शामिल हों",\n  login_secure_auth: "सुरक्षित प्रमाणीकरण",');

// Add to Malayalam
transContent = transContent.replace(/login_join_community: "KNOT കമ്മ്യൂണിറ്റിയിൽ ചേരുക",/g, 'login_join_community: "KNOT കമ്മ്യൂണിറ്റിയിൽ ചേരുക",\n  login_secure_auth: "സുരക്ഷിത പ്രാമാണീകരണം",');

// Add to Kannada
transContent = transContent.replace(/login_join_community: "KNOT ಸಮುದಾಯಕ್ಕೆ ಸೇರಿ",/g, 'login_join_community: "KNOT ಸಮುದಾಯಕ್ಕೆ ಸೇರಿ",\n  login_secure_auth: "ಸುರಕ್ಷಿತ ದೃಢೀಕರಣ",');

// Add to type definition
transContent = transContent.replace(/login_join_community: string;/g, 'login_join_community: string;\n  login_secure_auth: string;');

fs.writeFileSync('src/frontend/src/utils/translations.ts', transContent);

// 2. Update LoginPage.tsx
let loginContent = fs.readFileSync('src/frontend/src/pages/LoginPage.tsx', 'utf8');
loginContent = loginContent.replace(/Secure Authentication/g, '{t("login_secure_auth")}');
fs.writeFileSync('src/frontend/src/pages/LoginPage.tsx', loginContent);

console.log("Updated Secure Authentication!");
