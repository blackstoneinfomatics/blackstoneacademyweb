"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import axios from "axios";

const formatSubscriptionDate = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

interface Props {
  tenantId?: string;
}

interface TenantFeatures {
  [role: string]: string[];
}

interface TenantSubscription {
  tenantId?: string;
  billingCycle?: number;
  status?: string;
  nextRenewalDate?: string | null;
  planName?: string;
  price?: number;
  features?: TenantFeatures;
}

export default function SubscriptionCard({ tenantId }: Props) {
  const [tenant, setTenant] = useState<TenantSubscription | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tenantId) return;

    const getTenant = async () => {
      try {
        setLoading(true);
        // Use tenant-subscription endpoint which returns subscription details in `data`
        const url = `${AppApiEndpoints.API_END_POINT}/tenant-subscription/${tenantId}`;
        const resp = await axios.get(url);
        // API returns { success, message, data }
        const payload = resp.data?.data ?? resp.data;
        setTenant(payload as TenantSubscription);
      } catch (err) {
        console.error("Failed to load tenant subscription", err);
      } finally {
        setLoading(false);
      }
    };

    getTenant();
  }, [tenantId]);

  const tenantFeatures = tenant?.features;

  const roleOrder = ["ADMIN", "TEACHER", "STUDENT"];

  // Build a map of role -> features. If tenant.features exists, use it; otherwise put all default features under 'FEATURES'
  const featuresByRole: Record<string, string[]> = {};

  if (tenantFeatures) {
    // Ensure roles in roleOrder appear first
    roleOrder.forEach((r) => {
      featuresByRole[r] = tenantFeatures[r]
        ? Array.from(new Set(tenantFeatures[r]))
        : [];
    });

    // Include any other roles returned by API
    Object.keys(tenantFeatures).forEach((r) => {
      if (!featuresByRole[r]) {
        featuresByRole[r] = Array.from(new Set(tenantFeatures[r]));
      }
    });
  }

  const extraRoles = Object.keys(featuresByRole).filter(
    (r) => !roleOrder.includes(r),
  );
  const displayRoles = [
    ...roleOrder.filter(
      (r) => featuresByRole[r] && featuresByRole[r].length > 0,
    ),
    ...extraRoles,
  ];

  const prettyRole = (role: string) =>
    role === "FEATURES"
      ? "Features"
      : role
          .toLowerCase()
          .replace(/[_-]/g, " ")
          .split(" ")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ");

  const columns = Math.min(Math.max(displayRoles.length, 1), 4);
  return (
    <div className="w-full rounded-xl bg-white dark:bg-[#343434] p-7 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)]">
      <div className="flex gap-8 flex-wrap xl:flex-nowrap">
        {/* LEFT SECTION */}
        <div className="w-[340px] shrink-0">
          {/* Icon + Details */}
          <div className="flex gap-5">
            {/* Icon */}
            <div className="flex h-[112px] w-[112px] items-center justify-center rounded-[24px] bg-[#ECEBFF] dark:bg-[#3A3A5C]">
              <Image
                src="/assets/images/Vectors%20(2).png"
                alt="Enterprise"
                width={60}
                height={60}
                className="dark:brightness-90"
              />
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center">
              <span className="w-fit rounded-full bg-[#E9FAEF] dark:bg-green-900/30 px-4 py-[5px] text-[12px] font-semibold text-[#27AE60] dark:text-green-400">
                {loading ? "Loading" : tenant?.status || "Active"}
              </span>

              <h2 className="mt-3 text-[18px] leading-none text-[#16213E] font-semibold dark:text-white">
                {tenant?.planName || "Enterprise"}
              </h2>

              <p className="mt-2 text-[12px] font-medium text-[#545454] dark:text-gray-300">
                {typeof tenant?.billingCycle !== "undefined"
                  ? tenant.billingCycle === 0
                    ? "Yearly Subscription"
                    : "Monthly Subscription"
                  : "Subscription"}
              </p>

              <div className="mt-4 flex items-end">
                <span className="text-[28px] font-bold leading-none text-[#111827] dark:text-white">
                  {tenant?.price != null && tenant.price !== 0
                    ? `$${tenant.price}`
                    : tenant?.price === 0
                      ? "$0"
                      : "$8,500"}
                </span>

                <span className="ml-2 mb-[4px] text-[14px] text-[#111827] dark:text-gray-300">
                  {typeof tenant?.billingCycle !== "undefined"
                    ? tenant.billingCycle === 0
                      ? "/ year"
                      : "/ month"
                    : "/ year"}
                </span>
              </div>

              <p className="mt-4 text-[14px] text-[#111827] dark:text-gray-300">
                Next Billing on{" "}
                <span className="font-semibold text-[#5669D8] dark:text-[#8296E6]">
                  {formatSubscriptionDate(tenant?.nextRenewalDate)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION START */}
        <div
          className="grid flex-1 gap-x-4 gap-y-4"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {displayRoles.map((role) => (
            <div key={role} className="space-y-2">
              <div className="mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F1F5F9] text-sm font-semibold text-[#334155] dark:bg-[#0B1220] dark:text-gray-200">
                  {prettyRole(role)}
                </span>
              </div>

              <div className="space-y-2">
                {(featuresByRole[role] || []).map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-md bg-[#EEF9F2] dark:bg-[#2C3A3A] px-3 py-2"
                  >
                    <Check
                      size={16}
                      strokeWidth={3}
                      className="text-[#10B981] dark:text-[#4ADE80]"
                    />
                    <span className="text-[13px] font-semibold text-[#24324B] dark:text-gray-200">
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
