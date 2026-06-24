"use client";

import React, { useEffect, useState } from "react";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Modal from "react-modal";
import Pagination from "@/components/Pagination";
import { IoMdClose } from "react-icons/io";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import { getSocket } from "@/app/utils/socket";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";

// Interfaces based on your API response
interface Teacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  attendee?: string; // Only present in teacher array under supervisor meetings
  _id?: string;
}

interface Supervisor {
  supervisorId: string;
  supervisorName: string;
  supervisorEmail: string;
}

interface Participant {
  studentId: string;
  studentName: string;
  studentEmail: string;
  _id: string;
}

interface StudentMeeting {
  teacher?: Teacher | Teacher[]; // Can be object or array
  supervisor?: Supervisor;
  _id: string;
  meetingId?: string;
  meetingName: string;
  participants?: Participant[];
  selectedDate: string;
  startTime: string;
  endTime: string;
  description?: string;
  meetingStatus?: string;
  meetingminutes?: string;
  duration?: string;
  status?: string;
  createdDate?: string;
  createdBy?: string;
  updatedDate?: string;
  updatedBy?: string;
  __v?: number;
}

interface MeetingApiResponse {
  totalCount: number;
  records: StudentMeeting[];
}

// Helper to get teacher name from object or array
const getTeacherName = (teacher: Teacher | Teacher[] | undefined): string => {
  if (!teacher) return "";
  if (Array.isArray(teacher)) {
    return teacher.map((t) => t.teacherName).join(", ");
  }
  return teacher.teacherName;
};

const ScheduledMeetings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [upcomingClasses, setUpcomingClasses] = useState<StudentMeeting[]>([]);
  const [completedData, setCompletedData] = useState<StudentMeeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<StudentMeeting[]>(
    []
  );

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
    useState<StudentMeeting | null>(null);
  const [isMeetingDetailsModalOpen, setIsMeetingDetailsModalOpen] =
    useState(false);

  useEffect(() => {
    Modal.setAppElement("body");

    const fetchClasses = async () => {
      try {
        const teacherId = localStorage.getItem("StudentPortalId");
        const token = localStorage.getItem("StudentAuthToken");
        if (!token || !teacherId) return;if (!token) {
  setFailedMessage(
    AppValidationMessages.AUTH.TOKEN_REQUIRED
  );
  setFailed(true);
  return;
}

if (!teacherId) {
  setFailedMessage(
    AppValidationMessages.AUTH.STUDENT_REQUIRED
  );
  setFailed(true);
  return;
}

        const response = await axios.get<MeetingApiResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TEACHERMEETING.GET_STUDENTMEETING_LIST}`,
          {
            params: { studentId: teacherId },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const meetings = response.data.records;
        const now = new Date();

        // Only show as upcoming if end time is in the future and not completed
        const upcoming = meetings.filter((m) =>
          ["Scheduled", "Rescheduled"].includes(m.meetingStatus || "")
        );

        // Show as completed if status is completed or end time is in the past
        const completed = meetings.filter(
          (m) => m.meetingStatus === "Completed"
        );

        setUpcomingClasses(upcoming);
        setCompletedData(completed);
      } catch (error) {
  setFailedMessage(
    AppFailureToastMessages.MEETING_FETCH
  );
  setFailed(true);
}
    };

    fetchClasses();
  }, []);
  useEffect(() => {
    const studentId =
      typeof window !== "undefined"
        ? localStorage.getItem("StudentPortalId")
        : null;
    if (!studentId) return;
    const socket = getSocket(studentId);
    const handleList = (data: StudentMeeting) => {
      console.log("log for new meeting WS");
      const participants = Array.isArray(data.participants)
        ? data.participants
        : [data.participants];
      const found = participants.find(
        (app) => app && app.studentId === studentId
      );
      if (found) {
        setUpcomingClasses((prev) =>
          prev.some((m) => m.meetingId === data.meetingId)
            ? prev
            : [...prev, data]
        );
      }
    };
    socket.on("teacherStudentMeeting", handleList);
    return () => {
      socket.off("teacherStudentMeeting", handleList);
    };
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
      const teacherName = getTeacherName(item.teacher).toLowerCase();
      const meetingName = item.meetingName?.toLowerCase() || "";
      const meetingId = item.meetingId?.toLowerCase() || "";
      return (
        meetingId.includes(query.toLowerCase()) ||
        meetingName.includes(query.toLowerCase()) ||
        teacherName.includes(query.toLowerCase())
      );
    });
    setFilteredMeetings(filtered);
    setCurrentPage(1);
  };

  // Filter logic
  const handleApplyMeetingFilters = () => {
    let filtered = [...dataToShow];
if (
  meetingFilters.fromDate &&
  meetingFilters.toDate &&
  new Date(meetingFilters.fromDate) >
    new Date(meetingFilters.toDate)
) {
  setFailedMessage(
    AppValidationMessages.FILTER.INVALID_DATE_RANGE
  );
  setFailed(true);
  return;
}
    if (meetingFilters.meetingName) {
      filtered = filtered.filter((m) =>
        m.meetingName
          .toLowerCase()
          .includes(meetingFilters.meetingName.toLowerCase())
      );
    }
    if (meetingFilters.teacher) {
      filtered = filtered.filter((m) =>
        getTeacherName(m.teacher)
          .toLowerCase()
          .includes(meetingFilters.teacher.toLowerCase())
      );
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
    setShowMeetingFilterModal(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMeetings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

 function handleRescheduleSubmit(
  event: React.MouseEvent<HTMLButtonElement>
) {

  if (!rescheduleReason.trim()) {
    setFailedMessage(
      AppValidationMessages.RESCHEDULE.REASON_REQUIRED
    );
    setFailed(true);
    return;
  }

  if (!rescheduleDate) {
    setFailedMessage(
      AppValidationMessages.RESCHEDULE.DATE_REQUIRED
    );
    setFailed(true);
    return;
  }

  if (!rescheduleTime) {
    setFailedMessage(
      AppValidationMessages.RESCHEDULE.TIME_REQUIRED
    );
    setFailed(true);
    return;
  }

  // API CALL HERE
}

  return (
    <>
      <div className="flex space-x-6 mt-4 px-4 py-2 rounded-md">
        <button
          className={`relative text-[14px] transition font-medium ${
            activeTab === "upcoming"
              ? "text-[#576CBC] font-semibold"
              : "text-[#0A0A12] dark:text-[#fff] opacity-80"
          }`}
          onClick={() => setActiveTab("upcoming")}
        >
          Scheduled ({upcomingClasses.length})
          {activeTab === "upcoming" && (
            <span className="absolute left-0 ml-5 -bottom-1 w-[60px] h-[2px] rounded-full bg-[#576CBC]" />
          )}
        </button>
        <button
          className={`relative text-[14px] transition font-medium ${
            activeTab === "completed"
              ? "text-[#576CBC] font-semibold"
              : "text-[#0A0A12] dark:text-[#fff] opacity-80"
          }`}
          onClick={() => setActiveTab("completed")}
        >
          Completed ({completedData.length})
          {activeTab === "completed" && (
            <span className="absolute left-0 ml-3 -bottom-1 w-[60px] h-[3px] rounded-full bg-[#576CBC]" />
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
                  <td className="px-3 py-2 text-[#3D8FDE] font-medium">
                    {item.meetingId}
                  </td>
                  <td className="px-3 py-2 text-[#17243E] dark:text-[#FDFDFD]">
                    {item.meetingName}
                  </td>
                  <td className="px-3 py-2 text-[#17243E] dark:text-[#FDFDFD]">
                    {new Date(item.selectedDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-3 py-2 text-left w-[180px] break-words whitespace-normal">
                    {item.startTime}
                  </td>
                  <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] w-[180px] break-words whitespace-normal">
                    <span
                      className={`px-2 text-[10px] text-center py-[3px] rounded-md ${
                        item.meetingStatus === "Scheduled"
                          ? "bg-[#ECFDF3] text-[#377E36] dark:bg-[#377E3633]"
                          : item.meetingStatus === "Rescheduled"
                          ? "bg-[#E4E4E4] text-[#343E59] dark:bg-[#DEDEDE]/20 dark:text-[#DEDEDE]"
                          : ""
                      }`}
                    >
                      {(item.meetingStatus || "UNKNOWN").toUpperCase()}
                    </span>
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
            <h2 className="text-lg font-semibold mb-4">Filter by</h2>
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
                  className="w-1/2 px-3 py-2 border rounded text-xs dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]  [&::-webkit-calendar-picker-indicator]:dark:invert"
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
                  className="w-1/2 px-3 py-2 border rounded text-xs dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]  [&::-webkit-calendar-picker-indicator]:dark:invert"
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
                className="w-full border rounded-md p-2 text-[12px] dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]  [&::-webkit-calendar-picker-indicator]:dark:invert"
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
                className="px-4 py-1 rounded-md border border-[#576CBC] text-[#576CBC] font-medium"
              >
                Reset
              </button>
              <button
                className="px-4 py-1 rounded-md bg-[#576CBC] text-white font-medium"
                onClick={handleApplyMeetingFilters}
              >
                Show {filteredMeetings.length} results
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
                  Duration
                </label>
                <input
                  value={selectedMeetingDetails.duration}
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

            {/* Attendance */}
            <div className="mb-6 rounded-xl overflow-hidden dark:bg-[#343434] text-white border ">
              <div className="flex justify-between items-center bg-[#576CBC] text-white px-6 py-3 text-sm font-semibold">
                <span>Name</span>
                <span>Attendance</span>
              </div>
              <div className="divide-y max-h-40 overflow-y-auto text-sm">
                <div className="flex justify-between items-center px-4 py-2">
                  <span className="text-[#4F46E5]">
                    {getTeacherName(selectedMeetingDetails.teacher)}
                  </span>
                </div>
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
                    className="w-full text-xs px-4 py-2 border border-[#D9D9D9] rounded-md text-[#0D0E25] focus:outline-none dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white"
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
                    className="w-full text-sm px-4 py-2 border border-[#D9D9D9] rounded-md text-[#0D0E25] focus:outline-none dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white"
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

export default ScheduledMeetings;
