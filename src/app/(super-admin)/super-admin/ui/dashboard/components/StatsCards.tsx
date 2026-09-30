import React, { useEffect, useState } from "react";
import { Users, UserPlus, Clock3, LucideIcon } from "lucide-react";
import { HiArrowTrendingUp, HiArrowTrendingDown } from "react-icons/hi2";
import { HiOutlineCurrencyDollar } from "react-icons/hi2";
import { IconType } from "react-icons";

// API Response Interfaces
type Direction = "up" | "down" | "same";

interface StatDetail {
  count: number;
  percentage: number;
  direction: Direction;
}

interface DashboardCardsData {
  totalTenant: StatDetail;
  totalRevenue: StatDetail;
  subscriptions: StatDetail;
  planExpired: StatDetail;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: DashboardCardsData;
}

// UI Configuration Interfaces
interface CardConfig {
  title: string;
  value: string;
  percentage: number;
  direction: Direction;
  icon: LucideIcon | IconType;
  iconBg: string;
  iconColor: string;
  titleColor: string;
}

interface TrendResult {
  icon: React.ReactNode;
  color: string;
  text: string;
}

const StatsCards: React.FC = () => {
  const [data, setData] = useState<DashboardCardsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardCards = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/dashboard/cards"
        );
        const result: ApiResponse = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || "Failed to fetch data");
        }
      } catch (err) {
        setError("Network error: Unable to reach server");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardCards();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-gray-200 dark:bg-[#252525] rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4 bg-red-50 rounded-xl dark:bg-red-950/20">
        {error}
      </div>
    );
  }

  const cardsConfig: CardConfig[] = [
    {
      title: "Total Tenants",
      value: data?.totalTenant?.count?.toLocaleString() ?? "0",
      percentage: data?.totalTenant?.percentage ?? 0,
      direction: data?.totalTenant?.direction ?? "same",
      icon: Users,
      iconBg: "bg-[#4D5BF624] dark:bg-[#343434]",
      iconColor: "text-[#4D5BF6]",
      titleColor: "text-[#4D5BF6]",
    },
    {
      title: "Total Revenue",
      value: `$${(data?.totalRevenue?.count ?? 0).toLocaleString()}`,
      percentage: data?.totalRevenue?.percentage ?? 0,
      direction: data?.totalRevenue?.direction ?? "same",
      icon: HiOutlineCurrencyDollar,
      iconBg: "bg-[#DAEEE8] dark:bg-[#343434]",
      iconColor: "text-[#0F9E5C]",
      titleColor: "text-[#0F9E5C]",
    },
    {
      title: "Subscriptions",
      value: data?.subscriptions?.count?.toLocaleString() ?? "0",
      percentage: data?.subscriptions?.percentage ?? 0,
      direction: data?.subscriptions?.direction ?? "same",
      icon: UserPlus,
      iconBg: "bg-[#FBF2E7] dark:bg-[#343434]",
      iconColor: "text-[#ECA036]",
      titleColor: "text-[#ECA036]",
    },
    {
      title: "Plan Expiring",
      value: data?.planExpired?.count?.toLocaleString() ?? "0",
      percentage: data?.planExpired?.percentage ?? 0,
      direction: data?.planExpired?.direction ?? "same",
      icon: Clock3,
      iconBg: "bg-red-100 dark:bg-[#343434]",
      iconColor: "text-red-400",
      titleColor: "text-red-400",
    },
  ];

  const renderTrend = (direction: Direction, percentage: number): TrendResult => {
    switch (direction) {
      case "up":
        return {
          icon: <HiArrowTrendingUp className="mt-[2px]" />,
          color: "text-green-500",
          text: `${percentage}% from last month`,
        };
      case "down":
        return {
          icon: <HiArrowTrendingDown className="mt-[2px]" />,
          color: "text-red-500",
          text: `${percentage}% from last month`,
        };
      case "same":
      default:
        return {
          icon: null,
          color: "text-gray-400",
          text: "No change from last month",
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cardsConfig.map((card, index) => {
        const Icon = card.icon;
        const trend = renderTrend(card.direction, card.percentage);

        return (
          <div
            key={index}
            className="bg-[#ffffff] dark:bg-[#252525] rounded-2xl px-4 py-3 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] flex flex-col justify-between"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-full mt-3 flex items-center justify-center shrink-0 ${card.iconBg}`}
              >
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>

              <div className="space-y-1">
                <p className={`text-sm font-medium ${card.titleColor}`}>
                  {card.title}
                </p>
                <h2 className="text-[25px] font-semibold text-gray-900 dark:text-white">
                  {card.value}
                </h2>
              </div>
            </div>

            <p className="text-xs mt-3 ml-1 flex items-center gap-1 text-gray-500 dark:text-gray-400 justify-end">
              <span className={`${trend.color} flex items-center gap-1 font-medium`}>
                {trend.icon}
                {card.direction !== "same" && `${card.percentage}%`}
              </span>
              {card.direction !== "same" ? "from last month" : "No change this month"}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;