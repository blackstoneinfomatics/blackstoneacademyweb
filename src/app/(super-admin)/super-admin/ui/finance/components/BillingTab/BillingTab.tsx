import React from "react";
import BillingOverviewCards from "./BillingOverviewCards";
import BillingTable from "./BillingTable";

function BillingTab() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <BillingOverviewCards />
      <BillingTable />
    </div>
  );
}

export default BillingTab;