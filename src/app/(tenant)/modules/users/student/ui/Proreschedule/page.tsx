"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { CalendarX2, Clock } from "lucide-react";
import axios, { AxiosError } from "axios";
import moment from "moment";
import BaseLayout2 from "@/app/(tenant)/modules/users/student/components/BaseLayout2";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import { getSocket } from "@/app/utils/socket";
import { AnimatePresence, motion } from "framer-motion";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StudentHeader from "../../components/StudentHeader";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppInfoToastMessages } from "@/app/_components/contents/toast_message";

interface ClassSchedule {
  _v: { __v: any };
  student: Student;
  teacher: Teacher;
  course: Course;
  _id: string;
  classDay: string[];
  package: string;
  totalHourse: number;
  startDate: string;
  endDate: string;
  startTime: string[];
  endTime: string[];
  scheduleStatus: string;
  classLink: string;
  status: string;
  createdBy: string;
  sessionClassType: string;
  sessionStarttime: string;
  sessionsEndtime: string;
  createdDate: string;
  lastUpdatedDate: string;
  __v: number;
  studentAttendee?: any[];
  teacherAttendee?: any[];
}

interface Student {
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  gender: string;
}

interface Teacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
}

interface Course {
  courseId: string;
  courseName: string;
}


interface Teacher {
  _id: string;
  academicCoachId: string | null;
  teacherId: string;
  supervisorId: string | null;
  employeeId: string;
  name: string;
  email: string;
  role: string;
  workhrs: string;
  startdate: string;
  enddate: string;
  fromtime: string;
  totime: string;
  createdDate: string;
  createdBy: string;
  lastUpdatedBy: string;
  __v: number;
}

interface TeacherSlot {
  fromTime: string;
  toTime: string;
  name: string;
  teacherId: string;
  isStatus: boolean;
}

const TeachersSchedule = () => {
  const [activeView, setActiveView] = useState<"monthly" | "weekly" | "daily">(
    "monthly"
  );
  const seacrh = useSearchParams();
  const position = seacrh.get("course");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState<ClassSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [availableTeachers, setAvailableTeachers] = useState<TeacherSlot[]>([]);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherSlot | null>(
    null
  );
  const [rescheduleReason, setRescheduleReason] = useState("");
  const tabs: Array<"monthly" | "weekly" | "daily"> = [
    "monthly",
    "weekly",
    "daily",
  ];

  const meetingTypeColors = {
    "quran class": {
      text: "text-[#21BAFF]",
      border: "border-[#21BAFF]",
      bg: "bg-[#21BAFF]/10",
    },
    "arabic class": {
      text: "text-[#ce4b49]",
      border: "border-[#ce4b49]",
      bg: "bg-[#ce4b49]/10",
    },
    "islamic class": {
      text: "text-[#5362e4]",
      border: "border-[#5362e4]",
      bg: "bg-[#5362e4]/10",
    },
  };
  useEffect(() => {
    toast.info(AppInfoToastMessages.RESCHEDULE_PROMPT);
  }, []);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const classId = seacrh.get("classId");
        const studentId =
          typeof window !== "undefined"
            ? localStorage.getItem("StudentPortalId")
            : null;
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("StudentAuthToken")
            : null;

        if (!studentId || !token) {
          console.log("Missing studentId or authToken");
          return;
        }

        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET_CLASSSHEDULE_STUDENTS}`,
          {
            params: { studentId },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let scheduleData: ClassSchedule[] = [];
        if (response.data?.classSchedule) {
          scheduleData = response.data.classSchedule;
        } else if (response.data?.students) {
          scheduleData = response.data.students;
        }

        if (scheduleData.length > 0) {
          const sortedMeetings = scheduleData.toSorted(
            (a: ClassSchedule, b: ClassSchedule) =>
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );
          setMeetings(sortedMeetings);

          const matchedMeeting = sortedMeetings.find(
            (m) => m._id === classId // replace classId with your variable
          );

          // 🗓 Set date-related states based on matched meeting
          const fallbackDate = new Date(); // fallback if not matched
          const selectedMeetingDate = matchedMeeting
            ? new Date(matchedMeeting.startDate)
            : fallbackDate;
          // ✅ Set selected date in calendar
          setSelectedDate(selectedMeetingDate);
        }
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };

    fetchMeetings();
  }, []);
  const handleDateClick = async (date: Date) => {
    setSelectedDate(date);
    setSelectedTeacher(null);
    setAvailableTeachers([]);
    setIsRescheduleOpen(false);
    console.log("date is ", date);
    const formattedDate = moment(date).format("YYYY-MM-DD");
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("StudentAuthToken")
        : null;

    if (!token) {
      console.warn("⚠️ Missing token");
      return;
    }
     
    try {
    const adjustedPosition =
     position === "Islamic Studies" ? "Islamic" : position;
      const url = `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.AVAILABLE_TIME_SLOT}?scheduleDate=${formattedDate}&position=${encodeURIComponent(
        adjustedPosition + " Teacher"
      )}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("❌ Failed to fetch teachers");
        return;
      }

      const data = await res.json();
      setAvailableTeachers(data);
    } catch (err) {
      console.error("❌ Network error:", err);
    }
  };

  const handleTeacherClick = (teacher: TeacherSlot) => {
    setSelectedTeacher(teacher);
    setIsRescheduleOpen(true);
  };
  useEffect(() => {
    const academicId =
      typeof window !== "undefined"
        ? localStorage.getItem("StudentPortalId")
        : null;
    if (!academicId) return;

    const socket = getSocket(academicId);

    const handleList = (payload: {
      event: "update" | "create";
      date: string;
      slots: {
        [teacherId: string]: {
          from: string;
          to: string;
          isStatus: boolean;
        }[];
      };
    }) => {
      if (payload.event !== "update") return;

      const selectedDay = moment(selectedDate).format("YYYY-MM-DD");
      const payloadDay = moment(payload.date).format("YYYY-MM-DD");

      console.log("📦 WS Payload:", payload);
      console.log("📅 Selected Date:", selectedDay, "| WS Date:", payloadDay);

      if (selectedDay !== payloadDay) {
        console.warn("⛔ Date mismatch: skipping update");
        return;
      }

      // 🔥 Update flat array
      setAvailableTeachers((prev: any[]) => {
        const slotsToRemove = Object.entries(payload.slots).flatMap(
          ([teacherId, updates]) =>
            updates
              .filter((u) => !u.isStatus) // ❌ only removing slots
              .map((u) => ({
                teacherId,
                from: u.from,
                to: u.to,
              }))
        );

        const filtered = prev.filter((slot) => {
          return !slotsToRemove.some(
            (r) =>
              r.teacherId === slot.teacherId &&
              r.from === slot.fromTime &&
              r.to === slot.toTime
          );
        });

        console.log("🧹 After Slot Removal:", filtered);
        return filtered;
      });
    };

    socket.on("academicAvailableTeachers", handleList);
    return () => {
      socket.off("academicAvailableTeachers", handleList);
    };
  }, [selectedDate]);

  const handleRescheduleSubmit = async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("StudentAuthToken")
        : null;

    if (!selectedDate) return;
    if (!token) {
      console.error("❌ Missing token or class ID");
      return;
    }
    if (
      !selectedDate ||
      !selectedTeacher?.fromTime ||
      !selectedTeacher?.toTime ||
      !rescheduleReason
    ) {
      console.error("❌ Missing reschedule data");
      return;
    }

    try {
      const classId = seacrh.get("classId");
      const existingRes = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET}/${classId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!existingRes.ok) {
        console.error("❌ Failed to fetch existing class schedule");
        return;
      }

      const existingData = await existingRes.json();

      const to24HourFormat = (timeStr: string) => {
        const [hours, minutes] = new Date(`1970-01-01T${timeStr}`)
          .toTimeString()
          .split(":");
        return `${hours}:${minutes}`;
      };

      // This ensures the selected date doesn't shift due to timezone conversion
      const normalizeDate = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-indexed
        const day = date.getDate();

        // Create a new Date at noon UTC (avoids time shift)
        const utcDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
        return utcDate.toISOString(); // Safe to store in DB
      };

      // 2. Build updated payload with only specific changes
      const updatedPayload = {
        ...existingData,
        // Inside your handleRescheduleSubmit
        startDate: normalizeDate(selectedDate),
        endDate: normalizeDate(selectedDate),
        classDay: [
          {
            label: selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
            }),
            value: normalizeDate(selectedDate),
          },
        ],

        startTime: [
          {
            label: to24HourFormat(selectedTeacher.fromTime),
            value: to24HourFormat(selectedTeacher.fromTime),
          },
        ],
        endTime: [
          {
            label: to24HourFormat(selectedTeacher.toTime),
            value: to24HourFormat(selectedTeacher.toTime),
          },
        ],

        teacherId: selectedTeacher.teacherId,
        teacherName: selectedTeacher.name,
        scheduleStatus: "Rescheduled",
        lastUpdatedDate: new Date().toISOString(),
        rescheduleReason,
      };

      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET}/${classId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedPayload),
        }
      );
      if ([200, 201].includes(res.status)) {
        setSuccess(true);
        setTimeout(() => {
          setIsRescheduleOpen(false);
          setRescheduleReason("");
        }, 2000);
      }
    } catch (err) {
      const error = err as AxiosError;
      const status = error.response?.status;
      if (Number(status === 400)) {
        console.log("please >");
        setFailedMessage("Please check the form inputs.");
        setFailed(true);
      } else if (status === 401) {
        setFailedMessage("Please login again.");
        setFailed(true);
      } else if (status === 403) {
        setFailedMessage("You don't have permission to perform this action.");
        setFailed(true);
      } else if (status === 500) {
        setFailedMessage("Server error");
        setFailed(true);
      } else {
        setFailed(true);
        console.error(`Unexpected error: ${status}`);
      }
    }
  };
  const handlePrev = () => {
    if (activeView === "monthly") {
      setCurrentDate(moment(currentDate).subtract(1, "month").toDate());
    } else if (activeView === "weekly") {
      setCurrentDate(moment(currentDate).subtract(1, "week").toDate());
    } else if (activeView === "daily") {
      setCurrentDate(moment(currentDate).subtract(1, "day").toDate());
    }
  };

  const handleNext = () => {
    if (activeView === "monthly") {
      setCurrentDate(moment(currentDate).add(1, "month").toDate());
    } else if (activeView === "weekly") {
      setCurrentDate(moment(currentDate).add(1, "week").toDate());
    } else if (activeView === "daily") {
      setCurrentDate(moment(currentDate).add(1, "day").toDate());
    }
  };

  const getFormattedLabel = () => {
    if (activeView === "monthly") {
      return moment(currentDate).format("MMMM YYYY");
    } else if (activeView === "weekly") {
      const start = moment(currentDate).startOf("week");
      const end = moment(currentDate).endOf("week");
      return `${start.format("MMM D")} - ${end.format("MMM D, YYYY")}`;
    } else {
      return moment(currentDate).format("dddd, MMMM D, YYYY");
    }
  };

  const getMeetingTypeColor = (meetingName: string) => {
    const lowerName = meetingName.toLowerCase();
    if (lowerName.includes("quran")) return meetingTypeColors["quran class"];
    if (lowerName.includes("arabic")) return meetingTypeColors["arabic class"];
    if (lowerName.includes("islamic"))
      return meetingTypeColors["islamic class"];
    return meetingTypeColors["quran class"];
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return firstDay.getDay();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today && !isToday(date.getDate());
  };

  const getMeetingsForDate = (date: Date) => {
    const targetDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    return meetings.filter((meeting) => {
      const startDate = new Date(meeting.startDate);
      const meetingDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );

      return meetingDate.getTime() === targetDate.getTime();
    });
  };
  const WeeklyView = () => {
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const startOfWeek = moment(currentDate).startOf("week").toDate();
    const endOfWeek = moment(currentDate).endOf("week").toDate();

    const weekMeetings = meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.startDate);
      return meetingDate >= startOfWeek && meetingDate <= endOfWeek;
    });

    const meetingsByDay = weekMeetings.reduce((acc, meeting) => {
      const day = moment(meeting.startDate).format("dddd");
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(meeting);
      return acc;
    }, {} as Record<string, ClassSchedule[]>);

    const handleDayClick = (day: string) => {
      setSelectedDay(selectedDay === day ? null : day);
      const dayMeeting = weekMeetings.find(
        (m) => moment(m.startDate).format("dddd") === day
      );

      if (dayMeeting) {
        const date = new Date(dayMeeting.startDate);
        handleDateClick(date);
      } else {
        const dayIndex = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ].indexOf(day);
        const date = moment(currentDate)
          .startOf("week")
          .add(dayIndex, "days")
          .toDate();
        handleDateClick(date);
      }
    };

    return (
      <div className="w-full max-w-screen-lg mx-auto px-2 sm:px-4 md:px-6">
        <div className="space-y-3 sm:space-y-4 md:space-y-5">
          {/* Scrollable weekly list container */}
          <div className="h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#555] pr-1">
            {/* Week Header */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white">
                {moment(startOfWeek).format("MMM D")} -{" "}
                {moment(endOfWeek).format("MMM D, YYYY")}
              </h3>
            </div>

            {/* Weekday buttons and meetings */}
            <div className="space-y-2 sm:space-y-3">
              {[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((day) => {
                const dayMeetings = meetingsByDay[day] || [];
                const isSelected = selectedDay === day;
                const dayDate = moment(currentDate).day(day).toDate();
                const isPast = isPastDate(dayDate);
                const isToday = moment().isSame(dayDate, "day");

                return (
                  <div key={day} className="flex flex-col">
                    {/* Day Header Button */}
                    <button
                      onClick={() => handleDayClick(day)}
                      className={`
                  w-full p-2 sm:p-3 md:p-4 rounded-xl transition-all flex items-center justify-between
                  ${
                    isSelected
                      ? "bg-[#f7f7f7] dark:bg-[#414141]"
                      : dayMeetings.length > 0
                      ? "hover:shadow-md bg-[#f7f7f7] dark:bg-[#414141]/90"
                      : "bg-[#f7f7f7] dark:bg-[#414141]/80"
                  }
                  ${isPast ? "opacity-70" : ""}
                  ${isToday ? "border-l-4 border-[#576cbc]" : ""}
                `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`text-xs sm:text-sm font-medium ${
                            isSelected
                              ? "text-black dark:text-white"
                              : isToday
                              ? "text-[#576cbc] dark:text-[#7a94e8]"
                              : "text-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {day.substring(0, 3)}
                        </div>
                        <div>
                          <div
                            className={`text-xs sm:text-sm font-semibold ${
                              isSelected
                                ? "text-black dark:text-white"
                                : "text-gray-800 dark:text-white"
                            }`}
                          >
                            {day}
                          </div>
                          <div
                            className={`text-[10px] ${
                              isSelected
                                ? "text-white/80"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {moment(dayDate).format("MMM D")}
                          </div>
                        </div>
                      </div>

                      {dayMeetings.length > 0 && (
                        <div
                          className={`text-[10px] px-2 py-1 rounded-lg ${
                            isSelected
                              ? "bg-[#eae9e9] text-black dark:bg-[#555] dark:text-white"
                              : "bg-[#eae9e9] text-black/90 dark:bg-[#555]/80 dark:text-white/90"
                          }`}
                        >
                          {dayMeetings.length}{" "}
                          {dayMeetings.length === 1 ? "Meeting" : "Meetings"}
                        </div>
                      )}
                    </button>

                    {/* Day Meeting Cards */}
                    {isSelected && dayMeetings.length > 0 && (
                      <div className="w-full mt-2 pl-3 sm:pl-4 space-y-2">
                        {dayMeetings.map((meeting, idx) => {
                          const colors = getMeetingTypeColor(
                            meeting.course.courseName
                          );
                          return (
                            <div
                              key={idx}
                              className={`
                          relative p-3 sm:p-4 rounded-lg transition-all hover:shadow-sm
                          ${colors.bg} dark:bg-[#414141] bg-[#f7f7f7]
                        `}
                            >
                              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 rounded-lg dark:bg-[#555555] bg-[#eae9e9]" />

                              <div className="flex justify-between items-start">
                                <div>
                                  <div
                                    className={`text-sm font-semibold ${colors.text}`}
                                  >
                                    {meeting.course.courseName} Class
                                  </div>
                                  <div className="text-[10px] text-gray-600 dark:text-gray-300 mt-1">
                                    {meeting.student.studentFirstName}{" "}
                                    {meeting.student.studentLastName}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 text-[10px] text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                  <Clock size={12} className="w-3 h-3" />
                                  {meeting.startTime?.[0] || "--:--"} -{" "}
                                  {meeting.endTime?.[0] || "--:--"}
                                  {meeting.classLink && (
                                    <a
                                      href={meeting.classLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-2 text-blue-500 dark:text-blue-400 hover:underline text-[9px]"
                                    >
                                      Join
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DailyView = () => {
    if (!selectedDate) return;
    const dayMeetings = getMeetingsForDate(selectedDate);
    const isPast = isPastDate(selectedDate);

    return (
      <div className="w-full max-w-screen-lg mx-auto px-2 sm:px-4 md:px-6 space-y-3 sm:space-y-4 md:space-y-5">
        {/* Scrollable Container */}
        <div className="h-[calc(100vh-220px)] sm:h-[450px] md:h-[500px] lg:h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#555] pr-1">
          {/* Header */}
          <div className="mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white">
              {moment(selectedDate).format("dddd, MMMM D, YYYY")}
            </h3>
          </div>

          {/* Meeting List */}
          {dayMeetings.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {dayMeetings.map((meeting) => {
                const colors = getMeetingTypeColor(meeting.course.courseName);
                return (
                  <div
                    key={meeting._id}
                    className={`
                p-3 sm:p-4 rounded-xl transition-colors
                dark:bg-[#414141] bg-gray-100
                ${isPast ? "opacity-70" : ""}
                hover:bg-gray-200 dark:hover:bg-[#505050]
              `}
                  >
                    <div className="flex justify-between items-start gap-3">
                      {/* Course Name */}
                      <div className={`text-sm font-semibold ${colors.text}`}>
                        {meeting.course.courseName} Class
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-2 text-[10px] text-gray-600 dark:text-gray-300">
                        <Clock size={12} className="w-3 h-3" />
                        {meeting.startTime?.[0] || "--:--"} -{" "}
                        {meeting.endTime?.[0] || "--:--"}
                      </div>
                    </div>

                    {/* Student & Join Button */}
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                        {meeting.teacher.teacherName}
                      </div>
                      {meeting.classLink && (
                        <div className="text-[9px] text-blue-500 dark:text-blue-400 hover:underline">
                          Join Class
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // No meetings UI
            <div className="flex flex-col items-center justify-center h-[70%] text-gray-500 dark:text-gray-400">
              <CalendarX2 size={24} className="mb-2 text-gray-400" />
              <p className="text-xs sm:text-sm">
                No meetings scheduled for this day
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };
  const MonthlyView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyCells = Array.from({ length: firstDayOfMonth }, () => null);
    const totalDays = [...emptyCells, ...days];

    return (
      <div className="w-full max-w-screen-lg mx-auto px-2 sm:px-4 md:px-4 space-y-3 sm:space-y-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs md:text-sm font-medium text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-[#414141] rounded-lg sm:rounded-xl p-1 sm:p-2 md:p-3">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="truncate">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-[10px] sm:text-xs md:text-sm overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#555] h-[320px] sm:h-[380px] md:h-[440px] lg:h-[500px]">
          {totalDays.map((day, i) => {
            if (day === null) {
              return (
                <div
                  key={i}
                  className="min-h-[40px] sm:min-h-[50px] md:min-h-[60px] lg:min-h-[80px] bg-transparent"
                />
              );
            }

            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            );
            const dayMeetings = getMeetingsForDate(date);
            const hasMeetings = dayMeetings.length > 0;
            const colors = hasMeetings
              ? getMeetingTypeColor(dayMeetings[0].course.courseName)
              : null;

            const isSelected =
              selectedDate &&
              date.getDate() === selectedDate.getDate() &&
              date.getMonth() === selectedDate.getMonth() &&
              date.getFullYear() === selectedDate.getFullYear();

            const isPast = isPastDate(date);
            const isTodayFlag = isToday(day);

            return (
              <button
                key={i}
                onClick={() => handleDateClick(date)}
                disabled={isPast}
                className={`
            min-h-[40px] sm:min-h-[50px] md:min-h-[60px] lg:min-h-[80px]
            flex flex-col items-center justify-start p-1 rounded-lg sm:rounded-xl
            transition duration-150 ease-in-out cursor-pointer
            ${
              hasMeetings
                ? `${colors?.border} ${colors?.text} ${colors?.bg} border`
                : isTodayFlag
                ? "bg-[#27176518] dark:bg-[#4b8cc918]"
                : "bg-gray-100 dark:bg-[#414141] text-gray-500 dark:text-gray-300"
            }
            ${isSelected ? "ring-2 ring-[#576cbc] dark:ring-[#7a94e8]" : ""}
            ${isPast ? "opacity-50 cursor-not-allowed" : ""}
            ${isTodayFlag ? "font-bold" : ""}
          `}
              >
                <div
                  className={`font-medium text-[10px] sm:text-xs ${
                    isTodayFlag ? "text-[#4b8cc9] dark:text-[#7a94e8]" : ""
                  }`}
                >
                  {day}
                </div>

                {hasMeetings && (
                  <div className="w-full mt-0.5 overflow-hidden px-0.5">
                    <div className="truncate text-[8px] sm:text-[9px] font-medium">
                      {dayMeetings[0]?.course?.courseName ?? "No Course"}
                    </div>
                    <div className="truncate text-[7px] sm:text-[8px] text-gray-600 dark:text-gray-400">
                      {dayMeetings[0]?.startTime?.[0] ?? "--:--"} -{" "}
                      {dayMeetings[0]?.endTime?.[0] ?? "--:--"}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <BaseLayout2>
       <StudentHeader
              currentSection="Re-Schedule Class"
              showBackButton={true}
              showBackPath="classes"
            />
      <ToastContainer position="top-center" theme="dark" autoClose={3000} />
      <div className="mx-auto gap-4 flex flex-col lg:flex-row overflow-hidden min-h-[calc(100vh-150px)]">
        {/* Left Side - Calendar View */}
        <div className="w-full lg:w-2/3 p-1 sm:p-2 md:p-4  bg-white dark:bg-[#343434] shadow-md rounded-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
            {/* Tabs (left aligned) */}
            <div className="flex space-x-2 sm:space-x-4 text-xs sm:text-sm font-medium">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveView(tab)}
                  className={`capitalize ${
                    activeView === tab
                      ? "text-[#576cbc] border-b-2 border-[#576cbc]"
                      : "text-gray-400 hover:text-[#576cbc]"
                  } pb-1 transition-colors duration-200`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Date Controls (right aligned) */}
            <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
              <button
                onClick={handlePrev}
                className="py-[2px] px-3 rounded-md bg-gray-100 dark:bg-[#414141] hover:bg-gray-200 dark:hover:bg-[#505050] transition-colors"
              >
                &lt;
              </button>
              <h2 className="text-xs sm:text-sm md:text-base font-semibold whitespace-nowrap">
                {getFormattedLabel()}
              </h2>
              <button
                onClick={handleNext}
                className="py-[2px] px-3 rounded-md bg-gray-100 dark:bg-[#414141] hover:bg-gray-200 dark:hover:bg-[#505050] transition-colors"
              >
                &gt;
              </button>
            </div>
          </div>

          {activeView === "monthly" && <MonthlyView />}
          {activeView === "weekly" && <WeeklyView />}
          {activeView === "daily" && <DailyView />}
        </div>

        {/* Right Side - Form */}
        <div className="w-full sm:w-1/4 md:w-1/3 lg:w-1/2 xl:w-1/3 bg-white dark:bg-[#343434] rounded-2xl p-4 sm:p-6 shadow-md max-h-[85vh] overflow-y-auto scrollbar-none">
          <h3 className="text-lg sm:text-[16px] font-semibold text-[#111111] dark:text-white mb-3">
            Available Teachers
          </h3>

          <div className="divide-y divide-gray-200 dark:divide-gray-600 overflow-y-auto scrollbar-none ">
            {availableTeachers.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-300 py-4 text-center">
                No teachers available.
              </p>
            ) : (
              <AnimatePresence>
                {availableTeachers.map((teacher, index) => (
                  <motion.div
                    key={`${teacher.teacherId}-${teacher.fromTime}-${teacher.toTime}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center justify-between py-3 px-2"
                  >
                    {/* Left Side */}
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${teacher.name}`}
                        alt={teacher.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <p className="text-sm font-medium text-gray-800 dark:text-white truncate max-w-[120px] sm:max-w-[200px]">
                        {teacher.name}
                      </p>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 text-right">
                      <span className="whitespace-nowrap">
                        {teacher.fromTime} - {teacher.toTime}
                      </span>
                      <button
                        onClick={() => handleTeacherClick(teacher)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-[#5c5c5c] rounded-full transition"
                      >
                        <MdOutlineKeyboardArrowRight className="text-xl text-gray-500 dark:text-[#5c5c5c]" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
      {isRescheduleOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#343434] rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
            {/* Header */}
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-[#FFFFFFCC]/90 mb-3 sm:mb-4">
              Reschedule
            </h2>

            {/* Textarea Label */}
            <label
              htmlFor="reschedule-reason"
              className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-[#FFFFFFCC]/90 mb-1"
            >
              Reason for Reschedule
            </label>

            {/* Textarea Input */}
            <textarea
              id="reschedule-reason"
              rows={4}
              placeholder="Enter reason..."
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-[#5c5c5c] bg-white dark:bg-[#5c5c5c] text-sm p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-white resize-none"
            />

            {/* Footer Buttons */}
            <div className="mt-5 pt-3 border-t border-gray-200 dark:border-[#5c5c5c] flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsRescheduleOpen(false);
                  setRescheduleReason("");
                  setSelectedTeacher(null);
                }}
                className="px-3 py-1 border border-[#576CBC] text-[#576CBC] hover:border-[#4459A9] rounded hover:bg-[#E6E9F5] "
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleSubmit}
                className="px-3 py-1 bg-[#576CBC] text-white rounded hover:bg-[#4459A9]"
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
    </BaseLayout2>
  );
};

export default TeachersSchedule;
