"use client";

import React, { useEffect, useState } from "react";
import moment from "moment";
import { CalendarDays, Clock } from "lucide-react";
import { FaClock } from "react-icons/fa";
import { BsFillCalendar2WeekFill } from "react-icons/bs";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import AdminHeader from "@/app/(tenant)/modules/users/admin-main/components/AdminHeader";
import BaseLayout4 from "../../../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

// --- Interfaces ---
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

interface ClassSchedule {
  student: Student;
  teacher: Teacher;
  _id: string;
  classDay: string[];
  package: string;
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
  amount: string;
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

const SchedulePage = () => {
  const [activeView, setActiveView] = useState<"monthly" | "weekly" | "daily">("monthly");
  const [selectedDate, setSelectedDate] = useState<string>(moment().format("YYYY-MM-DD"));
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<Event[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [classSchedule, setClassSchedule] = useState<ClassSchedule[]>([]);
   const searchparam = useSearchParams();
  const employeeId = searchparam.get('teacherId');

  const tabs = ["monthly", "weekly", "daily"] as const;

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("AdminAuthToken") : null;
    if (!token || !employeeId) {
      console.error("❌ AdminAuthToken or teacherId not found");
    return;
    }
    axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TEACHER_CLASSES}?teacherId=${employeeId}`,
          {
            headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => {
        setClassSchedule(response.data.classSchedule ?? []);
      })
      .catch((error) => console.error("Error fetching class schedule: ", error));
  }, [employeeId]);

  useEffect(() => {
    setEvents(
      classSchedule.map((item) => ({
          id: item._id,
        title: `${item.package} Class`,
        start: item.startTime[0] || '',
        end: item.endTime[0] || '',
        description: `Session Status: ${item.scheduleStatus}`,
        date: moment(item.startDate).format("YYYY-MM-DD"),
        status: item.scheduleStatus,
      }))
    );
  }, [classSchedule]);

  useEffect(() => {
    const filteredEvents = events.filter((event) => event.date === selectedDate);
    setEventsForSelectedDate(filteredEvents);
  }, [selectedDate, events]);

  const handleDateClick = (date: Date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    setSelectedDate(formattedDate);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return firstDay.getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleString("default", { month: "long", year: "numeric" }).toUpperCase();
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
    const startOfWeek = moment(currentDate).startOf("week").toDate();
    const endOfWeek = moment(currentDate).endOf("week").toDate();
    const weekEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });
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
            {moment(startOfWeek).format("MMM D")} - {moment(endOfWeek).format("MMM D, YYYY")}
          </h3>
        </div>
        <div className="space-y-2">
          {[
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ].map((day) => {
            const dayEvents = eventsByDay[day] || [];
            const isSelected = selectedDay === day;
            const date = moment(
              weekEvents.find((e) => moment(e.date).format("dddd") === day)?.date
            );
            return (
              <div key={day} className="flex flex-col">
                <button
                  onClick={() => handleDayClick(day)}
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
                        <div className={`text-base font-semibold ${isSelected ? "dark:text-white text-black" : "text-gray-800 dark:text-white"}`}>{day}</div>
                        <div className={`text-[10px] ${isSelected ? "bg:text-white/80" : "text-gray-500 dark:text-gray-400"}`}>{date && typeof date.format === 'function' ? date.format("MMMM D, YYYY") : ''}</div>
                      </div>
                    </div>
                    {dayEvents.length > 0 && (
                      <div className={`text-[10px] px-3 py-1 rounded-lg ${isSelected ? "dark:bg-[#555555] dark:text-white text-black bg-[#eae9e9]"
                        : "dark:bg-[#555555] dark:text-white text-black bg-[#eae9e9]"
                      }`}>{dayEvents.length} {dayEvents.length === 1 ? "Event" : "Events"}</div>
                    )}
                  </div>
                </button>
                {isSelected && dayEvents.length > 0 && (
                  <div className="w-full mt-2 space-y-2 pl-4">
                    {dayEvents.map((event, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#576cbc]/10 dark:bg-[#414141] bg-[#f7f7f7] relative"
>
                        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-lg dark:bg-[#555555] bg-[#f7f7f7]"></div>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-semibold text-[#576cbc]">{event.title}</div>
                            {event.status && (
                              <span className={`text-[10px] font-bold px-2 py-1 rounded ml-1 ${event.status === 'Scheduled' ? ' text-blue-700' : event.status === 'Completed' ? ' text-green-700' : event.status === 'Rescheduled' ? ' text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>{event.status}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-300">
                          <Clock size={12} />
                              {moment(event.start, 'HH:mm').format("h:mm A")} - {moment(event.end, 'HH:mm').format("h:mm A")}
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-600 dark:text-gray-300 mt-1">{event.description}</div>
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
    const dayEvents = getEventsForDate(currentDate);
    return (
      <div className="space-y-4 h-[540px] overflow-y-scroll scrollbar-none">
        {dayEvents.map((event, idx) => (
          <div key={idx}
          className="p-4 text-gray-500 mb-2 dark:bg-[#414141] bg-gray-100 rounded-xl dark:text-[#fff]">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-semibold text-[#576cbc]">{event.title}</div>
                {event.status && (
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ml-1 ${event.status === 'Scheduled' ? ' text-blue-700' : event.status === 'Completed' ? ' text-green-700' : event.status === 'Rescheduled' ? ' text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>{event.status}</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-300">
                <Clock size={12} />
                {moment(event.start, 'HH:mm').format("h:mm A")} - {moment(event.end, 'HH:mm').format("h:mm A")}
              </div>
            </div>
            <div className="text-[10px] text-gray-400 mt-1">{event.description}</div>
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
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day as number);
            const dayEvents = getEventsForDate(date);
            const hasEvents = dayEvents.length > 0;
            return (
              <button
                key={i}
                onClick={() => handleDateClick(date)}
                className={`min-h-[80px] rounded-xl flex flex-col items-center justify-start mt-1 p-1 cursor-pointer ${
                  hasEvents
                    ? "border border-[#576cbc] text-[#576cbc] bg-[#576cbc]/10"
                    : isToday(day as number)
                    ? "bg-[#27176518] text-white"
                    : "bg-gray-100 dark:bg-[#414141] dark:text-[#fff] text-gray-500"
                }`}
              >
                <div className={`font-semibold ${isToday(day as number) ? "dark:text-[#4b8cc9] text-[#4b8cc9]" : ""}`}>{day}</div>
                {hasEvents && (
                  <div className="w-full overflow-hidden">
                    <div className="text-[8px] truncate px-1">{dayEvents[0].title}</div>
                    <div className="text-[8px] truncate px-1">{dayEvents[0].start} - {dayEvents[0].end}</div>
                    {dayEvents[0].status && (
                      <span className={`text-[8px] font-bold px-1 rounded ml-1 ${dayEvents[0].status === 'Scheduled' ? ' text-blue-700' : dayEvents[0].status === 'Completed' ? ' text-green-700' : dayEvents[0].status === 'Rescheduled' ? ' text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>{dayEvents[0].status}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <BaseLayout4>
    <AdminHeader currentSection="Calendar" showBackButton={true} showBackPath={`/modules/users/admin-main/ui/employees/teacher?teacherId=${employeeId}`} />
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
                    className={`capitalize ${activeView === tab ? "text-[#576cbc] border-b-2 border-[#576cbc]" : "text-gray-400"} pb-1`}
                  >
                    {tab}
                  </button>
                ))}
          </div>
              <div className="flex items-center gap-2">
                <button onClick={handlePrevMonth}                         className="py-[1px] px-2 rounded-lg bg-gray-100 dark:bg-[#414141] hover:bg-gray-200 dark:hover:bg-[#505050] transition-colors"
                >&lt;</button>
                <h2 className="text-[16px] font-semibold">{formatMonthYear(currentDate)}</h2>
                <button onClick={handleNextMonth} className="py-[1px] px-2 rounded-lg bg-gray-100 dark:bg-[#414141] hover:bg-gray-200 dark:hover:bg-[#505050] transition-colors"
                >&gt;</button>
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
                  {eventsForSelectedDate.length > 0 ? (
                  eventsForSelectedDate.map((item, index) => {
                    const textColors = [
                      "text-[#d77277]",
                      "text-[#72B0D7]",
                      "text-[#BF63B3]",
                      "text-[#BFBC63]",
                      "text-[#BF8C63]",
                      "text-[#6EBF63]"
                    ];
                    const currentTextColor = textColors[index % textColors.length];
                    return (
                      <div key={item.id} className="border-b pb-2 border-[#dadada] dark:border-[#5b5b5b]">
                        <div className="flex justify-between">
                          <h3 className={`font-medium text-[14px] ${currentTextColor}`}>{item.title}</h3>
                          <div>
                            <div className="flex gap-4">
                              <div className="text-[9px] text-gray-500 flex items-center gap-1 dark:text-[#f4f4f4]">
                                <FaClock size={10} />
                                {item.start} - {item.end}
                              </div>
                              <span className="text-[9px] text-gray-500 flex items-center gap-1 dark:text-[#f4f4f4]">
                                <BsFillCalendar2WeekFill size={10} /> {moment(item.date).format("DD MMM YYYY")}
                          </span>
                        </div>
                          </div>
                        </div>
                        <p className="text-[10px] font-light text-[#333] dark:text-[#fff] mt-2">{item.description || ""}</p>
                      </div>
                    );
                  })
                  ) : (
                    <p className="text-gray-500 text-[12px] text-center">No events scheduled</p>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout4>
  );
};

export default SchedulePage;
