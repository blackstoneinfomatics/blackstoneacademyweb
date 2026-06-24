"use client";

import React, { useEffect, useRef, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { IoMdClose } from "react-icons/io";
import { useRouter } from "next/navigation";
import { FaEye, FaUserCircle } from "react-icons/fa";
import { CheckCircle, MoreVertical, Search, User, XCircle } from "lucide-react";
import BaseLayout3 from "@/app/(tenant)/modules/users/supervisor/components/BaseLayout3";
import axios from "axios";
import SupervisorHeader from "../../components/supervisorHeader";
import Pagination from "@/components/Pagination";
import { AiOutlineMenuUnfold } from "react-icons/ai";
import { IoPersonOutline } from "react-icons/io5";
import { MdTune } from "react-icons/md";
import SuccessPopup from "../../components/successPopup";
import FailedPopup from "../../components/failedPopup";
import { setTime } from "react-datepicker/dist/date_utils";
import { getSocket } from "@/app/utils/socket";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface ApiResponse {
  candidateFirstName: string;
  candidateLastName: string;
  positionApplied: string;
  _id: string;
  candidateEmail: string;
}

interface Teacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  attendee?: string;
  participantName?: string;
  name?: string;
  participantEmail?: string;
  email?: string;
}
interface Attendee {
  id?: string;

  teacherId?: string;
  teacherName?: string;
  teacherEmail?: string;

  participantId?: string;
  participantName?: string;
  participantEmail?: string;

  name?: string;
  email?: string;

  attendee?: string;
}

interface BaseMeeting {
  _id: string;
  meetingName: string;
  meetingId: string;
  selectedDate: string;
  startTime: string;
  endTime: string;
  description?: string;
  meetingminutes?: string;
  meetingStatus: "Completed" | "Scheduled" | "Pending" | string;
  duration?: string;
  status: "Active" | "Inactive" | string;
  createdDate: string;
  createdBy: string;
  updatedDate?: string;
  updatedBy?: string;
  __v?: number;

  // ✅ ADD THESE TWO
  teacher?: Teacher[];
  participants?: Teacher[];

  supervisor?: {
    supervisorId: string;
    supervisorName: string;
    supervisorEmail: string;
  };

  admin?: {
    adminId: string;
    adminName: string;
    adminEmail: string;
    adminRole: string;
  };
}

interface Meeting extends BaseMeeting {
  type: "regular";
  teacher: Teacher[];
}

interface GroupedMeeting extends BaseMeeting {
  type: "grouped";
  attendees: Attendee[];
}

type AnyMeeting = Meeting | GroupedMeeting;

const ScheduledClasses = () => {
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [completedData, setCompletedData] = useState<Meeting[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<Meeting[]>([]);
  const [groupedMeetings, setGroupedMeetings] = useState<GroupedMeeting[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [openTeacherDropdownId, setOpenTeacherDropdownId] = useState<
    string | null
  >(null);
  const [selectedMeetingDetails, setSelectedMeetingDetails] =
    useState<Meeting | null>(null);
  const [isMeetingDetailsModalOpen, setIsMeetingDetailsModalOpen] =
    useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [timing, setTiming] = useState("");
  const [status, setStatus] = useState("");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [teachers, setTeachers] = useState<
    { id: string; name: string; subject: string; email: string }[]
  >([]);
  // Enhanced type guard functions
  const isGroupedMeeting = (item: AnyMeeting): item is GroupedMeeting => {
    return item.type === "grouped" && "attendees" in item;
  };

  const isRegularMeeting = (item: AnyMeeting): item is Meeting => {
    return item.type === "regular" && "teacher" in item;
  };

  // Safe teacher access helper functions
  const getTeacherName = (teacher: any): string => {
    if (!teacher || typeof teacher !== "object") return "No teacher";

    // Handle array case
    if (Array.isArray(teacher)) {
      return teacher[0]?.teacherName || "No teacher";
    }

    // Handle single object case
    return teacher.teacherName || "No teacher";
  };

  const getTeacherArray = (teacher: any): Teacher[] => {
    console.log("getTeacherArray - raw teacher:", teacher);

    if (!teacher) {
      console.warn("getTeacherArray - teacher is null/undefined");
      return [];
    }

    if (Array.isArray(teacher) && teacher.length > 0) {
      console.log(
        "getTeacherArray - teacher is non-empty array, length:",
        teacher.length,
      );
      return teacher;
    }

    if (Array.isArray(teacher) && teacher.length === 0) {
      console.warn("getTeacherArray - teacher is empty array");
      return [];
    }

    if (typeof teacher === "object" && teacher.teacherName) {
      console.log("getTeacherArray - teacher is single object");
      return [teacher];
    }

    console.warn("getTeacherArray - teacher is in unexpected format");
    return [];
  };

  // Group meetings function

  const groupMeetingsByMeetingId = (meetings: any[]): GroupedMeeting[] => {
    const map = new Map<string, any>();

    meetings.forEach((meeting) => {
      if (!meeting.meetingId) return; // safety check

      const id = meeting.meetingId;

      let attendees: any[] = [];

      // From teacher
      if (Array.isArray(meeting.teacher)) {
        attendees = meeting.teacher;
      } else if (meeting.teacher) {
        attendees = [meeting.teacher];
      }

      // From participants
      if (Array.isArray(meeting.participants)) {
        attendees = attendees.concat(meeting.participants);
      } else if (meeting.participants) {
        attendees.push(meeting.participants);
      }

      // If already exists → merge
      if (map.has(id)) {
        const existing = map.get(id);

        existing.attendees.push(...attendees);
      }
      // New meeting
      else {
        map.set(id, {
          ...meeting,
          type: "grouped", // ✅ important
          attendees: [...attendees],
        });
      }
    });

    // ✅ Remove duplicate attendees
    const result = Array.from(map.values()).map((meeting) => {
      const unique = new Map<string, any>();

      meeting.attendees.forEach((p: any) => {
        const key = p.teacherId || p.participantId || p.email || p.name;

        if (key) {
          unique.set(key, p);
        }
      });

      return {
        ...meeting,
        type: "grouped", // ensure type
        attendees: Array.from(unique.values()),
      };
    });

    return result;
  };

  const filterMeetingsBySearch = (meetings: any[]) => {
    if (!searchText.trim()) return meetings;

    const searchLower = searchText.toLowerCase();
    return meetings.filter((meeting) => {
      const nameMatch = meeting.meetingName.toLowerCase().includes(searchLower);
      const dateMatch = new Date(meeting.selectedDate)
        .toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
        .toLowerCase()
        .includes(searchLower);
      const timingMatch = meeting.startTime.toLowerCase().includes(searchLower);
      const statusMatch = meeting.meetingStatus
        .toLowerCase()
        .includes(searchLower);

      return nameMatch || dateMatch || timingMatch || statusMatch;
    });
  };
  // Get combined data for display
  const getDataToShow = (): AnyMeeting[] => {
    if (activeTab === "upcoming") {
      return groupedMeetings.filter(
        (m) =>
          m.meetingStatus === "Scheduled" || m.meetingStatus === "Rescheduled",
      );
    }

    return groupedMeetings.filter((m) => m.meetingStatus === "Completed");
  };

  const dataToShowUnfiltered = getDataToShow();
  console.log(
    "getDataToShow - unfiltered data (before search filter):",
    dataToShowUnfiltered,
  );

  const dataToShow = filterMeetingsBySearch(dataToShowUnfiltered);
  console.log("getDataToShow - dataToShow after search filter:", dataToShow);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dataToShow.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(dataToShow.length / itemsPerPage);

  const isAutoMeeting = (item: AnyMeeting) =>
    item.meetingName?.toLowerCase().includes("auto-scheduled");

  const toggleTeacherDropdown = (id: string) => {
    setOpenTeacherDropdownId((prev) => {
      const next = prev === id ? null : id;
      console.log("toggleTeacherDropdown - clicked id:", id, "next:", next);
      return next;
    });
  };

  const getAttendees = (item: AnyMeeting): Attendee[] => {
    // Grouped meeting → use attendees
    if ("attendees" in item && Array.isArray(item.attendees)) {
      return item.attendees;
    }

    // Regular meeting → use teacher
    if ("teacher" in item && Array.isArray(item.teacher)) {
      return item.teacher;
    }

    return [];
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenTeacherDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("SupervisorAuthToken")
        : null;

if (!token) {
  setFailed(true);
  setFailedMessage(
    "Session expired. Please login again."
  );
  return;
}

    axios
      .get<{ totalCount: number; applicants: ApiResponse[] }>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.APPLICANTS.GET_LIST}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
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
        }
      })
      .catch((error) => console.error("Error fetching teachers:", error));
  }, []);

  useEffect(() => {
    const id =
      typeof window !== "undefined"
        ? localStorage.getItem("SupervisorPortalID")
        : null;
    const socket = getSocket(id ?? "");
    if (!socket) {
  setFailed(true);
  setFailedMessage("Socket connection failed");
  return;
}
    const handleList = (data: { data: Meeting }) => {
      console.log("📩 Received WebSocket Data:", data);
      setUpcomingClasses((prev) => {
        const newMeeting = { ...data.data, type: "regular" as const };
        const updated = [...prev, newMeeting];

        const grouped = groupMeetingsByMeetingId(updated);
        setGroupedMeetings(grouped);

        const groupedIds = grouped.map((g) => g.meetingId);

        return updated.filter((m) => !groupedIds.includes(m.meetingId));
      });
    };
    socket.on("addmeeting", handleList);
    return () => {
      socket.off("addmeeting", handleList);
    };
  }, []);

  useEffect(() => {
    const fetchMeetings = async () => {
      const supervisorId = "67a467bcc346aaaea402f760";
      const token = localStorage.getItem("SupervisorAuthToken");

      if (!token) {
        console.error("❌ SupervisorAuthToken not found");
        return;
      }

      try {
        console.log("fetchMeetings - starting fetch");

        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MEETING.GET_SUPERVISOR_MEETING}?supervisorId=${supervisorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log(
          "fetchMeetings - raw API meetings:",
          response.data.meetings,
        );

        const allMeetings: Meeting[] = response.data.meetings.map(
          (meeting: any, idx: number) => {
            let teachers: Teacher[] = [];

            // ✅ From teacher (auto + manual)
            if (Array.isArray(meeting.teacher)) {
              teachers = teachers.concat(meeting.teacher);
            } else if (meeting.teacher) {
              teachers.push(meeting.teacher);
            }

            // ✅ From participants (manual + auto)
            if (Array.isArray(meeting.participants)) {
              teachers = teachers.concat(meeting.participants);
            } else if (meeting.participants) {
              teachers.push(meeting.participants);
            }

            const normalized: Meeting = {
              ...meeting,
              type: "regular" as const,

              teacher: (teachers || []).map((t: any) => ({
                id: t._id || "",

                teacherId: t.teacherId,
                teacherName: t.teacherName,

                participantId: t.participantId,
                participantName: t.participantName,

                teacherEmail: t.teacherEmail,
                participantEmail: t.participantEmail,

                name: t.name,
                email: t.email,

                attendee: t.attendee,
              })),
            };

            return normalized;
          },
        );

        const grouped = groupMeetingsByMeetingId(allMeetings);

        // ✅ HANDLE AUTO-SCHEDULED MEETINGS
        const autoMeetingsRaw = response.data.groupedAutoMeetings || [];
        console.log("fetchMeetings - autoMeetingsRaw:", autoMeetingsRaw);

        const autoMeetings: GroupedMeeting[] = autoMeetingsRaw.map((m: any) => {
          // Parse date from "Auto-Scheduled Meeting on Thu Jan 15 2026"
          let dateStr = "";
          try {
            const parts = m.meetingName.split(" on ");
            if (parts.length > 1) {
              dateStr = new Date(parts[1]).toISOString();
            } else {
              dateStr = new Date().toISOString(); // Fallback
            }
          } catch (e) {
            console.error("Error parsing date from:", m.meetingName, e);
            dateStr = new Date().toISOString();
          }

          return {
            _id: m.meetingId || `auto-${Math.random()}`, // Auto meetings might not have _id in the same way
            meetingName: m.meetingName,
            meetingId: m.meetingId,
            selectedDate: dateStr,
            startTime: "10:00", // Default or extract if possible
            endTime: "10:30",
            description: "System Generated",
            meetingStatus: "Scheduled",
            status: "Active",
            createdDate: new Date().toISOString(),
            createdBy: "System",
            type: "grouped" as const,
            attendees: (m.participants || []).map((p: any) => ({
              teacherId: p.teacherId,
              teacherName: p.teacherName,
              teacherEmail: p.teacherEmail,
              attendee: "scheduled", // Default status
              // Map other fields as needed to match Attendee interface
            })),
          };
        });

        console.log("fetchMeetings - processed autoMeetings:", autoMeetings);

        // ✅ Merge both
        const finalGrouped = [...grouped, ...autoMeetings];

        console.log("fetchMeetings - final merged meetings:", finalGrouped);

        // ✅ single source of truth
        setGroupedMeetings(finalGrouped);
      } catch (error: any) {
  console.error("Error fetching meetings:", error);

  setFailed(true);
  setFailedMessage(
    error?.response?.data?.message ||
    "Unable to load meetings"
  );
}
    };

    fetchMeetings();
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplicants = currentItems;

  const handleRescheduleSubmit = async () => {
  if (
  !rescheduleReason.trim() ||
  !rescheduleDate ||
  !rescheduleTime ||
  !selectedItemId
) {
  setFailed(true);
  setFailedMessage(
    "Please fill all required fields"
  );
  return;
}

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MEETING.GET_SUPERVISOR_MEET}/${selectedItemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            selectedDate: rescheduleDate,
            startTime: rescheduleTime,
            description: rescheduleReason,
            meetingStatus: "Rescheduled",
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update meeting");
      }

      setUpcomingClasses((prevClasses) =>
        prevClasses.map((item) =>
          item._id === selectedItemId
            ? {
              ...item,
              meetingStatus: "Rescheduled" as Meeting["meetingStatus"],
            }
            : item,
        ),
      );

      setSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsRescheduleModalOpen(false);
        setRescheduleReason("");
      }, 2000);
    } catch (error: any) {
  console.error(
    "Error during rescheduling:",
    error
  );

  setFailed(true);
  setFailedMessage(
    error?.response?.data?.message ||
    "Unable to reschedule meeting"
  );
}
  };

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
    // Only allow viewing details in completed tab
    if (activeTab !== "completed") {
      return; // Don't do anything if not in completed tab
    }

    // Search in the combined data that's currently being displayed
    const meeting = dataToShow.find((m) => {
      if (isRegularMeeting(m)) {
        return m._id === meetingId;
      } else if (isGroupedMeeting(m)) {
        return m._id === meetingId;
      }
      return false;
    });

    if (meeting) {
      // For grouped meetings, we need to convert them to the Meeting type for the modal
      if (isGroupedMeeting(meeting)) {
        // Convert GroupedMeeting to Meeting format for the modal
        const meetingForModal: Meeting = {
          ...meeting,
          type: "regular",
          teacher: (meeting.attendees || []).map((att) => ({
            teacherId: att.teacherId || att.id || "",
            teacherName: att.teacherName || att.name || "",
            teacherEmail: att.teacherEmail || att.email || "",
            participantName: att.participantName,
            name: att.name,
            participantEmail: att.participantEmail,
            email: att.email,
            attendee: att.attendee,
          })),
        };
        setSelectedMeetingDetails(meetingForModal);
      } else {
        setSelectedMeetingDetails(meeting);
      }
      setIsMeetingDetailsModalOpen(true);
    } else {
      console.error("Meeting not found for ID:", meetingId);
    }
  };

  const isStartMeetingNow = (
    selectedDate: string,
    startTime: string,
    endTime: string,
  ): boolean => {
    try {
      const now = new Date();

      const dateOnly = selectedDate.split("T")[0]; // YYYY-MM-DD

      const start = new Date(`${dateOnly}T${startTime}:00`);
      const end = new Date(`${dateOnly}T${endTime}:00`);

      return now >= start && now <= end;
    } catch {
      return false;
    }
  };

  const handleFilter = async () => {
    setShowModal(false);
    const token = localStorage.getItem("SupervisorAuthToken");

    const params: any = {};
    if (fromDate) params["dateRange.from"] = fromDate;
    if (toDate) params["dateRange.to"] = toDate;
    if (timing) params["startTime"] = timing;
    if (status) params["meetingStatus"] = status;

    try {
      const response = await axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MEETING.GET_SUPERVISOR_MEETING}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params,
      });

      // 1️⃣ Normalize API data
      const meetings: Meeting[] = (response.data.meetings || []).map(
        (meeting: any) => {
          let attendees: any[] = [];

          // From teacher
          if (Array.isArray(meeting.teacher)) {
            attendees = attendees.concat(meeting.teacher);
          } else if (meeting.teacher) {
            attendees.push(meeting.teacher);
          }

          // From participants
          if (Array.isArray(meeting.participants)) {
            attendees = attendees.concat(meeting.participants);
          } else if (meeting.participants) {
            attendees.push(meeting.participants);
          }

          return {
            ...meeting,
            type: "regular" as const,

            // ✅ Unified field
            teacher: attendees.map((t: any) => ({
              teacherId: t.teacherId || "",
              participantId: t.participantId || "",

              teacherName: t.teacherName || "",
              participantName: t.participantName || "",

              teacherEmail: t.teacherEmail || "",
              participantEmail: t.participantEmail || "",

              name: t.name || "",
              email: t.email || "",

              attendee: t.attendee,
            })),
          };
        },
      );

      const grouped = groupMeetingsByMeetingId(meetings);

      // ✅ Store only grouped
      setGroupedMeetings(grouped);

      // ✅ No need separate states anymore
    } catch (error: any) {
  console.error(
    "❌ Error fetching filtered meetings:",
    error
  );

  setFailed(true);
  setFailedMessage(
    error?.response?.data?.message ||
    "Unable to apply filters"
  );
}
  };

  return (
    <BaseLayout3>
      <div className="">
        <SupervisorHeader currentSection="Scheduled Meetings" />
        <div className="md:p-0 mx-auto">
          <div className="h-full w-full flex flex-col justify-between">
            <div className="p-0 justify-between flex flex-col">
              <div
                className={`${isRescheduleModalOpen ? "blur-sm" : ""
                  } transition-all duration-200`}
              >
                {/* Tabs */}
                <div className="flex space-x-6 px-4 py-2 rounded-md">
                  <button
                    className={`relative text-[14px] transition font-medium ${activeTab === "upcoming"
                      ? "text-[#576CBC] font-semibold"
                      : "text-[#0A0A12] dark:text-[#fff] opacity-80"
                      }`}
                    onClick={() => setActiveTab("upcoming")}
                  >
                    Scheduled (
                    {groupedMeetings.filter(
                      (g) =>
                        g.meetingStatus === "Scheduled" ||
                        g.meetingStatus === "Rescheduled",
                    ).length + upcomingClasses.length}
                    )
                    {activeTab === "upcoming" && (
                      <span className="absolute left-0 ml-5 -bottom-1 w-[60px] h-[2px] rounded-full bg-[#576CBC] dark:text-[#576CBC]" />
                    )}
                  </button>

                  <button
                    className={`relative text-[14px] transition font-medium ${activeTab === "completed"
                      ? "text-[#576CBC] font-semibold"
                      : "text-[#0A0A12] dark:text-[#fff] opacity-80"
                      }`}
                    onClick={() => setActiveTab("completed")}
                  >
                    Completed (
                    {groupedMeetings.filter(
                      (g) => g.meetingStatus === "Completed",
                    ).length + completedData.length}
                    )
                    {activeTab === "completed" && (
                      <span className="absolute left-0 ml-3 -bottom-1 w-[60px] h-[3px] rounded-full bg-[#576CBC]" />
                    )}
                  </button>
                </div>

                <div className="w-full h-[610px] bg-[#FAFAFB] rounded-lg dark:bg-[#343434] mt-2">
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

                    <div
                      className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
                      onClick={() => setShowModal(true)}
                    >
                      <MdTune className="w-4 h-4" />
                      <span>Filter</span>
                    </div>

                    <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                      <span className="text-left -ml-60">
                        Showing {currentApplicants.length} Of{" "}
                        {dataToShow.length}
                      </span>
                    </div>
                  </div>

                  <table
                    className="table-auto w-full"
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
                        <th className="text-left px-4 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
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
                      {currentItems.map((item, index) => {
                        console.log(
                          "Render row - index:",
                          index,
                          "item:",
                          item,
                          "isGroupedMeeting:",
                          isGroupedMeeting(item),
                          "isRegularMeeting:",
                          isRegularMeeting(item),
                        );

                        if (isGroupedMeeting(item)) {
                          // Render Grouped Meeting
                          return (
                            <tr
                              key={item.meetingId}
                              className={`text-[12px] ${index % 2 === 0
                                ? "bg-[#fff] dark:bg-[#2C2C2C]"
                                : "bg-[#F8F8F8] dark:bg-[#303030]"
                                }`}
                            >
                              <td className="px-3 py-2 text-[#3D8FDE] font-medium text-left w-[180px] break-words whitespace-normal">
                                {item.meetingId}
                              </td>
                              <td className="px-3 py-2 text-[#17243E] dark:text-[#FDFDFD] text-left w-[250px] break-words whitespace-normal">
                                {item.meetingName}
                              </td>
                              <td className="px-3 py-2 text-left text-[#17243E] dark:text-[#FDFDFD]">
                                <div className="relative">
                                  {/* Get attendees first */}
                                  {(() => {
                                    const attendees = getAttendees(item);
                                    console.log(
                                      "Grouped row attendees for meetingId:",
                                      item.meetingId,
                                      "length:",
                                      attendees.length,
                                      "attendees:",
                                      attendees,
                                    );

                                    return (
                                      <div className="relative">
                                        {/* Button */}
                                        <button
                                          onClick={() =>
                                            toggleTeacherDropdown(
                                              item.meetingId,
                                            )
                                          }
                                          className="flex items-center gap-2 font-medium"
                                        >
                                          <AiOutlineMenuUnfold />
                                          View List ({attendees.length})
                                        </button>

                                        {/* Dropdown */}
                                        {openTeacherDropdownId ===
                                          item.meetingId && (
                                            <div className="absolute z-10 mt-2 w-72 bg-white rounded shadow-lg p-3 dark:bg-[#343434]">
                                              {attendees.length === 0 ? (
                                                <p className="text-sm text-gray-500 text-center">
                                                  No Attendees
                                                </p>
                                              ) : (
                                                attendees.map((p, idx) => (
                                                  <div
                                                    key={idx}
                                                    className="py-2 border-b last:border-0"
                                                  >
                                                    <div className="flex items-center gap-2">
                                                      <IoPersonOutline />

                                                      <div>
                                                        <div className="font-medium">
                                                          {p.teacherName ||
                                                            p.participantName ||
                                                            p.name ||
                                                            "Unknown"}
                                                        </div>

                                                        <div className="text-xs text-gray-500">
                                                          {p.teacherEmail ||
                                                            p.participantEmail ||
                                                            p.email ||
                                                            "No email"}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))
                                              )}
                                            </div>
                                          )}
                                      </div>
                                    );
                                  })()}
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
                                {item.startTime} - {item.endTime}
                              </td>
                              <td className="px-3 py-2 text-left">
                                {activeTab === "upcoming" &&
                                  isStartMeetingNow(
                                    item.selectedDate,
                                    item.startTime,
                                    item.endTime,
                                  ) ? (
                                  <button
                                    className="text-[10px] font-semibold px-[11px] py-1 rounded-lg bg-[#576cbc] text-white border"
                                    onClick={() =>
                                      router.push(
                                        `/modules/users/supervisor/ui/meetingvideocall?id=${item.meetingId}`,
                                      )
                                    }
                                  >
                                    Start Meeting
                                  </button>
                                ) : (
                                  <span
                                    className={`text-[10px] font-semibold px-3 py-1 rounded-lg ${getMeetingStatusClass(
                                      item.meetingStatus,
                                    )}`}
                                  >
                                    {item.meetingStatus}
                                  </span>
                                )}
                              </td>

                              <td className="px-3 py-2 text-left w-[80px] break-words whitespace-normal">
                                <div className="relative">
                                  {activeTab === "upcoming" &&
                                    (item.meetingStatus === "Scheduled" ||
                                      item.meetingStatus === "Rescheduled") &&
                                    !isAutoMeeting(item) && (
                                      <button
                                        disabled={
                                          item.meetingStatus === "Rescheduled"
                                        }
                                        onClick={() => {
                                          if (
                                            item.meetingStatus === "Rescheduled"
                                          )
                                            return;

                                          setIsRescheduleModalOpen(true);
                                          setSelectedItemId((prev) =>
                                            prev === item._id ? null : item._id,
                                          );
                                        }}
                                        className={`p-2 rounded-md ${item.meetingStatus === "Rescheduled"
                                          ? "opacity-40 cursor-not-allowed"
                                          : "cursor-pointer"
                                          }`}
                                      >
                                        <MoreVertical className="w-4 h-4 text-slate-600 dark:text-[#FDFDFD]" />
                                      </button>
                                    )}

                                  {activeTab === "completed" && (
                                    <button
                                      onClick={() =>
                                        handleViewDetails(item._id)
                                      }
                                      className="p-2 rounded-md"
                                    >
                                      <FaEye className="w-4 h-4 text-slate-600 dark:text-[#FDFDFD] cursor-pointer" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        } else if (isRegularMeeting(item)) {
                          // Render Regular Meeting
                          return (
                            <tr
                              key={item._id}
                              className={`text-[12px] ${index % 2 === 0
                                ? "bg-[#fff] dark:bg-[#2C2C2C]"
                                : "bg-[#F8F8F8] dark:bg-[#303030]"
                                }`}
                            >
                              <td className="px-3 py-2 text-[#3D8FDE] font-medium text-left w-[180px] break-words whitespace-normal">
                                {item.meetingId}
                              </td>
                              <td className="px-3 py-2 text-[#17243E] dark:text-[#FDFDFD] text-left w-[250px] break-words whitespace-normal">
                                {item.meetingName}
                              </td>
                              <td className="px-3 py-2 text-left text-[#17243E] dark:text-[#FDFDFD]">
                                <div className="relative">
                                  {getTeacherArray(item.teacher).length > 1 ? (
                                    <>
                                      <button
                                        onClick={() =>
                                          toggleTeacherDropdown(item._id)
                                        }
                                        className="flex items-center gap-2 font-medium hover:text-[#5c5c5c] dark:hover:text-[#5c5c5c]"
                                      >
                                        <AiOutlineMenuUnfold />
                                        View List (
                                        {getTeacherArray(item.teacher).length})
                                      </button>

                                      {openTeacherDropdownId === item._id && (
                                        <div className="absolute z-10 mt-2 w-48 bg-white rounded shadow-lg p-2 dark:bg-[#343434]">
                                          {getTeacherArray(item.teacher).map(
                                            (teacher, idx) => (
                                              <div
                                                key={idx}
                                                className="py-1 text-[#17243E] dark:text-[#FDFDFD]"
                                              >
                                                <span className="flex items-center gap-2">
                                                  <IoPersonOutline />
                                                  {teacher.teacherName ||
                                                    "Unknown Teacher"}
                                                </span>
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <span className="flex items-center gap-2 font-medium">
                                      <IoPersonOutline />
                                      {getTeacherName(item.teacher)}
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
                                {item.startTime}{item.endTime}
                              </td>
                              <td className="px-3 py-2 text-left">
                                {activeTab === "upcoming" &&
                                  isStartMeetingNow(
                                    item.selectedDate,
                                    item.startTime,
                                    item.endTime,
                                  ) ? (
                                  <button
                                    className="text-[10px] font-semibold px-[11px] py-1 rounded-lg bg-[#576cbc] text-white border"
                                    onClick={() =>
                                      router.push(
                                        `/modules/users/supervisor/ui/meetingvideocall?id=${item.meetingId}`,
                                      )
                                    }
                                  >
                                    Start Meeting
                                  </button>
                                ) : (
                                  <span
                                    className={`text-[10px] font-semibold px-3 py-1 rounded-lg ${getMeetingStatusClass(
                                      item.meetingStatus,
                                    )}`}
                                  >
                                    {item.meetingStatus}
                                  </span>
                                )}
                              </td>

                              <td className="px-3 py-2 text-left w-[80px] break-words whitespace-normal">
                                <div className="relative">
                                  {activeTab === "upcoming" &&
                                    !isAutoMeeting(item) ? (
                                    // Upcoming tab - show MoreVertical for actions (but NOT eye button)
                                    <button
                                      onClick={() => {
                                        setIsDetailsModalOpen(true);
                                        setSelectedItemId((prev) =>
                                          prev === item._id ? null : item._id,
                                        );
                                      }}
                                      className="p-2 rounded-md"
                                    >
                                      <MoreVertical className="w-4 h-4 text-slate-600 dark:text-[#FDFDFD] cursor-pointer" />
                                    </button>
                                  ) : (
                                    // Completed tab - show Eye for viewing details
                                    <button
                                      onClick={() =>
                                        handleViewDetails(item._id)
                                      }
                                      className="p-2 rounded-md"
                                    >
                                      <FaEye className="w-4 h-4 text-slate-600 dark:text-[#FDFDFD] cursor-pointer" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        }
                        return null;
                      })}
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
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-30">
          <div className="bg-white p-6 rounded-lg w-[500px] relative dark:bg-[#252525]">
            <button
              className="absolute top-2 right-3 text-gray-400 text-xl"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>

            <h2 className="text-lg font-semibold mb-4">Filter by</h2>

            <div className="mb-4">
              <label className="text-sm font-medium mb-1 dark:text-[#D6D6D6]">
                Date Range
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="date"
                  className="w-1/2 px-3 py-2 border rounded text-xs text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <input
                  type="date"
                  className="w-1/2 px-3 py-2 border rounded text-xs text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="timimg"
                className="block text-sm text-gray-700 mb-1 dark:text-white"
              >
                Timing
              </label>
              <input
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                type="time"
                className="w-full mb-4 border border-gray-300 dark:bg-[#343434] dark:text-white rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="status"
                className="block text-sm font-medium mb-1"
              >
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded-md p-2 text-[12px] dark:bg-[#343434] dark:text-[#D6D6D6] dark:border-[#565656]"
              >
                <option value="">Select status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1 rounded-md border border-[#576CBC] text-[#576CBC] font-medium"
              >
                Cancel
              </button>
              <button
                className="px-4 py-1 rounded-md bg-[#576CBC] text-white font-medium"
                onClick={handleFilter}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Details Modal */}
      {isMeetingDetailsModalOpen && selectedMeetingDetails && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <button
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMeetingDetailsModalOpen(false)}
          ></button>
          <div className="relative z-50 bg-white rounded-lg p-6 w-[720px] max-h-[90vh] overflow-y-auto shadow-xl dark:bg-[#252525]">
            <button
              onClick={() => setIsMeetingDetailsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 text-lg font-bold"
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
                {getTeacherArray(selectedMeetingDetails.teacher).map(
                  (teacher, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center px-4 py-2"
                    >
                      <span className="text-[#4F46E5]">
                        {teacher.teacherName ||
                          teacher.participantName ||
                          teacher.name ||
                          "Unknown Teacher"}
                      </span>
                      <span
                        className={`text-lg text-center pr-4 ${teacher.attendee === "present"
                          ? "text-green-600"
                          : "text-red-500"
                          }`}
                      >
                        {teacher.attendee === "present" ? "✔" : "✘"}
                      </span>
                    </div>
                  ),
                )}
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
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          <div className="bg-white rounded-lg p-6 w-[600px] relative z-50 shadow-xl dark:bg-[#252525]">
            <h2 className="text-[#0D0E25] text-md font-semibold mb-4 dark:text-[#fff]">
              Reason for Re-Schedule
            </h2>
            <label className="block text-xs font-medium text-[#0D0E25] mb-1 dark:text-white">
              Add Description
            </label>
            <textarea
              className="w-full h-32 p-3 mb-6 border border-[#D9D9D9] rounded-md text-sm text-[#0D0E25] placeholder-[#9CA3AF] resize-none focus:outline-none dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white"
              placeholder="Type here..."
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
            />
            <div className="flex gap-4 mb-6">
              <div className="w-1/2">
                <label className="block text-xs font-medium text-[#0D0E25] mb-1 dark:text-white">
                  Reschedule Date
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full text-xs px-4 py-2 border border-[#D9D9D9] rounded-md text-[#0D0E25] focus:outline-none dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-medium text-[#0D0E25] mb-1 dark:text-white">
                  Reschedule Time
                </label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full text-sm px-4 py-2 border border-[#D9D9D9] rounded-md text-[#0D0E25] focus:outline-none dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t pt-4 dark:border-[#5C5C5C]">
              <button
                onClick={() => setIsRescheduleModalOpen(false)}
                className="px-6 py-2 rounded-md border border-[#576CBC] font-semibold text-[#576CBC] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleSubmit}
                className="px-6 py-2 rounded-md bg-[#576CBC] text-white font-semibold transition"
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
    </BaseLayout3>
  );
};

export default ScheduledClasses;
