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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white rounded-lg p-4 shadow-lg w-[min(800px,95%)] z-10">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">12-month NDVI Time Series</h3>
          <button onClick={onClose} className="text-slate-600">✕</button>
        </div>
        <div style={{ height: 320 }}>
          <Line data={chartData} options={options} />
        </div>
        <div className="mt-3 text-sm">
          <strong>Interpretation:</strong> {data?.interpretation?.trend || "No summary available"}
        </div>
      </div>
    </div>
  );
}
