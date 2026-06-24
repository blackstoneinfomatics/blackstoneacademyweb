"use client";

import { useEffect, useState } from "react";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import {  useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import Pagination from "@/components/Pagination";
import BaseLayout2 from "@/app/(tenant)/modules/users/student/components/BaseLayout2";
import StudentHeader from "../../components/StudentHeader";
import { useRouter } from "next/navigation"; // Add this at the top
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface AssignmentType {
  _id: string;
  studentId: string;
  studentName: string;
  sessionClassType?: string;
  assignmentName: string;
  questionName?: string;
  questionType?: string;
  typeofQuestion?: string;
  title: string;
  assignedTeacher?: string;
  assignedTeacherId?: string;
  assignmentId: string;
  assignmentType?: {
    type?: string;
    name?: string;
    chooseType?: boolean;
    trueorfalseType?: boolean;
  };
  chooseType?: boolean;
  trueorfalseType?: boolean;
  question?: string;
  hasOptions?: boolean;
  options?: {
    optionOne?: string;
    optionTwo?: string;
    optionThree?: string;
    optionFour?: string;
  };
  status?: string;
  createdDate?: string;
  createdBy?: string;
  updatedDate?: string;
  updatedBy?: string;
  level?: string;
  course?: string;
  assignedDate?: string;
  dueDate?: string;
  answer?: string;
  answerValidation?: string;
  assignmentStatus?: string;
  __v?: number;
}

const StudentList = () => {
  const [assignments, setAssignments] = useState<AssignmentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    assignmentName: "",
    course: "",
    level: "",
    assignedDateFrom: "",
    assignedDateTo: "",
    dueDateFrom: "",
    dueDateTo: "",
    status: ""
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const itemsPerPage = 10;
  const searchParams = useSearchParams();
  const assignmentId = searchParams?.get("assignmentId") ;
  const router = useRouter();

  // Helper functions for dropdowns
  const getUniquecourse = () => Array.from(new Set(assignments.map(a => a.course).filter(Boolean)));
  const getUniqueLevels = () => Array.from(new Set(assignments.map(a => a.level).filter(Boolean)));

  // Filtering logic
  const filterAssignments = (assignments: AssignmentType[]) => {
    return assignments.filter(assignment => {
      // Search by keyword in all table fields (case-insensitive)
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        const fieldsToSearch = [
          assignment.assignmentId,
          assignment.assignedTeacher,
          assignment.course,
          assignment.level,
          assignment.assignmentName,
          assignment.title,
          assignment.sessionClassType,
          assignment.assignedDate ? new Date(assignment.assignedDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "",
          assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "",
          assignment.assignmentStatus
        ];
        if (!fieldsToSearch.some(field => (field || "").toString().toLowerCase().includes(keyword))) {
          return false;
        }
      }
      // Assignment Name filter
      if (filters.assignmentName && !assignment.title?.toLowerCase().includes(filters.assignmentName.toLowerCase())) {
        return false;
      }
      // Course filter
      if (filters.course && assignment.course !== filters.course) {
        return false;
      }
      // Level filter
      if (filters.level && assignment.level !== filters.level) {
        return false;
      }
      // Status filter
      if (filters.status && assignment.assignmentStatus !== filters.status) {
        return false;
      }
      // Assigned Date range filter
      if (filters.assignedDateFrom && assignment.assignedDate) {
        const assignedDate = new Date(assignment.assignedDate);
        const fromDate = new Date(filters.assignedDateFrom);
        if (assignedDate < fromDate) {
          return false;
        }
      }
      if (filters.assignedDateTo && assignment.assignedDate) {
        const assignedDate = new Date(assignment.assignedDate);
        const toDate = new Date(filters.assignedDateTo);
        if (assignedDate > toDate) {
          return false;
        }
      }
      // Due Date range filter
      if (filters.dueDateFrom && assignment.dueDate) {
        const dueDate = new Date(assignment.dueDate);
        const fromDate = new Date(filters.dueDateFrom);
        if (dueDate < fromDate) {
          return false;
        }
      }
      if (filters.dueDateTo && assignment.dueDate) {
        const dueDate = new Date(assignment.dueDate);
        const toDate = new Date(filters.dueDateTo);
        if (dueDate > toDate) {
          return false;
        }
      }
      return true;
    });
  };

useEffect(() => {
  if (!assignmentId) return;

  const fetchAssignmentById = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("StudentAuthToken") : null;
      const studentId = localStorage.getItem("StudentPortalId");

      if (!token || !studentId) {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
        setLoading(false);
        return;
      }

      const res = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ASSIGNMENT.GET_LIST}/?assignmentId=${assignmentId}&studentId=${studentId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to fetch assignment");

      const data = await res.json();
      setAssignments(data.data || []);
    } catch (err) {
      toast.error(AppFailureToastMessages.ASSIGNMENT_FETCH);
      setError("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  fetchAssignmentById();
}, [assignmentId]);


  const filteredAssignments = filterAssignments(assignments);
  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "bg-[#ECFDF3] text-[#377E36] dark:bg-[#2E3D2E] dark:text-[#377E36]";
      case "INPROGRESS":
        return "bg-[#FDF6EC] text-[#F0AD4E] dark:bg-[#534634] dark:text-[#F0AD4E]";
      case "ASSIGNED":
        return "bg-[#FDECEC] text-[#D34645] dark:bg-[#4D3131] dark:text-[#D34645]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  return (
    <BaseLayout2>
      <StudentHeader currentSection="Assignments" showBackButton={true} showBackPath={`/modules/users/student/ui/assignment`} />

      <div className="md:p-0 mx-auto w-full">
        <div className="flex flex-col h-full w-full justify-between">
          <div className="flex flex-col">
            <div className="w-full bg-[#FAFAFB] dark:bg-[#343434] rounded-lg">
              {/* Search and Filter Bar */}
              <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by keyword"
                    className="bg-transparent outline-none text-[15px] w-52 py-3"
                    value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer" onClick={() => setShowFilter(true)}>
                  <MdTune className="w-4 h-4" />
                  <span>Filter</span>
                </div>
                <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                  <span className="text-left -ml-60">
                    Showing {filteredAssignments.length} of {assignments.length}
                  </span>
                </div>
              </div>

              {/* Filter Modal */}
              {showFilter && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <form
                    className="bg-white dark:bg-[#232323] p-6 rounded-2xl shadow-lg w-[500px] flex flex-col z-50"
                    onSubmit={e => { e.preventDefault(); setShowFilter(false); }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-bold text-lg">Filter by</h2>
                      <button
                        type="button"
                        className="text-gray-400 text-2xl font-bold cursor-pointer"
                        onClick={() => setShowFilter(false)}
                      >×</button>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Assignment Name</label>
                      <input
                        type="text"
                        value={filters.assignmentName}
                        onChange={e => setFilters(f => ({ ...f, assignmentName: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-[#23272f] placeholder-gray-400 dark:placeholder-gray-500 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition"
                        placeholder="Enter assignment name..."
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Course</label>
                      <select
                        value={filters.course}
                        onChange={e => setFilters(f => ({ ...f, course: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-[#23272f] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition"
                      >
                        <option value="">Select Course</option>
                        {getUniquecourse().map(course => (
                          <option key={course} value={course}>{course}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Level</label>
                      <select
                        value={filters.level}
                        onChange={e => setFilters(f => ({ ...f, level: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-[#23272f] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition"
                      >
                        <option value="">Select Level</option>
                        {getUniqueLevels().map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-medium mb-1">Assigned Date</label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={filters.assignedDateFrom}
                          onChange={e => setFilters(f => ({ ...f, assignedDateFrom: e.target.value }))}
                          className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-gray-50 dark:bg-[#23272f] text-xs w-full focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition"
                        />
                        <input
                          type="date"
                          value={filters.assignedDateTo}
                          onChange={e => setFilters(f => ({ ...f, assignedDateTo: e.target.value }))}
                          className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-gray-50 dark:bg-[#23272f] text-xs w-full focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-medium mb-1">Due Date</label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={filters.dueDateFrom}
                          onChange={e => setFilters(f => ({ ...f, dueDateFrom: e.target.value }))}
                          className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-gray-50 dark:bg-[#23272f] text-xs w-full focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition"
                        />
                        <input
                          type="date"
                          value={filters.dueDateTo}
                          onChange={e => setFilters(f => ({ ...f, dueDateTo: e.target.value }))}
                          className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-gray-50 dark:bg-[#23272f] text-xs w-full focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition"
                        />
                      </div>
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select
                        value={filters.status}
                        onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-[#23272f] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition"
                      >
                        <option value="">Select Status</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="flex gap-4 mt-auto justify-end">
                      <button
                        type="button"
                        className="border border-[#576CBC] bg-white text-[#576CBC] rounded-lg px-6 py-2 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#576CBC]"
                        onClick={() => setFilters({
                          assignmentName: "",
                          course: "",
                          level: "",
                          assignedDateFrom: "",
                          assignedDateTo: "",
                          dueDateFrom: "",
                          dueDateTo: "",
                          status: ""
                        })}
                      >Reset</button>
                      <button
                        type="submit"
                        className="bg-[#576CBC] text-white rounded-lg px-6 py-2 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#576CBC]"
                        onClick={() => setShowFilter(false)}
                      >Show results</button>
                    </div>
                  </form>
                  <div className="fixed inset-0" onClick={() => setShowFilter(false)} />
                </div>
              )}

              {/* Table */}
              {(() => {
                if (loading) {
                  return <div className="p-4 text-center">Loading assignments...</div>;
                }
                if (error) {
                  return <div className="p-4 text-center text-red-500">{error}</div>;
                }
                return (
                  <table className="table-fixed w-full">
                    <thead className="text-[13px] bg-[#4C6993] text-white">
                      <tr>
                        {[
                          "Assignment ID",
                          "Assigned By",
                          "Course",
                          "Level",
                          "Assignment Name",
                          "Class Type",
                          "Assigned Date",
                          "Due Date",
                          "Status",
                          "Action"
                        ].map((header, idx) => (
                          <th
                            key={idx}
                            className="px-2 py-1 border border-[#4C6993] text-left text-wrap break-words"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAssignments.map((assignment, index) => {
                        const status = assignment.assignmentStatus?.toUpperCase();
                        const rowBgClass =
                          index % 2 === 0
                            ? "bg-[#fff] dark:bg-[#2C2C2C]"
                            : "bg-[#F8F8F8] dark:bg-[#303030]";
                        return (
                          <tr
                            key={assignment._id || index}
                            className={`text-[10px] ${rowBgClass}`}
                          >
                            <td className="px-3 py-4 break-words text-[11px]">
                              {assignment.assignmentId}
                            </td>
                            <td className="px-3 py-4 break-words text-[11px]">
                              {assignment.assignedTeacher }
                            </td>
                            <td className="px-3 py-4 break-words text-[11px]">
                              {assignment.course}
                            </td>
                            <td className="px-3 py-4 break-words text-[11px]">
                              {assignment.level}
                            </td>
                            <td className="px-3 py-4 break-words text-[11px]">
                              {assignment.title}
                            </td>
                            <td className="px-3 py-4 break-words text-[11px]">
                              {assignment.sessionClassType}
                            </td>
                            <td className="px-3 py-4 break-words text-[11px]">
                              {assignment.assignedDate ? new Date(assignment.assignedDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "-"}
                            </td>
                            <td className="px-3 py-4 break-words text-[11px]">
                              {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "-"}
                            </td>
                            <td className="px-3 py-4 break-words text-[11px]">
                              <span className={`py-1 px-1 rounded-md text-[10px] flex items-center justify-center w-[80px] font-semibold ${getStatusStyle(assignment.assignmentStatus || "")}`}>
                                {assignment.assignmentStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center relative text-[11px]">
                              <button
                                className="text-gray-500 hover:text-gray-700 dark:text-[#ffff]"
                                onClick={() => toggleDropdown(assignment._id)}
                              >
                                <BsThreeDotsVertical />
                              </button>
                              {openDropdownId === assignment._id && (
                                <div className="absolute right-0 w-32 p-2 shadow-2xl space-y-2 bg-white rounded-md z-50 border border-gray-200 dark:bg-[#343434]">
                                  <button
                                    className="block w-full px-4 py-1 text-[11px] text-black dark:text-[#ffff]"
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      // Add navigation to view question page here
                                    router.push(
  `/modules/users/student/ui/question?id=${assignment._id}&assignmentId=${assignmentId}`
);

                                    }}
                                  >
                                    View Question
                                  </button>
                                  <button
                                    className="block w-full px-4 py-1 text-[11px] dark:text-[#ffff]"
                                    onClick={() => setOpenDropdownId(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })()}


            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </BaseLayout2>
  );
};

export default StudentList;
