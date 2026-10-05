"use client";

import React, { useEffect, useState } from "react";

interface Subscription {
  planName: string;
  count: number;
  percentage: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    subscriptions: Subscription[];
  };
}

const chartColors = [
  "#4F46E5",
  "#F5A623",
  "#22C55E",
  "#EC4899",
  "#06B6D4",
  "#8B5CF6",
];

const SubscriptionChart = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionChart = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/analytics/chartcount"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();

        if (result.success && result.data) {
          setSubscriptions(result.data.subscriptions);
          setTotal(result.data.total);
        }
      } catch (error) {
        console.error("Failed to fetch subscription chart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionChart();
  }, []);

  /*
   * Build donut gradient
   */
  let currentPercentage = 0;

  const gradientParts = subscriptions.map((item, index) => {
    const start = currentPercentage;
    const end = currentPercentage + item.percentage;

    currentPercentage = end;

    return `${chartColors[index % chartColors.length]} ${start}% ${end}%`;
  });

  const donutGradient =
    gradientParts.length > 0
      ? `conic-gradient(${gradientParts.join(", ")})`
      : "#E5E7EB";

  /*
   * Calculate the center position of every slice.
   *
   * CSS conic-gradient starts at 12 o'clock.
   * We calculate the middle angle of each percentage slice
   * and place the percentage text at that angle.
   */
  let accumulatedPercentage = 0;

  const percentageLabels = subscriptions.map((item) => {
    const startPercentage = accumulatedPercentage;

    const middlePercentage =
      startPercentage + item.percentage / 2;

    accumulatedPercentage += item.percentage;

    // Convert percentage to degrees.
    const angle = middlePercentage * 3.6;

    // Radius from center where percentage text should appear.
    const radius = 72;

    // Convert angle to radians.
    const radians = ((angle - 90) * Math.PI) / 180;

    const x = Math.cos(radians) * radius;
    const y = Math.sin(radians) * radius;

    return {
      ...item,
      x,
      y,
    };
  });

  return (
    <div className="min-w-0 w-full max-w-full rounded-[18px] bg-white p-6 shadow-[0_6px_19px_rgba(153,153,153,0.15)] dark:bg-[#343434]">
      <h2 className="text-[16px] font-semibold text-[#111827] dark:text-white mb-6">
        Subscriptions
      </h2>

      {loading ? (
        <div className="h-[190px] flex items-center justify-center">
          <p className="text-sm text-gray-400">
            Loading...
          </p>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="h-[190px] flex items-center justify-center">
          <p className="text-sm text-gray-400">
            No subscription data available
          </p>
        </div>
      ) : (
        <div className="flex h-[190px] min-w-0 items-center justify-between pr-9 pb-3">

          {/* Left Labels */}
          <div className="h-30 min-w-0 flex-1 space-y-3 overflow-y-auto scrollbar-none">
            {subscriptions.map((item, index) => (
              <div key={item.planName} className="min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-[3px]"
                    style={{
                      backgroundColor:
                        chartColors[index % chartColors.length],
                    }}
                  />

                  <span className="min-w-0 truncate text-[13px] font-semibold text-[#111827] dark:text-white">
                    {item.planName}
                  </span>
                </div>

                <p className="text-[9px] text-gray-500 dark:text-gray-400 ml-7">
                  {item.count} ({item.percentage}%)
                </p>
              </div>
            ))}
          </div>

          {/* Donut */}
          <div
            className="relative -mt-6 aspect-square shrink-0"
            style={{ width: "min(220px, max(140px, calc(100% - 80px)))" }}
          >

            <div
              className="w-full h-full rounded-full relative"
              style={{
                background: donutGradient,
              }}
            >

              {/* Inner Hole */}
              <div className="absolute inset-[55px] bg-[#F5F7FF] dark:bg-[#343434] rounded-full flex items-center justify-center">
                <span className="text-[24px] font-bold text-[#2F3A56] dark:text-white">
                  {total}
                </span>
              </div>

              {/* Dynamic Percentage Labels */}
              {percentageLabels.map((item) => (
                <span
                  key={`${item.planName}-percentage`}
                  className="absolute text-white text-sm font-semibold pointer-events-none"
                  style={{
                    transform: `
                      translate(
                        -50%,
                        -50%
                      )
                    `,
                    left: `calc(50% + ${(item.x / 220) * 100}%)`,
                    top: `calc(50% + ${(item.y / 220) * 100}%)`,
                  }}
                >
                  {item.percentage}%
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionChart;