"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import Modal from "react-modal";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

export interface StudentClassData {
  _id: string;
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
  classDay: string[];
  package: string;
  totalHourse: number;
  startDate: string;
  endDate: string;
  startTime: string[];
  endTime: string[];
  scheduleStatus: string;
  classLink: string;
  status: string;
  createdBy: string;
  sessionClassType: string;
  sessionStarttime: string;
  sessionsEndtime: string;
  createdDate: string;
  lastUpdatedDate: string;
  __v: number;
}

export interface StudentClassApiResponse {
  students: StudentClassData[];
}

const SalaryCard = () => {
  const [classData, setClassData] = useState<StudentClassData[]>([]);
  const [activeTab, setActiveTab] = useState("Upcoming");

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredClasses, setFilteredClasses] = useState<StudentClassData[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    studentName: "",
    courseName: "",
    teacherName: "",
    sessionClassType: "",
    fromDate: "",
    toDate: "",
    scheduleStatus: "",
  });
  const handleView = () => {
    router.push("/modules/users/admin-main/ui/schedulelistviewall");
  };
  const router = useRouter();
  const now = new Date();
  const completedData = classData
    .filter(cls => {
      const endDate = new Date(cls.endDate);
      return (
        ["Completed", "BothAbsent", "StudentAbsent", "TeacherAbsent"].includes(cls.scheduleStatus) &&
        endDate < now
      );
    })
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()); // descending


  const upcomingData = classData
    .filter(cls => {
      const endDate = new Date(cls.endDate);
      return (
        ["Scheduled", "Rescheduled", "Reschedulerequested"].includes(cls.scheduleStatus) &&
        endDate >= now
      );
    })
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()); // descending

  const baseTabData = activeTab === "Upcoming" ? upcomingData : completedData;

  const studentNames = Array.from(
    new Set(
      classData.map(
        (c) => `${c.student.studentFirstName} ${c.student.studentLastName}`
      )
    )
  );
  const courseNames = Array.from(
    new Set(classData.map((c) => c.course.courseName))
  );
  const teacherNames = Array.from(
    new Set(classData.map((c) => c.teacher?.teacherName).filter(Boolean))
  );


  useEffect(() => {
    const fetchClassData = async (token: string) => {
      try {
        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data: StudentClassApiResponse = await response.json();
        setClassData(data.students || []);
      } catch (error) {
        console.error("Error fetching class data:", error);
      }
    };

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("AdminAuthToken");
      if (token) {
        fetchClassData(token);
      }
    }
  }, []);

  useEffect(() => {
    setFilteredClasses(baseTabData);
  }, [classData, activeTab]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const lowerQuery = query.toLowerCase();

    const filtered = baseTabData.filter((item) => {
      const combined = [
        item._id,
        item.student.studentFirstName,
        item.student.studentLastName,
        item.student.studentEmail,
        item.course.courseName,
        item.teacher.teacherName,
        item.package,
        item.status,
        item.scheduleStatus,
        item.startDate,
        item.endDate,
        ...(item.startTime || []),
        ...(item.endTime || []),
      ]
        .join(" ")
        .toLowerCase();
      return combined.includes(lowerQuery);
    });
    setFilteredClasses(filtered);
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    const from = filters.fromDate ? new Date(filters.fromDate) : null;
    const to = filters.toDate ? new Date(filters.toDate) : null;
    const filtered = baseTabData.filter((item) => {
      const fullName = `${item.student.studentFirstName} ${item.student.studentLastName}`;
      const start = new Date(item.startDate);
      return (
        (!filters.studentName || fullName === filters.studentName) &&
        (!filters.courseName ||
          item.course.courseName === filters.courseName) &&
        (!filters.teacherName ||
          item.teacher?.teacherName === filters.teacherName) &&
        (!filters.sessionClassType ||
          item.sessionClassType === filters.sessionClassType) &&
        (!filters.scheduleStatus ||
          item.scheduleStatus === filters.scheduleStatus) &&
        (!from || start >= from) &&
        (!to || start <= to)
      );
    });

    setFilteredClasses(filtered);
    setIsFilterModalOpen(false);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      studentName: "",
      courseName: "",
      teacherName: "",
      sessionClassType: "",
      fromDate: "",
      toDate: "",
      scheduleStatus: "",
    });

    setFilteredClasses(baseTabData);
    setCurrentPage(1);
  };

  const paginatedCourseData = filteredClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);

  return (
    <div className="md:p-0 mt-4 mx-auto">
      <div className="h-full w-full flex flex-col justify-between">
        <div className="p-0 justify-between flex flex-col">
          <div className="flex space-x-6 px-4 py-2 rounded-md">
            <button
              onClick={() => setActiveTab("Upcoming")}
              className={`relative text-[14px] transition font-medium ${activeTab === "upcoming"
                  ? "text-[#576CBC] font-semibold"
                  : "text-[#0A0A12] dark:text-[#fff] opacity-80"
                }`}
            >
              Scheduled ({upcomingData.length})
              {activeTab === "Upcoming" && (
                <span className="absolute left-0 ml-5 -bottom-1 w-[60px] h-[2px] rounded-full bg-[#576CBC]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`relative text-[14px] transition font-medium ${activeTab === "completed"
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
            <div className="w-full h-11 bg-[#FAFAFB] dark:bg-[#343434]  dark:text-[#fff] rounded-t-lg flex justify-between items-center px-4 py-0">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by keyword"
                  className="bg-transparent outline-none text-sm w-52 py-3"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
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
                <span className="text-left -ml-60">
                  Showing {paginatedCourseData.length} Of{" "}
                  {filteredClasses.length}
                </span>
              </div>
            </div>
            {/* Table */}
            <div className="overflow-x-auto scrollbar-none bg-[#FAFAFB] dark:bg-[#343434]">
              <table
                className="w-full table-auto border-collapse bg-[#FAFAFB] dark:bg-[#343434] dark:text-[#fff] text-black text-[13px]"
                style={{ tableLayout: "fixed" }}
              >
                <thead className="text-[12px] bg-[#4C6993] text-white">
                  <tr className="">
                    <th className="text-left px-4 py-3 w-[140px]">Class ID</th>
                    <th className="text-left px-4 py-3 w-[140px]">Student ID</th>
                    <th className="text-left px-4 py-3 w-[180px]">
                      Student Name
                    </th>
                    <th className="text-left px-4 py-3 w-[150px]">
                      Teacher Name
                    </th>
                    <th className="text-left px-4 py-3 w-[150px]">Courses</th>
                    <th className="text-left px-4 py-3 w-[160px]">Class</th>
                    <th className="text-left px-4 py-3 w-[160px]">Date</th>
                    <th className="text-left px-4 py-3 w-[150px]">Scheduled status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCourseData.map((row, index) => (
                    <tr
                      key={row._id}
                      className={`text-[12px] ${index % 2 === 0
                          ? "bg-[#fff] dark:bg-[#2C2C2C]"
                          : "bg-[#F8F8F8] dark:bg-[#303030]"
                        }`}
                    >
                      <td className="px-3 py-3 text-[11px]  text-left break-words whitespace-normal">
                        {row.classLink}
                      </td>
                      <td className="px-3 py-3 text-[11px]  text-left break-words whitespace-normal">
                        {row.student.studentId}
                      </td>
                      <td className="  px-3 py-2 text-left  break-words whitespace-normal">
                        {row.student.studentFirstName}
                      </td>
                      <td className="  px-3 py-2 text-left  break-words whitespace-normal">
                        {row.teacher.teacherName}
                      </td>
                      <td className="px-3 py-3 text-left  break-words whitespace-normal">
                        {row.course.courseName}
                      </td>
                      <td className="px-3 py-3 text-left  break-words whitespace-normal">
                        {row.sessionClassType}
                      </td>
                      <td className="px-3 py-3 text-left break-words whitespace-normal">
                        {new Date(row.startDate).toString() !== "Invalid Date"
                          ? new Date(row.startDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                          : ""}
                      </td>

                      <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] w-[180px] break-words whitespace-normal">
                        <span
                          className={`px-3 py-2 font-semibold text-[11px] text-center  rounded-md ${row.scheduleStatus === "Scheduled"
                              ? "bg-[#ECFDF3] text-[#377E36] dark:bg-[#377E3633]"
                              : row.scheduleStatus === "Rescheduled"
                                ? "bg-[#E4E4E4] text-[#343E59] dark:bg-[#DEDEDE]/20 dark:text-[#DEDEDE]"
                                : "bg-[#ECFDF3] text-[#377E36] dark:bg-[#377E3633]"
                            }`}
                        >
                          {row.scheduleStatus || "UNKNOWN"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex justify-end">
              <button
                className="text-[#576CBC] mt-3 text-[12px] bg-[#576CBC]/10 cursor-pointer rounded-md border-[#576CBC] px-3 py-2 "
                onClick={handleView}
              >
                View all
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onRequestClose={() => setIsFilterModalOpen(false)}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 rounded-xl bg-white dark:bg-[#343434] w-[650px]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-40"
      >
        <h2 className="text-lg font-semibold mb-4 text-[#2D2D2D] dark:text-white">Filter by</h2>

        <div className="space-y-4 mb-6">
          {/* Student Section */}
          <div>
            <h3 className="text-sm font-medium text-[#444] dark:text-white mb-2">Select Student</h3>
            <select
              value={filters.studentName}
              onChange={(e) => setFilters({ ...filters, studentName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-[#343434] dark:text-white text-[#5C5C5C] dark:border-[#5C5C5C]"
            >
              <option value="">Select Student</option>
              {studentNames.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Course Section */}
          <div>
            <h3 className="text-sm font-medium text-[#444] dark:text-white mb-2">Select Course</h3>
            <select
              value={filters.courseName}
              onChange={(e) => setFilters({ ...filters, courseName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-[#343434] dark:text-white text-[#5C5C5C] dark:border-[#5C5C5C]"
            >
              <option value="">Select Course</option>
              {courseNames.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Files by Student Section */}
          <div>
            <h3 className="text-sm font-medium text-[#444] dark:text-white mb-2">Files by Student</h3>
            <select
              value={filters.teacherName}
              onChange={(e) => setFilters({ ...filters, teacherName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-[#343434] dark:text-white text-[#5C5C5C] dark:border-[#5C5C5C]"
            >
              <option value="">Select Student</option>
              {teacherNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* From Date Section */}
          <div>
            <h3 className="text-sm font-medium text-[#444] dark:text-white mb-2">From Date</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-[#343434] dark:text-white text-[#5C5C5C] dark:border-[#5C5C5C]"
                placeholder="dd-mm-yyyy"
              />
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-[#343434] dark:text-white text-[#5C5C5C] dark:border-[#5C5C5C]"
                placeholder="dd-mm-yyyy"
              />
            </div>
          </div>

          {/* Status Section */}
          <div>
            <h3 className="text-sm font-medium text-[#444] dark:text-white mb-2">Status</h3>
            <select
              value={filters.scheduleStatus}
              onChange={(e) => setFilters({ ...filters, scheduleStatus: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-[#343434] dark:text-white text-[#5C5C5C] dark:border-[#5C5C5C]"
            >
              <option value="">Select Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Rescheduled">Rescheduled</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-[#5C5C5C] dark:text-[#FDFDFD]">
            Showing {filteredClasses.length} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 border text-[#576CBC] border-[#576CBC] rounded"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-[#576CBC] text-white rounded"
            >
              Show results
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SalaryCard;
