const fs = require('fs');

let content = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');

// Inject into Translations interface
content = content.replace(/login_location_label: string;/g, 
  'login_location_label: string;\n\n  // AdminLoginPage\n  admin_secure_gateway: string;\n  admin_portal_access: string;\n  admin_authorized_only: string;\n  admin_return_gateway: string;');

// Inject into English
content = content.replace(/login_location_label: "Location",/g, 
  'login_location_label: "Location",\n\n  admin_secure_gateway: "Secure Administrator Gateway",\n  admin_portal_access: "Portal Access",\n  admin_authorized_only: "Authorized Personnel Only",\n  admin_return_gateway: "Return to Citizen & Worker Gateway",');

// Inject into Telugu
content = content.replace(/login_location_label: "స్థానం",/g, 
  'login_location_label: "స్థానం",\n\n  admin_secure_gateway: "సురక్షిత అడ్మినిస్ట్రేటర్ గేట్‌వే",\n  admin_portal_access: "పోర్టల్ యాక్సెస్",\n  admin_authorized_only: "అధికారం ఉన్న సిబ్బందికి మాత్రమే",\n  admin_return_gateway: "పౌర & కార్మిక గేట్‌వేకి తిరిగి వెళ్లండి",');

// Inject into Hindi
content = content.replace(/login_location_label: "स्थान",/g, 
  'login_location_label: "स्थान",\n\n  admin_secure_gateway: "सुरक्षित प्रशासक गेटवे",\n  admin_portal_access: "पोर्टल एक्सेस",\n  admin_authorized_only: "केवल अधिकृत कर्मियों के लिए",\n  admin_return_gateway: "नागरिक और कर्मचारी गेटवे पर लौटें",');

// Inject into Malayalam
content = content.replace(/login_location_label: "സ്ഥലം",/g, 
  'login_location_label: "സ്ഥലം",\n\n  admin_secure_gateway: "സുരക്ഷിത അഡ്മിനിസ്ട്രേറ്റർ ഗേറ്റ്‌വേ",\n  admin_portal_access: "പോർട്ടൽ ആക്സസ്",\n  admin_authorized_only: "അംഗീകൃത ഉദ്യോഗസ്ഥർക്ക് മാത്രം",\n  admin_return_gateway: "സിറ്റിസൺ & വർക്കർ ഗേറ്റ്‌വേയിലേക്ക് മടങ്ങുക",');

// Inject into Kannada
content = content.replace(/login_location_label: "ಸ್ಥಳ",/g, 
  'login_location_label: "ಸ್ಥಳ",\n\n  admin_secure_gateway: "ಸುರಕ್ಷಿತ ನಿರ್ವಾಹಕ ಗೇಟ್‌ವೇ",\n  admin_portal_access: "ಪೋರ್ಟಲ್ ಪ್ರವೇಶ",\n  admin_authorized_only: "ಅಧಿಕೃತ ಸಿಬ್ಬಂದಿಗೆ ಮಾತ್ರ",\n  admin_return_gateway: "ನಾಗರಿಕ ಮತ್ತು ಕಾರ್ಮಿಕ ಗೇಟ್‌ವೇಗೆ ಹಿಂತಿರುಗಿ",');

fs.writeFileSync('src/frontend/src/utils/translations.ts', content);
console.log("Admin translations injected!");
