"use client";

import React from "react";

const revenueData = [
  { year: "2016", value: 7000 },
  { year: "2017", value: 11000 },
  { year: "2018", value: 28000 },
  { year: "2019", value: 52000 },
  { year: "2020", value: 8000 },
  { year: "2021", value: 12000 },
  { year: "2022", value: 52000 },
  { year: "2023", value: 95000 },
];

const netRevenueData = [
  2000, 22000, 9000, 15000, 7000, 13000, 10000, 17000,
  7000, 11000, 9000, 14000, 10000, 13000, 8000, 12000,
  7000, 5000, 10000, 9000, 15000, 12000, 14000, 7000,
  9000, 12000, 10000, 15000, 11000, 12000, 9000, 10000,
];

const RevenueOverview = () => {
  const chartWidth = 520;
  const chartHeight = 190;

  const maxValue = 100000;

  const getX = (index: number) =>
    (index / (revenueData.length - 1)) * chartWidth;

  const getY = (value: number) =>
    chartHeight - (value / maxValue) * chartHeight;

  const revenuePoints = revenueData
    .map((item, index) => `${getX(index)},${getY(item.value)}`)
    .join(" ");

  const revenueAreaPoints = `
    0,${chartHeight}
    ${revenuePoints}
    ${chartWidth},${chartHeight}
  `;

  const miniWidth = 540;
  const miniHeight = 75;
  const miniMax = 25000;

  const miniPoints = netRevenueData
    .map((value, index) => {
      const x =
        (index / (netRevenueData.length - 1)) * miniWidth;

      const y =
        miniHeight - (value / miniMax) * miniHeight;

      return `${x},${y}`;
    })
    .join(" ");

  const miniAreaPoints = `
    0,${miniHeight}
    ${miniPoints}
    ${miniWidth},${miniHeight}
  `;

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4 mt-4">
      {/* ================= LEFT : REVENUE GROWTH ================= */}
      <div className="bg-white rounded-[18px] p-4 sm:p-5 shadow-sm min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-[#242424]">
            Revenue Growth
          </h2>

          <button className="flex items-center gap-2 bg-[#f3f3f3] hover:bg-[#eaeaea] transition px-3 py-1.5 rounded-md text-[11px] text-[#666]">
            Yearly

            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
            >
              <path
                d="M1 1L5 5L9 1"
                stroke="#777"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Chart */}
        <div className="w-full overflow-hidden">
          <div className="flex">
            {/* Y Axis */}
            <div className="w-[42px] shrink-0 h-[205px] flex flex-col justify-between pt-1 pb-[18px]">
              <span className="text-[9px] text-[#777]">100k</span>
              <span className="text-[9px] text-[#777]">50k</span>
              <span className="text-[9px] text-[#777]">20k</span>
              <span className="text-[9px] text-[#777]">10k</span>
              <span className="text-[9px] text-[#777]">0</span>
            </div>

            {/* Graph */}
            <div className="flex-1 min-w-0">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
                className="w-full h-[205px]"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#A9DDB8"
                      stopOpacity="0.72"
                    />

                    <stop
                      offset="100%"
                      stopColor="#DFF3E5"
                      stopOpacity="0.25"
                    />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                {[0, 1, 2, 3, 4].map((line) => {
                  const y = (chartHeight / 4) * line;

                  return (
                    <line
                      key={line}
                      x1="0"
                      y1={y}
                      x2={chartWidth}
                      y2={y}
                      stroke="#eeeeee"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Vertical grid lines */}
                {revenueData.map((_, index) => {
                  const x = getX(index);

                  return (
                    <line
                      key={index}
                      x1={x}
                      y1="0"
                      x2={x}
                      y2={chartHeight}
                      stroke="#f0f0f0"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Area */}
                <polygon
                  points={revenueAreaPoints}
                  fill="url(#revenueGradient)"
                />

                {/* Revenue dotted line */}
                <polyline
                  points={revenuePoints}
                  fill="none"
                  stroke="#55B875"
                  strokeWidth="1.4"
                  strokeDasharray="2 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Bottom axis */}
                <line
                  x1="0"
                  y1={chartHeight}
                  x2={chartWidth}
                  y2={chartHeight}
                  stroke="#eeeeee"
                />
              </svg>

              {/* X Axis */}
              <div className="grid grid-cols-8 mt-[-3px]">
                {revenueData.map((item) => (
                  <span
                    key={item.year}
                    className="text-[9px] text-[#777] text-center"
                  >
                    {item.year}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT : COLLECTION / REVENUE ================= */}
      <div className="bg-white rounded-[18px] p-4 sm:p-5 shadow-sm min-w-0">
        {/* Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
          {/* Collection */}
          <div className="bg-[#fafafa] border border-[#eeeeee] rounded-md h-[100px] flex flex-col items-center justify-center">
            <p className="text-[12px] text-[#777] font-medium mb-1">
              TOTAL COLLECTION RATE
            </p>

            <div className="flex items-center gap-2">
              <span className="text-[25px] leading-none font-semibold text-[#292929]">
                1,50,000
              </span>

              <span className="text-[10px] font-medium text-[#3C8D48] bg-[#E4F2E5] px-1.5 py-1 rounded-[3px]">
                +14%
              </span>
            </div>
          </div>

          {/* Overdue */}
          <div className="bg-[#fafafa] border border-[#eeeeee] rounded-md h-[100px] flex flex-col items-center justify-center">
            <p className="text-[12px] text-[#777] font-medium mb-1">
              TOTAL OVERDUE RATE
            </p>

            <div className="flex items-center gap-2">
              <span className="text-[25px] leading-none font-semibold text-[#292929]">
                2,00,000
              </span>

              <span className="text-[10px] font-medium text-[#3C8D48] bg-[#E4F2E5] px-1.5 py-1 rounded-[3px]">
                +14%
              </span>
            </div>
          </div>
        </div>

        {/* Net Revenue */}
        <div className="relative h-[155px] overflow-hidden rounded-md bg-gradient-to-b from-[#F4F2FF] to-[#F9F8FF] border border-[#F0EEFF]">
          {/* Heading */}
          <div className="relative z-10 flex flex-col items-center pt-6">
            <p className="text-[12px] text-[#777] font-medium mb-1">
              NET REVENUE
            </p>

            <div className="flex items-center gap-2">
              <span className="text-[25px] leading-none font-semibold text-[#292929]">
                50,00,000
              </span>

              <span className="text-[10px] font-medium text-[#3C8D48] bg-[#E4F2E5] px-1.5 py-1 rounded-[3px]">
                +3.4%
              </span>
            </div>
          </div>

          {/* Mini Area Chart */}
          <div className="absolute bottom-0 left-0 right-0 h-[82px]">
            <svg
              viewBox={`0 0 ${miniWidth} ${miniHeight}`}
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              <defs>
                <linearGradient
                  id="miniGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#C6C1F5"
                    stopOpacity="0.45"
                  />

                  <stop
                    offset="100%"
                    stopColor="#E9E7FF"
                    stopOpacity="0.2"
                  />
                </linearGradient>
              </defs>

              {/* Area */}
              <polygon
                points={miniAreaPoints}
                fill="url(#miniGradient)"
              />

              {/* Line */}
              <polyline
                points={miniPoints}
                fill="none"
                stroke="#9B93F5"
                strokeWidth="1"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueOverview;