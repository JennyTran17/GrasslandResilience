"use client";
import { useAuth } from "@/hooks/useAuth";
import dynamic from "next/dynamic";

const BaseMap = dynamic(() => import("@/components/baseMap"), { ssr: false });


export default function Home() {
  const { userId, error } = useAuth();

  if (error) return <p className="text-red-600">{error}</p>;
  if (!userId) return <p>Authenticating...</p>;

  return (
    <div>
      <p className="absolute top-2 left-2 bg-white/80 p-2 rounded text-sm shadow">
        Authenticated user: {userId}
      </p>
      <BaseMap />
    </div>
  );
}
