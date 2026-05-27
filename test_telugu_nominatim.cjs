async function run() {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent('పాకిస్తాన్')}&format=json&limit=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "te-IN,te;q=0.9,en-US;q=0.8,en;q=0.7", "User-Agent": "test" } });
  const data = await res.json();
  console.log(data);
}
run();
