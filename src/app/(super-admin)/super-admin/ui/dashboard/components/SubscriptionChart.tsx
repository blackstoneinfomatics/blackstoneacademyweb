import React from "react";

const SubscriptionChart = () => {
  return (
    <div className="bg-white dark:bg-[#343434] rounded-[18px] p-6 w-full max-w-full">
      <h2 className="text-[19px] font-semibold text-[#111827] dark:text-white mb-6">
        Subscriptions
      </h2>

      <div className="flex items-center justify-between pr-9 pb-3 h-[190px]">
        {/* Left Labels */}
        <div className="space-y-3 mt-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#4F46E5] rounded-[3px]" />
              <span className="text-[14px] font-semibold text-[#111827] dark:text-white">
                Premium
              </span>
            </div>
            <p className="text-[9px] text-gray-500 dark:text-gray-400 ml-7">200 (40%)</p>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#F5A623] rounded-[3px]" />
              <span className="text-[14px] font-semibold text-[#111827] dark:text-white">
                Standard
              </span>
            </div>
            <p className="text-[9px] text-gray-500 dark:text-gray-400 ml-7">200 (24%)</p>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#22C55E] rounded-[3px]" />
              <span className="text-[14px] font-semibold text-[#111827] dark:text-white">
                Basic
              </span>
            </div>
            <p className="text-[9px] text-gray-500 dark:text-gray-400 ml-7">200 (6%)</p>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="relative w-[220px] h-[220px] -mt-6">
          <div
            className="w-full h-full rounded-full relative"
            style={{
              background: `conic-gradient(
        #4F46E5 0% 45%,
        #F5A623 45% 75%,
        #1ABA72 75% 100%
      )`,
            }}
          >
            {/* inner hole */}
            <div className="absolute inset-[55px] bg-[#F5F7FF] dark:bg-[#343434] rounded-full flex items-center justify-center">
              <span className="text-[24px] font-bold text-[#2F3A56] dark:text-white">100%</span>
            </div>

            {/* labels */}
            <span className="absolute top-[22%] left-[32px] text-white text-sm font-semibold">
              45%
            </span>

            <span className="absolute top-[46%] right-[12px] text-white text-sm font-semibold">
              30%
            </span>

            <span className="absolute bottom-[35px] left-[60px] -translate-x-1/2 text-white text-sm font-semibold">
              25%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionChart;
