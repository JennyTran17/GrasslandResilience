"use client";
import { useEffect, useState } from "react";

const BASE_URL = "https://grassland-resilience.vercel.app";

export default function Legend() {
  const [ndviData, setNdviData] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    async function fetchLegend() {
      try {
        const res = await fetch(`${BASE_URL}/api/ndvi-anomaly`);
        const json = await res.json();
        if (json.success) {
          setNdviData(json.data);
        }
      } catch (err) {
        console.error('Legend fetch error:', err);
      }
    }
    fetchLegend();
  }, []);

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg text-xs border border-slate-200 min-w-[200px]">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <h4 className="font-semibold text-slate-800">🌾 NDVI Anomaly Legend</h4>
        <span className="text-slate-500">{isMinimized ? '+' : '−'}</span>
      </div>
      
      {!isMinimized && (
        <div className="p-3 pt-0 space-y-2">
      
      {/* NDVI Color Scale - Matching Backend Palette */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded-sm border" style={{backgroundColor: 'darkred'}}></div>
          <span>Severe Stress (&lt; -2000)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded-sm border" style={{backgroundColor: 'red'}}></div>
          <span>Moderate Stress (-2000 to -1000)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded-sm border" style={{backgroundColor: 'orange'}}></div>
          <span>Slight Stress (-1000 to -500)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded-sm border" style={{backgroundColor: 'yellow'}}></div>
          <span>Normal (-500 to +500)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded-sm border" style={{backgroundColor: 'lightblue'}}></div>
          <span>Slight Improvement (+500 to +1000)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded-sm border" style={{backgroundColor: 'blue'}}></div>
          <span>Moderate Improvement (+1000 to +2000)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded-sm border" style={{backgroundColor: 'darkblue'}}></div>
          <span>Strong Improvement (&gt; +2000)</span>
        </div>
      </div>

      {/* Current Status */}
      <div className="mt-3 pt-2 border-t border-slate-200">
        <div className="text-xs text-slate-600">
          <div>Current Status: <span className="font-medium text-blue-600">+354 (Above Average)</span></div>
          <div>Range: -7,106 to +7,003</div>
          <div>Data: NASA VIIRS (500m)</div>
        </div>
      </div>

      {/* SMAP Soil Moisture Legend */}
      <div className="mt-3 pt-2 border-t border-slate-200">
        <h5 className="font-medium mb-1">💧 Soil Moisture (SMAP)</h5>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{backgroundColor: 'brown'}}></div>
            <span>Very Dry (&lt; 0.1)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{backgroundColor: 'yellow'}}></div>
            <span>Dry (0.1 - 0.2)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{backgroundColor: 'lightblue'}}></div>
            <span>Moderate (0.2 - 0.3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{backgroundColor: 'blue'}}></div>
            <span>Moist (0.3 - 0.4)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{backgroundColor: 'darkblue'}}></div>
            <span>Very Moist (&gt; 0.4)</span>
          </div>
        </div>
      </div>

      {/* Active Fires */}
      <div className="mt-2 pt-2 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-xs">🔥 Active Fires</span>
        </div>
      </div>
        </div>
      )}
    </div>
  );
}
