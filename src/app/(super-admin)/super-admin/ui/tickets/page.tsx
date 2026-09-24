'use client';
import React, { useEffect, useState } from 'react'
import BaseLayout3 from '../../components/BaseSuperLayout'
import SuperAdminHeader from '../../components/SuperAdminHeader'
import {
  Ticket as TicketIcon,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  X,
  ChevronDown,
  Search,
  ChevronRight,
  SlidersHorizontal,
  ChevronLeft,
} from "lucide-react";
import { BsThreeDotsVertical } from 'react-icons/bs';
import AcknowledgementForm from './components/AcknowledgementForm';
import ResolvedForm from './components/ResolvedForm';
import ViewTicketDetails from './components/ViewTicketDetails';
import type { AcknowledgementPayload, ResolvedPayload, Ticket } from './types';

const todayISO = () => new Date().toISOString().slice(0, 10);

const initialTickets: Ticket[] = [
  {
    ticketId: "TCK-1001",
    tenantName: "Blackstone Academy",
    subject: "Unable to generate invoice PDF",
    category: "Billing",
    priority: "High",
    status: "Open",
    assignedTo: "Aarav Mehta",
    createdOn: "2026-09-01",
    resolvedOn: "-",
    description: "Tenant cannot download the invoice PDF after payment is completed.",
    plan: "Enterprise",
    tenantMessages: 4,
    adminReplies: 2,
    firstMessage: "2026-09-01",
    lastReply: "2026-09-02",
  },
  {
    ticketId: "TCK-1002",
    tenantName: "Srashtalk",
    subject: "Login OTP not received",
    category: "Technical",
    priority: "High",
    status: "In Progress",
    assignedTo: "Priya Sharma",
    createdOn: "2026-09-02",
    resolvedOn: "-",
  },
  {
    ticketId: "TCK-1003",
    tenantName: "Zotal AI",
    subject: "Request to add custom domain",
    category: "Feature Request",
    priority: "Low",
    status: "Resolved",
    assignedTo: "Rohan Das",
    createdOn: "2026-08-20",
    resolvedOn: "2026-08-25",
  },
  {
    ticketId: "TCK-1004",
    tenantName: "ERP School",
    subject: "Student attendance report mismatch",
    category: "Bug Report",
    priority: "Medium",
    status: "In Progress",
    assignedTo: "Aarav Mehta",
    createdOn: "2026-08-28",
    resolvedOn: "-",
  },
  {
    ticketId: "TCK-1005",
    tenantName: "EduPortal",
    subject: "Change subscription plan to Enterprise",
    category: "Account",
    priority: "Medium",
    status: "Closed",
    assignedTo: "Neha Kapoor",
    createdOn: "2026-08-15",
    resolvedOn: "2026-08-18",
  },
  {
    ticketId: "TCK-1006",
    tenantName: "Blackstone Academy",
    subject: "Payment gateway showing timeout error",
    category: "Billing",
    priority: "High",
    status: "Open",
    assignedTo: "Priya Sharma",
    createdOn: "2026-09-05",
    resolvedOn: "-",
  },
  {
    ticketId: "TCK-1007",
    tenantName: "Zotal AI",
    subject: "Teacher unable to upload assignments",
    category: "Technical",
    priority: "Medium",
    status: "Resolved",
    assignedTo: "Rohan Das",
    createdOn: "2026-08-30",
    resolvedOn: "2026-09-01",
  },
  {
    ticketId: "TCK-1008",
    tenantName: "ERP School",
    subject: "General query about hostel module",
    category: "General",
    priority: "Low",
    status: "Closed",
    assignedTo: "Neha Kapoor",
    createdOn: "2026-08-10",
    resolvedOn: "2026-08-11",
  },
  {
    ticketId: "TCK-1009",
    tenantName: "EduPortal",
    subject: "Bulk student import failing",
    category: "Bug Report",
    priority: "High",
    status: "In Progress",
    assignedTo: "Aarav Mehta",
    createdOn: "2026-09-08",
    resolvedOn: "-",
  },
  {
    ticketId: "TCK-1010",
    tenantName: "Srashtalk",
    subject: "Request for API access",
    category: "Feature Request",
    priority: "Low",
    status: "Open",
    assignedTo: "Priya Sharma",
    createdOn: "2026-09-10",
    resolvedOn: "-",
  },
];

const buildCards = (tickets: Ticket[]) => [
  {
    title: "Total Tickets",
    value: tickets.length.toString(),
    icon: TicketIcon,
    iconBg: "bg-[#E5DFFD]",
    iconColor: "text-[#5225FC]",
    titleColor: "text-[#5225FC]",
    trend: "All raised tickets",
  },
  {
    title: "Open Tickets",
    value: tickets.filter((t) => t.status === "Open").length.toString(),
    icon: AlertTriangle,
    iconBg: "bg-[#F8E4E4]",
    iconColor: "text-[#D34645]",
    titleColor: "text-[#D34645]",
    trend: "Awaiting response",
  },
  {
    title: "In Progress",
    value: tickets
      .filter((t) => t.status === "In Progress" || t.status === "Acknowledged")
      .length.toString(),
    icon: Clock3,
    iconBg: "bg-[#FCF0DC]",
    iconColor: "text-[#F59E0B]",
    titleColor: "text-[#F59E0B]",
    trend: "Being worked on",
  },
  {
    title: "Resolved",
    value: tickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length.toString(),
    icon: CheckCircle2,
    iconBg: "bg-[#E3F4E7]",
    iconColor: "text-[#40BD5F]",
    titleColor: "text-[#40BD5F]",
    trend: "Successfully closed",
  },
];

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

const applyFilters = (
  items: Ticket[],
  search: string,
  filters: FilterState,
) => {
  const term = search.toLowerCase().trim();

  return items.filter((item) => {
    const matchesSearch =
      !term ||
      [
        item.ticketId,
        item.tenantName,
        item.subject,
        item.category,
        item.priority,
        item.status,
        item.assignedTo,
        item.createdOn,
        item.resolvedOn,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);

    const matchesTenantName =
      !filters.tenantName ||
      item.tenantName.toLowerCase().includes(filters.tenantName.toLowerCase());

    const matchesCategory =
      filters.category === "All" || item.category === filters.category;
    const matchesPriority =
      filters.priority === "All" || item.priority === filters.priority;
    const matchesStatus =
      filters.status === "All" || item.status === filters.status;
    const matchesAssignedTo =
      filters.assignedTo === "All" || item.assignedTo === filters.assignedTo;

    const rowDate = new Date(item.createdOn);
    const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
    const toDate = filters.toDate ? new Date(filters.toDate) : null;

    const matchesDate =
      (!fromDate || rowDate >= fromDate) && (!toDate || rowDate <= toDate);

    return (
      matchesSearch &&
      matchesTenantName &&
      matchesCategory &&
      matchesPriority &&
      matchesStatus &&
      matchesAssignedTo &&
      matchesDate
    );
  });
};

const priorityBadgeClass = (priority: Ticket["priority"]) => {
  switch (priority) {
    case "High":
      return "bg-[#F6E0E0] text-[#EA4F4F] dark:bg-[#D3464533]";
    case "Medium":
      return "bg-[#F6EcDC] text-[#EFA133] dark:bg-[#F0AD4E33]";
    default:
      return "bg-[#E4F4E8] text-[#40BD5F] dark:bg-[#36477e33]";
  }
};

const statusBadgeClass = (status: Ticket["status"]) => {
  switch (status) {
    case "Open":
      return "bg-[#F6E0E0] text-[#EA4F4F] dark:bg-[#D3464533]";
    case "In Progress":
      return "bg-[#F6EcDC] text-[#EFA133] dark:bg-[#F0AD4E33]";
    case "Resolved":
      return "bg-[#E4F4E8] text-[#40BD5F] dark:bg-[#36477e33]";
    default:
      return "bg-[#E6EAF2] text-[#576CBC] dark:bg-[#576CBC33]";
  }
};

const page = () => {
  const [ticketList, setTicketList] = useState<Ticket[]>(initialTickets);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [draftFilters, setDraftFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewTicketModal, setViewTicketModal] = useState<Ticket | null>(null);
  const [acknowledgeTicket, setAcknowledgeTicket] = useState<Ticket | null>(null);
  const [resolveTicket, setResolveTicket] = useState<Ticket | null>(null);

  const itemsPerPage = 5;

  const cards = buildCards(ticketList);

  const categoryOptions = Array.from(new Set(ticketList.map((t) => t.category)));
  const priorityOptions = Array.from(new Set(ticketList.map((t) => t.priority)));
  const statusOptions = Array.from(new Set(ticketList.map((t) => t.status)));
  const assignedToOptions = Array.from(new Set(ticketList.map((t) => t.assignedTo)));

  const filteredItems = applyFilters(ticketList, search, appliedFilters);
  const previewFilteredItems = applyFilters(ticketList, search, draftFilters);

  const updateTicketStatus = (ticketId: string, status: Ticket["status"]) => {
    setTicketList((prev) =>
      prev.map((t) =>
        t.ticketId === ticketId
          ? {
              ...t,
              status,
              resolvedOn:
                status === "Resolved" || status === "Closed"
                  ? todayISO()
                  : t.resolvedOn,
            }
          : t,
      ),
    );
    setOpenMenu(null);
  };

  const handleAcknowledgeSubmit = (payload: AcknowledgementPayload) => {
    // TODO: wire to API, e.g. POST /super-admin/tickets/:id/acknowledge
    updateTicketStatus(payload.ticketId, "Acknowledged");
    setAcknowledgeTicket(null);
  };

  const handleResolveSubmit = (payload: ResolvedPayload) => {
    // TODO: wire to API, e.g. POST /super-admin/tickets/:id/resolve
    updateTicketStatus(payload.ticketId, payload.status);
    setResolveTicket(null);
  };

  const activeFilterCount = Object.entries(appliedFilters).filter(
    ([key, value]) =>
      value &&
      !(
        (key === "tenantName" && value === "") ||
        (key !== "tenantName" && value === "All")
      ),
  ).length;

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const showingStart = filteredItems.length === 0 ? 0 : startIndex + 1;

  useEffect(() => {
    setCurrentPage(1);
    setOpenMenu(null);
  }, [search, appliedFilters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <BaseLayout3>
      <SuperAdminHeader currentSection='Tickets' />

       <div className="rounded-xl bg-[#F4F6FC] dark:bg-[#1F1F1F] px-4">

          <div className="flex items-center justify-between mt-2 py-2 ">
          <h2 className="text-[19px] font-semibold text-[#000] dark:text-[#fff] mb-0 px-2 py-3">
              Institute Tickets
            </h2>
          </div>

      <div className="grid grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              className="bg-gradient-to-b from-[#ffffff] to-[#F6F6FF] dark:from-[#2c2c2c] dark:to-[#343434] rounded-2xl px-4 py-3 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-full mt-2 flex items-center justify-center ${card.iconBg}`}
                >
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>

                <div className="space-y-2">
                  <p className={`text-md mt-[4px] font-medium ${card.titleColor}`}>
                    {card.title}
                  </p>
                  <h2 className="text-[25px] font-semibold text-gray-800 dark:text-white mt-1">
                    {card.value}
                  </h2>
                </div>
              </div>

              <p className='text-sm mt-3 ml-[70px] flex flex-row gap-1'>
                <span className="flex flex-row gap-x-1 text-[#646464]">{card.trend}</span>
              </p>
            </div>
          );
        })}
      </div>

      <div className="">
          <h2 className="text-[19px] font-semibold text-[#000] dark:text-[#fff] mb-0 px-2 py-3">
        All Tickets
      </h2>
        <div className="bg-white rounded-xl shadow-lg dark:bg-[#343434] overflow-hidden rounded-b-xl border-t border-[#E6EAF2] dark:border-[#3F3F3F]">
          <div className="grid grid-cols-1 border-b border-[#E6EAF2] dark:border-[#3F3F3F] md:grid-cols-3">
            <div className="flex h-12 items-center border-b border-[#E6EAF2] px-4 dark:border-[#3F3F3F] md:border-b-0 md:border-r">
              <Search size={17} className="text-[#A5AAB4]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ticket ID, tenant, subject..."
                className="ml-2 w-full bg-transparent text-sm text-[#444] outline-none placeholder:text-[#A5AAB4] dark:text-[#E2E2E2]"
              />
            </div>

            <div className="border-b border-[#E6EAF2] dark:border-[#3F3F3F] md:border-b-0 md:border-r">
              <button
                onClick={() => {
                  setDraftFilters(appliedFilters);
                  setShowFilterPanel(true);
                }}
                className="flex h-12 w-full items-center justify-between px-4 text-sm text-[#80848E] transition hover:bg-gray-50 dark:hover:bg-[#2F2F2F]"
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
              Showing {showingStart} of {filteredItems.length}
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-none h-full">
            <div className="h-[380px] rounded-b-xl scrollbar-none">
              <table className="min-w-full text-xs border-collapse table-fixed">
                <thead className="text-[14px] bg-[#4C6993] text-white dark:bg-[#44699d]">
                  <tr>
                    {[
                      "Ticket ID",
                      "Tenant Name",
                      "Subject",
                      "Category",
                      "Priority",
                      "Status",
                      "Assigned To",
                      "Created On",
                      "Resolved On",
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
                    paginatedItems.map((item) => (
                      <tr
                        key={item.ticketId}
                        className="text-[12px] odd:bg-[#f8f8f8] even:bg-[#ffffff] dark:odd:bg-[#2c2c2c] dark:even:bg-[#303030]"
                      >
                        <td className="py-4 px-2 font-medium">{item.ticketId}</td>
                        <td className="py-4 px-2">{item.tenantName}</td>
                        <td className="py-4 px-2">{item.subject}</td>
                        <td className="py-4 px-2">{item.category}</td>
                        <td className="py-4 px-2">
                          <span
                            className={`px-2 text-[12px] py-[3px] rounded-md ${priorityBadgeClass(item.priority)}`}
                          >
                            {item.priority}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <span
                            className={`px-2 text-[12px] py-[3px] rounded-md ${statusBadgeClass(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 px-2">{item.assignedTo}</td>
                        <td className="py-4 px-2">{item.createdOn}</td>
                        <td className="py-4 px-2">{item.resolvedOn}</td>
                        <td className="py-4 px-2 relative">
                          <button
                            onClick={() =>
                              setOpenMenu(openMenu === item.ticketId ? null : item.ticketId)
                            }
                            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                            <BsThreeDotsVertical size={16} />
                          </button>

                          {openMenu === item.ticketId && (
                            <div className="absolute right-4 top-12 z-50 w-44 bg-white dark:bg-[#2c2c2c] rounded-lg shadow-lg border dark:border-gray-700">
                              <button
                                disabled={item.status !== "Open"}
                                className="w-full text-left px-4 border-b py-2 text-xs dark:border-gray-700 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-300 dark:disabled:text-gray-600"
                                onClick={() => {
                                  setOpenMenu(null);
                                  setAcknowledgeTicket(item);
                                }}
                              >
                                Acknowledge
                              </button>

                              <button
                                disabled={item.status === "Resolved" || item.status === "Closed"}
                                className="w-full text-left px-4 border-b py-2 text-xs dark:border-gray-700 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-300 dark:disabled:text-gray-600"
                                onClick={() => {
                                  setOpenMenu(null);
                                  setResolveTicket(item);
                                }}
                              >
                                Mark as Resolved
                              </button>

                              <button
                                className="w-full text-left px-4 border-b py-2 text-xs dark:border-gray-700 dark:hover:bg-gray-700"
                                onClick={() => {
                                  setOpenMenu(null);
                                  setViewTicketModal(item);
                                }}
                              >
                                View Details
                              </button>

                              <button
                                className="w-full text-left px-4 py-2 text-xs text-[#98A2B3] dark:hover:bg-gray-700"
                                onClick={() => setOpenMenu(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="p-4 text-center">
                        No tickets found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

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
              className={`flex h-8 w-8 items-center justify-center rounded border font-medium ${
                currentPageSafe === p
                  ? "border-[#496A96] bg-white text-[#496A96] dark:bg-[#343434]"
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
                    <div className="relative">
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
                    </div>

                    <div className="relative">
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
                    setAppliedFilters(draftFilters);
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

        {viewTicketModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3">
            <div className="max-h-[95vh] w-full max-w-[660px] overflow-y-auto scrollbar-none">
              <ViewTicketDetails
                ticket={viewTicketModal}
                onClose={() => setViewTicketModal(null)}
              />
            </div>
          </div>
        )}

        {acknowledgeTicket && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3">
            <div className="max-h-[95vh] w-full max-w-[660px] overflow-y-auto scrollbar-none">
              <AcknowledgementForm
                ticket={acknowledgeTicket}
                onCancel={() => setAcknowledgeTicket(null)}
                onSubmit={handleAcknowledgeSubmit}
              />
            </div>
          </div>
        )}

        {resolveTicket && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3">
            <div className="max-h-[95vh] w-full max-w-[660px] overflow-y-auto scrollbar-none">
              <ResolvedForm
                ticket={resolveTicket}
                onCancel={() => setResolveTicket(null)}
                onSubmit={handleResolveSubmit}
              />
            </div>
          </div>
        )}
      </div>
       </div>
    </BaseLayout3>
  )
}

export default page
