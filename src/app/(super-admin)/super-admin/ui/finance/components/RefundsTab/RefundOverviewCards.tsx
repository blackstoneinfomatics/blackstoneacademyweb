import React from "react";
import { FaRegClock } from "react-icons/fa";
import { IoWalletOutline } from "react-icons/io5";
import { MdCancel } from "react-icons/md";
import Image from "next/image";
import StatsCard from "../../../../components/StatsCard";
import { CircleX, Clock3, Receipt, Wallet } from "lucide-react";
import { TbReceiptFilled } from "react-icons/tb";

const cards = [
  {
    title: "Total Refunds",
    value: "200",
    icon: TbReceiptFilled,
    iconBg: "bg-[#EEE9FF] dark:bg-[#40386B]",
    titleColor: "text-[#5225FC]",
    trendValue: "14%",
    trendLabel: "vs last Month",
    trendColor: "text-[#377E36]",
  },
  {
    title: "Refunded Amount",
    value: "150",
    icon: IoWalletOutline,
    iconBg: "bg-[#E8F8EA] dark:bg-[#294D32]",
    titleColor: "text-[#40BD5F]",
    trendValue: "14%",
    trendLabel: "vs last Month",
    trendColor: "text-[#377E36]",
  },
  {
    title: "Pending Refunds",
    value: "50",
    icon: FaRegClock,
    iconBg: "bg-[#FFF3DF] dark:bg-[#5A4524]",
    titleColor: "text-[#F59E0B]",
    trendValue: "14%",
    trendLabel: "vs last Month",
    trendColor: "text-[#377E36]",
  },
  {
    title: "Failed Refunds",
    value: "$2,500",
    icon: MdCancel,
    iconBg: "bg-[#FDEAEA] dark:bg-[#5A3030]",
    titleColor: "text-[#D34645]",
    trendValue: "14%",
    trendLabel: "vs last Month",
    trendColor: "text-[#377E36]",
  },
];
const RefundOverviewCards = () => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatsCard
          key={card.title}
          title={card.title}
          value={card.value}
          percentage={Number.parseInt(card.trendValue, 10)}
          isPositive={card.title !== "Failed Refunds"}
          icon={card.icon}
          iconBg={card.iconBg}
          titleColor={card.titleColor}
        />
      ))}
    </div>
  );
};

export default RefundOverviewCards;
