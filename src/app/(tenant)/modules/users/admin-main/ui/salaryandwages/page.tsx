"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { Sun } from "lucide-react";
import Pagination from "@/components/Pagination";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import AdminHeader from "../../components/AdminHeader";
import axios from "axios";
import moment from "moment";
import BaseLayout4 from "../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

export interface ISalaryWage {
  _id?: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  salaryAmount: string;
  deductionAmount: string;
  balanceAmount: string;
  paymentMethod: string;
  paymentDate: string;
  paymentStatus: "Paid" | "Pending";
}

export interface ISalaryWageResponse {
  totalCount: number;
  expenses: ISalaryWage[];
}
interface SalaryCardCounts {
  totalSalaryPaid: number;
  totalPendingSalary: number;
  balanceSalary: number;
}
const SalaryCard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedSalary, setSelectedSalary] = useState<ISalaryWage | null>(
    null
  );
  const [showPopup, setShowPopup] = useState(false);
  const [selectedSalarys, setSelectedSalarys] = useState<ISalaryWage | null>(
    null
  );
  const [showPopups, setShowPopups] = useState(false);
  const [actionOpenId, setActionOpenId] = useState<string | null>(null);
  const [salaryWages, setSalaryWages] = useState<ISalaryWage[]>([]);
  const [editForm, setEditForm] = useState({
    salaryAmount: "",
    deductionAmount: "",
    paymentStatus: "",
    paymentDate: "",
  });
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
  
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
  
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
  
    return `${year}-${month < 10 ? "0" + month : month}-${
      day < 10 ? "0" + day : day
    }`;
  };
  
  const [salaryCardData, setSalaryCardData] = useState<SalaryCardCounts>({
    totalSalaryPaid: 0,
    totalPendingSalary: 0,
    balanceSalary: 0,
  });

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AdminAuthToken")
        : null;

    if (!token) {
      console.error("❌ AdminAuthToken not found");
      return;
    }
    const fetchSalaryCardCounts = async () => {
      try {
        const response = await axios.get<SalaryCardCounts>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.SALARYWAGES.GET_SALARY_CARD}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSalaryCardData(response.data);
      } catch (error) {
        console.error("Error fetching salary card data:", error);
      }
    };

    fetchSalaryCardCounts();
  }, []);

  useEffect(() => {
    console.log("useEffect running");
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AdminAuthToken")
        : null;
    if (!token) {
      console.error("❌ AdminAuthToken not found");
      return;
    }
    const fetchSalaryWages = async () => {
      try {
        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.OTHEREMPLOYEE.GET_WAGES}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data: ISalaryWageResponse = await response.json();
        console.log("Fetched salary wages data:", data); // Debug log
        setSalaryWages(data.expenses);
      } catch (err) {
        console.error("Error fetching salary data", err);
      }
    };

    fetchSalaryWages();
  }, []);

  const handleActionClick = (id: string) => {
    setActionOpenId((prevId) => (prevId === id ? null : id));
  };

  const handleViewDetails = (row: ISalaryWage) => {
    setSelectedSalary(row);
    setShowPopup(true);
  };

  const handleCancel = (_id: string) => {
    setActionOpenId(null);
  };

  // Filter logic: filter salaryData before pagination
  const filteredData = (salaryWages ?? []).filter((row: ISalaryWage) => {
    const statusMatch = filterStatus
      ? row.paymentStatus === filterStatus
      : true;
    const categoryMatch = filterCategory
      ? row.designation === filterCategory
      : true;
    const searchMatch = searchText
      ? row.employeeId.toLowerCase().includes(searchText.toLowerCase()) ||
        row.employeeName.toLowerCase().includes(searchText.toLowerCase()) ||
        row.designation.toLowerCase().includes(searchText.toLowerCase()) ||
        row.salaryAmount.toLowerCase().includes(searchText.toLowerCase()) ||
        row.paymentDate.toLowerCase().includes(searchText.toLowerCase())
      : true;
    return statusMatch && categoryMatch && searchMatch;
  });

  // Pagination logic: paginate filteredData
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const filteredPaginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <BaseLayout4>
      <AdminHeader currentSection="Salary and Wages" />
      <div className="w-full px-2 py-4">
        <br />
        <div className="flex flex-wrap justify-between items-start gap-6 mb-6">
          <div className="w-full max-w-[1255px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="w-full h-[125px] flex flex-col p-4 rounded-xl bg-[#7689BD] text-white shadow-md">
              <h4 className="text-base font-bold">Total Salary Paid</h4>
              <div className="mt-8">
                <h1 className="text-lg font-bold ">
                  ${salaryCardData.totalSalaryPaid.toLocaleString()}
                </h1>
                <p className="text-[12px] opacity-90">
                  60% increase than Last Month
                </p>
              </div>
            </div>
            {/* Card 2 */}
            <div className="w-full h-[125px] flex flex-col p-4 rounded-xl bg-[#7689BD] text-white shadow-md">
              <h4 className="text-base font-bold">Pending Salary</h4>
              <div className="mt-8">
                <h1 className="text-lg font-bold ">
                  {" "}
                  ${salaryCardData.totalPendingSalary.toLocaleString()}
                </h1>
                <p className="text-[12px] opacity-90">
                  10% increase than Last Month
                </p>
              </div>
            </div>
            {/* Card 3 */}
            <div className="w-full h-[125px] flex flex-col p-4 rounded-xl bg-[#7689BD] text-white shadow-md">
              <h4 className="text-base font-bold">Balance</h4>
              <div className="mt-8">
                <h1 className="text-lg font-bold ">
                  {" "}
                  ${salaryCardData.balanceSalary.toLocaleString()}
                </h1>
                <p className="text-[12px] opacity-90">
                  50% increase than Last Month
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
                Showing {filteredPaginatedData.length} of {filteredData.length}
              </span>
            </div>
          </div>
          <table className="table-fixed w-full dark:bg-[#3f3f3f]">
            <thead className="text-[13px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
              <tr>
                <th className="px-2 py-1 border border-[#4C6993] text-left w-[13%] break-words">
                  Employee
                  <br />
                  ID
                </th>
                <th className="px-2 py-1 border border-[#4C6993] text-left w-[12%] break-words">
                  Employee
                  <br />
                  Name
                </th>
                <th className="px-2 py-1 border border-[#4C6993] text-left w-[12%] break-words">
                  Designation
                </th>
                <th className="px-2 py-1 border border-[#4C6993] text-left w-[10%] break-words">
                  Salary
                  <br />
                  Amount
                </th>
                <th className="px-2 py-1 border border-[#4C6993] text-left w-[10%] break-words">
                  Deduction
                </th>
                <th className="px-2 py-1 border border-[#4C6993] text-left w-[10%] break-words">
                  Balance
                </th>
                <th className="px-2 py-1 border border-[#4C6993] text-left w-[13%] break-words">
                  Payment
                  <br />
                  Method
                </th>
                <th className="px-2 py-1 border border-[#4C6993] text-left w-[12%] break-words">
                  Payment
                  <br />
                  Date
                </th>
                <th className="px-2 py-1 border border-[#4C6993] text-left w-[10%] break-words">
                  Status
                </th>
                <th className="px-2 py-1 border border-[#4C6993] text-left w-[10%] break-words">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPaginatedData.map((row, index) => (
                <tr
                  key={row._id}
                  className={`text-[9px] text-center mt-0 dark:text-white ${
                    index % 2 === 0
                      ? "bg-[#faf9f9] dark:bg-[#2C2C2C]"
                      : "bg-[#ebebeb] dark:bg-[#303030]"
                  }`}
                >
                  <td className="px-3 py-3 break-words text-[12px] text-left">
                    {row.employeeId}
                  </td>
                  <td className="px-3 py-3 break-words text-[12px] text-left">
                    {row.employeeName}
                  </td>
                  <td className="px-3 py-3 break-words text-[12px] text-left">
                    {row.designation}
                  </td>
                  <td className="px-3 py-3 break-words text-[12px] text-left">
                    {Number(row.salaryAmount).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 break-words text-[12px] text-left">
                    {Number(row.deductionAmount).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 break-words text-[12px] text-left">
                    {Number(row.balanceAmount).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 break-words text-[12px] text-left">
                    {row.paymentMethod}
                  </td>
                  <td className="px-3 py-3 break-words text-[12px] text-left">
                  {formatDate(row.paymentDate)}                  </td>
                  <td className="px-3 py-3 break-words text-[12px] text-left">
                    <span
                      className={`inline-flex items-center justify-center w-20 h-5 px-3 py-1 rounded-md
                        ${
                          row.paymentStatus === "Paid"
                            ? "bg-[#ECFDF3] text-[#377E36]"
                            : row.paymentStatus === "Pending"
                            ? "bg-[#F0AD4E33] text-[#F0AD4E]"
                            : "bg-gray-200 text-gray-700"
                        }
                      `}
                    >
                      {row.paymentStatus}
                    </span>
                  </td>
                  <td className="relative px-3 py-3 break-words text-[12px] text-center">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={() => handleActionClick(row._id || "")}
                        className="px-2 text-gray-600 hover:text-gray-800 dark:text-white"
                      >
                        ⋮
                      </button>
                      {actionOpenId === row._id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white border rounded-md shadow-md z-50 dark:bg-[#3f3f3f] dark:border-zinc-600">
                          {row.paymentStatus === "Paid" ? (
                            <>
                              <button
                                onClick={() => {
                                  handleViewDetails(row);
                                  setActionOpenId(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-zinc-700"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  handleCancel(row._id || "");
                                  setActionOpenId(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-zinc-700"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedSalarys(row);
                                  setShowPopups(true);
                                  setActionOpenId(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-zinc-700"
                              >
                                Pay Now
                              </button>
                              <button
                                onClick={() => {
                                  handleCancel(row._id || "");
                                  setActionOpenId(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-zinc-700"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
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
        {showPopup && selectedSalary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl p-6 relative dark:bg-[#3f3f3f]">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
                onClick={() => setShowPopup(false)}
              >
                &times;
              </button>

              <h2 className="text-lg font-semibold mb-6">Payment Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <label className="font-medium mb-1 block">Employee ID</label>
                  <input
                    value={selectedSalary.employeeId}
                    readOnly
                    className="w-full p-2 border rounded text-[13px]  dark:bg-[#343434] dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium mb-1 block">
                    Employee Name
                  </label>
                  <input
                    value={selectedSalary.employeeName}
                    readOnly
                    className="w-full p-2 border rounded text-[13px]  dark:bg-[#343434] dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium mb-1 block">Designation</label>
                  <input
                    value={selectedSalary.designation}
                    readOnly
                    className="w-full p-2 border rounded text-[13px]  dark:bg-[#343434] dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium mb-1 block">
                    Salary Amount
                  </label>
                  <input
                    value={`$${selectedSalary.balanceAmount}`}
                    readOnly
                    className="w-full p-2 border rounded text-[13px]  dark:bg-[#343434] dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium mb-1 block">Payment Date</label>
                  <input
                    value={selectedSalary.paymentDate}
                    readOnly
                    className="w-full p-2 border rounded text-[13px]  dark:bg-[#343434] dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium mb-1 block">
                    Payment Received Date
                  </label>
                  <input
                    value={selectedSalary.paymentDate}
                    readOnly
                    className="w-full p-2 border rounded text-[13px]  dark:bg-[#343434] dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium mb-1 block">
                    Payment Status
                  </label>
                  <input
                    value={selectedSalary.paymentStatus}
                    readOnly
                    className="w-full p-2 border rounded text-[13px]  dark:bg-[#343434] dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium mb-1 block">Earnings</label>
                  <input
                    value={`$${selectedSalary.salaryAmount}`}
                    readOnly
                    className="w-full p-2 border rounded text-[13px]  dark:bg-[#343434] dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium mb-1 block">Deductions</label>
                  <input
                    value={`$${selectedSalary.deductionAmount}`}
                    readOnly
                    className="w-full p-2 border rounded text-[13px]  dark:bg-[#343434] dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium mb-1 block">Description</label>
                  <textarea
                    placeholder="Write your comment here..."
                    className="w-full p-2 border rounded text-[13px] h-[80px] resize-none  dark:bg-[#343434] dark:text-white"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {showPopups && selectedSalarys && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl p-6 relative dark:bg-[#3f3f3f]">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
                onClick={() => setShowPopups(false)}
              >
                &times;
              </button>

              <h2 className="text-lg font-semibold mb-6">Payment Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <label className="font-medium mb-1 block">Employee ID</label>
                  <input
                    value={selectedSalarys.employeeId}
                    readOnly
                    className="w-full p-2 border rounded text-[13px]  dark:bg-[#343434] dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium mb-1 block">
                    Employee Name
                  </label>
                  <input
                    value={selectedSalarys.employeeName}
                    readOnly
                    className="w-full p-2 border rounded text-[13px]  dark:bg-[#343434] dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium mb-1 block">Designation</label>
                  <input
                    value={selectedSalarys.designation}
                    readOnly
                    className="w-full p-2 border rounded text-[13px]  dark:bg-[#343434] dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium mb-1 block">
                    Salary Amount (Earnings - Deductions)
                  </label>
                  <input
                    value={
                      editForm.salaryAmount && editForm.deductionAmount
                        ? String(
                            Number(editForm.salaryAmount) -
                              Number(editForm.deductionAmount)
                          )
                        : ""
                    }
                    readOnly
                    className="w-full p-2 border rounded text-[13px]  dark:bg-[#343434] dark:text-white bg-gray-100"
                  />
                </div>

                <div>
                  <label className="font-medium mb-1 block">Payment Date</label>
                  <input
                    type="date"
                    value={
                      moment(
                        editForm.paymentDate,
                        moment.ISO_8601,
                        true
                      ).isValid()
                        ? moment(editForm.paymentDate).format("YYYY-MM-DD")
                        : ""
                    }
                    onChange={(e) =>
                      setEditForm({ ...editForm, paymentDate: e.target.value })
                    }
                    placeholder="-"
                    className="w-full p-2 border rounded text-[13px] dark:bg-[#343434] dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium mb-1 block">
                    Payment Received Date
                  </label>
                  <input className="w-full p-2 border rounded text-[13px]  dark:bg-[#343434] dark:text-white" />
                </div>

                <div>
                  <label className="font-medium mb-1 block">
                    Payment Status
                  </label>
                  <select
                    value={editForm.paymentStatus}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        paymentStatus: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded text-[13px] dark:bg-[#343434] dark:text-white"
                  >
                    <option value="">Select Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium mb-1 block">Earnings</label>
                  <input
                    value={editForm.salaryAmount}
                    onChange={(e) =>
                      setEditForm({ ...editForm, salaryAmount: e.target.value })
                    }
                    className="w-full p-2 border rounded text-[13px]  dark:bg-[#343434] dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium mb-1 block">Deductions</label>
                  <input
                    value={editForm.deductionAmount}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        deductionAmount: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded text-[13px]  dark:bg-[#343434] dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium mb-1 block">Description</label>
                  <textarea
                    placeholder="Write your comment here..."
                    className="w-full p-2 border rounded text-[13px] h-[80px] resize-none  dark:bg-[#343434] dark:text-white"
                    readOnly
                  />
                </div>
                <button
                  className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("AdminAuthToken");
                      const computedSalaryAmount =
                        editForm.salaryAmount && editForm.deductionAmount
                          ? Number(editForm.salaryAmount) -
                            Number(editForm.deductionAmount)
                          : 0;
                      const payload = {
                        amount: Number(editForm.salaryAmount), // This is the earning
                        deduction: Number(editForm.deductionAmount),
                        balanceAmount: computedSalaryAmount,
                        paymentStatus: editForm.paymentStatus,
                        paymentDate: editForm.paymentDate,
                      };
                      const url = `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.OTHEREMPLOYEE.UPDATE_WAGES}/${selectedSalarys.employeeId}`;
                      console.log("PUT request to:", url);
                      console.log("Payload:", payload);
                      const response = await axios.put(url, payload, {
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                      });
                      console.log("PUT response:", response);
                      if (response.data && response.data.success) {
                        setEditForm({
                          salaryAmount: response.data.amount
                            ? String(response.data.amount)
                            : "",
                          deductionAmount: response.data.deduction
                            ? String(response.data.deduction)
                            : "",
                          paymentStatus:
                            response.data.paymentStatus ||
                            editForm.paymentStatus,
                          paymentDate: response.data.paymentDate
                            ? response.data.paymentDate.split("T")[0]
                            : editForm.paymentDate,
                        });
                        setSelectedSalarys((prev) =>
                          prev
                            ? {
                                ...prev,
                                salaryAmount: response.data.amount
                                  ? String(response.data.amount)
                                  : prev.salaryAmount,
                                deductionAmount: response.data.deduction
                                  ? String(response.data.deduction)
                                  : prev.deductionAmount,
                                balanceAmount: response.data.balance
                                  ? String(response.data.balance)
                                  : prev.balanceAmount,
                                paymentStatus:
                                  response.data.paymentStatus ||
                                  prev.paymentStatus,
                                paymentDate:
                                  response.data.paymentDate || prev.paymentDate,
                              }
                            : prev
                        );
                      }
                      setShowPopups(false);
                    } catch (err) {
                      console.error("Failed to update salary:", err);
                    }
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 dark:bg-opacity-70">
            <div className="bg-white dark:bg-zinc-900 text-black dark:text-white rounded-2xl shadow-lg p-5 w-[400px] dark:bg-[#3f3f3f]">
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
      </div>
    
    </BaseLayout4>
  );
};

export default SalaryCard;
