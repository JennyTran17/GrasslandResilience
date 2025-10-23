"use client";
import { MapContainer, TileLayer } from "react-leaflet";
import CustomZoomControl from "./CustomZoomControl";
import "leaflet/dist/leaflet.css";

export default function BaseMap() {
  return (
    <MapContainer
      center={[53.3, -8.0]} // Ireland
      zoom={7}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      {/* OpenStreetMap Base Layer */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />
      
      {/* Satellite Layer */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        maxZoom={19}
        opacity={0.8}
      />
      
      <CustomZoomControl />
    </MapContainer>
  );
}
