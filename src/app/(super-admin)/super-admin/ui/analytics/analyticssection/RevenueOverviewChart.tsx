"use client";

import React from "react";

const revenueData = [
  { month: "Jan", value: 420 },
  { month: "Feb", value: 310 },
  { month: "Mar", value: 420 },
  { month: "Apr", value: 160 },
  { month: "May", value: 160 },
  { month: "Jun", value: 650 },
  { month: "Jul", value: 420 },
  { month: "Aug", value: 500 },
];

const RevenueOverviewChart = () => {
  const maxValue = 1000;

  return (
    <div className="w-full rounded-[20px] bg-white px-[29px] pt-[27px] pb-[25px] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-semibold leading-[34px] tracking-[-0.5px] text-[#18181B]">
          Revenue Overview
        </h2>

        {/* Monthly Dropdown */}
        <button
          type="button"
          className="flex items-center gap-[20px] rounded-[6px] bg-[#F0F0F0] px-[11px] py-[5px] text-[12px] font-medium text-[#737373]"
        >
          Monthly
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 5L7 9L11 5"
              stroke="#737373"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* ================= CHART ================= */}
      <div className="mt-[25px]">
        <div className="flex">
          {/* ================= Y AXIS ================= */}
          <div className="relative h-[355px] w-[67px] shrink-0">
            <span className="absolute left-0 top-[0px] text-[14px] font-normal text-[#454545]">
              $1000
            </span>

            <span className="absolute left-0 top-[40px] text-[14px] font-normal text-[#454545]">
              $500
            </span>

            <span className="absolute left-0 top-[80px] text-[14px] font-normal text-[#454545]">
              $200
            </span>

            <span className="absolute left-0 top-[120px] text-[14px] font-normal text-[#454545]">
              $0
            </span>

            <span className="absolute left-0 top-[160px] text-[14px] font-normal text-[#454545]">
              $0
            </span>
          </div>

          {/* ================= GRAPH ================= */}
          <div className="relative h-[355px] min-w-0 flex-1">
            {/* Grid */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-0 right-0 top-[10px] border-t border-dashed border-[#E7E7E7]" />

              <div className="absolute left-0 right-0 top-[50px] border-t border-dashed border-[#E7E7E7]" />

              <div className="absolute left-0 right-0 top-[90px] border-t border-dashed border-[#E7E7E7]" />

              <div className="absolute left-0 right-0 top-[130px] border-t border-dashed border-[#E7E7E7]" />

              <div className="absolute left-0 right-0 top-[170px] border-t border-dashed border-[#E7E7E7]" />
            </div>

            {/* ================= BARS ================= */}
            <div className="absolute inset-x-[20px] top-10 flex items-end justify-between gap-[12px]">
              {revenueData.map((item) => {
                const height = (item.value / maxValue) * 210;

                return (
                  <div
                    key={item.month}
                    className="flex h-full flex-1 items-end justify-center"
                  >
                    <div
                      className="
                        w-full
                        max-w-[50px]
                        rounded-t-[4px]
                        bg-gradient-to-b
                        from-[#C9B9F1]
                        via-[#9D85E0]
                        to-[#8060D9]
                      "
                      style={{
                        height: `${height}px`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= LEGEND ================= */}
        <div className="-mt-[80px] flex justify-end">
          <div className="flex items-center gap-[14px]">
            <span className="h-[4px] w-[29px] rounded-full bg-[#8865DF]" />

            <span className="text-[16px] font-medium leading-[20px] text-[#4B4B5C]">
              Revenue
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueOverviewChart;
