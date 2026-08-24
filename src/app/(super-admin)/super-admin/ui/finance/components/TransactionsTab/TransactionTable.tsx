"use client";

import ActionDropdown from "@/app/(super-admin)/super-admin/components/ActionMenu";
import DataTable from "@/app/(super-admin)/super-admin/components/DataTable";
import FilterDrawer, {
  FilterField,
} from "@/app/(super-admin)/super-admin/components/FilterDrawer";
import TableToolbar from "@/app/(super-admin)/super-admin/components/TableToolbar";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import axios from "axios";
import { Download, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Transaction {
  id: string;
  transactionId: string;
  paymentNumber: string;
  tenant: string;
  type: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentDate: string;
  dueDate: string;
  status: string;
  invoiceNumber?: string;
  subscriptionCode?: string;
  planName?: string;
  gateway?: string;
  refundAmount?: number;
}

interface ApiTransaction {
  paymentNumber: string;
  tenantId: string;
  invoiceId: string;
  subscriptionId: string;
  paymentType: string;
  gateway: string;
  paymentStatus: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentDate: string;
  refundAmount: number;
  transactionId: string;

  tenant?: {
    tenantId: string;
    tenantCode: string;
    tenantName: string;
  };

  invoice?: {
    invoiceId: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
  };

  subscription?: {
    subscriptionId: string;
    subscriptionCode: string;
    billingCycle: string;
    status: string;
  };

  subscriptionPlan?: {
    planId: string;
    planName: string;
    billingCycle: string;
  };
}

interface TransactionsApiResponse {
  success: boolean;
  data: {
    items: ApiTransaction[];
    pagination: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

const transactionFields: FilterField[] = [
  {
    key: "tenant",
    label: "Tenant Name",
    type: "text",
    placeholder: "Enter Tenant Name",
  },
  {
    key: "type",
    label: "Type",
    type: "select",
    placeholder: "Select Type",
    options: [
      {
        label: "Subscription",
        value: "SUBSCRIPTION",
      },
      {
        label: "Refund",
        value: "REFUND",
      },
      {
        label: "Renewal",
        value: "RENEWAL",
      },
    ],
  },
  {
    key: "paymentMethod",
    label: "Payment Method",
    type: "select",
    placeholder: "Select Payment Method",
    options: [
      {
        label: "Card",
        value: "card",
      },
      {
        label: "UPI",
        value: "upi",
      },
      {
        label: "Bank Transfer",
        value: "bank_transfer",
      },
    ],
  },
  {
    key: "date",
    label: "Date",
    type: "dateRange",
  },
];

const formatDate = (date?: string) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (amount: number, currency: string = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
};

const mapTransaction = (item: ApiTransaction): Transaction => {
  return {
    id: item.transactionId || item.paymentNumber,
    transactionId: item.paymentNumber,
    paymentNumber: item.paymentNumber,

    tenant: item.tenant?.tenantName || "-",

    type: item.paymentType,

    amount: item.amount,

    currency: item.currency,

    paymentMethod: item.paymentMethod || item.gateway || "-",

    paymentDate: formatDate(item.paymentDate),

    dueDate: formatDate(item.invoice?.dueDate),

    status: item.paymentStatus,

    invoiceNumber: item.invoice?.invoiceNumber,

    subscriptionCode: item.subscription?.subscriptionCode,

    planName: item.subscriptionPlan?.planName,

    gateway: item.gateway,

    refundAmount: item.refundAmount,
  };
};

export default function TransactionTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const [openFilter, setOpenFilter] = useState(false);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [filters, setFilters] = useState({
    tenant: "",
    type: "",
    paymentMethod: "",
    dateFrom: "",
    dateTo: "",
  });

  const [open, setOpen] = useState(false);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<
    string[]
  >([]);

  const fetchTransactions = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get<TransactionsApiResponse>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.INVOICE.GET_FINANCE_TRANSATIONS}`,
        {
          params: {
            page,
            limit,
          },
        },
      );

      if (response.data.success) {
        const apiItems = response.data.data.items || [];

        const mappedData = apiItems.map(mapTransaction);

        setTransactions(mappedData);

        setPagination(response.data.data.pagination);
      }
    } catch (error: any) {
      console.error("Failed to fetch transactions:", error);

      setError(
        error?.response?.data?.message || "Failed to load transactions.",
      );

      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1, 10);
  }, []);

  const handleView = (row: Transaction) => {
    console.log("View Transaction", row);

    setSelectedTransaction(row);

    setOpen(true);
  };

  const filteredData = transactions.filter((item) => {
    const keyword = search.toLowerCase().trim();

    if (keyword) {
      const searchableText = [
        item.transactionId,
        item.paymentNumber,
        item.tenant,
        item.type,
        item.paymentMethod,
        item.status,
        item.invoiceNumber,
        item.subscriptionCode,
        item.planName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(keyword)) {
        return false;
      }
    }

    if (
      filters.tenant &&
      !item.tenant.toLowerCase().includes(filters.tenant.toLowerCase())
    ) {
      return false;
    }

    if (filters.type && item.type !== filters.type) {
      return false;
    }

    if (filters.paymentMethod && item.paymentMethod !== filters.paymentMethod) {
      return false;
    }

    return true;
  });

  const selectedItems = transactions.filter((item) =>
    selectedTransactionIds.includes(item.id),
  );

  const handleDownloadSelected = async () => {
    if (selectedItems.length === 0) return;

    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default || html2pdfModule;
    const pdfContent = document.createElement("div");

    pdfContent.style.cssText =
      "background:#ffffff;color:#101828;font-family:Arial,sans-serif;padding:32px;width:760px;";
    pdfContent.innerHTML = `
      <div style="border-bottom:2px solid #496A96;padding-bottom:16px;margin-bottom:24px;">
        <h1 style="color:#496A96;font-size:24px;margin:0 0 6px;">Transaction Invoice</h1>
        <p style="color:#667085;font-size:12px;margin:0;">Generated on ${new Date().toLocaleDateString("en-IN")}</p>
      </div>
      ${selectedItems
        .map(
          (row, index) => `
            <div style="${index > 0 ? "border-top:1px solid #E4E7EC;padding-top:20px;margin-top:20px;" : ""}">
              <h2 style="font-size:16px;margin:0 0 12px;color:#344054;">Transaction ${index + 1}</h2>
              <table style="border-collapse:collapse;width:100%;font-size:12px;">
                ${[
                  ["Transaction ID", row.transactionId],
                  ["Tenant", row.tenant],
                  ["Type", row.type],
                  ["Amount", formatAmount(row.amount, row.currency)],
                  ["Payment Method", row.paymentMethod],
                  ["Payment Date", row.paymentDate],
                  ["Due Date", row.dueDate],
                  ["Payment Status", row.status],
                ]
                  .map(
                    ([label, value]) =>
                      `<tr><td style="border:1px solid #E4E7EC;background:#F8FAFC;font-weight:bold;padding:8px;width:30%;">${label}</td><td style="border:1px solid #E4E7EC;padding:8px;">${value ?? "-"}</td></tr>`,
                  )
                  .join("")}
              </table>
            </div>`,
        )
        .join("")}
    `;

    document.body.appendChild(pdfContent);

    try {
      await html2pdf()
        .set({
          margin: 8,
          filename: "selected-transactions.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .from(pdfContent)
        .save();
    } finally {
      pdfContent.remove();
    }
  };

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
          All Transactions
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
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        total={pagination.totalRecords}
        showing={filteredData.length}
        searchPlaceholder="Search By Keyword"
        onFilterClick={() => setOpenFilter(true)}
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <DataTable
        heading="All Transactions"
        selectable={true}
        onSelectionChange={setSelectedTransactionIds}
        columns={[
          {
            key: "transactionId",
            header: "Transactions ID",
          },

          {
            key: "tenant",
            header: "Tenant",
          },

          {
            key: "type",
            header: "Type",
            render: (row: Transaction) => (
              <span
                className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium ${
                  row.type === "SUBSCRIPTION"
                    ? "bg-[#ECE9FF] text-[#576CBC] dark:bg-[#40386B] dark:text-[#B7B0FF]"
                    : row.type === "REFUND"
                      ? "bg-[#FDECEC] text-[#EF4444] dark:bg-[#5A3030] dark:text-[#FF9A9A]"
                      : "bg-[#FFF4DE] text-[#F59E0B] dark:bg-[#5A4524] dark:text-[#FFC766]"
                }`}
              >
                {row.type}
              </span>
            ),
          },

          {
            key: "amount",
            header: "Amount",
            render: (row: Transaction) => (
              <span className="font-medium text-[#344054] dark:text-[#E2E6EE]">
                {formatAmount(row.amount, row.currency)}
              </span>
            ),
          },

          {
            key: "paymentMethod",
            header: "Payment Method",
            render: (row: Transaction) => (
              <span className="text-[#344054] dark:text-[#D0D7E2]">
                {row.paymentMethod}
              </span>
            ),
          },

          {
            key: "paymentDate",
            header: "Payment Date",
            render: (row: Transaction) => (
              <span className="text-[#2E62B8] dark:text-[#6FA8FF]">
                {row.paymentDate}
              </span>
            ),
          },

          {
            key: "dueDate",
            header: "Due Date",
            render: (row: Transaction) => (
              <span className="text-[#2E62B8] dark:text-[#6FA8FF]">
                {row.dueDate}
              </span>
            ),
          },

          {
            key: "status",
            header: "Payment Status",
            render: (row: Transaction) => (
              <span
                className={`inline-flex min-w-[80px] justify-center rounded-md px-3 py-1 text-xs font-medium ${
                  row.status === "SUCCESS"
                    ? "bg-[#E8F8EC] text-[#2E9E44] dark:bg-[#294D32] dark:text-[#7BE495]"
                    : row.status === "REFUNDED"
                      ? "bg-[#E7E5FF] text-[#576CBC] dark:bg-[#40386B] dark:text-[#B7B0FF]"
                      : row.status === "FAILED"
                        ? "bg-[#FDECEC] text-[#EF4444] dark:bg-[#5A3030] dark:text-[#FF9A9A]"
                        : "bg-[#FFF4DE] text-[#F59E0B] dark:bg-[#5A4524] dark:text-[#FFC766]"
                }`}
              >
                {row.status}
              </span>
            ),
          },

          {
            key: "action",
            header: "Action",
            align: "center",
            render: (row: Transaction) => (
              <ActionDropdown
                row={row}
                items={[
                  {
                    label: "View Details",
                    onClick: handleView,
                  },
                ]}
              />
            ),
          },
        ]}
        data={filteredData}
        loading={loading}
      />

      <FilterDrawer
        open={openFilter}
        title="Filter by"
        fields={transactionFields}
        values={filters}
        resultCount={filteredData.length}
        onClose={() => setOpenFilter(false)}
        onReset={() =>
          setFilters({
            tenant: "",
            type: "",
            paymentMethod: "",
            dateFrom: "",
            dateTo: "",
          })
        }
        onApply={(values: any) => {
          console.log("Applied filters:", values);

          setFilters(values);

          setOpenFilter(false);
        }}
      />

      {open && selectedTransaction && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-details-title"
            className="w-full max-w-2xl rounded-2xl border border-[#E4E7EC] bg-white p-5 shadow-xl dark:border-[#454545] dark:bg-[#343434] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#E4E7EC] pb-4 dark:border-[#4A4A4A]">
              <div>
                <h2
                  id="transaction-details-title"
                  className="text-lg font-semibold text-[#1D2939] dark:text-white"
                >
                  Transaction Details
                </h2>
                <p className="mt-1 text-xs text-[#667085] dark:text-[#AEB6C5]">
                  {selectedTransaction.transactionId}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close transaction details"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-[#667085] transition hover:bg-[#F2F4F7] hover:text-[#344054] dark:text-[#AEB6C5] dark:hover:bg-[#454545] dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ["Transaction ID", selectedTransaction.transactionId],
                ["Tenant", selectedTransaction.tenant],
                ["Type", selectedTransaction.type],
                [
                  "Amount",
                  formatAmount(
                    selectedTransaction.amount,
                    selectedTransaction.currency,
                  ),
                ],
                ["Payment Method", selectedTransaction.paymentMethod],
                ["Payment Date", selectedTransaction.paymentDate],
                ["Due Date", selectedTransaction.dueDate],
                ["Payment Status", selectedTransaction.status],
                ["Invoice Number", selectedTransaction.invoiceNumber],
                ["Subscription Code", selectedTransaction.subscriptionCode],
                ["Plan Name", selectedTransaction.planName],
                ["Gateway", selectedTransaction.gateway],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] px-4 py-3 dark:border-[#4A4A4A] dark:bg-[#2F2F2F]"
                >
                  <p className="text-xs font-medium text-[#667085] dark:text-[#AEB6C5]">
                    {label}
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-[#344054] dark:text-[#F2F4F7]">
                    {value || "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
