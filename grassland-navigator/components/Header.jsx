"use client";
import { useEffect, useState } from "react";

const BASE_URL = "https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app";

export default function Header() {
  const [apiStatus, setApiStatus] = useState({ status: 'checking', timestamp: null });

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch(`${BASE_URL}/api/health`);
        const data = await res.json();
        setApiStatus({ 
          status: data.status || 'unknown', 
          timestamp: data.timestamp 
        });
      } catch (err) {
        setApiStatus({ status: 'offline', timestamp: null });
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-900 text-white h-14 flex items-center justify-between px-6 shadow-2xl border-b border-slate-700 flex-shrink-0">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-900">🌍</div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">Grassland Resilience Navigator</h1>
          <div className="text-xs text-slate-400 font-medium">NASA Satellite Data • Ireland Grassland Monitoring</div>
        </div>
      </div>
      
      {/* Real-time Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${
            apiStatus.status === 'healthy' ? 'bg-green-400 animate-pulse' : 
            apiStatus.status === 'checking' ? 'bg-yellow-400 animate-pulse' : 
            'bg-red-400'
          }`}></div>
          <span className="text-slate-300">
            API: <span className="font-medium capitalize">{apiStatus.status}</span>
          </span>
        </div>
        
        <nav className="flex items-center space-x-1">
          <a 
            href="https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app/api/health" 
            target="_blank" 
            className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            API Status
          </a>
          <a 
            href="https://github.com/nasa" 
            target="_blank" 
            className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            NASA Data
          </a>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors">
            🛰️ Live Data
          </button>
        </nav>
      </div>
    </header>
  );
}