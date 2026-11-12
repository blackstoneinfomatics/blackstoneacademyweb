"use client";
import React, { useState } from "react";
import OrganizationHeader, { OrganizationTab } from "../../components/OrganizationHeader";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import TicketDashboardCards from "./TicketDashboardCards";
import TicketsTable from "./TicketsTable";

export default function Page() {
        const [tab, setTab] = useState<OrganizationTab>("Institute");
  
  return (
    <>
                <SuperAdminHeader currentSection="Tickets" />
                <div>
                  <OrganizationHeader
          
                    showTabs
                    activeTab={tab}
                    onTabChange={setTab} currentSection={""} />
          
                </div>
      <div className="rounded-xl p-4 bg-[#f7f8fd] dark:bg-[#2e2e2e]">
        <div className="mt-2 flex items-center justify-between py-2">
          <h2 className="mb-0 px-2 py-3 text-[16px] font-semibold text-black dark:text-white">
            Institute Tickets
          </h2>
        </div>
        <div>
          <TicketDashboardCards />
          <TicketsTable />
        </div>
      </div>
    </>
  );
}
