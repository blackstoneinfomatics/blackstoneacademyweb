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
  label: string;
  value: number;
  percentageChange: number;
}

interface TenantsGrowthResponse {
  success: boolean;
  message: string;
  data: {
    view: Period;
    tenantGrowth: {
      view: Period;
      data: TenantGrowthPoint[];
    };
  };
}

interface ChartPoint {
  label: string;
  value: number;
  percentageChange: number;
}

interface GrowthChartProps {
  tenantId: string;
}

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const GrowthTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload as ChartPoint | undefined;

  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-md dark:border-gray-600 dark:bg-[#2C2C2C]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {point?.value ?? 0} Tenants
      </p>

      {point && (
        <p
          className={`text-xs font-medium ${
            point.percentageChange > 0
              ? "text-green-500"
              : point.percentageChange < 0
                ? "text-red-500"
                : "text-gray-400"
          }`}
        >
          {point.percentageChange > 0
            ? "↑"
            : point.percentageChange < 0
              ? "↓"
              : "—"}{" "}
          {Math.abs(point.percentageChange)}%
        </p>
      )}
    </div>
  );
};

export default function GrowthChart({
  tenantId,
}: GrowthChartProps) {
  const [period, setPeriod] = useState<Period>("monthly");

  const [chartData, setChartData] = useState<ChartPoint[]>([]);

  const [status, setStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");

  const [errorMessage, setErrorMessage] = useState("");

  const hasLoadedOnce = useRef(false);

  const fetchGrowth = useCallback(
    async (signal?: AbortSignal) => {
      if (!tenantId) {
        setStatus("error");
        setErrorMessage("Tenant ID is missing");
        return;
      }

      if (!hasLoadedOnce.current) {
        setStatus("loading");
      }

      try {
        const response =
          await axios.get<TenantsGrowthResponse>(
            `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT.GET_ANALYTICS_DASHBOARD_GROWTH}`,
            {
              params: {
                tenantId,
                view: period,
              },
              signal,
            },
          );

        if (!response.data.success) {
          throw new Error(
            response.data.message ||
              "Request was not successful",
          );
        }

        const points =
          response.data.data?.tenantGrowth?.data ?? [];

        setChartData(
          points.map((point) => ({
            label: point.label,
            value: point.value ?? 0,
            percentageChange:
              point.percentageChange ?? 0,
          })),
        );

        hasLoadedOnce.current = true;

        setErrorMessage("");
        setStatus("ready");
      } catch (error) {
        if (axios.isCancel(error)) return;

        const message = axios.isAxiosError(error)
          ? error.response?.data?.message ?? error.message
          : error instanceof Error
            ? error.message
            : "Something went wrong";

        setErrorMessage(message);

        setStatus(
          hasLoadedOnce.current ? "ready" : "error",
        );
      }
    },
    [tenantId, period],
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchGrowth(controller.signal);

    return () => controller.abort();
  }, [fetchGrowth]);

  /*
   * If all values are 0, keep the chart visible.
   * Recharts can otherwise make the line sit directly
   * on the bottom axis, so we use a small Y-axis range.
   */
  const hasPositiveValue = chartData.some(
    (point) => point.value > 0,
  );

  const yAxisMax = hasPositiveValue
    ? undefined
    : 5;

  return (
    <div className="bg-white dark:bg-[#343434] rounded-2xl p-5 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-semibold text-[#0B1533] dark:text-white">
          Tenants Growth
        </h2>

        <select
          value={period}
          onChange={(e) =>
            setPeriod(e.target.value as Period)
          }
          aria-label="Select time range"
          className="text-[11px] px-2 py-1 rounded-lg bg-[#F7F7F7] dark:bg-[#374151] text-[#64748B] dark:text-gray-300 outline-none cursor-pointer border border-transparent"
        >
          {PERIOD_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
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
              Growth data didn&apos;t load.{" "}
              {errorMessage}
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

        {status === "ready" && (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="greenGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#22C55E"
                    stopOpacity={0.35}
                  />

                  <stop
                    offset="95%"
                    stopColor="#22C55E"
                    stopOpacity={0}
                  />
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
                domain={[0, yAxisMax ?? "auto"]}
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
                cursor={{
                  stroke: "#22C55E",
                  strokeWidth: 1,
                }}
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