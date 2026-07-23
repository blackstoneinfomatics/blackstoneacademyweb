import React from "react";
import { Users, DollarSign, UserPlus, Clock3 } from "lucide-react";
import { HiArrowTrendingUp } from "react-icons/hi2";
import { HiOutlineCurrencyDollar } from "react-icons/hi2";
import { TbBrandDatabricks } from "react-icons/tb";
import { FaCircleCheck } from "react-icons/fa6";
import { IoWalletOutline } from "react-icons/io5";
import { HiUsers } from "react-icons/hi";
import { AiFillCloseCircle } from "react-icons/ai";
import { PiSealCheckFill } from "react-icons/pi";



const cards = [
  {
    title: "Total Trials",
    value: "200",
    icon: HiUsers,
    iconBg: "bg-[#E5DFFD]",
    iconColor: "text-[#5225FC]",
    titleColor: "text-[#5225FC]",
    trend: "All Time trials"
  },
    {
    title: "Active Trials",
    value: "150",
    icon: FaCircleCheck,
    iconBg: "bg-[#E3F4E7]",
    iconColor: "text-[#40BD5F]",
    titleColor: "text-[#40BD5F]",
    trend: "Currently  trials"
  },
    {
    title: "Expiried Trials",
    value: "$2,500",
    icon: AiFillCloseCircle,
    iconBg: "bg-[#F8E4E4]",
    iconColor: "text-[#D34645]",
    titleColor: "text-[#D34645]",
    trend: "Not Converted"
  },
  {
    title: "Converted to paid",
    value: "50",
    icon: PiSealCheckFill,
    iconBg: "bg-[#E7E9FE]",
    iconColor: "text-[#5E6BFF]",
    titleColor: "text-[#5E6BFF]",
    trend: "This month"
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
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>

              <div className="space-y-2">
                <p className={`text-md mt-[4px] font-medium ${card.titleColor}`}>
                  {card.title}
                </p>
                <h2 className="text-[25px] font-semibold text-gray-800 mt-1">
                  {card.value}
                </h2>
              </div>
            </div>

            <p className='text-sm mt-3 ml-[70px] flex flex-row gap-1'>
              <span className="flex flex-row gap-x-1 text-[#646464]">{card.trend}</span>
            </p>
          </div>
        );
      })}
    </div>
  )
}

export default Card
