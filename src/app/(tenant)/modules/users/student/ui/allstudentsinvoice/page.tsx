"use client";

import { useEffect, useState, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  useElements,
  useStripe,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import BaseLayout2 from "@/app/(tenant)/modules/users/student/components/BaseLayout2";
import axios from "axios";
import { Search } from "lucide-react";
import { MdTune } from "react-icons/md";
import StudentHeader from "../../components/StudentHeader";
import React from "react";
import Pagination from "@/components/Pagination";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";

interface Student {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string; // Changed to string because it's a phone number and might start with 0 or contain country codes
  country: string;
  state: string;
  city: string;
  pinCode: string;
}

interface Invoice {
  _id: string;
  courseName: string;
  amount: number;
  paymentDate: number;
  status: string;
  createdDate: string;
  createdBy: string;
  lastUpdatedDate: string;
  lastUpdatedBy: string;
  invoiceStatus: string;
  student: Student;
  description: string;
  dueDate: string;
  duration: string;
  itemDescription: string;
  packageType: string;
  rate: string;
  __v: number;
  payments?: { amount: number; date: string }[]; // Added payments array
}

interface InvoiceResponse {
  totalCount: number;
  invoice: Invoice[];
}

interface CheckoutFormProps {
  clientSecret: string;
  invoiceId: string;
  amount: number;
  currency: string;
}
const itemsPerPage = 10;


const Invoice = () => {
  const [showFilterModal, setShowFilterModal] = useState(false); // Filter modal
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  // Add missing filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [positionApplied, setPositionApplied] = useState("Pending");
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [course, setCourse] = useState("");

  // Calculate total price based on selected invoice
  const calculateTotalPrice = () => {
    if (!selectedInvoice) return 0;
    const amount = Number(selectedInvoice.amount) || 0;
    const gst = 0; // Since GST is not in your API response
    const discount = 0; // Since discount is not in your API response
    return amount + gst - discount;
  };

  const totalPrice = calculateTotalPrice();
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const studentIdToFilter = localStorage.getItem("StudentPortalId");
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("StudentAuthToken")
            : null;

        if (!token) {
          toast.error(AppFailureToastMessages.UNAUTHORIZED);
          return;
        }
        const response = await axios.get<InvoiceResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.INVOICE.STUDENT_INVOICE}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const filteredInvoices = response.data.invoice.filter(
          (invoice) => invoice.student.studentId === studentIdToFilter
        );
        setInvoices(filteredInvoices);
        // Set the first invoice as selected by default if available
        if (filteredInvoices.length > 0) {
          setSelectedInvoice(filteredInvoices[0]);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error(AppFailureToastMessages.INVOICE_FETCH_FAILED);
      }
    };

    fetchInvoices();
  }, []);

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };
  const handleClick = async () => {
    if (!selectedInvoice) {
      toast.error(AppFailureToastMessages.INVOICE_SELECT_REQUIRED || "Please select an invoice first.");
      return;
    }

    setShowFilterModal(false); // <-- Add this line
    const evaluationid = selectedInvoice._id;
    const totalprice = totalPrice;

    const paymentDate = new Date().toISOString();

    // Set paymentDate to current date/time in ISO format
    const paymentDate = new Date().toISOString();

    try {
      const response = await axios.post(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PAYMENT.CREATE_STUDENT_PAYMENT}`,
        {
          amount: totalprice * 100,
          currency: "usd",
          invoiceId: evaluationid,
          paymentIntentResponse: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const clientSecret = response?.data?.clientSecret;
      

     
    } catch (error: any) {
      if (error && error.response && error.response.data) {
        toast.error(AppFailureToastMessages.REQUEST_ERROR + JSON.stringify(error.response.data));
      } else {
        toast.error(AppFailureToastMessages.UNEXPECTED_ERROR + (error?.message || ""));
      }
    }
  };



  function formatDateDMY(dateString?: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  function formatDateMMMDDYYYY(dateString?: string | number) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }

  function toDateString(date: string) {
    return new Date(date).toISOString().slice(0, 10);
  }

  // Get unique course names for dropdown
  const courseOptions = useMemo(() => {
    const set = new Set(invoices.map((inv) => inv.courseName));
    return Array.from(set);
  }, [invoices]);

  // Unified filtering logic for both search and filters
  const applyFilters = () => {
    let filtered = invoices;
    // Course filter
    if (course) {
      filtered = filtered.filter((inv) => inv.courseName === course);
    }
    // Date range filters
    if (fromDate) {
      filtered = filtered.filter(
        (inv) => toDateString(inv.createdDate) >= fromDate
      );
    }
    if (toDate) {
      filtered = filtered.filter(
        (inv) => toDateString(inv.createdDate) <= toDate
      );
    }
    // Status filter
    if (positionApplied && positionApplied !== "Pending") {
      filtered = filtered.filter(
        (inv) => inv.invoiceStatus === positionApplied
      );
    }
    // Search text filter
    if (searchText.trim() !== "") {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter((inv) => {
        const invoiceDate = formatDateMMMDDYYYY(inv.createdDate).toLowerCase();
        const invoiceNumber = inv._id.toLowerCase();
        const courseName = inv.courseName.toLowerCase();
        const paymentDate = inv.paymentDate
          ? formatDateDMY(new Date(inv.paymentDate).toISOString()).toLowerCase()
          : "";
        const status = inv.invoiceStatus.toLowerCase();
        const amount = inv.amount.toString().toLowerCase();
        return (
          invoiceDate.includes(searchLower) ||
          invoiceNumber.includes(searchLower) ||
          courseName.includes(searchLower) ||
          paymentDate.includes(searchLower) ||
          status.includes(searchLower) ||
          amount.includes(searchLower)
        );
      });
    }
    setFilteredInvoices(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchText, fromDate, toDate, positionApplied, course, invoices]);

  // Filter modal submit handler
  const handleFilter = () => {
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setPositionApplied("Pending");
    setSearchText("");
    setCourse("");
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredInvoices, searchText]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const isAnyFilterActive = (
    searchText.trim() !== "" ||
    fromDate ||
    toDate ||
    course ||
    positionApplied
  );

  const dataToPaginate = isAnyFilterActive ? filteredInvoices : invoices;
  const currentItems = dataToPaginate.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(dataToPaginate.length / itemsPerPage);

  return (
    <BaseLayout2>
      <StudentHeader currentSection="Payment" />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={true} />
      <div id="invoic" className="px-4 py-4 flex justify-center w-full ">
        <div className="w-full  ">
          {/* Header Section */}

          {!isGeneratingPDF && (
            <div>
              <div className="w-full h-full bg-[#FAFAFB] rounded-lg dark:bg-[#343434]">
                {/* <a href="/transactions" className="text-xs text-blue-500 hover:underline">View all</a> */}
                <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search"
                      className="bg-transparent outline-none text-[12px] w-52 py-3"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center gap-2 text-sm py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer ${
                        (fromDate || toDate || positionApplied !== "Pending") 
                          ? "text-[#576CBC] dark:text-[#6087C0]" 
                          : "text-gray-400 dark:border-[#606060]"
                      }`}
                      onClick={() => setShowFilterModal(true)}
                    >
                      <MdTune className="w-4 h-4" />
                      <span>Filter</span>
                      {(fromDate || toDate || positionApplied !== "Pending") && (
                        <span className="w-2 h-2 bg-[#576CBC] dark:bg-[#6087C0] rounded-full"></span>
                      )}
                    </div>
                    {(fromDate || toDate || positionApplied !== "Pending") && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                  {/* Modal */}
                  {showFilterModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                      <div className="bg-white p-6 rounded-lg w-[350px] relative dark:bg-[#252525]">
                        {/* Close Icon */}
                        <button
                          className="absolute top-2 right-3 text-gray-400 text-xl"
                          onClick={() => setShowFilterModal(false)}
                        >
                          &times;
                        </button>
                        <h2 className="text-md font-semibold mb-4">Filter by</h2>
                        {/* Course Dropdown */}
                        <div className="mb-4">
                          <label className="text-[13px] font-medium mb-1 dark:text-[#D6D6D6]">Course</label>
                          <select
                            className="w-full border rounded-md p-2 text-[10px] dark:bg-[#343434] dark:text-[#D6D6D6] dark:border-[#565656]"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                          >
                            <option value="">All Courses</option>
                            {courseOptions.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        {/* Date Input */}
                        <div className="mb-4">
                          <label className="text-[13px] font-medium mb-1 dark:text-[#D6D6D6]">Payment Date</label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="date"
                              className="w-1/2 px-3 py-2 border rounded text-[10px] text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                              value={fromDate}
                              onChange={(e) => setFromDate(e.target.value)}
                            />
                            <input
                              type="date"
                              className="w-1/2 px-3 py-2 border rounded text-[10px] text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                              value={toDate}
                              onChange={(e) => setToDate(e.target.value)}
                            />
                          </div>
                        </div>
                        {/* Status Dropdown */}
                        <div className="mb-4">
                          <label htmlFor="position" className="block text-[13px] font-medium mb-1">Status</label>
                          <select
                            className="w-full border rounded-md p-2 text-[10px] dark:bg-[#343434] dark:text-[#D6D6D6] dark:border-[#565656]"
                            value={positionApplied}
                            onChange={(e) => setPositionApplied(e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                          </select>
                        </div>
                        {/* Buttons */}
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={clearFilters}
                            className="px-4 py-1 rounded-md border border-gray-400 text-gray-600 dark:text-[#fff] font-medium text-[10px]"
                          >
                            Reset
                          </button>
                          <button
                            className="px-4 py-1 rounded-md bg-[#576CBC] text-white font-medium text-[10px]"
                            onClick={() => { handleFilter(); }}
                          >
                            Show {filteredInvoices.length} results
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                    <span className="text-left -ml-60 ">
                      Showing{" "}
                      {filteredInvoices.length > 0
                        ? filteredInvoices.length
                        : invoices.length}{" "}
                      of {invoices.length}
                    </span>
                  </div>
                </div>
                <table
                  className="table-auto w-full"
                  style={{ width: "100%", tableLayout: "fixed" }}
                >
                  <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                    <tr className="font-medium">
                      <th className="w-32 text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                        Invoice Date
                      </th>
                      <th className="w-44 text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                        Invoice Number
                      </th>
                      <th className="w-32 text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                        Course Name
                      </th>

                      <th className="w-28 text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                        Payment Amount
                      </th>
                      <th className="w-32 text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                        Payment Date
                      </th>
                      <th className="w-24 text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                        Status
                      </th>
                      <th className="w-20 text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((invoice, index) => (
                        <tr
                          key={invoice._id || index}
                          onClick={() => {
                            if (invoice.invoiceStatus === "Pending") {
                              handleInvoiceClick(invoice);
                            }
                          }}
                          className={`text-[12px] ${
                            index % 2 === 0
                              ? "bg-[#fff] dark:bg-[#2C2C2C]"
                              : "bg-[#F8F8F8] dark:bg-[#303030]"
                          } cursor-pointer`}
                        >
                          <td className="px-4 py-3 text-[11px] text-gray-700 whitespace-nowrap rounded-l-lg dark:text-[#ffffff]">
                            {formatDateMMMDDYYYY(invoice.createdDate)}
                          </td>
                          <td className="px-4 py-3 text-[11px] text-gray-700 whitespace-nowrap dark:text-[#ffffff]">
                            {invoice._id}
                          </td>
                          <td className="px-4 py-3 text-[11px] text-gray-700 whitespace-nowrap dark:text-[#ffffff]">
                            {invoice.courseName}
                          </td>
                          <td className="px-4 py-3 text-[11px] text-gray-700 whitespace-nowrap dark:text-[#ffffff]">
                            {invoice.amount}{" "}
                          </td>
                          <td className="px-4 py-3 text-[11px] text-gray-700 whitespace-nowrap dark:text-[#ffffff]">
                            {invoice.paymentDate
                              ? formatDateDMY(
                                  new Date(invoice.paymentDate).toISOString()
                                )
                              : ""}
                          </td>
                          <td className="px-4 py-3 text-[11px] text-gray-700 whitespace-nowrap dark:text-[#ffffff]">
                            <span
                              className={
                                (invoice.invoiceStatus === "Paid"
                                  ? "bg-[#ECFDF3] text-[#377E36] border border-green-600"
                                  : invoice.invoiceStatus === "Pending"
                                  ? "bg-[#FDF6EC] text-[#F0AD4E] border border-[#F0AD4E]"
                                  : "bg-gray-100 text-gray-600 border border-gray-400") +
                                " py-0.5 px-1  rounded-md text-[10px] min-w-[70px] inline-block text-center"
                              }
                            >
                              {invoice.invoiceStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap rounded-r-lg relative">
                            <button
                              className="focus:outline-none dark:text-[#ffffff]"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuOpen(
                                  actionMenuOpen === invoice._id
                                    ? null
                                    : invoice._id
                                );
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 18,
                                  verticalAlign: "middle",
                                }}
                              >
                                ⋮
                              </span>
                            </button>
                            {actionMenuOpen === invoice._id && (
                              <div className="absolute right-0 mt-2 w-40 divide-y bg-white border rounded-lg shadow-lg z-10 dark:bg-[#343434]">
                                <button className="block w-full text-left px-4 py-2  text-xs dark:text-[#ffffff] text-[#000]">
                                  View Payment Receipt
                                </button>
                                <button
                                  className="block w-full text-left px-4 py-2 text-xs dark:text-[#ffffff] text-[#000]"
                                  onClick={() => setActionMenuOpen(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-right">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseLayout2>
  );
};

export default Invoice;
