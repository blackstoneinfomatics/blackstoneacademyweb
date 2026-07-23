import React from "react";

const PopularPlan = () => {
  const progress = 92;
  const radius = 70;
  const stroke = 16;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 h-full flex flex-col">
      {/* Header */}
      <h2 className="text-[18px] font-semibold text-gray-900 mb-2">
        Popular Plan
      </h2>

      {/* Circle Progress */}
      <div className="flex justify-center items-center">
        <div className="relative w-[160px] h-[160px]">
          <svg height="160" width="160" className="rotate-[-140deg]">
            {/* Background */}
            <circle
              stroke="#E5E7EB"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx="80"
              cy="80"
            />

            {/* Progress */}
            <circle
              stroke="#3DBB59"
              fill="transparent"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              r={normalizedRadius}
              cx="80"
              cy="80"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h3 className="text-[18px] font-semibold text-black">₹ 3.56L</h3>
            <p className="text-[15px] font-medium text-gray-900">92%</p>
          </div>
        </div>
      </div>

      {/* Badge */}
      <div className="flex justify-center">
        <span className="bg-green-100 text-green-600 px-2 py-1 mb-3 mt-2 rounded-md text-[12px] font-medium">
          Standard
        </span>
      </div>

      {/* Footer */}
      <p className="text-center text-base font-medium text-gray-800 mt-auto">
        Most popular plan this month
      </p>
    </div>
  );
};

export default PopularPlan;
