"use client";

import React, { useEffect, useState } from "react";
import { MoreVertical, Search } from "lucide-react";
import { MdTune } from "react-icons/md";
import axios from "axios";
import ReactDOM from "react-dom";
import { useRouter } from "next/navigation";
import { TiAttachment } from "react-icons/ti";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";

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
  applicationStatus: string;
  positionApplied: string;
  applicationDate: string;
  level?: string;
  gender?: string;
  candidateCountry?: string;
  candidateCity?: string;
  currency?: string;
  expectedSalary?: number;
  preferedWorkingHours?: string;
  uploadResume?: {
    type: string;
    data: any[];
  };
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

function getResumeBlobUrl(
  uploadResume?: string | { type: string; data: any[] }
): string | undefined {
  if (!uploadResume) return undefined;

  if (typeof uploadResume === "string") {
    // Assume base64 string, strip possible data URI prefix
    const base64Data = uploadResume.includes("base64,")
      ? uploadResume.split("base64,")[1]
      : uploadResume;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  } else if (uploadResume.data && uploadResume.type) {
    const byteArray = new Uint8Array(uploadResume.data);
    const blob = new Blob([byteArray], { type: uploadResume.type });
    return URL.createObjectURL(blob);
  }

  return undefined;
}

const ApplicantsList: React.FC = () => {
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  const [activeTab, setActiveTab] = React.useState("All");
  const [currentPage, setCurrentPage] = React.useState(1);

  const [actionDropdown, setActionDropdown] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterPosition, setFilterPosition] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState<Date | null>(null);
  const [filterDateTo, setFilterDateTo] = useState<Date | null>(null);

  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([]);
  const tabs = ["All", "NewCandidates", "Shortlisted", "Rejected", "Waiting"];
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("AdminAuthToken");
      if (token) {
        fetchApplicants(token);
      } else {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      }
    }
  }, []);

  useEffect(() => {
    let filtered = applicants;

    // Filter by active tab
    if (activeTab === "NewCandidates") {
      filtered = filtered.filter(
        (applicant) => applicant.applicationStatus === "NEWAPPLICATION"
      );
    } else if (activeTab !== "All") {
      filtered = filtered.filter(
        (applicant) =>
          applicant.applicationStatus.toLowerCase() === activeTab.toLowerCase()
      );
    }

    // Filter by search query
    const search = searchQuery.trim().toLowerCase();
    if (search) {
      filtered = filtered.filter(
        (applicant) =>
          applicant.candidateFirstName.toLowerCase().includes(search) ||
          applicant.candidateLastName.toLowerCase().includes(search) ||
          applicant.candidateEmail.toLowerCase().includes(search) ||
          (applicant.positionApplied || "").toLowerCase().includes(search) ||
          (applicant.applicationStatus || "").toLowerCase().includes(search)
      );
    }

    // Filter by modal inputs
    if (filterName) {
      filtered = filtered.filter(
        (applicant) =>
          applicant.candidateFirstName
            .toLowerCase()
            .includes(filterName.toLowerCase()) ||
          applicant.candidateLastName
            .toLowerCase()
            .includes(filterName.toLowerCase())
      );
    }
    if (filterPosition) {
      filtered = filtered.filter(
        (applicant) => applicant.positionApplied === filterPosition
      );
    }
    if (filterStatus) {
      filtered = filtered.filter(
        (applicant) => applicant.applicationStatus === filterStatus
      );
    }
    if (filterDateFrom) {
      filtered = filtered.filter(
        (applicant) => new Date(applicant.applicationDate) >= filterDateFrom
      );
    }
    if (filterDateTo) {
      filtered = filtered.filter(
        (applicant) => new Date(applicant.applicationDate) <= filterDateTo
      );
    }

    setFilteredApplicants(filtered);
  }, [
    activeTab,
    applicants,
    searchQuery,
    filterName,
    filterPosition,
    filterStatus,
    filterDateFrom,
    filterDateTo,
  ]);

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
  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      console.log("Updating applicant...");
      console.log("ID:", id);
      console.log("Status:", status);

      const token = localStorage.getItem("AdminAuthToken");
      if (!token) {
        console.error("No token found.");
        return;
      }

      const response = await axios.put(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.RECRUITMENT.UPDATE}/${id}`,
        {
          applicationStatus: status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Status updated successfully:", response.data);

      // Optional: Refresh the list
      fetchApplicants(token);
    } catch (error: any) {
      console.error("Error updating status:", error.response?.data || error);
    } finally {
      setActionDropdown(null);
      setDropdownPos(null);
    }
  };

  // Get unique positions and statuses from applicants
  const positions = Array.from(new Set(applicants.map(a => a.positionApplied).filter(Boolean)));
  const statuses = Array.from(new Set(applicants.map(a => a.applicationStatus).filter(Boolean)));



  const itemsPerPage = 6;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplicants = filteredApplicants.slice(startIndex, endIndex);

  //colour
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

  return (
    <div className=" mx-auto">
      <div className="mx-auto">
        <div className="flex flex-col h-[430px] mb-4">
          <div className="w-full flex flex-col mt-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 space-y-3 md:space-y-0 px-4 mt-2">
              <div className="flex flex-wrap gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2 py-1 text-[15px] font-semibold ${
                      activeTab === tab
                        ? "text-[#576CBC] border-b-2 border-b-[#576CBC]"
                        : ""
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-scroll scrollbar-none w-full h-[350px] bg-[#FAFAFB] rounded-lg dark:bg-[#343434]">
              <div className="flex justify-between items-center px-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Search className="w-3 h-3 text-gray-400 dark:text-gray-400 -mt-[1px]" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="bg-transparent outline-none text-[12px] w-52 py-3"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div
                  className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48  cursor-pointer"
                  onClick={() => setIsFilterModalOpen(true)}
                >
                  <MdTune className="w-4 h-4" />
                  <span>Filter</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-gray-400 dark:text-gray-400 mr-20">
                  <span className="text-left">
                    Showing {filteredApplicants.length === 0 ? 0 : 1} to{" "}
                    {Math.min(itemsPerPage, filteredApplicants.length)} of{" "}
                    {filteredApplicants.length}
                  </span>
                </div>
              </div>

              {isFilterModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center overflow-auto">
                  <div className="w-full max-w-md bg-white dark:bg-[#252525] rounded-2xl shadow-lg overflow-hidden m-4 relative">
                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
                      onClick={() => setIsFilterModalOpen(false)}
                      aria-label="Close"
                    >
                      ×
                    </button>
                    <div className="p-6 space-y-4">
                      <h2 className="text-lg font-semibold mb-2 dark:text-[#fff]">Filter by</h2>
                      <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-[#fff] mt-2">Application Name</label>
                        <input
                          type="text"
                          className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm"
                          placeholder="Enter name"
                          value={filterName}
                          onChange={e => setFilterName(e.target.value)}
                        />
                        <label className="text-sm font-medium text-gray-700 dark:text-[#fff]">Position Applied</label>
                        <select
                          className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm"
                          value={filterPosition}
                          onChange={e => setFilterPosition(e.target.value)}
                        >
                          <option value="">All Positions</option>
                          {positions.map(position => (
                            <option key={position} value={position}>{position}</option>
                          ))}
                        </select>
                        <label className="text-sm font-medium text-gray-700 dark:text-[#fff]">Status</label>
                        <select
                          className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm"
                          value={filterStatus}
                          onChange={e => setFilterStatus(e.target.value)}
                        >
                          <option value="">All Statuses</option>
                          {statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-[#fff]">From Date</label>
                            <DatePicker
                              selected={filterDateFrom}
                              onChange={date => setFilterDateFrom(date)}
                              selectsStart
                              startDate={filterDateFrom}
                              endDate={filterDateTo}
                              maxDate={filterDateTo || undefined}
                              className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm w-full"
                              placeholderText="From"
                              dateFormat="yyyy-MM-dd"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-[#fff]">To Date</label>
                            <DatePicker
                              selected={filterDateTo}
                              onChange={date => setFilterDateTo(date)}
                              selectsEnd
                              startDate={filterDateFrom}
                              endDate={filterDateTo}
                              minDate={filterDateFrom || undefined}
                              className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm w-full"
                              placeholderText="To"
                              dateFormat="yyyy-MM-dd"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button
                          className="flex-1 border border-[#576CBC] text-[#576CBC] rounded-lg py-2 font-medium"
                          onClick={() => {
                            setFilterName("");
                            setFilterPosition("");
                            setFilterStatus("");
                            setFilterDateFrom(null);
                            setFilterDateTo(null);
                          }}
                        >
                          Reset
                        </button>
                        <button
                          className="flex-1 bg-[#576CBC] text-white rounded-lg py-2 font-medium"
                          onClick={() => setIsFilterModalOpen(false)}
                        >
                          Show {filteredApplicants.length} results
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                      console.log('Resume for', applicant.candidateFirstName, applicant.uploadResume);
                      const resumeUrl = getResumeBlobUrl(applicant.uploadResume);
                      return (
                        <tr
                          key={applicant._id}
                          className={`text-[12px] ${
                            index % 2 === 0
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
                            {resumeUrl ? (
                              <a
                                href={resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-[#17243E] dark:text-[#669ee2] ml-8"
                              >
                                <TiAttachment className="w-4 h-4" />
                                <span className="text-[11px] text-center ">View Resume</span>
                              </a>
                            ) : (
                              <span className="text-gray-400 italic ml-8">No Resume</span>
                            )}
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
                              className={`text-[10px] font-semibold dark:text-white ${
                                ["APPROVED", "REJECTED"].includes(
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
                      <td colSpan={8} className="p-4 text-center dark:text-white">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button
          className="bg-transparent border border-[#576CBC] text-[#576CBC] text-[11px] px-3 py-1 rounded-md shadow transition"
          onClick={() => router.push("/modules/users/admin-main/ui/recuirementlist")}
        >
          View All
        </button>
      </div>
    </div>
  );
};

export default ApplicantsList;
