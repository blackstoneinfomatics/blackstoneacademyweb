"use client";

import React, { useEffect, useState } from "react";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import Pagination from "@/components/Pagination";
import { useRouter } from "next/navigation";

interface Ticket {
  id: string;
  ticketId: string;
  role: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  requester: string;
  dateTime: string;
}

const TicketsTable = () => {
  const router = useRouter();
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: "1",
      ticketId: "TKT-1001",
      subject: "Unable to Login",
      category: "Authentication",
      priority: "High",
      role: "Admin",
      status: "Open",
      requester: "John Smith",
      dateTime: "12 Sep 2025, 10:30 AM",
    },
    {
      id: "2",
      ticketId: "TKT-1002",
      subject: "Course Access",
      category: "Course",
      role: "User",
      priority: "Medium",
      status: "In Progress",
      requester: "Sarah Ahmed",
      dateTime: "13 Sep 2025, 02:15 PM",
    },
    {
      id: "3",
      ticketId: "TKT-1003",
      subject: "Payment Failed",
      category: "Billing",
      role: "User",
      priority: "High",
      status: "Resolved",
      requester: "Mohammed Ali",
      dateTime: "14 Sep 2025, 09:00 AM",
    },
  ]);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const getPlanStyle = (plan: string) => {
    switch (plan) {
      case "High":
        return "bg-[#D3464524] text-[#D34645] dark:bg-red-900/30 dark:text-red-400";
      case "Medium":
        return "bg-[#FCAA2524] text-[#FCAA25] dark:bg-amber-900/30 dark:text-amber-400";
      case "Low":
        return "bg-[#ECFDF3] text-[#377E36] dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-[#5E6BFF24] text-[#5E6BFF] dark:bg-blue-900/30 dark:text-blue-400";
      case "In Progress":
        return "bg-[#FCAA2524] text-[#FCAA25] dark:bg-amber-900/30 dark:text-amber-400";
      case "Resolved":
        return "bg-[#ECFDF3] text-[#377E36] dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  const [filters, setFilters] = useState({
    category: "",
    requester: "",
    fromDate: "",
    toDate: "",
    priority: "",
    status: "",
  });

  const itemsPerPage = 10;

  const toggleDropdown = (id: string) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  const filteredTickets = tickets.filter((ticket) => {
    const search =
      ticket.ticketId.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      ticket.requester.toLowerCase().includes(searchKeyword.toLowerCase());

    const categoryFilter = !filters.category || ticket.category === filters.category;
    const requesterFilter = !filters.requester || ticket.requester === filters.requester;
    const priorityFilter = !filters.priority || ticket.priority === filters.priority;
    const statusFilter = !filters.status || ticket.status === filters.status;

    const ticketDate = new Date(ticket.dateTime);
    const fromDateFilter = !filters.fromDate || ticketDate >= new Date(filters.fromDate);
    const toDateFilter = !filters.toDate || ticketDate <= new Date(filters.toDate);

    return (
      search &&
      categoryFilter &&
      requesterFilter &&
      priorityFilter &&
      statusFilter &&
      fromDateFilter &&
      toDateFilter
    );
  });

  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  return (
    <div className="dark:text-white">
      <br />

      <div className="md:p-0 mx-auto w-full">
        <div className="flex flex-col h-full w-full justify-between">
          <div className="flex flex-col">
            {/* Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
              <div className="flex flex-wrap gap-4 font-semibold text-xl dark:text-white">
                Blackstone Academy Tickets
              </div>
            </div>

            {/* Search + Filter */}
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
                    Showing {filteredTickets.length} of {tickets.length}
                  </span>
                </div>
              </div>

              {/* Table */}
              <table className="table-fixed w-full border-collapse">
                <thead className="text-[13px] bg-[#4C6993] text-white">
                  <tr>
                    {[
                      "Ticket ID",
                      "Subject",
                      "Category",
                      "Priority",
                      "Status",
                      "Requester",
                      "Date & Time",
                      "Action",
                    ].map((header, idx) => (
                      <th
                        key={idx}
                        className="px-2 py-1 border border-[#4C6993] dark:border-[#6A8AB0] text-left text-wrap break-words"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedTickets.map((ticket, index) => {
                    const rowBgClass =
                      index % 2 === 0
                        ? "bg-[#fff] dark:bg-[#2C2C2C]"
                        : "bg-[#F8F8F8] dark:bg-[#383838]";

                    return (
                      <tr
                        key={ticket.id}
                        className={`text-[10px] ${rowBgClass}`}
                      >
                        <td className="px-3 py-3 text-[11px] text-left dark:text-white">
                          {ticket.id}
                        </td>

                        <td className="px-3 py-3 text-[11px] text-left dark:text-white">
                          {ticket.subject}
                        </td>

                        <td className="px-3 py-3 text-[11px] text-left dark:text-white">
                          {ticket.category}
                        </td>
                        <td className="px-3 py-3 text-left">
                          <span
                            className={`inline-flex items-center justify-center w-[80px] h-6 rounded-md text-xs font-medium ${getPlanStyle(
                              ticket.priority
                            )}`}
                          >
                            {ticket.priority}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-left">
                          <span
                            className={`inline-flex items-center justify-center w-[80px] h-6 rounded-md text-xs font-medium ${getStatusStyle(
                              ticket.status
                            )}`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[11px] text-left dark:text-white">
                          {ticket.requester}
                        </td>
                        <td className="px-3 py-3 text-[11px] text-left dark:text-white">
                          {ticket.dateTime}
                        </td>

                        <td className="px-3 py-3 text-left relative text-[12px]">
                          <button
                            onClick={() => toggleDropdown(ticket.id)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                          >
                            <BsThreeDotsVertical />
                          </button>

                          {openDropdownId === ticket.id && (
                            <div className="absolute right-0 top-8 w-40 bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                              <button
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#444] dark:text-gray-200"
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  setShowViewModal(true);
                                  setOpenDropdownId(null);
                                }}
                              >
                                View Details
                              </button>

                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-[#444]"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {showFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            className="bg-white dark:bg-[#2C2C2C] p-6 rounded-2xl shadow-lg w-[500px] flex flex-col z-50"
            onSubmit={(e) => {
              e.preventDefault();
              setShowFilter(false);
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg dark:text-white">Filter by</h2>
              <button
                type="button"
                className="text-gray-400 text-2xl font-bold cursor-pointer dark:text-gray-300"
                onClick={() => setShowFilter(false)}
              >
                ×
              </button>
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Category</label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    category: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
              >
                <option value="">Select Category</option>
                <option value="Authentication">Authentication</option>
                <option value="Course">Course</option>
                <option value="Billing">Billing</option>
              </select>
            </div>

            {/* Requester */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Requester</label>
              <select
                value={filters.requester}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    requester: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
              >
                <option value="">Select Requester</option>
                <option value="John Smith">John Smith</option>
                <option value="Sarah Ahmed">Sarah Ahmed</option>
                <option value="Mohammed Ali">Mohammed Ali</option>
              </select>
            </div>

            {/* Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Date</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      fromDate: e.target.value,
                    }))
                  }
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
                />
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      toDate: e.target.value,
                    }))
                  }
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
                />
              </div>
            </div>

            {/* Priority */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    priority: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
              >
                <option value="">Select Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Status */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Status</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    status: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
              >
                <option value="">Select Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <hr className="mb-5 border-gray-200 dark:border-gray-700" />

            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="border border-[#5E6BFF] dark:border-[#8296E6] text-[#5E6BFF] dark:text-[#8296E6] rounded-lg px-7 py-2 font-semibold bg-transparent hover:bg-gray-50 dark:hover:bg-[#444] transition-colors"
                onClick={() =>
                  setFilters({
                    category: "",
                    requester: "",
                    fromDate: "",
                    toDate: "",
                    priority: "",
                    status: "",
                  })
                }
              >
                Reset
              </button>

              <button
                type="submit"
                className="bg-[#5E6BFF] text-white rounded-lg px-7 py-2 font-semibold hover:bg-[#4A56D6] dark:hover:bg-[#6A80D1] transition-colors"
              >
                Show {filteredTickets.length} results
              </button>
            </div>
          </form>

          <div className="fixed inset-0" onClick={() => setShowFilter(false)} />
        </div>
      )}

      {showViewModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#2C2C2C] rounded-2xl w-[900px] p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[22px] font-semibold text-[#1E293B] dark:text-white">
                Tickets
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-3xl text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {/* Ticket ID */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Ticket ID</label>
                <input
                  readOnly
                  value={selectedTicket.ticketId}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Role</label>
                <input
                  readOnly
                  value={selectedTicket.role}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              {/* Requester */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Requester</label>
                <input
                  readOnly
                  value={selectedTicket.requester}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              {/* Date & Time */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Date & Time</label>
                <input
                  readOnly
                  value={selectedTicket.dateTime}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              {/* Subject */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Subject</label>
                <textarea
                  readOnly
                  rows={3}
                  value={selectedTicket.subject}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 resize-none bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Priority</label>
                <input
                  readOnly
                  value={selectedTicket.priority}
                  className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white ${
                    selectedTicket.priority === "High"
                      ? "text-red-600 dark:text-red-400"
                      : selectedTicket.priority === "Medium"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Status</label>
                <input
                  readOnly
                  value={selectedTicket.status}
                  className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white ${
                    selectedTicket.status === "Open"
                      ? "text-blue-600 dark:text-blue-400"
                      : selectedTicket.status === "Resolved"
                      ? "text-green-600 dark:text-green-400"
                      : "text-yellow-600 dark:text-yellow-400"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsTable;