"use client";
import { useState } from "react";
// Import remains, but not used here
import { getNDVI, getSoilMoisture, getFires } from "../lib/api"; 

export default function LayersControl({ onToggle }) {
  const [layerVisibilities, setLayerVisibilities] = useState({
    ndvi: true, // Corresponds to layerStates.ndvi
    soilMoisture: true, // Corresponds to layerStates.soilMoisture
    fires: true, // Corresponds to your CircleMarker rendering (which is fine)
  });

  function toggleLayer(key) {
    const updatedVisibilities = {
        ...layerVisibilities,
        [key]: !layerVisibilities[key]
    };

    setLayerVisibilities(updatedVisibilities);
    onToggle(updatedVisibilities);
  }

  return (
    <div className="absolute top-4 left-4 bg-white p-3 rounded shadow-md text-sm space-y-2">
      {Object.entries(layerVisibilities).map(([k, v]) => (
        <label key={k} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={v}
            onChange={() => toggleLayer(k)}
          />
          {k === "ndvi" && "NDVI Anomaly"}
          {k === "soilMoisture" && "Soil Moisture"} {/* 3. Update the display label */}
          {k === "fires" && "FIRMS Fires"}
        </label>
      ))}
    </div>
  );
}