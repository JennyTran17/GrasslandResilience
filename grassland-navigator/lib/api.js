// /lib/api.js
const BASE_URL = "https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app";

export async function getNDVI() {
  const res = await fetch(`${BASE_URL}/api/ndvi-anomaly`);
  if (!res.ok) throw new Error("NDVI anomaly fetch failed");
  return res.json();
}

export async function getSoilMoisture() {
  const res = await fetch(`${BASE_URL}/api/smap-moisture`);
  if (!res.ok) throw new Error("SMAP fetch failed");
  return res.json();
}

export async function getFires() {
  const res = await fetch(`${BASE_URL}/api/firms-fires`);
  if (!res.ok) throw new Error("FIRMS fetch failed");
  return res.json();
}
