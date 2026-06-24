"use client";
import React from "react";
import { PieChart, Pie, Cell, Line, ResponsiveContainer } from "recharts";

const data = [
  { name: "Female", value: 40, color: "#FF92DD" }, // Pink for Female
  { name: "Male", value: 60, color: "#00C3FF" }, // Blue for Male
];

const GaugeChart = () => {
  const needleValue = 40; // Adjust needle based on percentage

  const cx = 90; // Center X (Adjusted for new size)
  const cy = 90; // Center Y
  const needleLength = 35; // Adjusted needle length
  const angle = (needleValue / 100) * 180; // Rotate needle based on percentage

  return (
    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 h-[250px] w-[300px]">
      {/* Title */}
      <h2 className="text-lg font-semibold  text-gray-700">
        Gender</h2>

      {/* Chart Container */}
      <div className="flex flex-col items-center">
        <ResponsiveContainer width={180} height={130}>
          <PieChart>
            {/* Semi-circle Gauge */}
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={90}
              fill="#ccc"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>

            {/* Needle */}
            <Line
              x1={cx}
              y1={cy}
              x2={cx + needleLength * Math.cos((angle * Math.PI) / 180)}
              y2={cy - needleLength * Math.sin((angle * Math.PI) / 180)}
              stroke="black"
              strokeWidth={2}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Percentage Labels */}
        <div className="flex justify-between w-full px-6 mt-2 text-gray-700">
          {/* Female Section */}
          <div className="flex flex-col items-center">
            <span className="text-sm font-semibold">40%</span>
            <span className="text-xs">Female</span>
            <div className="w-8 h-1 bg-pink-400 mt-1"></div>
          </div>

          {/* Male Section */}
          <div className="flex flex-col items-center">
            <span className="text-sm font-semibold">60%</span>
            <span className="text-xs">Male</span>
            <div className="w-8 h-1 bg-blue-400 mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GaugeChart;
