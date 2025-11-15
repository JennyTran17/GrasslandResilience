"use client";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import TemporalModal from "./TemporalModal";
// import RiskResultCard from "./RiskResultCard";
// import ScoreVisualisation from "./ScoreVisualisation";
import { getTemporal, postRiskScore } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase"; // ✅ Make sure this path is correct
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const BASE_URL = "https://grassland-resilience.vercel.app";

function ClickHandler({ userId, onScoreUpdate }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [temporalData, setTemporalData] = useState(null);
  const [riskResult, setRiskResult] = useState(null);
  const [saveMode, setSaveMode] = useState(false);
  const [saveName, setSaveName] = useState("");

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      console.log("📍 Map click:", lat, lng);

      // Fetch temporal data
      try {
        const temporal = await getTemporal(lat, lng);
        if (temporal?.data) {
          setTemporalData(temporal.data);
          setModalOpen(true);
        }
      } catch (err) {
        console.error("❌ Temporal fetch error:", err);
        setTemporalData({ location: { lat, lng }, message: "Temporal data unavailable" });
      }

      // Fetch risk score
      try {
        const payload = { lat, lng };
        const res = await postRiskScore(payload);
        const data = res.data || res;
        setRiskResult(data);
        onScoreUpdate?.(data);
      } catch (err) {
        console.error("❌ Risk scoring error:", err);
        setRiskResult({ riskScore: "N/A", advice: "Risk analysis unavailable", location: { lat, lng } });
      }

      // Open save form
      setSaveMode(true);
      setSaveName(`Field ${lat.toFixed(3)}, ${lng.toFixed(3)}`);
    },
  });

  // ✅ Save field to Firestore
  async function handleSaveField() {
    if (!userId) {
      alert("Please sign in to save fields.");
      return;
    }

    const coords = temporalData?.location ?
      [temporalData.location.lng, temporalData.location.lat] :
      [riskResult?.location?.lng || -8.0, riskResult?.location?.lat || 53.3];

    const geometry = {
      type: "Point",
      coordinates: coords,
    };

    const doc = {
      name: saveName,
      geometry,
      createdAt: serverTimestamp(),
      latestScore: {
        score: riskResult?.riskScore ?? riskResult?.score ?? null,
        advice: riskResult?.advice ?? null,
      },
    };

    try {
      await addDoc(collection(db, "users", userId, "fields"), doc);
      setSaveMode(false);
      alert("✅ Field saved successfully.");
    } catch (err) {
      console.error("❌ Save field error:", err);
      alert("Failed to save field. See console for details.");
    }
  }

  return (
    <>
      <TemporalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        data={temporalData || {}}
      />


      {saveMode && (
        <div className="fixed right-6 top-24 z-[2000] bg-white p-3 rounded shadow w-80">
          <h4 className="font-semibold mb-2">Save Field</h4>
          <input
            className="w-full p-2 border mb-2"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setSaveMode(false)}
              className="px-3 py-1 border rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveField}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Save Field
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Helper for parent control (flyTo, etc.)
function MapController({ onMapReady }) {
  const map = useMap();

  useEffect(() => {
    if (map && onMapReady) onMapReady(map);
  }, [map, onMapReady]);

  return null;
}

const BaseMapInner = forwardRef(function BaseMapInner({ layerStates }, ref) {
  const { userId } = useAuth(); // ✅ FIX: now defined
  const [ndvi, setNdvi] = useState(null);
  const [smap, setSmap] = useState(null);
  const [precipitation, setPrecipitation] = useState(null);
  const [fires, setFires] = useState([]);
  const [mapInstance, setMapInstance] = useState(null);
  const [latestScore, setLatestScore] = useState(null);
  const [dataStatus, setDataStatus] = useState({
    ndvi: false,
    smap: false,
    precipitation: false,
    fires: false,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("🌍 Fetching backend layers...");

        const ndviRes = await fetch(`${BASE_URL}/api/ndvi-anomaly`, {
          cache: 'no-cache'
        });
        const ndviJson = await ndviRes.json();
        console.log('🛰️ NDVI Response:', ndviJson);
        if (ndviJson?.success && ndviJson.data?.tileUrl) {
          setNdvi(ndviJson.data);
          setDataStatus((p) => ({ ...p, ndvi: true }));
          console.log('✅ NDVI Tile URL:', ndviJson.data.tileUrl);
        }

        const smapRes = await fetch(`${BASE_URL}/api/smap-moisture`);
        const smapJson = await smapRes.json();
        console.log('💧 SMAP Response:', smapJson);
        if (smapJson?.success && smapJson.data) {
          setSmap(smapJson.data);
          setDataStatus((p) => ({ ...p, smap: true }));
          console.log('✅ SMAP Tile URL:', smapJson.data.tileUrl);
        }

        const precipRes = await fetch(`${BASE_URL}/api/precipitation`);
        const precipJson = await precipRes.json();
        console.log('🌧️ Precipitation Response:', precipJson);
        if (precipJson?.success && precipJson.data) {
          setPrecipitation(precipJson.data);
          setDataStatus((p) => ({ ...p, precipitation: true }));
          console.log('✅ Precipitation Tile URL:', precipJson.data.tileUrl);
        }

        const firesRes = await fetch(`${BASE_URL}/api/firms-fires`);
        const firesJson = await firesRes.json();
        console.log('🔥 FIRMS Response:', firesJson);
        const fireData = firesJson.data?.fires?.features || [];
        if (firesJson?.success && firesJson.data) {
          setFires(fireData);
          setDataStatus((p) => ({ ...p, fires: true }));
          console.log('✅ Active Fires Count:', fireData.length);
        }
      } catch (err) {
        console.error("🔥 Error loading map layers:", err);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Expose map controls
  useImperativeHandle(
    ref,
    () => ({
      flyTo: (center, zoom, bounds) => {
        if (mapInstance) {
          if (bounds) mapInstance.fitBounds(bounds, { padding: [20, 20] });
          else mapInstance.flyTo(center, zoom, { duration: 1.5 });
        }
      },
    }),
    [mapInstance]
  );

  return (
    <MapContainer
      center={[53.3, -8.0]}
      zoom={7}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
    >
      <MapController onMapReady={setMapInstance} />

      {/* Base layer */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* NDVI Anomaly Layer - Real NASA Data */}
      {ndvi?.tileUrl && layerStates?.ndvi?.visible && (
          <TileLayer
                key={`ndvi-real-${layerStates.ndvi.opacity}`}
                url={ndvi.tileUrl}
                attribution="NDVI Anomaly (NASA VIIRS) - Real Data"
                opacity={layerStates.ndvi.opacity}
                maxZoom={15}

              />
            )}

      {/* SMAP Soil Moisture Layer - Real Tile Data */}
      {smap?.tileUrl && layerStates?.soilMoisture?.visible && (
        <TileLayer
          key={`smap-${layerStates.soilMoisture.opacity}`}
          url={smap.tileUrl}
          attribution="Soil Moisture (ERA5)"
          opacity={layerStates.soilMoisture.opacity}
          maxZoom={15}
        />
      )}

      {/* Risk Assessment Layer - No tile service available */}
      {layerStates?.riskLevel?.visible && (
        <div className="absolute top-32 left-4 z-[1000] bg-orange-100 border border-orange-400 text-orange-800 px-3 py-2 rounded text-sm">
          ⚠️ Risk Assessment: Available via click analysis (click map to get risk score)
        </div>
      )}

      {/* Precipitation Layer - Real Tile Data */}
      {precipitation?.tileUrl && layerStates?.precipitation?.visible && (
        <TileLayer
          key={`precipitation-${layerStates.precipitation.opacity}`}
          url={precipitation.tileUrl}
          attribution="Precipitation (GPM IMERG)"
          opacity={layerStates.precipitation.opacity}
          maxZoom={15}
        />
      )}

      {/* FIRMS Active Fires - Real Backend Data */}
      {fires && Array.isArray(fires) && fires.length > 0 &&
        fires.map((f, i) => {
          const [lon, lat] = f.geometry?.coordinates || [];
          if (!lat || !lon) return null;
          const props = f.properties || {};
          return (
            <CircleMarker
              key={`fire-real-${i}-${lat}-${lon}`}
              center={[lat, lon]}
              radius={Math.max(4, (props.brightness || 300) / 50)}
              color="#ff4444"
              fillColor="#ff0000"
              fillOpacity={0.8}
              weight={2}
            >
              <Tooltip direction="top" offset={[0, -10]}>
                <div className="text-sm">
                  <b>🔥 Active Fire (FIRMS)</b>
                  <br />
                  Brightness: {props.brightness || "N/A"}
                  <br />
                  Date: {props.acq_date || "N/A"}
                  <br />
                  Confidence: {props.confidence || "N/A"}%
                  <br />
                  Satellite: {props.satellite || "VIIRS"}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

      {/* ✅ Click handler now has access to userId */}
      <ClickHandler userId={userId} onScoreUpdate={setLatestScore} />
      {latestScore && (
        <div className="absolute bottom-6 left-6 z-[1000]">
          { <ScoreVisualisation
            score={latestScore.score}
            advice={latestScore.advice}
          /> }
        </div>
      )}

      <TemporalModal />
    </MapContainer>
  );
});

export default BaseMapInner;
