"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  { year: "2016", value: 5000 },
  { year: "2017", value: 8000 },
  { year: "2018", value: 30000 },
  { year: "2019", value: 50000 },
  { year: "2020", value: 5000 },
  { year: "2021", value: 12000 },
  { year: "2022", value: 50000 },
  { year: "2023", value: 95000 },
];

const SubscriptionGrowth = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm px-4 py-2 w-full h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 mt-3">
        <h2 className="text-[18px] px-3 font-semibold text-gray-900">
          Subscription Growth
        </h2>

        <select className="bg-gray-100 text-gray-500 px-2 py-1 rounded-md outline-none text-xs">
          <option>Yearly</option>
        </select>
      </div>

      {/* Chart */}
      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#E5E7EB" vertical={true} />
            <XAxis
              dataKey="year"
              tick={{ fill: "#6B7280", fontSize: 14 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) =>
                value >= 1000 ? `${value / 1000}k` : value
              }
              tick={{ fill: "#6B7280", fontSize: 14 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#22C55E"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="url(#greenFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SubscriptionGrowth;