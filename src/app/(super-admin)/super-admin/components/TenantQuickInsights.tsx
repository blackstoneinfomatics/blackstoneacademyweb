"use client";

import Image from "next/image";

const insights = [
  {
    id: 1,
    title: "Most Used Modules",
    subtitle: "Learning management",
    icon: "/assets/images/Frame.png",
  },
  {
    id: 2,
    title: "Plan",
    subtitle: "Premium",
    icon: "/assets/images/Frame.png",
  },
  {
    id: 3,
    title: "Last Login",
    subtitle: "30 mins ago",
    icon: "/assets/images/Frame.png",
  },
  {
    id: 4,
    title: "Last Login",
    subtitle: "30 mins ago",
    icon: "/assets/images/Frame.png",
  },
  {
    id: 5,
    title: "Plan",
    subtitle: "Premium",
    icon: "/assets/images/Frame.png",
  },
];

export default function QuickInsights() {
  return (
    <div className="bg-white dark:bg-[#343434] rounded-2xl shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] h-full border border-transparent dark:border-gray-700/50 transition-colors">

      {/* Header */}
      <div className="px-5 pt-5 pb-2">
        <h2 className="text-[15px] font-semibold text-[#0B1533] dark:text-white">
          Quick Insights
        </h2>
      </div>

      {/* List */}
      <div className="px-5 pb-7">
        {insights.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#F2EFFF] dark:bg-[#3A3A5C] flex items-center justify-center flex-shrink-0 transition-colors">
              <Image
                src={item.icon}
                alt={item.title}
                width={18}
                height={18}
                className="dark:brightness-90 dark:opacity-90"
              />
            </div>

            <div>
              <h4 className="text-[14px] font-medium text-[#1E293B] dark:text-white">
                {item.title}
              </h4>

              <p className="text-[12px] text-[#8A94A6] dark:text-gray-400 mt-1 transition-colors">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}