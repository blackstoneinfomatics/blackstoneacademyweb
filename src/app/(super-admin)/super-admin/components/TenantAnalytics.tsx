"use client";
import { Users, CheckCircle, XCircle } from "lucide-react";
import React, { useState } from "react";
const TenantAnalytics = () => {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  const dashboardData = {
    roleDistribution: [
      {
        roleName: "Admin",
        count: 4,
        percentage: 20.1,
      },
      {
        roleName: "Supervisor",
        count: 4,
        percentage: 20.1,
      },
      {
        roleName: "Academic Coach",
        count: 4,
        percentage: 20.1,
      },
      {
        roleName: "Teachers",
        count: 4,
        percentage: 20.1,
      },
      {
        roleName: "Student",
        count: 4,
        percentage: 20.1,
      },
    ],

    stats: {
      totalUsers: 28,
      activeUsers: 24,
      inactiveUsers: 4,
    },

    activeRole: {
      role: "Teachers",
      count: 670,
    },
  };

  const roleColors: Record<string, string> = {
    Admin: "#22C55E",
    Supervisor: "#8B5CF6",
    "Academic Coach": "#3B82F6",
    Teachers: "#F97316",
    Student: "#FBBF24",
  };
  const totalUsersFromRoles = dashboardData.roleDistribution.reduce(
    (total, role) => total + role.count,
    0,
  );
  return (
    <div className="grid grid-cols-12 gap-4 items-stretch auto-rows-fr">
      {" "}
      {/* Left Card */}
      <div className="col-span-12 lg:col-span-5 xl:col-span-5 bg-white rounded-xl p-5 border border-[#ECECEC] h-full min-h-full">
        <div className="flex flex-col xl:flex-row items-center xl:items-start justify-between gap-4 h-full">
          {" "}
          {/* Donut Chart */}
          <div
            className="relative w-[140px] h-[140px] sm:w-[165px] sm:h-[165px] rounded-full flex-shrink-0 mt-3"
            style={{
              background:
                "conic-gradient(#7C5CFA 0deg 72deg,#3B82F6 72deg 144deg,#22C55E 144deg 216deg,#EAB308 216deg 288deg,#F2994A 288deg 360deg)",
            }}
          >
            <div className="absolute inset-[28px] sm:inset-[28px] bg-white rounded-full flex flex-col items-center justify-center">
              <h2 className="text-[48px] font-bold text-[#111827] leading-none">
                {totalUsersFromRoles}
              </h2>

              <p className="text-[14px] text-[#6B7280] mt-1">Teachers</p>
            </div>
          </div>
          {/* Legend */}
          <div className="flex-1 min-w-0 w-full">
            {dashboardData.roleDistribution.map((role) => (
              <div
                key={role.roleName}
                className={`flex items-center justify-between rounded-md px-2 py-1 cursor-pointer transition-all duration-200 whitespace-nowrap ${
                  hoveredRole === role.roleName ? "bg-[#F5F7FF]" : ""
                }`}
                onMouseEnter={() => setHoveredRole(role.roleName)}
                onMouseLeave={() => setHoveredRole(null)}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      hoveredRole === role.roleName ? "scale-150" : ""
                    }`}
                    style={{
                      backgroundColor: roleColors[role.roleName] || "#9CA3AF",
                    }}
                  />

                  <span className="text-[13px] text-[#111827] truncate">
                    {role.roleName}
                  </span>
                </div>

                <div className="relative gap-3">
                  <span className="text-[13px] text-[#111827] font-medium gap-3">
                    {role.count} ({role.percentage}%)
                  </span>

                  {hoveredRole === role.roleName && (
                    <div className="absolute right-0 top-6 z-20 bg-[#111827] text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                      {role.roleName}: {role.count} Users
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right Section */}
      <div className="col-span-12 lg:col-span-7 xl:col-span-7 min-w-0 h-full flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {" "}
          {/* Total User */}
          <div className="bg-white rounded-xl px-4 py-4 border border-[#ECECEC]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#C7CEFC24] flex items-center justify-center">
                <Users size={22} className="text-[#5B4CFF]" />
              </div>

              <div>
                <p className="text-[14px] font-medium text-[#5B4CFF] mt-1">
                  {" "}
                  Total User
                </p>
                <h3 className="text-[18px] font-semibold">
                  {dashboardData.stats.totalUsers}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-3">
              <span className="text-[#2E9E44] text-[12px] font-medium whitespace-nowrap">
                ↑ 8 (14%)
              </span>

              <span className="text-[#6B7280] text-[12px] whitespace-nowrap">
                vs last Month
              </span>
            </div>
          </div>
          {/* Active User */}
          <div className="bg-white rounded-xl px-4 py-4 border border-[#ECECEC] h-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#DFF5E3] flex items-center justify-center">
                <CheckCircle size={22} className="text-[#39B54A]" />
              </div>

              <div>
                <p className="text-[14px] font-medium text-[#39B54A] mt-1">
                  Active User
                </p>

                <h3 className="text-xl font-semibold">
                  {dashboardData.stats.activeUsers}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-3">
              <span className="text-[#2E9E44] text-[12px] font-medium whitespace-nowrap">
                ↑ 8 (14%)
              </span>

              <span className="text-[#6B7280] text-[12px] whitespace-nowrap">
                vs last Month
              </span>
            </div>
          </div>
          {/* Inactive User */}
          <div className="bg-white rounded-xl p-4 shadow-sm h-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#FBE3E3] flex items-center justify-center">
                <XCircle size={22} className="text-[#E05353]" />
              </div>

              <div>
                <p className="text-[14px] font-medium text-[#E05353] mt-1">
                  Inactive User
                </p>

                <h3 className="text-xl font-semibold">
                  {dashboardData.stats.inactiveUsers}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-3">
              <span className="text-[#2E9E44] text-[12px] font-medium whitespace-nowrap">
                ↑ 8 (14%)
              </span>

              <span className="text-[#6B7280] text-[12px] whitespace-nowrap">
                vs last Month
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Cards */}
        <div className="grid md:grid-cols-[2fr_1fr] gap-4 items-stretch">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-[#7A7A7A]">Total User</p>

            <div className="flex items-center gap-2 mt-3">
              <div className="w-7 h-7 rounded-full bg-gray-300" />
              <div className="w-7 h-7 rounded-full bg-gray-300" />
              <div className="w-7 h-7 rounded-full bg-gray-300" />
              <div className="w-7 h-7 rounded-full bg-gray-300" />
              <div className="w-7 h-7 rounded-full bg-[#576CBC] text-white text-xs flex items-center justify-center">
                +5
              </div>

              <span className="text-xs text-[#7A7A7A] ml-2">
                124+ users added in the last 7 days
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#ECECEC] px-4 py-3">
            <p className="text-[14px] font-semibold text-[#1E293B]">
              Most Active Role
            </p>

            <div className="flex items-center gap-3 ">
              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center">
                <Users size={20} className="text-[#576CBC]" />
              </div>

              <div>
                <h3 className="text-[14px] font-semibold leading-none text-[#111827]">
                  {dashboardData.activeRole.role}
                </h3>

                <p className="text-[11px] text-[#6B7280] mt-1 whitespace-nowrap">
                  {dashboardData.activeRole.count} total active users
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantAnalytics;
