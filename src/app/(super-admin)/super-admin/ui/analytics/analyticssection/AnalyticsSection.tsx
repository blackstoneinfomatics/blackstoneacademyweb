import React from 'react'
import TenantsGrowthChart from "./TenentsGrowthChart";
import SubscriptionsChart from "./SubscriptionsChart";
import RevenueOverviewChart from "./RevenueOverviewChart";

const AnalyticsSection = () => {
  return (
    <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3">
      <TenantsGrowthChart />

      <SubscriptionsChart />

      <RevenueOverviewChart />
    </div>
  )
}

export default AnalyticsSection

