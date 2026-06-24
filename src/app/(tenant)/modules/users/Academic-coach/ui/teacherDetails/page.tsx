"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { VscGraphLeft } from "react-icons/vsc";
import Pagination from "@/components/Pagination";
import BaseLayout1 from "@/app/(tenant)/modules/users/Academic-coach/components/BaseLayout1";
import { MoreVertical, Search } from "lucide-react";
import { MdTune } from "react-icons/md";
import Modal from "react-modal";
import axios from "axios";
import AcademicHeader from "../../components/academicHeader";
import { getSocket } from "@/app/utils/socket";
import { AiOutlineMenuUnfold } from "react-icons/ai";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

// --- Interfaces from ScheduledClasses (Unified) ---
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
  students: UnifiedStudent[];
  teacher?: {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
    teacherSessionStart: string | null;
    teacherSessionEnd: string | null;
  };
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

// --- Interfaces for Teacher Profile Stats ---
interface ICandidateApplication {
  _id: string;
  candidateFirstName: string;
  candidateLastName: string;
  candidateEmail: string;
  candidatePhoneNumber: number;
  candidateCountry: string;
  positionApplied: string;
  overallRating: number;
}

interface StatsResponse {
  totalStudents: number;
  totalClasses: number;
  totalAttendance: number | string;
  overallPerformance: number;
}

interface StudentInfo {
  _id: string;
  fullName: string;
  firstName: string;
  courseName: string;
  studentId: string;
}

const TeacherDetails = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teacherId = searchParams!.get("teacherId");

  // --- Profile State ---
  const [teachers, setTeachers] = useState<ICandidateApplication>();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [studentInfoList, setStudentInfoList] = useState<StudentInfo[]>([]);

  // --- Schedule State ---
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredClasses, setFilteredClasses] = useState<UnifiedClassSchedule[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<UnifiedClassSchedule[]>([]);
  const [completedData, setCompletedData] = useState<UnifiedClassSchedule[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // UI State
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [openStudents, setOpenStudents] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [teacherRescheduleWrite, setTeacherRescheduleWrite] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    courseName: "",
    teacher: "",
    scheduleStatus: "",
    studentName: "",
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

  // --- Permission Check ---
  useEffect(() => {
    const roleAccessRaw = localStorage.getItem("AcademicRolePermission");
    if (roleAccessRaw) {
      try {
        const roleAccess = JSON.parse(roleAccessRaw);
        const modules = roleAccess?.academicmodules || roleAccess;
        setTeacherRescheduleWrite(modules?.manageteachers?.write === true);
      } catch (error) {
        console.error("Invalid AcademicRolePermission JSON", error);
      }
    }
  }, []);

  // --- Fetch Profile Data ---
  useEffect(() => {
    if (!teacherId) return;

    const fetchTeachers = async () => {
      try {
        const token = localStorage.getItem("AcademicCoachAuthToken");
        if (!token) return;
        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.APPLICANTS.GET_LIST}/${teacherId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTeachers(response.data);
      } catch (error) {
        console.error("Error fetching teacher profile:", error);
      }
    };

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("AcademicCoachAuthToken");
        if (!token) return;
        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET_CLASS_STUDENT_ATT_COUNT}?teacherId=${teacherId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchTeachers();
    fetchStats();
  }, [teacherId]);

  // --- Fetch Classes Logic (Adapted from ScheduledClasses) ---
  const fetchClasses = async () => {
    if (!teacherId) return;
    try {
      const token = localStorage.getItem("AcademicCoachAuthToken");
      if (!token) {
        console.warn("Missing AcademicCoachAuthToken");
        return;
      }

      console.log("Fetching classes for Teacher:", teacherId);
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

      // 1. Process Regular Classes
      const regularClasses: UnifiedClassSchedule[] = response.data.classScheduleList.map((cls: any) => {
        if (cls.student && cls.sessionClassType !== "GROUPCLASS") {
          cls.students = [{ student: cls.student }];
          delete cls.student;
        }
        if (cls.sessionClassType === "GROUPCLASS" && !cls.students) {
          cls.students = cls.student;
        }
        cls.students?.forEach((s: any) => {
          s.student.studnetSessionStart ||= [];
          s.student.studnetSessionEnd ||= [];
        });
        return { ...cls, isTrial: false };
      });

      // 2. Process Trial Classes
      let trialClasses: UnifiedClassSchedule[] = [];
      if (Array.isArray(response.data.trialclasses)) {
        trialClasses = response.data.trialclasses.map((trialClass: any) => {
          const classStartDateTime =
            trialClass.scheduledStartDate && trialClass.scheduledFrom
              ? (() => {
                const date = new Date(trialClass.scheduledStartDate);
                const [hours, minutes] = trialClass.scheduledFrom.split(":").map(Number);
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
                new Date(trialClass.scheduledStartDate).toLocaleDateString("en-US", {
                  weekday: "long",
                }),
              ]
              : [],
            startTime: [trialClass.scheduledFrom || ""],
            endTime: [trialClass.scheduledTo || ""],
            students: [
              {
                student: {
                  id: trialClass.student?.id || "",
                  studentId: trialClass.student?.studentId || "",
                  studentFirstName: trialClass.student?.studentName?.split(" ")[0] || "Trial",
                  studentLastName: trialClass.student?.studentName?.split(" ").slice(1).join(" ") || "Student",
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
            status: "Active",
            totalHourse: 0.5,
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
      }

      const allClasses = [...regularClasses, ...trialClasses];

      // 3. Extract Unique Students for Profile
      const uniqueStudentsMap = new Map<string, StudentInfo>();
      allClasses.forEach((cls) => {
        cls.students?.forEach((s) => {
          if (s.student?.studentId) {
            const name = `${s.student.studentFirstName || ""} ${s.student.studentLastName || ""}`.trim();
            if (!uniqueStudentsMap.has(s.student.studentId)) {
              uniqueStudentsMap.set(s.student.studentId, {
                _id: s.student.id,
                studentId: s.student.studentId,
                firstName: s.student.studentFirstName || "",
                fullName: name,
                courseName: cls.course?.courseName || "",
              });
            }
          }
        });
      });
      setStudentInfoList(Array.from(uniqueStudentsMap.values()));

      // 4. Split Upcoming/Completed
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
          const endDateTime = parseDateTime(cls.endDate, cls.endTime?.[0]);
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
          const aDate = parseDateTime(a.startDate, a.startTime?.[0]) || new Date(0);
          const bDate = parseDateTime(b.startDate, b.startTime?.[0]) || new Date(0);
          return bDate.getTime() - aDate.getTime();
        });

      const upcoming = allClasses
        .filter((cls) => {
          const startDateTime = parseDateTime(cls.startDate, cls.startTime?.[0]);
          return (
            ["Scheduled", "Rescheduled", "Reschedulerequested"].includes(cls.scheduleStatus) &&
            startDateTime &&
            startDateTime >= now
          );
        })
        .sort((a, b) => {
          const aDate = parseDateTime(a.startDate, a.startTime?.[0]) || new Date(0);
          const bDate = parseDateTime(b.startDate, b.startTime?.[0]) || new Date(0);
          return aDate.getTime() - bDate.getTime();
        });

      setUpcomingClasses(upcoming);
      setCompletedData(completed);
      setFilteredClasses(activeTab === "upcoming" ? upcoming : completed);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [teacherId]);

  // Update filtered classes when tab changes
  useEffect(() => {
    const data = activeTab === "upcoming" ? upcomingClasses : completedData;
    setFilteredClasses(data);
    setSearchQuery("");
    setCurrentPage(1);
  }, [activeTab, upcomingClasses, completedData]);

  // --- Handlers ---
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const lowerQuery = query.toLowerCase().trim();
    const dataToShow = activeTab === "upcoming" ? upcomingClasses : completedData;

    if (!lowerQuery) {
      setFilteredClasses(dataToShow);
      setCurrentPage(1);
      return;
    }

    const filtered = dataToShow.filter((item) =>
      (item.students || []).some((s: any) => {
        const fullName = `${s.student?.studentFirstName || ""} ${s.student?.studentLastName || ""}`
          .toLowerCase()
          .trim();
        return fullName.includes(lowerQuery);
      })
    );
    setFilteredClasses(filtered);
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    const dataToShow = activeTab === "upcoming" ? upcomingClasses : completedData;
    let filtered = [...dataToShow];

    if (filters.courseName) {
      filtered = filtered.filter((c) =>
        c.course?.courseName?.toLowerCase().includes(filters.courseName.toLowerCase())
      );
    }
    if (filters.scheduleStatus) {
      filtered = filtered.filter(
        (c) => c.scheduleStatus?.toLowerCase() === filters.scheduleStatus.toLowerCase()
      );
    }
    if (filters.studentName) {
      const search = filters.studentName.toLowerCase();
      filtered = filtered.filter((c) =>
        (c.students || []).some((s: any) => {
          const fullName = `${s.student?.studentFirstName || ""}`.toLowerCase().trim();
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
    const latestDataToShow = activeTab === "upcoming" ? upcomingClasses : completedData;
    setFilteredClasses(latestDataToShow);
    setIsFilterModalOpen(true);
  };

  const handleReschedule = (id: string) => {
    console.log("Navigating to reschedule page");
    router.push(`/modules/users/Academic-coach/ui/manageteacher?id=${id}&teacherId=${teacherId}`);
    setOpenDropdownId(null);
  };

  const handleViewDetails = (id: string) => {
    console.log("Viewing details for student ID:", id);
    localStorage.setItem("studentManageID", id);
    router.push(`/modules/users/Academic-coach/ui/managestudentview?id=${id}`);
  };

  // --- Helpers for Filter Options ---
  const dataToShow = activeTab === "upcoming" ? upcomingClasses : completedData;
  const studentNames = Array.from(
    new Set(
      dataToShow.flatMap((c) =>
        (c.students || []).map((s: any) => `${s.student?.studentFirstName || ""}`.trim())
      )
    )
  ).filter(Boolean).sort((a, b) => a.localeCompare(b));

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClasses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);

  return (
    <BaseLayout1>
      <AcademicHeader
        currentSection="Teacher"
        showBackButton={true}
        showBackPath="/modules/users/Academic-coach/ui/manageteacher"
      />
      <div className="p-2 mx-auto w-full">
        {/* --- Profile Section (Keep Initial Look) --- */}
        <div className="flex gap-x-5 w-full">
          <div className="rounded-xl flex items-center p-6 w-[633px] h-[247px] border bg-[#5e6578] text-white ">
            <div className="flex flex-col items-center w-1/3 px-4 text-center">
              <div className="relative mb-3 w-[100px] h-[100px]">
                <Image
                  src="/assets/images/student-portfolio.svg"
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                />
              </div>

              <h2 className="text-sm font-semibold text-white break-words mb-1">
                {teachers?.candidateFirstName}
              </h2>
              <p className="text-[10px] text-[#C9C9C9] break-words word-wrap w-[200px] px-3">
                {teachers?.candidateEmail}
              </p>
            </div>

            <div className="w-px bg-gray-300 h-[150px] mx-10" />
            <div className="w-2/3">
              <h3 className="text-[16px] font-semibold mb-4 text-[#ffff]">
                Personal Info
              </h3>
              <ul className="text-xs space-y-2 text-[#ffff]">
                <li className="flex justify-between ">
                  <span>Contact</span>
                  <span className="text-[#DADADA]/80 text-left">
                    {teachers?.candidatePhoneNumber}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Country</span>
                  <span className="text-[#DADADA]/80">
                    {teachers?.candidateCountry}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Role</span>
                  <span className="text-[#DADADA]/80">
                    {teachers?.positionApplied}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Level</span>
                  <span className="text-[#DADADA]/80">
                    {teachers?.overallRating}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-xl w-full h-[220px] flex justify-between p-3 border dark:bg-[#252525] -mt-3 ">
            <div className="grid grid-cols-1 gap-3 w-full h-[247px]">
              {[
                {
                  title: "Performance",
                  value: stats?.overallPerformance?.toString(),
                  sub: "60% increase than Last Month",
                },
                {
                  title: "Total Attendance",
                  value: stats?.totalAttendance?.toString(),
                  sub: "90% Progressive than Last Month",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-4 rounded-xl flex flex-col justify-between h-full border text-[#010E30] bg-[#7689BD]"
                >
                  <h4 className="text-[16px] font-semibold text-[#ffff]">
                    {item.title}
                  </h4>
                  <p className="text-[14px] font-semibold mt-2 flex gap-1 items-center text-[#ffff]">
                    {item.value}{" "}
                    <VscGraphLeft className="rotate-180 text-[#ffff]" />
                  </p>
                  <p className="text-[10px] text-[#ffff]">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#2f2f2f] rounded-2xl p-4 w-full h-[247px] flex flex-col gap-y-4 scrollbar-none">
            <div className="flex justify-between items-center">
              <h2 className="text-[14px] font-semibold text-[#111827] dark:text-white">
                Students List
              </h2>
              <span className="bg-[#576CBC] text-white text-[12px] font-semibold rounded-md px-2 py-1">
                {studentInfoList.length}
              </span>
            </div>

            <ul className="space-y-3 overflow-y-auto max-h-[180px] scrollbar-none">
              {studentInfoList.map((student, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between border-b pb-2 border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-[#ffff] flex items-center justify-center font-bold text-[10px]">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        alt="avatar"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    </div>
                    <span
                      className="text-[12px] font-medium text-[#111827] dark:text-white cursor-pointer hover:underline"
                      onClick={() => handleViewDetails(student._id)}
                    >
                      {student.firstName[0].toUpperCase() +
                        student.firstName.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#576CBC] font-medium whitespace-nowrap">
                    {student.courseName || ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- Table Section (Adapted logic) --- */}
        <div className="mt-4">
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
                  <th className="text-left px-4 py-3 w-[180px] font-normal">Class ID</th>
                  <th className="text-left px-4 py-3 font-normal">Student Name</th>
                  <th className="text-left px-4 py-3 font-normal">Course</th>
                  <th className="text-left px-4 py-3 font-normal">Class Type</th>
                  <th className="text-left px-4 py-3 font-normal">Date</th>
                  <th className="text-left px-4 py-3 font-normal">Timing</th>
                  <th className="text-left px-4 py-3 w-[180px] font-normal">Status</th>
                  <th className="text-left px-4 py-3 font-normal">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => {
                    const isTrial = item.totalHourse === 0.5 && item.createdBy === "System";
                    const dateObj = item.startDate ? new Date(item.startDate) : null;
                    const formattedDate = dateObj
                      ? dateObj.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
                      : "N/A";
                    const startTime = item.startTime?.[0];
                    const endTime = item.endTime?.[0];
                    const timeDisplay = startTime && endTime ? `${startTime} - ${endTime}` : "N/A";

                    const studentNames = Array.isArray(item.students) && item.students.length > 0
                      ? item.students.map(({ student }) => {
                        if (!student) return null;
                        const first = student.studentFirstName?.trim() || "";
                        const last = student.studentLastName?.trim() || "";
                        if (first && last && first.toLowerCase() === last.toLowerCase()) {
                          return first;
                        }
                        return `${first} ${last}`.trim() || "Student";
                      }).filter(Boolean).join(", ")
                      : "N/A";

                    const studentsArray = studentNames ? studentNames.split(", ").filter(Boolean) : [];
                    const courseName = item.course?.courseName || "N/A";
                    const classType = item.sessionClassType === "GROUPCLASS" ? "Group Class" : isTrial ? "Trial Class" : "Regular Class";
                    const status = item.scheduleStatus;
                    const startDateTime = new Date(item.startDate);
                    let startTimeStr = "";
                    if (item.startTime?.[0]) {
                      startTimeStr = item.startTime[0];
                      const [hours, minutes] = startTimeStr.split(":").map(Number);
                      startDateTime.setHours(hours, minutes, 0, 0);
                    }

                    return (
                      <tr
                        key={`${item._id}_${startDateTime.getTime()}_${startTimeStr}`}
                        className={`text-[12px] ${index % 2 === 0 ? "bg-[#fff] dark:bg-[#2C2C2C]" : "bg-[#F8F8F8] dark:bg-[#303030]"}`}
                      >
                        <td className="px-3 py-2 text-[10px] text-left w-[200px] break-words">{item.classId || item.classLink}</td>
                        <td className="relative text-[#3D8FDE] px-3 py-2 text-left w-[180px]">
                          {studentsArray.length === 1 ? (
                            <span className="break-words">{studentsArray[0]}</span>
                          ) : studentsArray.length > 1 ? (
                            <>
                              <button
                                onClick={() => setOpenStudents(openStudents === `${item._id}_${startDateTime.getTime()}_${startTimeStr}` ? null : `${item._id}_${startDateTime.getTime()}_${startTimeStr}`)}
                                className="underline cursor-pointer"
                              >
                                View Students ({studentsArray.length})
                              </button>
                              {openStudents === `${item._id}_${startDateTime.getTime()}_${startTimeStr}` && (
                                <div className="absolute z-50 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg">
                                  <ul className="max-h-48 overflow-y-auto">
                                    {studentsArray.map((name, idx) => (
                                      <li key={idx} className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 break-words">{name}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-3 py-2 text-left w-[170px] break-words">{courseName}</td>
                        <td className="px-3 py-2 text-left w-[170px] break-words">{classType}</td>
                        <td className="px-3 py-2 text-left w-[170px] break-words">{formattedDate}</td>
                        <td className="px-3 py-2 text-left w-[170px] break-words">{timeDisplay}</td>
                        <td className="px-3 py-2 text-xs w-[200px]">
                          <span className={`inline-block rounded-md font-semibold text-[11px] px-3 py-1 ${status === "Scheduled" ? "bg-green-100 text-green-800 dark:bg-green-800/20" : status === "Rescheduled" || status === "Reschedulerequested" ? "bg-gray-200 text-gray-800 dark:bg-gray-500/20" : status === "BothAbsent" ? "bg-red-100 text-red-700 dark:bg-red-700/20" : "bg-gray-300 text-gray-600 dark:bg-gray-500/20"}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-3 py-2 relative w-[10px]">
                          <div className="relative inline-block">
                            <button onClick={() => setOpenDropdownId(openDropdownId === `${item._id}_${startDateTime.getTime()}_${startTimeStr}` ? null : `${item._id}_${startDateTime.getTime()}_${startTimeStr}`)} className="p-2 rounded-md">
                              <MoreVertical className="w-4 h-4 text-slate-600 dark:text-white" />
                            </button>
                            {activeTab !== "completed" && item.sessionClassType === "REGULARCLASS" && openDropdownId === `${item._id}_${startDateTime.getTime()}_${startTimeStr}` && (
                              <div className="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white dark:bg-[#2C2C2C] shadow-lg">
                                <button
                                  disabled={!teacherRescheduleWrite}
                                  onClick={() => teacherRescheduleWrite && handleReschedule(item._id)}
                                  className={`block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-[#404040] ${!teacherRescheduleWrite ? "cursor-not-allowed opacity-50" : ""}`}
                                >
                                  Reschedule
                                </button>
                                <button onClick={() => setOpenDropdownId(null)} className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 dark:hover:bg-[#404040]">
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
                    <td colSpan={8} className="text-center py-4 text-gray-500">No classes found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
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
          <button className="absolute top-2 right-3 text-gray-400 text-xl" onClick={() => setIsFilterModalOpen(false)}>
            &times;
          </button>
          <h2 className="text-[16px] font-semibold mb-6 text-[#2D2D2D] dark:text-white">Filter by</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-[#444] dark:text-white mb-1 block">Student</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs dark:bg-[#343434] dark:text-whited dark:border-[#5C5C5C]"
                value={filters.studentName}
                onChange={(e) => setFilters({ ...filters, studentName: e.target.value })}
              >
                <option value=" ">Select Student</option>
                {studentNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#444] dark:text-white mb-1 block">Course</label>
              <select
                className="w-full px-3 py-2 border text-[#5C5C5C] border-gray-300 rounded-lg text-xs dark:bg-[#343434] dark:text-white dark:border-[#5C5C5C]"
                value={filters.courseName}
                onChange={(e) => setFilters({ ...filters, courseName: e.target.value })}
              >
                <option value="">Select Course</option>
                <option value="Quran">Quran</option>
                <option value="Arabic">Arabic</option>
                <option value="Tajweed">Tajweed</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#444] dark:text-white mb-1 block">From Date</label>
              <input type="date" className="w-full px-3 py-2 border rounded-lg text-xs text-[#5C5C5C] dark:text-white bg-white dark:bg-[#343434] border-gray-300 dark:border-[#5C5C5C] dark:[color-scheme:dark]" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-[#444] dark:text-white mb-1 block">To Date</label>
              <input type="date" className="w-full px-3 py-2 border rounded-lg text-xs text-[#5C5C5C] dark:text-white bg-white dark:bg-[#343434] border-gray-300 dark:border-[#5C5C5C] dark:[color-scheme:dark]" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-[#444] dark:text-white mb-1 block">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs dark:bg-[#343434] text-[#5C5C5C] dark:text-white dark:border-[#5C5C5C]"
                value={filters.scheduleStatus}
                onChange={(e) => setFilters({ ...filters, scheduleStatus: e.target.value })}
              >
                <option value="">Select Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Rescheduled">Rescheduled</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={handleResetFilters} className="px-3 py-1 text-[12px] rounded-md border border-[#576CBC] text-[#576CBC] font-medium hover:bg-[#EEF1FF] dark:hover:bg-[#343434]">
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
    </BaseLayout1>
  );
};

export default TeacherDetails;
