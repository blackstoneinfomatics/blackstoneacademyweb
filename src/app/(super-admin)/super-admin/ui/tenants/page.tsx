"use client";

import React, { useEffect, useState } from "react";
import TenantStats from "../../components/Tenant-Cards";
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout"
import { MdTune } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import Pagination from "@/components/Pagination";
import { useRouter } from "next/navigation";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import axios from "axios";



interface TenantType {
  tenantCode: string;
  tenantName: string;
  domain: string;
  phoneNumber: string;
  email: string;
  startDate: string;
  plan: string;
  users: number;
  renewalDate: string;
  status: string;
  state: string;
  country: string;
  city: string;
  pincode: string;
  isNew: boolean;
}

const NEW_TENANT_WINDOW_DAYS = 30;

const capitalizeFirst = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "Basic";

const formatDate = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const extractDomain = (value?: string) => {
  if (!value) return "—";

  try {
    return new URL(value.includes("://") ? value : `https://${value}`).hostname.replace("www.", "");
  } catch {
    return value;
  }
};

const page = () => {
  const router = useRouter();
const searchParams = useSearchParams();
const tenanttenantCode = searchParams.get("tenantCode");

const [tenants, setTenants] = useState<TenantType[]>([]);
useEffect(() => {
  const fetchTenants = async () => {
    try {
      const response = await axios.get("http://localhost:5001/tenant");
      const payload = Array.isArray(response?.data?.tenants)
        ? response.data.tenants
        : Array.isArray(response?.data)
          ? response.data
          : response?.data?.data
            ? response.data.data
            : response?.data
              ? [response.data]
              : [];

      const mappedTenants = payload.map((item: any, index: number): TenantType => {
        const createdRaw = item.createdDate || item.createdAt || "";
        const createdTime = createdRaw ? new Date(createdRaw).getTime() : NaN;
        const isNew =
          !Number.isNaN(createdTime) &&
          Date.now() - createdTime <= NEW_TENANT_WINDOW_DAYS * 24 * 60 * 60 * 1000;

        return {
          tenantCode: item.tenantCode || item.tenantJobCode || `TEN-${index + 1}`,
          tenantName: item.tenantName || item.organizationName || "N/A",
          domain: extractDomain(item.website || item.domain || item.emailId || ""),
          phoneNumber: item.mobileNumber || item.phoneNumber || "N/A",
          email: item.emailId || item.email || "N/A",
          startDate: formatDate(createdRaw),
          plan: capitalizeFirst(item.plan || "basic"),
          users: item.users || 0,
          renewalDate: formatDate(item.renewalDate || item.activeLicense?.expiryDate),
          status: item.status || "Active",
          state: item.state || "",
          country: item.country || "",
          city: item.city || "",
          pincode: item.postalCode || item.pincode || "",
          isNew,
        };
      });

      setTenants(mappedTenants);
    } catch (error) {
      console.error("Failed to fetch tenants", error);
    }
  };

  fetchTenants();
}, []);
const [openDropdowntenantCode, setOpenDropdowntenantCode] = useState<string | null>(null);
const [searchKeyword, setSearchKeyword] = useState("");
const [showFilter, setShowFilter] = useState(false);
const [currentPage, setCurrentPage] = useState(1);
const [activeTab, setActiveTab] = useState<"All" | "New">("All");
const [showEditModal, setShowEditModal] = useState(false);

const [selectedTenant, setSelectedTenant] = useState<TenantType | null>(null);
const [filters, setFilters] = useState({
  tenantName: "",
  domain: "",
  plan: "",
  fromDate: "",
  toDate: "",
  renewalFromDate: "",
  renewalToDate: "",
  status: "",
});

const itemsPerPage = 10;

const toggleDropdown = (tenantCode: string) => {
  setOpenDropdowntenantCode((prev) =>
    prev === tenantCode ? null : tenantCode
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

  const domainFilter =
    !filters.domain ||
    tenant.domain
      .toLowerCase()
      .includes(filters.domain.toLowerCase());

  const planFilter =
    !filters.plan ||
    tenant.plan === filters.plan;

  const statusFilter =
    !filters.status ||
    tenant.status === filters.status;

  const startDate = new Date(tenant.startDate);
  const renewalDate = new Date(tenant.renewalDate);

  const fromDateFilter =
    !filters.fromDate ||
    startDate >= new Date(filters.fromDate);

  const toDateFilter =
    !filters.toDate ||
    startDate <= new Date(filters.toDate);

  const renewalFromFilter =
    !filters.renewalFromDate ||
    renewalDate >= new Date(filters.renewalFromDate);

  const renewalToFilter =
    !filters.renewalToDate ||
    renewalDate <= new Date(filters.renewalToDate);

  const tabFilter = activeTab === "All" || tenant.isNew;

  return (
    search &&
    tenantFilter &&
    domainFilter &&
    planFilter &&
    statusFilter &&
    fromDateFilter &&
    toDateFilter &&
    renewalFromFilter &&
    renewalToFilter &&
    tabFilter
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
    count: tenants.filter((tenant) => tenant.isNew).length,
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#343434] text-slate-900 dark:text-white">
      <BaseSuperLayout>
        <SuperAdminHeader currentSection="Tenant Management" />

        <TenantStats />
<br />

        <div className="md:p-0 mx-auto w-full">
          <div className="flex flex-col h-full w-full justify-between">
            <div className="flex flex-col">
              {/* Tabs */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
                <div className="flex flex-wrap gap-4 font-semibold">
  {tabOptions.map(({ type, label, count }) => (
    <button
      key={type}
      onClick={() => setActiveTab(type)}
      className={
        activeTab === type
          ? "text-[#576CBC] text-[18px] relative pb-1"
          : "text-[#010E30] dark:text-white text-[18px]"
      }
      style={
        activeTab === type
          ? {
              position: "relative",
            }
          : {}
      }
    >
      {label} ({count})

      {activeTab === type && (
        <div className="absolute bottom-0 left-10 transform -translate-x-1/2 w-12 h-0.5 bg-[#576CBC] rounded-full" />
      )}
    </button>
  ))}
</div>
              </div>

              {/* Search + Filter */}
                <div className="w-full bg-[#FAFAFB] dark:bg-[#343434] rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by keyword"
                      className="bg-transparent outline-none text-[15px] w-52 py-3 dark:text-white dark:placeholder:text-gray-300"
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
                        "Tenant Name",
                        "Domain",
                        "Phone Number",
                        "Email",
                        "Start Date",
                        "Plan",
                        "User",
                        "Renewal Date",
                        "Tenant Status",
                        "Action",
                      ].map((header, tenantCodex) => (
                        <th
                          key={tenantCodex}
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
        ? "bg-[#fff] dark:bg-[#343434]"
        : "bg-[#F8F8F8] dark:bg-[#343434]";

    return (
      <tr
        key={tenant.tenantCode}
        className={`text-[10px] ${rowBgClass}`}
      >
        <td className="px-3 py-3 break-words text-[11px] dark:text-white">
          {tenant.tenantName}
        </td>

        <td className="px-3 py-3 text-[#3D8FDE] font-medium break-words text-[11px] text-left dark:text-sky-300">
          {tenant.domain}
        </td>

        <td className="px-3 py-3 break-words text-[11px] text-left dark:text-white">
          {tenant.phoneNumber}
        </td>

        <td className="px-3 py-3 break-words text-[11px] text-left dark:text-white">
          {tenant.email}
        </td>

        <td className="px-3 py-3 break-words text-[11px] text-left dark:text-white">
          {tenant.startDate}
        </td>

       <td className="px-4 py-4  text-left">
  <span
    className={`inline-flex items-center justify-center w-[90px] h-8 rounded-md text-xs font-medium ${getPlanStyle(
      tenant.plan
    )}`}
  >
    {tenant.plan}
  </span>
</td>

        <td className="px-3 py-3 break-words text-[11px] text-left dark:text-white">
          {tenant.users}
        </td>

        <td className="px-3 py-3 break-words text-[11px] text-left dark:text-white">
          {tenant.renewalDate}
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

       <td className="px-3 py-3 text-left relative text-[12px]">
  <button
    onClick={() => toggleDropdown(tenant.tenantCode)}
    className="text-gray-500 hover:text-gray-700"
  >
    <BsThreeDotsVertical />
  </button>

  {openDropdowntenantCode === tenant.tenantCode && (
    <div className="absolute right-0 top-8 w-32 bg-white dark:bg-[#343434] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
      <button
        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#444]"
      onClick={() => {
  setOpenDropdowntenantCode(null);
  router.push(
    `/super-admin/ui/tenants/tenants_management?tenantCode=${tenant.tenantCode}`
  );
}}
      >
        View
      </button>
       <button
  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#444]"
  onClick={() => {
    setSelectedTenant(tenant);
    setShowEditModal(true);
    setOpenDropdowntenantCode(null);
  }}
>
  Edit

 
</button>
      <button
        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-[#444]"
        onClick={() => {
          setOpenDropdowntenantCode(null);
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
      className="bg-white dark:bg-[#343434] p-6 rounded-2xl shadow-lg w-[500px] flex flex-col z-50"
      onSubmit={(e) => {
        e.preventDefault();
        setShowFilter(false);
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg dark:text-white">Filter by</h2>
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
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-[#343434] dark:text-white text-[15px]"
          placeholder="Enter tenant name..."
        />
      </div>
<div className="mb-4">
  <label className="block text-sm font-medium mb-2">
    Domain
  </label>

  <input
    type="text"
    value={filters.domain}
    onChange={(e) =>
      setFilters((f) => ({
        ...f,
        domain: e.target.value,
      }))
    }
    placeholder="blackstoneacademy.com"
    className="w-full border border-[#D5D9E2] dark:bg-[#2c2c2c] dark:border-gray-600 rounded-lg px-4 py-2.5  dark:text-white"
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
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-[#343434] dark:text-white text-[15px]"
        >
          <option value="">Select Plan</option>
          <option value="Basic">Basic</option>
          <option value="Standard">Standard</option>
          <option value="Premium">Premium</option>
        </select>
      </div>
<div className="mb-4">
  <label className="block text-sm font-medium mb-2">
    Date
  </label>

  <div className="grtenantCode grtenantCode-cols-2 gap-3">

    <input
      type="date"
      value={filters.fromDate}
      onChange={(e) =>
        setFilters((f) => ({
          ...f,
          fromDate: e.target.value,
        }))
      }
      className="border border-[#D5D9E2] dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-[#343434] dark:text-white"
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
      className="border border-[#D5D9E2] dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-[#343434] dark:text-white"
    />

  </div>
</div>
<div className="mb-4">
  <label className="block text-sm font-medium mb-2">
    Renewal Date
  </label>

  <div className="grtenantCode grtenantCode-cols-2 gap-3">

    <input
      type="date"
      value={filters.renewalFromDate}
      onChange={(e) =>
        setFilters((f) => ({
          ...f,
          renewalFromDate: e.target.value,
        }))
      }
      className="border border-[#D5D9E2] dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-[#343434] dark:text-white"
    />

    <input
      type="date"
      value={filters.renewalToDate}
      onChange={(e) =>
        setFilters((f) => ({
          ...f,
          renewalToDate: e.target.value,
        }))
      }
      className="border border-[#D5D9E2] dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-[#343434] dark:text-white"
    />

  </div>
</div>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          Tenant Status
        </label>

        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              status: e.target.value,
            }))
          }
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-[#343434] dark:text-white text-[15px]"
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
    domain: "",
    plan: "",
    fromDate: "",
    toDate: "",
    renewalFromDate: "",
    renewalToDate: "",
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

 {showEditModal && selectedTenant && (
  <div className="  fixed inset-0 bg-black/40 flex justify-center items-center z-50 ">

    <div className="bg-white dark:bg-[#2C2C2C] rounded-2xl w-[900px] max-h-[90vh] overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-semibold">
          Tenant Information
        </h2>

        <button
          onClick={() => setShowEditModal(false)}
          className="text-2xl"
        >
          ×
        </button>

      </div>

<div className="grid grid-cols-2 gap-5">
        {/* Tenant Name */}

        <div>
          <label className="text-sm font-medium">
            Tenant Name
          </label>

          <input
            className="w-full border rounded-lg px-4 py-2 mt-1"
            value={selectedTenant.tenantName}
            onChange={(e) =>
              setSelectedTenant({
                ...selectedTenant,
                tenantName: e.target.value,
              })
            }
          />
        </div>

        {/* Domain */}

        <div>
          <label className="text-sm font-medium">
            Domain
          </label>

          <input
            className="w-full border rounded-lg px-4 py-2 mt-1"
            value={selectedTenant.domain}
            onChange={(e) =>
              setSelectedTenant({
                ...selectedTenant,
                domain: e.target.value,
              })
            }
          />
        </div>

        {/* Email */}

        <div>
          <label>Email</label>

          <input
            className="w-full border rounded-lg px-4 py-2 mt-1"
            value={selectedTenant.email}
            onChange={(e) =>
              setSelectedTenant({
                ...selectedTenant,
                email: e.target.value,
              })
            }
          />
        </div>

        {/* Phone */}

        <div>
          <label>Phone Number</label>

          <input
            className="w-full border rounded-lg px-4 py-2 mt-1"
            value={selectedTenant.phoneNumber}
            onChange={(e) =>
              setSelectedTenant({
                ...selectedTenant,
                phoneNumber: e.target.value,
              })
            }
          />
        </div>

  <div>
          <label>Country</label>

          <input
            className="w-full border rounded-lg px-4 py-2 mt-1"
            value={selectedTenant.country}
            onChange={(e) =>
              setSelectedTenant({
                ...selectedTenant,
                country: e.target.value,
              })
            }
          />
        </div>  <div>
          <label>State</label>

          <input
            className="w-full border rounded-lg px-4 py-2 mt-1"
            value={selectedTenant.state}
            onChange={(e) =>
              setSelectedTenant({
                ...selectedTenant,
                state: e.target.value,
              })
            }
          />
        </div>  <div>
          <label>City</label>

          <input
            className="w-full border rounded-lg px-4 py-2 mt-1"
            value={selectedTenant.city}
            onChange={(e) =>
              setSelectedTenant({
                ...selectedTenant,
                city: e.target.value,
              })
            }
          />
        </div>  <div>
          <label>Pincode</label>

          <input
            className="w-full border rounded-lg px-4 py-2 mt-1"
            value={selectedTenant.pincode}
            onChange={(e) =>
              setSelectedTenant({
                ...selectedTenant,
                pincode: e.target.value,
              })
            }
          />
        </div>

      </div>

      {/* Address */}

      <div className="mt-5">

        <label>Address</label>

        <textarea
          rows={4}
          className="w-full border rounded-lg px-4 py-2 mt-1"
        />

      </div>

      {/* Buttons */}

      <div className="flex justify-end gap-3 mt-8">

        <button
          onClick={() => setShowEditModal(false)}
          className="border border-[#576CBC] text-[#576CBC] px-6 py-2 rounded-lg"
        >
          Reset
        </button>

        <button
          className="bg-[#576CBC] text-white px-6 py-2 rounded-lg"
          onClick={() => {
            setTenants((prev) =>
              prev.map((item) =>
                item.tenantCode === selectedTenant.tenantCode
                  ? selectedTenant
                  : item
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
      </BaseSuperLayout>
    </div>
    
  );
};

export default page;
