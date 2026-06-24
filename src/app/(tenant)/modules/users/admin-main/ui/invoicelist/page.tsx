"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaEdit, FaFilter } from "react-icons/fa";
import axios from "axios";
import { Search } from "lucide-react";
import { MdTune } from "react-icons/md";
import Pagination from "@/components/Pagination";
import AdminHeader from "../../components/AdminHeader";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";
import BaseLayout4 from "../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface Student {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  country?: string;
  city?: string;
}

interface Invoice {
  _id: string;
  courseName: string;
  amount: number;
  invoiceStatus: string;
  status: string;
  createdDate: string;
  createdBy: string;
  lastUpdatedDate: string;
  lastUpdatedBy: string;
  dueDate?: string;
  student: Student;
}

const Trailclasslist = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;
  const [dashboardRead,setdashboardRead]=useState(false);
const [filters, setFilters] = useState({
  invoiceId: "",
  date: "",
  studentName: "",
  studentId: "",
  course: "",
  dueByDays: "",
  paidDate: "",
  status: "",
});

const [searchText, setSearchText] = useState("");
const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
const [filterStatus, setFilterStatus] = useState("");
const [filterRange, setFilterRange] = useState("");


useEffect(() => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("AdminAuthToken") : null;

  if (!token) {
    console.error("❌ AdminAuthToken not found");
    return;
  }
  if (token) {
    fetchInvoice(token); // Or call the function that performs the GET request
  } else {
    toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
  }
  if (typeof window !== "undefined") {
      const roleAccessRaw = localStorage.getItem("AdminRolePermission");

      if (roleAccessRaw) {
        try {
          const roleAccess = JSON.parse(roleAccessRaw);
          const hasRead = roleAccess?.invoice?.write ?? false;
          console.log(hasRead);
          setdashboardRead(hasRead);
        } catch (error) {
          console.error("Invalid JSON in AdminRolePermission:", error);
        }
      }
    }

}, []);

const fetchInvoice = (token: string) => {
  axios
    .get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.INVOICE.STUDENT_INVOICE_LIST}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
    .then((response) => {
      setInvoices(response.data.data);
    })
    .catch((error) => {
      console.error("Error fetching invoices:", error);
    });
};


  // Combine filter modal and search text logic
  const filterAndSearchInvoices = invoices.filter((invoice) => {
    // Modal filters
    const matchesInvoiceId = filters.invoiceId
      ? invoice._id.toLowerCase().includes(filters.invoiceId.toLowerCase())
      : true;
    const matchesDate = filters.date
      ? invoice.createdDate.slice(0, 10) === filters.date
      : true;
    const matchesStudentName = filters.studentName
      ? invoice.student?.studentName?.toLowerCase().includes(filters.studentName.toLowerCase())
      : true;
    const matchesStudentId = filters.studentId
      ? invoice.student?.studentId?.toLowerCase().includes(filters.studentId.toLowerCase())
      : true;
    const matchesCourse = filters.course
      ? invoice.courseName?.toLowerCase().includes(filters.course.toLowerCase())
      : true;
    const matchesDueByDays = filters.dueByDays
      ? calculateDueDays(invoice.dueDate).includes(filters.dueByDays)
      : true;
    const matchesPaidDate = filters.paidDate
      ? invoice.lastUpdatedDate?.slice(0, 10) === filters.paidDate
      : true;
    const matchesStatus = filters.status
      ? invoice.invoiceStatus === filters.status
      : true;
    // Modal filter modal (status/range)
    const matchesFilterStatus = filterStatus ? invoice.invoiceStatus === filterStatus : true;
    const matchesFilterRange = filterRange
      ? (invoice.dueDate ? (() => {
          const due = new Date(invoice.dueDate!);
          const today = new Date();
          const diffTime = due.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (filterRange === "0 to 10") return diffDays >= 0 && diffDays <= 10;
          if (filterRange === "10 to 20") return diffDays > 10 && diffDays <= 20;
          if (filterRange === "20 to 30") return diffDays > 20 && diffDays <= 30;
          if (filterRange === "More than 30 Days") return diffDays > 30;
          return true;
        })() : false)
      : true;
    // Search text
    const keyword = searchText.toLowerCase();
    const matchesSearch =
      invoice._id.toLowerCase().includes(keyword) ||
      invoice.student?.studentName?.toLowerCase().includes(keyword) ||
      invoice.student?.studentId?.toLowerCase().includes(keyword) ||
      invoice.courseName?.toLowerCase().includes(keyword);
    return (
      matchesInvoiceId &&
      matchesDate &&
      matchesStudentName &&
      matchesStudentId &&
      matchesCourse &&
      matchesDueByDays &&
      matchesPaidDate &&
      matchesStatus &&
      matchesFilterStatus &&
      matchesFilterRange &&
      matchesSearch
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filterAndSearchInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filterAndSearchInvoices.length / itemsPerPage);

  // Only one definition of calculateDueDays should exist, before its first use
  const calculateDueDays = (dueDate?: string) => {
    if (!dueDate) return "-";
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };


  return (
    <BaseLayout4>
      <AdminHeader currentSection="Invoice" />
       
        <div className="w-full bg-[#FAFAFB] dark:bg-[#343434] rounded-lg">
      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 dark:bg-opacity-70">
          <div className="bg-white dark:bg-zinc-900 text-black dark:text-white rounded-2xl shadow-lg p-5 w-[400px]">
            <h2 className="text-base font-semibold mb-3">Filter by</h2>
            {/* Student Name */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Student Name</label>
              <input
                type="text"
                placeholder="Student Name"
                className="w-full border rounded-md px-2 py-1.5 bg-white dark:bg-zinc-800 dark:text-white border-gray-300 dark:border-zinc-700 text-sm"
                value={filters.studentName}
                onChange={e => setFilters(f => ({ ...f, studentName: e.target.value }))}
              />
            </div>
            {/* Student ID */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Student ID</label>
              <input
                type="text"
                placeholder="Student ID"
                className="w-full border rounded-md px-2 py-1.5 bg-white dark:bg-zinc-800 dark:text-white border-gray-300 dark:border-zinc-700 text-sm"
                value={filters.studentId}
                onChange={e => setFilters(f => ({ ...f, studentId: e.target.value }))}
              />
            </div>
            {/* Due By Days */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Due By Days</label>
              <input
                type="text"
                placeholder="Due By Days"
                className="w-full border rounded-md px-2 py-1.5 bg-white dark:bg-zinc-800 dark:text-white border-gray-300 dark:border-zinc-700 text-sm"
                value={filters.dueByDays}
                onChange={e => setFilters(f => ({ ...f, dueByDays: e.target.value }))}
              />
            </div>
            {/* Course */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Course</label>
              <input
                type="text"
                placeholder="Course"
                className="w-full border rounded-md px-2 py-1.5 bg-white dark:bg-zinc-800 dark:text-white border-gray-300 dark:border-zinc-700 text-sm"
                value={filters.course}
                onChange={e => setFilters(f => ({ ...f, course: e.target.value }))}
              />
            </div>
            {/* Paid Date */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Paid Date</label>
              <input
                type="date"
                className="w-full border rounded-md px-2 py-1.5 bg-white dark:bg-zinc-800 dark:text-white border-gray-300 dark:border-zinc-700 text-sm"
                value={filters.paidDate}
                onChange={e => setFilters(f => ({ ...f, paidDate: e.target.value }))}
              />
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
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
            {/* Buttons */}
            <div className="flex justify-between">
              <button
                className="px-4 py-1.5 text-sm rounded-md border bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700"
                onClick={() => {
                  setFilters({
                    invoiceId: "",
                    date: "",
                    studentName: "",
                    studentId: "",
                    course: "",
                    dueByDays: "",
                    paidDate: "",
                    status: "",
                  });
                  setFilterRange("");
                  setFilterStatus("");
                  setIsFilterModalOpen(false);
                }}
              >
                Reset
              </button>
              <button
                className="px-4 py-1.5 text-sm rounded-md bg-[#002244] text-white hover:bg-blue-700"
                onClick={() => setIsFilterModalOpen(false)}
              >
                Show {filterAndSearchInvoices.length} results
              </button>
            </div>
          </div>
        </div>
      )}
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
          Showing {currentItems.length} of {filterAndSearchInvoices.length}
        </span>
      </div>
    </div>
    <table className="table-fixed w-full dark:bg-[#3f3f3f]">
      <thead className="text-[13px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
        <tr>
          {["Invoice ID", "Date", "Student Name", "Student ID", "Course", "Due By Days", "Paid Date", "Status"].map((header, idx) => (
            <th
              key={idx}
              className="px-3 py-2 border border-[#4C6993] text-left text-wrap break-words"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {currentItems.map((row: Invoice, index: number) => (
          <tr
            key={row._id}
            className={`text-[9px] text-center mt-0 dark:text-white ${
              index % 2 === 0
                ? "bg-[#faf9f9] dark:bg-[#2C2C2C]"
                : "bg-[#ebebeb] dark:bg-[#303030]"
            }`}
          >
            <td className="px-3 py-3 break-words text-[12px] text-left">
              #{row._id.slice(-6)}
            </td>
            <td className="px-3 py-3 break-words text-[12px] text-left">
              {new Date(row.createdDate).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </td>
            <td className="px-3 py-3 break-words text-[12px] text-left">
              {row.student?.studentName || "-"}
            </td>
            <td className="px-3 py-3 break-words text-[12px] text-left">
              {row.student?.studentId || "-"}
            </td>
            <td className="px-3 py-3 break-words text-[12px] text-left">
              {row.courseName}
            </td>
            <td className="px-3 py-3 break-words text-[12px] text-left">
              {calculateDueDays(row.dueDate)}
            </td>
            <td className="px-3 py-3 break-words text-[12px] text-left">
              {row.invoiceStatus === "Paid"
                ? new Date(row.lastUpdatedDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "-"}
            </td>
            <td className="px-3 py-3 break-words text-[12px] text-left">
            <span
                      className={`inline-flex items-center justify-center w-24 h-6 px-3 py-1 rounded-md
                        ${
                          row.invoiceStatus === "Paid"
                            ? "bg-[#ECFDF3] text-[#377E36]"
                            : row.invoiceStatus === "Pending"
                            ? "bg-[#F0AD4E33] text-[#F0AD4E]"
                            : "bg-gray-200 text-gray-700"
                        }
                      `}
                    >
                      {row.invoiceStatus}
                    </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* END Filter Modal */}
    {/* Pagination */}
  
  {/* Close the main content div for w-full bg-[#FAFAFB] ... */}
  </div>
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
</BaseLayout4>
  );
};

export default Trailclasslist;
