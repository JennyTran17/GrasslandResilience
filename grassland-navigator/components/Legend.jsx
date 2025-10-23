"use client";

import { useState } from "react";

export default function Legend() {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const riskLevels = [
    { level: "Minimal", color: "bg-emerald-500", description: "Optimal conditions", value: "0.0-0.2", percentage: "15%" },
    { level: "Moderate", color: "bg-amber-500", description: "Monitor conditions", value: "0.2-0.5", percentage: "35%" },
    { level: "Elevated", color: "bg-orange-500", description: "Intervention advised", value: "0.5-0.8", percentage: "40%" },
    { level: "Severe", color: "bg-red-500", description: "Immediate action required", value: "0.8-1.0", percentage: "10%" },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg shadow-xl absolute bottom-4 left-4 min-w-[280px] z-[1000]">
      <div className="flex items-center justify-between p-4 pb-3 border-b border-slate-200">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">RISK ASSESSMENT</h3>
          <div className="text-xs text-slate-500 mt-0.5">Drought vulnerability index</div>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2 fade-in">
          {riskLevels.map((risk, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-sm ${risk.color}`}></div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-800">{risk.level}</span>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{risk.value}</span>
                  </div>
                  <p className="text-xs text-slate-500">{risk.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-700">{risk.percentage}</div>
                <div className="text-xs text-slate-400">area</div>
              </div>
            </div>
          ))}
          
          <div className="mt-4 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Last updated</span>
              <span className="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">14:32 UTC</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}