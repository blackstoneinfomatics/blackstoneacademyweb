import React from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { FaRegClock } from "react-icons/fa";
import { GoAlertFill } from "react-icons/go";
import Image from "next/image";

const cards = [
  {
    title: "Total Invoices",
    value: "200",
    icon: "/assets/images/TotalInvoices.svg",
    iconBg: "bg-[#E5DFFD]",
    iconColor: "text-[#5225FC]",
    titleColor: "text-[#5225FC]",
    trend: "All Subscriptions Plan",
  },
  {
    title: "Paid Invoices",
    value: "150",
    icon: FaCircleCheck,
    iconBg: "bg-[#E3F4E7]",
    iconColor: "text-[#40BD5F]",
    titleColor: "text-[#40BD5F]",
    trend: "Currently Active Plan",
  },
  {
    title: "Pending Invoices",
    value: "50",
    icon: FaRegClock,
    iconBg: "bg-[#FCF0DC]",
    iconColor: "text-[#F59E0B]",
    titleColor: "text-[#F59E0B]",
    trend: "Subscribed Tenants",
  },
  {
    title: "Overdue Invoices",
    value: "$2,500",
    icon: GoAlertFill,
    iconBg: "bg-[#F8E4E4]",
    iconColor: "text-[#D34645]",
    titleColor: "text-[#D34645]",
    trend: "vs last Month",
  },
];
const Card = () => {
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

            <p className="text-sm mt-3 ml-[70px] flex flex-row gap-1">
              <span className="flex flex-row gap-x-1 text-[#646464]">
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
