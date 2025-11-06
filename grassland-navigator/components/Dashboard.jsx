"use client";
import { useState } from "react";
import ResilienceGauge from "./ResilienceGauge";

// Dummy data for demonstration
const DUMMY_DATA = {
  resilience: {
    overall: 72,
    vegetation: 68,
    soil: 81,
    climate: 65
  },
  metrics: {
    ndvi: { value: 0.74, change: +0.12, status: "improving" },
    moisture: { value: 0.42, change: -0.08, status: "declining" },
    temperature: { value: 18.5, change: +2.1, status: "warning" },
    precipitation: { value: 85, change: -15, status: "declining" }
  },
  alerts: [
    { id: 1, type: "warning", message: "Soil moisture below seasonal average", region: "Cork" },
    { id: 2, type: "info", message: "NDVI showing recovery in Galway region", region: "Galway" },
    { id: 3, type: "critical", message: "Fire risk elevated in Dublin area", region: "Dublin" }
  ],
  recommendations: [
    "Consider irrigation in Cork region due to low soil moisture",
    "Monitor fire conditions in Dublin area closely",
    "Vegetation recovery in Galway shows positive trends"
  ]
};

export default function Dashboard({ isCollapsed, onToggleCollapse }) {
  const [activeTab, setActiveTab] = useState("overview");

  const MetricCard = ({ title, value, unit, change, status, icon }) => (
    <div className="bg-white/90 backdrop-blur-sm border border-tech-200 rounded-lg p-4 hover:shadow-tech transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="text-tech-600 text-sm font-medium">{title}</div>
        <div className="text-lg">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-tech-800">{value}{unit}</div>
          <div className={`text-xs flex items-center mt-1 ${
            status === "improving" ? "text-grass-600" :
            status === "declining" ? "text-alert-critical" :
            "text-stress-600"
          }`}>
            <span className="mr-1">
              {status === "improving" ? "↗" : status === "declining" ? "↘" : "→"}
            </span>
            {change > 0 ? "+" : ""}{change}{unit}
          </div>
        </div>
      </div>
    </div>
  );

  const AlertItem = ({ alert }) => (
    <div className={`p-3 rounded-lg border-l-4 ${
      alert.type === "critical" ? "bg-red-50 border-red-500" :
      alert.type === "warning" ? "bg-amber-50 border-amber-500" :
      "bg-blue-50 border-blue-500"
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium text-tech-800">{alert.message}</div>
          <div className="text-xs text-tech-500 mt-1">{alert.region}</div>
        </div>
        <div className={`text-xs px-2 py-1 rounded-full ${
          alert.type === "critical" ? "bg-red-100 text-red-700" :
          alert.type === "warning" ? "bg-amber-100 text-amber-700" :
          "bg-blue-100 text-blue-700"
        }`}>
          {alert.type}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-tech-50/95 backdrop-blur-md border-l border-tech-200 transition-all duration-300 ${
      isCollapsed ? "w-12" : "w-96"
    } h-full flex flex-col`}>
      
      {/* Header */}
      <div className="p-4 border-b border-tech-200 bg-white/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-tech-800">Dashboard</h2>
              <p className="text-xs text-tech-500">Grassland Resilience Analytics</p>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-tech-100 rounded-lg transition-colors"
          >
            <div className="w-4 h-4 text-tech-600">
              {isCollapsed ? "→" : "←"}
            </div>
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-tech-200 bg-white/30">
            {["overview", "metrics", "alerts"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "text-grass-700 border-b-2 border-grass-500 bg-white/50"
                    : "text-tech-600 hover:text-tech-800 hover:bg-white/30"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {activeTab === "overview" && (
              <>
                {/* Resilience Score */}
                <div className="bg-white/90 backdrop-blur-sm border border-tech-200 rounded-lg p-6">
                  <div className="text-center">
                    <ResilienceGauge score={DUMMY_DATA.resilience.overall} />
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-grass-600">{DUMMY_DATA.resilience.vegetation}</div>
                        <div className="text-xs text-tech-500">Vegetation</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-water-600">{DUMMY_DATA.resilience.soil}</div>
                        <div className="text-xs text-tech-500">Soil</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-stress-600">{DUMMY_DATA.resilience.climate}</div>
                        <div className="text-xs text-tech-500">Climate</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard
                    title="NDVI"
                    value={DUMMY_DATA.metrics.ndvi.value}
                    unit=""
                    change={DUMMY_DATA.metrics.ndvi.change}
                    status={DUMMY_DATA.metrics.ndvi.status}
                    icon="🌱"
                  />
                  <MetricCard
                    title="Moisture"
                    value={DUMMY_DATA.metrics.moisture.value}
                    unit=""
                    change={DUMMY_DATA.metrics.moisture.change}
                    status={DUMMY_DATA.metrics.moisture.status}
                    icon="💧"
                  />
                </div>

                {/* Recommendations */}
                <div className="bg-white/90 backdrop-blur-sm border border-tech-200 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-tech-800 mb-3">AI Recommendations</h3>
                  <div className="space-y-2">
                    {DUMMY_DATA.recommendations.map((rec, i) => (
                      <div key={i} className="text-xs text-tech-700 p-2 bg-tech-50 rounded border-l-2 border-grass-400">
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "metrics" && (
              <div className="space-y-4">
                <MetricCard
                  title="NDVI Index"
                  value={DUMMY_DATA.metrics.ndvi.value}
                  unit=""
                  change={DUMMY_DATA.metrics.ndvi.change}
                  status={DUMMY_DATA.metrics.ndvi.status}
                  icon="🌱"
                />
                <MetricCard
                  title="Soil Moisture"
                  value={DUMMY_DATA.metrics.moisture.value}
                  unit=""
                  change={DUMMY_DATA.metrics.moisture.change}
                  status={DUMMY_DATA.metrics.moisture.status}
                  icon="💧"
                />
                <MetricCard
                  title="Temperature"
                  value={DUMMY_DATA.metrics.temperature.value}
                  unit="°C"
                  change={DUMMY_DATA.metrics.temperature.change}
                  status={DUMMY_DATA.metrics.temperature.status}
                  icon="🌡️"
                />
                <MetricCard
                  title="Precipitation"
                  value={DUMMY_DATA.metrics.precipitation.value}
                  unit="mm"
                  change={DUMMY_DATA.metrics.precipitation.change}
                  status={DUMMY_DATA.metrics.precipitation.status}
                  icon="🌧️"
                />
              </div>
            )}

            {activeTab === "alerts" && (
              <div className="space-y-3">
                {DUMMY_DATA.alerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}