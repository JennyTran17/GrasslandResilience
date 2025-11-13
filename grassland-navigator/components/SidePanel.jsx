"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import useSavedFields from "@/hooks/useSavedFields";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

const BASE_URL = "https://grassland-resilience-n2m7mwu92-fathfuls-projects.vercel.app";


export default function SidePanel() {
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
        console.error('SidePanel data fetch error:', err);
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
            const [riskRes, temporalRes] = await Promise.all([
              fetch(`${BASE_URL}/api/risk-score?lat=${lat}&lng=${lng}`).then(r => r.json()),
              fetch(`${BASE_URL}/api/temporal-data?lat=${lat}&lng=${lng}`).then(r => r.json())
            ]);
            
            if (riskRes.success) {
              const adviceRes = await fetch(`${BASE_URL}/api/actionable-advice?riskScore=${riskRes.data.riskScore}`).then(r => r.json());
              newFieldData[field.id] = {
                risk: riskRes.data,
                temporal: temporalRes.success ? temporalRes.data : null,
                advice: adviceRes.success ? adviceRes.data : null
              };
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




  if (loading) return <div className="p-4">Loading backend data…</div>;

  return (
    <div className="p-4 bg-white h-full overflow-y-auto space-y-6">
      {/* API Status */}
      <section className="border-b pb-4">
        <h3 className="font-semibold mb-2 text-green-700">🛰️ NASA Data API</h3>
        <div className="text-sm space-y-1">
          <div>Status: <span className="text-green-600 font-medium">{data.health?.status || 'Unknown'}</span></div>
          <div>Service: {data.health?.service || 'Grassland Resilience Navigator'}</div>
          <div>Version: {data.health?.version || '1.0.0'}</div>
        </div>
      </section>

      {/* NDVI Anomaly */}
      <section className="border-b pb-4">
        <h3 className="font-semibold mb-2 text-emerald-700">🌾 NDVI Anomaly</h3>
        {data.ndvi ? (
          <div className="text-sm space-y-1">
            <div>Type: <span className="font-medium">{data.ndvi.type}</span></div>
            <div>Region: <span className="font-medium">Ireland</span></div>
            <div>Resolution: <span className="font-medium">500m (VIIRS)</span></div>
            <div>Baseline: <span className="font-medium">2015-2024 (10 years)</span></div>
            <div>Current Anomaly: <span className="font-medium text-blue-600">+354 (above average)</span></div>
            <div className="mt-2 p-2 bg-emerald-50 rounded text-xs">
              Red areas indicate vegetation stress (drought), blue areas show healthy vegetation.
            </div>
          </div>
        ) : (
          <div className="text-sm text-red-600">No NDVI data available</div>
        )}
      </section>

      {/* Soil Moisture */}
      <section className="border-b pb-4">
        <h3 className="font-semibold mb-2 text-blue-700">💧 SMAP Soil Moisture</h3>
        {data.smap ? (
          <div className="text-sm space-y-1">
            <div>Type: <span className="font-medium">{data.smap.type}</span></div>
            <div>Source: <span className="font-medium">NASA SMAP Satellite</span></div>
            <div>Purpose: <span className="font-medium">Validates vegetation stress</span></div>
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
              Soil moisture data helps validate NDVI anomalies by showing water availability.
            </div>
          </div>
        ) : (
          <div className="text-sm text-red-600">SMAP data coming soon</div>
        )}
      </section>

      {/* Active Fires */}
      <section className="border-b pb-4">
        <h3 className="font-semibold mb-2 text-red-700">🔥 Active Fires</h3>
        {data.fires ? (
          <div className="text-sm space-y-1">
            <div>Source: <span className="font-medium">NASA FIRMS</span></div>
            <div>Detection: <span className="font-medium">Near real-time</span></div>
            <div>Active Fires: <span className="font-medium text-red-600">{data.fires.fires?.features?.length || 0}</span></div>
            <div className="mt-2 p-2 bg-red-50 rounded text-xs">
              Real-time fire detection helps assess immediate threats to grassland areas.
            </div>
          </div>
        ) : (
          <div className="text-sm text-red-600">FIRMS data coming soon</div>
        )}
      </section>

      {/* Risk Assessment */}
      <section className="border-b pb-4">
        <h3 className="font-semibold mb-2 text-orange-700">📊 Risk Assessment</h3>
        <div className="text-sm text-gray-600 mb-2">
          Click on the map to analyze grassland resilience risk for any location.
        </div>
      </section>

      {/* Your Fields */}
      <section className="border-b pb-4">
        <h3 className="font-semibold mb-2 text-orange-700">🏞️ Your Fields</h3>
        {Array.isArray(fields) && fields.length > 0 ? (
          <div className="space-y-3">
            {fields.map(f => {
              const fData = fieldData[f.id];
              return (
                <div key={f.id} className="border rounded p-3 bg-gray-50">
                  <div className="font-medium">{f.name}</div>
                  <div className="text-xs text-gray-600 mb-2">
                    ({f.geometry?.coordinates?.[1].toFixed(3)}, {f.geometry?.coordinates?.[0].toFixed(3)})
                  </div>
                  
                  {fData?.risk && (
                    <div className="mb-2">
                      <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        fData.risk.riskScore <= 2 ? 'bg-green-100 text-green-800' :
                        fData.risk.riskScore <= 3 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        Risk Score: {fData.risk.riskScore}/5
                      </div>
                    </div>
                  )}
                  
                  {fData?.advice && (
                    <div className="text-xs text-gray-700 italic">
                      {fData.advice.recommendation}
                    </div>
                  )}
                  
                  {fData?.temporal && (
                    <div className="text-xs mt-1">
                      <span className="font-medium">Latest NDVI:</span> {fData.temporal.ndvi?.[0]?.value?.toFixed(3) || 'N/A'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No saved fields yet.</div>
        )}
        
        {/* Test Button */}
        <button
          onClick={async () => {
            if (!userId) return alert("Not signed in");
            await addDoc(collection(db, `users/${userId}/fields`), {
              name: "Test Field",
              geometry: { coordinates: [-8.0, 53.3] },
              createdAt: new Date(),
            });
          }}
          className="bg-emerald-600 text-white px-3 py-1 rounded text-sm mt-3"
        >
          ➕ Add Test Field
        </button>
      </section>

    </div>

  );
}
