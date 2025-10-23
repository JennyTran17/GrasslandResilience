"use client";
import { useState } from "react";

export default function SidePanel() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const togglePanel = () => setIsCollapsed(!isCollapsed);

  return (
    <div className={`panel-main transition-all duration-300 ${
      isCollapsed ? "w-12" : "w-80"
    } h-full flex flex-col overflow-hidden`}>
      
      {/* Toggle Button */}
      <button
        onClick={togglePanel}
        className="panel-header p-3 hover:bg-green-800 transition-all duration-200"
        title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
      >
        <span className="text-lg">{isCollapsed ? "→" : "←"}</span>
      </button>

      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 fade-in scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          
          {/* Risk Summary */}
          <section>
            <h2 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wide">Risk Assessment</h2>
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                  <span className="font-semibold text-orange-800">ELEVATED</span>
                </div>
                <span className="text-xs font-mono text-orange-600 bg-orange-100 px-2 py-1 rounded">0.67</span>
              </div>
              <p className="text-sm text-orange-700">
                Drought stress indicators above threshold. Monitoring recommended.
              </p>
            </div>
          </section>

          {/* NDVI Anomaly */}
          <section>
            <h3 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wide">Vegetation Index</h3>
            <div className="card-base p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-slate-600">NDVI Anomaly</span>
                <span className="font-mono text-lg font-bold text-slate-800">-0.15</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                <div className="data-bar data-bar-critical" style={{width: '75%'}}></div>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Below baseline</span>
                <span>-15% deviation</span>
              </div>
            </div>
          </section>

          {/* SMAP Soil Moisture */}
          <section>
            <h3 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wide">Soil Moisture</h3>
            <div className="card-base p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-slate-600">SMAP L3</span>
                <span className="font-mono text-lg font-bold text-slate-800">18%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                <div className="data-bar data-bar-high" style={{width: '35%'}}></div>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Volumetric water content</span>
                <span>0-5cm depth</span>
              </div>
            </div>
          </section>

          {/* Management Recommendations */}
          <section>
            <h3 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wide">Recommendations</h3>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-slate-800">Irrigation Management</div>
                    <div className="text-xs text-slate-600">Implement supplemental watering protocols</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-slate-800">Grazing Adjustment</div>
                    <div className="text-xs text-slate-600">Reduce stocking density by 25-30%</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-slate-800">Risk Mitigation</div>
                    <div className="text-xs text-slate-600">Activate drought response protocols</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      )}
    </div>
  );
}