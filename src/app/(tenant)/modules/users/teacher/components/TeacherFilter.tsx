"use client";

import React, { useEffect, useState } from "react";
import { MdTune } from "react-icons/md";
import { MoreVertical, Search } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Modal from "react-modal";
import { FaEye } from "react-icons/fa";
import Pagination from "@/components/Pagination";
import { IoMdClose } from "react-icons/io";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { toast } from "react-toastify";
import { AppFailureToastMessages, AppSuccessToastMessages } from "@/app/_components/contents/toast_message";

interface Meeting {
  _id: string;
  meetingName: string;
  meetingId: string;

  selectedDate: string; // ISO date string
  startTime: string;
  endTime: string;
  description?: string;

  meetingStatus: "Completed" | "Scheduled" | "Pending" | string;
  duration?: string;
  status: "Active" | "Inactive" | string;

  createdDate: string;
  createdBy: string;
  updatedDate?: string;
  updatedBy?: string;
  __v?: number;

  // Optional supervisor (some meetings)
  supervisor?: {
    supervisorId: string;
    supervisorName: string;
    supervisorEmail: string;
  };

  // Optional admin (some meetings)
  admin?: {
    adminId: string;
    adminName: string;
    adminEmail: string;
    adminRole: string;
  };

  // Optional single or multiple teachers
  teacher:
  | Array<{
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
    attendee?: string;
  }>
  | {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
  };

  // Optional participants (student meetings)
  participants?: Array<{
    studentId: string;
    studentName: string;
    studentEmail: string;
  }>;
}

interface MeetingResponse {
  totalCount: number;
  meetings: Meeting[];
}

interface Attendance {
  studentId: string;
  name: string;
  joined: boolean;
}

const TeacherFilter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [upcomingClasses, setUpcomingClasses] = useState<Meeting[]>([]);
  const [completedData, setCompletedData] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [allMeetings, setAllMeetings] = useState<Meeting[]>([]);

  // Filter modal state
  const [showMeetingFilterModal, setShowMeetingFilterModal] = useState(false);
  const [meetingFilters, setMeetingFilters] = useState({
    meetingName: "",
    teacher: "",
    status: "",
    fromDate: "",
    toDate: "",
    timing: "",
  });

  // Reschedule modal state
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [selectedMeetingDetails, setSelectedMeetingDetails] =
    useState<Meeting | null>(null);
  const [isMeetingDetailsModalOpen, setIsMeetingDetailsModalOpen] =
    useState(false);

  useEffect(() => {
    Modal.setAppElement("body");

    const meetingId = selectedMeetingDetails?._id; // Get the meeting ID from selectedMeetingDetails

    const fetchClasses = async () => {
      try {
        const teacherId = localStorage.getItem("TeacherPortalId");
        const token = localStorage.getItem("TeacherAuthToken");
         if (!teacherId) {
                              toast.error(
                                AppValidationMessages.NEXT_SCHEDULED_CLASS.NO_TEACHER_ID
                              );
        
                              return;
                            }
                    
                     if (!token) {
                              toast.error(
                                AppValidationMessages.NEXT_SCHEDULED_CLASS.NO_TOKEN
                              );
                              return;
                            }

        const response = await axios.get<MeetingResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET_TEACHERMEETINGLIST}`,
          {
            params: { teacherId },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const meetings = response.data.meetings;
        console.log("haii thi is meetings",response.data);


        // Only show as upcoming if end time is in the future and not completed
       setAllMeetings(meetings);



// Completed tab → ONLY completed
const completed = meetings.filter(
  (m) => m.meetingStatus === "Completed"
);

// Scheduled tab → Scheduled + Rescheduled
const upcoming = meetings.filter(
  (m) =>
    m.meetingStatus === "Scheduled" ||
    m.meetingStatus === "Rescheduled"
);

setUpcomingClasses(upcoming);
setCompletedData(completed);
console.log({
  total: meetings.length,
  scheduled: upcoming.length,
  completed: completed.length,
});



     
      } catch (error) {
  console.error(error);

  toast.error(
    AppFailureToastMessages.TEACHER_MEETING_FETCH
  );
}
    };

    fetchClasses();
  }, []);

  const dataToShow = activeTab === "upcoming" ? upcomingClasses : completedData;

  useEffect(() => {
    setFilteredMeetings(dataToShow);
    setSearchQuery("");
    setCurrentPage(1);
  }, [activeTab, upcomingClasses, completedData]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = dataToShow.filter((item) => {
      // Check if teacher is an array or a single object
      const teacherNames = Array.isArray(item.teacher)
        ? item.teacher.map((t) => t.teacherName.toLowerCase())
        : [item.teacher.teacherName.toLowerCase()];

      const meetingName = item.meetingName?.toLowerCase() || "";
      const meetingId = item.meetingId?.toLowerCase() || "";
      // Additional searchable fields
      const status = (item.meetingStatus || "").toLowerCase();
      const timing = `${item.startTime || ""} - ${item.endTime || ""}`.toLowerCase();
      const dateObj = item.selectedDate ? new Date(item.selectedDate) : null;
      const dateIso = item.selectedDate?.slice(0, 10).toLowerCase() || ""; // YYYY-MM-DD
      const dateReadable = dateObj
        ? dateObj
          .toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
          .toLowerCase()
        : "";

      return (
        meetingId.includes(query.toLowerCase()) ||
        meetingName.includes(query.toLowerCase()) ||
        teacherNames.some((name) => name.includes(query.toLowerCase())) ||
        status.includes(query.toLowerCase()) ||
        timing.includes(query.toLowerCase()) ||
        dateIso.includes(query.toLowerCase()) ||
        dateReadable.includes(query.toLowerCase())
      );
    });
    setFilteredMeetings(filtered);
    setCurrentPage(1);
  };

  // Filter logic
  const handleApplyMeetingFilters = () => {
    let filtered = [...dataToShow];

    if (meetingFilters.meetingName) {
      filtered = filtered.filter((m) =>
        m.meetingName
          .toLowerCase()
          .includes(meetingFilters.meetingName.toLowerCase())
      );
    }
    if (meetingFilters.teacher) {
      filtered = filtered.filter((m) => {
        const teacherNames = Array.isArray(m.teacher)
          ? m.teacher.map((t) => t.teacherName.toLowerCase())
          : [m.teacher.teacherName.toLowerCase()];

        return teacherNames.some((name) =>
          name.includes(meetingFilters.teacher.toLowerCase())
        );
      });
    }
    if (meetingFilters.status) {
      filtered = filtered.filter(
        (m) => m.meetingStatus === meetingFilters.status
      );
    }
    if (meetingFilters.fromDate && meetingFilters.toDate) {
      const from = new Date(meetingFilters.fromDate);
      const to = new Date(meetingFilters.toDate);
      filtered = filtered.filter((m) => {
        const date = new Date(m.selectedDate);
        return date >= from && date <= to;
      });
    }
    if (meetingFilters.timing) {
      filtered = filtered.filter((m) => m.startTime === meetingFilters.timing);
    }

    setFilteredMeetings(filtered);
    setCurrentPage(1);
    setShowMeetingFilterModal(false);
  };

  const handleResetMeetingFilters = () => {
    setMeetingFilters({
      meetingName: "",
      teacher: "",
      status: "",
      fromDate: "",
      toDate: "",
      timing: "",
    });
    setFilteredMeetings(dataToShow);
    // setShowMeetingFilterModal(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMeetings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const validateRescheduleForm = () => {

  if (!rescheduleReason.trim()) {
    toast.error(
      AppValidationMessages.TEACHER_MEETING.RESCHEDULE_REASON_REQUIRED
    );
    return false;
  }

  if (!rescheduleDate) {
    toast.error(
      AppValidationMessages.TEACHER_MEETING.RESCHEDULE_DATE_REQUIRED
    );
    return false;
  }

  if (!rescheduleTime) {
    toast.error(
      AppValidationMessages.TEACHER_MEETING.RESCHEDULE_TIME_REQUIRED
    );
    return false;
  }

  return true;
};

  async function handleRescheduleSubmit(
    event: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> {
    event.preventDefault();

    const meetingId = selectedMeetingDetails?._id;

    if (!validateRescheduleForm()) {
  return;
}

    if (!meetingId) {
  toast.error(
    AppValidationMessages.TEACHER_MEETING.MEETING_ID_REQUIRED
  );
  return;
}

    const teacherId = localStorage.getItem("TeacherPortalId");
    const token = localStorage.getItem("TeacherAuthToken");
    if (!token || !teacherId) {
      console.error("Missing token or teacher ID");
      setFailed(true);
      setFailedMessage("Authentication failed. Please log in again.");
      return;
    }

    const payload = {
      meetingName: selectedMeetingDetails?.meetingName,
      selectedDate: rescheduleDate,
      startTime: rescheduleTime,
      description: rescheduleReason,
    };
    console.log("Sending payload:", payload);
    try {
      const response = await axios.put(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TEACHERMEETING.UPDATE}/${meetingId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Meeting rescheduled successfully:", response.data);
      toast.success(
  AppSuccessToastMessages.MEETING_RESCHEDULE
);

setSuccess(true);
      setIsRescheduleModalOpen(false);
      // Optionally refresh meeting list
    } catch (error) {
    toast.error(
  AppFailureToastMessages.MEETING_RESCHEDULE
);

setFailed(true);
setFailedMessage(
  AppFailureToastMessages.MEETING_RESCHEDULE
);
    }
  }
  return (
    <>
      <div className="flex space-x-6 mt-4 px-4 py-2 rounded-md">
        <button
          className={`relative text-[14px] transition font-medium ${activeTab === "upcoming"
              ? "text-[#576CBC] font-semibold"
              : "text-[#0A0A12] dark:text-[#fff] opacity-80"
            }`}
          onClick={() => setActiveTab("upcoming")}
        >
          Scheduled ({upcomingClasses.length})
          {activeTab === "upcoming" && (
            <span className="absolute left-0 ml-4 -bottom-1 w-[60px] h-[2px] rounded-full bg-[#576CBC]" />
          )}
        </button>
        <button
          className={`relative text-[14px] transition font-medium ${activeTab === "completed"
              ? "text-[#576CBC] font-semibold"
              : "text-[#0A0A12] dark:text-[#fff] opacity-80"
            }`}
          onClick={() => setActiveTab("completed")}
        >
          Completed ({completedData.length})
          {activeTab === "completed" && (
            <span className="absolute left-0 ml-4  -bottom-1 w-[60px] h-[2px] rounded-full bg-[#576CBC]" />
          )}
        </button>
      </div>

      <div className="mt-2">
        <div className="w-full bg-[#FAFAFB] dark:bg-[#343434] rounded-t-lg flex justify-between items-center px-4 py-0">
          <div className="flex justify-between items-center px-4 py-0">
            <Search className="w-3 h-3 text-gray-400 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search by keyword"
              className="bg-transparent outline-none text-[12px] ml-1 w-52 py-3"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div
            onClick={() => setShowMeetingFilterModal(true)}
            className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
          >
            <MdTune className="w-4 h-4" />
            <span>Filter</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-gray-400 dark:text-gray-400">
            <span className="text-center -ml-60">
              Showing {currentItems.length} of {filteredMeetings.length}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full h-[610px] bg-[#FAFAFB] dark:bg-[#343434] overflow-y-auto">
        <table className="w-full table-auto">
          <thead className="text-[12px] bg-[#4C6993] text-white">
            <tr>
              <th className="text-left px-4 py-3">Meeting ID</th>
              <th className="text-left px-4 py-3">Meeting Name</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Timing</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  No meetings found.
                </td>
              </tr>
            ) : (
              currentItems.map((item) => (
                <tr
                  key={item._id}
                  className="text-[12px] odd:bg-white even:bg-[#F8F8F8] dark:odd:bg-[#2C2C2C] dark:even:bg-[#303030]"
                >
                  <td className="px-4 py-3 text-[#3D8FDE] font-medium">
                    {item.meetingId}
                  </td>
                  <td className="px-4 py-2 text-[#17243E] dark:text-[#FDFDFD]">
                    {item.meetingName}
                  </td>
                  <td className="px-4 py-2 text-[#17243E] dark:text-[#FDFDFD]">
                    {new Date(item.selectedDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-2 text-left w-[180px] break-words whitespace-normal">
                    {item.startTime}
                  </td>
                  <td className="px-4 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] w-[180px] break-words whitespace-normal">
                    <span
                      className={`px-2 font-semibold text-[10px] text-center py-[3px] rounded-md ${item.meetingStatus === "Scheduled"
                          ? "bg-[#ECFDF3] text-[#377E36] dark:bg-[#377E3633]"
                          : item.meetingStatus === "Rescheduled"
                            ? "bg-[#E4E4E4] text-[#343E59] dark:bg-[#DEDEDE]/20 dark:text-[#DEDEDE] "
                            : "bg-[#ECFDF3] text-[#377E36] dark:bg-[#377E3633] "
                        }`}
                    >
                      {(item.meetingStatus || "UNKNOWN").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2 relative ">
                    {item.meetingStatus === "Scheduled" ||
                      item.meetingStatus === "Rescheduled" ? (
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() =>
                            setOpenDropdownId(
                              openDropdownId === item._id ? null : item._id
                            )
                          }
                          className="p-2 rounded-md"
                        >
                          <MoreVertical className="w-4 h-4 text-slate-600 dark:text-white" />
                        </button>

                        {openDropdownId === item._id && (
                          <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-[#2C2C2C] shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="py-1 text-sm text-gray-700 dark:text-white">
                              <button
                                onClick={() => {
                                  setSelectedMeetingDetails(item); // ✅ Set selected meeting first
                                  setIsRescheduleModalOpen(true);
                                  setIsDetailsModalOpen(false);
                                }}
                                className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-[#404040]"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => setOpenDropdownId(null)}
                                className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 dark:hover:bg-[#404040]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <FaEye
                        className="w-4 h-4 text-slate-600 dark:text-white cursor-pointer"
                        onClick={() => {
                          setSelectedMeetingDetails(item); // Set the selected meeting details
                          setIsMeetingDetailsModalOpen(true); // Open the meeting details modal
                        }}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredMeetings.length / itemsPerPage)}
        onPageChange={setCurrentPage}
      />

      {/* Filter Modal */}
      {showMeetingFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-30">
          <div className="bg-white p-5 rounded-lg w-[400px] relative dark:bg-[#252525]">
            <button
              className="absolute top-2 right-3 text-gray-400 text-xl"
              onClick={() => setShowMeetingFilterModal(false)}
            >
              &times;
            </button>
            <h2 className="text-[16px] font-semibold mb-4">Filter by</h2>
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 dark:text-[#D6D6D6]">
                Meeting Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded text-xs dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]"
                value={meetingFilters.meetingName}
                onChange={(e) =>
                  setMeetingFilters({
                    ...meetingFilters,
                    meetingName: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 dark:text-[#D6D6D6]">
                Meeting Date
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="w-1/2 px-3 py-2 border rounded text-xs dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434] dark:[color-scheme:dark]"
                  value={meetingFilters.fromDate}
                  onChange={(e) =>
                    setMeetingFilters({
                      ...meetingFilters,
                      fromDate: e.target.value,
                    })
                  }
                />
                <input
                  type="date"
                  className="w-1/2 px-3 py-2 border rounded text-xs dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]  dark:[color-scheme:dark]"
                  value={meetingFilters.toDate}
                  onChange={(e) =>
                    setMeetingFilters({
                      ...meetingFilters,
                      toDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Time</label>
              <input
                type="time"
                className="w-full border rounded-md p-2 text-[12px] dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434] dark:[color-scheme:dark]"
                value={meetingFilters.timing}
                onChange={(e) =>
                  setMeetingFilters({
                    ...meetingFilters,
                    timing: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 dark:text-[#D6D6D6]">
                Status
              </label>
              <select
                className="w-full border rounded-md p-2 text-[12px] dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]"
                value={meetingFilters.status}
                onChange={(e) =>
                  setMeetingFilters({
                    ...meetingFilters,
                    status: e.target.value,
                  })
                }
              >
                <option value="">Select status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleResetMeetingFilters}
                className="px-3 py-1 text-[12px] rounded-md border border-[#576CBC] text-[#576CBC] font-medium hover:bg-[#EEF1FF] dark:hover:bg-[#343434]"
              >
                Reset
              </button>
              <button
                className="px-3 py-1 text-[12px] rounded-md bg-[#576CBC] text-white font-medium hover:bg-[#455bb1]"
                onClick={handleApplyMeetingFilters}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Details Modal */}
      {isMeetingDetailsModalOpen && selectedMeetingDetails && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <button
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMeetingDetailsModalOpen(false)}
          ></button>

          {/* Modal */}
          <div className="relative z-50 bg-white rounded-lg p-6 w-[720px] max-h-[90vh] overflow-y-auto shadow-xl dark:bg-[#252525]">
            {/* Close Button */}
            <button
              onClick={() => setIsMeetingDetailsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500  text-lg font-bold"
            >
              <IoMdClose />
            </button>
            <h2 className="text-md font-semibold text-[#0D0E25] mb-6 dark:text-[#fff]">
              Meeting Details
            </h2>

            {/* Grid Fields */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-[12px] text-[#0D0E25] mb-1 dark:text-[#fff]">
                  Meeting ID
                </label>
                <input
                  value={selectedMeetingDetails.meetingId}
                  disabled
                  className="w-full px-3 py-2 text-[12px] border border-[#D4D4D4] rounded-lg dark:text-[#D6D6D6] dark:border-[#5C5C5C] dark:bg-[#343434]"
                />
              </div>
              <div>
                <label className="block text-[12px] text-[#0D0E25] mb-1 dark:text-[#fff]">
                  Meeting Name
                </label>
                <input
                  value={selectedMeetingDetails.meetingName}
                  disabled
                  className="w-full px-3 py-2 text-[12px] border  border-[#D4D4D4] rounded-lg dark:text-[#D6D6D6] dark:border-[#5C5C5C] dark:bg-[#343434]"
                />
              </div>
              <div>
                <label className="block text-[12px] text-[#0D0E25] mb-1 dark:text-[#fff]">
                  Date
                </label>
                <input
                  value={selectedMeetingDetails.selectedDate}
                  disabled
                  className="w-full px-3 py-2 text-[12px] border border-[#D4D4D4] rounded-lg dark:text-[#D6D6D6] dark:border-[#5C5C5C] dark:bg-[#343434]"
                />
              </div>
              <div>
                <label className="block text-[12px] text-[#0D0E25] mb-1 dark:text-[#fff]">
                  Meeting Time
                </label>
                <input
                  value={`${selectedMeetingDetails.startTime} - ${selectedMeetingDetails.endTime}`}
                  disabled
                  className="w-full px-3 py-2 text-[12px] border border-[#D4D4D4] rounded-lg dark:text-[#D6D6D6] dark:border-[#5C5C5C] dark:bg-[#343434]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {isRescheduleModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50" />

          {/* Modal container */}
          <div className="bg-white rounded-lg p-6 w-[600px] relative z-50 shadow-xl dark:bg-[#252525]">
            <h2 className="text-[#0D0E25] text-md font-semibold mb-4 dark:text-[#fff]">
              Reason for Re-Schedule
            </h2>

            {/* Description */}
            <label className="block text-xs font-medium text-[#0D0E25] mb-1 dark:text-white">
              Add Description
            </label>
            <textarea
              className="w-full h-32 p-3 mb-6 border border-[#D9D9D9] rounded-md text-sm text-[#0D0E25] placeholder-[#9CA3AF] resize-none focus:outline-none dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white"
              placeholder="Type here..."
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
            />

            {/* Date and Time Row */}
            <div className="flex gap-4 mb-6">
              <div className="w-1/2">
                <label className="block text-xs font-medium text-[#0D0E25] mb-1 dark:text-white">
                  Reschedule Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full text-xs px-4 py-2 border border-[#D9D9D9] rounded-md text-[#0D0E25] focus:outline-none dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="w-1/2">
                <label className="block text-xs font-medium text-[#0D0E25] mb-1 dark:text-white">
                  Reschedule Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full text-sm px-4 py-2 border border-[#D9D9D9] rounded-md text-[#0D0E25] focus:outline-none dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white dark:[color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 border-t pt-4 dark:border-[#5C5C5C]">
              <button
                onClick={() => setIsRescheduleModalOpen(false)}
                className="px-6 py-2 rounded-md border border-[#576CBC] font-semibold text-[#576CBC] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleSubmit}
                className="px-6 py-2 rounded-md bg-[#576CBC] text-white font-semibold  transition"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <SuccessPopup onClose={() => setSuccess(false)} title="ReSchedule" />
      )}
      {failed && (
        <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
      )}
    </>
  );
};

export default TeacherFilter;
