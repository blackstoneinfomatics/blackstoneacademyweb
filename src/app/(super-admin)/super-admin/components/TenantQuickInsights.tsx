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
    <div className="bg-white dark:bg-[#343434] rounded-2xl shadow-sm h-full">

      {/* Header */}

      <div className="px-5 pt-5 pb-2">

        <h2 className="text-[20px] font-semibold text-[#1E293B] dark:text-white">
          Quick Insights
        </h2>

      </div>

      {/* List */}

      <div className="px-5 pb-5">

        {insights.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 py-3"
          >

            <div className="w-10 h-10 rounded-full bg-[#F2EFFF] flex items-center justify-center flex-shrink-0">

              <Image
                src={item.icon}
                alt={item.title}
                width={18}
                height={18}
              />

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
        ))}

      </div>

    </div>
  );
}