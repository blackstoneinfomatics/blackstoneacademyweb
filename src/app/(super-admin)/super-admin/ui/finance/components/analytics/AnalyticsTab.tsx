import React from "react";
import AnalyticsOverviewCard from "./AnalyticsOverviewCard";
import RevenueGraph from "./RevenueGraph";
import ActivityTable from "./ReportTable";
import QuickInsights from "./QuickInsights";

const AnalyticsTab = () => {
  return (
    <div>
      <AnalyticsOverviewCard />
      <RevenueGraph />
      <div className="grid grid-cols-12 gap-5 mt-5">
        <div className="col-span-12 lg:col-span-8">
          <ActivityTable />
        </div>

        <div className="col-span-12 lg:col-span-4">
          <QuickInsights />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
