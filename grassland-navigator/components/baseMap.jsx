"use client";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const GIBS_URL =
  "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{layer}/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.jpg";

export default function BaseMap() {
  const today = new Date().toISOString().split("T")[0];
  return (
    <MapContainer
      center={[53.3, -8.0]} // Ireland
      zoom={7}
      style={{ height: "100vh", width: "100vw" }}
    >
      <TileLayer
        url={GIBS_URL
          .replace("{layer}", "MODIS_Terra_CorrectedReflectance_TrueColor")
          .replace("{time}", today)
          .replace("{tileMatrixSet}", "GoogleMapsCompatible_Level9")}
        attribution='Imagery © NASA GIBS'
      />
    </MapContainer>
  );
}
