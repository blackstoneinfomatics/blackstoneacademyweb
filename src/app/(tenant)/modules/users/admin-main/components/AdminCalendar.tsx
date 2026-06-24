"use client";

import React, { useEffect, useState } from "react";
import moment from "moment";
import {  Clock } from "lucide-react";
import AdminHeader from "./AdminHeader";
import { FaClock } from "react-icons/fa";
import { BsFillCalendar2WeekFill } from "react-icons/bs";
import BaseLayout4 from "./BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type Teacher = {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  _id?: string;
};

interface Event {
  id: string;
  meetingId?: string;
  title: string;
  start: string;
  end: string;
  description: string;
  date: string;
  meetingStatus?: string;
  teachers?: Teacher[];
}

const AdminCalendar = () => {
  const [activeView, setActiveView] = useState<"monthly" | "weekly" | "daily">("monthly");
  const [selectedDate, setSelectedDate] = useState<string>(moment().format("YYYY-MM-DD"));
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<Event[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(null);

  const tabs = ["monthly", "weekly", "daily"] as const;

  useEffect(() => {
const fetchMeetings = async () => {
  const token = localStorage.getItem("AdminAuthToken");
  if (!token) {
    console.error("❌ AdminAuthToken not found");
    setIsLoading(false);
    return;
  }

  try {
    const response = await fetch(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ADMIN_MEETING.GET_LIST}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch meetings");
    }

    const data = await response.json();

    // Aggregate records by meeting id so a single meeting contains all teachers
    const meetingsMap: Record<string, any> = {};

    (data.data.meetings || []).forEach((meetingGroup: any) => {
      (meetingGroup.records || []).forEach((meeting: any) => {
        const dateStr = moment(meeting.selectedDate).format("YYYY-MM-DD");

        // Build a stable key: prefer backend id, then meetingId, then composite of name+date+start
        const meetingKey =
        meeting.meetingId ||
        `${(meeting.meetingName || "").trim()}_${dateStr}_${meeting.startTime}`;
      
        const teacherArray = Array.isArray(meeting.teacher)
          ? meeting.teacher
          : meeting.teacher
          ? [meeting.teacher]
          : [];

        if (!meetingsMap[meetingKey]) {
          meetingsMap[meetingKey] = {
            id: meetingKey,
            title: meeting.meetingName,
            start: meeting.startTime,
            end: meeting.endTime,
            description: meeting.description,
            date: dateStr,
            meetingStatus: meeting.meetingStatus,
            teachers: [...teacherArray],
          };
        } else {
          const existing = meetingsMap[meetingKey];
          existing.teachers = existing.teachers || [];
          existing.teachers = [...existing.teachers, ...teacherArray];

          // Deduplicate teachers by teacherId, fallback to email/name
          const seen = new Set();
          const unique: any[] = [];
          for (const t of existing.teachers) {
            const key = t?.teacherId ?? t?._id ?? t?.teacherEmail ?? t?.teacherName;
            if (!seen.has(key)) {
              seen.add(key);
              unique.push(t);
            }
          }
          existing.teachers = unique;

          // Merge other meeting-level fields conservatively
          existing.title = existing.title || meeting.meetingName;
          existing.start = existing.start || meeting.startTime;
          existing.end = existing.end || meeting.endTime;
          existing.description = existing.description || meeting.description;
          existing.meetingStatus = existing.meetingStatus || meeting.meetingStatus;
        }
      });
    });

    const mappedEvents = Object.values(meetingsMap);

    setEvents(mappedEvents);
    setIsLoading(false);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    setIsLoading(false);
  }
};

  fetchMeetings();
}, []);

const getUniqueMeetingsById = (list: Event[]) => {
  const map = new Map<string, Event>();

  list.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values());
};

  // Filter events for selected date
  useEffect(() => {
    const filteredEvents = events.filter(
      (event) => event.date === selectedDate
    );
    console.log(`📅 Events for selected date (${selectedDate}):`, filteredEvents);
    setEventsForSelectedDate(filteredEvents);
  }, [selectedDate, events]);

  const handleDateClick = (date: Date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    setSelectedDate(formattedDate);
  };

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const formatMonthYear = (date: Date) => date.toLocaleString("default", { month: "long", year: "numeric" }).toUpperCase();

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = moment(date).format("YYYY-MM-DD");
    const filtered = events.filter((event) => event.date === dateStr);
    console.log(`📌 Events for ${dateStr}:`, filtered);
    return filtered;
  };

  const toggleMeetingDetails = (meetingId: string) => {
    setExpandedMeetingId((prev) => (prev === meetingId ? null : meetingId));
  };

  const WeeklyView = () => {
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    const startOfWeek = moment(currentDate).startOf("week");
    const endOfWeek = moment(currentDate).endOf("week");

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

    const weekEvents = events.filter((event) => {
      const eventDate = moment(event.date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });

    console.log("📆 Week Events:", weekEvents);

    const eventsByDay = weekEvents.reduce((acc, event) => {
      const day = moment(event.date).format("dddd");
      if (!acc[day]) acc[day] = [];
      acc[day].push(event);
      return acc;
    }, {} as Record<string, Event[]>);

    console.log("📌 Events by day:", eventsByDay);

    const handleDayClick = (day: string) => setSelectedDay(selectedDay === day ? null : day);

    return (
      <div className="space-y-4 h-[540px] overflow-y-scroll scrollbar-none">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold">{startOfWeek.format("MMM D")} - {endOfWeek.format("MMM D, YYYY")}</h3>
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
                        <div className={`text-base font-semibold ${isSelected ? "dark:text-white text-black" : "text-gray-800 dark:text-white"}`}>
                          {dayInfo.name}
                        </div>
                        <div className={`text-[10px] ${isSelected ? "bg:text-white/80" : "text-gray-500 dark:text-gray-400"}`}>
                          {dayInfo.formattedDate}
                        </div>
                      </div>
                    </div>
                    {dayEvents.length > 0 && (
                      <div className={`text-[10px] px-3 py-1 rounded-lg ${isSelected ? "dark:bg-[#555555] dark:text-white text-black bg-[#eae9e9]" : "dark:bg-[#555555] dark:text-white text-black bg-[#eae9e9]"}`}>
                        {dayEvents.length} {dayEvents.length === 1 ? "Event" : "Events"}
                      </div>
                    )}
                  </div>
                </button>

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
                            <div className="text-sm font-semibold text-[#576cbc]">{event.title}</div>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-300">
                              <Clock size={12} />
                              {event.start} - {event.end}
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-600 dark:text-gray-300 mt-1">{event.description}</div>
                        {event.teachers && event.teachers.length > 0 && (
                          <div className="mt-2 text-[9px]">Attendees: {event.teachers.map(t => t.teacherName).join(", ")}</div>
                        )}
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
      <div className="space-y-4 h-[600px] overflow-y-scroll scrollbar-none">
        {dayEvents.map((event, idx) => (
          <div
            key={idx}
            className="p-4 text-gray-500 mb-2 dark:bg-[#414141] bg-gray-100 rounded-xl dark:text-[#fff]"
          >
            <div className="flex justify-between items-start">
              <div className="text-sm font-semibold text-[#576cbc]">{event.title}</div>
              <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-300">
                <Clock size={12} />
                {event.start} - {event.end}
              </div>
            </div>

            <div className="text-[10px] text-gray-400 mt-1">{event.description}</div>
            {event.teachers && event.teachers.length > 0 && (
              <div className="mt-2 text-[9px]">Attendees: {event.teachers.map(t => t.teacherName).join(", ")}</div>
            )}
            {event.meetingStatus && (
              <div className="mt-2 text-[9px] px-2 py-1 rounded bg-gray-200 dark:bg-gray-600 inline-block">
                Status: {event.meetingStatus}
              </div>
            )}
          </div>
        ))}
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

            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayEvents = getEventsForDate(date);
            const hasEvents = dayEvents.length > 0;
            const dateKey = moment(date).format("YYYY-MM-DD");

            return (
              <button
                key={`day-${dateKey}`}
                onClick={() => handleDateClick(date)}
                className={`min-h-[80px] rounded-xl flex flex-col items-center justify-start mt-1 p-1 cursor-pointer ${
                  hasEvents
                    ? "border border-[#576cbc] text-[#576cbc] bg-[#576cbc]/10"
                    : isToday(day)
                    ? "bg-[#27176518] text-white"
                    : "bg-gray-100 dark:bg-[#414141] dark:text-[#fff] text-gray-500"
                }`}
              >
                <div className={`font-semibold ${isToday(day) ? "dark:text-[#4b8cc9] text-[#4b8cc9]" : ""}`}>{day}</div>
                {hasEvents && (
                  <div className="w-full overflow-hidden">
                    <div className="text-[9px] truncate px-1">{dayEvents[0].title}</div>
                    <div className="text-[8px] truncate px-1">{dayEvents[0].start} - {dayEvents[0].end}</div>
                    {dayEvents[0].meetingStatus && (
                      <div className="text-[7px] mt-1 px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-600">{dayEvents[0].meetingStatus}</div>
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
      <AdminHeader currentSection="Admin Calendar" />
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
                <button onClick={handlePrevMonth} className="py-[1px] px-2 rounded-lg bg-gray-100 dark:bg-[#414141] hover:bg-gray-200 dark:hover:bg-[#505050] transition-colors">&lt;</button>
                <h2 className="text-[16px] font-semibold">{formatMonthYear(currentDate)}</h2>
                <button onClick={handleNextMonth} className="py-[1px] px-2 rounded-lg bg-gray-100 dark:bg-[#414141] hover:bg-gray-200 dark:hover:bg-[#505050] transition-colors">&gt;</button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-[540px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#576cbc]"></div>
              </div>
            ) : (
              <>
                {activeView === "monthly" && <MonthlyView />}
                {activeView === "weekly" && <WeeklyView />}
                {activeView === "daily" && <DailyView />}
              </>
            )}
          </div>

          {/* List Schedule */}
          <div className="w-full lg:w-1/3 bg-white dark:bg-[#343434] shadow-md rounded-xl flex flex-col min-h-[630px] lg:h-[630px]">
            <div className="p-4 md:p-6">
              <h2 className="text-[18px] font-semibold">List Schedule</h2>
              {isLoading ? (
                <div className="text-center py-4">Loading meetings...</div>
              ) : eventsForSelectedDate.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
{getUniqueMeetingsById(eventsForSelectedDate).map((item, index) => {
                    const textColors = ["text-[#d77277]","text-[#72B0D7]","text-[#BF63B3]","text-[#BFBC63]","text-[#BF8C63]","text-[#6EBF63]"];
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

                        <p className="text-[11px] font-light text-[#333] dark:text-[#fff] mt-2">{item.description || ""}</p>

{/* View List Toggle Button */}
{/* View List Toggle */}
<button
  onClick={() => toggleMeetingDetails(item.id)}
  className="mt-2 text-[11px] text-blue-600 dark:text-blue-300 underline"
>
  {expandedMeetingId === item.id ? "Hide List " : "View List "}
</button>

{/* Teacher List */}
{expandedMeetingId === item.id && (
  <div className="mt-2">
    <p className="text-[10px] font-semibold mb-1">Teachers:</p>

    {item.teachers && item.teachers.length && item.teachers.length > 0 ? (
      <ul className="text-[10px] space-y-1 list-disc list-inside">
        {item.teachers.map((t) => (
          <li key={t.teacherId || t._id || t.teacherEmail}>
            {t.teacherName} ({t.teacherEmail})
          </li>
        ))}
      </ul> 
    ) : (
      <p className="text-[9px] text-gray-500 italic">No Teachers</p>
    )}
  </div>
)}



                        {item.meetingStatus && (
                          <div className="mt-2">
                            <span className="text-[9px] px-2 py-1 rounded bg-gray-200 dark:bg-gray-600">Status: {item.meetingStatus}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-[12px] text-center py-4">
                  {selectedDate === moment().format("YYYY-MM-DD")
                    ? "No events scheduled for today"
                    : `No events scheduled for ${moment(selectedDate).format("MMM D, YYYY")}`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </BaseLayout4>
  );
};

export default AdminCalendar;
