import React from 'react'
import TotalTenantsCard from "./TotalTenantCard";
import ActivityCard from "./ActivityCard";
import TotalRevenueCard from "./TotalRevenueCard";

const StatusCards = () => {
  return (
    <div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <TotalTenantsCard />

      <ActivityCard />

      <TotalRevenueCard />
    </div>
    </div>
  )
}

export default StatusCards

