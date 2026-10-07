import React from "react";
import InvoiceOverviewCards from "./InvoiceOverviewCards";
import InvoicesTable from "./InvoiceTable";

function InvoiceTab() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <InvoiceOverviewCards />
      <InvoicesTable />
    </div>
  );
}

export default InvoiceTab;