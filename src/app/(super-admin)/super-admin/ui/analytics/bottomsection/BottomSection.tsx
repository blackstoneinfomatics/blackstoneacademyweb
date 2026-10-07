import React from 'react'
import RecentActivityTable from "./RecentActivityTable";
import QuickInsights from "./QuickInsights";

const BottomSection = () => {
  return (
    <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <RecentActivityTable />
      </div>

      <div className="xl:col-span-1">
        <QuickInsights />
      </div>
    </div>
  )
}

export default BottomSection
