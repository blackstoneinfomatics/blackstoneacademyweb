"use client";

import { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation"; // Add this at the top
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { toast } from "react-toastify";

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
  questions?: {
    _id: string;
    status: string;
  }[];
}

const StudentList = () => {
  const [assignments, setAssignments] = useState<AssignmentType[]>([]);
  const [activeTab, setActiveTab] = useState<"Pending" | "Completed">(
    "Pending",
  );
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const router = useRouter();
  const [showFilter, setShowFilter] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Filter state variables
  const [filters, setFilters] = useState({
    assignmentName: "",
    course: "",
    level: "",
    assignedDateFrom: "",
    assignedDateTo: "",
    dueDateFrom: "",
    dueDateTo: "",
    status: "",
  });

  // Get unique values for filter options
  const getUniqueCourses = () => {
    const values = assignments
      .map((assignment) => assignment.course)
      .filter(Boolean) as string[];
    return Array.from(new Set(values));
  };

  const getUniqueLevels = () => {
    const values = assignments
      .map((assignment) => assignment.level)
      .filter(Boolean) as string[];
    return Array.from(new Set(values));
  };

  // Map assignment status for display and filtering
  const mapStatus = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "ASSIGNED":
      case "INPROGRESS":
        return "Assigned";
      case "COMPLETED":
        return "Completed";
      case "PENDING":
      case "NOT ASSIGNED":
      default:
        return "Pending";
    }
  };

  // Determine if assignment is past due (compares by end of day local time)
  const isPastDue = (dueDate?: string) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    // Set to end of that day to include the full due day
    due.setHours(23, 59, 59, 999);
    return new Date() > due;
  };

  // Display status that considers due date
  const getDisplayStatus = (assignment: AssignmentType) => {
    const base = mapStatus(assignment.assignmentStatus);
    if (base !== "Completed" && isPastDue(assignment.dueDate)) {
      return "Overdue";
    }
    return base;
  };

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("StudentAuthToken")
            : null;
        const studentId = localStorage.getItem("StudentPortalId");

        if (!token) {
          toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
          return;
        }

        if (!studentId) {
          toast.error(AppValidationMessages.AUTH.STUDENT_REQUIRED);
          return;
        }
        const res = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ASSIGNMENT.GET_STUDENT_ASSIGNMENTS}?studentId=${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!res.ok) throw new Error("Failed to fetch assignments");
        const data = await res.json();
        setAssignments((data.data || []) as AssignmentType[]);
      } catch (err: any) {
        console.log(err.message || "Error fetching assignments");
      }
    };
    fetchAssignments();
  }, []);

  // Filter assignments based on current filters
  const filterAssignments = (assignments: AssignmentType[]) => {
    return assignments.filter((assignment) => {
      // Search by keyword in all table data (case-insensitive)
      if (
        searchKeyword &&
        !Object.values(assignment)
          .map((val) => (typeof val === "string" ? val.toLowerCase() : ""))
          .join(" ")
          .includes(searchKeyword.toLowerCase())
      ) {
        return false;
      }
      // Assignment Name filter
      if (
        filters.assignmentName &&
        !assignment.title
          ?.toLowerCase()
          .includes(filters.assignmentName.toLowerCase())
      ) {
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
      // Status filter (use display status, which considers due date)
      if (filters.status && getDisplayStatus(assignment) !== filters.status) {
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

  // Tab logic (if you want to filter by assignmentStatus)
  const pendingAssignments = assignments.filter(
    (a) => mapStatus(a.assignmentStatus) !== "Completed",
  );
  const completedAssignments = assignments.filter((a) => {
    const isAssignmentCompleted = mapStatus(a.assignmentStatus) === "Completed";
    // If there are questions, check that none are "ASSIGNED"
    const allQuestionsNotAssigned =
      !a.questions ||
      a.questions.every((q) => mapStatus(q.status) !== "Assigned");
    return isAssignmentCompleted && allQuestionsNotAssigned;
  });

  // Apply filters to the appropriate tab
  const filteredPendingAssignments = filterAssignments(pendingAssignments);
  const filteredCompletedAssignments = filterAssignments(completedAssignments);
  const studentsToDisplay =
    activeTab === "Pending"
      ? filteredPendingAssignments
      : filteredCompletedAssignments;

  const toggleDropdown = (id: string) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "bg-[#ECFDF3] text-[#377E36] dark:bg-[#2E3D2E] dark:text-[#377E36]";
      case "INPROGRESS":
        return "bg-[#FDF6EC] text-[#F0AD4E] dark:bg-[#534634] dark:text-[#F0AD4E]";
      case "ASSIGNED":
        return "bg-[#FDECEC] text-[#D34645] dark:bg-[#4D3131] dark:text-[#D34645]";
      case "OVERDUE":
        return "bg-[#FFEDEA] text-[#C23C2F] dark:bg-[#4D2F2B] dark:text-[#FF8A7A]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const tabOptions = [
    {
      type: "Pending",
      label: "Pending",
      count: filteredPendingAssignments.length,
    },
    {
      type: "Completed",
      label: "Completed",
      count: filteredCompletedAssignments.length,
    },
  ];

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="md:p-0 mx-auto w-full">
      <div className="flex flex-col h-full w-full justify-between">
        <div className="flex flex-col">
          {/* Tabs */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
            <div className="flex flex-wrap gap-4 font-semibold">
              {tabOptions.map(({ type, label, count }) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type as "Pending" | "Completed")}
                  className={
                    activeTab === type
                      ? "text-[#576CBC] text-[18px] relative pb-1"
                      : "text-[#010E30] dark:text-white text-[18px]"
                  }
                  style={
                    activeTab === type
                      ? {
                          position: "relative",
                        }
                      : {}
                  }
                >
                  {label} ({count})
                  {activeTab === type && (
                    <div className="absolute bottom-0 left-10 transform -translate-x-1/2 w-12 h-0.5 bg-[#576CBC] rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Search + Filter */}
          <div className="w-full bg-[#FAFAFB] dark:bg-[#343434] rounded-lg">
            <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by keyword"
                  className="bg-transparent outline-none text-[15px] w-52 py-3"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>

              <div
                className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
                onClick={() => setShowFilter(true)}
              >
                <MdTune className="w-4 h-4" />
                <span>Filter</span>
              </div>

              <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                <span className="text-left -ml-60">
                  Showing {studentsToDisplay.length} of {assignments.length}
                </span>
              </div>
            </div>
          </div>

          {/* Filter Modal */}
          {showFilter && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <form className="bg-white dark:bg-[#232323] p-6 rounded-2xl shadow-lg w-[500px] flex flex-col z-50 max-h-[80vh] overflow-scroll scrollbar-none">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-lg">Filter by</h2>
                  <button
                    type="button"
                    className="text-gray-400 text-2xl font-bold cursor-pointer"
                    onClick={() => setShowFilter(false)}
                  >
                    ×
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    Assignment Name
                  </label>
                  <input
                    type="text"
                    value={filters.assignmentName}
                    onChange={(e) =>
                      handleFilterChange("assignmentName", e.target.value)
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-[#23272f] placeholder-gray-400 dark:placeholder-gray-500 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition"
                    placeholder="Enter assignment name..."
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Course
                  </label>
                  <select
                    value={filters.course}
                    onChange={(e) =>
                      handleFilterChange("course", e.target.value)
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-[#23272f] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition"
                  >
                    <option value="">Select Course</option>
                    {getUniqueCourses().map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Level
                  </label>
                  <select
                    value={filters.level}
                    onChange={(e) =>
                      handleFilterChange("level", e.target.value)
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-[#23272f] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition"
                  >
                    <option value="">Select Level</option>
                    {getUniqueLevels().map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium mb-1">
                    Assigned Date
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={filters.assignedDateFrom}
                      onChange={(e) =>
                        handleFilterChange("assignedDateFrom", e.target.value)
                      }
                      className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-gray-50 dark:bg-[#23272f] text-xs w-full focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition"
                    />
                    <input
                      type="date"
                      value={filters.assignedDateTo}
                      onChange={(e) =>
                        handleFilterChange("assignedDateTo", e.target.value)
                      }
                      className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-gray-50 dark:bg-[#23272f] text-xs w-full focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-medium mb-1">
                    Due Date
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={filters.dueDateFrom}
                      onChange={(e) =>
                        handleFilterChange("dueDateFrom", e.target.value)
                      }
                      className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-gray-50 dark:bg-[#23272f] text-xs w-full focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition"
                    />
                    <input
                      type="date"
                      value={filters.dueDateTo}
                      onChange={(e) =>
                        handleFilterChange("dueDateTo", e.target.value)
                      }
                      className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-gray-50 dark:bg-[#23272f] text-xs w-full focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
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
                    onClick={() =>
                      setFilters({
                        assignmentName: "",
                        course: "",
                        level: "",
                        assignedDateFrom: "",
                        assignedDateTo: "",
                        dueDateFrom: "",
                        dueDateTo: "",
                        status: "",
                      })
                    }
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="bg-[#576CBC] text-white rounded-lg px-6 py-2 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#576CBC]"
                    onClick={() => setShowFilter(false)}
                  >
                    Show results
                  </button>
                </div>
              </form>
              <div
                className="fixed inset-0"
                onClick={() => {
                  if (
                    filters.assignedDateFrom &&
                    filters.assignedDateTo &&
                    new Date(filters.assignedDateFrom) >
                      new Date(filters.assignedDateTo)
                  ) {
                    toast.error(
                      AppValidationMessages.FILTER.INVALID_ASSIGNED_DATE,
                    );
                    return;
                  }

                  if (
                    filters.dueDateFrom &&
                    filters.dueDateTo &&
                    new Date(filters.dueDateFrom) > new Date(filters.dueDateTo)
                  ) {
                    toast.error(AppValidationMessages.FILTER.INVALID_DUE_DATE);
                    return;
                  }

                  setShowFilter(false);
                }}
              />
            </div>
          )}
          {(() => {
            return (
              <table className="table-fixed w-full">
                <thead className="text-[12px] bg-[#4C6993] text-white text-left ">
                  <tr>
                    {[
                      "Assignment ID",
                      "Assigned By",
                      "Course",
                      "Level",
                      "Assignemnt Name",
                      "Class Type",
                      "Assigned Date",
                      "Due Date",
                      "Status",
                      "Action",
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
                  {studentsToDisplay.map((assignment, index) => {
                    const displayStatus = getDisplayStatus(assignment);
                    const isNotAssigned = displayStatus === "Pending";
                    const isCompleted = displayStatus === "Completed";
                    const isAssigned = displayStatus === "Assigned";

                    // 🛠 Fix: Extract nested ternary condition
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
                          {assignment.assignedTeacher}
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
                          {assignment.assignedDate
                            ? new Date(
                                assignment.assignedDate,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                        <td className="px-3 py-4 break-words text-[11px]">
                          {assignment.dueDate
                            ? new Date(assignment.dueDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric",
                                },
                              )
                            : "-"}
                        </td>
                        <td className="px-3 py-4 break-words text-[11px]">
                          <span
                            className={`py-1 px-2 rounded-md text-[10px] font-semibold flex items-center justify-center min-w-[80px] ${getStatusStyle(displayStatus)}`}
                          >
                            {displayStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center relative text-[11px]">
                          {(() => {
                            let buttonClass =
                              "text-gray-500 hover:text-gray-700 dark:text-[#ffff] ";
                            const canOpenMenu = isAssigned || isCompleted;
                            if (!canOpenMenu) {
                              buttonClass += "opacity-40 cursor-not-allowed";
                            }
                            const handleClick = () => {
                              if (canOpenMenu) {
                                toggleDropdown(assignment._id);
                              }
                            };
                            const isButtonDisabled = !canOpenMenu;
                            return (
                              <button
                                className={buttonClass}
                                onClick={handleClick}
                                disabled={isButtonDisabled}
                              >
                                <BsThreeDotsVertical />
                              </button>
                            );
                          })()}
                          {openDropdownId === assignment._id && isAssigned && (
                            <div className="absolute right-0 w-40 p-2 shadow-2xl space-y-2 bg-white rounded-md z-50 border border-gray-200 dark:bg-[#343434]">
                              <button
                                className="block w-full px-4 py-1 text-[11px] text-black dark:text-[#ffff]"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  console.log(
                                    "Start Assignment clicked, assignmentId:",
                                    assignment.assignmentId,
                                  ); // <-- log assignmentId
                                  router.push(
                                    `/modules/users/student/ui/startassignment?assignmentId=${assignment.assignmentId}`,
                                  );
                                }}
                              >
                                Start Assignment
                              </button>
                              <button
                                className="block w-full px-4 py-1 text-[11px] text-black dark:text-[#ffff]"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  router.push(
                                    `/modules/users/student/ui/assignmentlist?assignmentId=${assignment.assignmentId}`,
                                  );
                                }}
                              >
                                View List
                              </button>
                              <button
                                className="block w-full px-4 py-1 text-[11px] dark:text-[#ffff]"
                                onClick={() => setOpenDropdownId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          {openDropdownId === assignment._id && isCompleted && (
                            <div className="absolute right-0 w-32 p-2 shadow-2xl space-y-2 bg-white rounded-md z-50 border border-gray-200 dark:bg-[#343434]">
                              <button
                                className="block w-full px-4 py-1 text-[11px] text-black dark:text-[#ffff]"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  router.push(
                                    `/modules/users/student/ui/assignmentlist?assignmentId=${assignment.assignmentId}`,
                                  );
                                }}
                              >
                                View List
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
        <div className="flex justify-end">
          <button
            className=" mt-4 text-[#576CBC] border border-[#576CBC] bg-[#fff] rounded-md px-4 py-1 text-sm font-medium hover:bg-[#dbe2f3] transition duration-200 dark:bg-[#2E3343]"
            onClick={() => {
              router.push("/modules/users/student/ui/allassignment");
            }}
          >
            View All
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
