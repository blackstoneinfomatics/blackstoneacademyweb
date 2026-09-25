"use client";

import { ChevronDown, UsersRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type ViewType = "weekly" | "monthly" | "yearly";

interface GrowthItem {
  moduleId?: string;
  name: string;
  percentage: number;
  enabledFeatures?: number;
  totalFeatures?: number;
}

interface GrowthResponse {
  success: boolean;
  message: string;
  data: {
    view: ViewType;
    tenantGrowth: {
      view: ViewType;
      data: {
        label: string;
        value: number;
        percentageChange: number;
      }[];
    };
    growth: {
      view: ViewType;
      items: GrowthItem[];
    };
  };
}

interface GrowthCardProps {
  tenantId: string;
}

export default function GrowthCard({ tenantId }: GrowthCardProps) {
  const [period, setPeriod] = useState<ViewType>("monthly");
  const [modules, setModules] = useState<GrowthItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  const fetchGrowth = useCallback(
    async (signal?: AbortSignal) => {
      if (!tenantId) {
        setModules([]);
        return;
      }

      try {
        setLoading(true);

        const response = await axios.get<GrowthResponse>(
          `${AppApiEndpoints.API_END_POINT}/tenant/analytics/dashboard/growth`,
          {
            params: {
              tenantId: tenantId,
              view: period,
            },
            signal,
          },
        );

        if (response.data?.success) {
          const growthData = response.data?.data?.growth;

          // Make sure the response belongs to the selected period
          if (growthData?.view === period) {
            setModules(growthData.items ?? []);
          } else {
            setModules([]);
          }
        } else {
          setModules([]);
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }

        console.error("Failed to fetch growth data:", error);
        setModules([]);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [tenantId, period],
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchGrowth(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchGrowth]);

  const handlePeriodChange = (value: ViewType) => {
    setPeriod(value);
    setOpenDropdown(false);
  };

  return (
    <div className="bg-white dark:bg-[#343434] h-[335px] overflow-auto scrollbar-none rounded-[18px] p-5 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] border border-transparent dark:border-gray-700/50 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-semibold text-[#0B1533] dark:text-white">
          Growth
        </h2>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown((prev) => !prev)}
            className="flex items-center gap-2 bg-[#F5F5F5] dark:bg-[#374151] px-3 py-1 rounded-md text-[11px] text-[#7B8495] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#4B5563] transition-colors"
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}

            <ChevronDown
              size={13}
              className={`transition-transform ${
                openDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {openDropdown && (
            <div className="absolute right-0 top-full mt-1 z-20 min-w-[90px] bg-white dark:bg-[#3A3A3A] border border-gray-200 dark:border-gray-600 rounded-md shadow-lg overflow-hidden">
              {(["weekly", "monthly", "yearly"] as ViewType[]).map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handlePeriodChange(option)}
                    className={`w-full px-3 py-2 text-left text-[11px] transition-colors ${
                      period === option
                        ? "bg-[#F1EFFF] dark:bg-[#4A466A] text-[#5B4CF5] dark:text-[#A89EFF]"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#4B4B4B]"
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between animate-pulse"
            >
              <div className="flex items-center gap-3 min-w-[180px]">
                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600" />

                <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-600" />
              </div>

              <div className="flex items-center gap-3 flex-1 ml-5">
                <div className="flex-1 h-[5px] rounded-full bg-gray-200 dark:bg-gray-600" />

                <div className="h-3 w-8 rounded bg-gray-200 dark:bg-gray-600" />
              </div>
            </div>
          ))}
        </div>
      ) : modules.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No growth data available
          </p>
        </div>
      ) : (
        /* Growth List */
        <div className="space-y-4">
          {modules.map((item, index) => {
            const percentage = Math.min(
              Math.max(Number(item.percentage) || 0, 0),
              100,
            );

            return (
              <div
                key={item.moduleId ?? `${item.name}-${index}`}
                className="flex items-center justify-between"
              >
                {/* Left */}
                <div className="flex items-center gap-3 min-w-[180px]">
                  <div className="w-9 h-9 rounded-full bg-[#F1EFFF] dark:bg-[#3A3A5C] flex items-center justify-center flex-shrink-0 transition-colors">
                    <UsersRound
                      size={17}
                      strokeWidth={2}
                      className="text-[#5B5CF6] dark:text-[#8B7DFF]"
                    />
                  </div>

                  <p className="text-[14px] font-medium text-[#1E293B] dark:text-white truncate max-w-[150px]">
                    {item.name}
                  </p>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-3 flex-1 ml-5">
                  <div className="flex-1 h-[5px] bg-[#E5E7EB] dark:bg-[#4B5563] rounded-full overflow-hidden transition-colors">
                    <div
                      className="h-full rounded-full bg-[#5B4CF5] dark:bg-[#7C6DFF] transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <span className="text-[12px] font-semibold text-[#374151] dark:text-gray-300 w-12 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}