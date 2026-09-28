"use client"
import React, { useState } from "react";
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import StatsCards from "./components/StatsCards";
import RevenueOverview from "./components/RevenueOverview";
import SubscriptionChart from "./components/SubscriptionChart";
import RecentActivities from "./components/RecentActivities";
import TenantsTable from "./components/TenantsTable";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import OrganizationHeader, { OrganizationTab } from "../../components/OrganizationHeader";
import ExperingTenants from "./components/ExperingTenants";

const Page = () => {
  const [tab, setTab] = useState<OrganizationTab>("All");
  return (
    <BaseSuperLayout>
      <SuperAdminHeader currentSection="Dashboard" />
      <div>
        <OrganizationHeader

          showTabs
          activeTab={tab}
          onTabChange={setTab} currentSection={""} />

      </div>
      <div className="min-h-screen bg-[#F7F8FE] dark:bg-[#343434] p-4 rounded-xl">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* LEFT */}
          <div className="col-span-9 flex flex-col gap-4">
            <StatsCards />

            <div className="grid grid-cols-2 gap-4 h-[290px]">
              <RevenueOverview />
              <SubscriptionChart />
            </div>

            <div className="flex-1">
              <TenantsTable />
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-span-3 flex flex-col gap-4">
            <div className="">
              <ExperingTenants />
            </div>

            <div className="flex-1">
              <RecentActivities />
            </div>
          </div>
        </div>
      </div>
    </BaseSuperLayout>
  );
};

export default Page;
