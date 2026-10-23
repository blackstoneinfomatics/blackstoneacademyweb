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
import AdminHeader from "../../../components/AdminHeader";
import BaseLayout4 from "../../../components/BaseLayout4";

import TicketDetailsModal from "./TicketDetailsModal";
import ViewTicketModal from "./ViewTicketsModal";

/* ------------------------------------------------------------------ */
/* Types & Mock Data                                                   */
/* ------------------------------------------------------------------ */

interface TicketItem {
    ticketId: string;
    tenantName: string;
    subject: string;
    role: string;
    category: string;
    priority: "High" | "Medium" | "Low" | string;
    status: "Open" | "Pending" | "Resolved" | "In Progress" | string;
    createdOn: string;
    resolvedOn: string;
    assignedTo?: string;
    description?: string;
}

type FilterState = {
    tenantName: string;
    category: string;
    priority: string;
    status: string;
    assignedTo: string;
    fromDate: string;
    toDate: string;
};

const INITIAL_FILTERS: FilterState = {
    tenantName: "",
    category: "All",
    priority: "All",
    status: "All",
    assignedTo: "All",
    fromDate: "",
    toDate: "",
};

const SAMPLE_TICKETS: TicketItem[] = [
    {
        ticketId: "TKT-001",
        tenantName: "Abi",
        subject: "Unable to start live class",
        role: "Student",
        category: "Live Class Issue",
        priority: "High",
        status: "Open",
        createdOn: "Sep 12, 2023",
        resolvedOn: "Sep 12, 2023",
        assignedTo: "Agent A",
        description:
            "I am unable to access the assignment page. It displays a '404 Page Not Found' error whenever I click the assignment link. Please investigate and resolve the issue as soon as possible.",
    },
    {
        ticketId: "TKT-002",
        tenantName: "Jeeva",
        subject: "Student not able to submit assign",
        role: "Teacher",
        category: "Assignment Issue",
        priority: "Medium",
        status: "Pending",
        createdOn: "Sep 12, 2023",
        resolvedOn: "Sep 12, 2023",
        assignedTo: "Agent B",
    },
    {
        ticketId: "TKT-003",
        tenantName: "Jeeva",
        subject: "Attendance not updating",
        role: "Supervisor",
        category: "Attendance Issue",
        priority: "Low",
        status: "Resolved",
        createdOn: "Sep 12, 2023",
        resolvedOn: "Sep 12, 2023",
        assignedTo: "Agent C",
    },
    {
        ticketId: "TKT-004",
        tenantName: "Jeeva",
        subject: "Question paper upload issue",
        role: "Academy Coach",
        category: "Exam Issue",
        priority: "Medium",
        status: "In Progress",
        createdOn: "Sep 12, 2023",
        resolvedOn: "Sep 12, 2023",
        assignedTo: "Agent A",
    },
    {
        ticketId: "TKT-005",
        tenantName: "Jeeva",
        subject: "Unable to access course content",
        role: "Academy Coach",
        category: "Course Issue",
        priority: "High",
        status: "Open",
        createdOn: "Sep 12, 2023",
        resolvedOn: "Sep 12, 2023",
        assignedTo: "Agent B",
    },
    {
        ticketId: "TKT-006",
        tenantName: "Jeeva",
        subject: "Student not able to submit assign",
        role: "Supervisor",
        category: "Assignment Issue",
        priority: "Medium",
        status: "Pending",
        createdOn: "Sep 12, 2023",
        resolvedOn: "Sep 12, 2023",
        assignedTo: "Agent C",
    },
    {
        ticketId: "TKT-007",
        tenantName: "Jeeva",
        subject: "Unable to start live class",
        role: "Student",
        category: "Live Class Issue",
        priority: "High",
        status: "Open",
        createdOn: "Sep 12, 2023",
        resolvedOn: "Sep 12, 2023",
        assignedTo: "Agent A",
    },
    {
        ticketId: "TKT-008",
        tenantName: "Jeeva",
        subject: "Student not able to submit assign",
        role: "Teacher",
        category: "Assignment Issue",
        priority: "Medium",
        status: "Pending",
        createdOn: "Sep 12, 2023",
        resolvedOn: "Sep 12, 2023",
        assignedTo: "Agent B",
    },
    {
        ticketId: "TKT-009",
        tenantName: "Jeeva",
        subject: "Unable to start live class",
        role: "Supervisor",
        category: "Live Class Issue",
        priority: "High",
        status: "Open",
        createdOn: "Sep 12, 2023",
        resolvedOn: "Sep 12, 2023",
        assignedTo: "Agent C",
    },
    {
        ticketId: "TKT-010",
        tenantName: "Jeeva",
        subject: "Student not able to submit assign",
        role: "Academy Coach",
        category: "Assignment Issue",
        priority: "Medium",
        status: "Pending",
        createdOn: "Sep 12, 2023",
        resolvedOn: "Sep 12, 2023",
        assignedTo: "Agent A",
    },
    {
        ticketId: "TKT-011",
        tenantName: "Ravi",
        subject: "Login not working",
        role: "Student",
        category: "Access Issue",
        priority: "High",
        status: "Open",
        createdOn: "Sep 13, 2023",
        resolvedOn: "—",
        assignedTo: "Agent A",
    },
    {
        ticketId: "TKT-012",
        tenantName: "Priya",
        subject: "Fee payment failed",
        role: "Student",
        category: "Payment Issue",
        priority: "Medium",
        status: "Pending",
        createdOn: "Sep 13, 2023",
        resolvedOn: "—",
        assignedTo: "Agent B",
    },
    {
        ticketId: "TKT-013",
        tenantName: "Kiran",
        subject: "Report not downloading",
        role: "Supervisor",
        category: "Report Issue",
        priority: "Low",
        status: "Resolved",
        createdOn: "Sep 13, 2023",
        resolvedOn: "Sep 14, 2023",
        assignedTo: "Agent C",
    },
    {
        ticketId: "TKT-014",
        tenantName: "Meena",
        subject: "Assignment marks not visible",
        role: "Teacher",
        category: "Assignment Issue",
        priority: "Medium",
        status: "In Progress",
        createdOn: "Sep 13, 2023",
        resolvedOn: "—",
        assignedTo: "Agent A",
    },
    {
        ticketId: "TKT-015",
        tenantName: "Suresh",
        subject: "Timetable not updating",
        role: "Academy Coach",
        category: "Schedule Issue",
        priority: "High",
        status: "Open",
        createdOn: "Sep 13, 2023",
        resolvedOn: "—",
        assignedTo: "Agent B",
    },
    {
        ticketId: "TKT-016",
        tenantName: "Anita",
        subject: "Certificate not generated",
        role: "Student",
        category: "Certificate Issue",
        priority: "Medium",
        status: "Pending",
        createdOn: "Sep 13, 2023",
        resolvedOn: "—",
        assignedTo: "Agent C",
    },
    {
        ticketId: "TKT-017",
        tenantName: "Vijay",
        subject: "Video lecture buffering",
        role: "Student",
        category: "Course Issue",
        priority: "High",
        status: "Open",
        createdOn: "Sep 13, 2023",
        resolvedOn: "—",
        assignedTo: "Agent A",
    },
    {
        ticketId: "TKT-018",
        tenantName: "Divya",
        subject: "Attendance mismatch",
        role: "Teacher",
        category: "Attendance Issue",
        priority: "Medium",
        status: "Pending",
        createdOn: "Sep 13, 2023",
        resolvedOn: "—",
        assignedTo: "Agent B",
    },
    {
        ticketId: "TKT-019",
        tenantName: "Arjun",
        subject: "Exam schedule not visible",
        role: "Supervisor",
        category: "Exam Issue",
        priority: "High",
        status: "Open",
        createdOn: "Sep 13, 2023",
        resolvedOn: "—",
        assignedTo: "Agent C",
    },
    {
        ticketId: "TKT-020",
        tenantName: "Sneha",
        subject: "Notification not received",
        role: "Academy Coach",
        category: "Notification Issue",
        priority: "Low",
        status: "Resolved",
        createdOn: "Sep 13, 2023",
        resolvedOn: "Sep 14, 2023",
        assignedTo: "Agent A",
    },
];

/* ------------------------------------------------------------------ */
/* Badge helpers                                                       */
/* ------------------------------------------------------------------ */

const priorityBadgeClass = (priority: string) => {
    switch (priority?.toLowerCase()) {
        case "high":
            return "bg-[#FCE4E4] text-[#D9534F]";
        case "medium":
            return "bg-[#FDF2D9] text-[#C88C29]";
        case "low":
            return "bg-[#E5F5EA] text-[#3A8F4A]";
        default:
            return "bg-gray-100 text-gray-600";
    }
};

const statusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
        case "open":
            return "bg-[#E5F5EA] text-[#3A8F4A]";
        case "pending":
            return "bg-[#FDF2D9] text-[#C88C29]";
        case "resolved":
            return "bg-[#E5F5EA] text-[#3A8F4A]";
        case "in progress":
            return "bg-[#E0EDFF] text-[#3E6DB5]";
        default:
            return "bg-gray-100 text-gray-600";
    }
};

const roleBadgeClass = (role: string) => {
    switch (role?.toLowerCase()) {
        case "student":
            return "bg-[#E0EDFF] text-[#3E6DB5]";
        case "teacher":
            return "bg-[#FCE4F0] text-[#C94F8D]";
        case "supervisor":
            return "bg-[#E5F5EA] text-[#3A8F4A]";
        case "academy coach":
            return "bg-[#FCE4F0] text-[#C94F8D]";
        default:
            return "bg-gray-100 text-gray-600";
    }
};

/* ------------------------------------------------------------------ */
/* Page Component                                                      */
/* ------------------------------------------------------------------ */

const Tickets = () => {
    const [search, setSearch] = useState("");
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [draftFilters, setDraftFilters] = useState<FilterState>(INITIAL_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState<FilterState>(INITIAL_FILTERS);
    const [currentPage, setCurrentPage] = useState(1);
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    // ⭐ Two separate modals:
    // viewTicketModal    → read-only details (screenshot 4)
    // ticketDetailsModal → dynamic action form (screenshots 1, 2, 3)
    const [viewTicketModal, setViewTicketModal] = useState<TicketItem | null>(null);
    const [ticketDetailsModal, setTicketDetailsModal] = useState<TicketItem | null>(null);

    const itemsPerPage = 10;

    const categoryOptions = useMemo(
        () => Array.from(new Set(SAMPLE_TICKETS.map((t) => t.category))).filter(Boolean),
        [],
    );
    const priorityOptions = useMemo(
        () => Array.from(new Set(SAMPLE_TICKETS.map((t) => t.priority))).filter(Boolean),
        [],
    );
    const statusOptions = useMemo(
        () => Array.from(new Set(SAMPLE_TICKETS.map((t) => t.status))).filter(Boolean),
        [],
    );
    const assignedToOptions = useMemo(
        () =>
            Array.from(new Set(SAMPLE_TICKETS.map((t) => t.assignedTo ?? ""))).filter(
                Boolean,
            ),
        [],
    );

    const filteredItems = useMemo(() => {
        const term = search.toLowerCase().trim();

        return SAMPLE_TICKETS.filter((item) => {
            const matchesSearch =
                !term ||
                [
                    item.ticketId,
                    item.tenantName,
                    item.subject,
                    item.role,
                    item.category,
                    item.priority,
                    item.status,
                    item.createdOn,
                    item.resolvedOn,
                    item.assignedTo ?? "",
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(term);

            const matchesTenant =
                !appliedFilters.tenantName ||
                item.tenantName.toLowerCase().includes(appliedFilters.tenantName.toLowerCase());

            const matchesCategory =
                appliedFilters.category === "All" || item.category === appliedFilters.category;

            const matchesPriority =
                appliedFilters.priority === "All" || item.priority === appliedFilters.priority;

            const matchesStatus =
                appliedFilters.status === "All" || item.status === appliedFilters.status;

            const matchesAssigned =
                appliedFilters.assignedTo === "All" ||
                item.assignedTo === appliedFilters.assignedTo;

            const rowDate = item.createdOn ? new Date(item.createdOn) : null;
            const fromDate = appliedFilters.fromDate ? new Date(appliedFilters.fromDate) : null;
            const toDate = appliedFilters.toDate
                ? new Date(`${appliedFilters.toDate}T23:59:59`)
                : null;

            const matchesDate =
                (!fromDate || (rowDate && rowDate >= fromDate)) &&
                (!toDate || (rowDate && rowDate <= toDate));

            return (
                matchesSearch &&
                matchesTenant &&
                matchesCategory &&
                matchesPriority &&
                matchesStatus &&
                matchesAssigned &&
                matchesDate
            );
        });
    }, [search, appliedFilters]);

    const previewFilteredItems = useMemo(() => {
        const term = search.toLowerCase().trim();

        return SAMPLE_TICKETS.filter((item) => {
            const matchesSearch =
                !term ||
                [
                    item.ticketId,
                    item.tenantName,
                    item.subject,
                    item.role,
                    item.category,
                    item.priority,
                    item.status,
                    item.createdOn,
                    item.resolvedOn,
                    item.assignedTo ?? "",
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(term);

            const matchesTenant =
                !draftFilters.tenantName ||
                item.tenantName.toLowerCase().includes(draftFilters.tenantName.toLowerCase());

            const matchesCategory =
                draftFilters.category === "All" || item.category === draftFilters.category;

            const matchesPriority =
                draftFilters.priority === "All" || item.priority === draftFilters.priority;

            const matchesStatus =
                draftFilters.status === "All" || item.status === draftFilters.status;

            const matchesAssigned =
                draftFilters.assignedTo === "All" ||
                item.assignedTo === draftFilters.assignedTo;

            const rowDate = item.createdOn ? new Date(item.createdOn) : null;
            const fromDate = draftFilters.fromDate ? new Date(draftFilters.fromDate) : null;
            const toDate = draftFilters.toDate
                ? new Date(`${draftFilters.toDate}T23:59:59`)
                : null;

            const matchesDate =
                (!fromDate || (rowDate && rowDate >= fromDate)) &&
                (!toDate || (rowDate && rowDate <= toDate));

            return (
                matchesSearch &&
                matchesTenant &&
                matchesCategory &&
                matchesPriority &&
                matchesStatus &&
                matchesAssigned &&
                matchesDate
            );
        });
    }, [search, draftFilters]);

    const activeFilterCount = Object.entries(appliedFilters).filter(
        ([, value]) => value && value !== "All",
    ).length;

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
    const currentPageSafe = Math.min(currentPage, totalPages);
    const startIndex = (currentPageSafe - 1) * itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);
    const showingStart = filteredItems.length === 0 ? 0 : startIndex + 1;
    const showingEnd = Math.min(startIndex + itemsPerPage, filteredItems.length);

    return (
        <>
            <BaseLayout4>
                <AdminHeader currentSection="Tickets" />
                <div className="flex flex-col space-y-6">
                    {/* Tabs */}
                    <div className="flex ml-4 items-center gap-4 border-b border-[#E6EAF2] dark:border-[#3F3F3F]">
                        <button className="pb-2 text-[14px] font-medium text-[#576CBC] border-b-2 border-[#576CBC]">
                            Received Ticket
                        </button>
                        <button className="pb-2 text-[14px] font-medium text-[#80848E] hover:text-[#576CBC] dark:text-[#B5B5B5]">
                            Raise Ticket
                        </button>
                    </div>

                    {/* Table card */}
                    <div className="bg-white rounded-xl shadow-lg dark:bg-[#343434] overflow-hidden border-t border-[#E6EAF2] dark:border-[#3F3F3F]">
                        {/* Search / Filter / Showing */}
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

                        {/* Table body (sticky header) */}
                        <div className="overflow-x-auto scrollbar-thin">
                            <div className="max-h-[520px] overflow-y-auto scrollbar-none">
                                <table className="min-w-full text-xs border-collapse table-fixed">
                                    <thead className="text-[14px] bg-[#4C6993] text-white dark:bg-[#44699d] sticky top-0 z-10">
                                        <tr>
                                            {[
                                                "Tickets ID",
                                                "Name",
                                                "Subject",
                                                "Role",
                                                "Category",
                                                "Priority",
                                                "Status",
                                                "Created On",
                                                "Resolved",
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
                                                const rowId = `${item.ticketId}-${index}`;
                                                return (
                                                    <tr
                                                        key={rowId}
                                                        className="text-[12px] text-[#24324B] dark:text-gray-200 odd:bg-[#f8f8f8] even:bg-[#ffffff] dark:odd:bg-[#2c2c2c] dark:even:bg-[#303030]"
                                                    >
                                                        <td className="py-4 px-2 font-medium">{item.ticketId}</td>
                                                        <td className="py-4 px-2">{item.tenantName}</td>
                                                        <td className="py-4 px-2 truncate">{item.subject}</td>
                                                        <td className="py-4 px-2">
                                                            <span
                                                                className={`px-2 text-[11px] py-[3px] rounded-md ${roleBadgeClass(item.role)}`}
                                                            >
                                                                {item.role}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-2">{item.category}</td>
                                                        <td className="py-4 px-2">
                                                            <span
                                                                className={`px-2 text-[11px] py-[3px] rounded-md ${priorityBadgeClass(item.priority)}`}
                                                            >
                                                                {item.priority}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-2">
                                                            <span
                                                                className={`px-2 text-[11px] py-[3px] rounded-md ${statusBadgeClass(item.status)}`}
                                                            >
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-2">{item.createdOn}</td>
                                                        <td className="py-4 px-2">{item.resolvedOn}</td>

                                                        {/* ⭐ Action menu — exactly 2 actions */}
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
                                                                <div className="absolute right-4 top-12 z-50 w-44 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-lg dark:border-gray-700 dark:bg-[#2c2c2c] dark:text-gray-100">
                                                                    <button
                                                                        className="w-full border-b px-4 py-2 text-left text-xs hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
                                                                        onClick={() => {
                                                                            setOpenMenu(null);
                                                                            setViewTicketModal(item);
                                                                        }}
                                                                    >
                                                                        View Details
                                                                    </button>

                                                                    <button
                                                                        className="w-full border-b px-4 py-2 text-left text-xs hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
                                                                        onClick={() => {
                                                                            setOpenMenu(null);
                                                                            setTicketDetailsModal(item);
                                                                        }}
                                                                    >
                                                                        Ticket Details
                                                                    </button>

                                                                    <button
                                                                        className="w-full px-4 py-2 text-left text-xs text-[#98A2B3] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                                                    colSpan={10}
                                                    className="p-4 text-center text-gray-500 dark:text-gray-300"
                                                >
                                                    No tickets found
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
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
                                            Tenant Name
                                        </label>
                                        <input
                                            value={draftFilters.tenantName}
                                            onChange={(e) =>
                                                setDraftFilters((prev) => ({
                                                    ...prev,
                                                    tenantName: e.target.value,
                                                }))
                                            }
                                            placeholder="Enter tenant name"
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
                                            Priority
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={draftFilters.priority}
                                                onChange={(e) =>
                                                    setDraftFilters((prev) => ({
                                                        ...prev,
                                                        priority: e.target.value,
                                                    }))
                                                }
                                                className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none"
                                            >
                                                <option value="All">Select Priority</option>
                                                {priorityOptions.map((option) => (
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
                                            Assigned To
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={draftFilters.assignedTo}
                                                onChange={(e) =>
                                                    setDraftFilters((prev) => ({
                                                        ...prev,
                                                        assignedTo: e.target.value,
                                                    }))
                                                }
                                                className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none"
                                            >
                                                <option value="All">Select Agent</option>
                                                {assignedToOptions.map((option) => (
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
                                            Created On
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

                                <div className="grid grid-cols-2 gap-3">
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
                                        className="h-8 rounded-lg bg-[#576CBC] text-sm font-medium text-white"
                                    >
                                        Show {previewFilteredItems.length} results
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </BaseLayout4>

            {/* ⭐ Modals Rendered Outside BaseLayout4 to ensure full screen coverage */}
            {viewTicketModal && (
                <ViewTicketModal
                    ticket={viewTicketModal}
                    onClose={() => setViewTicketModal(null)}
                    priorityBadgeClass={priorityBadgeClass}
                />
            )}

            {ticketDetailsModal && (
                <TicketDetailsModal
                    ticket={ticketDetailsModal}
                    onClose={() => setTicketDetailsModal(null)}
                    priorityBadgeClass={priorityBadgeClass}
                />
            )}
        </>
    );
};

export default Tickets;