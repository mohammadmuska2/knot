const fs = require('fs');

let certContent = fs.readFileSync('src/backend/routes/certification.js', 'utf8');

if (!certContent.includes('/submit-practical')) {
  const submitPracticalRoute = `
// POST /api/certification/submit-practical
router.post('/submit-practical', (req, res) => {
  try {
    const { workerId, workerName, skill, videoDataURI } = req.body;
    const dbData = readDB();
    
    const existingIndex = dbData.practicalVideoSubmissions.findIndex(s => s.workerId === workerId);
    const submission = {
      status: 'pending',
      workerId: workerId,
      workerName: workerName || 'Unknown',
      skill: skill || 'Unknown',
      videoDataURI: videoDataURI || '',
      submittedAt: Date.now()
    };

    if (existingIndex >= 0) {
      dbData.practicalVideoSubmissions[existingIndex] = submission;
    } else {
      dbData.practicalVideoSubmissions.push(submission);
    }
    
    writeDB(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;`;

  certContent = certContent.replace(/module\.exports = router;[\s\S]*$/, submitPracticalRoute);
  fs.writeFileSync('src/backend/routes/certification.js', certContent);
  console.log("Injected /submit-practical route!");
} else {
  console.log("/submit-practical already exists.");
}
