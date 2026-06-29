import React from "react";

const SubscriptionChart = () => {
  return (
    <div className="bg-white rounded-[24px] p-6 w-full max-w-[640px] h-[295px]">
      <h2 className="text-[19px] font-semibold text-[#111827] mb-6">
        Subscriptions
      </h2>

      <div className="flex items-center justify-between pr-9 pb-3 h-[190px]">
        {/* Left Labels */}
        <div className="space-y-7 mt-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#4F46E5] rounded-[4px]" />
              <span className="text-[15px] font-semibold text-[#111827]">
                Premium
              </span>
            </div>
            <p className="text-[10px] text-gray-500 ml-7">200 (40%)</p>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#F5A623] rounded-[4px]" />
              <span className="text-[16px] font-semibold text-[#111827]">
                Standard
              </span>
            </div>
            <p className="text-[10px] text-gray-500 ml-7">200 (24%)</p>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#22C55E] rounded-[4px]" />
              <span className="text-[16px] font-semibold text-[#111827]">
                Basic
              </span>
            </div>
            <p className="text-[10px] text-gray-500 ml-7">200 (6%)</p>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="relative w-[210px] h-[210px]">
          <div
            className="w-full h-full rounded-full relative"
            style={{
              background: `conic-gradient(
        #4F46E5 0% 70%,
        #F5A623 70% 94%,
        #20C173 94% 100%
      )`,
            }}
          >
            {/* inner hole */}
            <div className="absolute inset-[50px] bg-[#F5F7FF] rounded-full flex items-center justify-center">
              <span className="text-[24px] font-bold text-[#2F3A56]">100%</span>
            </div>

            {/* labels */}
            <span className="absolute top-[42%] left-[14px] text-white text-sm font-bold">
              70%
            </span>

            <span className="absolute top-[46%] right-[12px] text-white text-sm font-bold">
              24%
            </span>

            <span className="absolute bottom-[12px] left-1/2 -translate-x-1/2 text-white text-sm font-bold">
              6%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionChart;
