"use client";

import React, { useEffect, useState } from "react";
import BaseLayout1 from "@/app/(tenant)/modules/users/Academic-coach/components/BaseLayout1";
import moment from "moment";
import { Clock } from "lucide-react";
import AcademicHeader from "../../components/academicHeader";
import { FaClock } from "react-icons/fa";
import { BsFillCalendar2WeekFill } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  date: string;
  studentName: string;
  studentEmail: string;
  meetingId?: string;
}

const SchedulePage = () => {
  const [activeView, setActiveView] = useState<"monthly" | "weekly" | "daily">(
    "monthly",
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    moment().format("YYYY-MM-DD"),
  );
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<Event[]>(
    [],
  );
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();

  const tabs = ["monthly", "weekly", "daily"] as const;

  useEffect(() => {
    const token = localStorage.getItem("AcademicCoachAuthToken");
    if (!token) {
      console.error("❌ AcademicCoachAuthToken not found");
      return;
    }
    const acId =
      typeof window !== "undefined"
        ? localStorage.getItem("AcademicCoachPortalId")
        : null;

    const params = {
      academicCoachId: acId,
    };
    fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CALENDAR.GET}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("dataaa", data);
        const mappedAcademicEvents = data.academicCoach.map((item: any) => ({
          id: item._id,
          meetingId: item._id, // or item.meetingId if exists

          title: item.subject,
          start: item.scheduledFrom,
          end: item.scheduledTo,
          description: item.description,
          studentName: item.student.name,
          studentEmail: item.student.email,
          date: moment(item.scheduledStartDate).format("YYYY-MM-DD"),
        }));

        const addSupervisorEvents = data.meetingList.map((item: any) => ({
          id: item._id,
          meetingId: item.meetingId,
          title: item.meetingName,
          start: item.startTime,
          end: item.endTime,
          description: item.description,
          studentName: item.participants.participantName,
          studentEmail: item.participants.participantEmail,
          date: moment(item.selectedDate).format("YYYY-MM-DD"),
        }));

        const adminEvents = data.adminMeetingList.map((item: any) => ({
          id: item._id,
          meetingId: item.meetingId,
          title: item.meetingName,
          start: item.startTime,
          end: item.endTime,
          description: item.description,
          studentName: item.admin.adminName,
          studentEmail: item.admin.adminEmail,
          date: moment(item.selectedDate).format("YYYY-MM-DD"),
        }));
        const mappedEvents = [
          ...mappedAcademicEvents,
          ...addSupervisorEvents,
          ...adminEvents,
        ];
        setEvents(mappedEvents);
        console.log("Fetched Events: ", mappedEvents);
      })
      .catch((error) => console.error("Error fetching data: ", error));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".calendar-dropdown-container") && openDropdown) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [openDropdown]);

  const handleDateClick = (date: Date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    setSelectedDate(formattedDate);
    const filteredEvents = events.filter(
      (event) => event.date === formattedDate,
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
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
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

    const eventsByDay = weekEvents.reduce(
      (acc, event) => {
        const day = moment(event.date).format("dddd");
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push(event);
        return acc;
      },
      {} as Record<string, Event[]>,
    );

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
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-300">
                              <Clock size={12} />
                              {moment(event.start, "HH:mm").format(
                                "h:mm A",
                              )} - {moment(event.end, "HH:mm").format("h:mm A")}
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-600 dark:text-gray-300 mt-1">
                          {event.studentName}
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
    const dayEvents = getEventsForDate(currentDate);

    return (
      <div className="space-y-4 h-[470px] overflow-y-scroll scrollbar-none">
        {dayEvents.map((event, idx) => (
          <div
            key={idx}
            className="p-4 text-gray-500 mb-2 dark:bg-[#414141] bg-gray-100 rounded-xl dark:text-[#fff]"
          >
            <div className="flex justify-between items-start">
              <div className="text-sm font-semibold text-[#576cbc]">
                {event.title}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-300">
                <Clock size={12} />
                {moment(event.start, "HH:mm").format("h:mm A")} -{" "}
                {moment(event.end, "HH:mm").format("h:mm A")}
              </div>
            </div>

            <div className="text-[10px] text-gray-400 mt-1">
              {event.studentName}
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

        <div className="grid grid-cols-7 gap-2 text-sm h-[470px] overflow-scroll scrollbar-none relative">
          {totalDays.map((day, i) => {
            if (day === null) {
              return <div key={i} className="min-h-[80px] bg-transparent" />;
            }

            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day,
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
                  onClick={() => handleDayClick(date, day)}
                  className={`min-h-[80px] w-full rounded-xl flex flex-col items-center justify-start mt-1 p-1 cursor-pointer ${
                    hasEvents
                      ? "border border-[#576cbc] text-[#576cbc] bg-[#576cbc]/10"
                      : isToday(day)
                        ? "bg-[#27176518] text-white"
                        : "bg-gray-100 dark:bg-[#414141] dark:text-[#fff] text-gray-500"
                  }`}
                >
                  <div
                    className={`font-semibold ${
                      isToday(day) ? "dark:text-[#4b8cc9] text-[#4b8cc9]" : ""
                    }`}
                  >
                    {day}
                  </div>
                  {hasEvents && (
                    <div className="mt-1 px-2 py-0.5 rounded-md bg-[#576cbc] text-white text-[10px] font-semibold">
                      {dayEvents.length}{" "}
                      {dayEvents.length === 1 ? "Event" : "Events"}
                    </div>
                  )}
                </button>

                {isDropdownOpen && hasEvents && (
                  <div
                    className={`absolute top-full ${isRightSide ? "right-0" : "left-0"} mt-1 z-50 w-40 bg-white dark:bg-[#343434] rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-3`}
                  >
                    <div className="text-[10px] font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      {moment(date).format("MMMM D, YYYY")}
                    </div>
                    <div className="space-y-2 h-20 overflow-y-auto scrollbar-none">
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

  const canJoinNow = (event: Event) => {
    const now = moment();

    const eventDateTime = moment(
      `${event.date} ${event.start}`,
      "YYYY-MM-DD HH:mm",
    );

    const eventEndTime = moment(
      `${event.date} ${event.end}`,
      "YYYY-MM-DD HH:mm",
    );

    // Allow join from 10 mins before till end
    return now.isBetween(
      eventDateTime.clone().subtract(10, "minutes"),
      eventEndTime,
    );
  };

  return (
    <BaseLayout1>
      <AcademicHeader currentSection="Calendar" />
      <div className="p-2">
        <div className="mx-auto gap-4 flex flex-col lg:flex-row overflow-hidden min-h-[630px]">
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
            <div className="p-4 md:p-4">
              <h2 className="text-[18px] font-semibold">List Schedule</h2>
              <div className="space-y-3 md:space-y-4 mt-7 overflow-y-scroll scrollbar-none h-[520px] p-3 bg-gray-50 rounded-lg">
                {eventsForSelectedDate.length > 0 ? (
                  eventsForSelectedDate.map((item, index) => {
                    const textColors = [
                      "text-[#d77277]",
                      "text-[#72B0D7]",
                      "text-[#BF63B3]",
                      "text-[#BFBC63]",
                      "text-[#BF8C63]",
                      "text-[#6EBF63]",
                    ];
                    const currentTextColor =
                      textColors[index % textColors.length];
                    return (
                      <div
                        key={item.id}
                        className="border-b pb-2 border-[#dadada] dark:border-[#5b5b5b]"
                      >
                        <div className="flex justify-between">
                          <h3
                            className={`font-medium p-2 bg-gray-100 rounded-tl-lg rounded-bl-lg rounded-br-full rounded-tr-full w-40 text-[11px] ${currentTextColor}`}
                          >
                            {item.title}
                          </h3>
                          <div>
                            <div className="flex gap-4 align-middle justify-center mt-3">
                              <div className="text-[9px] text-gray-500 flex items-center gap-1 dark:text-[#f4f4f4]">
                                <FaClock size={10} />
                                {moment(item.start, "HH:mm").format(
                                  "h:mm A",
                                )} -{" "}
                                {moment(item.end, "HH:mm").format("h:mm A")}
                              </div>
                              <span className="text-[9px] text-gray-500 flex items-center gap-1 dark:text-[#f4f4f4]">
                                <BsFillCalendar2WeekFill size={10} />{" "}
                                {moment(item.date).format("DD MMM YYYY")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] font-light text-[#333] dark:text-[#fff] mt-2">
                          {item.studentName || ""}
                        </p>

                        {canJoinNow(item) && (
                          <button
                            onClick={() =>
                              router.push(
                                `/modules/users/Academic-coach/ui/videocall?id=${item.meetingId || item.id}`,
                              )
                            }
                            className="mt-2 px-3 py-1 text-[11px] bg-green-600 text-white rounded hover:bg-green-700 transition"
                          >
                            ▶ Start Now
                          </button>
                        )}
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
    </BaseLayout1>
  );
};

export default SchedulePage;
