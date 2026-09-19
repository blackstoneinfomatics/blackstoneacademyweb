"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type Period = "weekly" | "monthly" | "yearly";

interface TenantGrowthPoint {
  date: string;
  totalTenants: number;
  activeTenants: number;
}

interface TenantsGrowthResponse {
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
  value: number;
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const formatLabel = (date: string, period: Period): string => {
  if (period === "yearly") {
    const [, month] = date.split("-");
    const index = Number(month) - 1;
    return MONTH_LABELS[index] ?? date;
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

const GrowthTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-md dark:border-gray-600 dark:bg-[#2C2C2C]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {payload[0].value} Tenants
      </p>
    </div>
  );
};

export default function GrowthChart() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const hasLoadedOnce = useRef(false);

  const fetchGrowth = useCallback(
    async (signal?: AbortSignal) => {
      if (!hasLoadedOnce.current) setStatus("loading");

      try {
        const response = await axios.get<TenantsGrowthResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ANALYTICS.TENANTS_GROWTH}`,
          { params: { period }, signal },
        );

        if (!response.data.success) {
          throw new Error(response.data.message || "Request was not successful");
        }

        const points = response.data.data.data ?? [];
        const resolvedPeriod = response.data.data.period ?? period;

        setChartData(
          points.map((point) => ({
            label: formatLabel(point.date, resolvedPeriod),
            value: point.totalTenants,
          })),
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
    [period],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchGrowth(controller.signal);
    return () => controller.abort();
  }, [fetchGrowth]);

  const hasValues = chartData.some((point) => point.value > 0);

  return (
    <div className="bg-white dark:bg-[#343434] rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[22px] font-semibold text-[#1E293B] dark:text-white">
          Tenants Growth
        </h2>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          aria-label="Select time range"
          className="text-[13px] px-3 py-2 rounded-lg bg-[#F7F7F7] dark:bg-[#374151] text-[#64748B] dark:text-gray-300 outline-none cursor-pointer border border-transparent"
        >
          {PERIOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Chart */}
      <div className="h-[246.5px]">
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
              No tenants recorded for this period yet.
            </p>
          </div>
        )}

        {status === "ready" && hasValues && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#F1F5F9"
                strokeDasharray="4 4"
                vertical={true}
                className="dark:stroke-[#4B5563]"
              />

              <XAxis
                dataKey="label"
                tick={{
                  fontSize: 12,
                  fill: "#64748B",
                }}
                tickLine={false}
                axisLine={false}
                className="dark:[&_tspan]:fill-[#9CA3AF]"
              />

              <YAxis
                tick={{
                  fontSize: 12,
                  fill: "#64748B",
                }}
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                className="dark:[&_tspan]:fill-[#9CA3AF]"
              />

              <Tooltip
                content={<GrowthTooltip />}
                cursor={{ stroke: "#22C55E", strokeWidth: 1 }}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#22C55E"
                strokeWidth={2}
                fill="url(#greenGradient)"
                className="dark:opacity-90"
                activeDot={{
                  r: 5,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
