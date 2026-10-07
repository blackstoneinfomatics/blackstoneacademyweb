import React from 'react'
import RefundOverviewCards from './RefundOverviewCards'
import RefundTable from './RefundTable'

const RefundTab = () => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <RefundOverviewCards />
      <RefundTable />
    </div>
  )
}

export default RefundTab
