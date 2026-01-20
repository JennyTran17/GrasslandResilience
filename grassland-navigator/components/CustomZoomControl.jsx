"use client";
import { useMap } from "react-leaflet";
import { getNDVI, getSoilMoisture, getFires } from "../lib/api";

export default function CustomZoomControl() {
  const map = useMap();

  const zoomIn = () => map.zoomIn();
  const zoomOut = () => map.zoomOut();

  return (
    <div className="absolute top-4 left-4 z-[1000] flex flex-col space-y-1">
      <button
        onClick={zoomIn}
        className="w-10 h-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg shadow-xl hover:bg-white transition-all flex items-center justify-center text-slate-700 hover:text-slate-900 font-bold text-lg"
      >
        +
      </button>
      <button
        onClick={zoomOut}
        className="w-10 h-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg shadow-xl hover:bg-white transition-all flex items-center justify-center text-slate-700 hover:text-slate-900 font-bold text-lg"
      >
        −
      </button>
    </div>
  );
}