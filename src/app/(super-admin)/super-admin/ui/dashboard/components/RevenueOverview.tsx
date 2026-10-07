"use client";

import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type Period = "yearly" | "monthly" | "weekly";

interface RevenueData {
  month?: string;
  monthNumber?: number;
  year?: number;
  revenue: number;
}

interface RevenueApiResponse {
  success: boolean;
  message: string;
  data: {
    period: Period;
    startYear?: number;
    endYear?: number;
    year?: number;
    totalRevenue: number;
    revenue: RevenueData[];
  };
}

interface ChartData {
  name: string;
  revenue: number;
}

const CustomTooltip: React.FC<
  TooltipProps<ValueType, NameType>
> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const rawValue = Number(payload[0].value || 0);

    const formattedValue = rawValue.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return (
      <div className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-white p-3 shadow-lg dark:border-[#555] dark:bg-[#454545]">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-300">
          {payload[0].payload.name}
        </span>

        <div className="text-sm font-semibold text-slate-800 dark:text-white">
          ₹{formattedValue}
        </div>
      </div>
    );
  }

  return null;
};

const RevenueOverview: React.FC = () => {
  const [period, setPeriod] = useState<Period>("monthly");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueOverview = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ANALYTICS.REVENUE_OVERVIEW}?period=${period}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: RevenueApiResponse = await response.json();

        if (result.success && result.data) {
          setTotalRevenue(result.data.totalRevenue);

          const formattedData: ChartData[] =
            result.data.revenue.map((item) => ({
              name:
                period === "yearly"
                  ? String(item.year)
                  : item.month || "",
              revenue: item.revenue,
            }));

          setChartData(formattedData);
        } else {
          setChartData([]);
          setTotalRevenue(0);
        }
      } catch (error) {
        console.error("Failed to fetch revenue overview:", error);

        setChartData([]);
        setTotalRevenue(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueOverview();
  }, [period]);

  return (
    <div className="relative flex min-w-0 w-full flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] dark:bg-[#343434] dark:shadow-xl">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-[16px] font-semibold text-slate-900 dark:text-white">
            Revenue Overview
          </h3>

          {!loading && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Total Revenue: ₹
              {totalRevenue.toLocaleString("en-IN")}
            </p>
          )}
        </div>

        {/* Period */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <select
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value as Period)
            }
            className="bg-slate-100 dark:bg-[#454545] text-slate-600 text-xs dark:text-slate-200 px-2.5 py-1 rounded-md border-none outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-[#505050] transition-colors"
          >
            <option value="yearly">Yearly</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="relative flex h-56 min-w-0 w-full items-center justify-center overflow-hidden">
        {loading ? (
          <div className="text-sm text-slate-400">
            Loading revenue...
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-sm text-slate-400">
            No revenue data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: -10,
                bottom: 10,
              }}
            >
              <defs>
                <linearGradient
                  id="colorRevenue"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#4f46e5"
                    stopOpacity={0.25}
                  />

                  <stop
                    offset="100%"
                    stopColor="#4f46e5"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                }}
                className="text-slate-400"
              />

              <YAxis
                domain={[0, "auto"]}
                tickFormatter={(value: number) =>
                  `₹${value.toLocaleString("en-IN")}`
                }
                axisLine={false}
                tickLine={false}
                width={65}
                tick={{
                  fontSize: 10,
                }}
                className="text-xs fill-slate-400"
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4f46e5"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                activeDot={{
                  r: 5,
                  fill: "#ffffff",
                  stroke: "#4f46e5",
                  strokeWidth: 3,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RevenueOverview;