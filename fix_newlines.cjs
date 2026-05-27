const fs = require('fs');
let content = fs.readFileSync('src/frontend/src/utils/translations.ts', 'utf8');

// Replace literal "\n  admin_panel_title" with actual newline and "  admin_panel_title"
content = content.replace(/\\n  admin_panel_title/g, '\n  admin_panel_title');
// Also replace any hanging \n}; with \n};
content = content.replace(/\\n\};/g, '\n};');

fs.writeFileSync('src/frontend/src/utils/translations.ts', content);
console.log('Fixed literal newlines');
