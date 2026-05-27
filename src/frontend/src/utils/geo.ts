// Geocoding and distance utilities using Nominatim and Haversine formula

const GEO_CACHE_KEY = "knot_geo_cache_v2";

function getCache(): Record<string, [number, number] | null> {
  try {
    return JSON.parse(localStorage.getItem(GEO_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setCache(key: string, value: [number, number] | null) {
  try {
    const cache = getCache();
    cache[key] = value;
    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Geocode a location name into [latitude, longitude] using OpenStreetMap Nominatim.
 */
export async function geocode(location: string): Promise<[number, number] | null> {
  // Sanitize legacy profile typos
  let cleanLocation = location.trim();
  if (cleanLocation.toLowerCase() === "pakisthan") {
    cleanLocation = "pakistan";
  }

  const key = cleanLocation.toLowerCase();
  const cache = getCache();
  
  if (key in cache) return cache[key];
  
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanLocation)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "en", "User-Agent": "KNOT-app/1.0" },
    });
    const data = await res.json();
    if (data.length > 0) {
      const coord: [number, number] = [
        Number.parseFloat(data[0].lat),
        Number.parseFloat(data[0].lon),
      ];
      setCache(key, coord);
      return coord;
    }
  } catch {
    /* silently ignore */
  }
  setCache(key, null);
  return null;
}

/**
 * Calculate the Haversine distance in kilometers between two coordinates.
 */
export function getHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
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
