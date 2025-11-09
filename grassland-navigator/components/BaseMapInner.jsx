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

const BASE_URL =
  "https://grassland-resilience-rao56wzns-fathfuls-projects.vercel.app";

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
      }

      // Fetch risk score
      try {
        const payload = { lat, lng };
        const res = await postRiskScore(payload);
        const data = res.data || res;
        setRiskResult(data);
        onScoreUpdate?.(data); // ✅ send it up to parent
      } catch (err) {
        console.error("❌ Risk scoring error:", err);
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

    const geometry = {
      type: "Point",
      coordinates: [
        temporalData?.location?.lng ?? 0,
        temporalData?.location?.lat ?? 0,
      ],
    };

    const doc = {
      name: saveName,
      geometry,
      createdAt: serverTimestamp(),
      latestScore: {
        score: riskResult?.score ?? null,
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
  // <ScoreVisualisation
  //   score={riskResult?.latestScore?.score}
  //   advice={riskResult?.advice}
  // />

  return (
    <>
      {/* <RiskResultCard result={riskResult} /> */}
      <TemporalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        data={temporalData || {}}
      />
      {/* {riskResult && (
        <div className="absolute bottom-6 left-6 z-[1000]">
          <ScoreVisualisation
            score={riskResult?.score}
            advice={riskResult?.advice}
          />
        </div>
      )} */}

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
  const [fires, setFires] = useState([]);
  const [mapInstance, setMapInstance] = useState(null);
  const [latestScore, setLatestScore] = useState(null);
  const [dataStatus, setDataStatus] = useState({
    ndvi: false,
    smap: false,
    fires: false,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("🌍 Fetching backend layers...");

        const ndviRes = await fetch(`${BASE_URL}/api/ndvi-anomaly`);
        const ndviJson = await ndviRes.json();
        if (ndviJson?.success && ndviJson.data?.tileUrl) {
          setNdvi(ndviJson.data);
          setDataStatus((p) => ({ ...p, ndvi: true }));
        }

        const smapRes = await fetch(`${BASE_URL}/api/smap-moisture`);
        const smapJson = await smapRes.json();
        if (smapJson?.success && smapJson.data) {
          setSmap(smapJson.data);
          setDataStatus((p) => ({ ...p, smap: true }));
        }

        const firesRes = await fetch(`${BASE_URL}/api/firms-fires`);
        const firesJson = await firesRes.json();
        if (firesJson?.success && firesJson.data) {
          setFires(firesJson.data.features || []);
          setDataStatus((p) => ({ ...p, fires: true }));
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

      {/* NDVI Layer */}
      {ndvi?.tileUrl && layerStates?.ndvi?.visible && (
        <TileLayer
          key={`ndvi-${layerStates.ndvi.opacity}`}
          url={ndvi.tileUrl}
          attribution="NDVI Anomaly (NASA VIIRS)"
          opacity={layerStates.ndvi.opacity}
          maxZoom={15}
        />
      )}

      {/* FIRMS Active Fires */}
      {Array.isArray(fires) &&
        fires.map((f, i) => {
          const [lon, lat] = f.geometry?.coordinates || [];
          if (!lat || !lon) return null;
          const props = f.properties || {};
          return (
            <CircleMarker
              key={`fire-${i}`}
              center={[lat, lon]}
              radius={6}
              color="#ff4444"
              fillColor="#ff0000"
              fillOpacity={0.8}
              weight={2}
            >
              <Tooltip direction="top" offset={[0, -10]}>
                <div className="text-sm">
                  <b>Active Fire</b>
                  <br />
                  Brightness: {props.brightness || "N/A"}
                  <br />
                  Date: {props.acq_date || "N/A"}
                  <br />
                  Confidence: {props.confidence || "N/A"}%
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

      {/* ✅ Click handler now has access to userId */}
      <ClickHandler userId={userId} onScoreUpdate={setLatestScore} />
      {latestScore && (
        <div className="absolute bottom-6 left-6 z-[1000]">
          {/* <ScoreVisualisation
            score={latestScore.score}
            advice={latestScore.advice}
          /> */}
        </div>
      )}

      <TemporalModal />
    </MapContainer>
  );
});

export default BaseMapInner;
