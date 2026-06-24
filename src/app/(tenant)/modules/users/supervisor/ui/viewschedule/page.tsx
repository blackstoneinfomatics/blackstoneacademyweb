"use client";

import BaseLayout3 from "@/app/(tenant)/modules/users/supervisor/components/BaseLayout3";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { HiOutlineDotsHorizontal, HiOutlineX } from "react-icons/hi";
import { useRouter } from "next/navigation";
import axios from "axios";
import SupervisorHeader from "../../components/supervisorHeader";
import { Search } from "lucide-react";
import { FaChevronDown } from "react-icons/fa";
import { MdTune } from "react-icons/md";
import Pagination from "@/components/Pagination";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

const ViewSchedule = () => {
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
  interface course{
    courseId: string;
    courseName: string;
  }

  interface Schedule {
    student: Student;
    teacher: Teacher;
    _id: string;
    classId: string;
    classDay: string[];
    package: string;
    course: {
      courseId: string;
      courseName: string;
    };
    subject: string;
    preferedTeacher: string;
    totalHourse: number;
    startDate: string;
    endDate: string;
    startTime: string[];
    endTime: string[];
    scheduleStatus: "Scheduled" | "Re-scheduled" | "Ongoing" | "Completed" | "Ready to Start";
    status: string;
    createdBy: string;
    createdDate: string;
    lastUpdatedDate: string;
    __v: number;
    scheduleDate?: Date;
    isOngoing?: boolean;
    isFuture?: boolean;
    formattedTimes?: string[];
  }

  interface ApiResponse {
    totalCount: number;
    students: Schedule[];
  }
  const [uniqueStudentSchedules, setUniqueStudentSchedules] = useState<
    Schedule[]
  >([]);
  const [selectedMenu, setSelectedMenu] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [course, setCourse] = useState("");
  const [sessionClassType, setSessionClassType] = useState("");
  const [startTime, setStartTime] = useState("");
  const [scheduleStatus, setScheduleStatus] = useState("");
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("scheduled");
  const [upcomingClasses, setUpcomingClasses] = useState<Schedule[]>([]);
  const [completedClasses, setCompletedClasses] = useState<Schedule[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const filteredData = useMemo(() => {
    if (!searchQuery) return uniqueStudentSchedules;
    
    const query = searchQuery.toLowerCase();
    return uniqueStudentSchedules.filter((item) => {
      // Search across all relevant fields
      return (
        item.teacher.teacherName.toLowerCase().includes(query) ||
        (item._id || '').toLowerCase().includes(query) ||
        (item.course?.courseName || '').toLowerCase().includes(query) ||
        'Regular Class'.toLowerCase().includes(query) || // Since course type is hardcoded as "Regular Class"
        new Date(item.startDate).toDateString().toLowerCase().includes(query) ||
        item.startTime.some(time => time.toLowerCase().includes(query)) ||
        item.endTime.some(time => time.toLowerCase().includes(query)) ||
        item.scheduleStatus.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, uniqueStudentSchedules]);
  
  useEffect(() => {
    fetchData();
  }, []);
   const fetchData = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("SupervisorAuthToken")
            : null;

        if (!token) {
          console.error("❌ SupervisorAuthToken not found");
          return;
        }
        const response = await axios.get<ApiResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response?.data || !Array.isArray(response.data.students)) {
  console.error("Invalid API response");
  setUniqueStudentSchedules([]);
  return;
}

        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const allSchedules = response.data.students.map((schedule) => {
          const scheduleDate = new Date(schedule.startDate);
          scheduleDate.setHours(0, 0, 0, 0);

          let isOngoing = false;
          let isFuture = false;
          let formattedTimes: string[] = [];

          schedule.startTime.forEach((time, index) => {
            if (!schedule.endTime[index]) return;

            const [startHours, startMinutes] = time.split(":").map(Number);
            const [endHours, endMinutes] = schedule.endTime[index]
              .split(":")
              .map(Number);

            const scheduleStart = new Date(schedule.startDate);
            scheduleStart.setHours(startHours, startMinutes, 0, 0);

            const scheduleEnd = new Date(schedule.startDate);
            scheduleEnd.setHours(endHours, endMinutes, 0, 0);

            if (now >= scheduleStart && now <= scheduleEnd) {
              isOngoing = true;
            }

            if (scheduleStart > now) {
              isFuture = true;
            }

            formattedTimes.push(`${time} - ${schedule.endTime[index]}`);
          });

          // Update status based on conditions
          let updatedStatus = schedule.scheduleStatus;
          if (isOngoing) {
            updatedStatus = "Ongoing";
          } else if (schedule.scheduleStatus === "Re-scheduled") {
            updatedStatus = "Re-scheduled";
          } else if (schedule.scheduleStatus === "Completed") {
            updatedStatus = "Completed";

          } else if (isToday(schedule.startDate)) {
            if (isStartMeetingNow(schedule.startDate, schedule.startTime[0], schedule.endTime[0])) {
              updatedStatus = "Ready to Start";
            } else {
              updatedStatus = "Scheduled";
            }
          } else if (isFuture || (schedule.scheduleDate && schedule.scheduleDate > today)) {

          } else if (
            isFuture ||
            (schedule.scheduleDate && schedule.scheduleDate > today)
          ) {

            updatedStatus = "Scheduled";
          }

          return {
            ...schedule,
            scheduleStatus: updatedStatus,
            isOngoing,
            isFuture,
            scheduleDate,
            formattedTimes,
          };
        });

        // Filter scheduled classes (future dates or ongoing today)
        const scheduled = allSchedules.filter((schedule) => {
          // If status is completed, don't show in scheduled
          if (schedule.scheduleStatus === "Completed") {
            return false;
          }

          return ["Scheduled", "Re-scheduled", "Ongoing"].includes(
            schedule.scheduleStatus
          );
        });

        // Filter completed classes
        const completed = allSchedules.filter((schedule) => {
          return schedule.scheduleStatus === "Completed";
        });

        setUpcomingClasses(scheduled);
        setCompletedClasses(completed);
        setUniqueStudentSchedules(scheduled); // Default to scheduled classes
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

  const handleFilter = async () => {
    setShowModal(false);
    console.log("✅ Filter button clicked");

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("SupervisorAuthToken")
        : null;

    if (!token) {
      console.error("❌ SupervisorAuthToken not found");
      return;
    }

    // Build query params with correct keys
    const params: any = {};
    // if (searchText) params.searchText = searchText;
    if (sessionClassType) params.sessionClassType = sessionClassType; // course type
    if (startTime) params.startTime = startTime; // timing
    if (fromDate) params["dateRange.from"] = fromDate;
    if (toDate) params["dateRange.to"] = toDate;
    if (scheduleStatus) params.scheduleStatus = scheduleStatus; // status
    if (course) params.course = course; // course name

    try {
      const response = await axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params,
      });
      console.log("🔍 Params being sent:", params);
      const meetings: Schedule[] = response.data.students || [];

      setUpcomingClasses(
        meetings.filter((m: Schedule) => m.scheduleStatus !== "Completed")
      );
      setCompletedClasses(
        meetings.filter((m: Schedule) => m.scheduleStatus === "Completed")
      );
      console.log("✅ Filtered data:", response.data);

     setUniqueStudentSchedules(Array.isArray(response.data.students) ? response.data.students : []);
    } 
catch (error: any) {
  if (axios.isAxiosError(error)) {
    console.error(
      error.response?.data?.message ||
      error.message ||
      "Request failed"
    );
  } else {
    console.error(error);
  }
}
  };

  // Update displayed data when tab changes
  useEffect(() => {
    if (activeTab === "scheduled") {
      setUniqueStudentSchedules(upcomingClasses);
       console.log("✅ Filtered upcoming classes", upcomingClasses);
    } else if (activeTab === "completed") {
      setUniqueStudentSchedules(completedClasses);
    }
  }, [activeTab, upcomingClasses, completedClasses]);

  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  console.log("uniqueStudentSchedules", uniqueStudentSchedules);
  const currentItems = filteredData?.slice(indexOfFirst, indexOfLast) ?? [];
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
console.log("currentItems", currentItems);
  const toggleMenu = (index: number) => {
    setSelectedMenu(selectedMenu === index ? null : index);
  };

  const handleLiveClassRedirect = (id: string) => {
    router.push(`/modules/users/supervisor/ui/liveclass?id=${id}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setSelectedMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

const handleReset = () => {
  setFromDate("");
  setToDate("");
  setCourse("");
  setSessionClassType("");
  setStartTime("");
  setScheduleStatus("");

  fetchData();
  // setShowModal(false);
};

  const isToday = (date: string) => {
    const today = new Date();
    const classDate = new Date(date);
    return (
      classDate.getFullYear() === today.getFullYear() &&
      classDate.getMonth() === today.getMonth() &&
      classDate.getDate() === today.getDate()
    );
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([]);
  };

  const getEarliestTime = (times: string[]) => {
    return times.length ? times.toSorted((a, b) => a.localeCompare(b))[0] : "";
  };

  const isClassOngoing = (
    startDate: string,
    startTimes: string[],
    endTimes: string[]
  ) => {
    const now = new Date();
    const today = new Date(startDate); // This is in UTC

    // Convert `today` to local timezone (to avoid mismatch issues)
    const localToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    if (
      localToday.getFullYear() === now.getFullYear() &&
      localToday.getMonth() === now.getMonth() &&
      localToday.getDate() === now.getDate()
    ) {
      return startTimes.some((time, index) => {
        const [startHours, startMinutes] = time.split(":").map(Number);
        const [endHours, endMinutes] = endTimes[index].split(":").map(Number);

        const classStartTime = new Date(localToday);
        classStartTime.setHours(startHours, startMinutes, 0, 0);

        const classEndTime = new Date(localToday);
        classEndTime.setHours(endHours, endMinutes, 0, 0);

        return now >= classStartTime && now <= classEndTime;
      });
    }
    return false;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "text-[#377E36] bg-[#ECFDF3] dark:bg-[#323E31] dark:text-[#377E36] px-[18px]";
      case "Re-scheduled":
        return "text-[#343E59] bg-[#E4E4E4] dark:bg-[#4F4F4F] dark:text-white";
      case "Ongoing":
        return "text-[#576CBC] bg-[#F3F6FF] dark:bg-[#2C3B6C] dark:text-[#576CBC] px-[22px]";
      case "Completed":
        return "text-[#377E36] bg-[#ECFDF3] dark:bg-[#323E31] dark:text-[#377E36]";
      case "Ready to Start":
        return "text-[#576CBC] bg-[#F3F6FF] dark:bg-[#2C3B6C] dark:text-[#576CBC]";
      default:
        return "text-[#377E36] bg-[#ECFDF3]";
    }
  };


  const isStartMeetingNow = (
    selectedDate: string,
    startTime: string,
    endTime: string
  ): boolean => {
    const now = new Date();
    const date = new Date(selectedDate);
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const start = new Date(date);
    start.setHours(startHour, startMin, 0, 0);
    const end = new Date(date);
    end.setHours(endHour, endMin, 0, 0);
    return now >= start && now <= end;
  };

  return (
    <BaseLayout3>
      <SupervisorHeader currentSection="Scheduled Classes" showBackButton={true} showBackPath="/modules/users/supervisor/ui/teachers" />
      {/* Tabs */}
      <div className="flex space-x-6 px-4 py-1 mb-3 rounded-md">
        <button
          className={`relative text-[14px] transition font-medium ${
            activeTab === "scheduled"
              ? "text-[#576CBC] font-semibold"
              : "text-[#0A0A12] dark:text-[#fff] opacity-80"
          }`}
          onClick={() => setActiveTab("scheduled")}
        >
          Scheduled ({upcomingClasses.length})
          {activeTab === "scheduled" && (
            <span className="absolute left-0 ml-5 -bottom-1 w-[60px] h-[2px] rounded-full bg-[#576CBC] dark:text-[#576CBC]" />
          )}
        </button>

        <button
          className={`relative text-[14px] transition font-medium ${
            activeTab === "completed"
              ? "text-[#576CBC] font-semibold"
              : "text-[#0A0A12] dark:text-[#fff] opacity-80"
          }`}
          onClick={() => setActiveTab("completed")}
        >
          Completed ({completedClasses.length})
          {activeTab === "completed" && (
            <span className="absolute left-0 ml-3 -bottom-1 w-[60px] h-[3px] rounded-full bg-[#576CBC]" />
          )}
        </button>
      </div>
      <div className="w-full h-[588px] bg-[#FAFAFB] rounded-lg dark:bg-[#343434]">
        <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search by keyword"
              className="bg-transparent outline-none text-[15px] w-52 py-3"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
            <div
              className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
              onClick={() => setShowModal(true)}
            >
              {/* <BsFilterLeft /> */}
              <MdTune className="w-4 h-4" />
              <span>Filter</span>
            </div>
            {/* Filter Popup */}
            {showModal && (
              <div
                className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center"
              >

                <div className="bg-white p-6 rounded-lg w-[500px] relative dark:bg-[#252525]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                    Filter by
                  </h3>
                  <button onClick={() => setShowModal(false)}>
                    <HiOutlineX className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                  </button>
                </div>

                {/* Date */}
                <div className="mb-4">
                  <label
                    htmlFor="fromDate"
                    className="text-sm font-medium mb-1 dark:text-[#D6D6D6]"
                  >
                    Date Range
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="date"
                      id="fromDate"
                      className="w-1/2 px-3 py-2 border rounded text-xs text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                    <input
                      type="date"
                      id="toDate"
                      className="w-1/2 px-3 py-2 border rounded text-xs text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Course */}
                <div className="mb-4">
                  <label
                    htmlFor="course"
                    className="block text-sm font-medium mb-1 dark:text-white"
                  >
                    Course
                  </label>
                  <select
                    id="course"
                    className="w-full border rounded-md p-2 text-[12px] dark:bg-[#343434] dark:text-[#D6D6D6] dark:border-[#565656]"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  >
                    <option value="">Select any one</option>
                    <option value="Islamic Studies">Islamic Studies</option>
                    <option value="Quran">Quran</option>
                    <option value="Arabic">Arabic</option>
                  </select>
                </div>

                {/* Course Type */}
                <div className="mb-4">
                  <label
                    htmlFor="courseType"
                    className="block text-sm mb-1 dark:text-white"
                  >
                    Course Type
                  </label>
                  <select
                    id="courseType"
                    className="w-full text-[12px] mb-4 p-2 border border-gray-300 dark:bg-[#343434] dark:text-[#D6D6D6] dark:border-[#565656] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={sessionClassType}
                    onChange={(e) => setSessionClassType(e.target.value)}
                  >
                    <option value="">Select any one</option>

                    <option>Regular Class</option>
                    <option>Group Class</option>
                    <option>Trial Class</option>
                  </select>
                </div>

                {/* Timing */}
                <div className="mb-4">
                  <label
                    htmlFor="timing"
                    className="block text-sm mb-1 dark:text-white"
                  >
                    Timing
                  </label>
                  <input
                    type="time"
                    id="timing"
                    className="w-full mb-4 text-xs border border-gray-300 dark:bg-[#343434] dark:text-[#D6D6D6] dark:border-[#565656] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>

                {/* Status */}
                <div className="mb-4">
                  <label
                    htmlFor="status"
                    className="block text-sm mb-1 dark:text-white"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    className="w-full mb-4 text-[12px] border border-gray-300 dark:bg-[#343434] dark:text-[#D6D6D6] dark:border-[#565656] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={scheduleStatus}
                    onChange={(e) => setScheduleStatus(e.target.value)}
                  >
                    {" "}
                    <option value="">Select any one</option>
                    <option>Scheduled</option>
                    <option>Completed</option>
                    <option>Re-Scheduled</option>
                  </select>
                </div>
                <hr className="my-4" />
                <div className="flex justify-between">
                  <button
                    className="px-4 py-2 rounded-md border border-[#576cbc] text-indigo-600 text-sm"
                    onClick={handleReset}
                  >
                    reset
                  </button>
                  <button
                    className="px-4 py-2 rounded-md bg-[#576cbc] text-white hover:bg-indigo-700 text-sm"
                    onClick={handleFilter}
                  >
                    Submit
                  </button>
                </div>
              </div>
              </div>
            )}

          <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
            <span className="text-left -ml-60">
              Showing {currentItems.length} Of {filteredData.length}
            </span>
          </div>
        </div>
            <table className="table-auto w-full"
                    style={{ width: "100%", tableLayout: "fixed" }}>
              <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                <tr className="font-medium">
                  {[
                    "Name",
                    "Id",
                    "Courses",
                    "Courses Type",
                    "Date",
                    "Time",
                    "Status",
                  ].map((header) => (
                    <th
                      key={header}
                      className="text-left px-4 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr
                    key={item._id}
                    className={`text-[12px]  ${
                      index % 2 === 0
                        ? "bg-[#fff] dark:bg-[#2C2C2C] "
                        : "bg-[#F8F8F8] dark:bg-[#303030]"
                    }`}
                  >
                    <td className="px-4 py-4 text-[#3D8FDE] dark:text-[#3D8FDE] text-left">
                      {item.teacher.teacherName}
                    </td>
                    <td className="px-4 py-3 text-[#17243E] dark:text-[#FDFDFD] text-left">
                      {item.classId}
                    </td>
                    <td className="px-4 py-3 text-left">{item.course?.courseName || 'N/A'}</td>
                    <td className="px-4 py-3 text-left">Regular Class</td>
                    <td className="px-4 py-3 text-left">
                      {new Date(item.startDate).toDateString()} </td>
                    <td className="px-4 py-3 text-left">
                      {(() => {
                        let content;
                        console.log(
                          "Checking for:",
                          item.startDate,
                          item.startTime,
                          item.endTime
                        );
                        if (
                          isClassOngoing(
                            item.startDate,
                            item.startTime,
                            item.endTime
                          )
                        ) {
                          content = (
                            <button
                              onClick={() => handleLiveClassRedirect(item._id)}
                              className="py-1 px-2 text-black rounded-lg bg-green-500 cursor-pointer hover:opacity-80 dark:text-[#ffff]"
                            >
                              Ongoing Now ({item.startTime[0]} -{" "}
                              {item.endTime[0]})
                            </button>
                          );
                        } else if (isToday(item.startDate)) {
                          if (
                            isStartMeetingNow(
                              item.startDate,
                              item.startTime[0],
                              item.endTime[0]
                            )
                          ) {
                            content = (
                              <button
                                className="text-[10px] font-semibold px-[11px] py-1 rounded-lg bg-[#576cbc] text-white border cursor-pointer hover:opacity-80"
                                onClick={() =>
                                  router.push(
                                    `/modules/users/supervisor/ui/meetingvideocall?id=${item._id}`
                                  )
                                }>
                                Start Meeting
                              </button>
                            );
                          } else {
                            content = (
                              <span className="py-1 px-2 text-black rounded-lg bg-yellow-500 dark:text-[#ffff]">
                                {formatTime(getEarliestTime(item.startTime))}
                              </span>
                            );
                          }
                        } else {
                          content = (
                            <span className="py-1 px-2 text-black rounded-lg dark:text-[#ffff] ">
                              {formatTime(getEarliestTime(item.startTime))}
                            </span>
                          );
                        }
                        return content;
                      })()}
                    </td>

                    <td className="px-4 py-3 text-left">
                      <span
                        className={`text-[10px] font-semibold px-3 py-2 rounded-lg ${getStatusClass(
                          item.scheduleStatus
                        )}`}
                      >
                        {item.scheduleStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
      </div>
      <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
    </BaseLayout3>
  );
};

export default ViewSchedule;
