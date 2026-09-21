"use client";
import React, { useEffect, useState } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type CardType = "totalBackups" | "currentMonthBackups" | "backupsDelivered";

interface BackupCardProps {
    type: CardType;
}

interface BackupStatData {
    count: number;
    previousMonth: number;
    percentage: number;
    trend: "up" | "down";
}

interface BackupCardsData {
    totalBackups: BackupStatData;
    currentMonthBackups: BackupStatData;
    backupsDelivered: BackupStatData;
}

// ─────────────────────────────────────────────
// 🧪 MOCK DATA — replace with real API later
// ─────────────────────────────────────────────
const MOCK_DATA: BackupCardsData = {
    totalBackups: {
        count: 28,
        previousMonth: 24,
        percentage: 14,
        trend: "up",
    },
    currentMonthBackups: {
        count: 28,
        previousMonth: 24,
        percentage: 14,
        trend: "up",
    },
    backupsDelivered: {
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
    totalBackups: {
        image: "/assets/images/superadmin-backup-totalbackups.svg",
        iconBg: "bg-[#e5dffd] dark:bg-[#e5dffd]",
        title: "Total Backups",
        titleColor: "text-[#5225fc] dark:text-[#5225fc]",
    },
    currentMonthBackups: {
        image: "/assets/images/superadmin-backup-currentmonthbackups.svg",
        iconBg: "bg-[#e3eefb] dark:bg-[#e3eefb]",
        title: "Current Month Backups",
        titleColor: "text-[#3B82F6] dark:text-[#3B82F6]",
    },
    backupsDelivered: {
        image: "/assets/images/superadmin-backup-backupsdelivered.svg",
        iconBg: "bg-[#e3f4e7] dark:bg-[#e3f4e7]",
        title: "Backups Delivered",
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
const BackupCard = ({ type }: BackupCardProps) => {
    // ✅ Safe lookup — never crashes
    const config = cardConfig[type] ?? cardConfig.totalBackups;

    // ── Mock data → ready immediately ──
    const [data, setData] = useState<BackupCardsData | null>(MOCK_DATA);
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
        if (type === "totalBackups") {
            value = formatValue(data.totalBackups.count);
            trend = getTrendInfo(
                data.totalBackups.trend,
                data.totalBackups.percentage
            );
        } else if (type === "currentMonthBackups") {
            value = formatValue(data.currentMonthBackups.count);
            trend = getTrendInfo(
                data.currentMonthBackups.trend,
                data.currentMonthBackups.percentage
            );
        } else if (type === "backupsDelivered") {
            value = formatValue(data.backupsDelivered.count);
            trend = getTrendInfo(
                data.backupsDelivered.trend,
                data.backupsDelivered.percentage
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
            <div className="mt-4 flex items-center mr-2 justify-end gap-2 text-xs font-semibold">
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

export default BackupCard;