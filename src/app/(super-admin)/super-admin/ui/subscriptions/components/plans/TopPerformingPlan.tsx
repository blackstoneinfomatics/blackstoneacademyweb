"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface DashboardData {
  topPerformingPlan: {
    planName: string;
    subscribedTenants: number;
    revenue: number;
  };
}

const TopPerformingPlan = () => {
  const [dashboard, setDashboard] = useState<DashboardData>({
    topPerformingPlan: {
      planName: "",
      subscribedTenants: 0,
      revenue: 0,
    },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard();
  }, []);

  const getDashboard = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.GET_TOP_PERFORMING_PLAN}`
      );

      setDashboard(response.data.data);
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const plan = dashboard.topPerformingPlan;

  if (loading) {
    return (
      <div className="w-full rounded-xl bg-white p-5 shadow-sm animate-pulse h-[220px]" />
    );
  }

  return (
    <div className="w-full rounded-xl bg-white dark:bg-[#343434] p-3 shadow-sm">
      <h2 className="text-[18px] font-semibold text-[#0D1B4C] ml-2">
        Top Performing Plan
      </h2>

      <div className="flex items-center justify-between mt-2 gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-[145px] h-[150px] rounded-[16px] bg-[#EAE7F7] flex items-center justify-center">
            <svg width="100" height="90" viewBox="0 0 120 140" fill="none">
              <path
                d="M60 0
                C70 12 92 20 108 24
                V72
                C108 102 84 122 60 140
                C36 122 12 102 12 72
                V24
                C28 20 50 12 60 0Z"
                fill="#5A6FCB"
              />

              <path
                d="M60 38
                L68 58
                L90 60
                L74 74
                L79 96
                L60 84
                L41 96
                L46 74
                L30 60
                L52 58
                Z"
                fill="#EAE7F7"
              />
            </svg>
          </div>

          {/* Content */}
          <div>
            <p className="inline-block px-2 py-1 rounded-sm bg-[#ECFDF3] text-[#377E36] text-[10px] font-semibold mb-4">
              Top Performing
            </p>

            <h3 className="text-[22px] font-semibold text-[#576CBC] mb-2">
              {plan.planName || "-"}
            </h3>

            <p className="text-[14px] text-black mb-2">
              <span className="font-bold text-[16px]">
                {plan.subscribedTenants}
              </span>{" "}
              Tenants
            </p>

            <p className="text-[14px] text-black">
              <span className="font-bold text-[18px]">
                ₹{Number(plan.revenue).toLocaleString()}
              </span>{" "}
              Revenue
            </p>
          </div>
        </div>

        {/* Graph */}
        <div className="w-72 h-[160px]">
          <svg viewBox="0 0 520 220" className="w-full h-full">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8EDF3" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#E8EDF3" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path
              d="
                M20 150
                C50 190, 90 200, 130 145
                C170 90, 230 170, 275 145
                C310 125, 320 40, 370 40
                C410 40, 430 110, 470 110
                C500 110, 510 60, 520 20
                L520 220
                L20 220
                Z"
              fill="url(#areaGradient)"
            />

            <path
              d="
                M20 150
                C50 190, 90 200, 130 145
                C170 90, 230 170, 275 145
                C310 125, 320 40, 370 40
                C410 40, 430 110, 470 110
                C500 110, 510 60, 520 20"
              fill="none"
              stroke="#35597B"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TopPerformingPlan;