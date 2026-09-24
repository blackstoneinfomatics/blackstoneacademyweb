"use client";

import React, { useState, useMemo } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdTune } from "react-icons/md";
import { FiDownload } from "react-icons/fi";
import { Search, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Backup {
    id: string;
    tenant: string;
    createdDate: string;
    storage: string;
    backupDate: string;
    status: "Active" | "Inactive";
}

interface Filters {
    tenantName: string;
    status: string;
}

// ─────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────
const MOCK_BACKUPS: Backup[] = [
    { id: "1", tenant: "Blackstone Academy", createdDate: "Sep, 12 2023", storage: "5.33 GB", backupDate: "Sep, 12 2023", status: "Active" },
    { id: "2", tenant: "Alfurqan School", createdDate: "Sep, 12 2023", storage: "5.33 GB", backupDate: "Sep, 12 2023", status: "Active" },
    { id: "3", tenant: "Bright Minds School", createdDate: "Sep, 12 2023", storage: "5.33 GB", backupDate: "Sep, 12 2023", status: "Inactive" },
    { id: "4", tenant: "Smart School", createdDate: "Sep, 12 2023", storage: "5.33 GB", backupDate: "Sep, 12 2023", status: "Active" },
    { id: "5", tenant: "Maple Leaf School", createdDate: "Sep, 12 2023", storage: "5.33 GB", backupDate: "Sep, 12 2023", status: "Active" },
    { id: "6", tenant: "Green Valley School", createdDate: "Sep, 12 2023", storage: "5.33 GB", backupDate: "Sep, 12 2023", status: "Active" },
    { id: "7", tenant: "International School", createdDate: "Sep, 12 2023", storage: "5.33 GB", backupDate: "Sep, 12 2023", status: "Active" },
    { id: "8", tenant: "Royal School", createdDate: "Sep, 12 2023", storage: "5.33 GB", backupDate: "Sep, 12 2023", status: "Active" },
    { id: "9", tenant: "Blossom School", createdDate: "Sep, 12 2023", storage: "5.33 GB", backupDate: "Sep, 12 2023", status: "Active" },
    { id: "10", tenant: "Wisdom School", createdDate: "Sep, 12 2023", storage: "5.33 GB", backupDate: "Sep, 12 2023", status: "Inactive" },
    { id: "11", tenant: "Global School", createdDate: "Sep, 12 2023", storage: "5.33 GB", backupDate: "Sep, 12 2023", status: "Inactive" },
];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const AllBackupsTable = () => {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilter, setShowFilter] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [viewDetailsId, setViewDetailsId] = useState<string | null>(null);

    // ── Filter state ──
    const [filters, setFilters] = useState<Filters>({
        tenantName: "",
        status: "",
    });

    const itemsPerPage = 10;

    // ── Filtered data ──
    const filteredBackups = useMemo(() => {
        return MOCK_BACKUPS.filter((b) => {
            const matchesSearch = b.tenant
                .toLowerCase()
                .includes(searchKeyword.toLowerCase());

            const tenantFilter =
                !filters.tenantName ||
                b.tenant.toLowerCase().includes(filters.tenantName.toLowerCase());

            const statusFilter = !filters.status || b.status === filters.status;

            return matchesSearch && tenantFilter && statusFilter;
        });
    }, [searchKeyword, filters]);

    // ── Pagination ──
    const totalPages = Math.ceil(filteredBackups.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBackups = filteredBackups.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const showingFrom = filteredBackups.length === 0 ? 0 : startIndex + 1;
    const showingTo = Math.min(
        startIndex + itemsPerPage,
        filteredBackups.length
    );
    const totalCount = filteredBackups.length;

    // ── Live count for filter modal ──
    const liveFilteredCount = useMemo(() => {
        return MOCK_BACKUPS.filter((b) => {
            const tenantFilter =
                !filters.tenantName ||
                b.tenant.toLowerCase().includes(filters.tenantName.toLowerCase());
            const statusFilter = !filters.status || b.status === filters.status;
            return tenantFilter && statusFilter;
        }).length;
    }, [filters]);

    const handleReset = () => {
        setFilters({ tenantName: "", status: "" });
    };

    const handleShowResults = (e: React.FormEvent) => {
        e.preventDefault();
        setShowFilter(false);
        setCurrentPage(1);
    };

    // ── The currently viewed backup ──
    const viewedBackup = MOCK_BACKUPS.find((b) => b.id === viewDetailsId) || null;

    return (
        <>
            <div className="w-full rounded-[18px] bg-white dark:bg-[#343434] dark:border dark:border-[#454545] shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-none overflow-hidden">
                {/* ── Title ── */}
                <div className="px-5 pt-5 pb-3">
                    <h2 className="text-[20px] font-bold text-[#101B41] dark:text-white">
                        All Backups
                    </h2>
                </div>

                {/* ── Search + Filter + Showing bar ── */}
                <div className="mx-5 mb-4 w-[calc(100%-40px)] bg-[#FAFAFB] dark:bg-[#1F1F1F] rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#1F1F1F]">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by keyword"
                                className="bg-transparent outline-none text-[15px] w-52 py-3 dark:text-white dark:placeholder:text-gray-400"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                        </div>

                        <div
                            onClick={() => setShowFilter(true)}
                            className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
                        >
                            <MdTune className="w-4 h-4" />
                            <span>Filter</span>
                        </div>

                        <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                            <span className="text-left -ml-60">
                                Showing {showingFrom} To {showingTo} Of {totalCount}
                            </span>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="table-fixed w-full border-collapse">
                        <thead className="text-[13px] bg-[#4C6993] text-white">
                            <tr>
                                {[
                                    "Tenant",
                                    "Created Date",
                                    "Storage",
                                    "Backup Date",
                                    "Status",
                                    "Backup",
                                    "Action",
                                ].map((header, idx) => (
                                    <th
                                        key={idx}
                                        className="px-10 py-1 border border-[#4C6993] dark:border-[#6A8AB0] text-left text-wrap break-words"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedBackups.map((item, index) => {
                                const rowBgClass =
                                    index % 2 === 0
                                        ? "bg-[#fff] dark:bg-[#2C2C2C]"
                                        : "bg-[#F8F8F8] dark:bg-[#383838]";

                                return (
                                    <tr
                                        key={item.id}
                                        className={`text-[10px] ${rowBgClass}`}
                                    >
                                        <td className="px-6 py-3 break-words text-[11px] text-left dark:text-white">
                                            {item.tenant}
                                        </td>

                                        <td className="px-12 py-3 text-[#3D8FDE] font-medium break-words text-[11px] text-left dark:text-sky-300">
                                            {item.createdDate}
                                        </td>

                                        <td className="px-12 py-3 break-words text-[11px] text-left dark:text-white">
                                            {item.storage}
                                        </td>

                                        <td className="px-10 py-3 text-[#3D8FDE] font-medium break-words text-[11px] text-left dark:text-sky-300">
                                            {item.backupDate}
                                        </td>

                                        <td className="px-8 py-3 break-words text-left">
                                            <span
                                                className={`inline-flex items-center justify-center w-[90px] h-8 rounded-md text-xs font-medium ${item.status === "Active"
                                                    ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300"
                                                    : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
                                                    }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-3 text-left">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1.5 rounded-md bg-[#EDEFFF] px-3 py-1.5 text-[11px] font-medium text-[#576CBC] hover:bg-[#DFE3FF] dark:bg-[#2E3658] dark:text-[#A8B7E8] dark:hover:bg-[#3A4570] transition-colors"
                                            >
                                                <FiDownload className="w-3.5 h-3.5" />
                                                Download
                                            </button>
                                        </td>

                                        <td className="px-14 py-3 text-left relative text-[14px]">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setOpenDropdownId((prev) =>
                                                        prev === item.id ? null : item.id
                                                    )
                                                }
                                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                                            >
                                                <BsThreeDotsVertical />
                                            </button>

                                            {openDropdownId === item.id && (
                                                <div className="absolute right-8 top-10 w-28 bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                                                    <button
                                                        className="block w-full text-left px-4 py-2 text-[10px] hover:bg-gray-100 dark:hover:bg-[#444] dark:text-gray-200"
                                                        onClick={() => {
                                                            setViewDetailsId(item.id);
                                                            setOpenDropdownId(null);
                                                        }}
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {paginatedBackups.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-[14px] text-gray-500 dark:text-gray-400"
                                    >
                                        No backups found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                <div className="flex items-center justify-end gap-2 px-6 py-4">
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D5D9E2] dark:border-[#4A4A4A] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#3A3A3A] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                        const pageNum = i + 1;
                        const isActive = pageNum === currentPage;
                        return (
                            <button
                                key={pageNum}
                                type="button"
                                onClick={() => setCurrentPage(pageNum)}
                                className={`flex h-8 w-8 items-center justify-center rounded-md text-[13px] font-medium transition-colors ${isActive
                                    ? "border border-[#576CBC] text-[#576CBC] dark:border-[#8296E6] dark:text-[#8296E6]"
                                    : "border border-[#D5D9E2] dark:border-[#4A4A4A] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#3A3A3A]"
                                    }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    {totalPages > 5 && (
                        <>
                            <span className="text-gray-400 px-1">…</span>
                            <button
                                type="button"
                                onClick={() => setCurrentPage(totalPages)}
                                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D5D9E2] dark:border-[#4A4A4A] text-[13px] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#3A3A3A]"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D5D9E2] dark:border-[#4A4A4A] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#3A3A3A] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ═══════════════════════════════════════════ */}
            {/* Filter Modal */}
            {/* ═══════════════════════════════════════════ */}
            {showFilter && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
                    onClick={() => setShowFilter(false)}
                >
                    <form
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={handleShowResults}
                        className="w-full max-w-[360px] rounded-[14px] bg-white dark:bg-[#2C2C2C] p-6 shadow-2xl"
                    >
                        <div className="mb-5 flex items-start justify-between">
                            <h2 className="text-[16px] font-bold text-[#101B41] dark:text-white">
                                Filter by
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowFilter(false)}
                                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                aria-label="Close filter"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="mb-2 block text-[13px] font-medium text-[#101B41] dark:text-gray-200">
                                Tenant Name
                            </label>
                            <input
                                type="text"
                                value={filters.tenantName}
                                onChange={(e) =>
                                    setFilters((f) => ({
                                        ...f,
                                        tenantName: e.target.value,
                                    }))
                                }
                                placeholder="Blackstone Academy"
                                className="w-full rounded-md border border-[#D5D9E2] bg-white px-3 py-2.5 text-[13px] text-[#101B41] placeholder:text-gray-400 focus:border-[#576CBC] focus:outline-none dark:border-[#555] dark:bg-[#3A3A3A] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#8296E6]"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="mb-2 block text-[13px] font-medium text-[#101B41] dark:text-gray-200">
                                Status
                            </label>
                            <div className="relative">
                                <select
                                    value={filters.status}
                                    onChange={(e) =>
                                        setFilters((f) => ({
                                            ...f,
                                            status: e.target.value,
                                        }))
                                    }
                                    className="w-full appearance-none rounded-md border border-[#D5D9E2] bg-white px-3 py-2.5 pr-9 text-[13px] text-[#101B41] focus:border-[#576CBC] focus:outline-none dark:border-[#555] dark:bg-[#3A3A3A] dark:text-white dark:focus:border-[#8296E6]"
                                >
                                    <option value="">All</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="rounded-md border border-[#8296E6] bg-white px-5 py-2 text-[13px] font-semibold text-[#576CBC] hover:bg-[#F2F4FF] dark:bg-transparent dark:text-[#A8B7E8] dark:border-[#8296E6] dark:hover:bg-[#2E3658]"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                className="rounded-md bg-[#576CBC] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#4D66B3] dark:bg-[#8296E6] dark:hover:bg-[#6A82CC]"
                            >
                                Show {liveFilteredCount} results
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* View Details Modal — matches reference image */}
            {/* ═══════════════════════════════════════════ */}
            {viewedBackup && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
                    onClick={() => setViewDetailsId(null)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-[580px] rounded-[14px] bg-white dark:bg-[#2C2C2C] p-6 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="mb-5 flex items-start justify-between">
                            <h2 className="text-[16px] font-bold text-[#101B41] dark:text-white">
                                Backup &amp; Restore Details
                            </h2>
                            <button
                                type="button"
                                onClick={() => setViewDetailsId(null)}
                                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                aria-label="Close details"
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                            {/* Tenant Name */}
                            <div>
                                <label className="mb-2 block text-[13px] font-medium text-[#101B41] dark:text-gray-200">
                                    Tenant Name
                                </label>
                                <div className="w-full rounded-md border border-[#D5D9E2] bg-white px-3 py-2.5 text-[13px] text-[#101B41] dark:border-[#555] dark:bg-[#3A3A3A] dark:text-white">
                                    {viewedBackup.tenant}
                                </div>
                            </div>

                            {/* Created Date */}
                            <div>
                                <label className="mb-2 block text-[13px] font-medium text-[#101B41] dark:text-gray-200">
                                    Created Date
                                </label>
                                <div className="w-full rounded-md border border-[#D5D9E2] bg-white px-3 py-2.5 text-[13px] text-[#101B41] dark:border-[#555] dark:bg-[#3A3A3A] dark:text-white">
                                    {viewedBackup.createdDate}
                                </div>
                            </div>

                            {/* Storage */}
                            <div>
                                <label className="mb-2 block text-[13px] font-medium text-[#101B41] dark:text-gray-200">
                                    Storage
                                </label>
                                <div className="w-full rounded-md border border-[#D5D9E2] bg-white px-3 py-2.5 text-[13px] text-[#101B41] dark:border-[#555] dark:bg-[#3A3A3A] dark:text-white">
                                    {viewedBackup.storage}
                                </div>
                            </div>

                            {/* Backup Date */}
                            <div>
                                <label className="mb-2 block text-[13px] font-medium text-[#101B41] dark:text-gray-200">
                                    Backup Date
                                </label>
                                <div className="w-full rounded-md border border-[#D5D9E2] bg-white px-3 py-2.5 text-[13px] text-[#101B41] dark:border-[#555] dark:bg-[#3A3A3A] dark:text-white">
                                    {viewedBackup.backupDate}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="sm:col-span-1">
                                <label className="mb-2 block text-[13px] font-medium text-[#101B41] dark:text-gray-200">
                                    Status
                                </label>
                                <div
                                    className={`w-full rounded-md border border-[#D5D9E2] dark:border-[#555] bg-white dark:bg-[#3A3A3A] px-3 py-2.5 text-[13px] font-medium ${viewedBackup.status === "Active"
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                        }`}
                                >
                                    {viewedBackup.status}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AllBackupsTable;