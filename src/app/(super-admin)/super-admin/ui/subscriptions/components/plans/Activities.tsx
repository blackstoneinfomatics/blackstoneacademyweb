"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

const Activities = () => {
  const [dashboard, setDashboard] = useState({
    planSummary: {
      active: {
        count: 0,
        percentage: 0,
      },
      trial: {
        count: 0,
        percentage: 0,
      },
      expired: {
        count: 0,
        percentage: 0,
      },
    },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard();
  }, []);

  const getDashboard = async () => {
    try {
      const response = await axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.PLAN_ACTIVITY}`);

      setDashboard(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-5 h-[280px] animate-pulse" />
    );
  }

  const stats = [
    {
      label: "Active",
      color: "#22C55E",
      count: dashboard.planSummary.active.count,
      percentage: dashboard.planSummary.active.percentage,
    },
    {
      label: "Trial",
      color: "#FACC15",
      count: dashboard.planSummary.trial.count,
      percentage: dashboard.planSummary.trial.percentage,
    },
    {
      label: "Expired",
      color: "#EF4444",
      count: dashboard.planSummary.expired.count,
      percentage: dashboard.planSummary.expired.percentage,
    },
  ];

  const total = stats.reduce((sum, item) => sum + item.count, 0);

  const activeDeg = (stats[0].percentage / 100) * 360;
  const trialDeg = (stats[1].percentage / 100) * 360;

  return (
    <div className="bg-white rounded-xl p-5 border border-[#ECECEC] h-full">
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6 h-full">

        {/* Donut Chart */}
        <div
          className="relative w-[170px] h-[170px] rounded-full flex-shrink-0"
          style={{
            background: `conic-gradient(
              #22C55E 0deg ${activeDeg}deg,
              #FACC15 ${activeDeg}deg ${activeDeg + trialDeg}deg,
              #EF4444 ${activeDeg + trialDeg}deg 360deg
            )`,
          }}
        >
          <div className="absolute inset-[28px] bg-white rounded-full flex flex-col items-center justify-center">
            <h2 className="text-[30px] font-bold text-[#111827]">
              {total}
            </h2>

            <p className="text-[13px]">
              Activities
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-7 mt-7 px-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: item.color,
                  }}
                />

                <span className="text-[14px]">
                  {item.label}
                </span>
              </div>

              <span className="text-[14px] font-medium">
                {item.count} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Activities;