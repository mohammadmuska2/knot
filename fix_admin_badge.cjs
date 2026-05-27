const fs = require('fs');

let content = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');

// Inject into Translations interface
content = content.replace(/admin_secure_gateway: string;/g, 
  'admin_badge: string;\n  admin_secure_gateway: string;');

// Inject into English
content = content.replace(/admin_secure_gateway: "Secure Administrator Gateway",/g, 
  'admin_badge: "ADMIN",\n  admin_secure_gateway: "Secure Administrator Gateway",');

// Inject into Telugu
content = content.replace(/admin_secure_gateway: "సురక్షిత అడ్మినిస్ట్రేటర్ గేట్‌వే",/g, 
  'admin_badge: "అడ్మిన్",\n  admin_secure_gateway: "సురక్షిత అడ్మినిస్ట్రేటర్ గేట్‌వే",');

// Inject into Hindi
content = content.replace(/admin_secure_gateway: "सुरक्षित प्रशासक गेटवे",/g, 
  'admin_badge: "एडमिन",\n  admin_secure_gateway: "सुरक्षित प्रशासक गेटवे",');

// Inject into Malayalam
content = content.replace(/admin_secure_gateway: "സുരക്ഷിത അഡ്മിനിസ്ട്രേറ്റർ ഗേറ്റ്‌വേ",/g, 
  'admin_badge: "അഡ്മിൻ",\n  admin_secure_gateway: "സുരക്ഷിത അഡ്మిനിസ്ട്രേറ്റർ ഗേറ്റ്‌വേ",');

// Inject into Kannada
content = content.replace(/admin_secure_gateway: "ಸುರಕ್ಷಿತ ನಿರ್ವಾಹಕ ಗೇಟ್‌ವೇ",/g, 
  'admin_badge: "ಅಡ್ಮಿನ್",\n  admin_secure_gateway: "ಸುರಕ್ಷಿತ ನಿರ್ವಾಹಕ ಗೇಟ್‌ವೇ",');

fs.writeFileSync('src/frontend/src/utils/translations.ts', content);
console.log("Admin badge translations injected!");
