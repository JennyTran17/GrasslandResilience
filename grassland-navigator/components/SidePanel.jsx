"use client";
import { useEffect, useState } from "react";
import { getNDVI, getSoilMoisture } from "@/lib/api";

export default function SidePanel() {
  const [ndvi, setNdvi] = useState(null);
  const [smap, setSmap] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setNdvi((await getNDVI()).data);
        setSmap((await getSoilMoisture()).data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  if (!ndvi || !smap) return <div className="p-4">Loading data…</div>;

  return (
    <div className="p-4 bg-white h-full overflow-y-auto space-y-4">
      <section>
        <h3 className="font-semibold mb-2">NDVI Anomaly</h3>
        <p className="text-sm">
          Region: {ndvi.metadata.region}<br />
          Date: {ndvi.metadata.currentDate}<br />
          Source: {ndvi.metadata.source}<br />
          Resolution: {ndvi.metadata.resolution}
        </p>
      </section>
      <section>
        <h3 className="font-semibold mb-2">Soil Moisture</h3>
        <p className="text-sm">
          Source: {smap.metadata?.source}<br />
          Resolution: {smap.metadata?.resolution}
        </p>
      </section>
    </div>
  );
}
