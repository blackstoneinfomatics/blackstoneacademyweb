import React from "react";
import { Shield } from "lucide-react";

const TopPerformingPlan = () => {
  return (
    <div className="w-full rounded-3xl bg-[#F7F8FC] p-5 shadow-sm">
      <h2 className="text-[20px] font-bold text-[#0D1B4C] mb-5">
        Top Performing Plan
      </h2>

      <div className="grid grid-cols-[180px_260px_1fr] gap-6 items-center">
        {/* Icon */}
        <div className="w-[150px] h-[150px] rounded-[28px] bg-[#EAE7F7] flex items-center justify-center">
          <svg width="100" height="90" viewBox="0 0 120 140" fill="none">
            {/* Shield */}
            <path
              d="M60 0
         C70 12 92 20 108 24
         V72
         C108 102 84 122 60 140
         C36 122 12 102 12 72
         V24
         C28 20 50 12 60 0Z"
              fill="#5A6FCB"
            />

            {/* Star */}
            <path
              d="M60 38
         L68 58
         L90 60
         L74 74
         L79 96
         L60 84
         L41 96
         L46 74
         L30 60
         L52 58
         Z"
              fill="#EAE7F7"
            />
          </svg>
        </div>

        {/* Content */}
        <div>
          <span className="inline-block px-3 py-1 rounded-lg bg-[#EAF7EA] text-[#4A9B50] text-[13px] font-semibold mb-3">
            Most Popular
          </span>

          <h3 className="text-[38px] font-bold text-[#5C6BCF] leading-none mb-3">
            Enterprise
          </h3>

          <p className="text-[18px] text-black mb-2">
            <span className="font-bold text-[20px]">42</span> Tenants
          </p>

          <p className="text-[18px] text-black">
            <span className="font-bold text-[20px]">$8,500</span> / year
          </p>
        </div>

        {/* Graph */}
        <div className="w-full h-[260px]">
          <svg viewBox="0 0 450 260" className="w-full h-full">
            <path
              d="M30 180 
                 C70 240, 110 230, 150 170
                 C190 130, 240 210, 280 160
                 C310 70, 360 60, 400 130
                 C430 190, 460 100, 520 20"
              fill="none"
              stroke="#365E84"
              strokeWidth="4"
              strokeLinecap="round"
            />

            <path
              d="M30 180 
                 C70 240, 110 230, 150 170
                 C190 130, 240 210, 280 160
                 C310 70, 360 60, 400 130
                 C430 190, 460 100, 520 20
                 L520 260 L30 260 Z"
              fill="#E7EDF5"
              opacity="0.8"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TopPerformingPlan;
