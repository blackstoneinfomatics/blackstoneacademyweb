"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, MoreVertical, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import BaseLayout3 from "@/app/(tenant)/modules/users/supervisor/components/BaseLayout3";
import SupervisorHeader from "../../components/supervisorHeader";
import Pagination from "@/components/Pagination";
import { MdTune } from "react-icons/md";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";




const ManageTeacher: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "teachers" | "scheduled" | "completed" | "cancelled"
  >("teachers");
  const [scheduledClasses, setScheduledClasses] = useState<any[]>([]);
  const [completedClasses, setCompletedClasses] = useState<any[]>([]);
  const [cancelledClasses, setCancelledClasses] = useState<any[]>([]);
  // Active filters (applied)
  const [filterName, setFilterName] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  
  // Temporary filters (for input)
  const [tempFilterName, setTempFilterName] = useState("");
  const [tempFilterLevel, setTempFilterLevel] = useState("");
  const [tempFilterCourse, setTempFilterCourse] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [applicants, setApplicants] = useState<any[]>([]);
  const [scheduleFilterOpen, setScheduleFilterOpen] = useState(false);
  const [scheduleFromDate, setScheduleFromDate] = useState("");
  const [scheduleToDate, setScheduleToDate] = useState("");
  const [scheduleCourse, setScheduleCourse] = useState("");
  const [scheduleStatus, setScheduleStatus] = useState("");

  // Reset filters
  const handleResetFilters = () => {
    setFilterName("");
    setFilterLevel("");
    setFilterCourse("");
    setTempFilterName("");
    setTempFilterLevel("");
    setTempFilterCourse("");
    setFilter(false);
  };

  // Apply filters
  const handleApplyFilters = () => {
    setFilterName(tempFilterName);
    setFilterLevel(tempFilterLevel);
    setFilterCourse(tempFilterCourse);
    setCurrentPage(1); // Reset to first page when applying filters
    setFilter(false);
  };

  // Initialize temp filters when opening filter modal
  const handleOpenFilter = () => {
    setTempFilterName(filterName);
    setTempFilterLevel(filterLevel);
    setTempFilterCourse(filterCourse);
    setFilter(true);
  };

  const [Filter, setFilter] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("SupervisorAuthToken")
            : null;

        if (!token) {
          console.error("❌ SupervisorAuthToken not found");
          return;
        }
        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.APPLICANTS.GET_LIST}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "appliation/json",
            },
          }
        );
        if (!response.ok) {
  throw new Error(`Failed to fetch teachers (${response.status})`);
}

const data = await response.json();

        console.log("Fetched data:", data);
        const teachers = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.applicants)
          ? data.applicants
          : [];
        setApplicants(teachers);

      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };


    fetchTeachers();

    const fetchScheduledClasses = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("SupervisorAuthToken")
            : null;

        if (!token) return;

        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch scheduled classes (${response.status})`);
        }

        const data = await response.json();
        const schedules = Array.isArray(data?.students)
          ? data.students
          : Array.isArray(data?.data)
          ? data.data
          : [];

        setScheduledClasses(
          schedules.filter(
            (schedule: any) =>
              schedule.scheduleStatus !== "Completed" &&
              schedule.scheduleStatus !== "Cancelled"
          )
        );
        setCompletedClasses(
          schedules.filter(
            (schedule: any) =>
              schedule.scheduleStatus?.toLowerCase() === "completed"
          )
        );
        setCancelledClasses(
          schedules.filter(
            (schedule: any) =>
              schedule.scheduleStatus?.toLowerCase() === "cancelled"
          )
        );
      } catch (error) {
        console.error("Error fetching scheduled classes:", error);
      }
    };

    fetchScheduledClasses();
  }, []);

  const filteredApplicants = applicants.filter((teacher) => {
    const name = `${teacher.candidateFirstName || ""} ${teacher.candidateLastName || ""}`;
    const matchesSearch = `${name} ${teacher.candidateEmail || ""} ${teacher.positionApplied || ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesName = name.toLowerCase().includes(filterName.toLowerCase());
    const matchesRating = !filterLevel || String(teacher.overallRating || 0) === filterLevel;
    const matchesPosition = !filterCourse || teacher.positionApplied === filterCourse;

    return matchesSearch && matchesName && matchesRating && matchesPosition;
  });

  const filteredScheduledClasses = scheduledClasses.filter((schedule) => {
    const teacherName = schedule.teacher?.teacherName || "";
    const courseName = schedule.course?.courseName || "";
    const classId = schedule.classId || schedule._id || "";
    const status = schedule.scheduleStatus || "";
    const startDate = schedule.startDate ? new Date(schedule.startDate) : null;
    const matchesCourse =
      !scheduleCourse ||
      courseName.toLowerCase() === scheduleCourse.toLowerCase();
    const matchesStatus =
      !scheduleStatus ||
      status.toLowerCase() === scheduleStatus.toLowerCase();
    const matchesFromDate =
      !scheduleFromDate ||
      (startDate ? startDate >= new Date(`${scheduleFromDate}T00:00:00`) : false);
    const matchesToDate =
      !scheduleToDate ||
      (startDate ? startDate <= new Date(`${scheduleToDate}T23:59:59`) : false);

    const matchesSearch = `${teacherName} ${classId} ${courseName} ${status}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return (
      matchesSearch &&
      matchesCourse &&
      matchesStatus &&
      matchesFromDate &&
      matchesToDate
    );
  });

  const filterClassTab = (classes: any[]) =>
    classes.filter((schedule) => {
      const teacherName = schedule.teacher?.teacherName || "";
      const courseName = schedule.course?.courseName || "";
      const classId = schedule.classId || schedule._id || "";
      const status = schedule.scheduleStatus || "";
      const startDate = schedule.startDate ? new Date(schedule.startDate) : null;

      const matchesSearch =
        `${teacherName} ${classId} ${courseName} ${status}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesCourse =
        !scheduleCourse ||
        courseName.toLowerCase() === scheduleCourse.toLowerCase();
      const matchesStatus =
        !scheduleStatus ||
        status.toLowerCase() === scheduleStatus.toLowerCase();
      const matchesFromDate =
        !scheduleFromDate ||
        (startDate
          ? startDate >= new Date(`${scheduleFromDate}T00:00:00`)
          : false);
      const matchesToDate =
        !scheduleToDate ||
        (startDate
          ? startDate <= new Date(`${scheduleToDate}T23:59:59`)
          : false);

      return (
        matchesSearch &&
        matchesCourse &&
        matchesStatus &&
        matchesFromDate &&
        matchesToDate
      );
    });

  const filteredCompletedClasses = filterClassTab(completedClasses);
  const filteredCancelledClasses = filterClassTab(cancelledClasses);
  const pageSize = 10;
  const activeClassClasses =
    activeTab === "completed"
      ? filteredCompletedClasses
      : activeTab === "cancelled"
      ? filteredCancelledClasses
      : filteredScheduledClasses;
  const currentClassClasses = activeClassClasses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const activeFilteredItems =
    activeTab === "teachers"
      ? filteredApplicants
      : activeClassClasses;
  const totalPages = Math.max(1, Math.ceil(activeFilteredItems.length / pageSize));
  const currentApplicants = filteredApplicants.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
 

  const handleViewTeacherSchedule = (teacherId: string) => {
    if (!teacherId) {
      console.error("Teacher ID is undefined.");
      return;
    }
    localStorage.setItem("supervisormanageTeacherId", teacherId);
    console.log("Teacher ID:", teacherId); // Debugging
    router.push(`/modules/users/supervisor/ui/teacherDetails?teacherId=${teacherId}`);
  };

 

return (
  <BaseLayout3>
    <SupervisorHeader currentSection="Teacher's List" />

    <div className="flex min-h-screen bg-[#E7EAF6] dark:bg-[#252525]">
      <div className="flex-1 min-w-0 p-1">

        {/* Top Navigation Tabs */}
        <div className="flex items-center gap-7 px-3 mb-3 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => {
              setActiveTab("teachers");
              setCurrentPage(1);
            }}
            className={`text-sm pb-1 ${
              activeTab === "teachers"
                ? "font-medium text-[#576CBC] border-b-[3px] border-[#576CBC]"
                : "text-[#010E30] dark:text-white"
            }`}
          >
            Teachers
          </button>

          <button
            onClick={() => {
              setActiveTab("scheduled");
              setCurrentPage(1);
            }}
            className={`text-sm pb-1 ${
              activeTab === "scheduled"
                ? "font-medium text-[#576CBC] border-b-[3px] border-[#576CBC]"
                : "text-[#010E30] dark:text-white"
            }`}
          >
            Scheduled Classes ({scheduledClasses.length})
          </button>

          <button
            onClick={() => {
              setActiveTab("completed");
              setCurrentPage(1);
            }}
            className={`text-sm pb-1 ${
              activeTab === "completed"
                ? "font-medium text-[#576CBC] border-b-[3px] border-[#576CBC]"
                : "text-[#010E30] dark:text-white"
            }`}
          >
            Completed Classes ({completedClasses.length})
          </button>

          <button
            onClick={() => {
              setActiveTab("cancelled");
              setCurrentPage(1);
            }}
            className={`text-sm pb-1 ${
              activeTab === "cancelled"
                ? "font-medium text-[#576CBC] border-b-[3px] border-[#576CBC]"
                : "text-[#010E30] dark:text-white"
            }`}
          >
            Cancelled ({cancelledClasses.length})
          </button>

          <button className="text-sm text-[#010E30] dark:text-white pb-1">
            Feedback
          </button>
        </div>

        {/* Main Teachers Container */}
        <div className="bg-[#F7F8FC] dark:bg-[#343434] rounded-xl shadow-sm p-3">

          {/* Header and Search */}
          <div
            className={
              activeTab === "scheduled" ||
              activeTab === "completed" ||
              activeTab === "cancelled"
                ? "grid grid-cols-3 w-full h-[52px] mb-3 bg-white dark:bg-[#292929] rounded-lg overflow-hidden"
                : "flex flex-wrap justify-between items-center gap-3 mb-3"
            }
          >
            {activeTab === "teachers" && (
              <h2 className="text-[15px] font-medium text-[#010E30] dark:text-white">
                Teachers List
              </h2>
            )}

            {activeTab === "scheduled" ||
            activeTab === "completed" ||
            activeTab === "cancelled" ? (
              <>
                <div className="flex items-center w-full h-full px-4">
                  <Search className="w-4 h-4 text-[#52698F] shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by keyword"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full ml-2 text-[13px] outline-none bg-transparent text-[#010E30] dark:text-white placeholder:text-[#A3A3A3]"
                  />
                </div>

                <button
                  onClick={() => setScheduleFilterOpen(true)}
                  className="flex items-center justify-left gap-2 w-full h-full px-4 border-l border-[#EEF0F5] dark:border-[#454545] text-[13px] text-[#A3A3A3] dark:text-white"
                >
                  <MdTune className="w-4 h-4" />
                  Filter
                  <ChevronDown className="w-3 h-3 ml-1" />
                </button>

                <div className="flex items-center justify-left w-full h-full px-5 border-l border-[#EEF0F5] dark:border-[#454545] text-[13px] text-[#A3A3A3]">
                  Showing {currentClassClasses.length} Of{" "}
                  {activeClassClasses.length}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">

              {/* Search */}
              <div className="flex items-center gap-2 bg-white dark:bg-[#292929] rounded-lg px-3 py-2.5 w-[190px]">
                <Search className="w-3.5 h-3.5 text-[#52698F]" />

                <input
                  type="text"
                  placeholder="Search by keyword"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full text-[10px] outline-none bg-transparent text-[#010E30] dark:text-white placeholder:text-gray-400"
                />
              </div>

              {activeTab === "teachers" && (
                <>
                  {/* Filter */}
                  <button
                    onClick={handleOpenFilter}
                    className="flex items-center gap-2 bg-white dark:bg-[#292929] rounded-lg px-4 py-2.5 text-[11px] text-[#010E30] dark:text-white"
                  >
                    <MdTune className="w-4 h-4" />
                    Filter
                  </button>

                  {/* Subject Dropdown */}
                  <button
                    className="flex items-center gap-2 bg-white dark:bg-[#292929] rounded-lg px-3 py-2.5 text-[11px] text-[#010E30] dark:text-white"
                  >
                    All Subjects
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
            )}
          </div>

          {/* Filter Popup */}
          {Filter && (
            <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center">

              <div className="bg-white dark:bg-[#252525] p-6 rounded-lg w-[350px] relative">

                <button
                  className="absolute top-2 right-3 text-gray-400 text-xl"
                  onClick={() => setFilter(false)}
                >
                  &times;
                </button>

                <h2 className="text-lg font-semibold mb-4 dark:text-white">
                  Filter by
                </h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 dark:text-white">
                    Name
                  </label>

                  <input
                    type="text"
                    value={tempFilterName}
                    onChange={(e) => setTempFilterName(e.target.value)}
                    placeholder="Search by teacher name"
                    className="w-full border rounded-md p-2 text-xs dark:bg-[#343434] dark:text-white"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 dark:text-white">
                    Rating
                  </label>

                  <select
                    value={tempFilterLevel}
                    onChange={(e) => setTempFilterLevel(e.target.value)}
                    className="w-full border rounded-md p-2 text-xs dark:bg-[#343434] dark:text-white"
                  >
                    <option value="">All Ratings</option>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <option key={level} value={level}>
                        {level} / 5
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 dark:text-white">
                    Position
                  </label>

                  <select
                    value={tempFilterCourse}
                    onChange={(e) => setTempFilterCourse(e.target.value)}
                    className="w-full border rounded-md p-2 text-xs dark:bg-[#343434] dark:text-white"
                  >
                    <option value="">All Positions</option>
                    <option value="Quran Teacher">Quran Teacher</option>
                    <option value="Arabic Teacher">Arabic Teacher</option>
                    <option value="Islamic Teacher">Islamic Teacher</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-1 rounded-md border border-[#576CBC] text-[#576CBC] text-sm"
                  >
                    Reset
                  </button>

                  <button
                    onClick={handleApplyFilters}
                    className="px-4 py-1 rounded-md bg-[#576CBC] text-white text-sm"
                  >
                    Submit
                  </button>
                </div>

              </div>
            </div>
          )}

          {scheduleFilterOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center">
              <div className="bg-white dark:bg-[#252525] p-6 rounded-lg w-[350px] relative">
                <button
                  className="absolute top-2 right-3 text-gray-400 text-xl"
                  onClick={() => setScheduleFilterOpen(false)}
                >
                  &times;
                </button>

                <h2 className="text-lg font-semibold mb-4 dark:text-white">
                  Filter scheduled classes
                </h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 dark:text-white">
                    Date range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={scheduleFromDate}
                      onChange={(e) => setScheduleFromDate(e.target.value)}
                      className="w-1/2 border rounded-md p-2 text-xs dark:bg-[#343434] dark:text-white"
                    />
                    <input
                      type="date"
                      value={scheduleToDate}
                      onChange={(e) => setScheduleToDate(e.target.value)}
                      className="w-1/2 border rounded-md p-2 text-xs dark:bg-[#343434] dark:text-white"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 dark:text-white">
                    Course
                  </label>
                  <select
                    value={scheduleCourse}
                    onChange={(e) => setScheduleCourse(e.target.value)}
                    className="w-full border rounded-md p-2 text-xs dark:bg-[#343434] dark:text-white"
                  >
                    <option value="">All Courses</option>
                    <option value="Islamic Studies">Islamic Studies</option>
                    <option value="Quran">Quran</option>
                    <option value="Arabic">Arabic</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 dark:text-white">
                    Status
                  </label>
                  <select
                    value={scheduleStatus}
                    onChange={(e) => setScheduleStatus(e.target.value)}
                    className="w-full border rounded-md p-2 text-xs dark:bg-[#343434] dark:text-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Re-scheduled">Re-scheduled</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Ready to Start">Ready to Start</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setScheduleFromDate("");
                      setScheduleToDate("");
                      setScheduleCourse("");
                      setScheduleStatus("");
                      setCurrentPage(1);
                    }}
                    className="px-4 py-1 rounded-md border border-[#576CBC] text-[#576CBC] text-sm"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage(1);
                      setScheduleFilterOpen(false);
                    }}
                    className="px-4 py-1 rounded-md bg-[#576CBC] text-white text-sm"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "scheduled" ||
          activeTab === "completed" ||
          activeTab === "cancelled" ? (
            <div className="w-full overflow-x-auto rounded-lg">
              <table className="w-full min-w-[950px] border-collapse">
                <thead>
                  <tr className="bg-[#526D96] text-white text-[10px] text-left">
                    <th className="px-3 py-3 font-medium">Class ID</th>
                    <th className="px-3 py-3 font-medium">Teacher</th>
                    <th className="px-3 py-3 font-medium">Course Name</th>
                    <th className="px-3 py-3 font-medium">Class Type</th>
                    <th className="px-3 py-3 font-medium">Class Topic</th>
                    <th className="px-3 py-3 font-medium">Date</th>
                    <th className="px-3 py-3 font-medium">Time</th>
                    <th className="px-3 py-3 font-medium">Type</th>
                    <th className="px-3 py-3 font-medium text-center">
                    Action
                  </th>
                  </tr>
                </thead>
                <tbody>
                  {currentClassClasses.length > 0 ? (
                    currentClassClasses.map((schedule, index) => {
                      const startTime = schedule.startTime?.[0] || "-";
                      const endTime = schedule.endTime?.[0] || "-";
                      const status = schedule.scheduleStatus || "Scheduled";

                      return (
                        <tr
                          key={schedule._id}
                          className={`text-[10px] text-[#010E30] dark:text-white ${
                            index % 2 === 0
                              ? "bg-white dark:bg-[#343434]"
                              : "bg-[#F5F5F5] dark:bg-[#2D2D2D]"
                          }`}
                        >
                          <td className="px-3 py-3 whitespace-nowrap">
                            {schedule.classId || schedule._id || "-"}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            {schedule.teacher?.teacherName || "-"}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            {schedule.course?.courseName || "-"}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            Regular Class
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            {schedule.subject ||
                              schedule.classTopic ||
                              schedule.course?.courseName ||
                              "-"}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            {schedule.startDate
                              ? new Date(schedule.startDate).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            {startTime !== "-" ? `${startTime} - ${endTime}` : "-"}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            {schedule.package || "Regular"}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            {schedule.classLink ? (
                              <a
                                href={schedule.classLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#576CBC]"
                              >
                                Open
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex px-3 py-1 rounded-md text-[9px] font-medium ${
                                status === "Ongoing"
                                  ? "bg-[#F3F6FF] text-[#576CBC]"
                                  : status === "Cancelled"
                                  ? "bg-[#FCECEC] text-red-500"
                                  : "bg-[#ECFDF3] text-green-700"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <button
                              title="View class"
                              className="p-1 text-gray-500 hover:text-[#576CBC]"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={11}
                        className="text-center py-10 text-gray-500 text-xs"
                      >
                        No {activeTab} classes found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
          /* Teachers Table */
          <div className="w-full overflow-x-auto rounded-lg">

            <table className="w-full min-w-[1050px] border-collapse">

              {/* Table Header */}
              <thead>
                <tr className="bg-[#526D96] text-white text-[10px] text-left">

                  <th className="px-3 py-3 font-medium">
                    Teacher Name
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Position
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Employment Type
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Rating
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Assigned Students
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Classes Scheduled
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Email id
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Attendance Status
                  </th>

                  <th className="px-3 py-3 font-medium text-center">
                    Action
                  </th>

                </tr>
              </thead>

              {/* Table Body */}
              <tbody>

                {currentApplicants.length > 0 ? (
                  currentApplicants.map((teacher, index) => {

                    const rating = teacher.overallRating || 0;

                    return (
                      <tr
                        key={teacher._id}
                        className={`text-[10px] text-[#010E30] dark:text-white ${
                          index % 2 === 0
                            ? "bg-white dark:bg-[#343434]"
                            : "bg-[#F5F5F5] dark:bg-[#2D2D2D]"
                        } hover:bg-[#EDF1FA] dark:hover:bg-[#404040] transition-colors`}
                      >

                        {/* Teacher Name */}
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2 whitespace-nowrap">

                            <Image
                              src="/assets/images/profilebg.png"
                              alt="Teacher"
                              width={30}
                              height={30}
                              className="rounded-full w-[30px] h-[30px] object-cover"
                            />

                            <span className="font-medium">
                              {teacher.candidateFirstName}{" "}
                              {teacher.candidateLastName}
                            </span>

                          </div>
                        </td>

                        {/* Position */}
                        <td className="px-3 py-2 whitespace-nowrap">
                          {teacher.positionApplied || "-"}
                        </td>

                        {/* Employment Type */}
                        <td className="px-3 py-2 whitespace-nowrap">
                          {teacher.employmentType || "-"}
                        </td>

                        {/* Rating */}
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={
                            rating >= 3
                              ? "text-green-700"
                              : "text-red-500"
                          }>
                            {rating}
                          </span>
                          {" / 5"}
                        </td>

                        {/* Assigned Students */}
                        <td className="px-3 py-2">
                          {teacher.assignedStudents ?? "-"}
                        </td>

                        {/* Classes Scheduled */}
                        <td className="px-3 py-2">
                          {teacher.classesScheduled ?? "-"}
                        </td>

                        {/* Email */}
                        <td className="px-3 py-2">
                          <span
                            className="block max-w-[150px] truncate"
                            title={teacher.candidateEmail}
                          >
                            {teacher.candidateEmail || "-"}
                          </span>
                        </td>

                        {/* Attendance Status */}
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center justify-center min-w-[58px] px-3 py-1 rounded-md text-[9px] font-medium ${
                              teacher.attendanceStatus === "Present"
                                ? "bg-[#E8F9EF] text-green-700"
                                : teacher.attendanceStatus === "Absent"
                                ? "bg-[#FCECEC] text-red-500"
                                : "bg-[#FFF4E5] text-orange-600"
                            }`}
                          >
                            {teacher.attendanceStatus || "Pending"}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() =>
                              handleViewTeacherSchedule(teacher._id)
                            }
                            title="View Teacher Profile"
                            className="p-1 text-gray-500 hover:text-[#576CBC]"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>

                      </tr>
                    );
                  })
                ) : (

                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-10 text-gray-500 text-xs"
                    >
                      No teachers found
                    </td>
                  </tr>

                )}

              </tbody>

            </table>
          </div>
          )}

        </div>

        {/* Pagination */}
        <div className="flex justify-end mt-3">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

      </div>
    </div>
  </BaseLayout3>
);

};

export default ManageTeacher;

