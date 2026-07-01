"use client";
import { Users, CheckCircle, XCircle, AlertTriangle, Activity, CalendarDays } from "lucide-react";
import React, { useState } from "react";

const ActiveLogsChart = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const dashboardData = {
    activityDistribution: [
      {
        name: "Successful",
        count: 600,
        percentage: 80,
        color: "#22C55E",
        bgColor: "#DCFCE7",
      },
      {
        name: "Warning",
        count: 200,
        percentage: 12,
        color: "#F59E0B",
        bgColor: "#FEF3C7",
      },
      {
        name: "Failed",
        count: 100,
        percentage: 8,
        color: "#EF4444",
        bgColor: "#FEE2E2",
      },
    ],
    stats: {
      successful: 700,
      warning: 28,
      failed: 28,
      totalActivities: 28,
      uniqueUsers: 28,
      todayActivities: 28,
    },
  };

  const totalActivities = dashboardData.activityDistribution.reduce(
    (total, activity) => total + activity.count,
    0,
  );

  return (
    <div className="grid grid-cols-12 gap-4 items-stretch auto-rows-fr">
      <div className="col-span-12 lg:col-span-5 xl:col-span-5 bg-white dark:bg-[#343434] rounded-2xl p-6  shadow-sm">

  <div className="flex items-center gap-6">

    {/* Donut Chart */}
    <div
      className="relative w-[180px] h-[180px] rounded-full flex-shrink-0"
      style={{
        background:
          "conic-gradient(#45B95C 0deg 288deg,#FDBA3B 288deg 331deg,#E04B4B 331deg 360deg)",
      }}
    >
      <div className="absolute inset-[28px] bg-white dark:bg-[#343434] rounded-full flex flex-col items-center justify-center">
        <h2 className="text-[40px] font-bold text-[#111827] dark:text-white leading-none">
          900
        </h2>

        <p className="text-[14px] text-[#6B7280] dark:text-gray-300 mt-1">
          Activities
        </p>
      </div>
    </div>

    {/* Right Side */}
    <div className="flex-1">

      {dashboardData.activityDistribution.map((activity, index) => (
        <div
          key={activity.name}
          className={`${
            index !== dashboardData.activityDistribution.length - 1
              ? ""
              : ""
          } py-5`}
        >

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activity.color }}
              />

              <span className="text-[16px] font-medium text-[#1E293B] dark:text-white">
                {activity.name}
              </span>

            </div>

            <span className="text-[16px] font-medium text-[#1E293B] dark:text-white">
              {activity.count} ({activity.percentage}%)
            </span>

          </div>

        </div>
      ))}

    </div>

  </div>

</div>

     <div className="col-span-12 lg:col-span-7 xl:col-span-7">
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

    {/* Successful */}
    <div className="bg-white  rounded-xl px-4 py-3 dark:bg-[#343434] ">
      <div className="flex items-start gap-3">

        <div className="w-12 h-12 rounded-full flex items-center justify-center">
          <CheckCircle size={22} className="text-[#3CBF61]" />
        </div>

        <div>
          <h4 className="text-[15px] font-semibold text-[#111827] dark:text-white">
            Successful
          </h4>

          <p className="text-[28px] font-bold leading-none mt-1 dark:text-white">
            {dashboardData.stats.successful}
          </p>

          <div className="flex items-center gap-1 mt-4">
            <span className="text-[#22C55E] text-[12px] font-semibold">
              14.7%
            </span>

            <span className="text-[#7B8495] text-[12px]">
              of total logs
            </span>
          </div>

        </div>
      </div>
    </div>

    {/* Warning */}
    <div className="bg-white dark:bg-[#343434]  rounded-xl px-4 py-3">
      <div className="flex items-start gap-3">

        <div className="w-12 h-12 rounded-full bg-[#FFF7E7] flex items-center justify-center">
          <AlertTriangle size={22} className="text-[#FDB022]" />
        </div>

        <div>
          <h4 className="text-[15px] font-semibold text-[#111827] dark:text-white">
            Warning
          </h4>

          <p className="text-[28px] font-bold leading-none mt-1 dark:text-white">
            {dashboardData.stats.warning}
          </p>

          <div className="flex items-center gap-1 mt-3">
            <span className="text-[#22C55E] text-[12px] font-semibold">
              14.7%
            </span>

            <span className="text-[#7B8495] text-[12px]">
              of total logs
            </span>
          </div>

        </div>
      </div>
    </div>

    {/* Failed */}
    <div className="bg-white dark:bg-[#343434]  rounded-xl px-4 py-3">
      <div className="flex items-start gap-3">

        <div className="w-12 h-12 rounded-full bg-[#FDECEC] flex items-center justify-center">
          <XCircle size={22} className="text-[#E5484D]" />
        </div>

        <div>
          <h4 className="text-[15px] font-semibold text-[#111827] dark:text-white">
            Failed
          </h4>

          <p className="text-[28px] font-bold leading-none mt-1 dark:text-white">
            {dashboardData.stats.failed}
          </p>

          <div className="flex items-center gap-1 mt-3">
            <span className="text-[#22C55E] text-[12px] font-semibold">
              14.7%
            </span>

            <span className="text-[#7B8495] text-[12px]">
              of total logs
            </span>
          </div>

        </div>
      </div>
    </div>

    {/* Total Activities */}
    <div className="bg-white dark:bg-[#343434]  rounded-xl px-4 py-3">
      <div className="flex items-start gap-3">

        <div className="w-12 h-12 rounded-full bg-[#ECEBFF] flex items-center justify-center">
          <Activity size={22} className="text-[#6B63FF]" />
        </div>

        <div>
          <h4 className="text-[15px] font-semibold dark:text-white">
            Total Activities
          </h4>

          <p className="text-[28px] font-bold leading-none mt-1 dark:text-white">
            {dashboardData.stats.totalActivities}
          </p>

          <p className="text-[12px] text-[#7B8495] mt-3">
            All system activities
          </p>
        </div>

      </div>
    </div>

    {/* Unique Users */}
    <div className="bg-white dark:bg-[#343434]  rounded-xl px-4 py-3">
      <div className="flex items-start gap-3">

        <div className="w-12 h-12 rounded-full bg-[#F2EDFF] flex items-center justify-center">
          <Users size={22} className="text-[#6A5AF9]" />
        </div>

        <div>
          <h4 className="text-[15px] font-semibold dark:text-white">
            Unique Users
          </h4>

          <p className="text-[28px] font-bold leading-none mt-1 dark:text-white">
            {dashboardData.stats.uniqueUsers}
          </p>

          <p className="text-[12px] text-[#7B8495] mt-3 whitespace-nowrap">
             Performed activities
          </p>
        </div>

      </div>
    </div>

    {/* Today Activities */}
    <div className="bg-white dark:bg-[#343434]  rounded-xl px-4 py-3">
      <div className="flex items-start gap-3">

        <div className="w-12 h-12 rounded-full bg-[#EAF4FF] flex items-center justify-center">
          <CalendarDays size={22} className="text-[#3B82F6]" />
        </div>

        <div>
          <h4 className="text-[15px] font-semibold dark:text-white">
            Today Activities
          </h4>

          <p className="text-[28px] font-bold leading-none mt-1 dark:text-white">
            {dashboardData.stats.todayActivities}
          </p>

          <p className="text-[12px] text-[#7B8495] mt-3">
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
