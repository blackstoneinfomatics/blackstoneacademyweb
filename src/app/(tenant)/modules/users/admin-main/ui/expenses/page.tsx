"use client";

import React, { useEffect, useRef, useState } from "react";
import {  Search } from "lucide-react";
import axios from "axios";
import Pagination from "@/components/Pagination";
import { MdTune } from "react-icons/md";
import AdminHeader from "../../components/AdminHeader";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import BaseLayout4 from "../../components/BaseLayout4";

// Define the Expense interface
interface Expense {
  _id: string;
  paymentDate: string;
  expenseType: string;
  amount: string;
  category: string;
  paymentMethod: string;
  status: string;
  createdDate: string;
  createdBy: string;
  __v: number;
}

const Expenses = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [salaryData, setSalaryData] = useState<Expense[]>([]);
  const [searchText, setSearchText] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState(""); // Example filter
  const [filterCategory, setFilterCategory] = useState(""); // Example filter

  
  interface ExpenseCardCounts {
    totalExpense: number;
    totalPending: number;
    totalRevenue: number;
    balance: number;
  }
  
  
    const [cardData, setCardData] = useState<ExpenseCardCounts>({
      totalExpense: 0,
      totalPending: 0,
      totalRevenue: 0,
      balance: 0,
    });
  
    useEffect(() => {
      const token =
      typeof window !== "undefined" ? localStorage.getItem("AdminAuthToken") : null;
  
    if (!token) {
      console.error("❌ AdminAuthToken not found");
      return;
    }
      const fetchCardCounts = async () => {
        try {
          const response = await axios.get<ExpenseCardCounts>(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.EXPENSE.GET_EXPENSE}`,{
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });
          setCardData(response.data);
        } catch (error) {
          console.error("Failed to fetch expense card data:", error);
        }
      };
  
      fetchCardCounts();
    }, []);
  


  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AdminAuthToken")
        : null;

    if (!token) {
      console.error("❌ AdminAuthToken not found");
      return;
    }

    // Fetch salary data only if it's empty
    if (salaryData.length === 0) {
      axios
        .get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.EXPENSE.GET}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          const fetchedData = response.data.expenses;

          // Ensure the data is unique by checking the 'paymentDate' (or any other unique field)
          const uniqueData = fetchedData.filter(
            (
              expense: { paymentDate: any },
              index: any,
              self: { paymentDate: any }[]
            ) =>
              index ===
              self.findIndex(
                (t: { paymentDate: any }) =>
                  t.paymentDate === expense.paymentDate
              )
          );

          setSalaryData(uniqueData); // Set the unique list of expenses
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [salaryData]); // Empty state prevents unnecessary calls

  // Number of items per page
  const itemsPerPage = 7;

  // Calculate paginated data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourseData = salaryData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Calculate total pages
  const totalPages = Math.ceil(salaryData.length / itemsPerPage);

  const filteredData = paginatedCourseData.filter((row) => {
    const statusMatch = filterStatus ? row.status === filterStatus : true;
    const categoryMatch = filterCategory
      ? row.category === filterCategory
      : true;
    return statusMatch && categoryMatch;
  });

  return (
    <BaseLayout4>
      <AdminHeader currentSection="Expenses" />

      <div className="w-full px-2 py-4">
        <div className="flex flex-wrap justify-between items-start gap-6 mb-6">
          {/* Cards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full"> 
            {/* Card 1 */}
            <div className="w-full h-[125px] flex flex-col  p-4 rounded-xl bg-[#7689BD] text-white shadow-md">
              <h4 className="text-base font-bold">Total Expense</h4>

              <div className="mt-8">
              <h1 className="text-lg font-bold">${cardData.totalExpense.toLocaleString()}</h1>
              <p className="text-[12px] opacity-90">
                  60% increase than Last Month
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="w-full h-[125px] flex flex-col  p-4 rounded-xl bg-[#7689BD] text-white shadow-md">
              <h4 className="text-base font-bold">Pending</h4>

              <div className="mt-8">
              <h1 className="text-lg font-bold">${cardData.totalPending.toLocaleString()}</h1>
              <p className="text-[12px] opacity-90">
                  60% increase than Last Month
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="w-full h-[125px] flex flex-col  p-4 rounded-xl bg-[#7689BD] text-white shadow-md">
              <h4 className="text-base font-bold">Revenue</h4>

              <div className="mt-8">
              <h1 className="text-lg font-bold">${cardData.totalRevenue.toLocaleString()}</h1>
              <p className="text-[12px] opacity-90">
                  60% increase than Last Month
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="w-full h-[125px] flex flex-col  p-4 rounded-xl bg-[#7689BD] text-white shadow-md">
              <h4 className="text-base font-bold">Balance</h4>

              <div className="mt-8">
              <h1 className="text-lg font-bold">${cardData.balance.toLocaleString()}</h1>
              <p className="text-[12px] opacity-90">
                  60% increase than Last Month
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full bg-[#FAFAFB] dark:bg-[#343434] rounded-lg">
          <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
            {/* Left: Search */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search by keyword"
                className="bg-transparent outline-none text-[15px] w-52 py-3"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            {/* Center: Filter */}
            <div
              className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
              onClick={() => setIsFilterModalOpen(true)}
            >
              <MdTune className="w-4 h-4" />
              <span>Filter</span>
            </div>

            {/* Right: Showing X of Y */}
            <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
              <span className="text-left -ml-60">
                Showing {filteredData.length} of {paginatedCourseData.length}
              </span>
            </div>
          </div>
          <table className="table-fixed w-full dark:bg-[#3f3f3f]">
            <thead className="text-[13px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
              <tr>
                {[
                  "Payment Date",
                  "Expense Type",
                  "Amount",
                  "Category",
                  "Payment Method",
                  "Status",
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
              {filteredData.map((row, index) => (
                <tr
                  key={row.paymentDate}
                  className={`text-[9px] text-center mt-0 dark:text-white ${
                    index % 2 === 0
                      ? "bg-[#faf9f9] dark:bg-[#2C2C2C]"
                      : "bg-[#ebebeb] dark:bg-[#303030]"
                  }`}
                >
                  <td className="px-3 py-3 break-words text-[12px] text-left">{row.paymentDate}</td>
                  <td className="px-3 py-3 break-words text-[12px] text-left">{row.expenseType}</td>
                  <td className="px-3 py-3 break-words text-[12px] text-left">{row.amount}</td>
                  <td className="px-3 py-3 break-words text-[12px] text-left">{row.category}</td>
                  <td className="px-3 py-3 break-words text-[12px] text-left">{row.paymentMethod}</td>
                  <td className="px-3 py-3 break-words text-[12px] text-left">
                    <span
                      className={`inline-flex items-center justify-center w-24 h-6 px-3 py-1 rounded-md
                        ${
                          row.status === "Paid"
                            ? "bg-[#ECFDF3] text-[#377E36]"
                            : row.status === "Pending"
                            ? "bg-[#F0AD4E33] text-[#F0AD4E]"
                            : "bg-gray-200 text-gray-700"
                        }
                      `}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 dark:bg-opacity-70">
          <div className="bg-white dark:bg-zinc-900 text-black dark:text-white rounded-2xl shadow-lg p-5 w-[400px]">
            <h2 className="text-base font-semibold mb-3">Filter by</h2>

            {/* Expense Type */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Expense Type
              </label>
              <select
                className="w-full border rounded-md px-2 py-1.5 bg-white dark:bg-zinc-800 dark:text-white border-gray-300 dark:border-zinc-700 text-sm"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All</option>
                <option value="Utilities">Utilities</option>
                <option value="Rent">Rent</option>
                <option value="Supplies">Supplies</option>
              </select>
            </div>

            {/* Payment Method */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Payment Method
              </label>
              <input
                type="text"
                placeholder="e.g., Bank Transfer"
                className="w-full border rounded-md px-2 py-1.5 bg-white dark:bg-zinc-800 dark:text-white border-gray-300 dark:border-zinc-700 text-sm placeholder:text-gray-400 dark:placeholder:text-zinc-400"
              />
            </div>

            {/* Payment Date */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Payment Date
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="flex-1 border rounded-md px-2 py-1.5 bg-white dark:bg-zinc-800 dark:text-white border-gray-300 dark:border-zinc-700 text-sm"
                />
                <input
                  type="date"
                  className="flex-1 border rounded-md px-2 py-1.5 bg-white dark:bg-zinc-800 dark:text-white border-gray-300 dark:border-zinc-700 text-sm"
                />
              </div>
            </div>

            {/* Status */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full border rounded-md px-2 py-1.5 bg-white dark:bg-zinc-800 dark:text-white border-gray-300 dark:border-zinc-700 text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Select Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-between">
              <button
                className="px-4 py-1.5 text-sm rounded-md border bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700"
                onClick={() => {
                  setFilterCategory("");
                  setFilterStatus("");
                  setIsFilterModalOpen(false);
                }}
              >
                Reset
              </button>
              <button
                className="px-4 py-1.5 text-sm rounded-md bg-[#576CBC] text-white hover:bg-blue-700"
                onClick={() => setIsFilterModalOpen(false)}
              >
                Show {filteredData.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </BaseLayout4>
  );
};

export default Expenses;
