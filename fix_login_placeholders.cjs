const fs = require('fs');

let content = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');

content = content.replace(/login_location_label: string;/g, 
  'login_location_label: string;\n  login_choose_username: string;\n  login_username_eg: string;\n  login_contact_number: string;\n  login_contact_eg: string;');

// English
content = content.replace(/login_location_label: "Location",/g, 
  'login_location_label: "Location",\n  login_choose_username: "Choose a unique username",\n  login_username_eg: "Choose a username (e.g. john_doe)",\n  login_contact_number: "Contact Number",\n  login_contact_eg: "e.g. +91 98765 43210",');

// Telugu
content = content.replace(/login_location_label: "స్థానం",/g, 
  'login_location_label: "స్థానం",\n  login_choose_username: "ప్రత్యేక వినియోగదారు పేరును ఎంచుకోండి",\n  login_username_eg: "వినియోగదారు పేరును ఎంచుకోండి (ఉదా. john_doe)",\n  login_contact_number: "సంప్రదింపు నంబర్",\n  login_contact_eg: "ఉదా. +91 98765 43210",');

// Hindi
content = content.replace(/login_location_label: "स्थान",/g, 
  'login_location_label: "स्थान",\n  login_choose_username: "एक अनूठा उपयोगकर्ता नाम चुनें",\n  login_username_eg: "एक उपयोगकर्ता नाम चुनें (उदा. john_doe)",\n  login_contact_number: "संपर्क नंबर",\n  login_contact_eg: "उदा. +91 98765 43210",');

// Malayalam
content = content.replace(/login_location_label: "സ്ഥലം",/g, 
  'login_location_label: "സ്ഥലം",\n  login_choose_username: "ഒരു അദ്വിതീയ ഉപയോക്തൃനാമം തിരഞ്ഞെടുക്കുക",\n  login_username_eg: "ഒരു ഉപയോക്തൃനാമം തിരഞ്ഞെടുക്കുക (ഉദാ. john_doe)",\n  login_contact_number: "ബന്ധപ്പെടാനുള്ള നമ്പർ",\n  login_contact_eg: "ഉദാ. +91 98765 43210",');

// Kannada
content = content.replace(/login_location_label: "ಸ್ಥಳ",/g, 
  'login_location_label: "ಸ್ಥಳ",\n  login_choose_username: "ವಿಶಿಷ್ಟ ಬಳಕೆದಾರಹೆಸರನ್ನು ಆಯ್ಕೆಮಾಡಿ",\n  login_username_eg: "ಬಳಕೆದಾರಹೆಸರನ್ನು ಆಯ್ಕೆಮಾಡಿ (ಉದಾ. john_doe)",\n  login_contact_number: "ಸಂಪರ್ಕ ಸಂಖ್ಯೆ",\n  login_contact_eg: "ಉದಾ. +91 98765 43210",');

fs.writeFileSync('src/frontend/src/utils/translations.ts', content);

let loginContent = fs.readFileSync('src/frontend/src/pages/LoginPage.tsx', 'utf8');

loginContent = loginContent.replace(/placeholder="Choose a username \(e\.g\. john_doe\)"/g, 'placeholder={t("login_username_eg")}');
loginContent = loginContent.replace(/placeholder="Choose a unique username"/g, 'placeholder={t("login_choose_username")}');
loginContent = loginContent.replace(/placeholder="e\.g\. \+91 98765 43210"/g, 'placeholder={t("login_contact_eg")}');
loginContent = loginContent.replace(/Contact Number\s*<\/Label>/g, '{t("login_contact_number")}\n                        </Label>');

fs.writeFileSync('src/frontend/src/pages/LoginPage.tsx', loginContent);
console.log("LoginPage translations fixed!");
