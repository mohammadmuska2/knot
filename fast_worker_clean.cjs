const fs = require('fs');

let content = fs.readFileSync('src/frontend/src/pages/WorkerDashboardPage.tsx', 'utf8');

const startIndex = content.indexOf('{/* Certification / Peer Validation Section */}');
if (startIndex !== -1) {
  const endIndex = content.indexOf('<Separator />', startIndex);
  if (endIndex !== -1) {
    // Remove everything from startIndex to right before the <Separator />
    content = content.substring(0, startIndex) + content.substring(endIndex);
  }
}

// Now we need to remove the Practical Video Upload Section!
const videoStartIndex = content.indexOf('{/* Practical Video Upload Section */}');
if (videoStartIndex !== -1) {
  // Let's find where this section ends. It's probably followed by another <Separator /> or a close tag.
  // Actually, we can just replace the whole section by searching for the start and the next section.
  const nextSectionIndex = content.indexOf('<Separator />', videoStartIndex);
  if (nextSectionIndex !== -1) {
    content = content.substring(0, videoStartIndex) + content.substring(nextSectionIndex);
  } else {
    const endSectionIndex = content.indexOf('</section>', videoStartIndex);
    if (endSectionIndex !== -1) {
      content = content.substring(0, videoStartIndex) + content.substring(endSectionIndex + '</section>'.length);
    }
  }
}

fs.writeFileSync('src/frontend/src/pages/WorkerDashboardPage.tsx', content);
console.log("WorkerDashboardPage cleaned!");
