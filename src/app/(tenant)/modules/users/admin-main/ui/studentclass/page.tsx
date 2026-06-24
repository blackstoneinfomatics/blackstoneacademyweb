"use client";
import Modal from "react-modal"; // Ensure you have this import
import AdminHeader from "../../components/AdminHeader";
import { useEffect, useState } from "react";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import Pagination from "@/components/Pagination";
import BaseLayout4 from "../../components/BaseLayout4";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface ClassSchedule {
  _id: string;
  classId: string;
  student: {
    studentId: string;
    studentFirstName: string;
    studentLastName: string;
    studentEmail: string;
    gender: string;
  };
  teacher: {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
  };
  course: {
    courseId: string;
    courseName: string;
  };
  package: string;
  startDate: string;
  endDate: string;
  startTime: string[];
  endTime: string[];
  scheduleStatus: string;
  status: string;
}

export default function StudentClassPage({ searchParams }: { searchParams: { studentId: string } }) {
  const studentId = searchParams.studentId;
  const [classData, setClassData] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [meetingFilters, setMeetingFilters] = useState({
    teacher: "",
    course: "",
    status: "",
    fromDate: "",
    toDate: "",
    startTime: "",
    endTime: "",
  });



  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchClassSchedule() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("AdminAuthToken");
        if (!token) {
          setError(AppValidationMessages.AUTH.TOKEN_REQUIRED);
          setLoading(false);
          return;
        }
        const res = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET_CLASSSHEDULE_STUDENTS}?studentId=${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
        if (!res.ok) {
          setError("API error: " + (data?.message || res.status));
          setLoading(false);
          return;
        }
        const sortedData = (data.classSchedule || []).sort((a: ClassSchedule, b: ClassSchedule) => {
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        });
        setClassData(sortedData);
      } catch (err: any) {
        setError("Failed to fetch class schedule");
      } finally {
        setLoading(false);
      }
    }
    if (studentId) fetchClassSchedule();
  }, [studentId]);

  // Filtered and paginated data
  const filteredClassData = classData.filter((row) => {
    const search = searchQuery.toLowerCase();

    // Format the date to match the search query in "Month Day, Year" format
    const formattedDate = new Date(row.startDate).toLocaleString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    }).toLowerCase(); // Ensure the date is in lowercase for comparison

    const matchesSearch =
      row._id.toLowerCase().includes(search) || // Match Class ID
      row.student?.studentFirstName?.toLowerCase().includes(search) || // Match Student First Name
      row.teacher?.teacherName?.toLowerCase().includes(search) || // Match Teacher Name
      row.course?.courseName?.toLowerCase().includes(search) || // Match Course Name
      formattedDate.includes(search) || // Match Date
      row.startTime[0].includes(search); // Match Start Time

    const matchesTeacher = meetingFilters.teacher
      ? row.teacher?.teacherName.toLowerCase().includes(meetingFilters.teacher.toLowerCase())
      : true;

    const matchesCourse = meetingFilters.course
      ? row.course?.courseName.toLowerCase().includes(meetingFilters.course.toLowerCase())
      : true;

    const matchesStatus = meetingFilters.status
      ? row.scheduleStatus === meetingFilters.status
      : true;

    const matchesStartDate = meetingFilters.fromDate
      ? new Date(row.startDate) >= new Date(meetingFilters.fromDate)
      : true;

    const matchesEndDate = meetingFilters.toDate
      ? new Date(row.startDate) <= new Date(meetingFilters.toDate)
      : true;

    const matchesStartTime = meetingFilters.startTime
      ? row.startTime[0] >= meetingFilters.startTime
      : true;

    const matchesEndTime = meetingFilters.endTime
      ? row.endTime[0] <= meetingFilters.endTime
      : true;

    return (
      matchesSearch &&
      matchesTeacher &&
      matchesCourse &&
      matchesStatus &&
      matchesStartDate &&
      matchesEndDate &&
      matchesStartTime &&
      matchesEndTime
    );
  });

  const totalPages = Math.ceil(filteredClassData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedClassData = filteredClassData.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-[#ECFDF3] dark:bg-[#2E3C2E] dark:text-[#377E36] text-[#377E36]";
      case "Cancelled":
        return "bg-red-100 text-red-500 border-red-500 border rounded-lg";
      case "Rescheduled":
        return "bg-[#ececfd] text-[#002c5f] dark:bg-[#2e333c] dark:text-[#fff]";
      case "Scheduled":
        return "bg-[#ECFDF3] dark:bg-[#2E3C2E] dark:text-[#235522] text-[#235522]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleApplyMeetingFilters = () => {
    setCurrentPage(1); // Reset to first page on filter apply
    setIsFilterModalOpen(false); // Close the modal
  };

  const handleResetMeetingFilters = () => {
    setMeetingFilters({
      teacher: "",
      course: "",
      status: "",
      fromDate: "",
      toDate: "",
      startTime: "",
      endTime: "",
    });
    setIsFilterModalOpen(false); // Close the modal
  };

  return (
    <BaseLayout4>
      <AdminHeader currentSection="Student Class" showBackPath={`/modules/users/admin-main/ui/studentlist?studentId=${studentId}`} showBackButton />
      <div>
        <div className="rounded-lg overflow-hidden">
          <div className="flex flex-row sm:flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none text-[12px] w-32 py-3"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            <div className="relative">
              <div
                className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-3 border-r-2 border-l-2 px-48 cursor-pointer"
                onClick={() => setIsFilterModalOpen(true)}
              >
                <MdTune className="w-4 h-4" />
                <span>Filter</span>
              </div>
            </div>
            <span className="text-[12px] text-gray-400 dark:text-gray-400 py-3">
              Showing {filteredClassData.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredClassData.length)} of {filteredClassData.length}
            </span>
          </div>
          <div className="overflow-x-auto max-h-none">
            <table
              className="w-full min-w-[900px] text-sm text-left table-auto"
              style={{ width: "100%", tableLayout: "fixed" }}
            >
              <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                <tr className="font-medium">
                  <th className="p-3 font-semibold text-[12px] text-left">Class ID</th>
                  <th className="p-3 font-semibold text-[12px] text-left">Teacher Name</th>
                  <th className="p-3 font-semibold text-[12px] text-left">Course Name</th>
                  <th className="p-3 font-semibold text-[12px] text-left">Date</th>
                  <th className="p-3 font-semibold text-[12px] text-left">Time</th>
                  <th className="p-3 font-semibold text-[12px] text-left">Status</th>
                </tr>
              </thead>
              <tbody className="text-[10px] text-[#1D2939]">
                {error ? (
                  <tr><td colSpan={7} className="p-4 text-center text-red-500">{error}</td></tr>
                ) : paginatedClassData.length > 0 ? (
                  paginatedClassData.map((row, index) => (
                    <tr
                      key={row._id}
                      className={`text-center dark:text-white ${index % 2 === 0
                          ? "bg-[#fff] dark:bg-[#2C2C2C]"
                          : "bg-[#F8F8F8] dark:bg-[#303030]"
                        }`}
                    >
                      <td className="p-3 text-left">{row.classId}</td>
                      <td className="p-3 text-left">{row.teacher?.teacherName}</td>
                      <td className="p-3 text-left">{row.course?.courseName}</td>
                      <td className="p-3 text-left">{new Date(row.startDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "2-digit" })}</td>
                      <td className="p-3 text-left">{row.startTime?.[0]} - {row.endTime?.[0]}</td>
                      <td className="p-3 text-left">
                        <span className={`px-3 py-1 rounded-md text-[10px] font-medium ${getStatusColor(row.scheduleStatus)}`}>
                          {row.scheduleStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-4 text-center">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-end">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Filter Modal */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-30">
            <div className="bg-white p-6 rounded-xl w-[400px] relative dark:bg-[#252525] shadow-xl">
              <button
                className="absolute top-4 right-4 text-gray-400 text-2xl"
                onClick={() => setIsFilterModalOpen(false)}
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
                <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">
                  Course
                </label>

                <select
                  className="w-full px-3 py-2 border rounded text-xs dark:text-white dark:border-[#5C5C5C] dark:bg-[#343434]"
                  value={meetingFilters.course}
                  onChange={(e) =>
                    setMeetingFilters({ ...meetingFilters, course: e.target.value })
                  }
                >
                  <option value="">Select Course</option>
                  <option value="Quran">Quran</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Islamic Studies	">Islamic Studies	</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Date</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="w-1/2 border rounded-md p-2 text-sm dark:bg-[#343434] dark:text-white dark:border-[#5C5C5C]"
                    value={meetingFilters.fromDate}
                    onChange={(e) => setMeetingFilters({ ...meetingFilters, fromDate: e.target.value })}
                  />
                  <input
                    type="date"
                    className="w-1/2 border rounded-md p-2 text-sm dark:bg-[#343434] dark:text-white dark:border-[#5C5C5C]"
                    value={meetingFilters.toDate}
                    onChange={(e) => setMeetingFilters({ ...meetingFilters, toDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium mb-1 dark:text-[#D6D6D6]">Start Time</label>
                <input
                  type="time"
                  className="w-full border rounded-md p-2 text-sm dark:bg-[#343434] dark:text-white dark:border-[#5C5C5C]"
                  value={meetingFilters.startTime}
                  onChange={(e) => setMeetingFilters({ ...meetingFilters, startTime: e.target.value })}
                />
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium mb-1 dark:text-[#D6D6D6]">Status</label>
                <select
                  className="w-full border rounded-md p-2 text-[12px] dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]"
                  value={meetingFilters.status}
                  onChange={(e) => setMeetingFilters({ ...meetingFilters, status: e.target.value })}
                >
                  <option value="">Select status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Rescheduled">Rescheduled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleResetMeetingFilters}
                  className="px-4 py-1 rounded-md border border-[#576CBC] text-[#576CBC] font-medium"
                >
                  Reset
                </button>
                <button
                  className="px-4 py-1 rounded-md bg-[#576CBC] text-white font-medium"
                  onClick={handleApplyMeetingFilters}
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
}
