"use client";

import StatsCard from "../../../../components/StatsCard";
import {
  ReceiptText,
  FileStack,
  Loader,
  TriangleAlert,
} from "lucide-react";
import { TbAlertTriangleFilled } from "react-icons/tb";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface StatsData {
  count: number;
  previousMonthCount: number;
  percentageChange: number;
  trend: "UP" | "DOWN" | "NO_CHANGE";
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    totalInvoices: StatsData;
    paidInvoices: StatsData;
    pendingInvoices: StatsData;
    overdueInvoices: StatsData;
  };
}

export default function TransactionOverviewCards() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInvoices: { count: 0, previousMonthCount: 0, percentageChange: 0, trend: "NO_CHANGE" as "UP" | "DOWN" | "NO_CHANGE" },
    paidInvoices: { count: 0, previousMonthCount: 0, percentageChange: 0, trend: "NO_CHANGE" as "UP" | "DOWN" | "NO_CHANGE" },
    pendingInvoices: { count: 0, previousMonthCount: 0, percentageChange: 0, trend: "NO_CHANGE" as "UP" | "DOWN" | "NO_CHANGE" },
    overdueInvoices: { count: 0, previousMonthCount: 0, percentageChange: 0, trend: "NO_CHANGE" as "UP" | "DOWN" | "NO_CHANGE" },
  });

  // Fetch stats from API
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>(
        "http://localhost:5001/custom-service-invoices/card"
      );

      console.log("Stats API Response:", response.data);

      if (response.data.success) {
        setStats(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch stats");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to fetch invoice statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Prepare stats data for display
  const transactionStats = [
    {
      title: "Total Invoices",
      value: stats.totalInvoices.count,
      percentage: stats.totalInvoices.percentageChange,
      isPositive: stats.totalInvoices.trend === "UP",
      image: "/assets/images/Vector (1).svg",
      iconBg: "bg-[#5225FC24]",
      titleColor: "text-[#5225FC]",
      icon: ReceiptText,
    },
    {
      title: "Paid Invoices",
      value: stats.paidInvoices.count,
      percentage: stats.paidInvoices.percentageChange,
      isPositive: stats.paidInvoices.trend === "UP",
      image: "/assets/images/Vector (2).svg",
      iconBg: "bg-[#40BD5F24]",
      titleColor: "text-[#40BD5F]",
      icon: FileStack,
    },
    {
      title: "Pending Invoices",
      value: stats.pendingInvoices.count,
      percentage: stats.pendingInvoices.percentageChange,
      isPositive: stats.pendingInvoices.trend === "UP",
      image: "/assets/images/Vector (3).svg",
      iconBg: "bg-[#FCAA2524]",
      titleColor: "text-[#FCAA25]",
      icon: Loader,
    },
    {
      title: "Overdue Invoices",
      value: stats.overdueInvoices.count,
      percentage: stats.overdueInvoices.percentageChange,
      isPositive: stats.overdueInvoices.trend === "UP",
      image: "/assets/images/goalert.svg",
      iconBg: "bg-[#D3464524]",
      titleColor: "text-[#D34645]",
      icon: TbAlertTriangleFilled,
    },
  ];

  if (loading) {
    return (
      <section className="w-full">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="animate-pulse">
              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
                <div className="h-20 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {transactionStats.map((card) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            percentage={card.percentage}
            isPositive={card.isPositive}
            image={card.image}
            iconBg={card.iconBg}
            titleColor={card.titleColor}
          />
        ))}
      </div>
    </section>
  );
}