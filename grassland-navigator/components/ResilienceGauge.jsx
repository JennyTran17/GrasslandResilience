"use client";
import { useState, useEffect } from "react";

export default function ResilienceGauge({ score = 72, size = 120 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  
  const getScoreColor = (score) => {
    if (score >= 80) return "text-grass-600";
    if (score >= 60) return "text-stress-500";
    if (score >= 40) return "text-stress-600";
    return "text-alert-critical";
  };

  const getStrokeColor = (score) => {
    if (score >= 80) return "#16a34a";
    if (score >= 60) return "#f59e0b";
    if (score >= 40) return "#f97316";
    return "#ef4444";
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth="8"
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getStrokeColor(animatedScore)}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`text-2xl font-bold ${getScoreColor(animatedScore)}`}>
          {Math.round(animatedScore)}
        </div>
        <div className="text-xs text-tech-500 font-medium">RESILIENCE</div>
      </div>
    </div>
  );
}