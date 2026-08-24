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
  AArrowUpIcon,
  Info,
  Upload,
} from "lucide-react";
import { downloadPdf } from "../downloadCsv";

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
    refundId: "REF-00-01",
    tenant: "Blackstone Institute",
    invoiceId: "INV-00-01",
    paymentDate: "2026-12-31",
    requestDate: "2026-12-31",
    refundWindow: "2",
    amount: 2999,
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    status: "Active",
    payment: "Paid",
  },
  {
    refundId: "REF-00-02",
    tenant: "Blackstone Institute",
    invoiceId: "INV-00-02",
    paymentDate: "2026-10-15",
    requestDate: "2026-10-15",
    refundWindow: "6",
    amount: 2999,
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    status: "Expired",
    payment: "Pending",
  },
  {
    refundId: "REF-00-03",
    tenant: "Blackstone Institute",
    invoiceId: "INV-00-03",
    paymentDate: "2027-01-20",
    requestDate: "2027-01-20",
    refundWindow: "2",
    amount: 2999,
    paymentMethod: "Net Banking",
    paymentStatus: "Paid",
    status: "Active",
    payment: "notPaid",
  },
  {
    refundId: "REF-00-04",
    tenant: "Blackstone Institute",
    invoiceId: "INV-00-04",
    paymentDate: "2026-09-10",
    requestDate: "2026-09-10",
    refundWindow: "8",
    amount: 2999,
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    status: "Suspended",
    payment: "Pending",
  },
  {
    refundId: "REF-00-05",
    tenant: "Blackstone Institute",
    invoiceId: "INV-00-05",
    paymentDate: "2026-11-25",
    requestDate: "2026-11-25",
    refundWindow: "20",
    amount: 2999,
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    status: "Active",
    payment: "notPaid",
  },
];

type FilterState = {
  refundId: string;
  tenant: string;
  invoiceId: string;
  paymentDate: string;
  requestDate: string;
  refundWindow: string;
  amount: string;
  paymentStatus: string;
  status: string;
  payment: string;
};

const INITIAL_FILTERS: FilterState = {
  refundId: "",
  tenant: "",
  invoiceId: "All",
  paymentDate: "All",
  requestDate: "",
  refundWindow: "",
  amount: "",
  paymentStatus: "",
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
        item.refundId,
        item.tenant,
        item.invoiceId,
        item.paymentDate,
        item.requestDate,
        item.refundWindow,
        item.amount,
        item.paymentStatus,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);

    const matchesRefundId =
      !filters.refundId ||
      item.refundId.toLowerCase().includes(filters.refundId.toLowerCase());

    const matchesTenant =
      !filters.tenant ||
      item.tenant.toLowerCase().includes(filters.tenant.toLowerCase());

    const matchesInvoiceId =
      filters.invoiceId === "All" || item.invoiceId === filters.invoiceId;
    const matchesPaymentDate =
      filters.paymentDate === "All" ||
      !filters.paymentDate ||
      item.paymentDate === filters.paymentDate;
    const matchesStatus =
      filters.status === "All" || item.status === filters.status;
    const matchesPayment =
      filters.payment === "All" || item.payment === filters.payment;

    const rowPaymentDate = new Date(item.paymentDate);
    const rowRequestDate = new Date(item.requestDate);
    const hasPaymentDateFilter =
      !!filters.paymentDate && filters.paymentDate !== "All";
    const hasRequestDateFilter =
      !!filters.requestDate && filters.requestDate !== "All";
    const paymentDate = hasPaymentDateFilter
      ? new Date(filters.paymentDate)
      : null;
    const requestDate = hasRequestDateFilter
      ? new Date(filters.requestDate)
      : null;

    const validPaymentDate =
      paymentDate && !Number.isNaN(paymentDate.getTime()) ? paymentDate : null;
    const validRequestDate =
      requestDate && !Number.isNaN(requestDate.getTime()) ? requestDate : null;

    const matchesDate =
      (!validPaymentDate || rowPaymentDate >= validPaymentDate) &&
      (!validRequestDate || rowRequestDate <= validRequestDate);

    return (
      matchesSearch &&
      matchesInvoiceId &&
      matchesTenant &&
      matchesPaymentDate &&
      matchesStatus &&
      matchesPayment &&
      matchesDate
    );
  });
};

const RefundTable = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [draftFilters, setDraftFilters] =
    useState<FilterState>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const itemsPerPage = 5;
  const planOptions = Array.from(
    new Set(recentItems.map((item) => item.invoiceId)),
  );
  const billingOptions = Array.from(
    new Set(recentItems.map((item) => item.paymentDate)),
  );
  const statusOptions = Array.from(
    new Set(recentItems.map((item) => item.status)),
  );
  const paymentOptions = Array.from(
    new Set(recentItems.map((item) => item.payment)),
  );
  const [showViewDetails, setShowViewDetails] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const filteredItems = applyFilters(recentItems, search, appliedFilters);
  const previewFilteredItems = applyFilters(recentItems, search, draftFilters);

  const activeFilterCount = Object.entries(appliedFilters).filter(
    ([key, value]) =>
      value &&
      !(
        (key === "tenant" && value === "") ||
        (key !== "tenant" && value === "All")
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
  const visibleIds = paginatedItems.map((item) => item.refundId);
  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedRows.includes(id));
  const someVisibleSelected = visibleIds.some((id) =>
    selectedRows.includes(id),
  );

  const selectedItems = recentItems.filter((item) =>
    selectedRows.includes(item.refundId),
  );

  const handleDownloadSelected = async () => {
    if (selectedItems.length === 0) return;

    await downloadPdf(
      "selected-refunds.pdf",
      [
        "Refund ID",
        "Tenant",
        "Invoice ID",
        "Payment Date",
        "Request Date",
        "Refund Window",
        "Amount",
        "Payment Status",
      ],
      selectedItems.map((row) => [
        row.refundId,
        row.tenant,
        row.invoiceId,
        row.paymentDate,
        row.requestDate,
        row.refundWindow,
        row.amount,
        row.paymentStatus,
      ]),
    );
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
        <h2
          className="mb-4 font-medium text-[#010E30E5]/90 dark:text-[#e6e6e6]"
          style={{
            fontSize: "clamp(14px, 1.2vw, 16px)",
            lineHeight: "1.4",
          }}
        >
          {" "}
         All Invoices
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
                        if (input)
                          input.indeterminate =
                            !allVisibleSelected && someVisibleSelected;
                      }}
                      onChange={(e) => {
                        const nextIds = e.target.checked
                          ? Array.from(
                              new Set([...selectedRows, ...visibleIds]),
                            )
                          : selectedRows.filter(
                              (id) => !visibleIds.includes(id),
                            );

                        setSelectedRows(nextIds);
                      }}
                      className="h-4 w-4 accent-[#496A96]"
                    />
                  </th>
                  {[
                    "Refund ID",
                    "Tenant",
                    "Invoice ID",
                    "Payment Date",
                    "Request Date",
                    "Refund Window",
                    "Amount",
                    "Payment Method",
                    "Status",
                    "Refund Status",
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
                  paginatedItems.map((item) => {
                    const rowId = item.refundId;

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
                        <td className="px-2 py-4">{item.refundId}</td>
                        <td className="px-2 py-4">{item.tenant}</td>
                        <td className="px-2 py-4">{item.invoiceId}</td>
                        <td className="px-2 py-4">{item.paymentDate}</td>
                        <td className="px-2 py-4">{item.requestDate}</td>
                        <td className="px-2 py-4">{item.refundWindow}</td>
                        <td className="px-2 py-4">{item.amount}</td>
                        <td className="px-2 py-4">{item.paymentMethod}</td>
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
                        <td className="px-2 py-4">
                          <span
                            className={`rounded-md px-2 py-[3px] text-[12px] ${
                              item.status === "Active"
                                ? "bg-[#E4F4E8] text-[#40BD5F] dark:bg-[#36477e33]"
                                : item.status === "Expired"
                                  ? "bg-[#F6E0E0] text-[#EA4F4F] dark:bg-[#D3464533]"
                                  : "bg-[#F6EcDC] text-[#EFA133] dark:bg-[#F0AD4E33]"
                            }`}
                          >
                            {item.status}
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
              <h3 className="text-lg font-semibold text-[#101B41]">
                Filter by
              </h3>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="text-[#404754] hover:text-[#637197]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-[#101B41]">
                  Refund Id
                </label>
                <input
                  value={draftFilters.refundId}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      refundId: e.target.value,
                    }))
                  }
                  placeholder="Refund Id"
                  className="h-8 w-full rounded-md border border-[#D8DDE8] px-3 text-xs text-[#38486A] outline-none placeholder:text-[#8693AE]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-[#101B41]">
                  Tenant
                </label>
                <input
                  value={draftFilters.tenant}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      tenant: e.target.value,
                    }))
                  }
                  placeholder="Tenant name"
                  className="h-8 w-full rounded-md border border-[#D8DDE8] px-3 text-xs text-[#38486A] outline-none placeholder:text-[#8693AE]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-[#101B41]">
                  Invoice Id
                </label>
                <input
                  value={draftFilters.invoiceId}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      invoiceId: e.target.value,
                    }))
                  }
                  placeholder="Invoice Id"
                  className="h-8 w-full rounded-md border border-[#D8DDE8] px-3 text-xs text-[#38486A] outline-none placeholder:text-[#8693AE]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-[#101B41]">
                  Date
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="date"
                      value={draftFilters.paymentDate}
                      onChange={(e) =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          paymentDate: e.target.value,
                        }))
                      }
                      className="h-8 w-full rounded-md border border-[#D8DDE8] px-3 pr-9 text-xs text-[#38486A] outline-none"
                    />
                    <CalendarDays
                      size={17}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F]"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="date"
                      value={draftFilters.requestDate}
                      onChange={(e) =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          requestDate: e.target.value,
                        }))
                      }
                      className="h-8 w-full rounded-md border border-[#D8DDE8] px-3 pr-9 text-xs text-[#38486A] outline-none"
                    />
                    <CalendarDays
                      size={17}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F]"
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
                    className="h-8 w-full appearance-none rounded-md border border-[#D8DDE8] px-3 pr-9 text-xs text-[#38486A] outline-none"
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
                <label className="mb-2 block text-sm text-[#101B41]">
                  Payment
                </label>
                <div className="relative">
                  <select
                    value={draftFilters.payment}
                    onChange={(e) =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        payment: e.target.value,
                      }))
                    }
                    className="h-8 w-full appearance-none rounded-md border border-[#D8DDE8] px-3 pr-9 text-xs text-[#38486A] outline-none"
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

      {showViewDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4 backdrop-blur-[1px]">
          {/* Main Container */}
          <div className="relative max-h-[92vh] w-full max-w-[1040px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            {/* Top Header */}
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-[18px] font-semibold text-[#101B41]">
                  Refund Details
                </h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  Requested on{" "}
                  {selectedInvoice?.requestDate || "May 16, 2024 10:30 AM"}
                </p>
              </div>
              <button
                onClick={() => setShowViewDetails(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-black transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Grid Section */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* LEFT COLUMN */}
              <div className="space-y-4 lg:col-span-7">
                {/* Refund Request Window Banner */}
                <div className="flex items-center justify-between rounded-xl bg-[#EEF2FF] p-3.5 text-xs">
                  <div className="max-w-[210px]">
                    <p className="font-semibold text-[#101B41]">
                      Refund Request Window
                    </p>
                    <p className="mt-0.5 text-[10px] leading-tight text-gray-500">
                      Refund requests must be raised within 7 days from the
                      invoice payment date.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[10px] text-gray-500">Payment Date</p>
                      <p className="font-semibold text-[#101B41]">
                        {selectedInvoice?.paymentDate || "May 01, 2024"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">
                        Request Deadline
                      </p>
                      <p className="font-semibold text-[#101B41]">
                        {selectedInvoice?.requestDeadline || "May 01, 2024"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#E8F8EE] px-2.5 py-2 text-center border border-[#D1F2DC]">
                      <p className="text-[10px] font-semibold text-[#1E293B]">
                        Status
                      </p>
                      <p className="text-[10px] font-medium text-[#101B41]">
                        2 Days Left to
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tenant Details Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <h3 className="mb-3 text-sm font-bold text-[#101B41]">
                    Tenant Details
                  </h3>
                  <div className="grid grid-cols-3 gap-y-3 text-xs">
                    <div>
                      <p className="text-gray-400">Tenant</p>
                      <p className="mt-0.5 font-medium text-[#101B41]">
                        {selectedInvoice?.tenant || "Blackstone Academy"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Domain</p>
                      <p className="mt-0.5 font-medium text-[#101B41]">
                        {selectedInvoice?.domain || "blackstoneacademy.com"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Contact Person</p>
                      <p className="mt-0.5 font-medium text-[#101B41]">
                        {selectedInvoice?.contactPerson || "John Michael"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Email</p>
                      <p className="mt-0.5 font-medium text-[#101B41]">
                        {selectedInvoice?.email || "john@blackstoneacademy.com"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Phone Number</p>
                      <p className="mt-0.5 font-medium text-[#101B41]">
                        {selectedInvoice?.phone || "+91 12345 67890"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Plan</p>
                      <p className="mt-0.5 font-medium text-[#101B41]">
                        {selectedInvoice?.plan || "Standard Plan (Monthly)"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Invoice Information Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <h3 className="mb-3 text-sm font-bold text-[#101B41]">
                    Invoice Information
                  </h3>
                  <div className="grid grid-cols-3 gap-y-3 text-xs">
                    <div>
                      <p className="text-gray-400">Invoice Number</p>
                      <p className="mt-0.5 font-medium text-[#101B41]">
                        {selectedInvoice?.invoiceId || "INV-2024-00156"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Invoice Date</p>
                      <p className="mt-0.5 font-medium text-[#101B41]">
                        {selectedInvoice?.invoiceDate || "May 01, 2024"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Invoice Amount</p>
                      <p className="mt-0.5 font-medium text-[#101B41]">
                        ₹{selectedInvoice?.amount || "12,999.00"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Paid Amount</p>
                      <p className="mt-0.5 font-medium text-[#101B41]">
                        ₹{selectedInvoice?.paidAmount || "12,999.00"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Payment Method</p>
                      <p className="mt-0.5 font-medium text-[#101B41]">
                        {selectedInvoice?.paymentMethod || "UPI (Razorpay)"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Transaction ID</p>
                      <p className="mt-0.5 font-medium text-[#101B41]">
                        {selectedInvoice?.txnId || "TXN-2024-005678"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Refund Request Section */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <h3 className="mb-3 text-sm font-bold text-[#101B41]">
                    Refund Request
                  </h3>
                  <div className="mb-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="mb-1 block text-gray-500">Reason</label>
                      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[#101B41]">
                        {selectedInvoice?.reason || "Plan change"}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-gray-500">
                        Description
                      </label>
                      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[#101B41]">
                        {selectedInvoice?.description ||
                          "We upgraded our plan. Requesting refund for the previous plan."}
                      </div>
                    </div>
                  </div>

                  {/* Attachment */}
                  <div>
                    <p className="mb-1.5 text-xs text-gray-500">Attachment</p>
                    <div className="flex w-fit items-center gap-3 rounded-xl bg-[#F1F5F9] p-2.5 pr-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4F46E5] text-white">
                        <Upload size={16} />
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-[#101B41]">
                          refund-request.pdf
                        </p>
                        <p className="text-[10px] text-gray-400">156 KB</p>
                      </div>
                      <button className="ml-2 text-gray-500 hover:text-black">
                        <Upload size={14} className="rotate-180" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-3.5 lg:col-span-5">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3.5">
                  <h3 className="text-sm font-bold text-[#101B41]">
                    Process Refund
                  </h3>

                  {/* Blue Info Notice */}
                  <div className="flex items-start gap-2 rounded-lg bg-[#EEF2FF] p-2.5 text-[11px] text-[#3730A3]">
                    <Info
                      size={14}
                      className="mt-0.5 shrink-0 text-[#4338CA]"
                    />
                    <p>
                      You are about to process a refund for this tenant. Please
                      review the details and confirm the refund.
                    </p>
                  </div>

                  {/* Refund Method Selection */}
                  <div>
                    <p className="mb-2 text-xs font-semibold text-[#101B41]">
                      Refund Method
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-start gap-2.5 rounded-lg border border-indigo-600 bg-white p-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mt-0.5 rounded accent-indigo-600 h-3.5 w-3.5"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#101B41]">
                            Gateway Refund (Razorpay)
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Amount will be refunded to the original payment
                            method (UPI).
                          </p>
                        </div>
                      </label>
                      <label className="flex items-start gap-2.5 rounded-lg border border-gray-200 bg-white p-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 rounded accent-indigo-600 h-3.5 w-3.5"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#101B41]">
                            Manual Refund (Bank Transfer)
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Amount will be transferred manually to tenant's bank
                            account.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Refund Amount Input Section */}
                  <div>
                    <p className="mb-1 text-xs font-semibold text-[#101B41]">
                      Refund Amount
                    </p>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400">
                        Refundable Amount
                      </p>
                      <div className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-[#101B41]">
                        ₹{selectedInvoice?.amount || "12,999.00"}
                      </div>
                    </div>
                  </div>

                  {/* Refund Summary Calculation */}
                  <div>
                    <p className="mb-2 text-xs font-semibold text-[#101B41]">
                      Refund Summary
                    </p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Paid Amount</span>
                        <span className="font-semibold text-[#101B41]">
                          ₹12,999.00
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Less: Non-Refundable Charges</span>
                        <span className="font-semibold text-[#101B41]">
                          ₹306.78
                        </span>
                      </div>
                      <div className="flex justify-between pt-1.5 text-xs font-bold text-[#101B41]">
                        <span>Total Amount</span>
                        <span>₹4,999.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Refund Amount Highlight Box */}
                  <div className="rounded-xl border border-[#D1F2DC] bg-[#E8F8EE] p-3">
                    <p className="text-[11px] font-semibold text-[#101B41]">
                      Total Refund Amount
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-base font-extrabold text-[#15803D]">
                        ₹12,692.22
                      </span>
                      <span className="text-[9px] font-medium text-[#15803D] text-right max-w-[150px] leading-tight">
                        Twelve Thousand Six Hundred Ninety Two and Twenty Two
                        Paise Only
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowViewDetails(false)}
                      className="flex-1 rounded-lg border border-indigo-200 bg-[#EEF2FF] py-2 text-xs font-medium text-[#4338CA] hover:bg-indigo-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded-lg border border-red-200 bg-[#FEF2F2] py-2 text-xs font-medium text-[#DC2626] hover:bg-red-100 transition"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded-lg bg-[#2E7D32] py-2 text-xs font-medium text-white hover:bg-[#1B5E20] transition"
                    >
                      Approved
                    </button>
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

export default RefundTable;
