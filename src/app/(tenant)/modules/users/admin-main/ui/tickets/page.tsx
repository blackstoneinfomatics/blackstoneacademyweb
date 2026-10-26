// src/app/(tenant)/modules/users/admin-main/ui/tickets/page.tsx

"use client";

import React, { useState } from "react";

import RaiseTicketsContent from "./raise-tickets/page";
import AdminHeader from "../../components/AdminHeader";
import BaseLayout4 from "../../components/BaseLayout4";
import ReceivedTicketsContent from "./received-tickets/page";

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState<"received" | "raised">("received");

  return (
    <BaseLayout4>
      <AdminHeader currentSection="Tickets" />

      <div className="flex flex-col space-y-6">
        {/* Tabs */}
        <div className="flex ml-4 items-center gap-4 border-b border-[#E6EAF2] dark:border-[#3F3F3F]">
          <button
            onClick={() => setActiveTab("received")}
            className={`relative pb-2 text-[14px] font-medium transition-colors ${
              activeTab === "received"
                ? "text-[#576CBC]"
                : "text-[#010e30] hover:text-[#576CBC] dark:text-[#B5B5B5]"
            }`}
          >
            <span>Received Ticket</span>

            {activeTab === "received" && (
              <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#576CBC] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("raised")}
            className={`relative pb-2 text-[14px] font-medium transition-colors ${
              activeTab === "raised"
                ? "text-[#576CBC]"
                : "text-[#010e30] hover:text-[#576CBC] dark:text-[#B5B5B5]"
            }`}
          >
            <span>Raise Ticket</span>

            {activeTab === "raised" && (
              <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#576CBC] rounded-full" />
            )}
          </button>
        </div>

        {/* Render the active tab content */}
        {activeTab === "received" ? (
          <ReceivedTicketsContent />
        ) : (
          <RaiseTicketsContent />
        )}
      </div>
    </BaseLayout4>
  );
}
