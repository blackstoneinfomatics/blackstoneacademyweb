"use client";

import React, { useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { FaRegClock } from "react-icons/fa";
import { GoAlertFill } from "react-icons/go";
import Image from "next/image";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface InvoiceDashboardData {
  totalInvoices: {
    count: number;
    previousMonthCount: number;
    percentageChange: number;
    trend: "UP" | "DOWN" | "NO_CHANGE";
  };

  paidInvoices: {
    count: number;
    previousMonthCount: number;
    percentageChange: number;
    trend: "UP" | "DOWN" | "NO_CHANGE";
  };

  pendingInvoices: {
    count: number;
    previousMonthCount: number;
    percentageChange: number;
    trend: "UP" | "DOWN" | "NO_CHANGE";
  };

  overdueInvoices: {
    count: number;
    previousMonthCount: number;
    percentageChange: number;
    trend: "UP" | "DOWN" | "NO_CHANGE";
  };
}

const Card = () => {
  const [dashboard, setDashboard] =
    useState<InvoiceDashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInvoiceDashboard();
  }, []);

  const getInvoiceDashboard = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        (`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.INVOICE.GET_INVOICE_CARD_COUNT}`)
      );

      if (response.data.success) {
        setDashboard(response.data.data);
      }
    } catch (error) {
      console.error(
        "Subscription Invoice Dashboard Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const getTrendText = (
    percentage: number,
    trend: "UP" | "DOWN" | "NO_CHANGE"
  ) => {
    if (trend === "UP") {
      return `↑ ${percentage}%`;
    }

    if (trend === "DOWN") {
      return `↓ ${percentage}%`;
    }

    return `- ${percentage}%`;
  };

const getTrendColor = (
  trend: "UP" | "DOWN" | "NO_CHANGE"
) => {
  if (trend === "UP") {
    return "text-[#40BD5F]";
  }

  if (trend === "DOWN") {
    return "text-[#D34645]";
  }

  return "text-[#646464]";
};

  const cards = dashboard
    ? [
        {
          title: "Total Invoices",
          value: dashboard.totalInvoices.count,
          icon: "/assets/images/TotalInvoices.svg",
          iconBg: "bg-[#E5DFFD]",
          iconColor: "text-[#5225FC]",
          titleColor: "text-[#5225FC]",

          percentage: dashboard.totalInvoices.percentageChange,
          trend: dashboard.totalInvoices.trend,
        },

        {
          title: "Paid Invoices",
          value: dashboard.paidInvoices.count,
          icon: FaCircleCheck,
          iconBg: "bg-[#E3F4E7]",
          iconColor: "text-[#40BD5F]",
          titleColor: "text-[#40BD5F]",

          percentage: dashboard.paidInvoices.percentageChange,
          trend: dashboard.paidInvoices.trend,
        },

        {
          title: "Pending Invoices",
          value: dashboard.pendingInvoices.count,
          icon: FaRegClock,
          iconBg: "bg-[#FCF0DC]",
          iconColor: "text-[#F59E0B]",
          titleColor: "text-[#F59E0B]",

          percentage: dashboard.pendingInvoices.percentageChange,
          trend: dashboard.pendingInvoices.trend,
        },

        {
          title: "Overdue Invoices",
          value: dashboard.overdueInvoices.count,
          icon: GoAlertFill,
          iconBg: "bg-[#F8E4E4]",
          iconColor: "text-[#D34645]",
          titleColor: "text-[#D34645]",

          percentage: dashboard.overdueInvoices.percentageChange,
          trend: dashboard.overdueInvoices.trend,
        },
      ]
    : [];

  // Loading UI
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
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-full mt-2 flex items-center justify-center ${card.iconBg}`}
              >
                {typeof card.icon === "string" ? (
                  <Image
                    src={card.icon}
                    alt={card.title}
                    width={24}
                    height={24}
                  />
                ) : (
                  <Icon
                    className={`w-6 h-6 ${card.iconColor}`}
                  />
                )}
              </div>

              {/* Title + Value */}
              <div className="space-y-2">
                <p
                  className={`text-md mt-[4px] font-medium ${card.titleColor}`}
                >
                  {card.title}
                </p>

                <h2 className="text-[25px] font-semibold text-gray-800 mt-1">
                  {card.value}
                </h2>
              </div>
            </div>

            {/* Trend */}
         <p className="text-sm mt-3 ml-[70px] flex flex-row gap-1">
  <span
    className={`font-medium ${getTrendColor(card.trend)}`}
  >
    {getTrendText(
      card.percentage,
      card.trend
    )}
  </span>

  <span className="text-[#646464] ml-1">
    vs last Month
  </span>
</p>
          </div>
        );
      })}
    </div>
  );
};

export default Card;