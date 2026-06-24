"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { CalendarX2, Clock } from "lucide-react";
import axios, { AxiosError } from "axios";
import moment from "moment";
import { useRouter, useSearchParams } from "next/navigation";
import BaseLayout from "@/app/(tenant)/modules/users/teacher/components/BaseLayout";
import TeacherHeader from "../../components/TeacherHeader";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface ClassScheduleResponse {
  totalCount: number;
  students: ClassSchedule[];
}
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

const TeachersSchedule = () => {
  const [activeView, setActiveView] = useState<"monthly" | "weekly" | "daily">(
    "monthly"
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState<ClassSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [success, setSucces] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const router = useRouter();
  const Search = useSearchParams();
  const teacherId = Search.get("classId");
  const [rescheduleDate, setRescheduleDate] = useState("");

  const [formData, setFormData] = useState({
    date: moment().format("YYYY-MM-DD"),
    fromTime: moment().format("HH:mm"),
    toTime: moment().add(1, "hour").format("HH:mm"),
    comment: "",
    meetingId: "",
    applyToAll: false,
  });

  const tabs: Array<"monthly" | "weekly" | "daily"> = [
    "monthly",
    "weekly",
    "daily",
  ];

  // Sync rescheduleDate with formData.date
  useEffect(() => {
    setRescheduleDate(formData.date);
  }, [formData.date]);

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
    const fetchMeetings = async () => {
      try {
        const classId = Search.get("classId");
        const teacherId =
          typeof window !== "undefined"
            ? localStorage.getItem("TeacherPortalId")
            : null;
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("TeacherAuthToken")
            : null;
        if (!token) {
          console.error("❌ AcademicCoachAuthToken not found");
          return;
        }

        const response = await axios.get(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TEACHER_CLASSES}`,

          {
            params: { teacherId },
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
          const matchedMeeting = sortedMeetings.find((m) => m._id === classId);
          const fallbackDate = new Date();
          const selectedMeetingDate = matchedMeeting
            ? new Date(matchedMeeting.startDate)
            : fallbackDate;

          const formattedDate =
            moment(selectedMeetingDate).format("YYYY-MM-DD");
          setSelectedDate(selectedMeetingDate);
          setFormData({
            date: formattedDate,
            fromTime:
              matchedMeeting?.startTime?.[0] ?? moment().format("HH:mm"),
            toTime:
              matchedMeeting?.endTime?.[0] ??
              moment().add(1, "hour").format("HH:mm"),
            comment: "",
            meetingId: matchedMeeting?._id ?? "",
            applyToAll: false,
          });

          setRescheduleDate(formattedDate);
        }
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };

    fetchMeetings();
  }, [teacherId]);
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
      return moment(selectedDate).format("MMMM YYYY");
    } else if (activeView === "weekly") {
      const start = moment(selectedDate).startOf("week");
      const end = moment(selectedDate).endOf("week");
      return `${start.format("MMM D")} - ${end.format("MMM D, YYYY")}`;
    } else {
      return moment(selectedDate).format("dddd, MMMM D, YYYY");
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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dayMeetings = getMeetingsForDate(date);
    const dateFormatted = moment(date).format("YYYY-MM-DD");

    if (dayMeetings.length > 0) {
      const firstMeeting = dayMeetings[0];
      setFormData({
        date: dateFormatted,
        fromTime: firstMeeting.startTime?.[0] || moment().format("HH:mm"),
        toTime:
          firstMeeting.endTime?.[0] || moment().add(1, "hour").format("HH:mm"),
        comment: "",
        meetingId: firstMeeting._id,
        applyToAll: false,
      });
    } else {
      setFormData((prev) => ({
        date: dateFormatted,
        fromTime: prev.fromTime || moment().format("HH:mm"),
        toTime: prev.toTime || moment().add(1, "hour").format("HH:mm"),
        comment: "",
        meetingId: "",
        applyToAll: false,
      }));
    }

    setRescheduleDate(dateFormatted);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("TeacherAuthToken") : null;
      if (!token) {
        setFailedMessage("Please login !");
      }
      const classId = Search.get("classId");
      const payload = {
        _id: classId,
        requestDate: formData.date,
        fromTime: formData.fromTime,
        toTime: formData.toTime,
        requestedBy: "teacher",
        comment: formData.comment || "",
      };

      const response = await axios.put(
             `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.UPDATE_CLASS_REQUEST_RESCHEDULE}`,

        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if ([200, 201].includes(response.status)) {
        setSucces(true);
        setTimeout(() => {
          router.push(`/modules/users/teacher/ui/schedule`)
        }, 3000);
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const WeeklyView = () => {
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const startOfWeek = moment(selectedDate).startOf("week").toDate();
    const endOfWeek = moment(selectedDate).endOf("week").toDate();

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
        const date = moment(selectedDate)
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
                     ${isSelected
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
                          className={`text-xs sm:text-sm font-medium ${isSelected
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
                            className={`text-xs sm:text-sm font-semibold ${isSelected
                                ? "text-black dark:text-white"
                                : "text-gray-800 dark:text-white"
                              }`}
                          >
                            {day}
                          </div>
                          <div
                            className={`text-[10px] ${isSelected
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
                          className={`text-[10px] px-2 py-1 rounded-lg ${isSelected
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
                        {meeting.student.studentFirstName}{" "}
                        {meeting.student.studentLastName}
                      </div>
                      {meeting.classLink && (
                        <a
                          href={meeting.classLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-blue-500 dark:text-blue-400 hover:underline"
                        >
                          Join Class
                        </a>
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
    const daysInMonth = getDaysInMonth(selectedDate ?? new Date());
    const firstDayOfMonth = getFirstDayOfMonth(selectedDate ?? new Date());

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
        <div className="w-full p-1 grid grid-cols-7 gap-1 text-[10px] sm:text-xs md:text-sm overflow-y-auto scrollbar-none scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#555] h-[320px] sm:h-[380px] md:h-[440px] lg:h-[500px]">
          {totalDays.map((day, i) => {
            if (day === null) {
              return (
                <div
                  key={i}
                  className="min-h-[40px] sm:min-h-[50px] md:min-h-[60px] lg:min-h-[80px] bg-transparent"
                />
              );
            }

            const year = selectedDate?.getFullYear() ?? new Date().getFullYear();
            const month = selectedDate?.getMonth() ?? new Date().getMonth();
            const dayNum = day ?? new Date().getDate();

            const date = new Date(year, month, dayNum);
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
               ${hasMeetings
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
                  className={`font-medium text-[10px] sm:text-xs ${isTodayFlag ? "text-[#4b8cc9] dark:text-[#7a94e8]" : ""
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
    <BaseLayout>
      <TeacherHeader
        currentSection="Re-Schedule Class"
        showBackButton={true}
        showBackPath="schedule"
      />
      <div className="p-2">
        <div className="mx-auto gap-4 flex flex-col lg:flex-row overflow-hidden min-h-[calc(100vh-150px)]">
          {/* Left Side - Calendar View */}
          <div className="w-full lg:w-2/3 p-2 sm:p-4 md:p-6 bg-white dark:bg-[#343434] shadow-md rounded-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
              {/* Tabs (left aligned) */}
              <div className="flex space-x-2 sm:space-x-4 text-xs sm:text-sm font-medium">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveView(tab)}
                    className={`capitalize ${activeView === tab
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
          <div className="w-full lg:w-1/3 bg-white dark:bg-[#343434] shadow-md rounded-xl flex flex-col min-h-[300px] lg:min-h-[unset]">
            <div className="p-3 sm:p-4 md:p-5 lg:p-6">
              <div className="mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
                  Re-Schedule
                </h3>
              </div>

              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div>
                  <label
                    htmlFor="gcuyc"
                    className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => {
                      const date = e.target.value;
                      setRescheduleDate(date);
                    }}
                    min={moment().format("YYYY-MM-DD")}
                    className="w-full h-[36px] sm:h-[38px] md:h-[42px] px-3 border border-gray-300 dark:border-none rounded-md bg-white dark:bg-[#414141] text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:border-transparent dark:[color-scheme:dark]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label
                      htmlFor="gcuyc"
                      className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      From Time
                    </label>
                    <input
                      type="time"
                      value={formData.fromTime}
                      onChange={(e) =>
                        handleInputChange("fromTime", e.target.value)
                      }
                      className="w-full h-[36px] sm:h-[38px] md:h-[42px] px-3 border border-gray-300 dark:border-none rounded-md bg-white dark:bg-[#414141] text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:border-[#5C5C5C] dark:[color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="gcuyc"
                      className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      To Time
                    </label>
                    <input
                      type="time"
                      value={formData.toTime}
                      onChange={(e) =>
                        handleInputChange("toTime", e.target.value)
                      }
                      className="w-full h-[36px] sm:h-[38px] md:h-[42px] px-3 border border-gray-300 dark:border-none rounded-md bg-white dark:bg-[#414141] text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:border-[#5C5C5C] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="gcuyc"
                    className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Reason for Re-Schedule
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) =>
                      handleInputChange("comment", e.target.value)
                    }
                    rows={3}
                    className="w-full h-[80px] sm:h-[90px] md:h-[110px] px-3 py-2 border border-gray-300 dark:border-none rounded-md bg-white dark:bg-[#414141] text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none dark:border-[#5C5C5C] dark:[color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1"></div>

            <div className="p-3 sm:p-4 md:p-5 lg:p-6 sticky bottom-0 bg-white dark:bg-[#343434] z-10">
              <hr className="w-full border-t-[1px] border-[#dbdada] dark:border-[#5C5C5C] mb-3 sm:mb-4" />
              <div className="flex justify-end">
                <button
                  type="submit"
                  onClick={handleFormSubmit}
                  className="px-2 py-1 sm:px-3 sm:py-1 bg-[#576CBC] text-white rounded hover:bg-[#4459A9] text-sm sm:text-base"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
        {success && (
          <SuccessPopup
            onClose={() => setSucces(false)}
            title=" Request"
          />
        )}
        {failed && (
          <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
        )}
      </div>
    </BaseLayout>
  );
};

export default TeachersSchedule;
