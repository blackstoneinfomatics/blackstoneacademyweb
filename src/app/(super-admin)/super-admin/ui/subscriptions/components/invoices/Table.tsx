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
  Download,
} from "lucide-react";



type FieldProps = {
  label: string;
  value: string | number | undefined;
};

const Field = ({ label, value }: FieldProps) => (
  <div>
    <label className="mb-2 block text-[15px] font-medium text-[#101B41]">
      {label}
    </label>

    <input
      readOnly
      value={value ?? ""}
      className="h-11 w-full rounded-md border border-[#D8DDE8] bg-white px-4 text-[#4B5563] outline-none"
    />
  </div>
);
const recentItems = [
  {
    invoiceNo: "INV-00-01",
    tenant: "Blackstone Institute",
    plan: "Premium",
    billingCycle: "Month",
    invoiceDate: "2026-12-31",
    dueDate: "2026-12-31",
    amount: 2999,
    paymentStatus: "Paid",
    status: "Active",
    payment: "Paid",
  },
  {
    invoiceNo: "INV-00-02",
    tenant: "Blackstone Institute",
    plan: "Basic",
    billingCycle: "Month",
    invoiceDate: "2026-10-15",
    dueDate: "2026-10-15",
    amount: 2999,
    paymentStatus: "Paid",
    status: "Expired",
    payment: "Pending",
  },
  {
    invoiceNo: "INV-00-03",
    tenant: "Blackstone Institute",
    plan: "Standard",
    billingCycle: "Month",
    invoiceDate: "2027-01-20",
    dueDate: "2027-01-20",
    amount: 2999,
    paymentStatus: "Paid",
    status: "Active",
    payment: "notPaid",
  },
  {
    invoiceNo: "INV-00-04",
    tenant: "Blackstone Institute",
    plan: "Premium",
    billingCycle: "Month",
    invoiceDate: "2026-09-10",
    dueDate: "2026-09-10",
    amount: 2999,
    paymentStatus: "Paid",
    status: "Suspended",
    payment: "Pending",
  },
  {
    invoiceNo: "INV-00-05",
    tenant: "Blackstone Institute",
    plan: "Standard",
    billingCycle: "Month",
    invoiceDate: "2026-11-25",
    dueDate: "2026-11-25",
    amount: 2999,
    paymentStatus: "Paid",
    status: "Active",
    payment: "notPaid",
  },
];

type FilterState = {
  invoiceNo: string;
  tenant: string;
  plan: string;
  billingCycle: string;
  fromDate: string;
  toDate: string;
  status: string;
  payment: string;
};

const INITIAL_FILTERS: FilterState = {
  invoiceNo: "",
  tenant: "",
  plan: "All",
  billingCycle: "All",
  fromDate: "",
  toDate: "",
  status: "All",
  payment: "All",
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
        item.invoiceNo,
        item.tenant,
        item.plan,
        item.billingCycle,
        item.invoiceDate,
        item.dueDate,
        item.amount,
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);

    const matchesInvoiceNo =
      !filters.invoiceNo ||
      item.invoiceNo.toLowerCase().includes(filters.invoiceNo.toLowerCase());

    const matchesTenant =
      !filters.tenant ||
      item.tenant.toLowerCase().includes(filters.tenant.toLowerCase());

    const matchesPlan = filters.plan === "All" || item.plan === filters.plan;
    const matchesBillingCycle =
      filters.billingCycle === "All" || item.billingCycle === filters.billingCycle;
    const matchesStatus =
      filters.status === "All" || item.status === filters.status;
    const matchesPayment =
      filters.payment === "All" || item.payment === filters.payment;

    const rowDate = new Date(item.invoiceDate);
    const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
    const toDate = filters.toDate ? new Date(filters.toDate) : null;

    const matchesDate =
      (!fromDate || rowDate >= fromDate) && (!toDate || rowDate <= toDate);

    return (
      matchesSearch &&
      matchesInvoiceNo &&
      matchesTenant &&
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
  const [draftFilters, setDraftFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const itemsPerPage = 5;
  const planOptions = Array.from(new Set(recentItems.map((item) => item.plan)));
  const billingOptions = Array.from(
    new Set(recentItems.map((item) => item.billingCycle)),
  );
  const statusOptions = Array.from(new Set(recentItems.map((item) => item.status)));
  const paymentOptions = Array.from(new Set(recentItems.map((item) => item.payment)));
const [showViewDetails, setShowViewDetails] = useState(false);
const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
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

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const showingStart = filteredItems.length === 0 ? 0 : startIndex + 1;
  const visibleIds = paginatedItems.map((item) => item.invoiceNo);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedRows.includes(id));
  const someVisibleSelected = visibleIds.some((id) => selectedRows.includes(id));

  const selectedItems = recentItems.filter((item) => selectedRows.includes(item.invoiceNo));

  const buildCsv = (rows: typeof recentItems) => {
    const headers = [
      "Invoice No",
      "Tenant",
      "Plan",
      "Billing Cycle",
      "Invoice Date",
      "Due Date",
      "Amount",
      "Payment Status",
    ];

    const lines = [
      headers.join(","),
      ...rows.map((row) =>
        [
          row.invoiceNo,
          row.tenant,
          row.plan,
          row.billingCycle,
          row.invoiceDate,
          row.dueDate,
          row.amount,
          row.paymentStatus,
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ];

    return lines.join("\n");
  };

  const handleDownloadSelected = () => {
    if (selectedItems.length === 0) return;

    const blob = new Blob([buildCsv(selectedItems)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "selected-invoices.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    setCurrentPage(1);
    setOpenMenu(null);
    setSelectedRows([]);
  }, [search, appliedFilters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-2 py-1">
        <h2 className="text-[19px] font-semibold text-[#000] dark:text-[#fff]">
          Invoices
        </h2>

        <button
          onClick={handleDownloadSelected}
          disabled={selectedItems.length === 0}
          className="flex items-center gap-2 rounded-md bg-[#496A96] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={16} />
          Download Invoice
        </button>
      </div>

      <div className="overflow-hidden rounded-b-xl rounded-t-xl border-t border-[#E6EAF2] bg-white shadow-lg dark:border-[#3F3F3F] dark:bg-[#343434]">
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
                  <th className="border border-[#466993] px-2 py-4 text-left font-medium">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = !allVisibleSelected && someVisibleSelected;
                      }}
                      onChange={(e) => {
                        const nextIds = e.target.checked
                          ? Array.from(new Set([...selectedRows, ...visibleIds]))
                          : selectedRows.filter((id) => !visibleIds.includes(id));

                        setSelectedRows(nextIds);
                      }}
                      className="h-4 w-4 accent-[#496A96]"
                    />
                  </th>
                  {[
                    "Invoice No",
                    "Tenant",
                    "Plan",
                    "Billing Cycle",
                    "Invoice Date",
                    "Due Date",
                    "Amount",
                    "Payment Status",
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
                    const rowId = item.invoiceNo;

                    return (
                      <tr
                        key={rowId}
                        className="text-[12px] odd:bg-[#f8f8f8] even:bg-[#ffffff] dark:odd:bg-[#2c2c2c] dark:even:bg-[#303030]"
                      >
                        <td className="px-2 py-4">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(rowId)}
                            onChange={(e) => {
                              setSelectedRows((prev) =>
                                e.target.checked
                                  ? Array.from(new Set([...prev, rowId]))
                                  : prev.filter((id) => id !== rowId),
                              );
                            }}
                            className="h-4 w-4 accent-[#496A96]"
                          />
                        </td>
                        <td className="px-2 py-4">{item.invoiceNo}</td>
                        <td className="px-2 py-4">{item.tenant}</td>
                        <td className="px-2 py-4">{item.plan}</td>
                        <td className="px-2 py-4">{item.billingCycle}</td>
                        <td className="px-2 py-4">{item.invoiceDate}</td>
                        <td className="px-2 py-4">{item.dueDate}</td>
                        <td className="px-2 py-4">{item.amount}</td>
                        <td className="px-2 py-4">
                          <span
                            className={`rounded-md px-2 py-[3px] text-[12px] ${
                              item.payment === "Paid"
                                ? "bg-[#E4F4E8] text-[#40BD5F] dark:bg-[#36477e33]"
                                : item.payment === "notPaid"
                                  ? "bg-[#F6E0E0] text-[#EA4F4F] dark:bg-[#D3464533]"
                                  : "bg-[#F6EcDC] text-[#EFA133] dark:bg-[#F0AD4E33]"
                            }`}
                          >
                            {item.payment}
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
                            <div className="absolute right-4 top-12 z-50 w-36 rounded-lg border bg-white shadow-lg dark:border-gray-700 dark:bg-[#2c2c2c]">
                              <button
                                className="w-full px-4 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => {
  setSelectedInvoice(item);
  setShowViewDetails(true);
  setOpenMenu(null);
}}
                              >
                                View Details
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
                    <td colSpan={9} className="p-4 text-center">
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
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
                <label className="mb-2 block text-lg text-[#101B41]">Invoice No</label>
                <input
                  value={draftFilters.invoiceNo}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      invoiceNo: e.target.value,
                    }))
                  }
                  placeholder="Select Status"
                  className="h-[42px] w-full rounded-md border border-[#D8DDE8] px-3 text-sm text-[#38486A] outline-none placeholder:text-[#8693AE]"
                />
              </div>

              <div>
                <label className="mb-2 block text-lg text-[#101B41]">Tenant</label>
                <input
                  value={draftFilters.tenant}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      tenant: e.target.value,
                    }))
                  }
                  placeholder="Tenant name"
                  className="h-[42px] w-full rounded-md border border-[#D8DDE8] px-3 text-sm text-[#38486A] outline-none placeholder:text-[#8693AE]"
                />
              </div>

              <div>
                <label className="mb-2 block text-lg text-[#101B41]">Plan</label>
                <div className="relative">
                  <select
                    value={draftFilters.plan}
                    onChange={(e) =>
                      setDraftFilters((prev) => ({ ...prev, plan: e.target.value }))
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
                <label className="mb-2 block text-lg text-[#101B41]">Date</label>
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
                <label className="mb-2 block text-lg text-[#101B41]">Status</label>
                <div className="relative">
                  <select
                    value={draftFilters.status}
                    onChange={(e) =>
                      setDraftFilters((prev) => ({ ...prev, status: e.target.value }))
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

              <div>
                <label className="mb-2 block text-lg text-[#101B41]">Payment</label>
                <div className="relative">
                  <select
                    value={draftFilters.payment}
                    onChange={(e) =>
                      setDraftFilters((prev) => ({ ...prev, payment: e.target.value }))
                    }
                    className="h-[42px] w-full appearance-none rounded-md border border-[#D8DDE8] px-3 pr-9 text-sm text-[#38486A] outline-none"
                  >
                    <option value="All">Select Payment</option>
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
                Show {previewFilteredItems.length} results
              </button>
            </div>
          </div>
        </div>
      )}


      {showViewDetails && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-[780px] rounded-2xl bg-white shadow-2xl">

      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-5">
        <h2 className="text-[18px] font-semibold text-[#101B41]">
          Subscriptions Details
        </h2>

        <button
          onClick={() => setShowViewDetails(false)}
          className="text-gray-400 hover:text-black"
        >
          <X size={24} />
        </button>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="rounded-xl border border-[#E5E7EB] p-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">

            <Field
              label="Invoice ID"
              value={selectedInvoice?.invoiceNo}
            />

            <Field
              label="Tenant Name"
              value={selectedInvoice?.tenant}
            />

            <Field
              label="Plan"
              value={selectedInvoice?.plan}
            />

            <Field
              label="Billing Cycle"
              value={selectedInvoice?.billingCycle}
            />

            <Field
              label="Invoice Date"
              value={selectedInvoice?.invoiceDate}
            />

            <Field
              label="Due Date"
              value={selectedInvoice?.dueDate}
            />

            <Field
              label="Amount"
              value={`$${selectedInvoice?.amount}`}
            />

            <div>
              <label className="mb-2 block text-[15px] font-medium text-[#101B41]">
                Payment Status
              </label>

              <input
                readOnly
                value={selectedInvoice?.payment}
                className={`h-11 w-full rounded-md border border-[#D8DDE8] bg-white px-4 outline-none ${
                  selectedInvoice?.payment === "Paid"
                    ? "text-green-600"
                    : selectedInvoice?.payment === "Pending"
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Table;
