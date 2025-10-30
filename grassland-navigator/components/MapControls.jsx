"use client";
import { useState } from "react";
import { getNDVI, getSoilMoisture, getFires } from "../lib/api";

export default function MapControls() {
  const [activeView, setActiveView] = useState("satellite");
  const [opacity, setOpacity] = useState(80);

  const viewModes = [
    { id: "satellite", name: "Satellite", icon: "🛰️" },
    { id: "terrain", name: "Terrain", icon: "🗺️" },
    { id: "hybrid", name: "Hybrid", icon: "🌍" },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg shadow-xl absolute top-4 right-4 p-4 min-w-[200px] z-[1000]">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">MAP CONTROLS</h3>
          <div className="text-xs text-slate-500 mt-0.5">View & analysis tools</div>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="mb-4">
        <label className="text-xs font-medium text-slate-600 mb-2 block uppercase tracking-wide">Base Layer</label>
        <div className="grid grid-cols-3 gap-1">
          {viewModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveView(mode.id)}
              className={`p-2 rounded-md text-xs font-medium transition-all ${
                activeView === mode.id
                  ? "bg-emerald-500 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <div className="text-sm mb-1">{mode.icon}</div>
              {mode.name}
            </button>
          ))}
        </div>
      </div>

      {/* Opacity Slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Opacity</label>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{opacity}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={opacity}
          onChange={(e) => setOpacity(e.target.value)}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <button className="w-full bg-slate-100 hover:bg-slate-200 p-2.5 text-sm font-medium text-slate-700 rounded-md flex items-center justify-center space-x-2 transition-colors">
          <span>📍</span>
          <span>Geocode</span>
        </button>
        <button className="w-full bg-slate-100 hover:bg-slate-200 p-2.5 text-sm font-medium text-slate-700 rounded-md flex items-center justify-center space-x-2 transition-colors">
          <span>📊</span>
          <span>Export</span>
        </button>
      </div>
    </div>
  );
}