"use client";
import { useState } from "react";
import { getNDVI, getSoilMoisture, getFires } from "../lib/api";
import { useMap } from "react-leaflet";
import GeographicAreaSelector from "./GeographicAreaSelector";

export default function CompactControls({ layerStates, onLayerToggle, onOpacityChange, onAreaSelect }) {
  const [expandedPanel, setExpandedPanel] = useState(null);

  const handleToggle = (layerKey) => {
    onLayerToggle?.(layerKey);
  };

  const handleOpacityChange = (layerKey, opacity) => {
    onOpacityChange?.(layerKey, opacity);
  };

  const togglePanel = (panel) => {
    setExpandedPanel(expandedPanel === panel ? null : panel);
  };

  return (
    <div className="absolute top-4 left-20 z-[1000] flex space-x-2">
      {/* Geographic Area Selector */}
      <GeographicAreaSelector
        onAreaSelect={onAreaSelect}
        isExpanded={expandedPanel === 'areas'}
        onToggle={() => togglePanel('areas')}
      />
      {/* Data Layers Button */}
      <div className="relative">
        <button
          onClick={() => togglePanel('layers')}
          className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-lg shadow-xl hover:bg-slate-800/90 transition-all flex items-center space-x-2"
        >
          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
          <span className="text-sm font-medium">Layers</span>
          <span className="text-xs">{expandedPanel === 'layers' ? '−' : '+'}</span>
        </button>
        
        {expandedPanel === 'layers' && (
          <div className="absolute top-12 left-0 bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg shadow-xl p-4 min-w-[280px] z-[1100]">
            <div className="space-y-4">
              {[
                { key: 'ndvi', label: 'NDVI Anomaly', desc: 'Vegetation Index', color: 'blue' },
                { key: 'soilMoisture', label: 'Soil Moisture', desc: 'SMAP Satellite', color: 'emerald' },
                { key: 'riskLevel', label: 'Risk Assessment', desc: 'Composite Index', color: 'amber' },
                { key: 'precipitation', label: 'Precipitation', desc: 'GPM Satellite', color: 'indigo' }
              ].map((layer) => (
                <div key={layer.key} className="p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                  <label className="flex items-center justify-between cursor-pointer mb-2">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={layerStates?.[layer.key]?.visible ?? (layer.key === 'ndvi' || layer.key === 'soilMoisture')}
                        onChange={() => handleToggle(layer.key)}
                        className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-800">{layer.label}</div>
                        <div className="text-xs text-slate-500">{layer.desc}</div>
                      </div>
                    </div>
                    <div className={`w-3 h-3 bg-${layer.color}-500 rounded-sm`}></div>
                  </label>
                  {(layerStates?.[layer.key]?.visible ?? (layer.key === 'ndvi' || layer.key === 'soilMoisture')) && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                        <span>Opacity</span>
                        <span>{Math.round((layerStates?.[layer.key]?.opacity || (layer.key === 'ndvi' ? 0.7 : 0.5)) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={Math.round((layerStates?.[layer.key]?.opacity || (layer.key === 'ndvi' ? 0.7 : 0.5)) * 100)}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                        onChange={(e) => handleOpacityChange(layer.key, parseInt(e.target.value))}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Risk Assessment Button */}
      <div className="relative">
        <button
          onClick={() => togglePanel('risk')}
          className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-lg shadow-xl hover:bg-slate-800/90 transition-all flex items-center space-x-2"
        >
          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
          <span className="text-sm font-medium">Risk</span>
          <span className="text-xs">{expandedPanel === 'risk' ? '−' : '+'}</span>
        </button>
        
        {expandedPanel === 'risk' && (
          <div className="absolute top-12 left-0 bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg shadow-xl p-4 min-w-[280px] z-[1100]">
            <div className="space-y-2">
              {[
                { level: "Minimal", color: "bg-emerald-500", value: "0.0-0.2", percentage: "15%" },
                { level: "Moderate", color: "bg-amber-500", value: "0.2-0.5", percentage: "35%" },
                { level: "Elevated", color: "bg-orange-500", value: "0.5-0.8", percentage: "40%" },
                { level: "Severe", color: "bg-red-500", value: "0.8-1.0", percentage: "10%" }
              ].map((risk, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-sm ${risk.color}`}></div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-slate-800">{risk.level}</span>
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{risk.value}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-slate-700">{risk.percentage}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map Controls Button */}
      <div className="relative">
        <button
          onClick={() => togglePanel('controls')}
          className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-lg shadow-xl hover:bg-slate-800/90 transition-all flex items-center space-x-2"
        >
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span className="text-sm font-medium">Controls</span>
          <span className="text-xs">{expandedPanel === 'controls' ? '−' : '+'}</span>
        </button>
        
        {expandedPanel === 'controls' && (
          <div className="absolute top-12 right-0 bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg shadow-xl p-4 min-w-[200px] z-[1100]">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-2 block uppercase tracking-wide">Base Layer</label>
                <div className="grid grid-cols-3 gap-1">
                  {['Satellite', 'Terrain', 'Hybrid'].map((mode, i) => (
                    <button key={mode} className={`p-2 rounded-md text-xs font-medium transition-all ${i === 0 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <button className="w-full bg-slate-100 hover:bg-slate-200 p-2 text-sm font-medium text-slate-700 rounded-md transition-colors">
                  📍 Geocode
                </button>
                <button className="w-full bg-slate-100 hover:bg-slate-200 p-2 text-sm font-medium text-slate-700 rounded-md transition-colors">
                  📊 Export
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}