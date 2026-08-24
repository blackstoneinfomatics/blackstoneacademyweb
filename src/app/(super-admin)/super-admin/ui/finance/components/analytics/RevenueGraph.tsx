"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

// 1. Define API Response for Graph
interface GraphApiResponse {
  success: boolean;
  message: string;
  data: {
    view: string;
    year: number;
    data: Array<{
      month?: number;
      monthName?: string;
      year?: number;
      amount: number;
    }>;
  };
}

// 2. Define API Response for Counts (Right Boxes)
interface CountApiResponse {
  success: boolean;
  message: string;
  data: {
    summary: {
      totalCollectionRate: { value: number; trend: "UP" | "DOWN" };
      totalOverdueRate: { value: number; trend: "UP" | "DOWN" };
      netRevenue: { value: number };
    };
  };
}

// Helper to format numbers
const formatNumber = (num: number) => num.toLocaleString("en-IN");

// Helper to format currency with ₹
const formatCurrency = (num: number) => `₹${num.toLocaleString("en-IN")}`;

const RevenueOverview = () => {
  // ================= STATE FOR GRAPH =================
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("monthly");
  const [graphData, setGraphData] = useState<{ label: string; value: number }[]>([]);
  const [graphLoading, setGraphLoading] = useState(true);

  // ================= STATE FOR RIGHT BOXES =================
  const [cardData, setCardData] = useState({
    collectionRate: 0,
    overdueRate: 0,
    netRevenue: 0,
  });
  const [countLoading, setCountLoading] = useState(true);

  // ================= STATE FOR HOVER TOOLTIP =================
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number; label: string } | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // ================= FETCH GRAPH DATA (Real-time API) =================
  const fetchGraphData = async (view: string) => {
    try {
      setGraphLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append("view", view);

      const response = await axios.get<GraphApiResponse>(
        `http://localhost:5001/finance/dashboard/graph?${params.toString()}`
      );

      if (response.data.success) {
        const apiData = response.data.data;
        
        // Map API data to chart format (Handles both Monthly and Yearly)
        const mappedData = apiData.data.map((item) => {
          if (view === "monthly" || item.monthName) {
            return {
              label: item.monthName || `Month ${item.month}`,
              value: item.amount || 0,
            };
          } else {
            return {
              label: item.year?.toString() || "",
              value: item.amount || 0,
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

  // ================= FETCH COUNT DATA (RIGHT BOXES) =================
  useEffect(() => {
    const fetchCountData = async () => {
      try {
        setCountLoading(true);
        const response = await axios.get<CountApiResponse>(
          "http://localhost:5001/finance/analytics/count"
        );

        if (response.data.success) {
          const apiData = response.data.data;

          setCardData({
            collectionRate: apiData.summary.totalCollectionRate.value,
            overdueRate: apiData.summary.totalOverdueRate.value,
            netRevenue: apiData.summary.netRevenue.value,
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

  // ================= DYNAMIC DROPDOWN HANDLER =================
  const handleViewChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newView = e.target.value as "yearly" | "monthly";
    setViewMode(newView);
    await fetchGraphData(newView);
  };

  // ================= CHART CALCULATIONS =================
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

  // ================= HOVER HANDLERS =================
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

  const getTrendBadge = (isPositive: boolean, value: number) => {
    const sign = isPositive ? "+" : "-";
    return (
      <span
        className={`text-[10px] font-medium px-1.5 py-1 rounded-[3px] ${
          isPositive
            ? "text-[#3C8D48] bg-[#E4F2E5] dark:bg-[#294D32] dark:text-[#A7E3B0]"
            : "text-[#D34645] bg-[#FDEAEA] dark:bg-[#5A3030] dark:text-[#FFB4B4]"
        }`}
      >
        {sign}{Math.abs(value)}%
      </span>
    );
  };

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4 mt-4">
      {/* ================= LEFT : REVENUE GROWTH (DYNAMIC GRAPH) ================= */}
      <div className="bg-white dark:bg-[#343434] rounded-[18px] p-4 sm:p-5 shadow-sm min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-[#242424] dark:text-white">
            Revenue Growth
          </h2>

          {/* View Selector (No Year Dropdown) */}
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
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Vertical grid lines */}
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
                <div className="grid grid-cols-12 mt-[-3px]">
                  {graphData.map((item) => (
                    <span
                      key={item.label}
                      className="text-[9px] text-[#777] text-center dark:text-[#AEB6C5]"
                    >
                      {item.label}
                    </span>
                  ))}
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
                {countLoading ? "..." : formatNumber(cardData.collectionRate)}
              </span>

              <span className="text-[10px] font-medium text-[#3C8D48] bg-[#E4F2E5] px-1.5 py-1 rounded-[3px] dark:bg-[#294D32] dark:text-[#A7E3B0]">
                +14%
              </span>
            </div>
          </div>

          {/* Overdue */}
          <div className="bg-[#fafafa] border border-[#eeeeee] rounded-xl h-[100px] flex flex-col items-center justify-center dark:bg-[#3D3D3D] dark:border-[#505050]">
            <p className="text-[12px] text-[#777] font-medium mb-1 dark:text-[#B7B7B7]">
              TOTAL OVERDUE RATE
            </p>

            <div className="flex items-center gap-2">
              <span className="text-[25px] leading-none font-semibold text-[#292929] dark:text-white">
                {countLoading ? "..." : formatNumber(cardData.overdueRate)}
              </span>

              <span className="text-[10px] font-medium text-[#3C8D48] bg-[#E4F2E5] px-1.5 py-1 rounded-[3px] dark:bg-[#294D32] dark:text-[#A7E3B0]">
                +14%
              </span>
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
                {countLoading ? "..." : formatNumber(cardData.netRevenue)}
              </span>

              <span className="text-[10px] font-medium text-[#3C8D48] bg-[#E4F2E5] px-1.5 py-1 rounded-[3px] dark:bg-[#294D32] dark:text-[#A7E3B0]">
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