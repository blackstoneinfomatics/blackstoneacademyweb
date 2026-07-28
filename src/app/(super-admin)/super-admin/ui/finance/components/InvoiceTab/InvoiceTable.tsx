import ActionDropdown from "@/app/(super-admin)/super-admin/components/ActionMenu";
import DataTable from "@/app/(super-admin)/super-admin/components/DataTable";
import FilterDrawer, {
  FilterField,
} from "@/app/(super-admin)/super-admin/components/FilterDrawer";
import TableToolbar from "@/app/(super-admin)/super-admin/components/TableToolbar";
import ViewDetailsModal from "@/app/(super-admin)/super-admin/components/ViewDetailsModal";
import React, { useState } from "react";

const data = [
  {
    id: "1",
    invoiceNo: "INV-00-01",
    tenant: "Blackstone Institute",
    plan: "Premium",
    service: "API Integration",
    category: "Integration",
    invoiceDate: "Sep, 12 2023",
    dueDate: "Sep, 12 2023",
    amount: "2,999",
    status: "Paid",
  },
  {
    id: "2",
    invoiceNo: "INV-00-02",
    tenant: "Blackstone Institute",
    plan: "Premium",
    service: "Data Migration",
    category: "Migration",
    invoiceDate: "Sep, 13 2023",
    dueDate: "Sep, 18 2023",
    amount: "2,999",
    status: "Pending",
  },
  {
    id: "3",
    invoiceNo: "INV-00-03",
    tenant: "Alpha Academy",
    plan: "Basic",
    service: "API Integration",
    category: "Integration",
    invoiceDate: "Sep, 14 2023",
    dueDate: "Sep, 20 2023",
    amount: "3,499",
    status: "Paid",
  },
  {
    id: "4",
    invoiceNo: "INV-00-04",
    tenant: "Future Minds School",
    plan: "Enterprise",
    service: "Data Migration",
    category: "Migration",
    invoiceDate: "Sep, 15 2023",
    dueDate: "Sep, 22 2023",
    amount: "4,999",
    status: "Pending",
  },
  {
    id: "5",
    invoiceNo: "INV-00-05",
    tenant: "Bright Stars Academy",
    plan: "Premium",
    service: "API Integration",
    category: "Integration",
    invoiceDate: "Sep, 16 2023",
    dueDate: "Sep, 23 2023",
    amount: "5,999",
    status: "Paid",
  },
  {
    id: "6",
    invoiceNo: "INV-00-06",
    tenant: "Global School",
    plan: "Basic",
    service: "Data Migration",
    category: "Migration",
    invoiceDate: "Sep, 17 2023",
    dueDate: "Sep, 24 2023",
    amount: "3,299",
    status: "Pending",
  },
  {
    id: "7",
    invoiceNo: "INV-00-07",
    tenant: "Vision International",
    plan: "Enterprise",
    service: "API Integration",
    category: "Integration",
    invoiceDate: "Sep, 18 2023",
    dueDate: "Sep, 25 2023",
    amount: "6,499",
    status: "Paid",
  },
  {
    id: "8",
    invoiceNo: "INV-00-08",
    tenant: "Green Valley School",
    plan: "Basic",
    service: "Data Migration",
    category: "Migration",
    invoiceDate: "Sep, 19 2023",
    dueDate: "Sep, 26 2023",
    amount: "2,799",
    status: "Pending",
  },
  {
    id: "9",
    invoiceNo: "INV-00-09",
    tenant: "Scholars Academy",
    plan: "Premium",
    service: "API Integration",
    category: "Integration",
    invoiceDate: "Sep, 20 2023",
    dueDate: "Sep, 27 2023",
    amount: "7,999",
    status: "Paid",
  },
  {
    id: "10",
    invoiceNo: "INV-00-10",
    tenant: "Excel Public School",
    plan: "Enterprise",
    service: "Data Migration",
    category: "Migration",
    invoiceDate: "Sep, 21 2023",
    dueDate: "Sep, 28 2023",
    amount: "4,299",
    status: "Pending",
  },
];
const transactionFields: FilterField[] = [
  {
    key: "tenant",
    label: "Tenant Name",
    type: "text",
    placeholder: "Enter Tenant Name",
  },
  {
    key: "plan",
    label: "Plan",
    type: "select",
    placeholder: "Select Plan",
    options: [
      { label: "Basic", value: "Basic" },
      { label: "Premium", value: "Premium" },
      { label: "Enterprise", value: "Enterprise" },
    ],
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
    key: "status",
    label: "Status",
    type: "select",
    placeholder: "Select Status",
    options: [
      { label: "Paid", value: "Paid" },
      { label: "Pending", value: "Pending" },
      { label: "Overdue", value: "Overdue" },
    ],
  },
];

export default function TransactionTable() {
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null,
  );
  const [selectedInvoice, setSelectedInvoice] = useState<any[]>([]);
  const [openFilter, setOpenFilter] = useState(false);
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    tenant: "",
    plan: "",
    invoiceDateFrom: null,
    invoiceDateTo: null,
    dueDateFrom: null,
    dueDateTo: null,
    status: "",
  });

const [open, setOpen] = useState(false);

const handleView = (row: any) => {
    console.log("View clicked", row);

  setSelectedInvoice([
    {
      label: "Invoice No",
      value: row.invoiceNo,
    },
    {
      label: "Tenant",
      value: row.tenant,
    },
    {
      label: "Service",
      value: row.service,
    },
    {
      label: "Category",
      value: row.category,
    },
    {
      label: "Invoice Date",
      value: row.invoiceDate,
    },
    {
      label: "Due Date",
      value: row.dueDate,
    },
    {
      label: "Amount",
      value: `₹ ${Number(row.amount).toLocaleString("en-IN")}`,
    },
    {
      label: "Status",
      value: row.status,
      status: row.status === "Paid",
    },
  ]);

  setOpen(true);
};

  const filteredData = data.filter((item) => {
    if (
      filters.tenant &&
      !item.tenant.toLowerCase().includes(filters.tenant.toLowerCase())
    )
      return false;

    if (filters.plan && item.plan !== filters.plan) return false;

    if (
      filters.invoiceDateFrom &&
      new Date(item.invoiceDate) < new Date(filters.invoiceDateFrom)
    )
      return false;
    if (
      filters.invoiceDateTo &&
      new Date(item.invoiceDate) > new Date(filters.invoiceDateTo)
    )
      return false;
    if (
      filters.dueDateFrom &&
      new Date(item.dueDate) < new Date(filters.dueDateFrom)
    )
      return false;
    if (
      filters.dueDateTo &&
      new Date(item.dueDate) > new Date(filters.dueDateTo)
    )
      return false;
    if (filters.status && item.status !== filters.status) return false;

    return true;
  });
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2
          className="font-medium text-[#010E30E5]/90"
          style={{
            fontSize: "clamp(18px, 1.2vw, 20px)",
            lineHeight: "1.4",
          }}
        >
          Invoices
        </h2>

        <button
          className="flex items-center gap-2 rounded-lg bg-[#576CBC] px-4 py-2 text-white transition-colors hover:bg-[#4A5FB0]"
          style={{
            fontSize: "clamp(12px, 0.85vw, 14px)",
            lineHeight: "1.4",
          }}
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
          Download Invoice
        </button>
      </div>

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        total={data.length}
        showing={data.length}
        searchPlaceholder="Search By Keyword"
        onFilterClick={() => setOpenFilter(true)}
      />
      <DataTable
        heading="Invoices"
        selectable={true}
        columns={[
          {
            key: "invoiceNo",
            header: "Invoice No",
          },

          {
            key: "tenant",
            header: "Tenant",
          },

          {
            key: "service",
            header: "Service",
          },

          {
            key: "category",
            header: "Category",
          },

          {
            key: "invoiceDate",
            header: "Invoice Date",
            render: (row: any) => (
              <span className="text-[#2E62B8]">{row.invoiceDate}</span>
            ),
          },

          {
            key: "dueDate",
            header: "Due Date",
            render: (row: any) => (
              <span className="text-[#2E62B8]">{row.dueDate}</span>
            ),
          },

          {
            key: "amount",
            header: "Amount",
            render: (row: any) => (
              <span className="font-medium text-[#344054]">₹ {row.amount}</span>
            ),
          },

          {
            key: "status",
            header: "Status",
            render: (row: any) => (
              <span
                className={`inline-flex min-w-[75px] justify-center rounded-md px-3 py-1 text-xs font-medium ${
                  row.status === "Paid"
                    ? "bg-[#E8F8EC] text-[#2E9E44]"
                    : "bg-[#FFF4DE] text-[#F59E0B]"
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
            render: (row: any) => (
              <ActionDropdown
                row={row}
                items={[
                  {
                    label: "View Invoice",
                    onClick: handleView,
                  },
                ]}
              />
            ),
          },
        ]}
        data={filteredData}
      />
      <FilterDrawer
        open={openFilter}
        title="Filter by"
        fields={transactionFields}
        values={filters}
        resultCount={data.length} // Matches your design
        onClose={() => setOpenFilter(false)}
        onReset={() =>
          setFilters({
            tenant: "",
            plan: "",
            invoiceDateFrom: null,
            invoiceDateTo: null,
            dueDateFrom: null,
            dueDateTo: null,
            status: "",
          })
        }
        onApply={(values: any) => {
          console.log(values);
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
