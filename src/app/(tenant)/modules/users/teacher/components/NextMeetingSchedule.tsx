"use client";
import { AiOutlineClockCircle } from "react-icons/ai";
import {  useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FiVideo } from "react-icons/fi";
import { TimerReset } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";

// Interfaces based on your API response
interface Teacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
}

interface Meeting {
  _id: string;
  meetingName: string;
  meetingId: string;

  selectedDate: string; // ISO date string
  startTime: string;
  endTime: string;
  description?: string;

  meetingStatus: "Completed" | "Scheduled" | "Pending" | string;
  duration?: string;
  status: "Active" | "Inactive" | string;

  createdDate: string;
  createdBy: string;
  updatedDate?: string;
  updatedBy?: string;
  __v?: number;

  // Optional supervisor (some meetings)
  supervisor?: {
    supervisorId: string;
    supervisorName: string;
    supervisorEmail: string;
  };

  // Optional admin (some meetings)
  admin?: {
    adminId: string;
    adminName: string;
    adminEmail: string;
    adminRole: string;
  };

  // Optional single or multiple teachers
  teacher:
    | Array<{
        teacherId: string;
        teacherName: string;
        teacherEmail: string;
        attendee?: string;
      }>
    | {
        teacherId: string;
        teacherName: string;
        teacherEmail: string;
      };

  // Optional participants (student meetings)
  participants?: Array<{
    studentId: string;
    studentName: string;
    studentEmail: string;
  }>;
}

interface Participant {
  studentId: string;
  studentName: string;
  studentEmail: string;
  _id: string;
}

interface StudentMeeting {
  teacher: Teacher;
  _id: string;
  meetingId: string;
  meetingName: string;
  participants: Participant[];
  selectedDate: string;
  startTime: string;
  endTime: string;
  description: string;
  meetingStatus: string;
  status: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  updatedBy: string;
  __v: number;
}

const NextMeetingSchedule = () => {
  const router = useRouter();
  const [classData, setClassData] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const [isMeetingOngoing, setIsMeetingOngoing] = useState(false);
const [isPopupVisible, setIsPopupVisible] = useState(false);
const [isCountdownFinished, setIsCountdownFinished] = useState(false);
const [timeRemaining, setTimeRemaining] = useState(0);


  useEffect(() => {
    const fetchMeeting = async () => {
      setLoading(true);
      setError(null);
      try {
        const teacherId = localStorage.getItem("TeacherPortalId");
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("TeacherAuthToken")
            : null;

        if (!teacherId) {
          toast.error(
            AppValidationMessages.NEXT_SCHEDULED_CLASS.NO_TEACHER_ID
          );
          setLoading(false);
          return;
        }

        if (!token) {
          toast.error(
            AppValidationMessages.NEXT_SCHEDULED_CLASS.NO_TOKEN
          );
          setLoading(false);
          return;
        }

        const res = await axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET_TEACHERMEETINGLIST}`, {
          params: { teacherId },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const meetingList: Meeting[] = res.data.meetings;

        const now = new Date();
    const upcoming = meetingList
  .filter((m) => {
    if (!m.startTime || !m.endTime || !m.selectedDate) return false;

    const [startHour, startMinute] = m.startTime.split(":").map(Number);
    const [endHour, endMinute] = m.endTime.split(":").map(Number);

    const startDateTime = new Date(m.selectedDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(m.selectedDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    return endDateTime > now; // We include meetings not ended yet
  })
  .sort((a, b) => {
    const [aHour, aMinute] = a.startTime.split(":").map(Number);
    const aDateTime = new Date(a.selectedDate);
    aDateTime.setHours(aHour, aMinute, 0, 0);

    const [bHour, bMinute] = b.startTime.split(":").map(Number);
    const bDateTime = new Date(b.selectedDate);
    bDateTime.setHours(bHour, bMinute, 0, 0);

    return aDateTime.getTime() - bDateTime.getTime();
  })[0] || null;

        setClassData(upcoming);                                                                   
        setLoading(false);

if (upcoming) {
  setClassData(upcoming);
} else {
  toast.info(
    AppValidationMessages.NEXT_MEETING.NO_MEETING_FOUND
  );
  setClassData(null);
}

      } catch (err: any) {
  console.error(err);

  toast.error(
    AppFailureToastMessages.NEXT_MEETING_FETCH
  );

  setError(
    AppFailureToastMessages.NEXT_MEETING_FETCH
  );

  setLoading(false);
}
    };

    fetchMeeting();
  }, []);

  
useEffect(() => {
  if (!classData) return;

  const [startHour, startMinute] = classData.startTime.split(":").map(Number);
  const [endHour, endMinute] = classData.endTime.split(":").map(Number);

  const meetingStart = new Date(classData.selectedDate);
  meetingStart.setHours(startHour, startMinute, 0, 0);

  const meetingEnd = new Date(classData.selectedDate);
  meetingEnd.setHours(endHour, endMinute, 0, 0);

  const tick = () => {
    const now = new Date();

    // BEFORE START
    if (now < meetingStart) {
      const diffSeconds = Math.floor(
        (meetingStart.getTime() - now.getTime()) / 1000
      );

      setTimeRemaining(diffSeconds);
      setIsCountdownFinished(false);
      setIsMeetingOngoing(false);
      return;
    }

    // DURING MEETING
    if (now >= meetingStart && now <= meetingEnd) {
      setTimeRemaining(0);
      setIsCountdownFinished(true);
      setIsMeetingOngoing(true);
      return;
    }

    // AFTER MEETING
    if (now > meetingEnd) {
      setTimeRemaining(0);
      setIsCountdownFinished(false);
      setIsMeetingOngoing(false);
      setClassData(null);
    }
  };

  tick(); // run immediately
  const interval = setInterval(tick, 1000);
  return () => clearInterval(interval);
}, [classData]);


  if (loading) {
    return (
      <div className="bg-[#78A1DB] rounded-xl shadow flex items-center justify-between text-white p-2 px-4 min-h-[90px]">
        <div className="flex-1 space-y-4">
          <div className="h-2 bg-blue-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-2 bg-blue-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-2 bg-blue-200 rounded w-1/2 animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-2 px-14">
          <div className="w-16 h-16 bg-blue-300 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  // No meeting: show centered message
  if (!classData) {
    return (
      <div className="relative overflow-hidden bg-[#78A1DB] rounded-xl shadow flex items-center justify-center text-white p-2 min-h-[90px]">
        {/* Floating, soft background shapes */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/15 rounded-full blur-2xl animate-float-slow" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float-rev" />
          <div className="absolute top-1/2 -translate-y-1/2 left-4 w-12 h-12 bg-white/10 rounded-full blur-xl animate-float-slower" />
        </div>

        {/* Message */}
          <p className="float-text text-sm sm:text-base font-medium">Clear schedule for now 👀 no meetings ahead</p>

        {/* Scoped animations */}
        <style jsx>{`
          @keyframes floatY {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes floatYSmall {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          .animate-float-slow { animation: floatY 7s ease-in-out infinite; }
          .animate-float-slower { animation: floatY 9s ease-in-out infinite; }
          .animate-float-rev { animation: floatY 8s ease-in-out infinite reverse; }
          .float-text { animation: floatYSmall 5s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }


  return (
    <div className="bg-[#78A1DB] rounded-xl shadow flex items-center justify-between text-white">
      <div className="items-center p-2 px-8">
        <h3 className="text-[13px] font-medium pt-3">
          Your Next Meeting is Scheduled In
        </h3>
        <div className="flex items-center space-x-8 py-2">
          <div className="flex items-center space-x-2">
            <p className="text-[13px]">
              {classData?.meetingName || "Meeting"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <AiOutlineClockCircle className="w-[13px]" />
            <p className="text-[13px]">{classData?.startTime}</p>
          </div>
        </div>
      </div>
      {/* RIGHT: Countdown or Button */}
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end relative flex-wrap px-10">
          {/* POPUP */}
          {isPopupVisible && !isCountdownFinished && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
              <div className="bg-white dark:bg-[#1D1D1D] rounded-xl shadow-lg p-6 w-[90%] max-w-sm text-center">
                <div className="flex justify-center mb-4">
                  <TimerReset className="w-10 h-10 text-orange-600" />
                </div>
                <p className="text-[#010E30]/70 mb-4 text-sm sm:text-base dark:text-white">
                  Please wait until your session starts...
                </p>
                <div className="w-32 h-1 bg-orange-500 my-4 rounded-full mx-auto"></div>
                <button
                  onClick={() => setIsPopupVisible(false)}
                  className="px-5 py-2 text-sm sm:text-base bg-[#576CBC] text-white rounded-lg w-full hover:bg-[#4659a3] transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Label */}
          {!isCountdownFinished && (
            <p className="text-xs sm:text-sm md:text-base font-medium whitespace-nowrap">
              Starts in
            </p>
          )}

          {/* JOIN OR TIMER */}
          {isCountdownFinished ? (
            <button
              onClick={() =>
                router.push(`/modules/users/teacher/ui/livemeeting?id=${classData?.meetingId}`)
              }
              className="relative px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold 
              text-white bg-gradient-to-r from-[#576CBC] to-[#576CBC] 
              shadow-lg hover:from-[#4961BC] hover:to-[#4961BC]
              transition-all duration-700 ease-in-out 
              animate-pulse hover:animate-none"
            >
              <button className="flex items-center gap-2">
                <FiVideo className="text-white text-sm sm:text-lg" />
                Join Now
              </button>
              <span
                className="absolute inset-0 rounded-full bg-white opacity-10 blur-sm"
                aria-hidden="true"
              />
            </button>
          ) : (
            <div className="relative w-16 h-16 sm:w-[52px] sm:h-[52px]">
              <CircularProgressbar
                value={60 - (timeRemaining % 60)}
                maxValue={60}
                strokeWidth={5}
                text={""}
                styles={buildStyles({
                  pathColor: "#4178C4",
                  trailColor: "#E0E0E0",
                  strokeLinecap: "butt",
                  pathTransitionDuration: 0.5,
                })}
              />
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
              >
                {(() => {
                  const progress = 60 - (timeRemaining % 60);
                  const angle = (progress / 60) * 360 - 90;
                  const radius = 47.5;
                  const rad = (angle * Math.PI) / 180;
                  const x = 50 + radius * Math.cos(rad);
                  const y = 50 + radius * Math.sin(rad);

                  return (
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#235498"
                      stroke="#4178C4"
                      strokeWidth="2"
                    />
                  );
                })()}
              </svg>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40px] h-[40px] sm:w-[40px] sm:h-[40px] rounded-full bg-white flex items-center justify-center text-[#1B1B1B] text-[8px] sm:text-[7px] font-semibold shadow-sm text-center leading-snug">
                {(() => {
                  const hours = Math.floor(timeRemaining / 3600);
                  const minutes = Math.floor((timeRemaining % 3600) / 60); // ✅ stays within 0–59
                  const seconds = timeRemaining % 60;

                  return `${String(hours).padStart(2, "0")}:${String(
                    minutes
                  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
                })()}
              </div>
            </div>
          )}

          {/* 3-DOT MENU */}
          <BsThreeDotsVertical
            className="text-white text-lg sm:text-xl cursor-pointer"
            onClick={() => setIsPopupVisible(!isPopupVisible)}
          />
        </div>
    </div>
  );
};

export default NextMeetingSchedule;
