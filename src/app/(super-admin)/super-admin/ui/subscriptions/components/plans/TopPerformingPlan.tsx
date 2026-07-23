import React from "react";
import { Shield } from "lucide-react";

const TopPerformingPlan = () => {
  return (
    <div className="w-full rounded-xl bg-white dark:bg-[#343434] p-3 shadow-sm gap-4">
      <h2 className="text-[18px] font-semibold text-[#0D1B4C] ml-2">
        Top Performing Plan
      </h2>

      <div className="gap-4 items-center justify-between flex mt-1">
        {/* Icon */}
        <div className="flex items-center gap-4">
          <div className="w-[145px] h-[150px] rounded-[16px] bg-[#EAE7F7] flex items-center justify-center">
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
          <div className="ml-1">
            <p className="inline-block px-2 -mt-1 py-1 rounded-sm bg-[#ECFDF3] text-[#377E36] text-[10px] font-semibold mb-4">
              Most Popular
            </p>
            <h3 className="text-[22px] font-semibold text-[#576CBC] leading-none mb-2">
              Enterprise
            </h3>

            <p className="text-[14px] text-black mb-2">
              <span className="font-bold text-[16px]">42</span> Tenants
            </p>

            <p className="text-[14px] text-black">
              <span className="font-bold text-[18px]">$8,500</span> / year
            </p>
          </div>
        </div>

        {/* Graph */}
        <div className="w-72 h-[160px]">
          <svg viewBox="0 0 520 220" className="w-full h-full">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8EDF3" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#E8EDF3" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Gradient Fill */}
            <path
              d="
        M20 150
        C50 190, 90 200, 130 145
        C170 90, 230 170, 275 145
        C310 125, 320 40, 370 40
        C410 40, 430 110, 470 110
        C500 110, 510 60, 520 20
        L520 220
        L20 220
        Z
      "
              fill="url(#areaGradient)"
            />

            {/* Line */}
            <path
              d="
        M20 150
        C50 190, 90 200, 130 145
        C170 90, 230 170, 275 145
        C310 125, 320 40, 370 40
        C410 40, 430 110, 470 110
        C500 110, 510 60, 520 20
      "
              fill="none"
              stroke="#35597B"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TopPerformingPlan;
