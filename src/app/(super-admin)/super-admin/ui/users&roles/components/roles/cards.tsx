import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { MdCheckCircle } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import { HiUserGroup } from "react-icons/hi2";

const role = [
  {
    title: "Total Tenants",
    value: "28",
    icon: HiUserGroup,
    iconBg: "bg-[#E5DFFD] dark:bg-[#2F254C]",
    iconColor: "text-[#5225FC] dark:text-[#C4B5FD]",
    titleColor: "text-[#5225FC] dark:text-[#C4B5FD]",
    trendColor: "text-green-600 dark:text-green-400",
    percentage: "14%",
    isIncrease: true,
    text: "vs last Month",
  },
  {
    title: "Total User",
    value: "28",
    icon: HiUserGroup,
    iconBg: "bg-[#E2ECFC] dark:bg-[#1F2B46]",
    iconColor: "text-[#3B82F6] dark:text-[#93C5FD]",
    titleColor: "text-[#3B82F6] dark:text-[#93C5FD]",
    trendColor: "text-green-600 dark:text-green-400",
    percentage: "14%",
    isIncrease: true,
    text: "vs last Month",
  },
  {
    title: "Active User",
    value: "18",
    icon: MdCheckCircle,
    iconBg: "bg-[#E3F4E7] dark:bg-[#1F3525]",
    iconColor: "text-[#40BD5F] dark:text-[#7AE49D]",
    titleColor: "text-[#40BD5F] dark:text-[#7AE49D]",
    trendColor: "text-red-500 dark:text-red-400",
    percentage: "14%",
    isIncrease: false,
    text: "vs last Month",
  },
  {
    title: "Inactive User",
    value: "10",
    icon: MdCancel,
    iconBg: "bg-[#F8E4E4] dark:bg-[#3A1F1F]",
    iconColor: "text-[#D34645] dark:text-[#FCA5A5]",
    titleColor: "text-[#D34645] dark:text-[#FCA5A5]",
    trendColor: "text-green-600 dark:text-green-400",
    percentage: "14%",
    isIncrease: true,
    text: "vs last Month",
  },
];

const tenantcards = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {role.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={index}
            className="rounded-2xl border border-gray-200/80 bg-gradient-to-b from-[#ffffff] to-[#F6F6FF] px-4 py-3 shadow-lg transition-colors duration-300 dark:border-gray-700 dark:from-[#1f1f1f] dark:to-[#2a2a2a] dark:shadow-black/20"
          >
            <div className="flex items-start gap-4">
              <div
                className={`mt-2 flex h-14 w-14 items-center justify-center rounded-full ${card.iconBg}`}
              >
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>

              <div className="space-y-2">
                <p
                  className={`mt-[4px] text-[15px] font-medium ${card.titleColor}`}
                >
                  {card.title}
                </p>
                <h2 className="mt-1 text-[19px] font-semibold text-gray-800 dark:text-white">
                  {card.value}
                </h2>
              </div>
            </div>

            <div className="ml-[72px] mt-6 flex items-center gap-2 text-[16px]">
              <div className={`flex items-center ${card.trendColor}`}>
                {card.isIncrease ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
                <span className="ml-1 text-[14px] font-medium">{card.percentage}</span>
              </div>

              <span className="text-[13px] text-gray-500 dark:text-gray-400">
                {card.text}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default tenantcards;