"use client";
import dynamic from "next/dynamic";

const BaseMapInner = dynamic(() => import("./BaseMapInner"), {
  ssr: false,
  loading: () => <p>Loading interactive map…</p>,
});

export default function MapWrapper() {
  return <BaseMapInner />;
}
