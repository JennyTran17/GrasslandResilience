"use client";
import { useState, useCallback } from "react";

export function useLayerControls() {
  const [layerStates, setLayerStates] = useState({
    ndvi: { visible: true, opacity: 0.7 },
    soilMoisture: { visible: true, opacity: 0.5 },
    riskLevel: { visible: false, opacity: 0.6 },
    precipitation: { visible: false, opacity: 0.5 }
  });

  const toggleLayer = useCallback((layerKey) => {
    console.log('Toggling layer:', layerKey);
    setLayerStates(prev => {
      const newState = {
        ...prev,
        [layerKey]: { ...prev[layerKey], visible: !prev[layerKey].visible }
      };
      console.log('New layer states:', newState);
      return newState;
    });
  }, []);

  const setOpacity = useCallback((layerKey, opacity) => {
    console.log('Setting opacity:', layerKey, opacity);
    setLayerStates(prev => {
      const newState = {
        ...prev,
        [layerKey]: { ...prev[layerKey], opacity: opacity / 100 }
      };
      console.log('New opacity states:', newState);
      return newState;
    });
  }, []);

  return {
    layerStates,
    toggleLayer,
    setOpacity
  };
}