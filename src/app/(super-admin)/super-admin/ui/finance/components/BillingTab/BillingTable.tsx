"use client";

import ActionDropdown from "@/app/(super-admin)/super-admin/components/ActionMenu";
import DataTable from "@/app/(super-admin)/super-admin/components/DataTable";
import FilterDrawer, {
  FilterField,
} from "@/app/(super-admin)/super-admin/components/FilterDrawer";
import TableToolbar from "@/app/(super-admin)/super-admin/components/TableToolbar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";


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
  const [ setSelectedTransaction] = useState<any | null>(
    null,
  );
  const [openFilter, setOpenFilter] = useState(false);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<BillingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const latestRequestId = useRef(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [filters, setFilters] = useState({
    billingName: "",
    paymentMethod: "",
    paymentDateFrom: "",
    paymentDateTo: "",
    dueDateFrom: "",
    dueDateTo: "",
    status: "",
  });

  const [ setOpen] = useState(false);

  const fetchBillings = useCallback(async (page: number) => {
    const requestId = ++latestRequestId.current;

    try {
      setIsLoading(true);
      const response = await axios.get<BillingListApiResponse>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.BILLING.GET}`,
        {
          params: {
            page,
            limit: pagination.limit,
          },
        },
      );

      if (requestId !== latestRequestId.current) return;

      if (response.data.success) {
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
        setPagination(response.data.data.pagination);
      } else {
        setData([]);
        toast.error(response.data.message || "Failed to fetch billing data");
      }
    } catch (error) {
      if (requestId !== latestRequestId.current) return;

      console.error("Failed to fetch billing data:", error);
      setData([]);
      toast.error("Failed to fetch billing data");
    } finally {
      if (requestId === latestRequestId.current) {
        setIsLoading(false);
      }
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchBillings(1);
  }, [fetchBillings]);

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
        total={pagination.totalRecords}
        showing={filteredBySearch.length}
        searchPlaceholder="Search By Keyword"
        onFilterClick={() => setOpenFilter(true)}
      />

      <DataTable
        heading="All Transactions"
        selectable={false}
        loading={isLoading}
        pagination={{
          currentPage: pagination.page,
          totalPages: Math.max(pagination.totalPages, 1),
          onPageChange: fetchBillings,
          disabled: isLoading,
        }}
        columns={[
            {
              key: "billingName",
              header: "Billing Name",
              render: (row: any) => (
                <span className="dark:text-white">{row.billingName}</span>
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
              key: "paymentMethod",
              header: "Payment Method",
              render: (row: any) => (
                <span className="text-[#344054] dark:text-gray-300">
                  {row.paymentMethod}
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
