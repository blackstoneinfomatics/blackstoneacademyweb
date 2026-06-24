"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MdTune } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

export interface StudentInfo {
  studentId: string;
  studentEmail: string;
  studentPhone: number;
  gender: string;
  package: string;
  course: string;
  city: string;
  country: string;
}

export interface Student {
  evaluation: any;
  _id: string;
  student: StudentInfo;
  username: string;
  password: string;
  teacherName: string;
  joiningDate: string;
  role: string;
  status: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  __v: number;
  classScheduleCount: number;
  level: number;
}

export interface StudentsResponse {
  students: Student[];
}

const TrailManagement = () => {
  const [openPopup, setOpenPopup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const popupRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [filters, setFilters] = useState({
    studentId: "",
    studentName: "",
    joiningDate: "",
    teacherName: "",
    courseName: "",
    contact: "",
    scheduledClasses: "",
    level: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("AdminAuthToken");
      if (token) fetchStudents(token);
    }
  }, []);

  const fetchStudents = async (token: string) => {
    try {
      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.GET}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const uniqueStudentsMap = new Map();
      response.data.students.forEach((student: Student) => {
        uniqueStudentsMap.set(student.student.studentId, student);
      });

      const uniqueStudents = Array.from(uniqueStudentsMap.values());
      const sorted = uniqueStudents.sort(
        (a, b) =>
          new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime()
      );

      setAllStudents(sorted);
      setStudents(sorted.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      setOpenPopup(null);
      setFilterPopupOpen(false);
    }
  };

  useEffect(() => {
    if (openPopup !== null || isFilterPopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openPopup, isFilterPopupOpen]);

  const handleViewDetails = (studentId: string) => {
    router.push(`/modules/users/admin-main/ui/studentlist?studentId=${studentId}`);
  };

  const applyFilters = () => {
  const filtered = allStudents.filter((student) => {
    const joinDate = student.evaluation?.[0]?.joiningDate
      ? new Date(student.evaluation[0].joiningDate)
          .toISOString()
          .split("T")[0]
      : "";

    return (
      (!filters.studentId ||
        student.student.studentId.includes(filters.studentId)) &&
      (!filters.studentName ||
        student.username
          .toLowerCase()
          .includes(filters.studentName.toLowerCase())) &&
      (!filters.joiningDate || joinDate === filters.joiningDate) &&
      (!filters.teacherName ||
        student.teacherName
          .toLowerCase()
          .includes(filters.teacherName.toLowerCase())) &&
      (!filters.courseName ||
        student.student.course
          .toLowerCase()
          .includes(filters.courseName.toLowerCase())) &&
      (!filters.contact ||
        student.student.studentPhone.toString().includes(filters.contact)) &&
      (!filters.scheduledClasses ||
        student.classScheduleCount
          .toString()
          .includes(filters.scheduledClasses)) &&
      (!filters.level || student.level.toString().includes(filters.level))
    );
  });

  setStudents(filtered);
};


  return (
    <div className="relative rounded-xl overflow-hidden">
      {/* Top Bar: Search / Filter / Info */}
      <div className="flex flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
        <input
          type="text"
          placeholder="Search by keyword"
          className="bg-transparent outline-none text-[12px] ml-1 w-52 py-3"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Filter */}
        <div
          className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-3 border-r-2 border-l-2 px-48 cursor-pointer"
          onClick={() => setFilterPopupOpen(true)}
        >
          <MdTune className="w-4 h-4" />
          <span>Filter</span>
        </div>

        <span className="text-[12px] text-gray-400 dark:text-gray-400 py-3">
          Showing {students.length} of {allStudents.length}
        </span>
      </div>

      {/* Filter Popup */}
      {isFilterPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-[#2C2C2C] p-6 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[16px] font-medium text-gray-800 dark:text-white">
                Filter by
              </h2>
              <button
                onClick={() => setFilterPopupOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-4 text-[13px]">
              {/* Student Name */}
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-300">
                  Student Name
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-[13px] w-full"
                  value={filters.studentName}
                  onChange={(e) =>
                    setFilters({ ...filters, studentName: e.target.value })
                  }
                />
              </div>

              {/* Course Name */}
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-300">
                  Course Name
                </label>
                <select
                  className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-[13px] w-full"
                  value={filters.courseName}
                  onChange={(e) =>
                    setFilters({ ...filters, courseName: e.target.value })
                  }
                >
                  <option value="">All Courses</option>
                  {/* Add course options here */}
                  <option value="Quran">Quran</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Tajweed">Tajweed</option>
                </select>
              </div>

              {/* Teacher Name */}
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-300">
                  Teacher Name
                </label>
                <input
                  type="text"
                  placeholder="Enter teacher name"
                  className="w-full border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-[13px]"
                  value={filters.teacherName}
                  onChange={(e) =>
                    setFilters({ ...filters, teacherName: e.target.value })
                  }
                />
              </div>

              {/* Date Range */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block mb-1 text-gray-600 dark:text-gray-300">
                    Joining Date
                  </label>
                  <input
                    type="date"
                                    className="w-full border border-gray-300 dark:border-[#5C5C5C] rounded-lg px-3 py-2 text-[13px] font-light text-gray-800 dark:text-white dark:bg-[#2B2B2B] focus:ring-2 focus:ring-[#576CBC] outline-none dark:[color-scheme:dark]"

                    value={filters.joiningDate || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, joiningDate: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => {
                  setFilters({
                    studentId: "",
                    studentName: "",
                    joiningDate: "",
                    teacherName: "",
                    courseName: "",
                    contact: "",
                    scheduledClasses: "",
                    level: "",
                  });
                  setFilterPopupOpen(false);
                  setStudents(allStudents); // Reset to all
                }}
                className="px-4 py-2 text-indigo-700 border border-indigo-600 rounded-md text-[12px]"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  applyFilters();
                  setFilterPopupOpen(false);
                }}
                className="px-4 py-2 text-white bg-indigo-600 rounded-md text-[12px]"
              >
                Show {students.length} results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto max-h-none">
        <table
          className="w-full min-w-[900px] text-sm text-left table-auto"
          style={{ width: "100%", tableLayout: "fixed" }}
        >
          <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
            <tr className="font-medium">
              {[
                "Student ID",
                "Student Name",
                "Package",
                "Date of Joining",
                "Teacher Name",
                "Course Name",
                "Contact",
                "Scheduled Classes",
                "Level",
                "Action",
              ].map((header) => (
                <th
                  key={header}
                  className="py-4 px-2 font-semibold text-[12px] text-left"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[10px] text-[#1D2939]">
            {students.length > 0 ? (
              students
                .filter((student) => {
                  const search = searchQuery.toLowerCase();
                  const joiningDate = student.evaluation?.[0]?.joiningDate;
                  const formattedJoiningDate = joiningDate
                    ? new Date(joiningDate)
                        .toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                        .toLowerCase()
                    : "";
                  return (
                    student.student.studentId.toLowerCase().includes(search) ||
                    student.username.toLowerCase().includes(search) ||
                    student.teacherName.toLowerCase().includes(search) ||
                    student.student.course.toLowerCase().includes(search) ||
                    student.student.studentPhone.toString().includes(search) ||
                    formattedJoiningDate.includes(search) ||
                    student.classScheduleCount.toString().includes(search) ||
                    student.level.toString().includes(search)
                  );
                })
                .slice(-5)
                .reverse()
                .map((student, index) => (
                  <tr
                    key={student.student.studentId}
                    className={`dark:text-white ${
                      index % 2 === 0
                        ? "bg-[#fff] dark:bg-[#2C2C2C]"
                        : "bg-[#F8F8F8] dark:bg-[#303030]"
                    } text-left text-[11px]`}
                  >
                    <td className="p-3 w-[9%] break-words">{student.student.studentId}</td>
                    <td className="py-3 px-2 text-blue-600 cursor-pointer">
                      {student.username}
                    </td>
                    <td className="py-3 px-2 text-blue-600 cursor-pointer">
                      {student.student.package}
                    </td>
                    <td className="py-3 px-2 text-left">
                      {new Date(
                        student.evaluation[0]?.joiningDate
                      ).toString() !== "Invalid Date"
                        ? new Date(
                            student.evaluation[0]?.joiningDate
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : ""}
                    </td>
                    <td className="p-3">{student.teacherName}</td>
                    <td className="p-3">{student.student.course}</td>
                    <td className="p-3">{student.student.studentPhone}</td>
                    <td className="p-3">{student.classScheduleCount}</td>
                    <td className="p-3">{student.level}</td>
                    <td className="p-3 relative">
                      <div className="relative">
                        <button
                          className="text-gray-500 dark:text-[#fff]"
                          onClick={() =>
                            setOpenPopup(
                              openPopup === student._id ? null : student._id
                            )
                          }
                        >
                          <BsThreeDotsVertical />
                        </button>
                        {openPopup === student._id && (
                          <div
                            ref={popupRef}
                            className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#343434] shadow-md rounded-lg z-50 text-[11px]"
                          >
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:text-[#000] rounded-lg"
                              onClick={() => handleViewDetails(student._id || student.student.studentId)}
                            >
                              View Details
                            </button>

                            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg">
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={9} className="py-4 text-center text-gray-400">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrailManagement;