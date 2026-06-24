"use client";

import React, { useEffect, useRef, useState } from "react";
import { Sun, Bell, X, FileText, Search } from "lucide-react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import axios from "axios";
import ApplicationChart from "../../components/invoiceBar";

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
  paymentStatus: string;
}
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,
  ArcElement,
} from "chart.js";
import { useRouter } from "next/navigation";
import InvoicesDueByDays from "../../components/invoicedue";
import { MdTune } from "react-icons/md";
import AdminHeader from "../../components/AdminHeader";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";
import BaseLayout4 from "../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Page() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  type InvoiceType = "total" | "paid" | "pending" | "void";
  const [invoiceCounts, setInvoiceCounts] = useState<
    Record<InvoiceType, number>
  >({
    total: 0,
    paid: 0,
    pending: 0,
    void: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;
  const [dashboardRead, setdashboardRead] = useState(false);
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
      typeof window !== "undefined"
        ? localStorage.getItem("AdminAuthToken")
        : null;

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
          Authorization: `Bearer ${token}`,
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
      ? invoice.student?.studentName
          ?.toLowerCase()
          .includes(filters.studentName.toLowerCase())
      : true;
    const matchesStudentId = filters.studentId
      ? invoice.student?.studentId
          ?.toLowerCase()
          .includes(filters.studentId.toLowerCase())
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
    const matchesFilterStatus = filterStatus
      ? invoice.invoiceStatus === filterStatus
      : true;
    const matchesFilterRange = filterRange
      ? invoice.dueDate
        ? (() => {
            const due = new Date(invoice.dueDate!);
            const today = new Date();
            const diffTime = due.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (filterRange === "0 to 10")
              return diffDays >= 0 && diffDays <= 10;
            if (filterRange === "10 to 20")
              return diffDays > 10 && diffDays <= 20;
            if (filterRange === "20 to 30")
              return diffDays > 20 && diffDays <= 30;
            if (filterRange === "More than 30 Days") return diffDays > 30;
            return true;
          })()
        : false
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
  const currentItems = filterAndSearchInvoices.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
 useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AdminAuthToken")
        : null;

    if (!token) {
      console.error("❌ AdminAuthToken not found");
      return;
    }
    if (token) {
      fetchInvoiceCounts(token); // call your function with token
    } else {
      toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
    }
  }, []);
  const fetchInvoiceCounts = async (token: string) => {
    try {
      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.INVOICE.INVOICE_COUNTS}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setInvoiceCounts(result.data);
      }
    } catch (error) {
      console.error("Error fetching invoice counts:", error);
    }
  };

  const cards: {
    title: string;
    key: InvoiceType;
    iconBg: string;
    iconColor: string;
    chartColor: string;
  }[] = [
    {
      title: "Total Invoices",
      key: "total",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
      chartColor: "#64748b",
    },
    {
      title: "Paid Invoices",
      key: "paid",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-500",
      chartColor: "#6366f1",
    },
    {
      title: "Unpaid Invoices",
      key: "pending",
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-500",
      chartColor: "#06b6d4",
    },
    {
      title: "Void Invoices",
      key: "void",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
      chartColor: "#3b82f6",
    },
  ];

  const handleviewlist = () => {
    router.push("/modules/users/admin-main/ui/invoicelist");
  };

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
      <div className="p-6 w-full mx-auto">
        {/* Header */}
        {/* Invoice Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-3">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-[#7986CB] text-white rounded-md px-4 py-3 h-24 flex flex-col justify-between"
            >
              <p className="text-sm font-medium">{card.title}</p>
              <h3 className="text-2xl font-bold">{invoiceCounts[card.key]}</h3>
            </div>
          ))}
        </div>

        {/* Middle Sections */}
        <div className="flex gap-6 mb-6 items-start">
          {/* Total Invoice Section (Bar Chart) */}
          <div className="bg-white rounded-xl shadow-sm p-4 h-[300px] flex-1 dark:bg-[#343434]">
            <ApplicationChart />
          </div>

          {/* Invoices Due by Days (Doughnut Chart) */}
          <div className="bg-white rounded-xl shadow-sm p-4 h-[300px] w-[300px] shrink-0 dark:bg-[#343434]">
            <InvoicesDueByDays />
          </div>
        </div>

        {/* Invoice Table */}
        <div className="w-full bg-[#FAFAFB] dark:bg-[#343434] rounded-lg">
        <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
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
            <div className="relative">
              <button
              className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
              onClick={() => setIsFilterModalOpen(true)}
              >
                <MdTune className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">

            <span className="text-left -ml-60">
            Showing {5} of {5}
            </span>
            </div>

          </div>
          <div className="overflow-x-auto max-h-none">
            <table
              className="w-full min-w-[900px] text-xs text-left table-auto"
              style={{ width: "100%", tableLayout: "fixed" }}
            >
              <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0] sticky top-0 z-10">
                <tr className="font-medium">
                  <th className="p-4 font-semibold break-word text-[12px] text-center w-[10%]">
                    Invoice ID
                  </th>
                  <th className="p-4 font-semibold break-word text-[12px] text-center w-[10%]">
                    Date
                  </th>
                  <th className="p-4 font-semibold break-word text-[12px] text-center w-[12%]">
                    Student Name
                  </th>
                  <th className="p-4 font-semibold break-word text-[12px] text-center w-[14%]">
                    Student ID
                  </th>
                  <th className="p-4 font-semibold break-word text-[12px] text-center w-[10%]">
                    Course
                  </th>
                  <th className="p-4 font-semibold break-word text-[12px] text-center w-[10%]">
                    Due By Days
                  </th>
                  <th className="p-4 font-semibold break-word text-[12px] text-center w-[10%]">
                    Paid Date
                  </th>
                  <th className="p-4 font-semibold break-word text-[12px] text-center w-[10%]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="text-[10px] text-[#1D2939]">
                {currentItems.length > 0 ? (
                  currentItems.slice(-5).reverse().map((row: Invoice, index: number) => (
                    <tr
                      key={row._id}
                      className={`text-center dark:text-white ${
                        index % 2 === 0
                          ? "bg-[#fff] dark:bg-[#2C2C2C]"
                          : "bg-[#F8F8F8] dark:bg-[#303030]"
                      }`}
                    >
                      <td className="p-3 break-word w-[10%]">#{row._id.slice(-6)}</td>
                      <td className="p-3 break-word w-[10%]">
                        {new Date(row.createdDate).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "short", day: "numeric" }
                        )}
                      </td>
                      <td className="p-3 break-word w-[14%]">{row.student?.studentName || "-"}</td>
                      <td className="p-3 break-word w-[10%]">{row.student?.studentId || "-"}</td>
                      <td className="p-3 break-word w-[10%]">{row.courseName}</td>
                      <td className="p-3 break-word w-[10%]">{calculateDueDays(row.dueDate)}</td>
                      <td className="p-3 break-word w-[10%]">
                        {row.paymentStatus === "Paid"
                          ? new Date(row.lastUpdatedDate).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "-"}
                      </td>
                      <td className="p-3 break-word w-[10%]">
                        <span
                          className={`inline-flex items-center justify-center w-20 h-6 px-3 py-1 rounded-md
                            ${
                              row.paymentStatus === "Paid"
                                ? "bg-[#ECFDF3] text-[#377E36]"
                                : row.paymentStatus === "Pending"
                                ? "bg-[#F0AD4E33] text-[#F0AD4E]"
                                : row.paymentStatus === "Failed"
                                ? "bg-red-100 text-red-500"
                                : "bg-gray-200 text-gray-700"
                            }
                          `}
                        >
                          {row.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-4 text-center">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Filter Modal */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 dark:bg-opacity-70">
            <div className="bg-white dark:bg-zinc-900 text-black dark:text-white rounded-2xl shadow-lg p-5 w-[400px]">
              <h2 className="text-base font-semibold mb-3">Filter by</h2>
              {/* Invoice ID */}
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  Invoice ID
                </label>
                <input
                  type="text"
                  className="w-full border rounded-md px-2 py-1.5 bg-white dark:bg-zinc-800 dark:text-white border-gray-300 dark:border-zinc-700 text-sm"
                  value={filters.invoiceId}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      invoiceId: e.target.value,
                    }))
                  }
                  placeholder="Enter Invoice ID"
                />
              </div>
              {/* Student ID */}
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  className="w-full border rounded-md px-2 py-1.5 bg-white dark:bg-zinc-800 dark:text-white border-gray-300 dark:border-zinc-700 text-sm"
                  value={filters.studentId}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      studentId: e.target.value,
                    }))
                  }
                  placeholder="Enter Student ID"
                />
              </div>
              {/* Student Name */}
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  className="w-full border rounded-md px-2 py-1.5 bg-white dark:bg-zinc-800 dark:text-white border-gray-300 dark:border-zinc-700 text-sm"
                  value={filters.studentName}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      studentName: e.target.value,
                    }))
                  }
                  placeholder="Enter Student Name"
                />
              </div>
              {/* Course */}
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Course</label>
                <input
                  type="text"
                  className="w-full border rounded-md px-2 py-1.5 bg-white dark:bg-zinc-800 dark:text-white border-gray-300 dark:border-zinc-700 text-sm"
                  value={filters.course}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, course: e.target.value }))
                  }
                  placeholder="Enter Course Name"
                />
              </div>
              {/* Due Date */}
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full border rounded-md px-2 py-1.5 bg-white dark:bg-zinc-800 dark:text-white border-gray-300 dark:border-zinc-700 text-sm"
                  value={filters.date}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, date: e.target.value }))
                  }
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
                  <option value="Failed">Failed</option>
                </select>
              </div>
              {/* Buttons */}
              <div className="flex justify-between">
                <button
                  className="px-4 py-1.5 text-sm rounded-md border bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700"
                  onClick={() => {
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
                  Show{" "}
                  {
                    invoices.filter(
                      (row: Invoice) =>
                        row._id
                          .toLowerCase()
                          .includes(searchText.toLowerCase()) &&
                        (filterStatus
                          ? row.invoiceStatus === filterStatus
                          : true) &&
                        (filterRange
                          ? row.dueDate
                            ? (() => {
                                const due = new Date(row.dueDate!);
                                const today = new Date();
                                const diffTime =
                                  due.getTime() - today.getTime();
                                const diffDays = Math.ceil(
                                  diffTime / (1000 * 60 * 60 * 24)
                                );
                                if (filterRange === "0 to 10")
                                  return diffDays >= 0 && diffDays <= 10;
                                if (filterRange === "10 to 20")
                                  return diffDays > 10 && diffDays <= 20;
                                if (filterRange === "20 to 30")
                                  return diffDays > 20 && diffDays <= 30;
                                if (filterRange === "More than 30 Days")
                                  return diffDays > 30;
                                return true;
                              })()
                            : false
                          : true)
                    ).length
                  }{" "}
                  results
                </button>
              </div>
            </div>
          </div>
        )}
        {/* END Filter Modal */}
        {/* Pagination */}

        {/* Close the main content div for w-full bg-[#FAFAFB] ... */}
      </div>
      <div className="flex justify-end">
        <button
          className=" text-[#576CBC] border border-[#576CBC] bg-[#fff] rounded px-2 py-1 text-xs font-medium hover:bg-[#dbe2f3] transition duration-200 dark:bg-[#2E3343]"
          onClick={handleviewlist}
        >
          View All
        </button>
      </div>
    </BaseLayout4>
  );
}
