async function run() {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent('Bangalore')}&format=json&limit=1`;
  const res = await fetch(url, { headers: { "User-Agent": "test" } });
  const data = await res.json();
  console.log(data);
}
run();
