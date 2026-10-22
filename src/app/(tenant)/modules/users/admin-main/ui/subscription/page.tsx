"use client";

import React, { useState } from "react";
import BaseLayout4 from "../../components/BaseLayout4";

import CurrentSubscription from "./components/CurrentSubscription";
import AvailablePlans from "./components/AvailablePlans";
import PortalAccess from "./components/PortalAccess/PortalAccess";
import Invoice from "./components/Invoice";
import AdminHeader from "../../components/AdminHeader";
import PlanChangeRequestModal from "./components/PlanChangeRequestModal";
import PortalRequestModal from "./components/PortalRequestModal";

type TabType =
  | "currentSubscription"
  | "availablePlans"
  | "portalAccess"
  | "invoice";

const Page = () => {
  const [activeTab, setActiveTab] =
    useState<TabType>("currentSubscription");
  const [activeRequestModal, setActiveRequestModal] = useState<
    "planChange" | "portalRequest" | null
  >(null);

  const tabs = [
    {
      id: "currentSubscription" as TabType,
      label: "Current Subscription",
    },
    {
      id: "availablePlans" as TabType,
      label: "Available Plans",
    },
    {
      id: "portalAccess" as TabType,
      label: "Portal Access",
    },
    {
      id: "invoice" as TabType,
      label: "Invoice",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "currentSubscription":
        return <CurrentSubscription />;

      case "availablePlans":
        return <AvailablePlans />;

      case "portalAccess":
        return <PortalAccess />;

      case "invoice":
        return <Invoice />;

      default:
        return <CurrentSubscription />;
    }
  };

  return (
    <BaseLayout4>
      <AdminHeader
        currentSection="Subscription"
        actionButtonLabel={
          activeTab === "currentSubscription"
            ? "Plan Change"
            : activeTab === "portalAccess"
              ? "Portal Request"
              : undefined
        }
        onActionButtonClick={
          activeTab === "currentSubscription"
            ? () => setActiveRequestModal("planChange")
            : activeTab === "portalAccess"
              ? () => setActiveRequestModal("portalRequest")
              : undefined
        }
      />
      <div className="min-h-[calc(100vh-12px)]">
        {/* Common Tabs */}
        <div className="mb-3 flex items-center gap-8 p-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-2 pb-1 text-[15px] font-medium transition-all duration-200 ${
                  isActive
                    ? "text-[#576cbc]"
                    : "dark:text-[#c5c5c5] hover:text-[#5870c5]"
                }`}
              >
                {tab.label}

                {isActive && (
                  <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-[#5870c5]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div>{renderTabContent()}</div>
      </div>
      {activeRequestModal === "planChange" && (
        <PlanChangeRequestModal
          onClose={() => setActiveRequestModal(null)}
        />
      )}
      {activeRequestModal === "portalRequest" && (
        <PortalRequestModal
          onClose={() => setActiveRequestModal(null)}
        />
      )}
    </BaseLayout4>
  );
};

export default Page;