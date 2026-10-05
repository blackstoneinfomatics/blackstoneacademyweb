"use client"
import React, { useState } from "react";
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import StatsCards from "./components/StatsCards";
import RevenueOverview from "./components/RevenueOverview";
import SubscriptionChart from "./components/SubscriptionChart";
import RecentActivities from "./components/RecentActivities";
import TenantsTable from "./components/TenantsTable";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import OrganizationHeader, {
  OrganizationTab,
} from "../../components/OrganizationHeader";
import ExpiringTenants from "./components/ExpiringTenants";

const Page = () => {
  const [tab, setTab] = useState<OrganizationTab>("Institute");
  return (
    <BaseSuperLayout>
      <SuperAdminHeader currentSection="Dashboard" />
      <div className="min-w-0">
        <OrganizationHeader
          showTabs
          activeTab={tab}
          onTabChange={setTab}
          currentSection=""
        />
      </div>
      <div className="min-h-screen min-w-0 rounded-xl bg-[#F7F8FE] p-4 dark:bg-[#2e2e2e]">
        <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-12">
          <section className="min-w-0 flex flex-col gap-4 xl:col-span-9">
            <StatsCards />

            <div className="grid min-w-0 grid-cols-1 gap-4 xl:h-[290px] xl:grid-cols-2">
              <RevenueOverview />
              <SubscriptionChart />
            </div>

            <div className="min-w-0 flex-1">
              <TenantsTable />
            </div>
          </section>

          <aside className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:col-span-3 xl:flex xl:flex-col">
            <div className="min-w-0">
              <ExpiringTenants />
            </div>
            <div className="min-w-0 flex-1">
              <RecentActivities />
            </div>
          </aside>
        </div>
      </div>
    </BaseSuperLayout>
  );
};

export default Page;
