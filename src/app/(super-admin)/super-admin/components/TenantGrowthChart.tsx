"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronDown } from "lucide-react";

const data = [
  { year: "2016", value: 2000 },
  { year: "2017", value: 6000 },
  { year: "2018", value: 22000 },
  { year: "2019", value: 30000 },
  { year: "2020", value: 5000 },
  { year: "2021", value: 11000 },
  { year: "2022", value: 30000 },
  { year: "2023", value: 39000 },
];

export default function GrowthChart() {
  return (
    <div className="bg-white dark:bg-[#343434] rounded-2xl p-5 shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[22px] font-semibold text-[#1E293B] dark:text-white">
          Tenants Growth
        </h2>

        <button className="flex items-center gap-2 text-[13px] px-3 py-2 rounded-lg bg-[#F7F7F7] dark:bg-[#374151] text-[#64748B] dark:text-gray-300 transition-colors">
          Yearly
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Chart */}
      <div className="h-[246.5px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* UPDATED: Dark mode grid lines */}
            <CartesianGrid
              stroke="#F1F5F9"
              strokeDasharray="4 4"
              vertical={true}
              className="dark:stroke-[#4B5563]"
            />

            {/* UPDATED: Dark mode axis ticks */}
            <XAxis
              dataKey="year"
              tick={{
                fontSize: 12,
                fill: "#64748B",
              }}
              tickLine={false}
              axisLine={false}
              className="dark:[&_tspan]:fill-[#9CA3AF]"
            />

            <YAxis
              tick={{
                fontSize: 12,
                fill: "#64748B",
              }}
              tickFormatter={(v) => `${v / 1000}k`}
              tickLine={false}
              axisLine={false}
              className="dark:[&_tspan]:fill-[#9CA3AF]"
            />

            {/* UPDATED: Dark mode tooltip */}
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderColor: "#E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                color: "#111827",
              }}
              itemStyle={{
                color: "#22C55E",
              }}
              cursor={{ stroke: "#22C55E", strokeWidth: 1 }}
            />

            {/* UPDATED: Dark mode area fill opacity */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="#22C55E"
              strokeWidth={2}
              fill="url(#greenGradient)"
              className="dark:opacity-90"
              activeDot={{
                r: 5,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}