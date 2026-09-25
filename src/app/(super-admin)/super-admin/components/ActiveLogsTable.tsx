"use client";

import React, { useEffect, useState } from "react";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import Pagination from "@/components/Pagination";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface AuditLogRecord {
  _id: string;
  tenantId: string;
  userId: string;
  logType: string;
  action: string;
  description: string;
  route: string;
  ip: string;
  meta?: {
    module?: string;
    feature?: string;
  };
  createdDate: string;
}

interface ActivityLog {
  id: string;
  user: string;
  category: string;
  feature: string;
  action: string;
  route: string;
  date: string;
  rawDate: string;
  ipAddress: string;
  details: string;
  status: string;
  dateTime: string;
}

interface ActiveLogsTableProps {
  tenantCode: string;
}

const toTitleCase = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "";

const mapAuditLog = (record: AuditLogRecord): ActivityLog => {
  const created = new Date(record.createdDate);
  const isValid = !Number.isNaN(created.getTime());

  return {
    id: record._id,
    user: record.userId || "—",
    category: record.meta?.module || "—",
    feature: record.meta?.feature || "—",
    action: record.action || "—",
    route: record.route || "—",
    date: isValid
      ? created.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—",
    rawDate: record.createdDate,
    ipAddress: record.ip || "—",
    details: record.description || "—",
    status: toTitleCase(record.logType),
    dateTime: isValid
      ? created.toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "—",
  };
};

const ActiveLogsTable = ({ tenantCode }: ActiveLogsTableProps) => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    if (!tenantCode) return;

    const getAuditLogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT.TENANT_AUDIT_LOGS.replace("{tenantCode}", tenantCode)}`,
          { params: { page: currentPage, limit: itemsPerPage } },
        );
        const data = response.data?.data;
        const records: AuditLogRecord[] = data?.records ?? [];
        setActivityLogs(records.map(mapAuditLog));
        setTotalRecords(data?.pagination?.total ?? records.length);
        setTotalPages(data?.pagination?.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
        setActivityLogs([]);
        setTotalRecords(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    getAuditLogs();
  }, [tenantCode, currentPage]);

  const toggleDropdown = (id: string) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  const filteredLogs = activityLogs.filter((log) => {
    const keyword = searchKeyword.toLowerCase();
    const search =
      log.user.toLowerCase().includes(keyword) ||
      log.category.toLowerCase().includes(keyword) ||
      log.feature.toLowerCase().includes(keyword) ||
      log.action.toLowerCase().includes(keyword) ||
      log.route.toLowerCase().includes(keyword) ||
      log.details.toLowerCase().includes(keyword) ||
      log.ipAddress.toLowerCase().includes(keyword);

    const logDate = new Date(log.rawDate);

    const fromDateFilter =
      !filters.fromDate || logDate >= new Date(`${filters.fromDate}T00:00:00`);

    const toDateFilter =
      !filters.toDate || logDate <= new Date(`${filters.toDate}T23:59:59.999`);

    const userFilter =
      !filters.user ||
      log.user.toLowerCase().includes(filters.user.toLowerCase());

    const categoryFilter =
      !filters.category ||
      log.category.toLowerCase().includes(filters.category.toLowerCase());

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


  return (
    <div className="dark:text-white">
      <br />

      <div className="md:p-0 mx-auto w-full">
        <div className="flex flex-col h-full w-full justify-between">
          <div className="flex flex-col shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] bg-white dark:bg-[#343434] rounded-xl p-4">
            {/* Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
              <h2 className="flex flex-wrap gap-4 font-semibold text-[15px] dark:text-white">
                Blackstone Academy Active Logs
              </h2>
            </div>

            {/* Search + Filter */}
            <div className="w-full bg-[#FAFAFB] dark:bg-[#1F1F1F] rounded-lg">
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
                    Showing {filteredLogs.length} of {totalRecords}
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
                        className="px-2 py-1 font-medium border border-[#4C6993] dark:border-[#6A8AB0] text-left text-wrap break-words"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(loading || filteredLogs.length === 0) && (
                    <tr className="bg-[#fff] dark:bg-[#2C2C2C]">
                      <td
                        colSpan={8}
                        className="px-3 py-6 text-center text-[12px] text-gray-500 dark:text-gray-400"
                      >
                        {loading ? "Loading..." : "No logs found"}
                      </td>
                    </tr>
                  )}
                  {!loading && filteredLogs.map((log, index) => {
                    const rowBgClass =
                      index % 2 === 0
                        ? "bg-[#fff] dark:bg-[#2C2C2C]"
                        : "bg-[#F8F8F8] dark:bg-[#383838]";

                    return (
                      <tr
                        key={log.id}
                        className={`text-[10px] ${rowBgClass}`}
                      >
                        <td className="px-3 py-3 text-[11px] text-left dark:text-white break-all">
                          {log.user}
                        </td>

                        <td className="px-3 py-3 text-[11px] text-left dark:text-white">
                          {log.category}
                          <p className="text-[9px] text-gray-500 dark:text-gray-400">
                            {log.feature}
                          </p>
                        </td>
                        <td className="px-3 text-[#516a8d] dark:text-sky-300 py-3 text-[11px] text-left">
                          {log.date}
                        </td>

                        <td className="px-3 py-3 text-[11px] text-left dark:text-white">
                          {log.ipAddress}
                        </td>
                        <td className="px-3 py-3 text-[11px] text-left dark:text-white break-words">
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
                        <td className="px-3 py-3 text-[11px] text-left dark:text-white">
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
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Feature</label>
                <input
                  readOnly
                  value={selectedLog.feature}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Action</label>
                <input
                  readOnly
                  value={selectedLog.action}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Route</label>
                <input
                  readOnly
                  value={selectedLog.route}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Date & Time</label>
                <input
                  readOnly
                  value={selectedLog.dateTime}
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

export default ActiveLogsTable;