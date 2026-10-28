"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
    Search,
    SlidersHorizontal,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    X,
    Info,
    Loader2,
} from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import AdminHeader from "../../components/AdminHeader";
import BaseLayout4 from "../../components/BaseLayout4";
import PurchaseUpdateModal from "./PurchaseUpdateModal";

interface UpdateItem {
    id: string;
    updateTitle: string;
    description: string;
    category: string;
    publishDate: string;
    publishDateRaw: string | null;
    status: string;
    purchaseStatus: string;
}

type FilterState = {
    title: string;
    category: string;
    status: string;
    purchaseStatus: string;
    fromDate: string;
    toDate: string;
};

const INITIAL_FILTERS: FilterState = {
    title: "",
    category: "All",
    status: "All",
    purchaseStatus: "All",
    fromDate: "",
    toDate: "",
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5001/api";

const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("hillescape_token");
};

const authHeaders = (): HeadersInit => {
    const token = getAuthToken();
    const base: Record<string, string> = { "Content-Type": "application/json" };
    if (token) base.Authorization = `Bearer ${token}`;
    return base;
};

const categoryBadgeClass = (category: string) => {
    switch (category?.toLowerCase()) {
        case "feature release": return "bg-[#DDE9FF] text-[#3E6DB5]";
        case "maintenance": return "bg-[#E4DAFF] text-[#6E4ED1]";
        case "security update": return "bg-[#FCE4D6] text-[#C97C3A]";
        case "bug fix": return "bg-[#E4DAFF] text-[#6E4ED1]";
        default: return "bg-gray-100 text-gray-600";
    }
};

const statusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
        case "published": return "bg-[#E5F5EA] text-[#3A8F4A]";
        case "scheduled": return "bg-[#E0EDFF] text-[#3E6DB5]";
        case "draft": return "bg-gray-100 text-gray-600";
        default: return "bg-gray-100 text-gray-600";
    }
};

const purchaseBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
        case "purchased": return "bg-[#E5F5EA] text-[#3A8F4A]";
        case "not purchased": return "bg-[#F0F1F3] text-[#8A8F98]";
        case "requested": return "bg-[#FDF2D9] text-[#C88C29]";
        default: return "bg-gray-100 text-gray-600";
    }
};

const formatDate = (iso: string | null | undefined) => {
    if (!iso) return "N/A";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const Updates = () => {
    const [updatesData, setUpdatesData] = useState<UpdateItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tenantId, setTenantId] = useState<string>("");

    const [search, setSearch] = useState("");
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [draftFilters, setDraftFilters] = useState<FilterState>(INITIAL_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState<FilterState>(INITIAL_FILTERS);
    const [currentPage, setCurrentPage] = useState(1);
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<UpdateItem | null>(null);

    const itemsPerPage = 10;

    useEffect(() => {
        try {
            const tid = localStorage.getItem("tenantId");
            if (tid) {
                setTenantId(tid);
                return;
            }
            setError("Tenant ID not found. Please log in again.");
            setIsLoading(false);
        } catch (err) {
            setError("Failed to read user session. Please log in again.");
            setIsLoading(false);
        }
    }, []);

    const fetchUpdates = useCallback(async (tid: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/updates/tenant/${tid}`, {
                headers: authHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch updates: ${response.status} ${response.statusText}`);
            }

            const json = await response.json();
            const rawData: any[] = json.data ?? json ?? [];

            const mapped: UpdateItem[] = rawData.map((item) => {
                const rawDate = item.publishDate ?? item.releaseDate ?? null;
                return {
                    id: item._id ?? item.id ?? String(Math.random()),
                    updateTitle: item.title ?? item.updateTitle ?? "Untitled",
                    description: item.description ?? "",
                    category: item.category ?? "General",
                    publishDateRaw: rawDate,
                    publishDate: formatDate(rawDate),
                    status: item.status ?? "Draft",
                    purchaseStatus: item.purchaseStatus ?? "Not Purchased",
                };
            });

            setUpdatesData(mapped);
        } catch (err) {
            setError((err as Error).message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!tenantId) return;
        fetchUpdates(tenantId);
    }, [tenantId, fetchUpdates]);

    const categoryOptions = useMemo(() => Array.from(new Set(updatesData.map((u) => u.category))).filter(Boolean), [updatesData]);
    const statusOptions = useMemo(() => Array.from(new Set(updatesData.map((u) => u.status))).filter(Boolean), [updatesData]);
    const purchaseOptions = useMemo(() => Array.from(new Set(updatesData.map((u) => u.purchaseStatus))).filter(Boolean), [updatesData]);

    const filterFn = useCallback((item: UpdateItem, filters: FilterState, term: string) => {
        const matchesSearch = !term || [item.updateTitle, item.description, item.category, item.publishDate, item.status, item.purchaseStatus].join(" ").toLowerCase().includes(term);
        const matchesTitle = !filters.title || item.updateTitle.toLowerCase().includes(filters.title.toLowerCase());
        const matchesCategory = filters.category === "All" || item.category === filters.category;
        const matchesStatus = filters.status === "All" || item.status === filters.status;
        const matchesPurchase = filters.purchaseStatus === "All" || item.purchaseStatus === filters.purchaseStatus;

        const rowDate = item.publishDateRaw ? new Date(item.publishDateRaw) : null;
        const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
        const toDate = filters.toDate ? new Date(`${filters.toDate}T23:59:59`) : null;
        const matchesDate = (!fromDate || (rowDate && rowDate >= fromDate)) && (!toDate || (rowDate && rowDate <= toDate));

        return matchesSearch && matchesTitle && matchesCategory && matchesStatus && matchesPurchase && matchesDate;
    }, []);

    const filteredItems = useMemo(() => {
        const term = search.toLowerCase().trim();
        return updatesData.filter((item) => filterFn(item, appliedFilters, term));
    }, [updatesData, search, appliedFilters, filterFn]);

    const previewFilteredItems = useMemo(() => {
        const term = search.toLowerCase().trim();
        return updatesData.filter((item) => filterFn(item, draftFilters, term));
    }, [updatesData, search, draftFilters, filterFn]);

    const activeFilterCount = Object.entries(appliedFilters).filter(([, value]) => value && value !== "All").length;
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
    const currentPageSafe = Math.min(currentPage, totalPages);
    const startIndex = (currentPageSafe - 1) * itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);
    const showingStart = filteredItems.length === 0 ? 0 : startIndex + 1;
    const showingEnd = Math.min(startIndex + itemsPerPage, filteredItems.length);

    const handleOpenView = (item: UpdateItem) => {
        setSelectedItem(item);
        setIsViewModalOpen(true);
        setOpenMenu(null);
    };

    const handleOpenPurchase = (item: UpdateItem) => {
        setSelectedItem(item);
        setIsPurchaseModalOpen(true);
        setOpenMenu(null);
    };

    const handleConfirmPurchase = (scheduleType: string) => {
        const newStatus = scheduleType === "immediate" ? "Purchased" : "Requested";
        setUpdatesData((prev) =>
            prev.map((u) => u.id === selectedItem?.id ? { ...u, purchaseStatus: newStatus } : u)
        );
        setIsPurchaseModalOpen(false);
        setSelectedItem(null);
    };

    return (
        <BaseLayout4>
            <AdminHeader currentSection={"Updates"} />
            <div className="flex flex-col space-y-6">
                <div className="bg-white rounded-xl shadow-lg dark:bg-[#343434] overflow-hidden border-t border-[#E6EAF2] dark:border-[#3F3F3F]">
                    {/* Toolbar */}
                    <div className="grid grid-cols-1 border-b border-[#E6EAF2] dark:border-[#3F3F3F] md:grid-cols-3">
                        <div className="flex h-12 items-center border-b border-[#E6EAF2] px-4 dark:border-[#3F3F3F] md:border-b-0 md:border-r">
                            <Search size={17} className="text-[#A5AAB4] dark:text-[#B5B5B5]" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Search by keyword"
                                className="ml-2 w-full bg-transparent text-sm text-[#444] outline-none placeholder:text-[#A5AAB4] dark:text-[#E2E2E2] dark:placeholder:text-[#8A8A8A]"
                            />
                        </div>

                        <div className="border-b border-[#E6EAF2] dark:border-[#3F3F3F] md:border-b-0 md:border-r">
                            <button
                                onClick={() => {
                                    setDraftFilters({ ...appliedFilters });
                                    setShowFilterPanel(true);
                                }}
                                className="flex h-12 w-full items-center justify-between px-4 text-sm text-[#80848E] transition hover:bg-gray-50 dark:text-[#B5B5B5] dark:hover:bg-[#2F2F2F]"
                            >
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal size={16} />
                                    Filter
                                    {activeFilterCount > 0 && (
                                        <span className="rounded-full bg-[#576CBC] px-2 py-[2px] text-[11px] text-white">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </div>
                                <ChevronDown size={16} />
                            </button>
                        </div>

                        <div className="flex h-12 items-center px-4 text-sm text-[#80848E] dark:text-[#B5B5B5]">
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin" /> Loading...
                                </span>
                            ) : error ? (
                                <span className="text-red-500">{error}</span>
                            ) : (
                                <>Showing {showingStart}-{showingEnd} of {filteredItems.length}</>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <div className="max-h-[520px] overflow-y-auto scrollbar-none">
                            <table className="min-w-full text-xs border-collapse table-fixed">
                                <thead className="text-[14px] bg-[#4C6993] text-white dark:bg-[#44699d] sticky top-0 z-10">
                                    <tr>
                                        {["Update Title", "Description", "Category", "Publish Date", "Status", "Purchase Status", "Action"].map((header) => (
                                            <th key={header} className="py-4 px-2 font-medium text-left border border-[#466993]">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, idx) => (
                                            <tr key={idx} className="text-[12px] odd:bg-[#f8f8f8] even:bg-[#ffffff] dark:odd:bg-[#2c2c2c] dark:even:bg-[#303030]">
                                                {Array.from({ length: 7 }).map((__, j) => (
                                                    <td key={j} className="py-4 px-2">
                                                        <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-[#454545]" />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : paginatedItems.length > 0 ? (
                                        paginatedItems.map((item) => {
                                            // 👇 CONDITIONAL LOGIC FOR BUTTONS
                                            const isAlreadyPurchased = item.purchaseStatus?.toLowerCase() === "purchased" || item.purchaseStatus?.toLowerCase() === "requested";
                                            const isScheduled = item.status?.toLowerCase() === "scheduled";

                                            // Only show purchase if it's NOT purchased AND NOT scheduled
                                            const canPurchase = !isAlreadyPurchased && !isScheduled;

                                            return (
                                                <tr key={item.id} className="text-[12px] text-[#24324B] dark:text-gray-200 odd:bg-[#f8f8f8] even:bg-[#ffffff] dark:odd:bg-[#2c2c2c] dark:even:bg-[#303030]">
                                                    <td className="py-4 px-2 font-medium">{item.updateTitle}</td>
                                                    <td className="py-4 px-2 truncate max-w-[200px]" title={item.description}>{item.description}</td>
                                                    <td className="py-4 px-2">
                                                        <span className={`px-2 text-[11px] py-[3px] rounded-md ${categoryBadgeClass(item.category)}`}>
                                                            {item.category}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-2">{item.publishDate}</td>
                                                    <td className="py-4 px-2">
                                                        <span className={`px-2 text-[11px] py-[3px] rounded-md ${statusBadgeClass(item.status)}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-2">
                                                        <span className={`px-2 text-[11px] py-[3px] rounded-md ${purchaseBadgeClass(item.purchaseStatus)}`}>
                                                            {item.purchaseStatus}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-2 relative">
                                                        <button
                                                            onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
                                                            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                                                        >
                                                            <BsThreeDotsVertical size={16} />
                                                        </button>

                                                        {openMenu === item.id && (
                                                            <div className="absolute right-8 top-10 z-50 w-[160px] rounded-lg border border-gray-200 bg-white text-gray-800 shadow-xl dark:border-gray-700 dark:bg-[#2c2c2c] dark:text-gray-100 flex flex-col overflow-hidden">

                                                                {/* Only show Purchase if allowed */}
                                                                {canPurchase && (
                                                                    <button
                                                                        className="w-full border-b px-4 py-2.5 text-left text-xs font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                                                                        onClick={() => handleOpenPurchase(item)}
                                                                    >
                                                                        Purchase Update
                                                                    </button>
                                                                )}

                                                                {/* View Details is always visible */}
                                                                <button
                                                                    className="w-full px-4 py-2.5 text-left text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                                    onClick={() => handleOpenView(item)}
                                                                >
                                                                    View Details
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="p-4 text-center text-gray-500 dark:text-gray-300">
                                                {error ? "Failed to load data." : "No updates found."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-end gap-2 border-t border-[#E6EAF2] px-4 py-3 dark:border-[#3F3F3F]">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPageSafe === 1 || isLoading}
                        className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#4A4A4A] dark:hover:bg-[#2F2F2F]"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            disabled={isLoading}
                            className={`flex h-8 w-8 items-center justify-center rounded border font-medium ${currentPageSafe === p
                                ? "border-[#496A96] bg-white text-[#496A96] dark:border-[#7FA7E8] dark:bg-[#343434] dark:text-[#B8D0FF]"
                                : "border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 dark:border-[#4A4A4A] dark:hover:bg-[#2F2F2F]"
                                }`}
                        >
                            {p}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPageSafe === totalPages || isLoading}
                        className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#4A4A4A] dark:hover:bg-[#2F2F2F]"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilterPanel && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4">
                        <div className="w-full max-w-[360px] rounded-2xl border border-[#E6EAF2] dark:border-[#3F3F3F] bg-white dark:bg-[#2c2c2c] p-5 shadow-2xl">
                            <div className="mb-5 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-[#101B41] dark:text-white font-sans">Filter by</h3>
                                <button onClick={() => setShowFilterPanel(false)} className="text-[#B8C0D3] hover:text-[#6E7891] dark:hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">Update Title</label>
                                    <input
                                        value={draftFilters.title}
                                        onChange={(e) => setDraftFilters((prev) => ({ ...prev, title: e.target.value }))}
                                        placeholder="Enter update title"
                                        className="h-8 w-full rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none placeholder:text-[#8693AE] dark:placeholder:text-[#7A7A7A]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">Category</label>
                                    <div className="relative">
                                        <select
                                            value={draftFilters.category}
                                            onChange={(e) => setDraftFilters((prev) => ({ ...prev, category: e.target.value }))}
                                            className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none"
                                        >
                                            <option value="All">Select Category</option>
                                            {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                                        </select>
                                        <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F] dark:text-[#B5B5B5]" />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">Status</label>
                                    <div className="relative">
                                        <select
                                            value={draftFilters.status}
                                            onChange={(e) => setDraftFilters((prev) => ({ ...prev, status: e.target.value }))}
                                            className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none"
                                        >
                                            <option value="All">Select Status</option>
                                            {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                                        </select>
                                        <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F] dark:text-[#B5B5B5]" />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">Purchase Status</label>
                                    <div className="relative">
                                        <select
                                            value={draftFilters.purchaseStatus}
                                            onChange={(e) => setDraftFilters((prev) => ({ ...prev, purchaseStatus: e.target.value }))}
                                            className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none"
                                        >
                                            <option value="All">Select Purchase Status</option>
                                            {purchaseOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                                        </select>
                                        <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F] dark:text-[#B5B5B5]" />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">Publish Date</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="date"
                                            value={draftFilters.fromDate}
                                            onChange={(e) => setDraftFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
                                            className="h-8 w-full rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none"
                                        />
                                        <input
                                            type="date"
                                            value={draftFilters.toDate}
                                            onChange={(e) => setDraftFilters((prev) => ({ ...prev, toDate: e.target.value }))}
                                            className="h-8 w-full rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="my-5 h-px bg-[#E4E8F1] dark:bg-[#4A4A4A]" />

                            <div className="grid grid-cols-3 gap-3">
                                <button onClick={() => setDraftFilters(INITIAL_FILTERS)} className="h-8 rounded-lg border border-[#576CBC] text-sm font-medium text-[#576CBC]">
                                    Reset
                                </button>
                                <button
                                    onClick={() => {
                                        setAppliedFilters({ ...draftFilters });
                                        setCurrentPage(1);
                                        setShowFilterPanel(false);
                                    }}
                                    className="h-8 col-span-2 rounded-lg bg-[#576CBC] text-sm font-medium text-white"
                                >
                                    Show {previewFilteredItems.length} results
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* View Details Modal */}
                {isViewModalOpen && selectedItem && (
                    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4">
                        <div className="w-full max-w-[800px] rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <h2 className="text-[18px] font-medium text-[#24324B]">Updates Details</h2>
                                <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="border border-[#E6EAF2] rounded-xl p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-[16px] font-medium text-[#24324B] mb-2">Update Title</label>
                                            <input type="text" value={selectedItem.updateTitle} readOnly className="w-full h-[42px] px-3 border border-[#D1D5DB] rounded-lg bg-white text-sm text-[#6B7280] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[16px] font-medium text-[#24324B] mb-2">Category</label>
                                            <input type="text" value={selectedItem.category} readOnly className="w-full h-[42px] px-3 border border-[#D1D5DB] rounded-lg bg-white text-sm text-[#6B7280] outline-none" />
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-[16px] font-medium text-[#24324B] mb-2">Description</label>
                                        <textarea value={selectedItem.description} readOnly rows={4} className="w-full p-3 border border-[#D1D5DB] rounded-lg bg-white text-sm text-[#6B7280] outline-none resize-none" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-[#F8F9FA] rounded-xl">
                                        <div>
                                            <label className="block text-[15px] font-medium text-[#24324B] mb-2">Status</label>
                                            <input type="text" value={selectedItem.status} readOnly className="w-full h-[40px] px-3 border border-[#D1D5DB] rounded-lg bg-white text-sm text-[#6B7280] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[15px] font-medium text-[#24324B] mb-2">Requested Send Date</label>
                                            <input type="text" value={selectedItem.publishDate} readOnly className="w-full h-[40px] px-3 border border-[#D1D5DB] rounded-lg bg-white text-sm text-[#6B7280] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[15px] font-medium text-[#24324B] mb-2">Purchase Status</label>
                                            <input type="text" value={selectedItem.purchaseStatus} readOnly className="w-full h-[40px] px-3 border border-[#D1D5DB] rounded-lg bg-white text-sm text-[#6B7280] outline-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ✅ External Purchase Modal Component */}
                <PurchaseUpdateModal
                    isOpen={isPurchaseModalOpen}
                    onClose={() => setIsPurchaseModalOpen(false)}
                    onConfirm={handleConfirmPurchase}
                    data={selectedItem}
                />
            </div>
        </BaseLayout4>
    );
};

export default Updates;