"use client";

type CardType = "totalBackups" | "currentMonthBackups" | "backupsDelivered";

interface BackupPeriodStat {
    count: number;
    percentage: number;
    trend: "UP" | "DOWN" | "SAME";
}

export interface BackupCardsData {
    totalBackups: number;
    currentMonthBackups: BackupPeriodStat;
    backupsDelivered: BackupPeriodStat;
}

interface BackupCardProps {
    type: CardType;
    data: BackupCardsData | null;
    loading: boolean;
    error: string | null;
}

const cardConfig = {
    totalBackups: {
        image: "/assets/images/superadmin-backup-totalbackups.svg",
        iconBg: "bg-[#e5dffd] dark:bg-[#493D70]",
        title: "Total Backups",
        titleColor: "text-[#5225fc] dark:text-[#B9A6FF]",
    },
    currentMonthBackups: {
        image: "/assets/images/superadmin-backup-currentmonthbackups.svg",
        iconBg: "bg-[#e3eefb] dark:bg-[#263F5B]",
        title: "Current Month Backups",
        titleColor: "text-[#3B82F6] dark:text-[#82B6FF]",
    },
    backupsDelivered: {
        image: "/assets/images/superadmin-backup-backupsdelivered.svg",
        iconBg: "bg-[#e3f4e7] dark:bg-[#294A32]",
        title: "Backups Delivered",
        titleColor: "text-[#40BD5F] dark:text-[#72D889]",
    },
};

const formatValue = (num: number): string => {
    return num.toLocaleString("en-IN");
};

const getTrendInfo = (trend: BackupPeriodStat["trend"], percentage: number) => ({
    label: `${trend === "UP" ? "↑" : trend === "DOWN" ? "↓" : "→"} ${percentage.toFixed(0)}%`,
    color:
        trend === "UP"
            ? "text-[#38A169] dark:text-[#68D391]"
            : trend === "DOWN"
                ? "text-[#E53E3E] dark:text-[#FC8181]"
                : "text-gray-500 dark:text-gray-300",
});

const BackupCard = ({ type, data, loading, error }: BackupCardProps) => {

    const config = cardConfig[type] ?? cardConfig.totalBackups;

    // Resolve value + trend per card type
    let value = "—";
    let trend = { label: "—", color: "text-gray-400 dark:text-gray-300" };

    if (data) {
        if (type === "totalBackups") {
            value = formatValue(data.totalBackups);
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
            {type !== "totalBackups" && (
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
            )}
        </div>
    );
};

export default BackupCard;