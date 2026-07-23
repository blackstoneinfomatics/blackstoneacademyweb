"use client";

import React, { useState } from "react";
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import Tabs from "./components/Tabs";

type FinanceTab =
  | "transactions"
  | "refunds"
  | "revenue"
  | "billing"
  | "invoice"
  | "tax-gst"
  | "analytics";

const page = () => {
  const [activeTab, setActiveTab] = useState<FinanceTab>("transactions");

  return (
    <BaseSuperLayout>
      <SuperAdminHeader currentSection="Finance" tenantActiveTab={activeTab} />
      <div className="">
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </BaseSuperLayout>
  );
};

export default page;
