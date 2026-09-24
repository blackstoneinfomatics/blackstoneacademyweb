"use client";

import React, { useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { HiUsers } from "react-icons/hi";
import { AiFillCloseCircle } from "react-icons/ai";
import { PiSealCheckFill } from "react-icons/pi";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";


type TrialsDashboardCounts = {
  totalTrials: number;
  activeTrials: number;
  expiredTrials: number;
  convertedTrials: number;
};

const Card = () => {
  const [counts, setCounts] = useState<TrialsDashboardCounts>({
    totalTrials: 0,
    activeTrials: 0,
    expiredTrials: 0,
    convertedTrials: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardCounts = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TRIALS.GET_TRIALS_DASHBOARD_COUNT}`,
        );

        if (response.data?.success && response.data?.data) {
          setCounts({
            totalTrials: Number(response.data.data.totalTrials) || 0,
            activeTrials: Number(response.data.data.activeTrials) || 0,
            expiredTrials: Number(response.data.data.expiredTrials) || 0,
            convertedTrials: Number(response.data.data.convertedTrials) || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching subscription trial dashboard counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardCounts();
  }, []);

  const cards = [
    {
      title: "Total Trials",
      value: counts.totalTrials,
      icon: HiUsers,
      iconBg: "bg-[#E5DFFD]",
      iconColor: "text-[#5225FC]",
      titleColor: "text-[#5225FC]",
      trend: "All Time trials",
    },
    {
      title: "Active Trials",
      value: counts.activeTrials,
      icon: FaCircleCheck,
      iconBg: "bg-[#E3F4E7]",
      iconColor: "text-[#40BD5F]",
      titleColor: "text-[#40BD5F]",
      trend: "Currently trials",
    },
    {
      title: "Expired Trials",
      value: counts.expiredTrials,
      icon: AiFillCloseCircle,
      iconBg: "bg-[#F8E4E4]",
      iconColor: "text-[#D34645]",
      titleColor: "text-[#D34645]",
      trend: "Not Converted",
    },
    {
      title: "Converted to paid",
      value: counts.convertedTrials,
      icon: PiSealCheckFill,
      iconBg: "bg-[#E7E9FE]",
      iconColor: "text-[#5E6BFF]",
      titleColor: "text-[#5E6BFF]",
      trend: "This month",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-[110px] rounded-2xl bg-gray-100 animate-pulse"
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
            className="bg-gradient-to-b from-[#ffffff] to-[#F6F6FF] dark:from-[#2c2c2c] dark:to-[#343434] rounded-2xl px-4 py-3 shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-full mt-2 flex items-center justify-center ${card.iconBg}`}
              >
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>

              <div className="space-y-2">
                <p className={`text-md mt-[4px] font-medium ${card.titleColor}`}>
                  {card.title}
                </p>
                <h2 className="text-[25px] font-semibold text-gray-800 mt-1">
                  {card.value}
                </h2>
              </div>
            </div>

            <p className='text-sm mt-3 ml-[70px] flex flex-row gap-1'>
              <span className="flex flex-row gap-x-1 text-[#646464]">{card.trend}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Card
