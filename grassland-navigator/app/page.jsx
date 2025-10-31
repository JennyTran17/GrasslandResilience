"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRef } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import SidePanel from "@/components/SidePanel";
import Legend from "@/components/Legend";
import CompactControls from "@/components/CompactControls";

const MapWrapper = dynamic(() => import("@/components/MapWrapper"), { ssr: false });

export default function Home() {
  const { userId, error } = useAuth();
  const mapRef = useRef();

  if (error) return <p className="text-red-600 p-4">{error}</p>;
  if (!userId) return <p className="p-4">Authenticating...</p>;

  const handleLayerToggle = (layerKey, isVisible) => {
    console.log(`Layer ${layerKey} toggled:`, isVisible);
  };
  
  const handleAreaSelect = (region) => {
    if (mapRef.current) {
      mapRef.current.flyTo(region.center, region.zoom, region.bounds);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 🧭 Header */}
      <Header />

      {/* 🌍 Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map Section */}
        <div className="relative flex-1 overflow-hidden">
          <MapWrapper ref={mapRef} onLayerToggle={handleLayerToggle} />

          {/* Overlay Controls */}
          <CompactControls onLayerToggle={handleLayerToggle} onAreaSelect={handleAreaSelect} />

          {/* 🗺 Legend (ensure it's visible above the map) */}
          <div className="absolute bottom-4 left-4 z-[1000]">
            <Legend />
          </div>

          {/* Status Bar */}
          <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-lg z-[1000]">
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="font-medium">LIVE</span>
              </div>
              <div className="text-slate-400">|</div>
              <div className="font-mono text-slate-300">53.30°N, 8.00°W</div>
              <div className="text-slate-400">|</div>
              <div className="text-xs text-slate-400">14:32 UTC</div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 border-l">
          <SidePanel />
        </div>
      </div>
    </div>
  );
}