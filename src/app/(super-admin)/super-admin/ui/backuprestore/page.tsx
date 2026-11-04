"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import OrganizationHeader, {
    OrganizationTab,
} from "../../components/OrganizationHeader";
import BackupCard from "./statscards/BackupCard";
import type { BackupCardsData } from "./statscards/BackupCard";
import AllBackupsTable from "./bottomsection/AllBackupsTable";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface BackupCardsResponse {
    success: boolean;
    message: string;
    data: BackupCardsData;
}

const Page = () => {
    const [tab, setTab] = useState<OrganizationTab>("All");
    const [backupCards, setBackupCards] = useState<BackupCardsData | null>(null);
    const [loadingBackupCards, setLoadingBackupCards] = useState(true);
    const [backupCardsError, setBackupCardsError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetchBackupCards = async () => {
            try {
                const response = await axios.get<BackupCardsResponse>(
                    `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT_BACKUP.GET_DASHBOARD_CARDS}`,
                );

                if (!response.data.success) {
                    throw new Error(
                        response.data.message || "Failed to fetch backup dashboard cards",
                    );
                }

                if (!cancelled) {
                    setBackupCards(response.data.data);
                    setBackupCardsError(null);
                }
            } catch (error) {
                console.error("Failed to fetch backup dashboard cards:", error);
                const responseMessage = axios.isAxiosError<{ message?: string }>(error)
                    ? error.response?.data?.message
                    : undefined;

                if (!cancelled) {
                    setBackupCardsError(
                        responseMessage ??
                            (error instanceof Error
                                ? error.message
                                : "Unable to fetch backup dashboard cards"),
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingBackupCards(false);
                }
            }
        };

        void fetchBackupCards();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <>
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
                    <BackupCard
                        type="totalBackups"
                        data={backupCards}
                        loading={loadingBackupCards}
                        error={backupCardsError}
                    />
                    <BackupCard
                        type="currentMonthBackups"
                        data={backupCards}
                        loading={loadingBackupCards}
                        error={backupCardsError}
                    />
                    <BackupCard
                        type="backupsDelivered"
                        data={backupCards}
                        loading={loadingBackupCards}
                        error={backupCardsError}
                    />


                </div>
                <div className="mt-4">
                    <AllBackupsTable />
                </div>

            </div>
        </>
    );
};

export default Page;