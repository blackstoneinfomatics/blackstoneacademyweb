"use client";
import React, { useEffect, useState } from "react";

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

interface AuditCardsApiResponse {
    success: boolean;
    message?: string;
    data: {
        totalLogs: number;
        successLogs: number;
        failureLogs: number;
    };
}

const API_URL = "http://localhost:5001/audit-log/cards";
const CACHE_TTL = 30_000;
const POLL_INTERVAL = 30_000;

let cache: AuditCardsData | null = null;
let cacheTime = 0;
let inflight: Promise<AuditCardsData> | null = null;

async function fetchCards(force = false): Promise<AuditCardsData> {
    const now = Date.now();
    if (!force && cache && now - cacheTime < CACHE_TTL) return cache;
    if (inflight) return inflight;

    inflight = fetch(API_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
    })
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json() as Promise<AuditCardsApiResponse>;
        })
        .then((json) => {
            if (!json?.success) throw new Error(json?.message || "API failed");
            const d = json.data;
            const data: AuditCardsData = {
                totalLogs: {
                    count: d.totalLogs ?? 0,
                    previousMonth: 0,
                    percentage: 0,
                    trend: "up",
                },
                UsersActivities: {
                    count: d.successLogs ?? 0,
                    previousMonth: 0,
                    percentage: 0,
                    trend: "up",
                },
                FailedActions: {
                    count: d.failureLogs ?? 0,
                    previousMonth: 0,
                    percentage: 0,
                    trend: "up",
                },
            };
            cache = data;
            cacheTime = Date.now();
            inflight = null;
            return data;
        })
        .catch((err) => {
            inflight = null;
            throw err;
        });

    return inflight;
}

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

const formatFull = (num: number): string => {
    if (num == null || isNaN(num)) return "0";
    return num.toLocaleString("en-IN");
};

const formatCompact = (num: number): string => {
    if (num == null || isNaN(num)) return "0";
    const abs = Math.abs(num);
    if (abs < 100_000) return num.toLocaleString("en-IN");
    if (abs < 1_000_000) return Math.round(num / 1_000) + "K";
    if (abs < 1_000_000_000)
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
};

const getTrendInfo = (trend: "up" | "down", percentage: number) => ({
    label: `${trend === "up" ? "↑" : "↓"} ${percentage.toFixed(0)}%`,
    color:
        trend === "up"
            ? "text-[#E53E3E] dark:text-[#FC8181]"
            : "text-[#38A169] dark:text-[#68D391]",
});

const AuditCards = ({ type }: AuditCardProps) => {
    const config = cardConfig[type] ?? cardConfig.totalLogs;

    const [data, setData] = useState<AuditCardsData | null>(cache);
    const [loading, setLoading] = useState(!cache);
    const [error, setError] = useState<string | null>(null);
    const [hasNew, setHasNew] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const extractCount = (d: AuditCardsData): number =>
            type === "totalLogs"
                ? d.totalLogs.count
                : type === "UsersActivities"
                    ? d.UsersActivities.count
                    : d.FailedActions.count;

        const load = async (showLoader = false) => {
            if (showLoader) setLoading(true);
            try {
                const d = await fetchCards(true);
                if (cancelled) return;

                const nextCount = extractCount(d);
                const prev = cache?.totalLogs ? extractCount(cache) : null;

                setData((old) => {
                    const oldCount = old ? extractCount(old) : null;
                    if (oldCount != null && nextCount > oldCount) {
                        setHasNew(true);
                        setTimeout(() => {
                            if (!cancelled) setHasNew(false);
                        }, 8_000);
                    }
                    return d;
                });

                setError(null);
            } catch (e: any) {
                if (!cancelled) setError(e.message || "Failed to load");
            } finally {
                if (!cancelled && showLoader) setLoading(false);
            }
        };

        load(!cache);
        const id = setInterval(() => load(false), POLL_INTERVAL);

        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, [type, reloadKey]);

    let currentCount = 0;
    let trend = { label: "—", color: "text-gray-400" };

    if (data) {
        if (type === "totalLogs") {
            currentCount = data.totalLogs.count;
            trend = getTrendInfo(
                data.totalLogs.trend,
                data.totalLogs.percentage
            );
        } else if (type === "UsersActivities") {
            currentCount = data.UsersActivities.count;
            trend = getTrendInfo(
                data.UsersActivities.trend,
                data.UsersActivities.percentage
            );
        } else if (type === "FailedActions") {
            currentCount = data.FailedActions.count;
            trend = getTrendInfo(
                data.FailedActions.trend,
                data.FailedActions.percentage
            );
        }
    }

    const value = formatCompact(currentCount);
    const fullValue = formatFull(currentCount);

    return (
        <div className="relative flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm min-h-[130px] dark:bg-[#343434] dark:shadow-none dark:border dark:border-[#454545]">


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
                        <h2
                            className="mt-0.5 text-xl font-bold text-[#1A202C] dark:text-white"
                            title={fullValue}
                        >
                            {value}
                        </h2>
                    )}
                </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 text-xs font-semibold">
                {loading ? (
                    <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-[#454545]" />
                ) : error ? (
                    <span className="text-red-500 dark:text-red-400">
                        {error}
                    </span>
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