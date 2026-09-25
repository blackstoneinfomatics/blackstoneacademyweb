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

const toTitleCase = (value?: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "";

interface Props {
  tenantId?: string;
}

interface BillingPeriod {
  billingPeriodId: string;
  billingPeriod: string;
  duration: number;
  price: number;
  totalAmount?: number;
}

interface PlanModule {
  moduleId: string;
  moduleName: string;
  order?: number;
  portalId?: string;
  portalName?: string;
}

interface SubscriptionPlan {
  planId?: string;
  planName?: string;
  planDescription?: string;
  billingPeriods?: BillingPeriod[];
  modules?: PlanModule[];
}

interface TenantSubscription {
  tenantId?: string;
  billingCycle?: number;
  status?: string;
  nextRenewalDate?: string | null;
  price?: number;
  plan?: SubscriptionPlan;
}

export default function SubscriptionCard({ tenantId }: Props) {
  const [tenant, setTenant] = useState<TenantSubscription | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tenantId) return;

    const getTenant = async () => {
      try {
        setLoading(true);
        const url = `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT.TENANT_SUBSCRIPTION_LIST_CARD}/${tenantId}`;
        const resp = await axios.get(url);
        const payload = resp.data?.data ?? resp.data;
        setTenant(payload as TenantSubscription);
      } catch (err) {
        console.error("Failed to load tenant subscription", err);
        setTenant(null);
      } finally {
        setLoading(false);
      }
    };

    getTenant();
  }, [tenantId]);

  const plan = tenant?.plan;

  // billingCycle holds the duration in months; match it to the plan's billing period
  const billingPeriod =
    plan?.billingPeriods?.find((bp) => bp.duration === tenant?.billingCycle) ??
    plan?.billingPeriods?.[0];

  const periodLabel = billingPeriod?.billingPeriod ?? "";
  const periodSuffix = periodLabel
    ? periodLabel.toLowerCase() === "yearly"
      ? "/ year"
      : periodLabel.toLowerCase() === "monthly"
        ? "/ month"
        : `/ ${billingPeriod?.duration} month${billingPeriod?.duration === 1 ? "" : "s"}`
    : "";

  const price = tenant?.price ?? billingPeriod?.price;

  const modules = [...(plan?.modules ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  return (
    <div className="w-full rounded-xl bg-white dark:bg-[#343434] p-7 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)]">
      <div className="flex gap-8 flex-wrap xl:flex-nowrap">
        {/* LEFT SECTION */}
        <div className="w-[340px] shrink-0">
          <div className="flex gap-5">
            {/* Icon */}
            <div className="flex h-[112px] w-[112px] shrink-0 items-center justify-center rounded-[24px] bg-[#ECEBFF] dark:bg-[#3A3A5C]">
              <Image
                src="/assets/images/Vectors%20(2).png"
                alt={plan?.planName || "Plan"}
                width={60}
                height={60}
                className="dark:brightness-90"
              />
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center">
              <span className="w-fit rounded-full bg-[#E9FAEF] dark:bg-green-900/30 px-4 py-[5px] text-[12px] font-semibold text-[#27AE60] dark:text-green-400">
                {loading ? "Loading" : toTitleCase(tenant?.status) || "—"}
              </span>

              <h2 className="mt-3 text-[18px] leading-none text-[#16213E] font-semibold dark:text-white">
                {plan?.planName || "—"}
              </h2>

              <p className="mt-2 text-[12px] font-medium text-[#545454] dark:text-gray-300">
                {periodLabel ? `${periodLabel} Subscription` : "Subscription"}
              </p>

              <div className="mt-4 flex items-end">
                <span className="text-[28px] font-bold leading-none text-[#111827] dark:text-white">
                  {price != null ? `$${price}` : "—"}
                </span>
                {periodSuffix && (
                  <span className="ml-2 mb-[4px] text-[14px] text-[#111827] dark:text-gray-300">
                    {periodSuffix}
                  </span>
                )}
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

        {/* RIGHT SECTION: Modules */}
        <div className="flex-1 min-w-0 xl:border-l xl:border-gray-200 xl:dark:border-gray-600 xl:pl-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold text-[#16213E] dark:text-white">
              Included Modules
            </h3>
            <span className="rounded-full bg-[#ECEBFF] dark:bg-[#3A3A5C] px-3 py-[3px] text-[12px] font-semibold text-[#5669D8] dark:text-[#8296E6]">
              {modules.length}
            </span>
          </div>

          {modules.length > 0 ? (
            <div className="flex flex-wrap content-start gap-3 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#dadddb] scrollbar-track-[#fff] dark:scrollbar-thumb-gray-600 dark:scrollbar-track-transparent">
              {modules.map((module) => (
                <div
                  key={module.moduleId}
                  className="flex max-w-full items-start gap-2 rounded-lg bg-[#EEF9F2] dark:bg-[#2C3A3A] px-3 py-2"
                >
                  <span className="mt-[2px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#10B981] dark:bg-[#22C55E]">
                    <Check size={10} strokeWidth={3} className="text-white" />
                  </span>
                  <div className="min-w-0">
                    <p
                      className="truncate text-[13px] font-semibold leading-tight text-[#24324B] dark:text-gray-200"
                      title={module.moduleName}
                    >
                      {module.moduleName}
                    </p>
                    <p
                      className="mt-0.5 truncate text-[11px] leading-tight text-[#5669D8] dark:text-[#8296E6]"
                      title={module.portalName || "Unassigned Portal"}
                    >
                      {module.portalName || "Unassigned Portal"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[#7B8495] dark:text-gray-400">
              {loading ? "Loading modules..." : "No modules in this plan"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
