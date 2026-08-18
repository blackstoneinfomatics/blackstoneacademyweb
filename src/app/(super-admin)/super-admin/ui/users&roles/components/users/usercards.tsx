import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { MdCheckCircle, MdCancel } from "react-icons/md";
import { HiUserGroup } from "react-icons/hi2";

const data = {
  tenants: {
    title: "Total Tenants",
    value: "28",
    icon: HiUserGroup,
    iconBg: "bg-[#E5DFFD]",
    iconColor: "text-[#5225FC]",
    titleColor: "text-[#5225FC]",
    trendColor: "text-green-600",
    percentage: "14%",
    isIncrease: true,
    text: "vs last Month",
  },

  totalUser: {
    title: "Total User",
    value: "28",
    icon: HiUserGroup,
    iconBg: "bg-[#E2ECFC]",
    iconColor: "text-[#3B82F6]",
    titleColor: "text-[#3B82F6]",
    trendColor: "text-green-600",
    percentage: "14%",
    isIncrease: true,
    text: "vs last Month",
  },

  cards: [
    {
      title: "Active User",
      value: "18",
      icon: MdCheckCircle,
      iconBg: "bg-[#E3F4E7]",
      iconColor: "text-[#40BD5F]",
      titleColor: "text-[#40BD5F]",
      trendColor: "text-red-500",
      percentage: "14%",
      isIncrease: false,
      text: "vs last Month",
    },
    {
      title: "Inactive User",
      value: "10",
      icon: MdCancel,
      iconBg: "bg-[#F8E4E4]",
      iconColor: "text-[#D34645]",
      titleColor: "text-[#D34645]",
      trendColor: "text-green-600",
      percentage: "14%",
      isIncrease: true,
      text: "vs last Month",
    },
  ],
};

const Usercards = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Large Card */}
      <div className="col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="p-4 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
              <img
                src="/assets/images/bsicon.png"
                alt="Tenant Logo"
                className="w-[100px] h-full bg-center bg-cover object-contain"
              />
            </div>

            {/* Details */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[20px] font-semibold text-[#1B1B1B]">
                  Blackstone Academy
                </h2>

                <span className="text-[12px] font-medium text-[#2FB344]">
                  Active
                </span>
              </div>

              <p className="text-[14px] text-gray-500 mt-1">
                blackstoneacademy.com
              </p>

              <div className="flex items-center gap-1 mt-1 text-[12px]">
                <span className="text-gray-400">Created on 02,July,2000 |</span>

                <span className="font-medium text-[#576CBC]">
                  ID: TEN 22001
                </span>
              </div>
            </div>
          </div>

          {/* Right Badge */}
          <div>
            <span className="px-3 py-1 rounded-md bg-[#E9F1FF] text-[#4F7DF3] text-xs font-medium">
              Standard
            </span>
          </div>
        </div>
      </div>

      {/* Small Cards */}
      {data.cards.map((card, index) => {
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
                <p
                  className={`text-md mt-[4px] text-[15px] font-medium ${card.titleColor}`}
                >
                  {card.title}
                </p>
                <h2 className="text-[19px] font-semibold text-gray-800 mt-1">
                  {card.value}
                </h2>
              </div>
            </div>

            {/* Bottom */}
            <div className="flex items-center text-[16px] gap-2 mt-6 ml-[72px]">
              <div className={`flex items-center ${card.trendColor}`}>
                {card.isIncrease ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                <span className="font-medium text-[14px] text-sm ml-1">
                  {card.percentage}
                </span>
              </div>

              <span className="text-gray-500 text-[13px]">{card.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Usercards;
