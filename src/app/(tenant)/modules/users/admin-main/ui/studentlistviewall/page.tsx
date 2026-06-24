"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AdminHeader from "../../components/AdminHeader";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "@/components/Pagination";
import { MdTune } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import BaseLayout4 from "../../components/BaseLayout4";
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
  joiningDate: string; // ✅ should be string, not number
  role: string;
  status: string;
  createdDate: string; // ISO string
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
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const handleCancel = () => {
    setOpenPopup(null);
  };

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
const [meetingFilters, setMeetingFilters] = useState({
  teacher: "",
  course: "",
  fromDate: "",
});
 // Fetch students data from API
  const [students, setStudents] = useState<Student[]>([]); // Initialize as an empty array
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const search = searchQuery.toLowerCase();

    const filtered = students.filter((student) => {
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
        student._id?.toLowerCase().includes(search) ||
        student.username?.toLowerCase().includes(search) ||
        student.teacherName?.toLowerCase().includes(search) ||
        student.student.course?.toLowerCase().includes(search) ||
        student.student.studentPhone?.toString().includes(search) ||
        student.classScheduleCount?.toString().includes(search) ||
        formattedJoiningDate.includes(search) ||
        (student.level !== null &&
          student.level !== undefined &&
          student.level.toString().includes(search))
      );
    });

    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to page 1 when search changes
  }, [searchQuery, students]);
  useEffect(() => {
    const search = searchQuery.toLowerCase();

    const filtered = students.filter((student) => {
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
        student._id?.toLowerCase().includes(search) ||
        student.username?.toLowerCase().includes(search) ||
        student.teacherName?.toLowerCase().includes(search) ||
        student.student.course?.toLowerCase().includes(search) ||
        student.student.studentPhone?.toString().includes(search) ||
        student.classScheduleCount?.toString().includes(search) ||
        formattedJoiningDate.includes(search) ||
        (student.level !== null &&
          student.level !== undefined &&
          student.level.toString().includes(search))
      );
    });

    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to page 1 when search changes
  }, [searchQuery, students]);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AdminAuthToken")
        : null;

    if (!token) {
      console.error("❌ AdminAuthToken not found");
      return;
    }
    if (token) {
      fetchStudents(token); // call your function with token
    } else {
      toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
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

      // Sort in a separate step
      const sortedStudents = uniqueStudents.sort(
        (a, b) =>
          new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime()
      );

      setStudents(sortedStudents);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudent = filteredStudents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleClickOutside = (event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      setOpenPopup(null);
    }
  };

  useEffect(() => {
    if (openPopup !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openPopup]);

  const handleViewDetails = (studentId: string) => {
    router.push(`/modules/users/admin-main/ui/studentlist?studentId=${studentId}`);
  };

  function handleApplyMeetingFilters(meetingFilters: { teacher: string; course: string; fromDate: string; }): void {
    const filtered = students.filter((student) => {
      const matchesTeacher = meetingFilters.teacher
        ? student.teacherName.toLowerCase().includes(meetingFilters.teacher.toLowerCase())
        : true;

      const matchesCourse = meetingFilters.course
        ? student.student.course.toLowerCase().includes(meetingFilters.course.toLowerCase())
        : true;

      const matchesFromDate = meetingFilters.fromDate
        ? new Date(student.evaluation[0].joiningDate) >= new Date(meetingFilters.fromDate)
        : true;

      return matchesTeacher && matchesCourse && matchesFromDate;
    });

    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to page 1 when filters are applied
  }

  return (
    <BaseLayout4>
      <AdminHeader currentSection="Student Lists" showBackButton={true} showBackPath="/modules/users/admin-main/ui/student"/>

      <div className="rounded-xl overflow-hidden">
        {/* Top Bar: Search / Filter / Showing Info */}
        <div className="flex flex-row sm:flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
          <input
            type="text"
            placeholder="Search by keyword"
            className="bg-transparent outline-none text-[12px] w-32 py-3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Filter */}
          <div
            className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 cursor-pointer"
            onClick={() => setIsFilterModalOpen(true)} // Add onClick to open the filter modal
          >
            <MdTune className="w-4 h-4" />
            <span>Filter</span>
          </div>

          {/* Showing Info */}
          <span className="text-[12px] text-gray-400 dark:text-gray-400 py-3">
            Showing{" "}
            {Math.min(startIndex + itemsPerPage, filteredStudents.length)} of{" "}
            {filteredStudents.length}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-none">
          <table
            className="w-full min-w-[900px] text-sm text-left table-auto"
            style={{ width: "100%", tableLayout: "fixed" }}
          >
            <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
              <tr>
                {[
                  "Student ID",
                  "Student Name",
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
                    className="p-4 font-semibold text-[12px] text-left"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[10px] text-[#1D2939]">
              {paginatedStudent.length > 0 ? (
                paginatedStudent.map((student, index) => (
                  <tr
                    key={student.student.studentId}
                    className={` dark:text-white break-words w-[8%] ${
                      index % 2 === 0
                        ? "bg-[#fff] dark:bg-[#2C2C2C]"
                        : "bg-[#F8F8F8] dark:bg-[#303030]"
                    }`}
                  >
                    <td className="p-3">{student.student.studentId}</td>
                    <td className="p-3 text-blue-600 cursor-pointer">
                      {student.username}
                    </td>
                    <td className="p-3">
                      {new Date(
                        student.evaluation[0].joiningDate
                      ).toString() !== "Invalid Date"
                        ? new Date(
                            student.evaluation[0].joiningDate
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : ""}{" "}
                      {/* Display "N/A" if the date is invalid */}
                    </td>

                    <td className="p-3">{student.teacherName}</td>
                    <td className="p-3">{student.student.course}</td>
                    <td className="p-3">{student.student.studentPhone}</td>
                    <td className="p-3">{student.classScheduleCount}</td>
                    <td className="p-3">{student.level}</td>
                    <td className="py-3 px-2 text-left relative">
                      <div className="relative inline-block">
                        <button
                          className="text-gray-500"
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
                            className="absolute right-0 mt-2 w-28 bg-white dark:bg-[#343434] shadow-md  rounded-lg z-50 text-[11px]"
                          >
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-[]"
                              onClick={() => handleViewDetails(student._id)}
                            >
                              View Details
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-[]"
                              onClick={handleCancel}
                            >
                              Cancel
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

{/* Filter Modal */}
{isFilterModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-30">
    <div className="bg-white p-6 rounded-xl w-[400px] relative dark:bg-[#252525] shadow-xl">
      <button
        className="absolute top-4 right-4 text-gray-400 text-2xl"
        onClick={() => setIsFilterModalOpen(false)} // Close the modal
      >
        &times;
      </button>
      <h2 className="text-lg font-semibold mb-6 dark:text-white">Filter by</h2>
      <div className="mb-4">
        <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Teacher Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded text-xs dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]"
          value={meetingFilters.teacher}
          onChange={(e) => setMeetingFilters({ ...meetingFilters, teacher: e.target.value })}
        />
      </div>
      <div className="mb-4">
        <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Course Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded text-xs dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]"
          value={meetingFilters.course}
          onChange={(e) => setMeetingFilters({ ...meetingFilters, course: e.target.value })}
        />
      </div>
      <div className="mb-4">
        <label className="text-sm font-medium mb-1 dark:text-[#D6D6D6]">From Date</label>
        <input
          type="date"
          className="w-full border rounded-md p-2 text-sm dark:bg-[#343434] dark:text-white dark:border-[#5C5C5C]"
          value={meetingFilters.fromDate}
          onChange={(e) => setMeetingFilters({ ...meetingFilters, fromDate: e.target.value })}
        />
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setMeetingFilters({ teacher: '', course: '', fromDate: '' })}
          className="px-4 py-1 rounded-md border border-[#576CBC] text-[#576CBC] font-medium"
        >
          Reset
        </button>
        <button
          className="px-4 py-1 rounded-md bg-[#576CBC] text-white font-medium"
          onClick={() => handleApplyMeetingFilters(meetingFilters)}
        >
          Apply Filters
        </button>
      </div>
    </div>
  </div>
)}


      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredStudents.length / itemsPerPage)}
        onPageChange={setCurrentPage}
      />
    </BaseLayout4>
  );
};

export default TrailManagement;