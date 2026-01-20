// pages/api/sample.js
export default async function handler(req, res) {
  const { lat, lon } = req.query;
  // For demo return a simple mock timeseries (12 monthly points)
  const now = new Date();
  const timeseries = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const date = d.toISOString().slice(0, 10);
    // simple mock values — backend will replace with real NDVI samples
    const ndvi = Math.round(3000 + Math.sin(i / 2) * 800);
    const climatology = Math.round(3200 + Math.cos(i / 3) * 500);
    timeseries.push({ date, ndvi, climatology });
  }
  res.status(200).json({ lat, lon, timeseries });
}
