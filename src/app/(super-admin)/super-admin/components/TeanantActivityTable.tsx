"use client";

import { useEffect, useState } from "react";

interface Activity {
  dateTime: string;
  role: string | null;
  activity: string;
  details: string;
  action: string;
}

interface ActivityApiResponse {
  success: boolean;
  message: string;
  data: {
    activities: Activity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface ActivityTableProps {
  tenantId: string;
}

export default function ActivityTable({
  tenantId,
}: ActivityTableProps) {
  const [activities, setActivities] = useState<Activity[]>([]);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedActivity, setSelectedActivity] =
    useState<Activity | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch activity data
  useEffect(() => {
    if (!tenantId) {
      setActivities([]);
      setLoading(false);
      setError("Tenant ID is required.");
      return;
    }

    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://localhost:5001/tenant/analytics/dashboard/activity?tenantId=${encodeURIComponent(
            tenantId,
          )}&page=${pagination.page}&limit=${pagination.limit}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ActivityApiResponse = await response.json();

        if (result.success && result.data) {
          setActivities(result.data.activities || []);

          setPagination((prev) => ({
            ...prev,
            ...(result.data.pagination || {}),
          }));
        } else {
          throw new Error(
            result.message || "Failed to fetch activities",
          );
        }
      } catch (err) {
        console.error("Failed to fetch activities:", err);
        setError("Failed to load activity data.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [tenantId, pagination.page, pagination.limit]);

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);

    return date.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getRoleName = (role: string | null) => {
    if (!role) {
      return "System";
    }

    return role
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getActionClass = (action: string) => {
    switch (action.toUpperCase()) {
      case "READ":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20";

      case "CREATE":
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";

      case "UPDATE":
        return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20";

      case "DELETE":
        return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";

      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20";
    }
  };

  const goToPage = (page: number) => {
    if (
      page < 1 ||
      (pagination.totalPages > 0 && page > pagination.totalPages)
    ) {
      return;
    }

    setPagination((prev) => ({
      ...prev,
      page,
    }));
  };

  return (
    <div className="shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] rounded-2xl bg-white dark:bg-[#343434] p-4 border border-transparent dark:border-gray-700/50 transition-colors">
      {/* Header */}
      <h2 className="text-[15px] font-semibold text-[#1E293B] dark:text-white mb-4">
        All Activity
      </h2>

      {/* Table */}
      <div className="overflow-hidden rounded-xl">
        <div className="overflow-x-auto scrollbar-none h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-[#486A99]">
              <tr>
                {[
                  "Date & Time",
                  "ROLE",
                  "Activity",
                  "Details",
                ].map((item, index) => (
                  <th
                    key={`${item}-${index}`}
                    className="px-5 py-3 text-left text-white text-[12px] font-semibold"
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Loading */}
              {loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading activity...
                  </td>
                </tr>
              )}

              {/* Error */}
              {!loading && error && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!loading &&
                !error &&
                activities.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No activity found.
                    </td>
                  </tr>
                )}

              {/* Activities */}
              {!loading &&
                !error &&
                activities.map((row, index) => {
                  const rowBgClass =
                    index % 2 === 0
                      ? "bg-white dark:bg-[#2C2C2C]"
                      : "bg-[#F8F8F8] dark:bg-[#303030]";

                  return (
                    <tr
                      className={`text-[10px] ${rowBgClass}`}
                      key={`${row.dateTime}-${index}`}
                    >
                      {/* Date */}
                      <td className="px-5 py-4 text-[12px] text-[#576CBC] whitespace-nowrap">
                        {formatDateTime(row.dateTime)}
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4 text-[12px] text-[#1E293B] dark:text-white whitespace-nowrap">
                        {getRoleName(row.role)}
                      </td>

                      {/* Activity */}
                      <td className="px-5 py-4 text-[12px] text-[#1E293B] dark:text-white">
                        <span
                          className="block truncate"
                          title={row.activity}
                        >
                          {row.activity}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="px-5 py-4 text-[12px] text-[#1E293B] dark:text-white">
                        <span
                          className="block truncate"
                          title={row.details}
                        >
                          {row.details}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}