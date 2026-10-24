"use client";
import React, { useState } from "react";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import NotificationCards from "./NotificationCards";
import NotificationTable from "./NotificationTable";
import OrganizationHeader, { OrganizationTab } from "../../components/OrganizationHeader";


export default function Page() {
      const [tab, setTab] = useState<OrganizationTab>("Institute");
    
  return (<>
          <SuperAdminHeader currentSection="Notifications" />
          <div>
            <OrganizationHeader
    
              showTabs
              activeTab={tab}
              onTabChange={setTab} currentSection={""} />
    
          </div>
      <div className="min-h-[calc(100vh-12px)] rounded-[9px] bg-[#f7f8fd] dark:bg-[#2e2e2e] p-4">
        <h1 className="mb-3 text-[16px] font-semibold text-[#142342] dark:text-white">
          Institute Notifications
        </h1>

        <NotificationCards />

        <NotificationTable />
      </div>
      </>
  );
}