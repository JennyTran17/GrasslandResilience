import { endpoints } from "@/lib/api";

export default async function handler(req, res) {
  try {
    const r = await fetch(endpoints.fires);

    // Ensure response is OK and JSON
    const contentType = r.headers.get("content-type") || "";
    if (!r.ok) {
      const text = await r.text();
      console.error("Backend returned error:", text);
      return res
        .status(r.status)
        .json({ error: `Backend error (${r.status})`, details: text });
    }

    if (!contentType.includes("application/json")) {
      const text = await r.text();
      console.error("Unexpected non-JSON:", text.slice(0, 100));
      return res.status(500).json({ error: "Invalid JSON response", preview: text.slice(0, 100) });
    }

    const json = await r.json();
    res.status(200).json(json);
  } catch (e) {
    console.error("FIRMS fetch failed:", e);
    res.status(500).json({ error: "Failed to fetch FIRMS data" });
  }
}
