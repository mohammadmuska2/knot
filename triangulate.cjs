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

const bangalore = [12.9716, 77.5946];
const hyderabad = [17.3850, 78.4867];
const delhi = [28.6139, 77.2090];

// Triangulation helper
for (let lat = -90; lat <= 90; lat += 0.5) {
  for (let lon = -180; lon <= 180; lon += 0.5) {
    const d1 = getHaversineDistance(lat, lon, bangalore[0], bangalore[1]);
    const d2 = getHaversineDistance(lat, lon, hyderabad[0], hyderabad[1]);
    const d3 = getHaversineDistance(lat, lon, delhi[0], delhi[1]);
    
    // Check if the distances match the screenshot (818, 1218, 2462) with some tolerance (+-10km)
    if (Math.abs(d1 - 818) < 15 && Math.abs(d2 - 1218) < 15 && Math.abs(d3 - 2462) < 15) {
      console.log(`Found candidate: [${lat}, ${lon}]`);
      console.log(`Distances: BLR=${d1.toFixed(0)}, HYD=${d2.toFixed(0)}, DEL=${d3.toFixed(0)}`);
    }
  }
}
