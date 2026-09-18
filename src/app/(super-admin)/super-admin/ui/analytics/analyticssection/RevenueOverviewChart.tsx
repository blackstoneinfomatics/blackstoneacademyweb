"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Period = "daily" | "monthly" | "yearly";

interface RevenuePoint {
  month: string;
  value: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    subscriptions: {
      planName: string | null;
      count: number;
      percentage: number;
    }[];
  };
}

// ─────────────────────────────────────────────
// Endpoint
// ─────────────────────────────────────────────
const API_URL = "http://localhost:5001/analytics/chartcount";

const PERIOD_LABELS: Record<Period, string> = {
  daily: "Daily",
  monthly: "Monthly",
  yearly: "Yearly",
};

// ─────────────────────────────────────────────
// Fallback data
// ─────────────────────────────────────────────
const FALLBACK_DATA: RevenuePoint[] = [
  { month: "Jan", value: 420 },
  { month: "Feb", value: 310 },
  { month: "Mar", value: 420 },
  { month: "Apr", value: 160 },
  { month: "May", value: 160 },
  { month: "Jun", value: 650 },
  { month: "Jul", value: 420 },
  { month: "Aug", value: 500 },
];

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
// Nice axis max
// ─────────────────────────────────────────────
const niceMax = (raw: number): number => {
  if (raw <= 0) return 100;
  const steps = [
    10, 20, 25, 50, 100, 150, 200, 250, 500, 750, 1000, 1500, 2000, 2500, 5000,
    7500, 10000, 20000, 50000, 100000,
  ];
  return steps.find((s) => s >= raw) ?? Math.ceil(raw / 10000) * 10000;
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const RevenueOverviewChart = () => {
  const [period, setPeriod] = useState<Period>("monthly");
  const [chartData, setChartData] = useState<RevenuePoint[]>(FALLBACK_DATA);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Fetch when period changes ──
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_URL}?period=${period}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ApiResponse = await res.json();

        if (!cancelled && json.success) {
          const points: RevenuePoint[] = (json.data.subscriptions ?? []).map(
            (s) => ({
              month: s.planName ?? "Others",
              value: s.count ?? 0,
            })
          );
          setChartData(points.length > 0 ? points : FALLBACK_DATA);
        }
      } catch {
        if (!cancelled) setChartData(FALLBACK_DATA);
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

  // ── Axis max ──
  const maxValue = useMemo(() => {
    const raw = Math.max(...chartData.map((d) => d.value), 1);
    return niceMax(raw);
  }, [chartData]);

  // ── Y-axis ticks ──
  const yTicks = useMemo(() => {
    const t1 = maxValue;
    const t2 = Math.round(maxValue * 0.75);
    const t3 = Math.round(maxValue * 0.5);
    const t4 = Math.round(maxValue * 0.25);
    return [t1, t2, t3, t4, 0];
  }, [maxValue]);

  return (
    <div
      className="w-full rounded-[20px] bg-white px-[29px] pt-[22px] pb-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col dark:bg-[#343434] dark:shadow-none dark:border dark:border-[#454545]"
      style={{ height: CARD_HEIGHT }}
    >
      {/* ================= HEADER ================= */}
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

      {/* ================= CHART ================= */}
      <div className="flex-1 min-h-0 mt-[14px] mb-[14px] flex flex-col justify-center">
        <div className="flex">
          {/* Y AXIS */}
          <div
            className="relative w-[58px] shrink-0"
            style={{ height: CHART_HEIGHT }}
          >
            {yTicks.map((tick, i) => (
              <span
                key={i}
                className="absolute left-0 text-[12px] font-normal text-[#454545] dark:text-gray-400"
                style={{ top: `${FIRST_GRID_TOP + i * GRID_STEP - 7}px` }}
              >
                ${tick}
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

            {/* Bars */}
            <div
              className="absolute inset-x-[16px] flex items-end justify-between gap-[10px]"
              style={{
                top: FIRST_GRID_TOP,
                height: BASELINE_TOP - FIRST_GRID_TOP,
              }}
            >
              {chartData.map((item, i) => {
                const plotHeight = BASELINE_TOP - FIRST_GRID_TOP;
                const ratio = maxValue > 0 ? item.value / maxValue : 0;
                const height = Math.max(ratio * plotHeight, 2);

                return (
                  <div
                    key={`${item.month}-${i}`}
                    className="flex h-full flex-1 items-end justify-center"
                  >
                    <div
                      className="w-full max-w-[42px] rounded-t-[4px] bg-gradient-to-b from-[#C9B9F1] via-[#9D85E0] to-[#8060D9]"
                      style={{ height: `${height}px` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X labels */}
            <div
              className="absolute inset-x-[16px] flex justify-between gap-[10px]"
              style={{ top: BASELINE_TOP + 6 }}
            >
              {chartData.map((item, i) => (
                <div
                  key={`${item.month}-label-${i}`}
                  className="flex-1 text-center"
                >
                  <span className="text-[11px] font-normal text-[#737373] dark:text-gray-400">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= LEGEND ================= */}
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