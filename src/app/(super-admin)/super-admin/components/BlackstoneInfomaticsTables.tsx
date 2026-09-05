"use client";

import React, { useState, useEffect } from "react";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import Pagination from "@/components/Pagination";
import { useRouter } from "next/navigation";

interface Subscription {
  id?: string;
  invoiceId: string;
  plan: string;
  amount: number;
  planCycle: number;
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
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch subscriptions from API
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:5001/subscription-invoices/tenant/TEN000010"
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          // Transform API data to match the component's data structure
          const formattedData = result.data.map((item: any, index: number) => ({
            id: item.invoiceId || `sub-${index}`,
            invoiceId: item.invoiceId,
            plan: item.plan,
            amount: `$${item.amount.toLocaleString()}`,
            planCycle: item.planCycle === 12 ? "Yearly" : item.planCycle === 1 ? "Monthly" : `${item.planCycle} Months`,
            paymentMethod: item.paymentMethod.charAt(0).toUpperCase() + item.paymentMethod.slice(1),
            date: new Date(item.paymentDate).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            }),
            planStatus: item.planStatus.charAt(0).toUpperCase() + item.planStatus.slice(1).toLowerCase(),
            paymentStatus: item.paymentStatus.charAt(0).toUpperCase() + item.paymentStatus.slice(1).toLowerCase(),
            cardNumber: undefined, // API doesn't provide card number
          }));
          
          setSubscriptions(formattedData);
        } else {
          throw new Error(result.message || "Failed to fetch subscriptions");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        console.error("Error fetching subscriptions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

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
    
    // Parse date from the subscription date string (which is in format "DD MMM YYYY")
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

  const getBadgeStyle = (type: string, value: string) => {
    const key = value.toLowerCase();

    if (type === "plan") {
      if (key === "premium" || key.includes("max")) 
        return "bg-[#e1e2f4] text-[#5f62dd] dark:bg-indigo-900/30 dark:text-indigo-400";
      if (key === "standard") 
        return "bg-[#dae4f6] text-[#477ff1] dark:bg-blue-900/30 dark:text-blue-400";
      if (key === "basic") 
        return "bg-[#def5fa] text-[#22bedd] dark:bg-cyan-900/30 dark:text-cyan-400";
      return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    }

    if (type === "planStatus") {
      if (key === "active") 
        return "bg-[#DCFCE7] text-[#16A34A] dark:bg-green-900/30 dark:text-green-400";
      if (key === "expired") 
        return "bg-[#FEE2E2] text-[#DC2626] dark:bg-red-900/30 dark:text-red-400";
      return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    }

    if (type === "paymentStatus") {
      if (key === "success" || key === "paid") 
        return "bg-[#DCFCE7] text-[#16A34A] dark:bg-green-900/30 dark:text-green-400";
      if (key === "pending") 
        return "bg-[#FEF9C3] text-[#CA8A04] dark:bg-amber-900/30 dark:text-amber-400";
      if (key === "failed") 
        return "bg-[#FEE2E2] text-[#DC2626] dark:bg-red-900/30 dark:text-red-400";
      return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    }

    return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
  };

  // Render payment method as text - exactly as "Card" or "UPI"
  const renderPaymentMethod = (method: string) => {
    const methodLower = method.toLowerCase();
    
    // Map API payment methods to display names
    const paymentMethodMap: Record<string, string> = {
      card: "Card",
      upi: "UPI",
      visa: "Card",
      mastercard: "Card",
      paypal: "PayPal",
      bank_transfer: "Bank Transfer",
      cash: "Cash",
      wallet: "Wallet",
    };

    return (
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-700 dark:text-gray-300 font-medium">
          {paymentMethodMap[methodLower] || method}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 dark:text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#576CBC] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 dark:text-white">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="text-lg font-semibold">Error loading data</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#576CBC] text-white rounded-lg hover:bg-[#465a9e]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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

              {subscriptions.length === 0 ? (
                <div className="text-center py-12 dark:text-gray-300">
                  <p className="text-gray-500 dark:text-gray-400">No subscriptions found</p>
                </div>
              ) : (
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
                          key={subscription.id || subscription.invoiceId}
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
                            {renderPaymentMethod(subscription.paymentMethod)}
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
                              onClick={() => toggleDropdown(subscription.id || subscription.invoiceId)}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                            >
                              <BsThreeDotsVertical />
                            </button>

                            {openDropdownId === (subscription.id || subscription.invoiceId) && (
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
              )}
            </div>
            {subscriptions.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
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
                {Array.from(new Set(subscriptions.map(s => s.plan))).map(plan => (
                  <option key={plan} value={plan}>{plan}</option>
                ))}
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
                {Array.from(new Set(subscriptions.map(s => s.paymentMethod))).map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
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
                {Array.from(new Set(subscriptions.map(s => s.paymentStatus))).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
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
                  {renderPaymentMethod(selectedSubscription.paymentMethod)}
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