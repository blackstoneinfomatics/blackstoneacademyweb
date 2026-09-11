import React from "react";
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import StatusCards from "./statscards/StatusCards";
import AnalyticsSection from "./analyticssection/AnalyticsSection";
import BottomSection from "./bottomsection/BottomSection";

const page = () => {
  return (
    <BaseSuperLayout>
    <SuperAdminHeader currentSection="Analytics"/>
        <div className="min-h-screen bg-[#F4F6FB] p-5">
      <StatusCards />

      <AnalyticsSection />

      <BottomSection />
    </div>
    </BaseSuperLayout>
  );
};

export default page;
