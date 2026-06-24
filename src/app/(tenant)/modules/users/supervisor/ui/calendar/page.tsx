"use client";

import React, { useState, useEffect } from "react";
import BaseLayout3 from "@/app/(tenant)/modules/users/supervisor/components/BaseLayout3";
import { CalendarDays, Clock } from "lucide-react";
import SupervisorHeader from "../../components/supervisorHeader";
import axios from "axios";
import moment from "moment";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface Meeting {
  _id: string;
  meetingId: string;
  meetingName: string;
  selectedDate: string;
  startTime: string;
  endTime: string;
  description: string;
  createdDate: string;
  createdBy: string;
  supervisor?: {
    supervisorId: string;
    supervisorName: string;
    supervisorEmail: string;
    supervisorRole: string;
  };
  admin?: {
    adminId: string;
    adminName: string;
    adminEmail: string;
    adminRole: string;
  };
  teacher: {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
  }[];
}

const SchedulePage = () => {
  const [activeView, setActiveView] = useState<"monthly" | "weekly" | "daily">(
    "monthly"
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
  const tabs = ["monthly", "weekly", "daily"] as const;

  const meetingTypeColors = {
    "Group Meeting": {
      text: "text-[#21BAFF]",
      border: "border-[#21BAFF]",
      bg: "bg-[#21BAFF]/10",
    },
    "Teacher Meeting": {
      text: "text-[#ce4b49]",
      border: "border-[#ce4b49]",
      bg: "bg-[#ce4b49]/10",
    },
    "Weekly Meeting": {
      text: "text-[#5362e4]",
      border: "border-[#5362e4]",
      bg: "bg-[#5362e4]/10",
    },
  };

  const getMeetingTypeColor = (meetingName: string) => {
    const lowerName = meetingName.toLowerCase();
    if (lowerName.includes("group")) return meetingTypeColors["Group Meeting"];
    if (lowerName.includes("teacher"))
      return meetingTypeColors["Teacher Meeting"];
    if (lowerName.includes("weekly"))
      return meetingTypeColors["Weekly Meeting"];
    return meetingTypeColors["Group Meeting"];
  };

  useEffect(() => {
    const fetchMeetings = async () => {
  setLoading(true);
  setError("");

  try {
        const token = localStorage.getItem("SupervisorAuthToken");
       if (!token) {
  setError("Authentication token not found.");
  return;
}

        const [supervisorResponse, adminResponse] = await Promise.all([
          axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MEETING.GET_SUPERVISOR_MEETING}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ADMIN_MEETING.GET_LIST}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }).catch(err => {
            console.error("Error fetching admin meetings:", err);
            return { data: { data: { meetings: [] } } }; // Fallback
          })
        ]);

        const supervisorMeetings = supervisorResponse.data?.meetings || [];
          if (!Array.isArray(supervisorMeetings)) {
  setError("Invalid supervisor meetings response.");
  return;
}
        // Parse admin meetings: data.data.meetings[].records
        const adminMeetingsData = adminResponse.data?.data?.meetings || [];
        const adminMeetings = adminMeetingsData.flatMap((group: any) => group.records || []);

        const allMeetings = [...supervisorMeetings, ...adminMeetings];

        if (allMeetings.length === 0) {
  setMeetings([]);
  setFilteredMeetings([]);
  return;
}

{
          // Deduplicate meetings based on a composite key of date, time, and name
          // This handles cases where _id might be different but the meeting content is identical
          const uniqueMeetingsMap = new Map();

          allMeetings.forEach((m: Meeting) => {
            // Create a unique key for the meeting content
            // We use meetingId if available and reliable, otherwise we fallback to content
            // unique key: date_start_end_name
            const compositeKey = `${m.selectedDate}_${m.startTime}_${m.endTime}_${m.meetingName}`;

            // Only add if we haven't seen this meeting content before
            if (!uniqueMeetingsMap.has(compositeKey)) {
              uniqueMeetingsMap.set(compositeKey, m);
            }
          });

          const uniqueMeetings = Array.from(uniqueMeetingsMap.values());

          const sortedMeetings = (uniqueMeetings as Meeting[]).sort(
            (a: Meeting, b: Meeting) =>
              new Date(a.selectedDate).getTime() -
              new Date(b.selectedDate).getTime()
          );
          setMeetings(sortedMeetings);
          setFilteredMeetings(sortedMeetings);
        }
      } catch (error: any) {
  console.error("Error fetching meetings:", error);

  if (error.response) {
    switch (error.response.status) {
      case 401:
        setError("Session expired. Please login again.");
        break;
      case 403:
        setError("Access denied.");
        break;
      case 404:
        setError("Meetings not found.");
        break;
      case 500:
        setError("Server error.");
        break;
      default:
        setError("Failed to load meetings.");
    }
  } else {
    setError("Network error. Please try again.");
  }
}
finally {
  setLoading(false);
}
    };

    fetchMeetings();
  }, []);

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

  const getMeetingsForDate = (date: Date) => {
    return meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.selectedDate);
      return (
        meetingDate.getDate() === date.getDate() &&
        meetingDate.getMonth() === date.getMonth() &&
        meetingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dayMeetings = getMeetingsForDate(date);
    setFilteredMeetings(dayMeetings);
  };

  const handleClearFilter = () => {
    setSelectedDate(null);
    setFilteredMeetings(meetings);
  };

  const WeeklyView = () => {
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    // Get start and end of current week based on currentDate
    const startOfWeek = moment(currentDate).startOf("week");
    const endOfWeek = moment(currentDate).endOf("week");

    // Create an array of days in the week with their dates
    const daysInWeek = [];
    let currentDay = startOfWeek.clone();

    while (currentDay <= endOfWeek) {
      daysInWeek.push({
        name: currentDay.format("dddd"),
        date: currentDay.format("YYYY-MM-DD"),
        formattedDate: currentDay.format("MMMM D, YYYY")
      });
      currentDay = currentDay.clone().add(1, 'days');
    }

    // Filter meetings for current week
    const weekMeetings = meetings.filter((meeting) => {
      const meetingDate = moment(meeting.selectedDate);
      return meetingDate >= startOfWeek && meetingDate <= endOfWeek;
    });

    // Group meetings by day
    const meetingsByDay = weekMeetings.reduce((acc, meeting) => {
      const day = moment(meeting.selectedDate).format("dddd");
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(meeting);
      return acc;
    }, {} as Record<string, Meeting[]>);

    const handleDayClick = (day: string) => {
      setSelectedDay(selectedDay === day ? null : day);
    };

    return (
      <div className="space-y-4 h-[540px] overflow-y-scroll scrollbar-none">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold">
            {startOfWeek.format("MMM D")} -{" "}
            {endOfWeek.format("MMM D, YYYY")}
          </h3>
        </div>

        <div className="space-y-2">
          {daysInWeek.map((dayInfo) => {
            const dayMeetings = meetingsByDay[dayInfo.name] || [];
            const isSelected = selectedDay === dayInfo.name;

            return (
              <div key={dayInfo.name} className="flex flex-col">
                <button
                  onClick={() => handleDayClick(dayInfo.name)}
                  className={`w-full p-4 rounded-xl cursor-pointer transition-all duration-200 ${isSelected
                    ? "dark:bg-[#414141] bg-[#f7f7f7] dark:text-white text-black"
                    : dayMeetings.length > 0
                      ? "dark:bg-[#414141] bg-[#f7f7f7] hover:shadow-lg text-black"
                      : "bg-[#f7f7f7] dark:bg-[#414141] text-black"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div
                          className={`text-base font-semibold ${isSelected
                            ? "dark:text-white text-black"
                            : "text-gray-800 dark:text-white"
                            }`}
                        >
                          {dayInfo.name}
                        </div>
                        <div
                          className={`text-[10px] ${isSelected
                            ? "bg:text-white/80"
                            : "text-gray-500 dark:text-gray-400"
                            }`}
                        >
                          {dayInfo.formattedDate}
                        </div>
                      </div>
                    </div>
                    {dayMeetings.length > 0 && (
                      <div
                        className={`text-[10px] px-3 py-1 rounded-lg ${isSelected
                          ? "dark:bg-[#555555] dark:text-white text-black bg-[#eae9e9]"
                          : "dark:bg-[#555555] dark:text-white text-black bg-[#eae9e9]"
                          }`}
                      >
                        {dayMeetings.length}{" "}
                        {dayMeetings.length === 1 ? "Meeting" : "Meetings"}
                      </div>
                    )}
                  </div>
                </button>

                {isSelected && dayMeetings.length > 0 && (
                  <div className="w-full mt-2 space-y-2 pl-4">
                    {dayMeetings.map((meeting, idx) => {
                      const colors = getMeetingTypeColor(meeting.meetingName);
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${colors.bg} dark:bg-[#414141] bg-[#f7f7f7] relative`}
                        >
                          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-lg dark:bg-[#555555] bg-[#f7f7f7]"></div>
                          <div className="flex justify-between items-start">
                            <div>
                              <div
                                className={`text-sm font-semibold ${colors.text}`}
                              >
                                {meeting.meetingName}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-300">
                                <Clock size={12} />
                                {meeting.startTime} - {meeting.endTime}
                              </div>
                            </div>
                          </div>
                          <div className="text-[10px] text-gray-600 dark:text-gray-300 mt-1">
                            {meeting.description}
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
    );
  };

  const DailyView = () => {
    const dayMeetings = getMeetingsForDate(currentDate);

    return (
      <div className="space-y-4 h-[600px] overflow-y-scroll scrollbar-none">
        {dayMeetings.map((meeting, idx) => {
          const colors = getMeetingTypeColor(meeting.meetingName);
          return (
            <div
              key={idx}
              className={`p-4 text-gray-500 mb-2 dark:bg-[#414141] bg-gray-100 rounded-xl dark:text-[#fff]`}
            >
              <div className="flex justify-between items-start">
                <div className={`text-sm font-semibold ${colors.text}`}>
                  {meeting.meetingName}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-300">
                  <Clock size={12} />
                  {meeting.startTime} - {meeting.endTime}
                </div>
              </div>

              <div className="text-[10px] text-gray-400 mt-1">
                {meeting.description}
              </div>
            </div>
          );
        })}
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

        <div className="grid grid-cols-7 mt-12 gap-2 text-center text-sm font-medium text-gray-500 mb-2 dark:bg-[#414141] bg-gray-100 rounded-xl p-3 dark:text-[#fff]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 text-sm h-[455px] overflow-scroll scrollbar-none">
          {totalDays.map((day, i) => {
            if (day === null) {
              return <div key={i} className="min-h-[80px] bg-transparent" />;
            }

            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            );
            const dayMeetings = getMeetingsForDate(date);
            const hasMeetings = dayMeetings.length > 0;
            const colors = hasMeetings
              ? getMeetingTypeColor(dayMeetings[0].meetingName)
              : null;
            const isSelected =
              selectedDate &&
              date.getDate() === selectedDate.getDate() &&
              date.getMonth() === selectedDate.getMonth() &&
              date.getFullYear() === selectedDate.getFullYear();

            return (
              <button
                key={i}
                onClick={() => handleDateClick(date)}
                className={`min-h-[80px] rounded-xl flex flex-col items-center justify-start mt-1 p-1 cursor-pointer ${hasMeetings
                  ? `${colors?.border} ${colors?.text} ${colors?.bg} border text-[10px]`
                  : isToday(day)
                    ? "bg-[#27176518] text-white"
                    : "bg-gray-100 dark:bg-[#414141] dark:text-[#fff] text-gray-500"
                  } ${isSelected ? "ring-2 ring-[#576cbc]" : ""}`}
              >
                <div
                  className={`font-semibold ${isToday(day) ? "dark:text-[#4b8cc9] text-[#4b8cc9]" : ""
                    }`}
                >
                  {day}
                </div>
                {hasMeetings && (
                  <div className="w-full overflow-hidden">
                    <div className="text-[9px] truncate px-1">
                      {dayMeetings[0].meetingName}
                    </div>
                    <div className="text-[8px] truncate px-1">
                      {dayMeetings[0].startTime} - {dayMeetings[0].endTime}
                    </div>
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
    <BaseLayout3>
      <SupervisorHeader currentSection="Calendar" showBackButton={true} showBackPath="/modules/users/supervisor/ui/dashboard" />
      <div className="p-2">
        <div className="mx-auto gap-4 flex flex-col md:flex-row overflow-hidden h-[630px]">
          <div className="w-full md:w-2/3 p-6 bg-white dark:bg-[#343434] shadow-md rounded-xl">
            <div className="flex space-x-4 text-sm font-medium mb-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveView(tab)}
                  className={`capitalize ${activeView === tab
                    ? "text-[#576cbc] border-b-2 border-[#576cbc]"
                    : "text-gray-400"
                    } pb-1`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeView === "monthly" && <MonthlyView />}
            {activeView === "weekly" && <WeeklyView />}
            {activeView === "daily" && <DailyView />}
          </div>

          <div className="w-full md:w-1/3 p-6 bg-white dark:bg-[#343434] shadow-md rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[18px] font-semibold">List Schedule</h3>
              {selectedDate && (
                <button
                  onClick={handleClearFilter}
                  className="text-[12px] text-[#576cbc] hover:text-[#576cbc]/80"
                >
                  Show All
                </button>
              )}
            </div>
            <div className="space-y-6 overflow-y-scroll scrollbar-none h-[600px]">
              {filteredMeetings.length > 0 ? (
                filteredMeetings.map((meeting) => {
                  const colors = getMeetingTypeColor(meeting.meetingName);
                  return (
                    <div
                      key={meeting.meetingId}
                      className="border-b dark:border-[#414141] pb-4"
                    >
                      <div className="flex justify-between">
                        <h4 className={`font-medium w-40 text-[12px] ${colors.text}`}>
                          {meeting.meetingName}
                        </h4>
                        <div className="flex items-center text-gray-400 text-[9px] mt-1 gap-2">
                          <span className="flex items-center gap-1 dark:text-[#f4f4f4]">
                            <Clock size={10} /> {meeting.startTime} - {meeting.endTime}
                          </span>
                          <span className="flex items-center gap-1 dark:text-[#f4f4f4]">
                            <CalendarDays size={10} />{" "}
                            {moment(meeting.selectedDate).format("DD/MM/YYYY")}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-500 dark:text-[#f9f9f9] text-[9px] mt-2">
                        {meeting.description}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-300 text-center py-4">
                  📅 Click a date to view meetings!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </BaseLayout3>
  );
};

export default SchedulePage;