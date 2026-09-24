"use client";

import PlansTab from "./plans/PlansTab";
import TenantSubscriptionsTab from "./tenant-subscriptions/TenantSubscriptionsTab";
import InvoicesTab from "./invoices/InvoicesTab";
import TrialsTab from "./trials/TrialsTab";
import AnalyticsTab from "./analytics/AnalyticsTab";

type SubscriptionTab =
  | "plans"
  | "tenant-subscriptions"
  | "invoices"
  | "trials"
  | "analytics";

type TabsProps = {
  activeTab: SubscriptionTab;
  onTabChange: (tab: SubscriptionTab) => void;
};

const tabs: Array<{ id: SubscriptionTab; label: string; component: JSX.Element }> = [
  { id: "plans", label: "Plans", component: <PlansTab /> },
  {
    id: "tenant-subscriptions",
    label: "Tenant Subscriptions",
    component: <TenantSubscriptionsTab />,
  },
  { id: "invoices", label: "Invoices", component: <InvoicesTab /> },
  { id: "trials", label: "Trials", component: <TrialsTab /> },
  { id: "analytics", label: "Analytics", component: <AnalyticsTab /> },
];

export default function Tabs({ activeTab, onTabChange }: TabsProps) {
  const activeContent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="space-y-4">
      <div className="flex gap-9 ml-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`text-md font-medium transition ${
                isActive
                  ? "border-4 border-b-[#576CBC] text-[#576CBC]"
                  : "hover:text-[#576CBC]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div>
        {activeContent}
      </div>
    </div>
  );
}
