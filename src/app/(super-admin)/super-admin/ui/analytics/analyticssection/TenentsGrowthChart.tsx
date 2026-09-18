"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Period = "daily" | "weekly" | "monthly" | "yearly";

interface GrowthPoint {
  month: string;
  total: number;
  active: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    period: string;
    startDate: string;
    endDate: string;
    data: GrowthPoint[];
  };
}

// ─────────────────────────────────────────────
// Endpoint
// ─────────────────────────────────────────────
const API_URL = "http://localhost:5001/analytics/tenants-growth";

const PERIOD_LABELS: Record<Period, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

// ─────────────────────────────────────────────
// Fallback series
// ─────────────────────────────────────────────
const buildEmptySeries = (period: Period): GrowthPoint[] => {
  const now = new Date();
  const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  switch (period) {
    case "daily":
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        return {
          month: `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}`,
          total: 0,
          active: 0,
        };
      });
    case "weekly":
      return Array.from({ length: 4 }, (_, i) => ({
        month: `W${i + 1}`,
        total: 0,
        active: 0,
      }));
    case "yearly": {
      const year = now.getFullYear();
      return Array.from({ length: 5 }, (_, i) => ({
        month: `${year - 4 + i}`,
        total: 0,
        active: 0,
      }));
    }
    case "monthly":
    default:
      return Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now);
        d.setMonth(d.getMonth() - (11 - i));
        return {
          month: MONTHS[d.getMonth()],
          total: 0,
          active: 0,
        };
      });
  }
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const TenentsGrowthChart = () => {
  const [period, setPeriod] = useState<Period>("yearly");
  const [chartData, setChartData] = useState<GrowthPoint[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Fetch whenever period changes ──
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_URL}?period=${period}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ApiResponse = await res.json();

        if (!cancelled) {
          if (
            json.success &&
            Array.isArray(json.data.data) &&
            json.data.data.length > 0
          ) {
            setChartData(json.data.data);
          } else {
            setChartData([]);
          }
        }
      } catch {
        if (!cancelled) setChartData([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [period]);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasRealData = chartData.length > 0;
  const renderData = hasRealData ? chartData : buildEmptySeries(period);

  return (
    <div className="w-full h-[350px] rounded-[16px] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] dark:bg-[#343434] dark:shadow-none dark:border dark:border-[#454545]">
      {/* Header */}
      <div className="mb-[10px] flex items-center justify-between">
        <h2 className="text-[16px] font-semibold leading-[20px] tracking-[-0.3px] text-[#18181B] dark:text-white">
          Tenants Growth
        </h2>

        {/* Period dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex h-full items-center gap-[8px] rounded-[4px] bg-[#F3F3F3] px-[10px] py-[3px] text-[12px] font-medium text-[#777777] hover:bg-[#EAEAEA] dark:bg-[#454545] dark:text-gray-300 dark:hover:bg-[#505050]"
          >
            {PERIOD_LABELS[period]}
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
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

          {dropdownOpen && (
            <div className="absolute right-0 z-20 mt-[4px] w-[92px] overflow-hidden rounded-[4px] border border-[#E5E5E5] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:border-[#454545] dark:bg-[#3A3A3A] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
              {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => {
                const isActive = period === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPeriod(p);
                      setDropdownOpen(false);
                    }}
                    className={`block w-full px-[10px] py-[6px] text-left text-[12px] font-medium transition-colors ${isActive
                      ? "bg-[#F3F3F3] text-[#797979] dark:bg-[#505050] dark:text-gray-200"
                      : "text-[#797979] hover:bg-[#F7F7F7] dark:text-gray-300 dark:hover:bg-[#454545]"
                      }`}
                  >
                    {PERIOD_LABELS[p]}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[225px] w-full mt-6 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={renderData}
            margin={{ top: 6, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              horizontal={true}
              vertical={false}
              stroke="#E8E8EF"
              strokeWidth={1}
              className="dark:opacity-30"
            />

            <XAxis dataKey="month" hide />

            <YAxis
              domain={[0, 25000]}
              ticks={[0, 5000, 10000, 15000, 20000, 25000]}
              tickFormatter={(value) => {
                if (value === 0) return "0";
                return `${value / 1000}K`;
              }}
              axisLine={{ stroke: "#D0D0DD", strokeWidth: 1 }}
              tickLine={false}
              tick={{
                fill: "#777789",
                fontSize: 12,
                fontWeight: 400,
              }}
              width={51}
              className="dark:[&_.recharts-cartesian-axis-tick-value]:fill-gray-400 dark:[&_.recharts-cartesian-axis-line]:stroke-[#555]"
            />

            <XAxis
              dataKey="month"
              axisLine={{ stroke: "#D0D0DD", strokeWidth: 1 }}
              tickLine={false}
              tick={false}
              height={1}
              className="dark:[&_.recharts-cartesian-axis-line]:stroke-[#555]"
            />

            <Line
              type="monotone"
              dataKey="total"
              stroke="#797979"
              strokeWidth={2}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />

            <Line
              type="monotone"
              dataKey="active"
              stroke="#cec9c9ff"
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
      <div className="mt-[10px] flex items-center justify-center gap-[22px]">
        <div className="flex items-center gap-[9px]">
          <svg width="28" height="8" viewBox="0 0 28 8">
            <line
              x1="1"
              y1="4"
              x2="27"
              y2="4"
              stroke="#797979"
              strokeWidth="2"
            />
          </svg>
          <span className="text-[12px] font-medium leading-[16px] text-[#4B4B5C] dark:text-gray-300">
            Total Tenants
          </span>
        </div>

        <div className="flex items-center gap-[9px]">
          <svg width="28" height="8" viewBox="0 0 28 8">
            <line
              x1="1"
              y1="4"
              x2="27"
              y2="4"
              stroke="#cec9c9ff"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
          </svg>
          <span className="text-[12px] font-medium leading-[16px] text-[#4B4B5C] dark:text-gray-300">
            Active Tenants
          </span>
        </div>
      </div>
    </div>
  );
};

export default TenentsGrowthChart;