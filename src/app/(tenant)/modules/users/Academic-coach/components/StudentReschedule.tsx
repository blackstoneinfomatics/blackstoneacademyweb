"use client";

import React, { useState, useEffect } from "react";
import moment from "moment";
import { useSearchParams } from "next/navigation";

import { MdOutlineKeyboardArrowRight, MdExpandMore, MdAccessTime } from "react-icons/md";

import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";

import AcademicHeader from "./academicHeader";
import { getSocket } from "@/app/utils/socket";
import { AnimatePresence, motion } from "framer-motion";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";


interface Teacher {
  teacherId: string;
  name: string;
  subject: string;
  email: string;
  startdate: string;
  enddate: string;
  fromtime: string;
  totime: string;
  [key: string]: any;
}


interface ClassSchedule {
  _id: string;
  student: {
    studentId: string;
    studentFirstName: string;
    studentLastName: string;
    studentEmail: string;
    gender: string;
  };
  teacher: {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
  };
  startDate: string;
  endDate: string;
  startTime: string[];
  endTime: string[];
  scheduleStatus: string;
  status: string;
  classLink: string;
  createdBy: string;
  createdDate: string;
  lastUpdatedDate: string;
  amount: string;
  currency: string;
  classDay: string[];
  package: string;
  course: {
    courseName: string;
  };
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

interface TeacherShiftResponse {
  users: Teacher[];
  totalCount: number;
}
interface TeacherSlot {
  fromTime: string;
  toTime: string;
  name: string;
  teacherId: string;
  isStatus: boolean;
}

const SchedulePage = () => {
  const searchParams = useSearchParams();
  const selectedClassId = searchParams?.get("id"); // ✅ ID from URL param
  const position = searchParams?.get("course");
  const [studentId, setStudentId] = useState<string | null>(null);
  const tabs = ["monthly", "weekly", "daily"] as const;
  const [activeView, setActiveView] = useState<"monthly" | "weekly" | "daily">(
    "monthly"
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [scheduledClasses, setScheduledClasses] = useState<ClassSchedule[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [availableTeachers, setAvailableTeachers] = useState<TeacherSlot[]>([]);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherSlot | null>(
    null
  );
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedSlotByTeacher, setSelectedSlotByTeacher] = useState<Record<string, { fromTime: string; toTime: string } | null>>({});
  const [openDropdownFor, setOpenDropdownFor] = useState<string | null>(null);
  const [currentTeacherId, setCurrentTeacherId] = useState<string | null>(null);
  const [currentTeacherName, setCurrentTeacherName] = useState<string | null>(null);

  useEffect(() => {
    const queryStudentId = searchParams?.get("studentId");
    const localStudentId = localStorage.getItem("studentManageID");
    setStudentId(queryStudentId || localStudentId);
  }, [searchParams]);

  useEffect(() => {
    const fetchCurrentClass = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("AcademicCoachAuthToken") : null;
      if (!token || !selectedClassId) return;
      try {
        const res = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET}/${selectedClassId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return;
        const data = await res.json();
        const tId = data?.teacher?.teacherId || data?.teacherId || null;
        const tName = data?.teacher?.teacherName || data?.teacherName || null;
        setCurrentTeacherId(tId);
        setCurrentTeacherName(tName);
      } catch (e) {
        console.warn("Unable to fetch current class for teacher identification", e);
      }
    };
    fetchCurrentClass();
  }, [selectedClassId]);

  useEffect(() => {
    const fetchClassSchedule = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AcademicCoachAuthToken")
          : null;

      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return;
      }
      if (!studentId) {
        console.warn("No studentId found in query params or localStorage");
        return;
      }

      console.log("Fetching class schedule for studentId:", studentId);

      try {
        const res = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET}/students?studentId=${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          console.error("Server responded with status:", res.status);
          return;
        }

        const data = await res.json();
        console.log("Fetched data from API:", data);

        const allSchedules: ClassSchedule[] = data.classSchedule;

        setScheduledClasses(
          allSchedules.filter(
            (c) =>
              c.scheduleStatus === "Scheduled" ||
              c.scheduleStatus === "Rescheduled" ||
              c.scheduleStatus === "Reschedulerequested"
          )
        );
      } catch (err) {
        console.error("Failed to fetch class schedule", err);
      }
    };

    if (studentId) {
      fetchClassSchedule();
    }
  }, [studentId]);

  const handleDateClick = async (date: Date, position1: string) => {
    setSelectedDate(date);
    setSelectedTeacher(null);
    setAvailableTeachers([]);
    setIsRescheduleOpen(false);
    console.log("date is ", date);
    const formattedDate = moment(date).format("YYYY-MM-DD");
    const token = localStorage.getItem("AcademicCoachAuthToken");

    if (!token) {
      console.warn("⚠️ Missing token");
      return;
    }
    console.log(position1);
    try {
      const adjustedPosition =
        position === "Islamic Studies" ? "Islamic" : position;
      const url = `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.AVAILABLE_TIME_SLOT.GET}?scheduleDate=${formattedDate}&position=${encodeURIComponent(
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
      console.log("name", data);
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
        ? localStorage.getItem("AcademicCoachPortalId")
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

      setAvailableTeachers((prev: any[]) => {
        const slotsToRemove = Object.entries(payload.slots).flatMap(
          ([teacherId, updates]) =>
            updates
              .filter((u) => !u.isStatus)
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
    const token = localStorage.getItem("AcademicCoachAuthToken");
    if (!token || !selectedClassId) {
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
      const existingRes = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET}/${selectedClassId}`,
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

      const normalizeDate = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        const utcDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
        return utcDate.toISOString();
      };

      const updatedPayload = {
        ...existingData,
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
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.UPDATE_SLECTED_CLASS}/${selectedClassId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedPayload),
        }
      );

      setSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setIsRescheduleOpen(false);
        setRescheduleReason("");
      }, 2000);

      if (!res.ok) {
        console.error("❌ Failed to update. Status:", res.status);
      } else {
        console.log("✅ Class rescheduled successfully.");
        try {
          const refreshRes = await fetch(
            `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET_CLASSSHEDULE_STUDENTS}?studentId=${studentId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (refreshRes.ok) {
            const refreshed = await refreshRes.json();
            const allSchedules: ClassSchedule[] = refreshed.classSchedule;
            setScheduledClasses(
              allSchedules.filter(
                (c) =>
                  c.scheduleStatus === "Scheduled" ||
                  c.scheduleStatus === "Rescheduled" ||
                  c.scheduleStatus === "Reschedulerequested"
              )
            );
          }
        } catch (e) {
          console.warn("⚠️ Unable to refresh schedule after reschedule", e);
        }
      }
    } catch (error) {
      console.error("❌ Error during reschedule:", error);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, "month").toDate());
  };

  const handleNextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, "month").toDate());
  };

  const formatMonthYear = (date: Date) => moment(date).format("MMMM YYYY");

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();


  const getCourseColorClass = (courseName: string) => {
    switch (courseName) {
      case "Quran":
        return "border-[#21BAFF] text-[#21BAFF]";
      case "Islamic Studies":
        return "border-[#E49D2C] text-[#E49D2C]";
      case "Arabic":
        return "border-[#5362E4] text-[#5362E4]";
      default:
        return "border-gray-300 text-gray-500";
    }
  };

  const groupedByTeacher = React.useMemo(() => {
    const map: Record<string, { teacherId: string; name: string; slots: { fromTime: string; toTime: string }[] }> = {};
    availableTeachers.forEach((t) => {
      if (!map[t.teacherId]) {
        map[t.teacherId] = { teacherId: t.teacherId, name: t.name, slots: [] };
      }
      map[t.teacherId].slots.push({ fromTime: t.fromTime, toTime: t.toTime });
    });
    const groups = Object.values(map);
    if (currentTeacherId) {
      groups.sort((a, b) => {
        if (a.teacherId === currentTeacherId) return -1;
        if (b.teacherId === currentTeacherId) return 1;
        return 0;
      });
    }
    return groups;
  }, [availableTeachers, currentTeacherId]);

  const toTitleCase = (value: string) => {
    if (!value) return value;
    return value
      .split(" ")
      .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1).toLowerCase() : part))
      .join(" ");
  };

  const WeeklyView = ({
    selectedDate,
    scheduledClasses,
  }: {
    selectedDate: Date;
    scheduledClasses: ClassSchedule[];
  }) => {
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const startOfWeek = moment(selectedDate).startOf("week");
    const endOfWeek = moment(selectedDate).endOf("week");

    const classesThisWeek = scheduledClasses.filter((cls) =>
      moment(cls.startDate).isBetween(startOfWeek, endOfWeek, "day", "[]")
    );

    const classesByDay = classesThisWeek.reduce((acc, cls) => {
      const day = moment(cls.startDate).format("dddd");
      if (!acc[day]) acc[day] = [];
      acc[day].push(cls);
      return acc;
    }, {} as Record<string, ClassSchedule[]>);

    const handleDayClick = (day: string) => {
      setSelectedDay((prev) => (prev === day ? null : day));
    };

    return (
      <div className="space-y-4 h-[540px] overflow-y-scroll scrollbar-none">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[16px] font-semibold">
            {startOfWeek.format("MMM D")} - {endOfWeek.format("MMM D, YYYY")}
          </h3>
        </div>

        {[
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ].map((day) => {
          const dayClasses = classesByDay[day] || [];
          const isSelected = selectedDay === day;
          const classDate = dayClasses.length
            ? moment(dayClasses[0].startDate)
            : null;

          return (
            <div key={day} className="flex flex-col">
              <button
                onClick={() => handleDayClick(day)}
                className={`w-full p-4 rounded-xl transition-all duration-200 cursor-pointer ${isSelected
                    ? "bg-[#f7f7f7] dark:bg-[#414141] text-black dark:text-white"
                    : "bg-[#f7f7f7] dark:bg-[#414141] text-black dark:text-white"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-semibold">{day}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {classDate ? classDate.format("MMMM D, YYYY") : "—"}
                    </div>
                  </div>
                  {dayClasses.length > 0 && (
                    <div className="text-xs px-3 py-1 rounded-lg bg-[#eae9e9] dark:bg-[#555555]">
                      {dayClasses.length}{" "}
                      {dayClasses.length === 1 ? "Class" : "Classes"}
                    </div>
                  )}
                </div>
              </button>

              {isSelected && dayClasses.length > 0 && (
                <div className="mt-2 space-y-2 pl-4">
                  {dayClasses.map((cls, idx) => {
                    const courseColorClass = getCourseColorClass(
                      cls.course.courseName
                    );

                    return (
                      <div
                        key={idx}
                        className={`p-3 text-sm rounded-xl relative ${courseColorClass}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-semibold">
                            {cls.course.courseName}
                          </div>
                          <div className="text-xs">
                            {cls.startTime[0]} – {cls.endTime[0]}
                          </div>
                        </div>
                        {cls.scheduleStatus === "Rescheduled" && (
                          <div className="mt-1 text-[11px] text-gray-600 dark:text-gray-300">
                            Rescheduled from {moment(cls.lastUpdatedDate).format("MMM D, YYYY")}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const DailyView = ({
    selectedDate,
    scheduledClasses,
  }: {
    selectedDate: Date;
    scheduledClasses: ClassSchedule[];
  }) => {
    const currentDay = moment(selectedDate);
    const dayClasses = scheduledClasses.filter((cls) =>
      moment(cls.startDate).isSame(currentDay, "day")
    );

    return (
      <div className="space-y-4 h-[540px] overflow-y-scroll scrollbar-none">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-semibold">
            {currentDay.format("dddd, MMM D YYYY")}
          </h3>
        </div>

        {dayClasses.length > 0 ? (
          dayClasses.map((cls, idx) => {
            const courseColorClass = getCourseColorClass(cls.course.courseName);

            return (
              <div key={idx} className={`p-4 rounded-xl ${courseColorClass}`}>
                <div className="flex justify-between items-start">
                  <div className="text-sm font-semibold">{cls.course.courseName}</div>
                  <div className="text-xs">
                    {cls.startTime[0]} – {cls.endTime[0]}
                  </div>
                </div>
                {cls.scheduleStatus === "Rescheduled" && (
                  <div className="mt-1 text-[11px] text-gray-600 dark:text-gray-300">
                    Rescheduled from  {moment(cls.lastUpdatedDate).format("MMM D, YYYY")}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-gray-400 text-sm">
            No classes scheduled for this day.
          </div>
        )}
      </div>
    );
  };

  const MonthlyView = ({
    currentDate,
    selectedDate,
    handleDateClick,
    handlePrevMonth,
    handleNextMonth,
    scheduledClasses,
    formatMonthYear,
    getDaysInMonth,
    getFirstDayOfMonth,
  }: any) => {
    const [openDayDropdown, setOpenDayDropdown] = useState<string | null>(null);
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyCells = Array.from({ length: firstDayOfMonth }, () => null);
    const totalDays = [...emptyCells, ...days];

    const getClassesForDate = (date: Date) =>
      scheduledClasses.filter((cls: ClassSchedule) =>
        moment(cls.startDate).isSame(date, "day")
      );

    const isToday = (day: number) => {
      const today = new Date();
      return (
        day === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear()
      );
    };

    return (
      <>
        <div className="flex items-end justify-end mb-4 -mt-10 gap-2">
          <button
            onClick={handlePrevMonth}
            className="py-[1px] px-2 rounded-lg bg-gray-100 dark:bg-[#414141] hover:bg-gray-200 dark:hover:bg-[#505050] transition-colors"
          >
            &lt;
          </button>
          <h2 className="text-[16px] font-semibold">
            {formatMonthYear(currentDate)}
          </h2>
          <button
            onClick={handleNextMonth}
            className="py-[1px] px-2 rounded-lg bg-gray-100 dark:bg-[#414141] hover:bg-gray-200 dark:hover:bg-[#505050] transition-colors"
          >
            &gt;
          </button>
        </div>

        {/* Day Labels */}
        <div className="grid grid-cols-7 mt-12 gap-2 text-center text-sm font-medium text-gray-500 mb-2 dark:bg-[#414141] bg-gray-100 rounded-xl p-3 dark:text-[#fff]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2 px-2 text-sm h-[455px] overflow-scroll scrollbar-none">
          {totalDays.map((day, i) => {
            if (day === null)
              return <div key={i} className="min-h-[80px] bg-transparent" />;

            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            );
            const dayClasses = getClassesForDate(date);
            const hasClasses = dayClasses.length > 0;

            const isSelected =
              selectedDate && moment(date).isSame(moment(selectedDate), "day");

            const courseName = dayClasses[0]?.course?.courseName || "";
            const courseColorClass = getCourseColorClass(courseName);
            const dayKey = moment(date).format("YYYY-MM-DD");

            return (
              <div
                key={i}
                onClick={() => handleDateClick(date, courseName)}
                className={`min-h-[80px] rounded-xl flex flex-col items-center justify-start mt-1 p-1 cursor-pointer duration-200
      ${hasClasses ? `border ${courseColorClass}` : "border text-[10px]"}
      ${isToday(day)
                    ? "bg-[#27176518] text-white dark:text-white"
                    : "bg-gray-100 text-gray-500 dark:bg-[#414141] dark:text-white"
                  }

      ${isSelected ? "ring-2 ring-[#576cbc]" : ""}
    `}
              >
                <button onClick={() => handleDateClick(date, courseName)} className="w-full">
                  <div className="font-semibold text-sm text-inherit">{day}</div>

                  {hasClasses && (
                    <div className="w-full mt-0 text-center">
                      <div
                        className={`text-[10px] font-medium truncate -mb-1 ${courseColorClass}`}
                      >
                        {dayClasses[0].course?.courseName}
                      </div>
                      <div className={`text-[9px] truncate -mb-2 ${courseColorClass}`}>
                        {dayClasses[0].startTime[0]} - {dayClasses[0].endTime[0]}
                      </div>
                      {dayClasses[0].scheduleStatus === "Rescheduled" && (
                        <div className={`text-[7px] truncate ${courseColorClass}`}>
                          Rescheduled from  {moment(dayClasses[0].lastUpdatedDate).format("MMM D")}
                        </div>
                      )}
                    </div>
                  )}
                </button>

                {hasClasses && dayClasses.length > 1 && (
                  <div className="w-full flex justify-center mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDayDropdown((prev) => (prev === dayKey ? null : dayKey));
                      }}
                      className="text-[10px] px-2 py-[2px] rounded-full bg-white dark:bg-[#3a3a3a] border border-gray-200 dark:border-[#5c5c5c] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#444]"
                    >
                      +{dayClasses.length - 1} more
                    </button>
                  </div>
                )}

                <AnimatePresence>
                  {openDayDropdown === dayKey && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-white dark:bg-[#3a3a3a] border border-gray-200 dark:border-[#5c5c5c] rounded-xl shadow-lg z-10 overflow-hidden"
                    >
                      <div className="max-h-56 overflow-y-auto py-1">
                        {dayClasses.map((cls: ClassSchedule, idx: number) => (
                          <button
                            key={`${dayKey}-${idx}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDayDropdown(null);
                              handleDateClick(date, cls.course?.courseName || "");
                            }}
                            className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-100 dark:hover:bg-[#4a4a4a]"
                          >
                            <span className="truncate pr-2">{cls.course?.courseName}</span>
                            <span className="text-[10px] text-gray-600 dark:text-gray-300">
                              {cls.startTime[0]} - {cls.endTime[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div>
      <AcademicHeader
        currentSection="Reschedule Class"
        showBackButton={true}
        showBackPath="managestudentview"
      />
      <div className="p-2">
        <div className="mx-auto gap-4 flex flex-col md:flex-row overflow-hidden h-[630px]">
          <div className="w-full md:w-2/3 p-6 bg-white dark:bg-[#343434] shadow-md rounded-xl">
            <div className="flex space-x-4 text-sm font-medium mb-4">
              {["Monthly", "Weekly", "Daily"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveView(tab.toLowerCase() as any)}
                  className={`pb-2 text-sm font-medium ${activeView === tab.toLowerCase()
                      ? "text-[#576cbc] border-b-2 border-[#576cbc]"
                      : "text-gray-400"
                    } pb-1`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeView === "monthly" && (
              <MonthlyView
                currentDate={currentDate}
                selectedDate={selectedDate}
                handleDateClick={handleDateClick}
                handlePrevMonth={handlePrevMonth}
                handleNextMonth={handleNextMonth}
                scheduledClasses={scheduledClasses}
                formatMonthYear={formatMonthYear}
                getDaysInMonth={getDaysInMonth}
                getFirstDayOfMonth={getFirstDayOfMonth}
              />
            )}

            {activeView === "weekly" && (
              <WeeklyView
                selectedDate={selectedDate}
                scheduledClasses={scheduledClasses}
              />
            )}

            {activeView === "daily" && (
              <DailyView
                selectedDate={selectedDate}
                scheduledClasses={scheduledClasses}
              />
            )}
          </div>

          <div className="w-full md:w-1/3 bg-white dark:bg-[#343434] rounded-xl p-6 shadow-md">
            <h3 className="text-[16px] font-medium text-[#111111] dark:text-white mb-4">
              Available Teachers
            </h3>

            <div className="divide-y divide-gray-200 dark:divide-gray-600 max-h-[600px] overflow-y-auto scrollbar-none ">
              {availableTeachers.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-300 py-4">
                  No teachers available.
                </p>
              ) : (
                <AnimatePresence>
                  <div className="h-[550px] bg-gray-50 dark:bg-[#414141] p-4 rounded-xl">
                    {(() => {
                      const yourTeacher = groupedByTeacher.filter((g) => g.teacherId === currentTeacherId);
                      const otherTeachers = groupedByTeacher.filter((g) => g.teacherId !== currentTeacherId);
                      const renderGroup = (group: { teacherId: string; name: string; slots: { fromTime: string; toTime: string }[] }) => {
                        const selected = selectedSlotByTeacher[group.teacherId] || group.slots[0] || null;
                        return (
                          <motion.div
                            key={group.teacherId}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.25 }}
                            className="flex items-center justify-between py-4 px-2 border-b-2 dark:border-[#5c5c5c]"
                          >
                            {/* Left Side */}
                            <div className="flex items-center gap-4">
                              <img
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${group.name}`}
                                alt={group.name}
                                className="w-10 h-10 rounded-full"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-white">
                                  {toTitleCase(group.name)}
                                </p>
                              </div>
                            </div>

                            {/* Right Side */}
                            <div className="flex items-center gap-2 relative">
                              <button
                                onClick={() => setOpenDropdownFor((prev) => (prev === group.teacherId ? null : group.teacherId))}
                                className="flex items-center gap-2 border border-gray-200 dark:border-[#5c5c5c] bg-gray-100 dark:bg-[#4a4a4a] hover:bg-gray-200 dark:hover:bg-[#5a5a5a] rounded-full pl-2 pr-3 py-1 transition"
                              >
                                <span className="inline-flex items-center gap-1 text-[12px] font-medium text-gray-700 dark:text-gray-100 bg-white dark:bg-[#3f3f3f] border border-gray-200 dark:border-[#5c5c5c] rounded-full px-2 py-[2px]">
                                  <MdAccessTime className="text-gray-500" />
                                  {selected ? `${selected.fromTime} - ${selected.toTime}` : "Select slot"}
                                </span>
                                <MdExpandMore className={`text-gray-600 dark:text-gray-200 transition-transform ${openDropdownFor === group.teacherId ? "rotate-180" : "rotate-0"}`} />
                              </button>

                              <AnimatePresence>
                                {openDropdownFor === group.teacherId && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-10 top-full mt-2 w-56 bg-white dark:bg-[#3a3a3a] border border-gray-200 dark:border-[#5c5c5c] rounded-xl shadow-lg z-10 overflow-hidden"
                                  >
                                    <div className="max-h-64 overflow-y-scroll scrollbar-none py-1">
                                      {group.slots.map((slot, idx) => {
                                        const isActive = selected && selected.fromTime === slot.fromTime && selected.toTime === slot.toTime;
                                        return (
                                          <div className="rounded-lg mx-1" key={`${group.teacherId}-${idx}`}>
                                            <button
                                              onClick={() => {
                                                setSelectedSlotByTeacher((prev) => ({
                                                  ...prev,
                                                  [group.teacherId]: { fromTime: slot.fromTime, toTime: slot.toTime },
                                                }));
                                                setOpenDropdownFor(null);
                                              }}
                                              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between rounded-lg hover:bg-gray-100 dark:hover:bg-[#4a4a4a] ${isActive ? "bg-gray-100 dark:bg-[#4a4a4a]" : ""}`}
                                            >
                                              <span className="flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 dark:text-gray-100 bg-gray-50 dark:bg-[#2f2f2f] border border-gray-200 dark:border-[#5c5c5c] rounded-full px-2 py-[1px]">
                                                  <MdAccessTime className="text-gray-500" />
                                                  {slot.fromTime} - {slot.toTime}
                                                </span>
                                              </span>
                                              {isActive && (
                                                <span className="text-[10px] text-[#576CBC] font-semibold">Selected</span>
                                              )}
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <button
                                onClick={() => {
                                  const chosen = selected || group.slots[0];
                                  if (!chosen) return;
                                  handleTeacherClick({
                                    teacherId: group.teacherId,
                                    name: group.name,
                                    fromTime: chosen.fromTime,
                                    toTime: chosen.toTime,
                                    isStatus: true,
                                  } as TeacherSlot);
                                }}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-[#5c5c5c] rounded-full transition"
                              >
                                <MdOutlineKeyboardArrowRight className="text-xl text-gray-500 dark:text-[#5c5c5c]" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      };

                      return (
                        <>
                          {yourTeacher.length > 0 && (
                            <div className="mb-2">
                              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 px-2">Your Teacher</h4>
                              <div className="mt-1">
                                {yourTeacher.map(renderGroup)}
                              </div>
                            </div>
                          )}

                          {otherTeachers.length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 px-2">Other Teachers</h4>
                              <div className="mt-1">
                                {otherTeachers.map(renderGroup)}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>

      {/*reschdule*/}
      {isRescheduleOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg dark:bg-[#343434]">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 dark:text-[#fff]">
              Reschedule
            </h2>

            <label
              htmlFor="reason"
              className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#fff]"
            >
              Reason for Reschedule
            </label>
            <textarea
              rows={4}
              placeholder="Enter reason..."
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              className="w-full border border-gray-300 dark:border-[#5c5c5c] rounded-md p-2 focus:outline-none dark:bg-[#5c5c5c]"
            />

            <div className="border-t mt-6 pt-4 flex justify-end gap-3 dark:border-[#5c5c5c]">
              <button
                onClick={() => {
                  setIsRescheduleOpen(false);
                  setRescheduleReason("");
                  setSelectedTeacher(null);
                }}
                className="px-4 py-2 rounded-md border border-[#576CBC] text-[#576CBC]"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleSubmit}
                className="px-4 py-2 rounded-md bg-[#576CBC] text-white hover:bg-[#4559a5]"
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
    </div>
  );
};

export default SchedulePage;
