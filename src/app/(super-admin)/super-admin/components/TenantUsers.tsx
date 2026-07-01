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
}

const TenantUserTable = () => {
  const router = useRouter();
  const [users, setUsers] = useState<TenantUser[]>([
    {
      id: "USR001",
      userName: "John Smith",
      email: "john@blackstoneacademy.com",
      role: "Admin",
      department: "Administration",
      status: "Active",
      createdDate: "12 Sep 2025",
    },
    {
      id: "USR002",
      userName: "Sarah Ahmed",
      email: "sarah@blackstoneacademy.com",
      role: "Teacher",
      department: "Arabic",
      status: "Active",
      createdDate: "18 Sep 2025",
    },
    {
      id: "USR003",
      userName: "Mohammed Ali",
      email: "mohammed@blackstoneacademy.com",
      role: "Student",
      department: "Quran",
      status: "Inactive",
      createdDate: "20 Sep 2025",
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

  const roleFilter =
    !filters.role ||
    user.role === filters.role;

  const departmentFilter =
    !filters.department ||
    user.department === filters.department;

  const statusFilter =
    !filters.status ||
    user.status === filters.status;

  const loginDate = new Date(user.createdDate);

  const fromDateFilter =
    !filters.fromDate ||
    loginDate >= new Date(filters.fromDate);

  const toDateFilter =
    !filters.toDate ||
    loginDate <= new Date(filters.toDate);

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
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-600";
      case "Trial":
        return "bg-blue-100 text-blue-600";
      case "Inactive":
        return "bg-red-100 text-red-600";
      default:
        return "bg-yellow-100 text-yellow-600";
    }
  };

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

                <div
                  onClick={() => setShowFilter(true)}
                  className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
                >
                  <MdTune className="w-4 h-4" />
                  <span>Filter</span>
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

                        <td className="px-3 py-3 break-words  text-left">
                          <span
                            className={`inline-flex items-center justify-center w-[90px] h-6 rounded-md text-xs font-medium ${getStatusStyle(
                              user.role,
                            )}`}
                          >
                            {user.role}{" "}
                          </span>
                        </td>
                        <td className="px-3 py-3 break-words text-[11px] text-left">
                          {user.department}
                        </td>
                        <td className="px-3 py-3 break-words text-[11px] text-left">
                          {user.status}
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
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#444]"
                                onClick={() => {
                                  console.log("View", user.id);
                                  setOpenDropdownId(null);
                                  router.push(
                                    "/super-admin/ui/tenants/tenants_management",
                                  );
                                }}
                              >
                                Update Plans
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#444]"
                                onClick={() => {
                                  console.log("View", user.id);
                                  setOpenDropdownId(null);
                                  router.push(
                                    "/super-admin/ui/tenants/tenants_management",
                                  );
                                }}
                              >
                                View Details
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#444]"
                                onClick={() => {
                                  console.log("View", user.id);
                                  setOpenDropdownId(null);
                                  router.push(
                                    "/super-admin/ui/tenants/tenants_management",
                                  );
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

         <label className="block text-sm font-medium mb-2">
  User Name
</label>

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
  <label className="block text-sm font-medium mb-2">
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
    className="w-full dark:bg-[#2c2c2c] rounded-lg px-4 py-2.5"
  >
    <option value="">Select Status</option>
    <option value="Admin">Admin</option>
    <option value="Teacher">Teacher</option>
    <option value="Student">Student</option>
  </select>
</div>

       <div className="mb-4">
  <label className="block text-sm font-medium mb-2">
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
    className="w-full dark:bg-[#2c2c2c] rounded-lg px-4 py-2.5"
  >
    <option value="">Select Status</option>
    <option value="Administration">Administration</option>
    <option value="Arabic">Arabic</option>
    <option value="Quran">Quran</option>
  </select>
</div>
<div className="mb-4">
  <label className="block text-sm font-medium mb-2">
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
    className="w-full dark:bg-[#2c2c2c] rounded-lg px-4 py-2.5"
  >
    <option value="">Select Status</option>
    <option value="Active">Active</option>
    <option value="Inactive">Inactive</option>
  </select>
</div>
<div className="mb-5">
  <label className="block text-sm font-medium mb-2">
    Last Login
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
    </div>
  );
};

export default TenantUserTable;
