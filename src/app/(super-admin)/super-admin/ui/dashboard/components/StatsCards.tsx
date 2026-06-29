import React from "react";
import { Users, DollarSign, UserPlus, Clock3 } from "lucide-react";
import { HiArrowTrendingUp } from "react-icons/hi2";
import { HiOutlineCurrencyDollar } from "react-icons/hi2";


const cards = [
  {
    title: "Total Tenants",
    value: "200",
    icon: Users,
    iconBg: "bg-[#4D5BF624]",
    iconColor: "text-[#4D5BF6]",
    titleColor: "text-[#4D5BF6]",
    trend: "12% ",
    trendColor: "text-green-500",
  },
  {
    title: "Total Revenue",
    value: "$2,500",
    icon: HiOutlineCurrencyDollar,
    iconBg: "bg-[#DAEEE8]",
    iconColor: "text-[#0F9E5C]",
    titleColor: "text-[#0F9E5C]",
    trend: "12%",
    trendColor: "text-green-500",
  },
  {
    title: "Subscriptions",
    value: "150",
    icon: UserPlus,
    iconBg: "bg-[#FBF2E7]",
    iconColor: "text-[#ECA036]",
    titleColor: "text-[#ECA036]",
    trend: "12%",
    trendColor: "text-green-500",
  },
  {
    title: "Pending",
    value: "50",
    icon: Clock3,
    iconBg: "bg-red-100",
    iconColor: "text-red-400",
    titleColor: "text-red-400",
    trend: "12%",
    trendColor: "text-red-400",
  },
];

const StatsCards = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={index}
            className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-12 h-12 rounded-full mt-2 flex items-center justify-center ${card.iconBg}`}
              >
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>

              <div>
                <p className={`text-sm font-medium ${card.titleColor}`}>
                  {card.title}
                </p>
                <h2 className="text-3xl font-medium text-gray-800 mt-1">
                  {card.value}
                </h2>
              </div>
            </div>

            <p className='text-xs mt-3 ml-8 flex flex-row gap-1'>
              <span className={`${card.trendColor} flex flex-row gap-x-1`}><HiArrowTrendingUp className="mt-[2px]"/>{card.trend}</span> from our month
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;