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
import { ImAttachment } from "react-icons/im";
import BaseLayout4 from "../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";



interface Supervisor {
  supervisorId: string;
  supervisorName: string;
  supervisorEmail: string;
  supervisorRole: string;
}

interface Applicant {
  _id: string;
  candidateFirstName: string;
  candidateLastName: string;
  candidateEmail: string;
  candidatePhoneNumber: string | number;
  applicationStatus: "PENDING" | "APPROVED" | "REJECTED";
  positionApplied: string;
  applicationDate: string;
  level?: string;
  gender?: string;
  candidateCountry?: string;
  candidateCity?: string;
  currency?: string;
  expectedSalary?: number;
  preferedWorkingHours?: string;
  uploadResume?: string;
  comments?: string;
  overallRating?: number;
  professionalExperience?: string;
  skills?: string;
  status?: string;
  createdDate?: string;
  createdBy?: string;
  __v?: number;
  supervisor?: Supervisor;
}
const ResumeLink: React.FC<{ applicant: any }> = ({ applicant }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createBlobUrl = async (resumeData: any) => {
    if (!resumeData) {
      console.error("No resume data provided");
      return null;
    }

    try {


      console.log("file ", resumeData)
      const res = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.FILEUPLOAD.GET_UPLOAD}/${resumeData}`, {
        method: "GET",
      });

      if (!res.ok) throw new Error("Failed to fetch file");
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error creating blob URL:", error);
      return null;
    }
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const resumeData = applicant.uploadResume;
      if (!resumeData) {
        setError("Resume not available");
        return;
      }

      // Create new blob URL on each click
      const newBlobUrl = await createBlobUrl(resumeData);
      if (!newBlobUrl) {
        setError("Failed to load resume");
        return;
      }

      // Clean up old blob URL if it exists
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }

      setBlobUrl(newBlobUrl);

      // Open in new tab
      window.open(newBlobUrl, "_blank");
    } catch (error) {
      console.error("Error handling resume click:", error);
      setError("Failed to open resume");
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  return (
    <div className="flex flex-col">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="text-[#38619A] hover:underline flex items-center gap-1 disabled:opacity-50"
      >
        <ImAttachment className="w-4 h-4" />
        {isLoading ? "Loading..." : "Resume"}
      </button>
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
};


export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [activeTab, setActiveTab] = React.useState("All");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterPosition, setFilterPosition] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState<Date | null>(null);
  const [filterDateTo, setFilterDateTo] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchText, setSearchText] = useState("");

  // Get unique positions and statuses for dropdowns
  const uniquePositions = Array.from(new Set(applicants.map(a => a.positionApplied).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(applicants.map(a => a.applicationStatus)));

  const tabs = ["All", "NewCandidates", "Shortlisted", "Rejected", "Waiting"];
  const itemsPerPage = 10;

  const tabStatusMap: Record<string, string | null> = {
    All: null,
    NewCandidates: "NEW APPLICATION",
    Shortlisted: "SHORTLISTED",
    Rejected: "REJECTED",
    Waiting: "WAITING",
  };
  // Filtering logic
  const filteredApplicants = applicants.filter(applicant => {
    const tabStatus = tabStatusMap[activeTab];
    if (tabStatus && applicant.applicationStatus !== tabStatus) return false;
    // Position filter
    if (filterPosition && applicant.positionApplied !== filterPosition) return false;
    // Name filter (first or last name, case-insensitive)
    if (filterName && !(`${applicant.candidateFirstName} ${applicant.candidateLastName}`.toLowerCase().includes(filterName.toLowerCase()))) return false;
    // Date filter
    if (filterDateFrom && new Date(applicant.applicationDate) < filterDateFrom) return false;
    if (filterDateTo && new Date(applicant.applicationDate) > filterDateTo) return false;
    // Status filter
    if (filterStatus && applicant.applicationStatus !== filterStatus) return false;
    // Main search bar (name or email)
    if (searchText && !(
      `${applicant.candidateFirstName} ${applicant.candidateLastName}`.toLowerCase().includes(searchText.toLowerCase()) ||
      applicant.candidateEmail.toLowerCase().includes(searchText.toLowerCase())
    )) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplicants = filteredApplicants.slice(startIndex, endIndex);

  useEffect(() => {
    const token = localStorage.getItem("AdminAuthToken");
    if (token) {
      fetchApplicants(token);
    }
  }, []);
  const createBlobUrl = async (resumeData: any) => {
    if (!resumeData) {
      console.error("No resume data provided");
      return null;
    }

    try {


      console.log("file ", resumeData)
      const res = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.FILEUPLOAD.GET_UPLOAD}/${resumeData}`, {
        method: "GET",
      });

      if (!res.ok) throw new Error("Failed to fetch file");
      const blob = await res.blob();


      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error creating blob URL:", error);
      return null;
    }
  };

  const fetchApplicants = async (token: string) => {
    try {
      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.APPLICANTS.GET_LIST}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setApplicants(response.data.applicants);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "NEWAPPLICATION":
        return "bg-[#F9E7FF] text-[#BE36D5] dark:bg-[#4C3151] dark:text-[#BE36D5] rounded-md px-2 text-[10px]";
      case "SHORTLISTED":
        return "bg-[#ECFDF3] dark:bg-[#374336] dark:text-[#377E36] text-[#377E36] rounded-md px-6 text-[10px]";
      case "REJECTED":
        return "bg-[#FDECEC] dark:bg-[#503434] dark:text-[#D34645] text-[#D34645] rounded-md px-8 text-[10px]";
      case "WAITING":
        return "bg-[#FDF6EC] dark:bg-[#534634] dark:text-[#F0AD4E] text-[#F0AD4E] rounded-md px-8 text-[10px]";
      case "APPROVED":
        return "bg-[#EEEEFF] text-[#38619A] dark:bg-[#2F3642] dark:text-[#225BAA] rounded-md px-8 text-[10px]";
    }
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem("AdminAuthToken");
      if (!token) {
        console.error("Admin token not found.");
        return;
      }

      const response = await axios.put(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.RECRUITMENT.UPDATE}/${id}`,
        { applicationStatus: status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Status updated successfully:", response.data);

      // Refresh applicant list
      fetchApplicants(token);
    } catch (error: any) {
      console.error(
        "Error updating application status:",
        error.response?.data || error
      );
    } finally {
      setActionDropdown(null);
      setDropdownPos(null);
    }
  };

  return (
    <BaseLayout4>
      <div className="">
        <AdminHeader currentSection="Recuirement List" showBackButton={true} showBackPath="/modules/users/admin-main/ui/employees"/>
        <div className="md:p-2 mx-auto">
          <div className="h-full w-full  flex flex-col justify-between">
            <div className="p-0 justify-between flex flex-col">
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
                  <div className="flex flex-wrap gap-2 mb-0">
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 md:px-3 md:py-1 text-[16px] font-medium
                           ${activeTab === tab
                            ? "text-[#576CBC] border-b-2 border-b-[#576CBC] mt-[2px] dark:text-[#576CBC]"
                            : "text-[#010E30] mt-0 dark:text-[white]"
                          }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full h-[588px] bg-[#FAFAFB] rounded-lg dark:bg-[#343434]">
                  {/* Header Search & Filter */}
                  <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name or email"
                        className="bg-transparent outline-none text-[15px] w-52 py-3"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                      />
                    </div>

                    <div
                      className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
                      onClick={() => setShowFilterModal(true)}
                    >
                      <MdTune className="w-4 h-4" />
                      <span>Filter</span>
                    </div>

                    <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                      <span className="text-left -ml-60 ">
                        Showing {currentApplicants.length} of {filteredApplicants.length}
                      </span>
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
                            {/* Position Applied */}
                            <label className="text-sm font-medium text-gray-700 dark:text-white">Position Applied</label>
                            <select
                              className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm"
                              value={filterPosition}
                              onChange={e => setFilterPosition(e.target.value)}
                            >
                              <option value="">Select Position</option>
                              {uniquePositions.map(pos => (
                                <option key={pos} value={pos}>{pos}</option>
                              ))}
                            </select>
                            {/* Application Name */}
                            <label className="text-sm font-medium text-gray-700 dark:text-white">Application Name</label>
                            <input
                              type="text"
                              className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm"
                              placeholder="Enter name"
                              value={filterName}
                              onChange={e => setFilterName(e.target.value)}
                            />
                            {/* Date Range */}
                            <label className="text-sm font-medium text-gray-700 dark:text-white">Applied Date</label>
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
                                setFilterPosition("");
                                setFilterName("");
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
                              Show {filteredApplicants.length} results
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Table */}
                  <table
                    className="w-full min-w-[900px] text-sm text-left table-auto"
                    style={{ width: "100%", tableLayout: "fixed" }}
                  >
                    <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                      <tr className="font-medium">
                        <th className="p-4 font-semibold text-[12px] text-center">
                          Application Date
                        </th>
                        <th className="p-4 font-semibold text-[12px] text-center ">
                          Application Name
                        </th>
                        <th className="p-4 font-semibold text-[12px] text-center ">
                          Contact
                        </th>
                        <th className="p-4 font-semibold text-[12px] text-center ">
                          E-Mail
                        </th>
                        <th className="p-4 font-semibold text-[12px] text-center ">
                          Position Applied
                        </th>
                        <th className="p-4 font-semibold text-[12px] text-center ">
                          Resume
                        </th>
                        <th className="p-4 font-semibold text-[12px] text-center ">
                          Status
                        </th>
                        <th className="p-4 font-semibold text-[12px] text-center">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-[10px] text-[#1D2939]">
                      {currentApplicants.length > 0 ? (
                        currentApplicants.map((applicant, index) => {
                          const resumeUrl = createBlobUrl(applicant.uploadResume);
                          return (
                            <tr
                              key={applicant._id}
                              className={`text-[12px] ${index % 2 === 0
                                ? "bg-[#fff] dark:bg-[#2C2C2C]"
                                : "bg-[#F8F8F8] dark:bg-[#303030]"
                                }`}
                            >
                              <td className="px-3 py-3 text-[#17243E] dark:text-[#FDFDFD] text-left overflow-hidden text-ellipsis whitespace-nowrap">
                                {formatDate(applicant.applicationDate)}
                              </td>
                              <td className="px-4 py-3 text-center overflow-hidden text-ellipsis whitespace-nowrap w-[12%] align-middle">
                                <span className="px-3 py-3 text-[#3D8FDE] font-medium text-left">
                                  {applicant.candidateFirstName}{" "}
                                  {applicant.candidateLastName}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-[#17243E] dark:text-[#FDFDFD] text-left overflow-hidden text-ellipsis whitespace-nowrap">
                                {applicant.candidatePhoneNumber}
                              </td>
                              <td className="px-3 py-3 text-[#17243E] dark:text-[#FDFDFD] text-left overflow-hidden text-ellipsis whitespace-nowrap">
                                {applicant.candidateEmail}
                              </td>
                              <td className="px-3 py-3 text-[#17243E] dark:text-[#FDFDFD] text-left overflow-hidden text-ellipsis whitespace-nowrap">
                                {applicant.positionApplied}
                              </td>
                              <td className="px-3 py-3 text-[#17243E] dark:text-[#FDFDFD] text-left overflow-hidden text-ellipsis whitespace-nowrap">
                                <ResumeLink applicant={applicant} />

                              </td>

                              <td className="px-4 py-3 whitespace-nowrap align-middle">
                                <span
                                  className={`text-[10px] font-semibold py-1 px-2 rounded-lg inline-block w-[120px] text-center leading-tight break-words ${getStatusClass(
                                    applicant.applicationStatus
                                  )}`}
                                >
                                  {applicant.applicationStatus}
                                </span>
                              </td>

                              <td className="px-3 py-3 text-center">
                                <button
                                  id={`action-btn-${applicant._id}`}
                                  className={`text-[10px] font-semibold dark:text-white ${["APPROVED", "REJECTED"].includes(
                                    applicant.applicationStatus
                                  )
                                    ? "cursor-not-allowed opacity-40"
                                    : "cursor-pointer"
                                    }`}
                                  disabled={["APPROVED", "REJECTED"].includes(
                                    applicant.applicationStatus
                                  )}
                                  onClick={(e) => {
                                    if (
                                      ["APPROVED", "REJECTED"].includes(
                                        applicant.applicationStatus
                                      )
                                    )
                                      return; // prevent dropdown

                                    if (actionDropdown === applicant._id) {
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
                                      setActionDropdown(applicant._id);
                                    }
                                  }}
                                >
                                  <MoreVertical size={16} />
                                </button>

                                {actionDropdown === applicant._id &&
                                  dropdownPos &&
                                  typeof window !== "undefined" &&
                                  ReactDOM.createPortal(
                                    <div
                                      style={{
                                        position: "absolute",
                                        top: dropdownPos.top + 4,
                                        left: dropdownPos.left - 50,
                                        zIndex: 9999,
                                        width: "7.5rem",
                                      }}
                                      className="bg-white dark:bg-[#3b3b3b] shadow-md text-center rounded-sm"
                                    >
                                      <button
                                        className="w-full px-2 py-1 text-[10px] text-[#17243E] rounded-t-xl dark:text-[#FDFDFD] dark:bg-[#3b3b3b] border-b border-b-gray-200 dark:border-b-gray-600"
                                        onClick={() => {
                                          updateApplicationStatus(
                                            applicant._id,
                                            "APPROVED"
                                          );
                                          setActionDropdown(null);
                                          setDropdownPos(null);
                                        }}
                                      >
                                        Approve
                                      </button>

                                      <button
                                        className="w-full px-2 py-1 text-[10px] text-[#17243E] dark:text-[#FDFDFD] dark:bg-[#3b3b3b] border-b border-b-gray-200 dark:border-b-gray-600"
                                        onClick={() => {
                                          updateApplicationStatus(
                                            applicant._id,
                                            "REJECTED"
                                          );
                                          setActionDropdown(null);
                                          setDropdownPos(null);
                                        }}
                                      >
                                        Reject
                                      </button>

                                      <button
                                        className="w-full px-2 py-1 text-[10px] text-[#17243E] dark:text-[#FDFDFD] rounded-b-xl dark:bg-[#3b3b3b]"
                                        onClick={() => {
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
      </div>
    </BaseLayout4>
  );
}
