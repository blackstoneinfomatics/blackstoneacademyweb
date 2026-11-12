"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { AlertTriangle, Clock3, } from "lucide-react";
import { FaCheckCircle } from "react-icons/fa";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type TicketDashboardMetric = {
  currentCount: number;
  previousMonthCount: number;
  percentage: number;
  trend: "up" | "down" | "same";
};

type TicketDashboardCardsData = {
  totalTickets: TicketDashboardMetric;
  openTickets: TicketDashboardMetric;
  inProgressTickets: TicketDashboardMetric;
  resolvedTickets: TicketDashboardMetric;
};

type TicketDashboardCardsResponse = {
  success: boolean;
  message: string;
  data: TicketDashboardCardsData;
};

const buildCards = (data: TicketDashboardCardsData) => [
  {
    title: "Total Tickets",
    metric: data.totalTickets,
    img: "/assets/images/total-tickets.svg",
    icon: null,
    iconBg: "bg-[#E5DFFD] dark:bg-[#493D70]",
    iconColor: "text-[#5225FC]",
    titleColor: "text-[#5225FC]",
  },
  {
    title: "Open Tickets",
    metric: data.openTickets,
    img: "/assets/images/total-tickets.svg",
    icon: AlertTriangle,
    iconBg: "bg-[#dbe9f7] dark:bg-[#dbe9f7]",
    iconColor: "text-[#076CCE]",
    titleColor: "text-[#076CCE]",
  },
  {
    title: "In Progress",
    metric: data.inProgressTickets,
    img: null,
    icon: Clock3,
    iconBg: "bg-[#fdf2df] dark:bg-[#fdf2df]",
    iconColor: "text-[#FCAA25]",
    titleColor: "text-[#FCAA25]",
  },
  {
    title: "Resolved",
    metric: data.resolvedTickets,
    img: null,
    icon: FaCheckCircle,
    iconBg: "bg-[#E3F4E7] dark:bg-[#294A32]",
    iconColor: "text-[#40BD5F]",
    titleColor: "text-[#40BD5F]",
  },
];

export default function TicketDashboardCards() {
  const [data, setData] = useState<TicketDashboardCardsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardCards = async () => {
      const token = localStorage.getItem("SuperAdminAuthToken");
      if (!token) {
        setError("Super-admin authentication token is missing.");
        return;
      }

      try {
        const { data: result } = await axios.get<TicketDashboardCardsResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TICKET.GET_DASHBOARD_CARDS}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!result.success) {
          throw new Error(
            result.message || "Failed to fetch ticket dashboard cards",
          );
        }

        setData(result.data);
      } catch (fetchError) {
        console.error("Failed to fetch ticket dashboard cards:", fetchError);
        const responseMessage = axios.isAxiosError<{ message?: string }>(
          fetchError,
        )
          ? fetchError.response?.data?.message
          : undefined;
        setError(
          responseMessage ??
            (fetchError instanceof Error
              ? fetchError.message
              : "Unable to fetch ticket dashboard cards"),
        );
      }
    };

    void fetchDashboardCards();
  }, []);

  const cards = data ? buildCards(data) : [];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {error ? (
        <p className="col-span-full py-4 text-center text-sm text-red-500">
          {error}
        </p>
      ) : data ? (
        cards.map((card) => {
          const Icon = card.icon;
          const trendLabel = `${card.metric.percentage}%`;
          const trendColor =
            card.metric.trend === "up"
              ? "text-[#377E36]"
              : card.metric.trend === "down"
                ? "text-[#D34645]"
                : "text-[#646464]";

          return (
            <div
              key={card.title}
              className="rounded-2xl bg-[#ffffff] dark:bg-[#343434] px-4 py-3 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] dark:shadow-xl"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`mt-2 flex h-14 w-14 items-center justify-center rounded-full ${card.iconBg}`}
                >
                  {card.img ? (
                    <Image
                      src={card.img}
                      alt=""
                      width={24}
                      height={24}
                      aria-hidden="true"
                    />
                  ) : Icon ? (
                    <Icon className={`h-6 w-6 ${card.iconColor}`} />
                  ) : null}
                </div>
                <div className="space-y-2">
                  <p className={`mt-[4px] text-md font-medium ${card.titleColor}`}>
                    {card.title}
                  </p>
                  <h2 className="mt-1 text-[25px] font-semibold text-gray-800 dark:text-white">
                    {card.metric.currentCount.toLocaleString()}
                  </h2>
                </div>
              </div>
              <p className="ml-[70px] mt-3 flex flex-row gap-1 text-sm">
                <span className={`flex flex-row gap-x-1 ${trendColor}`}>
                  {trendLabel} from last month
                </span>
              </p>
            </div>
          );
        })
      ) : (
        <p className="col-span-full py-4 text-center text-sm text-gray-500 dark:text-gray-300">
          Loading ticket dashboard cards...
        </p>
      )}
    </div>
  );
}
