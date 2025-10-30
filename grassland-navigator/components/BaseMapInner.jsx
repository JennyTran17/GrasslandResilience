"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, WMSTileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function BaseMapInner() {
  const [ndvi, setNdvi] = useState(null);
  const [smap, setSmap] = useState(null);
  const [fires, setFires] = useState([]);

useEffect(() => {
  async function loadData() {
    const res = await fetch(`${BASE_URL}/api/ndvi-anomaly`);
    const json = await res.json();
    setNdvi(json.data);
  }

  loadData();
  const interval = setInterval(loadData, 60 * 60 * 1000); // refresh every hour
  return () => clearInterval(interval);
}, []);


  // Fetch backend endpoints
  useEffect(() => {
    async function fetchData() {
      try {

        const [ndviRes, smapRes, firesRes] = await Promise.all([
          fetch(`${BASE_URL}/api/ndvi-anomaly`).then((r) => r.json()),
          fetch(`${BASE_URL}/api/smap-moisture`).then((r) => r.json()),
          fetch(`${BASE_URL}/api/firms-fires`).then((r) => r.json()),
        ]);

        setNdvi(ndviRes?.data);
        setSmap(smapRes?.data);
        setFires(firesRes?.data?.features || []);
      } catch (err) {
        console.error("Error loading map layers:", err);
      }
    }
    fetchData();
  }, []);

  return (
    <MapContainer
      center={[53.3, -8.0]} // Ireland
      zoom={7}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
    >
      {/* 🗺 Base Map */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* 🌾 NDVI Anomaly */}
      {ndvi?.tileUrl && (
        <TileLayer
          key="ndvi"
          url={ndvi.tileUrl}
          attribution="NDVI Anomaly (NOAA VIIRS)"
          opacity={0.7}
        />
      )}

      {/* 💧 SMAP Soil Moisture */}
      {smap?.wmsUrl && (
        <WMSTileLayer
          key="smap"
          url={smap.wmsUrl}
          layers="SMAP_L3"
          format="image/png"
          transparent={true}
          opacity={0.5}
          attribution="SMAP Soil Moisture (NASA)"
        />
      )}

      {/* 🔥 FIRMS Active Fires */}
      {fires.length > 0 &&
        fires.map((f, i) => {
          const [lon, lat] = f.geometry.coordinates;
          const props = f.properties || {};
          return (
            <CircleMarker
              key={i}
              center={[lat, lon]}
              radius={4}
              color="red"
              fillColor="red"
              fillOpacity={0.8}
            >
              <Tooltip direction="top" offset={[0, -5]}>
                <div>
                  <b>Fire</b>
                  <br />
                  Brightness: {props.brightness || "N/A"}
                  <br />
                  Date: {props.acq_date || "N/A"}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
    </MapContainer>
  );
}
