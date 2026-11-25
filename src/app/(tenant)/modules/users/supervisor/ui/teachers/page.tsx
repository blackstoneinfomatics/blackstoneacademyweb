"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, MoreVertical, Search } from "lucide-react";
import { FaStar } from "react-icons/fa";
import { useRouter } from "next/navigation";
import BaseLayout3 from "@/app/(tenant)/modules/users/supervisor/components/BaseLayout3";
import SupervisorHeader from "../../components/supervisorHeader";
import Pagination from "@/components/Pagination";
import { MdTune } from "react-icons/md";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

const demoFeedbacks = [
  { id: "GRP UX-A1", review: "grp-ux-a1", teacher: "Samantha Neil", feedback: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor int.", className: "Tajweed Masterclass", date: "25 Jan 2026", courseType: "UI/Ux Designer · Online", rating: 5 },
  { id: "INDL UX-A1", review: "indl-ux-a1", teacher: "Harry Potter", feedback: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor int.", className: "Tajweed Masterclass", date: "25 Jan 2026", courseType: "UI/Ux Designer · Online", rating: 5 },
  { id: "GRP UX-A1", review: "grp-ux-a1", teacher: "Samantha Neil", feedback: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor int.", className: "Tajweed Masterclass", date: "25 Jan 2026", courseType: "UI/Ux Designer · Online", rating: 4 },
  { id: "INDL UX-A1", review: "indl-ux-a1", teacher: "Harry Potter", feedback: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor int.", className: "Tajweed Masterclass", date: "25 Jan 2026", courseType: "UI/Ux Designer · Online", rating: 4 },
  { id: "GRP UX-A1", review: "grp-ux-a1", teacher: "Samantha Neil", feedback: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor int.", className: "Tajweed Masterclass", date: "25 Jan 2026", courseType: "UI/Ux Designer · Online", rating: 5 },
  { id: "GRP UX-A1", review: "grp-ux-a1", teacher: "Samantha Neil", feedback: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor int.", className: "Tajweed Masterclass", date: "25 Jan 2026", courseType: "UI/Ux Designer · Online", rating: 4 },
  { id: "INDL UX-A1", review: "indl-ux-a1", teacher: "Harry Potter", feedback: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor int.", className: "Tajweed Masterclass", date: "25 Jan 2026", courseType: "UI/Ux Designer · Online", rating: 5 },
  { id: "GRP UX-A1", review: "grp-ux-a1", teacher: "Samantha Neil", feedback: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor int.", className: "Tajweed Masterclass", date: "25 Jan 2026", courseType: "UI/Ux Designer · Online", rating: 4 },
  { id: "INDL UX-A1", review: "indl-ux-a1", teacher: "Harry Potter", feedback: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor int.", className: "Tajweed Masterclass", date: "25 Jan 2026", courseType: "UI/Ux Designer · Online", rating: 5 },
];

const ManageTeacher: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "teachers" | "scheduled" | "completed" | "cancelled" | "feedback"
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
  const [openClassActionId, setOpenClassActionId] = useState<string | null>(null);
  const [selectedClassDetails, setSelectedClassDetails] = useState<any | null>(null);
  const [openFeedbackActionId, setOpenFeedbackActionId] = useState<string | null>(null);
  const [selectedFeedbackDetails, setSelectedFeedbackDetails] = useState<
    (typeof demoFeedbacks)[number] | null
  >(null);

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
  const filteredFeedbacks = demoFeedbacks.filter((item) =>
    `${item.id} ${item.review} ${item.teacher} ${item.feedback} ${item.className} ${item.courseType}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
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
  const currentFeedbacks = filteredFeedbacks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const activeFilteredItems =
    activeTab === "teachers"
      ? filteredApplicants
      : activeTab === "feedback"
      ? filteredFeedbacks
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

          <button
            onClick={() => {
              setActiveTab("feedback");
              setCurrentPage(1);
            }}
            className={`text-sm pb-1 ${
              activeTab === "feedback"
                ? "font-medium text-[#576CBC] border-b-[3px] border-[#576CBC]"
                : "text-[#010E30] dark:text-white"
            }`}
          >
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
              activeTab === "cancelled" ||
              activeTab === "feedback"
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
            activeTab === "cancelled" ||
            activeTab === "feedback" ? (
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
                  Showing{" "}
                  {activeTab === "feedback"
                    ? currentFeedbacks.length
                    : currentClassClasses.length}{" "}
                  Of{" "}
                  {activeTab === "feedback"
                    ? filteredFeedbacks.length
                    : activeClassClasses.length}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
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
                <button
                  onClick={handleOpenFilter}
                  className="flex items-center gap-2 bg-white dark:bg-[#292929] rounded-lg px-4 py-2.5 text-[11px] text-[#010E30] dark:text-white"
                >
                  <MdTune className="w-4 h-4" />
                  Filter
                </button>
                <button
                  className="flex items-center gap-2 bg-white dark:bg-[#292929] rounded-lg px-3 py-2.5 text-[11px] text-[#010E30] dark:text-white"
                >
                  All Subjects
                  <ChevronDown className="w-3 h-3" />
                </button>
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

          {activeTab === "feedback" ? (
            <div className="w-full overflow-x-auto rounded-lg">
              <table className="w-full min-w-[950px] table-fixed border-collapse">
                <thead>
                  <tr className="bg-[#526D96] text-left text-[11px] text-white">
                    <th className="w-[11%] px-3 py-3 font-medium">Class Id</th>
                    <th className="w-[12%] px-3 py-3 font-medium">Review</th>
                    <th className="w-[15%] px-3 py-3 font-medium">Teacher Name</th>
                    <th className="w-[29%] px-3 py-3 font-medium">Feedback</th>
                    <th className="w-[17%] px-3 py-3 font-medium">Class</th>
                    <th className="w-[11%] px-3 py-3 font-medium">Rating</th>
                    <th className="w-[5%] px-3 py-3 text-center font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentFeedbacks.length ? (
                    currentFeedbacks.map((item, index) => (
                      <tr
                        key={`${item.id}-${index}`}
                        className={`text-[11px] text-[#010E30] dark:text-white ${
                          index % 2 === 0
                            ? "bg-white dark:bg-[#343434]"
                            : "bg-[#F5F5F5] dark:bg-[#2D2D2D]"
                        }`}
                      >
                        <td className="whitespace-nowrap px-3 py-4">{item.id}</td>
                        <td className="px-3 py-4">
                          <div className="flex -space-x-2">
                            {["#E8A17D", "#5A78A8", "#D9A86C", "#83A7A1", "#C4C4C4"].map(
                              (color, avatarIndex) => (
                                <span
                                  key={avatarIndex}
                                  className="h-8 w-8 rounded-full border-2 border-white dark:border-[#343434]"
                                  style={{ backgroundColor: color }}
                                />
                              )
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4">{item.teacher}</td>
                        <td className="px-3 py-4 leading-4">{item.feedback}</td>
                        <td className="px-3 py-4">
                          <div className="font-semibold">{item.className}</div>
                          <div className="mt-1 text-[10px] text-[#9A9A9A]">
                            {item.date} · {item.courseType}
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                className={`h-3 w-3 ${
                                  item.rating >= star
                                    ? "text-[#FAAB3C]"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <div className="relative inline-block">
                            <button
                              type="button"
                              title="Feedback actions"
                              aria-label={`Actions for feedback from ${item.teacher}`}
                              aria-expanded={openFeedbackActionId === `${item.id}-${index}`}
                              onClick={() => {
                                const feedbackId = `${item.id}-${index}`;
                                setOpenFeedbackActionId(
                                  openFeedbackActionId === feedbackId ? null : feedbackId
                                );
                              }}
                              className="p-1 text-[#52698F] hover:text-[#576CBC]"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            {openFeedbackActionId === `${item.id}-${index}` && (
                              <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-md border border-gray-200 bg-white py-1 text-left shadow-lg dark:border-gray-600 dark:bg-[#252525]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedFeedbackDetails(item);
                                    setOpenFeedbackActionId(null);
                                  }}
                                  className="block w-full px-3 py-2 text-xs text-[#010E30] hover:bg-gray-100 dark:text-white dark:hover:bg-[#343434]"
                                >
                                  View Details
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-xs text-gray-500">
                        No feedback found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === "scheduled" ||
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
                    {activeTab === "scheduled" && (
                      <>
                        <th className="px-3 py-3 font-medium">Link</th>
                        <th className="px-3 py-3 font-medium">Status</th>
                      </>
                    )}
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
                          {activeTab === "scheduled" && (
                            <>
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
                            </>
                          )}
                          <td className="px-3 py-3 text-center">
                            <div className="relative inline-block">
                              <button
                                type="button"
                                title="Class actions"
                                aria-label={`Actions for class ${schedule.classId || schedule._id}`}
                                aria-expanded={openClassActionId === schedule._id}
                                onClick={() =>
                                  setOpenClassActionId(
                                    openClassActionId === schedule._id
                                      ? null
                                      : schedule._id
                                  )
                                }
                                className="p-1 text-gray-500 hover:text-[#576CBC]"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {openClassActionId === schedule._id && (
                                <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-md border border-gray-200 bg-white py-1 text-left shadow-lg dark:border-gray-600 dark:bg-[#252525]">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedClassDetails(schedule);
                                      setOpenClassActionId(null);
                                    }}
                                    className="block w-full px-3 py-2 text-xs text-[#010E30] hover:bg-gray-100 dark:text-white dark:hover:bg-[#343434]"
                                  >
                                    View Details
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={activeTab === "scheduled" ? 11 : 9}
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

            <table className="w-full border-collapse">

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

        {selectedClassDetails && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedClassDetails(null);
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="class-details-title"
              className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-[#252525]"
            >
              <button
                type="button"
                aria-label="Close class details"
                onClick={() => setSelectedClassDetails(null)}
                className="absolute right-4 top-3 text-2xl text-gray-500 hover:text-gray-800 dark:hover:text-white"
              >
                &times;
              </button>
              <h2
                id="class-details-title"
                className="mb-5 text-lg font-semibold text-[#010E30] dark:text-white"
              >
                Class Details
              </h2>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
                {[
                  ["Class ID", selectedClassDetails.classId || selectedClassDetails._id],
                  ["Teacher", selectedClassDetails.teacher?.teacherName],
                  ["Student", `${selectedClassDetails.student?.studentFirstName || ""} ${selectedClassDetails.student?.studentLastName || ""}`.trim()],
                  ["Course", selectedClassDetails.course?.courseName],
                  ["Class Type", selectedClassDetails.classType || "Regular Class"],
                  ["Class Topic", selectedClassDetails.subject || selectedClassDetails.classTopic],
                  ["Date", selectedClassDetails.startDate ? new Date(selectedClassDetails.startDate).toLocaleDateString() : ""],
                  ["Time", selectedClassDetails.startTime?.length ? selectedClassDetails.startTime.map((time: string, index: number) => `${time} - ${selectedClassDetails.endTime?.[index] || "-"}`).join(", ") : ""],
                  ["Type", selectedClassDetails.package],
                  ["Status", selectedClassDetails.scheduleStatus],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
                    <dd className="mt-1 break-words font-medium text-[#010E30] dark:text-white">
                      {value || "-"}
                    </dd>
                  </div>
                ))}
                {selectedClassDetails.classLink && (
                  <div>
                    <dt className="text-xs text-gray-500 dark:text-gray-400">Class Link</dt>
                    <dd className="mt-1">
                      <a
                        href={selectedClassDetails.classLink}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all font-medium text-[#576CBC] hover:underline"
                      >
                        {selectedClassDetails.classLink}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          </div>
        )}

        {selectedFeedbackDetails && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedFeedbackDetails(null);
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-details-title"
              className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-[#252525]"
            >
              <button
                type="button"
                aria-label="Close feedback details"
                onClick={() => setSelectedFeedbackDetails(null)}
                className="absolute right-4 top-3 text-2xl text-gray-500 hover:text-gray-800 dark:hover:text-white"
              >
                &times;
              </button>
              <h2
                id="feedback-details-title"
                className="mb-5 text-lg font-semibold text-[#010E30] dark:text-white"
              >
                Feedback Details
              </h2>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
                {[
                  ["Class ID", selectedFeedbackDetails.id],
                  ["Teacher Name", selectedFeedbackDetails.teacher],
                  ["Class", selectedFeedbackDetails.className],
                  ["Date", selectedFeedbackDetails.date],
                  ["Type", selectedFeedbackDetails.courseType],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-gray-500 dark:text-gray-400">
                      {label}
                    </dt>
                    <dd className="mt-1 break-words font-medium text-[#010E30] dark:text-white">
                      {value}
                    </dd>
                  </div>
                ))}
                <div>
                  <dt className="text-xs text-gray-500 dark:text-gray-400">
                    Rating
                  </dt>
                  <dd className="mt-1 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`h-4 w-4 ${
                          selectedFeedbackDetails.rating >= star
                            ? "text-[#FAAB3C]"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">
                    Feedback
                  </dt>
                  <dd className="mt-1 leading-5 text-[#010E30] dark:text-white">
                    {selectedFeedbackDetails.feedback}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        )}

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

