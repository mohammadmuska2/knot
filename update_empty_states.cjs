const fs = require('fs');

let content = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');

// Inject new empty state translations
content = content.replace(/admin_secure_access: string;/g, 
  'admin_secure_access: string;\n  admin_no_workers: string;\n  admin_no_citizens: string;\n  admin_no_requests: string;');

// English
content = content.replace(/admin_secure_access: "Secure Administrator Access",/g, 
  'admin_secure_access: "Secure Administrator Access",\n  admin_no_workers: "No workers registered yet.",\n  admin_no_citizens: "No citizens registered yet.",\n  admin_no_requests: "No learning requests yet.",');

// Telugu
content = content.replace(/admin_secure_access: "సురక్షిత అడ్మినిస్ట్రేటర్ యాక్సెస్",/g, 
  'admin_secure_access: "సురక్షిత అడ్మినిస్ట్రేటర్ యాక్సెస్",\n  admin_no_workers: "ఇంకా కార్మికులు నమోదు కాలేదు.",\n  admin_no_citizens: "ఇంకా పౌరులు నమోదు కాలేదు.",\n  admin_no_requests: "ఇంకా అభ్యర్థనలు లేవు.",');

// Hindi
content = content.replace(/admin_secure_access: "सुरक्षित प्रशासक एक्सेस",/g, 
  'admin_secure_access: "सुरक्षित प्रशासक एक्सेस",\n  admin_no_workers: "अभी तक कोई कर्मचारी पंजीकृत नहीं है।",\n  admin_no_citizens: "अभी तक कोई नागरिक पंजीकृत नहीं है।",\n  admin_no_requests: "अभी तक कोई अनुरोध नहीं है।",');

// Malayalam
content = content.replace(/admin_secure_access: "സുരക്ഷിത അഡ്മിനിസ്ട്രേറ്റർ ആക്സസ്",/g, 
  'admin_secure_access: "സുരക്ഷിത അഡ്మిനിസ്ട്രേറ്റർ ആക്സസ്",\n  admin_no_workers: "ഇതുവരെ തൊഴിലാളികൾ രജിസ്റ്റർ ചെയ്തിട്ടില്ല.",\n  admin_no_citizens: "ഇതുവരെ പൗരന്മാർ രജിസ്റ്റർ ചെയ്തിട്ടില്ല.",\n  admin_no_requests: "ഇതുവരെ അഭ്യർത്ഥനകൾ ഇല്ല.",');

// Kannada
content = content.replace(/admin_secure_access: "ಸುರಕ್ಷಿತ ನಿರ್ವಾಹಕ ಪ್ರವೇಶ",/g, 
  'admin_secure_access: "ಸುರಕ್ಷಿತ ನಿರ್ವಾಹಕ ಪ್ರವೇಶ",\n  admin_no_workers: "ಇನ್ನೂ ಯಾವುದೇ ಕಾರ್ಮಿಕರು ನೋಂದಾಯಿಸಲಾಗಿಲ್ಲ.",\n  admin_no_citizens: "ಇನ್ನೂ ಯಾವುದೇ ನಾಗರಿಕರು ನೋಂದಾಯಿಸಲಾಗಿಲ್ಲ.",\n  admin_no_requests: "ಇನ್ನೂ ಯಾವುದೇ ವಿನಂತಿಗಳಿಲ್ಲ.",');

fs.writeFileSync('src/frontend/src/utils/translations.ts', content);
console.log("Translations updated!");
