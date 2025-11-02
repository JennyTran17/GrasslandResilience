"use client";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { MapContainer, TileLayer, WMSTileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const BASE_URL = "https://grassland-resilience-bhrhb4t8i-fathfuls-projects.vercel.app";

// Map control component to expose map methods
function MapController({ onMapReady }) {
  const map = useMap();
  
  useEffect(() => {
    if (map && onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);
  
  return null;
}

const BaseMapInner = forwardRef(function BaseMapInner({ layerStates }, ref) {
  const [ndvi, setNdvi] = useState(null);
  const [smap, setSmap] = useState(null);
  const [fires, setFires] = useState([]);
  const [mapInstance, setMapInstance] = useState(null);
  const [dataStatus, setDataStatus] = useState({ ndvi: false, smap: false, fires: false });




  // Fetch backend endpoints as per README integration guide
  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching backend data...');
        
        // NDVI Anomaly - Returns tile URL for mapping + legend
        const ndviRes = await fetch(`${BASE_URL}/api/ndvi-anomaly`);
        const ndviJson = await ndviRes.json();
        console.log('NDVI Response:', ndviJson);
        if (ndviJson.success && ndviJson.data && ndviJson.data.tileUrl) {
          setNdvi(ndviJson.data);
          setDataStatus(prev => ({ ...prev, ndvi: true }));
          console.log('🎯 NDVI Tile URL:', ndviJson.data.tileUrl);
          console.log('🎯 Full NDVI Data:', ndviJson.data);
        }

        // SMAP Soil Moisture - Returns soil moisture visualization parameters
        const smapRes = await fetch(`${BASE_URL}/api/smap-moisture`);
        const smapJson = await smapRes.json();
        console.log('SMAP Response:', smapJson);
        if (smapJson.success && smapJson.data) {
          setSmap(smapJson.data);
          setDataStatus(prev => ({ ...prev, smap: true }));
          console.log('🎯 SMAP Data:', smapJson.data);
          if (smapJson.data.tileUrl || smapJson.data.wmsUrl) {
            console.log('🎯 SMAP Tile URL:', smapJson.data.tileUrl || smapJson.data.wmsUrl);
          }
        }

        // FIRMS Active Fires - Returns fire detection data structure
        const firesRes = await fetch(`${BASE_URL}/api/firms-fires`);
        const firesJson = await firesRes.json();
        console.log('FIRMS Response:', firesJson);
        if (firesJson.success && firesJson.data) {
          const fireData = firesJson.data?.features || firesJson.data || [];
          setFires(fireData);
          setDataStatus(prev => ({ ...prev, fires: true }));
          console.log('FIRMS data loaded:', fireData.length, 'fires');
        }


      } catch (err) {
        console.error('Error loading map layers:', err);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);



  useImperativeHandle(ref, () => ({
    flyTo: (center, zoom, bounds) => {
      if (mapInstance) {
        if (bounds) {
          mapInstance.fitBounds(bounds, { padding: [20, 20] });
        } else {
          mapInstance.flyTo(center, zoom, { duration: 1.5 });
        }
      }
    }
  }), [mapInstance]);



  return (
    <MapContainer
      center={[53.3, -8.0]} // Ireland
      zoom={7}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
    >
      <MapController onMapReady={setMapInstance} />
      
      {/* Data Status Indicator */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md rounded-lg p-3 shadow-lg">
        <div className="text-xs font-medium text-slate-700 mb-2">Layer Status</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${dataStatus.ndvi && layerStates?.ndvi?.visible ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span>NDVI</span>
            </div>
            <span className="text-slate-500">{Math.round((layerStates?.ndvi?.opacity || 0.7) * 100)}%</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${layerStates?.soilMoisture?.visible ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
              <span>SMAP</span>
            </div>
            <span className="text-slate-500">{Math.round((layerStates?.soilMoisture?.opacity || 0.5) * 100)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${dataStatus.fires ? 'bg-red-500' : 'bg-gray-400'}`}></div>
            <span>Fires ({Array.isArray(fires) ? fires.length : 0})</span>
          </div>
        </div>
      </div>

      {/* Base Map */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* NDVI Anomaly Layer - Real GEE Tiles */}
      {ndvi?.tileUrl && layerStates?.ndvi?.visible && (
        <TileLayer
          key={`ndvi-${layerStates.ndvi.opacity}`}
          url={ndvi.tileUrl}
          attribution="NDVI Anomaly (NASA VIIRS)"
          opacity={layerStates.ndvi.opacity}
          maxZoom={15}
          errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        />
      )}

      {/* SMAP Soil Moisture Layer */}
      {layerStates?.soilMoisture?.visible && (
        <TileLayer
          key={`smap-${layerStates.soilMoisture.opacity}`}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="SMAP Soil Moisture (NASA)"
          opacity={layerStates.soilMoisture.opacity}
          maxZoom={15}
          className="smap-overlay"
        />
      )}

      {/* Risk Assessment Layer */}
      {layerStates?.riskLevel?.visible && (
        <TileLayer
          key={`risk-${layerStates.riskLevel.opacity}`}
          url="https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=demo"
          attribution="Risk Assessment"
          opacity={layerStates.riskLevel.opacity}
          maxZoom={15}
          className="risk-overlay"
        />
      )}

      {/* Precipitation Layer */}
      {layerStates?.precipitation?.visible && (
        <TileLayer
          key={`precip-${layerStates.precipitation.opacity}`}
          url="https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=demo"
          attribution="Precipitation Data"
          opacity={layerStates.precipitation.opacity}
          maxZoom={15}
          className="precip-overlay"
        />
      )}

      {/*FIRMS Active Fires */}
      {fires && Array.isArray(fires) && fires.length > 0 &&
        fires.map((f, i) => {
          if (!f.geometry || !f.geometry.coordinates) return null;
          const [lon, lat] = f.geometry.coordinates;
          const props = f.properties || {};
          return (
            <CircleMarker
              key={`fire-${i}-${lat}-${lon}`}
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
    </MapContainer>
  );
});

export default BaseMapInner;
