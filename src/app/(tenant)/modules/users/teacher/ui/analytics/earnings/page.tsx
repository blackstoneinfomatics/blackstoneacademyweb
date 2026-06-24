"use client";

import TeacherHeader from "@/app/(tenant)/modules/users/teacher/components/TeacherHeader";
import BaseLayout from "@/app/(tenant)/modules/users/teacher/components/BaseLayout";
import Pagination from "@/components/Pagination";
import axios from "axios";
import { Search, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { MdTune } from "react-icons/md";
import { useRouter } from "next/navigation";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

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
  student: UnifiedStudent[];

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
  amount?: number;
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

const Earnings = () => {
  const [uniqueStudentSchedules, setUniqueStudentSchedules] = useState<
    UnifiedClassSchedule[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [openEarningId, setOpenEarningId] = useState<string | null>(null);
  const [filterCriteria, setFilterCriteria] = useState({
    studentId: "",
    studentName: "",
    courseName: "",
    classType: "",
    scheduleStatus: "",
    fromDate: "",
    toDate: "",
  });

 useEffect(()=>{
   const fetchClasses = async () => {
    try {
      const teacherId = localStorage.getItem("TeacherPortalId");
      const token = localStorage.getItem("TeacherAuthToken");

      console.log("Fetching classes...");
      console.log("Teacher ID:", teacherId);
      console.log("Auth Token Present:", !!token);

      if (!token || !teacherId) {
        console.warn("Missing token or teacher ID.");
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
            cls.student = [{ student: cls.student }];
          }
          if (cls.sessionClassType === "GROUPCLASS" && !cls.student) {
            cls.student = cls.student;
            cls.amount = cls.student[0].amount.toString();
          }

          // Ensure session arrays exist for each student
          cls.student?.forEach((s: any) => {
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
            student: [
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
                amount: 0,
              },
            ],
            package: "",
            totalHourse: 0.5,
            status: "Active",
            createdBy: "System",
            classhour: "0.5",
            currency: "$",
            amount: "0",
            isSalaryProcessed: false,
            sessionStarttime: trialClass.scheduledFrom || "",
            sessionsEndtime: trialClass.scheduledTo || "",
          };
        });

        console.log("Processed Trial Classes:", trialClasses);
      } else {
        console.log("No trial classes found or incorrect format.");
      }

     
     const getClassDateTime = (cls: any) => {
  if (!cls.startDate) return 0;

  const date = new Date(cls.startDate);

  if (Array.isArray(cls.startTime) && cls.startTime[0]) {
    const [h, m] = cls.startTime[0].split(":").map(Number);
    date.setHours(h || 0, m || 0, 0, 0);
  }

  return date.getTime();
};

   
const allClasses = [...regularClasses, ...trialClasses];

// ✅ SORT ASCENDING (earliest → latest)
const sortedClasses = allClasses.sort(
  (a, b) => getClassDateTime(a) - getClassDateTime(b)
);

      setUniqueStudentSchedules(sortedClasses);
      console.log("Combined Classes Set. Total:", sortedClasses.length);
      console.log("Class data successfully set to state.");
    } catch (error) {
      console.error("Error fetching class data:", error);
    }
  };
   fetchClasses();
  },[]);

  const uniqueCourses = Array.from(new Set(uniqueStudentSchedules.map(s => s.course.courseName)));
const uniqueClassTypes = Array.from(new Set(uniqueStudentSchedules.map(s => s.sessionClassType)));
const uniqueStatuses = Array.from(new Set(uniqueStudentSchedules.map(s => s.scheduleStatus)));


 const filteredData = uniqueStudentSchedules.filter((row) => {
  // ---------- STUDENT FILTER (NESTED + ARRAY SAFE) ----------
  const matchesStudent = row.student?.some((stu) => {
    const fullName = `${stu.student.studentFirstName} ${stu.student.studentLastName}`.toLowerCase();

    const matchesSearchTerm = searchTerm
      ? fullName.includes(searchTerm.toLowerCase())
      : true;

    const matchesStudentId = filterCriteria.studentId
      ? stu.student.studentId
          .toLowerCase()
          .includes(filterCriteria.studentId.toLowerCase())
      : true;

    const matchesStudentName = filterCriteria.studentName
      ? fullName.includes(filterCriteria.studentName.toLowerCase())
      : true;

    return matchesSearchTerm && matchesStudentId && matchesStudentName;
  });

  // ---------- COURSE ----------
  const matchesCourseName = filterCriteria.courseName
    ? row.course.courseName.trim().toLowerCase() ===
      filterCriteria.courseName.trim().toLowerCase()
    : true;

  // ---------- CLASS TYPE ----------
  const matchesClassType = filterCriteria.classType
    ? row.sessionClassType.trim().toLowerCase() ===
      filterCriteria.classType.trim().toLowerCase()
    : true;

  // ---------- SCHEDULE STATUS ----------
  const matchesScheduleStatus = filterCriteria.scheduleStatus
    ? row.scheduleStatus.trim().toLowerCase() ===
      filterCriteria.scheduleStatus.trim().toLowerCase()
    : true;

  // ---------- DATE RANGE ----------
  const matchesFromDate = filterCriteria.fromDate
    ? new Date(row.startDate) >= new Date(filterCriteria.fromDate)
    : true;

  const matchesToDate = filterCriteria.toDate
    ? new Date(row.endDate) <= new Date(filterCriteria.toDate)
    : true;

  return (
    matchesStudent &&
    matchesCourseName &&
    matchesClassType &&
    matchesScheduleStatus &&
    matchesFromDate &&
    matchesToDate
  );
});


  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilterCriteria((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <BaseLayout>
      <TeacherHeader currentSection="Earnings" showBackButton ={true} showBackPath="/modules/users/teacher/ui/analytics"/>
      <div className="md:p-0 mx-auto">
        <div className="h-full w-full flex flex-col justify-between">
          <div className="w-full bg-[#FAFAFB] rounded-lg dark:bg-[#343434] mt-6">
            <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by keyword"
                  className="bg-transparent outline-none text-[15px] w-52 py-3"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div
                className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
                onClick={() => setIsFilterModalOpen(true)}
              >
                <MdTune className="w-4 h-4" />
                <span>Filter</span>
              </div>

              <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                <span className="text-left -ml-60 ">
                  Showing {currentData.length} of {filteredData.length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table
                className="table-auto w-full"
                style={{ tableLayout: "fixed" }}
              >
                <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                  <tr className="font-medium">
                    {(
                      [
                        "Student ID",
                        "Name",
                        "Courses",
                        "Course Type",
                        "Course Duration",
                        "Date",
                        "Time",
                        "Amount",
                        "Status",
                      ] as const
                    ).map((header) => (
                      <th
                        key={header}
                        className={`text-left px-4 py-3 border border-[#4C6993] dark:border-[#6087C0] ${
                          header === "Name" ? "" : ""
                        }`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="text-[11px]">
                  {currentData.map((row) => {
                    const { student, startTime, endTime } = row;

                    return (
                      <tr
                        key={row._id}
                        className="text-[12px] h-[50px] bg-[#fff] dark:bg-[#2C2C2C]"
                      >
                        <td className="px-4 py-2 text-[#17243E] dark:text-[#FDFDFD]">
                        {row.classId || row.classLink}
                        </td>
                        <td className="px-4 py-2 text-left font-medium text-[#3D8FDE]">
                         {Array.isArray(row.student) && row.student.length > 0 ? (
    row.student.length === 1 ? (
      // ✅ SINGLE STUDENT → SAME UI
      (() => {
        const student = row.student[0]?.student;
        const first = student?.studentFirstName?.trim() ?? "";
        const last = student?.studentLastName?.trim() ?? "";
        return (
          `${first}`.trim() ||
          first ||
          "Student"
        );
      })()
    ) : (
      // ✅ MULTIPLE STUDENTS → CLICK TO SHOW LIST
      <>
        <button
          onClick={() =>
            setOpenEarningId(
              openEarningId === `${row._id}_${new Date(row.startDate).getTime()}_${row.startTime?.[0] || ''}` ? null : `${row._id}_${new Date(row.startDate).getTime()}_${row.startTime?.[0] || ''}`
            )
          }
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md 
                     bg-[#42609a] text-white text-xs hover:bg-blue-700"
        >
          {row.student.length} Students
        </button>

        {openEarningId === `${row._id}_${new Date(row.startDate).getTime()}_${row.startTime?.[0] || ''}` && (
          <div
            className="absolute z-50 mt-2 w-56 bg-white dark:bg-gray-900
                       border border-gray-200 dark:border-gray-700
                       rounded-md shadow-lg p-2"
          >
            <ul className="space-y-1">
              {row.student.map((item: any, idx: number) => {
                const student = item?.student;
                const first = student?.studentFirstName?.trim() ?? "";
                const last = student?.studentLastName?.trim() ?? "";
                const name =
                  first && last && first.toLowerCase() === last.toLowerCase()
                    ? first
                    : `${first} ${last}`.trim() || "Student";

                return (
                  <li
                    key={idx}
                    className="px-2 py-1 text-sm rounded 
                               hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {name}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </>
    )
  ) : (
    "N/A"
  )}
                        </td>
                        <td className="px-4 py-2 text-[#17243E] dark:text-[#FDFDFD]">
                          {row.course.courseName}
                        </td>
                        <td className="px-4 py-2 text-[#17243E] dark:text-[#FDFDFD]">
                          {row.sessionClassType}
                        </td>
                        <td className="px-4 py-2 text-[#17243E] dark:text-[#FDFDFD]">
                          30 mins
                         </td>
                        <td className="px-4 py-2 text-[#17243E] dark:text-[#FDFDFD]">
                          {new Date(row.startDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-2 text-[#17243E] dark:text-[#FDFDFD]">
                          {startTime?.[0]} - {endTime?.[0]}
                        </td>
                        <td className="px-4 py-2 text-[#17243E] dark:text-[#FDFDFD]">
                          {row.student[0].amount ? `$${row.student[0].amount}` : `$0`}
                        </td>
                        <td className="px-3 py-2 text-[#17243E] dark:text-[#FDFDFD] text-left">
                          <span
                            className={`font-semibold px-3 py-1 rounded-md text-[10px] ${
                              row.scheduleStatus === "Scheduled"
                                ? "bg-[#ECFDF3] dark:bg-[#374336] dark:text-[#377E36] text-[#377E36] px-[18px]"
                                : row.scheduleStatus === "Rescheduled"
                                ? "bg-[#E4E4E4] text-[#000] dark:bg-[#555] dark:text-[#fff]"
                                : "bg-[#ECFDF3] dark:bg-[#374336] dark:text-[#377E36] text-[#377E36]"
                            }`}
                          >
                            {row.scheduleStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-[#252525] rounded-lg p-6 w-full max-w-lg relative">
            <button
              aria-label="Close filter"
              onClick={() => setIsFilterModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            <h3 className="text-[16px] font-semibold mb-4">Filter by</h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm block mb-1">Student ID</label>
                <input
                  type="text"
                  name="studentId"
                  className="w-full px-3 py-2 text-xs  border dark:border-[#5c5c5c] rounded bg-transparent dark:bg-[#343434]"
                  placeholder="Enter student ID"
                  value={filterCriteria.studentId}
                  onChange={handleFilterChange}
                />
              </div>

              <div>
                <label className="text-sm block mb-1">Student Name</label>
                <input
                  type="text"
                  name="studentName"
                  className="w-full px-3 py-2 text-xs border rounded bg-transparent dark:bg-[#343434] dark:border-[#5c5c5c]"
                  placeholder="Enter student name"
                  value={filterCriteria.studentName}
                  onChange={handleFilterChange}
                />
              </div>

<div>
  <label className="text-sm block mb-1">Course Name</label>
  <select
    name="courseName"
    className="w-full px-3 py-2 text-xs dark:border-[#5c5c5c] border rounded bg-transparent dark:bg-[#343434]"
    value={filterCriteria.courseName}
    onChange={handleFilterChange}
  >
    <option value="">Select Course</option>
    {uniqueCourses.map((course, i) => (
      <option key={i} value={course}>{course}</option>
    ))}
  </select>
</div>

<div>
  <label className="text-sm block mb-1">Class Type</label>
  <select
    name="classType"
    className="w-full px-3 py-2 text-xs dark:border-[#5c5c5c] border rounded bg-transparent dark:bg-[#343434]"
    value={filterCriteria.classType}
    onChange={handleFilterChange}
  >
    <option value="">Select Class Type</option>
    {uniqueClassTypes.map((type, i) => (
      <option key={i} value={type}>{type}</option>
    ))}
  </select>
</div>




              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm block mb-1">From Date</label>
                  <input
                    type="date"
                    name="fromDate"
                    className="w-full dark:bg-[#343434] text-xs dark:border-[#5c5c5c] px-3 py-2 border rounded bg-transparent dark:[color-scheme:dark]"
                    value={filterCriteria.fromDate}
                    onChange={handleFilterChange}
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1">To Date</label>
                  <input
                    type="date"
                    name="toDate"
                    className="w-full dark:bg-[#343434] px-3 py-2 text-xs dark:border-[#5c5c5c] border rounded bg-transparent dark:[color-scheme:dark]"
                    value={filterCriteria.toDate}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>

             <div>
  <label className="text-sm block mb-1">Status</label>
  <select
    name="scheduleStatus"
    className="w-full dark:bg-[#343434] py-2 px-3 text-xs dark:border-[#5c5c5c] border rounded bg-transparent"
    value={filterCriteria.scheduleStatus}
    onChange={handleFilterChange}
  >
    <option value="">Select Status</option>
    {uniqueStatuses.map((status, i) => (
      <option key={i} value={status}>{status}</option>
    ))}
  </select>
</div>
            </div>

            <div className="flex items-center justify-end mt-6">
              <div className="flex items-center gap-3">
                <button
                  className="px-3 py-1 text-[12px] rounded-md border border-[#576CBC] text-[#576CBC] font-medium hover:bg-[#EEF1FF] dark:hover:bg-[#343434]"
                  onClick={() =>
                    setFilterCriteria({
                      studentId: "",
                      studentName: "",
                      courseName: "",
                      classType: "",
                      scheduleStatus: "",
                      fromDate: "",
                      toDate: "",
                    })
                  }
                >
                  Reset
                </button>
                <button
                  className="px-3 py-1 text-[12px] rounded-md bg-[#576CBC] text-white font-medium hover:bg-[#455bb1]"
                  onClick={() => {
                    setIsFilterModalOpen(false);
                    setCurrentPage(1);
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </BaseLayout>
  );
};

export default Earnings;
