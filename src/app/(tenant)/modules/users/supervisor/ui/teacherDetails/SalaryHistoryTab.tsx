"use client";

import { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Download,
  X,
  Printer,
  FileText,
} from "lucide-react";
import { TeacherProfile } from "./teacherDetailsTypes";

type SalaryPayment = {
  id: string;
  paymentId: string;
  salaryMonth: string;
  paymentDate: string;
  baseSalary: number;
  incentives: number;
  deductions: number;
  netAmountPaid: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionReference?: string;
};

type SalaryFilters = {
  paymentId: string;
  salaryMonth: string;
  paymentDate: string;
  baseSalary: string;
  incentives: string;
  deductions: string;
  netAmountPaid: string;
  paymentMethod: string;
  paymentStatus: string;
};

const emptyFilters = (): SalaryFilters => ({
  paymentId: "",
  salaryMonth: "",
  paymentDate: "",
  baseSalary: "",
  incentives: "",
  deductions: "",
  netAmountPaid: "",
  paymentMethod: "",
  paymentStatus: "",
});

const PAGE_SIZE = 10;

// Sample data — replace with your API response
const salaryPayments: SalaryPayment[] = Array.from(
  { length: 50 },
  (_, index) => ({
    id: String(index + 1),
    paymentId: `PAY-${1001 + index}`,
    salaryMonth: "Sep 2026",
    paymentDate: "05 Oct 2026",
    baseSalary: 25000,
    incentives: 2000,
    deductions: 500,
    netAmountPaid: 26500,
    paymentMethod: "Bank Transfer",
    paymentStatus: "Paid",
    transactionReference: `TRX-${1001 + index}`,
  })
);

const tableHeaders = [
  "Payment ID",
  "Salary Month",
  "Payment Date",
  "Base Salary",
  "Incentives",
  "Deductions",
  "Net Amount Paid",
  "Payment Method",
  "Payment Status",
  "Action",
];

const cellClass = "whitespace-nowrap px-3 py-3.5";

type SalaryHistoryTabProps = {
  payments?: SalaryPayment[];
  loading?: boolean;
  teacher?: TeacherProfile;
};

export default function SalaryHistoryTab({
  payments = salaryPayments,
  loading = false,
  teacher,
}: SalaryHistoryTabProps) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<SalaryFilters>(emptyFilters);
  const [filterDraft, setFilterDraft] = useState<SalaryFilters>(emptyFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<SalaryPayment | null>(
    null
  );

  // Search and Filter
  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      const matchesSearch = Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesField = (field: keyof SalaryFilters) => {
        const filterValue = filters[field].trim().toLowerCase();
        if (!filterValue) return true;

        if (field === "paymentDate") {
          const date = new Date(item.paymentDate);
          if (!Number.isNaN(date.getTime())) {
            return date.toISOString().slice(0, 10) === filterValue;
          }
        }

        return String(item[field]).toLowerCase().includes(filterValue);
      };

      return (
        matchesSearch &&
        (Object.keys(filters) as (keyof SalaryFilters)[]).every(matchesField)
      );
    });
  }, [payments, search, filters]);

  const openFilters = () => {
    setFilterDraft(filters);
    setIsFilterOpen(true);
  };

  const applyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilters(filterDraft);
    setPage(1);
    setActiveMenu(null);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    const clearedFilters = emptyFilters();
    setFilterDraft(clearedFilters);
    setFilters(clearedFilters);
    setPage(1);
    setActiveMenu(null);
  };

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleAction = (
    action: string,
    payment: SalaryPayment
  ) => {
    setActiveMenu(null);

    if (action === "View Payment") {
      setSelectedPayment(payment);
      return;
    }

    console.log(action, payment);

    // Bind payslip download to the payment document when available.
  };

  return (
    <div className="w-full space-y-3">
      <section className="rounded-xl bg-[#f0f1f8] dark:bg-[#272b35]">

        {/* Search and Filter */}
        <div className="grid grid-cols-1 overflow-hidden rounded-t-lg bg-[#f8f8f8] dark:bg-[#30343f] md:grid-cols-3">

          {/* Search */}
          <div className="flex items-center gap-2 border-b border-[#e7e7e7] px-3 py-3 dark:border-[#454a57] md:border-b-0 md:border-r">
            <Search
              size={18}
              className="shrink-0 text-[#a5a5a5]"
            />

            <input
              type="text"
              placeholder="Search by keyword"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                setActiveMenu(null);
              }}
              className="w-full bg-transparent text-[13px] text-[#35415e] outline-none placeholder:text-[#999999] dark:text-white"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center border-b border-[#e7e7e7] px-3 py-3 dark:border-[#454a57] md:border-b-0 md:border-r">
            <button
              type="button"
              onClick={openFilters}
              className="flex w-full items-center gap-2 text-left text-[13px] text-[#999999] hover:text-[#5268bb] dark:text-gray-300"
            >
              <SlidersHorizontal
                size={18}
                className="shrink-0 text-[#a5a5a5]"
              />
              <span>Filter</span>
              {Object.values(filters).some(Boolean) && (
                <span className="ml-auto rounded-full bg-[#5268bb] px-1.5 py-0.5 text-[10px] text-white">
                  {Object.values(filters).filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Showing Count */}
          <div className="flex items-center px-5 py-3">
            <p className="text-[13px] text-[#999999] dark:text-gray-400">
              Showing {paginatedPayments.length} Of{" "}
              {filteredPayments.length}
            </p>
          </div>
        </div>

        {/* Salary Payment Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left">

            {/* Table Header */}
            <thead>
              <tr className="bg-[#49658d] text-white dark:bg-[#3d4e70]">
                {tableHeaders.map((heading) => (
                  <th
                    key={heading}
                    className={`whitespace-nowrap px-3 py-4 text-xs font-medium ${
                      heading === "Action" ? "text-center" : ""
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={10}
                    className="bg-white py-12 text-center text-sm text-gray-500 dark:bg-[#30343f]"
                  >
                    Loading salary history...
                  </td>
                </tr>
              ) : paginatedPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="bg-white py-12 text-center text-sm text-gray-500 dark:bg-[#30343f]"
                  >
                    No salary payment records found.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`text-xs text-[#17223e] dark:text-gray-300 ${
                      index % 2 === 0
                        ? "bg-white dark:bg-[#30343f]"
                        : "bg-[#f6f6f6] dark:bg-[#292d37]"
                    }`}
                  >
                    <td className={cellClass}>
                      {item.paymentId}
                    </td>

                    <td className={cellClass}>
                      {item.salaryMonth}
                    </td>

                    <td className={cellClass}>
                      {item.paymentDate}
                    </td>

                    <td className={cellClass}>
                      {formatCurrency(item.baseSalary)}
                    </td>

                    <td className={cellClass}>
                      {formatCurrency(item.incentives)}
                    </td>

                    <td className={cellClass}>
                      {formatCurrency(item.deductions)}
                    </td>

                    <td className={cellClass}>
                      {formatCurrency(item.netAmountPaid)}
                    </td>

                    <td className={cellClass}>
                      {item.paymentMethod}
                    </td>

                    {/* Payment Status */}
                    <td className={cellClass}>
                      <PaymentStatus status={item.paymentStatus} />
                    </td>

                    {/* Action */}
                    <td className="relative px-3 py-3 text-center">
                      <button
                        type="button"
                        aria-label={`Actions for ${item.paymentId}`}
                        aria-expanded={activeMenu === item.id}
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === item.id ? null : item.id
                          )
                        }
                        className="inline-flex rounded-md p-1 text-[#626870] hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-[#454a57]"
                      >
                        <MoreVertical size={19} strokeWidth={2.5} />
                      </button>

                      {activeMenu === item.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setActiveMenu(null)}
                          />

                          <div
                            className={`absolute right-10 z-50 w-28 rounded-lg border border-[#e7eaf2] bg-white text-center shadow-md dark:border-[#454a57] dark:bg-[#30343f] ${
                              index >= paginatedPayments.length - 2
                                ? "bottom-10"
                                : "top-10"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleAction("View Payment", item)
                              }
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-[#35415e] hover:bg-[#f0f1f8] dark:text-gray-300 dark:hover:bg-[#454a57]"
                            >
                              View Payment
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedPayment && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedPayment(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-details-title"
            className="max-h-[92vh] w-full max-w-[700px] overflow-y-auto rounded-lg bg-white p-3 shadow-2xl dark:bg-[#30343f] sm:p-4"
          >
            <header className="mb-2 flex items-center justify-between">
              <h2
                id="payment-details-title"
                className="text-sm font-semibold text-[#111827] dark:text-white"
              >
                Payment Details
              </h2>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                aria-label="Close payment details"
                className="rounded-full p-1 text-[#64748b] hover:bg-[#f1f5f9] dark:hover:bg-[#424957]"
              >
                <X size={15} />
              </button>
            </header>

            <div className="space-y-2">
              <section className="rounded-lg border border-[#e2e8f0] p-2 dark:border-[#454a57]">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-medium text-[#14203c] dark:text-white">
                    Teacher Information
                  </h3>
                  <PaymentStatus status={selectedPayment.paymentStatus} />
                </div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-sm font-semibold text-[#2563eb]">
                    {`${teacher?.candidateFirstName?.[0] || "T"}${
                      teacher?.candidateLastName?.[0] || ""
                    }`.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#14203c] dark:text-white">
                      {`${teacher?.candidateFirstName || ""} ${
                        teacher?.candidateLastName || ""
                      }`.trim() || "Teacher"}
                    </p>
                    <p className="text-[10px] text-[#64748b] dark:text-gray-400">
                      {teacher?.teacherId || "—"} <span className="mx-1">•</span>
                      {teacher?.specialization || teacher?.positionApplied || "—"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <PaymentDetail
                    label="Department"
                    value={teacher?.department || teacher?.specialization}
                  />
                  <PaymentDetail
                    label="Employment Type"
                    value={teacher?.employmentType}
                  />
                  <PaymentDetail
                    label="Experience"
                    value={
                      teacher?.teachingExperience || teacher?.experience
                    }
                  />
                  <PaymentDetail label="Gender" value={teacher?.gender} />
                </div>
              </section>

              <section className="rounded-lg border border-[#e2e8f0] p-2 dark:border-[#454a57]">
                <h3 className="mb-2 text-xs font-medium text-[#14203c] dark:text-white">
                  Payment Information
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <PaymentDetail
                    label="Salary Month"
                    value={selectedPayment.salaryMonth}
                  />
                  <PaymentDetail
                    label="Payment Date"
                    value={selectedPayment.paymentDate}
                  />
                  <PaymentDetail
                    label="Payment Method"
                    value={selectedPayment.paymentMethod}
                  />
                  <PaymentDetail
                    label="Transaction Reference"
                    value={selectedPayment.transactionReference}
                  />
                </div>
              </section>

              <section className="rounded-lg border border-[#e2e8f0] p-2 dark:border-[#454a57]">
                <h3 className="mb-2 text-xs font-medium text-[#14203c] dark:text-white">
                  Payment Summary
                </h3>
                <div className="space-y-1.5 text-[11px]">
                  <PaymentAmount label="Base Salary" amount={selectedPayment.baseSalary} />
                  <PaymentAmount
                    label="Incentives"
                    amount={selectedPayment.incentives}
                    accent="green"
                    prefix="+ "
                  />
                  <PaymentAmount
                    label="Deductions"
                    amount={selectedPayment.deductions}
                    accent="red"
                    prefix="- "
                  />
                </div>
                <div className="mt-2 flex items-center justify-between rounded-md bg-[#ecfdf3] px-2.5 py-2 text-sm font-medium text-[#258342] dark:bg-[#244532] dark:text-[#9ce2b0]">
                  <span>Net amount Paid</span>
                  <span>
                    {formatCurrency(selectedPayment.netAmountPaid)}
                  </span>
                </div>
              </section>

              <section className="rounded-lg border border-[#e2e8f0] p-2 dark:border-[#454a57]">
                <h3 className="mb-2 text-xs font-medium text-[#14203c] dark:text-white">
                  Payment Document
                </h3>
                <div className="flex items-center justify-between gap-3 rounded-md bg-[#eef1fa] p-2 dark:bg-[#383d48]">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-red-500" />
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-medium text-[#334155] dark:text-white">
                        payment_bill_{selectedPayment.paymentId}.pdf
                      </p>
                      <p className="text-[9px] text-[#64748b] dark:text-gray-400">
                        Payslip
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleAction("Download Payslip", selectedPayment)
                    }
                    aria-label="Download payment document"
                    className="shrink-0 rounded p-1 text-[#596fbe] hover:bg-white dark:hover:bg-[#454a57]"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </section>
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#596fbe] px-3 py-1.5 text-[10px] font-medium text-[#596fbe] hover:bg-[#f4f6ff] dark:hover:bg-[#424957]"
              >
                <Printer size={13} />
                Print
              </button>
              <button
                type="button"
                onClick={() =>
                  handleAction("Download Payslip", selectedPayment)
                }
                className="inline-flex items-center gap-1.5 rounded-md bg-[#596fbe] px-3 py-1.5 text-[10px] font-medium text-white hover:bg-[#485eae]"
              >
                Download Slip
                <Download size={13} />
              </button>
            </div>
          </section>
        </div>
      )}

      {isFilterOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsFilterOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="salary-filter-title"
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-[#30343f]"
          >
            <header className="flex items-center justify-between border-b border-[#e7eaf2] px-5 py-4 dark:border-[#454a57]">
              <h2
                id="salary-filter-title"
                className="text-base font-semibold text-[#14203c] dark:text-white"
              >
                Filter Salary Payments
              </h2>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                aria-label="Close filters"
                className="rounded-md p-1.5 text-[#64748b] hover:bg-[#f1f5f9] dark:hover:bg-[#424957]"
              >
                <X size={18} />
              </button>
            </header>
            <form onSubmit={applyFilters} className="p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SalaryFilterField
                  label="Payment ID"
                  value={filterDraft.paymentId}
                  onChange={(value) =>
                    setFilterDraft((current) => ({ ...current, paymentId: value }))
                  }
                />
                <SalaryFilterField
                  label="Salary Month"
                  value={filterDraft.salaryMonth}
                  onChange={(value) =>
                    setFilterDraft((current) => ({ ...current, salaryMonth: value }))
                  }
                />
                <SalaryFilterField
                  label="Payment Date"
                  type="date"
                  value={filterDraft.paymentDate}
                  onChange={(value) =>
                    setFilterDraft((current) => ({ ...current, paymentDate: value }))
                  }
                />
                <SalaryFilterField
                  label="Base Salary"
                  value={filterDraft.baseSalary}
                  onChange={(value) =>
                    setFilterDraft((current) => ({ ...current, baseSalary: value }))
                  }
                  inputMode="decimal"
                />
                <SalaryFilterField
                  label="Incentives"
                  value={filterDraft.incentives}
                  onChange={(value) =>
                    setFilterDraft((current) => ({ ...current, incentives: value }))
                  }
                  inputMode="decimal"
                />
                <SalaryFilterField
                  label="Deductions"
                  value={filterDraft.deductions}
                  onChange={(value) =>
                    setFilterDraft((current) => ({ ...current, deductions: value }))
                  }
                  inputMode="decimal"
                />
                <SalaryFilterField
                  label="Net Amount Paid"
                  value={filterDraft.netAmountPaid}
                  onChange={(value) =>
                    setFilterDraft((current) => ({
                      ...current,
                      netAmountPaid: value,
                    }))
                  }
                  inputMode="decimal"
                />
                <SalaryFilterField
                  label="Payment Method"
                  value={filterDraft.paymentMethod}
                  onChange={(value) =>
                    setFilterDraft((current) => ({
                      ...current,
                      paymentMethod: value,
                    }))
                  }
                  options={[
                    ...Array.from(
                      new Set(
                        payments
                          .map((item) => item.paymentMethod)
                          .filter(Boolean)
                      )
                    ),
                  ]}
                />
                <SalaryFilterField
                  label="Payment Status"
                  value={filterDraft.paymentStatus}
                  onChange={(value) =>
                    setFilterDraft((current) => ({
                      ...current,
                      paymentStatus: value,
                    }))
                  }
                  options={[
                    ...Array.from(
                      new Set(
                        payments
                          .map((item) => item.paymentStatus)
                          .filter(Boolean)
                      )
                    ),
                  ]}
                />
              </div>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-md border border-[#5268bb] px-4 py-2 text-xs font-medium text-[#5268bb] hover:bg-[#f4f6ff] dark:hover:bg-[#424957]"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#596fbe] px-5 py-2 text-xs font-medium text-white hover:bg-[#485eae]"
                >
                  Apply
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={(value) => {
          setPage(value);
          setActiveMenu(null);
        }}
      />
    </div>
  );
}

function SalaryFilterField({
  label,
  value,
  onChange,
  options,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options?: string[];
  type?: "text" | "date";
  inputMode?: "decimal";
}) {
  const fieldClass =
    "h-9 w-full rounded-md border border-[#d8deea] bg-white px-2.5 text-xs text-[#475569] outline-none focus:border-[#596fbe] focus:ring-1 focus:ring-[#596fbe] dark:border-[#555b68] dark:bg-[#383d48] dark:text-white";

  return (
    <label className="block text-xs font-medium text-[#14203c] dark:text-white">
      <span className="mb-1.5 block">{label}</span>
      {options ? (
        <select
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          className={fieldClass}
        >
          <option value="">All</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          className={fieldClass}
        />
      )}
    </label>
  );
}

function PaymentDetail({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[9px] text-[#475569] dark:text-gray-400">
        {label}
      </p>
      <p className="break-words text-[10px] text-[#14203c] dark:text-white">
        {value == null || value === "" ? "—" : String(value)}
      </p>
    </div>
  );
}

function PaymentAmount({
  label,
  amount,
  accent,
  prefix = "",
}: {
  label: string;
  amount: number;
  accent?: "green" | "red";
  prefix?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[#475569] dark:text-gray-300">{label}</span>
      <span
        className={
          accent === "green"
            ? "font-medium text-[#258342] dark:text-[#9ce2b0]"
            : accent === "red"
              ? "font-medium text-red-500"
              : "text-[#14203c] dark:text-white"
        }
      >
        {prefix}
        {formatCurrency(amount)}
      </span>
    </div>
  );
}

/* Payment Status Component */

function PaymentStatus({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    paid: "bg-[#e8fbf1] text-[#218838] dark:bg-green-500/10 dark:text-green-400",

    pending:
      "bg-[#fff4df] text-[#d97706] dark:bg-amber-500/10 dark:text-amber-400",

    failed:
      "bg-[#fce9e9] text-[#ef2929] dark:bg-red-500/10 dark:text-red-400",

    processing:
      "bg-[#e8ebf6] text-[#576CBC] dark:bg-blue-500/10 dark:text-blue-400",
  };

  const normalizedStatus = status.trim().toLowerCase();

  return (
    <span
      className={`inline-flex min-w-[74px] items-center justify-center rounded-md px-3 py-1.5 text-[11px] font-medium capitalize ${
        statusStyles[normalizedStatus] ||
        "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
      }`}
    >
      {status || "-"}
    </span>
  );
}

/* Pagination Component */

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages: (number | string)[] =
    totalPages <= 5
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : page <= 3
        ? [1, 2, 3, "...", totalPages]
        : page >= totalPages - 2
          ? [1, "...", totalPages - 2, totalPages - 1, totalPages]
          : [1, "...", page - 1, page, page + 1, "...", totalPages];

  const buttonClass =
    "flex h-9 min-w-9 items-center justify-center rounded-md " +
    "bg-[#f6f6f6] px-2 text-xs text-[#999999] transition-colors " +
    "hover:bg-white dark:bg-[#30343f] dark:text-gray-300";

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <ChevronLeft size={17} />
      </button>

      {pages.map((item, index) =>
        typeof item === "number" ? (
          <button
            key={`${item}-${index}`}
            type="button"
            aria-current={page === item ? "page" : undefined}
            onClick={() => onPageChange(item)}
            className={`${buttonClass} ${
              page === item
                ? "border border-[#49658d] !text-[#173b9b] dark:!text-[#9aabef]"
                : "border border-transparent"
            }`}
          >
            {item}
          </button>
        ) : (
          <span key={`dots-${index}`} className={buttonClass}>
            ...
          </span>
        )
      )}

      <button
        type="button"
        aria-label="Next page"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <ChevronRight size={17} />
      </button>
    </div>
  );
}

/* Currency Formatter */

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}