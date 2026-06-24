"use client";

import { FaUserAlt } from "react-icons/fa";
import { AiOutlineClockCircle } from "react-icons/ai";
import { use, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { toast } from "react-toastify";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";
// Interfaces based on your API response
interface Teacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  attendee?: string; // Only present in teacher array under supervisor meetings
  _id?: string;
}

interface Supervisor {
  supervisorId: string;
  supervisorName: string;
  supervisorEmail: string;
}

interface Participant {
  studentId: string;
  studentName: string;
  studentEmail: string;
  _id: string;
}

interface StudentMeeting {
  teacher?: Teacher | Teacher[]; // Can be object or array
  supervisor?: Supervisor;
  _id: string;
  meetingId?: string;
  meetingName: string;
  participants?: Participant[];
  selectedDate: string;
  startTime: string;
  endTime: string;
  description?: string;
  meetingStatus?: string;
  meetingminutes?: string;
  duration?: string;
  status?: string;
  createdDate?: string;
  createdBy?: string;
  updatedDate?: string;
  updatedBy?: string;
  __v?: number;
}

interface StudentMeetingApiResponse {
  totalCount: number;
  records: StudentMeeting[];
}

const NextMeetingSchedule = () => {
  const router = useRouter();
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [classData, setClassData] = useState<StudentMeeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  useEffect(() => {
    const fetchMeeting = async () => {
      setLoading(true);
      setError(null);
      try {
        const studentId = localStorage.getItem("StudentPortalId");
        if (!studentId) {
  toast.error(
    AppValidationMessages.AUTH.STUDENT_REQUIRED
  );
  setLoading(false);
  return;
}
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("StudentAuthToken")
            : null;

       if (!token) {
  toast.error(
    AppValidationMessages.AUTH.TOKEN_REQUIRED
  );
  setLoading(false);
  return;
}

        const res = await axios.get<StudentMeetingApiResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TEACHERMEETING.GET_STUDENTMEETING_LIST}`,
          {
            params: { studentId },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const meetingList: StudentMeeting[] = res.data.records;
        const filteredMeetings = meetingList.filter(meeting =>
          meeting.participants?.some(participant => participant.studentId === studentId)
        );

        const now = new Date();
    const upcoming = filteredMeetings
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

if (!upcoming) {
  console.log(
    AppValidationMessages.MEETING.NO_MEETING_FOUND
  );
}        setLoading(false);
      } catch (err: any) {
        console.error(err);
 toast.error(
    AppFailureToastMessages.MEETING_FETCH
  );

  setError(
    AppFailureToastMessages.MEETING_FETCH
  );        setLoading(false);
      }
    };

    fetchMeeting();
  }, []);

useEffect(() => {
  if (!classData || !classData.startTime || !classData.endTime || !classData.selectedDate) return;

  const [startHour, startMinute] = classData.startTime.split(":").map(Number);
  const [endHour, endMinute] = classData.endTime.split(":").map(Number);

  const meetingStart = new Date(classData.selectedDate);
  meetingStart.setHours(startHour, startMinute, 0, 0);

  const meetingEnd = new Date(classData.selectedDate);
  meetingEnd.setHours(endHour, endMinute, 0, 0);

  const updateTimeLeft = () => {
    const now = new Date();

    if (now < meetingStart) {
      // Before start time
      setIsTimeUp(false);

      const diff = meetingStart.getTime() - now.getTime();
      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTime({ hours, minutes, seconds });
    } else if (now >= meetingStart && now <= meetingEnd) {
      // During meeting
      setIsTimeUp(true);
      setTime({ hours: 0, minutes: 0, seconds: 0 });
    } else {
      // After end time
      setIsTimeUp(false);
      setClassData(null); // Hide meeting details
    }
  };

  updateTimeLeft();
  const interval = setInterval(updateTimeLeft, 1000);

  return () => clearInterval(interval);
}, [classData]);



  const handleStartClass = () => {
router.push(`/modules/users/student/ui/livemeeting?id=${classData?.meetingId}`);
  };

  const formatTime = (time: number) => (time < 10 ? `0${time}` : time);

  const progress =
    ((time.hours * 3600 + time.minutes * 60 + time.seconds) / (5 * 60 * 60)) *
    100;

  if (loading) {
    return (
      <div className="bg-[#71a1db] rounded-xl shadow flex items-center justify-between text-white p-3 min-h-[60px]">
        <div className="flex-1 space-y-4">
          <div className="h-2 bg-blue-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-2 bg-blue-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-2 bg-blue-200 rounded w-1/2 animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-2 px-14">
          <div className="w-16 h-14 bg-blue-300 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-[#71a1db] rounded-xl shadow flex items-center justify-between text-white">
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
      <div className="flex items-center space-x-2 px-14">
        {isTimeUp ? (
          <>
            <button
              onClick={handleStartClass}
              className="relative text-white px-4 py-2 rounded-full text-sm font-medium"
              style={{
                backgroundImage: "linear-gradient(270deg, #0048AB, #0F79BB, #1aa3c7)",
                backgroundSize: "400% 400%",
                animation: "moveGradient 5s ease infinite",
              }}
            >
              Join Now
            </button>
            <style>
              {`
              @keyframes moveGradient {
                0% {
                  background-position: 0% 50%;
                }
                50% {
                  background-position: 100% 50%;
                }
                100% {
                  background-position: 0% 50%;
                }
              }
              `}
            </style>
          </>
        ) : (
          <>
            <p className="text-[13px] font-medium">Starts in</p>
            <div className="relative flex items-center justify-center p-10">
              <svg className="absolute w-14 h-20" viewBox="0 0 36 36">
                <path
                  className="circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                />
                <path
                  className="circle"
                  strokeDasharray={`${progress}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#295CA0"
                  strokeWidth="3"
                />
              </svg>
              <div className="relative flex items-center justify-center w-2 rounded-full bg-[#234878] text-center">
                <div className="absolute flex items-center justify-center w-10 h-10 rounded-full bg-white">
                  <div className="text-[#234878] text-center">
                  
                    <p className="text-[8px] font-extrabold text-[#223857]">
                      {formatTime(time.hours)}:{formatTime(time.minutes)}:
                      {formatTime(time.seconds)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NextMeetingSchedule;
