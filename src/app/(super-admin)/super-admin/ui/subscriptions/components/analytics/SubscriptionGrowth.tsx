"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
} from "recharts";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type View = "yearly" | "monthly";

interface GrowthPoint {
  year?: number | string;
  month?: number | string;
  label?: string;
  amount?: number;
  value?: number;
  total?: number;
}

interface GrowthApiResponse {
  success: boolean;
  message: string;
  data: {
    view: View;
    data: GrowthPoint[];
  };
}

interface ChartPoint {
  label: string;
  value: number;
}

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const GROWTH_ENDPOINT = `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.SUBSCRIPTION.GROWTH_ANALYTICS}`;

/** Poll interval for live refresh. Set to 0 to disable polling. */
const REFRESH_MS = 30_000;

/** Minimum number of year buckets to render so a sparse dataset still
 *  reads as a trend line instead of a single dot. */
const MIN_YEAR_BUCKETS = 8;

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const toNumber = (input: unknown): number => {
  const parsed = Number(input);
  return Number.isFinite(parsed) ? parsed : 0;
};

const readAmount = (point: GrowthPoint): number =>
  toNumber(point.amount ?? point.value ?? point.total ?? 0);

const formatCompact = (value: number): string => {
  if (Math.abs(value) >= 1_000_000) return `${+(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${+(value / 1_000).toFixed(1)}k`;
  return `${value}`;
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const normalizeYearly = (points: GrowthPoint[]): ChartPoint[] => {
  const byYear = new Map<number, number>();

  points.forEach((point) => {
    const year = Number(point.year ?? point.label);
    if (Number.isFinite(year)) {
      byYear.set(year, byYear.get(year) ?? 0 + readAmount(point));
    }
  });

const knownYears = Array.from(byYear.keys());
  const currentYear = new Date().getFullYear();

  const end = knownYears.length ? Math.max(...knownYears) : currentYear;
  const naturalStart = knownYears.length ? Math.min(...knownYears) : end;
  const start = Math.min(naturalStart, end - (MIN_YEAR_BUCKETS - 1));

  const series: ChartPoint[] = [];
  for (let year = start; year <= end; year += 1) {
    series.push({ label: String(year), value: byYear.get(year) ?? 0 });
  }
  return series;
};

const normalizeMonthly = (points: GrowthPoint[]): ChartPoint[] => {
  const byMonth = new Array<number>(12).fill(0);

  points.forEach((point) => {
    const raw = point.month ?? point.label;
    let index = -1;

    if (typeof raw === "number" || /^\d+$/.test(String(raw ?? ""))) {
      const n = Number(raw);
      index = n >= 1 && n <= 12 ? n - 1 : n;
    } else if (typeof raw === "string") {
      index = MONTH_LABELS.findIndex(
        (m) => m.toLowerCase() === raw.slice(0, 3).toLowerCase()
      );
    }

    if (index >= 0 && index < 12) byMonth[index] += readAmount(point);
  });

  return MONTH_LABELS.map((label, i) => ({ label, value: byMonth[i] }));
};

/* ------------------------------------------------------------------ */
/* Dark Mode Tooltip                                                   */
/* ------------------------------------------------------------------ */

const GrowthTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-md dark:border-gray-600 dark:bg-[#2C2C2C]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-400">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {formatCurrency(toNumber(payload[0].value))}
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const SubscriptionGrowth = () => {
  const [view, setView] = useState<View>("yearly");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const hasLoadedOnce = useRef(false);

  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => now - i);
  }, []);

  const fetchGrowth = useCallback(
    async (signal?: AbortSignal) => {
      if (!hasLoadedOnce.current) setStatus("loading");

      try {
        const response = await axios.get<GrowthApiResponse>(GROWTH_ENDPOINT, {
          params: view === "monthly" ? { view, year } : { view },
          signal,
        });

        if (!response.data?.success) {
          throw new Error(response.data?.message || "Request was not successful");
        }

        const payload = response.data.data?.data ?? [];
        const resolvedView = response.data.data?.view ?? view;

        setChartData(
          resolvedView === "monthly"
            ? normalizeMonthly(payload)
            : normalizeYearly(payload)
        );

        hasLoadedOnce.current = true;
        setErrorMessage("");
        setStatus("ready");
      } catch (error) {
        if (axios.isCancel(error)) return;

        const message = axios.isAxiosError(error)
          ? error.response?.data?.message ?? error.message
          : "Something went wrong";

        setErrorMessage(message);
        setStatus(hasLoadedOnce.current ? "ready" : "error");
      }
    },
    [view, year]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchGrowth(controller.signal);
    return () => controller.abort();
  }, [fetchGrowth]);

  useEffect(() => {
    if (!REFRESH_MS) return;

    const controller = new AbortController();

    const tick = () => {
      if (document.visibilityState === "visible") fetchGrowth(controller.signal);
    };

    const timer = window.setInterval(tick, REFRESH_MS);
    window.addEventListener("focus", tick);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", tick);
      controller.abort();
    };
  }, [fetchGrowth]);

  const hasValues = chartData.some((point) => point.value > 0);
  const isSinglePoint = chartData.length === 1;

  const selectClass =
    "bg-gray-100 text-gray-500 px-2 py-1 rounded-md outline-none text-xs cursor-pointer dark:bg-[#374151] dark:text-gray-300 border border-gray-200 dark:border-gray-600";

  return (
    <div className="bg-white rounded-2xl shadow-sm px-4 py-2 w-full h-full border border-transparent dark:border-gray-700/50 dark:bg-[#343434] transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 mt-3">
        <h2 className="text-[18px] px-3 font-semibold text-gray-900 dark:text-white">
          Subscription Growth
        </h2>

        <div className="flex items-center gap-2">
          {view === "monthly" && (
            <select
              className={selectClass}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              aria-label="Select year"
            >
              {yearOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}

          <select
            className={selectClass}
            value={view}
            onChange={(e) => setView(e.target.value as View)}
            aria-label="Select time range"
          >
            <option value="yearly">Yearly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[220px]">
        {status === "loading" && (
          <div className="h-full w-full animate-pulse rounded-xl bg-gray-100 dark:bg-[#2C2C2C]" />
        )}

        {status === "error" && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Growth data didn&apos;t load. {errorMessage}
            </p>
            <button
              type="button"
              onClick={() => fetchGrowth()}
              className="rounded-md bg-green-50 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
            >
              Try again
            </button>
          </div>
        )}

        {status === "ready" && !hasValues && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No subscriptions recorded for this period yet.
            </p>
          </div>
        )}

        {status === "ready" && hasValues && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 8, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0.03} />
                </linearGradient>
              </defs>

              <CartesianGrid 
                stroke="#E5E7EB" 
                vertical 
                horizontal 
                className="dark:stroke-[#4B5563]" 
              />

              <XAxis
                dataKey="label"
                tick={{ fill: "#6B7280", fontSize: 14 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={8}
                className="dark:[&_tspan]:fill-[#9CA3AF]"
              />

              <YAxis
                tickFormatter={formatCompact}
                tick={{ fill: "#6B7280", fontSize: 14 }}
                axisLine={false}
                tickLine={false}
                width={48}
                allowDecimals={false}
                domain={[0, "auto"]}
                className="dark:[&_tspan]:fill-[#9CA3AF]"
              />

              <Tooltip 
                content={<GrowthTooltip />} 
                cursor={{ stroke: "#22C55E", strokeWidth: 1, strokeDasharray: "3 3" }} 
              />

              <Area
                type="linear"
                dataKey="value"
                stroke="#22C55E"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="url(#greenFill)"
                isAnimationActive={false}
                dot={isSinglePoint ? { r: 4, fill: "#22C55E", strokeWidth: 0 } : false}
                activeDot={{ r: 4, fill: "#22C55E", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SubscriptionGrowth;