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
                        className={`pb-2 text-[14px] font-medium transition-colors ${activeTab === "received"
                            ? "text-[#576CBC] border-b-2 border-[#576CBC]"
                            : "text-[#80848E] hover:text-[#576CBC] dark:text-[#B5B5B5]"
                            }`}
                    >
                        Received Ticket
                    </button>
                    <button
                        onClick={() => setActiveTab("raised")}
                        className={`pb-2 text-[14px] font-medium transition-colors ${activeTab === "raised"
                            ? "text-[#576CBC] border-b-2 border-[#576CBC]"
                            : "text-[#80848E] hover:text-[#576CBC] dark:text-[#B5B5B5]"
                            }`}
                    >
                        Raise Ticket
                    </button>
                </div>

                {/* Render the active tab content */}
                {activeTab === "received" ? <ReceivedTicketsContent /> : <RaiseTicketsContent />}
            </div>
        </BaseLayout4>
    );
}