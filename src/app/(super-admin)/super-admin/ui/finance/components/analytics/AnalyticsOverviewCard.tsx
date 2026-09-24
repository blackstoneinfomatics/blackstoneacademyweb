"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import StatsCard from "../../../../components/StatsCard";
import { FaClipboardCheck } from "react-icons/fa6";
import { LuIndianRupee } from "react-icons/lu";

// Define API response interface
interface FinanceCountApiResponse {
  success: boolean;
  message: string;
  data: {
    cards: {
      totalRevenue: { value: number; percentageChange: number; trend: "UP" | "DOWN" };
      collected: { value: number; percentageChange: number; trend: "UP" | "DOWN" };
      pending: { value: number; percentageChange: number; trend: "UP" | "DOWN" };
      refunded: { value: number; percentageChange: number; trend: "UP" | "DOWN" };
    };
  };
}

const AnalyticsOverviewCard = () => {
  // State to hold API values
  const [values, setValues] = useState({
    totalRevenue: 0,
    collected: 0,
    pending: 0,
    refunded: 0,
  });
  
  const [trends, setTrends] = useState({
    totalRevenue: { isPositive: true, percentage: 0 },
    collected: { isPositive: true, percentage: 0 },
    pending: { isPositive: true, percentage: 0 },
    refunded: { isPositive: true, percentage: 0 },
  });

  const [isLoading, setIsLoading] = useState(true);

  // Fetch Finance Analytics API
  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<FinanceCountApiResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.FINANCE.GET_ANALYTICS_COUNT}`,
        );

        if (response.data.success) {
          const apiData = response.data.data.cards;

          setValues({
            totalRevenue: apiData.totalRevenue.value,
            collected: apiData.collected.value,
            pending: apiData.pending.value,
            refunded: apiData.refunded.value,
          });

          setTrends({
            totalRevenue: {
              isPositive: apiData.totalRevenue.trend === "UP",
              percentage: apiData.totalRevenue.percentageChange,
            },
            collected: {
              isPositive: apiData.collected.trend === "UP",
              percentage: apiData.collected.percentageChange,
            },
            pending: {
              isPositive: apiData.pending.trend === "UP",
              percentage: apiData.pending.percentageChange,
            },
            refunded: {
              isPositive: apiData.refunded.trend === "UP",
              percentage: apiData.refunded.percentageChange,
            },
          });
        }
      } catch (error) {
        console.error("Failed to fetch finance analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinanceData();
  }, []);

  // ✅ Dynamic cards array based on API response
  const cards = [
    {
      title: "Total Revenue",
      value: `₹${values.totalRevenue.toLocaleString("en-IN")}`, // Formats as ₹47,200
      percentage: Math.abs(trends.totalRevenue.percentage), // ✅ Added percentage
      image: "/assets/images/TotalSub.svg",
      iconBg: "bg-[#EEE9FF] dark:bg-[#40386B]",
      titleColor: "text-[#5225FC]",
      trendValue: `${Math.abs(trends.totalRevenue.percentage)}%`,
      trendLabel: "vs last Month",
      trendColor: trends.totalRevenue.isPositive ? "text-[#377E36]" : "text-[#D34645]",
      isPositive: trends.totalRevenue.isPositive,
    },
    {
      title: "Collected",
      value: `₹${values.collected.toLocaleString("en-IN")}`,
      percentage: Math.abs(trends.collected.percentage), // ✅ Added percentage
      icon: FaClipboardCheck,
      iconBg: "bg-[#E8F8EA] dark:bg-[#294D32]",
      titleColor: "text-[#40BD5F]",
      trendValue: `${Math.abs(trends.collected.percentage)}%`,
      trendLabel: "vs last Month",
      trendColor: trends.collected.isPositive ? "text-[#377E36]" : "text-[#D34645]",
      isPositive: trends.collected.isPositive,
    },
    {
      title: "Pending",
      value: `₹${values.pending.toLocaleString("en-IN")}`,
      percentage: Math.abs(trends.pending.percentage), // ✅ Added percentage
      icon: LuIndianRupee,
      iconBg: "bg-[#FFF3DF] dark:bg-[#5A4524]",
      titleColor: "text-[#F59E0B]",
      trendValue: `${Math.abs(trends.pending.percentage)}%`,
      trendLabel: "vs last Month",
      trendColor: trends.pending.isPositive ? "text-[#377E36]" : "text-[#D34645]",
      isPositive: trends.pending.isPositive,
    },
    {
      title: "Refunded",
      value: `₹${values.refunded.toLocaleString("en-IN")}`,
      percentage: Math.abs(trends.refunded.percentage), // ✅ Added percentage
      image: "/assets/images/goalert.svg",
      iconBg: "bg-[#FDEAEA] dark:bg-[#5A3030]",
      titleColor: "text-[#D34645]",
      trendValue: `${Math.abs(trends.refunded.percentage)}%`,
      trendLabel: "vs last Month",
      trendColor: trends.refunded.isPositive ? "text-[#377E36]" : "text-[#D34645]",
      isPositive: trends.refunded.isPositive,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {isLoading ? (
        <div className="col-span-full py-10 text-center text-gray-500 dark:text-gray-400">
          Loading finance data...
        </div>
      ) : (
        cards.map((card) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            percentage={card.percentage}
            isPositive={card.isPositive}
            icon={card.icon}
            image={card.image}
            iconBg={card.iconBg}
            titleColor={card.titleColor}
          />
        ))
      )}
    </div>
  );
};

export default AnalyticsOverviewCard;