"use client";

import React, { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type TrialItem = {
  _id?: string;
  trialId?: string;
  tenantName?: string;
  trialStartDate?: string;
  trialEndDate?: string;
  daysLeft?: number;
  status?: string;
  isConverted?: boolean;
  convertedAt?: string | null;
};

type FilterState = {
  tenantName: string;
  fromDate: string;
  toDate: string;
  status: string;
};

const INITIAL_FILTERS: FilterState = {
  tenantName: "",
  fromDate: "",
  toDate: "",
  status: "All",
};

const applyFilters = (
  items: TrialItem[],
  search: string,
  filters: FilterState,
) => {
  const term = search.toLowerCase().trim();

  return items.filter((item) => {
    const tenantName = item.tenantName || "";
    const status = item.status || "";
    const trialId = item.trialId || item._id || "";

    const matchesSearch =
      !term ||
      [tenantName, status, trialId]
        .join(" ")
        .toLowerCase()
        .includes(term);

    const matchesTenantName =
      !filters.tenantName ||
      tenantName.toLowerCase().includes(filters.tenantName.toLowerCase());

    const matchesStatus = filters.status === "All" || status === filters.status;

    const rowDate = item.trialStartDate ? new Date(item.trialStartDate) : null;
    const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
    const toDate = filters.toDate ? new Date(filters.toDate) : null;

    const matchesDate =
      (!fromDate || (rowDate && rowDate >= fromDate)) &&
      (!toDate || (rowDate && rowDate <= toDate));

    return (
      matchesSearch &&
      matchesTenantName &&
      matchesStatus &&
      matchesDate
    );
  });
};

const formatDate = (value?: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatStatusLabel = (status?: string) => {
  if (!status) {
    return "-";
  }

  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getDaysLeftStyle = (daysLeft?: number) => {
  if (typeof daysLeft !== "number") {
    return "text-[#6B7280]";
  }

  if (daysLeft < 0) {
    return "text-[#E35D5D]";
  }

  if (daysLeft <= 4) {
    return "text-[#F4A429]";
  }

  return "text-[#34A853]";
};

const getStatusBadgeStyle = (status?: string, daysLeft?: number) => {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "ACTIVE") {
    return "bg-[#EAF8EC] text-[#34A853]";
  }

  if (normalized === "EXPIRED" || normalized === "CANCELLED" || (typeof daysLeft === "number" && daysLeft < 0)) {
    return "bg-[#FDEAEA] text-[#E35D5D]";
  }

  if (normalized === "EXPIRED_SOON" || (typeof daysLeft === "number" && daysLeft <= 4)) {
    return "bg-[#FFF7E8] text-[#F4A429]";
  }

  return "bg-[#EEF3FF] text-[#4D74AE]";
};

const toDateInputValue = (value?: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
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

  const [showTrialModal, setShowTrialModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState<TrialItem | null>(null);
  const [trials, setTrials] = useState<TrialItem[]>([]);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 5;
  const trialsList = Array.isArray(trials) ? trials : [];
  const statusOptions = Array.from(
    new Set(trialsList.map((item) => item.status)),
  ).filter((option): option is string => Boolean(option));

  const filteredItems = applyFilters(trialsList, search, appliedFilters);
  const previewFilteredItems = applyFilters(trialsList, search, draftFilters);

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

  useEffect(() => {
    const fetchTrials = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TRIALS.GET_TRIALS}`,
        );
        const payload =
          response.data?.data?.items ?? response.data?.items ?? response.data?.data;

        setTrials(Array.isArray(payload) ? payload : []);
      } catch (error) {
        console.error("Error fetching trials:", error);
        setTrials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrials();
  }, []);

  return (
    <div>
      <h2 className="mb-0 px-2 py-3 text-[19px] font-semibold text-[#000] dark:text-[#fff]">
        All Trails
      </h2>

      <div className="overflow-hidden rounded-xl border-t border-[#E6EAF2] bg-white shadow-lg dark:border-[#3F3F3F] dark:bg-[#343434]">
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

        <div className="h-full overflow-x-auto scrollbar-none">
          <div className="h-[380px] scrollbar-none">
            <table className="min-w-full table-fixed border-collapse text-xs">
              <thead className="bg-[#4C6993] text-[14px] text-white dark:bg-[#44699d]">
                <tr>
                  {[
                    "Tenant",
                    "Trial Start",
                    "Trial End",
                    "Days Left",
                    "Status",
                    "Action",
                  ].map((header) => (
                    <th
                      key={header}
                      className="border border-[#466993] px-2 py-4 text-left font-medium"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item, index) => {
                    const rowId =
                      item.trialId || item._id || `${item.tenantName || "trial"}-${index}`;

                    return (
                      <tr
                        key={rowId}
                        className="text-[12px] odd:bg-[#f8f8f8] even:bg-[#ffffff] dark:odd:bg-[#2c2c2c] dark:even:bg-[#303030]"
                      >
                        <td className="px-2 py-4">{item.tenantName || "-"}</td>
                        <td className="px-2 py-4">{formatDate(item.trialStartDate)}</td>
                        <td className="px-2 py-4">{formatDate(item.trialEndDate)}</td>
                        <td className={`px-2 py-4 font-medium ${getDaysLeftStyle(item.daysLeft)}`}>
                          {typeof item.daysLeft === "number" ? item.daysLeft : "-"}
                        </td>
                        <td className="px-2 py-4">
                          <span
                            className={`rounded-md px-2 py-[3px] text-[12px] ${getStatusBadgeStyle(
                              item.status,
                              item.daysLeft,
                            )}`}
                          >
                            {formatStatusLabel(item.status)}
                          </span>
                        </td>
                        <td className="relative px-2 py-4">
                          <button
                            onClick={() =>
                              setOpenMenu(openMenu === rowId ? null : rowId)
                            }
                            className="rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                            <BsThreeDotsVertical size={16} />
                          </button>

                          {openMenu === rowId && (
                            <div className="absolute right-4 top-12 z-50 w-full rounded-lg border bg-white shadow-lg dark:border-gray-700 dark:bg-[#2c2c2c]">
                              <button
                                className="w-full px-4 py-2 border-b text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => {
                                  setSelectedTrial(item);
                                  setIsEditMode(false);
                                  setShowTrialModal(true);
                                  setOpenMenu(null);
                                }}
                              >
                                View Details
                              </button>
                              <button
                                className="w-full px-4 border-b py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => {
                                  setSelectedTrial(item);
                                  setIsEditMode(true);
                                  setShowTrialModal(true);
                                  setOpenMenu(null);
                                }}
                              >
                                Edit Details
                              </button>

                              <button
                                className="w-full px-4 py-2 text-left text-xs text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => {
                                  console.log("Cancel", item);
                                  setOpenMenu(null);
                                }}
                              >
                                Cancel
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
                      {loading ? "Loading trials..." : "No data available"}
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
              <h3 className="text-lg font-semibold font-sans text-[#101B41]">
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
                <label className="mb-2 block text-sm text-[#101B41]">
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
                <label className="mb-2 block text-sm text-[#101B41]">
                  Trial Date Range
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
                <label className="mb-2 block text-sm text-[#101B41]">
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
                    className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] px-3 pr-9 text-xs text-[#38486A] outline-none"
                  >
                    <option value="All">Select Status</option>
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {formatStatusLabel(option)}
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
                className="h-8 rounded-lg border border-[#576CBC] text-xs font-medium text-[#576CBC]"
              >
                Reset
              </button>

              <button
                onClick={() => {
                  setAppliedFilters(draftFilters);
                  setShowFilterPanel(false);
                }}
                className="h-8 rounded-lg bg-[#576CBC] text-xs font-medium text-white"
              >
                Show {previewFilteredItems.length} results
              </button>
            </div>
          </div>
        </div>
      )}

      {showTrialModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[720px] rounded-xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-[20px] font-semibold text-[#101B41]">
                {isEditMode ? "Edit Trial" : "Trial Details"}
              </h2>

              <button onClick={() => setShowTrialModal(false)}>
                <X className="text-gray-400" size={22} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              <div className="rounded-xl border border-[#E6EAF2] p-4">
                <div className="space-y-5">
                  {/* Tenant */}

                  <div>
                    <label className="mb-2 block text-[15px] font-medium text-[#101B41]">
                      Tenant Name
                    </label>

                    <input
                      readOnly={!isEditMode}
                      defaultValue={selectedTrial?.tenantName}
                      className="h-11 w-full rounded-md border border-[#D8DDE8] px-4 outline-none"
                    />
                  </div>

                  {/* Dates */}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-[15px] font-medium">
                        Trial Start Date
                      </label>

                      <input
                        type="date"
                        readOnly={!isEditMode}
                        defaultValue={toDateInputValue(selectedTrial?.trialStartDate)}
                        className="h-11 w-full rounded-md border border-[#D8DDE8] px-4 outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[15px] font-medium">
                        Trial End Date
                      </label>

                      <input
                        type="date"
                        readOnly={!isEditMode}
                        defaultValue={toDateInputValue(selectedTrial?.trialEndDate)}
                        className="h-11 w-full rounded-md border border-[#D8DDE8] px-4 outline-none"
                      />
                    </div>
                  </div>

                  {/* Days Left */}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-[15px] font-medium">
                        Days Left
                      </label>

                      <input
                        readOnly={!isEditMode}
                        defaultValue={
                          typeof selectedTrial?.daysLeft === "number"
                            ? `${selectedTrial.daysLeft} Days`
                            : ""
                        }
                        className="h-11 w-full rounded-md border border-[#D8DDE8] px-4 outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[15px] font-medium">
                        Status
                      </label>

                      <input
                        readOnly={!isEditMode}
                        defaultValue={selectedTrial?.status}
                        className="h-11 w-full rounded-md border border-[#D8DDE8] px-4 text-green-600 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer (Only Edit Mode) */}

            {isEditMode && (
              <div className="flex justify-end gap-4 border-t px-5 py-4">
                <button
                  onClick={() => setShowTrialModal(false)}
                  className="rounded-md border border-[#576CBC] px-8 py-2 text-[#576CBC] font-medium"
                >
                  Reset
                </button>

                <button className="rounded-md bg-[#576CBC] px-8 py-2 text-white font-medium">
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
