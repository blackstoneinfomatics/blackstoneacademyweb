"use client";
import { AlertTriangle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface ActivityStatusItem {
  name: string;
  count: number;
  percentage: number;
}

interface ActivitySummary {
  activityStatus: {
    total: number;
    items: ActivityStatusItem[];
  };
  summary: {
    successful: number;
    warning: number;
    failed: number;
    totalActivities: number;
    uniqueUsers: number;
    todayActivities: number;
  };
}

interface ActiveLogsChartProps {
  tenantCode: string;
}

const STATUS_COLORS: Record<string, string> = {
  Successful: "#45B95C",
  Warning: "#FDBA3B",
  Failed: "#E04B4B",
};

const EMPTY_SUMMARY: ActivitySummary = {
  activityStatus: {
    total: 0,
    items: [
      { name: "Successful", count: 0, percentage: 0 },
      { name: "Warning", count: 0, percentage: 0 },
      { name: "Failed", count: 0, percentage: 0 },
    ],
  },
  summary: {
    successful: 0,
    warning: 0,
    failed: 0,
    totalActivities: 0,
    uniqueUsers: 0,
    todayActivities: 0,
  },
};

const formatPercentage = (value: number) =>
  `${Number.isInteger(value) ? value : value.toFixed(1)}%`;

const ActiveLogsChart = ({ tenantCode }: ActiveLogsChartProps) => {
  const [dashboardData, setDashboardData] =
    useState<ActivitySummary>(EMPTY_SUMMARY);

  useEffect(() => {
    if (!tenantCode) return;

    const getActivitySummary = async () => {
      try {
        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT.TENANT_ACTIVITY_SUMMARY}`,
          { params: { tenantId: tenantCode } },
        );
        const data = response.data?.data;
        setDashboardData({
          activityStatus: {
            total: data?.activityStatus?.total ?? 0,
            items: data?.activityStatus?.items?.length
              ? data.activityStatus.items
              : EMPTY_SUMMARY.activityStatus.items,
          },
          summary: { ...EMPTY_SUMMARY.summary, ...data?.summary },
        });
      } catch (error) {
        console.error("Failed to fetch activity summary:", error);
        setDashboardData(EMPTY_SUMMARY);
      }
    };

    getActivitySummary();
  }, [tenantCode]);

  const activityDistribution = dashboardData.activityStatus.items.map(
    (item) => ({ ...item, color: STATUS_COLORS[item.name] ?? "#9CA3AF" }),
  );
  const totalActivities = dashboardData.activityStatus.total;
  const stats = dashboardData.summary;

  const getPercentage = (name: string) =>
    activityDistribution.find((item) => item.name === name)?.percentage ?? 0;

  // Build donut slices from counts so they always add up to 360deg
  let currentAngle = 0;
  const donutBackground =
    totalActivities > 0
      ? `conic-gradient(${activityDistribution
          .map((item) => {
            const start = currentAngle;
            currentAngle += (item.count / totalActivities) * 360;
            return `${item.color} ${start}deg ${currentAngle}deg`;
          })
          .join(",")})`
      : "conic-gradient(#E5E7EB 0deg 360deg)";

  return (
    <div className="grid grid-cols-12 gap-4 items-stretch auto-rows-fr">
      {/* Left: Donut Chart */}
      <div className="col-span-12 lg:col-span-5 xl:col-span-5 bg-white dark:bg-[#343434] rounded-2xl p-6 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] flex items-center justify-center">
        <div className="flex items-center gap-6 w-full">
          {/* Donut Chart */}
          <div
            className="relative w-[180px] h-[180px] rounded-full flex-shrink-0"
            style={{ background: donutBackground }}
          >
            <div className="absolute inset-[28px] bg-white dark:bg-[#343434] rounded-full flex flex-col items-center justify-center">
              <h2 className="text-[32px] font-bold text-[#111827] dark:text-white leading-none">
                {totalActivities}
              </h2>
              <p className="text-[14px] text-[#6B7280] dark:text-gray-300 mt-1">
                Activities
              </p>
            </div>
          </div>

          {/* Right Side Legend */}
          <div className="flex-1">
            {activityDistribution.map((activity) => (
              <div key={activity.name} className="py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: activity.color }}
                    />
                    <span className="text-[16px] font-medium text-[#010e30] dark:text-white">
                      {activity.name}
                    </span>
                  </div>
                  <span className="text-[16px] font-medium text-[#1E293B] dark:text-white">
                    {activity.count} ({formatPercentage(activity.percentage)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Stat Cards */}
      <div className="col-span-12 lg:col-span-7 xl:col-span-7">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
          
          {/* Successful */}
          <div className="bg-white dark:bg-[#343434] rounded-xl px-4 py-4 h-[108px] flex items-start shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)]">
            <div className="flex items-start gap-3 w-full">
              <div className="w-12 h-12 bg-[#e3f4e7] dark:bg-[#2A3A3A] rounded-full flex items-center justify-center shrink-0">
                <IoMdCheckmarkCircle size={22} className="text-[#3CBF61] dark:text-[#4ADE80]" />
              </div>
              <div className="flex flex-col ">
                <h4 className="text-[15px] font-semibold  text-[#010e30] dark:text-white leading-tight">
                  Successful
                </h4>
                <p className="text-2xl font-semibold leading-none mt-1 dark:text-white">
                  {stats.successful}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-[#22C55E] text-[12px] font-semibold">
                    {formatPercentage(getPercentage("Successful"))}
                  </span>
                  <span className="text-[#7B8495] dark:text-gray-400 text-[12px]">
                    of total logs
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-white dark:bg-[#343434] rounded-xl px-4 py-4 h-[108px] flex items-start shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)]">
            <div className="flex items-start gap-3 w-full">
              <div className="w-12 h-12 bg-[#FFF7E7] dark:bg-[#3A3520] rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle size={22} className="text-[#FDB022] dark:text-[#FBBF24]" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-[15px] font-semibold text-[#111827] dark:text-white leading-tight">
                  Warning
                </h4>
                <p className="text-2xl font-semibold leading-none mt-1 dark:text-white">
                  {stats.warning}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-[#F59E0B] text-[12px] font-semibold">
                    {formatPercentage(getPercentage("Warning"))}
                  </span>
                  <span className="text-[#7B8495] dark:text-gray-400 text-[12px]">
                    of total logs
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Failed */}
          <div className="bg-white dark:bg-[#343434] rounded-xl px-4 py-4 h-[108px] flex items-start shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)]">
            <div className="flex items-start gap-3 w-full">
              <div className="w-12 h-12 bg-[#FDECEC] dark:bg-[#3A2A2A] rounded-full flex items-center justify-center shrink-0">
                <MdCancel size={22} className="text-[#E5484D] dark:text-[#F87171]" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-[15px] font-semibold text-[#111827] dark:text-white leading-tight">
                  Failed
                </h4>
                <p className="text-2xl font-semibold leading-none mt-1 dark:text-white">
                  {stats.failed}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-[#EF4444] text-[12px] font-semibold">
                    {formatPercentage(getPercentage("Failed"))}
                  </span>
                  <span className="text-[#7B8495] dark:text-gray-400 text-[12px]">
                    of total logs
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Activities */}
          <div className="bg-white dark:bg-[#343434] rounded-xl px-4 py-4 h-[108px] flex items-start shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)]">
            <div className="flex items-start gap-3 w-full">
              <div className="w-12 h-12  dark:bg-[#3A3A5C] rounded-full flex items-center justify-center shrink-0">
                <img 
                  src="/assets/images/tot-activity.svg" 
                  alt="Total Activities" 
                  className="w-11 h-11 object-contain dark:brightness-90" // Fixed size to match icons
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <h4 className="text-[15px] font-semibold dark:text-white leading-tight">
                  Total Activities
                </h4>
                <p className="text-2xl font-semibold leading-none mt-1 dark:text-white">
                  {stats.totalActivities}
                </p>
                <p className="text-[12px] text-[#7B8495] dark:text-gray-400 mt-2">
                  All system activities
                </p>
              </div>
            </div>
          </div>

          {/* Unique Users */}
          <div className="bg-white dark:bg-[#343434] rounded-xl px-4 py-4 h-[108px] flex items-start shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)]">
            <div className="flex items-start gap-3 w-full">
              <div className="w-12 h-12 bg-[#F2EDFF] dark:bg-[#3A375C] rounded-full flex items-center justify-center shrink-0">
                <FaUsers size={22} className="text-[#6A5AF9] dark:text-[#8B7DFF]" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-[15px] font-semibold dark:text-white leading-tight">
                  Unique Users
                </h4>
                <p className="text-2xl font-semibold leading-none mt-1 dark:text-white">
                  {stats.uniqueUsers}
                </p>
                <p className="text-[12px] text-[#7B8495] dark:text-gray-400 mt-2 whitespace-nowrap">
                  Performed activities
                </p>
              </div>
            </div>
          </div>

          {/* Today Activities */}
          <div className="bg-white dark:bg-[#343434] rounded-xl px-4 py-4 h-[108px] flex items-start shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)]">
            <div className="flex items-start gap-3 w-full">
              <div className="w-12 h-12  dark:bg-[#2A3A5C] rounded-full flex items-center justify-center shrink-0">
                <img 
                  src="/assets/images/today-act.svg" 
                  alt="Today Activities" 
                  className="w-12 h-12 object-contain dark:brightness-90" // Fixed size to match icons
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <h4 className="text-[15px] font-semibold dark:text-white leading-tight">
                  Today Activities
                </h4>
                <p className="text-2xl font-semibold leading-none mt-1 dark:text-white">
                  {stats.todayActivities}
                </p>
                <p className="text-[12px] text-[#7B8495] dark:text-gray-400 mt-2">
                  Logs recorded today
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ActiveLogsChart;