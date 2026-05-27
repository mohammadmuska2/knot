const fs = require('fs');

let content = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');

// The English block has: login_join_community: "Join the Community",
content = content.replace(/login_join_community: "Join the Community",/, 
  'login_join_community: "Join the Community",\n  login_secure_auth: "Secure Authentication",');

// Telugu block has: login_join_community: "సమాజంలో చేరండి",
content = content.replace(/login_join_community: "సమాజంలో చేరండి",/, 
  'login_join_community: "సమాజంలో చేరండి",\n  login_secure_auth: "సురక్షిత ప్రమాణీకరణ",');

// Hindi block has: login_join_community: "समुदाय में शामिल हों",
content = content.replace(/login_join_community: "समुदाय में शामिल हों",/, 
  'login_join_community: "समुदाय में शामिल हों",\n  login_secure_auth: "सुरक्षित प्रमाणीकरण",');

// Malayalam block has: login_join_community: "കമ്മ്യൂണിറ്റിയിൽ ചേരുക",
content = content.replace(/login_join_community: "കമ്മ്യൂണിറ്റിയിൽ ചേരുക",/, 
  'login_join_community: "കമ്മ്യൂണിറ്റിയിൽ ചേരുക",\n  login_secure_auth: "സുരക്ഷിത പ്രാമാണീകരണം",');

// Kannada block has: login_join_community: "ಸಮುದಾಯಕ್ಕೆ ಸೇರಿ",
content = content.replace(/login_join_community: "ಸಮುದಾಯಕ್ಕೆ ಸೇರಿ",/, 
  'login_join_community: "ಸಮುದಾಯಕ್ಕೆ ಸೇರಿ",\n  login_secure_auth: "ಸುರಕ್ಷಿತ ದೃಢೀಕರಣ",');

fs.writeFileSync('src/frontend/src/utils/translations.ts', content);
console.log("Translations correctly injected!");
