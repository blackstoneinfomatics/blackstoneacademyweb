"use client";

import StatsCard from "./StatsCard";
import {
  ReceiptText,
  FileStack,
  Loader,
  TriangleAlert,
} from "lucide-react";
import { TbAlertTriangleFilled } from "react-icons/tb";

const transactionStats = [
  {
    title: "Total Transactions",
    value: 28,
    percentage: 14,
    isPositive: true,
    image: "/assets/images/TotalSub.svg",
    iconBg: "bg-[#EEE9FF]",
    titleColor: "text-[#5B4CF7]",
  },
  {
    title: "Successful Transactions",
    value: 28,
    percentage: 14,
    isPositive: true,
    image: "/assets/images/ActiveSubscription.svg",
    iconBg: "bg-[#E8F8EA]",
    titleColor: "text-[#36B24A]",
  },
  {
    title: "Pending Transactions",
    value: 28,
    percentage: 14,
    isPositive: false,
    image: "/assets/images/TrialSubscription.svg",
    iconBg: "bg-[#FFF3DF]",
    titleColor: "text-[#F59E0B]",
  },
  {
    title: "Failed Transactions",
    value: 10,
    percentage: 14,
    isPositive: false,
    image: "/assets/images/goalert.svg",
    iconBg: "bg-[#FDEAEA]",
    titleColor: "text-[#EF4444]",
  },
];

export default function TransactionOverviewCards() {
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {transactionStats.map((card) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            percentage={card.percentage}
            isPositive={card.isPositive}
            image={card.image}
            iconBg={card.iconBg}
            titleColor={card.titleColor}
          />
        ))}
      </div>
    </section>
  );
}