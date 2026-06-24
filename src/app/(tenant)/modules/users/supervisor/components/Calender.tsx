"use client";
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendar.css";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
interface Event {
  title: string;
  start: Date;
  end: Date;
}

interface Meeting {
  _id: string;
  meetingId: string;
  meetingName: string;
  meetingStatus: "Scheduled" | "Reschedule" | "Completed";
  selectedDate: string;
  startTime: string;
  endTime: string;
  description: string;
  createdDate: string;
  createdBy: string;
  supervisor: {
    supervisorId: string;
    supervisorName: string;
    supervisorEmail: string;
    supervisorRole: string;
  };
  teacher: {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
  }[];
}

const Academic: React.FC = () => {
  const router = useRouter();
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [value, setValue] = useState<Date>(new Date());
  const [activeStartDate, setActiveStartDate] = useState<Date>(new Date());
  const [meetingDays, setMeetingDays] = useState<Date[]>([]);
  const [todayMeetings, setTodayMeetings] = useState<
    { time: string; title: string; type: string; color: string }[]
  >([]);

  useEffect(() => {
const fetchMeetings = async () => {
  setLoading(true);
  setError("");

  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("SupervisorAuthToken")
        : null;

    if (!token) {
      setError("Authentication token not found");
      return;
    }

    const response = await axios.get(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MEETING.GET_SUPERVISOR_MEETING}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const allMeetingsResponse: Meeting[] =
      response.data?.meetings || [];

    if (!allMeetingsResponse.length) {
      setMeetingDays([]);
      setTodayMeetings([]);
      return;
    }

    const uniqueMeetingsMap = new Map();

    allMeetingsResponse.forEach((m: Meeting) => {
      const key = `${m.selectedDate}_${m.startTime}_${m.endTime}_${m.meetingName}`;

      if (!uniqueMeetingsMap.has(key)) {
        uniqueMeetingsMap.set(key, m);
      }
    });

    const allMeetings = Array.from(
      uniqueMeetingsMap.values()
    ) as Meeting[];

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const upcomingMeetings = allMeetings.filter((meeting) => {
      const meetingDate = new Date(meeting.selectedDate);
      meetingDate.setHours(0, 0, 0, 0);

      return meetingDate.getTime() >= now.getTime();
    });

    const allMeetingDates = upcomingMeetings.map((m) => {
      const d = new Date(m.selectedDate);
      d.setHours(0, 0, 0, 0);
      return d;
    });

    setMeetingDays(allMeetingDates);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayData = upcomingMeetings
      .filter((meeting) => {
        const meetingDate = new Date(meeting.selectedDate);

        meetingDate.setHours(0, 0, 0, 0);

        return meetingDate.getTime() === today.getTime();
      })
      .map((meeting) => {
        let color = "bg-blue-100 text-blue-800";

        if (meeting.meetingStatus === "Scheduled") {
          color = "bg-amber-100 text-amber-800";
        } else if (meeting.meetingStatus === "Reschedule") {
          color = "bg-green-100 text-green-800";
        }

        return {
          time: meeting.startTime,
          title: meeting.meetingName,
          type: meeting.meetingStatus.toLowerCase(),
          color,
        };
      });

    setTodayMeetings(todayData);
  } catch (error: any) {
    console.error("Meeting API Error:", error);

    if (error.response?.status === 401) {
      setError("Session expired. Please login again.");
    } else if (error.response?.status === 403) {
      setError("You don't have permission.");
    } else if (error.response?.status === 404) {
      setError("Meeting data not found.");
    } else if (error.response?.status === 500) {
      setError("Server error. Please try again later.");
    } else {
      setError("Failed to load meetings.");
    }

    setMeetingDays([]);
    setTodayMeetings([]);
  } finally {
    setLoading(false);
  }
};

    fetchMeetings();
  }, []);

  // Check if a date has meetings
  const isMeetingDate = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    return meetingDays.some(
      (meetingDate) => meetingDate.getTime() === d.getTime()
    );
  };


if (error) {
  return (
    <div className="p-4 text-center text-red-500">
      {error}
    </div>
  );
}

  return (
    <div className="dark:bg-[#343434] w-full rounded-xl">
      
      <Calendar
        onChange={(newValue) => setValue(newValue as Date)}
        value={value}
        activeStartDate={activeStartDate}
        onActiveStartDateChange={({ activeStartDate }) => {
          setActiveStartDate(activeStartDate as Date);
          setValue(activeStartDate as Date);
        }}
        onClickDay={() => {
          router.push(`/modules/users/supervisor/ui/calendar`);
        }}
        locale="en-GB"
        calendarType="iso8601"
        showNeighboringMonth={true} // Keep full calendar structure
        className="custom-calendar dark:bg-[#343434]"
        navigationLabel={({ date }) =>
          `${date
            .toLocaleString("default", {
              month: "long",
            })
            .toUpperCase()}, ${date.getFullYear()}`
        }
        nextLabel="›"
        prevLabel="‹"
        next2Label={null}
        prev2Label={null}
        tileClassName={({ date, view }) => {
          if (view === "month") {
            const isSameMonth = date.getMonth() === activeStartDate.getMonth();
            const isSameYear =
              date.getFullYear() === activeStartDate.getFullYear();

            if (isSameMonth && isSameYear && isMeetingDate(date)) {
              return "has-event";
            }
          }
          return undefined;
        }}
      />
    </div>
  );
};

export default Academic;
