import { endpoints } from "@/lib/api";

export default async function handler(req, res) {
  try {
    const [ndviRes, smapRes] = await Promise.all([
      fetch(endpoints.ndvi),
      fetch(endpoints.smap),
    ]);

    const ndvi = await ndviRes.json();
    const smap = await smapRes.json();

    res.status(200).json({
      ndviTemplate: ndvi?.data?.tileUrl,
      smapTemplate: smap?.data?.tileUrl,
    });
  } catch (err) {
    console.error("Tile config error:", err);
    res.status(500).json({ error: "Failed to fetch tiles" });
  }
}
