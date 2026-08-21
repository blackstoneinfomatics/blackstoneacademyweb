"use client";

import React, { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { X } from "lucide-react";
import axios from "axios";

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
  activity: number | string; // Your UI uses activity as a number, API returns string
  status: string;
}

const Table = () => {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
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
          "http://localhost:5001/tenant-subscription-activities"
        );

        if (response.data.success) {
          const activities = response.data.data.activities || [];

          // Map API data to match your exact UI format
          const mappedData: TableItem[] = activities.map((item) => ({
            tenantName: item.tenantName || "N/A",
            details: item.planName || "N/A",
            date: item.date ? new Date(item.date).toLocaleDateString() : "N/A",
            activity: item.type === "Payment Transaction" ? "Payment" : item.activity || 0, // Map to a readable string
            status: item.activity || "Active", // Use the status provided by API
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
    <div className="bg-white shadow-lg dark:bg-[#343434] rounded-2xl border border-transparent dark:border-gray-700/50 transition-colors">
      <div className="overflow-x-auto scrollbar-none h-full rounded-2xl">
        <div className="h-[380px] rounded-b-xl scrollbar-none">
          <table className="min-w-full text-xs border-collapse table-fixed">
            <thead className="text-[14px] bg-[#4C6993] text-white dark:bg-[#44699d]">
              <tr>
                {[
                  "Date & time",
                  "Activity",
                  "Tenant Name & Details",
                  "Status",
                  "Action",
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
                  <td colSpan={6} className="p-4 text-center dark:text-gray-400">
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
                    <td className="py-4 px-2 dark:text-white">{item.activity}</td>
                    <td className="py-4 px-2 dark:text-white">{item.tenantName} & {item.details}</td>
                    <td className="py-4 px-2">
                      <span
                        className={`px-2 text-[12px] py-[3px] rounded-md ${
                          item.status === "Active"
                            ? "bg-[#E4F4E8] text-[#40BD5F] dark:bg-[#2A3A3A] dark:text-[#4ADE80]"
                            : item.status === "Expired"
                              ? "bg-[#F6E0E0] text-[#EA4F4F] dark:bg-[#3A2A2A] dark:text-[#F87171]"
                              : "bg-[#F6EcDC] text-[#EFA133] dark:bg-[#3A3520] dark:text-[#FBBF24]"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-2 relative">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === index ? null : index)
                        }
                        className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                      >
                        <BsThreeDotsVertical size={16} />
                      </button>

                      {openMenu === index && (
                        <div className="absolute right-4 top-12 z-50 w-36 bg-white dark:bg-[#2c2c2c] rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
                          <button
                            className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#444] transition-colors"
                            onClick={() => {
                              setSelectedAnalytics(item);
                              setShowAnalyticsModal(true);
                              setOpenMenu(null);
                            }}
                          >
                            View Details
                          </button>

                          <button
                            className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-gray-100 dark:hover:bg-[#444] transition-colors"
                            onClick={() => {
                              console.log("Cancel", item);
                              setOpenMenu(null);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center dark:text-gray-400">
                    No activities found for today
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
                <X size={22} className="text-gray-400 hover:text-black dark:hover:text-white" />
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
                      className="h-11 w-full rounded-md border border-[#D8DDE8] dark:border-gray-600 bg-white dark:bg-[#2C2C2C] px-4 text-sm text-[#4B5563] dark:text-gray-300 outline-none transition-colors"
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