"use client";

import React, { useState } from "react";
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import Tabs from "./components/Tabs";

type SubscriptionTab =
  | "plans"
  | "tenant-subscriptions"
  | "invoices"
  | "trials"
  | "analytics";

const page = () => {
  const [activeTab, setActiveTab] = useState<SubscriptionTab>("plans");

  return (
    <BaseSuperLayout>
      <SuperAdminHeader currentSection="Subscriptions" tenantActiveTab={activeTab} />
      <div className="pt-4">
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </BaseSuperLayout>
  );
};

export default page;
