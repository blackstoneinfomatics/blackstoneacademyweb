"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Period = "weekly" | "monthly" | "yearly";

interface TenantGrowthPoint {
  date: string;
  totalTenants: number;
  activeTenants: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    period: Period;
    startDate: string;
    endDate: string;
    data: TenantGrowthPoint[];
  };
}

interface ChartPoint {
  label: string;
  total: number;
  active: number;
}

const PERIOD_LABELS: Record<Period, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const formatLabel = (date: string, period: Period): string => {
  if (period === "yearly") {
    const [, month] = date.split("-");
    return MONTH_LABELS[Number(month) - 1] ?? date;
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

const buildChartPoints = (
  points: TenantGrowthPoint[],
  period: Period,
): ChartPoint[] =>
  points.map((point) => ({
    label: formatLabel(point.date, period),
    total: point.totalTenants ?? 0,
    active: point.activeTenants ?? 0,
  }));

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const TenentsGrowthChart = () => {
  const [period, setPeriod] = useState<Period>("monthly");
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Fetch whenever period changes ──
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const response = await axios.get<ApiResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ANALYTICS.TENANTS_GROWTH}`,
          { params: { period }, signal: controller.signal },
        );

        if (response.data.success) {
          const resolvedPeriod = response.data.data.period ?? period;
          setChartData(buildChartPoints(response.data.data.data ?? [], resolvedPeriod));
        } else {
          setChartData([]);
        }
      } catch (error) {
        if (axios.isCancel(error)) return;
        setChartData([]);
      }
    })();

    return () => controller.abort();
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
            data={chartData}
            margin={{ top: 6, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              horizontal={true}
              vertical={false}
              stroke="#E8E8EF"
              strokeWidth={1}
              className="dark:opacity-30"
            />

            <XAxis
              dataKey="label"
              axisLine={{ stroke: "#D0D0DD", strokeWidth: 1 }}
              tickLine={false}
              tick={{ fill: "#777789", fontSize: 12, fontWeight: 400 }}
              className="dark:[&_.recharts-cartesian-axis-tick-value]:fill-gray-400 dark:[&_.recharts-cartesian-axis-line]:stroke-[#555]"
            />

            <YAxis
              allowDecimals={false}
              domain={[0, "auto"]}
              axisLine={{ stroke: "#D0D0DD", strokeWidth: 1 }}
              tickLine={false}
              tick={{
                fill: "#777789",
                fontSize: 12,
                fontWeight: 400,
              }}
              width={40}
              className="dark:[&_.recharts-cartesian-axis-tick-value]:fill-gray-400 dark:[&_.recharts-cartesian-axis-line]:stroke-[#555]"
            />

            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E5E7EB",
                fontSize: 12,
              }}
            />

            <Line
              type="monotone"
              dataKey="total"
              name="Total Tenants"
              stroke="#4648d4"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />

            <Line
              type="monotone"
              dataKey="active"
              name="Active Tenants"
              stroke="#0058be"
              strokeWidth={2}
              strokeDasharray="7 5"
              dot={false}
              activeDot={{ r: 4 }}
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
              stroke="#4648d4"
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
              stroke="#0058be"
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
