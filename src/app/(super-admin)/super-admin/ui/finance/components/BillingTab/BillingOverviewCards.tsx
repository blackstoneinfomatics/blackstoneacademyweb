"use client";

import StatsCard from "../../../../components/StatsCard";
import { FaCheckCircle } from "react-icons/fa";
import { BiSolidGrid } from "react-icons/bi";
import { IoCash } from "react-icons/io5";


const cards = [
  {
    title: "Paid Expenses",
    value: 28,
    percentage: 14,
    isPositive: true,
    icon: FaCheckCircle,
    iconBg: "bg-[#E8F8EA] dark:bg-[#294D32]",
    titleColor: "text-[#40BD5F]",
    trendValue: "14%",
    trendLabel: "vs last Month",
    trendColor: "text-[#377E36]",
  },
  {
    title: "Expense Categories",
    value: 28,
    percentage: 14,
    isPositive: true,
    icon: BiSolidGrid,
    iconBg: "bg-[#EEE9FF] dark:bg-[#40386B]",
    titleColor: "text-[#5225FC]",
    trendValue: "14%",
    trendLabel: "vs last Month",
    trendColor: "text-[#377E36]",
  },
  {
    title: "This Month Expenses",
    value: 28,
    percentage: 14,
    isPositive: false,
    icon: IoCash,
    iconBg: "bg-[#E8F0FF] dark:bg-[#293E5A]",
    titleColor: "text-[#3B82F6]",
    trendValue: "14%",
    trendLabel: "vs last Month",
    trendColor: "text-[#377E36]",
  },
];

function BillingOverviewCards() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <StatsCard
          key={card.title}
          title={card.title}
          value={card.value}
          percentage={card.percentage}
          isPositive={card.isPositive}
          icon={card.icon}
          iconBg={card.iconBg}
          titleColor={card.titleColor}
        />
      ))}
    </div>
  );
}

export default BillingOverviewCards;
