"use client";
import React, { useEffect, useState } from "react";
import { Calendar, User } from "lucide-react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";

const UpcomingClasses = () => {
  interface ClassEvent {
    student: {
      studentId: string;
      studentFirstName: string;
      studentLastName: string;
      studentEmail: string;
    };
    teacher: {
      teacherId: string;
      teacherName: string;
      teacherEmail: string;
    };
    _id: string;
    classDay: string[];
    package: string;
    preferedTeacher: string;
    totalHours: number;
    startDate: string;
    endDate: string;
    startTime: string[];
    endTime: string[];
    scheduleStatus: string;
    status: string;
    createdBy: string;
    createdDate: string;
    lastUpdatedDate: string;
    __v: number;
  }

  // API Response Interface
  interface ApiResponse {
    totalCount: number;
    classSchedule: ClassEvent[];
  }

  const [classes, setClasses] = useState<ClassEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNextEvaluationClass = async () => {
      try {
        const studentId = localStorage.getItem("StudentPortalId");
        if (!studentId) {
  console.error(
    AppValidationMessages.AUTH.STUDENT_REQUIRED
  );

  setLoading(false);
  return;
}

         const token =
    typeof window !== "undefined" ? localStorage.getItem("StudentAuthToken") : null;

 if (!token) {
  console.error(
    AppValidationMessages.AUTH.TOKEN_REQUIRED
  );

  setLoading(false);
  return;
} 
        const response = await axios.get<ApiResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET_CLASSSHEDULE_STUDENTS}`,
          {
            params: { studentId: studentId },
            headers: {
              "Content-Type": "application/json",
            "Authorization":`Bearer ${token}`
            },
          }
        );
if (
  !response.data.classSchedule ||
  response.data.classSchedule.length === 0
) {
  console.log(
    AppValidationMessages.CLASS.NO_UPCOMING_CLASS

  );

  setClasses([]);
  return;
}
        const sortedClasses = response.data.classSchedule.toSorted(
          (a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );

        setClasses(sortedClasses.slice(0, 4));
      } catch (err) {
  console.error(err);

  setError(
    AppFailureToastMessages.UPCOMING_CLASSES_FETCH
  );
} finally {
  setLoading(false);
}
    };

    fetchNextEvaluationClass();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-gray-800 p-[0px] px-4 -mt-[21px]">
        Upcoming classes
      </h2>
      <div className="bg-[#375074] p-1 rounded-xl shadow-md mt-[4px]">
        {classes.map((cls, index) => (
          <div
            key={cls._id}
            className="flex flex-col md:flex-row justify-between items-center text-white rounded-xl px-4 py-[3px] mb-0 md:mb-0"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-[10px]">
                {cls._id} - {cls.package}
              </span>
              <div className="flex items-center ml-28">
                <User size={13} />
                &nbsp;
                <span className="font-medium text-[10px]">
                  by {cls.teacher.teacherName}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-28">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span className="font-medium text-[10px]">
                  {new Date(cls.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="px-3 py-1 rounded-lg font-medium text-[10px] text-white bg-gray-700">
                {cls.startTime[0]}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingClasses;
