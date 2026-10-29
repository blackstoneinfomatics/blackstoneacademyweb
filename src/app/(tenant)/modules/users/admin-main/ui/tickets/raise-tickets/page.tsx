"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Search,
    SlidersHorizontal,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import ViewTicketModal from "../ViewTicketsModal";


interface RaisedTicketItem {
    ticketId: string;
    fromRole: string;
    subject: string;
    category: string;
    priority: "High" | "Medium" | "Low" | string;
    status: "Open" | "Pending" | "Resolved" | "In Progress" | string;
    raisedOn: string;
    description?: string;
}

interface ApiTicket {
    ticketNumber: string;
    fromRole?: string;
    createdByRole?: string;
    subject: string;
    category: string;
    priority: string;
    status: string;
    createdAt: string;
    description?: string;
}

interface TicketsResponse {
    success: boolean;
    message?: string;
    data?: {
        tickets?: ApiTicket[];
    };
}

type FilterState = {
    category: string;
    priority: string;
    status: string;
    fromDate: string;
    toDate: string;
};

const INITIAL_FILTERS: FilterState = {
    category: "All",
    priority: "All",
    status: "All",
    fromDate: "",
    toDate: "",
};

const priorityBadgeClass = (priority: string) => {
    switch (priority?.toLowerCase()) {
        case "high": return "bg-[#FCE4E4] text-[#D9534F] dark:bg-[#D3464533] dark:text-[#FF8B8B]";
        case "critical": return "bg-[#FCE4E4] text-[#D9534F] dark:bg-[#D3464533] dark:text-[#FF8B8B]";
        case "medium": return "bg-[#FDF2D9] text-[#C88C29] dark:bg-[#F0AD4E33] dark:text-[#FFC66D]";
        case "low": return "bg-[#E5F5EA] text-[#3A8F4A] dark:bg-[#294A32] dark:text-[#72D889]";
        default: return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
    }
};

const statusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
        case "open": return "bg-[#E5F5EA] text-[#3A8F4A] dark:bg-[#294A32] dark:text-[#72D889]";
        case "pending": return "bg-[#FDF2D9] text-[#C88C29] dark:bg-[#F0AD4E33] dark:text-[#FFC66D]";
        case "acknowledged": return "bg-[#E0EDFF] text-[#3E6DB5] dark:bg-[#253B5B] dark:text-[#9FC5FF]";
        case "resolved": return "bg-[#E5F5EA] text-[#3A8F4A] dark:bg-[#294A32] dark:text-[#72D889]";
        case "in progress": return "bg-[#E0EDFF] text-[#3E6DB5] dark:bg-[#253B5B] dark:text-[#9FC5FF]";
        default: return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
    }
};

export default function RaiseTicketsContent() {
    const [tickets, setTickets] = useState<RaisedTicketItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [draftFilters, setDraftFilters] = useState<FilterState>(INITIAL_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState<FilterState>(INITIAL_FILTERS);
    const [currentPage, setCurrentPage] = useState(1);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [viewTicketModal, setViewTicketModal] = useState<RaisedTicketItem | null>(null);

    const itemsPerPage = 10;

    useEffect(() => {
        const controller = new AbortController();

        const loadTickets = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const token = localStorage.getItem("AdminAuthToken");
                if (!token) {
                    throw new Error("Your session has expired. Please sign in again.");
                }

                const response = await fetch(
                    `${AppApiEndpoints.API_END_POINT.replace(/\/$/, "")}${AppApiEndpoints.TICKET.GET_TICKETS}?view=raised&role=ADMIN`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        signal: controller.signal,
                    },
                );
                const result: TicketsResponse = await response.json();

                if (!response.ok || result.success !== true || !Array.isArray(result.data?.tickets)) {
                    throw new Error(
                        result.message || `Unable to load tickets (HTTP ${response.status}).`,
                    );
                }

                setTickets(result.data.tickets.map((ticket) => ({
                    ticketId: ticket.ticketNumber,
                    fromRole: ticket.fromRole || ticket.createdByRole || "—",
                    subject: ticket.subject,
                    category: ticket.category.replace(/_/g, " "),
                    priority: ticket.priority,
                    status: ticket.status,
                    raisedOn: ticket.createdAt
                        ? new Date(ticket.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                        })
                        : "—",
                    description: ticket.description,
                })));
            } catch (error) {
                if (error instanceof Error && error.name === "AbortError") return;
                setLoadError(
                    error instanceof Error ? error.message : "Unable to load tickets.",
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        void loadTickets();
        return () => controller.abort();
    }, []);

    const categoryOptions = useMemo(() => Array.from(new Set(tickets.map((t) => t.category))).filter(Boolean), [tickets]);
    const priorityOptions = useMemo(() => Array.from(new Set(tickets.map((t) => t.priority))).filter(Boolean), [tickets]);
    const statusOptions = useMemo(() => Array.from(new Set(tickets.map((t) => t.status))).filter(Boolean), [tickets]);

    const filteredItems = useMemo(() => {
        const term = search.toLowerCase().trim();
        return tickets.filter((item) => {
            const matchesSearch = !term || [item.ticketId, item.fromRole, item.subject, item.category, item.priority, item.status, item.raisedOn].join(" ").toLowerCase().includes(term);
            const matchesCategory = appliedFilters.category === "All" || item.category === appliedFilters.category;
            const matchesPriority = appliedFilters.priority === "All" || item.priority === appliedFilters.priority;
            const matchesStatus = appliedFilters.status === "All" || item.status === appliedFilters.status;

            const rowDate = item.raisedOn ? new Date(item.raisedOn) : null;
            const fromDate = appliedFilters.fromDate ? new Date(appliedFilters.fromDate) : null;
            const toDate = appliedFilters.toDate ? new Date(`${appliedFilters.toDate}T23:59:59`) : null;
            const matchesDate = (!fromDate || (rowDate && rowDate >= fromDate)) && (!toDate || (rowDate && rowDate <= toDate));

            return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesDate;
        });
    }, [tickets, search, appliedFilters]);

    const previewFilteredItems = useMemo(() => {
        const term = search.toLowerCase().trim();
        return tickets.filter((item) => {
            const matchesSearch = !term || [item.ticketId, item.fromRole, item.subject, item.category, item.priority, item.status, item.raisedOn].join(" ").toLowerCase().includes(term);
            const matchesCategory = draftFilters.category === "All" || item.category === draftFilters.category;
            const matchesPriority = draftFilters.priority === "All" || item.priority === draftFilters.priority;
            const matchesStatus = draftFilters.status === "All" || item.status === draftFilters.status;

            const rowDate = item.raisedOn ? new Date(item.raisedOn) : null;
            const fromDate = draftFilters.fromDate ? new Date(draftFilters.fromDate) : null;
            const toDate = draftFilters.toDate ? new Date(`${draftFilters.toDate}T23:59:59`) : null;
            const matchesDate = (!fromDate || (rowDate && rowDate >= fromDate)) && (!toDate || (rowDate && rowDate <= toDate));

            return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesDate;
        });
    }, [tickets, search, draftFilters]);

    const activeFilterCount = Object.entries(appliedFilters).filter(([, value]) => value && value !== "All").length;
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
    const currentPageSafe = Math.min(currentPage, totalPages);
    const startIndex = (currentPageSafe - 1) * itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);
    const showingStart = filteredItems.length === 0 ? 0 : startIndex + 1;
    const showingEnd = Math.min(startIndex + itemsPerPage, filteredItems.length);

    return (
        <div className="flex flex-col space-y-6">
            <div className="bg-white rounded-xl shadow-lg dark:bg-[#343434] overflow-hidden border-t border-[#E6EAF2] dark:border-[#3F3F3F]">
                <div className="grid grid-cols-1 border-b border-[#E6EAF2] dark:border-[#3F3F3F] md:grid-cols-3">
                    <div className="flex h-12 items-center border-b border-[#E6EAF2] px-4 dark:border-[#3F3F3F] md:border-b-0 md:border-r">
                        <Search size={17} className="text-[#A5AAB4] dark:text-[#B5B5B5]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            placeholder="Search by keyword"
                            className="ml-2 w-full bg-transparent text-sm text-[#444] outline-none placeholder:text-[#A5AAB4] dark:text-[#E2E2E2] dark:placeholder:text-[#8A8A8A]"
                        />
                    </div>
                    <div className="border-b border-[#E6EAF2] dark:border-[#3F3F3F] md:border-b-0 md:border-r">
                        <button
                            onClick={() => { setDraftFilters({ ...appliedFilters }); setShowFilterPanel(true); }}
                            className="flex h-12 w-full items-center justify-between px-4 text-sm text-[#80848E] transition hover:bg-gray-50 dark:text-[#B5B5B5] dark:hover:bg-[#2F2F2F]"
                        >
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal size={16} />
                                Filter
                                {activeFilterCount > 0 && (
                                    <span className="rounded-full bg-[#576CBC] px-2 py-[2px] text-[11px] text-white">{activeFilterCount}</span>
                                )}
                            </div>
                            <ChevronDown size={16} />
                        </button>
                    </div>
                    <div className="flex h-12 items-center px-4 text-sm text-[#80848E] dark:text-[#B5B5B5]">
                        Showing {showingStart}-{showingEnd} of {filteredItems.length}
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-thin">
                    <div className="max-h-[520px] overflow-y-auto scrollbar-none">
                        <table className="min-w-full text-xs border-collapse table-fixed">
                            <thead className="text-[14px] bg-[#4C6993] text-white dark:bg-[#44699d] sticky top-0 z-10">
                                <tr>
                                    {["Ticket ID", "Role", "Subject", "Category", "Priority", "Status", "Raised On", "Action"].map((header) => (
                                        <th key={header} className="py-4 px-2 font-medium text-left border border-[#466993]">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={8} className="p-4 text-center text-gray-500 dark:text-gray-300">Loading tickets...</td></tr>
                                ) : loadError ? (
                                    <tr><td colSpan={8} role="alert" className="p-4 text-center text-red-600 dark:text-red-400">{loadError}</td></tr>
                                ) : paginatedItems.length > 0 ? (
                                    paginatedItems.map((item, index) => {
                                        const rowId = `${item.ticketId}-${index}`;
                                        return (
                                            <tr key={rowId} className="text-[12px] text-[#24324B] dark:text-gray-200 odd:bg-[#f8f8f8] even:bg-[#ffffff] dark:odd:bg-[#2c2c2c] dark:even:bg-[#303030]">
                                                <td className="py-4 px-2 font-medium">{item.ticketId}</td>
                                                <td className="py-4 px-2">{item.fromRole}</td>
                                                <td className="py-4 px-2 truncate">{item.subject}</td>
                                                <td className="py-4 px-2">{item.category}</td>
                                                <td className="py-4 px-2"><span className={`inline-block w-[85px] text-center px-2 text-[11px] py-[3px] rounded-md ${priorityBadgeClass(item.priority)}`}>{item.priority}</span></td>
                                                <td className="py-4 px-2"><span className={`inline-block w-[100px] text-center px-2 text-[11px] py-[3px] rounded-md ${statusBadgeClass(item.status)}`}>{item.status}</span></td>
                                                <td className="py-4 px-2">{item.raisedOn}</td>
                                                <td className="py-4 px-2 relative">
                                                    <button onClick={() => setOpenMenu(openMenu === rowId ? null : rowId)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                                                        <BsThreeDotsVertical size={16} />
                                                    </button>
                                                    {openMenu === rowId && (
                                                        <div className="absolute right-16 top-12 z-50 w-full rounded-lg border border-gray-200 bg-white text-gray-800 shadow-lg dark:border-gray-700 dark:bg-[#2c2c2c] dark:text-gray-100">
                                                            <button className="w-full text-[#010e30] dark:text-[#fff] border-b px-2 py-2 text-center text-[11px] hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700" onClick={() => { setOpenMenu(null); setViewTicketModal(item); }}>
                                                                View Details
                                                            </button>
                                                            <button className="w-full px-4 py-2 text-center text-[11px] text-[#98A2B3] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setOpenMenu(null)}>
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan={8} className="p-4 text-center text-gray-500 dark:text-gray-300">No raised tickets found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-end gap-2 px-4 py-3 dark:border-[#3F3F3F]">
                <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPageSafe === 1} className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#4A4A4A] dark:hover:bg-[#2F2F2F]">
                    <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setCurrentPage(p)} className={`flex h-8 w-8 items-center justify-center rounded border font-medium ${currentPageSafe === p ? "border-[#496A96] bg-white text-[#496A96] dark:border-[#7FA7E8] dark:bg-[#343434] dark:text-[#B8D0FF]" : "border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 dark:border-[#4A4A4A] dark:hover:bg-[#2F2F2F]"}`}>
                        {p}
                    </button>
                ))}
                <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPageSafe === totalPages} className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#4A4A4A] dark:hover:bg-[#2F2F2F]">
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Filter Panel */}
            {showFilterPanel && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4">
                    <div className="w-full max-w-[360px] rounded-2xl border border-[#E6EAF2] dark:border-[#3F3F3F] bg-white dark:bg-[#2c2c2c] p-5 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-[#101B41] dark:text-white font-sans">Filter by</h3>
                            <button onClick={() => setShowFilterPanel(false)} className="text-[#B8C0D3] hover:text-[#6E7891] dark:hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">Category</label>
                                <div className="relative">
                                    <select value={draftFilters.category} onChange={(e) => setDraftFilters((prev) => ({ ...prev, category: e.target.value }))} className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none">
                                        <option value="All">Select Category</option>
                                        {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                    <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F] dark:text-[#B5B5B5]" />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">Priority</label>
                                <div className="relative">
                                    <select value={draftFilters.priority} onChange={(e) => setDraftFilters((prev) => ({ ...prev, priority: e.target.value }))} className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none">
                                        <option value="All">Select Priority</option>
                                        {priorityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                    <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F] dark:text-[#B5B5B5]" />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">Status</label>
                                <div className="relative">
                                    <select value={draftFilters.status} onChange={(e) => setDraftFilters((prev) => ({ ...prev, status: e.target.value }))} className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none">
                                        <option value="All">Select Status</option>
                                        {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                    <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F] dark:text-[#B5B5B5]" />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">Raised On</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="date" value={draftFilters.fromDate} onChange={(e) => setDraftFilters((prev) => ({ ...prev, fromDate: e.target.value }))} className="h-8 w-full rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none" />
                                    <input type="date" value={draftFilters.toDate} onChange={(e) => setDraftFilters((prev) => ({ ...prev, toDate: e.target.value }))} className="h-8 w-full rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none" />
                                </div>
                            </div>
                        </div>
                        <div className="my-5 h-px bg-[#E4E8F1] dark:bg-[#4A4A4A]" />
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setDraftFilters(INITIAL_FILTERS)} className="h-8 rounded-lg border border-[#576CBC] text-sm font-medium text-[#576CBC]">Reset</button>
                            <button onClick={() => { setAppliedFilters({ ...draftFilters }); setCurrentPage(1); setShowFilterPanel(false); }} className="h-8 rounded-lg bg-[#576CBC] text-sm font-medium text-white">Show {previewFilteredItems.length} results</button>
                        </div>
                    </div>
                </div>
            )}

            {viewTicketModal && <ViewTicketModal ticket={viewTicketModal} onClose={() => setViewTicketModal(null)} priorityBadgeClass={priorityBadgeClass} />}
        </div>
    );
}