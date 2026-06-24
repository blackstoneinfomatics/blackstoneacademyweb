'use client';

import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendaradmin.css';
import { useRouter } from 'next/navigation';
import { AppApiEndpoints } from '@/app/_components/contents/api-endpoints';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Event {
  title: string;
  start: Date;
  end: Date;
}

interface Teacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  _id: string;
}

interface Meeting {
  _id: string;
  meetingName: string;
  selectedDate: string;
  startTime: string;
  endTime: string;
  teachers: Teacher[][];
}

interface MeetingsResponse {
  message: string;
  data: {
    totalCount: number;
    meetings: Meeting[];
  };
}

const Academic: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [value] = useState<Date>(new Date());
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('AdminAuthToken');
      if (token) {
        fetchMeetings(token);
      } else {
          toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      }
    }
  }, []);

  const fetchMeetings = async (token: string) => {
    try {
      const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ADMIN_MEETING.GET_LIST}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MeetingsResponse = await response.json();

      if (!data?.data?.meetings) {
        console.warn("No meetings data found in response");
        setEvents([]);
        return;
      }

      const meetingsData = data.data.meetings || [];
      // Flatten the nested structure (meetings -> records) and take the first record to avoid duplicates
      const meetings = meetingsData.flatMap((group: any) =>
        group.records && group.records.length > 0 ? [group.records[0]] : []
      );

      const mappedEvents: Event[] = meetings
        .filter((item) => {
          if (!item.startTime || !item.endTime || !item.selectedDate) {
            console.warn("Skipping meeting with missing time data");
            return false;
          }
          return true;
        })
        .map((item) => {
          try {
            const start = new Date(item.selectedDate);
            const [startHours, startMinutes] = item.startTime.split(":").map(Number);
            start.setHours(startHours, startMinutes);

            const end = new Date(item.selectedDate);
            const [endHours, endMinutes] = item.endTime.split(":").map(Number);
            end.setHours(endHours, endMinutes);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
              console.warn("Invalid date for meeting");
              return null;
            }

            return {
              title: item.meetingName || 'Untitled Meeting',
              start,
              end,
            };
          } catch (error) {
            console.error("Error processing meeting");
            return null;
          }
        })
        .filter((event): event is Event => event !== null);

      setEvents(mappedEvents);
    } catch (error) {
      console.error("Failed to fetch meetings");
      setEvents([]);
    }
  };

  const isMeetingDate = (date: Date): boolean => {
    return events.some((event) => {
      const eventStart = new Date(event.start);
      return (
        eventStart.getFullYear() === date.getFullYear() &&
        eventStart.getMonth() === date.getMonth() &&
        eventStart.getDate() === date.getDate()
      );
    });
  };

  return (
    <div className="dark:bg-[#343434] w-full rounded-xl h-[280px]">
      <Calendar
        onChange={() => { }} // Empty function since we don't need the functionality
        value={value}
        navigationLabel={({ date }) =>
          `${date.toLocaleString("default", { month: "short" }).toUpperCase()}, ${date.getFullYear()}`
        }
        nextLabel="›"
        prevLabel="‹"
        next2Label={null}
        prev2Label={null}
        showNeighboringMonth={true}
        locale="en-GB"
        calendarType="iso8601"
        className="custom-calendar dark:bg-[#343434]"
        onClickDay={() => {
          router.push(`/admin-main/admincalendar`);
        }}
        tileClassName={({ date, view }) =>
          view === "month" && isMeetingDate(date) ? "event-day" : undefined
        }
      />
    </div>
  );
};

export default Academic;