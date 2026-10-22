"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type NotificationCounts = {
  total: number;
  seen: number;
  unseen: number;
};

const cardConfig = [
  {
    key: "total",
    title: "Total Notifications",
    description: "Received this month",
    color: "#3192ff",
    bg: "#e2f0ff",
    darkBg: "#1c3553",
    icon: "bell",
  },
  {
    key: "seen",
    title: "Seen",
    description: "Notifications acknowledged",
    color: "#35bd65",
    bg: "#e2f5e8",
    darkBg: "#1c3d30",
    icon: "eye",
  },
  {
    key: "unseen",
    title: "Unseen",
    description: "Needs attention",
    color: "#ff9f13",
    bg: "#fff3e2",
    darkBg: "#46351f",
    icon: "eye",
  },
] as const;

function readCount(
  source: Record<string, unknown>,
  keys: string[],
): number | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

function parseNotificationCounts(payload: unknown): NotificationCounts {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Unexpected notification card-details response.");
  }

  const data = payload as Record<string, unknown>;
  const nested =
    data.data && typeof data.data === "object" && !Array.isArray(data.data)
      ? (data.data as Record<string, unknown>)
      : data;

  const total = readCount(nested, [
    "total",
    "totalCount",
    "totalNotifications",
    "totalNotificationCount",
  ]);
  const seen = readCount(nested, [
    "seen",
    "seenCount",
    "seenNotifications",
    "readCount",
  ]);
  const unseen = readCount(nested, [
    "unseen",
    "unseenCount",
    "unseenNotifications",
    "unreadCount",
  ]);

  if (total === undefined || seen === undefined || unseen === undefined) {
    throw new Error("Notification card-details response is missing count fields.");
  }

  return { total, seen, unseen };
}

function NotificationIcon({ type }: { type: string }) {
  if (type === "bell") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-[17px] w-[17px]"
        fill="currentColor"
      >
        <path d="M12 22a2.2 2.2 0 0 0 2.15-1.8h-4.3A2.2 2.2 0 0 0 12 22Zm7-5-1.8-2.2V10a5.2 5.2 0 0 0-4.2-5.1V4a1 1 0 0 0-2 0v.9A5.2 5.2 0 0 0 6.8 10v4.8L5 17v1h14v-1Z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[19px] w-[19px]"
      fill="currentColor"
    >
      <path d="M12 5C6.5 5 2 12 2 12s4.5 7 10 7 10-7 10-7-4.5-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
      <circle cx="12" cy="12" r="2.1" />
    </svg>
  );
}

export default function NotificationCards() {
  const [counts, setCounts] = useState<NotificationCounts>({
    total: 0,
    seen: 0,
    unseen: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCardDetails = async () => {
      const token = localStorage.getItem("SuperAdminAuthToken");
      if (!token) {
        setError("Super-admin authentication token is missing.");
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.NOTIFICATION.CARD_DETAILS}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setCounts(parseNotificationCounts(data?.data));
      } catch (fetchError) {
        console.error("Failed to fetch notification card details:", fetchError);
        setError("Unable to load notification counts.");
      } finally {
        setLoading(false);
      }
    };

    void fetchCardDetails();
  }, []);

  return (
    <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cardConfig.map((item) => (
        <div
          key={item.key}
          className="flex h-[88px] min-w-0 flex-col justify-between rounded-[13px] bg-white px-3 py-3 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] transition-colors dark:border-[#30394b] dark:bg-[#343434] dark:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ color: item.color }}
            >
              <div
                className="flex h-full w-full items-center justify-center rounded-full dark:hidden"
                style={{ backgroundColor: item.bg }}
              >
                <NotificationIcon type={item.icon} />
              </div>
              <div
                className="hidden h-full w-full items-center justify-center rounded-full dark:flex"
                style={{ backgroundColor: item.darkBg }}
              >
                <NotificationIcon type={item.icon} />
              </div>
            </div>

            <div className="min-w-0">
              <p
                className="text-[12px] font-medium"
                style={{ color: item.color }}
              >
                {item.title}
              </p>
              <p className="mt-0.5 text-[14px] font-bold leading-5 text-[#202020] dark:text-white">
                {loading ? "…" : counts[item.key]}
              </p>
            </div>
          </div>

          <p
            className="truncate text-right text-[10px] text-[#555555] dark:text-[#aeb9ce]"
            role={error ? "status" : undefined}
            title={error ?? undefined}
          >
            {error ?? item.description}
          </p>
        </div>
      ))}
    </div>
  );
}
