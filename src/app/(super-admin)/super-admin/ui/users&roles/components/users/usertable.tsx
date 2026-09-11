"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { MdTune, MdCancel, MdCheckCircle } from "react-icons/md";
import axios from "axios";
import TenantListFilterForm, {
  TenantFilterValues,
} from "./TenantListFilterForm";

interface TenantItem {
  _id: string;
  tenantCode: string;
  tenantName: string;
  organizationName: string;
  domain: string;
  phoneNumber: string;
  mobileNumber: string;
  email: string;
  emailId: string;
  startDate: string;
  createdDate: string;
  plan: string;
  users: number;
  renewalDate: string;
  status: string;
  website: string;
  gstNo: string;
  panNo: string;
  faxNo: string;
  state: string;
  country: string;
  city: string;
  street: string;
  postalCode: string;
  timeZone: string;
  currency: string;
  tenantLogo: string;
}

interface AnalyticsData {
  total: number;
  active: number;
  inactive: number;
  totalGrowth?: number;
  activeGrowth?: number;
  inactiveGrowth?: number;
}

const Usertable = () => {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [userItems, setUserItems] = useState<TenantItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    total: 0,
    active: 0,
    inactive: 0,
    totalGrowth: 14,
    activeGrowth: 14,
    inactiveGrowth: -5,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [showFilterForm, setShowFilterForm] = useState(false);
  const [filterValues, setFilterValues] = useState<TenantFilterValues>({
    tenantName: "",
    startDate: "",
    plan: "",
    renewalDate: "",
    status: "",
  });
  const openMenuRef = useRef<HTMLTableCellElement | null>(null);
  const router = useRouter();

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Extract domain from URL
  const extractDomain = (value?: string) => {
    if (!value) return "—";
    try {
      return new URL(
        value.includes("://") ? value : `https://${value}`,
      ).hostname.replace("www.", "");
    } catch {
      return value;
    }
  };

  // Capitalize first letter
  const capitalizeFirst = (value: string) => {
    if (!value) return "Basic";
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  };

  // Fetch tenant analytics
  const fetchTenantAnalytics = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5001/tenants/analytics/cards",
      );

      console.log("Analytics API Response:", response.data);

      if (response.data.success) {
        const data = response.data.data;
        setAnalytics({
          total: data.total || 0,
          active: data.active || 0,
          inactive: data.inactive || 0,
          totalGrowth: data.totalGrowth || 14,
          activeGrowth: data.activeGrowth || 14,
          inactiveGrowth: data.inactiveGrowth || -5,
        });
      }
    } catch (error) {
      console.error("Error fetching tenant analytics:", error);
    }
  };

  // Fetch tenant list from API
  const fetchTenantList = async (
    search: string = searchTerm,
    page = 1,
    filters: TenantFilterValues = filterValues,
  ) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: "5",
      });
      const tenantName = filters.tenantName.trim() || search.trim();
      if (tenantName) params.set("search", tenantName);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.plan) params.set("plan", filters.plan);
      if (filters.renewalDate) params.set("renewalDate", filters.renewalDate);
      if (filters.status) params.set("status", filters.status);

      const response = await axios.get(
        `http://localhost:5001/tenant?${params.toString()}`,
      );

      console.log("Tenant List API Response:", response.data);

      // Extract tenants from response
      let tenants = [];
      let total = 0;
      const pagination =
        response.data?.data?.pagination ?? response.data?.pagination;

      if (response.data?.tenants) {
        tenants = response.data.tenants;
        total = response.data.total || response.data.tenants.length;
      } else if (response.data?.data?.tenants) {
        tenants = response.data.data.tenants;
        total = response.data.data.total || response.data.data.tenants.length;
      } else if (Array.isArray(response.data)) {
        tenants = response.data;
        total = response.data.length;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        tenants = response.data.data;
        total = response.data.data.length;
      } else {
        tenants = response.data?.data ? [response.data.data] : [];
        total = tenants.length;
      }

      console.log("Extracted tenants:", tenants);

      // Map tenants to match the table structure
      const mappedTenants = tenants.map((item: any) => {
        const createdDate = item.createdDate || item.createdAt || "";
        const planName = item.plan || item.planName || "basic";
        const renewalDate =
          item.activeLicense?.expiryDate || item.renewalDate || "";

        return {
          _id: item._id || "",
          tenantCode: item.tenantCode || item.tenantJobCode || "N/A",
          tenantName: item.tenantName || item.organizationName || "N/A",
          organizationName: item.organizationName || "",
          domain: extractDomain(
            item.website || item.domainName || item.domain || "",
          ),
          phoneNumber: item.phoneNumber || item.mobileNumber || "N/A",
          mobileNumber: item.mobileNumber || "",
          email: item.emailId || item.email || "N/A",
          emailId: item.emailId || "",
          startDate: formatDate(createdDate),
          createdDate: createdDate,
          plan: capitalizeFirst(planName),
          users: 0, // Default value as not in API response
          renewalDate: formatDate(renewalDate),
          filterStartDate: createdDate,
          filterRenewalDate: renewalDate,
          status: item.status || "Active",
          website: item.website || "",
          gstNo: item.gstNo || "N/A",
          panNo: item.panNo || "N/A",
          faxNo: item.faxNo || "N/A",
          state: item.state || "",
          country: item.country || "",
          city: item.city || "",
          street: item.street || "",
          postalCode: item.postalCode || "",
          timeZone: item.timeZone || "",
          currency: item.currency || "",
          tenantLogo: item.tenantLogo || "",
        };
      });

      const normalizedPlan = filters.plan.trim().toLowerCase();
      const filteredTenants = mappedTenants.filter((tenant: any) => {
        const matchesName = filters.tenantName.trim()
          ? tenant.tenantName
              .toLowerCase()
              .includes(filters.tenantName.trim().toLowerCase())
          : true;
        const matchesStartDate = filters.startDate
          ? tenant.filterStartDate.startsWith(filters.startDate)
          : true;
        const matchesPlan = normalizedPlan
          ? tenant.plan.toLowerCase() === normalizedPlan ||
            tenant.plan.toLowerCase().replace(/\s+/g, "-") === normalizedPlan
          : true;
        const matchesRenewalDate = filters.renewalDate
          ? tenant.filterRenewalDate.startsWith(filters.renewalDate)
          : true;
        const matchesStatus = filters.status
          ? tenant.status.toUpperCase() === filters.status.toUpperCase()
          : true;

        return (
          matchesName &&
          matchesStartDate &&
          matchesPlan &&
          matchesRenewalDate &&
          matchesStatus
        );
      });

      const filteredTotal =
        filters.tenantName ||
        filters.startDate ||
        filters.plan ||
        filters.renewalDate ||
        filters.status
          ? filteredTenants.length
          : (pagination?.totalRecords ?? total);
      const pageSize = 5;
      const effectiveTotalPages = Math.max(
        1,
        Math.ceil(filteredTotal / pageSize),
      );
      const effectivePage = Math.min(page, effectiveTotalPages);
      const pageItems = filteredTenants.slice(
        (effectivePage - 1) * pageSize,
        effectivePage * pageSize,
      );

      setUserItems(pageItems);
      setTotalRecords(filteredTotal);
      setCurrentPage(effectivePage);
      setTotalPages(effectiveTotalPages);
      setHasNextPage(effectivePage < effectiveTotalPages);
      setHasPreviousPage(effectivePage > 1);
    } catch (error) {
      console.error("Error fetching tenant list:", error);
      setUserItems([]);
      setTotalRecords(0);
      setCurrentPage(1);
      setTotalPages(1);
      setHasNextPage(false);
      setHasPreviousPage(false);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTenantAnalytics();
    fetchTenantList("", 1, filterValues);
  }, []);

  // Handle search
  const handleSearch = () => {
    fetchTenantList(searchTerm, 1, filterValues);
  };

  const handleFilterApply = (values: TenantFilterValues) => {
    setFilterValues(values);
    setSearchTerm(values.tenantName);
    setShowFilterForm(false);
    fetchTenantList(values.tenantName, 1, values);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchTenantList(searchTerm, page, filterValues);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openMenu !== null &&
        openMenuRef.current &&
        !openMenuRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  // Helper to get status badge styles
  const getStatusBadgeStyles = (status: string) => {
    if (status === "ACTIVE" || status === "Active") {
      return "bg-[#ECFDF3] text-[#377E36]";
    } else {
      return "bg-[#FDECEC] text-[#D34645]";
    }
  };

  // Helper to get plan badge styles
  const getPlanBadgeStyles = (plan: string) => {
    if (plan === "Standard") {
      return "bg-[#2668EF24] text-[#2668EF]";
    } else if (plan === "Premium" || plan === "Max-Pro 2") {
      return "bg-[#585BDC24] text-[#585BDC]";
    } else if (plan === "Basic") {
      return "bg-gray-100 text-gray-600";
    } else {
      return "bg-[#2668EF24] text-[#2668EF]";
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FC] dark:bg-[#1F1F1F] p-2">
      {/* Main Container */}
      <div className="rounded-xl bg-[#F4F6FC] dark:bg-[#1F1F1F]">
        {showFilterForm && (
          <TenantListFilterForm
            values={filterValues}
            onClose={() => setShowFilterForm(false)}
            onApply={handleFilterApply}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2 mt-3">
          {/* Total Tenants */}
          <div
            className="
              bg-white
              dark:bg-[#343434]
              rounded-xl
              shadow-[0_4px_15px_rgba(0,0,0,0.06)]
              px-4
              py-4
              min-h-[112px]
            "
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  w-11
                  h-11
                  rounded-full
                  bg-[#EEE8FF]
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <img
                  src="/assets/images/users.svg"
                  alt="User Icon"
                  className="text-[#7047FF]"
                />
              </div>

              <div>
                <p className="text-[14px] text-[#7047FF] font-medium">
                  Total Tenants
                </p>

                <p className="text-[18px] font-semibold text-[#303030] dark:text-white mt-1">
                  {analytics.total}
                </p>
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 mt-1">
              <span
                className={`text-[13px] font-medium ${analytics.totalGrowth && analytics.totalGrowth > 0 ? "text-[#377E36]" : "text-[#D34645]"}`}
              >
                {analytics.totalGrowth && analytics.totalGrowth > 0 ? "↑" : "↓"}{" "}
                {Math.abs(analytics.totalGrowth || 0)}%
              </span>

              <span className="text-[12px] text-gray-500">vs last Month</span>
            </div>
          </div>

          {/* Active Tenants */}
          <div
            className="
              bg-white
              dark:bg-[#343434]
              rounded-xl
              shadow-[0_4px_15px_rgba(0,0,0,0.06)]
              px-4
              py-4
              min-h-[102px]
            "
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  w-11
                  h-11
                  rounded-full
                  bg-[#E4F7EA]
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <MdCheckCircle className="text-[#45BD67] text-[23px]" />
              </div>

              <div>
                <p className="text-[14px] text-[#45BD67] font-medium">
                  Active Tenants
                </p>

                <p className="text-[18px] font-semibold text-[#303030] dark:text-white mt-1">
                  {analytics.active}
                </p>
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 mt-1">
              <span
                className={`text-[13px] font-medium ${analytics.activeGrowth && analytics.activeGrowth > 0 ? "text-[#377E36]" : "text-[#D34645]"}`}
              >
                {analytics.activeGrowth && analytics.activeGrowth > 0
                  ? "↑"
                  : "↓"}{" "}
                {Math.abs(analytics.activeGrowth || 0)}%
              </span>

              <span className="text-[12px] text-gray-500">vs last Month</span>
            </div>
          </div>

          {/* Inactive Tenants */}
          <div
            className="
              bg-white
              dark:bg-[#343434]
              rounded-xl
              shadow-[0_4px_15px_rgba(0,0,0,0.06)]
              px-4
              py-4
              min-h-[102px]
            "
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  w-11
                  h-11
                  rounded-full
                  bg-[#FCE6E6]
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <MdCancel className="text-[#E53935] text-[23px]" />
              </div>

              <div>
                <p className="text-[14px] text-[#E53935] font-medium">
                  Inactive Tenants
                </p>

                <p className="text-[18px] font-semibold text-[#303030] dark:text-white mt-1">
                  {analytics.inactive}
                </p>
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 mt-1">
              <span
                className={`text-[13px] font-medium ${analytics.inactiveGrowth && analytics.inactiveGrowth > 0 ? "text-[#377E36]" : "text-[#D34645]"}`}
              >
                {analytics.inactiveGrowth && analytics.inactiveGrowth > 0
                  ? "↑"
                  : "↓"}{" "}
                {Math.abs(analytics.inactiveGrowth || 0)}%
              </span>

              <span className="text-[12px] text-gray-500">vs last Month</span>
            </div>
          </div>
        </div>

        <div
          className="
            bg-white
            dark:bg-[#343434]
            rounded-xl
            shadow-[0_4px_15px_rgba(0,0,0,0.05)]
            mt-3
            overflow-hidden
            mx-2
          "
        >
          {/* Section Title */}
          <div className="px-3 pt-3 pb-2">
            <h2 className="text-[16px] font-semibold text-[#24324B] dark:text-white">
              All Tenants
            </h2>
          </div>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              bg-[#FAFAFB]
              dark:bg-[#2E2E2E]
            "
          >
            {/* Search */}
            <div
              className="
                flex
                items-center
                px-3
                h-10
                border-r
                border-[#E7EAF3]
              "
            >
              <FiSearch className="text-gray-400 mr-2 text-[15px]" />

              <input
                placeholder="Search by keyword"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="
                  w-full
                  outline-none
                  bg-transparent
                  text-[11px]
                  text-gray-600
                  dark:text-gray-200
                  placeholder:text-gray-400
                "
              />
            </div>

            {/* Filter */}
            <button
              type="button"
              onClick={() => setShowFilterForm(true)}
              className="flex items-center justify-between px-3 h-10 border-r border-[#E7EAF3] text-left"
            >
              <div className="flex items-center">
                <MdTune className="text-gray-400 mr-2 text-[16px]" />

                <span className="text-[11px] text-gray-400">Filter</span>
              </div>

              <FiChevronDown className="text-gray-400 text-[14px]" />
            </button>

            {/* Count */}
            <div className="flex items-center px-4 h-10">
              <span className="text-[11px] text-gray-400">
                Showing {userItems.length} Of {totalRecords || analytics.total}
              </span>
            </div>
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-xs border-collapse">
              {/* Table Header */}
              <thead
                className="
                  bg-[#4C6993]
                  text-white
                  text-[13px]
                  dark:bg-[#44699D]
                "
              >
                <tr>
                  {[
                    "Tenants Name",
                    "Domain",
                    "Phone Number",
                    "Email",
                    "Start Date",
                    "Plan",
                    "User",
                    "Renewal Date",
                    "Tenant Status",
                    "Action",
                  ].map((header) => (
                    <th
                      key={header}
                      className="
                        py-3
                        px-3
                        whitespace-nowrap
                        font-medium
                        text-left
                        text-[11px]
                        border-r
                        border-[#466993]
                      "
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="p-5 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : userItems.length > 0 ? (
                  userItems.map((item, index) => (
                    <tr
                      key={index}
                      className="
                        text-[11px]
                        odd:bg-[#F8F8F8]
                        even:bg-white
                        dark:odd:bg-[#2C2C2C]
                        dark:even:bg-[#303030]
                      "
                    >
                      {/* Tenant Name */}
                      <td className="py-3 px-3 font-medium text-[#24324B] dark:text-white whitespace-nowrap">
                        {item.tenantName}
                      </td>

                      {/* Domain */}
                      <td className="py-3 px-3 text-[#24324B] dark:text-gray-200 whitespace-nowrap">
                        {item.domain}
                      </td>

                      {/* Phone Number */}
                      <td className="py-3 px-3 text-[#24324B] dark:text-gray-200 whitespace-nowrap">
                        {item.phoneNumber}
                      </td>

                      {/* Email */}
                      <td className="py-3 px-3 whitespace-nowrap text-[#24324B] dark:text-gray-200">
                        {item.email}
                      </td>

                      {/* Start Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-[#24324B] dark:text-gray-200">
                        {item.startDate}
                      </td>

                      {/* Plan */}
                      <td className="py-3 px-3">
                        <span
                          className={`
                            inline-flex
                            items-center
                            px-3
                            py-1
                            rounded-md
                            text-[9px]
                            font-medium
                            ${getPlanBadgeStyles(item.plan)}
                          `}
                        >
                          {item.plan}
                        </span>
                      </td>

                      {/* Users */}
                      <td className="py-3 px-3 whitespace-nowrap text-[#24324B] dark:text-gray-200">
                        {item.users || 0}
                      </td>

                      {/* Renewal Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-[#24324B] dark:text-gray-200">
                        {item.renewalDate}
                      </td>

                      {/* Tenant Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`
                            inline-flex
                            items-center
                            px-3
                            py-1
                            rounded-md
                            text-[9px]
                            font-medium
                            ${getStatusBadgeStyles(item.status)}
                          `}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td
                        className="py-3 px-3 relative"
                        ref={openMenu === index ? openMenuRef : null}
                      >
                        <button
                          onClick={() =>
                            setOpenMenu(openMenu === index ? null : index)
                          }
                          className="
                            p-1
                            rounded-md
                            hover:bg-gray-100
                            dark:hover:bg-gray-700
                          "
                        >
                          <BsThreeDotsVertical className="text-[14px]" />
                        </button>

                        {openMenu === index && (
                          <div
                            className="
                              absolute
                              right-3
                              top-full
                              mt-1
                              w-28
                              bg-white
                              dark:bg-[#2C2C2C]
                              rounded-lg
                              shadow-lg
                              border
                              border-gray-100
                              dark:border-gray-700
                              z-50
                            "
                          >
                            <button
                              className="
                                w-full
                                text-center
                                px-3
                                py-2
                                text-[10px]
                                hover:bg-gray-100
                                dark:hover:bg-gray-700
                                rounded-t-lg
                              "
                              onClick={() => {
                                setOpenMenu(null);
                                router.push(
                                  `/super-admin/ui/users&roles/all_tenant?tenantCode=${encodeURIComponent(
                                    item.tenantCode,
                                  )}`,
                                );
                              }}
                            >
                              View Details
                            </button>

                            <button
                              className="
                                w-full
                                text-center
                                px-3
                                py-2
                                text-[10px]
                                hover:bg-gray-100
                                dark:hover:bg-gray-700
                                rounded-b-lg
                              "
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="p-5 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end items-center gap-1 px-3 py-4">
            <button
              type="button"
              disabled={!hasPreviousPage || loading}
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E7EB] bg-[#F5F5F2] text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-[23px]">‹</span>
            </button>
            <span className="min-w-8 text-center text-[11px] text-[#203F78]">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={!hasNextPage || loading}
              onClick={() => handlePageChange(currentPage + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E7EB] bg-[#F5F5F2] text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-[23px]">›</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usertable;
