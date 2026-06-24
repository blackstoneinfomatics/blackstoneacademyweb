"use client";
import { AiOutlineClockCircle } from "react-icons/ai";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
// Interfaces based on your API response
interface Teacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  _id: string;
}

interface AdminMeeting {
  _id: string;
  meetingId: string;
  meetingName: string;
  teachers: Teacher[];
  selectedDate: string;
  startTime: string;
  endTime: string;
  description: string;
  meetingStatus: string;
  status?: string;
  createdDate: string;
  createdBy: string;
  updatedDate?: string;
  updatedBy?: string;
}

const NextMeetingSchedule = () => {
  const router = useRouter();
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [classData, setClassData] = useState<AdminMeeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isMeetingOngoing, setIsMeetingOngoing] = useState(false);
  const [showTeacherList, setShowTeacherList] = useState(false);

  useEffect(() => {
    const fetchMeeting = async () => {
      setLoading(true);
      setError(null);
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("AdminAuthToken")
            : null;

        if (!token) {
          setLoading(false);
          return;
        }

        const res = await axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ADMIN_MEETING.GET_LIST}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // Transform the response
        const apiMeetings = res.data.data?.meetings || [];
        const meetings: AdminMeeting[] = apiMeetings.map((group: any) => {
          const firstRecord = group.records[0];
          return {
            _id: firstRecord._id,
            meetingId: group.meetingId,
            meetingName: firstRecord.meetingName,
            meetingStatus: firstRecord.meetingStatus,
            selectedDate: firstRecord.selectedDate,
            startTime: firstRecord.startTime,
            endTime: firstRecord.endTime,
            description: firstRecord.description,
            createdDate: firstRecord.createdDate,
            createdBy: firstRecord.createdBy,
            teachers: group.records.map((rec: any) => rec.teacher[0]),
            status: firstRecord.status,
            updatedDate: firstRecord.updatedDate,
            updatedBy: firstRecord.updatedBy,
          };
        });

        // Find the next upcoming meeting
        const now = new Date();
        const upcoming = meetings
          .filter((m) => {
            if (!m.startTime || !m.endTime || !m.selectedDate) return false;
            const [startHour, startMinute] = m.startTime.split(":").map(Number);
            const [endHour, endMinute] = m.endTime.split(":").map(Number);
            const startDateTime = new Date(m.selectedDate);
            startDateTime.setHours(startHour, startMinute, 0, 0);
            const endDateTime = new Date(m.selectedDate);
            endDateTime.setHours(endHour, endMinute, 0, 0);
            return endDateTime > now;
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
      } catch (err: any) {
        setError("Failed to fetch meeting data");
        setLoading(false);
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
      setIsMeetingOngoing(false);

      const diff = meetingStart.getTime() - now.getTime();
      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTime({ hours, minutes, seconds });
    } else if (now >= meetingStart && now <= meetingEnd) {
      // During meeting
      setIsTimeUp(true);
      setIsMeetingOngoing(true);
      setTime({ hours: 0, minutes: 0, seconds: 0 });
    } else {
      // After end time
      setIsTimeUp(false);
      setIsMeetingOngoing(false);
      setClassData(null); // Hide meeting details
    }
  };

  updateTimeLeft();
  const interval = setInterval(updateTimeLeft, 1000);

  return () => clearInterval(interval);
}, [classData]);




  const handleStartClass = () => {
router.push(`/modules/users/admin-main/ui/livemeeting?meetingId=${classData?.meetingId}`);
  };

  const formatTime = (time: number) => (time < 10 ? `0${time}` : time);

  const progress =
    ((time.hours * 3600 + time.minutes * 60 + time.seconds) / (5 * 60 * 60)) *
    100;

  if (loading) {
    return (
      <div className="bg-[#71a1db] rounded-xl shadow flex items-center justify-between text-white p-6 min-h-[100px]">
        <div className="flex-1 space-y-4">
          <div className="h-3 bg-blue-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-3 bg-blue-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-3 bg-blue-200 rounded w-1/2 animate-pulse"></div>
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

  return (
    <div className="bg-[#71a1db] rounded-xl w-full shadow flex items-center justify-between text-white">
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
          <div className="flex items-center space-x-2">
            <p className="text-[13px]">
              {classData?.selectedDate
                ? new Date(classData.selectedDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })
                : ""}
            </p>
          </div>
          {classData?.teachers && classData.teachers.length > 0 && (
  <div className="relative">
    <button
      className="px-3 py-1 bg-[#576CBC] text-white rounded  shadow text-xs font-medium"
      onClick={() => setShowTeacherList((prev) => !prev)}
    >
      View List
    </button>

    {showTeacherList && (
      <div className="absolute mt-2 w-40 bg-white dark:bg-[#343434] border border-[#D4D4D4] rounded-lg overflow-hidden text-center">
        <ul>
          {classData.teachers.map((teacher, index) => (
            <li
              key={teacher.teacherId}
              className={`py-2 text-[#010E30] dark:text-[#FFFFFF] text-sm ${
                index !== classData.teachers.length - 1 ? 'border-b border-[#D4D4D4]' : ''
              }`}
            >
              {teacher.teacherName}
            </li>
          ))}
          <li className="py-2 text-[#010E30] dark:text-[#FFFFFF] text-sm border-t border-[#D4D4D4] cursor-pointer ">
            Cancel
          </li>
        </ul>
      </div>
    )}
  </div>
)}

        </div>
      </div>
      <div className="flex items-center space-x-2 px-14">
        {isMeetingOngoing  ? (
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
