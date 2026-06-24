"use client";

import { useEffect, useState } from "react";
import { AiOutlineClockCircle } from "react-icons/ai";
import { FaUser } from "react-icons/fa";
import axios from "axios";
import { MdDateRange } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiVideo } from "react-icons/fi";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";

interface Student {
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
}

interface Teacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
}

interface ClassData {
  _id: string;
  student: Student;
  teacher: Teacher;
  startDate: string;
  startTime: string[];
  endTime: string[];
  classLink: string;
  sessionStatus: string;
  classStart?: Date;
  classEnd?: Date;
  sessionClassType?: string;
}

const NextScheduledClass = () => {
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isClassOngoing, setIsClassOngoing] = useState(false);
  const [hasClassEnded, setHasClassEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [totalCountdownSeconds, setTotalCountdownSeconds] = useState(0);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      
      const teacherId = localStorage.getItem("TeacherPortalId");
const token = localStorage.getItem("TeacherAuthToken");

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

      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TEACHER_CLASSES}`,
        {
          params: { teacherId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const now = new Date();

      const upcoming = response.data.classScheduleList
        .map((item: ClassData) => {
          const startDate = new Date(item.startDate);
          const [startHour, startMin] = item.startTime[0]
            .split(":")
            .map(Number);
          startDate.setHours(startHour, startMin, 0, 0);

          const endDate = new Date(item.startDate);
          const [endHour, endMin] = item.endTime[0].split(":").map(Number);
          endDate.setHours(endHour, endMin, 0, 0);

          return { ...item, classStart: startDate, classEnd: endDate };
        })
        .filter((item: ClassData) => item.classEnd! > now)
        .sort(
          (a: ClassData, b: ClassData) =>
            a.classStart!.getTime() - b.classStart!.getTime()
        )[0];

      if (upcoming) {
  setClassData(upcoming);
} else {
  setClassData(null);

  console.log(
    AppValidationMessages.NEXT_SCHEDULED_CLASS.NO_CLASS_FOUND
  );
}

    } catch (error) {
  console.error(error);

  toast.error(
    AppFailureToastMessages.NEXT_SCHEDULED_CLASS_FETCH
  );
}
  };

 

  useEffect(() => {
    fetchClassData();
  }, []);
  useEffect(() => {
    if (!classData || !classData.classStart) return;

    const interval = setInterval(() => {
      const now = new Date();
      const distance = classData.classStart!.getTime() - now.getTime();

      if (distance <= 0) {
        setTime({ hours: 0, minutes: 0, seconds: 0 });
        setIsClassOngoing(true); // Optional: immediately set class ongoing
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTime({ hours, minutes, seconds });
    }, 1000); // update every second

    return () => clearInterval(interval);
  }, [classData]);

  // ticking countdown for UI ring and gating join (full duration until start)
  useEffect(() => {
    if (!classData || !classData.classStart) return;

    // capture total seconds at mount for full-duration ring
    const startTimestamp = classData.classStart!.getTime();
    const initialDiffSeconds = Math.max(0, Math.floor((startTimestamp - Date.now()) / 1000));
    setTotalCountdownSeconds(initialDiffSeconds);

    const updateRemaining = () => {
      const now = Date.now();
      const diffSeconds = Math.max(0, Math.floor((startTimestamp - now) / 1000));
      setTimeRemaining(diffSeconds);
    };

    updateRemaining();
    const id = setInterval(updateRemaining, 1000);
    return () => clearInterval(id);
  }, [classData]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!classData) return;

      const now = new Date();
      const start = classData.classStart!;
      const end = classData.classEnd!;

      if (now >= start && now <= end) {
        setIsClassOngoing(true);
      } else {
        setIsClassOngoing(false);
      }

      if (now > end && classData.sessionStatus !== "Completed") {
        console.log(`⏹ Class ${classData._id} ended — marking via evaluation`);

        const token = localStorage.getItem("TeacherAuthToken");
        if (!token) return;

        try {
          await axios.post(
            `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.CLASS_SESSION_END}`,
            { sessionId: classData._id },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log("✅ Evaluation marked as completed");

          setClassData(null);
          setTimeout(() => {
            fetchClassData();
          }, 1500);
        } catch (err) {
  console.error(err);

  toast.error(
    AppFailureToastMessages.CLASS_END_UPDATE
  );
}
      }
    }, 10000); // every 10 sec

    return () => clearInterval(interval);
  }, [classData]);


  const handleJoinClass = () => {
    if (!classData?.classLink) {
  toast.error(
    AppFailureToastMessages.CLASS_LINK_REQUIRED
  );
  return;
}

    const isCountdownFinished = timeRemaining <= 0;
    if (!isCountdownFinished) {
      setIsPopupVisible(true);
      return;
    }
window.open(`/modules/users/teacher/ui/liveclass?id=${classData._id}`, "_blank");
  };

  if (loading)
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

  if (!classData)
    return (
      <div className="relative overflow-hidden bg-[#78A1DB] rounded-xl shadow flex items-center justify-center text-white p-2 min-h-[90px]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/15 rounded-full blur-2xl animate-float-slow" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float-rev" />
          <div className="absolute top-1/2 -translate-y-1/2 left-4 w-12 h-12 bg-white/10 rounded-full blur-xl animate-float-slower" />
        </div>

        <p className="float-text text-sm sm:text-base font-medium">
          Next Class for now 👀 no classes ahead
        </p>

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

  return (
    <div className="bg-[#78A1DB] rounded-xl shadow flex items-center justify-between text-white">
      <div className="items-center p-2 px-8">
        <h3 className="text-[15px] font-medium pt-3">
          Your Next Scheduled Class
        </h3>
        <div className="flex items-center space-x-8 py-2">
          <div className="flex items-center space-x-2">
            <FaUser className="w-[10px]" />
            <p className="text-[13px]">{classData.sessionClassType === 'REGULARCLASS' ? classData.student?.studentFirstName : "Group Class"}</p>
          </div>
          <div className="flex items-center space-x-2">
           <MdDateRange className="text-white/90 text-base w-[10px]" />
           <p className="text-[13px]">Session–01</p> 
          </div> {" "}
          <div className="flex items-center space-x-2">
            <AiOutlineClockCircle className="w-[10px]" />
            <p className="text-[13px]">{classData.startTime[0]}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end relative flex-wrap px-10">
        {/* Popup for early join */}
        {isPopupVisible && timeRemaining > 0 && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
            <div className="bg-white dark:bg-[#1D1D1D] rounded-xl shadow-lg p-6 w-[90%] max-w-sm text-center">
              <p className="text-[#010E30]/70 mb-4 text-sm sm:text-base dark:text-white">
                Please wait until your session starts...
              </p>
              <div className="w-32 h-1 bg-[#0048AB] my-4 rounded-full mx-auto"></div>
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
        {timeRemaining > 0 && (
          <p className="text-xs sm:text-sm md:text-base font-medium whitespace-nowrap">Starts in</p>
        )}

        {/* Join or Countdown */}
        {timeRemaining <= 0 ? (
          <button
            onClick={handleJoinClass}
            className="relative px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#576CBC] to-[#576CBC] shadow-lg hover:from-[#4961BC] hover:to-[#4961BC] transition-all duration-700 ease-in-out animate-pulse hover:animate-none"
          >
            <span className="flex items-center gap-2">
              <FiVideo className="text-white text-sm sm:text-lg" />
              Join Now
            </span>
            <span className="absolute inset-0 rounded-full bg-white opacity-10 blur-sm" aria-hidden="true" />
          </button>
        ) : (
          <div className="relative w-16 h-16 sm:w-[52px] sm:h-[52px]">
            <CircularProgressbar
              value={Math.max(0, totalCountdownSeconds - timeRemaining)}
              maxValue={Math.max(1, totalCountdownSeconds)}
              strokeWidth={5}
              text={""}
              styles={buildStyles({
                pathColor: "#4178C4",
                trailColor: "#E0E0E0",
                strokeLinecap: "butt",
                pathTransitionDuration: 0.5,
              })}
            />
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
              {(() => {
                const progressed = Math.max(0, totalCountdownSeconds - timeRemaining);
                const fraction = totalCountdownSeconds > 0 ? progressed / totalCountdownSeconds : 1;
                const angle = fraction * 360 - 90;
                const radius = 47.5;
                const rad = (angle * Math.PI) / 180;
                const x = 50 + radius * Math.cos(rad);
                const y = 50 + radius * Math.sin(rad);
                return (
                  <circle cx={x} cy={y} r="5" fill="#235498" stroke="#4178C4" strokeWidth="2" />
                );
              })()}
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40px] h-[40px] sm:w-[40px] sm:h-[40px] rounded-full bg-white flex items-center justify-center text-[#1B1B1B] text-[8px] sm:text-[7px] font-semibold shadow-sm text-center leading-snug">
              {(() => {
                const hours = Math.floor(timeRemaining / 3600);
                const minutes = Math.floor((timeRemaining % 3600) / 60);
                const seconds = timeRemaining % 60;
                return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
              })()}
            </div>
          </div>
        )}

        {/* 3-dot menu */}
        <BsThreeDotsVertical
          className="text-white text-lg sm:text-xl cursor-pointer"
          onClick={() => setIsPopupVisible(!isPopupVisible)}
        />
      </div>
    </div>
  );
};

export default NextScheduledClass;
