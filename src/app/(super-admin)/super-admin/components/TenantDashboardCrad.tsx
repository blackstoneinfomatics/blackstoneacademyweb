"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface DashboardCardData {
  current: number;
  previous: number;
  percentageChange: number;
  changeType: "UPGRADE" | "DOWNGRADE" | "NO_CHANGE";
  comparison: string;
}

interface DashboardData {
  cards: {
    totalUsers: DashboardCardData;
    activeUsers: DashboardCardData;
    revenue: DashboardCardData;
    openTickets: DashboardCardData;
  };
  performance: {
    percentage: number;
    label: string;
    message: string;
  };
}

const cardConfig = [
  {
    id: 1,
    key: "totalUsers",
    title: "Total Users",
    titleColor: "#5B4CFF",
    icon: "/assets/images/k (10).png",
  },
  {
    id: 2,
    key: "activeUsers",
    title: "Active Users",
    titleColor: "#22C55E",
    icon: "/assets/images/k (11).png",
  },
  {
    id: 3,
    key: "revenue",
    title: "Revenue",
    titleColor: "#F59E0B",
    icon: "/assets/images/k (9).png",
  },
  {
    id: 4,
    key: "openTickets",
    title: "Open Tickets",
    titleColor: "#4F6BFF",
    icon: "/assets/images/k (12).png",
  },
];

interface DashboardCardsProps { tenantId: string; }

export default function DashboardCards({ tenantId, }: DashboardCardsProps) {
  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchDashboardSummary = async () => {
    try {
      setLoading(true);


      if (!tenantId) {
        console.error("Tenant ID not found in localStorage");
        return;
      }

      const response = await fetch(
        `http://localhost:5001/tenant/analytics/dashboard/summary?tenantId=${encodeURIComponent(
          tenantId
        )}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard summary:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardSummary();
}, []);


  const formatValue = (key: string, value: number) => {
    if (key === "revenue") {
      return `₹${value.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}`;
    }

    return value.toLocaleString("en-IN");
  };

  const getChange = (data: DashboardCardData) => {
    if (data.changeType === "UPGRADE") {
      return {
        icon: "↑",
        color: "#16A34A",
      };
    }

    if (data.changeType === "DOWNGRADE") {
      return {
        icon: "↓",
        color: "#EF4444",
      };
    }

    return {
      icon: "—",
      color: "#6B7280",
    };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cardConfig.map((card) => (
          <div
            key={card.id}
            className="bg-white dark:bg-[#343434] rounded-2xl px-5 py-4 shadow-sm animate-pulse"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-600" />

              <div className="flex-1">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded" />
                <div className="h-9 w-20 bg-gray-200 dark:bg-gray-600 rounded mt-3" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded mt-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-6 text-gray-500">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {cardConfig.map((card) => {
        const data =
          dashboardData.cards[
            card.key as keyof DashboardData["cards"]
          ];

        const change = getChange(data);

        return (
          <div
            key={card.id}
            className="bg-white dark:bg-[#343434] rounded-2xl px-5 py-4 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)]"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0">
                <Image
                  src={card.icon}
                  alt={card.title}
                  width={50}
                  height={50}
                />
              </div>

              {/* Content */}
              <div>
                <h3
                  className="text-[15px] font-semibold"
                  style={{
                    color: card.titleColor,
                  }}
                >
                  {card.title}
                </h3>

                <h2 className="text-lg font-semibold leading-none mt-2 text-[#1E293B] dark:text-white">
                  {formatValue(card.key, data.current)}
                </h2>

                <div className="flex items-center gap-2 mt-4">
                  <span
                    className="text-[12px] font-semibold"
                    style={{
                      color: change.color,
                    }}
                  >
                    {change.icon} {data.percentageChange}%
                  </span>

                  <span className="text-[12px] text-[#6B7280] dark:text-gray-300">
                    {data.comparison}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

