"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdTune } from "react-icons/md";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Calendar,
    Loader2,
} from "lucide-react";

type LogStatus = "Success" | "Warning" | "Failed";

interface Log {
    id: string;
    logId: string;
    tenant: string;
    user: string;
    description: string;
    dateTime: string;
    status: LogStatus;
    ip?: string;
    route?: string;
    method?: string;
    statusCode?: number;
    durationMs?: number;
    payload?: string;
    query?: string;
    response?: string;
    logType?: string;
    action?: string;
}

interface Filters {
    tenantName: string;
    status: string;
    fromDate: string;
    toDate: string;
}

const API_URL = "http://localhost:5001/audit-log";

const mapLogTypeToStatus = (logType?: string): LogStatus => {
    switch ((logType || "").toUpperCase()) {
        case "SUCCESS":
            return "Success";
        case "ERROR":
        case "FAILURE":
        case "FAILED":
            return "Failed";
        case "WARNING":
        case "WARN":
            return "Warning";
        default:
            return "Warning";
    }
};

const formatDateTime = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const normalizeRecord = (rec: any, index: number): Log => {
    const meta = rec?.meta || {};
    return {
        id: rec?._id || `row-${index}`,
        logId: rec?.logId || "—",
        tenant: rec?.tenantId || "—",
        user: rec?.userId || "—",
        description: rec?.readableDescription || rec?.description || "—",
        dateTime: formatDateTime(rec?.createdDate),
        status: mapLogTypeToStatus(rec?.logType),
        ip: rec?.ip,
        route: rec?.route,
        method: meta?.method?.toUpperCase?.(),
        statusCode: meta?.statusCode,
        durationMs: meta?.durationMs,
        payload: meta?.payload,
        query: meta?.query,
        response: meta?.response,
        logType: rec?.logType,
        action: rec?.action,
    };
};

const getStatusStyle = (status: LogStatus) => {
    switch (status) {
        case "Success":
            return "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300";
        case "Warning":
            return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-300";
        case "Failed":
            return "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300";
        default:
            return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
    }
};

const isEmptyValue = (val?: string) => {
    if (val === undefined || val === null) return true;
    const trimmed = String(val).trim();
    if (trimmed === "") return true;
    if (trimmed === "—") return true;
    if (trimmed === "null") return true;
    if (trimmed === "undefined") return true;
    if (trimmed === "{}") return true;
    if (trimmed === "[]") return true;
    return false;
};

const AuditTable = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilter, setShowFilter] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [viewDetailsId, setViewDetailsId] = useState<string | null>(null);

    const [filters, setFilters] = useState<Filters>({
        tenantName: "",
        status: "",
        fromDate: "",
        toDate: "",
    });

    const itemsPerPage = 10;

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(API_URL, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                cache: "no-store",
            });
            if (!res.ok) throw new Error(`Request failed: ${res.status}`);
            const json = await res.json();
            const records = json?.data?.records ?? [];
            setLogs(records.map(normalizeRecord));
        } catch (err: any) {
            console.error("Failed to fetch audit logs:", err);
            setError(err?.message || "Failed to load audit logs");
            setLogs([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            const kw = searchKeyword.toLowerCase();
            const matchesSearch =
                log.tenant.toLowerCase().includes(kw) ||
                log.logId.toLowerCase().includes(kw) ||
                log.description.toLowerCase().includes(kw);

            const tenantFilter =
                !filters.tenantName ||
                log.tenant.toLowerCase().includes(filters.tenantName.toLowerCase());

            const statusFilter = !filters.status || log.status === filters.status;

            return matchesSearch && tenantFilter && statusFilter;
        });
    }, [logs, searchKeyword, filters]);

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedLogs = filteredLogs.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const showingFrom = filteredLogs.length === 0 ? 0 : startIndex + 1;
    const showingTo = Math.min(startIndex + itemsPerPage, filteredLogs.length);
    const totalCount = filteredLogs.length;

    const liveFilteredCount = useMemo(() => {
        return logs.filter((log) => {
            const tenantFilter =
                !filters.tenantName ||
                log.tenant.toLowerCase().includes(filters.tenantName.toLowerCase());
            const statusFilter = !filters.status || log.status === filters.status;
            return tenantFilter && statusFilter;
        }).length;
    }, [logs, filters]);

    const handleReset = () => {
        setFilters({ tenantName: "", status: "", fromDate: "", toDate: "" });
    };

    const handleShowResults = (e: React.FormEvent) => {
        e.preventDefault();
        setShowFilter(false);
        setCurrentPage(1);
    };

    const viewedLog = logs.find((l) => l.id === viewDetailsId) || null;

    return (
        <>
            <div className="w-full rounded-[18px] bg-white dark:bg-[#343434] dark:border dark:border-[#454545] shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-none overflow-hidden">
                {/* ── Search + Filter + Showing bar ── */}
                <div className="w-full bg-[#FAFAFB] dark:bg-[#1F1F1F] rounded-lg border border-gray-200 dark:border-gray-700">
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
                                    "Log ID",
                                    "Tenant",
                                    "User",
                                    "Description",
                                    "Date & Time",
                                    "Status",
                                    "Action",
                                ].map((header, idx) => (
                                    <th
                                        key={idx}
                                        className="px-4 py-3 border border-[#4C6993] dark:border-[#6A8AB0] text-left text-wrap break-words"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-[14px] text-gray-500 dark:text-gray-400"
                                    >
                                        <Loader2 className="w-5 h-5 animate-spin inline-block mr-2 align-middle" />
                                        Loading audit logs…
                                    </td>
                                </tr>
                            )}

                            {!isLoading && error && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-[14px] text-red-500"
                                    >
                                        {error}{" "}
                                        <button
                                            onClick={fetchLogs}
                                            className="underline ml-1 text-[#576CBC]"
                                        >
                                            Retry
                                        </button>
                                    </td>
                                </tr>
                            )}

                            {!isLoading &&
                                !error &&
                                paginatedLogs.map((item, index) => {
                                    const rowBgClass =
                                        index % 2 === 0
                                            ? "bg-[#fff] dark:bg-[#2C2C2C]"
                                            : "bg-[#F8F8F8] dark:bg-[#383838]";

                                    return (
                                        <tr key={item.id} className={`text-[10px] ${rowBgClass}`}>
                                            <td className="px-4 py-3 break-words text-[11px] font-medium text-left dark:text-white">
                                                {item.logId}
                                            </td>
                                            <td className="px-4 py-3 break-words text-[11px] font-medium text-left text-[#101B41] dark:text-white">
                                                {item.tenant}
                                            </td>
                                            <td className="px-4 py-3 break-words text-[11px] text-left text-[#101B41] dark:text-white">
                                                {item.user}
                                            </td>
                                            <td className="px-4 py-3 break-words text-[11px] text-left text-[#101B41] dark:text-white">
                                                {item.description}
                                            </td>
                                            <td className="px-4 py-3 break-words text-[11px] text-left text-[#3D8FDE] dark:text-sky-300">
                                                {item.dateTime}
                                            </td>
                                            <td className="px-4 py-3 text-left">
                                                <span
                                                    className={`inline-flex items-center justify-center w-[80px] h-7 rounded-md text-[11px] font-medium ${getStatusStyle(
                                                        item.status
                                                    )}`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-left relative">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOpenDropdownId((prev) =>
                                                            prev === item.id ? null : item.id
                                                        )
                                                    }
                                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                                                >
                                                    <BsThreeDotsVertical className="w-4 h-4" />
                                                </button>

                                                {openDropdownId === item.id && (
                                                    <div className="absolute right-24 top-8 w-24 bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                                                        <button
                                                            className="block w-full text-left px-3 py-2 text-[10px] hover:bg-gray-100 dark:hover:bg-[#444] dark:text-gray-200"
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

                            {!isLoading && !error && paginatedLogs.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-[14px] text-gray-500 dark:text-gray-400"
                                    >
                                        No logs found
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

            {showFilter && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
                    onClick={() => setShowFilter(false)}
                >
                    <form
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={handleShowResults}
                        className="w-full max-w-[400px] rounded-[14px] bg-white dark:bg-[#2C2C2C] p-5 shadow-2xl"
                    >
                        <div className="mb-4 flex items-start justify-between">
                            <h2 className="text-[14px] font-bold text-[#101B41] dark:text-white">
                                Filter by
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowFilter(false)}
                                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                            >
                                <svg
                                    width="14"
                                    height="14"
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

                        <div className="mb-3">
                            <label className="mb-1.5 block text-[12px] font-medium text-[#101B41] dark:text-gray-200">
                                Tenant Name
                            </label>
                            <input
                                type="text"
                                value={filters.tenantName}
                                onChange={(e) =>
                                    setFilters((f) => ({ ...f, tenantName: e.target.value }))
                                }
                                placeholder="Blackstone Academy"
                                className="w-full rounded-md border border-[#D5D9E2] bg-white px-3 py-2 text-[12px] text-[#101B41] placeholder:text-gray-400 focus:border-[#576CBC] focus:outline-none dark:border-[#555] dark:bg-[#3A3A3A] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#8296E6]"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="mb-1.5 block text-[12px] font-medium text-[#101B41] dark:text-gray-200">
                                Status
                            </label>
                            <div className="relative">
                                <select
                                    value={filters.status}
                                    onChange={(e) =>
                                        setFilters((f) => ({ ...f, status: e.target.value }))
                                    }
                                    className="w-full appearance-none rounded-md border border-[#D5D9E2] bg-white px-3 py-2 pr-9 text-[12px] text-[#101B41] focus:border-[#576CBC] focus:outline-none dark:border-[#555] dark:bg-[#3A3A3A] dark:text-white dark:focus:border-[#8296E6]"
                                >
                                    <option value="">All</option>
                                    <option value="Success">Success</option>
                                    <option value="Warning">Warning</option>
                                    <option value="Failed">Failed</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="mb-1.5 block text-[12px] font-medium text-[#101B41] dark:text-gray-200">
                                Date
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={filters.fromDate}
                                        onChange={(e) =>
                                            setFilters((f) => ({ ...f, fromDate: e.target.value }))
                                        }
                                        placeholder="Jan 20, 2020"
                                        className="w-full rounded-md border border-[#D5D9E2] bg-white px-3 py-2 pr-8 text-[12px] text-[#101B41] placeholder:text-gray-400 focus:border-[#576CBC] focus:outline-none dark:border-[#555] dark:bg-[#3A3A3A] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#8296E6]"
                                    />
                                    <Calendar className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                                </div>
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={filters.toDate}
                                        onChange={(e) =>
                                            setFilters((f) => ({ ...f, toDate: e.target.value }))
                                        }
                                        placeholder="Jan 24, 2020"
                                        className="w-full rounded-md border border-[#D5D9E2] bg-white px-3 py-2 pr-8 text-[12px] text-[#101B41] placeholder:text-gray-400 focus:border-[#576CBC] focus:outline-none dark:border-[#555] dark:bg-[#3A3A3A] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#8296E6]"
                                    />
                                    <Calendar className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="rounded-md border border-[#8296E6] bg-white px-5 py-2 text-[12px] font-semibold text-[#576CBC] hover:bg-[#F2F4FF] dark:bg-transparent dark:text-[#A8B7E8] dark:border-[#8296E6] dark:hover:bg-[#2E3658]"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                className="flex-1 rounded-md bg-[#576CBC] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#4D66B3] dark:bg-[#8296E6] dark:hover:bg-[#6A82CC]"
                            >
                                Show {liveFilteredCount} results
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {viewedLog && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
                    onClick={() => setViewDetailsId(null)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-[640px] max-h-[85vh] overflow-y-auto rounded-[14px] bg-white dark:bg-[#2C2C2C] p-5 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="mb-4 flex items-start justify-between">
                            <h2 className="text-[14px] font-bold text-[#101B41] dark:text-white">
                                Logs Details
                            </h2>
                            <button
                                type="button"
                                onClick={() => setViewDetailsId(null)}
                                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                            >
                                <svg
                                    width="14"
                                    height="14"
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                            {/* Always-present core fields */}
                            <Field label="Log ID" value={viewedLog.logId} />
                            <Field label="Tenant" value={viewedLog.tenant} />
                            <Field label="User" value={viewedLog.user} />
                            <Field label="Date & Time" value={viewedLog.dateTime} />

                            <Field
                                label="Description"
                                value={viewedLog.description}
                                fullWidth
                            />

                            <Field
                                label="Status"
                                value={viewedLog.status}
                                valueClass={
                                    viewedLog.status === "Success"
                                        ? "text-green-600 dark:text-green-400"
                                        : viewedLog.status === "Warning"
                                            ? "text-yellow-600 dark:text-yellow-400"
                                            : "text-red-600 dark:text-red-400"
                                }
                            />

                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const Field = ({
    label,
    value,
    fullWidth,
    pre,
    valueClass,
}: {
    label: string;
    value: string;
    fullWidth?: boolean;
    pre?: boolean;
    valueClass?: string;
}) => (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
        <label className="mb-1.5 block text-[12px] font-medium text-[#101B41] dark:text-gray-200">
            {label}
        </label>
        <div
            className={`w-full rounded-md border border-[#D5D9E2] bg-white px-3 py-2 text-[12px] text-[#101B41] dark:border-[#555] dark:bg-[#3A3A3A] dark:text-white ${pre
                ? "whitespace-pre-wrap break-words max-h-40 overflow-y-auto font-mono"
                : ""
                } ${valueClass || ""}`}
        >
            {value}
        </div>
    </div>
);

const ConditionalField = ({
    label,
    value,
    fullWidth,
    pre,
    valueClass,
}: {
    label: string;
    value?: string;
    fullWidth?: boolean;
    pre?: boolean;
    valueClass?: string;
}) => {
    if (isEmptyValue(value)) return null;
    return (
        <Field
            label={label}
            value={value as string}
            fullWidth={fullWidth}
            pre={pre}
            valueClass={valueClass}
        />
    );
};

export default AuditTable;