"use client";

import React, { useState } from "react";
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import Tabs from "./components/Tabs";
import OrganizationHeader, { OrganizationTab } from "../../components/OrganizationHeader";

type SubscriptionTab =
  | "plans"
  | "tenant-subscriptions"
  | "invoices"
  | "trials"
  | "analytics";

const page = () => {
  const [activeTab, setActiveTab] = useState<SubscriptionTab>("plans");
  const [tab, setTab] = useState<OrganizationTab>("All");

  return (
    <BaseSuperLayout>

      <SuperAdminHeader currentSection="Subscriptions" tenantActiveTab={activeTab} />   
         <div>
        <OrganizationHeader

          showTabs
          activeTab={tab}
          onTabChange={setTab} currentSection={""} />

      </div>

      <div className="pt-4">
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </BaseSuperLayout>
  );
};

export default page;
