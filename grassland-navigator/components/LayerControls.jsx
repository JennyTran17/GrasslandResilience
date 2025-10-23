"use client";
import { useState } from "react";

export default function LayerControls({ onLayerToggle }) {
  const [layers, setLayers] = useState({
    ndvi: true,
    soilMoisture: true,
    riskLevel: true,
    precipitation: false,
  });

  const handleToggle = (layerKey) => {
    const newLayers = { ...layers, [layerKey]: !layers[layerKey] };
    setLayers(newLayers);
    onLayerToggle?.(layerKey, newLayers[layerKey]);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg shadow-xl absolute top-4 left-4 p-4 min-w-[240px] z-[1000]">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">DATA LAYERS</h3>
          <div className="text-xs text-slate-500 mt-0.5">Toggle visibility</div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <span className="text-xs text-slate-500 font-medium">LIVE</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <label className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={layers.ndvi}
              onChange={() => handleToggle("ndvi")}
              className="w-4 h-4 text-emerald-600 bg-white border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-800">NDVI Anomaly</span>
              <div className="text-xs text-slate-500">Vegetation Index</div>
            </div>
          </div>
          <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
        </label>
        
        <label className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={layers.soilMoisture}
              onChange={() => handleToggle("soilMoisture")}
              className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-800">Soil Moisture</span>
              <div className="text-xs text-slate-500">SMAP Satellite</div>
            </div>
          </div>
          <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
        </label>
        
        <label className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={layers.riskLevel}
              onChange={() => handleToggle("riskLevel")}
              className="w-4 h-4 text-amber-600 bg-white border-slate-300 rounded focus:ring-2 focus:ring-amber-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-800">Risk Assessment</span>
              <div className="text-xs text-slate-500">Composite Index</div>
            </div>
          </div>
          <div className="w-3 h-3 bg-amber-500 rounded-sm"></div>
        </label>
        
        <label className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={layers.precipitation}
              onChange={() => handleToggle("precipitation")}
              className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-2 focus:ring-indigo-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-800">Precipitation</span>
              <div className="text-xs text-slate-500">GPM Satellite</div>
            </div>
          </div>
          <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div>
        </label>
      </div>
    </div>
  );
}