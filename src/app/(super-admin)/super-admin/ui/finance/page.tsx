"use client";

import React, { useEffect, useState } from "react";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import Tabs from "./components/Tabs";
import OrganizationHeader, {
  OrganizationTab,
} from "../../components/OrganizationHeader";
// import { useRouter, useSearchParams } from "next/navigation";

type FinanceTab =
  | "transactions"
  | "refunds"
  | "revenue"
  | "billing"
  | "invoice"
  | "analytics";

const Page = () => {
  const [tab, setTab] = useState<OrganizationTab>("All");

  const [activeTab, setActiveTab] = useState<FinanceTab>("transactions");

  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get("tab");
    if (
      requestedTab === "transactions" ||
      requestedTab === "refunds" ||
      requestedTab === "revenue" ||
      requestedTab === "billing" ||
      requestedTab === "invoice" ||
      requestedTab === "analytics"
    ) {
      setActiveTab(requestedTab);
    }
  }, []);

  return (
    <>
      <SuperAdminHeader currentSection="Finance" tenantActiveTab={activeTab} />
      <div>
        <OrganizationHeader
          showTabs
          activeTab={tab}
          onTabChange={setTab}
          currentSection={""}
        />
      </div>
      <div className="p-4 bg-[#F7F8FE] dark:bg-[#2e2e2e] rounded-xl">
        <h2 className="text-[17px] font-medium text-[#24324B] dark:text-white pb-4">
          Institute Finance
        </h2>
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </>
  );
};

export default Page;
