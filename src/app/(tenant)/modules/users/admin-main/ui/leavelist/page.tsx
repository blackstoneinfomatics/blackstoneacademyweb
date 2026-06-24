"use client";

import React, { useState, useEffect } from "react";
import { MoreVertical, Search } from "lucide-react";
import axios from "axios";
import Pagination from "@/components/Pagination";

import "react-datepicker/dist/react-datepicker.css";
import { MdTune } from "react-icons/md";
import AdminHeader from "../../components/AdminHeader";
import { useRouter } from "next/navigation";
import { TiAttachment } from "react-icons/ti";
import ReactDOM from "react-dom";
import DatePicker from "react-datepicker";
import BaseLayout4 from "../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface LeaveRequest {
  _id: string;
  summaryId: string;
  name: string;
  employeeId: string;
  role: string;
  fromDate: string;
  toDate: string;
  leaveStatus: string;
  leaveType: string;
  approvedId: string;
  approvedName: string;
  reason: string;
  status: string;
  approvedDays: string;
  deductionDays: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  __v: number;
}

interface LeaveSummaryListResponse {
  totalCount: number;
  leavesummary: LeaveRequest[];
}
type LeaveStatus = "APPROVED" | "WAITINGLIST" | "REJECTED";


export default function ApplicantsPage() {
  const router = useRouter();

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<{
    employeeId: string;
    id: string;
    approvedId: string;
    approvedName: string;
    name: string;
    designation: string;
    fromDate: string;
    toDate: string;
    leaveType: string;
    dateRange: string;
    reason: string;
    status: string;
    approvedDays: string;
    deductionDays: string;
    summaryId?: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState<Date | null>(null);
  const [filterDateTo, setFilterDateTo] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [approvedDays, setApprovedDays] = useState("");
  const [deductionDays, setDeductionDays] = useState(""); // Optional

  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  // Get unique roles and statuses for dropdowns
  const uniqueRoles = Array.from(new Set(leaveRequests.map(l => l.role).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(leaveRequests.map(l => l.leaveStatus)));

  const itemsPerPage = 10;

  // Filtering logic
  const filteredLeaveRequests = leaveRequests.filter(request => {
    // Tab filter
    if (activeTab !== "All" && request.leaveStatus !== activeTab.toUpperCase()) return false;
    // Name filter
    if (filterName && !request.name.toLowerCase().includes(filterName.toLowerCase())) return false;
    // Role filter
    if (filterRole && request.role !== filterRole) return false;
    // Date filter
    if (filterDateFrom && new Date(request.fromDate) < filterDateFrom) return false;
    if (filterDateTo && new Date(request.toDate) > filterDateTo) return false;
    // Status filter
    if (filterStatus && request.leaveStatus !== filterStatus) return false;
    // Main search bar (name, role, or status)
    if (searchText && !(
      request.name.toLowerCase().includes(searchText.toLowerCase()) ||
      request.role.toLowerCase().includes(searchText.toLowerCase()) ||
      request.leaveStatus.toLowerCase().includes(searchText.toLowerCase())
    )) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredLeaveRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeaveRequests = filteredLeaveRequests.slice(startIndex, endIndex);

  useEffect(() => {
    const token = localStorage.getItem("AdminAuthToken");
    if (token) {
      fetchLeaveRequests(token);
    }
  }, []);

  const fetchLeaveRequests = async (token: string) => {
    try {
      const res = await axios.get<LeaveSummaryListResponse>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.LEAVE.LEAVE_SUMMARY_LIST}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const sortedData = res.data.leavesummary.sort(
        (a, b) =>
          new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime()
      );

      setLeaveRequests(sortedData);
    } catch (err) {
      console.error("Error fetching leave request list", err);
    }
  };

  const handleApprove = async () => {
    if (!fromDate || !toDate || !approvedDays) {
      alert("From Date, To Date, and Approved Days are required");
      return;
    }

    const token = localStorage.getItem("AdminAuthToken");
    if (!token) {
      alert("Admin token not found. Please login again.");
      return;
    }

    // Add this line to log the ID being updated
    console.log("Updating leave summary with ID:", selectedLeave?.summaryId);

    try {
      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.LEAVE.UPDATE}/${selectedLeave?.summaryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fromDate,
            toDate,
            leaveStatus: "APPROVED",
            approvedDays: Number(approvedDays),
            deductionDays: Number(deductionDays) || 0,
            approvedName: "Admin",
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Leave approved successfully");
        setSelectedLeave(null);
        fetchLeaveRequests(token);
      } else {
        alert(data.message || "Failed to approve leave");
      }
    } catch (error) {
      console.error("Error approving leave:", error);
      alert("Something went wrong");
    }
  };

  // Add handleDecline for REJECTED status
  const handleDecline = async () => {
    if (!fromDate || !toDate || !approvedDays) {
      alert("From Date, To Date, and Approved Days are required");
      return;
    }

    const token = localStorage.getItem("AdminAuthToken");
    if (!token) {
      alert("Admin token not found. Please login again.");
      return;
    }

    console.log("Declining leave summary with ID:", selectedLeave?.summaryId);

    try {
      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.LEAVE.UPDATE}/${selectedLeave?.summaryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fromDate,
            toDate,
            leaveStatus: "REJECTED",
            approvedDays: Number(approvedDays),
            deductionDays: Number(deductionDays) || 0,
            approvedName: "Admin",
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Leave rejected successfully");
        setSelectedLeave(null);
        fetchLeaveRequests(token);
      } else {
        alert(data.message || "Failed to reject leave");
      }
    } catch (error) {
      console.error("Error rejecting leave:", error);
      alert("Something went wrong");
    }
  };


  const leaveStatusStyles: Record<LeaveStatus | "DEFAULT", string> = {
    APPROVED:
      "bg-[#EEEEFF] text-[#38619A] dark:bg-[#2F3642] dark:text-[#225BAA] rounded-md px-8 text-[10px]",
    WAITINGLIST:
      "bg-[#FDF6EC] dark:bg-[#534634] dark:text-[#F0AD4E] text-[#F0AD4E] rounded-md px-8 text-[10px]",
    REJECTED:
      "bg-[#FDECEC] dark:bg-[#503434] dark:text-[#D34645] text-[#D34645] rounded-md px-8 text-[10px]",
    DEFAULT: "bg-gray-200 text-gray-700 border border-gray-300 px-3",
  };

  function getLeaveStatusStyle(status: string): string {
    return (
      leaveStatusStyles[status as LeaveStatus] || leaveStatusStyles.DEFAULT
    );
  }

  return (
    <BaseLayout4>
      <div>
        <AdminHeader currentSection="Employees - Leave" showBackButton showBackPath="/modules/users/admin-main/ui/employees" />
        <div className="md:p-0 mx-auto">
          <div className="h-full w-full flex flex-col justify-between">
            <div className="p-0 flex flex-col">

              {/* Table container */}
              <div className="w-full h-[588px] bg-[#FAFAFB] rounded-lg dark:bg-[#343434]">
                {/* Search and Filter */}
                <div className="flex justify-between items-center px-4 py-0">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by Keyword"
                      className="bg-transparent outline-none text-[15px] w-52 py-3"
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-400 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer" onClick={() => setShowFilterModal(true)}>
                    <MdTune className="w-4 h-4" />
                    <span>Filter</span>
                  </div>

                  <div className="flex items-center gap-2 text-[14px] text-gray-400">
                    <span className="text-left -ml-60">
                      Showing {currentLeaveRequests.length === 0 ? 0 : 1} to{" "}
                      {currentLeaveRequests.length} of {filteredLeaveRequests.length}
                    </span>
                  </div>
                </div>

                {/* Table */}
                <table className="w-full min-w-[900px] text-sm text-left table-auto">
                  <thead className="text-[12px] bg-[#4C6993] text-white">
                    <tr>
                      {[
                        "Employee ID",
                        "Employee Name",
                        "Role",
                        "Leave Type",
                        "Date Range",
                        "Reason For Leave",
                        "Status",
                        "Action",
                      ].map((header) => (
                        <th key={header} className="px-4 py-4 font-semibold text-center">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-[10px] text-[#1D2939]">
                    {currentLeaveRequests.length > 0 ? (
                      currentLeaveRequests
                        .filter((item) => {
                          const search = searchText.toLowerCase();
                          return (
                            item.employeeId.toLowerCase().includes(search) ||
                            item.name.toLowerCase().includes(search) ||
                            item.role.toLowerCase().includes(search) ||
                            item.leaveType.toLowerCase().includes(search) ||
                            item.fromDate.toLowerCase().includes(search) ||
                            item.toDate.toLowerCase().includes(search) ||
                            item.reason.toLowerCase().includes(search) ||
                            item.leaveStatus.toLowerCase().includes(search)
                          );
                        })
                        .map((item, index) => {
                          const btnId = `action-btn-${item._id}`;
                          return (
                            <tr
                              key={item._id}
                              className={`text-[12px] ${index % 2 === 0
                                  ? "bg-[#fff] dark:bg-[#2C2C2C]"
                                  : "bg-[#F8F8F8] dark:bg-[#303030]"
                                }`}
                            >
                              <td className="px-3 py-3 dark:text-[#FDFDFD] text-left overflow-hidden text-ellipsis whitespace-nowrap">{item.employeeId}</td>
                              <td className="px-3 py-3 text-[#3D8FDE] font-medium">{item.name}</td>
                              <td className="px-3 py-3 dark:text-[#FDFDFD] text-left overflow-hidden text-ellipsis whitespace-nowrap" >{item.role}</td>
                              <td className="px-3 py-3 dark:text-[#FDFDFD] text-left overflow-hidden text-ellipsis whitespace-nowrap">{item.leaveType}</td>
                              <td className="px-3 py-3 dark:text-[#FDFDFD] text-left overflow-hidden text-ellipsis whitespace-nowrap">
                                {`${new Date(
                                    item.fromDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })} - ${new Date(
                                    item.toDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}`}
                                </td>
                              <td className="px-3 py-3 dark:text-[#FDFDFD] text-left overflow-hidden text-ellipsis whitespace-nowrap">{item.reason}</td>
                              <td className="px-4 py-3 whitespace-nowrap align-middle">
                                <span
                                  className={`text-[10px] font-semibold py-1 rounded-lg inline-block w-[120px] text-center leading-tight break-words ${getLeaveStatusStyle(
                                    item.leaveStatus
                                  )}`}
                                >
                                  {item.leaveStatus}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <button
                                  id={btnId}
                                  className="text-[10px] font-semibold dark:text-white  "
                                  onClick={(e) => {
                                    if (actionDropdown === item._id) {
                                      setActionDropdown(null);
                                      setDropdownPos(null);
                                    } else {
                                      const rect = (
                                        e.target as HTMLElement
                                      ).getBoundingClientRect();
                                      setDropdownPos({
                                        top: rect.bottom + window.scrollY,
                                        left: rect.left + window.scrollX,
                                      });
                                      setActionDropdown(item._id);
                                    }
                                  }}
                                >
                                  <MoreVertical size={16} />
                                </button>
                                {/* Portal dropdown */}
                                {actionDropdown === item._id &&
                                  dropdownPos &&
                                  typeof window !== "undefined" &&
                                  ReactDOM.createPortal(
                                    <div
                                      style={{
                                        position: "absolute",
                                        top: dropdownPos.top + 4,
                                        left: dropdownPos.left - 80,
                                        zIndex: 9999,
                                        width: "7.5rem",
                                      }}
                                      className="bg-white dark:bg-[#3b3b3b] shadow-md text-center rounded-md"
                                    >
                                      <button
                                        className="w-full px-2 py-1 text-[10px] text-[#17243E] dark:text-[#FDFDFD] dark:bg-[#3b3b3b] border-b border-b-gray-200 dark:border-b-gray-600"
                                        onClick={() => {
                                          setSelectedLeave({
                                            id: item._id, // This is the leave request id, used for update
                                            summaryId: item._id, // If you need to send summaryId in body, keep this
                                            employeeId: item.employeeId,
                                            approvedId: item.approvedId,
                                            approvedName: item.approvedName,
                                            name: item.name,
                                            designation: item.role,
                                            leaveType: item.leaveType,
                                            fromDate: item.fromDate,
                                            toDate: item.toDate,
                                            dateRange: `${new Date(item.fromDate).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                            })} - ${new Date(item.toDate).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                            })}`,
                                            reason: item.reason,
                                            status: item.leaveStatus,
                                            approvedDays: item.approvedDays,
                                            deductionDays: item.deductionDays,
                                          });
                                          setActionDropdown(null);
                                          setDropdownPos(null);
                                        }}
                                      >
                                        View
                                      </button>
                                      <button
                                        className="w-full px-2 py-1 text-[10px] text-[#17243E] dark:text-[#FDFDFD] dark:bg-[#3b3b3b] border-b border-b-gray-200 dark:border-b-gray-600"
                                        onClick={() => {
                                          // Implement cancel logic here
                                          setActionDropdown(null);
                                          setDropdownPos(null);
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>,
                                    document.body
                                  )}
                              </td>
                            </tr>
                          );
                        })
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

              {selectedLeave && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-30 shadow-md flex items-center justify-center ">
                  <div className="bg-white rounded-xl w-full max-w-4xl p-6 shadow-xl relative dark:bg-[#2c2c2c]">
                    <h2 className="text-lg font-semibold text-[#0d1b3e] mb-6 dark:text-[#fcfcfc]">
                      Leave Request Approval
                    </h2>

                    <button
                      onClick={() => setSelectedLeave(null)}
                      className="absolute top-4 right-4 text-xl text-[#0d1b3e] hover:text-gray-600 dark:text-[#fcfcfc]"
                    >
                      ✕
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left Section */}
                      <div className="grid grid-cols-[160px_1fr] items-center">
                        {/* Employee ID */}
                        <label
                          htmlFor="employeeID"
                          className="font-medium text-sm"
                        >
                          Employee ID
                        </label>
                        <input
                          className="w-full border border-[#a6b0c3] rounded-md px-4 py-2 text-gray-600 text-xs dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d]"
                          value={selectedLeave.id}
                          disabled
                        />

                        {/* Employee Name */}
                        <label
                          htmlFor="employeeName"
                          className="font-medium text-sm"
                        >
                          Employee Name
                        </label>
                        <input
                          className="w-full border border-[#a6b0c3] rounded-md px-4 py-2 text-gray-600 text-xs dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d]"
                          value={selectedLeave.name}
                          disabled
                        />

                        {/* Designation */}
                        <label
                          htmlFor="Designation"
                          className="font-medium text-sm"
                        >
                          Designation
                        </label>
                        <input
                          className="w-full border border-[#a6b0c3] rounded-md px-4 py-2 text-gray-600 text-xs dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d]"
                          value={selectedLeave.designation}
                          disabled
                        />

                        {/* Leave Type */}
                        <label
                          htmlFor="Leavetype"
                          className="font-medium text-sm"
                        >
                          Leave Type
                        </label>
                        <input
                          className="w-full border border-[#a6b0c3] rounded-md px-4 py-2 text-gray-600 text-xs dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d]]"
                          value={selectedLeave.leaveType}
                          disabled
                        />

                        {/* From Date */}
                        <label
                          htmlFor="from date"
                          className="font-medium text-sm"
                        >
                          From Date
                        </label>
                        <input
                          className="w-full border border-[#a6b0c3] rounded-md px-4 py-2 text-gray-600 text-xs dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d]"
                          value={new Date(
                            selectedLeave.fromDate
                          ).toLocaleDateString("en-GB")}
                          disabled
                        />

                        {/* To Date */}
                        <label
                          htmlFor="todate"
                          className="font-medium text-sm"
                        >
                          To Date
                        </label>
                        <input
                          className="w-full border border-[#a6b0c3] rounded-md px-4 py-2 text-gray-600 text-xs dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d]"
                          value={new Date(
                            selectedLeave.toDate
                          ).toLocaleDateString("en-GB")}
                          disabled
                        />

                        {/* Reason For Leave */}
                        <label
                          htmlFor="reason"
                          className="font-medium text-sm"
                        >
                          Reason For Leave
                        </label>
                        <textarea
                          className="w-full border border-[#a6b0c3] rounded-md px-4 py-2 text-gray-600 text-xs dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d]"
                          rows={3}
                          value={selectedLeave.reason}
                          disabled
                        />
                      </div>

                      {/* Right Section */}
                      <div className="space-y-4 text-[#0d1b3e] text-sm  dark:text-[#cfcfcf]">
                        <h3 className="font-semibold text-[#1e2a50] dark:text-[#fcfcfc] ">
                          Leave Records
                        </h3>

                        {/* Leave Records Box */}
                        <div className="border dark:border-[#8e8d8d] rounded-xl p-4 space-y-3">
                          {[
                            { label: "Sick Leave", value: "2" },
                            { label: "Casual Leave", value: "2" },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className="flex items-center justify-between"
                            >
                              <span>{item.label}</span>
                              <input
                                className="w-20 border border-gray-300 rounded-md px-2 py-1 text-center text-[#0d1b3e] shadow-sm focus:outline-none dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d]"
                                value={item.value}
                                readOnly
                              />
                            </div>
                          ))}
                        </div>

                        <div className="space-y-4 text-[#0d1b3e] text-sm  dark:text-[#cfcfcf]">
                          {/* Deductions */}
                          <div className="flex items-center gap-3">
                            <label
                              htmlFor="deductions"
                              className="w-32 font-medium"
                            >
                              Deductions
                            </label>
                            <input
                              type="checkbox"
                              checked
                              className="w-5 h-5 border border-gray-400 rounded accent-[#576CBC]"
                              readOnly
                            />
                          </div>

                          {/* Approved Days */}
                          <div className="flex items-center gap-3 dark:bg-[#2c2c2c] ">
                            <label
                              className="font-medium text-sm dark:bg-[#2c2c2c]"
                              htmlFor="approveddays"
                            >
                              Approved Days
                            </label>
                            <div className="relative w-full">
                              <input
                                type="text"

                                onChange={(e) =>
                                  selectedLeave?.status === "WAITINGLIST" &&
                                  setApprovedDays(e.target.value)
                                }
                                className="w-full border border-[#bfc6db] rounded-md px-4 py-2 text-[#012A4A] pr-10 shadow-sm 
    dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d]"
                                disabled={
                                  selectedLeave?.status !== "WAITINGLIST"
                                }
                              />
                            </div>
                          </div>

                          {/* From Date */}
                          <div className="flex items-center gap-3">
                            <label
                              htmlFor="fromdate"
                              className="w-32 font-medium"
                            >
                              From Date
                            </label>
                            <div className="relative w-full">
                              <input
                                type="date"

                                onChange={(e) =>
                                  selectedLeave?.status === "WAITINGLIST" &&
                                  setFromDate(e.target.value)
                                }
                                className="w-full border border-[#a6b0c3] rounded-md px-4 py-2 text-gray-600 text-xs dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d] "
                                disabled={
                                  selectedLeave?.status !== "WAITINGLIST"
                                }
                              />
                            </div>
                          </div>

                          {/* To Date */}
                          <div className="flex items-center gap-3">
                            <label
                              htmlFor="todate"
                              className="w-32 font-medium"
                            >
                              To Date
                            </label>
                            <div className="relative w-full">
                              <input
                                type="date"

                                onChange={(e) =>
                                  selectedLeave?.status === "WAITINGLIST" &&
                                  setToDate(e.target.value)
                                }
                                className="w-full border border-[#a6b0c3] rounded-md px-4 py-2 text-gray-600 text-xs dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d] "
                                disabled={
                                  selectedLeave?.status !== "WAITINGLIST"
                                }
                              />
                            </div>
                          </div>

                          {/* Deduction Days */}
                          <div className="flex items-center gap-3">
                            <label
                              htmlFor="deductiondays"
                              className="w-32 font-medium"
                            >
                              Deduction Days
                            </label>
                            <div className="relative w-full">
                              <input
                                type="text"
                                value={
                                  selectedLeave?.status === "APPROVED" ||
                                    selectedLeave?.status === "REJECTED"
                                    ? selectedLeave?.deductionDays || ""
                                    : deductionDays
                                }
                                onChange={(e) =>
                                  selectedLeave?.status === "WAITINGLIST" &&
                                  setDeductionDays(e.target.value)
                                }
                                className="w-full border border-[#a6b0c3] rounded-md px-4 py-2 text-gray-600 text-xs dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d] "
                                disabled={
                                  selectedLeave?.status !== "WAITINGLIST"
                                }
                              />

                              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                      {selectedLeave?.status === "WAITINGLIST" ? (
                        <>
                          {/* Decline Button */}
                          <button
                            onClick={handleDecline}
                            className="px-4 py-1 border border-[#D34645] text-[#D34645] rounded-lg transition"
                          >
                            Decline
                          </button>

                          {/* Approve Button */}
                          <button
                            onClick={handleApprove}
                            className="px-4 py-1 bg-[#576CBC] text-white rounded-lg hover:bg-[#576CBC] transition"
                          >
                            Approve
                          </button>
                        </>
                      ) : selectedLeave?.status === "APPROVED" ||
                        selectedLeave?.status === "REJECTED" ? (
                        <>
                          {/* Disabled Decline Button */}
                          <button
                            disabled
                            className="px-4 py-1 border border-[#576CBC] text-[#576CBC] rounded-lg opacity-50 cursor-not-allowed"
                          >
                            Decline
                          </button>

                          {/* Disabled Approve Button */}
                          <button
                            disabled
                            className="px-4 py-1 bg-[#576CBC] text-white rounded-lg opacity-50 cursor-not-allowed"
                          >
                            Approve
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="w-full max-w-md bg-white dark:bg-[#232323] rounded-2xl shadow-lg overflow-hidden m-4 relative animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowFilterModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold mb-2 dark:text-white">Filter by</h2>
              <div className="flex flex-col gap-3">
                {/* Employee Name */}
                <label className="text-sm font-medium text-gray-700 dark:text-white">Employee Name</label>
                <input
                  type="text"
                  className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm"
                  placeholder="Enter name"
                  value={filterName}
                  onChange={e => setFilterName(e.target.value)}
                />
                {/* Role */}
                <label className="text-sm font-medium text-gray-700 dark:text-white">Role</label>
                <select
                  className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm"
                  value={filterRole}
                  onChange={e => setFilterRole(e.target.value)}
                >
                  <option value="">Select Role</option>
                  {uniqueRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                {/* Date Range */}
                <label className="text-sm font-medium text-gray-700 dark:text-white">Date Range</label>
                <div className="flex gap-2">
                  <DatePicker
                    selected={filterDateFrom}
                    onChange={date => setFilterDateFrom(date)}
                    selectsStart
                    startDate={filterDateFrom}
                    endDate={filterDateTo}
                    className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm w-full"
                    placeholderText="From"
                    dateFormat="MMM dd, yyyy"
                  />
                  <DatePicker
                    selected={filterDateTo}
                    onChange={date => setFilterDateTo(date)}
                    selectsEnd
                    startDate={filterDateFrom}
                    endDate={filterDateTo}
                    minDate={filterDateFrom || undefined}
                    className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm w-full"
                    placeholderText="To"
                    dateFormat="MMM dd, yyyy"
                  />
                </div>
                {/* Status */}
                <label className="text-sm font-medium text-gray-700 dark:text-white">Status</label>
                <select
                  className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="">Select Status</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 border border-[#576CBC] text-[#576CBC] rounded-lg py-2 font-medium"
                  onClick={() => {
                    setFilterName("");
                    setFilterRole("");
                    setFilterDateFrom(null);
                    setFilterDateTo(null);
                    setFilterStatus("");
                  }}
                >
                  Reset
                </button>
                <button
                  className="flex-1 bg-[#576CBC] text-white rounded-lg py-2 font-medium"
                  onClick={() => setShowFilterModal(false)}
                >
                  Show {filteredLeaveRequests.length} results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </BaseLayout4>
  );
}
