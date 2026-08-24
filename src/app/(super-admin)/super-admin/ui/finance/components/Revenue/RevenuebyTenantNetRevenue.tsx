"use client";

import { ChevronDown } from "lucide-react";

const tenants = [
  {
    initial: "B",
    name: "Blackstone Academy",
    revenue: "₹ 2,00,000",
    percentage: "74%",
    barWidth: "75%",
    badgeColor:
      "bg-green-100 text-green-600 dark:bg-[#294D32] dark:text-[#A7E3B0]",
  },
  {
    initial: "F",
    name: "Future Academy",
    revenue: "₹ 1,00,000",
    percentage: "50%",
    barWidth: "75%",
    badgeColor:
      "bg-orange-100 text-orange-500 dark:bg-[#5A4524] dark:text-[#FCD34D]",
  },
  {
    initial: "I",
    name: "Indian Academy",
    revenue: "₹ 20,000",
    percentage: "74%",
    barWidth: "25%",
    badgeColor: "bg-red-100 text-red-500 dark:bg-[#5A3030] dark:text-[#FCA5A5]",
  },
  {
    initial: "S",
    name: "Stone Academy",
    revenue: "₹ 20,000",
    percentage: "74%",
    barWidth: "25%",
    badgeColor: "bg-red-100 text-red-500 dark:bg-[#5A3030] dark:text-[#FCA5A5]",
  },
  {
    initial: "B",
    name: "Blackstone Academy",
    revenue: "₹ 1,00,000",
    percentage: "50%",
    barWidth: "75%",
    badgeColor:
      "bg-orange-100 text-orange-500 dark:bg-[#5A4524] dark:text-[#FCD34D]",
  },
];

export default function RevenuebyTenantNetRevenue() {
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

            <button className="flex items-center gap-2 rounded-md bg-[#f5f5f5] px-3 py-1.5 text-[11px] font-medium text-[#666] hover:bg-[#eaeaea] dark:bg-[#454545] dark:text-[#D1D5DB] dark:hover:bg-[#505050]">
              Yearly
              <ChevronDown size={13} strokeWidth={2} />
            </button>
          </div>

          {/* Tenant List */}
          <div className="space-y-4">
            {tenants.map((tenant, index) => (
              <div
                key={`${tenant.name}-${index}`}
                className="flex items-center gap-3"
              >
                {/* Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8e8e8] text-[15px] font-medium text-[#333] dark:bg-[#505050] dark:text-white">
                  {tenant.initial}
                </div>

                {/* Tenant Name */}
                <div className="w-[145px] shrink-0 truncate text-[14px] font-medium text-[#3d3d3d] dark:text-[#E2E6EE] sm:w-[170px]">
                  {tenant.name}
                </div>

                {/* Progress Bar */}
                <div className="relative h-[5px] flex-1 overflow-hidden rounded-full bg-[#bcbcbc] dark:bg-[#555]">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-[#6241f5]"
                    style={{ width: tenant.barWidth }}
                  />
                </div>

                {/* Revenue */}
                <div className="w-[105px] shrink-0 text-right text-[16px] font-semibold text-[#303030] dark:text-white">
                  {tenant.revenue}
                </div>

                {/* Percentage */}
                <div
                  className={`w-[31px] shrink-0 rounded-[4px] px-1 py-1 text-center text-[10px] font-semibold ${tenant.badgeColor}`}
                >
                  {tenant.percentage}
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

            <button className="flex items-center gap-2 rounded-md bg-[#f5f5f5] px-3 py-1.5 text-[11px] font-medium text-[#666] hover:bg-[#eaeaea] dark:bg-[#454545] dark:text-[#D1D5DB] dark:hover:bg-[#505050]">
              Yearly
              <ChevronDown size={13} strokeWidth={2} />
            </button>
          </div>

          {/* Revenue Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-[#3d3d3d] dark:text-[#E2E6EE]">
                Gross Revenue
              </span>
              <span className="text-[14px] font-semibold text-[#333] dark:text-white">
                ₹ 8,00,000
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-[#3d3d3d] dark:text-[#E2E6EE]">
                GST
              </span>
              <span className="text-[14px] font-semibold text-[#333] dark:text-white">
                ₹ 10000
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-[#3d3d3d] dark:text-[#E2E6EE]">
                Discounts
              </span>
              <span className="text-[14px] font-semibold text-red-500">
                - ₹ 35,000
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-[#3d3d3d] dark:text-[#E2E6EE]">
                Refunds
              </span>
              <span className="text-[14px] font-semibold text-red-500">
                - ₹ 50,000
              </span>
            </div>
          </div>

          {/* Net Revenue */}
          <div className="mt-4 border-y border-[#9ee3b0] bg-[#f3fff5] px-4 py-4 dark:border-[#467A50] dark:bg-[#203B26]">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-medium text-[#3d3d3d] dark:text-[#E2E6EE]">
                Net Revenue
              </span>

              <span className="text-[28px] font-semibold tracking-tight text-[#38833b] dark:text-[#A7E3B0]">
                ₹ 7,15,000
              </span>
            </div>

            <div className="mt-3 flex justify-end">
              <span className="text-[11px] font-medium text-[#38833b] dark:text-[#A7E3B0]">
                ↑ 14%
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
