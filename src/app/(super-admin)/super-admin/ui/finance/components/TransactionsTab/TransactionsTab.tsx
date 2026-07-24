import React from "react";
import TransactionOverviewCards from "./TransactionOverviewCards";
import TransactionsTable from "./TransactionTable";

function TransactionsTab() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <TransactionOverviewCards />
      <TransactionsTable />
    </div>
  );
}

export default TransactionsTab;