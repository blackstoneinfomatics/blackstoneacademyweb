"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import StatsCard from "../../../../components/StatsCard";
import { FaCheckCircle } from "react-icons/fa";
import { BiSolidGrid } from "react-icons/bi";
import { IoCash } from "react-icons/io5";

// ✅ EXACT MATCH: Updated to match your Thunder Client response
interface BillingCardsApiResponse {
  success: boolean;
  message: string;
  data: {
    paidExpenses: { value: number; percentageChange: number; trend: "UP" | "DOWN" };
    expenseCategories: { value: number; percentageChange: number; trend: "UP" | "DOWN" };
    thisMonthExpenses: { value: number; percentageChange: number; trend: "UP" | "DOWN" };
  };
}

// Helper function to determine if a trend is positive
const isTrendPositive = (trend: "UP" | "DOWN") => trend === "UP";

// Helper to format trend percentage (e.g., 100 -> "100%")
const formatTrend = (value: number) => `${Math.abs(value)}%`;

// Helper to determine trend color based on direction
const getTrendColor = (isPositive: boolean) => 
  isPositive ? "text-[#377E36]" : "text-[#D34645]";

function BillingOverviewCards() {
  // Initial state to prevent undefined errors
  const [data, setData] = useState({
    paidExpenses: 0,
    expenseCategories: 0,
    thisMonthExpenses: 0,
  });
  const [trends, setTrends] = useState({
    paidExpenses: { percentageChange: 0, isPositive: true },
    expenseCategories: { percentageChange: 0, isPositive: true },
    thisMonthExpenses: { percentageChange: 0, isPositive: true },
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real-time API data
  useEffect(() => {
    const fetchBillingCards = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<BillingCardsApiResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.BILLING.GET_DASHBOARD_COUNT}`,
        );

        if (response.data.success) {
          const apiData = response.data.data;

          // Map exact API fields to state
          setData({
            paidExpenses: apiData.paidExpenses.value,
            expenseCategories: apiData.expenseCategories.value,
            thisMonthExpenses: apiData.thisMonthExpenses.value,
          });

          setTrends({
            paidExpenses: {
              percentageChange: apiData.paidExpenses.percentageChange,
              isPositive: isTrendPositive(apiData.paidExpenses.trend),
            },
            expenseCategories: {
              percentageChange: apiData.expenseCategories.percentageChange,
              isPositive: isTrendPositive(apiData.expenseCategories.trend),
            },
            thisMonthExpenses: {
              percentageChange: apiData.thisMonthExpenses.percentageChange,
              isPositive: isTrendPositive(apiData.thisMonthExpenses.trend),
            },
          });
        }
      } catch (error) {
        console.error("Failed to fetch billing cards:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingCards();
  }, []);

  // ✅ Cards array now includes the exact new API data
  const cards = [
    {
      title: "Paid Expenses",
      value: data.paidExpenses,
      percentage: trends.paidExpenses.percentageChange,
      isPositive: trends.paidExpenses.isPositive,
      icon: FaCheckCircle,
      iconBg: "bg-[#E8F8EA] dark:bg-[#294D32]",
      titleColor: "text-[#40BD5F]",
      trendValue: formatTrend(trends.paidExpenses.percentageChange),
      trendLabel: "vs last Month",
      trendColor: getTrendColor(trends.paidExpenses.isPositive),
    },
    {
      title: "Expense Categories",
      value: data.expenseCategories,
      percentage: trends.expenseCategories.percentageChange,
      isPositive: trends.expenseCategories.isPositive,
      icon: BiSolidGrid,
      iconBg: "bg-[#EEE9FF] dark:bg-[#40386B]",
      titleColor: "text-[#5225FC]",
      trendValue: formatTrend(trends.expenseCategories.percentageChange),
      trendLabel: "vs last Month",
      trendColor: getTrendColor(trends.expenseCategories.isPositive),
    },
    {
      title: "This Month Expenses",
      value: data.thisMonthExpenses,
      percentage: trends.thisMonthExpenses.percentageChange,
      isPositive: trends.thisMonthExpenses.isPositive,
      icon: IoCash,
      iconBg: "bg-[#E8F0FF] dark:bg-[#293E5A]",
      titleColor: "text-[#3B82F6]",
      trendValue: formatTrend(trends.thisMonthExpenses.percentageChange),
      trendLabel: "vs last Month",
      trendColor: getTrendColor(trends.thisMonthExpenses.isPositive),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {isLoading ? (
        <div className="col-span-full py-10 text-center text-gray-500 dark:text-gray-400">
          Loading billing data...
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
            iconBg={card.iconBg}
            titleColor={card.titleColor}
          />
        ))
      )}
    </div>
  );
}

export default BillingOverviewCards;