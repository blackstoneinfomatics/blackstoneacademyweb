'use client';
import { MdTune } from "react-icons/md";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation"; // Import useSearchParams
import BaseLayout2 from "@/app/(tenant)/modules/users/student/components/BaseLayout2";
import AdminHeader from "../../components/AdminHeader";
import Pagination from "@/components/Pagination";
import BaseLayout4 from "../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";
// Interfaces
interface Assignment {
  _id?: string;
  assignmentId: string;
  assignedTeacher: string;
  course: string;
  level: string;
  title: string;
  sessionClassType: string;
  assignedDate?: string;
  dueDate?: string;
  assignmentStatus: string;
  questions?: any[]; 
}

type AssignmentType = Assignment; 

interface AssignmentFilters {
  assignmentName: string;
  course: string;
  level: string;
  classType: string;
  assignedDateFrom: string;
  assignedDateTo: string;
  dueDateFrom: string;
  dueDateTo: string;
  status: string; // Added status property
}

const mapStatus = (status: string) => {
  return status; 
};

const StudentClassAssignmentsPage = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filters, setFilters] = useState<AssignmentFilters>({
    assignmentName: "",
    course: "",
    level: "",
    classType: "",
    assignedDateFrom: "",
    assignedDateTo: "",
    dueDateFrom: "",
    dueDateTo: "",
    status: "", // Initialize status
  });
  const [studentId, setStudentId] = useState<string>("");
  const [searchAssignment, setSearchAssignment] = useState(""); 
  const [isAssignmentFilterModalOpen, setIsAssignmentFilterModalOpen] = useState(false); // For Assignments tab filter modal
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const searchParams = useSearchParams(); // Initialize searchParams

  useEffect(() => {
    const urlStudentId = searchParams.get("studentId");
    if (urlStudentId) {
      setStudentId(urlStudentId);
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchAssignments = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("AdminAuthToken");

        if (!token || !studentId) {
          toast.error(AppValidationMessages.DATA_FETCH.MISSING_CREDENTIALS);
          return;
        }

        const res = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ASSIGNMENT.GET_STUDENT_ASSIGNMENTS}?studentId=${studentId}`, { // Use the studentId state
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch assignments");
        const data = await res.json();
        console.log("Fetched Assignments Data:", data); // Log the fetched data

        // Ensure that the data is being set correctly
        setAssignments(data.data.sort((a: AssignmentType, b: AssignmentType) => {
          const dateA = a.assignedDate ? new Date(a.assignedDate).getTime() : 0;
          const dateB = b.assignedDate ? new Date(b.assignedDate).getTime() : 0;
          return dateB - dateA;
        }) || []); // Set the assignments data
      } catch (err: any) {
        setError(err.message || "Error fetching assignments");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) { // Only fetch if studentId is available
      fetchAssignments();
    }
  }, [studentId]); // Depend on studentId to re-fetch when it changes

 
  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("AdminAuthToken");

  // Calculate the display range
        if (!token || !studentId) {
          toast.error(AppValidationMessages.DATA_FETCH.MISSING_CREDENTIALS);
          return;
        }

        const res = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ASSIGNMENT.GET_STUDENT_ASSIGNMENTS}?studentId=${studentId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch assignments");
        const data = await res.json();
        console.log("Fetched Assignments Data:", data); // Log the fetched data

        // Ensure that the data is being set correctly
        setAssignments(data.data.sort((a: AssignmentType, b: AssignmentType) => {
          const dateA = a.assignedDate ? new Date(a.assignedDate).getTime() : 0;
          const dateB = b.assignedDate ? new Date(b.assignedDate).getTime() : 0;
          return dateB - dateA;
        }) || []); // Set the assignments data
      } catch (err: any) {
        setError(err.message || "Error fetching assignments");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [studentId]); // Ensure studentId is in the dependency array

  // Filter assignments based on current filters
  const filterAssignments = (data: Assignment[]) => {
    return data.filter((a) => {

      if (
        filters.assignmentName &&
        !a.title.toLowerCase().includes(filters.assignmentName.toLowerCase())
      ) return false;

      if (
        filters.course &&
        !a.course.toLowerCase().includes(filters.course.toLowerCase())
      ) return false;

      if (
        filters.level &&
        !a.level.toLowerCase().includes(filters.level.toLowerCase())
      ) return false;

      if (
        filters.classType &&
        a.sessionClassType !== filters.classType
      ) return false;

      if (
        filters.status &&
        mapStatus(a.assignmentStatus) !== filters.status
      ) return false;

      if (filters.assignedDateFrom && a.assignedDate) {
        if (new Date(a.assignedDate) < new Date(filters.assignedDateFrom)) return false;
      }

      if (filters.assignedDateTo && a.assignedDate) {
        const to = new Date(filters.assignedDateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(a.assignedDate) > to) return false;
      }

      if (filters.dueDateFrom && a.dueDate) {
        if (new Date(a.dueDate) < new Date(filters.dueDateFrom)) return false;
      }

      if (filters.dueDateTo && a.dueDate) {
        const to = new Date(filters.dueDateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(a.dueDate) > to) return false;
      }

      return true;
    });
  };


 const finalFilteredAssignments = useMemo(() => {
    const modalFiltered = filterAssignments(assignments);

    if (!searchAssignment) return modalFiltered;

    const term = searchAssignment.toLowerCase();

    return modalFiltered.filter((a) =>
      [
        a.assignmentId,
        a.assignedTeacher,
        a.course,
        a.level,
        a.title,
        a.sessionClassType,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [assignments, filters, searchAssignment]);


  const handleFilterChange = (key: keyof AssignmentFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      assignmentName: "",
      course: "",
      level: "",
      classType: "",
      assignedDateFrom: "",
      assignedDateTo: "",
      dueDateFrom: "",
      dueDateTo: "",
      status: "",
    });
    setIsAssignmentFilterModalOpen(false);
  };

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
return (
    <BaseLayout4>
    <AdminHeader currentSection="Student Class Assignments" showBackPath={`/modules/users/admin-main/ui/studentlist?studentId=${studentId}`} showBackButton/>
<div className="">
<div className="rounded-xl overflow-hidden">
  <div className="flex flex-row sm:flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
    <input
      type="text"
      placeholder="Search"
      className="bg-transparent outline-none text-[12px] w-32 py-3"
      value={searchAssignment}
      onChange={(e) => {
        setSearchAssignment(e.target.value);
      }}
    />
    
    <div
      className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 cursor-pointer"
      onClick={() => setIsAssignmentFilterModalOpen(true)} // Open filter modal on click
    >
      <MdTune className="w-4 h-4" />
      <span>Filter</span>
    </div>
    <span className="text-[12px] text-gray-400 dark:text-gray-400 py-3">
          Showing {finalFilteredAssignments.length} of {assignments.length}
    </span>
  </div>
  <div className="overflow-x-auto max-h-none">
    <table className="table-fixed w-full">
      <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
        <tr className="font-medium">
          {[
            "Assignment ID",
            "Assigned By",
            "Course",
            "Level",
            "Assignment Name",
            "Class Type",
            "Assigned Date",
            "Due Date",
            "Status"
          ].map((header, idx) => (
            <th
              key={idx}
              className="p-4 font-semibold text-[12px] text-left border border-[#4C6993]"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="text-[10px] text-[#1D2939]">
                 {finalFilteredAssignments.map((assignment, index) => (

            <tr key={assignment._id || index} className={`text-left dark:text-white ${index % 2 === 0 ? "bg-[#fff] dark:bg-[#2C2C2C]" : "bg-[#F8F8F8] dark:bg-[#303030]"}`}>
              <td className="p-3">{assignment.assignmentId}</td>
              <td className="p-3">{assignment.assignedTeacher}</td>
              <td className="p-3">{assignment.course}</td>
              <td className="p-3">{assignment.level}</td>
              <td className="p-3">{assignment.title}</td>
              <td className="p-3">{assignment.sessionClassType}</td>
              <td className="p-3">{assignment.assignedDate ? new Date(assignment.assignedDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "-"}</td>
              <td className="p-3">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "-"}</td>
              <td className="p-3">
                <span className={`py-2 px-2 rounded-md text-[8px] flex items-center justify-center min-w-[80px] ${getStatusStyle(mapStatus(assignment.assignmentStatus))}`}>
                  {mapStatus(assignment.assignmentStatus)}
                </span>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={9} className="p-4 text-center">
              No data available
            </td>
          </tr>
        </tbody>
    </table>
   <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(finalFilteredAssignments.length / itemsPerPage)}
        onPageChange={setCurrentPage}
      />  </div>
</div>

{/* Filter Modal for Assignments */}
{isAssignmentFilterModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-30">
    <div className="bg-white p-6 rounded-xl w-[400px] relative dark:bg-[#252525] shadow-xl">
      <button
        className="absolute top-4 right-4 text-gray-400 text-2xl"
        onClick={() => setIsAssignmentFilterModalOpen(false)}
      >
        &times;
      </button>
      <h2 className="text-lg font-semibold mb-6 dark:text-white">Filter by</h2>
      
      <div className="mb-4">
        <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Assignment Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded text-xs dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]"
          value={filters.assignmentName}
          onChange={(e) => handleFilterChange('assignmentName', e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Course</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded text-xs dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]"
          value={filters.course}
          onChange={(e) => handleFilterChange('course', e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Level</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded text-xs dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]"
          value={filters.level}
          onChange={(e) => handleFilterChange('level', e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Class Type</label>
        <select
          className="w-full px-3 py-2 border rounded text-xs dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]"
          value={filters.classType} // Assuming you have a classType in your filters state
          onChange={(e) => handleFilterChange('classType', e.target.value)}
        >
          <option value="REGULARCLASS">Regular Class</option>
          <option value="GROUPCLASS">Group Class</option>
          {/* Add more class type options as needed */}
        </select>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Assigned Date</label>
        <div className="flex gap-2">
          <input
            type="date"
            className="w-full border rounded-md p-2 text-sm dark:bg-[#343434] dark:text-white dark:border-[#5C5C5C]"
            value={filters.assignedDateFrom}
            onChange={(e) => handleFilterChange('assignedDateFrom', e.target.value)}
          />
          <input
            type="date"
            className="w-full border rounded-md p-2 text-sm dark:bg-[#343434] dark:text-white dark:border-[#5C5C5C]"
            value={filters.assignedDateTo}
            onChange={(e) => handleFilterChange('assignedDateTo', e.target.value)}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Due Date</label>
        <div className="flex gap-2">
          <input
            type="date"
            className="w-full border rounded-md p-2 text-sm dark:bg-[#343434] dark:text-white dark:border-[#5C5C5C]"
            value={filters.dueDateFrom}
            onChange={(e) => handleFilterChange('dueDateFrom', e.target.value)}
          />
          <input
            type="date"
            className="w-full border rounded-md p-2 text-sm dark:bg-[#343434] dark:text-white dark:border-[#5C5C5C]"
            value={filters.dueDateTo}
            onChange={(e) => handleFilterChange('dueDateTo', e.target.value)}
          />
        </div>
      </div>



      <div className="flex justify-end gap-3">
        <button
          onClick={resetFilters}
          className="px-4 py-1 rounded-md border border-[#576CBC] text-[#576CBC] font-medium"
        >
          Reset
        </button>
        <button
          className="px-4 py-1 rounded-md bg-[#576CBC] text-white font-medium"
          onClick={() => {
            setIsAssignmentFilterModalOpen(false);
            // Apply filters logic here
          }}
        >
          Apply Filters
        </button>
      </div>
    </div>
  </div>
)}
</div>
</BaseLayout4>
);
};

export default StudentClassAssignmentsPage;