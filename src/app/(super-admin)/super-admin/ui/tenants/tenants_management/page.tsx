"use client";

import { Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TenantAnalytics from "../../../components/TenantAnalytics";
import TenantUserTable from "../../../components/TenantUsers";
import SuperAdminHeader from "../../../components/SuperAdminHeader";
import BaseSuperLayout from "../../../components/BaseSuperLayout";
import BlackstoneInfomaticsTables from "../../../components/BlackstoneInfomaticsTables";
import SubscriptionCard from "../../../components/subscriptionCard";
import FeatureSummaryCards from "../../../components/FeaturesCard";
import FeaturesTable from "../../../components/FeaturesTable";
import ActiveLogsTable from "../../../components/ActiveLogsTable";
import TicketsTable from "../../../components/TicketsTable";
import ActiveLogsChart from "../../../components/ActiveLogsChart";
import TicketAnalyticsCards from "../../../components/TicketLogs";
import DashboardCards from "../../../components/TenantDashboardCrad";
import GrowthChart from "../../../components/TenantGrowthChart";
import ModuleGrowth from "../../../components/TenantModuleGrowth";
import PerformanceCard from "../../../components/TenantPerformanceCard";
import ActivityTable from "../../../components/TeanantActivityTable";
import QuickInsights from "../../../components/TenantQuickInsights";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface TenantDetails {
  tenantCode: string;
  tenantName: string;
  tenantLogo: string;
  organizationName: string;
  phoneNumber?: string;
  mobileNumber: string;
  emailId: string;
  address?: string;
  gstNo?: string;
  panNo: string;
  website?: string;
  domainName?: string;
  tenantJobCode: string;
  faxNo?: string;
  state?: string;
  city?: string;
  street?: string;
  postalCode?: string;
  country?: string;
  companyRegistrationCertificate?: string;
  gstCertificate?: string;
  addressProof?: string;
  plan?: string;
  timeZone?: string;
  currency?: string;
  activeLicense?: {
    plan?: string;
    status?: string;
    startDate?: string;
    expiryDate?: string;
    renewalDate?: string;
    currentPeriod?: string;
    nextBilling?: string;
    autoRenewal?: boolean;
  };
  status?: string;
  settings?: unknown[];
  createdDate?: string;
  createdBy?: string;
  lastUpdatedDate?: string;
  lastUpdatedBy?: string;
}

const formatSubscriptionDate = (value?: string) => {
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

const tabs = [
  "Overview",
  "Users",
  "Subscriptions",
  "Features",
  "Active Logs",
  "Tickets",
  "Analytics",
];

const Page = () => {
  const searchParams = useSearchParams();
  const tenantCode = searchParams.get("tenantCode");
  const [activeTab, setActiveTab] = useState("Overview");
   const [tenant, setTenant] =
    useState<TenantDetails | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!tenantCode) {
      setLoading(false);
      return;
    }

    const getTenantDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT.TENANT_OVERVIEW.replace("{tenantCode}", tenantCode)}`,
        );
        setTenant(response.data);
      } catch (error) {
        console.error("Failed to fetch tenant details:", error);
      } finally {
        setLoading(false);
      }
    };

    getTenantDetails();
  }, [tenantCode]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!tenant) {
    return <div>Tenant not found</div>;
  }

  const tenantDetails = {
    tenantId: tenant.tenantCode,
    name: tenant.tenantName,
    domain: tenant.domainName || tenant.website || "—",
    createdDate: tenant.createdDate || "—",
    stats: { users: 0, students: 0, teachers: 0, classes: 0 },
    companyInfo: {
      Name: tenant.organizationName || "—",
      AcademyName: tenant.tenantName || "—",
      email: tenant.emailId || "—",
      phone: tenant.phoneNumber || "—",
      address:
        tenant.address ||
        [
          tenant.street,
          tenant.city,
          tenant.state,
          tenant.country,
          tenant.postalCode,
        ]
          .filter(Boolean)
          .join(", ") ||
        "—",
    },
    subscription: {
      plan: tenant.plan || tenant.activeLicense?.plan || "Basic",
      status: tenant.activeLicense?.status || tenant.status || "Active",
      currentPeriod:
        tenant.activeLicense?.currentPeriod ||
        [
          formatSubscriptionDate(tenant.activeLicense?.startDate),
          formatSubscriptionDate(tenant.activeLicense?.expiryDate),
        ].join(" - "),
      nextBilling: formatSubscriptionDate(
        tenant.activeLicense?.nextBilling ||
          tenant.activeLicense?.renewalDate ||
          tenant.activeLicense?.expiryDate,
      ),
    },
    modules: [
      { name: "Admin", status: "Enabled" },
      { name: "Teacher", status: "Enabled" },
      { name: "Students", status: "Enabled" },
      { name: "Supervisor", status: "Disabled" },
    ],
    features: [
      { name: "Live Class", status: "Enabled" },
      { name: "Assignments", status: "Enabled" },
      { name: "Jitsi", status: "Enabled" },
      { name: "Payment Gateway", status: "Enabled" },
    ],
  };

  return (
    <BaseSuperLayout>
      <SuperAdminHeader currentSection="Tenant Management" />
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1F1F1F] p-6 text-slate-900 dark:text-white transition-colors">
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-6 border-b border-gray-200 dark:border-gray-700 mb-6 transition-colors">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-medium transition-colors ${
                activeTab === tab
                  ? "text-[#576CBC] dark:text-[#8296E6] border-b-2 border-[#576CBC] dark:border-[#8296E6]"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "Overview" && (
          <div className="space-y-5 bg-white dark:bg-[#343434] rounded-2xl p-6 border border-transparent dark:border-gray-700/50 transition-colors">
            <div className="rounded-xl px-0 py-0">
              <div className="flex items-start gap-8 flex-wrap md:flex-nowrap">
                {/* Logo */}
                <div className="w-[95px] h-[95px] rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-100 dark:border-gray-700">
                  <img
                    src={tenant.tenantLogo || "/assets/images/BE-LOGO.jpg"}
                    alt="logo"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Right Side */}
                <div className="flex flex-col w-full">
                  <h1 className="text-[34px] font-semibold leading-none text-[#111827] dark:text-white">
                    {tenant.tenantName}
                  </h1>

                  <p className="text-[14
                  px] text-[#9CA3AF] dark:text-gray-400 mt-2">
                    {tenant.emailId}
                  </p>

                  <p className="text-[14px] text-[#9CA3AF] dark:text-gray-400 mt-2">
                    Created on : {tenantDetails.createdDate}
                    <span className="text-[#576CBC] dark:text-[#8296E6] ml-2 font-medium">
                      ID: {tenant.tenantCode}
                    </span>
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-6 md:gap-14 mt-6">
                    {/* Users */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#C7CEFC24] dark:bg-[#3A3A5C] flex items-center justify-center transition-colors">
                        <Users size={18} className="text-[#576CBC] dark:text-[#8296E6]" />
                      </div>

                      <div>
                        <p className="text-[12px] text-[#7A7A7A] dark:text-gray-400 pt-1">Users</p>
                        <p className="text-[16px] font-semibold dark:text-white">
                          {tenantDetails.stats.users}
                        </p>
                      </div>
                    </div>

                    {/* Students */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#C7CEFC24] dark:bg-[#3A3A5C] flex items-center justify-center transition-colors">
                        <Users size={18} className="text-[#576CBC] dark:text-[#8296E6]" />
                      </div>

                      <div>
                        <p className="text-[12px] text-[#7A7A7A] dark:text-gray-400 pt-1">Students</p>
                        <p className="text-[16px] font-semibold dark:text-white">
                          {tenantDetails.stats.students}
                        </p>
                      </div>
                    </div>

                    {/* Teachers */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#C7CEFC24] dark:bg-[#3A3A5C] flex items-center justify-center transition-colors">
                        <Users size={18} className="text-[#576CBC] dark:text-[#8296E6]" />
                      </div>

                      <div>
                        <p className="text-[12px] text-[#7A7A7A] dark:text-gray-400 pt-1">Teachers</p>
                        <p className="text-[16px] font-semibold dark:text-white">
                          {tenantDetails.stats.teachers}
                        </p>
                      </div>
                    </div>

                    {/* Classes */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#C7CEFC24] dark:bg-[#3A3A5C] flex items-center justify-center transition-colors">
                        <Users size={18} className="text-[#576CBC] dark:text-[#8296E6]" />
                      </div>

                      <div>
                        <p className="text-[12px] text-[#7A7A7A] dark:text-gray-400 pt-1">Classes</p>
                        <p className="text-[16px] font-semibold dark:text-white">
                          {tenantDetails.stats.classes}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-100 dark:border-gray-700/50">
              {/* Company Information */}
              <div className="bg-[#C7CEFC24] dark:bg-[#2C2C2C] rounded-xl p-5 transition-colors">
                <h3 className="text-[15px] font-semibold text-[#0B1533] dark:text-white mb-5">
                  Company Information
                </h3>

                <div className="space-y-4 text-[13px]">
                  {Object.entries(tenantDetails.companyInfo).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="grid grid-cols-[120px_1fr] gap-4"
                      >
                        <span className="text-[#7A7A7A] dark:text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>

                        <span className="text-[#1F2A44] dark:text-white font-medium break-words">
                          {value}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Subscription */}
              <div className="bg-[#C7CEFC24] dark:bg-[#2C2C2C] rounded-xl p-5 transition-colors">
                <h3 className="text-[15px] font-semibold text-[#0B1533] dark:text-white mb-5">
                  Subscription
                </h3>

                <div className="space-y-4 text-[13px]">
                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <span className="text-[#7A7A7A] dark:text-gray-400">Plan</span>

                    <span>
                      <span className="inline-flex items-center justify-center min-w-[75px] h-6 rounded-md text-[11px] font-medium bg-[#EAE5FF] dark:bg-indigo-900/30 text-[#7C5CFA] dark:text-indigo-400 transition-colors">
                        {tenantDetails.subscription.plan}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <span className="text-[#7A7A7A] dark:text-gray-400">Status</span>

                    <span>
                      <span className="inline-flex items-center justify-center min-w-[75px] h-6 rounded-md text-[11px] font-medium bg-[#DCFCE7] dark:bg-green-900/30 text-[#16A34A] dark:text-green-400 transition-colors">
                        {tenantDetails.subscription.status}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <span className="text-[#7A7A7A] dark:text-gray-400">Current Period</span>

                    <span className="font-medium text-[#1F2A44] dark:text-white">
                      {tenantDetails.subscription.currentPeriod}
                    </span>
                  </div>

                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <span className="text-[#7A7A7A] dark:text-gray-400">Next Billing</span>

                    <span className="font-medium text-[#1F2A44] dark:text-white">
                      {tenantDetails.subscription.nextBilling}
                    </span>
                  </div>
                </div>
              </div>

              {/* Module Access */}
              <div className="bg-[#C7CEFC24] dark:bg-[#2C2C2C] rounded-xl p-5 transition-colors">
                <h3 className="text-[15px] font-semibold text-[#0B1533] dark:text-white mb-5">
                  Modules Access
                </h3>

                <div className="space-y-3">
                  {tenantDetails.modules.map((item) => (
                    <div
                      key={item.name}
                      className="grid grid-cols-[1fr_90px] items-center"
                    >
                      <span className="text-[13px] text-[#7A7A7A] dark:text-gray-400">
                        {item.name}
                      </span>

                      <span
                        className={`inline-flex items-center justify-center h-6 rounded-md text-[11px] font-medium transition-colors ${
                          item.status === "Enabled"
                            ? "bg-[#DCFCE7] dark:bg-green-900/30 text-[#16A34A] dark:text-green-400"
                            : "bg-[#FEE2E2] dark:bg-red-900/30 text-[#EF4444] dark:text-red-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Access */}
              <div className="bg-[#C7CEFC24] dark:bg-[#2C2C2C] rounded-xl p-5 transition-colors">
                <h3 className="text-[15px] font-semibold text-[#0B1533] dark:text-white mb-5">
                  Features Access
                </h3>

                <div className="space-y-3">
                  {tenantDetails.features.map((item) => (
                    <div
                      key={item.name}
                      className="grid grid-cols-[1fr_90px] items-center"
                    >
                      <span className="text-[13px] text-[#7A7A7A] dark:text-gray-400">
                        {item.name}
                      </span>

                      <span className="inline-flex items-center justify-center h-6 rounded-md text-[11px] font-medium bg-[#DCFCE7] dark:bg-green-900/30 text-[#16A34A] dark:text-green-400 transition-colors">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Users" && (
          <div className="rounded-xl space-y-4">
            <TenantAnalytics />
            <TenantUserTable />
          </div>
        )}

        {activeTab === "Subscriptions" && (
          <div className="rounded-xl space-y-4">
            {/* @ts-ignore: SubscriptionCard prop typing mismatch - passing tenantId for runtime use */}
            <SubscriptionCard tenantId={tenantDetails.tenantId} />
            <BlackstoneInfomaticsTables />
          </div>
        )}

        {activeTab === "Features" && (
          <div className="rounded-xl space-y-4">
            <FeatureSummaryCards />
            <FeaturesTable />
          </div>
        )}

        {activeTab === "Active Logs" && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#343434] p-4 transition-colors">
            <ActiveLogsChart />
            <ActiveLogsTable />
          </div>
        )}

        {activeTab === "Tickets" && (
          <div className="rounded-xl space-y-4">
            <TicketAnalyticsCards />
            <TicketsTable />
          </div>
        )}

        {activeTab === "Analytics" && (
          <div className="min-h-screen bg-transparent">
            {/* Top Cards */}
            <DashboardCards />

            {/* Middle */}
            <div className="grid grid-cols-12 gap-4 mt-5">
              <div className="col-span-12 xl:col-span-5">
                <GrowthChart />
              </div>

              <div className="col-span-12 xl:col-span-4">
                <ModuleGrowth />
              </div>

              <div className="col-span-12 xl:col-span-3">
                <PerformanceCard />
              </div>
            </div>

            {/* Bottom */}
            <div className="grid grid-cols-12 gap-5 mt-5">
              <div className="col-span-12 lg:col-span-8">
                <ActivityTable />
              </div>

              <div className="col-span-12 lg:col-span-4">
                <QuickInsights />
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseSuperLayout>
  );
};

export default Page;