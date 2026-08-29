"use client";

import React, { useEffect, useState } from "react";
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import Tabs from "./components/Tabs";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

type FinanceTab =
  | "transactions"
  | "refunds"
  | "revenue"
  | "billing"
  | "invoice"
  | "analytics";

const page = () => {
 const searchParams = useSearchParams();
const router = useRouter();

const [activeTab, setActiveTab] = useState<FinanceTab>("transactions");

useEffect(() => {
  const tab = searchParams.get("tab") as FinanceTab | null;

  if (tab) {
    setActiveTab(tab);
  }
}, [searchParams]);

const handleTabChange = (tab: FinanceTab) => {
  setActiveTab(tab);
  router.replace(`/super-admin/ui/finance?tab=${tab}`);
};

  return (
    <BaseSuperLayout>
      <SuperAdminHeader currentSection="Finance" tenantActiveTab={activeTab} />
      <div className="">
        <Tabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </BaseSuperLayout>
  );
};

export default page;
