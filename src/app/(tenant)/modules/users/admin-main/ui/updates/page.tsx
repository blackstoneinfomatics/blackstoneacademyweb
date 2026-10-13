"use client";

import React, { useMemo, useState } from "react";
import {
    Search,
    SlidersHorizontal,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import AdminHeader from "../../components/AdminHeader";
import BaseLayout4 from "../../components/BaseLayout4";

interface UpdateItem {
    updateTitle: string;
    description: string;
    category: string;
    publishDate: string;
    status: "Published" | "Scheduled" | "Draft" | string;
    purchaseStatus: "Purchased" | "Not Purchased" | string;
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

// Sample data matching your screenshot
const SAMPLE_UPDATES: UpdateItem[] = [
    { updateTitle: "New Dashboard Released", description: "Storage usage tracking", category: "Feature Release", publishDate: "Today, 10.30 AM", status: "Published", purchaseStatus: "Requested" },
    { updateTitle: "New Dashboard Released", description: "Storage usage tracking", category: "Maintenance", publishDate: "Today, 10.30 AM", status: "Scheduled", purchaseStatus: "Purchased" },
    { updateTitle: "New Dashboard Released", description: "Storage usage tracking", category: "Security Update", publishDate: "Today, 10.30 AM", status: "Published", purchaseStatus: "Purchased" },
    { updateTitle: "New Dashboard Released", description: "Storage usage tracking", category: "Bug Fix", publishDate: "Today, 10.30 AM", status: "Scheduled", purchaseStatus: "Not Purchased" },
    { updateTitle: "New Dashboard Released", description: "Storage usage tracking", category: "Feature Release", publishDate: "Today, 10.30 AM", status: "Published", purchaseStatus: "Purchased" },
    { updateTitle: "New Dashboard Released", description: "Storage usage tracking", category: "Maintenance", publishDate: "Today, 10.30 AM", status: "Scheduled", purchaseStatus: "Not Purchased" },
    { updateTitle: "New Dashboard Released", description: "Storage usage tracking", category: "Security Update", publishDate: "Today, 10.30 AM", status: "Published", purchaseStatus: "Purchased" },
    { updateTitle: "New Dashboard Released", description: "Storage usage tracking", category: "Feature Release", publishDate: "Today, 10.30 AM", status: "Scheduled", purchaseStatus: "Not Purchased" },
    { updateTitle: "New Dashboard Released", description: "Storage usage tracking", category: "Bug Fix", publishDate: "Today, 10.30 AM", status: "Published", purchaseStatus: "Purchased" },
    { updateTitle: "New Dashboard Released", description: "Storage usage tracking", category: "Feature Release", publishDate: "Today, 10.30 AM", status: "Published", purchaseStatus: "Purchased" },
    { updateTitle: "New Dashboard Released", description: "Storage usage tracking", category: "Feature Release", publishDate: "Today, 10.30 AM", status: "Published", purchaseStatus: "Purchased" },
    { updateTitle: "New Dashboard Released", description: "Storage usage tracking", category: "Maintenance", publishDate: "Today, 10.30 AM", status: "Scheduled", purchaseStatus: "Purchased" },
];

/* ------------------------------------------------------------------ */
/* Badge classes                                                       */
/* ------------------------------------------------------------------ */

const categoryBadgeClass = (category: string) => {
    switch (category?.toLowerCase()) {
        case "feature release":
            return "bg-[#DDE9FF] text-[#3E6DB5]";
        case "maintenance":
            return "bg-[#E4DAFF] text-[#6E4ED1]";
        case "security update":
            return "bg-[#FCE4D6] text-[#C97C3A]";
        case "bug fix":
            return "bg-[#E4DAFF] text-[#6E4ED1]";
        default:
            return "bg-gray-100 text-gray-600";
    }
};

const statusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
        case "published":
            return "bg-[#E5F5EA] text-[#3A8F4A]";
        case "scheduled":
            return "bg-[#E0EDFF] text-[#3E6DB5]";
        case "draft":
            return "bg-gray-100 text-gray-600";
        default:
            return "bg-gray-100 text-gray-600";
    }
};

const purchaseBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
        case "purchased":
            return "bg-[#E5F5EA] text-[#3A8F4A]";
        case "not purchased":
            return "bg-[#F0F1F3] text-[#8A8F98]";
        case "requested":
            return "bg-[#FDF2D9] text-[#C88C29]";
        default:
            return "bg-gray-100 text-gray-600";
    }
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const Updates = () => {
    const [search, setSearch] = useState("");
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [draftFilters, setDraftFilters] = useState<FilterState>(INITIAL_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState<FilterState>(INITIAL_FILTERS);
    const [currentPage, setCurrentPage] = useState(1);
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    // ✅ Exactly 10 records per page
    const itemsPerPage = 10;

    const categoryOptions = useMemo(
        () => Array.from(new Set(SAMPLE_UPDATES.map((u) => u.category))).filter(Boolean),
        []
    );
    const statusOptions = useMemo(
        () => Array.from(new Set(SAMPLE_UPDATES.map((u) => u.status))).filter(Boolean),
        []
    );
    const purchaseOptions = useMemo(
        () =>
            Array.from(new Set(SAMPLE_UPDATES.map((u) => u.purchaseStatus))).filter(Boolean),
        []
    );

    const filteredItems = useMemo(() => {
        const term = search.toLowerCase().trim();

        return SAMPLE_UPDATES.filter((item) => {
            const matchesSearch =
                !term ||
                [
                    item.updateTitle,
                    item.description,
                    item.category,
                    item.publishDate,
                    item.status,
                    item.purchaseStatus,
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(term);

            const matchesTitle =
                !appliedFilters.title ||
                item.updateTitle
                    .toLowerCase()
                    .includes(appliedFilters.title.toLowerCase());

            const matchesCategory =
                appliedFilters.category === "All" ||
                item.category === appliedFilters.category;

            const matchesStatus =
                appliedFilters.status === "All" ||
                item.status === appliedFilters.status;

            const matchesPurchase =
                appliedFilters.purchaseStatus === "All" ||
                item.purchaseStatus === appliedFilters.purchaseStatus;

            const rowDate = item.publishDate ? new Date(item.publishDate) : null;
            const fromDate = appliedFilters.fromDate
                ? new Date(appliedFilters.fromDate)
                : null;
            const toDate = appliedFilters.toDate
                ? new Date(`${appliedFilters.toDate}T23:59:59`)
                : null;

            const matchesDate =
                (!fromDate || (rowDate && rowDate >= fromDate)) &&
                (!toDate || (rowDate && rowDate <= toDate));

            return (
                matchesSearch &&
                matchesTitle &&
                matchesCategory &&
                matchesStatus &&
                matchesPurchase &&
                matchesDate
            );
        });
    }, [search, appliedFilters]);

    const previewFilteredItems = useMemo(() => {
        const term = search.toLowerCase().trim();

        return SAMPLE_UPDATES.filter((item) => {
            const matchesSearch =
                !term ||
                [
                    item.updateTitle,
                    item.description,
                    item.category,
                    item.publishDate,
                    item.status,
                    item.purchaseStatus,
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(term);

            const matchesTitle =
                !draftFilters.title ||
                item.updateTitle
                    .toLowerCase()
                    .includes(draftFilters.title.toLowerCase());

            const matchesCategory =
                draftFilters.category === "All" ||
                item.category === draftFilters.category;

            const matchesStatus =
                draftFilters.status === "All" || item.status === draftFilters.status;

            const matchesPurchase =
                draftFilters.purchaseStatus === "All" ||
                item.purchaseStatus === draftFilters.purchaseStatus;

            const rowDate = item.publishDate ? new Date(item.publishDate) : null;
            const fromDate = draftFilters.fromDate
                ? new Date(draftFilters.fromDate)
                : null;
            const toDate = draftFilters.toDate
                ? new Date(`${draftFilters.toDate}T23:59:59`)
                : null;

            const matchesDate =
                (!fromDate || (rowDate && rowDate >= fromDate)) &&
                (!toDate || (rowDate && rowDate <= toDate));

            return (
                matchesSearch &&
                matchesTitle &&
                matchesCategory &&
                matchesStatus &&
                matchesPurchase &&
                matchesDate
            );
        });
    }, [search, draftFilters]);

    const activeFilterCount = Object.entries(appliedFilters).filter(
        ([, value]) => value && value !== "All"
    ).length;

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
    const currentPageSafe = Math.min(currentPage, totalPages);
    const startIndex = (currentPageSafe - 1) * itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);
    const showingStart = filteredItems.length === 0 ? 0 : startIndex + 1;
    const showingEnd = Math.min(startIndex + itemsPerPage, filteredItems.length);

    return (
        <BaseLayout4>
            <AdminHeader currentSection={"Updates"} />
            <div className="flex flex-col space-y-6">
                {/* Table card */}
                <div className="bg-white rounded-xl shadow-lg dark:bg-[#343434] overflow-hidden border-t border-[#E6EAF2] dark:border-[#3F3F3F]">
                    {/* Search / Filter / Showing — fixed above the table */}
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
                            Showing {showingStart}-{showingEnd} of {filteredItems.length}
                        </div>
                    </div>

                    {/* ✅ Only the table body scrolls; header stays visible */}
                    <div className="overflow-x-auto ">
                        <div className="max-h-[520px] overflow-y-auto scrollbar-none">
                            <table className="min-w-full text-xs border-collapse table-fixed">
                                <thead className="text-[14px] bg-[#4C6993] text-white dark:bg-[#44699d] sticky top-0 z-10">
                                    <tr>
                                        {[
                                            "Update Title",
                                            "Description",
                                            "Category",
                                            "Publish Date",
                                            "Status",
                                            "Purchase Status",
                                            "Action",
                                        ].map((header) => (
                                            <th
                                                key={header}
                                                className="py-4 px-2 font-medium text-left border border-[#466993]"
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedItems.length > 0 ? (
                                        paginatedItems.map((item, index) => {
                                            const rowId = `${item.updateTitle}-${index}`;
                                            return (
                                                <tr
                                                    key={rowId}
                                                    className="text-[12px] text-[#24324B] dark:text-gray-200 odd:bg-[#f8f8f8] even:bg-[#ffffff] dark:odd:bg-[#2c2c2c] dark:even:bg-[#303030]"
                                                >
                                                    <td className="py-4 px-2 font-medium">
                                                        {item.updateTitle}
                                                    </td>
                                                    <td className="py-4 px-2">{item.description}</td>
                                                    <td className="py-4 px-2">
                                                        <span
                                                            className={`px-2 text-[11px] py-[3px] rounded-md ${categoryBadgeClass(
                                                                item.category
                                                            )}`}
                                                        >
                                                            {item.category}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-2">{item.publishDate}</td>
                                                    <td className="py-4 px-2">
                                                        <span
                                                            className={`px-2 text-[11px] py-[3px] rounded-md ${statusBadgeClass(
                                                                item.status
                                                            )}`}
                                                        >
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-2">
                                                        <span
                                                            className={`px-2 text-[11px] py-[3px] rounded-md ${purchaseBadgeClass(
                                                                item.purchaseStatus
                                                            )}`}
                                                        >
                                                            {item.purchaseStatus}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-2 relative">
                                                        <button
                                                            onClick={() =>
                                                                setOpenMenu(openMenu === rowId ? null : rowId)
                                                            }
                                                            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                                                        >
                                                            <BsThreeDotsVertical size={16} />
                                                        </button>

                                                        {openMenu === rowId && (
                                                            <div className="absolute right-4 top-12 z-50 w-40 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-lg dark:border-gray-700 dark:bg-[#2c2c2c] dark:text-gray-100">
                                                                <button
                                                                    className="w-full border-b px-4 py-2 text-left text-xs hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
                                                                    onClick={() => setOpenMenu(null)}
                                                                >
                                                                    View Details
                                                                </button>
                                                                <button
                                                                    className="w-full border-b px-4 py-2 text-left text-xs hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
                                                                    onClick={() => setOpenMenu(null)}
                                                                >
                                                                    Publish Now
                                                                </button>
                                                                <button
                                                                    className="w-full px-4 py-2 text-left text-xs text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                    onClick={() => setOpenMenu(null)}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="p-4 text-center text-gray-500 dark:text-gray-300"
                                            >
                                                No updates found
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
                        disabled={currentPageSafe === 1}
                        className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#4A4A4A] dark:hover:bg-[#2F2F2F]"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`flex h-8 w-8 items-center justify-center rounded border font-medium ${currentPageSafe === p
                                ? "border-[#496A96] bg-white text-[#496A96] dark:border-[#7FA7E8] dark:bg-[#343434] dark:text-[#B8D0FF]"
                                : "border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 dark:border-[#4A4A4A] dark:hover:bg-[#2F2F2F]"
                                }`}
                        >
                            {p}
                        </button>
                    ))}

                    <button
                        onClick={() =>
                            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        }
                        disabled={currentPageSafe === totalPages}
                        className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#4A4A4A] dark:hover:bg-[#2F2F2F]"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Filter panel */}
                {showFilterPanel && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4">
                        <div className="w-full max-w-[360px] rounded-2xl border border-[#E6EAF2] dark:border-[#3F3F3F] bg-white dark:bg-[#2c2c2c] p-5 shadow-2xl">
                            <div className="mb-5 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-[#101B41] dark:text-white font-sans">
                                    Filter by
                                </h3>
                                <button
                                    onClick={() => setShowFilterPanel(false)}
                                    className="text-[#B8C0D3] hover:text-[#6E7891] dark:hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">
                                        Update Title
                                    </label>
                                    <input
                                        value={draftFilters.title}
                                        onChange={(e) =>
                                            setDraftFilters((prev) => ({
                                                ...prev,
                                                title: e.target.value,
                                            }))
                                        }
                                        placeholder="Enter update title"
                                        className="h-8 w-full rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none placeholder:text-[#8693AE] dark:placeholder:text-[#7A7A7A]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">
                                        Category
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={draftFilters.category}
                                            onChange={(e) =>
                                                setDraftFilters((prev) => ({
                                                    ...prev,
                                                    category: e.target.value,
                                                }))
                                            }
                                            className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none"
                                        >
                                            <option value="All">Select Category</option>
                                            {categoryOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown
                                            size={18}
                                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F] dark:text-[#B5B5B5]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">
                                        Status
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={draftFilters.status}
                                            onChange={(e) =>
                                                setDraftFilters((prev) => ({
                                                    ...prev,
                                                    status: e.target.value,
                                                }))
                                            }
                                            className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none"
                                        >
                                            <option value="All">Select Status</option>
                                            {statusOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown
                                            size={18}
                                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F] dark:text-[#B5B5B5]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">
                                        Purchase Status
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={draftFilters.purchaseStatus}
                                            onChange={(e) =>
                                                setDraftFilters((prev) => ({
                                                    ...prev,
                                                    purchaseStatus: e.target.value,
                                                }))
                                            }
                                            className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none"
                                        >
                                            <option value="All">Select Purchase Status</option>
                                            {purchaseOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown
                                            size={18}
                                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F] dark:text-[#B5B5B5]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">
                                        Publish Date
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="date"
                                            value={draftFilters.fromDate}
                                            onChange={(e) =>
                                                setDraftFilters((prev) => ({
                                                    ...prev,
                                                    fromDate: e.target.value,
                                                }))
                                            }
                                            className="h-8 w-full rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none"
                                        />
                                        <input
                                            type="date"
                                            value={draftFilters.toDate}
                                            onChange={(e) =>
                                                setDraftFilters((prev) => ({
                                                    ...prev,
                                                    toDate: e.target.value,
                                                }))
                                            }
                                            className="h-8 w-full rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="my-5 h-px bg-[#E4E8F1] dark:bg-[#4A4A4A]" />

                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => setDraftFilters(INITIAL_FILTERS)}
                                    className="h-8 rounded-lg border border-[#576CBC] text-sm font-medium text-[#576CBC]"
                                >
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
            </div>
        </BaseLayout4>
    );
};

export default Updates;