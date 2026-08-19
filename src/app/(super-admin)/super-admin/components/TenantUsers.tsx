"use client";

import React, { useEffect, useState } from "react";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import Pagination from "@/components/Pagination";
import { useRouter } from "next/navigation";

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

const TenantUserTable = () => {
  const router = useRouter();
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);
  const [originalUser, setOriginalUser] = useState<TenantUser | null>(null);

  const [users, setUsers] = useState<TenantUser[]>([
    {
      id: "USR001",
      userName: "John Smith",
      email: "john@blackstoneacademy.com",
      role: "Admin",
      department: "Administration",
      status: "Active",
      createdDate: "12 Sep 2025",
      phoneNumber: "+91 9876543210",
      designation: "Senior Admin",
      reportingTo: "Super Admin",
      accessLevel: "Full Access",
    },
    {
      id: "USR0012",
      userName: "John Smithssss",
      email: "john@blackstoneacademy.com",
      role: "Admin",
      department: "Administration",
      status: "Active",
      createdDate: "12 Sep 2025",
      phoneNumber: "+91 9876543210",
      designation: "Senior Admin",
      reportingTo: "Super Admin",
      accessLevel: "Full Access",
    },
    {
      id: "USR0011",
      userName: "John Smithaaaa",
      email: "john@blackstoneacademy.com",
      role: "Admin",
      department: "Administration",
      status: "Active",
      createdDate: "12 Sep 2025",
      phoneNumber: "+91 9876543210",
      designation: "Senior Admin",
      reportingTo: "Super Admin",
      accessLevel: "Full Access",
    },
  ]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    userName: "",
    role: "",
    department: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

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

    const userNameFilter =
      !filters.userName ||
      user.userName.toLowerCase().includes(filters.userName.toLowerCase());

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
      userNameFilter &&
      roleFilter &&
      departmentFilter &&
      statusFilter &&
      fromDateFilter &&
      toDateFilter
    );
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // --- UPDATED: Status and Role Badge Styles ---
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700"; // Light green background
      case "Admin":
        return "bg-blue-100 text-blue-700"; // Light blue background
      case "Teacher":
        return "bg-emerald-100 text-emerald-700"; // Light emerald background
      case "Trial":
        return "bg-blue-100 text-blue-600";
      case "Inactive":
        return "bg-red-100 text-red-600";
      default:
        return "bg-yellow-100 text-yellow-600";
    }
  };

  // Helper to count active filters
  const activeFilterCount = Object.values(filters).filter((val) => val !== "").length;

  return (
    <div>
      <br />

      <div className="md:p-0 mx-auto w-full">
        <div className="flex flex-col h-full w-full justify-between">
          <div className="flex flex-col">
            {/* Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
              <div className="flex flex-wrap gap-4 font-semibold text-xl">
                Blackstone Academy Users
              </div>
            </div>

            {/* Search + Filter */}
            <div className="w-full bg-[#FAFAFB] dark:bg-[#343434] rounded-lg">
              <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by keyword"
                    className="bg-transparent outline-none text-[15px] w-52 py-3"
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
              <table className="table-fixed w-full">
                <thead className="text-[13px] bg-[#4C6993] text-white">
                  <tr>
                    {[
                      "Users",
                      "Email Id",
                      "Role",
                      "Department",
                      "Status",
                      "Created Date",
                      "Action",
                    ].map((header, idx) => (
                      <th
                        key={idx}
                        className="px-2 py-1 border border-[#4C6993] text-left text-wrap break-words"
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
                        : "bg-[#F8F8F8] dark:bg-[#303030]";

                    return (
                      <tr key={user.id} className={`text-[10px] ${rowBgClass}`}>
                        <td className="px-3 py-3 break-words text-[11px] text-left">
                          {user.userName}
                        </td>

                        <td className="px-3 py-3 break-words text-[11px] text-left">
                          {user.email}
                        </td>

                        {/* --- UPDATED: Applied getStatusStyle to Role (Admin/Teacher) --- */}
                        <td className="px-3 py-3 break-words text-left">
                          <span
                            className={`inline-flex items-center justify-center w-[90px] h-6 rounded-md text-xs font-medium ${getStatusStyle(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-3 py-3 break-words text-[11px] text-left">
                          {user.department}
                        </td>
                        
                        {/* --- UPDATED: Applied getStatusStyle to Status (Active) --- */}
                        <td className="px-3 py-3 break-words text-[11px] text-left">
                          <span
                            className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-xs font-medium ${getStatusStyle(
                              user.status
                            )}`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 break-words text-[11px] text-left">
                          {user.createdDate}
                        </td>

                        <td className="px-3 py-3 text-left relative text-[12px]">
                          <button
                            onClick={() => toggleDropdown(user.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <BsThreeDotsVertical />
                          </button>

                          {openDropdownId === user.id && (
                            <div className="absolute right-0 top-8 w-32 bg-white dark:bg-[#343434] border rounded-md shadow-lg z-50">
                              <button
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowViewModal(true);
                                  setOpenDropdownId(null);
                                }}
                              >
                                View Details
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                onClick={() => {
                                  setSelectedUser({ ...user });
                                  setOriginalUser({ ...user });
                                  setShowEditModal(true);
                                  setOpenDropdownId(null);
                                }}
                              >
                                Edit
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

      {/* --- Filter Modal --- */}
      {showFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            className="bg-white dark:bg-[#232323] p-6 rounded-2xl shadow-lg w-[500px] flex flex-col z-50"
            onSubmit={(e) => {
              e.preventDefault();
              setShowFilter(false);
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Filter by</h2>
              <button
                type="button"
                className="text-gray-400 text-2xl font-bold cursor-pointer"
                onClick={() => setShowFilter(false)}
              >
                ×
              </button>
            </div>

            <label className="block text-sm font-medium mb-2">User Name</label>
            <input
              type="text"
              value={filters.userName}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  userName: e.target.value,
                }))
              }
              className="w-full dark:bg-[#2c2c2c] rounded-lg px-4 py-2.5"
              placeholder="Enter User Name"
            />

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                value={filters.role}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    role: e.target.value,
                  }))
                }
                className="w-full dark:bg-[#2c2c2c] rounded-lg px-4 py-2.5"
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Teacher">Teacher</option>
                <option value="Student">Student</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Department</label>
              <select
                value={filters.department}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    department: e.target.value,
                  }))
                }
                className="w-full dark:bg-[#2c2c2c] rounded-lg px-4 py-2.5"
              >
                <option value="">Select Department</option>
                <option value="Administration">Administration</option>
                <option value="Arabic">Arabic</option>
                <option value="Quran">Quran</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    status: e.target.value,
                  }))
                }
                className="w-full dark:bg-[#2c2c2c] rounded-lg px-4 py-2.5"
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium mb-2">Last Login</label>
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
                  className="dark:bg-[#2c2c2c] rounded-lg px-3 py-2.5"
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
                  className="dark:bg-[#2c2c2c] rounded-lg px-3 py-2.5"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-auto justify-end">
              <button
                type="button"
                className="border border-[#576CBC] bg-white text-[#576CBC] rounded-lg px-6 py-2 font-semibold"
                onClick={() =>
                  setFilters({
                    userName: "",
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
                className="bg-[#576CBC] text-white rounded-lg px-6 py-2 font-semibold"
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
          <div className="bg-white rounded-2xl w-[900px] p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[24px] font-semibold">User Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-3xl text-gray-400"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label>Name</label>
                <input
                  readOnly
                  value={selectedUser.userName}
                  className="w-full border rounded-lg px-4 py-2 mt-2 bg-[#F9FAFB]"
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  readOnly
                  value={selectedUser.email}
                  className="w-full border rounded-lg px-4 py-2 mt-2 bg-[#F9FAFB]"
                />
              </div>
              <div>
                <label>Phone Number</label>
                <input
                  readOnly
                  value={selectedUser.phoneNumber}
                  className="w-full border rounded-lg px-4 py-2 mt-2 bg-[#F9FAFB]"
                />
              </div>
              <div>
                <label>Role</label>
                <input
                  readOnly
                  value={selectedUser.role}
                  className="w-full border rounded-lg px-4 py-2 mt-2 bg-[#F9FAFB]"
                />
              </div>
              <div>
                <label>Department</label>
                <input
                  readOnly
                  value={selectedUser.department}
                  className="w-full border rounded-lg px-4 py-2 mt-2 bg-[#F9FAFB]"
                />
              </div>
              <div>
                <label>Designation</label>
                <input
                  readOnly
                  value={selectedUser.designation}
                  className="w-full border rounded-lg px-4 py-2 mt-2 bg-[#F9FAFB]"
                />
              </div>
              <div>
                <label>Reporting To</label>
                <input
                  readOnly
                  value={selectedUser.reportingTo}
                  className="w-full border rounded-lg px-4 py-2 mt-2 bg-[#F9FAFB]"
                />
              </div>
              <div>
                <label>Status</label>
                <input
                  readOnly
                  value={selectedUser.status}
                  className="w-full border rounded-lg px-4 py-2 mt-2 bg-[#F9FAFB]"
                />
              </div>
              <div>
                <label>Created On</label>
                <input
                  readOnly
                  value={selectedUser.createdDate}
                  className="w-full border rounded-lg px-4 py-2 mt-2 bg-[#F9FAFB]"
                />
              </div>
              <div>
                <label>Access Level</label>
                <input
                  readOnly
                  value={selectedUser.accessLevel}
                  className="w-full border rounded-lg px-4 py-2 mt-2 bg-[#F9FAFB]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Edit Modal --- */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#2C2C2C] rounded-2xl w-[900px] p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[24px] font-semibold">Edit</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-3xl text-gray-400"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label>Name</label>
                <input
                  value={selectedUser.userName}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      userName: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-4 py-2 mt-2"
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      email: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-4 py-2 mt-2"
                />
              </div>
              <div>
                <label>Phone Number</label>
                <input
                  value={selectedUser.phoneNumber ?? ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-4 py-2 mt-2"
                />
              </div>
              <div>
                <label>Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      role: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-4 py-2 mt-2"
                >
                  <option>Admin</option>
                  <option>Teacher</option>
                  <option>Student</option>
                </select>
              </div>
              <div>
                <label>Department</label>
                <select
                  value={selectedUser.department}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      department: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-4 py-2 mt-2"
                >
                  <option>Administration</option>
                  <option>Arabic</option>
                  <option>Quran</option>
                </select>
              </div>
              <div>
                <label>Designation</label>
                <input
                  value={selectedUser.designation ?? ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      designation: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-4 py-2 mt-2"
                />
              </div>
              <div>
                <label>Reporting To</label>
                <select
                  value={selectedUser.reportingTo ?? ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      reportingTo: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-4 py-2 mt-2"
                >
                  <option>Super Admin</option>
                  <option>Admin</option>
                </select>
              </div>
              <div>
                <label>Status</label>
                <select
                  value={selectedUser.status}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      status: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-4 py-2 mt-2"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>

            <div className="border-t mt-8 pt-5 flex justify-end gap-4">
              <button
                className="border border-[#576CBC] text-[#576CBC] rounded-lg px-6 py-2"
                onClick={() => {
                  if (originalUser) {
                    setSelectedUser({ ...originalUser });
                  }
                }}
              >
                Reset
              </button>

              <button
                className="bg-[#576CBC] text-white rounded-lg px-6 py-2"
                onClick={() => {
                  setUsers((prev) =>
                    prev.map((item) =>
                      item.id === selectedUser.id ? selectedUser : item
                    )
                  );
                  setShowEditModal(false);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantUserTable;