import React from "react";
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import AnalyticsSection from "./analyticssection/AnalyticsSection";
import BottomSection from "./bottomsection/BottomSection";
import AnalyticsCard from "./statscards/Analyticscards";

const Page = () => {
  return (
    <BaseSuperLayout>
      <SuperAdminHeader currentSection="Analytics" />

      <div className="min-h-screen bg-[#F4F6FB] dark:bg-[#252525] p-5">
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