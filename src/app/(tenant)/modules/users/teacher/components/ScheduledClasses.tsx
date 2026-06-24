// updated
"use client";

import React, { useEffect, useState } from "react";
import { MdTune } from "react-icons/md";
import { MoreVertical, Search } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";
import Modal from "react-modal";
import { getSocket } from "@/app/utils/socket";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { toast } from "react-toastify";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";

export interface UnifiedClassSchedule {
  _id: string;
  classId?: string;

  classLink: string;
  sessionClassType: "GROUPCLASS" | "REGULARCLASS" | "TRIALCLASS";
  scheduleStatus: string;

  course: {
    courseId: string;
    courseName: string;
  };

  startDate: string;
  endDate: string;

  classDay: string[];
  startTime: string[];
  endTime: string[];

  /* ---------- STUDENTS (WORKS FOR BOTH) ---------- */
  students: UnifiedStudent[];

  /* ---------- TEACHER (NULL FOR GROUP IF NOT SENT) ---------- */
  teacher?: {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
    teacherSessionStart: string | null;
    teacherSessionEnd: string | null;
  };

  /* ---------- OPTIONAL REGULAR CLASS FIELDS ---------- */
  package?: string;
  totalHourse?: number;

  status?: string;
  createdBy?: string;
  teacherAttendee?: string;
  studentAttendee?: string;

  classhour?: string;
  currency?: string;
  amount?: string;
  earnings?: number;
  isSalaryProcessed?: boolean;

  sessionStarttime?: string;
  sessionsEndtime?: string;
  sessionStatus?: string;

  createdDate?: string;
  lastUpdatedDate?: string;
  __v?: number;
}
export interface UnifiedStudent {
  student: {
    id: string;
    studentId: string;
    studentFirstName: string;
    studentLastName: string;
    studentEmail: string;
    gender: string;
    level: string;
    studnetSessionStart: string[] | null;
    studnetSessionEnd: string[] | null;
  };

  /* Group class fields */
  status?: string;
  sessionStatus?: string;
  earnings?: number;
}

export interface TrialClass {
  id: string;
  trialId: string;

  student: {
    id: string;
    studentId: string;
    studentName: string;
  };

  classType: string;
  meetingLink: string;

  course: {
    courseId: string;
    courseName: string;
  };
  scheduledStartDate: string;
  scheduledEndDate: string;
  scheduledFrom: string;
  scheduledTo: string;

  meetingStatus: string;
}

export interface ApiResponse {
  totalCount: number;
  classScheduleList: UnifiedClassSchedule[];
  trialclasses: TrialClass[];
}

const ScheduledClasses = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredClasses, setFilteredClasses] = useState<
    UnifiedClassSchedule[]
  >([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [openStudents, setOpenStudents] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    courseName: "",
    teacher: "",
    scheduleStatus: "",
    studentName: "",
    fromDate: "",
    toDate: "",
  });

  const itemsPerPage = 10;
  const [upcomingClasses, setUpcomingClasses] = useState<
    UnifiedClassSchedule[]
  >([]);
  const [completedData, setCompletedData] = useState<UnifiedClassSchedule[]>(
    []
  );

  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

  const fetchClasses = async () => {
    try {
      const teacherId = localStorage.getItem("TeacherPortalId");
      const token = localStorage.getItem("TeacherAuthToken");

      console.log("Fetching classes...");
      console.log("Teacher ID:", teacherId);
      console.log("Auth Token Present:", !!token);

      if (!teacherId) {
                      toast.error(
                        AppValidationMessages.NEXT_SCHEDULED_CLASS.NO_TEACHER_ID
                      );
                      return;
                    }
            
             if (!token) {
                      toast.error(
                        AppValidationMessages.NEXT_SCHEDULED_CLASS.NO_TOKEN
                      );
                      return;
                    }

      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TEACHER_CLASSES}`,
        {
          params: { teacherId },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", response.data);

      // Process regular classes
      const regularClasses: UnifiedClassSchedule[] =
        response.data.classScheduleList.map((cls: any) => {
          // Normalize: if it's a regular class with a single student
          if (cls.student && cls.sessionClassType !== "GROUPCLASS") {
            cls.students = [{ student: cls.student }];
            delete cls.student;
          }
          if (cls.sessionClassType === "GROUPCLASS" && !cls.students) {
            cls.students = cls.student;
          }

          // Ensure session arrays exist for each student
          cls.students?.forEach((s: any) => {
            s.student.studnetSessionStart ||= [];
            s.student.studnetSessionEnd ||= [];
          });

          // Return the unified class object
          return {
            ...cls,
            isTrial: false,
          };
        });

      console.log("Processed Regular Classes:", regularClasses);

      /* ---------------- TRIAL CLASSES ---------------- */

      let trialClasses: UnifiedClassSchedule[] = [];

      if (Array.isArray(response.data.trialclasses)) {
        console.log("Raw Trial Classes Data:", response.data.trialclasses);

        const now = new Date();

        trialClasses = response.data.trialclasses.map((trialClass: any) => {
          // Compute the class start datetime
          const classStartDateTime =
            trialClass.scheduledStartDate && trialClass.scheduledFrom
              ? (() => {
                const date = new Date(trialClass.scheduledStartDate);
                const [hours, minutes] = trialClass.scheduledFrom
                  .split(":")
                  .map(Number);
                date.setHours(hours, minutes, 0, 0);
                return date;
              })()
              : null;

          const now = new Date();

          let sessionStatus = "Scheduled";
          if (classStartDateTime && classStartDateTime < now) {
            sessionStatus = "Completed";
          }

          return {
            _id: trialClass.id || trialClass.trialId || "",
            classId: "",
            classLink: trialClass.trialId || "",
            sessionClassType: "TRIALCLASS",
            scheduleStatus: sessionStatus,
            course: {
              courseId: trialClass.course?.courseId || "",
              courseName: trialClass.course?.courseName || "",
            },
            startDate: trialClass.scheduledStartDate || "",
            endDate: trialClass.scheduledEndDate || "",
            classDay: trialClass.scheduledStartDate
              ? [
                new Date(trialClass.scheduledStartDate).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                  }
                ),
              ]
              : [],
            startTime: [trialClass.scheduledFrom || ""],
            endTime: [trialClass.scheduledTo || ""],
            students: [
              {
                student: {
                  id: trialClass.student?.id || "",
                  studentId: trialClass.student?.studentId || "",
                  studentFirstName:
                    trialClass.student?.studentName?.split(" ")[0] || "Trial",
                  studentLastName:
                    trialClass.student?.studentName
                      ?.split(" ")
                      .slice(1)
                      .join(" ") || "Student",
                  studentEmail: "",
                  gender: "",
                  level: "",
                  studnetSessionStart: [],
                  studnetSessionEnd: [],
                },
                status: "Active",
                sessionStatus: sessionStatus,
                earnings: 0,
              },
            ],
            package: "",
            totalHourse: 0.5,
            status: "Active",
            createdBy: "System",
            classhour: "0.5",
            currency: "$",
            amount: "0",
            earnings: 0,
            isSalaryProcessed: false,
            sessionStarttime: trialClass.scheduledFrom || "",
            sessionsEndtime: trialClass.scheduledTo || "",
          };
        });

        console.log("Processed Trial Classes:", trialClasses);
      } else {
        console.log("No trial classes found or incorrect format.");
      }

      // Combine both types
      const allClasses = [...regularClasses, ...trialClasses];
      if (allClasses.length === 0) {
  console.log(
    AppValidationMessages.SCHEDULED_CLASSES.NO_CLASSES_FOUND
  );
}
      console.log("All Classes Combined:", allClasses);

      // Filter completed classes
      const now = new Date();

      const parseDateTime = (dateStr: string, timeStr?: string) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        if (timeStr) {
          const [hours, minutes] = timeStr.split(":").map(Number);
          date.setHours(hours, minutes, 0, 0);
        }
        return date;
      };

      const completed = allClasses
        .filter((cls) => {
          const endDateTime = parseDateTime(cls.endDate, cls.endTime?.[0]); // endTime array first element
          return (
            [
              "Completed",
              "BothAbsent",
              "StudentAbsent",
              "TeacherAbsent",
            ].includes(cls.scheduleStatus) ||
            (endDateTime && endDateTime < now)
          );
        })
        .sort((a, b) => {
          const aDate =
            parseDateTime(a.startDate, a.startTime?.[0]) || new Date(0);
          const bDate =
            parseDateTime(b.startDate, b.startTime?.[0]) || new Date(0);
          return bDate.getTime() - aDate.getTime(); // descending
        });

      const upcoming = allClasses
        .filter((cls) => {
          const startDateTime = parseDateTime(
            cls.startDate,
            cls.startTime?.[0]
          );
          return (
            ["Scheduled", "Rescheduled", "Reschedulerequested"].includes(
              cls.scheduleStatus
            ) &&
            startDateTime &&
            startDateTime >= now
          );
        })
        .sort((a, b) => {
          const aDate =
            parseDateTime(a.startDate, a.startTime?.[0]) || new Date(0);
          const bDate =
            parseDateTime(b.startDate, b.startTime?.[0]) || new Date(0);
          return aDate.getTime() - bDate.getTime(); // ascending: closest to now first
        });

      console.log("Upcoming Classes:", upcoming);
      console.log("Completed Classes:", completed);
      setUpcomingClasses(upcoming);
      setCompletedData(completed);
      setFilteredClasses(activeTab === "upcoming" ? upcoming : completed);
      console.log("Class data successfully set to state.");
    } catch (error) {
  console.error(error);

  toast.error(
    AppFailureToastMessages.SCHEDULED_CLASSES_FETCH
  );
}
  };

  // Add this useEffect to load data on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    const userId =
      typeof window !== "undefined"
        ? localStorage.getItem("TeacherPortalId")
        : null;
    if (!userId) return;
    const socket = getSocket(userId);
    const handleUpcoming = (data: UnifiedClassSchedule) => {
      console.log("Update student");
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

const handleRescheduleRedirect = (
  id: string
) => {
  if (!id) {
    toast.error(
      AppFailureToastMessages.CLASS_RESCHEDULE
    );
    return;
  }

  router.push(
    `/modules/users/teacher/ui/teacherreschedule?classId=${id}`
  );
};

  const dataToShow: UnifiedClassSchedule[] =
    activeTab === "upcoming" ? upcomingClasses : completedData;

  useEffect(() => {
    setFilteredClasses(dataToShow);
    setSearchQuery("");
    setCurrentPage(1);
  }, [activeTab, upcomingClasses, completedData]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) {
      setFilteredClasses(dataToShow);
      setCurrentPage(1);
      return;
    }

    const filtered = dataToShow.filter((item) =>
      (item.students || []).some((s: any) => {
        const fullName = `${s.student?.studentFirstName || ""} ${s.student?.studentLastName || ""
          }`
          .toLowerCase()
          .trim();

        return fullName.includes(lowerQuery);
      })
    );

    setFilteredClasses(filtered);
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    const latestDataToShow =
      activeTab === "upcoming" ? upcomingClasses : completedData;

    let filtered = [...latestDataToShow];

    if (
  filters.fromDate &&
  !filters.toDate
) {
  toast.error(
    AppValidationMessages.SCHEDULED_CLASSES.TO_DATE_REQUIRED
  );
  return;
}

if (
  !filters.fromDate &&
  filters.toDate
) {
  toast.error(
    AppValidationMessages.SCHEDULED_CLASSES.FROM_DATE_REQUIRED
  );
  return;
}

if (
  filters.fromDate &&
  filters.toDate &&
  new Date(filters.toDate) <
    new Date(filters.fromDate)
) {
  toast.error(
    AppValidationMessages.SCHEDULED_CLASSES.INVALID_DATE_RANGE
  );
  return;
}

    if (filters.courseName) {
      filtered = filtered.filter((c) =>
        c.course?.courseName
          ?.toLowerCase()
          .includes(filters.courseName.toLowerCase())
      );
    }

    if (filters.scheduleStatus) {
      filtered = filtered.filter(
        (c) =>
          c.scheduleStatus?.toLowerCase() ===
          filters.scheduleStatus.toLowerCase()
      );
    }
    if (filters.studentName) {
      const search = filters.studentName.toLowerCase();

      filtered = filtered.filter((c) =>
        (c.students || []).some((s: any) => {
          const fullName = `${s.student?.studentFirstName || ""}`
            .toLowerCase()
            .trim();

          return fullName.includes(search);
        })
      );
    }

    if (filters.fromDate && filters.toDate) {
      const from = new Date(filters.fromDate);
      const to = new Date(filters.toDate);

      filtered = filtered.filter((c) => {
        const date = new Date(c.startDate);
        return date >= from && date <= to;
      });
    }

    setFilteredClasses(filtered);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      courseName: "",
      teacher: "",
      scheduleStatus: "",
      studentName: "",
      fromDate: "",
      toDate: "",
    });
    const latestDataToShow =
      activeTab === "upcoming" ? upcomingClasses : completedData;
    setFilteredClasses(latestDataToShow);
    setIsFilterModalOpen(true);
  };

  const studentNames = Array.from(
    new Set(
      dataToShow.flatMap((c) =>
        (c.students || []).map((s: any) =>
          `${s.student?.studentFirstName || ""}`.trim()
        )
      )
    )
  )
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClasses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);

  return (
    <div className="md:p-0 mt-4 mx-auto">
      <div className="h-full w-full flex flex-col justify-between">
        <div className="p-0 justify-between flex flex-col">
          <div className="flex space-x-6 px-4 py-2 rounded-md">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`relative text-[15px] transition font-medium ${activeTab === "upcoming"
                  ? "text-[#576CBC] font-semibold"
                  : "text-[#0A0A12] dark:text-[#fff] opacity-80"
                }`}
            >
              Scheduled ({upcomingClasses.length})
              {activeTab === "upcoming" && (
                <span className="absolute left-0 ml-5 -bottom-1 w-[60px] h-[2px] rounded-full bg-[#576CBC]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`relative text-[15px] transition font-medium ${activeTab === "completed"
                  ? "text-[#576CBC] font-semibold"
                  : "text-[#0A0A12] dark:text-[#fff] opacity-80"
                }`}
            >
              Completed ({completedData.length})
              {activeTab === "completed" && (
                <span className="absolute left-0 ml-5 -bottom-1 w-[60px] h-[2px] rounded-full bg-[#576CBC]" />
              )}
            </button>
          </div>

          <div className="mt-2">
            <div className=" w-full bg-[#FAFAFB] dark:bg-[#343434] rounded-t-lg justify-between  flex flex-col md:flex-row items-start md:items-center px-4 relative gap-4 md:gap-0">
              <div className="flex-1 flex items-center gap-2 text-sm text-gray-500 justify-start px-4">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Student name"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full text-sm outline-none bg-transparent placeholder-gray-400"
                />
              </div>
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="flex-1 flex items-center gap-2 text-sm text-gray-400 cursor-pointer justify-start border-y-0 border-l-2 border-r-2 border-gray-300 dark:border-[#868585] h-full md:h-[40px] px-4"
              >
                <MdTune className="w-5 h-5" />
                <span>Filter</span>
              </button>
              <div className="flex-1 flex items-center text-sm  px-4 text-gray-500 justify-start">
                <span>
                  Showing {currentItems.length} Of {filteredClasses.length}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-none">
            <table
              className="w-full table-auto border-collapse text-[12px]"
              style={{ tableLayout: "fixed" }}
            >
              <thead className="px-4 py-3.5 text-center border text-[14px] border-[#4C6993] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                <tr className="font-extralight">
                  <th className="text-left px-4 py-3 w-[180px] font-normal">
                    Class ID
                  </th>
                  <th className="text-left px-4 py-3 font-normal">
                    Student Name
                  </th>
                  <th className="text-left px-4 py-3 font-normal">Course</th>
                  <th className="text-left px-4 py-3 font-normal">
                    Class Type
                  </th>
                  <th className="text-left px-4 py-3 font-normal">Date</th>
                  <th className="text-left px-4 py-3 font-normal">Timing</th>
                  <th className="text-left px-4 py-3 w-[180px] font-normal">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-normal">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => {
                    /* ---------- DERIVED FLAGS ---------- */
                    const isTrial =
                      item.totalHourse === 0.5 && item.createdBy === "System";

                    /* ---------- DATE ---------- */
                    const dateObj = item.startDate
                      ? new Date(item.startDate)
                      : null;
                    const formattedDate = dateObj
                      ? dateObj.toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })
                      : "N/A";

                    /* ---------- TIME ---------- */
                    const startTime = item.startTime?.[0];
                    const endTime = item.endTime?.[0];
                    const timeDisplay =
                      startTime && endTime
                        ? `${startTime} - ${endTime}`
                        : "N/A";
                    const studentNames =
                      // ✅ GROUP CLASS (students[])
                      Array.isArray(item.students) && item.students.length > 0
                        ? item.students
                          .map(({ student }) => {
                            if (!student) return null;

                            const first =
                              student.studentFirstName?.trim() || "";
                            const last =
                              student.studentLastName?.trim() || "";

                            // avoid duplicate first + last
                            if (
                              first &&
                              last &&
                              first.toLowerCase() === last.toLowerCase()
                            ) {
                              return first;
                            }

                            return `${first} ${last}`.trim() || "Student";
                          })
                          .filter(Boolean)
                          .join(", ")
                        : // ✅ REGULAR CLASS (single student)
                        "N/A";

                    /* ---------- COURSE ---------- */
                    const courseName = item.course?.courseName || "N/A";

                    /* ---------- CLASS TYPE ---------- */
                    const classType =
                      item.sessionClassType === "GROUPCLASS"
                        ? "Group Class"
                        : isTrial
                          ? "Trial Class"
                          : "Regular Class";

                    /* ---------- STATUS ---------- */
                    const status = item.scheduleStatus;
                    const startDateTime = new Date(item.startDate);
                    let startTimeStr = "";
                    if (item.startTime?.[0]) {
                      startTimeStr = item.startTime[0]; // get startTime string
                      const [hours, minutes] = startTimeStr
                        .split(":")
                        .map(Number);
                      startDateTime.setHours(hours, minutes, 0, 0);
                    }
                    const studentsArray = studentNames
                      ? studentNames.split(", ").filter(Boolean)
                      : [];

                    return (
                      <tr
                        key={`${item._id
                          }_${startDateTime.getTime()}_${startTimeStr}`} // include startTime in key
                        className={`text-[12px] ${index % 2 === 0
                            ? "bg-[#fff] dark:bg-[#2C2C2C]"
                            : "bg-[#F8F8F8] dark:bg-[#303030]"
                          }`}
                      >
                        {/* ID */}
                        <td className="px-3 py-2 text-[10px] text-left w-[200px] break-words">
                          {item.classId || item.classLink}
                        </td>

                        {/* Student */}

                        <td className="relative text-[#3D8FDE] px-3 py-2 text-left w-[180px]">
                          {studentsArray.length === 1 ? (
                            <span className="break-words">
                              {studentsArray[0]}
                            </span>
                          ) : studentsArray.length > 1 ? (
                            <>
                              <button
                                onClick={() =>
                                  setOpenStudents(
                                    openStudents ===
                                      `${item._id
                                      }_${startDateTime.getTime()}_${startTimeStr}`
                                      ? null
                                      : `${item._id
                                      }_${startDateTime.getTime()}_${startTimeStr}`
                                  )
                                }
                                className="underline cursor-pointer"
                              >
                                View Students ({studentsArray.length})
                              </button>

                              {openStudents ===
                                `${item._id
                                }_${startDateTime.getTime()}_${startTimeStr}` && (
                                  <div className="absolute z-50 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg">
                                    <ul className="max-h-48 overflow-y-auto">
                                      {studentsArray.map((name, idx) => (
                                        <li
                                          key={idx}
                                          className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 break-words"
                                        >
                                          {name}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                            </>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Course */}
                        <td className="px-3 py-2 text-left w-[170px] break-words">
                          {courseName}
                        </td>

                        {/* Class Type */}
                        <td className="px-3 py-2 text-left w-[170px] break-words">
                          {classType}
                        </td>

                        {/* Date */}
                        <td className="px-3 py-2 text-left w-[170px] break-words">
                          {formattedDate}
                        </td>

                        {/* Time */}
                        <td className="px-3 py-2 text-left w-[170px] break-words">
                          {timeDisplay}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-2 text-xs w-[200px]">
                          <span
                            className={`inline-block rounded-md font-semibold text-[11px] px-3 py-1
              ${status === "Scheduled"
                                ? "bg-green-100 text-green-800 dark:bg-green-800/20"
                                : status === "Rescheduled" || status === "Reschedulerequested"
                                  ? "bg-gray-200 text-gray-800 dark:bg-gray-500/20"
                                  : status === "BothAbsent"
                                    ? "bg-red-100 text-red-700 dark:bg-red-700/20"
                                    : "bg-gray-300 text-gray-600 dark:bg-gray-500/20"
                              }`}
                          >
                            {status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-2 relative w-[10px]">
                          <div className="relative inline-block">
                            <button
                              onClick={() =>
                                setOpenDropdownId(
                                  openDropdownId ===
                                    `${item._id
                                    }_${startDateTime.getTime()}_${startTimeStr}`
                                    ? null
                                    : `${item._id
                                    }_${startDateTime.getTime()}_${startTimeStr}`
                                )
                              }
                              className="p-2 rounded-md"
                            >
                              <MoreVertical className="w-4 h-4 text-slate-600 dark:text-white" />
                            </button>

                            {activeTab !== "completed" &&
                              item.sessionClassType === "REGULARCLASS" &&
                              openDropdownId ===
                              `${item._id
                              }_${startDateTime.getTime()}_${startTimeStr}` && (
                                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white dark:bg-[#2C2C2C] shadow-lg">
                                  <button
                                    onClick={() =>
                                      handleRescheduleRedirect(item._id)
                                    }
                                    className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-[#404040]"
                                  >
                                    Reschedule
                                  </button>
                                  <button
                                    onClick={() => setOpenDropdownId(null)}
                                    className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 dark:hover:bg-[#404040]"
                                  >
                                    Cancel
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
                    <td colSpan={8} className="text-center py-4 text-gray-500">
                      No classes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onRequestClose={() => setIsFilterModalOpen(false)}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 rounded-xl bg-white dark:bg-[#252525] w-[650px] "
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-40"
      >
        <div>
          <button
            className="absolute top-2 right-3 text-gray-400 text-xl"
            onClick={() => setIsFilterModalOpen(false)}
          >
            &times;
          </button>
          <h2 className="text-[16px] font-semibold mb-6 text-[#2D2D2D] dark:text-white">
            Filter by
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-[#444] dark:text-white mb-1 block">
                Student
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs dark:bg-[#343434] dark:text-whited dark:border-[#5C5C5C]"
                value={filters.studentName}
                onChange={(e) =>
                  setFilters({ ...filters, studentName: e.target.value })
                }
              >
                <option value=" ">Select Student</option>
                {studentNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#444] dark:text-white mb-1 block">
                Course
              </label>
              <select
                className="w-full px-3 py-2 border text-[#5C5C5C] border-gray-300 rounded-lg text-xs dark:bg-[#343434] dark:text-white dark:border-[#5C5C5C]"
                value={filters.courseName}
                onChange={(e) =>
                  setFilters({ ...filters, courseName: e.target.value })
                }
              >
                <option value="">Select Course</option>
                <option value="Quran">Quran</option>
                <option value="Arabic">Arabic</option>
                <option value="Tajweed">Tajweed</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#444] dark:text-white mb-1 block">
                From Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-lg text-xs 
              text-[#5C5C5C] dark:text-white 
               bg-white dark:bg-[#343434] 
               border-gray-300 dark:border-[#5C5C5C] dark:[color-scheme:dark]"
                value={filters.fromDate}
                onChange={(e) =>
                  setFilters({ ...filters, fromDate: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#444] dark:text-white mb-1 block">
                To Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-lg text-xs 
              text-[#5C5C5C] dark:text-white 
               bg-white dark:bg-[#343434] 
               border-gray-300 dark:border-[#5C5C5C] dark:[color-scheme:dark]"
                value={filters.toDate}
                onChange={(e) =>
                  setFilters({ ...filters, toDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#444] dark:text-white mb-1 block">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs dark:bg-[#343434] text-[#5C5C5C] dark:text-white dark:border-[#5C5C5C]"
                value={filters.scheduleStatus}
                onChange={(e) =>
                  setFilters({ ...filters, scheduleStatus: e.target.value })
                }
              >
                <option value="">Select Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Rescheduled">Rescheduled</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleResetFilters}
              className="px-3 py-1 text-[12px] rounded-md border border-[#576CBC] text-[#576CBC] font-medium hover:bg-[#EEF1FF] dark:hover:bg-[#343434]"
            >
              Reset
            </button>
            <button
              onClick={() => {
                handleApplyFilters();
                setIsFilterModalOpen(false);
              }}
              className="px-3 text-[12px] py-1 bg-[#576CBC] text-white rounded-md font-medium hover:bg-[#475ab1]"
            >
              Apply
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ScheduledClasses;
