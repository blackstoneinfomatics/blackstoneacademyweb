"use client";
import React, { useEffect, useState } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type CardType = "totalLogs" | "UsersActivities" | "FailedActions";

interface AuditCardProps {
    type: CardType;
}

interface AuditCardStatData {
    count: number;
    previousMonth: number;
    percentage: number;
    trend: "up" | "down";
}

interface AuditCardsData {
    totalLogs: AuditCardStatData;
    UsersActivities: AuditCardStatData;
    FailedActions: AuditCardStatData;
}

// ─────────────────────────────────────────────
// 🧪 MOCK DATA — replace with real API later
// ─────────────────────────────────────────────
const MOCK_DATA: AuditCardsData = {
    totalLogs: {
        count: 28,
        previousMonth: 24,
        percentage: 14,
        trend: "up",
    },
    UsersActivities: {
        count: 28,
        previousMonth: 24,
        percentage: 14,
        trend: "up",
    },
    FailedActions: {
        count: 10,
        previousMonth: 8,
        percentage: 14,
        trend: "up",
    },
};

// ─────────────────────────────────────────────
// 🔌 FUTURE API — uncomment when you have an endpoint
// ─────────────────────────────────────────────
// let cache: BackupCardsData | null = null;
// let inflight: Promise<BackupCardsData> | null = null;
// const API_URL = "http://localhost:5001/dashboard/backup-cards";
//
// async function fetchCards(): Promise<BackupCardsData> {
//     if (cache) return cache;
//     if (inflight) return inflight;
//
//     inflight = fetch(API_URL)
//         .then((res) => {
//             if (!res.ok) throw new Error(`HTTP ${res.status}`);
//             return res.json();
//         })
//         .then((json) => {
//             if (!json?.success) throw new Error(json?.message || "API failed");
//             const data: BackupCardsData = json.data;
//             cache = data;
//             inflight = null;
//             return data;
//         })
//         .catch((err) => {
//             inflight = null;
//             throw err;
//         });
//
//     return inflight;
// }

// ─────────────────────────────────────────────
// Static config — colors, icons, titles
// ─────────────────────────────────────────────
const cardConfig = {
    totalLogs: {
        image: "/assets/images/superadmin-auditlogs-totallogs.svg",
        iconBg: "bg-[#e5dffd] dark:bg-[#e5dffd]",
        title: "Total Logs",
        titleColor: "text-[#5225fc] dark:text-[#5225fc]",
    },
    UsersActivities: {
        image: "/assets/images/superadmin-auditlogs-usersactivities.svg",
        iconBg: "bg-[#e3eefb] dark:bg-[#e3eefb]",
        title: "Users Activities",
        titleColor: "text-[#3B82F6] dark:text-[#3B82F6]",
    },
    FailedActions: {
        image: "/assets/images/superadmin-auditlogs-failedactions.svg",
        iconBg: "bg-[#f8e4e4] dark:bg-[#f8e4e4]",
        title: "Failed Actions",
        titleColor: "text-[#40BD5F] dark:text-[#40BD5F]",
    },
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const formatValue = (num: number): string => {
    return num.toLocaleString("en-IN");
};

const getTrendInfo = (trend: "up" | "down", percentage: number) => ({
    label: `${trend === "up" ? "↑" : "↓"} ${percentage.toFixed(0)}%`,
    color:
        trend === "up"
            ? "text-[#E53E3E] dark:text-[#FC8181]" // red (matches reference)
            : "text-[#38A169] dark:text-[#68D391]",
});

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const AuditCards = ({ type }: AuditCardProps) => {
    // ✅ Safe lookup — never crashes
    const config = cardConfig[type] ?? cardConfig.totalLogs;

    // ── Mock data → ready immediately ──
    const [data, setData] = useState<AuditCardsData | null>(MOCK_DATA);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ─────────────────────────────────────────
    // 🔌 When API is ready, replace the useEffect above with:
    // ─────────────────────────────────────────
    // useEffect(() => {
    //     if (cache) {
    //         setData(cache);
    //         setLoading(false);
    //         return;
    //     }
    //     let cancelled = false;
    //
    //     setLoading(true);
    //     fetchCards()
    //         .then((d) => {
    //             if (!cancelled) {
    //                 setData(d);
    //                 setError(null);
    //             }
    //         })
    //         .catch((e) => {
    //             if (!cancelled) setError(e.message);
    //         })
    //         .finally(() => {
    //             if (!cancelled) setLoading(false);
    //         });
    //
    //     return () => {
    //         cancelled = true;
    //     };
    // }, []);

    // Resolve value + trend per card type
    let value = "—";
    let trend = { label: "—", color: "text-gray-400" };

    if (data) {
        if (type === "totalLogs") {
            value = formatValue(data.totalLogs.count);
            trend = getTrendInfo(
                data.totalLogs.trend,
                data.totalLogs.percentage
            );
        } else if (type === "UsersActivities") {
            value = formatValue(data.UsersActivities.count);
            trend = getTrendInfo(
                data.UsersActivities.trend,
                data.UsersActivities.percentage
            );
        } else if (type === "FailedActions") {
            value = formatValue(data.FailedActions.count);
            trend = getTrendInfo(
                data.FailedActions.trend,
                data.FailedActions.percentage
            );
        }
    }

    return (
        <div className="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm min-h-[130px] dark:bg-[#343434] dark:shadow-none dark:border dark:border-[#454545]">
            {/* Top: Icon + Title + Value */}
            <div className="flex items-center gap-4">
                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${config.iconBg}`}
                >
                    {config.image ? (
                        <img
                            src={config.image}
                            alt={config.title}
                            className="h-12 w-12 object-contain"
                        />
                    ) : null}
                </div>

                <div className="flex flex-col">
                    <p className={`text-sm font-semibold ${config.titleColor}`}>
                        {config.title}
                    </p>

                    {loading ? (
                        <div className="mt-1 h-6 w-16 animate-pulse rounded bg-gray-200 dark:bg-[#454545]" />
                    ) : error ? (
                        <h2 className="mt-0.5 text-sm font-semibold text-red-500 dark:text-red-400">
                            Error
                        </h2>
                    ) : (
                        <h2 className="mt-0.5 text-xl font-bold text-[#1A202C] dark:text-white">
                            {value}
                        </h2>
                    )}
                </div>
            </div>

            {/* Bottom: Trend */}
            <div className="mt-4 flex items-center justify-end gap-2 text-xs font-semibold">
                {loading ? (
                    <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-[#454545]" />
                ) : error ? (
                    <span className="text-red-500 dark:text-red-400">{error}</span>
                ) : (
                    <>
                        <span className={trend.color}>{trend.label}</span>
                        <span className="font-medium text-[#646464] dark:text-gray-400">
                            vs last Month
                        </span>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuditCards;