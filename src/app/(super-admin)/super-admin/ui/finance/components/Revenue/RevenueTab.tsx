import React from 'react'
import RevenueTable from './RevenueTable'
import RevenueOverviewCards from './RevenueOverviewCards'
import RevenuebyTenantNetRevenue from './RevenuebyTenantNetRevenue'

const RevenueTab = () => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <RevenueOverviewCards />
      <RevenuebyTenantNetRevenue />
      <RevenueTable />
    </div>
  )
}

export default RevenueTab
