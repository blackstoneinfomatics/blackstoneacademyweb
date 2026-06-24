"use client";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";

type TeacherAPI = {
  _id: string;
  teacherName: string;
  teacherEmail: string;
  joinedStudentsCount: number;
  maleCount: number;
  femaleCount: number;
};

export default function TeachersStudents() {
  const [teachers, setTeachers] = useState<TeacherAPI[]>([]);
  const colors = [
    "bg-red-800",
    "bg-yellow-800",
    "bg-red-500",
    "bg-green-700",
    "bg-purple-600",
    "bg-blue-500",
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("AdminAuthToken");
      if (token) {
        fetchTeacherStudentCount(token);
      } else {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      }
    }
  }, []);

  const fetchTeacherStudentCount = async (token: string) => {
    try {
      const res = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TEACHER_STUDENT_COUNT}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (data.success) {
        // Clean the data to ensure no duplicates or missing IDs
        const cleanedTeachers = data.data.map((teacher: TeacherAPI, index: number) => ({
          ...teacher,
          // Ensure every teacher has a unique ID
          _id: teacher._id || `temp-id-${index}-${Date.now()}`,
        }));
        setTeachers(cleanedTeachers);
      }
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    }
  };

  // Function to generate a stable key for each teacher
  const getTeacherKey = (teacher: TeacherAPI, index: number) => {
    if (teacher._id && teacher._id !== 'undefined') {
      return teacher._id;
    }
    // Fallback to index + timestamp if no valid ID
    return `teacher-${index}-${Date.now()}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 h-[533px] dark:bg-[#343434]">
      <div className="flex justify-between text-sm font-semibold mb-2">
        <span>Teachers</span>
        <span>Students</span>
      </div>

      <div className="max-h-40 overflow-y-scroll scrollbar-none pr-2">
        {teachers.map((teacher, index) => (
          <div
            key={getTeacherKey(teacher, index)}
            className="flex items-center py-[2px] my-1"
          >
            <div className="w-5 flex-shrink-0">
              <div
                className={`w-3 h-3 rounded-full ${colors[index % colors.length]
                  }`}
              ></div>
            </div>
            <div className="flex-grow truncate">
              <span className="text-xs text-gray-700 dark:text-[#fff]">
                {teacher.teacherName}
              </span>
            </div>
            <div className="w-10 text-right">
              <span className="text-xs">{teacher.joinedStudentsCount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}