"use client";

import React, { useState } from "react";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import Pagination from "@/components/Pagination";
import { useRouter } from "next/navigation";

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
  cardNumber?: string;
}

const BlackstoneInfomaticsTables = () => {
  const router = useRouter();

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: "1",
      invoiceId: "INV-10001",
      plan: "Premium",
      amount: "$8,500",
      planCycle: "Monthly",
      paymentMethod: "Visa",
      cardNumber: "4236",
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
      cardNumber: "",
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
      cardNumber: "1234",
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
    status: "",
    fromDate: "",
    toDate: "",
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

    const planFilter = !filters.plan || subscription.plan === filters.plan;
    const paymentMethodFilter = !filters.paymentMethod || subscription.paymentMethod === filters.paymentMethod;
    const statusFilter = !filters.status || subscription.paymentStatus === filters.status;
    const subscriptionDate = new Date(subscription.date);
    const fromDateFilter = !filters.fromDate || subscriptionDate >= new Date(filters.fromDate);
    const toDateFilter = !filters.toDate || subscriptionDate <= new Date(filters.toDate);

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
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);

  // --- UPDATED: Exact Color Themes with Dark Mode ---
  const getBadgeStyle = (type: string, value: string) => {
    const key = value.toLowerCase();

    // PLAN Colors
    if (type === "plan") {
      if (key === "premium") return "bg-[#e1e2f4] text-[#5f62dd] dark:bg-indigo-900/30 dark:text-indigo-400";
      if (key === "standard") return "bg-[#dae4f6] text-[#477ff1] dark:bg-blue-900/30 dark:text-blue-400";
      if (key === "basic") return "bg-[#def5fa] text-[#22bedd] dark:bg-cyan-900/30 dark:text-cyan-400";
      return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    }

    // PLAN STATUS Colors
    if (type === "planStatus") {
      if (key === "active") return "bg-[#DCFCE7] text-[#16A34A] dark:bg-green-900/30 dark:text-green-400";
      if (key === "expired") return "bg-[#FEE2E2] text-[#DC2626] dark:bg-red-900/30 dark:text-red-400";
      return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    }

    // PAYMENT STATUS Colors
    if (type === "paymentStatus") {
      if (key === "paid") return "bg-[#DCFCE7] text-[#16A34A] dark:bg-green-900/30 dark:text-green-400";
      if (key === "pending") return "bg-[#FEF9C3] text-[#CA8A04] dark:bg-amber-900/30 dark:text-amber-400";
      if (key === "failed") return "bg-[#FEE2E2] text-[#DC2626] dark:bg-red-900/30 dark:text-red-400";
      return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    }

    return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
  };

  // --- UPDATED: Exact Uniform 24x16 pixel Logo sizing with Dark Mode ---
  const renderPaymentLogo = (method: string, cardNumber?: string) => {
    const methodLower = method.toLowerCase();

    const svgs: Record<string, React.ReactNode> = {
      visa: (
        <svg viewBox="0 0 38 12" className="w-6 h-6 fill-[#1434CB] dark:fill-white" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.3 11.6L18 .3h3.5l-3.2 11.3h-3zm8.2 0L26.8.3h3.1l-3.3 11.3h-3zm11.7-8.3c0-1 .8-1.5 1.5-1.7.4-.1 1.2-.2 1.7-.1.8-.4 1.7-1 2.6-1.2.2 0 .2.2.2.3-.1.5-1.5 4.3-2.4 6.3L36.8 3.3h-1.6zM14.2 8.3c0 2.4 1.3 3.3 2.5 3.3.7 0 1.2-.1 1.8-.3-.2-.4-.5-1.6-.6-2-.1-.1-.1-.2-.3-.2-.5 0-1.4 0-1.4-.6 0-1.2 1.6-2 2.5-2.3-.1-.4-.2-.9-.4-1.2-.7.1-1.5.6-2.1 1-.9.7-1.7 1.4-2 2.3zm-2.1 3.3l-1.2-1.1c-.7-.3-1.6-.4-2.5-.4-2.4 0-4.7.9-6.3 2.3L.5 10.1c1.7-1.1 4.1-1.8 6.3-1.8 1 0 2 .2 2.8.4.4.2.7.3 1 .6.5.5 1.5 1.3 1.5 2.3z"/>
        </svg>
      ),
      mastercard: (
        <svg viewBox="0 0 38 24" className="w-6 h-6 dark:opacity-90" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#EB001B" />
          <circle cx="26" cy="12" r="10" fill="#F79E1B" />
          <path d="M19 7a9.9 9.9 0 0 1 5.6 1.7 9.9 9.9 0 0 1-5.6 8.6 9.9 9.9 0 0 1-5.6-8.6A9.9 9.9 0 0 1 19 7z" fill="#FF5F00" />
        </svg>
      ),
      upi: (
        <span className="w-6 h-6 flex items-center justify-center text-[11px] font-bold text-[#097939] dark:text-[#4ADE80] tracking-tight">
          UPI
        </span>
      )
    };

    let formattedCardNumber = "";
    if (cardNumber) {
      formattedCardNumber = `.... .... .... ${cardNumber}`;
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center shrink-0">
          {svgs[methodLower] || <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">{method}</span>}
        </div>
        {formattedCardNumber && (
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium tracking-wider whitespace-nowrap">
            {formattedCardNumber}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="dark:text-white">
      <br />

      <div className="md:p-0 mx-auto w-full">
        <div className="flex flex-col h-full w-full justify-between">
          <div className="flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
              <div className="flex flex-wrap gap-4 font-semibold text-xl dark:text-white">
                Blackstone Academy Subscriptions
              </div>
            </div>

            <div className="w-full bg-[#FAFAFB] dark:bg-[#1F1F1F] rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#1F1F1F]">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by keyword"
                    className="bg-transparent outline-none text-[15px] w-52 py-3 dark:text-white dark:placeholder:text-gray-400"
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
                    Showing {filteredSubscriptions.length} of {subscriptions.length}
                  </span>
                </div>
              </div>

              <table className="table-fixed w-full border-collapse">
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
                        className="px-2 py-1 border border-[#4C6993] dark:border-[#6A8AB0] text-left text-wrap break-words"
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
                        : "bg-[#F8F8F8] dark:bg-[#383838]";

                    return (
                      <tr
                        key={subscription.id}
                        className={`text-[10px] ${rowBgClass}`}
                      >
                        <td className="px-3 py-3 text-[11px] text-left dark:text-white">
                          {subscription.invoiceId}
                        </td>

                        <td className="px-3 py-3 text-left">
                          <span
                            className={`inline-flex items-center justify-center min-w-[70px] px-2 py-1 rounded-md text-xs font-medium ${getBadgeStyle(
                              "plan",
                              subscription.plan
                            )}`}
                          >
                            {subscription.plan}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-[11px] text-left dark:text-white">
                          {subscription.amount}
                        </td>

                        <td className="px-3 py-3 text-[11px] text-left dark:text-white">
                          {subscription.planCycle}
                        </td>

                        <td className="px-3 py-3 text-[11px] text-left">
                          {renderPaymentLogo(subscription.paymentMethod, subscription.cardNumber)}
                        </td>

                        <td className="px-3 py-3 text-[#38619A] dark:text-sky-300 text-[11px] text-left">
                          {subscription.date}
                        </td>

                        <td className="px-3 py-3 text-left">
                          <span
                            className={`inline-flex items-center justify-center min-w-[70px] px-2 py-1 rounded-md text-xs font-medium ${getBadgeStyle(
                              "planStatus",
                              subscription.planStatus
                            )}`}
                          >
                            {subscription.planStatus}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-left">
                          <span
                            className={`inline-flex items-center justify-center min-w-[70px] px-2 py-1 rounded-md text-xs font-medium ${getBadgeStyle(
                              "paymentStatus",
                              subscription.paymentStatus
                            )}`}
                          >
                            {subscription.paymentStatus}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-left relative text-[12px]">
                          <button
                            onClick={() => toggleDropdown(subscription.id)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                          >
                            <BsThreeDotsVertical />
                          </button>

                          {openDropdownId === subscription.id && (
                            <div className="absolute right-0 top-8 w-40 bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                              <button
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#444] dark:text-gray-200"
                                onClick={() => {
                                  setSelectedSubscription(subscription);
                                  setShowViewModal(true);
                                  setOpenDropdownId(null);
                                }}
                              >
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
            className="bg-white dark:bg-[#2C2C2C] p-6 rounded-2xl shadow-lg w-[500px] flex flex-col z-50"
            onSubmit={(e) => {
              e.preventDefault();
              setShowFilter(false);
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg dark:text-white">Filter by</h2>
              <button
                type="button"
                className="text-gray-400 text-2xl font-bold cursor-pointer dark:text-gray-300"
                onClick={() => setShowFilter(false)}
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Plan</label>
              <select
                value={filters.plan}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    plan: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
              >
                <option value="">Select Plan</option>
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Payment Method</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    paymentMethod: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
              >
                <option value="">Select Payment Method</option>
                <option value="Visa">Visa</option>
                <option value="MasterCard">MasterCard</option>
                <option value="UPI">UPI</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Date Range</label>
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
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
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
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Payment Status</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    status: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
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
                className="border border-[#576CBC] bg-white dark:bg-transparent text-[#576CBC] dark:text-[#8296E6] rounded-lg px-6 py-2 font-semibold hover:bg-gray-50 dark:hover:bg-[#444] transition-colors"
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
                className="bg-[#576CBC] text-white rounded-lg px-6 py-2 font-semibold hover:bg-[#465a9e] dark:hover:bg-[#6A80D1] transition-colors"
              >
                Show Results
              </button>
            </div>
          </form>

          <div className="fixed inset-0" onClick={() => setShowFilter(false)} />
        </div>
      )}

      {showViewModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#2C2C2C] rounded-2xl w-[900px] p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[24px] font-semibold text-[#1F2A44] dark:text-white">
                Subscriptions Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-3xl text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Invoice ID</label>
                <input
                  readOnly
                  value={selectedSubscription.invoiceId}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Plan</label>
                <input
                  readOnly
                  value={selectedSubscription.plan}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Amount</label>
                <input
                  readOnly
                  value={selectedSubscription.amount}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Plan Cycle</label>
                <input
                  readOnly
                  value={selectedSubscription.planCycle}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Payment Method</label>
                <div className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] flex items-center gap-2">
                  {renderPaymentLogo(selectedSubscription.paymentMethod, selectedSubscription.cardNumber)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Date</label>
                <input
                  readOnly
                  value={selectedSubscription.date}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Plan Status</label>
                <input
                  readOnly
                  value={selectedSubscription.planStatus}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-green-600 bg-[#F9FAFB] dark:bg-[#2C2C2C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Payment Status</label>
                <input
                  readOnly
                  value={selectedSubscription.paymentStatus}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-green-600 bg-[#F9FAFB] dark:bg-[#2C2C2C]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlackstoneInfomaticsTables;