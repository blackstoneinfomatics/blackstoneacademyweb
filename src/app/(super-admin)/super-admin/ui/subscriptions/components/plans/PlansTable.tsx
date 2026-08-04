"use client";

import React, { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { RiPoliceBadgeFill } from "react-icons/ri";
import {
  Search,
  SlidersHorizontal,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarDays,
  X,
} from "lucide-react";
import axios from "axios";

import Image from "next/image";

// const plans = [
//   {
//     name: "Basic",
//     price: "$ 8,500",
//     billing: "Monthly",
//     date: "Sep, 12 2023",
//     features: 10,
//     tenants: 15,
//   },
//   {
//     name: "Standard",
//     price: "9,500",
//     billing: "Monthly",
//     date: "Sep, 12 2023",
//     features: 10,
//     tenants: 15,
//   },
//   {
//     name: "Premium",
//     price: "12,500",
//     billing: "Monthly",
//     date: "Sep, 12 2023",
//     features: 10,
//     tenants: 15,
//   },
//   {
//     name: "Basic",
//     price: "8,500",
//     billing: "Monthly",
//     date: "Sep, 12 2023",
//     features: 10,
//     tenants: 15,
//   },
//   {
//     name: "Standard",
//     price: "8,500",
//     billing: "Monthly",
//     date: "Sep, 12 2023",
//     features: 10,
//     tenants: 15,
//   },
// ];

type Plan = (typeof plans)[number];

type FilterState = {
  planName: string;
  billingCycle: string;
  fromDate: string;
  toDate: string;
  status: string;
};

const INITIAL_FILTERS: FilterState = {
  planName: "All",
  billingCycle: "All",
  fromDate: "",
  toDate: "",
  status: "All",
};

const parseRowDate = (value: string) => new Date(value.replace(",", ""));

const applyFilters = (items: Plan[], search: string, filters: FilterState) => {
  const term = search.toLowerCase().trim();

  return items.filter((item) => {
    const matchesSearch =
      !term ||
      [item.name, item.price, item.billing, item.date, item.status]
        .join(" ")
        .toLowerCase()
        .includes(term);

    const matchesPlan =
      filters.planName === "All" || item.name === filters.planName;
    const matchesBilling =
      filters.billingCycle === "All" || item.billing === filters.billingCycle;
    const matchesStatus =
      filters.status === "All" || item.status === filters.status;

    const rowDate = parseRowDate(item.date);
    const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
    const toDate = filters.toDate ? new Date(filters.toDate) : null;
    const matchesDate =
      (!fromDate || rowDate >= fromDate) && (!toDate || rowDate <= toDate);

    return (
      matchesSearch &&
      matchesPlan &&
      matchesBilling &&
      matchesStatus &&
      matchesDate
    );
  });
};

const badgeColors: Record<string, string> = {
  Basic: "bg-cyan-100 text-cyan-600",
  Standard: "bg-blue-100 text-blue-600",
  Premium: "bg-indigo-100 text-indigo-600",
};

const ToggleSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`group relative justify-start h-5 w-9 rounded-full border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#576CBC]/40 ${
        checked
          ? "border-[#576CBC] bg-gradient-to-r from-[#576CBC] to-[#6F85D6]"
          : "border-[#D6DCEB] bg-[#EFF2F8]"
      }`}
    >
      <span
        className={`absolute top-[2px] h-[15px] w-[15px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.18)] transition-all duration-300 ${
          checked ? "left-[18px]" : "left-[2px]"
        }`}
      />
    </button>
  );
};

const PlansTable = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [search, setSearch] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [draftFilters, setDraftFilters] =
    useState<FilterState>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;
  const planOptions = Array.from(new Set(plans.map((item) => item.name)));
  const billingOptions = Array.from(new Set(plans.map((item) => item.billing)));
  const statusOptions = Array.from(new Set(plans.map((item) => item.status)));

  const filteredPlans = applyFilters(plans, search, appliedFilters);
  const previewFilteredPlans = applyFilters(plans, search, draftFilters);

  const [customDomain, setCustomDomain] = useState(true);
  const [backup, setBackup] = useState(true);
  const [apiAccess, setApiAccess] = useState(true);
  const [whiteLabel, setWhiteLabel] = useState(true);
  const [prioritySupport, setPrioritySupport] = useState(true);

  const activeFilterCount = Object.entries(appliedFilters).filter(
    ([, value]) => value && value !== "" && value !== "All",
  ).length;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPlans.length / itemsPerPage),
  );
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * itemsPerPage;
  const paginatedPlans = filteredPlans.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const showingStart = filteredPlans.length === 0 ? 0 : startIndex + 1;

  useEffect(() => {
    setCurrentPage(1);
    setOpenMenu(null);
  }, [search, appliedFilters]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const featureItems = [
    { key: "customDomain", label: "Custom Domain" },
    { key: "backup", label: "Backup" },
    { key: "apiAccess", label: "API Access" },
    { key: "whiteLabel", label: "White Label" },
    { key: "prioritySupport", label: "Priority Support" },
  ];
  const [features, setFeatures] = useState({
    customDomain: true,
    backup: true,
    apiAccess: true,
    whiteLabel: true,
    prioritySupport: true,
  });
  return (
    <div className="w-full">
      {/* Title */}
      <h2 className="mb-0 text-[22px] p-2 font-semibold text-[#1F2A44]">
        Plan
      </h2>

      {/* Card */}
      <div className="overflow-hidden rounded-lg border border-[#E6EAF2] bg-white">
        {/* Top Bar */}
        <div className="grid grid-cols-3 border-b border-[#E6EAF2]">
          {/* Search */}
          <div className="flex h-12 items-center border-r border-[#E6EAF2] px-4">
            <Search size={17} className="text-[#A5AAB4]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword"
              className="ml-2 w-full bg-transparent text-sm text-[#444] outline-none placeholder:text-[#A5AAB4]"
            />
          </div>

          {/* Filter */}
          <div className="border-r border-[#E6EAF2]">
            <button
              onClick={() => {
                setDraftFilters(appliedFilters);
                setShowFilterPanel(true);
              }}
              className="flex h-12 w-full items-center justify-between px-4 text-sm text-[#80848E] hover:bg-gray-50"
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

          {/* Count */}
          <div className="flex h-12 items-center px-4 text-sm text-[#80848E]">
            Showing {showingStart} of {filteredPlans.length}
          </div>
        </div>

        {/* Table */}
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="h-10 bg-[#496A96] text-left text-[14px] text-white">
                <th className="px-4 font-medium">Plan Name</th>
                <th className="px-4 font-medium">Price</th>
                <th className="px-4 font-medium">Billing Cycle</th>
                <th className="px-4 font-medium">Created Date</th>
                <th className="px-4 font-medium">Features</th>
                <th className="px-4 font-medium">Subscribed Tenants</th>
                <th className="px-4 font-medium">Status</th>
                <th className="px-4 font-medium text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedPlans.map((item, index) => {
                const rowId = `${item.name}-${item.date}-${startIndex + index}`;

                return (
                  <tr
                    key={rowId}
                    className={`text-[12px] ${
                      index % 2 === 0
                        ? "bg-[#fff] dark:bg-[#2C2C2C] "
                        : "bg-[#F8F8F8] dark:bg-[#303030]"
                    }`}
                  >
                    <td className="px-4 py-5">
                      <span
                        className={`rounded-md px-3 py-1 text-xs font-medium ${
                          badgeColors[item.name]
                        }`}
                      >
                        {item.name}
                      </span>
                    </td>

                    <td className="px-4">{item.price}</td>

                    <td className="px-4">{item.billing}</td>

                    <td className="px-4 text-[#4D74AE]">{item.date}</td>

                    <td className="px-4">{item.features}</td>

                    <td className="px-4">{item.tenants}</td>

                    <td className="px-4">
                      <span
                        className={`rounded-md px-3 py-1 text-xs font-medium ${
                          item.status === "Active"
                            ? "bg-[#EAF8EC] text-[#34A853]"
                            : item.status === "Expired"
                              ? "bg-[#F6E0E0] text-[#EA4F4F]"
                              : "bg-[#F6EcDC] text-[#EFA133]"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 relative">
                      <div className="flex justify-center">
                        <button
                          className="rounded-md p-1 hover:bg-gray-100"
                          onClick={() =>
                            setOpenMenu(openMenu === rowId ? null : rowId)
                          }
                        >
                          <MoreVertical size={18} className="text-[#6B7280]" />
                        </button>

                        {openMenu === rowId && (
                          <div className="absolute right-4 top-12 z-50 w-36 bg-white rounded-lg shadow-lg border">
                            <button
                              className="w-full border-b text-left px-4 py-2 text-xs hover:bg-gray-100"
                              onClick={() => {
                                setSelectedPlan(item);
                                setShowModal(true);
                                setOpenMenu(null);
                              }}
                            >
                              View Details
                            </button>

                            <button
                              className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100"
                              onClick={() => {
                                setSelectedPlan(item);
                                setShowUpdateModal(true);
                                setOpenMenu(null);
                              }}
                            >
                              Update
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedPlans.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-sm text-[#80848E]"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end gap-2 px-4 py-3">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPageSafe === 1}
          className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={18} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`flex h-8 w-8 items-center justify-center rounded border font-medium ${
              currentPageSafe === page
                ? "border-[#496A96] bg-white text-[#496A96]"
                : "border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50"
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
          className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {showFilterPanel && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-[360px] rounded-2xl border border-[#E6EAF2] bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-2xl font-semibold leading-none text-[#101B41]">
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
                <label className="mb-2 block text-lg text-[#101B41]">
                  Plan
                </label>
                <div className="relative">
                  <select
                    value={draftFilters.planName}
                    onChange={(e) =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        planName: e.target.value,
                      }))
                    }
                    className="h-[42px] w-full appearance-none rounded-md border border-[#D8DDE8] px-3 pr-9 text-sm text-[#38486A] outline-none"
                  >
                    <option value="All">Select Plan</option>
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
                <label className="mb-2 block text-lg text-[#101B41]">
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
                    className="h-[42px] w-full appearance-none rounded-md border border-[#D8DDE8] px-3 pr-9 text-sm text-[#38486A] outline-none"
                  >
                    <option value="All">Select Billing Cycle</option>
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
                <label className="mb-2 block text-lg text-[#101B41]">
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
                      className="h-[42px] w-full rounded-md border border-[#D8DDE8] px-3 pr-9 text-sm text-[#38486A] outline-none"
                    />
                    <CalendarDays
                      size={17}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F]"
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
                      className="h-[42px] w-full rounded-md border border-[#D8DDE8] px-3 pr-9 text-sm text-[#38486A] outline-none"
                    />
                    <CalendarDays
                      size={17}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-lg text-[#101B41]">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={draftFilters.status}
                    onChange={(e) =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="h-[42px] w-full appearance-none rounded-md border border-[#D8DDE8] px-3 pr-9 text-sm text-[#38486A] outline-none"
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
            </div>

            <div className="my-5 h-px bg-[#E4E8F1]" />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDraftFilters(INITIAL_FILTERS)}
                className="h-[42px] rounded-lg border border-[#576CBC] text-sm font-semibold text-[#576CBC]"
              >
                Reset
              </button>

              <button
                onClick={() => {
                  setAppliedFilters(draftFilters);
                  setShowFilterPanel(false);
                }}
                className="h-[42px] rounded-lg bg-[#576CBC] text-sm font-semibold text-white"
              >
                Show {previewFilteredPlans.length} results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-5">
          {/* Modal */}
          <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b">
              <div>
                <h2 className="text-[15px] font-semibold text-[#1F2937]">
                  Plan Details
                </h2>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-[#576CBC] scrollbar-track-[#fff] max-h-[85vh]">
              {/* Top Plan Card */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex gap-4">
                  <div className="w-20 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
                    <Image
                      src="/assets/images/plandetails.svg"
                      alt="Plan Details"
                      width={40}
                      height={40}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-3 justify-between">
                      <h3 className="text-lg font-semibold">Enterprise</h3>

                      <span className="px-3 py-1 rounded-sm bg-green-100 text-green-700 text-[10px] font-medium">
                        Active
                      </span>
                    </div>

                    <p className="text-gray-700 text-xs mt-1 font-medium">
                      Our most powerful subscription plan designed for large
                      organizations with advanced features, higher resource
                      limits and priority support.
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Cards */}

              <div className="grid lg:grid-cols-5 md:grid-cols-3 grid-cols-2 gap-4 mb-5">
                {[
                  ["Plan Type", "Enterprise"],
                  ["Billing Cycle", "Monthly / Yearly"],
                  ["Created Date", "Sep 12, 2023"],
                  ["Last Updated", "May 20, 2024"],
                  ["Created By", "Super Admin"],
                ].map(([title, value]) => (
                  <div key={title} className="bg-[#EEF1FF] rounded-md p-3">
                    <p className="text-xs text-[#010E30]">{title}</p>

                    <p className="font-medium text-[#010e30a5] mt-1 text-[11px]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pricing & Statistics */}

              <div className="grid lg:grid-cols-2 gap-5 mb-5">
                {/* Pricing */}

                <div className="rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-400 to-blue-500 text-white p-4">
                  <h4 className="font-medium text-base mb-6">Pricing</h4>

                  <div className="grid grid-cols-2">
                    <div>
                      <p className="text-sm opacity-90">Monthly Price</p>

                      <h2 className="text-lg font-medium mt-3">
                        $8,500 <span>/ Month</span>
                      </h2>
                    </div>

                    <div className="border-l border-white/40 pl-6">
                      <p className="text-sm opacity-90">Yearly Price</p>

                      <h2 className="text-lg font-medium mt-3">
                        $8,500 <span>/ Year</span>
                      </h2>

                      <span className="inline-block mt-2 bg-[#D6FED5] text-green-800 px-3 py-1 rounded text-xs">
                        Save 17%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statistics */}

                <div className="border rounded-xl p-3">
                  <h4 className="font-medium text-base mb-2">
                    Plan Statistics
                  </h4>

                  {[
                    ["Total Subscribed Tenant", "42"],
                    ["Active Tenants", "32"],
                    ["Monthly Revenue", "$8,500,000"],
                    ["Yearly Revenue", "$8,500,000"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-[5px]">
                      <span className="text-[#010e30] text-[14px] font-normal">
                        {k}
                      </span>

                      <span className="font-light text-[14px] text-[#010e30]">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Limits + Modules */}

              <div className="grid lg:grid-cols-2 gap-5 mb-5">
                <div className="border rounded-xl p-3">
                  <h4 className="font-medium text-base mb-2">Plan Limits</h4>
                  <div className="max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#576CBC] scrollbar-track-[#fff] pr-2">
                    {[
                      ["Maximum Students", "500"],
                      ["Maximum Staff / Users", "100"],
                      ["Storage Limit", "250 GB"],
                      ["Custom Domain", "Yes"],
                      ["Backup", "Yes"],
                      ["API Access", "Yes"],
                      ["White Label", "Yes"],
                      ["Priority Support", "Yes"],
                      ["Priority Support", "Yes"],
                      ["Priority Support", "Yes"],
                      ["Priority Support", "Yes"],
                      ["Priority Support", "Yes"],
                      ["Priority Support", "Yes"],
                      ["Priority Support", "Yes"],
                      ["Priority Support", "Yes"],
                      ["Priority Support", "Yes"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-2">
                        <span className="text-[#010e30] text-[14px] font-normal">
                          {k}
                        </span>
                        <span className="font-light text-[14px] text-[#010e30]">
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded-xl p-3">
                  <h4 className="font-medium text-base mb-4">
                    Included Modules
                  </h4>

                  <div className="grid grid-cols-2 gap-y-3 max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#576CBC] scrollbar-track-[#fff] pr-2">
                    {[
                      "Student Management",
                      "Staff Management",
                      "Attendance",
                      "Fees Management",
                      "Examination",
                      "Transport Management",
                      "Library Management",
                      "Hostel Management",
                      "HR & Payroll",
                      "Performance Analytics",
                      "Reports & Insights",
                      "Mobile App Access",
                    ].map((item) => (
                      <div
                        key={item}
                        className="text-[#010e30] text-[14px] font-normal"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline */}

              <div className="border rounded-xl p-3">
                <h4 className="font-medium text-base mb-3">Timeline</h4>

                {[
                  ["Plan Created", "May 01, 2024"],
                  ["Last Updated", "May 01, 2024"],
                  ["Last Price Change", "May 01, 2024"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2">
                    <span className="text-[#010e30] text-[14px] font-normal">
                      {k}
                    </span>

                    <span className="font-light text-[13px] text-[#010e30]">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showUpdateModal && selectedPlan && (
        <div className="fixed inset-0 z-[9999] rounded-lg flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl max-h-[95vh] overflow-y-scroll scrollbar-none rounded-lg bg-white shadow-2xl">
            {/* Header */}
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-lg font-medium text-gray-800">Update Plan</h2>

              <button
                onClick={() => setShowUpdateModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 py-2 px-4">
              {/* Basic Information */}
              <div className="rounded-lg border border-gray-200 p-5">
                <h3 className="mb-4 text-[15px] font-semibold text-gray-800">
                  Basic Information
                </h3>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      className="h-8 w-full rounded border border-[#d4d4d4] px-3 placeholder:text-[#010e309c] text-xs outline-none focus:border-indigo-500"
                      placeholder="Name of the subscription plan."
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Plan Type
                    </label>

                    <select className="h-8 w-full rounded border border-[#d4d4d4] px-3 placeholder:text-[#010e309c] text-xs outline-none focus:border-indigo-500">
                      <option>Select</option>
                      <option>Premium</option>
                      <option>Standard</option>
                      <option>Basic</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium">
                    Description
                  </label>

                  <textarea
                    rows={3}
                    className="w-full rounded border border-[#d4d4d4] p-3 placeholder:text-[#010e309c] text-xs outline-none focus:border-indigo-500"
                    placeholder="Short explanation about the plan and its features."
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-5">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Monthly Price (USD)
                    </label>

                    <input
                      type="text"
                      defaultValue="$8,800"
                      className="h-8 w-full rounded border border-[#d4d4d4] px-3 placeholder:text-[#010e309c] text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Yearly Price (USD)
                    </label>

                    <input
                      type="text"
                      defaultValue="$86,500"
                      className="h-8 w-full rounded border border-[#d4d4d4] px-3 placeholder:text-[#010e309c] text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Plan Limits */}
              <div className="rounded-lg border border-gray-200 p-5">
                <h3 className="mb-4 text-[15px] font-semibold">Plan Limits</h3>

                <div className="grid grid-cols-3 gap-5">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Students
                    </label>

                    <select className="h-8 w-full rounded border border-[#d4d4d4] px-3 placeholder:text-[#010e309c] text-xs">
                      <option>Unlimited</option>
                      <option>100</option>
                      <option>500</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Users
                    </label>

                    <input
                      defaultValue="10"
                      className="h-8 w-full rounded border border-[#d4d4d4] px-3 placeholder:text-[#010e309c] text-xs"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Storage Limit (GB)
                    </label>

                    <input
                      defaultValue="250"
                      className="h-8 w-full rounded border border-[#d4d4d4] px-3 placeholder:text-[#010e309c] text-xs"
                    />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-5 gap-6">
                  {featureItems.map((item) => (
                    <div key={item.key} className="flex flex-col items-start">
                      <span className="mb-2 text-sm font-medium text-[#010e30]">
                        {item.label}
                      </span>

                      <ToggleSwitch
                        checked={features[item.key as keyof typeof features]}
                        onChange={() =>
                          setFeatures((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key as keyof typeof prev],
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Included Modules */}

              <div className="rounded-lg border border-gray-200 p-5">
                <h3 className="mb-4 text-[15px] font-semibold">
                  Included Modules
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Student Management",
                    "Staff Management",
                    "Attendance",
                    "Fees Management",
                    "Examination",
                    "Transport Management",
                    "Student Management",
                    "Student Management",
                    "Library Management",
                    "Hostel Management",
                    "HR & Payroll",
                    "Performance Analytics",
                  ].map((item, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-2 cursor-pointer text-[13px]"
                    >
                      <span className="relative flex h-[13px] w-[13px] items-center justify-center">
                        <input
                          type="checkbox"
                          className="peer absolute inset-0 h-[13px] w-[13px] cursor-pointer opacity-0"
                        />

                        <span className="flex h-[13px] w-[13px] items-center justify-center rounded-[3px] border border-[#576CBC] bg-white text-transparent peer-checked:bg-[#576CBC] peer-checked:text-white">
                          <svg
                            viewBox="0 0 16 16"
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              d="M3.5 8.5L6.5 11.5L12.5 4.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </span>
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}

              <div className="rounded-lg border border-gray-200 p-5">
                <h3 className="mb-4 text-[15px] font-semibold">Status</h3>

                <div className="gap-4">
                  <div className="flex flex-row gap-5">
                    <label className="text-sm mt-2 font-medium">
                      Plan Status
                    </label>

                    <select className="h-8 w-[550px] ml-11 rounded border border-[#d4d4d4] px-3 placeholder:text-[#010e309c] text-xs">
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}

            <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
              <button className="rounded bg-[#576CBC] px-4 py-2 text-xs font-medium text-white">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansTable;
