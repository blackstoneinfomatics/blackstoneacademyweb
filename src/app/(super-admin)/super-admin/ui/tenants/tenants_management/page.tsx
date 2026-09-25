"use client";

import { Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import OrganizationHeader, {
  OrganizationTab,
} from "../../../components/OrganizationHeader";
import { FaArrowLeft } from "react-icons/fa6";

interface ModuleAccess {
  moduleName: string;
  status: string;
  childModules: Array<{
    childModuleName: string;
    status: string;
  }>;
}

interface FeatureAccess {
  moduleName: string;
  childModuleName: string | null;
  featureName: string;
  status: string;
}

interface TenantDetails {
  tenantCode: string;
  tenantName?: string;
  tenantLogo?: string;
  companyInformation: {
    companyName: string;
    academyName: string;
    email: string;
    phone: string;
    address: string;
  };
  subscription: {
    planName: string;
    status: string;
    currentPeriod: {
      startDate: string;
      endDate: string;
    };
    nextBillingDate: string;
  };
  modulesAccess: ModuleAccess[];
  featuresAccess: FeatureAccess[];
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
  "Portal",
  "Subscriptions",
  "Features",
  "Active Logs",
  "Tickets",
  "Analytics",
];

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantCode = searchParams.get("tenantCode");
  const [activeTab, setActiveTab] = useState("Overview");
  const [tab, setTab] = useState<OrganizationTab>("All");
  const [tenant, setTenant] = useState<TenantDetails | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantCode) {
      setLoading(false);
      return;
    }

    const getTenantDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT.TENANT_DETAILS.replace("{tenantCode}", tenantCode)}`,
        );
        const details = response.data?.data ?? response.data;
        setTenant({ ...details, tenantCode });
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

  const tenantCompany = tenant.companyInformation ?? {
    companyName: "—",
    academyName: "—",
    email: "—",
    phone: "—",
    address: "—",
  };

  const tenantSubscription = tenant.subscription ?? {
    planName: "Basic",
    status: "Active",
    currentPeriod: { startDate: "", endDate: "" },
    nextBillingDate: "",
  };

  const tenantModulesAccess = tenant.modulesAccess ?? [];
  const tenantFeaturesAccess = tenant.featuresAccess ?? [];

  const tenantDetails = {
    tenantId: tenant.tenantCode,
    name: tenantCompany.companyName,
    domain: "—",
    createdDate: "—",
    stats: { users: 0, students: 0, teachers: 0, classes: 0 },
    companyInfo: {
      Name: tenantCompany.companyName || "—",
      AcademyName: tenantCompany.academyName || "—",
      email: tenantCompany.email || "—",
      phone: tenantCompany.phone || "—",
      address: tenantCompany.address || "—",
    },
    subscription: {
      plan: tenantSubscription.planName || "Basic",
      status: tenantSubscription.status || "Active",
      currentPeriod: [
        formatSubscriptionDate(tenantSubscription.currentPeriod?.startDate),
        formatSubscriptionDate(tenantSubscription.currentPeriod?.endDate),
      ].join(" - "),
      nextBilling: formatSubscriptionDate(tenantSubscription.nextBillingDate),
    },
    modules: tenantModulesAccess.map((module) => ({
      name: module.moduleName,
      status: module.status,
      childModules: module.childModules ?? [],
    })),
    features: tenantFeaturesAccess.map((feature) => ({
      name: feature.featureName,
      moduleName: feature.moduleName,
      childModuleName: feature.childModuleName,
      status: feature.status,
    })),
  };

  return (
    <BaseSuperLayout>
      <SuperAdminHeader currentSection="Tenant Management" />
      <div>
        <OrganizationHeader
          showTabs
          activeTab={tab}
          onTabChange={setTab}
          currentSection={""}
        />
      </div>
      <div className="min-h-screen bg-[#F7F8FE] dark:bg-[#1F1F1F] p-6 text-slate-900 dark:text-white transition-colors rounded-lg">
        <div className="pb-5 flex items-center gap-3 text-[#010E30] dark:text-[#ffffff] font-medium">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <FaArrowLeft className="text-base" />
          </button>
          <h2>Institute Tenant Management</h2>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-6  mb-6 transition-colors">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-1 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? "text-[#576CBC] dark:text-[#8296E6] border-b-4 border-[#576CBC] dark:border-[#8296E6]"
                  : "text-[010e30] dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "Overview" && (
          <div className="space-y-5 rounded-2xl p-6transition-colors">
            <div className="rounded-xl p-5 bg-[#ffffff] dark:bg-[#343434] shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)]">
              <div className="flex items-start gap-8 flex-wrap md:flex-nowrap">
                {/* Logo */}
                <div className="w-[105px] h-[105px] rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-center">
                  <img
                    src={tenant.tenantLogo || "/assets/images/BE-LOGO.jpg"}
                    alt="logo"
                    className="w-full h-full object-contain p-1"
                  />
                </div>

                {/* Right Side */}
                <div className="flex flex-row w-full justify-between">
                  <div>
                    <h1 className="text-lg font-medium leading-none text-[#111827] dark:text-white">
                      {tenant.companyInformation.companyName}
                    </h1>

                    <p className="text-[12px] text-[#7b7b7b] dark:text-gray-400 mt-2">
                      {tenant.companyInformation.email}
                    </p>

                    <p className="text-[12px] text-[#7b7b7b] dark:text-gray-400 mt-2">
                      Created on : {tenantDetails.createdDate}
                      <span className="text-[#576CBC] dark:text-[#8296E6] ml-2 font-medium">
                        ID: {tenant.tenantCode}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 md:gap-14 mt-6 pr-6">
                    {/* Users */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#C7CEFC24] dark:bg-[#3A3A5C] flex items-center justify-center transition-colors">
                        <Users
                          size={18}
                          className="text-[#576CBC] dark:text-[#8296E6]"
                        />
                      </div>

                      <div>
                        <p className="text-[12px] text-[#7A7A7A] dark:text-gray-400 pt-1">
                          Portal
                        </p>
                        <p className="text-[16px] font-semibold dark:text-white">
                          {tenantDetails.stats.users}
                        </p>
                      </div>
                    </div>

                    {/* Students */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#C7CEFC24] dark:bg-[#3A3A5C] flex items-center justify-center transition-colors">
                        <Users
                          size={18}
                          className="text-[#576CBC] dark:text-[#8296E6]"
                        />
                      </div>

                      <div>
                        <p className="text-[12px] text-[#7A7A7A] dark:text-gray-400 pt-1">
                          Students
                        </p>
                        <p className="text-[16px] font-semibold dark:text-white">
                          {tenantDetails.stats.students}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Information */}
              <div className="bg-[#ffffff] shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] dark:bg-[#2C2C2C] rounded-xl p-5 transition-colors">
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
              <div className="bg-[#ffffff] shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] dark:bg-[#2C2C2C] rounded-xl p-5 transition-colors">
                <h3 className="text-[15px] font-semibold text-[#0B1533] dark:text-white mb-5">
                  Subscription
                </h3>

                <div className="space-y-4 text-[13px]">
                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <span className="text-[#7A7A7A] dark:text-gray-400">
                      Plan
                    </span>

                    <span>
                      <span className="inline-flex items-center justify-center min-w-[75px] h-6 rounded-md text-[11px] font-medium bg-[#EAE5FF] dark:bg-indigo-900/30 text-[#7C5CFA] dark:text-indigo-400 transition-colors">
                        {tenantDetails.subscription.plan}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <span className="text-[#7A7A7A] dark:text-gray-400">
                      Status
                    </span>

                    <span>
                      <span className="inline-flex items-center justify-center min-w-[75px] h-6 rounded-md text-[11px] font-medium bg-[#DCFCE7] dark:bg-green-900/30 text-[#16A34A] dark:text-green-400 transition-colors">
                        {tenantDetails.subscription.status}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <span className="text-[#7A7A7A] dark:text-gray-400">
                      Current Period
                    </span>

                    <span className="font-medium text-[#1F2A44] dark:text-white">
                      {tenantDetails.subscription.currentPeriod}
                    </span>
                  </div>

                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <span className="text-[#7A7A7A] dark:text-gray-400">
                      Next Billing
                    </span>

                    <span className="font-medium text-[#1F2A44] dark:text-white">
                      {tenantDetails.subscription.nextBilling}
                    </span>
                  </div>
                </div>
              </div>

              {/* Module Access */}
              <div className="bg-[#ffffff] shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] dark:bg-[#2C2C2C] rounded-xl p-5 transition-colors">
                <h3 className="text-[15px] font-semibold text-[#0B1533] dark:text-white mb-5">
                  Modules Access
                </h3>

                <div className="space-y-3 h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#dadddb] scrollbar-track-[#fff] pr-2">
                  {tenantDetails.modules.map((item) => (
                    <div
                      key={item.name}
                      className="grid grid-cols-[1fr_90px] items-center"
                    >
                      <div>
                        <span className="text-[13px] text-[#7A7A7A] dark:text-gray-400">
                          {item.name}
                        </span>
                        {/* {item.childModules.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {item.childModules.map((child) => (
                              <p
                                key={child.childModuleName}
                                className="text-[11px] text-[#9CA3AF] dark:text-gray-500"
                              >
                                {child.childModuleName}: {child.status}
                              </p>
                            ))}
                          </div>
                        )} */}
                      </div>

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
              <div className="bg-[#ffffff] shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] dark:bg-[#2C2C2C] rounded-xl p-5 transition-colors">
                <div className="flex justify-between items-center">
                  <h3 className="text-[15px] font-semibold text-[#0B1533] dark:text-white mb-5">
                    Features Access
                  </h3>
                  <h3 className="text-[15px] font-semibold text-[#0B1533] dark:text-white pr-4">
                    ({tenantDetails.features.length})
                  </h3>
                </div>

                <div className="space-y-3 h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#dadddb] scrollbar-track-[#fff] pr-2">
                  {tenantDetails.features.map((item) => (
                    <div
                      key={item.name}
                      className="grid grid-cols-[1fr_90px] items-center"
                    >
                      <div>
                        <span className="text-[13px] text-[#747984] dark:text-gray-400">
                          {item.name}
                        </span>
                        <p className="text-[9px] text-[#4e535a] dark:text-gray-500">
                          {item.moduleName}
                          {item.childModuleName
                            ? ` / ${item.childModuleName}`
                            : ""}
                        </p>
                      </div>

                      <span className="inline-flex items-center justify-center h-5 rounded-md text-[10px] font-medium bg-[#DCFCE7] dark:bg-green-900/30 text-[#16A34A] dark:text-green-400 transition-colors">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Portal" && (
          <div className="rounded-xl space-y-4">
            <TenantAnalytics tenantCode={tenantCode ?? ""} />
            <TenantUserTable />
          </div>
        )}

        {activeTab === "Subscriptions" && (
          <div className="rounded-xl space-y-4">
            <SubscriptionCard tenantId={tenantDetails.tenantId} />
            <BlackstoneInfomaticsTables tenantId={tenantDetails.tenantId} />
          </div>
        )}

        {activeTab === "Features" && (
          <div className="rounded-xl space-y-4">
            <FeatureSummaryCards tenantId={tenantDetails.tenantId} />
            <FeaturesTable tenantId={tenantDetails.tenantId}/>
          </div>
        )}

        {activeTab === "Active Logs" && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#343434] p-4 transition-colors">
            <ActiveLogsChart tenantCode={tenant.tenantCode} />
            <ActiveLogsTable tenantCode={tenant.tenantCode} />
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
            <DashboardCards tenantId={tenantDetails.tenantId} />

            {/* Middle */}
            <div className="grid grid-cols-12 gap-4 mt-5">
              <div className="col-span-12 xl:col-span-5">
                <GrowthChart tenantId={tenantDetails.tenantId} />
              </div>

              <div className="col-span-12 xl:col-span-4">
                <ModuleGrowth tenantId={tenantDetails.tenantId}/>
              </div>

              <div className="col-span-12 xl:col-span-3">
                <PerformanceCard tenantId={tenantDetails.tenantId} />
              </div>
            </div>

            {/* Bottom */}
            <div className="grid grid-cols-12 gap-5 mt-5">
              <div className="col-span-12 lg:col-span-8">
                <ActivityTable tenantId={tenantDetails.tenantId}/>
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
