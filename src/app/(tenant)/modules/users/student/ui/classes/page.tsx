"use client";

import BaseLayout2 from "@/app/(tenant)/modules/users/student/components/BaseLayout2";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-datepicker/dist/react-datepicker.css";
import MyClass from "./MyClass";
import axios from "axios";
import { MoreVertical, Search, TimerReset } from "lucide-react";
import { MdTune } from "react-icons/md";
import Pagination from "@/components/Pagination";
import moment from "moment";
import { getSocket } from "@/app/utils/socket";
import StudentHeader from "../../components/StudentHeader";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

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

interface ClassData {
  _id: string;
  classId:string;
  student: Student;
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

interface ApiResponse {
  totalCount: number;
  classSchedule: ClassData[];
}

const Classes = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"Scheduled" | "Completed">(
    "Scheduled"
  );
  const [upcomingClasses, setUpcomingClasses] = useState<ClassData[]>([]);
  const [completedClasses, setCompletedClasses] = useState<ClassData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [popupVisible, setPopupVisible] = useState<string | null>(null);
  const itemsPerPage = 8;
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredClass, setFilteredClass] = useState<ClassData[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [filterCourse, setFilterCourse] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [filterFromTime, setFilterFromTime] = useState("");
  const [filterToTime, setFilterToTime] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDataCountShow , setFilterDataCountShow] = useState(false);
  const [showLateReschedulePopup, setShowLateReschedulePopup] = useState(false);
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
          toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
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
        setUpcomingClasses(upcoming);
        setCompletedClasses(completed);
      } catch (error) {
        toast.error(AppFailureToastMessages.UPCOMING_CLASSES_FETCH);
      }
    };

    fetchClasses();
  }, []);
  useEffect(() => {
    const userId =
      typeof window !== "undefined"
        ? localStorage.getItem("StudentPortalId")
        : null;
    if (!userId) return;
    const socket = getSocket(userId);
    const handleUpcoming = (data: ClassData) => {
      setUpcomingClasses((prev) =>
        prev.map((app) =>
          app._id.toString() === data._id.toString() ? data : app
        )
      );
    };
    socket.on("academicStudentReSchedule", handleUpcoming);
    return () => {
      socket.off("academicStudentReSchedule", handleUpcoming);
    };
  }, []);

  const filteredClasses =
    activeTab === "Scheduled" ? upcomingClasses : completedClasses;
  const displayedClasses = filteredClass.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

 useEffect(() => {
  const query = searchQuery.toLowerCase();

 
  const fromDate = filterFromDate ? new Date(filterFromDate) : null;
  const toDate = filterToDate ? new Date(filterToDate) : null;

  if (fromDate) fromDate.setHours(0, 0, 0, 0); 
  if (toDate) toDate.setHours(23, 59, 59, 999); 

  const filtered = filteredClasses.filter((cls) => {
    const teacherName = cls.teacher?.teacherName?.toLowerCase() ?? "";
    const courseName = cls.course?.courseName?.toLowerCase() ?? "";
    const status = cls.scheduleStatus;

   
    const classDate = new Date(cls.startDate);
    const [hour, minute] = cls.startTime?.[0]?.split(":").map(Number) ?? [0, 0];
    classDate.setHours(hour, minute, 0, 0); 

    const classTime = cls.startTime[0] ?? "";

    const matchesSearch = teacherName.includes(query);
    const matchesCourse = filterCourse
      ? courseName === filterCourse.toLowerCase()
      : true;
    const matchesStatus = filterStatus ? status === filterStatus : true;
    const matchesDate =
      (!fromDate || classDate >= fromDate) &&
      (!toDate || classDate <= toDate);
    const matchesTime =
      (!filterFromTime || classTime >= filterFromTime) &&
      (!filterToTime || classTime <= filterToTime);

    return (
      matchesSearch &&
      matchesCourse &&
      matchesStatus &&
      matchesDate &&
      matchesTime
    );
  });

  setFilteredClass(filtered);
  setCurrentPage(1);
}, [
  searchQuery,
  filteredClasses,
  filterCourse,
  filterFromDate,
  filterToDate,
  filterFromTime,
  filterToTime,
  filterStatus,
]);


  const getStatusClass = (status: string) => {
    if (status === "Scheduled" || status === "Completed") {
      return "bg-[#ECFDF3] text-[#377E36] dark:bg-[#408d4033]";
    } else {
      return "bg-gray-200 text-gray-600 dark:bg-[#DEDEDE33] dark:text-[#bbbdbc]";
    }
  };

  const handlePopupToggle = (classId: string) => {
    setPopupVisible(popupVisible === classId ? null : classId);
  };

  const handleReschedule = (
    classId: string,
    course: string,
    startTime: string,
    startDate: string
  ) => {
    const studentpackage =
      typeof window !== "undefined"
        ? localStorage.getItem("StudentPackage")
        : null;

    const now = moment(); // current time
    const classDateTime = moment(
      `${startDate} ${startTime}`,
      "YYYY-MM-DD HH:mm"
    );

    const diffInMinutes = classDateTime.diff(now, "minutes");

    if (diffInMinutes < 240) {
      setShowLateReschedulePopup(true);
      setTimeout(() => {
        setShowLateReschedulePopup(false);
      }, 3000);

      return;
    }

    if (studentpackage === "Pro" || studentpackage === "Elite") {
      router.push(
        `/modules/users/student/ui/Proreschedule?classId=${classId}&course=${course}`
      );
    } else {
      router.push(`/modules/users/student/ui/Reschedule?classId=${classId}`);
    }
  };

  const handleCancel = (classId: string) => {
    setPopupVisible(null);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClass.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClass.length / itemsPerPage);
  const scheduledCount = filteredClass.filter(cls =>
  ["Scheduled", "Rescheduled", "Reschedulerequested"].includes(cls.scheduleStatus)
).length;

const completedCount = filteredClass.filter(cls =>
  ["Completed", "BothAbsent", "TeacherAbsent", "StudentAbsent"].includes(cls.scheduleStatus)
).length;

  return (
    <BaseLayout2>
      <div className="mx-auto max-w-screen-2xl px-2 sm:px-4 lg:px-6">
        <StudentHeader currentSection="My Class" />
        <MyClass />
        {/* Tabs */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 py-4">
        <button
          className={`relative text-xs sm:text-sm md:text-base font-medium transition ${
            activeTab === "Scheduled"
              ? "text-[#576CBC] font-semibold"
              : "text-[#010E30] dark:text-white"
          }`}
          onClick={() => setActiveTab("Scheduled")}
        >
          Scheduled{" "}
          <span className={`font-medium  ${
            activeTab === "Scheduled"
              ? "text-[#576CBC] font-semibold"
              : "text-[#010E30] dark:text-white"
          }`}>
            {filterDataCountShow ? (`(${scheduledCount})`) : (`(${upcomingClasses.length})`) }
          </span>
          {activeTab === "Scheduled" && (
            <span className="absolute left-0 -bottom-1 w-full h-[2px] rounded-full bg-[#576CBC]" />
          )}
        </button>

        <button
          className={`relative text-xs sm:text-sm md:text-base font-medium transition ${
            activeTab === "Completed"
              ? "text-[#576CBC] font-semibold"
              : "text-[#010E30] dark:text-white"
          }`}
          onClick={() => setActiveTab("Completed")}
        >
          Completed{" "}
          <span className={`font-medium ${
            activeTab === "Completed"
              ? "text-[#576CBC] font-semibold"
              : "text-[#010E30] dark:text-white"
          }`}>
            { filterDataCountShow ? (`(${completedCount})`) : (`(${completedClasses.length})`) }
          </span>
          {activeTab === "Completed" && (
            <span className="absolute left-0 -bottom-1 w-full h-[2px] rounded-full bg-[#576CBC]" />
          )}
        </button>
      </div>

        {/* Table Header & Filters */}
        <div className="w-full bg-[#FAFAFB] dark:bg-[#343434] rounded-lg overflow-x-auto scrollbar-none">
          <div className="flex flex-col md:flex-row items-start md:items-center px-4 relative gap-4 md:gap-0">
            <div className="flex-1 flex items-center gap-2 text-sm text-gray-500 justify-start px-4">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Teacher name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm outline-none bg-transparent placeholder-gray-400"
              />
            </div>
            <button
              onClick={() => setShowFilter(true)}
              className="flex-1 flex items-center gap-2 text-sm text-gray-400 cursor-pointer justify-start border-y-0 border-l-2 border-r-2 border-gray-300 dark:border-[#868585] h-full md:h-[40px] px-4"
            >
              <MdTune className="w-5 h-5" />
              <span>Filter</span>
            </button>
            <div className="flex-1 flex items-center text-sm  px-4 text-gray-500 justify-start">
              <span>
                Showing {displayedClasses.length} of {filteredClasses.length}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full table-auto border-collapse text-[13px] sm:text-sm">
              <thead>
                <tr>
                  {[
                    "Class ID",
                    "Teacher Name",
                    "Course",
                    "Date",
                    "Time",
                    "Status",
                    "Action",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3.5 text-left font-medium border border-[#4C6993] bg-[#4C6993] text-white dark:bg-[#6087C0]"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-sm">
                      No classes found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((cls, index) => (
                    <tr
                      key={cls._id}
                      className={`${
                        index % 2 === 0
                          ? "bg-white dark:bg-[#2C2C2C]"
                          : "bg-[#F8F8F8] dark:bg-[#303030]"
                      }`}
                    >
                      <td className="px-4 py-3 text-left break-words">
                        <span className="text-xs">{cls.classId || cls.classLink}</span>
                      </td>
                      <td className="px-4 py-3 text-left text-[#576CBC] text-xs sm:text-xs">
                        {cls.teacher?.teacherName || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-left text-xs">
                        {cls.course.courseName}
                      </td>
                      <td className="px-4 py-3 text-left text-xs">
                        {new Date(cls.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-left text-xs">
                        {cls.startTime[0]} - {cls.endTime[0]}
                      </td>
                      <td className="px-4 py-3 text-center text-xs">
                        <span
                          className={`px-3 py-1 rounded-sm font-semibold inline-block text-xs ${getStatusClass(
                            cls.scheduleStatus
                          )}`}
                        >
                          {cls.scheduleStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-left relative">
                        {activeTab === "Scheduled" &&
                        cls.scheduleStatus === "Scheduled" ? (
                          <>
                            {popupVisible === cls._id && (
                              <div className="absolute right-0 z-50 w-40 bottom-2 bg-white border rounded-sm  dark:bg-[#2C2C2C]">
                                <button
                                  onClick={() =>
                                    handleReschedule(
                                      cls._id,
                                      cls.course.courseName,
                                      cls.startTime[0],
                                      cls.startDate
                                    )
                                  }
                                  className="block w-full px-4 py-2 text-center text-xs text-gray-700 dark:text-[#ECFDF3] hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  Request Reschedule
                                </button>
                                <div className="w-full h-px bg-[#D4D4D4] mx-auto" />
                                <button
                                  onClick={() => handleCancel(cls._id)}
                                  className="block w-full px-4 py-2 text-center text-xs text-gray-700 dark:text-[#ECFDF3] hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                            <button
                              onClick={() => handlePopupToggle(cls._id)}
                              className="inline-flex justify-center p-1"
                            >
                              <MoreVertical className="w-4 h-4 text-slate-900 dark:text-white" />
                            </button>
                          </>
                        ) : (
                          activeTab === "Completed" ||
                          (cls.scheduleStatus === "Rescheduled" && (
                            <div className="flex justify-center">
                              <MoreVertical className="w-4 h-4 text-slate-900 dark:text-white" />
                            </div>
                          ))
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {showLateReschedulePopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
            <div className="bg-white dark:bg-[#1D1D1D] rounded-xl shadow-lg p-6 w-[90%] max-w-sm text-center">
              <div className="flex justify-center mb-4">
                <TimerReset className="w-10 h-10 text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold text-[#010E30] dark:text-white mb-4">
                Rescheduling not allowed
              </h2>
              <p className="text-[#010E30]/70 mb-4 text-sm sm:text-sm dark:text-white">
                You can only reschedule a class at least 4 hours before it
                starts.
              </p>
              <div className="w-32 h-1 bg-orange-500 my-4 rounded-full mx-auto"></div>
              <button
                onClick={() => setShowLateReschedulePopup(false)}
                className="px-5 py-2 text-sm sm:text-base bg-[#576CBC] text-white rounded-lg w-full hover:bg-[#4659a3] transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
        {showFilter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-sm rounded-xl shadow-xl p-6 relative space-y-5 mx-3 sm:mx-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-[#010E30] dark:text-white">
                  Filter by
                </h3>
                <button
                  className="text-red-500 hover:text-gray-700 dark:hover:text-white text-sm"
                  onClick={() => setShowFilter(false)}
                >
                  ✕
                </button>
              </div>

              {/* Course */}
              <div>
                <label
                  htmlFor="jhvch"
                  className="text-sm text-[#010E30] dark:text-gray-300 mb-1 block"
                >
                  Course
                </label>
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="w-full border border-gray-300 dark:border-[#444] px-3 py-2 rounded-md text-sm bg-white dark:bg-[#2D2D2D] text-[#010E30CC]/80 dark:text-white"
                >
                  <option value="">Select Course</option>
                  <option value="Quran">Quran</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Islamic Studies">Islamic </option>
                </select>
              </div>

              {/* Date Range */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label
                    htmlFor="iiu"
                    className="text-sm text-[#010E30] dark:text-gray-300 mb-1 block"
                  >
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filterFromDate}
                    onChange={(e) => setFilterFromDate(e.target.value)}
                    className="w-full border border-gray-300 dark:border-[#444] px-3 py-2 rounded-md text-xs bg-white dark:bg-[#2D2D2D] text-[#010E30CC]/80 dark:text-[#FFFFFFCC]/80"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="hcvccv"
                    className="text-sm text-[#010E30] dark:text-gray-300 mb-1 block"
                  >
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filterToDate}
                    onChange={(e) => setFilterToDate(e.target.value)}
                    className="w-full border border-gray-300 dark:border-[#444] px-3 py-2 rounded-md text-xs bg-white dark:bg-[#2D2D2D] text-[#010E30CC]/80 dark:text-[#FFFFFFCC]/80"
                  />
                </div>
              </div>

              {/* Time Range */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label
                    htmlFor="uycuycf"
                    className="text-sm text-[#010E30] dark:text-gray-300 mb-1 block"
                  >
                    From Time
                  </label>
                  <input
                    type="time"
                    value={filterFromTime}
                    onChange={(e) => setFilterFromTime(e.target.value)}
                    className="w-full border border-gray-300 dark:border-[#444] px-3 py-2 rounded-md text-sm bg-white dark:bg-[#2D2D2D] text-[#010E30CC]/80 dark:text-[#FFFFFFCC]/80"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="hvv"
                    className="text-sm text-[#010E30] dark:text-gray-300 mb-1 block"
                  >
                    To Time
                  </label>
                  <input
                    type="time"
                    value={filterToTime}
                    onChange={(e) => setFilterToTime(e.target.value)}
                    className="w-full border border-gray-300 dark:border-[#444] px-3 py-2 rounded-md text-sm bg-white dark:bg-[#2D2D2D] text-[#010E30CC]/80 dark:text-[#FFFFFFCC]/80"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="hvvjh"
                  className="text-sm text-[#010E30] dark:text-gray-300 mb-1 block"
                >
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full border border-gray-300 dark:border-[#444] px-3 py-2 rounded-md text-sm bg-white dark:bg-[#2D2D2D] text-[#010E30CC]/80 dark:text-[#FFFFFFCC]/80"
                >
                  <option value="">Select Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Rescheduled">Rescheduled</option>
                </select>
              </div>
              {/* Buttons */}
              <div className="flex gap-7 pt-2 justify-center ">
                <button
                  onClick={() => {
                    setFilterCourse("");
                    setFilterFromDate("");
                    setFilterToDate("");
                    setFilterFromTime("");
                    setFilterToTime("");
                    setFilterStatus("");
                    setShowFilter(false);
                    setFilterDataCountShow(false);
                  }}
                  className="px-4 py-1 border border-[#576CBC] rounded text-[#576CBC] hover:bg-gray-100 transition "
                >
                  Reset
                </button>
                <button
                  onClick={() => {setShowFilter(false) , setFilterDataCountShow(true)}}
                  className="px-5 py-1 bg-[#576CBC] text-white rounded hover:bg-blue-700 transition"
                >
                  Show {filteredClass.length} results
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseLayout2>
  );
};

export default Classes;
