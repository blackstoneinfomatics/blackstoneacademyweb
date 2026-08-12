import React from "react";
import { IoIosWarning } from "react-icons/io";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { FaCircleCheck } from "react-icons/fa6";
import { AiFillDatabase } from "react-icons/ai";


import Image from "next/image";

const cards = [
  {
    title: "Monthly Revenue",
    value: "200",
    icon: AiFillDatabase,
    iconBg: "bg-[#E5DFFD]",
    iconColor: "text-[#5225FC]",
    titleColor: "text-[#5225FC]",
    trendValue: "14%",
    trendLabel: "vs last Month",
    trendColor: "text-[#377E36]",
  },
  {
    title: "Annual Revenue",
    value: "150",
    icon: FaCircleCheck,
    iconBg: "bg-[#E3F4E7]",
    iconColor: "text-[#40BD5F]",
    titleColor: "text-[#40BD5F]",
    trendValue: "14%",
    trendLabel: "vs last Month",
    trendColor: "text-[#377E36]",
  },
  {
    title: "Pending Revenue",
    value: "50",
    icon: FaIndianRupeeSign,
    iconBg: "bg-[#FCF0DC]",
    iconColor: "text-[#F59E0B]",
    titleColor: "text-[#F59E0B]",
    trendValue: "14%",
    trendLabel: "vs last Month",
    trendColor: "text-[#377E36]",
  },
  {
    title: "Overdue Revenue",
    value: "$2,500",
    icon: IoIosWarning,
    iconBg: "bg-[#F8E4E4]",
    iconColor: "text-[#D34645]",
    titleColor: "text-[#D34645]",
    trendValue: "14%",
    trendLabel: "vs last Month",
    trendColor: "text-[#377E36]",
  },
];
const RevenueOverviewCards = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={index}
            className="bg-gradient-to-b from-[#ffffff] to-[#F6F6FF] dark:from-[#2c2c2c] dark:to-[#343434] rounded-2xl px-4 py-3 shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-full mt-2 flex items-center justify-center ${card.iconBg}`}
              >
                {typeof card.icon === "string" ? (
                  <Image
                    src={card.icon}
                    alt={card.title}
                    width={24}
                    height={24}
                  />
                ) : (
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                )}{" "}
              </div>

              <div className="space-y-2">
                <p
                  className={`text-md mt-[4px] font-medium ${card.titleColor}`}
                >
                  {card.title}
                </p>
                <h2 className="text-[25px] font-semibold text-gray-800 mt-1">
                  {card.value}
                </h2>
              </div>
            </div>

            <p className="text-sm mt-3 ml-[70px] flex items-center gap-2 text-[#646464]">
              <span
                className={`font-semibold flex items-center gap-1 ${card.trendColor}`}
              >
                <span>↑</span>
                {card.trendValue}
              </span>
              <span>{card.trendLabel}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default RevenueOverviewCards;
