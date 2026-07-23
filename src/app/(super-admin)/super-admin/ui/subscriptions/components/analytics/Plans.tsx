import React from "react";
import { Star, Gem, Crown } from "lucide-react";

const plans = [
  {
    name: "Basic",
    icon: Star,
    color: "text-cyan-500",
    bg: "bg-cyan-100",
    progress: "63%",
    bar: "bg-cyan-500",
  },
  {
    name: "Standard",
    icon: Gem,
    color: "text-green-500",
    bg: "bg-green-100",
    progress: "63%",
    bar: "bg-green-500",
  },
  {
    name: "Premium",
    icon: Crown,
    color: "text-indigo-500",
    bg: "bg-indigo-100",
    progress: "63%",
    bar: "bg-indigo-500",
  },
];

const Plans = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[18px] font-semibold text-gray-900">Plans</h2>

        <select className="bg-gray-100 text-gray-500 px-2 py-1 rounded-md outline-none text-xs">
          <option>Yearly</option>
        </select>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {plans.map((plan, index) => {
          const Icon = plan.icon;

          return (
            <div key={index} className="flex items-center justify-between gap-4">
              {/* Left */}
              <div className="flex items-center gap-4 min-w-[140px]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${plan.bg}`}
                >
                  <Icon className={`w-4 h-4 ${plan.color}`} />
                </div>

                <h3 className="text-md font-medium text-gray-800">
                  {plan.name}
                </h3>
              </div>

              {/* Right */}
              <div className="flex items-center gap-3 flex-1 max-w-[220px]">
                <div className="w-full bg-gray-300 rounded-full h-[6px]">
                  <div
                    className={`${plan.bar} h-[6px] rounded-full`}
                    style={{ width: plan.progress }}
                  />
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="font-semibold text-sm text-gray-800">
                    63000
                  </span>
                  <span className="text-[10px] text-gray-800">63%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Plans;