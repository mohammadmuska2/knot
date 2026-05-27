const http = require('http');

const loginData = JSON.stringify({ username: 'admin', passwordHash: '4aee17e147a0be1a895dee08b461df414f985c15f3e119b6e4e3c836f95ad6b3' });

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/admin/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const token = JSON.parse(body).token;
    console.log("Admin token:", token);
    
    http.get('http://localhost:3001/api/certification/practical-pending', {
      headers: { 'Authorization': 'Bearer ' + token }
    }, vRes => {
      let vBody = '';
      vRes.on('data', d => vBody += d);
      vRes.on('end', () => console.log("Pending videos:", vRes.statusCode, vBody));
    });
  });
});
req.write(loginData);
req.end();
