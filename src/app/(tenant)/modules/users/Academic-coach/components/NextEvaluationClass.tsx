"use client";

import { FaUserAlt } from "react-icons/fa";
import { AiOutlineClockCircle } from "react-icons/ai";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface AcademicCoach {
  academicCoachId: string;
  name: string;
  email: string;
}

interface Student {
  studentId: string;
  name: string;
  email: string;
  meetingLink: string;
}

interface UpcomingClass {
  academicCoach: AcademicCoach;
  student: Student;
  _id: string;
  classType: string;
  scheduledStartDate: string;
  scheduledEndDate: string;
  scheduledFrom: string;
  scheduledTo: string;
  timeZone: string;
}

const NextEvaluationClass = () => {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [todaysClasses, setTodaysClasses] = useState<UpcomingClass[]>([]);
  const [currentClassIndex, setCurrentClassIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchNextEvaluationClass = async () => {
      try {
        const academicId = localStorage.getItem("AcademicCoachPortalId");
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("AcademicCoachAuthToken")
            : null;

        if (!token) {
          console.error("❌ AdminAuthToken not found");
          return;
        }

        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.DASHBOARD.GET_UPCOMING_CLASSES}`,
          {
            method: "GET",
            params: { academicCoachId: academicId },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.data || !Array.isArray(response.data)) {
          throw new Error("Invalid data format from API");
        }

        const now = new Date();
        const upcoming = response.data
          .filter((item: UpcomingClass) => {
            const classStartDate = new Date(item.scheduledStartDate);
            return classStartDate > now; 
          })
          .sort((a: UpcomingClass, b: UpcomingClass) => {
            return (
              new Date(a.scheduledStartDate).getTime() -
              new Date(b.scheduledStartDate).getTime()
            );
          });

        setTodaysClasses(upcoming.slice(0, 1));
        setCurrentClassIndex(0);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        // setLoading(false);
      }
    };

    fetchNextEvaluationClass();
  }, []);

  // Timer logic for the current class
  useEffect(() => {
    if (todaysClasses.length === 0 || currentClassIndex >= todaysClasses.length) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const classData = todaysClasses[currentClassIndex];
    if (!classData?.scheduledStartDate || !classData?.scheduledEndDate) return;

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const now = new Date();
      const classStartDate = new Date(classData.scheduledStartDate);
      const classEndDate = new Date(classData.scheduledEndDate);

      if (now >= classEndDate) {
        // Move to next class if available
        if (currentClassIndex + 1 < todaysClasses.length) {
          setCurrentClassIndex((idx) => idx + 1);
        } else {
          // No more classes today
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
        setTime({ hours: 0, minutes: 0, seconds: 0 });
      } else if (now < classStartDate) {
        // Before class starts, show countdown
        const remainingTime = classStartDate.getTime() - now.getTime();
        const hours = Math.floor(remainingTime / 1000 / 60 / 60);
        const minutes = Math.floor((remainingTime / 1000 / 60) % 60);
        const seconds = Math.floor((remainingTime / 1000) % 60);
        setTime({ hours, minutes, seconds });
      } else {
        // During class time, show 0:0:0 to indicate class is live
        setTime({ hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [todaysClasses, currentClassIndex]);

  const handleStartClass = (meetingLink: string | undefined) => {
    if (meetingLink) {
      window.open(meetingLink, "_blank");
    } else {
      console.error("No meeting link available");
    }
  };

  const formatTime = (time: number) => (time < 10 ? `0${time}` : time);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day < 10 ? "0" + day : day}.${
      month < 10 ? "0" + month : month
    }.${year}`;
  };

  const classData = todaysClasses[currentClassIndex];
  const now = new Date();
  const classStartDate = classData ? new Date(classData.scheduledStartDate) : null;
  const classEndDate = classData ? new Date(classData.scheduledEndDate) : null;
  const isBeforeClass = classStartDate ? now < classStartDate : false;
  const isDuringClass = classStartDate && classEndDate ? now >= classStartDate && now < classEndDate : false;
  const progress =
    ((time.hours * 3600 + time.minutes * 60 + time.seconds) / (5 * 60 * 60)) *
    100;

  // if (loading) {
  //   return <div className="text-center text-gray-500">Loading...</div>;
  // }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  if (!classData) {
    return (
      <div className="bg-[#71a1db] rounded-xl shadow flex items-center justify-center text-white p-6">
        <span>No upcoming classes.</span>
      </div>
    );
  }

  return (
    <div className="bg-[#71a1db] rounded-xl shadow flex items-center justify-between text-white">
      <div className="items-center p-2 px-8">
        <h3 className="text-[13px] font-medium pt-3">
          Your Next Evaluation Class
        </h3>
        <div className="flex items-center space-x-8 py-2">
          <div className="flex items-center space-x-2">
            <FaUserAlt className="w-[10px]" />
            <p className="text-[13px]">{classData?.student.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            <AiOutlineClockCircle className="w-[10px]" />
            <p className="text-[13px]">{classData?.scheduledFrom}</p>
          </div>
        </div>
        {classData?.scheduledStartDate && (
          <p className="text-[13px] mt-2 text-gray-300 hidden">
            Class Date: {formatDate(classData.scheduledStartDate)}
          </p>
        )}
      </div>
      <div className="flex items-center space-x-2 px-14">
        {isBeforeClass ? (
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
                  <div className="text-[#234878]">
                    <p className="text-[4px] font-bold">SESSION 01</p>
                    <p className="text-[8px] font-extrabold text-[#223857]">
                      {formatTime(time.hours)}:{formatTime(time.minutes)}:
                      {formatTime(time.seconds)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : isDuringClass ? (
          <>
            <button
              onClick={() => handleStartClass(classData?.student.meetingLink)}
              className="relative text-white px-4 py-2 rounded-full text-sm font-medium"
              style={{
                backgroundImage:
                  "linear-gradient(270deg, #0048AB, #0F79BB, #1aa3c7)",
                backgroundSize: "400% 400%",
                animation: "moveGradient 5s ease infinite",
              }}
            >
              Start Now
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
        ) : null}
      </div>
    </div>
  );
};

export default NextEvaluationClass;
