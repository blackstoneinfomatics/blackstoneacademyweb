"use client";

import {
  Users,
  CheckCircle,
  UserCheck,
  XCircle,
  Clock3,
} from "lucide-react";

const stats = [
  {
    title: "Total Tenants",
    count: 28,
    color: "text-violet-600",
    bg: "bg-violet-100",
    icon: Users,
  },
  {
    title: "Active Tenants",
    count: 28,
    color: "text-green-600",
    bg: "bg-green-100",
    icon: CheckCircle,
  },
  {
    title: "Trial Tenants",
    count: 28,
    color: "text-blue-600",
    bg: "bg-blue-100",
    icon: UserCheck,
  },
  {
    title: "Inactive Tenants",
    count: 28,
    color: "text-red-600",
    bg: "bg-red-100",
    icon: XCircle,
  },
  {
    title: "Expiring Tenants",
    count: 28,
    color: "text-amber-500",
    bg: "bg-amber-100",
    icon: Clock3,
  },
];

export default function TenantStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={index}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-14 h-14 rounded-full ${item.bg} flex items-center justify-center`}
              >
                <Icon className={`w-7 h-7 ${item.color}`} />
              </div>

              <div className="text-right">
                <h4 className={`text-sm font-medium ${item.color}`}>
                  {item.title}
                </h4>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {item.count}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm">
              <span className="text-red-500 font-semibold">↑ 14%</span>
              <span className="text-gray-500">vs last Month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}