"use client";

import React, { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
} from "lucide-react";
import { RiSchoolFill } from "react-icons/ri";

import { PiInfoFill } from "react-icons/pi";

const recentItems = [
  {
    planName: "Blackstone Academy",
    price: "$ 8,500",
    billingCycle: "Month",
    CreatedDate: "2026-12-31",
    features: 250,
    subscribedTenants: 250,
    subscriptionstatus: "Active",
    paymentstatus: "Paid",
  },
  {
    planName: "Srashtalk",
    price: "$ 4,300",
    billingCycle: "Month",
    CreatedDate: "2026-10-15",
    features: 120,
    subscribedTenants: 120,
    subscriptionstatus: "Expired",
    paymentstatus: "Pending",
  },
  {
    planName: "Zotal AI",
    price: "$ 6,500",
    billingCycle: "Year",
    CreatedDate: "2027-01-20",
    features: 500,
    subscribedTenants: 500,
    subscriptionstatus: "Active",
    paymentstatus: "Failed",
  },
  {
    planName: "ERP School",
    price: "$ 11,000",
    billingCycle: "Year",
    CreatedDate: "2026-09-10",
    features: 180,
    subscribedTenants: 180,
    subscriptionstatus: "Expiting Soon",
    paymentstatus: "Pending",
  },
  {
    planName: "EduPortal",
    price: "$ 9,500",
    billingCycle: "Month",
    CreatedDate: "2026-11-25",
    features: 320,
    subscribedTenants: 320,
    subscriptionstatus: "Active",
    paymentstatus: "Paid",
  },
];

type FilterState = {
  tenantName: string;
  plan: string;
  billingCycle: string;
  fromDate: string;
  toDate: string;
  subscriptionstatus: string;
  paymentstatus: string;
};

const INITIAL_FILTERS: FilterState = {
  tenantName: "",
  plan: "All",
  billingCycle: "All",
  fromDate: "",
  toDate: "",
  subscriptionstatus: "All",
  paymentstatus: "All",
};

const applyFilters = (
  items: typeof recentItems,
  search: string,
  filters: FilterState,
) => {
  const term = search.toLowerCase().trim();

  return items.filter((item) => {
    const matchesSearch =
      !term ||
      [
        item.planName,
        item.price,
        item.billingCycle,
        item.CreatedDate,
        item.subscriptionstatus,
        item.paymentstatus,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);

    const matchesTenantName =
      !filters.tenantName ||
      item.planName.toLowerCase().includes(filters.tenantName.toLowerCase()) ||
      item.price.toLowerCase().includes(filters.tenantName.toLowerCase());

    const matchesPlan =
      filters.plan === "All" || item.planName === filters.plan;
    const matchesBillingCycle =
      filters.billingCycle === "All" ||
      item.billingCycle === filters.billingCycle;
    const matchesStatus =
      filters.subscriptionstatus === "All" ||
      item.subscriptionstatus === filters.subscriptionstatus;
    const matchesPayment =
      filters.paymentstatus === "All" ||
      item.paymentstatus === filters.paymentstatus;

    const rowDate = new Date(item.CreatedDate);
    const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
    const toDate = filters.toDate ? new Date(filters.toDate) : null;

    const matchesDate =
      (!fromDate || rowDate >= fromDate) && (!toDate || rowDate <= toDate);

    return (
      matchesSearch &&
      matchesTenantName &&
      matchesPlan &&
      matchesBillingCycle &&
      matchesStatus &&
      matchesPayment &&
      matchesDate
    );
  });
};

const Table = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [draftFilters, setDraftFilters] =
    useState<FilterState>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewSubscriptionModal, setViewSubscriptionModal] = useState(false);

  const itemsPerPage = 5;
  const planOptions = Array.from(
    new Set(recentItems.map((item) => item.planName)),
  );
  const billingOptions = Array.from(
    new Set(recentItems.map((item) => item.billingCycle)),
  );
  const statusOptions = Array.from(
    new Set(recentItems.map((item) => item.subscriptionstatus)),
  );
  const paymentOptions = Array.from(
    new Set(recentItems.map((item) => item.paymentstatus)),
  );

  const filteredItems = applyFilters(recentItems, search, appliedFilters);
  const previewFilteredItems = applyFilters(recentItems, search, draftFilters);

  const activeFilterCount = Object.entries(appliedFilters).filter(
    ([key, value]) =>
      value &&
      !(
        (key === "tenantName" && value === "") ||
        (key !== "tenantName" && value === "All")
      ),
  ).length;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / itemsPerPage),
  );
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

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
    <div className="">
      <h2 className="text-[19px] font-semibold text-[#000] dark:text-[#fff] mb-0 px-2 py-3">
        Tenant Subscriptions
      </h2>

      <div className="bg-white rounded-xl shadow-lg dark:bg-[#343434] overflow-hidden rounded-b-xl border-t border-[#E6EAF2] dark:border-[#3F3F3F]">
        <div className="grid grid-cols-1 border-b border-[#E6EAF2] dark:border-[#3F3F3F] md:grid-cols-3">
          <div className="flex h-12 items-center border-b border-[#E6EAF2] px-4 dark:border-[#3F3F3F] md:border-b-0 md:border-r">
            <Search size={17} className="text-[#A5AAB4]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword"
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
                    "Tenant Name",
                    "Current Plan",
                    "Amount",
                    "Billing Cycle",
                    "Renewal Date",
                    "Subscription Status",
                    "Payment",
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
                  paginatedItems.map((item, index) => {
                    const rowId = `${item.planName}-${item.CreatedDate}-${index}`;

                    return (
                      <tr
                        key={rowId}
                        className="text-[12px] odd:bg-[#f8f8f8] even:bg-[#ffffff] dark:odd:bg-[#2c2c2c] dark:even:bg-[#303030]"
                      >
                        <td className="py-4 px-2">{item.planName}</td>
                        <td className="py-4 px-2">{item.planName}</td>
                        <td className="py-4 px-2">{item.price}</td>
                        <td className="py-4 px-2">{item.billingCycle}</td>{" "}
                        <td className="py-4 px-2">{item.CreatedDate}</td>
                        <td className="py-4 px-2">
                          <span
                            className={`px-2 text-[12px] py-[3px] rounded-md ${
                              item.subscriptionstatus === "Active"
                                ? "bg-[#E4F4E8] text-[#40BD5F] dark:bg-[#36477e33]"
                                : item.subscriptionstatus === "Expired"
                                  ? "bg-[#F6E0E0] text-[#EA4F4F] dark:bg-[#D3464533]"
                                  : "bg-[#F6EcDC] text-[#EFA133] dark:bg-[#F0AD4E33]"
                            }`}
                          >
                            {item.subscriptionstatus}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <span
                            className={`px-2 text-[12px] py-[3px] rounded-md ${
                              item.paymentstatus === "Paid"
                                ? "bg-[#E4F4E8] text-[#40BD5F] dark:bg-[#36477e33]"
                                : item.paymentstatus === "Failed"
                                  ? "bg-[#F6E0E0] text-[#EA4F4F] dark:bg-[#D3464533]"
                                  : "bg-[#F6EcDC] text-[#EFA133] dark:bg-[#F0AD4E33]"
                            }`}
                          >
                            {item.paymentstatus}
                          </span>
                        </td>
                        <td className="py-4 px-2 relative">
                          <button
                            onClick={() =>
                              setOpenMenu(openMenu === rowId ? null : rowId)
                            }
                            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                            <BsThreeDotsVertical size={16} />
                          </button>

                          {openMenu === rowId && (
                            <div className="absolute right-4 top-12 z-50 w-36 bg-white dark:bg-[#2c2c2c] rounded-lg shadow-lg border dark:border-gray-700">
                              <button
                                className="w-full text-left px-4 border-b py-2 text-xs dark:hover:bg-gray-700"
                                onClick={() => {
                                  setOpenMenu(null);
                                  setViewSubscriptionModal(true);
                                }}
                              >
                                View Details
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-4 text-center">
                      No data available
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

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`flex h-8 w-8 items-center justify-center rounded border font-medium ${
              currentPageSafe === page
                ? "border-[#496A96] bg-white text-[#496A96] dark:bg-[#343434]"
                : "border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 dark:border-[#4A4A4A] dark:hover:bg-[#2F2F2F]"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPageSafe === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#4A4A4A] dark:hover:bg-[#2F2F2F]"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {showFilterPanel && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-[360px] rounded-2xl border border-[#E6EAF2] bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#101B41] font-sans">
                Filter by
              </h3>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="text-[#B8C0D3] hover:text-[#6E7891]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm leading-none text-[#101B41]">
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
                  placeholder="Select Status"
                  className="h-8 w-full rounded-md border border-[#d5d5d5] px-3 text-xs text-[#38486A] outline-none placeholder:text-[#8693AE]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm leading-none text-[#101B41]">
                  Plan
                </label>
                <div className="relative">
                  <select
                    value={draftFilters.plan}
                    onChange={(e) =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        plan: e.target.value,
                      }))
                    }
                    className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] px-3 pr-9 text-xs text-[#38486A] outline-none"
                  >
                    <option value="All">Select Status</option>
                    {planOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm leading-none text-[#101B41]">
                  Billing Cycle
                </label>
                <div className="relative">
                  <select
                    value={draftFilters.billingCycle}
                    onChange={(e) =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        billingCycle: e.target.value,
                      }))
                    }
                    className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] px-3 pr-9 text-xs text-[#38486A] outline-none"
                  >
                    <option value="All">Select Status</option>
                    {billingOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm leading-none text-[#101B41]">
                  Date
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
                      className="h-8 w-full rounded-md border border-[#d5d5d5] px-3 pr-9 text-xs text-[#38486A] outline-none"
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
                      className="h-8 w-full rounded-md border border-[#d5d5d5] px-3 pr-9 text-xs text-[#38486A] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm leading-none text-[#101B41]">
                  Subscription Status
                </label>
                <div className="relative">
                  <select
                    value={draftFilters.subscriptionstatus}
                    onChange={(e) =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] px-3 pr-9 text-xs text-[#38486A] outline-none"
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
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm leading-none text-[#101B41]">
                  Payment Status
                </label>
                <div className="relative">
                  <select
                    value={draftFilters.paymentstatus}
                    onChange={(e) =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        payment: e.target.value,
                      }))
                    }
                    className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] px-3 pr-9 text-xs text-[#38486A] outline-none"
                  >
                    <option value="All">Select Status</option>
                    {paymentOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F]"
                  />
                </div>
              </div>
            </div>

            <div className="my-5 h-px bg-[#E4E8F1]" />

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

      {viewSubscriptionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3">
          <div className="w-full max-w-[680px] max-h-[95vh] overflow-y-auto rounded-lg bg-white shadow-2xl scrollbar-none">
            {/* ========================================================= */}
            {/* HEADER */}
            {/* ========================================================= */}
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Academy Icon */}
                  <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-xl bg-[#EEEAFE]">
                    <RiSchoolFill size={28} className="text-[#576CBC]" />
                  </div>

                  {/* Tenant Details */}
                  <div>
                    <h2 className="text-[16px] font-semibold text-[#101B41]">
                      Blackstone Academy
                    </h2>

                    <div className="mt-1.5 flex items-center gap-3 text-[8px] text-[#666]">
                      <span>TEN-0001</span>

                      <span className="h-3 w-px bg-[#D5D5D5]" />

                      <span>Subscription ID: SUB-000124</span>
                    </div>
                  </div>
                </div>

                {/* Status + Close */}
                <div className="flex items-start gap-3">
                  <span className="rounded-md bg-[#E8F8EC] px-2.5 py-1 text-[10px] font-medium text-[#319346]">
                    Active
                  </span>

                  <button
                    onClick={() => setViewSubscriptionModal(false)}
                    className="text-gray-400 transition hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* CONTENT */}
            {/* ========================================================= */}
            <div className="px-3.5 pb-3 space-y-3">
              {/* ======================================================= */}
              {/* SUMMARY + MODULES */}
              {/* ======================================================= */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {/* Subscription Summary */}
                <div className="rounded-lg border border-[#D9D9D9] p-2.5">
                  <h3 className="mb-3 text-[12px] font-medium text-[#101B41]">
                    Subscription Summary
                  </h3>

                  <div className="space-y-2">
                    <div className="grid grid-cols-[145px_1fr] items-center text-[11px]">
                      <span className="text-[#101B41]">Current Plan</span>

                      <span className="text-[#101B41]">Enterprise</span>
                    </div>

                    <div className="grid grid-cols-[145px_1fr] items-center text-[11px]">
                      <span>Subscription Status</span>

                      <span className="w-fit rounded-md bg-[#E8F8EC] px-2 py-1 text-[9px] font-medium text-[#319346]">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-[145px_1fr] items-center text-[11px]">
                      <span>Billing Cycle</span>
                      <span>Monthly</span>
                    </div>

                    <div className="grid grid-cols-[145px_1fr] items-center text-[11px]">
                      <span>Start Date</span>
                      <span>Sep 12, 2023</span>
                    </div>

                    <div className="grid grid-cols-[145px_1fr] items-center text-[11px]">
                      <span>Renewal Date</span>
                      <span>Sep 12, 2026</span>
                    </div>

                    <div className="grid grid-cols-[145px_1fr] items-center text-[11px]">
                      <span>Next Payment</span>
                      <span>₹8,500 on Sep 12, 2026</span>
                    </div>

                    <div className="grid grid-cols-[145px_1fr] items-center text-[11px]">
                      <span>Payment Method</span>
                      <span>UPI</span>
                    </div>
                  </div>
                </div>

                {/* Included Modules */}
                <div className="rounded-lg border border-[#D9D9D9] p-2.5">
                  <h3 className="mb-2 text-[12px] font-medium text-[#101B41]">
                    Included Modules &amp; Features
                  </h3>

                  {/* Module Tags */}
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {["Admin", "Teacher", "Student"].map((item) => (
                      <span
                        key={item}
                        className="rounded-sm bg-[#E8ECFA] px-2 py-1 text-[10px] font-medium text-[#576CBC]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-y-2 text-[11px] text-[#101B41]">
                    <span>Student Management</span>
                    <span>Staff Management</span>

                    <span>Attendance</span>
                    <span>Fees Management</span>

                    <span>Examination</span>
                    <span>Transport Management</span>

                    <span>Library Management</span>
                    <span>Hostel Management</span>

                    <span>HR &amp; Payroll</span>
                    <span>Performance Analytics</span>

                    <span>Reports &amp; Insights</span>
                    <span>Mobile App Access</span>
                  </div>
                </div>
              </div>

              {/* ======================================================= */}
              {/* PLAN USAGE */}
              {/* ======================================================= */}
              <div className="rounded-lg border border-[#D9D9D9] p-2.5">
                <h3 className="mb-3 text-[12px] font-medium text-[#101B41]">
                  Plan Usage
                </h3>

                {/* Students */}
                <div className="mb-3 flex items-center gap-3">
                  {/* Icon */}
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#E8ECFA]">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M16 21V19C16 16.8 14.2 15 12 15H6C3.8 15 2 16.8 2 19V21"
                        stroke="#576CBC"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <circle
                        cx="9"
                        cy="8"
                        r="3"
                        stroke="#576CBC"
                        strokeWidth="1.8"
                      />

                      <path
                        d="M22 21V19C22 17.1 20.7 15.5 19 15.1"
                        stroke="#576CBC"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M16 5.1C17.7 5.5 19 7 19 8.8C19 10.6 17.7 12.1 16 12.5"
                        stroke="#576CBC"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <span className="w-[55px] text-[11px] text-[#101B41]">
                    Students
                  </span>

                  {/* Progress */}
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#C5CDE8]">
                    <div
                      className="h-full rounded-full bg-[#576CBC]"
                      style={{ width: "84%" }}
                    />
                  </div>

                  <span className="w-[52px] text-right text-[11px] text-[#101B41]">
                    420 / 500
                  </span>
                </div>

                {/* Users */}
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#E8ECFA]">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <circle cx="9" cy="8" r="3" fill="#576CBC" />

                      <path
                        d="M3 20C3 16.7 5.7 14 9 14C12.3 14 15 16.7 15 20"
                        fill="#576CBC"
                      />

                      <circle cx="17" cy="9" r="2.5" fill="#576CBC" />

                      <path
                        d="M15.5 14.5C18.4 14.5 21 16.5 21 19.5"
                        stroke="#576CBC"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <span className="w-[55px] text-[11px] text-[#101B41]">
                    Users
                  </span>

                  {/* Progress */}
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#C5CDE8]">
                    <div
                      className="h-full rounded-full bg-[#576CBC]"
                      style={{ width: "82%" }}
                    />
                  </div>

                  <span className="w-[52px] text-right text-[11px] text-[#101B41]">
                    82 / 100
                  </span>
                </div>
              </div>

              {/* ======================================================= */}
              {/* ADDITIONAL SERVICES */}
              {/* ======================================================= */}
              <div className="rounded-lg border border-[#D9D9D9] p-2.5">
                <h3 className="mb-3 text-[12px] font-medium text-[#101B41]">
                  Additional Services
                </h3>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#101B41]">
                      Custom Domain
                    </span>

                    <span className="rounded-md bg-[#E8F8EC] px-2 py-1 text-[9px] font-medium text-[#319346]">
                      Enabled
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#101B41]">
                      Subscription Status
                    </span>

                    <span className="rounded-md bg-[#E8F8EC] px-2 py-1 text-[9px] font-medium text-[#319346]">
                      Enabled
                    </span>
                  </div>
                </div>
              </div>

              {/* ======================================================= */}
              {/* PLAN CHANGE HISTORY */}
              {/* ======================================================= */}
              <div className="rounded-lg border border-[#D9D9D9] p-2.5">
                <h3 className="mb-3 text-[12px] font-medium text-[#101B41]">
                  Plan Change History
                </h3>

                <div className="overflow-hidden rounded-md">
                  <table className="w-full border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-[#576CBC] text-white">
                        <th className="border-r border-white/40 px-2 py-3 font-medium">
                          Date
                        </th>

                        <th className="border-r border-white/40 px-2 py-3 font-medium">
                          Change
                        </th>

                        <th className="border-r border-white/40 px-2 py-3 font-medium">
                          From
                        </th>

                        <th className="px-2 py-3 font-medium">To</th>
                      </tr>
                    </thead>

                    <tbody className="text-center text-[#101B41]">
                      <tr className="bg-[#F1F1F1]">
                        <td className="border-r border-[#D5D5D5] px-2 py-3">
                          Sep 12, 2023
                        </td>

                        <td className="border-r border-[#D5D5D5] px-2 py-3">
                          New Subscription
                        </td>

                        <td className="border-r border-[#D5D5D5] px-2 py-3">
                          –
                        </td>

                        <td className="px-2 py-3">Enterprise</td>
                      </tr>

                      <tr className="bg-[#F1F1F1]">
                        <td className="border-r border-[#D5D5D5] px-2 py-3">
                          Aug 10, 2023
                        </td>

                        <td className="border-r border-[#D5D5D5] px-2 py-3">
                          Upgraded
                        </td>

                        <td className="border-r border-[#D5D5D5] px-2 py-3">
                          Standard
                        </td>

                        <td className="px-2 py-3">Enterprise</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* View History */}
                <button
                  type="button"
                  className="mt-2 w-full text-center text-[11px] font-medium text-[#576CBC] hover:underline"
                >
                  View All History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
