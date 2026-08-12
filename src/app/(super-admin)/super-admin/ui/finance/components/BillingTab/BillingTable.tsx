import ActionDropdown from "@/app/(super-admin)/super-admin/components/ActionMenu";
import DataTable from "@/app/(super-admin)/super-admin/components/DataTable";
import FilterDrawer, {
  FilterField,
} from "@/app/(super-admin)/super-admin/components/FilterDrawer";
import TableToolbar from "@/app/(super-admin)/super-admin/components/TableToolbar";
import { MoreVertical } from "lucide-react";
import React, { useState } from "react";

const data = [
  {
    id: "1",
    billingName: "Blackstone Institute",
    category: "Subscription",
    amount: "2,999",
    paymentMethod: "Google Pay",
    paymentDate: "Sep, 12 2023",
    dueDate: "Sep, 12 2023",
    status: "Paid",
  },
  {
    id: "2",
    billingName: "Blackstone Institute",
    category: "Refund",
    amount: "2,999",
    paymentMethod: "Stripe",
    paymentDate: "Sep, 13 2023",
    dueDate: "Sep, 13 2023",
    status: "Refunded",
  },
  {
    id: "3",
    billingName: "Alpha Academy",
    category: "Subscription",
    amount: "4,999",
    paymentMethod: "Credit Card",
    paymentDate: "Sep, 14 2023",
    dueDate: "Sep, 14 2023",
    status: "Paid",
  },
  {
    id: "4",
    billingName: "Global School",
    category: "Renewal",
    amount: "3,499",
    paymentMethod: "UPI",
    paymentDate: "Sep, 15 2023",
    dueDate: "Sep, 15 2023",
    status: "Pending",
  },
  {
    id: "5",
    billingName: "Future Minds",
    category: "Subscription",
    amount: "5,999",
    paymentMethod: "Razorpay",
    paymentDate: "Sep, 16 2023",
    dueDate: "Sep, 16 2023",
    status: "Paid",
  },

];
const transactionFields: FilterField[] = [
  {
    key: "billingName",
    label: "Billing Name",
    type: "text",
    placeholder: "Enter Billing Name",
  },
  {
    key: "category",
    label: "Category",
    type: "select",
    placeholder: "Select Type",
    options: [
      { label: "Subscription", value: "Subscription" },
      { label: "Refund", value: "Refund" },
      { label: "Renewal", value: "Renewal" },
    ],
  },
  {
    key: "paymentMethod",
    label: "Payment Method",
    type: "select",
    placeholder: "Select Payment Method",
    options: [
      { label: "Google Pay", value: "Google Pay" },
      { label: "Stripe", value: "Stripe" },
      { label: "UPI", value: "UPI" },
      { label: "Credit Card", value: "Credit Card" },
      { label: "Razorpay", value: "Razorpay" },
      { label: "Bank Transfer", value: "Bank Transfer" },
      { label: "PayPal", value: "PayPal" },
    ],
  },
  {
    key: "paymentDate",
    label: "Payment Date",
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
      { label: "Refunded", value: "Refunded" },
      { label: "Pending", value: "Pending" },
    ],
  },
];

export default function BillingTable() {
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null,
  );
  const [openFilter, setOpenFilter] = useState(false);
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    billingName: "",
    category: "",
    paymentMethod: "",
    paymentDateFrom: "",
    paymentDateTo: "",
    dueDateFrom: "",
    dueDateTo: "",
    status: "",
  });

  const [open, setOpen] = useState(false);
  const handleView = (row: any) => {
    console.log("View", row);

    // Open modal
    setSelectedTransaction(row);
    setOpen(true);
  };

  const handleEdit = (row: any) => {
    console.log("Edit", row);

    // Navigate or open edit modal
  };
  const filteredData = data.filter((item) => {
    if (
      filters.billingName &&
      !item.billingName.toLowerCase().includes(filters.billingName.toLowerCase())
    )
      return false;

    if (filters.category && item.category !== filters.category) return false;

    if (filters.paymentMethod && item.paymentMethod !== filters.paymentMethod)
      return false;

    if (filters.status && item.status !== filters.status) return false;

    if (filters.paymentDateFrom) {
      const from = new Date(filters.paymentDateFrom);
      const itemDate = new Date(item.paymentDate);
      if (itemDate < from) return false;
    }

    if (filters.paymentDateTo) {
      const to = new Date(filters.paymentDateTo);
      const itemDate = new Date(item.paymentDate);
      if (itemDate > to) return false;
    }

    if (filters.dueDateFrom) {
      const from = new Date(filters.dueDateFrom);
      const itemDate = new Date(item.dueDate);
      if (itemDate < from) return false;
    }

    if (filters.dueDateTo) {
      const to = new Date(filters.dueDateTo);
      const itemDate = new Date(item.dueDate);
      if (itemDate > to) return false;
    }

    return true;
  });
  return (
    <div>
      <h2
        className="mb-4 font-medium text-[#010E30E5]/90"
        style={{
          fontSize: "clamp(18px, 1.2vw, 20px)",
          lineHeight: "1.4",
        }}
      >
        {"All Transactions"}
      </h2>

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        total={data.length}
        showing={data.length}
        searchPlaceholder="Search By Keyword"
        onFilterClick={() => setOpenFilter(true)}
      />
      <DataTable
        heading="All Transactions"
        selectable={true}
        columns={[
          {
            key: "billingName",
            header: "Billing Name",
          },

          {
            key: "category",
            header: "Category",
            render: (row: any) => (
              <span
                className={`inline-flex min-w-[70px] justify-center rounded-md px-3 py-1 text-xs font-medium ${
                  row.status === "Paid"
                    ? "bg-[#E8F8EC] text-[#2E9E44]"
                    : row.status === "Refunded"
                      ? "bg-[#E7E5FF] text-[#576CBC]"
                      : "bg-[#FFF4DE] text-[#F59E0B]"
                }`}
              >
                {row.category}
              </span>
            ),
          },

          {
            key: "amount",
            header: "Amount",
          },

          {
            key: "billingDate",
            header: "Billing Date",
            render: (row: any) => (
              <span className="font-medium text-[#344054]">{row.amount}</span>
            ),
          },

          {
            key: "paymentMethod",
            header: "Payment Method",
            render: (row: any) => (
              <span className="text-[#344054]">{row.paymentMethod}</span>
            ),
          },

          {
            key: "paymentDate",
            header: "Payment Date",
            render: (row: any) => (
              <span className="text-[#2E62B8]">{row.paymentDate}</span>
            ),
          },

          {
            key: "status",
            header: "Payment Status",
            render: (row: any) => (
              <span
                className={`inline-flex min-w-[70px] justify-center rounded-md px-3 py-1 text-xs font-medium ${
                  row.status === "Paid"
                    ? "bg-[#E8F8EC] text-[#2E9E44]"
                    : row.status === "Refunded"
                      ? "bg-[#E7E5FF] text-[#576CBC]"
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
                    label: "View Details",
                    onClick: handleView,
                  },
                  {
                    label: "Edit",
                    onClick: handleEdit,
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
        resultCount={filteredData.length}
        onClose={() => setOpenFilter(false)}
        onReset={() =>
          setFilters({
            billingName: "",
            category: "",
            paymentMethod: "",
            paymentDateFrom: "",
            paymentDateTo: "",
            dueDateFrom: "",
            dueDateTo: "",
            status: "",
          })
        }
        onApply={(values: any) => {
          console.log(values);

          setFilters(values);

          setOpenFilter(false);
        }}
      />
    </div>
  );
}
