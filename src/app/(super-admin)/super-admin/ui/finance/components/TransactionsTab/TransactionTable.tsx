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
    transactionId: "TN-1234556",
    tenant: "Blackstone Institute",
    type: "Subscription",
    amount: "2,999",
    paymentMethod: "Google Pay",
    paymentDate: "Sep, 12 2023",
    dueDate: "Sep, 12 2023",
    status: "Paid",
  },
  {
    id: "2",
    transactionId: "TN-1234557",
    tenant: "Blackstone Institute",
    type: "Refund",
    amount: "2,999",
    paymentMethod: "Stripe",
    paymentDate: "Sep, 13 2023",
    dueDate: "Sep, 13 2023",
    status: "Refunded",
  },
  {
    id: "3",
    transactionId: "TN-1234558",
    tenant: "Alpha Academy",
    type: "Subscription",
    amount: "4,999",
    paymentMethod: "Credit Card",
    paymentDate: "Sep, 14 2023",
    dueDate: "Sep, 14 2023",
    status: "Paid",
  },
  {
    id: "4",
    transactionId: "TN-1234559",
    tenant: "Global School",
    type: "Renewal",
    amount: "3,499",
    paymentMethod: "UPI",
    paymentDate: "Sep, 15 2023",
    dueDate: "Sep, 15 2023",
    status: "Pending",
  },
  {
    id: "5",
    transactionId: "TN-1234560",
    tenant: "Future Minds",
    type: "Subscription",
    amount: "5,999",
    paymentMethod: "Razorpay",
    paymentDate: "Sep, 16 2023",
    dueDate: "Sep, 16 2023",
    status: "Paid",
  },
  {
    id: "6",
    transactionId: "TN-1234561",
    tenant: "Bright Stars",
    type: "Refund",
    amount: "1,999",
    paymentMethod: "Stripe",
    paymentDate: "Sep, 17 2023",
    dueDate: "Sep, 17 2023",
    status: "Refunded",
  },
  {
    id: "7",
    transactionId: "TN-1234562",
    tenant: "Excel Public School",
    type: "Renewal",
    amount: "6,499",
    paymentMethod: "Bank Transfer",
    paymentDate: "Sep, 18 2023",
    dueDate: "Sep, 18 2023",
    status: "Pending",
  },
  {
    id: "8",
    transactionId: "TN-1234563",
    tenant: "Scholars Academy",
    type: "Subscription",
    amount: "3,999",
    paymentMethod: "Google Pay",
    paymentDate: "Sep, 19 2023",
    dueDate: "Sep, 19 2023",
    status: "Paid",
  },
  {
    id: "9",
    transactionId: "TN-1234564",
    tenant: "Vision International",
    type: "Subscription",
    amount: "7,999",
    paymentMethod: "Credit Card",
    paymentDate: "Sep, 20 2023",
    dueDate: "Sep, 20 2023",
    status: "Paid",
  },
  {
    id: "10",
    transactionId: "TN-1234565",
    tenant: "Green Valley School",
    type: "Refund",
    amount: "2,499",
    paymentMethod: "PayPal",
    paymentDate: "Sep, 21 2023",
    dueDate: "Sep, 21 2023",
    status: "Refunded",
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
    key: "type",
    label: "Type",
    type: "select",
    placeholder: "Select Type",
    options: [
      {
        label: "Subscription",
        value: "Subscription",
      },
      {
        label: "Refund",
        value: "Refund",
      },
      {
        label: "Renewal",
        value: "Renewal",
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
        label: "Google Pay",
        value: "Google Pay",
      },
      {
        label: "Stripe",
        value: "Stripe",
      },
      {
        label: "UPI",
        value: "UPI",
      },
    ],
  },

  {
    key: "date",
    label: "Date",
    type: "dateRange",
  },
];

export default function TransactionTable() {
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null,
  );
  const [openFilter, setOpenFilter] = useState(false);
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    tenant: "",
    type: "",
    paymentMethod: "",
    dateFrom: "",
    dateTo: "",
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
      filters.tenant &&
      !item.tenant.toLowerCase().includes(filters.tenant.toLowerCase())
    )
      return false;

    if (filters.type && item.type !== filters.type) return false;

    if (filters.paymentMethod && item.paymentMethod !== filters.paymentMethod)
      return false;

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
            render: (row: any) => (
              <span
                className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium ${
                  row.type === "Subscription"
                    ? "bg-[#ECE9FF] text-[#576CBC]"
                    : "bg-[#FDECEC] text-[#EF4444]"
                }`}
              >
                {row.type}
              </span>
            ),
          },

          {
            key: "amount",
            header: "Amount",
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
            key: "dueDate",
            header: "Due Date",
            render: (row: any) => (
              <span className="text-[#2E62B8]">{row.dueDate}</span>
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
        resultCount={data.length}
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
          console.log(values);

          setFilters(values);

          setOpenFilter(false);
        }}
      />
    </div>
  );
}
