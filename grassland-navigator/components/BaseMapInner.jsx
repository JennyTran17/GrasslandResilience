"use client";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
  useMapEvents,
  Marker,
  Polygon,
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
  "https://grassland-resilience.vercel.app";

function ClickHandler({ userId, onScoreUpdate, fieldPoints, setFieldPoints }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [temporalData, setTemporalData] = useState(null);
  const [riskResult, setRiskResult] = useState(null);
  const [saveMode, setSaveMode] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [drawingMode, setDrawingMode] = useState(false);

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      console.log("📍 Map click detected:", lat, lng);

      // Handle field boundary drawing
      if (drawingMode) {
        const newPoints = [...fieldPoints, [lat, lng]];
        setFieldPoints(newPoints);
        if (newPoints.length >= 3) {
          setDrawingMode(false);
          setSaveMode(true);
          setSaveName(`Field Boundary (${newPoints.length} points)`);
        }
        return;
      }

      // 1. Display time-series chart (using mock data)
      setTemporalData({
        location: { lat, lng },
        ndviTimeSeries: [0.3, 0.4, 0.5, 0.6, 0.7, 0.6, 0.5, 0.4, 0.3, 0.4, 0.5, 0.6],
        soilMoisture: [20, 25, 30, 35, 40, 35, 30, 25, 20, 25, 30, 35],
        message: "Mock temporal data"
      });
      setModalOpen(true);

      // 2. Risk Scoring (using mock data)
      const mockScore = Math.floor(Math.random() * 5) + 1;
      const mockAdvice = {
        1: "Low risk detected. Continue current grazing practices. Monitor soil moisture levels.",
        2: "Moderate risk. Consider reducing grazing intensity by 20%. Apply organic fertilizer.",
        3: "High risk area. Implement rotational grazing. Avoid heavy machinery during wet conditions.",
        4: "Critical risk. Immediate action required. Restrict livestock access. Implement erosion control.",
        5: "Severe risk. Emergency measures needed. Complete livestock removal. Consult agricultural specialist."
      };
      
      const mockData = {
        riskScore: mockScore,
        score: mockScore,
        advice: mockAdvice[mockScore],
        location: { lat, lng }
      };
      
      setRiskResult(mockData);
      onScoreUpdate?.(mockData);

      // 3. Display save form
      setSaveMode(true);
      setSaveName(`Field ${lat.toFixed(3)}, ${lng.toFixed(3)}`);
      
      console.log("✅ Click handler completed successfully");
      console.log("📊 Risk result:", riskResult);
      console.log("📈 Temporal data:", temporalData);
      console.log("💾 Save mode:", saveMode);
    },
  });

  async function handleSaveField() {
    if (!userId) {
      alert("Please sign in to save fields.");
      return;
    }

    let geometry;
    if (fieldPoints.length >= 3) {
      // Save as polygon for field boundary
      geometry = {
        type: "Polygon",
        coordinates: [[...fieldPoints.map(p => [p[1], p[0]]), [fieldPoints[0][1], fieldPoints[0][0]]]]
      };
    } else {
      // Save as point
      const coords = temporalData?.location ? 
        [temporalData.location.lng, temporalData.location.lat] : 
        [riskResult?.location?.lng || -8.0, riskResult?.location?.lat || 53.3];
      geometry = { type: "Point", coordinates: coords };
    }

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
      setFieldPoints([]);
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


      {/* Field Drawing Controls */}
      <div className="fixed left-6 top-24 z-[2000] bg-white p-3 rounded shadow">
        <h4 className="font-semibold mb-2">Field Tools</h4>
        <button
          onClick={() => {
            setDrawingMode(!drawingMode);
            setFieldPoints([]);
          }}
          className={`px-3 py-1 rounded mb-2 w-full ${
            drawingMode ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
          }`}
        >
          {drawingMode ? 'Cancel Drawing' : 'Draw Field Boundary'}
        </button>
        {drawingMode && (
          <div className="text-sm text-gray-600">
            Click {3 - fieldPoints.length} more points to complete field
          </div>
        )}
      </div>

      {saveMode && (
        <div className="fixed right-6 top-24 z-[2000] bg-white p-3 rounded shadow w-80">
          <h4 className="font-semibold mb-2">Save Field</h4>
          <input
            className="w-full p-2 border mb-2"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
          />
          {fieldPoints.length >= 3 && (
            <div className="text-sm text-green-600 mb-2">
              ✅ Field boundary with {fieldPoints.length} points
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setSaveMode(false);
                setFieldPoints([]);
              }}
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

// Field boundary display component
function FieldBoundaryDisplay({ fieldPoints }) {
  return (
    <>
      {/* Draw points */}
      {fieldPoints.map((point, i) => (
        <CircleMarker
          key={`boundary-point-${i}`}
          center={point}
          radius={8}
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.8 }}
        >
          <Tooltip>Field Point {i + 1}</Tooltip>
        </CircleMarker>
      ))}
      
      {/* Draw polygon when 3+ points */}
      {fieldPoints.length >= 3 && (
        <Polygon
          positions={fieldPoints}
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2 }}
        >
          <Tooltip>Field Boundary (Click to complete)</Tooltip>
        </Polygon>
      )}
    </>
  );
}

const BaseMapInner = forwardRef(function BaseMapInner({ layerStates }, ref) {
  const { userId } = useAuth();
  const [ndvi, setNdvi] = useState(null);
  const [smap, setSmap] = useState(null);
  const [fires, setFires] = useState([]);
  const [mapInstance, setMapInstance] = useState(null);
  const [latestScore, setLatestScore] = useState(null);
  const [fieldPoints, setFieldPoints] = useState([]);
  const [dataStatus, setDataStatus] = useState({
    ndvi: false,
    smap: false,
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
        if (ndviJson?.success && ndviJson.data) {
          // Use proxied tile URL if available
          const tileUrl = ndviJson.data.tileUrl || `${BASE_URL}/api/ndvi-tiles/{z}/{x}/{y}`;
          setNdvi({ ...ndviJson.data, tileUrl });
          setDataStatus((p) => ({ ...p, ndvi: true }));
          console.log('✅ NDVI Tile URL:', tileUrl);
        }

        const smapRes = await fetch(`${BASE_URL}/api/smap-moisture`);
        const smapJson = await smapRes.json();
        console.log('💧 SMAP Response:', smapJson);
        if (smapJson?.success && smapJson.data) {
          setSmap(smapJson.data);
          setDataStatus((p) => ({ ...p, smap: true }));
          console.log('✅ SMAP Tile URL:', smapJson.data.tileUrl);
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



      {/* FIRMS Active Fires - Real Backend Data */}
      {fires && Array.isArray(fires) && fires.length > 0 && layerStates?.fires?.visible &&
        fires.map((f, i) => {
          const [lon, lat] = f.geometry?.coordinates || [0, 0];
          return (
            <CircleMarker
              key={`fire-${i}`}
              center={[lat, lon]}
              radius={6}
              pathOptions={{ color: 'red', fillColor: 'orange', fillOpacity: 0.8 }}
            >
              <Tooltip>
                🔥 Active Fire<br/>
                Confidence: {f.properties?.confidence || 'N/A'}%<br/>
                Date: {f.properties?.acq_date || 'Unknown'}
              </Tooltip>
            </CircleMarker>
          );
        })}

      {/* Data Status Indicator */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 p-2 rounded text-xs">
        <div className="font-semibold mb-1">Data Status:</div>
        <div className={`${dataStatus.ndvi ? 'text-green-600' : 'text-red-600'}`}>
          🛰️ NDVI: {dataStatus.ndvi ? 'Connected' : 'Loading...'}
        </div>
        <div className={`${dataStatus.smap ? 'text-green-600' : 'text-red-600'}`}>
          💧 SMAP: {dataStatus.smap ? 'Connected' : 'Loading...'}
        </div>
        <div className={`${dataStatus.fires ? 'text-green-600' : 'text-red-600'}`}>
          🔥 Fires: {dataStatus.fires ? 'Connected' : 'Loading...'}
        </div>
      </div>

      {/* Resilience Score & Advice Display */}
      {latestScore && (
        <div className="absolute top-4 right-4 z-[1000] bg-white/90 p-4 rounded-lg shadow-lg max-w-sm">
          <div className="font-semibold text-sm mb-2">Resilience Analysis</div>
          
          {/* Score Visualizer */}
          <div className="flex items-center mb-3">
            <div className="mr-3">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="25" fill="none" stroke="#e5e7eb" strokeWidth="4"/>
                <circle 
                  cx="30" cy="30" r="25" fill="none" 
                  stroke={getScoreColor(latestScore.riskScore || latestScore.score)}
                  strokeWidth="4"
                  strokeDasharray={`${((latestScore.riskScore || latestScore.score || 0) / 5) * 157} 157`}
                  strokeDashoffset="39.25"
                  transform="rotate(-90 30 30)"
                />
                <text x="30" y="35" textAnchor="middle" className="text-lg font-bold">
                  {latestScore.riskScore || latestScore.score || 'N/A'}
                </text>
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold">
                Risk Level: {getRiskLevel(latestScore.riskScore || latestScore.score)}
              </div>
              <div className="text-xs text-gray-500">Scale: 1 (Low) - 5 (High)</div>
            </div>
          </div>
          
          {/* Actionable Advice */}
          {latestScore.advice && (
            <div className="bg-blue-50 p-2 rounded text-xs">
              <div className="font-semibold mb-1">🎯 Recommendations:</div>
              <div className="text-gray-700">
                {latestScore.advice.substring(0, 150)}...
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click handler */}
      <ClickHandler 
        userId={userId} 
        onScoreUpdate={setLatestScore}
        fieldPoints={fieldPoints}
        setFieldPoints={setFieldPoints}
      />
      
      {/* Field boundary visualization */}
      <FieldBoundaryDisplay fieldPoints={fieldPoints} />
    </MapContainer>
  );
});

// Helper functions for score visualization
function getScoreColor(score) {
  if (!score) return '#gray';
  if (score <= 1.5) return '#10b981'; // green
  if (score <= 2.5) return '#f59e0b'; // yellow
  if (score <= 3.5) return '#f97316'; // orange
  return '#ef4444'; // red
}

function getRiskLevel(score) {
  if (!score) return 'Unknown';
  if (score <= 1.5) return 'Low';
  if (score <= 2.5) return 'Moderate';
  if (score <= 3.5) return 'High';
  return 'Critical';
}

export default BaseMapInner;
