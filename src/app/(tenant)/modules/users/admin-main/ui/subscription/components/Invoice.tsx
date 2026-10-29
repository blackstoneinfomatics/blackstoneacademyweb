
"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  X,
} from "lucide-react";

type InvoiceStatus = "Paid" | "Unpaid";
type InvoiceType = "Subscription" | "Custom Service";

interface InvoiceData {
  id: number;
  invoiceNo: string;
  type: InvoiceType;
  description: string;
  amount: number;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
}

const initialInvoices: InvoiceData[] = Array.from(
  { length: 50 },
  (_, index) => {
    const invoiceNumber = index + 1;

    return {
      id: invoiceNumber,
      invoiceNo:
        invoiceNumber <= 3
          ? `INV-${String(invoiceNumber).padStart(3, "0")}`
          : `TKT-${String(invoiceNumber - 3).padStart(3, "0")}`,
      type: invoiceNumber === 2 ? "Custom Service" : "Subscription",
      description:
        invoiceNumber === 2
          ? "Attendance Feature"
          : "Premium Plan – Monthly",
      amount: 15000,
      invoiceDate: "Sep, 12 2023",
      dueDate: "Sep, 12 2023",
      status: invoiceNumber === 2 ? "Unpaid" : "Paid",
    };
  }
);

const Invoice = () => {
  const [invoices, setInvoices] = useState<InvoiceData[]>(initialInvoices);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceData | null>(null);

  const pageSize = 10;

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesSearch = [
        invoice.invoiceNo,
        invoice.type,
        invoice.description,
        invoice.status,
      ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || invoice.status === statusFilter;

      const matchesType =
        typeFilter === "All" || invoice.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [invoices, search, statusFilter, typeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInvoices.length / pageSize)
  );

  const safePage = Math.min(currentPage, totalPages);

  const visibleInvoices = filteredInvoices.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const updateStatus = (id: number) => {
    setInvoices((previous) =>
      previous.map((invoice) =>
        invoice.id === id
          ? {
              ...invoice,
              status: invoice.status === "Paid" ? "Unpaid" : "Paid",
            }
          : invoice
      )
    );
    setActiveMenu(null);
  };

  const deleteInvoice = (id: number) => {
    setInvoices((previous) =>
      previous.filter((invoice) => invoice.id !== id)
    );
    setActiveMenu(null);
  };

  const resetFilters = () => {
    setStatusFilter("All");
    setTypeFilter("All");
    setSearch("");
    setCurrentPage(1);
  };

  const formatAmount = (amount: number) =>
    `₹${amount.toLocaleString("en-IN")}`;

  return (
    <div>

      {/* Search and filter toolbar */}
      <div className="relative mb-0 flex flex-col gap-2 rounded-t-lg border border-gray-200 bg-[#fafafa] dark:bg-[#343434] sm:flex-row dark:border-[#3b4050]">
        <div className="relative flex min-w-0 flex-1 items-center">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by keyword"
            aria-label="Search invoices"
            className="h-11 w-full rounded-t-lg border-0 bg-transparent pl-10 pr-9 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:rounded-none dark:text-gray-100 dark:placeholder:text-gray-500"
          />

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCurrentPage(1);
              }}
              aria-label="Clear search"
              className="absolute right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="relative flex min-w-0 items-center border-t border-gray-200 sm:w-[32%] sm:border-l sm:border-t-0 dark:border-[#3b4050]">
          <button
            type="button"
            onClick={() => setShowFilters((previous) => !previous)}
            aria-expanded={showFilters}
            className="flex h-11 w-full items-center gap-2 px-3 text-sm text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#343947]"
          >
            <SlidersHorizontal size={17} />
            <span>Filter</span>
            <ChevronDown
              size={15}
              className={`ml-auto transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          {showFilters && (
            <div className="absolute left-0 top-full z-30 mt-2 w-full min-w-[240px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-[#454a5a] dark:bg-[#292d39]">
              <div className="mb-4">
                <label
                  htmlFor="invoice-status"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  Payment status
                </label>
                <select
                  id="invoice-status"
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-[#454a5a] dark:bg-[#22252f] dark:text-white"
                >
                  <option value="All">All statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="invoice-type"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  Invoice type
                </label>
                <select
                  id="invoice-type"
                  value={typeFilter}
                  onChange={(event) => {
                    setTypeFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-[#454a5a] dark:bg-[#22252f] dark:text-white"
                >
                  <option value="All">All types</option>
                  <option value="Subscription">Subscription</option>
                  <option value="Custom Service">Custom Service</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-[#454a5a] dark:text-gray-300 dark:hover:bg-[#343947]"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="flex-1 rounded-lg bg-[#4c6995] px-3 py-2 text-sm font-medium text-white hover:bg-[#3d587f]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex h-10 items-center border-t border-gray-200 px-3 text-xs text-gray-500 sm:h-11 sm:w-[33%] sm:border-l sm:border-t-0 dark:border-[#3b4050] dark:text-gray-400">
          Showing{" "}
          {filteredInvoices.length === 0
            ? 0
            : (safePage - 1) * pageSize + 1}
          {"–"}
          {Math.min(safePage * pageSize, filteredInvoices.length)} of{" "}
          {filteredInvoices.length}
        </div>
      </div>

      {/* Invoice table */}
      <div className="w-full overflow-x-auto border-x border-b border-gray-200 dark:border-[#3b4050]">
        <table className="w-full min-w-[950px] border-collapse text-left text-xs">
          <thead>
            <tr className="bg-[#4c6995] text-white">
              <th className="px-3 py-3.5 font-medium">Invoice No</th>
              <th className="px-3 py-3.5 font-medium">Type</th>
              <th className="px-3 py-3.5 font-medium">Description</th>
              <th className="px-3 py-3.5 font-medium">Amount</th>
              <th className="px-3 py-3.5 font-medium">Invoice Date</th>
              <th className="px-3 py-3.5 font-medium">Due Date</th>
              <th className="px-3 py-3.5 font-medium">Status</th>
              <th className="px-3 py-3.5 text-center font-medium">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {visibleInvoices.map((invoice, index) => (
              <tr
                key={invoice.id}
                className={`transition-colors ${
                  index % 2 === 0
                    ? "bg-white dark:bg-[#2c2c2c]"
                    : "bg-[#f7f7f7] dark:bg-[#303030]"
                }`}
              >
                <td className="whitespace-nowrap px-3 py-3.5 font-medium text-[#10204a] dark:text-gray-100">
                  {invoice.invoiceNo}
                </td>

                <td className="whitespace-nowrap px-3 py-3.5 text-[#10204a] dark:text-gray-200">
                  {invoice.type}
                </td>

                <td className="whitespace-nowrap px-3 py-3.5 text-[#10204a] dark:text-gray-300">
                  {invoice.description}
                </td>

                <td className="whitespace-nowrap px-3 py-3.5 font-medium text-[#10204a] dark:text-gray-100">
                  {formatAmount(invoice.amount)}
                </td>

                <td className="whitespace-nowrap px-3 py-3.5 text-[#426da8] dark:text-blue-300">
                  {invoice.invoiceDate}
                </td>

                <td className="whitespace-nowrap px-3 py-3.5 text-[#426da8] dark:text-blue-300">
                  {invoice.dueDate}
                </td>

                <td className="px-3 py-3.5">
                  <span
                    className={`inline-flex min-w-[60px] items-center justify-center rounded-md px-3 py-1.5 text-[10px] font-medium ${
                      invoice.status === "Paid"
                        ? "bg-[#eafbf1] text-[#23803d] dark:bg-[#183c2b] dark:text-[#70e49a]"
                        : "bg-[#fff0d9] text-[#d98200] dark:bg-[#49351d] dark:text-[#ffc46b]"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>

                <td className="relative px-3 py-2.5 text-center">
                  <button
                    type="button"
                    aria-label={`Actions for ${invoice.invoiceNo}`}
                    aria-expanded={activeMenu === invoice.id}
                    onClick={() =>
                      setActiveMenu((previous) =>
                        previous === invoice.id ? null : invoice.id
                      )
                    }
                    className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-[#454a5a] dark:hover:text-white"
                  >
                    <MoreVertical size={17} />
                  </button>

                  {activeMenu === invoice.id && (
                    <div className="absolute right-6 top-10 z-20 w-48 rounded-lg border border-gray-200 bg-white p-1.5 text-left shadow-xl dark:border-[#454a5a] dark:bg-[#292d39]">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setActiveMenu(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#3a4050]"
                      >
                        <Eye size={15} />
                        View details
                      </button>

                      <button
                        type="button"
                        onClick={() => updateStatus(invoice.id)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#3a4050]"
                      >
                        <CheckCircle2 size={15} />
                        Mark as{" "}
                        {invoice.status === "Paid" ? "unpaid" : "paid"}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteInvoice(invoice.id)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        <Trash2 size={15} />
                        Delete invoice
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {visibleInvoices.length === 0 && (
              <tr className="bg-white dark:bg-[#22252f]">
                <td
                  colSpan={8}
                  className="px-4 py-16 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  <Search size={24} className="mx-auto mb-3 opacity-50" />
                  <p className="font-medium text-gray-700 dark:text-gray-200">
                    No invoices found
                  </p>
                  <p className="mt-1">
                    Try changing your search or filter criteria.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-3 font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Clear all filters
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Showing{" "}
          {filteredInvoices.length === 0
            ? 0
            : (safePage - 1) * pageSize + 1}
          {"–"}
          {Math.min(safePage * pageSize, filteredInvoices.length)} of{" "}
          {filteredInvoices.length} invoices
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={safePage === 1}
            onClick={() => {
              setCurrentPage((page) => Math.max(1, page - 1));
              setActiveMenu(null);
            }}
            aria-label="Previous page"
            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#3b4050] dark:text-gray-300 dark:hover:bg-[#343947]"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === totalPages ||
                Math.abs(page - safePage) <= 1
            )
            .map((page, index, pages) => (
              <React.Fragment key={page}>
                {index > 0 && page - pages[index - 1] > 1 && (
                  <span className="px-1 text-gray-400">…</span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage(page);
                    setActiveMenu(null);
                  }}
                  aria-current={safePage === page ? "page" : undefined}
                  className={`min-w-9 rounded-lg px-3 py-2 text-xs font-medium transition ${
                    safePage === page
                      ? "bg-[#4c6995] text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-[#3b4050] dark:text-gray-300 dark:hover:bg-[#343947]"
                  }`}
                >
                  {page}
                </button>
              </React.Fragment>
            ))}

          <button
            type="button"
            disabled={safePage === totalPages}
            onClick={() => {
              setCurrentPage((page) => Math.min(totalPages, page + 1));
              setActiveMenu(null);
            }}
            aria-label="Next page"
            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#3b4050] dark:text-gray-300 dark:hover:bg-[#343947]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Invoice details dialog */}
      {selectedInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invoice-dialog-title"
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-[#454a5a] dark:bg-[#292d39]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-3 dark:bg-[#343e55]">
                  <Pencil
                    size={20}
                    className="text-[#4c6995] dark:text-blue-300"
                  />
                </div>
                <div>
                  <h3
                    id="invoice-dialog-title"
                    className="font-semibold text-gray-900 dark:text-white"
                  >
                    Invoice details
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedInvoice.invoiceNo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                aria-label="Close invoice details"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#3a4050]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <DetailRow label="Invoice number" value={selectedInvoice.invoiceNo} />
              <DetailRow label="Type" value={selectedInvoice.type} />
              <DetailRow label="Description" value={selectedInvoice.description} />
              <DetailRow label="Amount" value={formatAmount(selectedInvoice.amount)} />
              <DetailRow label="Invoice date" value={selectedInvoice.invoiceDate} />
              <DetailRow label="Due date" value={selectedInvoice.dueDate} />
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-[#454a5a]">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Payment status
                </span>
                <span
                  className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                    selectedInvoice.status === "Paid"
                      ? "bg-[#eafbf1] text-[#23803d] dark:bg-[#183c2b] dark:text-[#70e49a]"
                      : "bg-[#fff0d9] text-[#d98200] dark:bg-[#49351d] dark:text-[#ffc46b]"
                  }`}
                >
                  {selectedInvoice.status}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedInvoice(null)}
              className="mt-6 w-full rounded-lg bg-[#4c6995] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#3d587f]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span className="max-w-[60%] break-words text-right text-sm font-medium text-gray-900 dark:text-gray-100">
        {value}
      </span>
    </div>
  );
}

export default Invoice;
