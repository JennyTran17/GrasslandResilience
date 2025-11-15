// /lib/api.js
const BASE_URL = "https://grassland-resilience.vercel.app";

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
  const res = await fetch(`${BASE_URL}/api/temporal-data?lat=${lat}&lng=${lng}`);
  if (!res.ok) throw new Error("Temporal data fetch failed");
  return res.json();
}

export async function postRiskScore(payload) {
  const res = await fetch(`${BASE_URL}/api/risk-score?lat={lat}&lng={lng}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Risk score fetch failed");
  return res.json();
}