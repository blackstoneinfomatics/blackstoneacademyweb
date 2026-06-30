import React from "react";

const RevenueOverview = () => {
  return (
    <div className="bg-white rounded-[18px] p-5 shadow-sm w-full max-w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[19px] font-semibold text-slate-900">
          Revenue Overview
        </h2>

        <button className="bg-gray-100 px-4 py-2 rounded-lg text-gray-600 text-xs flex items-center gap-2">
          Monthly
          <span className="text-[9px]">▼</span>
        </button>
      </div>

      <div className="relative h-[190px]">
        {/* Y Axis Labels */}
        <div className="absolute -mt-2 space-y-4 left-0 top-0 h-full flex flex-col text-gray-900 text-[11px] z-10">
          <span>$1000</span>
          <span>$500</span>
          <span>$200</span>
          <span>$100</span>
        </div>

        {/* Grid Lines */}
        <div className="absolute left-0 right-0 top-0 bottom-0 flex flex-col justify-between">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="border-t border-dashed  border-gray-200 w-full"
            />
          ))}
        </div>

        {/* Chart */}
        <div className="absolute left-0 right-0 top-6 bottom-0">
          <svg
            viewBox="0 0 700 380"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {/* Vertical bars */}
            {[...Array(80)].map((_, i) => (
              <line
                key={i}
                x1={i * 9}
                y1="380"
                x2={i * 9}
                y2="90"
                stroke="#978FED"
                strokeWidth="2"
              />
            ))}

            {/* Graph line */}
            <path
              d="M0 310 
                 C60 250, 100 180, 150 140
                 C180 120, 200 180, 230 200
                 C280 200, 310 210, 360 140
                 C400 130, 470 140, 520 140
                 C560 140, 580 100, 620 70
                 C660 30, 690 5, 700 0"
              fill="none"
              stroke="#8178F9"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Dot */}
            <circle cx="505" cy="140" r="10" fill="white" stroke="#8178F9" strokeWidth="5" />
            <line x1="505" y1="150" x2="505" y2="290" stroke="#8178F9" strokeWidth="4" />
          </svg>
        </div>

        {/* Floating Card */}
        <div className="absolute -top-4 left-[38%] bg-white rounded-xl shadow-lg px-4 py-3 z-20">
          <p className="text-gray-500 text-xs">29 July</p>
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-gray-900">
              220,342.76
            </span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-semibold text-xs">
              +3.4%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueOverview;