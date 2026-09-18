"use client";
import React, { useEffect, useState } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Activity {
  date: string;
  type: string;
  activity: string;
  tenantId: string;
  tenantName: string;
  plan: string;
  status: string;
  createdDate: string;
  planName?: string;
  refundStatus?: string;
  refundMethod?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    activities: Activity[];
  };
}

// ─────────────────────────────────────────────
// Endpoint
// ─────────────────────────────────────────────
const API_URL =
  "http://localhost:5001/analytics/tenant-subscription-activities";

const MAX_RECORDS = 5;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const formatDateTime = (iso: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";

  const datePart = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const timePart = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${datePart} ${timePart}`;
};

const buildActivityLabel = (a: Activity): string => {
  if (a.type === "Payment Transaction") return "Payment Received";
  if (a.type === "Subscription Invoice") return "Subscription Invoice";
  if (a.type === "Tenant") return "Tenant Created";
  if (a.type === "Refund Transaction") return "Refund Issued";
  return a.type || a.activity || "Activity";
};

const getPlanName = (a: Activity): string => {
  return a.planName || a.plan || "—";
};

const getStatusLabel = (a: Activity): string => {
  return a.activity || a.status || "—";
};

const getStatusVariant = (
  raw: string
): "paid" | "pending" | "failed" | "neutral" => {
  const s = raw.toUpperCase();
  if (s.includes("SUCCESS") || s.includes("PAID") || s === "ACTIVE")
    return "paid";
  if (s.includes("PENDING")) return "pending";
  if (s.includes("FAIL") || s.includes("CANCEL")) return "failed";
  return "neutral";
};

// ─────────────────────────────────────────────
// Column config
// ─────────────────────────────────────────────
const COLUMNS = [
  { key: "date", label: "Date & Time", minWidth: "170px" },
  { key: "paymentType", label: "Payment Type", minWidth: "140px" },
  { key: "activity", label: "Activity", minWidth: "160px" },
  { key: "tenant", label: "Tenant", minWidth: "150px" },
  { key: "status", label: "Status", minWidth: "110px" },
] as const;

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const RecentActivityTable = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch ──
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ApiResponse = await res.json();

        if (!cancelled && json.success) {
          const sorted = [...(json.data.activities ?? [])].sort(
            (a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setActivities(sorted.slice(0, MAX_RECORDS));
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const colCount = COLUMNS.length;

  return (
    <div className="rounded-2xl bg-white shadow-sm dark:bg-[#343434] dark:shadow-none dark:border dark:border-[#454545]">
      {/* Header */}
      <div className="border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4 dark:border-[#454545]">
        <h2 className="text-base font-semibold text-[#101B41] sm:text-lg dark:text-white">
          Recent Activities
        </h2>
      </div>

      {/* Table wrapper */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[730px] border-collapse">
          {/* Header row — keep indigo, slightly deeper in dark */}
          <thead className="bg-[#3F5E95] text-white dark:bg-[#2A3F66]">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold sm:text-sm"
                  style={{ minWidth: col.minWidth }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="text-sm text-gray-700 dark:text-gray-200">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 dark:border-[#3F3F3F]"
                >
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="px-4 py-3 align-middle">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-[#454545]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td
                  colSpan={colCount}
                  className="px-4 py-6 text-center text-sm text-red-500 dark:text-red-400"
                >
                  Failed to load: {error}
                </td>
              </tr>
            ) : activities.length === 0 ? (
              <tr>
                <td
                  colSpan={colCount}
                  className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No recent activities
                </td>
              </tr>
            ) : (
              activities.map((item, index) => {
                const statusLabel = getStatusLabel(item);
                const statusVariant = getStatusVariant(statusLabel);

                return (
                  <tr
                    key={index}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-[#3F3F3F] dark:hover:bg-[#3A3A3A]"
                  >
                    {/* Date & Time */}
                    <td className="whitespace-nowrap px-4 py-3 align-middle">
                      {formatDateTime(item.date)}
                    </td>

                    {/* Payment Type → plan name */}
                    <td className="whitespace-nowrap px-4 py-3 align-middle font-medium text-[#101B41] dark:text-white">
                      {getPlanName(item)}
                    </td>

                    {/* Activity */}
                    <td className="whitespace-nowrap px-4 py-3 align-middle">
                      {buildActivityLabel(item)}
                    </td>

                    {/* Tenant */}
                    <td className="whitespace-nowrap px-4 py-3 align-middle">
                      {item.tenantName || "—"}
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-4 py-3 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusVariant === "paid"
                          ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300"
                          : statusVariant === "failed"
                            ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
                            : statusVariant === "pending"
                              ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-300"
                              : "bg-gray-100 text-gray-600 dark:bg-[#454545] dark:text-gray-300"
                          }`}
                      >
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentActivityTable;