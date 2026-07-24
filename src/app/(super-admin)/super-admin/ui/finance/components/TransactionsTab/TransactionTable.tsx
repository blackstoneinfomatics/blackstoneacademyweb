import DataTable from '@/app/(super-admin)/super-admin/components/DataTable'
import { MoreVertical } from 'lucide-react'
import React from 'react'
import Image from 'next/image'

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
    paymentDate: "Sep, 12 2023",
    dueDate: "Sep, 12 2023",
    status: "Refunded",
  },
];

export default function TransactionTable() {
  return (
    <div>
      <DataTable
  selectable={true}
  columns={
   [
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
      <span className="font-medium text-[#344054]">
        {row.amount}
      </span>
    ),
  },

  {
    key: "paymentMethod",
    header: "Payment Method",
    render: (row: any) => (
      <div className="flex items-center gap-3">
       

        <span className="text-[#344054]">
          {row.paymentMethod}
        </span>
      </div>
    ),
  },

  {
    key: "paymentDate",
    header: "Payment Date",
    render: (row: any) => (
      <span className="text-[#2E62B8]">
        {row.paymentDate}
      </span>
    ),
  },

  {
    key: "dueDate",
    header: "Due Date",
    render: (row: any) => (
      <span className="text-[#2E62B8]">
        {row.dueDate}
      </span>
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
    render: () => (
      <button className="rounded-md p-1 hover:bg-gray-100">
        <MoreVertical
          size={18}
          className="text-[#667085]"
        />
      </button>
    ),
  },
]
}
  data={data}
/>
    </div>
  )
}
