"use client";

import { ChevronDown } from "lucide-react";

const tenants = [
  {
    initial: "B",
    name: "Blackstone Academy",
    revenue: "₹ 2,00,000",
    percentage: "74%",
    barWidth: "75%",
    badgeColor: "bg-green-100 text-green-600",
  },
  {
    initial: "F",
    name: "Future Academy",
    revenue: "₹ 1,00,000",
    percentage: "50%",
    barWidth: "75%",
    badgeColor: "bg-orange-100 text-orange-500",
  },
  {
    initial: "I",
    name: "Indian Academy",
    revenue: "₹ 20,000",
    percentage: "74%",
    barWidth: "25%",
    badgeColor: "bg-red-100 text-red-500",
  },
  {
    initial: "S",
    name: "Stone Academy",
    revenue: "₹ 20,000",
    percentage: "74%",
    barWidth: "25%",
    badgeColor: "bg-red-100 text-red-500",
  },
  {
    initial: "B",
    name: "Blackstone Academy",
    revenue: "₹ 1,00,000",
    percentage: "50%",
    barWidth: "75%",
    badgeColor: "bg-orange-100 text-orange-500",
  },
];

export default function RevenuebyTenantNetRevenue() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Revenue by Tenant */}
        <div className="rounded-2xl bg-white p-4 shadow-sm md:p-5">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-[#242424]">
              Revenue by Tenant(Top 5)
            </h2>

            <button className="flex items-center gap-2 rounded-md bg-[#f5f5f5] px-3 py-1.5 text-[11px] font-medium text-[#666]">
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8e8e8] text-[15px] font-medium text-[#333]">
                  {tenant.initial}
                </div>

                {/* Tenant Name */}
                <div className="w-[145px] shrink-0 truncate text-[14px] font-medium text-[#3d3d3d] sm:w-[170px]">
                  {tenant.name}
                </div>

                {/* Progress Bar */}
                <div className="relative h-[5px] flex-1 overflow-hidden rounded-full bg-[#bcbcbc]">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-[#6241f5]"
                    style={{ width: tenant.barWidth }}
                  />
                </div>

                {/* Revenue */}
                <div className="w-[105px] shrink-0 text-right text-[16px] font-semibold text-[#303030]">
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
        <div className="rounded-2xl bg-white p-4 shadow-sm md:p-5">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-[#242424]">
              Net Revenue Overview
            </h2>

            <button className="flex items-center gap-2 rounded-md bg-[#f5f5f5] px-3 py-1.5 text-[11px] font-medium text-[#666]">
              Yearly
              <ChevronDown size={13} strokeWidth={2} />
            </button>
          </div>

          {/* Revenue Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-[#3d3d3d]">
                Gross Revenue
              </span>
              <span className="text-[14px] font-semibold text-[#333]">
                ₹ 8,00,000
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-[#3d3d3d]">
                GST
              </span>
              <span className="text-[14px] font-semibold text-[#333]">
                ₹ 10000
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-[#3d3d3d]">
                Discounts
              </span>
              <span className="text-[14px] font-semibold text-red-500">
                - ₹ 35,000
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-[#3d3d3d]">
                Refunds
              </span>
              <span className="text-[14px] font-semibold text-red-500">
                - ₹ 50,000
              </span>
            </div>
          </div>

          {/* Net Revenue */}
          <div className="mt-4 border-y border-[#9ee3b0] bg-[#f3fff5] px-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-medium text-[#3d3d3d]">
                Net Revenue
              </span>

              <span className="text-[28px] font-semibold tracking-tight text-[#38833b]">
                ₹ 7,15,000
              </span>
            </div>

            <div className="mt-3 flex justify-end">
              <span className="text-[11px] font-medium text-[#38833b]">
                ↑ 14%
                <span className="ml-1 text-[#666]">vs last Month</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
