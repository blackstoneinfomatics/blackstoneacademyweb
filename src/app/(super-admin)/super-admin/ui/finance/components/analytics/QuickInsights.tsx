"use client";

import Image from "next/image";
import { GoTrophy } from "react-icons/go";
import { LuCrown } from "react-icons/lu";
import type { IconType } from "react-icons";

const insights: Array<{
  id: number;
  title: string;
  subtitle: string;
  icon: string | IconType;
  iconBg: string;
  iconColor: string;
}> = [
  {
    id: 1,
    title: "Best Revenue Month",
    subtitle: "Learning management",
    icon: GoTrophy,
    iconBg: "bg-[#EDE9FE] dark:bg-[#493B70]",
    iconColor: "text-[#7C3AED] dark:text-[#C4B5FD]",
  },
  {
    id: 2,
    title: "Top Paying Tenant",
    subtitle: "Premium",
    icon: LuCrown,
    iconBg: "bg-[#DBEAFE] dark:bg-[#294B73]",
    iconColor: "text-[#1D4ED8] dark:text-[#93C5FD]",
  },
  {
    id: 3,
    title: "Collection Rate",
    subtitle: "30 mins ago",
    icon: "/assets/images/collectionrate.svg",
    iconBg: "bg-[#FEF3E0] dark:bg-[#5A4524]",
    iconColor: "text-[#B45309] dark:text-[#FCD34D]",
  },
  {
    id: 4,
    title: "Overdue Amount",
    subtitle: "30 mins ago",
    icon: LuCrown,
    iconBg: "bg-[#FEE2E2] dark:bg-[#5A3030]",
    iconColor: "text-[#EA4F4F] dark:text-[#FCA5A5]",
  },
];

export default function QuickInsights() {
  return (
    <div className="h-full rounded-2xl border border-transparent bg-white shadow-sm dark:border-[#454545] dark:bg-[#343434]">
      {/* Header */}

      <div className="px-5 pt-5 pb-2">
        <h2 className="text-[20px] font-semibold text-[#1E293B] dark:text-white">
          Quick Insights
        </h2>
      </div>

      {/* List */}

      <div className="px-5 pb-5">
        {insights.map((item) => {
          return (
            <div key={item.id} className="flex items-start gap-3 py-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.iconBg}`}
              >
                {typeof item.icon === "string" ? (
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={18}
                    height={18}
                    className={item.iconColor}
                  />
                ) : (
                  <item.icon size={18} className={item.iconColor} />
                )}
              </div>

              <div>
                <h4 className="text-[14px] font-medium text-[#1E293B] dark:text-white">
                  {item.title}
                </h4>

                <p className="text-[12px] text-[#8A94A6] dark:text-gray-300 mt-1">
                  {item.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
