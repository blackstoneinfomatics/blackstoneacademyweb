import React from "react";
import BillingOverviewCards from "./BillingOverviewCards";

function BillingTab() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <BillingOverviewCards />
    </div>
  );
}

export default BillingTab;