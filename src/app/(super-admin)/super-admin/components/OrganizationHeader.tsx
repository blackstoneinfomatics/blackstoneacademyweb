"use client";

import { useTheme } from "@/context/ThemeContext";
import {
    ChevronDown,
    X,
    Landmark,
    GraduationCap,
    BookOpen,
    School,
    Building2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { IoArrowBackCircleSharp } from "react-icons/io5";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type OrganizationTab =
    | "All"
    | "Institute"
    | "School"
    | "College"
    | "University"
    | "Coaching";

export type OrganizationHeaderProps = {
    currentSection?: string;
    showBackButton?: boolean;
    showBackPath?: string;
    showTabs?: boolean;
    activeTab?: OrganizationTab;
    onTabChange?: (tab: OrganizationTab) => void;
    tabs?: OrganizationTab[];
    /**
     * Tabs that are actually ready.
     * Any tab NOT in this list triggers the "Coming Soon" popup.
     * Default: ["All", "Institute"]
     */
    readyTabs?: OrganizationTab[];
    renderAction?: () => React.ReactNode;
    showDateTimePicker?: boolean;
    dateTimeLabel?: string;
    onDateTimeClick?: () => void;
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_TABS: OrganizationTab[] = [
    "All",
    "Institute",
    "School",
    "College",
];

const DEFAULT_READY_TABS: OrganizationTab[] = ["All", "Institute"];

/**
 * Per-tab icon + accent config for the "Coming Soon" popup.
 * Add / change freely.
 */
const TAB_ICON_MAP: Record<
    string,
    {
        icon: React.ReactNode;
        accent: string; // text + icon color
        bg: string; // icon circle bg
        description: string;
    }
> = {
    Institute: {
        icon: <Building2 className="w-8 h-8" />,
        accent: "text-indigo-600 dark:text-indigo-300",
        bg: "bg-indigo-100 dark:bg-indigo-500/20",
        description:
            "The Institute module is under development. It will be available shortly.",
    },
    School: {
        icon: <School className="w-8 h-8" />,
        accent: "text-emerald-600 dark:text-emerald-300",
        bg: "bg-emerald-100 dark:bg-emerald-500/20",
        description:
            "The School module is under development. It will be available shortly.",
    },
    College: {
        icon: <GraduationCap className="w-8 h-8" />,
        accent: "text-amber-600 dark:text-amber-300",
        bg: "bg-amber-100 dark:bg-amber-500/20",
        description:
            "The College module is under development. It will be available shortly.",
    },
    University: {
        icon: <Landmark className="w-8 h-8" />,
        accent: "text-purple-600 dark:text-purple-300",
        bg: "bg-purple-100 dark:bg-purple-500/20",
        description:
            "The University module is under development. It will be available shortly.",
    },
    Coaching: {
        icon: <BookOpen className="w-8 h-8" />,
        accent: "text-rose-600 dark:text-rose-300",
        bg: "bg-rose-100 dark:bg-rose-500/20",
        description:
            "The Coaching module is under development. It will be available shortly.",
    },
    All: {
        icon: <Building2 className="w-8 h-8" />,
        accent: "text-[#576CBC]",
        bg: "bg-[#E4E7F4] dark:bg-[#343434]",
        description:
            "This module is under development. It will be available shortly.",
    },
};

/** Fallback if a tab isn't in the map */
const FALLBACK_ICON = {
    icon: <Building2 className="w-8 h-8" />,
    accent: "text-[#576CBC]",
    bg: "bg-[#E4E7F4] dark:bg-[#343434]",
    description:
        "This module is under development. It will be available shortly.",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function OrganizationHeader({
    currentSection,
    showBackButton = false,
    showBackPath = "",
    showTabs = false,
    activeTab: controlledActiveTab,
    onTabChange,
    tabs = DEFAULT_TABS,
    readyTabs = DEFAULT_READY_TABS,
    renderAction,
    showDateTimePicker = true,
    dateTimeLabel,
    onDateTimeClick,
}: OrganizationHeaderProps) {
    /* ----------------------------- Theme ---------------------------- */
    const theme: any = useTheme();
    const router = useRouter();

    /* ----------------------------- State ---------------------------- */
    const [internalTab, setInternalTab] = useState<OrganizationTab>(
        controlledActiveTab ?? "All",
    );
    const activeTab = controlledActiveTab ?? internalTab;

    const [comingSoonTab, setComingSoonTab] = useState<OrganizationTab | null>(
        null,
    );
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    /* ----------------------------- Body scroll lock ---------------- */
    useEffect(() => {
        if (!comingSoonTab) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [comingSoonTab]);

    /* ----------------------------- Esc to close -------------------- */
    useEffect(() => {
        if (!comingSoonTab) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setComingSoonTab(null);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [comingSoonTab]);

    /* ----------------------------- Derived -------------------------- */
    const formattedDateTime = useMemo(() => {
        if (dateTimeLabel) return dateTimeLabel;
        const now = new Date();
        const date = now
            .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })
            .toUpperCase();
        const time = now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
        return `${date}  |  ${time}`;
    }, [dateTimeLabel]);

    const currentPopupConfig = comingSoonTab
        ? TAB_ICON_MAP[comingSoonTab] ?? FALLBACK_ICON
        : FALLBACK_ICON;

    /* ----------------------------- Tab handler ---------------------- */
    const handleTabClick = useCallback(
        (tab: OrganizationTab) => {
            if (!readyTabs.includes(tab)) {
                setComingSoonTab(tab);
                return;
            }
            if (controlledActiveTab === undefined) setInternalTab(tab);
            onTabChange?.(tab);
        },
        [controlledActiveTab, onTabChange, readyTabs],
    );

    /* ----------------------------- Render --------------------------- */
    return (
        <div className="w-full">
            <div className="flex justify-between items-center py-2 pl-1 mb-1 flex-wrap gap-2">
                {/* ---------- LEFT ---------- */}
                <div className="flex items-center gap-3 flex-wrap">
                    {showBackButton && (
                        <IoArrowBackCircleSharp
                            className="text-[25px] text-[#012a4a] cursor-pointer dark:text-white"
                            onClick={() => router.push(showBackPath)}
                        />
                    )}

                    {currentSection && (
                        <h1 className="text-xl font-semibold text-[#000836] dark:text-white whitespace-nowrap">
                            {currentSection}
                        </h1>
                    )}

                    {showTabs && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                type="button"
                                className="px-4 py-1.5 text-sm rounded-md  bg-white text-black font-medium cursor-default dark:bg-[#252525] dark:text-[#a9b6f5] dark:border-[#576CBC]"
                            >
                                Organization
                            </button>

                            {tabs.map((tab) => {
                                const isActive = activeTab === tab;
                                const isComingSoon = !readyTabs.includes(tab);
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => handleTabClick(tab)}
                                        title={isComingSoon ? "Coming soon" : undefined}
                                        className={`px-4 py-1.5 text-sm rounded-md border transition-all duration-200 font-medium
                      ${isActive
                                                ? "bg-[#576cbc] text-white border-[#576cbc] shadow-sm"
                                                : "bg-[#d7dbef]  text-[#576cbc] border-[#576cbc] hover:bg-[#d7dbef] dark:bg-[#252525] dark:text-[#a9b6f5] dark:border-[#576CBC] dark:hover:bg-[#343434]"
                                            } ${isComingSoon ? "opacity-90" : ""}`}
                                    >
                                        {tab}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ---------- RIGHT ---------- */}
                <div className="flex items-center gap-3 flex-wrap">
                    {renderAction?.()}

                    {showDateTimePicker && (
                        <button
                            onClick={onDateTimeClick}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#3a3a3a] rounded-lg text-[14px] font-medium text-[#000836] dark:text-white hover:bg-[#F0F2F9] dark:hover:bg-[#343434] transition"
                        >
                            <span>{formattedDateTime}</span>

                        </button>
                    )}
                </div>
            </div>

            {/* ============ BUILT-IN "COMING SOON" POPUP ============ */}
            {mounted &&
                comingSoonTab &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center
                       bg-white/40 dark:bg-black/60 backdrop-blur-md"
                        onClick={() => setComingSoonTab(null)}
                        role="dialog"
                        aria-modal="true"
                        style={{ animation: "orgFadeIn 150ms ease-out" }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="relative flex flex-col items-center justify-center gap-4
                         px-8 py-10 rounded-2xl max-w-md w-[90%] text-center
                         bg-white/80 dark:bg-[#252525]/80 backdrop-blur-xl
                         border border-white/70 dark:border-[#3a3a3a]
                         shadow-2xl"
                            style={{ animation: "orgPopIn 200ms ease-out" }}
                        >
                            <button
                                onClick={() => setComingSoonTab(null)}
                                aria-label="Close"
                                className="absolute top-3 right-3 p-1.5 rounded-md
                           text-gray-500 hover:text-red-500 hover:bg-gray-100
                           dark:text-gray-300 dark:hover:bg-[#343434] transition"
                            >
                                <X size={18} />
                            </button>

                            {/* Icon circle — dynamic per tab */}
                            <div
                                className={`w-16 h-16 rounded-full flex items-center justify-center ${currentPopupConfig.bg} ${currentPopupConfig.accent}`}
                            >
                                {currentPopupConfig.icon}
                            </div>

                            <h2 className="text-2xl font-semibold text-[#000836] dark:text-white">
                                {comingSoonTab} — Coming Soon
                            </h2>

                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {currentPopupConfig.description}
                            </p>
                        </div>

                        {/* Keyframes */}
                        <style>{`
              @keyframes orgFadeIn {
                from { opacity: 0; }
                to   { opacity: 1; }
              }
              @keyframes orgPopIn {
                from { opacity: 0; transform: scale(0.95); }
                to   { opacity: 1; transform: scale(1); }
              }
            `}</style>
                    </div>,
                    document.body,
                )}
        </div>
    );
}