"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type TenantAnalyticsProps = {
  readonly tenantCode: string;
};

type TenantDashboardData = {
  userStatistics: {
    totalUsers: number;
    roles: Array<{ role: string; count: number }>;
  };
  portalStatistics: {
    totalPortals: number;
    enabledPortals: number;
    disabledPortals: number;
    usedPortals: number;
    remainingPortals: number;
    portals: Array<{ portalName: string; isEnabled: boolean }>;
  };
  mostActivePortal: {
    portalName: string;
    activeUsers: number;
    percentage: number;
  };
};

type TenantDashboardResponse = {
  data: TenantDashboardData;
};

const TenantAnalytics = ({ tenantCode }: TenantAnalyticsProps) => {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [dashboardData, setDashboardData] =
    useState<TenantDashboardData | null>(null);

  useEffect(() => {
    if (!tenantCode) return;

    const fetchDashboard = async () => {
      try {
        const response = await axios.get<TenantDashboardResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT.TENANT_PORTAL_DASHBOARD.replace(
            "{tenantCode}",
            tenantCode,
          )}`,
        );
        setDashboardData(
          response.data?.data ??
            (response.data as unknown as TenantDashboardData),
        );
      } catch (error) {
        console.error("Failed to fetch tenant portal dashboard:", error);
      }
    };

    fetchDashboard();
  }, [tenantCode]);

  const roleColors: Record<string, string> = {
    Admin: "#5B4CFF",
    Supervisor: "#8B5CF6",
    "Academic Coach": "#3B82F6",
    Teachers: "#39B54A",
    Student: "#FBBF24",
  };

  const roleBgColors: Record<string, string> = {
    Admin: "#EDE9FE",
    Supervisor: "#EDE9FE",
    "Academic Coach": "#E0E7FF",
    Teachers: "#DCFCE7",
    Student: "#FEF3C7",
  };

  if (!dashboardData) {
    return (
      <div className="rounded-xl bg-white p-5 text-sm text-gray-500 dark:bg-[#343434] dark:text-gray-400">
        Loading analytics...
      </div>
    );
  }

  const totalUsersFromRoles = dashboardData.userStatistics.totalUsers;
  const roleDistribution = dashboardData.userStatistics.roles.map((role) => ({
    roleName: role.role,
    count: role.count,
    percentage:
      totalUsersFromRoles > 0 ? (role.count / totalUsersFromRoles) * 100 : 0,
  }));
  const mostActivePortal = dashboardData.mostActivePortal;

  return (
    <div className="grid grid-cols-12 gap-4 items-stretch auto-rows-fr">
      {/* Portal Statistics */}
      <div className="col-span-12 min-w-0 h-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 h-full">
          {/* Enabled Portal */}
          <div className="bg-white dark:bg-[#343434] rounded-xl px-5 py-4 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] h-full flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#DFF5E3] dark:bg-[#2E4A3A] flex items-center justify-center flex-shrink-0">
                <IoMdCheckmarkCircle
                  size={22}
                  className="text-[#39B54A] dark:text-[#6EE07A]"
                />
              </div>

              <div>
                <p className="text-[14px] font-medium text-[#39B54A] dark:text-[#6EE07A]">
                  Enabled Portal
                </p>

                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {dashboardData.portalStatistics.enabledPortals}
                </h3>
              </div>
            </div>

            <div className="text-end mt-3">
              <span className="text-[#646464] font-medium text-[12px] dark:text-gray-400">
                Portals Currently Enabled
              </span>
            </div>
          </div>

          {/* Disabled Portal */}
          <div className="bg-white dark:bg-[#343434] rounded-xl px-5 py-4 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] h-full flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#FBE3E3] dark:bg-[#4A2E2E] flex items-center justify-center flex-shrink-0">
                <MdCancel
                  size={22}
                  className="text-[#E05353] dark:text-[#FF7474]"
                />
              </div>

              <div>
                <p className="text-[14px] font-medium text-[#E05353] dark:text-[#FF7474]">
                  Disabled Portal
                </p>

                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {dashboardData.portalStatistics.disabledPortals}
                </h3>
              </div>
            </div>

            <div className="text-end mt-3">
              <span className="text-[#646464] font-medium text-[12px] dark:text-gray-400">
                Portals Currently Disabled
              </span>
            </div>
          </div>

          {/* Total Portals */}
          <div className="bg-white dark:bg-[#343434] rounded-xl px-5 py-4 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] h-full flex flex-col justify-between">
            <p className="text-sm font-semibold text-slate-800 dark:text-gray-300">
              Total Portals
            </p>

            <div className="flex items-center mt-3">
              <div className="flex -space-x-2">
                {dashboardData.portalStatistics.portals.map((portal) => (
                  <div
                    key={portal.portalName}
                    title={portal.portalName}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 border-white dark:border-[#343434] text-[10px] font-medium ${
                      portal.isEnabled
                        ? "bg-[#DCFCE7] text-[#16803A]"
                        : "bg-[#FEE2E2] text-[#B42318]"
                    }`}
                  >
                    {portal.portalName.slice(0, 2).toUpperCase()}
                  </div>
                ))}
              </div>

              <span className="text-[12px] text-[#646464] font-medium  dark:text-gray-400 ml-4 whitespace-nowrap">
                {dashboardData.portalStatistics.usedPortals} Portals Used ·{" "}
                {dashboardData.portalStatistics.remainingPortals} Left
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantAnalytics;
