"use client";

import React, { useEffect, useState } from "react";
import { TbCalendarTime } from "react-icons/tb";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

// API Response Interfaces
interface Tenant {
  tenantId: string;
  tenantName: string;
  nextRenewalDate: string;
  daysLeft: number;
}

interface UpcomingRenewalsData {
  totalExpiryIn5Days: number;
  tenants: Tenant[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: UpcomingRenewalsData;
}

const ExpiringTenants: React.FC = () => {
  const [data, setData] = useState<UpcomingRenewalsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingRenewals = async () => {
      try {
        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.SUPER_ADMIN_DASHBOARD.GET_UPCOMING_RENEWALS}`
        );
        const result: ApiResponse = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || "Failed to fetch expiring tenants");
        }
      } catch {
        setError("Network error: Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingRenewals();
  }, []);

  // Dynamically calculate minimum days left among all tenants
  const minDaysLeft =
    data?.tenants && data.tenants.length > 0
      ? Math.min(...data.tenants.map((t) => t.daysLeft))
      : null;

  // Header dynamic tag label
  const headerTagLabel =
    minDaysLeft !== null
      ? minDaysLeft === 0
        ? "Expiring Today"
        : `In ${minDaysLeft} ${minDaysLeft === 1 ? "Day" : "Days"}`
      : "In 5 Days";

  // Header dynamic subtext
  const headerSubtext =
    minDaysLeft !== null
      ? minDaysLeft === 0
        ? "Tenant expires today"
        : `Next expiration in ${minDaysLeft} ${minDaysLeft === 1 ? "day" : "days"}`
      : "Expire with in 5 days";

  // Format total count to always display 2 digits (e.g., "01", "00", "12")
  const totalCountFormatted = String(
    data?.totalExpiryIn5Days ?? 0
  ).padStart(2, "0");

  return (
    <div
      className="
        h-[423px]
        w-full
        overflow-hidden
        rounded-2xl
        bg-white
        p-4
        shadow-[0_6px_19px_rgba(153,153,153,0.15)]
        dark:bg-[#343434] dark:shadow-xl
      "
    >
      {/* ================= HEADER CARD ================= */}
      <div
        className="
          flex
          h-[82px]
          w-full
          items-center
          gap-2
          rounded-[14px]
          bg-white
          px-2.5
          shadow-[4px_4px_10px_0px_rgba(0,0,0,0.08)]
          dark:bg-[#3b3b3b]
        "
      >
        {/* Calendar Icon */}
        <div
          className="
            flex
            h-[38px]
            w-[38px]
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[#FFF0E1]
          "
        >
          <TbCalendarTime
            size={17}
            strokeWidth={2}
            className="text-[#FF922E]"
          />
        </div>

        {/* Dynamic Text Section */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-[11px] font-medium leading-[15px] text-[#FF922E]">
            {loading ? "Loading..." : headerTagLabel}
          </p>

          <h3 className="text-[13px] font-medium leading-[18px] text-[#010e30] dark:text-white">
            Expiring Tenants
          </h3>

          <p className="text-[9px] font-normal leading-[13px] text-[#848484]">
            {loading ? "Fetching renewal data..." : headerSubtext}
          </p>
        </div>

        {/* Dynamic Number Badge */}
        <div
          className="
            flex
            h-[40px]
            w-[40px]
            shrink-0
            items-center
            justify-center
            rounded-[10px]
            bg-gradient-to-br
            from-[#FAA031]
            via-[#F48218]
            to-[#E26901]
            shadow-[inset_1px_1.5px_2px_rgba(255,255,255,0.45),inset_-1.5px_-2px_4px_rgba(0,0,0,0.22),4px_4px_10px_rgba(0,0,0,0.18)]
          "
        >
          <span className="text-[25px] font-medium leading-none text-white tracking-tight -translate-x-[0.5px]">
            {loading ? "--" : totalCountFormatted}
          </span>
        </div>
      </div>

      {/* ================= TITLE ================= */}
      <div className="mt-5 flex items-center justify-between px-2">
        <h2
          className="
            text-[16px]
            font-semibold
            leading-[28px]
            text-[#07133D]
            dark:text-white
          "
        >
          Tenants
        </h2>
      </div>

      {/* ================= TENANTS LIST ================= */}
      <div
        className="
          mt-2
          h-[240px]
          overflow-y-auto
          p-1
          scrollbar-none
        "
      >
        {loading ? (
          /* Loading Skeleton */
          <div className="flex flex-col gap-3 pt-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-[38px] w-full animate-pulse rounded-lg bg-gray-100 dark:bg-[#3b3b3b]"
              />
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex h-full items-center justify-center p-4 text-center text-xs text-red-500">
            {error}
          </div>
        ) : !data?.tenants || data.tenants.length === 0 ? (
          /* Empty State */
          <div className="flex h-full items-center justify-center text-xs font-medium text-gray-400 dark:text-gray-500">
            No upcoming tenant expiring
          </div>
        ) : (
          /* Dynamic List Rendering */
          <div className="flex flex-col">
            {data.tenants.map((tenant) => (
              <div
                key={tenant.tenantId}
                className="
                  flex
                  min-h-[46px]
                  w-full
                  items-center
                  justify-between
                  gap-5 pb-2
                "
              >
                {/* Tenant Name */}
                <p
                  className="
                    min-w-0
                    flex-1
                    truncate
                    text-[13px]
                    font-medium
                    leading-[24px]
                    text-[#292929]
                    dark:text-[#F1F1F1]
                  "
                  title={tenant.tenantName}
                >
                  {tenant.tenantName}
                </p>

                {/* Days Left Badge */}
                <span
                  className="
                    flex
                    h-[25px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-[6px]
                    bg-[#FFF4E5]
                    px-2
                    text-[9px]
                    font-medium
                    leading-none
                    text-[#FF922E]
                    dark:bg-[#4A3A2D]
                    dark:text-[#FFA85C]
                  "
                >
                  {tenant.daysLeft} {tenant.daysLeft === 1 ? "Day left" : "Days left"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpiringTenants;
