"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface TenantRevenue {
  revenue: number;
  percentage: number;
  tenantId: string;
  tenantName: string;
}

interface TenantRevenueResponse {
  success: boolean;
  data: TenantRevenue[];
}

interface RevenueAmount {
  amount: string;
  rawAmount: string;
}

interface NetRevenueAmount extends RevenueAmount {
  percentageChange: number;
  trend: "UP" | "DOWN" | "NO_CHANGE";
}

interface NetRevenueOverview {
  filter: string;
  grossRevenue: RevenueAmount;
  discount: RevenueAmount;
  tax: RevenueAmount;
  processingFee: RevenueAmount;
  refunds: RevenueAmount;
  netRevenue: NetRevenueAmount;
}

interface NetRevenueOverviewResponse {
  success: boolean;
  data: NetRevenueOverview;
}

const defaultNetRevenue: NetRevenueOverview = {
  filter: "month",
  grossRevenue: { amount: "0", rawAmount: "0" },
  discount: { amount: "0", rawAmount: "0" },
  tax: { amount: "0", rawAmount: "0" },
  processingFee: { amount: "0", rawAmount: "0" },
  refunds: { amount: "0", rawAmount: "0" },
  netRevenue: {
    amount: "0",
    rawAmount: "0",
    percentageChange: 0,
    trend: "NO_CHANGE",
  },
};

const getBadgeColor = (percentage: number) => {
  if (percentage >= 75) {
    return "bg-green-100 text-green-600 dark:bg-[#294D32] dark:text-[#A7E3B0]";
  }

  if (percentage > 0) {
    return "bg-orange-100 text-orange-500 dark:bg-[#5A4524] dark:text-[#FCD34D]";
  }

  return "bg-red-100 text-red-500 dark:bg-[#5A3030] dark:text-[#FCA5A5]";
};

const formatRevenue = (revenue: number) =>
  `₹ ${revenue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatFilterLabel = (filter: string) => {
  const labels: Record<string, string> = {
    month: "Monthly",
    year: "Yearly",
  };

  return labels[filter.toLowerCase()] ?? filter;
};

export default function RevenuebyTenantNetRevenue() {
  const [tenants, setTenants] = useState<TenantRevenue[]>([]);
  const [netRevenue, setNetRevenue] =
    useState<NetRevenueOverview>(defaultNetRevenue);
  const [selectedFilter, setSelectedFilter] = useState<"month" | "year">(
    "month",
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchTenantRevenue = async () => {
      try {
        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.REVENUE.GET_LATEST_TENANTS}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch tenant revenue");
        }

        const result: TenantRevenueResponse = await response.json();
        if (!result.success) {
          throw new Error("Unable to load tenant revenue");
        }

        setTenants(result.data);
      } catch (error) {
        console.error("Tenant revenue API error:", error);
      }
    };

    fetchTenantRevenue();

    const fetchNetRevenue = async () => {
      try {
        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.REVENUE.GET_NET_REVENUE_OVERVIEW}?filter=${selectedFilter}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch net revenue overview");
        }

        const result: NetRevenueOverviewResponse = await response.json();
        if (!result.success) {
          throw new Error("Unable to load net revenue overview");
        }

        setNetRevenue(result.data);
      } catch (error) {
        console.error("Net revenue overview API error:", error);
      }
    };

    fetchNetRevenue();
  }, [selectedFilter]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Revenue by Tenant */}
        <div className="rounded-2xl border border-transparent bg-white p-4 shadow-sm dark:border-[#454545] dark:bg-[#343434] md:p-5">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-[#242424] dark:text-white">
              Revenue by Tenant(Top 5)
            </h2>
          </div>

          {/* Tenant List */}
          <div className="space-y-4">
            {tenants.map((tenant, index) => (
              <div
                key={`${tenant.tenantId}-${index}`}
                className="flex items-center gap-3"
              >
                {/* Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8e8e8] text-[15px] font-medium text-[#333] dark:bg-[#505050] dark:text-white">
                  {tenant.tenantName.charAt(0).toUpperCase()}
                </div>

                {/* Tenant Name */}
                <div className="w-[145px] shrink-0 truncate text-[14px] font-medium text-[#3d3d3d] dark:text-[#E2E6EE] sm:w-[170px]">
                  {tenant.tenantName}
                </div>

                {/* Progress Bar */}
                <div className="relative h-[5px] flex-1 overflow-hidden rounded-full bg-[#bcbcbc] dark:bg-[#555]">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-[#6241f5]"
                    style={{
                      width: `${Math.min(Math.max(tenant.percentage, 0), 100)}%`,
                    }}
                  />
                </div>

                {/* Revenue */}
                <div className="w-[105px] shrink-0 text-right text-[16px] font-semibold text-[#303030] dark:text-white">
                  {formatRevenue(tenant.revenue)}
                </div>

                {/* Percentage */}
                <div
                  className={`w-[40px] shrink-0 rounded-[4px] px-0.5 py-1 text-center text-[10px] font-semibold ${getBadgeColor(tenant.percentage)}`}
                >
                  {tenant.percentage.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Net Revenue Overview */}
        <div className="rounded-2xl border border-transparent bg-white p-4 shadow-sm dark:border-[#454545] dark:bg-[#343434] md:p-5">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-[#242424] dark:text-white">
              Net Revenue Overview
            </h2>

            <div className="relative">
              <button
                type="button"
                aria-expanded={isFilterOpen}
                onClick={() => setIsFilterOpen((isOpen) => !isOpen)}
                className="flex items-center gap-2 rounded-md bg-[#f5f5f5] px-3 py-1.5 text-[11px] font-medium text-[#666] hover:bg-[#eaeaea] dark:bg-[#454545] dark:text-[#D1D5DB] dark:hover:bg-[#505050]"
              >
                {formatFilterLabel(selectedFilter)}
                <ChevronDown size={13} strokeWidth={2} />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 z-10 mt-1 w-24 rounded-md border border-[#e5e5e5] bg-white p-1 shadow-md dark:border-[#555] dark:bg-[#343434]">
                  {(["month", "year"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => {
                        setSelectedFilter(filter);
                        setIsFilterOpen(false);
                      }}
                      className="block w-full border-b-2 rounded px-2 py-1.5 text-left text-[11px] text-[#1d1d1d] hover:bg-[#f5f5f5] dark:text-[#D1D5DB] dark:hover:bg-[#454545]"
                    >
                      {formatFilterLabel(filter)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Revenue Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-[#3d3d3d] dark:text-[#E2E6EE]">
                Gross Revenue
              </span>
              <span
                title={`Amount: ₹ ${netRevenue.grossRevenue.amount}`}
                className="text-[14px] font-semibold text-[#333] dark:text-white"
              >
                ₹ {netRevenue.grossRevenue.rawAmount}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-[#3d3d3d] dark:text-[#E2E6EE]">
                GST
              </span>
              <span
                title={`Amount: ₹ ${netRevenue.tax.amount}`}
                className="text-[14px] font-semibold text-[#333] dark:text-white"
              >
                ₹ {netRevenue.tax.rawAmount}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-[#3d3d3d] dark:text-[#E2E6EE]">
                Processing Fee
              </span>
              <span
                title={`Amount: ₹ ${netRevenue.processingFee.amount}`}
                className="text-[14px] font-semibold text-red-500"
              >
                - ₹ {netRevenue.processingFee.rawAmount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-[#3d3d3d] dark:text-[#E2E6EE]">
                Discounts
              </span>
              <span
                title={`Amount: ₹ ${netRevenue.discount.amount}`}
                className="text-[14px] font-semibold text-red-500"
              >
                - ₹ {netRevenue.discount.rawAmount}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-[#3d3d3d] dark:text-[#E2E6EE]">
                Refunds
              </span>
              <span
                title={`Amount: ₹ ${netRevenue.refunds.amount}`}
                className="text-[14px] font-semibold text-red-500"
              >
                - ₹ {netRevenue.refunds.rawAmount}
              </span>
            </div>
          </div>

          {/* Net Revenue */}
          <div className="mt-4 border-y border-[#9ee3b0] bg-[#f3fff5] px-4 py-4 dark:border-[#467A50] dark:bg-[#203B26]">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-medium text-[#3d3d3d] dark:text-[#E2E6EE]">
                Net Revenue
              </span>

              <span
                title={`Amount: ₹ ${netRevenue.netRevenue.amount}`}
                className="text-[28px] font-semibold tracking-tight text-[#38833b] dark:text-[#A7E3B0]"
              >
                ₹ {netRevenue.netRevenue.rawAmount}
              </span>
            </div>

            <div className="mt-3 flex justify-end">
              <span
                className={`text-[11px] font-medium ${
                  netRevenue.netRevenue.trend === "DOWN"
                    ? "text-red-500"
                    : "text-[#38833b] dark:text-[#A7E3B0]"
                }`}
              >
                {netRevenue.netRevenue.trend === "DOWN" ? "↓" : "↑"}{" "}
                {Math.abs(netRevenue.netRevenue.percentageChange)}%
                <span className="ml-1 text-[#666] dark:text-[#AEB6C5]">
                  vs last Month
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
