"use client";

import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import StatsCard from "../../../../components/StatsCard";
import { useEffect, useState } from "react";

interface TransactionStat {
  count: number;
  previousMonthCount: number;
  percentageChange: number;
  trend: "UP" | "DOWN" | "NO_CHANGE";
}

interface TransactionCardsResponse {
  success: boolean;
  data: {
    totalTransactions: TransactionStat;
    successfulTransactions: TransactionStat;
    pendingTransactions: TransactionStat;
    failedTransactions: TransactionStat;
  };
}

interface TransactionCard {
  title: string;
  value: number;
  percentage: number;
  isPositive: boolean;
  image: string;
  iconBg: string;
  titleColor: string;
}

export default function TransactionOverviewCards() {
  const [transactionStats, setTransactionStats] = useState<TransactionCard[]>([
    {
      title: "Total Transactions",
      value: 0,
      percentage: 0,
      isPositive: true,
      image: "/assets/images/TotalSub.svg",
      iconBg: "bg-[#EEE9FF] dark:bg-[#40386B]",
      titleColor: "text-[#5B4CF7]",
    },
    {
      title: "Successful Transactions",
      value: 0,
      percentage: 0,
      isPositive: true,
      image: "/assets/images/ActiveSubscription.svg",
      iconBg: "bg-[#E8F8EA] dark:bg-[#294D32]",
      titleColor: "text-[#36B24A]",
    },
    {
      title: "Pending Transactions",
      value: 0,
      percentage: 0,
      isPositive: false,
      image: "/assets/images/TrialSubscription.svg",
      iconBg: "bg-[#FFF3DF] dark:bg-[#5A4524]",
      titleColor: "text-[#F59E0B]",
    },
    {
      title: "Failed Transactions",
      value: 0,
      percentage: 0,
      isPositive: false,
      image: "/assets/images/goalert.svg",
      iconBg: "bg-[#FDEAEA] dark:bg-[#5A3030]",
      titleColor: "text-[#EF4444]",
    },
  ]);

  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string>("");

  const fetchTransactionCards = async (): Promise<void> => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.INVOICE.GET_FINANCE_TRANSATION_CARDS}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transaction cards");
      }

      const result: TransactionCardsResponse = await response.json();

      if (!result.success) {
        throw new Error("Unable to load transaction statistics");
      }

      const { data } = result;

      setTransactionStats([
        {
          title: "Total Transactions",
          value: data.totalTransactions.count,
          percentage: data.totalTransactions.percentageChange,
          isPositive: data.totalTransactions.trend === "UP",
          image: "/assets/images/TotalSub.svg",
          iconBg: "bg-[#EEE9FF] dark:bg-[#40386B]",
          titleColor: "text-[#5B4CF7]",
        },

        {
          title: "Successful Transactions",
          value: data.successfulTransactions.count,
          percentage: data.successfulTransactions.percentageChange,
          isPositive: data.successfulTransactions.trend === "UP",
          image: "/assets/images/ActiveSubscription.svg",
          iconBg: "bg-[#E8F8EA] dark:bg-[#294D32]",
          titleColor: "text-[#36B24A]",
        },

        {
          title: "Pending Transactions",
          value: data.pendingTransactions.count,
          percentage: data.pendingTransactions.percentageChange,
          isPositive: data.pendingTransactions.trend === "UP",
          image: "/assets/images/TrialSubscription.svg",
          iconBg: "bg-[#FFF3DF] dark:bg-[#5A4524]",
          titleColor: "text-[#F59E0B]",
        },

        {
          title: "Failed Transactions",
          value: data.failedTransactions.count,
          percentage: data.failedTransactions.percentageChange,
          isPositive: data.failedTransactions.trend === "UP",
          image: "/assets/images/goalert.svg",
          iconBg: "bg-[#FDEAEA] dark:bg-[#5A3030]",
          titleColor: "text-[#EF4444]",
        },
      ]);
    } catch (err: unknown) {
      console.error("Transaction cards API error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load transaction statistics",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTransactionCards();
  }, []);

  return (
    <section className="w-full">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {transactionStats.map((card) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={loading ? 0 : card.value}
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
