"use client";

import SuperAdminHeader from "../../components/SuperAdminHeader";
import TicketDashboardCards from "./TicketDashboardCards";
import TicketsTable from "./TicketsTable";

export default function Page() {
  return (
    <>
      <SuperAdminHeader currentSection="Tickets" />
      <div className="rounded-xl bg-[#F7F8FE] px-4 dark:bg-[#1F1F1F]">
        <div className="mt-2 flex items-center justify-between py-2">
          <h2 className="mb-0 px-2 py-3 text-[19px] font-semibold text-black dark:text-white">
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
