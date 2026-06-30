import React from "react";
import { Users, DollarSign, UserPlus, Clock3 } from "lucide-react";
import { HiArrowTrendingUp } from "react-icons/hi2";
import { HiOutlineCurrencyDollar } from "react-icons/hi2";


const cards = [
  {
    title: "Total Plans",
    value: "200",
    icon: Users,
    iconBg: "bg-[#4D5BF624]",
    iconColor: "text-[#4D5BF6]",
    titleColor: "text-[#4D5BF6]",
    trend: "All Subscriptions Plan"
  },
    {
    title: "Active Plan",
    value: "150",
    icon: UserPlus,
    iconBg: "bg-[#FBF2E7]",
    iconColor: "text-[#ECA036]",
    titleColor: "text-[#ECA036]",
    trend: "Currently Active Plan"
  },
  {
    title: "Total Tenants",
    value: "50",
    icon: Clock3,
    iconBg: "bg-red-100",
    iconColor: "text-red-400",
    titleColor: "text-red-400",
    trend: "Subscribed Tenants"
  },
  {
    title: "Monthly Revenue",
    value: "$2,500",
    icon: HiOutlineCurrencyDollar,
    iconBg: "bg-[#DAEEE8]",
    iconColor: "text-[#0F9E5C]",
    titleColor: "text-[#0F9E5C]",
    trend: "vs last Month"
  }
];

const StatsCards = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={index}
            className="bg-gradient-to-b from-[#ffffff] to-[#F6F6FF] rounded-2xl px-4 py-3 shadow-lg border border-gray-100"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-full mt-3 flex items-center justify-center ${card.iconBg}`}
              >
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>

              <div className="space-y-2">
                <p className={`text-sm mt-[1px] font-medium ${card.titleColor}`}>
                  {card.title}
                </p>
                <h2 className="text-[25px] font-semibold text-gray-800 mt-1">
                  {card.value}
                </h2>
              </div>
            </div>

            <p className='text-xs mt-3 ml-8 flex flex-row gap-1'>
              <span className="flex flex-row gap-x-1">{card.trend}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;