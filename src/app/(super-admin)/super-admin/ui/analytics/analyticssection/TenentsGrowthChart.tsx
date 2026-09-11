"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", total: 10000, active: 5800 },
  { month: "Feb", total: 11200, active: 7200 },
  { month: "Mar", total: 12500, active: 8500 },
  { month: "Apr", total: 14500, active: 9400 },
  { month: "May", total: 15500, active: 10700 },
  { month: "Jun", total: 18000, active: 11700 },
  { month: "Jul", total: 19700, active: 12700 },
];

const TenentsGrowthChart = () => {
  return (
    <div className="w-full rounded-[16px] bg-white px-[16px] pt-[17px] pb-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      {/* Header */}
      <div className="mb-[10px] flex items-center justify-between">
        <h2 className="text-[16px] font-semibold leading-[20px] tracking-[-0.3px] text-[#18181B]">
          Tenants Growth
        </h2>

        <button
          type="button"
          className="flex h-full items-center gap-[8px] rounded-[4px] bg-[#F3F3F3] px-[10px] py-[3px] text-[12px] font-medium text-[#777777]"
        >
          Yearly
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 10L12 15L17 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Chart */}
      <div className="h-[205px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 6,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid
              horizontal={true}
              vertical={false}
              stroke="#E8E8EF"
              strokeWidth={1}
            />

            <XAxis dataKey="month" hide />

            <YAxis
              domain={[0, 25000]}
              ticks={[0, 5000, 10000, 15000, 20000, 25000]}
              tickFormatter={(value) => {
                if (value === 0) return "0";
                return `${value / 1000}K`;
              }}
              axisLine={{
                stroke: "#D0D0DD",
                strokeWidth: 1,
              }}
              tickLine={false}
              tick={{
                fill: "#777789",
                fontSize: 12,
                fontWeight: 400,
              }}
              width={51}
            />

            {/* Total Tenants */}
            <Line
              type="linear"
              dataKey="total"
              stroke="#4A43D8"
              strokeWidth={2}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />

            {/* Active Tenants */}
            <Line
              type="linear"
              dataKey="active"
              stroke="#0866C9"
              strokeWidth={2}
              strokeDasharray="7 5"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-[1px] flex items-center justify-center gap-[22px]">
        {/* Total */}
        <div className="flex items-center gap-[9px]">
          <svg width="28" height="8" viewBox="0 0 28 8">
            <line
              x1="1"
              y1="4"
              x2="27"
              y2="4"
              stroke="#4A43D8"
              strokeWidth="2"
            />
          </svg>

          <span className="text-[12px] font-medium leading-[16px] text-[#4B4B5C]">
            Total Tenants
          </span>
        </div>

        {/* Active */}
        <div className="flex items-center gap-[9px]">
          <svg width="28" height="8" viewBox="0 0 28 8">
            <line
              x1="1"
              y1="4"
              x2="27"
              y2="4"
              stroke="#0866C9"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
          </svg>

          <span className="text-[12px] font-medium leading-[16px] text-[#4B4B5C]">
            Active Tenants
          </span>
        </div>
      </div>
    </div>
  );
};

export default TenentsGrowthChart;
