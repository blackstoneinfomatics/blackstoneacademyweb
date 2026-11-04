"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdTune } from "react-icons/md";
import { Search, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface Backup {
    id: string;
    tenant: string;
    RequestDate: string;
    storage: string;
    backupfromDate: string;
    backuptodate: string;
    status: string;
    additionalNotes?: string;
}

interface TenantBackupRecord {
    additionalNotes?: string;
    _id: string;
    backupId?: string;
    createdAt?: string;
    tenantName?: string;
    dateRange?: {
        fromDate?: string;
        toDate?: string;
    };
    fileDetails?: {
        fileSize?: number | string;
    };
    status?: string;
}

interface TenantBackupListResponse {
    success: boolean;
    message: string;
    data: {
        backupList: TenantBackupRecord[];
        pagination: {
            totalRecords: number;
            currentPage: number;
            totalPages: number;
            limit: number;
        };
    };
}

const formatDate = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
          });
};

const formatStorage = (value?: number | string) => {
    if (value === undefined || value === null || value === "") return "—";
    if (typeof value === "string") return value;
    if (!Number.isFinite(value) || value < 0) return "—";
    if (value === 0) return "0 B";

    const units = ["B", "KB", "MB", "GB", "TB"];
    const unitIndex = Math.min(
        Math.floor(Math.log(value) / Math.log(1024)),
        units.length - 1,
    );
    return `${(value / 1024 ** unitIndex).toFixed(2)} ${units[unitIndex]}`;
};

const mapBackup = (backup: TenantBackupRecord): Backup => ({
    id: backup._id,
    tenant: backup.tenantName || "—",
    RequestDate: formatDate(backup.createdAt),
    storage: formatStorage(backup.fileDetails?.fileSize),
    backupfromDate: formatDate(backup.dateRange?.fromDate),
    backuptodate: formatDate(backup.dateRange?.toDate),
    status: backup.status || "UNKNOWN",
    additionalNotes: backup.additionalNotes || "",
});

const formatStatus = (status: string) =>
    status
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getStatusClass = (status: string) => {
    const normalizedStatus = status.toUpperCase();
    if (["COMPLETED", "SUCCESS", "SUCCEEDED"].includes(normalizedStatus)) {
        return "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300";
    }
    if (["FAILED", "FAILURE", "ERROR"].includes(normalizedStatus)) {
        return "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300";
    }
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
};


const AllBackupsTable = () => {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilter, setShowFilter] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [viewDetailsId, setViewDetailsId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState("");
    const [draftStatusFilter, setDraftStatusFilter] = useState("");
    const [backups, setBackups] = useState<Backup[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const itemsPerPage = 10;

    useEffect(() => {
        const timeoutId = window.setTimeout(
            () => setDebouncedSearch(searchKeyword.trim()),
            300,
        );
        return () => window.clearTimeout(timeoutId);
    }, [searchKeyword]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchBackups = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get<TenantBackupListResponse>(
                    `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT_BACKUP.GET_LIST}`,
                    {
                        params: {
                            page: currentPage,
                            limit: itemsPerPage,
                            search: debouncedSearch,
                            status: statusFilter,
                        },
                        signal: controller.signal,
                    },
                );

                if (!response.data.success) {
                    throw new Error(
                        response.data.message || "Failed to fetch backup list",
                    );
                }

                setBackups(response.data.data.backupList.map(mapBackup));
                setTotalRecords(response.data.data.pagination.totalRecords);
                setTotalPages(Math.max(response.data.data.pagination.totalPages, 1));
            } catch (fetchError) {
                if (controller.signal.aborted) return;
                console.error("Failed to fetch tenant backup list:", fetchError);
                const responseMessage = axios.isAxiosError<{ message?: string }>(
                    fetchError,
                )
                    ? fetchError.response?.data?.message
                    : undefined;
                setError(
                    responseMessage ??
                        (fetchError instanceof Error
                            ? fetchError.message
                            : "Unable to fetch backup list"),
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        void fetchBackups();
        return () => controller.abort();
    }, [currentPage, debouncedSearch, statusFilter]);

    const showingFrom =
        backups.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const showingTo = Math.min(currentPage * itemsPerPage, totalRecords);

    const handleReset = () => {
        setDraftStatusFilter("");
        setStatusFilter("");
        setCurrentPage(1);
    };

    const handleShowResults = (e: React.FormEvent) => {
        e.preventDefault();
        setStatusFilter(draftStatusFilter);
        setCurrentPage(1);
        setShowFilter(false);
    };

    const viewedBackup = backups.find((backup) => backup.id === viewDetailsId) || null;

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
                                placeholder="Search by tenant name"
                                className="bg-transparent outline-none text-[15px] w-52 py-3 dark:text-white dark:placeholder:text-gray-400"
                                value={searchKeyword}
                                onChange={(e) => {
                                    setSearchKeyword(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <div
                            onClick={() => {
                                setDraftStatusFilter(statusFilter);
                                setShowFilter(true);
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    setDraftStatusFilter(statusFilter);
                                    setShowFilter(true);
                                }
                            }}
                            className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
                        >
                            <MdTune className="w-4 h-4" />
                            <span>Filter</span>
                        </div>

                        <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                            <span className="text-left -ml-60">
                                Showing {showingFrom} To {showingTo} Of {totalRecords}
                            </span>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="table-fixed w-full border-collapse">
                        <thead className="text-[13px] bg-[#4C6993] text-white">
                            <tr>
                                {[
                                    "Request Date",
                                    "Tenant",
                                    "Backup From Date",
                                    "Backup To Date",
                                    "Backup Storage",
                                    "Status",
                                    "Action",
                                ].map((header, idx) => (
                                    <th
                                        key={idx}
                                        className="px-8 py-1 border border-[#4C6993] dark:border-[#6A8AB0] text-left text-wrap break-words"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-[14px] text-gray-500 dark:text-gray-400">
                                        Loading backups...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-[14px] text-red-500 dark:text-red-400">
                                        {error}
                                    </td>
                                </tr>
                            ) : backups.map((item, index) => {
                                const rowBgClass =
                                    index % 2 === 0
                                        ? "bg-[#fff] dark:bg-[#2C2C2C]"
                                        : "bg-[#F8F8F8] dark:bg-[#383838]";

                                return (
                                    <tr
                                        key={item.id}
                                        className={`text-[10px] ${rowBgClass}`}
                                    > 

                                        <td className="px-8 py-3 text-[#3D8FDE] font-medium break-words text-[11px] text-left dark:text-sky-300">
                                            {item.RequestDate}
                                        </td>

                                        <td className="px-6 py-3 break-words text-[11px] text-left dark:text-white">
                                            {item.tenant}
                                        </td>

                                        <td className="px-10 py-3 text-[#3D8FDE] font-medium break-words text-[11px] text-left dark:text-sky-300">
                                            {item.backupfromDate}
                                        </td>

                                        <td className="px-10 py-3 text-[#3D8FDE] font-medium break-words text-[11px] text-left dark:text-sky-300">
                                            {item.backuptodate}
                                        </td>

                                        <td className="px-12 py-3 break-words text-[11px] text-left dark:text-white">
                                            {item.storage}
                                        </td>

                                        <td className="px-8 py-3 break-words text-left">
                                            <span
                                                className={`inline-flex items-center justify-center min-w-[90px] h-8 rounded-md px-2 text-xs font-medium ${getStatusClass(item.status)}`}
                                            >
                                                {formatStatus(item.status)}
                                            </span>
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

                            {!loading && !error && backups.length === 0 && (
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

                    {currentPage > 3 && (
                        <>
                            <button
                                type="button"
                                onClick={() => setCurrentPage(1)}
                                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D5D9E2] dark:border-[#4A4A4A] text-[13px] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#3A3A3A]"
                            >
                                1
                            </button>
                            <span className="text-gray-400 px-1">…</span>
                        </>
                    )}

                    {Array.from({
                        length: Math.min(totalPages, 5),
                    }).map((_, i) => {
                        const firstVisiblePage = Math.max(
                            1,
                            Math.min(currentPage - 2, totalPages - 4),
                        );
                        const pageNum = firstVisiblePage + i;
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

                    {currentPage < totalPages - 2 && (
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
                        disabled={currentPage === totalPages || loading}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D5D9E2] dark:border-[#4A4A4A] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#3A3A3A] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

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

                        <div className="mb-6">
                            <label className="mb-2 block text-[13px] font-medium text-[#101B41] dark:text-gray-200">
                                Status
                            </label>
                            <div className="relative">
                                <select
                                    value={draftStatusFilter}
                                    onChange={(e) => setDraftStatusFilter(e.target.value)}
                                    className="w-full appearance-none rounded-md border border-[#D5D9E2] bg-white px-3 py-2.5 pr-9 text-[13px] text-[#101B41] focus:border-[#576CBC] focus:outline-none dark:border-[#555] dark:bg-[#3A3A3A] dark:text-white dark:focus:border-[#8296E6]"
                                >
                                    <option value="">All</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="FAILED">Failed</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="IN_PROGRESS">In Progress</option>
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
                                Show results
                            </button>
                        </div>
                    </form>
                </div>
            )}

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
                                    {viewedBackup.RequestDate}
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
                                    {viewedBackup.backupfromDate}
                                </div>
                            </div>

                            {/* Status */}

                            <div className="sm:col-span-1">
                                <label className="mb-2 block text-[13px] font-medium text-[#101B41] dark:text-gray-200">
                                    Status
                                </label>
                                <div
                                    className={`w-full rounded-md border border-[#D5D9E2] dark:border-[#555] bg-white dark:bg-[#3A3A3A] px-3 py-2.5 text-[13px] font-medium ${
                                        ["COMPLETED", "SUCCESS", "SUCCEEDED"].includes(
                                            viewedBackup.status.toUpperCase(),
                                        )
                                            ? "text-green-600 dark:text-green-400"
                                            : ["FAILED", "FAILURE", "ERROR"].includes(
                                                    viewedBackup.status.toUpperCase(),
                                                )
                                              ? "text-red-600 dark:text-red-400"
                                              : "text-amber-700 dark:text-amber-300"
                                    }`}
                                >
                                {formatStatus(viewedBackup.status)}
                                </div>
                            </div><br/>

                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-[13px] font-medium text-[#101B41] dark:text-gray-200">
                                    Description
                                </label>
                                <textarea
                                    value={viewedBackup.additionalNotes ?? ""}
                                    readOnly
                                    rows={4}
                                    placeholder="No additional notes"
                                    className="w-full resize-none rounded-md border border-[#D5D9E2] bg-white px-3 py-2.5 text-[13px] text-[#101B41] dark:border-[#555] dark:bg-[#3A3A3A] dark:text-white"
                                />
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AllBackupsTable;