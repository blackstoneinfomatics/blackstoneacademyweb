"use client";

import React, { useEffect, useState } from "react";
import SupervisorHeader from "@/app/(tenant)/modules/users/supervisor/components/supervisorHeader";
import BaseLayout3 from "@/app/(tenant)/modules/users/supervisor/components/BaseLayout3";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import Pagination from "@/components/Pagination";
import { useRouter } from "next/navigation";

interface TenantType {
  id: string;
  tenantName: string;
  domain: string;
  phoneNumber: string;
  email: string;
  startDate: string;
  plan: string;
  users: number;
  renewalDate: string;
  status: string;
}

const TenantUserTable = () => {
  const router = useRouter();
const [tenants, setTenants] = useState([
  {
    id: "TEN001",
    tenantName: "Blackstone Academy",
    domain: "blackstoneacademy.com",
    phoneNumber: "1234567890",
    email: "blackstone@gmail.com",
    startDate: "Sep 12, 2023",
    plan: "Standard",
    users: 570,
    renewalDate: "Sep 12, 2026",
    status: "Active",
  },
  {
    id: "TEN002",
    tenantName: "Blackstone Institute",
    domain: "blackstone.com",
    phoneNumber: "1234567890",
    email: "blackstone@gmail.com",
    startDate: "Sep 12, 2023",
    plan: "Premium",
    users: 345,
    renewalDate: "Sep 12, 2026",
    status: "Trial",
  },
  {
    id: "TEN003",
    tenantName: "Future Academy",
    domain: "future.com",
    phoneNumber: "1234567890",
    email: "future@gmail.com",
    startDate: "Sep 12, 2023",
    plan: "Basic",
    users: 420,
    renewalDate: "Sep 12, 2026",
    status: "Inactive",
  },
]);
const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
const [searchKeyword, setSearchKeyword] = useState("");
const [showFilter, setShowFilter] = useState(false);
const [currentPage, setCurrentPage] = useState(1);
const [activeTab, setActiveTab] = useState<"All" | "New">("All");
const [filters, setFilters] = useState({
  tenantName: "",
  plan: "",
  status: "",
});

const itemsPerPage = 10;

const toggleDropdown = (id: string) => {
  setOpenDropdownId((prev) =>
    prev === id ? null : id
  );
}; 

const filteredTenants = tenants.filter((tenant) => {
  const search =
    tenant.tenantName
      .toLowerCase()
      .includes(searchKeyword.toLowerCase()) ||
    tenant.domain
      .toLowerCase()
      .includes(searchKeyword.toLowerCase()) ||
    tenant.email
      .toLowerCase()
      .includes(searchKeyword.toLowerCase());

  const tenantFilter =
    !filters.tenantName ||
    tenant.tenantName
      .toLowerCase()
      .includes(filters.tenantName.toLowerCase());

  const planFilter =
    !filters.plan ||
    tenant.plan === filters.plan;

  const statusFilter =
    !filters.status ||
    tenant.status === filters.status;

  return (
    search &&
    tenantFilter &&
    planFilter &&
    statusFilter
  );
});

const paginatedTenants = filteredTenants.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

const totalPages = Math.ceil(
  filteredTenants.length / itemsPerPage
);

const tabOptions = [
  {
    type: "All" as const,
    label: "All Tenants",
    count: tenants.length,
  },
  {
    type: "New" as const,
    label: "New Tenants",
    count: 5,
  },
];
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

const getPlanStyle = (plan: string) => {
  switch (plan) {
    case "Premium":
      return "bg-purple-100 text-purple-600";

    case "Standard":
      return "bg-blue-100 text-blue-600";

    case "Basic":
      return "bg-cyan-100 text-cyan-600";

    default:
      return "bg-gray-100 text-gray-600";
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
                <div className="flex flex-wrap gap-4 font-semibold">
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
  Showing {filteredTenants.length} of {tenants.length}
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
  {paginatedTenants.map((tenant, index) => {
    const rowBgClass =
      index % 2 === 0
        ? "bg-[#fff] dark:bg-[#2C2C2C]"
        : "bg-[#F8F8F8] dark:bg-[#303030]";

    return (
      <tr
        key={tenant.id}
        className={`text-[10px] ${rowBgClass}`}
      >
        <td className="px-3 py-3 break-words text-[11px]">
          {tenant.tenantName}
        </td>

        <td className="px-3 py-3 break-words text-[11px] text-left">
          {tenant.email}
        </td>

        <td className="px-3 py-3 break-words text-[11px] text-left">
          {tenant.startDate}
        </td>


        <td className="px-3 py-3 break-words text-left">
  <span
    className={`inline-flex items-center justify-center w-[90px] h-8 rounded-md text-xs font-medium ${getStatusStyle(
      tenant.status
    )}`}
  >
    {tenant.status}
  </span>
        </td>
         <td className="px-3 py-3 break-words text-[11px] text-left">
          {tenant.renewalDate}
        </td>

       <td className="px-3 py-3 text-left relative text-[12px]">
  <button
    onClick={() => toggleDropdown(tenant.id)}
    className="text-gray-500 hover:text-gray-700"
  >
    <BsThreeDotsVertical />
  </button>

  {openDropdownId === tenant.id && (
    <div className="absolute right-0 top-8 w-32 bg-white dark:bg-[#343434] border rounded-md shadow-lg z-50">
      <button
        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#444]"
         onClick={() => {
    console.log("View", tenant.id);
    setOpenDropdownId(null);
    router.push(
      "/super-admin/ui/tenants/tenants_management"
    );
  }}
      >
        View
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

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
          Tenant Name
        </label>
        <input
          type="text"
          value={filters.tenantName}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              tenantName: e.target.value,
            }))
          }
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-[#23272f] text-[15px]"
          placeholder="Enter tenant name..."
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Plan
        </label>

        <select
          value={filters.plan}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              plan: e.target.value,
            }))
          }
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-[#23272f] text-[15px]"
        >
          <option value="">Select Plan</option>
          <option value="Basic">Basic</option>
          <option value="Standard">Standard</option>
          <option value="Premium">Premium</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
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
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-[#23272f] text-[15px]"
        >
          <option value="">Select Status</option>
          <option value="Active">Active</option>
          <option value="Trial">Trial</option>
          <option value="Inactive">Inactive</option>
          <option value="Expiring Soon">Expiring Soon</option>
        </select>
      </div>

      <div className="flex gap-4 mt-auto justify-end">
        <button
          type="button"
          className="border border-[#576CBC] bg-white text-[#576CBC] rounded-lg px-6 py-2 font-semibold"
          onClick={() =>
            setFilters({
              tenantName: "",
              plan: "",
              status: "",
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

    <div
      className="fixed inset-0"
      onClick={() => setShowFilter(false)}
    />
  </div>
)}
    
    </div>
  );
};

export default TenantUserTable;
