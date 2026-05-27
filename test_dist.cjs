const fetch = require('node-fetch');

function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function geocode(location) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { "User-Agent": "test" } });
  const data = await res.json();
  if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  return null;
}

async function run() {
  const loc1 = await geocode("pakistan");
  const loc2 = await geocode("bangalore");
  const loc3 = await geocode("hyderabad");
  const loc4 = await geocode("kakinada");
  
  console.log("pakistan vs bangalore:", getHaversineDistance(loc1[0], loc1[1], loc2[0], loc2[1]));
  console.log("hyderabad vs bangalore:", getHaversineDistance(loc3[0], loc3[1], loc2[0], loc2[1]));
  console.log("kakinada vs bangalore:", getHaversineDistance(loc4[0], loc4[1], loc2[0], loc2[1]));
}

run();
