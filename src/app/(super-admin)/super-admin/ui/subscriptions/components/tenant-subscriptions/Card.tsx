"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { GoAlertFill } from "react-icons/go";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

interface SubscriptionMetric {
  totalCount?: number;
  currentMonthCount?: number;
  previousMonthCount?: number;
  percentage: number;
}

interface DashboardResponse {
  success: boolean;
  message: string;
  data: {
    totalSubscriptions: SubscriptionMetric;
    activeSubscriptions: SubscriptionMetric;
    inactiveSubscriptions: SubscriptionMetric;
    trials: SubscriptionMetric;
    expiringThisMonth: SubscriptionMetric;
  };
}

interface CardData {
  title: string;
  value: number;
  icon: string | typeof GoAlertFill;
  iconBg: string;
  iconColor: string;
  titleColor: string;
  trend: string;
  percentage: number;
}

const Card = () => {
  const [dashboardData, setDashboardData] =
    useState<DashboardResponse["data"] | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "http://localhost:5001/tenant-subscriptions/dashboard"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch subscription dashboard");
        }

        const result: DashboardResponse = await response.json();

        if (result.success) {
          setDashboardData(result.data);
        }
      } catch (error) {
        console.error(
          "Error fetching subscription dashboard:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cards: CardData[] = [
    {
      title: "Total Subscription",
      value: dashboardData?.totalSubscriptions.totalCount ?? 0,
      icon: "/assets/images/TotalSub.svg",
      iconBg: "bg-[#E5DFFD] dark:bg-[#493D70]",
      iconColor: "text-[#5225FC]",
      titleColor: "text-[#5225FC]",
      trend: "All Subscriptions Plan",
      percentage: dashboardData?.totalSubscriptions.percentage ?? 0,
    },
    {
      title: "Active Subscriptions",
      value: dashboardData?.activeSubscriptions.totalCount ?? 0,
      icon: "/assets/images/ActiveSubscription.svg",
      iconBg: "bg-[#E3F4E7] dark:bg-[#294A32]",
      iconColor: "text-[#40BD5F]",
      titleColor: "text-[#40BD5F]",
      trend: "Currently Active Plan",
      percentage: dashboardData?.activeSubscriptions.percentage ?? 0,
    },
    {
      title: "Inactive Subscriptions",
      value: dashboardData?.inactiveSubscriptions.totalCount ?? 0,
      icon: "/assets/images/TrialSubscription.svg",
      iconBg: "bg-[#FCF0DC] dark:bg-[#594522]",
      iconColor: "text-[#FCAA25]",
      titleColor: "text-[#FCAA25]",
      trend: "Subscribed Tenants",
      percentage: dashboardData?.trials.percentage ?? 0,
    },
    {
      title: "Expiring this month",
      value: dashboardData?.expiringThisMonth.currentMonthCount ?? 0,
      icon: GoAlertFill,
      iconBg: "bg-[#F8E4E4] dark:bg-[#512B2B]",
      iconColor: "text-[#D34645]",
      titleColor: "text-[#D34645]",
      trend: "vs last Month",
      percentage: dashboardData?.expiringThisMonth.percentage ?? 0,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const isImageIcon = typeof card.icon === "string";

        return (
          <div
            key={index}
            className="bg-[#ffffff] dark:bg-[#343434] rounded-2xl px-4 py-3 shadow-lg"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-full mt-2 flex items-center justify-center ${card.iconBg}`}
              >
                {isImageIcon ? (
                  <Image
                    src={card.icon as string}
                    alt={card.title}
                    width={24}
                    height={24}
                  />
                ) : (
                  React.createElement(card.icon, {
                    className: `w-6 h-6 ${card.iconColor}`,
                  })
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <p
                  className={`text-md mt-[4px] font-medium ${card.titleColor}`}
                >
                  {card.title}
                </p>

                <h2 className="text-[25px] font-semibold text-gray-800 dark:text-white mt-1">
                  {loading ? "..." : card.value}
                </h2>
              </div>
            </div>

            {/* Bottom text */}
<p className="text-sm mt-3 ml-[70px] flex flex-row items-center gap-1">
  <span className="flex flex-row items-center gap-x-1 text-[#646464] dark:text-gray-300">
        {card.percentage >= 0 ? (
      <span className="flex items-center gap-1 text-[#377E36] font-medium dark:text-[#72D889]">
        <FaArrowUp className="w-3 h-3" />
        {Math.abs(card.percentage)}%
      </span>
    ) : (
      <span className="flex items-center gap-1 text-[#D34645] font-medium dark:text-[#FF8B8B]">
        <FaArrowDown className="w-3 h-3" />
        {Math.abs(card.percentage)}%
      </span>
    )}
    {card.trend}
  </span>
</p>
          </div>
        );
      })}
    </div>
  );
};

export default Card;