"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import useSavedFields from "@/hooks/useSavedFields";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

const BASE_URL = "https://grassland-resilience-n2m7mwu92-fathfuls-projects.vercel.app";


export default function SidePanel() {
  const [data, setData] = useState({ ndvi: null, smap: null, fires: null, health: null });
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
            <div>Active Fires: <span className="font-medium text-red-600">{data.fires.features?.length || 0}</span></div>
            <div className="mt-2 p-2 bg-red-50 rounded text-xs">
              Real-time fire detection helps assess immediate threats to grassland areas.
            </div>
          </div>
        ) : (
          <div className="text-sm text-red-600">FIRMS data coming soon</div>
        )}
      </section>

      {/* Risk Assessment */}
      <section>
        <h3 className="font-semibold mb-2 text-orange-700">⚠️ Risk Assessment</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-green-50 rounded">
            <span className="text-sm">Minimal Risk</span>
            <span className="text-sm font-medium">15%</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
            <span className="text-sm">Moderate Risk</span>
            <span className="text-sm font-medium">35%</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
            <span className="text-sm">Elevated Risk</span>
            <span className="text-sm font-medium">40%</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-red-50 rounded">
            <span className="text-sm">Severe Risk</span>
            <span className="text-sm font-medium">50%</span>
          </div>
        </div>
      </section>
      <h4>Your Fields</h4>
      {Array.isArray(fields) && fields.length > 0 ? (
        <ul>
  {fields.map(f => (
    <li key={f.id} className="mb-2">
      <div className="font-medium">{f.name}</div>
      <small>
        ({f.geometry?.coordinates?.[1].toFixed(3)},
        {f.geometry?.coordinates?.[0].toFixed(3)})
      </small>
      {f.latestScore && (
        <div className="text-sm mt-1">
          <span className="font-semibold">Score:</span> {f.latestScore.score} <br/>
          <span className="text-gray-600 italic">{f.latestScore.advice}</span>
        </div>
      )}
    </li>
  ))}
</ul>

      ) : (
        <div className="text-sm text-gray-500">No saved fields yet.</div>
      )}
      {/* button for testing */}
      <button
        onClick={async () => {
          if (!userId) return alert("Not signed in");
          await addDoc(collection(db, `users/${userId}/fields`), {
            name: "Test Field",
            geometry: { coordinates: [-8.0, 53.3] },
            createdAt: new Date(),
          });
        }}
        className="bg-emerald-600 text-white px-3 py-1 rounded text-sm"
      >
        ➕ Add Test Field
      </button>

    </div>

  );
}
