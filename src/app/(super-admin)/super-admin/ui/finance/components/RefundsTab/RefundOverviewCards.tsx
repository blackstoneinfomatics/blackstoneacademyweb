"use client";

import { useEffect, useState } from "react";
import { FaRegClock } from "react-icons/fa";
import { IoWalletOutline } from "react-icons/io5";
import { MdCancel } from "react-icons/md";
import StatsCard from "../../../../components/StatsCard";
import { TbReceiptFilled } from "react-icons/tb";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface RefundStat {
  count?: number;
  amount?: string;
  rawAmount?: number;
  percentageChange: number;
  trend: "UP" | "DOWN" | "NO_CHANGE";
}

interface RefundDashboardResponse {
  success: boolean;
  data: {
    totalRefunds: RefundStat;
    totalRefundAmount: RefundStat;
    failedRefunds: RefundStat;
    pendingRefunds: RefundStat;
  };
}

interface RefundCard {
  title: string;
  value: string | number;
  valueTooltip?: string;
  percentage: number;
  isPositive: boolean;
  icon: typeof TbReceiptFilled;
  iconBg: string;
  titleColor: string;
}

const defaultCards: RefundCard[] = [
  {
    title: "Total Refunds",
    value: 0,
    percentage: 0,
    isPositive: true,
    icon: TbReceiptFilled,
    iconBg: "bg-[#EEE9FF] dark:bg-[#40386B]",
    titleColor: "text-[#5225FC]",
  },
  {
    title: "Refunded Amount",
    value: "0",
    percentage: 0,
    isPositive: true,
    icon: IoWalletOutline,
    iconBg: "bg-[#E8F8EA] dark:bg-[#294D32]",
    titleColor: "text-[#40BD5F]",
  },
  {
    title: "Pending Refunds",
    value: 0,
    percentage: 0,
    isPositive: true,
    icon: FaRegClock,
    iconBg: "bg-[#FFF3DF] dark:bg-[#5A4524]",
    titleColor: "text-[#F59E0B]",
  },
  {
    title: "Failed Refunds",
    value: 0,
    percentage: 0,
    isPositive: false,
    icon: MdCancel,
    iconBg: "bg-[#FDEAEA] dark:bg-[#5A3030]",
    titleColor: "text-[#D34645]",
  },
];
const RefundOverviewCards = () => {
  const [cards, setCards] = useState<RefundCard[]>(defaultCards);

  useEffect(() => {
    const fetchRefundCards = async () => {
      try {
        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.REFUND.GET_DASHBOARD_COUNT}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch refund dashboard cards");
        }

        const result: RefundDashboardResponse = await response.json();
        if (!result.success) {
          throw new Error("Unable to load refund statistics");
        }

        const { data } = result;
        setCards([
          {
            ...defaultCards[0],
            value: data.totalRefunds.count ?? 0,
            percentage: data.totalRefunds.percentageChange,
            isPositive: data.totalRefunds.trend === "UP",
          },
          {
            ...defaultCards[1],
            value: data.totalRefundAmount.amount ?? "0",
            valueTooltip:
              data.totalRefundAmount.rawAmount !== undefined
                ? `Amount : ${data.totalRefundAmount.rawAmount}`
                : undefined,
            percentage: data.totalRefundAmount.percentageChange,
            isPositive: data.totalRefundAmount.trend === "UP",
          },
          {
            ...defaultCards[2],
            value: data.pendingRefunds.count ?? 0,
            percentage: data.pendingRefunds.percentageChange,
            isPositive: data.pendingRefunds.trend === "UP",
          },
          {
            ...defaultCards[3],
            value: data.failedRefunds.count ?? 0,
            percentage: data.failedRefunds.percentageChange,
            isPositive: data.failedRefunds.trend === "UP",
          },
        ]);
      } catch (error) {
        console.error("Refund dashboard cards API error:", error);
      }
    };

    fetchRefundCards();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatsCard
          key={card.title}
          title={card.title}
          value={card.value}
          valueTooltip={card.valueTooltip}
          percentage={card.percentage}
          isPositive={card.isPositive}
          icon={card.icon}
          iconBg={card.iconBg}
          titleColor={card.titleColor}
        />
      ))}
    </div>
  );
};

export default RefundOverviewCards;
