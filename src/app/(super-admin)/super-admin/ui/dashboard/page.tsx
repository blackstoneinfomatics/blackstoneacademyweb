import React from "react";
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import StatsCards from "./components/StatsCards";
import RevenueOverview from "./components/RevenueOverview";
import SubscriptionChart from "./components/SubscriptionChart";
import CalendarCard from "./components/CalendarCard";
import RecentActivities from "./components/RecentActivities";
import TenantsTable from "./components/TenantsTable";

const page = () => {
  return (
    <BaseSuperLayout>
      <div className="pt-2 min-h-screen">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* LEFT */}
          <div className="col-span-9 flex flex-col gap-4">
            <StatsCards />

            <div className="grid grid-cols-2 gap-4 h-full">
              <RevenueOverview />
              <SubscriptionChart />
            </div>

            <div className="flex-1">
              <TenantsTable />
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-span-3 flex flex-col gap-4">
            <div className="h-full">
              <CalendarCard />
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

export default page;
