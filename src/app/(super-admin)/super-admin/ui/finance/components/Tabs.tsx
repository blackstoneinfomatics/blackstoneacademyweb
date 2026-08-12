"use client";

import TransactionsTab from "./TransactionsTab/TransactionsTab";
import RefundTab from "./RefundsTab/RefundTab";
import InvoiceTab from "./InvoiceTab/InvoiceTab";
import BillingTab from "./BillingTab/BillingTab";
import RevenueTab from "./Revenue/RevenueTab";
import AnalyticsTab from "./analytics/AnalyticsTab";
// import TaxGstTab from "./components/TaxGstTab";

type FinanceTab =
  | "transactions"
  | "refunds"
  | "revenue"
  | "billing"
  | "invoice"
  | "tax-gst"
  | "analytics";

type TabsProps = {
  activeTab: FinanceTab;
  onTabChange: (tab: FinanceTab) => void;
};

const tabs: Array<{ id: FinanceTab; label: string; component: JSX.Element }> = [
  {
    id: "transactions",
    label: "Transactions",
    component: <TransactionsTab />,
  },
  {
    id: "refunds",
    label: "Refunds",
    component: <RefundTab />,
  },
  {
    id: "revenue",
    label: "Revenue",
    component: <RevenueTab />,
  },
  {
    id: "billing",
    label: "Billing",
    component: <BillingTab />,
  },
  {
    id: "invoice",
    label: "Invoice",
    component: <InvoiceTab />,
  },
  // {
  //   id: "tax-gst",
  //   label: "Tax & GST",
  //   component: <TaxGstTab />,
  // },
  {
    id: "analytics",
    label: "Analytics",
    component: <AnalyticsTab />,
  },
];

export default function Tabs({ activeTab, onTabChange }: TabsProps) {
  const activeContent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="w-full">
  <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
    <div className="flex min-w-max gap-8 px-1">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              whitespace-nowrap
              py-1
              text-sm sm:text-base
              font-medium
              transition-colors
              border-b-[2.5px]
              ${
                active
                  ? "border-[#576CBC] text-[#576CBC]"
                  : "border-transparent text-[#1E293B] hover:text-[#576CBC]"
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  </div>

  <div className="mt-6">
    {activeContent}
  </div>
</div>
  );
}
