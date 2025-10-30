"use client";
import { useEffect, useState } from "react";
import { getNDVI } from "@/lib/api";

export default function Legend() {
  const [legend, setLegend] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await getNDVI();
      setLegend(res.data.legend);
    })();
  }, []);

  if (!legend) return null;

  return (
    <div className="bg-white/90 backdrop-blur-md p-3 rounded shadow text-xs space-y-1 border border-slate-200">
      <h4 className="font-semibold mb-1">NDVI Legend</h4>
      {Object.entries(legend).map(([color, desc]) => (
        <div key={color} className="flex items-center gap-2">
          <div
            className="w-4 h-2 rounded-sm border border-slate-300"
            style={{ backgroundColor: color.toLowerCase() }}
          />
          <span>{desc}</span>
        </div>
      ))}
    </div>
  );
}
