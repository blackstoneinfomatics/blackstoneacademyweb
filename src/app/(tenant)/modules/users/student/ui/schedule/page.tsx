"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import BaseLayout2 from "@/app/(tenant)/modules/users/student/components/BaseLayout2";
import moment from "moment";
import { Clock } from "lucide-react";
import { FaClock } from "react-icons/fa";
import { BsFillCalendar2WeekFill } from "react-icons/bs";
import StudentHeader from "../../components/StudentHeader";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

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

interface ClassSchedule {
  student: Student;
  teacher: Teacher;
  course: Course;
  earnings: number;
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
  amount: string;
  sessionStatus: string;
}

interface ClassScheduleApiResponse {
  totalCount: number;
  classSchedule: ClassSchedule[];
}

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  date: string;
  status?: string;
}

const StudentSchedulePage = () => {
  const [activeView, setActiveView] = useState<"monthly" | "weekly" | "daily">(
    "monthly"
  );

  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<Event[]>(
    []
  );
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [classSchedule, setClassSchedule] = useState<ClassSchedule[]>([]);

  const tabs = ["monthly", "weekly", "daily"] as const;

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("StudentAuthToken")
        : null;
    const studentId =
      typeof window !== "undefined"
        ? localStorage.getItem("StudentPortalId")
        : null;

    if (!token || !studentId) {
      toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      return;
    }

    fetch(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET_CLASSSHEDULE_STUDENTS}?studentId=${studentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data: ClassScheduleApiResponse) => {
        setClassSchedule(data.classSchedule);
      })
      .catch((error) => {
        console.error("Error fetching class schedule: ", error);
        toast.error(AppFailureToastMessages.CLASS_FETCH);
      });
  }, []);

  useEffect(() => {
    setEvents(
      classSchedule.map((item) => ({
        id: item._id,
        title: `${item.course.courseName} with ${item.teacher.teacherName}`,
        start: item.startTime[0] || "",
        end: item.endTime[0] || "",
        description: `${item.package} | ${item.scheduleStatus}`,
        date: moment(item.startDate).format("YYYY-MM-DD"),
        status: item.scheduleStatus,
      }))
    );
  }, [classSchedule]);

  const handleDateClick = (date: Date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");

    const filteredEvents = events.filter(
      (event) => event.date === formattedDate
    );
    setEventsForSelectedDate(filteredEvents);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return firstDay.getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const formatMonthYear = (date: Date) => {
    return date
      .toLocaleString("default", { month: "long", year: "numeric" })
      .toUpperCase();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const WeeklyView = () => {
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const currentDate = new Date();
    // Get start and end of current week
    const startOfWeek = moment(currentDate).startOf("week");
    const endOfWeek = moment(currentDate).endOf("week");

    // Create an array of days in the week with their dates
    const daysInWeek = [];
    let currentDay = startOfWeek.clone();

    while (currentDay <= endOfWeek) {
      daysInWeek.push({
        name: currentDay.format("dddd"),
        date: currentDay.format("YYYY-MM-DD"),
        formattedDate: currentDay.format("MMMM D, YYYY"),
      });
      currentDay = currentDay.clone().add(1, "days");
    }

    // Filter events for current week
    const weekEvents = events.filter((event) => {
      const eventDate = moment(event.date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });

    // Group events by day
    const eventsByDay = weekEvents.reduce((acc, event) => {
      const day = moment(event.date).format("dddd");
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(event);
      return acc;
    }, {} as Record<string, Event[]>);

    const handleDayClick = (day: string) => {
      setSelectedDay(selectedDay === day ? null : day);
    };

    return (
      <div className="space-y-4 h-[540px] overflow-y-scroll scrollbar-none">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold">
            {startOfWeek.format("MMM D")} - {endOfWeek.format("MMM D, YYYY")}
          </h3>
        </div>

        <div className="space-y-2">
          {daysInWeek.map((dayInfo) => {
            const dayEvents = eventsByDay[dayInfo.name] || [];
            const isSelected = selectedDay === dayInfo.name;

            return (
              <div key={dayInfo.name} className="flex flex-col">
                <button
                  onClick={() => handleDayClick(dayInfo.name)}
                  className={`w-full p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "dark:bg-[#414141] bg-[#f7f7f7] dark:text-white text-black"
                      : dayEvents.length > 0
                      ? "dark:bg-[#414141] bg-[#f7f7f7] hover:shadow-lg text-black"
                      : "bg-[#f7f7f7] dark:bg-[#414141] text-black"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div
                          className={`text-base font-semibold ${
                            isSelected
                              ? "dark:text-white text-black"
                              : "text-gray-800 dark:text-white"
                          }`}
                        >
                          {dayInfo.name}
                        </div>
                        <div
                          className={`text-[10px] ${
                            isSelected
                              ? "bg:text-white/80"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {dayInfo.formattedDate}
                        </div>
                      </div>
                    </div>
                    {dayEvents.length > 0 && (
                      <div
                        className={`text-[10px] px-3 py-1 rounded-lg ${
                          isSelected
                            ? "dark:bg-[#555555] dark:text-white text-black bg-[#eae9e9]"
                            : "dark:bg-[#555555] dark:text-white text-black bg-[#eae9e9]"
                        }`}
                      >
                        {dayEvents.length}{" "}
                        {dayEvents.length === 1 ? "Event" : "Events"}
                      </div>
                    )}
                  </div>
                </button>

                {/* Event Details */}
                {isSelected && dayEvents.length > 0 && (
                  <div className="w-full mt-2 space-y-2 pl-4">
                    {dayEvents.map((event, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[#576cbc]/10 dark:bg-[#414141] bg-[#f7f7f7] relative"
                      >
                        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-lg dark:bg-[#555555] bg-[#f7f7f7]"></div>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-semibold text-[#576cbc]">
                              {event.title}
                            </div>
                            {event.status && (
                              <span
                                className={`text-[10px] font-bold px-2 py-1 rounded ml-1
                                  ${
                                    event.status === "Scheduled"
                                      ? " text-blue-700"
                                      : event.status === "Completed"
                                      ? " text-green-700"
                                      : event.status === "Rescheduled"
                                      ? " text-yellow-700"
                                      : "bg-gray-200 text-gray-700"
                                  }`}
                              >
                                {event.status}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-300">
                              <Clock size={12} />
                              {moment(event.start, "HH:mm").format(
                                "h:mm A"
                              )} - {moment(event.end, "HH:mm").format("h:mm A")}
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-600 dark:text-gray-300 mt-1">
                          {event.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const DailyView = () => {
    const currentDate = new Date();
    const dayEvents = getEventsForDate(currentDate);

    return (
      <div className="space-y-4 h-[500px] overflow-y-scroll scrollbar-none">
        {dayEvents.map((event, idx) => (
          <div
            key={idx}
            className="p-4 text-gray-500 mb-2 dark:bg-[#414141] bg-gray-100 rounded-xl dark:text-[#fff]"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-semibold text-[#576cbc]">
                  {event.title}
                </div>
                {event.status && (
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded ml-1
                      ${
                        event.status === "Scheduled"
                          ? " text-blue-700"
                          : event.status === "Completed"
                          ? " text-green-700"
                          : event.status === "Rescheduled"
                          ? " text-yellow-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                  >
                    {event.status}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-300">
                <Clock size={12} />
                {moment(event.start, "HH:mm").format("h:mm A")} -{" "}
                {moment(event.end, "HH:mm").format("h:mm A")}
              </div>
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              {event.description}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const MonthlyView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyCells = Array.from({ length: firstDayOfMonth }, (_, i) => null);
    const totalDays = [...emptyCells, ...days];
    const handleDayClick = (date: Date, day: number) => {
      const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
      const dayEvents = getEventsForDate(date);

      if (dayEvents.length > 0) {
        setOpenDropdown(openDropdown === dateKey ? null : dateKey);
      }

      handleDateClick(date);
    };
    return (
      <>
        <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-500 mb-2 dark:bg-[#414141] bg-gray-100 rounded-xl p-2 dark:text-[#fff]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 text-sm h-[470px] overflow-scroll scrollbar-none">
          {totalDays.map((day, i) => {
            if (day === null) {
              return <div key={i} className="min-h-[80px] bg-transparent" />;
            }

            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            );
            const dayEvents = getEventsForDate(date);
            const hasEvents = dayEvents.length > 0;
            const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
            const isDropdownOpen = openDropdown === dateKey;
            const columnIndex = i % 7;
            const isRightSide = columnIndex >= 4;

            return (
              <div key={i} className="relative calendar-dropdown-container">
                <button
                  key={i}
                  onClick={() => day && handleDayClick(date, day)}
                  disabled={!day}
                  className={`min-h-[80px] sm:min-h-[100px] rounded-xl flex flex-col items-center justify-start mt-1 p-1 sm:p-2 cursor-pointer w-full transition-all duration-200
      ${
        !day
          ? "bg-gray-100 dark:bg-[#414141] text-transparent cursor-default opacity-50"
          : hasEvents
          ? "border border-[#576cbc] text-[#576cbc] bg-[#576cbc]/10"
          : isToday(day)
          ? "bg-[#27176518] text-[#4b8cc9]"
          : "bg-gray-100 dark:bg-[#414141] dark:text-[#fff] text-gray-500"
      }`}
                >
                  {/* Day number */}
                  <div
                    className={`font-semibold text-xs sm:text-sm ${
                      isToday(day) ? "dark:text-[#4b8cc9] text-[#4b8cc9]" : ""
                    }`}
                  >
                    {day}
                  </div>

                  {/* Event badge */}
                  {hasEvents && (
                    <div className="mt-1 px-2 py-0.5 rounded-md bg-[#576cbc] text-white text-[10px] sm:text-[11px] font-semibold">
                      {dayEvents.length}{" "}
                      {dayEvents.length === 1 ? "Event" : "Events"}
                    </div>
                  )}
                </button>

                {/* Dropdown (event list) */}
                {isDropdownOpen && hasEvents && (
                  <div
                    className={`absolute top-full ${
                      isRightSide ? "right-0" : "left-0"
                    } mt-1 z-50 w-44 sm:w-56 bg-white dark:bg-[#343434] rounded-lg shadow-lg border border-[#576cbc] dark:border-gray-600 p-3`}
                  >
                    <div className="text-[10px] font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      {moment(date).format("MMMM D, YYYY")}
                    </div>

                    <div className="space-y-2 h-24 overflow-y-auto scrollbar-none">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-2 rounded-lg bg-[#576cbc]/10 dark:bg-[#414141] border-l-2 border-[#576cbc]"
                        >
                          <div className="text-[11px] font-semibold text-[#576cbc] dark:text-[#576cbc]">
                            {event.title}
                          </div>

                         
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <BaseLayout2>
      <StudentHeader currentSection="Calendar" />
      <div className="p-2">
        <div className="mx-auto gap-4 flex flex-col lg:flex-row overflow-hidden min-h-[630px]">
          {/* Calendar Component */}
          <div className="w-full lg:w-2/3 p-4 md:p-6 bg-white dark:bg-[#343434] shadow-md rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-4 text-sm font-medium">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveView(tab)}
                    className={`capitalize ${
                      activeView === tab
                        ? "text-[#576cbc] border-b-2 border-[#576cbc]"
                        : "text-gray-400"
                    } pb-1`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
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
            </div>

            {activeView === "monthly" && <MonthlyView />}
            {activeView === "weekly" && <WeeklyView />}
            {activeView === "daily" && <DailyView />}
          </div>

          {/* List Schedule */}
          <div className="w-full lg:w-1/3 bg-white dark:bg-[#343434] shadow-md rounded-xl flex flex-col min-h-[630px] lg:h-[630px]">
            <div className="p-4 md:p-6">
              <h2 className="text-[18px] font-semibold mb-3">List Schedule</h2>
              <div className="space-y-3 md:space-y-4">
  {eventsForSelectedDate && eventsForSelectedDate.length > 0 ? (
    [...eventsForSelectedDate]
      .sort((a, b) => {
         const dateA = new Date(`${a.date} ${a.start}`).getTime();
    const dateB = new Date(`${b.date} ${b.start}`).getTime();
        return dateA - dateB; // ascending order
      })
      .map((item, index) => {
        const textColors = [
          "text-[#d77277]",
          "text-[#72B0D7]",
          "text-[#BF63B3]",
          "text-[#BFBC63]",
          "text-[#BF8C63]",
          "text-[#6EBF63]",
        ];
        const currentTextColor = textColors[index % textColors.length];

        return (
          <div
            key={item.id}
            className="border-b pb-2 border-[#dadada] dark:border-[#5b5b5b]"
          >
            <div className="flex justify-between">
              <h3
                className={`font-medium text-[14px] ${currentTextColor}`}
              >
                {item.title}
              </h3>
              <div>
                <div className="flex gap-4">
                  <div className="text-[9px] text-gray-500 flex items-center gap-1 dark:text-[#f4f4f4]">
                    <FaClock size={10} />
                    {item.start} - {item.end}
                  </div>
                  <span className="text-[9px] text-gray-500 flex items-center gap-1 dark:text-[#f4f4f4]">
                    <BsFillCalendar2WeekFill size={10} />{" "}
                    {moment(item.date).format("DD MMM YYYY")}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[10px] font-light text-[#333] dark:text-[#fff] mt-2">
              {item.description || ""}
            </p>
          </div>
        );
      })
  ) : (
    <p className="text-gray-500 text-[12px] text-center">
      No events scheduled
    </p>
  )}
</div>

            </div>
          </div>
        </div>
      </div>
    </BaseLayout2>
  );
};

export default StudentSchedulePage;
