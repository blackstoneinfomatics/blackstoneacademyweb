"use client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import AdminHeader from "@/app/(tenant)/modules/users/admin-main/components/AdminHeader";
import { useRouter, useSearchParams } from "next/navigation";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip as ChartTooltip,
  Filler,
} from "chart.js";
import axios from "axios";
import { MdTune } from "react-icons/md";
import Pagination from "@/components/Pagination";
import BaseLayout4 from "../../../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

// Register chart.js modules
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ChartTooltip,
  Filler
);

countries.registerLocale(enLocale);

interface SalaryWageRecord {
  _id: string;
  status: string;
  designation: string;
  employeeId: string;
  __v: number;
  balanceAmount: number;
  createdBy: string;
  comments: string;
  createdDate: string;
  deductionAmount: number;
  employeeMail: string;
  employeeName: string;
  isSalaryProcessed: boolean;
  paymentMethod: string;
  paymentStatus: string;
  salaryAmount: number;
}

const page = () => {

  const searchParams = useSearchParams();
  const employeeId = searchParams.get("teacherId");

  const [salaryWages, setSalaryWages] = useState<SalaryWageRecord[]>([]);
  const [selectedSalary, setSelectedSalary] = useState<SalaryWageRecord | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchPayments, setSearchPayments] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    const fetchSalaryWages = async () => {
      if (!employeeId) return;
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AdminAuthToken")
          : null;
      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return;
      }
      try {
        const res = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.OTHEREMPLOYEE.SALARY_WAGES}?employeeId=${employeeId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSalaryWages(res.data.records || []);
      } catch (error) {
        console.error("Error fetching salary wages:", error);
      }
    };
    fetchSalaryWages();
  }, [employeeId]);

  const handleViewDownload = (item: SalaryWageRecord) => {
    setSelectedSalary(item);
    setIsReceiptModalOpen(true);
  };

  // Filtered and paginated salary wages
  const filteredSalaryWages = salaryWages.filter((item) => {
    const searchFields = [
      new Date(item.createdDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      item.salaryAmount,
      item.paymentStatus,
      item.deductionAmount,
      item.paymentMethod,
    ];
    const matchesSearch = searchFields.some((field) =>
      field
        ? field.toString().toLowerCase().includes(searchPayments.toLowerCase())
        : false
    );
    // Filter logic
    const matchesStatus = filterStatus ? item.paymentStatus === filterStatus : true;
    const matchesDate =
      (!filterStartDate || new Date(item.createdDate) >= new Date(filterStartDate)) &&
      (!filterEndDate || new Date(item.createdDate) <= new Date(filterEndDate));
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredSalaryWages.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems: SalaryWageRecord[] = filteredSalaryWages.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const statuses = Array.from(new Set(salaryWages.map(item => item.paymentStatus)));

  return (
    <BaseLayout4>
      <AdminHeader currentSection="Payments" showBackButton={true} showBackPath={`/modules/users/admin-main/ui/employees/teacher?teacherId=${employeeId}`} />
      <div>
        <div className="rounded-xl overflow-hidden">
          <div className="flex flex-row sm:flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none text-[12px] w-32 py-3"
              value={searchPayments}
              onChange={(e) => setSearchPayments(e.target.value)}
            />
            <div
              className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-3 border-r-2 border-l-2 px-48 cursor-pointer"
              onClick={() => setIsFilterModalOpen(true)}
            >
              <MdTune className="w-4 h-4" />
              <span>Filter</span>
            </div>
            <span className="text-[12px] text-gray-400 dark:text-gray-400 py-3">
              Showing {filteredSalaryWages.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSalaryWages.length)} of {filteredSalaryWages.length}
            </span>
          </div>
          {/* Filter Modal */}
          {isFilterModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-[#232323] p-6 rounded-lg w-96">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-black dark:text-white">Filter by</h2>
                  <button onClick={() => setIsFilterModalOpen(false)} className="text-gray-500 dark:text-gray-300 text-2xl">&times;</button>
                </div>
                <label className="block mb-2 text-black dark:text-white text-sm">Payment Date</label>
                <div className="flex gap-2 mb-4">
                  <input
                    type="date"
                    className="w-1/2 p-2 rounded bg-gray-100 dark:bg-[#343434] text-black dark:text-white text-xs"
                    value={filterStartDate}
                    onChange={e => setFilterStartDate(e.target.value)}
                  />
                  <input
                    type="date"
                    className="w-1/2 p-2 rounded bg-gray-100 dark:bg-[#343434] text-black dark:text-white text-xs"
                    value={filterEndDate}
                    onChange={e => setFilterEndDate(e.target.value)}
                  />
                </div>
                <label className="block mb-2 text-black dark:text-white text-sm">Status</label>
                <select
                  className="w-full p-2 mb-4 rounded bg-gray-100 dark:bg-[#343434] text-black dark:text-white text-xs"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="">Select Status</option>
                  {statuses.map(status => (
                    <option className="text-black dark:text-white text-xs" key={status} value={status}>{status}</option>
                  ))}
                </select>
                <div className="flex justify-between">
                  <button
                    className="px-4 py-2 border rounded text-black dark:text-white text-sm"
                    onClick={() => {
                      setFilterStartDate("");
                      setFilterEndDate("");
                      setFilterStatus("");
                    }}
                  >
                    Reset
                  </button>
                  <button
                    className="px-4 py-2 bg-[#6C74F6] text-white rounded text-sm"
                    onClick={() => setIsFilterModalOpen(false)}
                  >
                    Show results
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="overflow-x-auto max-h-none">
            <table
              className="w-full min-w-[900px] text-sm text-left table-auto"
              style={{ width: "100%", tableLayout: "fixed" }}
            >
              <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                <tr className="font-medium">
                  <th className="p-4 font-semibold text-[12px] text-left">
                    Payment ID
                  </th>
                  <th className="p-4 font-semibold text-[12px] text-left">
                    Payment Date
                  </th>
                  <th className="p-4 font-semibold text-[12px] text-left">
                    Amount
                  </th>
                  <th className="p-4 font-semibold text-[12px] text-left">
                    Paid For
                  </th>
                  <th className="p-4 font-semibold text-[12px] text-left">
                    Payment Method
                  </th>
                  <th className="p-4 font-semibold text-[12px] text-left">
                    Comments for Reference
                  </th>
                  <th className="p-4 font-semibold text-[12px] text-left">
                    Status
                  </th>
                  <th className="p-4 font-semibold text-[12px] text-left">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="text-[10px] text-[#1D2939]">
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => (
                    <tr
                      key={item._id}
                      className={`text-left dark:text-white ${index % 2 === 0
                        ? "bg-[#fff] dark:bg-[#2C2C2C]"
                        : "bg-[#F8F8F8] dark:bg-[#303030]"
                        }`}
                    >
                      <td className="p-3 text-left">

                        {item._id}
                      </td>
                      <td className="p-3 text-left">
                        {new Date(item.createdDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-3">
                        {item._id}
                      </td>
                      <td className="p-3">
                        {new Date(item.createdDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-3">
                        {item.salaryAmount}
                      </td>
                      <td className="p-3 text-left">{item.isSalaryProcessed || "Bonus"}</td>
                      <td className="p-3 text-left">{item.paymentMethod}</td>
                      <td className="p-3 text-left">{item.comments}</td>
                      <td className="p-3 text-left">
                        <span
                          className={`inline-flex items-left text-left justify-center gap-1 px-3 py-[1px] rounded-md text-[10px] font-semibold
                                  ${item.paymentStatus.toLowerCase() === "pending"
                              ? "bg-red-100 text-[#D34645] dark:bg-[#D3464533] dark:bg-opacity-20 dark:text-[#D34645]"
                              : "bg-green-100 text-green-700 dark:bg-[#2E3C2E] dark:text-[#377E36] px-6"
                            }
                                `}
                        >
                          {item.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3 text-left">
                        <button
                          className="text-blue-500 text-[11px]"
                          onClick={() => handleViewDownload(item)}
                        >
                          View / Download
                        </button>

                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        {/* <Image src="/assets/images/quote.jpg" alt="No data" width={120} height={120} /> */}
                        <div className="mt-4 text-gray-400 text-sm">No data available</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-end">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {isReceiptModalOpen && selectedSalary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-[#232323] p-6 rounded-lg w-[600px] relative">
              <button
                className="absolute top-2 right-2 text-xl text-gray-500 dark:text-gray-300"
                onClick={() => setIsReceiptModalOpen(false)}
              >
                &times;
              </button>

              <div id="salary-receipt" className="p-4">
                <h2 className="text-xl font-bold mb-4">Salary Receipt</h2>
                <p><strong>Employee Name:</strong> {selectedSalary.employeeName}</p>
                <p><strong>Employee ID:</strong> {selectedSalary.employeeId}</p>
                <p><strong>Designation:</strong> {selectedSalary.designation}</p>
                <p><strong>Salary Amount:</strong> ${selectedSalary.salaryAmount}</p>
                <p><strong>Deductions:</strong> ${selectedSalary.deductionAmount}</p>
                <p><strong>Payment Method:</strong> {selectedSalary.paymentMethod}</p>
                <p><strong>Payment Status:</strong> {selectedSalary.paymentStatus}</p>
                <p><strong>Date:</strong> {new Date(selectedSalary.createdDate).toLocaleDateString()}</p>
              </div>

              <button
                className="mt-4 px-4 py-2 bg-[#6C74F6] text-white rounded"
                onClick={() => {
                  import("jspdf").then(jsPDFModule => {
                    import("html2canvas").then(html2canvasModule => {
                      const jsPDF = jsPDFModule.default;
                      const html2canvas = html2canvasModule.default;
                      const input = document.getElementById("salary-receipt")!;
                      html2canvas(input).then(canvas => {
                        const imgData = canvas.toDataURL("image/png");
                        const pdf = new jsPDF("p", "mm", "a4");
                        const imgProps = pdf.getImageProperties(imgData);
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                        pdf.save(`Salary_Receipt_${selectedSalary.employeeName}.pdf`);
                      });
                    });
                  });
                }}
              >
                Download
              </button>
            </div>
          </div>
        )}

      </div>
    </BaseLayout4>
  );
};

export default page;
