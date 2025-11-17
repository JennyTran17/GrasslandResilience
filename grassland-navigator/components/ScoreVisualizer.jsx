"use client";

const ScoreVisualizer = ({ score, location }) => {
  if (!score && score !== 0) return null;

  const numericScore = typeof score === 'string' ? parseFloat(score) : score;
  const isValidScore = !isNaN(numericScore) && numericScore >= 1 && numericScore <= 5;
  
  if (!isValidScore) return null;

  const getScoreColor = (score) => {
    if (score <= 2) return "#22c55e"; // Green - Low risk
    if (score <= 3) return "#eab308"; // Yellow - Medium risk
    if (score <= 4) return "#f97316"; // Orange - High risk
    return "#ef4444"; // Red - Critical risk
  };

  const getScoreLabel = (score) => {
    if (score <= 2) return "Low Risk";
    if (score <= 3) return "Medium Risk";
    if (score <= 4) return "High Risk";
    return "Critical Risk";
  };

  const color = getScoreColor(numericScore);
  const label = getScoreLabel(numericScore);
  const percentage = (numericScore / 5) * 100;

  return (
    <div className="p-4 w-75">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Risk Assessment</h3>
      
      {location && (
        <p className="text-sm text-gray-600 mb-3">
          📍 {location.lat?.toFixed(4)}, {location.lng?.toFixed(4)}
        </p>
      )}

      {/* Score Circle */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 2.51} 251`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color }}>
                {numericScore.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">/ 5.0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Label */}
      <div className="text-center">
        <div 
          className="inline-block px-3 py-1 rounded-full text-white text-sm font-medium"
          style={{ backgroundColor: color }}
        >
          {label}
        </div>
      </div>

      {/* Risk Scale */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Low</span>
          <span>Critical</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: color 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ScoreVisualizer;