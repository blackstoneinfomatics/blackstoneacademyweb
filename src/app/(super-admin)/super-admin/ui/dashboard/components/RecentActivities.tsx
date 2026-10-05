"use client";

import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";

interface Activity {
  date: string;
  type: string;
  activity?: string;
  activityMessage: string;
  tenantId: string;
  tenantName: string;
  plan: string;
  status: string;
  createdDate: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    activities: Activity[];
  };
}

const RecentActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const formatActivityTime = (createdDate: string) => {
    const created = new Date(createdDate);
    const now = new Date();

    const diffMs = now.getTime() - created.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    // Less than 1 minute
    if (diffMinutes < 1) {
      return "Just now";
    }

    // Less than 1 hour
    if (diffMinutes < 60) {
      return `${diffMinutes} min${diffMinutes > 1 ? "s" : ""} ago`;
    }

    // Less than 24 hours
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    }

    // 24 hours or more
    return created.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "http://localhost:5001/analytics/tenant-subscription-activities"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();

        if (result.success && result.data?.activities) {
          setActivities(result.data.activities);
        }
      } catch (error) {
        console.error("Failed to fetch recent activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, []);

  return (
    <div className="h-full min-w-0 rounded-xl bg-white p-5 shadow-[0_6px_19px_rgba(153,153,153,0.15)] dark:bg-[#343434]">
      <div className="flex justify-between">
        <h2 className="font-semibold mb-4 text-[16px]">
          Recent Activities
        </h2>
      </div>

      <div className="mt-2 h-[17rem] space-y-3 overflow-y-auto scrollbar-none">
        {loading ? (
          <div className="text-xs text-gray-400">
            Loading activities...
          </div>
        ) : activities.length === 0 ? (
          <div className="text-xs text-gray-400">
            No recent activities
          </div>
        ) : (
          activities.slice(0, 5).map((item) => (
            <div
              key={`${item.tenantId}-${item.createdDate}-${item.type}`}
              className="pb-2 text-xs flex gap-2"
            >
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-[#E4E7F4] dark:bg-[#9ea8b6]">
                <Users className="w-4 h-4 text-[#4D5BF6]" />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <p className="break-words">{item.activityMessage}</p>

                <p className="text-[9px] text-gray-500 dark:text-gray-400">
                  {formatActivityTime(item.createdDate)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivities;