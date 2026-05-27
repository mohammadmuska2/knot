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

const user = [30.3308, 71.2474]; // Pakistan
const bangalore = [12.9716, 77.5946];
const hyderabad = [17.3850, 78.4867];
const delhi = [28.6139, 77.2090];
const pune = [18.5204, 73.8567];
const kashmir = [33.7782, 76.5762];

console.log("Pakistan to Bangalore:", getHaversineDistance(user[0], user[1], bangalore[0], bangalore[1]).toFixed(0));
console.log("Pakistan to Hyderabad:", getHaversineDistance(user[0], user[1], hyderabad[0], hyderabad[1]).toFixed(0));
console.log("Pakistan to Delhi:", getHaversineDistance(user[0], user[1], delhi[0], delhi[1]).toFixed(0));
console.log("Pakistan to Pune:", getHaversineDistance(user[0], user[1], pune[0], pune[1]).toFixed(0));
console.log("Pakistan to Kashmir:", getHaversineDistance(user[0], user[1], kashmir[0], kashmir[1]).toFixed(0));
