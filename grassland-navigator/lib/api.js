// /lib/api.js
const BASE_URL = "https://grassland-resilience-rao56wzns-fathfuls-projects.vercel.app";
const BASE = BASE_URL;

// Helper function for JSON fetching
async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`API request failed: ${res.status}`);
  return res.json();
}

export const endpoints = {
  fires: `${BASE_URL}/api/firms-fires`,
  ndvi: `${BASE_URL}/api/ndvi-anomaly`,
  soilMoisture: `${BASE_URL}/api/smap-moisture`
};

export async function getNDVI() {
  const res = await fetch(endpoints.ndvi);
  if (!res.ok) throw new Error("NDVI anomaly fetch failed");
  return res.json();
}

export async function getSoilMoisture() {
  const res = await fetch(endpoints.soilMoisture);
  if (!res.ok) throw new Error("SMAP fetch failed");
  return res.json();
}

export async function getFires() {
  const res = await fetch(endpoints.fires);
  if (!res.ok) throw new Error("FIRMS fetch failed");
  return res.json();
}
export async function getTemporal(lat, lng) {
  return fetchJSON(`${BASE}/api/temporal-data?lat=${lat}&lng=${lng}`);
}

export async function postRiskScore(payload) {
  return fetchJSON(`${BASE}/api/risk-score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}