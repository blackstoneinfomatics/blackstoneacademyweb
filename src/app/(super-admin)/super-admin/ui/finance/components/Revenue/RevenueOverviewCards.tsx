"use client";

import { useEffect, useState } from "react";
import StatsCard from "../../../../components/StatsCard";
import { LuIndianRupee } from "react-icons/lu";
import { FaCheckCircle } from "react-icons/fa";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface RevenueStat {
  rawAmount: string;
  amount: string;
  percentageChange: number;
  trend: "UP" | "DOWN" | "NO_CHANGE";
}

interface RevenueDashboardResponse {
  success: boolean;
  data: {
    monthlyRevenue: RevenueStat;
    annualRevenue: RevenueStat;
    pendingRevenue: RevenueStat;
    overdueRevenue: RevenueStat;
  };
}

interface RevenueCard {
  title: string;
  value: string;
  valueTooltip?: string;
  percentage: number;
  isPositive: boolean;
  image?: string;
  icon?: typeof LuIndianRupee;
  iconBg: string;
  titleColor: string;
}

const defaultCards: RevenueCard[] = [
  {
    title: "Monthly Revenue",
    value: "0",
    image: "/assets/images/TotalSub.svg",
    iconBg: "bg-[#EEE9FF] dark:bg-[#40386B]",
    titleColor: "text-[#5225FC]",
    percentage: 0,
    isPositive: true,
  },
  {
    title: "Annual Revenue",
    value: "0",
    icon: FaCheckCircle,
    iconBg: "bg-[#E8F8EA] dark:bg-[#294D32]",
    titleColor: "text-[#40BD5F]",
    percentage: 0,
    isPositive: true,
  },
  {
    title: "Pending Revenue",
    value: "0",
    icon: LuIndianRupee,
    iconBg: "bg-[#FFF3DF] dark:bg-[#5A4524]",
    titleColor: "text-[#F59E0B]",
    percentage: 0,
    isPositive: true,
  },
  {
    title: "Overdue Revenue",
    value: "0",
    image: "/assets/images/goalert.svg",
    iconBg: "bg-[#FDEAEA] dark:bg-[#5A3030]",
    titleColor: "text-[#D34645]",
    percentage: 0,
    isPositive: true,
  },
];

const RevenueOverviewCards = () => {
  const [cards, setCards] = useState<RevenueCard[]>(defaultCards);

  useEffect(() => {
    const fetchRevenueCards = async () => {
      try {
        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.REVENUE.GET_DASHBOARD_COUNT}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch revenue dashboard cards");
        }

        const result: RevenueDashboardResponse = await response.json();
        if (!result.success) {
          throw new Error("Unable to load revenue statistics");
        }

        const { data } = result;
        const revenueStats = [
          data.monthlyRevenue,
          data.annualRevenue,
          data.pendingRevenue,
          data.overdueRevenue,
        ];

        setCards(
          defaultCards.map((card, index) => {
            const stat = revenueStats[index];

            return {
              ...card,
              value: stat.amount,
              valueTooltip: `Amount: ${stat.rawAmount}`,
              percentage: stat.percentageChange,
              isPositive: stat.trend === "UP",
            };
          }),
        );
      } catch (error) {
        console.error("Revenue dashboard cards API error:", error);
      }
    };

    fetchRevenueCards();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatsCard
          key={card.title}
          title={card.title}
          value={card.value}
          valueTooltip={card.valueTooltip}
          comparisonLabel="vs last Year"
          percentage={card.percentage}
          isPositive={card.isPositive}
          image={card.image}
          icon={card.icon}
          iconBg={card.iconBg}
          titleColor={card.titleColor}
        />
      ))}
    </div>
  );
};

export default RevenueOverviewCards;
