"use client";
import { useState } from "react";
import { getNDVI, getSoilMoisture, getFires } from "../lib/api";

export default function LayersControl({ onToggle }) {
  const [layers, setLayers] = useState({
    ndvi: true,
    smap: true,
    fires: true,
  });

  function toggleLayer(key) {
    const updated = { ...layers, [key]: !layers[key] };
    setLayers(updated);
    onToggle(updated);
  }

  return (
    <div className="absolute top-4 left-4 bg-white p-3 rounded shadow-md text-sm space-y-2">
      {Object.entries(layers).map(([k, v]) => (
        <label key={k} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={v}
            onChange={() => toggleLayer(k)}
          />
          {k === "ndvi" && "NDVI Anomaly"}
          {k === "smap" && "Soil Moisture"}
          {k === "fires" && "FIRMS Fires"}
        </label>
      ))}
    </div>
  );
}
