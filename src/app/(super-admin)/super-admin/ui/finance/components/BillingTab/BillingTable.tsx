"use client";

import ActionDropdown from "@/app/(super-admin)/super-admin/components/ActionMenu";
import DataTable from "@/app/(super-admin)/super-admin/components/DataTable";
import FilterDrawer, {
  FilterField,
} from "@/app/(super-admin)/super-admin/components/FilterDrawer";
import TableToolbar from "@/app/(super-admin)/super-admin/components/TableToolbar";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Download } from "lucide-react";
import { downloadPdf } from "../downloadCsv";

// ✅ CORRECTED: Matches your exact backend response from getBillings()
interface BillingListApiResponse {
  success: boolean;
  message: string;
  data: {
    items: any[]; // This is the list of billings!
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

interface BillingItem {
  id: string;
  billingName: string;
  category: string;
  amount: string;
  paymentMethod: string;
  addedBy: string;
  dueDate: string;
  status: string;
}

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
    key: "addedBy",
    label: "Added By",
    type: "text",
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
      { label: "PAID", value: "PAID" },
      { label: "OVERDUE", value: "OVERDUE" },
      { label: "PENDING", value: "PENDING" },
      { label: "CANCELLED", value: "CANCELLED" },
    ],
  },
];

export default function BillingTable() {
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null,
  );
  const [openFilter, setOpenFilter] = useState(false);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<BillingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    billingName: "",
    category: "",
    paymentMethod: "",
    paymentDateFrom: "",
    paymentDateTo: "",
    addedBy: "",
    dueDateFrom: "",
    dueDateTo: "",
    status: "",
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchBillings = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<BillingListApiResponse>(
          "http://localhost:5001/billing",
        );

        if (response.data.success) {
          // ✅ READ `items` from the API response
          const billingArray = Array.isArray(response.data.data.items)
            ? response.data.data.items
            : [];

          const mappedData: BillingItem[] = billingArray.map((item: any) => {
            const formattedDate = new Date(item.paymentDate).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              },
            );

            return {
              id: item._id,
              billingName: item.billingName,
              category: item.category,
              amount: item.amount.toLocaleString("en-IN"),
              paymentMethod: item.paymentMethod,
              addedBy: item.addedBy,
              dueDate: formattedDate,
              status: item.status,
            };
          });

          setData(mappedData);
        }
      } catch (error) {
        console.error("Failed to fetch billing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillings();
  }, []);

  const handleView = (row: any) => {
    console.log("View", row);
    setSelectedTransaction(row);
    setOpen(true);
  };

  const handleEdit = (row: any) => {
    console.log("Edit", row);
  };

  // Filter logic
  const filteredData = data.filter((item) => {
    if (
      filters.billingName &&
      !item.billingName
        .toLowerCase()
        .includes(filters.billingName.toLowerCase())
    )
      return false;

    if (filters.category && item.category !== filters.category) return false;
    if (filters.paymentMethod && item.paymentMethod !== filters.paymentMethod)
      return false;
    if (filters.status && item.status !== filters.status) return false;

    if (filters.paymentDateFrom) {
      const from = new Date(filters.paymentDateFrom);
      const itemDate = new Date(item.addedBy);
      if (itemDate < from) return false;
    }
    
    if (filters.paymentDateTo) {
      const to = new Date(filters.paymentDateTo);
      const itemDate = new Date(item.addedBy);
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

  const filteredBySearch = filteredData.filter(
    (item) =>
      item.billingName.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.paymentMethod.toLowerCase().includes(search.toLowerCase()) ||
      item.status.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="dark:text-white">
      <h2
        className="mb-4 font-medium text-[#010E30E5]/90 dark:text-white px-2"
        style={{
          fontSize: "clamp(16px, 1.2vw, 18px)",
          lineHeight: "1.4",
        }}
      >
        {"Billing"}
      </h2>

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        total={data.length}
        showing={filteredBySearch.length}
        searchPlaceholder="Search By Keyword"
        onFilterClick={() => setOpenFilter(true)}
      />

      {isLoading ? (
        <div className="py-10 text-center text-gray-500 dark:text-gray-400">
          Loading billing data...
        </div>
      ) : (
        <DataTable
          heading="All Transactions"
          selectable={true}
          columns={[
            {
              key: "billingName",
              header: "Billing Name",
              render: (row: any) => (
                <span className="dark:text-white">{row.billingName}</span>
              ),
            },
            {
              key: "category",
              header: "Category",
              render: (row: any) => (
                <span
                  className={`inline-flex min-w-[70px] justify-center rounded-md px-3 py-1 text-xs font-medium ${
                    row.status === "PAID"
                      ? "bg-[#E8F8EC] text-[#2E9E44] dark:bg-green-900/30 dark:text-green-400"
                      : row.status === "REFUNDED"
                        ? "bg-[#E7E5FF] text-[#576CBC] dark:bg-indigo-900/30 dark:text-indigo-400"
                        : "bg-[#FFF4DE] text-[#F59E0B] dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  {row.category}
                </span>
              ),
            },
            {
              key: "amount",
              header: "Amount",
              render: (row: any) => (
                <span className="font-medium text-[#344054] dark:text-white">
                  ₹{row.amount}
                </span>
              ),
            },
            {
              key: "paymentDate",
              header: "Billing Date",
              render: (row: any) => (
                <span className="font-medium text-[#344054] dark:text-white">
                  {row.paymentDate}
                </span>
              ),
            },
            {
              key: "paymentMethod",
              header: "Payment Method",
              render: (row: any) => (
                <span className="text-[#344054] dark:text-gray-300">
                  {row.paymentMethod}
                </span>
              ),
            },
            {
              key: "addedBy",
              header: "Added By",
              render: (row: any) => (
                <span className="text-[#2E62B8] dark:text-sky-300">
                  {row.addedBy}
                </span>
              ),
            },
            {
              key: "status",
              header: "Payment Status",
              render: (row: any) => (
                <span
                  className={`inline-flex min-w-[70px] justify-center rounded-md px-3 py-1 text-xs font-medium ${
                    row.status === "PAID"
                      ? "bg-[#E8F8EC] text-[#2E9E44] dark:bg-green-900/30 dark:text-green-400"
                      : row.status === "OVERDUE"
                        ? "bg-[#E7E5FF] text-[#576CBC] dark:bg-indigo-900/30 dark:text-indigo-400"
                        : row.status === "PENDING"
                          ? "bg-[#FFF4DE] text-[#F59E0B] dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-[#FFF4DE] text-[#F59E0B] dark:bg-amber-900/30 dark:text-amber-400"
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
                    { label: "View Details", onClick: handleView },
                    { label: "Edit", onClick: handleEdit },
                  ]}
                />
              ),
            },
          ]}
          data={filteredBySearch}
        />
      )}

      <FilterDrawer
        open={openFilter}
        title="Filter by"
        fields={transactionFields}
        values={filters}
        resultCount={filteredBySearch.length}
        onClose={() => setOpenFilter(false)}
        onReset={() =>
          setFilters({
            billingName: "",
            category: "",
            paymentMethod: "",
            paymentDateFrom: "",
            paymentDateTo: "",
            addedBy: "",
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
