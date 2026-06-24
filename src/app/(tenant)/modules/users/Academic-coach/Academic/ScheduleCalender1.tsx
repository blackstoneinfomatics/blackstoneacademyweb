'use client'

import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { AppApiEndpoints } from '@/app/_components/contents/api-endpoints';


const localizer = momentLocalizer(moment);

// Define types for events
interface Event {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  description: string;
  meetingLink: string;
  studentName: string;
  teacherName: string;
  course: string;
  meetingLocation: string;
  scheduledFrom: string;
  scheduledTo: string;
}

const ScheduleCalender: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]); // Specify the event type here

  useEffect(() => {
      const token =
    typeof window !== "undefined" ? localStorage.getItem("AcademicCoachAuthToken") : null;

  if (!token) {
    console.error("❌ AdminAuthToken not found");
    return;
  }
    fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CALENDAR.GET}`,{
      headers:{
        'Authorization': `Bearer ${token}`,
      }
    })
      .then((response) => response.json())
      .then((data) => {
        const mappedEvents = data.academicCoach.map((item: any) => {
          return {
            title: item.subject,
            start: new Date(item.scheduledStartDate),
            end: new Date(item.scheduledEndDate),
            allDay: false,
            description: item.description,
            meetingLink: item.meetingLink,
            studentName: item.student.name,
            teacherName: item.academicCoach.name,
            course: item.course.courseName,
            meetingLocation: item.meetingLocation,
            scheduledFrom: item.scheduledFrom,
            scheduledTo: item.scheduledTo,
          };
        });
        setEvents(mappedEvents);
      })
      .catch((error) => console.error('Error fetching data: ', error));
  }, []);

  // Adjusted eventStyleGetter with an unused parameter
  const eventStyleGetter = (_: Event) => { // Use _ to indicate unused parameter
    return {
      style: {
        backgroundColor: '#B0E0E6',
        color: '#0000CD',
        borderRadius: '4px',
        padding: '3px',
        fontSize: '12px',
      },
    };
  };

  return (
    <div className="bg-white p-6 rounded shadow-lg">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600, fontSize: '12px' }}
        views={['month', 'week', 'day']}
        defaultView="month"
        toolbar
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
};

export default ScheduleCalender;
