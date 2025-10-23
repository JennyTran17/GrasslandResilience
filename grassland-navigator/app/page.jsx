"use client";
import { useAuth } from "@/hooks/useAuth";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import SidePanel from "@/components/SidePanel";
import CompactControls from "@/components/CompactControls";

const BaseMap = dynamic(() => import("@/components/baseMap"), { ssr: false });

export default function Home() {
  const { userId, error } = useAuth();

  if (error) return <p className="text-red-600 p-4">{error}</p>;
  if (!userId) return <p className="p-4">Authenticating...</p>;

  const handleLayerToggle = (layerKey, isVisible) => {
    console.log(`Layer ${layerKey} toggled:`, isVisible);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Map Container */}
        <div className="flex-1 relative overflow-hidden">
          <BaseMap />
          <CompactControls onLayerToggle={handleLayerToggle} />
          
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
        <SidePanel />
      </div>
    </div>
  );
}
