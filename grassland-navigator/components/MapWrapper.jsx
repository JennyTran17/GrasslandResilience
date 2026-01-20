"use client";
import dynamic from "next/dynamic";
import { forwardRef } from "react";

const BaseMapInner = dynamic(() => import("./BaseMapInner"), {
  ssr: false,
  loading: () => <p>Loading interactive map…</p>,
});

const MapWrapper = forwardRef(function MapWrapper({ layerStates, onRiskAssessment, ...props }, ref) {
  return <BaseMapInner ref={ref} layerStates={layerStates} onRiskAssessment={onRiskAssessment} {...props} />;
});

export default MapWrapper;
