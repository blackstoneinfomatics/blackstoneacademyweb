"use client";

import React, { useEffect, useRef, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";
import BaseLayout from "@/app/(tenant)/modules/users/teacher/components/BaseLayout";
import { getSocket } from "@/app/utils/socket";
import TeacherHeader from "../../components/TeacherHeader";
import NextMeetingSchedule from "../../components/NextMeetingSchedule";
import TeacherFilter from "../../components/TeacherFilter";

// Interface for Teacher (as object)
interface Teacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
}

// Interface for Student (Participant)
interface Participant {
  studentId: string; 
  studentName: string;
  studentEmail: string;
}

// Interface for each Meeting
interface Meeting {
  meetingminutes: string | number | readonly string[] | undefined;
  duration: string | number | readonly string[] | undefined;
  endTime: string;
  startTime: string;
  // selectedDate: any;
  _id: string;
  meetingId: string;
  meetingName: string;
  selectedDate: string; // ISO string
  // fromTime: string;
  // toTime: string;
  description: string;
  meetingStatus: "Scheduled" | "Rescheduled" | "Completed";
  status: string;
  createdDate: string; // ISO string
  createdBy: string;
  updatedDate: string; // ISO string
  updatedBy: string;
  teacher: Teacher; // Now an object
  participants: Participant[]; // Now an array
  __v?: number;
}


const Meeting = () => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [success, setSuccess] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDatePickerOpens, setIsDatePickerOpens] = useState(false);
  const [upcomingClasses, setUpcomingClasses] = useState<Meeting[]>([]);
  const [openTeacherDropdownId, setOpenTeacherDropdownId] = useState<
    string | null
  >(null);
  const [rescheduleDate, setRescheduleDate] = useState(""); // in 'YYYY-MM-DD' format
  const [rescheduleTime, setRescheduleTime] = useState(""); // in 'HH:mm' 24h format


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenTeacherDropdownId(null); // Close dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  console.log(isDatePickerOpens);

useEffect(() => {
    const id = typeof window !== "undefined" ? localStorage.getItem("TeacherPortalID") : null;
    const socket = getSocket(id ?? '');
    const handleList = (data: { data: Meeting }) => {
        console.log("📩 Received WebSocket Data:", data);
        setUpcomingClasses(pre => [...pre, data.data]);
    };
    socket.on('addmeeting', handleList);
    return () => {
        socket.off('addmeeting', handleList);
    };
}, []);

  interface Teacher {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
  }

return (
  <BaseLayout>
    <TeacherHeader currentSection="Scheduled Meeting"/>
    <NextMeetingSchedule />
    {/* Tabs */}
 <TeacherFilter />
    </BaseLayout>
  );
};

export default Meeting;


