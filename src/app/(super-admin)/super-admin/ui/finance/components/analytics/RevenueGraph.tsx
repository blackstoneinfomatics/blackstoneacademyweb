"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface GraphApiResponse {
  success: boolean;
  message: string;
  data: {
    view: "monthly" | "yearly";
    year: number;
    data: Array<{
      month?: number;
      monthName?: string;
      year?: number;
      amount: number;
    }>;
  };
}

interface CountApiResponse {
  success: boolean;
  message: string;
  data: {
    summary: {
      totalCollectionRate: SummaryMetric;
      totalOverdueRate: SummaryMetric;
      netRevenue: SummaryMetric;
    };
  };
}

interface SummaryMetric {
  value: number;
  comparison: number;
  direction: "up" | "down" | "same";
}

// Helper to format numbers
const formatNumber = (num: number) => num.toLocaleString("en-IN");

// Helper to format currency with ₹
const formatCurrency = (num: number) => `₹${num.toLocaleString("en-IN")}`;

const RevenueOverview = () => {

  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("monthly");
  const [graphData, setGraphData] = useState<{ label: string; value: number }[]>([]);
  const [graphLoading, setGraphLoading] = useState(true);

  const [cardData, setCardData] = useState<{
    collectionRate: SummaryMetric;
    overdueRate: SummaryMetric;
    netRevenue: SummaryMetric;
  }>({
    collectionRate: { value: 0, comparison: 0, direction: "same" as const },
    overdueRate: { value: 0, comparison: 0, direction: "same" as const },
    netRevenue: { value: 0, comparison: 0, direction: "same" as const },
  });
  const [countLoading, setCountLoading] = useState(true);

  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number; label: string } | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const fetchGraphData = async (view: "monthly" | "yearly") => {
    try {
      setGraphLoading(true);

      const response = await axios.get<GraphApiResponse>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.FINANCE.GET_REVENUE_GRAPH}`,
        { params: { view } },
      );

      if (response.data.success) {
        const apiData = response.data.data;

        // Map API data to chart format (Handles both Monthly and Yearly)
        const mappedData = apiData.data.map((item) => {
          if (apiData.view === "monthly") {
            return {
              label: item.monthName || `Month ${item.month}`,
              value: item.amount ?? 0,
            };
          } else {
            return {
              label: item.year?.toString() || "",
              value: item.amount ?? 0,
            };
          }
        });

        setGraphData(mappedData);
      }
    } catch (error) {
      console.error("Failed to fetch graph data:", error);
    } finally {
      setGraphLoading(false);
    }
  };

  // Fetch graph on initial load
  useEffect(() => {
    fetchGraphData(viewMode);
  }, []);

  useEffect(() => {
    const fetchCountData = async () => {
      try {
        setCountLoading(true);
        const response = await axios.get<CountApiResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.FINANCE.GET_ANALYTICS_COUNT}`
        );

        if (response.data.success) {
          const apiData = response.data.data;

          setCardData({
            collectionRate: {
              value: apiData.summary.totalCollectionRate.value,
              comparison: apiData.summary.totalCollectionRate.comparison,
              direction: apiData.summary.totalCollectionRate.direction,
            },
            overdueRate: {
              value: apiData.summary.totalOverdueRate.value,
              comparison: apiData.summary.totalOverdueRate.comparison,
              direction: apiData.summary.totalOverdueRate.direction,
            },
            netRevenue: {
              value: apiData.summary.netRevenue.value,
              comparison: apiData.summary.netRevenue.comparison,
              direction: apiData.summary.netRevenue.direction,
            },
          });
        }
      } catch (error) {
        console.error("Failed to fetch count data:", error);
      } finally {
        setCountLoading(false);
      }
    };

    fetchCountData();
  }, []);

  const handleViewChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newView = e.target.value as "yearly" | "monthly";
    setViewMode(newView);
    await fetchGraphData(newView);
  };

const renderTrendBadge = (item: {
  value: number;
  comparison: number;
  direction: string;
}) => {
  const percentage = Math.abs(Number(item.comparison || 0));

  const isPositive = item.direction === "up";
  const isNegative = item.direction === "down";

  return (
    <span
      className={`text-[12px] px-2 py-1 rounded-md ${
        isPositive
          ? "text-green-600 bg-green-50"
          : isNegative
            ? "text-red-500 bg-red-50"
            : "text-gray-600 bg-gray-100"
      }`}
    >
      {isPositive ? "+" : isNegative ? "-" : ""}
      {percentage.toFixed(0)}%
    </span>
  );
};

  const chartWidth = 520;
  const chartHeight = 190;

  const maxValue = Math.max(...graphData.map((d) => d.value), 100000);

  const getX = (index: number) => (index / (graphData.length - 1)) * chartWidth;
  const getY = (value: number) => chartHeight - (value / maxValue) * chartHeight;

  const revenuePoints = graphData
    .map((item, index) => `${getX(index)},${getY(item.value)}`)
    .join(" ");

  const revenueAreaPoints = `
    0,${chartHeight}
    ${revenuePoints}
    ${chartWidth},${chartHeight}
  `;

  // Mini Chart
  const miniWidth = 540;
  const miniHeight = 75;
  const miniMax = 25000;

  const miniPoints = graphData.map((item, index) => {
    const x = (index / (graphData.length - 1)) * miniWidth;
    const y = miniHeight - (item.value / miniMax) * miniHeight;
    return `${x},${y}`;
  }).join(" ");

  const miniAreaPoints = `
    0,${miniHeight}
    ${miniPoints}
    ${miniWidth},${miniHeight}
  `;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!chartContainerRef.current || graphData.length === 0) return;

    const rect = chartContainerRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;

    const index = Math.round((relativeX / rect.width) * (graphData.length - 1));
    const clampedIndex = Math.max(0, Math.min(graphData.length - 1, index));

    const point = graphData[clampedIndex];

    setTooltip({
      x: relativeX,
      y: relativeY,
      value: point.value,
      label: point.label,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4 mt-4">
      <div className="bg-white dark:bg-[#343434] rounded-[18px] p-4 sm:p-5 shadow-sm min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-[#242424] dark:text-white">
            Revenue Growth
          </h2>

          <select
            value={viewMode}
            onChange={handleViewChange}
            className="bg-[#f3f3f3] px-3 py-1.5 text-[11px] text-[#666] rounded-md outline-none cursor-pointer dark:bg-[#454545] dark:text-[#D1D5DB]"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {/* Chart */}
        {graphLoading ? (
          <div className="flex items-center justify-center h-[205px]">
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        ) : (
          <div
            className="w-full overflow-hidden relative"
            ref={chartContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex">
              {/* Y Axis */}
              <div className="w-[42px] shrink-0 h-[205px] flex flex-col justify-between pt-1 pb-[18px]">
                <span className="text-[9px] text-[#777] dark:text-[#AEB6C5]">
                  {formatNumber(maxValue)}k
                </span>
                <span className="text-[9px] text-[#777] dark:text-[#AEB6C5]">
                  {formatNumber(maxValue / 2)}k
                </span>
                <span className="text-[9px] text-[#777] dark:text-[#AEB6C5]">
                  {formatNumber(maxValue / 5)}k
                </span>
                <span className="text-[9px] text-[#777] dark:text-[#AEB6C5]">
                  {formatNumber(maxValue / 10)}k
                </span>
                <span className="text-[9px] text-[#777] dark:text-[#AEB6C5]">
                  0
                </span>
              </div>

              {/* Graph */}
              <div className="flex-1 min-w-0">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
                  className="w-full h-[205px] text-[#eeeeee] dark:text-[#555555]"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#75C98D" stopOpacity="0.72" />
                      <stop offset="100%" stopColor="#2F5A3A" stopOpacity="0.25" />
                    </linearGradient>
                  </defs>

                  {[0, 1, 2, 3, 4].map((line) => {
                    const y = (chartHeight / 4) * line;

                    return (
                      <line
                        key={line}
                        x1="0"
                        y1={y}
                        x2={chartWidth}
                        y2={y}
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {graphData.map((_, index) => {
                    const x = getX(index);
                    return (
                      <line
                        key={index}
                        x1={x}
                        y1="0"
                        x2={x}
                        y2={chartHeight}
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Area */}
                  <polygon points={revenueAreaPoints} fill="url(#revenueGradient)" />

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
                  <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="currentColor" />
                </svg>

                {/* X Axis */}
<div className="relative h-[18px] mt-[-3px] w-full">
  {graphData.map((item, index) => {
    const left = getX(index);

    const isFirst = index === 0;
    const isLast = index === graphData.length - 1;

    return (
      <span
        key={item.label}
        className="absolute text-[9px] text-[#777] dark:text-[#AEB6C5] whitespace-nowrap"
        style={{
          left: `${(left / chartWidth) * 100}%`,
          transform: isFirst
            ? "translateX(0)"
            : isLast
              ? "translateX(-100%)"
              : "translateX(-50%)",
        }}
      >
        {item.label}
      </span>
    );
  })}
</div>
              </div>
            </div>

            {/* Custom Hover Tooltip */}
            {tooltip && (
              <div
                className="absolute z-10 bg-white dark:bg-[#2c2c2c] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg pointer-events-none"
                style={{
                  left: tooltip.x,
                  top: tooltip.y - 50,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <p className="text-[10px] font-medium text-[#777] dark:text-[#B7B7B7]">
                  {tooltip.label}
                </p>
                <p className="text-sm font-semibold text-[#292929] dark:text-white">
                  {formatCurrency(tooltip.value)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= RIGHT : COLLECTION / REVENUE (STATIC COUNT API) ================= */}
      <div className="bg-white dark:bg-[#343434] rounded-[18px] p-2 sm:p-4 shadow-sm min-w-0">
        {/* Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
          {/* Collection */}
          <div className="bg-[#fafafa] border border-[#eeeeee] rounded-xl h-[100px] flex flex-col items-center justify-center dark:bg-[#3D3D3D] dark:border-[#505050]">
            <p className="text-[12px] text-[#777] font-medium mb-1 dark:text-[#B7B7B7]">
              TOTAL COLLECTION RATE
            </p>

            <div className="flex items-center gap-2">
              <span className="text-[25px] leading-none font-semibold text-[#292929] dark:text-white">
                {countLoading
                  ? "..."
                  : `${formatNumber(cardData.collectionRate.value)}%`}
              </span>

              {renderTrendBadge(cardData.collectionRate)}
            </div>
          </div>

          {/* Overdue */}
          <div className="bg-[#fafafa] border border-[#eeeeee] rounded-xl h-[100px] flex flex-col items-center justify-center dark:bg-[#3D3D3D] dark:border-[#505050]">
            <p className="text-[12px] text-[#777] font-medium mb-1 dark:text-[#B7B7B7]">
              TOTAL OVERDUE RATE
            </p>

            <div className="flex items-center gap-2">
              <span className="text-[25px] leading-none font-semibold text-[#292929] dark:text-white">
                {countLoading
                  ? "..."
                  : `${formatNumber(cardData.overdueRate.value)}%`}
              </span>

              {renderTrendBadge(cardData.overdueRate, "DOWN")}
            </div>
          </div>
        </div>

        {/* Net Revenue */}
        <div className="relative h-[155px] overflow-hidden rounded-xl border border-[#F0EEFF] bg-gradient-to-b from-[#F4F2FF] to-[#F9F8FF] dark:border-[#4B4B5A] dark:from-[#3B3A52] dark:to-[#302F42]">
          {/* Heading */}
          <div className="relative z-10 flex flex-col items-center pt-6">
            <p className="text-[12px] text-[#777] font-medium mb-1 dark:text-[#B7B7B7]">
              NET REVENUE
            </p>

            <div className="flex items-center gap-2">
              <span className="text-[25px] leading-none font-semibold text-[#292929] dark:text-white">
                {countLoading ? "..." : formatNumber(cardData.netRevenue.value)}
              </span>

              {renderTrendBadge(cardData.netRevenue)}
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
                <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#827BD1" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#454267" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Area */}
              <polygon points={miniAreaPoints} fill="url(#miniGradient)" />

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