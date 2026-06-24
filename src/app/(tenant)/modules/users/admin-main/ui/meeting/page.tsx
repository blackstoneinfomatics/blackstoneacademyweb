"use client";

import React, { useEffect, useRef, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { IoMdClose } from "react-icons/io";
import { useRouter } from "next/navigation";
import { FaEye, FaUserCircle } from "react-icons/fa";
import { CheckCircle, MoreVertical, Search, User, XCircle } from "lucide-react";
import BaseLayout3 from "@/app/(tenant)/modules/users/supervisor/components/BaseLayout3";
import axios from "axios";
import Pagination from "@/components/Pagination";
import { AiOutlineMenuUnfold } from "react-icons/ai";
import { IoPersonOutline } from "react-icons/io5";
import { MdTune } from "react-icons/md";
import { setTime } from "react-datepicker/dist/date_utils";
import { getSocket } from "@/app/utils/socket";
import AdminHeader from "../../components/AdminHeader";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";
import "react-toastify/dist/ReactToastify.css";
import SuccessPopup from "../../components/successPopup";
import FailedPopup from "../../components/failedPopup";
import NextMeetingSchedule from "../../components/NextMeetingSchedule";
import Modal from "react-modal";
import BaseLayout4 from "../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface ApiResponse {
  candidateFirstName: string;
  candidateLastName: string;
  positionApplied: string;
  _id: string;
  candidateEmail: string;
}

interface Meeting {
  _id: string;
  meetingId: string;
  meetingName: string;
  meetingStatus: "Scheduled" | "Rescheduled" | "Completed";
  selectedDate: string;
  startTime: string;
  endTime: string;
  duration: string;
  description: string;
  meetingminutes: string;
  createdDate: string;
  createdBy: string;
  supervisor: {
    supervisorId: string;
    supervisorName: string;
    supervisorEmail: string;
    supervisorRole: string;
  };
  teachers: {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
    attendee?: string;
  }[];
}

const Meetings = () => {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDatePickerOpens, setIsDatePickerOpens] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [completedData, setCompletedData] = useState<Meeting[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<Meeting[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [openTeacherDropdownId, setOpenTeacherDropdownId] = useState<string | null>(null);
  const [selectedMeetingDetails, setSelectedMeetingDetails] = useState<Meeting | null>(null);
  const [isMeetingDetailsModalOpen, setIsMeetingDetailsModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleEndTime, setRescheduleEndTime] = useState("");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    meetingName: "",
    teacherName: "",
    meetingStatus: "",
    fromDate: "",
    toDate: "",
  });

  const toggleTeacherDropdown = (id: string) => {
    setOpenTeacherDropdownId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenTeacherDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [teachers, setTeachers] = useState<
    {
      id: string;
      name: string;
      subject: string;
      email: string;
    }[]
  >([]);
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("AdminAuthToken") : null;

    if (!token) {
      console.error("❌ AdminAuthToken not found");
      return;
    }
    
    axios
      .get<{ totalCount: number; applicants: ApiResponse[] }>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.USER.GET_OTHER_EMPLOYEES}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        if (Array.isArray(response.data.applicants)) {
          const mappedTeachers = response.data.applicants.map((applicant) => ({
            id: applicant._id,
            name: `${applicant.candidateFirstName} ${applicant.candidateLastName}`,
            subject: applicant.positionApplied?.toLowerCase() || "unknown",
            email: applicant.candidateEmail || "no-email@example.com",
          }));
          setTeachers(mappedTeachers);
        } else {
          console.error("Unexpected API response format:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching teachers:", error));
  }, []);

  useEffect(() => {
    const id = typeof window !== "undefined" ? localStorage.getItem("AdminPortalID") : null;
    const socket = getSocket(id ?? "");
    const handleList = (data: { data: Meeting }) => {
      setUpcomingClasses((pre) => [...pre, data.data]);
    };
    socket.on("addmeeting", handleList);
    return () => {
      socket.off("addmeeting", handleList);
    };
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("AdminAuthToken") : null;

    if (!token) {
      console.error("❌ AdminAuthToken not found");
      return;
    }

    const fetchMeetings = async () => {
      try {
        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ADMIN_MEETING.GET_LIST}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const apiMeetings = response.data.data?.meetings || [];
        const groupedMeetings = apiMeetings.map((group: any) => {
          const firstRecord = group.records[0];
          return {
            _id: firstRecord._id,
            meetingId: group.meetingId,
            meetingName: firstRecord.meetingName,
            meetingStatus: firstRecord.meetingStatus,
            selectedDate: firstRecord.selectedDate,
            startTime: firstRecord.startTime,
            endTime: firstRecord.endTime,
            description: firstRecord.description,
            createdDate: firstRecord.createdDate,
            createdBy: firstRecord.createdBy,
            teachers: group.records.map((rec: any) => rec.teacher[0]),
            duration: firstRecord.duration || "",
            meetingminutes: firstRecord.meetingminutes || "",
          };
        });

        const upcomingMeetings = groupedMeetings
          .filter((meeting: any) => meeting.meetingStatus !== "Completed")
          .sort((a: any, b: any) => {
            const aDate = new Date(a.selectedDate);
            const bDate = new Date(b.selectedDate);
            const aStartTimeStr = Array.isArray(a.startTime) ? a.startTime[0] : a.startTime;
            const bStartTimeStr = Array.isArray(b.startTime) ? b.startTime[0] : b.startTime;
            const [aH, aM] = aStartTimeStr.split(":").map(Number);
            const [bH, bM] = bStartTimeStr.split(":").map(Number);
            aDate.setHours(aH, aM, 0, 0);
            bDate.setHours(bH, bM, 0, 0);
            return aDate.getTime() - bDate.getTime();
          });

        const completedMeetings = groupedMeetings.filter(
          (meeting: any) => meeting.meetingStatus === "Completed"
        );

        setUpcomingClasses(upcomingMeetings);
        setCompletedData(completedMeetings);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };

    fetchMeetings();
  }, []);

  // Filter logic implementation
  const dataToShow = activeTab === "upcoming" ? upcomingClasses : completedData;

  useEffect(() => {
    setFilteredMeetings(dataToShow);
    setSearchQuery("");
    setCurrentPage(1);
  }, [activeTab, upcomingClasses, completedData]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const lowerQuery = query.toLowerCase();

    const filtered = dataToShow.filter((item) => {
      const combinedFields = [
        item._id,
        item.meetingName,
        item.meetingStatus,
        item.selectedDate,
        item.startTime,
        item.endTime,
        item.description,
        item.createdBy,
        ...(item.teachers || []).map((t) => t.teacherName),
      ]
        .map((v) => (v ? String(v).toLowerCase() : ""))
        .join(" ");

      return combinedFields.includes(lowerQuery);
    });

    setFilteredMeetings(filtered);
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    const latestDataToShow = activeTab === "upcoming" ? upcomingClasses : completedData;
    let filtered = [...latestDataToShow];

    if (filters.meetingName) {
      filtered = filtered.filter((m) =>
        m.meetingName?.toLowerCase().includes(filters.meetingName.toLowerCase())
      );
    }

    if (filters.teacherName) {
      filtered = filtered.filter((m) =>
        m.teachers.some((t) =>
          t.teacherName?.toLowerCase().includes(filters.teacherName.toLowerCase())
        )
      );
    }

    if (filters.meetingStatus) {
      filtered = filtered.filter(
        (m) =>
          m.meetingStatus?.toLowerCase() === filters.meetingStatus.toLowerCase()
      );
    }

    if (filters.fromDate && filters.toDate) {
      const from = new Date(filters.fromDate);
      const to = new Date(filters.toDate);
      filtered = filtered.filter((m) => {
        const date = new Date(m.selectedDate);
        return date >= from && date <= to;
      });
    }

    setFilteredMeetings(filtered);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      meetingName: "",
      teacherName: "",
      meetingStatus: "",
      fromDate: "",
      toDate: "",
    });
    const latestDataToShow = activeTab === "upcoming" ? upcomingClasses : completedData;
    setFilteredMeetings(latestDataToShow);
    setIsFilterModalOpen(false);
  };

  const teacherNames = Array.from(
    new Set(
      dataToShow.flatMap((m) => m.teachers.map((t) => t.teacherName))
    )
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMeetings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage);

  const handleRescheduleSubmit = async () => {
    if (
      !rescheduleDate ||
      !rescheduleTime ||
      !rescheduleEndTime ||
      !rescheduleReason ||
      !selectedItemId
    ) {
      toast.error(AppValidationMessages.MEETING.FILL_ALL_FIELDS);
      return;
    }

    const endTime = rescheduleEndTime;
    if (!endTime) {
      toast.error(AppValidationMessages.MEETING.END_TIME_REQUIRED);
      return;
    }

    try {
      const token = localStorage.getItem("AdminAuthToken");
      const selectedMeeting = upcomingClasses.find(
        (m) => m._id === selectedItemId
      );
      const meetingIdToSend = selectedMeeting?.meetingId;
      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ADMIN_MEETING.UPDATE}/${meetingIdToSend}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            selectedDate: rescheduleDate,
            startTime: rescheduleTime,
            endTime: rescheduleEndTime,
            description: rescheduleReason,
            meetingStatus: "Rescheduled",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Backend error:", result);
        throw new Error(result.message || "Failed to update meeting");
      }

      setSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setIsRescheduleModalOpen(false);
        setRescheduleReason("");
      }, 2000);
    } catch (error) {
      console.error("Error during rescheduling:", error);
      toast.error(AppFailureToastMessages.MEETING_RESCHEDULE);
    }
  };

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const getMeetingStatusClass = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "text-[#377E36] bg-[#ECFDF3] dark:bg-[#323E31] dark:text-[#377E36] px-[18px]";
      case "Rescheduled":
        return "text-[#343E59] bg-[#E4E4E4] dark:bg-[#4F4F4F] dark:text-white";
      default:
        return "text-[#377E36] bg-[#ECFDF3]";
    }
  };

  const handleViewDetails = (meetingId: string) => {
    const meeting = completedData.find((m) => m._id === meetingId);
    if (meeting) {
      setSelectedMeetingDetails(meeting);
      setIsMeetingDetailsModalOpen(true);
    } else {
      console.error("Meeting not found for ID:", meetingId);
    }
  };

  const isStartMeetingNow = (
    selectedDate: string,
    startTime: string,
    endTime: string
  ): boolean => {
    const now = new Date();
    const date = new Date(selectedDate);

    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const start = new Date(date);
    start.setHours(startHour, startMin, 0, 0);

    const end = new Date(date);
    end.setHours(endHour, endMin, 0, 0);

    return now >= start && now <= end;
  };

  return (
    <BaseLayout4>
      <div className="">
        <AdminHeader currentSection="Meetings" />
        <div className="md:p-0 mx-auto">
          <NextMeetingSchedule />

          <div className="h-full w-full  flex flex-col justify-between">
            <div className="p-0 justify-between flex flex-col">
              <div
                className={`${
                  isRescheduleModalOpen ? "blur-sm" : ""
                } transition-all duration-200`}
              >
                {/* Tabs */}
                <div className="flex space-x-6  px-4 py-4 rounded-md">
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
                      <span className="absolute left-0 ml-5 -bottom-1 w-[60px] h-[2px] rounded-full bg-[#576CBC] dark:text-[#576CBC]" />
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

                <div className="w-full h-[610px] bg-[#FAFAFB] rounded-lg dark:bg-[#343434] mt-2">
                  <div className="flex justify-between items-center px-3 py-0 rounded-md dark:bg-[#343434]">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by keyword"
                        className="bg-transparent outline-none text-[15px] w-52 py-3 "
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                    </div>

                    <div
                      className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
                      onClick={() => setIsFilterModalOpen(true)}
                    >
                      <MdTune className="w-4 h-4" />
                      <span>Filter</span>
                    </div>

                    <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                      <span className="text-left -ml-60 ">
                        Showing {currentItems.length} Of {filteredMeetings.length}
                      </span>
                    </div>
                  </div>

                  <table
                    className="table-auto xw-full"
                    style={{ width: "100%", tableLayout: "fixed" }}
                  >
                    <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                      <tr className="font-medium">
                        <th className="text-left px-4 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0] w-[180px] break-words whitespace-normal">
                          Meeting ID
                        </th>
                        <th className="text-left px-4 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0] w-[250px] break-words whitespace-normal">
                          Meeting Name
                        </th>
                        <th className="text-left px-4 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                          Attendees
                        </th>
                        <th className="text-left px-4 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                          Date
                        </th>
                        <th className="text-left px-4 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0] ">
                          Timing
                        </th>
                        <th className="text-left px-4 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                          Status
                        </th>
                        <th className="text-left px-4 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((item, index) => (
                        <tr
                          key={item._id}
                          className={`text-[12px] ${
                            index % 2 === 0
                              ? "bg-[#fff] dark:bg-[#2C2C2C]"
                              : "bg-[#F8F8F8] dark:bg-[#303030]"
                          }`}
                        >
                          <td className="px-3 py-2 text-[#3D8FDE] font-medium text-left w-[180px] break-words whitespace-normal">
                            {item._id}
                          </td>
                          <td className="px-3 py-2 text-[#17243E] dark:text-[#FDFDFD] text-left w-[250px] break-words whitespace-normal">
                            {item.meetingName}
                          </td>
                          <td className="px-3 py-2 text-left text-[#17243E] dark:text-[#FDFDFD]">
                            <div className="relative">
                              {item.teachers?.length > 1 ? (
                                <>
                                  <button
                                    onClick={() =>
                                      toggleTeacherDropdown(item._id)
                                    }
                                    className="flex items-center gap-2 font-medium hover:text-[#5c5c5c] dark:hover:text-[#5c5c5c]"
                                  >
                                    <AiOutlineMenuUnfold />
                                    View List
                                  </button>
                                  {openTeacherDropdownId === item._id && (
                                    <div className="absolute z-10 mt-2 w-48 bg-white rounded shadow-lg p-2 dark:bg-[#343434]">
                                      {item.teachers.map((teacher, idx) => (
                                        <div
                                          key={idx}
                                          className="py-1 text-[#17243E] dark:text-[#FDFDFD]"
                                        >
                                          <span className="flex items-center gap-2">
                                            <IoPersonOutline />
                                            {teacher.teacherName}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <span className="flex items-center gap-2 font-medium">
                                  <IoPersonOutline />
                                  {item.teachers?.length > 0
                                    ? item.teachers[0].teacherName
                                    : "No teacher assigned"}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-[#17243E] dark:text-[#FDFDFD] text-left">
                            {new Date(item.selectedDate)
                              .toLocaleDateString("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                              })
                              .replace(",", ",")}{" "}
                          </td>
                          <td className="px-3 py-2 text-[#17243E] dark:text-[#FDFDFD] text-left w-[80px] break-words whitespace-normal">
                            {item.startTime}
                          </td>

                          <td className="px-3 py-2 text-left">
                            {(() => {
                              let content;

                              if (activeTab === "upcoming") {
                                if (
                                  isStartMeetingNow(
                                    item.selectedDate,
                                    item.startTime,
                                    item.endTime
                                  )
                                ) {
                                  content = (
                                    <button
                                      className="text-[10px] font-semibold px-[11px] py-1 rounded-lg bg-[#576cbc] text-white border  "
                                      onClick={() =>
                                        router.push(
                                          `/modules/users/admin-main/ui/livemeeting?meetingId=${item.meetingId}`
                                        )
                                      }
                                    >
                                      Start Meeting
                                    </button>
                                  );
                                } else {
                                  content = (
                                    <span
                                      className={`text-[10px] font-semibold px-3 py-1 rounded-lg ${getMeetingStatusClass(
                                        item.meetingStatus
                                      )}`}
                                    >
                                      {item.meetingStatus}
                                    </span>
                                  );
                                }
                              } else {
                                content = (
                                  <span className="text-[10px] font-semibold px-3 py-1 rounded-lg bg-[#ECFDF3] text-[#377E36] dark:bg-[#2E3D2E] dark:text-[#377E36]">
                                    {item.meetingStatus}
                                  </span>
                                );
                              }

                              return content;
                            })()}
                          </td>

                          <td className="px-3 py-2 text-left w-[80px] break-words whitespace-normal">
                            <div className="relative">
                              <button
                                onClick={() => {
                                  if (item.meetingStatus === "Scheduled") {
                                    setIsDetailsModalOpen(true);
                                    setSelectedItemId((prev) =>
                                      prev === item._id ? null : item._id
                                    );
                                  } else if (
                                    item.meetingStatus === "Completed"
                                  ) {
                                    handleViewDetails(item._id);
                                  }
                                }}
                                className="p-2 rounded-md"
                              >
                                {item.meetingStatus === "Scheduled" ||
                                item.meetingStatus === "Rescheduled" ? (
                                  <MoreVertical className="w-4 h-4 text-slate-600 dark:text-[#FDFDFD]" />
                                ) : (
                                  <FaEye className="w-4 h-4 text-slate-600 dark:text-[#FDFDFD]" />
                                )}
                              </button>

                              {item.meetingStatus === "Scheduled" &&
                                isDetailsModalOpen &&
                                selectedItemId === item._id && (
                                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                                    <button
                                      onClick={() => {
                                        setIsRescheduleModalOpen(true);
                                        setSelectedItemId(item._id);
                                        setSelectedMeetingDetails(item);
                                        setIsDetailsModalOpen(false);
                                      }}
                                      className="block w-full px-4 py-2 text-left text-[12px] text-slate-600"
                                    >
                                      Request Reschedule
                                    </button>
                                    <button
                                      onClick={() => setSelectedItemId(null)}
                                      className="block w-full px-4 py-2 text-left text-[12px] text-red-600 hover:bg-gray-50"
                                    >
                                      Cancel
                                    </button>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onRequestClose={() => setIsFilterModalOpen(false)}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 rounded-xl bg-white dark:bg-[#343434] w-[650px]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-40"
      >
        <div>
          <h2 className="text-[16px] font-semibold mb-6 text-[#2D2D2D] dark:text-white">
            Filter by
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-[#444] dark:text-white mb-1 block">
                Teacher
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-[#343434] text-[#5C5C5C] dark:text-white dark:border-[#5C5C5C]"
                value={filters.teacherName}
                onChange={(e) =>
                  setFilters({ ...filters, teacherName: e.target.value })
                }
              >
                <option value="">Select Teacher</option>
                {teacherNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#444] dark:text-white mb-1 block">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-[#343434] text-[#5C5C5C] dark:text-white dark:border-[#5C5C5C]"
                value={filters.meetingStatus}
                onChange={(e) =>
                  setFilters({ ...filters, meetingStatus: e.target.value })
                }
              >
                <option value="">Select Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Rescheduled">Rescheduled</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#444] dark:text-white mb-1 block">
                From Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-lg text-sm 
                text-[#5C5C5C] dark:text-white 
                bg-white dark:bg-[#343434] 
                border-gray-300 dark:border-[#5C5C5C]
                [&::-webkit-calendar-picker-indicator]:dark:invert"
                value={filters.fromDate}
                onChange={(e) =>
                  setFilters({ ...filters, fromDate: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#444] dark:text-white mb-1 block">
                To Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-lg text-sm 
                text-[#5C5C5C] dark:text-white 
                bg-white dark:bg-[#343434] 
                border-gray-300 dark:border-[#5C5C5C]
                [&::-webkit-calendar-picker-indicator]:dark:invert"
                value={filters.toDate}
                onChange={(e) =>
                  setFilters({ ...filters, toDate: e.target.value })
                }
              />
            </div>
        
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleResetFilters}
              className="px-5 py-2 border border-[#576CBC] text-[#576CBC] bg-white rounded-lg text-sm font-medium hover:bg-[#f6f8ff]"
            >
              Reset
            </button>
            <button
              onClick={() => {
                handleApplyFilters();
                setIsFilterModalOpen(false);
              }}
              className="px-5 py-2 bg-[#576CBC] text-white rounded-lg text-sm font-medium hover:bg-[#475ab1]"
            >
              Show {filteredMeetings.length} results
            </button>
          </div>
        </div>
      </Modal>

      {/* MeetingDetails Modal */}
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
                  value={selectedMeetingDetails.duration} // You can compute actual difference if needed
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
                {selectedMeetingDetails.teachers.map((teacher, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center px-4 py-2"
                  >
                    <span className="text-[#4F46E5]">
                      {teacher.teacherName}
                    </span>
                    <span
                      className={`text-lg ${
                        teacher.attendee === "present"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {teacher.attendee === "present" ? "✔" : "✘"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-[12px] text-[#0D0E25] mb-1 dark:text-[#fff]">
                Meeting Description
              </label>
              <textarea
                value={selectedMeetingDetails.meetingminutes}
                disabled
                className="w-full px-3 py-2 text-[12px] border border-[#D4D4D4] rounded-lg dark:text-[#D6D6D6] dark:border-[#5C5C5C] dark:bg-[#343434]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
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
              <div className="w-1/3">
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

              <div className="w-1/3">
                <label className="block text-xs font-medium text-[#0D0E25] mb-1 dark:text-white">
                  Reschedule Start Time
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

              <div className="w-1/3">
                <label className="block text-xs font-medium text-[#0D0E25] mb-1 dark:text-white">
                  Reschedule End Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={rescheduleEndTime}
                    onChange={(e) => setRescheduleEndTime(e.target.value)}
                    className="w-full text-sm px-4 py-2 border border-[#D9D9D9] rounded-md text-[#0D0E25] focus:outline-none dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 border-t pt-4 dark:border-[#5C5C5C]  ">
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
    </BaseLayout4>
  );
};

export default Meetings;


