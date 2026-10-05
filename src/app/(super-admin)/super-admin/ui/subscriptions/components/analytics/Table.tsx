"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

// Define the API response structure exactly as Thunder Client showed
interface ActivityApiResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    activities: Array<{
      _id?: string;
      date: string;
      type: string;
      activity: string;
      tenantName: string;
      planName: string;
    }>;
  };
}

// Define the UI data structure for your table
interface TableItem {
  tenantName: string;
  details: string;
  date: string;
  activity: number | string;
  status: string;
}

/**
 * Format any date string into "Sep 23, 2026".
 * Uses the API's raw date value — nothing hardcoded.
 */
const formatDateLabel = (value?: string): string => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const Table = () => {
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedAnalytics, setSelectedAnalytics] = useState<any>(null);

  // State for API data
  const [recentItems, setRecentItems] = useState<TableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time API fetch
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<ActivityApiResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ANALYTICS.TENANT_SUBSCRIPTION_ACTIVITIES}`,
        );

        if (response.data.success) {
          const activities = response.data.data.activities || [];

          const mappedData: TableItem[] = activities.map((item) => ({
            tenantName: item.tenantName || "N/A",
            details: item.planName || "N/A",
            date: formatDateLabel(item.date),
            activity:
              item.type === "Payment Transaction"
                ? "Payment"
                : item.activity || 0,
            status: item.activity || "Active",
          }));

          setRecentItems(mappedData);
        }
      } catch (error) {
        console.error("Failed to fetch tenant subscription activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="bg-white shadow-lg dark:bg-[#343434] rounded-2xl border border-transparent dark:border-gray-700/50 transition-colors flex flex-col h-full">
      <div className="overflow-x-auto overflow-y-auto scrollbar-none flex-1 rounded-2xl">
        <table className="min-w-full text-xs border-collapse table-fixed">
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[20%]" />
            <col className="w-[38%]" />
            <col className="w-[20%]" />
          </colgroup>

          <thead className="text-[14px] bg-[#4C6993] text-white dark:bg-[#44699d] sticky top-0 z-10">
            <tr>
              {[
                "Date & time",
                "Activity",
                "Tenant Name & Details",
                "Status",
              ].map((header) => (
                <th
                  key={header}
                  className="py-4 px-2 font-medium text-left border border-[#466993]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-4 text-center dark:text-gray-400"
                >
                  Loading activities...
                </td>
              </tr>
            ) : recentItems.length > 0 ? (
              recentItems.map((item, index) => (
                <tr
                  key={index}
                  className="text-[12px] odd:bg-[#f8f8f8] even:bg-[#ffffff] dark:odd:bg-[#2c2c2c] dark:even:bg-[#303030] transition-colors"
                >
                  <td className="py-4 px-2 dark:text-white">{item.date}</td>
                  <td className="py-4 px-2 dark:text-white">
                    {item.activity}
                  </td>
                  <td className="py-4 px-2 dark:text-white">
                    {item.tenantName} & {item.details}
                  </td>
                  <td className="py-4 px-2">
                    <span
                      className={`inline-flex items-center justify-center text-center whitespace-nowrap min-w-[110px] h-[26px] px-3 text-[12px] rounded-md ${item.status === "Active"
                        ? "bg-[#E4F4E8] text-[#40BD5F] dark:bg-[#2A3A3A] dark:text-[#4ADE80]"
                        : item.status === "Expired"
                          ? "bg-[#F6E0E0] text-[#EA4F4F] dark:bg-[#3A2A2A] dark:text-[#F87171]"
                          : "bg-[#F6EcDC] text-[#EFA133] dark:bg-[#3A3520] dark:text-[#FBBF24]"
                        }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="p-4 text-center dark:text-gray-400"
                >
                  No activities found for today
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAnalyticsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[650px] rounded-xl bg-white dark:bg-[#2C2C2C] shadow-2xl border border-transparent dark:border-gray-700/50">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-5 py-4">
              <h2 className="text-[20px] font-semibold text-[#101B41] dark:text-white">
                Analytics Details
              </h2>

              <button onClick={() => setShowAnalyticsModal(false)}>
                <X
                  size={22}
                  className="text-gray-400 hover:text-black dark:hover:text-white"
                />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              <div className="rounded-xl border border-[#E4E8F1] dark:border-gray-600 p-4">
                {/* Tenant Name */}
                <div className="mb-5">
                  <label className="mb-2 block text-[15px] font-medium text-[#101B41] dark:text-gray-200">
                    Tenant Name
                  </label>

                  <input
                    readOnly
                    value={selectedAnalytics?.tenantName || ""}
                    className="h-11 w-full rounded-md border border-[#D8DDE8] dark:border-gray-600 bg-white dark:bg-[#2C2C2C] px-4 text-sm text-[#4B5563] dark:text-gray-300 outline-none transition-colors"
                  />
                </div>

                {/* Date & Activity */}
                <div className="mb-5 grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-[15px] font-medium text-[#101B41] dark:text-gray-200">
                      Trial Start Date
                    </label>

                    <input
                      readOnly
                      value={selectedAnalytics?.date || ""}
                      className="h-11 w-full rounded-md border border-[#D8DDE8] dark:border-gray-600 bg-white dark:bg-[#2C2C2C] px-4 text-sm text-[#4B5563] dark:text-gray-300 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[15px] font-medium text-[#101B41] dark:text-gray-200">
                      Activity
                    </label>

                    <input
                      readOnly
                      value={selectedAnalytics?.activity || ""}
                      className="h-11 w-full rounded-md border border-[#D8DDE8] dark:border-gray-600 bg-white dark:bg-[#2C2C2C] px-4 text-sm text-[#4B5563] dark:text-gray-300 transition-colors outline-none"
                    />
                  </div>
                </div>

                {/* Details */}
                <div>
                  <label className="mb-2 block text-[15px] font-medium text-[#101B41] dark:text-gray-200">
                    Details
                  </label>

                  <input
                    readOnly
                    value={selectedAnalytics?.details || ""}
                    className="h-11 w-full rounded-md border border-[#D8DDE8] dark:border-gray-600 bg-white dark:bg-[#2C2C2C] px-4 text-sm text-[#4B5563] dark:text-gray-300 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;