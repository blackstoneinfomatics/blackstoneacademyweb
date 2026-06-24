"use client";
import { AiOutlineClockCircle } from "react-icons/ai";
import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { MdDateRange } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FiVideo } from "react-icons/fi";
import { TimerReset } from "lucide-react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";

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
  classDay: string[];
  package: string;
  preferedTeacher: string;
  totalHourse: number;
  startDate: string;
  endDate: string;
  startTime: string[];
  endTime: string[];
  scheduleStatus: string;
  classLink: string;
  status: string;
  classStatus: string;
  createdBy: string;
  createdDate: string;
  lastUpdatedDate: string;
}

interface ApiResponse {
  totalCount: number;
  classSchedule: ClassData[];
}

const NextClass = () => {
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isCountdownFinished, setIsCountdownFinished] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [sessionNumber, setSessionNumber] = useState<number>(0);
  const router = useRouter();
  const [loading, setLoading] = useState(true);


  const filterUpcomingClass = (response: ApiResponse): ClassData | null => {
    const now = new Date();

    const upcomingClasses = response.classSchedule.filter((cls) => {
      if (cls.scheduleStatus === "Completed") return false;
      const classDate = new Date(cls.startDate);
      const [startHours, startMinutes] = cls.startTime[0]
        .split(":")
        .map(Number);
      const [endHours, endMinutes] = cls.endTime[0].split(":").map(Number);

      classDate.setHours(startHours, startMinutes, 0, 0);
      const classEndTime = new Date(classDate);
      classEndTime.setHours(endHours, endMinutes, 0, 0);
      return now < classEndTime;
    });
    upcomingClasses.sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);

      const [hoursA, minutesA] = a.startTime[0].split(":").map(Number);
      const [hoursB, minutesB] = b.startTime[0].split(":").map(Number);

      dateA.setHours(hoursA, minutesA, 0, 0);
      dateB.setHours(hoursB, minutesB, 0, 0);

      return dateA.getTime() - dateB.getTime();
    });

    return upcomingClasses.length > 0 ? upcomingClasses[0] : null;
  };

  const calculateSessionNumber = (
    response: ApiResponse,
    currentClass: ClassData
  ): number => {
    if (!currentClass) return 0;

    // Get all classes for this student (excluding completed ones)
    const allClasses = response.classSchedule.filter((cls) => {
      if (cls.scheduleStatus === "Completed") return false;
      return true;
    });

    // Sort all classes by date and time
    allClasses.sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);

      const [hoursA, minutesA] = a.startTime[0].split(":").map(Number);
      const [hoursB, minutesB] = b.startTime[0].split(":").map(Number);

      dateA.setHours(hoursA, minutesA, 0, 0);
      dateB.setHours(hoursB, minutesB, 0, 0);

      return dateA.getTime() - dateB.getTime();
    });

    // Find the index of the current class in the sorted list
    const currentIndex = allClasses.findIndex(
      (cls) => cls._id === currentClass._id
    );

    // Return session number (1-based index)
    return currentIndex >= 0 ? currentIndex + 1 : 0;
  };

  useEffect(() => {
    const fetchClassData = async () => {
      setLoading(false);
      try {
        const studentId =
          typeof window !== "undefined"
            ? localStorage.getItem("StudentPortalId")
            : null;
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("StudentAuthToken")
            : null;
        if (!studentId || !token) {
          toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
          setLoading(false);
          return;
        }

        const response = await axios.get<ApiResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET_CLASSSHEDULE_STUDENTS}`,
          {
            params: { studentId },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const nextClass = filterUpcomingClass(response.data);
        setClassData(nextClass);
        setLoading(false);

        // Calculate session number
        if (nextClass) {
          const sessionNum = calculateSessionNumber(response.data, nextClass);
          setSessionNumber(sessionNum);
        }
      } catch (err) {
        toast.error(AppFailureToastMessages.NEXT_CLASS_FETCH);
        setLoading(true);
      }
    };
    fetchClassData();
  }, []);

  useEffect(() => {
    if (!classData) return;

    const fetchNextClass = async () => {
      setLoading(false);
      try {
        const studentId =
          typeof window !== "undefined"
            ? localStorage.getItem("StudentPortalId")
            : null;
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("StudentAuthToken")
            : null;
        if (!studentId || !token) return;

        const response = await axios.get<ApiResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET_CLASSSHEDULE_STUDENTS}`,
          {
            params: { studentId },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const next = filterUpcomingClass(response.data);
        setClassData(next);

        // Update session number when class data changes
        if (next) {
          const sessionNum = calculateSessionNumber(response.data, next);
          setSessionNumber(sessionNum);
        }
      } catch (error) {
        toast.error(AppFailureToastMessages.NEXT_CLASS_FETCH);
        setLoading(false);
      }
    };

    const updateRemainingTime = () => {
      const now = new Date();

      const classStart = new Date(classData.startDate);
      const classEnd = new Date(classData.startDate);

      const [startHours, startMinutes] = classData.startTime[0]
        .split(":")
        .map(Number);
      const [endHours, endMinutes] = classData.endTime[0]
        .split(":")
        .map(Number);

      classStart.setHours(startHours, startMinutes, 0, 0);
      classEnd.setHours(endHours, endMinutes, 0, 0);

      if (now < classStart) {
        const timeToStart = classStart.getTime() - now.getTime();
        setTimeRemaining(Math.floor(timeToStart / 1000));
        setIsCountdownFinished(false);
      } else if (now >= classStart && now < classEnd) {
        setTimeRemaining(-1);
        setIsCountdownFinished(true);
      } else {
        setIsCountdownFinished(false);
        setTimeRemaining(-1);
        fetchNextClass();
      }
    };

    updateRemainingTime();
    const timer = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(timer);
  }, [classData]);

  if (loading) {
    return (
      <div className="bg-[#78A1DB] rounded-xl shadow flex items-center justify-between text-white p-2 px-4 min-h-[101px]">
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

  if (!classData) {
    return (
      <div className="relative overflow-hidden bg-[#78A1DB] rounded-xl shadow flex items-center justify-center text-white p-2 min-h-[102px]">
        {/* Floating, soft background shapes */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/15 rounded-full blur-2xl animate-float-slow" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float-rev" />
          <div className="absolute top-1/2 -translate-y-1/2 left-4 w-12 h-12 bg-white/10 rounded-full blur-xl animate-float-slower" />
        </div>

        {/* Message */}
          <p className="float-text text-sm sm:text-base font-medium">Clear schedule for now 📚 No classes ahead</p>

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
    <div className="w-full ">
      <div className="max-w-screen-xl mx-auto bg-[#78A1DB] rounded-xl shadow-md px-1 py-[11px] sm:px-2 md:px-6 lg:px-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <h3 className="text-[15px] font-semibold">
            Your Next Scheduled Class 
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm sm:text-sm md:text-sm">
            <div className="mb-4">
            <p className="text-xs sm:text-[8px] md:text-[9px] items-center ml-4 whitespace-nowrap">(Teacher)</p>
            <span className="flex items-center gap-1">
              <FaUser className="text-white/90 text-base sm:text-sm -mt-1" />
              {classData?.teacher?.teacherName.charAt(0).toUpperCase() + classData?.teacher?.teacherName.slice(1).toLowerCase() || "N/A"}
            </span>
            </div>
            

            <span className="flex items-center gap-1">
              <MdDateRange className="text-white/90 text-base sm:text-sm" />
              Session–{sessionNumber.toString().padStart(2, "0")}
            </span>

            <span className="flex items-center gap-1">
              <AiOutlineClockCircle className="text-white/90 text-base sm:text-sm" />
              {classData?.createdDate ? classData.startDate.slice(0, 10) : "00:00"}
            </span>
          </div>
        </div>

        {/* RIGHT: Countdown or Button */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end relative flex-wrap">
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
                window.open(`/modules/users/student/ui/liveclass?id=${classData._id}`, "_blank")
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
            <div className="relative w-14 h-14 sm:w-[70px] sm:h-[70px]">
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

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] rounded-full bg-white flex items-center justify-center text-[#1B1B1B] text-[10px] sm:text-[11px] font-semibold shadow-sm text-center leading-snug">
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
    </div>
  );
};

export default NextClass;
