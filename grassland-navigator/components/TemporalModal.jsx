"use client";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend, CategoryScale } from "chart.js";
import { useEffect } from "react";

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend, CategoryScale);

export default function TemporalModal({ open, onClose, data }) {
  if (!open) return null;
  // data expected shape from backend: data.data.timeSeries.months & ndvi.current & ndvi.historicalMean
  const labels = data?.timeSeries?.months || [];
  const ndviCurrent = data?.timeSeries?.ndvi?.current || [];
  const ndviHistorical = data?.timeSeries?.ndvi?.historicalMean || [];

  const chartData = {
    labels,
    datasets: [
      { label: "Historical Mean NDVI", data: ndviHistorical, fill: false, borderColor: "#888", tension: 0.3 },
      { label: "Current NDVI", data: ndviCurrent, fill: false, borderColor: "#2b8cff", tension: 0.3 },
    ],
  };

  const options = {
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { display: true } },
    scales: { y: { title: { display: true, text: 'NDVI' } } }
  };

  return (
    <div className="bg-white/90 z-[9999] backdrop-blur-sm border border-tech-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-tech-800">📊 NDVI Time Series</h3>
        <button onClick={onClose} className="text-slate-600 hover:bg-gray-100 p-1 rounded">✕</button>
      </div>
      <div style={{ height: 250 }}>
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-2 text-xs text-tech-600">
        <strong>Analysis:</strong> {data?.interpretation?.trend || "No summary available"}
      </div>
    </div>
  );
}
