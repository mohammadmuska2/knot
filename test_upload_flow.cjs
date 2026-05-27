const http = require('http');

// 1. Register a user
const regData = JSON.stringify({
  username: 'testuser_videos_' + Date.now(),
  passwordHash: 'hash',
  name: 'Test',
  location: 'Test',
  skill: 'testing',
  distance: 5,
  bio: 'bio',
  contact: '123'
});

const regReq = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/users/register',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': regData.length }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log("Raw Reg Response:", body);
    try {
      const { id, token } = JSON.parse(body);
    console.log("Registered:", id, token);
    
    // 2. Upload video
    const vidData = JSON.stringify({ workerId: id, dataURI: 'mybase64video' });
    const vidReq = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/videos/upload',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': vidData.length,
        'Authorization': 'Bearer ' + token
      }
    }, vRes => {
      let vBody = '';
      vRes.on('data', d => vBody += d);
      vRes.on('end', () => console.log("Upload Response:", vRes.statusCode, vBody));
    });
    vidReq.write(vidData);
    vidReq.end();
    } catch (e) { console.error("Parse error", e); }
  });
});

regReq.write(regData);
regReq.end();
