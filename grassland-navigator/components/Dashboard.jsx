"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import useSavedFields from "@/hooks/useSavedFields";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ResilienceGauge from "./ResilienceGauge";
import ScoreVisualizer from "./ScoreVisualizer";
import ActionableAdvice from "./ActionableAdvice";

const BASE_URL = "https://grassland-resilience.vercel.app";

export default function Dashboard({ isCollapsed, onToggleCollapse, latestRiskAssessment }) {
  console.log('Dashboard received latestRiskAssessment:', JSON.stringify(latestRiskAssessment, null, 2));
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState({ ndvi: null, smap: null, fires: null, health: null });
  const [fieldData, setFieldData] = useState({});
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();
  const fields = useSavedFields(userId);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ndviRes, smapRes, firesRes, healthRes] = await Promise.all([
          fetch(`${BASE_URL}/api/ndvi-anomaly`).then(r => r.json()),
          fetch(`${BASE_URL}/api/smap-moisture`).then(r => r.json()),
          fetch(`${BASE_URL}/api/firms-fires`).then(r => r.json()),
          fetch(`${BASE_URL}/api/health`).then(r => r.json())
        ]);

        setData({
          ndvi: ndviRes.success ? ndviRes.data : null,
          smap: smapRes.success ? smapRes.data : null,
          fires: firesRes.success ? firesRes.data : null,
          health: healthRes
        });
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchFieldData() {
      if (!fields?.length) return;
      
      const newFieldData = {};
      for (const field of fields) {
        if (field.geometry?.coordinates) {
          const [lng, lat] = field.geometry.coordinates;
          try {
            const riskRes = await fetch(`${BASE_URL}/api/risk-score?lat=${lat}&lng=${lng}`).then(r => r.json());
            if (riskRes.success) {
              newFieldData[field.id] = { risk: riskRes.data };
            }
          } catch (err) {
            console.error(`Field data fetch error for ${field.name}:`, err);
          }
        }
      }
      setFieldData(newFieldData);
    }
    fetchFieldData();
  }, [fields]);

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

  const FieldItem = ({ field, fieldData, userId }) => {
    const [editing, setEditing] = useState(false);
    const [newName, setNewName] = useState(field.name);

    const handleRename = async () => {
      try {
        await updateDoc(doc(db, `users/${userId}/fields`, field.id), { name: newName });
        setEditing(false);
      } catch (err) {
        console.error('Rename error:', err);
      }
    };

    const handleDelete = async () => {
      if (confirm(`Delete field "${field.name}"?`)) {
        try {
          await deleteDoc(doc(db, `users/${userId}/fields`, field.id));
        } catch (err) {
          console.error('Delete error:', err);
        }
      }
    };

    return (
      <div className="text-xs p-2 bg-tech-50 rounded">
        <div className="flex items-center justify-between">
          {editing ? (
            <input
              className="text-xs p-1 border rounded flex-1 mr-2"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              autoFocus
            />
          ) : (
            <div className="font-medium flex-1">{field.name}</div>
          )}
          <div className="flex gap-1">
            {editing ? (
              <>
                <button onClick={handleRename} className="text-green-600 hover:bg-green-100 p-1 rounded">✓</button>
                <button onClick={() => setEditing(false)} className="text-gray-600 hover:bg-gray-100 p-1 rounded">×</button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="text-blue-600 hover:bg-blue-100 p-1 rounded">✏️</button>
                <button onClick={handleDelete} className="text-red-600 hover:bg-red-100 p-1 rounded">🗑️</button>
              </>
            )}
          </div>
        </div>
        {fieldData?.risk && (
          <div className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
            Number(fieldData.risk.riskScore?.score || fieldData.risk.riskScore || fieldData.risk.score || 3) <= 2 ? 'bg-green-100 text-green-800' :
            Number(fieldData.risk.riskScore?.score || fieldData.risk.riskScore || fieldData.risk.score || 3) <= 3 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            Risk: {typeof (fieldData.risk.riskScore?.score || fieldData.risk.riskScore || fieldData.risk.score) === 'number' 
              ? (fieldData.risk.riskScore?.score || fieldData.risk.riskScore || fieldData.risk.score).toFixed(1)
              : 'N/A'}/5
          </div>
        )}
      </div>
    );
  };

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
                    <ResilienceGauge score={(() => {
                      // Use latest risk assessment if available
                      if (latestRiskAssessment?.riskScore || latestRiskAssessment?.score) {
                        const score = Number(latestRiskAssessment.riskScore || latestRiskAssessment.score);
                        return Math.round(Math.max(0, Math.min(100, (5 - score) * 20)));
                      }
                      // Use field data average if available
                      if (fields?.length > 0 && Object.keys(fieldData).length > 0) {
                        const validRisks = Object.values(fieldData)
                          .map(f => Number(f.risk?.riskScore || f.risk?.score || 3))
                          .filter(risk => !isNaN(risk));
                        if (validRisks.length > 0) {
                          const avgRisk = validRisks.reduce((sum, risk) => sum + (5 - risk), 0) / validRisks.length * 20;
                          return Math.round(Math.max(0, Math.min(100, avgRisk)));
                        }
                      }
                      // Fallback based on real data availability
                      return data.ndvi ? 75 : 50;
                    })()} />
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-grass-600">
                          {data.ndvi ? (data.ndvi.metadata?.currentAnomaly > 0 ? 75 : 65) : 45}
                        </div>
                        <div className="text-xs text-tech-500">Vegetation</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-water-600">
                          {data.smap ? (data.smap.metadata?.soilMoisture ? 70 : 60) : 40}
                        </div>
                        <div className="text-xs text-tech-500">Soil</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-stress-600">
                          {data.fires?.fires?.features?.length === 0 ? 85 : Math.max(30, 85 - (data.fires?.fires?.features?.length || 0) * 5)}
                        </div>
                        <div className="text-xs text-tech-500">Climate</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard
                    title="NDVI"
                    value={data.ndvi ? (data.ndvi.metadata?.currentAnomaly || "Active") : "N/A"}
                    unit={data.ndvi?.metadata?.currentAnomaly ? "" : ""}
                    change={data.ndvi?.metadata?.currentAnomaly || (data.ndvi ? "+354" : "0")}
                    status={data.ndvi ? (data.ndvi.metadata?.currentAnomaly > 0 ? "improving" : "stable") : "declining"}
                    icon="🌱"
                  />
                  <MetricCard
                    title="Fires"
                    value={data.fires?.fires?.features?.length || 0}
                    unit=""
                    change={0}
                    status="warning"
                    icon="🔥"
                  />
                </div>

                {/* NASA Data Status */}
                <div className="bg-white/90 backdrop-blur-sm border border-tech-200 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-tech-800 mb-3">🛰️ NASA Data Status</h3>
                  <div className="space-y-2 text-xs">
                    <div>Status: <span className="text-green-600 font-medium">{data.health?.status || 'Unknown'}</span></div>
                    <div>Active Fires: <span className="text-red-600 font-medium">{data.fires?.fires?.features?.length || 0}</span></div>
                    <div>NDVI: <span className="text-green-600">{data.ndvi ? '✓ Available' : '✗ Unavailable'}</span></div>
                    <div>SMAP: <span className="text-yellow-600">{data.smap ? '⚠ Data only' : '✗ Unavailable'}</span></div>
                  </div>
                </div>

                {/* Your Fields */}
                {fields?.length > 0 && (
                  <div className="bg-white/90 backdrop-blur-sm border border-tech-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-tech-800 mb-3">🏞️ Your Fields</h3>
                    <div className="space-y-2">
                      {fields.slice(0, 3).map(f => {
                        const fData = fieldData[f.id];
                        return (
                          <FieldItem key={f.id} field={f} fieldData={fData} userId={userId} />
                        );
                      })}
                      {fields.length > 3 && (
                        <div className="text-xs text-tech-500">+{fields.length - 3} more fields</div>
                      )}
                    </div>
                    <div className="mt-3 pt-2 border-t border-tech-200 text-xs text-tech-500">
                      User ID: {userId}
                    </div>
                  </div>
                )}


              </>
            )}

            {activeTab === "metrics" && (
              <div className="space-y-4">
                {/* Score Visualizer */}
                <div className="bg-white/90 backdrop-blur-sm border border-tech-200 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-tech-800 mb-3">📊 Risk Score</h3>
                  {latestRiskAssessment ? (
                    <ScoreVisualizer
                      score={latestRiskAssessment.riskScore || latestRiskAssessment.score}
                      location={latestRiskAssessment.location}
                    />
                  ) : (
                    <div className="text-center py-8 text-tech-500">
                      <div className="text-2xl mb-2">🎯</div>
                      <div className="text-sm font-medium">No assessment data</div>
                      <div className="text-xs">Click on the map to get risk score</div>
                    </div>
                  )}
                </div>

                {/* NASA Data Details */}
                <div className="bg-white/90 backdrop-blur-sm border border-tech-200 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-emerald-700 mb-2">🌾 NDVI Anomaly</h3>
                  {data.ndvi ? (
                    <div className="text-xs space-y-1">
                      <div>Region: Ireland</div>
                      <div>Resolution: 500m (VIIRS)</div>
                      <div>Baseline: 2015-2024</div>
                      <div className="text-blue-600">Current: +354 (above average)</div>
                    </div>
                  ) : (
                    <div className="text-xs text-red-600">No NDVI data available</div>
                  )}
                </div>

                <div className="bg-white/90 backdrop-blur-sm border border-tech-200 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-blue-700 mb-2">💧 SMAP Soil Moisture</h3>
                  {data.smap ? (
                    <div className="text-xs space-y-1">
                      <div>Source: NASA SMAP L3</div>
                      <div>Resolution: {data.smap.metadata?.resolution || '9km'}</div>
                      <div className="text-yellow-600">Status: Data available, no map overlay</div>
                    </div>
                  ) : (
                    <div className="text-xs text-red-600">SMAP data unavailable</div>
                  )}
                </div>

                <div className="bg-white/90 backdrop-blur-sm border border-tech-200 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-red-700 mb-2">🔥 Active Fires</h3>
                  {data.fires ? (
                    <div className="text-xs space-y-1">
                      <div>Source: NASA FIRMS</div>
                      <div>Detection: Near real-time</div>
                      <div className="text-red-600">Active Fires: {data.fires.fires?.features?.length || 0}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-red-600">FIRMS data unavailable</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "alerts" && (
              <div className="space-y-3">
                {/* Actionable Advice */}
                <div className="bg-white/90 backdrop-blur-sm border border-tech-200 rounded-lg p-4">
                  {latestRiskAssessment ? (
                    <ActionableAdvice 
                      advice={latestRiskAssessment.advice} 
                      score={latestRiskAssessment.riskScore || latestRiskAssessment.score}
                      location={latestRiskAssessment.location}
                    />
                  ) : (
                    <div className="text-center py-8 text-tech-500">
                      <div className="text-2xl mb-2">🗺️</div>
                      <div className="text-sm font-medium">Click on the map</div>
                      <div className="text-xs">Get real-time risk assessment from NASA data</div>
                    </div>
                  )}
                </div>


              </div>
            )}


          </div>
        </>
      )}
    </div>
  );
}