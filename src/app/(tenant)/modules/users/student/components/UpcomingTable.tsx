"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface ClassData {
  _id: string;
  student: Student;
  classId: string;
  teacher: Teacher;
  classDay: string[];
  package: string;
  preferedTeacher: string;
  course: Course;
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
interface Course {
  courseId: string;
  courseName: string;
}

interface ApiResponse {
  totalCount: number;
  classSchedule: ClassData[];
}

const UpcomingTable = () => {
  const [loading, setLoading] = useState(true);

  const [upcomingClasses, setUpcomingClasses] = useState<ClassData[]>([]);
  useEffect(() => {
    const fetchClasses = async () => {
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
          console.log("Missing studentId or authToken");
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

        const classes = response.data.classSchedule;
        const now = new Date();

        const upcoming = classes
          .filter((cls) => {
            const classDate = new Date(cls.startDate);
            const [startHours, startMinutes] = cls.startTime[0]?.split(":") || [
              0, 0,
            ];
            classDate.setHours(+startHours, +startMinutes, 0, 0);
            return (
              now < classDate &&
              (cls.scheduleStatus === "Scheduled" ||
                cls.scheduleStatus === "Rescheduled" || cls.scheduleStatus === "Reschedulerequested")
            );
          })
          .sort(
            (a, b) =>
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );

        const completed = classes
          .filter((cls) => cls.scheduleStatus === "Completed" || cls.scheduleStatus === "BothAbsent" || cls.scheduleStatus === "StudentAbsent" || cls.scheduleStatus === "TeacherAbsent" )
          .sort(
            (a, b) =>
              new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
        setUpcomingClasses(upcoming.slice(0, 5));
        console.log("upcomoinig class",upcoming);
        console.log("completed clasees",completed);
      } catch (error) {
        console.error("Error fetching class data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const getStatusClass = (status: string) => {
    if (status === "Scheduled" || status === "Completed") {
      return "bg-[#ECFDF3] text-[#377E36] dark:bg-[#408d4033]";
    } else {
      return "bg-gray-200 text-gray-600 dark:bg-[#DEDEDE33] dark:text-[#bbbdbc]";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg dark:bg-[#343434]">
      <div className="overflow-x-auto scrollbar-none h-full">
        <div className="overflow-y-auto h-[320px] rounded-xl scrollbar-none">
          <table className="min-w-full text-xs border-collapse table-fixed px-4">
  <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#44699d]">
    <tr>
      {[
        "Class ID",
        "Teacher Name",
        "Course",
        "Date",
        "Time",
        "Status",
      ].map((col) => (
        <th
          key={col}
          className="py-4 px-2 font-semibold border border-[#466993] dark:border-[#466993] text-left"
        >
          {col}
        </th>
      ))}
    </tr>
  </thead>

  <tbody>
    {loading ? (
      <tr>
        <td
          colSpan={6}
          className="text-center py-6 text-[11px] text-gray-500"
        >
          Loading...
        </td>
      </tr>
    ) : upcomingClasses.length === 0 ? (
      <tr>
        <td
          colSpan={6}
          className="text-center py-6 text-[11px] text-gray-500"
        >
          No upcoming classes.
        </td>
      </tr>
    ) : (
      [...upcomingClasses]
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() -
            new Date(b.startDate).getTime()
        ) // ✅ Latest dates first
        .map((cls, index) => (
          <tr
            key={cls._id}
            className={`text-[10px] px-2 py-4 ${
              index % 2 === 0
                ? "bg-[#fff] dark:bg-[#2c2c2c]"
                : "bg-[#F8F8F8] dark:bg-[#303030]"
            }`}
          >
            <td className="py-4 px-3 text-left">{cls.classId}</td>

            <td className="py-2 px-2 text-left text-[#3D8FDE]">
              {cls.teacher?.teacherName
                ? cls.teacher.teacherName.charAt(0).toUpperCase() +
                  cls.teacher.teacherName.slice(1).toLowerCase()
                : "N/A"}
            </td>

            <td className="py-2 px-2 text-left">
              {cls.course?.courseName || "N/A"}
            </td>

            <td className="px-4 py-3 text-left">
              {new Date(cls.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}
            </td>

            <td className="py-2 px-2 text-left">
              {cls.startTime?.[0]} - {cls.endTime?.[0]}
            </td>

            <td className="py-2 px-2 text-left">
              <span
                className={`px-2 py-1 rounded-sm text-[10px] font-semibold ${getStatusClass(
                  cls.scheduleStatus
                )}`}
              >
                {cls.scheduleStatus}
              </span>
            </td>
          </tr>
        ))
    )}
  </tbody>
</table>
        </div>
        <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
          <span className="text-left -ml-60">{/* Footer if needed */}</span>
        </div>
      </div>
    </div>
  );
};

export default UpcomingTable;
