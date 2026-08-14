"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users } from "lucide-react";
import { TbBrandDatabricks } from "react-icons/tb";
import { FaCircleCheck } from "react-icons/fa6";
import { IoWalletOutline } from "react-icons/io5";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

const StatsCards = () => {
  const [dashboard, setDashboard] = useState({
    totalPlans: 0,
    activePlans: 0,
    totalTenants: 0,
    monthlyRevenue: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard();
  }, []);

  const getDashboard = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.PLAN_CARD_COUNT}`);

      setDashboard(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "Total Plans",
      value: dashboard.totalPlans,
      icon: TbBrandDatabricks,
      iconBg: "bg-[#E5DFFD]",
      iconColor: "text-[#5225FC]",
      titleColor: "text-[#5225FC]",
      trend: "All Subscription Plans",
    },
    {
      title: "Active Plan",
      value: dashboard.activePlans,
      icon: FaCircleCheck,
      iconBg: "bg-[#E3F4E7]",
      iconColor: "text-[#40BD5F]",
      titleColor: "text-[#40BD5F]",
      trend: "Currently Active Plans",
    },
    {
      title: "Total Tenants",
      value: dashboard.totalTenants,
      icon: Users,
      iconBg: "bg-[#DEEEFD]",
      iconColor: "text-[#1E92F8]",
      titleColor: "text-[#1E92F8]",
      trend: "Subscribed Tenants",
    },
    {
      title: "Monthly Revenue",
      value: `₹${dashboard.monthlyRevenue.toLocaleString()}`,
      icon: IoWalletOutline,
      iconBg: "bg-[#FCF0DC]",
      iconColor: "text-[#F59E0B]",
      titleColor: "text-[#F59E0B]",
      trend: "vs Last Month",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-36 rounded-2xl bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={index}
            className="bg-gradient-to-b from-[#ffffff] to-[#F6F6FF] rounded-2xl px-4 py-3 shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-full mt-2 flex items-center justify-center ${card.iconBg}`}
              >
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>

              <div className="space-y-2">
                <p className={`text-md mt-1 font-medium ${card.titleColor}`}>
                  {card.title}
                </p>

                <h2 className="text-[25px] font-semibold text-gray-800">
                  {card.value}
                </h2>
              </div>
            </div>

            <p className="text-sm mt-3 ml-[70px] text-[#646464]">
              {card.trend}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;