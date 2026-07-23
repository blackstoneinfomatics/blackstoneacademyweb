import React from "react";
import { Crown, UserRoundPlus } from "lucide-react";

const insights = [
  {
    title: "Most Popular Plan",
    subtitle: "Blackstone academy updated their plan",
    icon: Crown,
    iconBg: "bg-purple-100",
    iconColor: "text-indigo-500",
    showPercentage: false,
  },
  {
    title: "Trail Conversions",
    subtitle: "16 Conversion this month",
    icon: UserRoundPlus,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    showPercentage: true,
  },
  {
    title: "Most Popular Plan",
    subtitle: "Blackstone academy updated their plan",
    icon: Crown,
    iconBg: "bg-purple-100",
    iconColor: "text-indigo-500",
    showPercentage: false,
  },
  {
    title: "Trail Conversions",
    subtitle: "16 Conversion this month",
    icon: UserRoundPlus,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    showPercentage: true,
  },
];

const QuickInsight = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 h-full">
      {/* Header */}
      <h2 className="text-[18px] font-semibold text-[#111827] mb-6">
        Quick Insights
      </h2>

      {/* Insights List */}
      <div className="space-y-6">
        {insights.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={index} className="flex items-center justify-between">
              {/* Left */}
              <div className="flex items-start gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${item.iconBg}`}
                >
                  <Icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {/* Right */}
              {item.showPercentage && (
                <span className="text-green-600 font-semibold text-sm">
                  ↑ 14%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickInsight;