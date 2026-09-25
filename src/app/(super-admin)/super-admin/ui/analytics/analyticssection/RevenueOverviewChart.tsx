"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Period = "weekly" | "monthly";

interface RevenuePoint {
  label: string;      // short label for X-axis
  fullLabel: string;  // full name for tooltip
  value: number;
}

interface MonthlyRow {
  month: string;
  monthNumber: number;
  revenue: number;
}

interface WeeklyRow {
  date: string;
  day: string;
  revenue: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    period: string;
    year?: number;
    startDate?: string;
    endDate?: string;
    totalRevenue: number;
    revenue: MonthlyRow[] | WeeklyRow[];
  };
}

// ─────────────────────────────────────────────
// Endpoint
// ─────────────────────────────────────────────
const PERIOD_LABELS: Record<Period, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
};

// ─────────────────────────────────────────────
// Layout constants
// ─────────────────────────────────────────────
const CARD_HEIGHT = 350;
const GRID_LINES = 5;
const FIRST_GRID_TOP = 4;
const GRID_STEP = 44;
const BASELINE_TOP = FIRST_GRID_TOP + (GRID_LINES - 1) * GRID_STEP;
const CHART_HEIGHT = BASELINE_TOP + 6;

// ─────────────────────────────────────────────
// Compute Y-axis max = 2 × highest value
// ─────────────────────────────────────────────
const computeYMax = (maxValue: number): number => {
  if (maxValue <= 0) return 1000;
  const target = maxValue * 2;
  const niceSteps = [
    1000, 2000, 2500, 5000, 10000, 20000, 25000, 50000, 100000, 200000, 250000,
    500000, 1000000,
  ];
  return (
    niceSteps.find((s) => s >= target) ??
    Math.ceil(target / 100000) * 100000
  );
};

const formatYLabel = (value: number): string => {
  if (value === 0) return "0";
  if (value >= 100000) {
    const lakhs = value / 100000;
    return `${Number.isInteger(lakhs) ? lakhs : lakhs.toFixed(2)}L`;
  }
  if (value >= 1000) {
    const k = value / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}K`;
  }
  return `${value}`;
};

/** Format ₹ values for tooltips */
const formatCurrency = (value: number): string => {
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// ─────────────────────────────────────────────
// Normalize API → chart points
// ─────────────────────────────────────────────
const normalizeData = (json: ApiResponse, period: Period): RevenuePoint[] => {
  const rows = json.data.revenue;
  if (!Array.isArray(rows) || rows.length === 0) return [];

  if (period === "monthly") {
    return (rows as MonthlyRow[]).map((r) => ({
      label: r.month.charAt(0).toUpperCase(), // ✅ first letter only (J, F, M, A, ...)
      fullLabel: r.month,
      value: r.revenue ?? 0,
    }));
  }

  // weekly — keep 3-letter day
  return (rows as WeeklyRow[]).map((r) => ({
    label: r.day,
    fullLabel: r.day,
    value: r.revenue ?? 0,
  }));
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const RevenueOverviewChart = () => {
  const [period, setPeriod] = useState<Period>("monthly");
  const [chartData, setChartData] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Fetch when period changes ──
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ANALYTICS.REVENUE_OVERVIEW}?period=${period}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ApiResponse = await res.json();

        if (!cancelled && json.success) {
          setChartData(normalizeData(json, period));
        }
      } catch {
        if (!cancelled) setChartData([]);
      } finally {
        if (!cancelled) setLoading(false);
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

  // ── Y-axis ──
  const yMax = useMemo(() => {
    const highest = Math.max(...chartData.map((d) => d.value), 0);
    return computeYMax(highest);
  }, [chartData]);

  const yTicks = useMemo(() => {
    return [0, 1, 2, 3, 4].map((i) => Math.round((yMax * i) / 4));
  }, [yMax]);

  const plotHeight = BASELINE_TOP - FIRST_GRID_TOP;
  const barCount = chartData.length || 1;
  const barGap = barCount > 8 ? 6 : 10;

  return (
    <div
      className="w-full rounded-[20px] bg-white px-[24px] pt-[22px] pb-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col dark:bg-[#343434] dark:shadow-none dark:border dark:border-[#454545]"
      style={{ height: CARD_HEIGHT }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-[16px] font-semibold leading-[24px] tracking-[-0.5px] text-[#18181B] dark:text-white">
          Revenue Overview
        </h2>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-[14px] rounded-[6px] bg-[#F0F0F0] px-[11px] py-[4px] text-[12px] font-medium text-[#737373] hover:bg-[#EAEAEA] dark:bg-[#454545] dark:text-gray-300 dark:hover:bg-[#505050]"
          >
            {PERIOD_LABELS[period]}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            >
              <path
                d="M3 5L7 9L11 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 z-20 mt-1 w-[110px] overflow-hidden rounded-[6px] border border-[#E5E5E5] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:border-[#454545] dark:bg-[#3A3A3A] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
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
                    className={`block w-full px-3 py-2 text-left text-[12px] font-medium transition-colors ${isActive
                      ? "bg-[#F0F0F0] text-[#8865DF] dark:bg-[#505050] dark:text-purple-300"
                      : "text-[#737373] hover:bg-[#F7F7F7] dark:text-gray-300 dark:hover:bg-[#454545]"
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

      {/* CHART */}
      <div className="flex-1 min-h-0 mt-[14px] mb-[14px] flex flex-col justify-center">
        <div className="flex">
          {/* Y AXIS */}
          <div
            className="relative w-[58px] shrink-0"
            style={{ height: CHART_HEIGHT }}
          >
            {[...yTicks].reverse().map((tick, i) => (
              <span
                key={i}
                className="absolute left-0 text-[12px] font-normal text-[#454545] dark:text-gray-400"
                style={{ top: `${FIRST_GRID_TOP + i * GRID_STEP - 7}px` }}
              >
                {formatYLabel(tick)}
              </span>
            ))}
          </div>

          {/* GRAPH */}
          <div
            className="relative min-w-0 flex-1"
            style={{ height: CHART_HEIGHT }}
          >
            {/* Grid */}
            <div className="pointer-events-none absolute inset-0">
              {Array.from({ length: GRID_LINES }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 border-t border-dashed border-[#E7E7E7] dark:border-[#4A4A4A]"
                  style={{ top: `${FIRST_GRID_TOP + i * GRID_STEP}px` }}
                />
              ))}
            </div>

            {/* Bars — anchored to bottom, grow upward */}
            <div
              className="absolute inset-x-[10px] flex items-end justify-between"
              style={{
                top: FIRST_GRID_TOP,
                height: plotHeight,
                gap: `${barGap}px`,
              }}
            >
              {!loading &&
                chartData.map((item, i) => {
                  const ratio = yMax > 0 ? item.value / yMax : 0;
                  const height = Math.max(ratio * plotHeight, 2);
                  const isHovered = hoveredIndex === i;

                  return (
                    <div
                      key={`${item.label}-${i}`}
                      className="relative flex h-full min-w-0 flex-1 items-end justify-center"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* ✅ Tooltip above bar */}
                      {isHovered && (
                        <div
                          className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#ffffff] px-2 py-1 text-[10px] font-semibold text-[#8465da] shadow-md dark:bg-[#0F0F0F]"
                          style={{ bottom: `${height + 6}px` }}
                        >
                          {formatCurrency(item.value)}
                          {/* small arrow */}
                          <span className="absolute left-1/2 top-full -translate-x-1/2 border-[4px] border-transparent border-t-[#8465da] dark:border-t-[#8465da]" />
                        </div>
                      )}

                      <div
                        className={`w-full max-w-[36px] rounded-t-[4px] bg-gradient-to-b from-[#C9B9F1] via-[#9D85E0] to-[#8060D9] transition-opacity ${isHovered ? "opacity-90" : "opacity-100"
                          }`}
                        style={{ height: `${height}px` }}
                      />
                    </div>
                  );
                })}
            </div>

            {/* X labels */}
            <div
              className="absolute inset-x-[10px] flex justify-between"
              style={{
                top: BASELINE_TOP + 6,
                gap: `${barGap}px`,
              }}
            >
              {chartData.map((item, i) => (
                <div
                  key={`${item.label}-label-${i}`}
                  className="min-w-0 flex-1 overflow-hidden text-center"
                >
                  <span className="block truncate text-[11px] font-normal text-[#737373] dark:text-gray-400">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LEGEND */}
      <div className="shrink-0 flex justify-end">
        <div className="flex items-center gap-[10px]">
          <span className="h-[3px] w-[24px] rounded-full bg-[#8865DF]" />
          <span className="text-[13px] font-medium leading-[18px] text-[#4B4B5C] dark:text-gray-300">
            Revenue
          </span>
        </div>
      </div>
    </div>
  );
};

export default RevenueOverviewChart;