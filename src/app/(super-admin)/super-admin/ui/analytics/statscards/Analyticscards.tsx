"use client";
import React, { useEffect, useState } from "react";
import { IndianRupee } from "lucide-react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type CardType = "tenant" | "subscription" | "revenue";

interface AnalyticsCardProps {
    type: CardType;
}

interface TenantData {
    count: number;
    previousMonth: number;
    percentage: number;
    trend: "up" | "down";
}

interface SubscriptionData {
    count: number;
    previousMonth: number;
    percentage: number;
    trend: "up" | "down";
}

interface RevenueData {
    amount: number;
    previousMonth: number;
    percentage: number;
    trend: "up" | "down";
}

interface DashboardCardsData {
    tenants: TenantData;
    subscriptions: SubscriptionData;
    revenue: RevenueData;
}

// ─────────────────────────────────────────────
// Module-level cache → 1 fetch for all 3 cards
// ─────────────────────────────────────────────
let cache: DashboardCardsData | null = null;
let inflight: Promise<DashboardCardsData> | null = null;

async function fetchCards(): Promise<DashboardCardsData> {
    if (cache) return cache;
    if (inflight) return inflight;

    inflight = fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.DASHBOARD.GET_CARDS}`)
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then((json) => {
            if (!json?.success) throw new Error(json?.message || "API failed");
            const data: DashboardCardsData = json.data;
            cache = data;
            inflight = null;
            return data;
        })
        .catch((err) => {
            inflight = null;
            throw err;
        });

    return inflight;
}

// ─────────────────────────────────────────────
// Static config
// ─────────────────────────────────────────────
const cardConfig = {
    tenant: {
        image: "/assets/images/superadmin-analytics-totaltenants.svg",
        iconBg: "bg-[#e5dffd] dark:bg-[#e5dffd]",
        title: "Total Tenants",
        titleColor: "text-[#5225fc] dark:text-[#5225fc]",
    },
    subscription: {
        image: "/assets/images/superadmin-analytics-totalsubscriptions.svg",
        iconBg: "bg-[#e3f4e7] dark:bg-[#e3f4e7]",
        title: "Total Subscriptions",
        titleColor: "text-[#40BD5F] dark:text-[#40BD5F]",
    },
    revenue: {
        icon: IndianRupee,
        iconBg: "bg-[#fdf2df] dark:bg-[#fdf2df]",
        iconColor: "text-[#FCAA25] dark:text-[#FCAA25]",
        title: "Total Revenue",
        titleColor: "text-[#FCAA25] dark:text-[#FCAA25]",
    },
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const formatValue = (num: number, type: CardType): string => {
    if (type === "revenue") {
        return num.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }
    return num.toLocaleString("en-IN");
};

const getTrendInfo = (trend: "up" | "down", percentage: number) => ({
    label: `${trend === "up" ? "↑" : "↓"} ${percentage.toFixed(1)}%`,
    color:
        trend === "up"
            ? "text-[#38A169] dark:text-[#68D391]"
            : "text-[#E53E3E] dark:text-[#FC8181]",
});

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const AnalyticsCard = ({ type }: AnalyticsCardProps) => {
    const config = cardConfig[type];
    const Icon = "icon" in config ? config.icon : null;

    const [data, setData] = useState<DashboardCardsData | null>(cache);
    const [loading, setLoading] = useState(!cache);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (cache) return;
        let cancelled = false;

        setLoading(true);
        fetchCards()
            .then((d) => {
                if (!cancelled) {
                    setData(d);
                    setError(null);
                }
            })
            .catch((e) => {
                if (!cancelled) setError(e.message);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    // Resolve value + trend per card type
    let value = "—";
    let trend = { label: "—", color: "text-gray-400" };

    if (data) {
        if (type === "tenant") {
            value = formatValue(data.tenants.count, type);
            trend = getTrendInfo(data.tenants.trend, data.tenants.percentage);
        } else if (type === "subscription") {
            value = formatValue(data.subscriptions.count, type);
            trend = getTrendInfo(
                data.subscriptions.trend,
                data.subscriptions.percentage
            );
        } else if (type === "revenue") {
            value = formatValue(data.revenue.amount, type);
            trend = getTrendInfo(data.revenue.trend, data.revenue.percentage);
        }
    }

    return (
        <div className="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm min-h-[130px] dark:bg-[#343434] dark:shadow-none dark:border dark:border-[#454545]">
            {/* Top: Icon/Image + Title + Value */}
            <div className="flex items-center gap-4">
                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${config.iconBg}`}
                >
                    {"image" in config && config.image ? (
                        <img
                            src={config.image}
                            alt={config.title}
                            className="h-13 w-13 object-contain"
                        />
                    ) : Icon ? (
                        <Icon
                            className={"iconColor" in config ? config.iconColor : ""}
                            size={26}
                            strokeWidth={2.5}
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

export default AnalyticsCard;