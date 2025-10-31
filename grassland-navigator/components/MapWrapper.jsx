"use client";
import dynamic from "next/dynamic";
import { forwardRef } from "react";

const BaseMapInner = dynamic(() => import("./BaseMapInner"), {
  ssr: false,
  loading: () => <p>Loading interactive map…</p>,
});

const MapWrapper = forwardRef(function MapWrapper(props, ref) {
  return <BaseMapInner ref={ref} {...props} />;
});

export default MapWrapper;
