"use client";

import React, { useEffect, useState } from "react";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import Pagination from "@/components/Pagination";
import { useRouter } from "next/navigation";

interface Subscription {
  invoiceId: string;
  plan: string;
  amount: string;
  planCycle: string;
  paymentMethod: string;
  date: string;
  planStatus: string;
  paymentStatus: string;
}

const BlackstoneInfomaticsTables = () => {
  const router = useRouter();
  interface Subscription {
    id: string;
    invoiceId: string;
    plan: string;
    amount: string;
    planCycle: string;
    paymentMethod: string;
    date: string;
    planStatus: string;
    paymentStatus: string;
  }

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: "1",
      invoiceId: "INV-10001",
      plan: "Premium",
      amount: "$8,500",
      planCycle: "Monthly",
      paymentMethod: "Visa",
      date: "12 Sep 2025",
      planStatus: "Active",
      paymentStatus: "Paid",
    },
    {
      id: "2",
      invoiceId: "INV-10002",
      plan: "Standard",
      amount: "$5,500",
      planCycle: "Monthly",
      paymentMethod: "UPI",
      date: "18 Sep 2025",
      planStatus: "Active",
      paymentStatus: "Pending",
    },
    {
      id: "3",
      invoiceId: "INV-10003",
      plan: "Basic",
      amount: "$2,500",
      planCycle: "Yearly",
      paymentMethod: "MasterCard",
      date: "20 Sep 2025",
      planStatus: "Expired",
      paymentStatus: "Failed",
    },
  ]);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    plan: "",
    paymentMethod: "",
   status:"",
    fromDate:"",
    toDate:"",
  });

  const itemsPerPage = 10;

  const toggleDropdown = (id: string) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  const filteredSubscriptions = subscriptions.filter((subscription) => {
  const search =
    subscription.invoiceId
      .toLowerCase()
      .includes(searchKeyword.toLowerCase()) ||
    subscription.plan
      .toLowerCase()
      .includes(searchKeyword.toLowerCase()) ||
    subscription.paymentMethod
      .toLowerCase()
      .includes(searchKeyword.toLowerCase());

  const planFilter =
    !filters.plan ||
    subscription.plan === filters.plan;

  const paymentMethodFilter =
    !filters.paymentMethod ||
    subscription.paymentMethod === filters.paymentMethod;

  const statusFilter =
    !filters.status ||
    subscription.paymentStatus === filters.status;

  const subscriptionDate = new Date(subscription.date);

  const fromDateFilter =
    !filters.fromDate ||
    subscriptionDate >= new Date(filters.fromDate);

  const toDateFilter =
    !filters.toDate ||
    subscriptionDate <= new Date(filters.toDate);

  return (
    search &&
    planFilter &&
    paymentMethodFilter &&
    statusFilter &&
    fromDateFilter &&
    toDateFilter
  );
});

  const paginatedSubscriptions = filteredSubscriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-600";
      case "Trial":
        return "bg-blue-100 text-blue-600";
      case "Inactive":
        return "bg-red-100 text-red-600";
      default:
        return "bg-yellow-100 text-yellow-600";
    }
  };

  return (
    <div>
      <br />

      <div className="md:p-0 mx-auto w-full">
        <div className="flex flex-col h-full w-full justify-between">
          <div className="flex flex-col">
            {/* Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
              <div className="flex flex-wrap gap-4 font-semibold text-xl">
                Blackstone Academy Subscriptions
              </div>
            </div>

            {/* Search + Filter */}
            <div className="w-full bg-[#FAFAFB] dark:bg-[#343434] rounded-lg">
              <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by keyword"
                    className="bg-transparent outline-none text-[15px] w-52 py-3"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>

                <div
                  onClick={() => setShowFilter(true)}
                  className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
                >
                  <MdTune className="w-4 h-4" />
                  <span>Filter</span>
                </div>

                <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                  <span className="text-left -ml-60">
                    Showing {filteredSubscriptions.length} of{" "}
                    {subscriptions.length}
                  </span>
                </div>
              </div>

              {/* Table */}
              <table className="table-fixed w-full">
                <thead className="text-[13px] bg-[#4C6993] text-white">
                  <tr>
                    {[
                      "Invoice ID",
                      "Plan",
                      "Amount",
                      "Plan Cycle",
                      "Payment Method",
                      "Date",
                      "Plan Status",
                      "Payment Status",
                      "Action",
                    ].map((header, idx) => (
                      <th
                        key={idx}
                        className="px-2 py-1 border border-[#4C6993] text-left text-wrap break-words"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedSubscriptions.map((subscription, index) => {
                    const rowBgClass =
                      index % 2 === 0
                        ? "bg-[#fff] dark:bg-[#2C2C2C]"
                        : "bg-[#F8F8F8] dark:bg-[#303030]";

                    return (
                      <tr
                        key={subscription.id}
                        className={`text-[10px] ${rowBgClass}`}
                      >
                        <td className="px-3 py-3 text-[11px] text-left">
                          {subscription.invoiceId}
                        </td>

                        <td className="px-3 py-3 text-[11px] text-left">
                          {subscription.plan}
                        </td>

                        <td className="px-3 py-3 text-[11px] text-left">
                          {subscription.amount}
                        </td>

                        <td className="px-3 py-3 text-[11px] text-left">
                          {subscription.planCycle}
                        </td>

                        <td className="px-3 py-3 text-[11px] text-left">
                          {subscription.paymentMethod}
                        </td>

                        <td className="px-3 py-3 text-[11px] text-left">
                          {subscription.date}
                        </td>

                        <td className="px-3 py-3 text-left">
                          <span
                            className={`inline-flex items-center justify-center w-[80px] h-6 rounded-md text-xs font-medium ${getStatusStyle(
                              subscription.planStatus,
                            )}`}
                          >
                            {subscription.planStatus}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-left">
                          <span
                            className={`inline-flex items-center justify-center w-[80px] h-6 rounded-md text-xs font-medium ${
                              subscription.paymentStatus === "Paid"
                                ? "bg-green-100 text-green-600"
                                : subscription.paymentStatus === "Pending"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-red-100 text-red-600"
                            }`}
                          >
                            {subscription.paymentStatus}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-left relative text-[12px]">
                          <button
                            onClick={() => toggleDropdown(subscription.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <BsThreeDotsVertical />
                          </button>

                          {openDropdownId === subscription.id && (
                            <div className="absolute right-0 top-8 w-40 bg-white dark:bg-[#343434] border rounded-md shadow-lg z-50">
                              <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#444]">
                                View Details
                              </button>

                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-[#444]"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
      {showFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            className="bg-white dark:bg-[#232323] p-6 rounded-2xl shadow-lg w-[500px] flex flex-col z-50"
            onSubmit={(e) => {
              e.preventDefault();
              setShowFilter(false);
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Filter by</h2>
              <button
                type="button"
                className="text-gray-400 text-2xl font-bold cursor-pointer"
                onClick={() => setShowFilter(false)}
              >
                ×
              </button>
            </div>

            {/* Invoice ID */}
           <div className="mb-4">
  <label className="block text-sm font-medium mb-2">
    Plan
  </label>

  <select
    value={filters.plan}
    onChange={(e) =>
      setFilters((f) => ({
        ...f,
        plan: e.target.value,
      }))
    }
    className="w-full  dark:bg-[#2c2c2c] rounded-lg px-4 py-2.5"
  >
    <option value="">Select Status</option>
    <option value="Basic">Basic</option>
    <option value="Standard">Standard</option>
    <option value="Premium">Premium</option>
  </select>
</div>

            {/* Plan */}
            <div className="mb-4">
  <label className="block text-sm font-medium mb-2">
    Payment Method
  </label>

  <select
    value={filters.paymentMethod}
    onChange={(e) =>
      setFilters((f) => ({
        ...f,
        paymentMethod: e.target.value,
      }))
    }
    className="w-full dark:bg-[#2c2c2c] rounded-lg px-4 py-2.5"
  >
    <option value="">Select Status</option>
    <option value="Visa">Visa</option>
    <option value="MasterCard">MasterCard</option>
    <option value="UPI">UPI</option>
  </select>
</div>

            {/* Plan Cycle */}
            <div className="mb-4">
  <label className="block text-sm font-medium mb-2">
    Date
  </label>

  <div className="grid grid-cols-2 gap-3">

    <input
      type="date"
      value={filters.fromDate}
      onChange={(e) =>
        setFilters((f) => ({
          ...f,
          fromDate: e.target.value,
        }))
      }
      className="dark:bg-[#2c2c2c] rounded-lg px-3 py-2.5"
    />

    <input
      type="date"
      value={filters.toDate}
      onChange={(e) =>
        setFilters((f) => ({
          ...f,
          toDate: e.target.value,
        }))
      }
      className="dark:bg-[#2c2c2c] rounded-lg px-3 py-2.5"
    />

  </div>
</div>

            {/* Payment Method */}
           <div className="mb-5">
  <label className="block text-sm font-medium mb-2">
    Status
  </label>

  <select
    value={filters.status}
    onChange={(e) =>
      setFilters((f) => ({
        ...f,
        status: e.target.value,
      }))
    }
    className="w-full dark:bg-[#2c2c2c] rounded-lg px-4 py-2.5"
  >
    <option value="">Select Status</option>
    <option value="Paid">Paid</option>
    <option value="Pending">Pending</option>
    <option value="Failed">Failed</option>
  </select>
</div>

           

            <div className="flex gap-4 justify-end">
              <button
                type="button"
                className="border border-[#576CBC] text-[#576CBC] rounded-lg px-6 py-2 font-semibold"
                onClick={() =>
  setFilters({
    plan: "",
    paymentMethod: "",
    fromDate: "",
    toDate: "",
    status: "",
  })
}
              >
                Reset
              </button>

              <button
                type="submit"
                className="bg-[#576CBC] text-white rounded-lg px-6 py-2 font-semibold"
              >
                Show Results
              </button>
            </div>
          </form>

          <div className="fixed inset-0" onClick={() => setShowFilter(false)} />
        </div>
      )}
    </div>
  );
};

export default BlackstoneInfomaticsTables;
