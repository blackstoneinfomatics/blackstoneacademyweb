"use client";

import React, { useEffect, useState } from "react";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import Pagination from "@/components/Pagination";
import { useRouter } from "next/navigation";

interface ActivityLog {
  id: string;
  user: string;
  category: string;
  date: string;
  ipAddress: string;
  details: string;
  status: string;
  dateTime: string;
}

const FeaturesTable = () => {
  const router = useRouter();
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: "1",
      user: "John Smith",
      category: "Authentication",
      date: "12 Sep 2025",
      ipAddress: "192.168.1.10",
      details: "User logged into the system",
      status: "Success",
      dateTime: "12 Sep 2025, 10:30 AM",
    },
    {
      id: "2",
      user: "Sarah Ahmed",
      category: "Course",
      date: "13 Sep 2025",
      ipAddress: "192.168.1.18",
      details: "Updated course details",
      status: "Pending",
      dateTime: "13 Sep 2025, 02:15 PM",
    },
    {
      id: "3",
      user: "Mohammed Ali",
      category: "Billing",
      date: "14 Sep 2025",
      ipAddress: "192.168.1.25",
      details: "Generated invoice",
      status: "Failed",
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
      case "Success":
        return "bg-[#ECFDF3] text-[#377E36] dark:bg-green-900/30 dark:text-green-400";
      case "Failed":
        return "bg-[#FDECEC] text-[#D34645] dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  const [filters, setFilters] = useState({
    user: "",
    category: "",
    status: "",
    ipAddress: "",
    fromDate: "",
    toDate: "",
  });

  const itemsPerPage = 10;

  const toggleDropdown = (id: string) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  const filteredLogs = activityLogs.filter((log) => {
    const search =
      log.user.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      log.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      log.details.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(searchKeyword.toLowerCase());

    const fromDateFilter =
      !filters.fromDate || new Date(log.date) >= new Date(filters.fromDate);

    const toDateFilter =
      !filters.toDate || new Date(log.date) <= new Date(filters.toDate);

    const userFilter =
      !filters.user ||
      log.user.toLowerCase().includes(filters.user.toLowerCase());

    const categoryFilter =
      !filters.category || log.category === filters.category;

    const statusFilter = !filters.status || log.status === filters.status;

    const ipFilter =
      !filters.ipAddress ||
      log.ipAddress.toLowerCase().includes(filters.ipAddress.toLowerCase());

    return (
      search &&
      userFilter &&
      categoryFilter &&
      statusFilter &&
      ipFilter &&
      fromDateFilter &&
      toDateFilter
    );
  });

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  return (
    <div className="dark:text-white">
      <br />

      <div className="md:p-0 mx-auto w-full">
        <div className="flex flex-col h-full w-full justify-between">
          <div className="flex flex-col">
            {/* Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
              <div className="flex flex-wrap gap-4 font-semibold text-xl dark:text-white">
                Blackstone Academy Active Logs
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
                    Showing {filteredLogs.length} of {activityLogs.length}
                  </span>
                </div>
              </div>

              {/* Table */}
              <table className="table-fixed w-full border-collapse">
                <thead className="text-[13px] bg-[#4C6993] text-white">
                  <tr>
                    {[
                      "User",
                      "Category",
                      "Date",
                      "IP Address",
                      "Details",
                      "Status",
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
                  {paginatedLogs.map((log, index) => {
                    const rowBgClass =
                      index % 2 === 0
                        ? "bg-[#fff] dark:bg-[#2C2C2C]"
                        : "bg-[#F8F8F8] dark:bg-[#383838]";

                    return (
                      <tr
                        key={log.id}
                        className={`text-[10px] ${rowBgClass}`}
                      >
                        <td className="px-3 py-3 text-[11px] text-left dark:text-white">
                          {log.user}
                        </td>

                        <td className="px-3 py-3 text-[11px] text-left dark:text-white">
                          {log.category}
                        </td>
                        <td className="px-3 text-[#516a8d] dark:text-sky-300 py-3 text-[11px] text-left">
                          {log.date}
                        </td>

                        <td className="px-3 py-3 text-[11px] text-left dark:text-white">
                          {log.ipAddress}
                        </td>
                        <td className="px-3 py-3 text-[11px] text-left dark:text-white">
                          {log.details}
                        </td>
                        <td className="px-3 py-3 text-left">
                          <span
                            className={`inline-flex items-center justify-center w-[80px] h-6 rounded-md text-xs font-medium ${getStatusStyle(
                              log.status
                            )}`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-left dark:text-white">
                          {log.dateTime}
                        </td>

                        <td className="px-3 py-3 text-left relative text-[12px]">
                          <button
                            onClick={() => toggleDropdown(log.id)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                          >
                            <BsThreeDotsVertical />
                          </button>

                          {openDropdownId === log.id && (
                            <div className="absolute right-0 top-8 w-40 bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                              <button
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#444] dark:text-gray-200"
                                onClick={() => {
                                  setSelectedLog(log);
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

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Category</label>
              <input
                type="text"
                value={filters.category}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    category: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
                placeholder="Enter Category"
              />
            </div>

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
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
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
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Status</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    status: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
              >
                <option value="">All</option>
                <option value="Success">Success</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            <div className="flex gap-4 justify-end">
              <button
                type="button"
                className="border border-[#576CBC] bg-white dark:bg-transparent text-[#576CBC] dark:text-[#8296E6] rounded-lg px-6 py-2 font-semibold hover:bg-gray-50 dark:hover:bg-[#444] transition-colors"
                onClick={() =>
                  setFilters({
                    user: "",
                    category: "",
                    status: "",
                    ipAddress: "",
                    fromDate: "",
                    toDate: "",
                  })
                }
              >
                Reset
              </button>

              <button
                type="submit"
                className="bg-[#576CBC] text-white rounded-lg px-6 py-2 font-semibold hover:bg-[#465a9e] dark:hover:bg-[#6A80D1] transition-colors"
              >
                Show {filteredLogs.length} Results
              </button>
            </div>
          </form>

          <div className="fixed inset-0" onClick={() => setShowFilter(false)} />
        </div>
      )}

      {showViewModal && selectedLog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#2C2C2C] rounded-2xl w-[900px] p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[22px] font-semibold text-[#1F2A44] dark:text-white">
                Active Logs
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-3xl text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">User</label>
                <input
                  readOnly
                  value={selectedLog.user}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Category</label>
                <input
                  readOnly
                  value={selectedLog.category}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Date</label>
                <input
                  readOnly
                  value={selectedLog.date}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">IP Address</label>
                <input
                  readOnly
                  value={selectedLog.ipAddress}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Details</label>
                <textarea
                  readOnly
                  rows={3}
                  value={selectedLog.details}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 resize-none bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Status</label>
                <input
                  readOnly
                  value={selectedLog.status}
                  className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white ${
                    selectedLog.status === "Success"
                      ? "text-green-600 dark:text-green-400"
                      : selectedLog.status === "Failed"
                      ? "text-red-600 dark:text-red-400"
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

export default FeaturesTable;