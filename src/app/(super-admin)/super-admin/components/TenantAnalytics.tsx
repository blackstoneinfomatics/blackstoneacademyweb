"use client";
import { Users, CheckCircle, XCircle } from "lucide-react";
import React, { useState } from "react";
import { FaUsers } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { IoMdCheckmarkCircle } from "react-icons/io";

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
      image: "/assets/images/k.svg"
    },
  };

  const getDummyUsers = () => {
    const users = [];
    const names = ['Sarah', 'Mike', 'Emma', 'Alex'];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
    
    for (let i = 0; i < 4; i++) {
      users.push({
        id: i + 1,
        name: names[i] || `User ${i + 1}`,
        avatar: `https://i.pravatar.cc/150?img=${i + 10}`,
        color: colors[i]
      });
    }
    
    return users;
  };

  const [userData, setUserData] = useState({
    recentUsers: getDummyUsers(),
    totalUsers: 124,
    newUsersCount: 5,
    timeFrame: 'last 7 days'
  });

  // Updated role colors to match the image
  const roleColors: Record<string, string> = {
    Admin: "#5B4CFF", // Purple - matches the image
    Supervisor: "#8B5CF6",
    "Academic Coach": "#3B82F6",
    Teachers: "#39B54A", // Green - matches the image
    Student: "#FBBF24",
  };

  // Role background colors for hover state
  const roleBgColors: Record<string, string> = {
    Admin: "#EDE9FE",
    Supervisor: "#EDE9FE",
    "Academic Coach": "#E0E7FF",
    Teachers: "#DCFCE7",
    Student: "#FEF3C7",
  };

  const totalUsersFromRoles = dashboardData.roleDistribution.reduce(
    (total, role) => total + role.count,
    0,
  );

  return (
    <div className="grid grid-cols-12 gap-4 items-stretch auto-rows-fr">
      {/* Left Card */}
      <div className="col-span-12 lg:col-span-5 xl:col-span-5 bg-white dark:bg-[#343434] rounded-xl p-5 h-full min-h-full">
        <div className="flex flex-col xl:flex-row items-center xl:items-start justify-between gap-4 h-full">
          {/* Donut Chart */}
          <div
            className="relative w-[140px] h-[140px] sm:w-[165px] sm:h-[165px] rounded-full flex-shrink-0 mt-3"
            style={{
              background:
                "conic-gradient(#7C5CFA 0deg 72deg,#3B82F6 72deg 144deg,#22C55E 144deg 216deg,#EAB308 216deg 288deg,#F2994A 288deg 360deg)",
            }}
          >
            <div className="absolute inset-[28px] sm:inset-[28px] bg-white dark:bg-[#343434] rounded-full flex flex-col items-center justify-center">
              <h2 className="text-[32px] font-bold text-[#111827] dark:text-white leading-none">
                {totalUsersFromRoles}
              </h2>
              <p className="text-[14px] text-[#6B7280] dark:text-slate-300 mt-1">Teachers</p>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex-1 min-w-0 w-full">
            {dashboardData.roleDistribution.map((role) => (
              <div
                key={role.roleName}
                className={`flex items-center justify-between rounded-md px-2 py-1 cursor-pointer transition-all duration-200 whitespace-nowrap ${
                  hoveredRole === role.roleName 
                    ? roleBgColors[role.roleName] || "bg-[#F5F7FF] dark:bg-[#374151]" 
                    : ""
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
                  <span className="text-[13px] text-[#111827] dark:text-white truncate">
                    {role.roleName}
                  </span>
                </div>

                <div className="relative gap-3">
                  <span className="text-[13px] text-[#111827] dark:text-white font-medium gap-3">
                    {role.count} ({role.percentage}%)
                  </span>

                  {hoveredRole === role.roleName && (
                    <div className="absolute right-0 top-6 z-20 bg-[#343434] text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
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
          {/* Total User */}
          <div className="bg-white dark:bg-[#343434] rounded-xl px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#e5dffd] flex items-center justify-center">
                <FaUsers size={22} className="text-[#5B4CFF]" />
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#5B4CFF] mt-1">Total User</p>
                <h3 className="text-[18px] font-semibold dark:text-white">
                  {dashboardData.stats.totalUsers}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-3">
              <span className="text-[#2E9E44] text-[12px] font-medium whitespace-nowrap">
                ↑ 8 (14%)
              </span>
              <span className="text-[#6B7280] text-[12px] whitespace-nowrap dark:text-white">
                vs last Month
              </span>
            </div>
          </div>

          {/* Active User */}
          <div className="bg-white dark:bg-[#343434] rounded-xl px-4 py-4 h-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#DFF5E3] flex items-center justify-center">
                <IoMdCheckmarkCircle size={22} className="text-[#39B54A]" />
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#39B54A] mt-1">Active User</p>
                <h3 className="text-xl font-semibold dark:text-white">
                  {dashboardData.stats.activeUsers}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-3">
              <span className="text-[#2E9E44] text-[12px] font-medium whitespace-nowrap">
                ↑ 8 (14%)
              </span>
              <span className="text-[#6B7280] text-[12px] whitespace-nowrap dark:text-white">
                vs last Month
              </span>
            </div>
          </div>

          {/* Inactive User */}
          <div className="bg-white dark:bg-[#343434] rounded-xl p-4 shadow-sm h-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#FBE3E3] flex items-center justify-center">
                <MdCancel size={22} className="text-[#E05353]" />
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#E05353] mt-1">Inactive User</p>
                <h3 className="text-xl font-semibold dark:text-white">
                  {dashboardData.stats.inactiveUsers}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-3">
              <span className="text-[#2E9E44] text-[12px] font-medium whitespace-nowrap">
                ↑ 8 (14%)
              </span>
              <span className="text-[#6B7280] text-[12px] whitespace-nowrap dark:text-white">
                vs last Month
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-[2fr_1fr] gap-1 items-stretch">
          <div className="bg-white dark:bg-[#343434] rounded-xl p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-800 dark:text-gray-400">Total User</p>

            <div className="flex items-center mt-3">
              <div className="flex -space-x-1">
                {userData.recentUsers.map((user) => (
                  <div 
                    key={user.id}
                    className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden border-2 border-white dark:border-[#343434]"
                  >
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                
                <div className="w-9 h-9 rounded-full bg-[#576CBC] dark:bg-[#6C82D4] text-white text-[10px] flex items-center justify-center font-medium border-2 border-white dark:border-[#343434]">
                  +{userData.newUsersCount}
                </div>
              </div>

              <span className="text-[12px] text-slate-700 dark:text-gray-400 ml-4">
                {userData.totalUsers}+ users added in the {userData.timeFrame}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#343434] rounded-xl px-4 py-3">
            <p className="text-[14px] font-semibold text-[#1E293B] dark:text-white">
              Most Active Role
            </p>

            <div className="flex items-center gap-3 mt-2">
              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] dark:bg-[#4A4A4A] flex items-center justify-center overflow-hidden">
                <img 
                  src={dashboardData.activeRole.image} 
                  alt={dashboardData.activeRole.role}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="text-[14px] font-semibold leading-none text-[#111827] dark:text-white">
                  {dashboardData.activeRole.role}
                </h3>
                <p className="text-[11px] text-[#6B7280] dark:text-gray-400 mt-1 whitespace-nowrap">
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