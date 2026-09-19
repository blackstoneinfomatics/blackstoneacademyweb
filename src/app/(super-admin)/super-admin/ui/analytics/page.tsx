"use client"
import React, { useState } from "react";
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import AnalyticsSection from "./analyticssection/AnalyticsSection";
import BottomSection from "./bottomsection/BottomSection";
import AnalyticsCard from "./statscards/Analyticscards";
import OrganizationHeader, { OrganizationTab } from "../../components/OrganizationHeader";

const Page = () => {
  const [tab, setTab] = useState<OrganizationTab>("All");
  return (
    <BaseSuperLayout>
      <SuperAdminHeader currentSection="Analytics" />
      <div>
        <OrganizationHeader

          showTabs
          activeTab={tab}
          onTabChange={setTab} currentSection={""} />

      </div>

      <div className="min-h-screen bg-[#F4F6FB] dark:bg-[#252525] rounded-xl p-5">
        {/* Row of 3 cards - horizontal with gap */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <AnalyticsCard type="tenant" />
          <AnalyticsCard type="subscription" />
          <AnalyticsCard type="revenue" />
        </div>

        {/* Sections below */}
        <AnalyticsSection />
        <BottomSection />
      </div>
    </BaseSuperLayout>
  );
};

export default Page;