"use client";

import React, { useState } from "react";
import BaseLayout4 from "../../components/BaseLayout4";

import CurrentSubscription from "./components/CurrentSubscription";
import AvailablePlans from "./components/AvailablePlans";
import PortalAccess from "./components/PortalAccess";
import Invoice from "./components/Invoice";
import AdminHeader from "../../components/AdminHeader";

type TabType =
  | "currentSubscription"
  | "availablePlans"
  | "portalAccess"
  | "invoice";

const Page = () => {
  const [activeTab, setActiveTab] =
    useState<TabType>("currentSubscription");

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
    <AdminHeader currentSection="Subscription" />
            <div className="min-h-[calc(100vh-12px)] rounded-[9px] bg-[#f7f8fd] dark:bg-[#2e2e2e] p-4">
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
                    : "dark:text-[#979797] hover:text-[#5870c5]"
                }`}
              >
                {tab.label}

                {isActive && (
                  <span className="absolute bottom-0 left-[14px] h-[3px] w-36 rounded-full bg-[#5870c5]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-[#ffffff] rounded-lg px-3 py-2">{renderTabContent()}</div>
      </div>
    </BaseLayout4>
  );
};

export default Page;