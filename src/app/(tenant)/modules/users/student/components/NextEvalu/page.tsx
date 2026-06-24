"use client";
import { AiOutlineClockCircle } from "react-icons/ai";
import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { MdDateRange } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useRouter } from "next/navigation";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
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
  const router = useRouter();

  const filterUpcomingClass = (response: ApiResponse): ClassData | null => {
    const now = new Date();

    const upcomingClasses = response.classSchedule.filter((cls) => {
      
      const classDate = new Date(cls.startDate);
      const [startHours, startMinutes] = cls.startTime[0]
        .split(":")
        .map(Number);
      const [endHours, endMinutes] = cls.endTime[0].split(":").map(Number);

      classDate.setHours(startHours, startMinutes, 0, 0);
      const classEndTime = new Date(classDate);
      classEndTime.setHours(endHours, endMinutes, 0, 0);

      // Include classes that are upcoming OR currently ongoing
      return now < classEndTime;
    });

    // Sort by closest upcoming class or ongoing one first
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

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const studentId = localStorage.getItem("StudentPortalId");
 const token =
    typeof window !== "undefined" ? localStorage.getItem("StudentAuthToken") : null;

 if (!token) {
  console.error(
    AppValidationMessages.AUTH.TOKEN_REQUIRED
  );
  return;
}      if (!studentId) {
  console.error(
    AppValidationMessages.AUTH.STUDENT_REQUIRED
  );
  return;
}

        const response = await axios.get<ApiResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET_CLASSSHEDULE_STUDENTS}`,
          {
            params: { studentId },
   headers: { "Content-Type": "application/json",
               'Authorization': `Bearer ${token}`,
           },
          }
        );
        const upcomingClass = filterUpcomingClass(
  response.data
);

setClassData(upcomingClass);

if (!upcomingClass) {
  console.log(
    AppValidationMessages.CLASS.NO_UPCOMING_CLASS
  );
}
        setClassData(filterUpcomingClass(response.data));

      } catch (err) {
        console.log("Error loading class details:", err);
      }
    };
    fetchClassData();
  }, []);

  useEffect(() => {
    if (!classData) return;

    const updateRemainingTime = () => {
      const now = new Date();
      const classDate = new Date(classData.startDate);
      const [startHours, startMinutes] = classData.startTime[0]
        .split(":")
        .map(Number);
      const [endHours, endMinutes] = classData.endTime[0]
        .split(":")
        .map(Number);

      classDate.setHours(startHours, startMinutes, 0, 0);
      const classEndTime = new Date(classDate);
      classEndTime.setHours(endHours, endMinutes, 0, 0);

      const timeToStart = classDate.getTime() - now.getTime();
      const timeToEnd = classEndTime.getTime() - now.getTime();

      if (timeToStart > 0) {
        // Before class starts
        setTimeRemaining(Math.floor(timeToStart / (1000 * 60))); // Convert to minutes
        setIsCountdownFinished(false);
      } else if (timeToEnd > 0) {
        // Class ongoing
        setTimeRemaining(0); // Special value to indicate class is ongoing
        setIsCountdownFinished(true);
      } else {
        // Class ended
        setTimeRemaining(-2); // Special value to hide class
        setIsCountdownFinished(false);
      }
    };

    updateRemainingTime();
    const timer = setInterval(updateRemainingTime, 1000); // Update every second
    return () => clearInterval(timer);
  }, [classData]);

  return (
    <div>
      <style>
        {`
              @keyframes wave {
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

              .animated-gradient {
                background: linear-gradient(270deg, #10B981 10%, #FBBF24 30%, #8B5CF6 90%);
                background-size: 400% 400%;
                animation: wave 5s ease infinite;
                -webkit-background-clip: background;
                -webkit-text-fill-color: text;
              }
            `}
      </style>
      <h2 className="text-[15px] font-semibold text-gray-800 pb-[6px] px-4 -mt-[12px]">
        Your Next Classes
      </h2>
      <div className="bg-[#375074] rounded-[16px] shadow flex items-center justify-between text-white">
        <div className="items-center p-1 px-8">
          <h3 className="text-[10px]">
            {classData?.student.studentFirstName} &nbsp; | &nbsp;{" "}
            <FaUser className="inline" /> {classData?.teacher.teacherName}
          </h3>
          <div className="flex items-center space-x-4 py-2">
            <MdDateRange className="w-[10px]" />
            <p className="text-[10px]">
              {classData?.classDay[0]} -{" "}
              {new Date(classData?.startDate ?? "").toLocaleDateString()}
            </p>
            <AiOutlineClockCircle className="w-[10px]" />
            <p className="text-[10px]">
              {classData?.startTime[0]} - {classData?.endTime[0]}
            </p>
          </div>
        </div>
        <div className="relative flex items-center space-x-4">
          {isPopupVisible && !isCountdownFinished && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-10 bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded shadow">
                <p className="text-gray-800 mb-4">
                  Please wait until your session starts...
                </p>
                <button
                  className="bg-[#1C3557] text-white px-4 py-2 rounded text-center ml-28 justify-center"
                  onClick={() => setIsPopupVisible(false)}
                >
                  OK
                </button>
              </div>
            </div>
          )}
          <p className="text-[12px] font-normal">Starts in</p>
          <div className="w-10 h-10">
            <CircularProgressbar
              value={timeRemaining}
              maxValue={40}
              text={`${timeRemaining}m`}
              styles={buildStyles({
                textSize: "18px",
                textColor: "#fff",
                pathColor: "#fff",
              })}
            />
          </div>
          {isCountdownFinished && (
            <button
              className="animated-gradient text-[15px] font-medium text-white px-4 py-2 rounded-full shadow-lg transition-transform transform active:scale-95 hover:scale-105"
              onClick={() => router.push(`/modules/users/student/ui/liveclass`)}
            >
              Join Now
            </button>
          )}
          <BsThreeDotsVertical
            className="cursor-pointer text-[12px]"
            onClick={() => setIsPopupVisible(!isPopupVisible)}
          />
        </div>
      </div>
    </div>
  );
};

export default NextClass;
