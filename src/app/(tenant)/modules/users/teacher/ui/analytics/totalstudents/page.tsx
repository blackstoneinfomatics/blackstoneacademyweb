"use client";

import BaseLayout from "@/app/(tenant)/modules/users/teacher/components/BaseLayout";
import React, { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import axios from "axios";
import TeacherHeader from "@/app/(tenant)/modules/users/teacher/components/TeacherHeader";
import { MdTune } from "react-icons/md";
import Pagination from "@/components/Pagination";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface SimpleStudent {
  studentId: string;
  name: string;
  level?: string;
  studentDetails: {
    student: {
      studentId?: string;
      studentFirstName?: string;
      learningInterest?: string;
      languageLevel?: string;
      createdDate?: string;
      status?: string;
    };
    classType?: string;
    classStartDate?: string;
    studentRate?: string;
  };
}

const Totalstudents = () => {
  const [students, setStudents] = useState<SimpleStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // filter modal + filter state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    studentId: "",
    studentName: "",
    courseName: "",
    classType: "",
    level: "",
    fromDate: "",
    toDate: "",
    status: "All", // "All" | "Active" | "Inactive"
  });

  // derived options used in selects inside modal
  const studentOptions = Array.from(
    new Set(students.map((s) => s.name).filter(Boolean))
  );
  const courseOptions = Array.from(
    new Set(
      students
        .map(
          (s) =>
            s.studentDetails?.student?.learningInterest ||
            // if API returns course object in other endpoints
            (s.studentDetails as any)?.course?.courseName ||
            ""
        )
        .filter(Boolean)
    )
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("TeacherAuthToken")
            : null;
        const teacherId =
          typeof window !== "undefined"
            ? localStorage.getItem("TeacherPortalId")
            : null;

        const response = await axios.get<SimpleStudent[]>(
                  `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TEACHER_CLASS_LIST}`,
          
          {
            params: { teacherId },
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setStudents(response.data);
        // ensure page resets to first when data loads
        setCurrentPage(1);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []);

  const uniqueClassTypes = Array.from(new Set(students.map(s => s.studentDetails.classType)));


  // Filter students based on search term + filters
  const filteredStudents = students.filter((student) => {
    const q = searchTerm.trim().toLowerCase();

    // Search term matching (optional)
    const matchesSearch =
      !q ||
      student.name?.toLowerCase().includes(q) ||
      student.studentId?.toLowerCase().includes(q) ||
      (student.studentDetails?.student?.studentFirstName || "")
        .toLowerCase()
        .includes(q) ||
      (student.studentDetails?.student?.learningInterest || "")
        .toLowerCase()
        .includes(q);

    // Student ID filter (optional)
    const matchesStudentId =
      !filters.studentId ||
      student.studentId
        ?.toLowerCase()
        .includes(filters.studentId.toLowerCase());

    // Student Name filter (optional)
    const matchesStudentName =
      !filters.studentName ||
      student.name?.toLowerCase().includes(filters.studentName.toLowerCase());

    // Course Name filter (optional)
    const matchesCourseName =
      !filters.courseName ||
      (student.studentDetails?.student?.learningInterest || "")
        .toLowerCase()
        .includes(filters.courseName.toLowerCase());

    // Class Type filter (optional)
    const matchesClassType =
      !filters.classType ||
      (student.studentDetails?.classType || "")
        .toLowerCase()
        .includes(filters.classType.toLowerCase());

    // Level filter (optional)
    const matchesLevel =
      !filters.level ||
      (student.level || "").toLowerCase().includes(filters.level.toLowerCase());

    // From Date filter (optional)
    const matchesFromDate =
      !filters.fromDate ||
      (student.studentDetails?.student?.createdDate
        ? new Date(student.studentDetails.student.createdDate) >=
          new Date(filters.fromDate)
        : true);

    // To Date filter (optional)
    const matchesToDate =
      !filters.toDate ||
      (student.studentDetails?.student?.createdDate
        ? new Date(student.studentDetails.student.createdDate) <=
          new Date(filters.toDate)
        : true);

    // Status filter (optional, with "All" default)
    const matchesStatus =
      filters.status === "All" ||
      (student.studentDetails?.student?.status || "").toLowerCase() ===
        filters.status.toLowerCase();

    return (
      matchesSearch &&
      matchesStudentId &&
      matchesStudentName &&
      matchesCourseName &&
      matchesClassType &&
      matchesLevel &&
      matchesFromDate &&
      matchesToDate &&
      matchesStatus
    );
  });

  // reset page when filtering/searching changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const currentData = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <BaseLayout>
        <TeacherHeader currentSection="Student List" showBackButton ={true} showBackPath="/modules/users/teacher/ui/analytics"/>
        <div className="md:p-0 mx-auto">
          <div className="h-full w-full flex flex-col justify-between">
            <div className="w-full bg-[#FAFAFB] rounded-lg dark:bg-[#343434] mt-6">
              {/* Search and Filter Bar */}
              <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by keyword"
                    className="bg-transparent outline-none text-[14px] w-52 py-3 "
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>

                <div
                  onClick={() => setIsFilterModalOpen(true)}
                  className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
                >
                  <MdTune className="w-4 h-4" />
                  <span>Filter</span>
                </div>

                <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                  <span className="text-left -ml-60 ">
                    Showing {currentData.length} of {filteredStudents.length}
                  </span>
                </div>
              </div>

              {/* Filter modal */}
              {isFilterModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white dark:bg-[#252525] rounded-lg p-6 w-full max-w-lg relative">
                    {/* close X top-right */}
                    <button
                      aria-label="Close filter"
                      onClick={() => setIsFilterModalOpen(false)}
                      className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>

                    <h3 className="text-[16px] font-semibold mb-4">Filter by</h3>

                    <div className="grid grid-cols-1 gap-4">
                      {/* Student ID */}
                      <div>
                        <label className="text-sm block mb-1">Student ID</label>
                        <input
                          type="text"
                          className="w-full text-xs px-3 py-2 dark:border-[#5c5c5c] border rounded bg-transparent dark:bg-[#343434]"
                          placeholder="Enter student ID"
                          value={filters.studentId}
                          onChange={(e) =>
                            setFilters((s) => ({ ...s, studentId: e.target.value }))
                          }
                        />
                      </div>

                      {/* Student Name */}
                      <div>
                        <label className="text-sm block mb-1">Select Student</label>
                        <select
                          className="w-full dark:bg-[#343434] text-xs px-3 py-2 dark:border-[#5c5c5c] border rounded bg-transparent"
                          value={filters.studentName}
                          onChange={(e) =>
                            setFilters((s) => ({ ...s, studentName: e.target.value }))
                          }
                        >
                          <option value="">Select Student</option>
                          {studentOptions.map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Course */}
                      <div>
                        <label className="text-sm block mb-1">Select Course</label>
                        <select
                          className=" dark:bg-[#343434] w-full text-xs px-3 py-2 dark:border-[#5c5c5c] border rounded bg-transparent"
                          value={filters.courseName}
                          onChange={(e) =>
                            setFilters((s) => ({ ...s, courseName: e.target.value }))
                          }
                        >
                          <option value="">Select Course</option>
                          {courseOptions.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Class Type */}
                      <div>
                        <label className="text-sm block mb-1">Class Type</label>
                        <select
                        name="classType"
                          className="w-full text-xs px-3 py-2 dark:border-[#5c5c5c] border rounded bg-transparent dark:bg-[#343434]"
                          value={filters.classType}
                          onChange={(e) =>
                            setFilters((s) => ({ ...s, classType: e.target.value }))
                          }
                          >
                            <option value=""> Select Class Type</option>
                            {uniqueClassTypes.map((type, i) => (
      <option key={i} value={type}>{type}</option>
    ))}
                        </select>
                      </div>

                      {/* Date range */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm block mb-1">From Date</label>
                          <input
                            type="date"
                            className="w-full dark:bg-[#343434] text-xs px-3 py-2 dark:border-[#5c5c5c] border rounded bg-transparent dark:[color-scheme:dark]"
                            value={filters.fromDate}
                            onChange={(e) =>
                              setFilters((s) => ({ ...s, fromDate: e.target.value }))
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm block mb-1">To Date</label>
                          <input
                            type="date"
                            className="w-full  dark:bg-[#343434] text-xs px-3 py-2 dark:border-[#5c5c5c] border rounded bg-transparent dark:[color-scheme:dark]"
                            value={filters.toDate}
                            onChange={(e) =>
                              setFilters((s) => ({ ...s, toDate: e.target.value }))
                            }
                          />
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="text-sm block mb-1">Status</label>
                        <select
                          className="w-full dark:bg-[#343434] text-xs px-3 py-2 dark:border-[#5c5c5c] border rounded bg-transparent"
                          value={filters.status}
                          onChange={(e) =>
                            setFilters((s) => ({ ...s, status: e.target.value }))
                          }
                        >
                          <option value="All">Select Status</option>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    {/* footer */}
                    <div className="flex items-center justify-end mt-6">
                      <div className="flex items-center gap-3">
                        <button
                          className="px-3 py-1 text-[12px] rounded-md border border-[#576CBC] text-[#576CBC] font-medium hover:bg-[#EEF1FF] dark:hover:bg-[#343434]"
                          onClick={() =>
                            setFilters({
                              studentId: "",
                              studentName: "",
                              courseName: "",
                              classType: "",
                              level: "",
                              fromDate: "",
                              toDate: "",
                              status: "All",
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

              {/* Table */}
              <div className="overflow-x-auto">
                <table
                  className="table-auto w-full"
                  style={{ tableLayout: "auto" }}
                >
                  <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                    <tr>
                      <th className="px-4 py-3 text-left w-[10%]">Student ID</th>
                      <th className="px-4 py-3 text-left w-[14%]">Student Name</th>
                      <th className="px-4 py-3 text-left w-[14%]">Course</th>
                      <th className="px-4 py-3 text-left w-[10%]">Class Type</th>
                      <th className="px-4 py-3 text-left w-[14%]">Joined Date</th>
                      <th className="px-4 py-3 text-left w-[10%]">Level</th>
                      <th className="px-4 py-3 text-left w-[8%]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[#343434] dark:divide-gray-600">
                    {currentData.length > 0 ? (
                      currentData.map((student) => (
                        <tr
                          key={student.studentId}
                          className="text-[12px] h-[50px] bg-[#fff] dark:bg-[#2C2C2C] border-b border-gray-200 dark:border-gray-700"
                        >
                          {/* Student ID */}
                          <td className="px-4 py-2 text-[#17243E] dark:text-[#FDFDFD] text-left">
                            {student.studentId || "-"}
                          </td>

                          {/* Student Name */}
                          <td className="px-4 py-2 text-left">
                            <div className="text-[#3D8FDE] font-medium">
                              {student.name || "-"}
                            </div>
                          </td>

                          {/* Course / Learning Interest */}
                          <td className="px-4 py-2 text-[#17243E] dark:text-[#FDFDFD] text-left">
                            {student.studentDetails.student?.learningInterest || "-"}
                          </td>

                          {/* Class Type */}
                          <td className="px-4 py-2 text-[#17243E] dark:text-[#FDFDFD] text-left">
                              {(() => {
                            const val = student.studentDetails.classType
                            return val
                              ? `${val.charAt(0).toUpperCase()}${val.slice(1).toLowerCase()}`
                              : "-";
                          })()}
                          
                          </td>

                          {/* Joined Date */}
                          <td className="px-4 py-2 text-[#17243E] dark:text-[#FDFDFD] text-left">
                            {student.studentDetails.student?.createdDate
                              ? new Date(
                                  student.studentDetails.student.createdDate
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric",
                                })
                              : "-"}
                          </td>

                          {/* Level */}
                          <td className="px-4 py-2 text-[#17243E] dark:text-[#FDFDFD] text-left">
                            {student.level || "-"}
                          </td>

                          {/* Status */}
                          <td className="px-3 py-2 text-left">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                                student.studentDetails.student?.status === "Active"
                                  ? "text-[#0A8F40] bg-[#E8F5E9]"
                                  : student.studentDetails.student?.status === "Inactive"
                                  ? "text-[#B91C1C] bg-[#FEE2E2]"
                                  : "text-gray-600 bg-gray-200 dark:bg-[#4F4F4F]"
                              }`}
                            >
                              {student.studentDetails.student?.status || "-"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center p-4 text-gray-500">
                          No students found.
                        </td>
                      </tr>
                    )}
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
      </BaseLayout>
    </div>
  );
};

export default Totalstudents;
