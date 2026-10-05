"use client";

import { MdCancel } from "react-icons/md";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { LuClock } from "react-icons/lu";
import { FaUsers } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface TenantMetric {
  currentCount: number;
  previousMonthCount: number;
  percentage: number;
  trend: "up" | "down" | "same";
}

interface TenantAnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    overall: {
      totalTenants: number;
      activeTenants: number;
      trialTenants: number;
      inactiveTenants: number;
    };

    totalTenants: TenantMetric;
    activeTenants: TenantMetric;
    trialTenants: TenantMetric;
    inactiveTenants: TenantMetric;
    expiringTenants: TenantMetric;
  };
}

const stats = [
  {
    title: "Total Tenants",
    key: "totalTenants",
    overallKey: "totalTenants",
    color: "text-[#5225FC] dark:text-violet-400",
    bg: "bg-[#e5dffd] dark:bg-violet-900/30",
    icon: FaUsers,
  },
  {
    title: "Active Tenants",
    key: "activeTenants",
    overallKey: "activeTenants",
    color: "text-[#40BD5F] dark:text-green-400",
    bg: "bg-[#e3f4e7] dark:bg-green-900/30",
    icon: IoMdCheckmarkCircle,
  },
  {
    title: "Trial Tenants",
    key: "trialTenants",
    overallKey: "trialTenants",
    color: "text-[#1E92F8] dark:text-blue-400",
    bg: "bg-[#deeefd] dark:bg-blue-900/30",
    icon: FaUsers,
  },
  {
    title: "Inactive Tenants",
    key: "inactiveTenants",
    overallKey: "inactiveTenants",
    color: "text-[#D34645] dark:text-red-400",
    bg: "bg-[#f8e4e4] dark:bg-red-900/30",
    icon: MdCancel,
  },
  {
    title: "Expiring Tenants",
    key: "expiringTenants",
    overallKey: null,
    color: "text-[#FCAA25] dark:text-amber-400",
    bg: "bg-[#fdf2df] dark:bg-amber-900/30",
    icon: LuClock,
  },
];

export default function TenantStats() {
  const [analytics, setAnalytics] = useState<
    TenantAnalyticsResponse["data"] | null
  >(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get<TenantAnalyticsResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT.GET_ANALYTICS_CARDS}`,
        );

        if (response.data.success) {
          setAnalytics(response.data.data);
        }
      } catch (error) {
        console.error(
          "Failed to fetch tenant analytics cards:",
          error,
        );
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((item, index) => {
        const Icon = item.icon;

        const metric = analytics?.[
          item.key as keyof Pick<
            TenantAnalyticsResponse["data"],
            | "totalTenants"
            | "activeTenants"
            | "trialTenants"
            | "inactiveTenants"
            | "expiringTenants"
          >
        ];

        const trendSymbol =
          metric?.trend === "up"
            ? "↑"
            : metric?.trend === "down"
              ? "↓"
              : "–";

        const trendColor =
          metric?.trend === "down"
            ? "text-[#D34645]"
            : "text-[#377E36]";

        // Overall count
        const overallCount =
          item.overallKey && analytics?.overall
            ? analytics.overall[
                item.overallKey as keyof TenantAnalyticsResponse["data"]["overall"]
              ]
            : null;

        return (
          <div
            key={index}
            className="bg-white dark:bg-[#343434] rounded-xl p-5 dark:shadow-xl shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              {/* Icon Circle */}
              <div
                className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center transition-colors duration-300`}
              >
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>

              {/* Text Content */}
              <div className="text-left">
                <h4
                  className={`text-[13px] font-medium ${item.color}`}
                >
                  {item.title}
                </h4>

                {/* Monthly Count */}
                <p className="text-lg font-semibold text-gray-800 dark:text-white mt-1">
                  {metric?.currentCount ?? "-"}
                </p>
              </div>
            </div>

            {/* Monthly Growth */}
            <div className="mt-4 flex items-center px-4 justify-between">
              <span
                className={`${trendColor} font-semibold text-xs`}
              >
                {metric
                  ? `${trendSymbol} ${metric.percentage}%`
                  : "-"}
              </span>

              <span className="text-[#646464] dark:text-gray-400 font-medium text-[12px]">
                vs last Month
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}