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
import { getTemporal, postRiskScore } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const BASE_URL = "https://grassland-resilience.vercel.app";

function ClickHandler({ userId, onScoreUpdate, onSaveModeChange }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [temporalData, setTemporalData] = useState(null);
  const [riskResult, setRiskResult] = useState(null);
  const [saveMode, setSaveMode] = useState(false);
  const [saveName, setSaveName] = useState("");

  // Save field to Firestore
  async function handleSaveField() {
    if (!userId) {
      alert("Please sign in to save fields.");
      return;
    }

    const coords = [
      riskResult?.location?.lng || -8.0,
      riskResult?.location?.lat || 53.3
    ];

    const doc = {
      name: saveName,
      geometry: { type: "Point", coordinates: coords },
      createdAt: serverTimestamp(),
      latestScore: {
        score: riskResult?.riskScore || null,
        advice: riskResult?.advice || null,
      },
    };

    try {
      await addDoc(collection(db, `users/${userId}/fields`), doc);
      setSaveMode(false);
      alert("✅ Field saved successfully.");
    } catch (err) {
      console.error("❌ Save field error:", err);
      alert("Failed to save field.");
    }
  }

  // Notify parent when save mode changes
  useEffect(() => {
    console.log("🔄 Save mode changed:", saveMode, "Name:", saveName);
    if (onSaveModeChange) {
      onSaveModeChange({
        saveMode,
        saveName,
        setSaveName,
        handleSaveField,
        handleCancel: () => setSaveMode(false)
      });
    }
  }, [saveMode, saveName, onSaveModeChange]);

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      console.log("📍 Map click detected:", lat, lng);

      // Fetch risk assessment
      try {
        const riskRes = await postRiskScore({ lat, lng });
        if (riskRes?.success && riskRes.data) {
          const riskData = {
            riskScore: riskRes.data.riskScore?.score || 3.0,
            advice: [
              riskRes.data.interpretation?.overallStatus || 'Risk assessment completed',
              riskRes.data.interpretation?.ndviStatus || 'NDVI analysis available',
              riskRes.data.interpretation?.moistureStatus || 'Soil moisture data processed'
            ],
            location: { lat: Number(lat), lng: Number(lng) }
          };
          setRiskResult(riskData);
          onScoreUpdate?.(riskData);
          setSaveMode(true);
          const riskScore = typeof riskData.riskScore === 'number' ? riskData.riskScore.toFixed(1) : riskData.riskScore;
          setSaveName(`Field ${lat.toFixed(3)}, ${lng.toFixed(3)}`);
          console.log("💾 Save mode set, saveName:", `Field ${lat.toFixed(3)}, ${lng.toFixed(3)} - Risk: ${riskScore}/5`);
        }
      } catch (err) {
        console.error("❌ Risk assessment error:", err);
        const fallbackData = {
          riskScore: 3.0,
          advice: ["Assessment unavailable"],
          location: { lat: Number(lat), lng: Number(lng) }
        };
        setRiskResult(fallbackData);
        onScoreUpdate?.(fallbackData);
        setSaveMode(true);
        setSaveName(`Field ${lat.toFixed(3)}, ${lng.toFixed(3)} - Risk: 3.0/5`);
      }

      // Fetch temporal data (optional)
      try {
        const temporal = await getTemporal(lat, lng);
        if (temporal?.data) {
          setTemporalData(temporal.data);
          setModalOpen(true);
        }
      } catch (err) {
        console.error("❌ Temporal fetch error:", err);
        // Continue without temporal data - don't show modal if temporal data fails
      }
    },
  });

  return (
    <TemporalModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      data={temporalData || {}}
    />
  );
}

function MapController({ onMapReady }) {
  const map = useMap();
  useEffect(() => {
    if (map && onMapReady) onMapReady(map);
  }, [map, onMapReady]);
  return null;
}

const BaseMapInner = forwardRef(function BaseMapInner({ layerStates, onRiskAssessment }, ref) {
  const { userId } = useAuth();
  const [ndvi, setNdvi] = useState(null);
  const [smap, setSmap] = useState(null);
  const [precipitation, setPrecipitation] = useState(null);
  const [fires, setFires] = useState([]);
  const [mapInstance, setMapInstance] = useState(null);
  const [latestScore, setLatestScore] = useState(null);
  const [saveState, setSaveState] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ndviRes, smapRes, precipRes, firesRes] = await Promise.all([
          fetch(`${BASE_URL}/api/ndvi-anomaly`),
          fetch(`${BASE_URL}/api/smap-moisture`),
          fetch(`${BASE_URL}/api/precipitation`),
          fetch(`${BASE_URL}/api/firms-fires`)
        ]);

        const [ndviJson, smapJson, precipJson, firesJson] = await Promise.all([
          ndviRes.json(),
          smapRes.json(),
          precipRes.json(),
          firesRes.json()
        ]);

        if (ndviJson?.success && ndviJson.data?.tileUrl) setNdvi(ndviJson.data);
        if (smapJson?.success && smapJson.data) setSmap(smapJson.data);
        if (precipJson?.success && precipJson.data) setPrecipitation(precipJson.data);
        if (firesJson?.success && firesJson.data) setFires(firesJson.data?.fires?.features || []);
      } catch (err) {
        console.error("Error loading map layers:", err);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useImperativeHandle(ref, () => ({
    flyTo: (center, zoom, bounds) => {
      if (mapInstance) {
        if (bounds) mapInstance.fitBounds(bounds, { padding: [20, 20] });
        else mapInstance.flyTo(center, zoom, { duration: 1.5 });
      }
    },
  }), [mapInstance]);

  return (
    <>
      <MapContainer
        center={[53.3, -8.0]}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <MapController onMapReady={setMapInstance} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {ndvi?.tileUrl && layerStates?.ndvi?.visible && (
          <TileLayer
            key={`ndvi-${layerStates.ndvi.opacity}`}
            url={ndvi.tileUrl}
            attribution="NDVI Anomaly (NASA VIIRS)"
            opacity={layerStates.ndvi.opacity}
            maxZoom={15}
          />
        )}

        {smap?.tileUrl && layerStates?.soilMoisture?.visible && (
          <TileLayer
            key={`smap-${layerStates.soilMoisture.opacity}`}
            url={smap.tileUrl}
            attribution="Soil Moisture (ERA5)"
            opacity={layerStates.soilMoisture.opacity}
            maxZoom={15}
          />
        )}

        {precipitation?.tileUrl && layerStates?.precipitation?.visible && (
          <TileLayer
            key={`precipitation-${layerStates.precipitation.opacity}`}
            url={precipitation.tileUrl}
            attribution="Precipitation (GPM IMERG)"
            opacity={layerStates.precipitation.opacity}
            maxZoom={15}
          />
        )}

        {fires.map((f, i) => {
          const [lon, lat] = f.geometry?.coordinates || [];
          if (!lat || !lon) return null;
          const props = f.properties || {};
          return (
            <CircleMarker
              key={`fire-${i}`}
              center={[lat, lon]}
              radius={Math.max(4, (props.brightness || 300) / 50)}
              color="#ff4444"
              fillColor="#ff0000"
              fillOpacity={0.8}
              weight={2}
            >
              <Tooltip>
                <div className="text-sm">
                  <b>🔥 Active Fire</b><br />
                  Brightness: {props.brightness || "N/A"}<br />
                  Date: {props.acq_date || "N/A"}<br />
                  Confidence: {props.confidence || "N/A"}%
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {latestScore && (
          <div className="absolute top-4 right-4 z-[1000]">
            <div className="bg-white rounded-lg shadow-lg p-3 w-64">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Latest Assessment</h4>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-blue-600">
                  {typeof latestScore.riskScore === 'number' ? latestScore.riskScore.toFixed(1) : latestScore.riskScore}
                </div>
                <div className="text-sm text-gray-600">
                  Risk Score
                  {latestScore.location && (
                    <div className="text-xs text-gray-500">
                      {latestScore.location.lat?.toFixed(3)}, {latestScore.location.lng?.toFixed(3)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <ClickHandler
          userId={userId}
          onScoreUpdate={(data) => {
            setLatestScore(data);
            onRiskAssessment?.(data);
          }}

          onSaveModeChange={setSaveState}
        />
      </MapContainer>

      {saveState?.saveMode && (
        <div className="fixed right-6 top-24 z-[2000] bg-white p-3 rounded shadow w-80">
          <h4 className="font-semibold mb-2">Save Field</h4>
          <input
            className="w-full p-2 border mb-2"
            value={saveState.saveName}
            onChange={(e) => saveState.setSaveName(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={saveState.handleCancel}
              className="px-3 py-1 border rounded"
            >
              Cancel
            </button>
            <button
              onClick={saveState.handleSaveField}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Save Field
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default BaseMapInner;