"use client";

import React, { useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { BsCurrencyRupee } from "react-icons/bs";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import Image from "next/image";
import axios from "axios";

// 1. Define exact TypeScript interface based on your Thunder Client JSON
interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    totalSubscriptions: { count: number; percentage: number };
    activeSubscriptions: { count: number; percentage: number };
    monthlyRevenue: { amount: number; percentage: number };
    convertedSubscriptions: { amount: number; percentage: number };
  };
}

const Card = () => {
  const [data, setData] = useState<ApiResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Real-time API Fetch
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<ApiResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT_SUBSCRIPTION.GET_ANALYTICS_CARD}`,
        );
        
        // 3. Store the nested 'data' object from the API response
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch subscription analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // 4. Helper to format numbers with commas (e.g., 69000 -> 69,000)
  const formatNumber = (num: number) => {
    return num.toLocaleString("en-IN"); // Indian number system (uses commas like 69,000)
    // Use "en-US" if you want 69,000 (same) or 100,000. For Indian style use "en-IN".
  };

  // 5. Map the API nested data to your UI cards (with Dark Mode support)
  const cards = data ? [
    {
      title: "Total Subscription",
      value: formatNumber(data.totalSubscriptions.count), // Full number
      icon: "/assets/images/TotalSub.svg",
      iconBg: "bg-[#E5DFFD] dark:bg-[#3A3A5C]",
      iconColor: "text-[#5225FC] dark:text-[#8B7DFF]",
      titleColor: "text-[#5225FC] dark:text-[#8B7DFF]",
      trend: "All Subscriptions Plan",
      iconSize: 24,
    },
    {
      title: "Active Subscriptions",
      value: formatNumber(data.activeSubscriptions.count), // Full number
      icon: FaCircleCheck,
      iconBg: "bg-[#E3F4E7] dark:bg-[#2A3A3A]",
      iconColor: "text-[#40BD5F] dark:text-[#4ADE80]",
      titleColor: "text-[#40BD5F] dark:text-[#4ADE80]",
      trend: "Currently Active Plan",
      iconSize: 24,
    },
    {
      title: "Monthly Revenue",
      value: `₹${formatNumber(data.monthlyRevenue.amount)}`, // Full number with ₹ symbol
      icon: BsCurrencyRupee,
      iconBg: "bg-[#FCF0DC] dark:bg-[#3A3520]",
      iconColor: "text-[#F59E0B] dark:text-[#FBBF24]",
      titleColor: "text-[#F59E0B] dark:text-[#FBBF24]",
      trend: "Subscribed Tenants",
      iconSize: 24,
    },
    {
      title: "Converted To Paid",
      value: formatNumber(data.convertedSubscriptions.amount), // Full number
      icon: "/assets/images/converted-to-paid.svg",
      iconBg: "bg-[#e7e9fe] dark:bg-[#3A3A5C]",
      iconColor: "text-[#6571ff] dark:text-[#8B7DFF]",
      titleColor: "text-[#6571ff] dark:text-[#8B7DFF]",
      trend: "vs last Month",
      iconSize: 54,
    },
  ] : [];

  return (
    <div className="grid grid-cols-4 gap-4">
      {isLoading ? (
        <div className="col-span-4 text-center py-10 text-gray-500 dark:text-gray-400">
          Loading analytics...
        </div>
      ) : (
        cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              className="bg-gradient-to-b from-[#ffffff] to-[#F6F6FF] dark:from-[#2c2c2c] dark:to-[#343434] rounded-2xl px-4 py-3 shadow-lg border border-transparent dark:border-gray-700/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-full mt-2 flex items-center justify-center ${card.iconBg} transition-colors`}
                >
                  {typeof card.icon === "string" ? (
                    <Image
                      src={card.icon}
                      alt={card.title}
                      width={card.iconSize}
                      height={card.iconSize}
                      className="dark:brightness-90"
                    />
                  ) : (
                    <card.icon className={`w-6 h-6 ${card.iconColor} transition-colors`} />
                  )}
                </div>

                <div className="space-y-2">
                  <p
                    className={`text-md mt-[4px] font-medium ${card.titleColor} transition-colors`}
                  >
                    {card.title}
                  </p>
                  <h2 className="text-[25px] font-semibold text-gray-800 dark:text-white mt-1">
                    {card.value}
                  </h2>
                </div>
              </div>

              <p className="text-sm mt-3 ml-[70px] flex flex-row gap-1">
                <span className="flex flex-row gap-x-1 text-[#646464] dark:text-gray-400">
                  {card.trend}
                </span>
              </p>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Card;