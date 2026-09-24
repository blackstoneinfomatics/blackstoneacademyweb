"use client";

import React, { useState } from "react";
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import OrganizationHeader, {
    OrganizationTab,
} from "../../components/OrganizationHeader";
import BackupCard from "./statscards/BackupCard";
import AllBackupsTable from "./bottomsection/AllBackupsTable";

const Page = () => {
    const [tab, setTab] = useState<OrganizationTab>("All");

    return (
        <BaseSuperLayout>
            <SuperAdminHeader currentSection="Analytics" />

            <div>
                <OrganizationHeader
                    showTabs
                    activeTab={tab}
                    onTabChange={setTab}
                    currentSection=""
                />
            </div>

            <div className="min-h-screen bg-[#F4F6FB] dark:bg-[#252525] rounded-xl p-5">
                {/* ── Backup stats cards ── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <BackupCard type="totalBackups" />
                    <BackupCard type="currentMonthBackups" />
                    <BackupCard type="backupsDelivered" />


                </div>
                <div className="mt-4">
                    <AllBackupsTable />
                </div>

            </div>
        </BaseSuperLayout>
    );
};

export default Page;