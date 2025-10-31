"use client";
import { useState } from "react";

const PREDEFINED_REGIONS = [
  {
    id: "ireland",
    name: "Ireland",
    center: [53.3, -8.0],
    zoom: 7,
    bounds: [[51.4, -10.5], [55.4, -5.5]]
  },
  {
    id: "dublin",
    name: "Dublin Region",
    center: [53.35, -6.26],
    zoom: 10,
    bounds: [[53.2, -6.5], [53.5, -6.0]]
  },
  {
    id: "cork",
    name: "Cork Region",
    center: [51.9, -8.47],
    zoom: 10,
    bounds: [[51.7, -8.8], [52.1, -8.1]]
  },
  {
    id: "galway",
    name: "Galway Region",
    center: [53.27, -9.05],
    zoom: 10,
    bounds: [[53.1, -9.3], [53.4, -8.8]]
  },
  {
    id: "limerick",
    name: "Limerick Region",
    center: [52.66, -8.63],
    zoom: 10,
    bounds: [[52.5, -8.9], [52.8, -8.3]]
  },
  {
    id: "waterford",
    name: "Waterford Region",
    center: [52.26, -7.11],
    zoom: 10,
    bounds: [[52.1, -7.4], [52.4, -6.8]]
  }
];

export default function GeographicAreaSelector({ onAreaSelect, isExpanded, onToggle }) {
  const [selectedRegion, setSelectedRegion] = useState("ireland");

  const handleRegionSelect = (region) => {
    setSelectedRegion(region.id);
    onAreaSelect?.(region);
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-lg shadow-xl hover:bg-slate-800/90 transition-all flex items-center space-x-2"
      >
        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
        <span className="text-sm font-medium">Areas</span>
        <span className="text-xs">{isExpanded ? '−' : '+'}</span>
      </button>
      
      {isExpanded && (
        <div className="absolute top-12 left-0 bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg shadow-xl p-4 min-w-[240px] z-[1100]">
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-600 mb-3 uppercase tracking-wide">
              Select Region
            </div>
            {PREDEFINED_REGIONS.map((region) => (
              <button
                key={region.id}
                onClick={() => handleRegionSelect(region)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedRegion === region.id
                    ? 'bg-purple-50 border-2 border-purple-200 text-purple-800'
                    : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{region.name}</div>
                    <div className="text-xs text-slate-500 font-mono">
                      {region.center[0].toFixed(2)}°N, {Math.abs(region.center[1]).toFixed(2)}°W
                    </div>
                  </div>
                  {selectedRegion === region.id && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}