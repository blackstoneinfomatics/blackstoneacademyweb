import ActionDropdown from "@/app/(super-admin)/super-admin/components/ActionMenu";
import DataTable from "@/app/(super-admin)/super-admin/components/DataTable";
import FilterDrawer, {
  FilterField,
} from "@/app/(super-admin)/super-admin/components/FilterDrawer";
import TableToolbar from "@/app/(super-admin)/super-admin/components/TableToolbar";
import ViewDetailsModal from "@/app/(super-admin)/super-admin/components/ViewDetailsModal";
import { downloadPdf } from "../downloadCsv";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";

interface InvoiceItem {
  service: string;
  description: string;
  unitPrice: number;
  taxRate: number;
  taxType: string;
  category: string;
  taxAmount: number;
  amount: number;
}

interface Invoice {
  _id: string;
  tenantId: string;
  subscriptionId: string;
  planId: string;
  paymentLink: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  paymentTerms: number;
  items: InvoiceItem[];
  subTotal: number;
  totalTax: number;
  totalAmount: number;
  customerNotes: string;
  attachments: string[];
  invoiceStatus: string;
  paymentStatus: string;
  createdBy: string;
  updatedBy: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    items: Invoice[];
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
    key: "tenantId",
    label: "Tenant ID",
    type: "text",
    placeholder: "Enter Tenant ID",
  },
  {
    key: "invoiceNumber",
    label: "Invoice Number",
    type: "text",
    placeholder: "Enter Invoice Number",
  },
  {
    key: "invoiceDate",
    label: "Invoice Date",
    type: "dateRange",
  },
  {
    key: "dueDate",
    label: "Due Date",
    type: "dateRange",
  },
  {
    key: "invoiceStatus",
    label: "Invoice Status",
    type: "select",
    placeholder: "Select Status",
    options: [
      { label: "Pending", value: "PENDING" },
      { label: "Paid", value: "PAID" },
      { label: "Overdue", value: "OVERDUE" },
      { label: "Cancelled", value: "CANCELLED" },
    ],
  },
  {
    key: "paymentStatus",
    label: "Payment Status",
    type: "select",
    placeholder: "Select Payment Status",
    options: [
      { label: "Pending", value: "PENDING" },
      { label: "Paid", value: "PAID" },
      { label: "Failed", value: "FAILED" },
    ],
  },
];

export default function TransactionTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openFilter, setOpenFilter] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const [filters, setFilters] = useState({
    tenantId: "",
    invoiceNumber: "",
    invoiceDateFrom: null as string | null,
    invoiceDateTo: null as string | null,
    dueDateFrom: null as string | null,
    dueDateTo: null as string | null,
    invoiceStatus: "",
    paymentStatus: "",
  });

  // Fetch invoices from API
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CUSTOM_SERVICE_INVOICE.GET_LIST}`,
      );

      if (response.data.success) {
        setInvoices(response.data.data.items);
      } else {
        toast.error(response.data.message || "Failed to fetch invoices");
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleView = (row: Invoice) => {
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    setSelectedInvoice([
      {
        label: "Invoice No",
        value: row.invoiceNumber,
      },
      {
        label: "Tenant ID",
        value: row.tenantId,
      },
      {
        label: "Subscription ID",
        value: row.subscriptionId,
      },
      {
        label: "Services",
        value: row.items.map(item => item.service).join(", "),
      },
      {
        label: "Categories",
        value: row.items.map(item => item.category).join(", "),
      },
      {
        label: "Invoice Date",
        value: formatDate(row.invoiceDate),
      },
      {
        label: "Due Date",
        value: formatDate(row.dueDate),
      },
      {
        label: "Sub Total",
        value: `₹ ${row.subTotal.toLocaleString()}`,
      },
      {
        label: "Total Tax",
        value: `₹ ${row.totalTax.toLocaleString()}`,
      },
      {
        label: "Total Amount",
        value: `₹ ${row.totalAmount.toLocaleString()}`,
      },
      {
        label: "Invoice Status",
        value: row.invoiceStatus,
        status: row.invoiceStatus === "PAID",
      },
      {
        label: "Payment Status",
        value: row.paymentStatus,
        status: row.paymentStatus === "PAID",
      },
      {
        label: "Customer Notes",
        value: row.customerNotes || "-",
      },
    ]);

    setOpen(true);
  };

  // Filter data based on search and filters
  const filteredData = invoices.filter((item) => {
    if (search) {
      const searchLower = search.toLowerCase();
      const searchableFields = [
        item.invoiceNumber,
        item.tenantId,
        item.subscriptionId,
        ...item.items.map(i => i.service),
        ...item.items.map(i => i.category),
      ];
      const matchesSearch = searchableFields.some(field =>
        field?.toLowerCase().includes(searchLower)
      );
      if (!matchesSearch) return false;
    }

    if (filters.tenantId && !item.tenantId.toLowerCase().includes(filters.tenantId.toLowerCase())) return false;
    if (filters.invoiceNumber && !item.invoiceNumber.toLowerCase().includes(filters.invoiceNumber.toLowerCase())) return false;
    if (filters.invoiceDateFrom && new Date(item.invoiceDate) < new Date(filters.invoiceDateFrom)) return false;
    if (filters.invoiceDateTo && new Date(item.invoiceDate) > new Date(filters.invoiceDateTo)) return false;
    if (filters.dueDateFrom && new Date(item.dueDate) < new Date(filters.dueDateFrom)) return false;
    if (filters.dueDateTo && new Date(item.dueDate) > new Date(filters.dueDateTo)) return false;
    if (filters.invoiceStatus && item.invoiceStatus !== filters.invoiceStatus) return false;
    if (filters.paymentStatus && item.paymentStatus !== filters.paymentStatus) return false;

    return true;
  });

  // Get selected items
  const selectedItems = invoices.filter((item) => selectedIds.has(item._id));

  // Handle checkbox change
  const handleCheckboxChange = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.size === filteredData.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(filteredData.map(item => item._id));
      setSelectedIds(allIds);
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedItems.length === 0) {
      toast.warning("Please select at least one invoice to download");
      return;
    }

    try {
      await downloadPdf(
        "selected-invoices.pdf",
        [
          "Invoice No",
          "Tenant ID",
          "Subscription ID",
          "Services",
          "Categories",
          "Invoice Date",
          "Due Date",
          "Sub Total",
          "Total Tax",
          "Total Amount",
          "Invoice Status",
          "Payment Status",
        ],
        selectedItems.map((item) => [
          item.invoiceNumber,
          item.tenantId,
          item.subscriptionId,
          item.items.map(i => i.service).join(", "),
          item.items.map(i => i.category).join(", "),
          new Date(item.invoiceDate).toLocaleDateString("en-IN"),
          new Date(item.dueDate).toLocaleDateString("en-IN"),
          `₹ ${item.subTotal.toLocaleString()}`,
          `₹ ${item.totalTax.toLocaleString()}`,
          `₹ ${item.totalAmount.toLocaleString()}`,
          item.invoiceStatus,
          item.paymentStatus,
        ])
      );
      toast.success(`Downloaded ${selectedItems.length} invoice(s) successfully`);
    } catch (error) {
      console.error("Error downloading invoices:", error);
      toast.error("Failed to download invoices");
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2
          className="font-medium text-[#010E30E5]/90 dark:text-[#e6e6e6]"
          style={{
            fontSize: "clamp(16px, 1.2vw, 18px)",
            lineHeight: "1.4",
          }}
        >
          Invoices ({invoices.length})
        </h2>

        <button
          onClick={handleDownloadSelected}
          disabled={selectedItems.length === 0}
          className="flex items-center gap-2 rounded-lg bg-[#576CBC] px-4 py-2 text-sm text-white transition-colors hover:bg-[#4A5FB0] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download Invoice {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}
        </button>
      </div>

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        total={invoices.length}
        showing={filteredData.length}
        searchPlaceholder="Search By Keyword"
        onFilterClick={() => setOpenFilter(true)}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#576CBC] border-r-transparent"></div>
            <p className="mt-2 text-sm text-slate-500">Loading invoices...</p>
          </div>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#4E709D] text-white">
                <th className="px-3 py-3 font-medium rounded-tl-md">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredData.length && filteredData.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-[#4E709D] focus:ring-[#4E709D]"
                  />
                </th>
                <th className="px-3 py-3 font-medium">Invoice No</th>
                <th className="px-3 py-3 font-medium">Tenant</th>
                <th className="px-3 py-3 font-medium">Service</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium">Invoice Date</th>
                <th className="px-3 py-3 font-medium">Due Date</th>
                <th className="px-3 py-3 font-medium text-right">Amount</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Payment</th>
                <th className="px-3 py-3 font-medium rounded-tr-md">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-[#e2e2e23c]">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-3 py-8 text-center text-sm text-slate-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row._id} className="bg-gray-50">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row._id)}
                        onChange={() => handleCheckboxChange(row._id)}
                        className="h-4 w-4 rounded border-gray-300 text-[#4E709D] focus:ring-[#4E709D]"
                      />
                    </td>
                    <td className="px-3 py-3 font-medium text-[#2E62B8] whitespace-nowrap">
                      {row.invoiceNumber}
                    </td>
                    <td className="px-3 py-3 text-slate-700 whitespace-nowrap">
                      {row.tenantId}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {row.items.map(item => item.service).join(", ")}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {row.items.map(item => item.category).join(", ")}
                    </td>
                    <td className="px-3 py-3 text-[#2E62B8] whitespace-nowrap">
                      {new Date(row.invoiceDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-3 py-3 text-[#2E62B8] whitespace-nowrap">
                      {new Date(row.dueDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-3 py-3 text-right font-medium text-[#344054] whitespace-nowrap">
                      ₹ {row.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex min-w-[70px] justify-center rounded-md px-2.5 py-1 text-xs font-medium ${row.invoiceStatus === "PAID"
                          ? "bg-[#E8F8EC] text-[#2E9E44]"
                          : row.invoiceStatus === "OVERDUE"
                            ? "bg-[#FEE2E2] text-[#DC2626]"
                            : row.invoiceStatus === "CANCELLED"
                              ? "bg-[#F3F4F6] text-[#6B7280]"
                              : "bg-[#FFF4DE] text-[#F59E0B]"
                          }`}
                      >
                        {row.invoiceStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex min-w-[70px] justify-center rounded-md px-2.5 py-1 text-xs font-medium ${row.paymentStatus === "PAID"
                          ? "bg-[#E8F8EC] text-[#2E9E44]"
                          : row.paymentStatus === "FAILED"
                            ? "bg-[#FEE2E2] text-[#DC2626]"
                            : "bg-[#FFF4DE] text-[#F59E0B]"
                          }`}
                      >
                        {row.paymentStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <ActionDropdown
                        row={row}
                        items={[
                          {
                            label: "View Invoice",
                            onClick: handleView,
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <FilterDrawer
        open={openFilter}
        title="Filter by"
        fields={transactionFields}
        values={filters}
        resultCount={invoices.length}
        onClose={() => setOpenFilter(false)}
        onReset={() =>
          setFilters({
            tenantId: "",
            invoiceNumber: "",
            invoiceDateFrom: null,
            invoiceDateTo: null,
            dueDateFrom: null,
            dueDateTo: null,
            invoiceStatus: "",
            paymentStatus: "",
          })
        }
        onApply={(values: any) => {
          setFilters(values);
          setOpenFilter(false);
        }}
      />

      <ViewDetailsModal
        title="Invoice Details"
        open={open}
        onClose={() => setOpen(false)}
        data={selectedInvoice}
      />
    </div>
  );
}