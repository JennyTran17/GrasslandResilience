"use client";

const ActionableAdvice = ({ advice, score, location }) => {
  if (!advice && !score) return null;

  const numericScore = typeof score === 'string' ? parseFloat(score) : score;
  
  const getAdviceIcon = (score) => {
    if (score <= 2) return "✅";
    if (score <= 3) return "⚠️";
    if (score <= 4) return "🚨";
    return "🔴";
  };

  const getDefaultAdvice = (score) => {
    if (score <= 2) return [
      "Grassland conditions are favorable",
      "Continue current management practices",
      "Monitor for seasonal changes"
    ];
    if (score <= 3) return [
      "Moderate stress detected in vegetation",
      "Consider adjusting grazing intensity",
      "Monitor soil moisture levels closely"
    ];
    if (score <= 4) return [
      "High stress conditions present",
      "Reduce livestock density immediately",
      "Implement water conservation measures",
      "Consider supplemental feeding"
    ];
    return [
      "Critical grassland stress detected",
      "Emergency management required",
      "Remove livestock from affected areas",
      "Consult agricultural extension services",
      "Implement immediate conservation measures"
    ];
  };

  const adviceList = advice && advice !== "Click on the map to get risk assessment" ? 
    (Array.isArray(advice) ? advice : [advice]) : 
    getDefaultAdvice(numericScore);

  const icon = getAdviceIcon(numericScore);

  return (
    <div className="bg-white p-4 w-80 mt-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
        {icon} Actionable Advice
      </h3>
      
      <div className="space-y-2">
        {adviceList.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
          </div>
        ))}
      </div>

      {location && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Assessment for: {location.lat?.toFixed(4)}, {location.lng?.toFixed(4)}
          </p>
          <p className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ActionableAdvice;