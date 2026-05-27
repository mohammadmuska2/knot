const fs = require('fs');

let content = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');

// Inject into Translations interface
content = content.replace(/admin_clear_data: string;/g, 
  'admin_clear_data: string;\n  admin_welcome: string;\n  admin_administrator: string;\n  admin_refresh: string;\n  admin_logout: string;\n  admin_practical_approval: string;\n  admin_th_contact: string;\n  admin_secure_access: string;');

// Using function replacer to handle each language properly based on order
let matchIndex = 0;
content = content.replace(/admin_clear_data: "[^"]+",/g, (match) => {
  matchIndex++;
  let extras = "";
  if (matchIndex === 1) {
    // English
    extras = '\n  admin_welcome: "Welcome,",\n  admin_administrator: "Administrator",\n  admin_refresh: "Refresh",\n  admin_logout: "Logout",\n  admin_practical_approval: "Practical Approval",\n  admin_th_contact: "Contact",\n  admin_secure_access: "Secure Administrator Access",';
  } else if (matchIndex === 2) {
    // Telugu
    extras = '\n  admin_welcome: "స్వాగతం,",\n  admin_administrator: "అడ్మినిస్ట్రేటర్",\n  admin_refresh: "రిఫ్రెష్",\n  admin_logout: "లాగౌట్",\n  admin_practical_approval: "ప్రాక్టికల్ ఆమోదం",\n  admin_th_contact: "సంప్రదింపు",\n  admin_secure_access: "సురక్షిత అడ్మినిస్ట్రేటర్ యాక్సెస్",';
  } else if (matchIndex === 3) {
    // Hindi
    extras = '\n  admin_welcome: "स्वागत है,",\n  admin_administrator: "प्रशासक",\n  admin_refresh: "रिफ्रेश",\n  admin_logout: "लॉगआउट",\n  admin_practical_approval: "व्यावहारिक स्वीकृति",\n  admin_th_contact: "संपर्क",\n  admin_secure_access: "सुरक्षित प्रशासक एक्सेस",';
  } else if (matchIndex === 4) {
    // Malayalam
    extras = '\n  admin_welcome: "സ്വാഗതം,",\n  admin_administrator: "അഡ്മിനിസ്ട്രേറ്റർ",\n  admin_refresh: "റിഫ്രഷ്",\n  admin_logout: "ലോഗൗട്ട്",\n  admin_practical_approval: "പ്രായോഗിക അംഗീകാരം",\n  admin_th_contact: "ബന്ധപ്പെടുക",\n  admin_secure_access: "സുരക്ഷിത അഡ്മിനിസ്ട്രേറ്റർ ആക്സസ്",';
  } else if (matchIndex === 5) {
    // Kannada
    extras = '\n  admin_welcome: "ಸ್ವಾಗತ,",\n  admin_administrator: "ನಿರ್ವಾಹಕ",\n  admin_refresh: "ರಿಫ್ರೆಶ್",\n  admin_logout: "ಲಾಗೌಟ್",\n  admin_practical_approval: "ಪ್ರಾಯೋಗಿಕ ಅನುಮೋದನೆ",\n  admin_th_contact: "ಸಂಪರ್ಕ",\n  admin_secure_access: "ಸುರಕ್ಷಿತ ನಿರ್ವಾಹಕ ಪ್ರವೇಶ",';
  }
  return match + extras;
});

fs.writeFileSync('src/frontend/src/utils/translations.ts', content);
console.log("Admin dashboard translations injected!");
