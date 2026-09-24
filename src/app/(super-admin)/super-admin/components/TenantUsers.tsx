"use client";

import React, { useEffect, useState } from "react";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import Pagination from "@/components/Pagination";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface TenantUser {
  id: string;
  userName: string;
  email: string;
  role: string;
  department: string;
  status: string;
  createdDate: string;
  phoneNumber?: string;
  designation?: string;
  reportingTo?: string;
  accessLevel?: string;
}

const normalizeStatus = (value?: string) => {
  const sanitized = (value ?? "").toUpperCase();

  if (sanitized === "ACTIVE") return "Active";
  if (sanitized === "INACTIVE") return "Inactive";
  if (sanitized === "TRIAL") return "Trial";

  return value || "Inactive";
};

const normalizeRole = (value?: string) => {
  const sanitized = (value ?? "").toUpperCase();

  if (sanitized === "ACADEMIC") return "Academic";
  if (sanitized === "FINANCE") return "Finance";
  if (sanitized === "ADMIN") return "Admin";
  if (sanitized === "CUSTOM") return "Custom";
  if (sanitized === "DEFAULT") return "Default";

  return value || "N/A";
};

const formatPortalDate = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const TenantUserTable = () => {
  const searchParams = useSearchParams();
  const tenantCode =
    searchParams.get("tenantCode") ??
    (typeof window !== "undefined"
      ? (localStorage.getItem("tenantCode") ?? "")
      : "");

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);
  const [originalUser, setOriginalUser] = useState<TenantUser | null>(null);

  const [users, setUsers] = useState<TenantUser[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    portalName: "",
    role: "",
    department: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    if (!tenantCode) {
      setUsers([]);
      return;
    }

    const fetchTenantPortals = async () => {
      try {
        const portalEndpoint = AppApiEndpoints.PORTAL.GET_BY_TENANT.replace(
          "{tenantId}",
          encodeURIComponent(tenantCode),
        );

        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${portalEndpoint}`,
        );

        const portalItems = response.data?.data?.items ?? [];
        const tenantEmail = response.data?.data?.tenantEmail ?? "";

        const mappedUsers: TenantUser[] = portalItems.map((portal: any) => ({
          id: portal.portalId || portal._id || portal.portalCode || "N/A",
          userName: portal.portalName || "Untitled Portal",
          email: tenantEmail || "tenant@unknown.com",
          role: normalizeRole(portal.roleType || portal.portalType),
          department: portal.portalType || "N/A",
          status: normalizeStatus(portal.status),
          createdDate: formatPortalDate(portal.createdAt),
          phoneNumber: "",
          designation: portal.portalCode || portal.portalId || "—",
          reportingTo: portal.portalType || "N/A",
          accessLevel: portal.isEnabled ? "Enabled" : "Disabled",
        }));

        setUsers(mappedUsers);
      } catch (error) {
        console.error("Failed to fetch tenant portal list:", error);
        setUsers([]);
      }
    };

    fetchTenantPortals();
  }, [tenantCode]);

  const itemsPerPage = 10;

  const toggleDropdown = (id: string) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  const filteredUsers = users.filter((user) => {
    const search =
      user.userName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      user.email.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      user.department.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      user.role.toLowerCase().includes(searchKeyword.toLowerCase());

    const portalNameFilter =
      !filters.portalName ||
      user.userName.toLowerCase().includes(filters.portalName.toLowerCase());

    const roleFilter = !filters.role || user.role === filters.role;

    const departmentFilter =
      !filters.department || user.department === filters.department;

    const statusFilter = !filters.status || user.status === filters.status;

    const loginDate = new Date(user.createdDate);

    const fromDateFilter =
      !filters.fromDate || loginDate >= new Date(filters.fromDate);

    const toDateFilter =
      !filters.toDate || loginDate <= new Date(filters.toDate);

    return (
      search &&
      portalNameFilter &&
      roleFilter &&
      departmentFilter &&
      statusFilter &&
      fromDateFilter &&
      toDateFilter
    );
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // --- UPDATED: Status and Role Badge Styles with Dark Mode ---
  const getStatusStyle = (status: string) => {
    const normalized = status.toUpperCase();

    switch (normalized) {
      case "ACTIVE":
      case "Active":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "ADMIN":
      case "Admin":
      case "ACADEMIC":
      case "Academic":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "FINANCE":
      case "Finance":
        return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400";
      case "DEFAULT":
      case "Default":
      case "CUSTOM":
      case "Custom":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "TRIAL":
      case "Trial":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "INACTIVE":
      case "Inactive":
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
  };

  // Helper to count active filters
  const activeFilterCount = Object.values(filters).filter(
    (val) => val !== "",
  ).length;

  const roleOptions = Array.from(
    new Set(users.map((user) => user.role)),
  ).sort();
  const departmentOptions = Array.from(
    new Set(users.map((user) => user.department)),
  ).sort();
  const statusOptions = Array.from(
    new Set(users.map((user) => user.status)),
  ).sort();

  return (
    <div className="dark:text-white">
      <br />

      <div className="md:p-0 mx-auto w-full">
        <div className="flex flex-col h-full w-full justify-between">
          <div className="flex flex-col bg-white  rounded-lg p-3">
            {/* Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <h2 className=" gap-2 text-[#010E30] font-medium p-3">
                Smart Institute Users
              </h2>
            </div>

            {/* Search + Filter */}
            <div className="w-full bg-[#FAFAFB] dark:bg-[#1F1F1F] rounded-lg">
              <div className="flex justify-between bg-[#FAFAFB] items-center px-4 py-0 rounded-md dark:bg-[#1F1F1F]">
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

                {/* --- UPDATED: Active Filter Indicator Button --- */}
                <div
                  onClick={() => setShowFilter(true)}
                  className={`flex items-center gap-2 text-sm py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer transition-colors ${
                    activeFilterCount > 0
                      ? "text-blue-600 font-medium italic dark:text-blue-400"
                      : "text-gray-400 dark:border-[#606060] dark:text-gray-400"
                  }`}
                >
                  <MdTune className="w-4 h-4" />
                  <span>Filter</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                      {activeFilterCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                  <span className="text-left -ml-60">
                    Showing {filteredUsers.length} of {users.length}
                  </span>
                </div>
              </div>

              {/* Table */}
              <table className="table-fixed w-full border-collapse">
                <thead className="text-[13px] bg-[#4C6993] text-white">
                  <tr>
                    {[
                      "Portals",
                      "Email Id",
                      "Role",
                      "Department",
                      "Status",
                      "Created Date",
                      "Action",
                    ].map((header, idx) => (
                      <th
                        key={idx}
                        className="px-2 py-2 text-left text-wrap break-words font-medium"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user, index) => {
                    const rowBgClass =
                      index % 2 === 0
                        ? "bg-[#fff] dark:bg-[#2C2C2C]"
                        : "bg-[#F8F8F8] dark:bg-[#383838]";

                    return (
                      <tr key={user.id} className={`text-[10px] ${rowBgClass}`}>
                        <td className="px-3 py-3 break-words text-[11px] text-left dark:text-white">
                          {user.userName}
                        </td>

                        <td className="px-3 py-3 break-words text-[11px] text-left text-[#3D8FDE] dark:text-sky-300">
                          {user.email}
                        </td>

                        {/* --- UPDATED: Applied getStatusStyle to Role (Admin/Teacher) --- */}
                        <td className="px-3 py-3 break-words text-left">
                          <span
                            className={`inline-flex items-center justify-center w-[90px] h-6 rounded-md text-xs font-medium ${getStatusStyle(
                              user.role,
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-3 py-3 break-words text-[11px] text-left dark:text-white">
                          {user.department}
                        </td>

                        {/* --- UPDATED: Applied getStatusStyle to Status (Active) --- */}
                        <td className="px-3 py-3 break-words text-[11px] text-left">
                          <span
                            className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-xs font-medium ${getStatusStyle(
                              user.status,
                            )}`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 break-words text-[11px] text-left dark:text-white">
                          {user.createdDate}
                        </td>

                        <td className="px-3 py-3 text-left relative text-[12px]">
                          <button
                            onClick={() => toggleDropdown(user.id)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                          >
                            <BsThreeDotsVertical />
                          </button>

                          {openDropdownId === user.id && (
                            <div className="absolute right-4 top-8 w-28 bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                              <button
                                className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-[#444] dark:text-gray-200"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowViewModal(true);
                                  setOpenDropdownId(null);
                                }}
                              >
                                View Details
                              </button>
                              <button
                                className="block w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-gray-100 dark:hover:bg-[#444]"
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

      {/* --- Filter Modal --- */}
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
              <h2 className="font-semibold text-base dark:text-white">
                Filter by
              </h2>
              <button
                type="button"
                className="text-gray-400 text-2xl font-semibold cursor-pointer dark:text-gray-300"
                onClick={() => setShowFilter(false)}
              >
                ×
              </button>
            </div>

            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              Portals
            </label>
            <input
              type="text"
              value={filters.portalName}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  portalName: e.target.value,
                }))
              }
              className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
              placeholder="Enter Portal Name"
            />

            <div className="mb-4 mt-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    role: e.target.value,
                  }))
                }
                className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
              >
                <option value="">Select Role</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    department: e.target.value,
                  }))
                }
                className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
              >
                <option value="">Select Department</option>
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    status: e.target.value,
                  }))
                }
                className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
              >
                <option value="">Select Status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                Created Date
              </label>
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
                  className="border text-xs border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
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
                  className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-auto justify-end">
              <button
                type="button"
                className="border border-[#576CBC] bg-white dark:bg-transparent text-[#576CBC] dark:text-[#8296E6] rounded-lg px-4 py-2 font-semibold hover:bg-gray-50 dark:hover:bg-[#444] transition-colors text-sm"
                onClick={() =>
                  setFilters({
                    portalName: "",
                    role: "",
                    department: "",
                    status: "",
                    fromDate: "",
                    toDate: "",
                  })
                }
              >
                Reset
              </button>

              <button
                type="submit"
                className="bg-[#576CBC] text-white rounded-lg px-4 py-2 font-semibold hover:bg-[#465a9e] dark:hover:bg-[#6A80D1] transition-colors text-sm"
                onClick={() => setShowFilter(false)}
              >
                Show Results
              </button>
            </div>
          </form>

          <div className="fixed inset-0" onClick={() => setShowFilter(false)} />
        </div>
      )}

      {/* --- View Modal --- */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#2C2C2C] rounded-2xl w-[600px] p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold dark:text-white">
                User Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-3xl text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="dark:text-gray-200 text-sm">Name</label>
                <input
                  readOnly
                  value={selectedUser.userName}
                  className="w-full border border-gray-300 text-xs dark:border-gray-600 rounded-lg px-4 py-2 mt-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>
              <div>
                <label className="dark:text-gray-200 text-sm">Email</label>
                <input
                  readOnly
                  value={selectedUser.email}
                  className="w-full border border-gray-300 text-xs dark:border-gray-600 rounded-lg px-4 py-2 mt-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>
              <div>
                <label className="dark:text-gray-200 text-sm">Role</label>
                <input
                  readOnly
                  value={selectedUser.role}
                  className="w-full border border-gray-300 text-xs dark:border-gray-600 rounded-lg px-4 py-2 mt-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>
              <div>
                <label className="dark:text-gray-200  text-sm">
                  Department
                </label>
                <input
                  readOnly
                  value={selectedUser.department}
                  className="w-full border border-gray-300 text-xs dark:border-gray-600 rounded-lg px-4 py-2 mt-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>
              <div>
                <label className="dark:text-gray-200  text-sm">
                  Designation
                </label>
                <input
                  readOnly
                  value={selectedUser.designation}
                  className="w-full border border-gray-300 text-xs dark:border-gray-600 rounded-lg px-4 py-2 mt-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>
              <div>
                <label className="dark:text-gray-200  text-sm">Status</label>
                <input
                  readOnly
                  value={selectedUser.status}
                  className="w-full border border-gray-300 text-xs dark:border-gray-600 rounded-lg px-4 py-2 mt-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>
              <div>
                <label className="dark:text-gray-200  text-sm">
                  Created On
                </label>
                <input
                  readOnly
                  value={selectedUser.createdDate}
                  className="w-full border border-gray-300 text-xs dark:border-gray-600 rounded-lg px-4 py-2 mt-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>
              <div>
                <label className="dark:text-gray-200  text-sm">
                  Access Level
                </label>
                <input
                  readOnly
                  value={selectedUser.accessLevel}
                  className="w-full border border-gray-300  text-xs dark:border-gray-600 rounded-lg px-4 py-2 mt-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantUserTable;
