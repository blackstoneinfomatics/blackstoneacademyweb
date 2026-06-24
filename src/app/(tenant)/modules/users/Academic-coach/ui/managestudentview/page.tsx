"use client";

import BaseLayout1 from "@/app/(tenant)/modules/users/Academic-coach/components/BaseLayout1";
import React, { useState, useRef, useEffect } from "react";
import { MdTune } from "react-icons/md";
import { MoreVertical, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/Pagination";
import AcademicHeader from "../../components/academicHeader";
import Modal from "react-modal";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface StudentDetails {
  studentDetails: {
    _id: string;
    username: string;
    password: string;
    role: string;
    status: string;
    createdDate: string;
    createdBy: string;
    updatedDate: string;
    __v: number;
    student: {
      studentId: string;
      studentEmail: string;
      studentPhone: number;
      course: string;
      package: string;
      city: string;
      country: string;
      gender: string;
    };
  };
  studentEvaluationDetails: {
    _id: string;
    academicCoachId: string;
    teacher: {
      teacherName: string;
    };
    student: {
      studentId: string;
      studentFirstName: string;
      studentLastName: string;
      studentEmail: string;
      studentGender: string;
      studentPhone: number;
      studentCity: string;
      studentCountry: string;
      studentCountryCode: string;
      learningInterest: string;
      numberOfStudents: number;
      preferredTeacher: string;
      preferredFromTime: string;
      preferredToTime: string;
      timeZone: string;
      referralSource: string;
      preferredDate: string;
      evaluationStatus: string;
      status: string;
      createdDate: string;
      createdBy: string;
    };
    classType: string;
    classDay: string[];
    startTime: string[];
    endTime: string[];
    isLanguageLevel: boolean;
    languageLevel: string;
    isReadingLevel: boolean;
    readingLevel: string;
    isGrammarLevel: boolean;
    grammarLevel: string;
    hours: number;
    subscription: {
      subscriptionId: string;
      subscriptionName: string;
      subscriptionPricePerHr: number;
      subscriptionDays: number;
      subscriptionStartDate: string;
      subscriptionEndDate: string;
    };
    planTotalPrice: number;
    classStartDate: string;
    classEndDate: string;
    classStartTime: string;
    classEndTime: string;
    accomplishmentTime: string;
    studentRate: number;
    gardianName: string;
    gardianEmail: string;
    gardianPhone: string;
    gardianCity: string;
    gardianCountry: string;
    gardianTimeZone: string;
    gardianLanguage: string;
    assignedTeacher: string;
    assignedTeacherId: string;
    assignedTeacherEmail: string;
    studentStatus: string;
    classStatus: string;
    comments: string;
    trialClassStatus: string;
    invoiceStatus: string;
    paymentLink: string;
    paymentStatus: string;
    status: string;
    createdDate: string;
    createdBy: string;
    updatedDate: string;
    updatedBy: string;
    expectedFinishingDate: number;
    __v: number;
    teacherStatus: string;
  };
}

interface ClassSchedule {
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
    courseName: string;
  };
  startDate: string;
  sessionClassType: string;
  endDate: string;
  startTime: string[];
  endTime: string[];
  scheduleStatus: string;
  status: string;
  classLink: string;
  createdBy: string;
  createdDate: string;
  lastUpdatedDate: string;
  amount: string;
  currency: string;
  classDay: string[];
  package: string;
}

type CardProps = {
  title: string;
  value: string | number;
  description: string;
};

interface StudentStats {
  totalAttendance: number;
  performance: number;
  package: string;
}

const Card = ({ title, value, description }: CardProps) => (
  <div className="bg-[#7689BD] rounded-lg shadow-md p-4">
    <div className="text-[20px] text-[#fff] font font-semibold mb-4">
      {title}
    </div>
    <div className="text-[14px] text-[#fff] font-semibold ">{value}</div>
    <div className="text-[12px] text-[#fff] ">{description}</div>
  </div>
);

const ManageStudentView = () => {
  const itemsPerPage = 5;
  const router = useRouter();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCompletedDetailsModalOpen, setIsCompletedDetailsModalOpen] = useState(false);
  const [selectedCompletedClass, setSelectedCompletedClass] = useState<ClassSchedule | null>(null);

  const [data, setData] = useState<StudentDetails | null>(null);
  const [scheduledClasses, setScheduledClasses] = useState<ClassSchedule[]>([]);
  const [completedClasses, setCompletedClasses] = useState<ClassSchedule[]>([]);
  const [unscheduledClasses, setUnscheduledClasses] = useState<ClassSchedule[]>([]);
  const [paginatedData, setPaginatedData] = useState<ClassSchedule[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"scheduled" | "completed" | "unscheduled">(
    "scheduled"
  );
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLTableCellElement | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [studentListWrite, setStudentListWrite] = useState(false);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);

  //Rolebyaccess
  useEffect(() => {
    const roleAccessRaw = localStorage.getItem("AcademicRolePermission");
    if (roleAccessRaw) {
      try {
        const roleAccess = JSON.parse(roleAccessRaw);
        const modules = roleAccess?.academicmodules || roleAccess;

        setStudentListWrite(modules?.managestudents?.write === true); // ✅ already present
      } catch (error) {
        console.error("Invalid AcademicRolePermission JSON", error);
      }
    }
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = paginatedData.slice(indexOfFirstItem, indexOfLastItem);

  const dataToShow =
    activeTab === "scheduled"
      ? scheduledClasses
      : activeTab === "completed"
      ? completedClasses
      : unscheduledClasses;

  const totalPages = Math.ceil(dataToShow.length / itemsPerPage);

  const handleSearch = (query: string) => {
    setSearchText(query);
    const queryLower = query.toLowerCase();

    const filtered = dataToShow.filter((item) => {
      const studentFullName = `${item.student?.studentFirstName || ""} ${
        item.student?.studentLastName || ""
      }`;
      const course = item.package || "";
      const date = new Date(item.startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });

      const time = `${item.startTime?.[0] || ""} - ${item.endTime?.[0] || ""}`;
      const status = item.scheduleStatus || "";
      const classType = "Group Class"; 

      const combinedText =
        `${studentFullName} ${course} ${date} ${time} ${status} ${classType}`.toLowerCase();

      return combinedText.includes(queryLower);
    });

    setPaginatedData(filtered.slice(0, itemsPerPage));
    setCurrentPage(1);
  };

  useEffect(() => {
    let filtered = dataToShow;

    if (searchText.trim() !== "") {
      const queryLower = searchText.toLowerCase();
      filtered = dataToShow.filter((item) => {
        const studentFullName = `${item.student?.studentFirstName || ""} ${
          item.student?.studentLastName || ""
        }`;
        const course = item.package || "";
        const date = new Date(item.startDate).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
        const time = `${item.startTime?.[0] || ""} - ${
          item.endTime?.[0] || ""
        }`;
        const status = item.scheduleStatus || "";
        const classType = "Group Class";

        const combinedText =
          `${studentFullName} ${course} ${date} ${time} ${status} ${classType}`.toLowerCase();
        return combinedText.includes(queryLower);
      });
    }

    const paginated = filtered.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    setPaginatedData(paginated);
  }, [dataToShow, currentPage, searchText]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AcademicCoachAuthToken")
          : null;

      if (!token) {
        console.error("❌ Academicoach not found");
        return;
      }
      const alstudentsId = localStorage.getItem("studentManageID");
      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.GET}/${alstudentsId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const json = await res.json();
      setData(json);
    };

    fetchData();
  }, []);

useEffect(() => {
  const alstudentsId = localStorage.getItem("studentManageID");
  const token = localStorage.getItem("AcademicCoachAuthToken"); 

  const fetchStudentStats = async () => {
    try {
      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.STUDENT_ATTENDANCE_PERFORMANCE}?studentId=${alstudentsId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,  
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch student stats");
      const stats = await res.json();
      setStudentStats(stats);
    } catch (error) {
      console.error("Error fetching student stats:", error);
    }
  };

  if (alstudentsId && token) {
    fetchStudentStats();
  }
}, []);

  useEffect(() => {
    const studentId =
      searchParams?.get("studentId") || localStorage.getItem("studentManageID");

    const fetchClassSchedule = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AcademicCoachAuthToken")
          : null;

      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return;
      }

      if (!studentId) {
        console.warn("No studentId found in query params or localStorage");
        return;
      }

      console.log("Fetching class schedule for studentId:", studentId);

      try {
        const res = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE. GET_CLASSSHEDULE_STUDENTS}?studentId=${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          console.error("Server responded with status:", res.status);
          return;
        }

        const data = await res.json();
        console.log("Fetched data from API:", data);

        const allSchedules: ClassSchedule[] = data.classSchedule;
         const sortedSchedules = [...allSchedules].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

        setScheduledClasses(
          sortedSchedules.filter(
            (c) =>
              c.scheduleStatus === "Scheduled" ||
              c.scheduleStatus === "Rescheduled" ||
              c.scheduleStatus === "Reschedulerequested"
          )
        );

        setCompletedClasses(
          sortedSchedules.filter((c) => c.scheduleStatus === "Completed" || c.scheduleStatus === "BothAbsent" || c.scheduleStatus === "TeacherAbsent" || c.scheduleStatus === "StudentAbsent" )
        );

        setUnscheduledClasses(
          sortedSchedules.filter((c) => c.scheduleStatus === "Unscheduled")
        );
      } catch (err) {
        console.error("Failed to fetch class schedule", err);
      }
    };

    fetchClassSchedule();
  }, [searchParams]);

  const toggleDropdown = (index: number) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };
  const toTitleCase = (value: string) => {
    if (!value) return value;
    return value
      .split(" ")
      .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1).toLowerCase() : part))
      .join(" ");
  };

  const handleReschedule = (_id: string, course: string) => {
    console.log("Navigating to reschedule page");
    router.push(`studentreschedule?id=${_id}&course=${course}`);

    setTimeout(() => {
      setActiveDropdown(null);
    }, 100);
  };

  const handleViewCompletedDetails = (classData: ClassSchedule) => {
    setSelectedCompletedClass(classData);
    setIsCompletedDetailsModalOpen(true);
  };
  const FilterModal = ({
    isOpen,
    onClose,
    onApplyFilters,
    users,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onApplyFilters: (filters: {
      studentName: string;
      course: string;
      Date: string;
      Time: string;
      classType: string;
      status: string;
    }) => void;
    users: ClassSchedule[];
  }) => {
    const [filters, setFilters] = useState({
      studentName: "",
      course: "",
      Date: "",
      Time: "",
      classType: "",
      status: "",
    });

    const handleApply = () => {
      onApplyFilters(filters);
      onClose();
    };

    const handleReset = () => {
      setFilters({
        studentName: "",
        course: "",
        Date: "",
        Time: "",
        classType: "",
        status: "",
      });
    };

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  p-8 rounded-lg  w-[500px]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="fixed inset-0 bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[320px] relative dark:bg-[#252525]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[16px] font-semibold text-gray-800 dark:text-white">
                Filter by
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 text-xl absolute top-4 right-4"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">
                  Student Name
                </label>
                <input
                  type="text"
                  value={filters.studentName}
                  onChange={(e) =>
                    setFilters({ ...filters, studentName: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded text-xs dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">
                  Course
                </label>
                <select
                  value={filters.course}
                  onChange={(e) =>
                    setFilters({ ...filters, course: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded text-xs dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white"
                >
                  <option value="">Select Course</option>
                  <option value="QURAN">Quran</option>
                  <option value="ARABIC">Arabic</option>
                  <option value="ISLAMIC STUDIES">Islamic Studies</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">
                  Date
                </label>
                <input
                  type="date"
                  value={filters.Date}
                  onChange={(e) =>
                    setFilters({ ...filters, Date: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded text-xs dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white dark:[color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">
                  Time
                </label>
                <input
                  type="time"
                  value={filters.Time}
                  onChange={(e) =>
                    setFilters({ ...filters, Time: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded text-xs dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white dark:[color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">
                  Class Type
                </label>
                <select
                  value={filters.classType}
                  onChange={(e) =>
                    setFilters({ ...filters, classType: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded text-xs dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white"
                >
                  <option value="">Select Class Type</option>
                  <option value="REGULAR">Regular Class</option>
                  <option value="GROUP">Group Class</option>
                  <option value="TRAIL">Trial Class</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded text-xs dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white"
                >
                  <option value="">Select Status</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="RESCHEDULED">Rescheduled</option>
                </select>
              </div>
              <div className="flex justify-between items-center pt-4 ">
                <button
                  onClick={handleReset}
                  className="px-3 py-1 text-[12px] rounded-md border border-[#576CBC] text-[#576CBC] font-medium hover:bg-[#EEF1FF] dark:hover:bg-[#343434]"
                >
                  Reset
                </button>
                <button
                  onClick={handleApply}
                  className="px-3 py-1 text-[12px] rounded-md bg-[#576CBC] text-white font-medium hover:bg-[#455bb1]"
                >
                 Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  const handleApplyFilters = (filters: {
    studentName: string;
    course: string;
    Date: string;
    Time: string;
    classType: string;
    status: string;
  }) => {
    const formatDate = (date: Date | string) =>
      new Date(date).toISOString().split("T")[0];

    let filtered =
      activeTab === "scheduled" ? [...scheduledClasses] : [...completedClasses];

    if (filters.studentName) {
      filtered = filtered.filter((user) =>
        `${user.student?.studentFirstName ?? ""} ${
          user.student?.studentLastName ?? ""
        }`
          .toLowerCase()
          .includes(filters.studentName.toLowerCase())
      );
    }

    if (filters.Date) {
      filtered = filtered.filter(
        (user) => formatDate(user.startDate) === filters.Date
      );
    }

    if (filters.status) {
      filtered = filtered.filter(
        (user) =>
          user.scheduleStatus?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.Time) {
      filtered = filtered.filter((user) =>
        user.startTime.includes(filters.Time)
      );
    }

    if (filters.course) {
      filtered = filtered.filter(
        (user) =>
          user.course.courseName?.toLowerCase() === filters.course.toLowerCase()
      );
    }

    if (filters.classType) {
      filtered = filtered.filter(
        (user) =>
          user.sessionClassType?.toLowerCase() ===
          filters.classType.toLowerCase()
      );
    }

    setPaginatedData(filtered);
    setCurrentPage(1); 
  };

  const CompletedClassDetailsModal = ({
    isOpen,
    onClose,
    classData,
  }: {
    isOpen: boolean;
    onClose: () => void;
    classData: ClassSchedule | null;
  }) => {
    if (!classData) return null;

    return (
    <Modal
  isOpen={isOpen}
  onRequestClose={onClose}
  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-lg w-[600px] max-h-[80vh]"
  overlayClassName="fixed inset-0 bg-black bg-opacity-50"
>
  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg w-[580px] relative max-h-[80vh] overflow-y-auto border-2 border-gray-200 dark:border-[#404040] scrollbar-none shadow-xl dark:shadow-2xl">

    <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-[#1a1a1a] ">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
        Class Details
      </h2>
    </div>

    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
            Student Name
          </label>
          <input
            type="text"
            value={`${classData.student.studentFirstName} ${classData.student.studentLastName}`}
            readOnly
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-[#505050] rounded text-xs bg-gray-50 dark:bg-[#2a2a2a] text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
            Course
          </label>
          <input
            type="text"
            value={classData.course.courseName}
            readOnly
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-[#505050] rounded text-xs bg-gray-50 dark:bg-[#2a2a2a] text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
            Start Date
          </label>
          <input
            type="text"
            value={new Date(classData.startDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
            readOnly
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-[#505050] rounded text-xs bg-gray-50 dark:bg-[#2a2a2a] text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
            End Date
          </label>
          <input
            type="text"
            value={new Date(classData.endDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
            readOnly
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-[#505050] rounded text-xs bg-gray-50 dark:bg-[#2a2a2a] text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
            Start Time
          </label>
          <input
            type="text"
            value={classData.startTime?.[0]?.replace(/ AM| PM/, "") || "--:--"}
            readOnly
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-[#505050] rounded text-xs bg-gray-50 dark:bg-[#2a2a2a] text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
            End Time
          </label>
          <input
            type="text"
            value={classData.endTime?.[0]?.replace(/ AM| PM/, "") || "--:--"}
            readOnly
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-[#505050] rounded text-xs bg-gray-50 dark:bg-[#2a2a2a] text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
            Teacher Name
          </label>
          <input
            type="text"
            value={classData.teacher.teacherName}
            readOnly
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-[#505050] rounded text-xs bg-gray-50 dark:bg-[#2a2a2a] text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
            Class Type
          </label>
          <input
            type="text"
            value={formatSessionType(classData.sessionClassType)}
            readOnly
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-[#505050] rounded text-xs bg-gray-50 dark:bg-[#2a2a2a] text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
            Package
          </label>
          <input
            type="text"
            value={classData.package || "Not specified"}
            readOnly
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-[#505050] rounded text-xs bg-gray-50 dark:bg-[#2a2a2a] text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
            Status
          </label>
          <input
            type="text"
            value={classData.scheduleStatus}
            readOnly
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-[#505050] rounded text-xs bg-gray-50 dark:bg-[#2a2a2a] text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
          Class Days
        </label>
        <input
          type="text"
          value={classData.classDay?.join(", ") || "Not specified"}
          readOnly
          className="w-full px-2 py-1.5 border border-gray-300 dark:border-[#505050] rounded text-xs bg-gray-50 dark:bg-[#2a2a2a] text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
        />
      </div>

    </div>

    <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-white dark:bg-[#1a1a1a] pb-3 border-t border-gray-200 dark:border-[#404040]">
      <button
        onClick={onClose}
        className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-[#404040] dark:hover:bg-[#505050] dark:text-white rounded text-xs font-medium transition-colors duration-200"
      >
        Cancel
      </button>
      <button
        onClick={onClose}
        className="px-4 py-1.5 bg-[#576CBC] hover:bg-[#4A5CA8] dark:bg-[#4A5CA8] dark:hover:bg-[#3d4c8f] text-white rounded text-xs font-medium transition-colors duration-200"
      >
        Close
      </button>
    </div>
  </div>
</Modal>

    );
  };

  const formatSessionType = (type: string) => {
    switch (type) {
      case "GROUPCLASS":
        return "Group ";
      case "REGULARCLASS":
        return "Regular ";
      case "TRAILCLASS":
        return "Trial ";
      default:
        return type; // fallback
    }
  };

  const sortedPaginatedData = [...paginatedData].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <BaseLayout1>
      <div>
        <AcademicHeader
          currentSection="Student"
          showBackButton={true}
          showBackPath="managestudents"
        />

        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="w-[560px] h-[246px] bg-[#5E6578] rounded-lg text-white p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start">
            <div className="flex flex-col items-center sm:pr-6 sm:border-r border-white/30">
            <div className="w-[150px] h-[150px] rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
  <img
    src="/assets/images/student-portfolio.svg"
    alt="profile"
    className="w-full h-full object-contain"
  />
</div>

              <h2 className="text-center text-[18px] font-semibold mt-3">
                {data?.studentDetails?.username}
              </h2>
              <p className="text-[14px] text-[#C9C9C9]">
                {data?.studentDetails?.student?.studentEmail}
              </p>
            </div>

            {/* Personal Info */}
            <div className="pt-8 sm:pl-6 w-full">
              <h3 className="text-[16px] font-semibold mb-3">Personal Info</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white text-[14px]">Contact</span>
                  <span className="text-[#DADADACC] text-[14px]">
                    {data?.studentDetails?.student?.studentPhone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white text-[14px]">Level</span>
                  <span className="text-[#DADADACC] text-[14px]">
                    {data?.studentEvaluationDetails?.readingLevel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white text-[14px]">Package</span>
                  <span className="text-[#DADADACC] text-[14px]">
                    {data?.studentDetails?.student?.package}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white text-[14px]">Class Type</span>
                  <span className="text-[#DADADACC] text-[14px]">
                     {(() => {
                            const val = data?.studentEvaluationDetails?.classType
                            return val
                              ? `${val.charAt(0).toUpperCase()}${val.slice(1).toLowerCase()}`
                              : "-";
                          })()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <Card
              title="Performance"
              value={studentStats ? `${studentStats.performance}%` : "--"}
              description="Compared to last month"
            />
            <Card
              title="Package"
              value={studentStats ? studentStats.package : "--"}
              description="Latest package"
            />
            <Card
              title="Total Attendance"
              value={studentStats ? `${studentStats.totalAttendance}` : "--"}
              description="Classes attended"
            />
            <Card
              title="Total Reward Points"
              value="500"
              description="95% Progressive than Last Month"
            />
          </div>
        </div>

        <div className="flex space-x-6  px-4 py-2 rounded-md">
          <button
            className={`relative text-[14px] transition font-medium ${
              activeTab === "scheduled"
                ? "text-[#576CBC] font-semibold"
                : "text-[#0A0A12] dark:text-[#fff] opacity-80"
            }`}
            onClick={() => {
              setActiveTab("scheduled");
              setCurrentPage(1);
            }}
          >
            Scheduled ({scheduledClasses.length})
            {activeTab === "scheduled" && (
              <span className="absolute left-0 ml-5 -bottom-1 w-[60px] h-[2px] rounded-full bg-[#576CBC] dark:text-[#576CBC]" />
            )}
          </button>

          <button
            className={`relative text-[14px] transition font-medium ${
              activeTab === "unscheduled"
                ? "text-[#576CBC] font-semibold"
                : "text-[#0A0A12] dark:text-[#fff] opacity-80"
            }`}
            onClick={() => {
              setActiveTab("unscheduled");
              setCurrentPage(1);
            }}
          >
            Unscheduled ({unscheduledClasses.length})
            {activeTab === "unscheduled" && (
              <span className="absolute left-0 ml-6 -bottom-1 w-[60px] h-[3px] rounded-full bg-[#576CBC]" />
            )}
          </button>

          <button
            className={`relative text-[14px] transition font-medium ${
              activeTab === "completed"
                ? "text-[#576CBC] font-semibold"
                : "text-[#0A0A12] dark:text-[#fff] opacity-80"
            }`}
            onClick={() => {
              setActiveTab("completed");
              setCurrentPage(1);
            }}
          >
            Completed ({completedClasses.length})
            {activeTab === "completed" && (
              <span className="absolute left-0 ml-3 -bottom-1 w-[60px] h-[3px] rounded-full bg-[#576CBC]" />
            )}
          </button>
        </div>

        <div className="w-full bg-[#FAFAFB] rounded-lg dark:bg-[#343434] mt-2">
          <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search by keyword"
                className="bg-transparent outline-none text-[15px] w-52 py-3 "
                value={searchText}
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
              <span className="text-left -ml-60 ">
                Showing {currentItems.length} of {paginatedData.length}
              </span>
            </div>
          </div>

          <table
            className="table-auto xw-full"
            style={{ width: "100%", tableLayout: "fixed" }}
          >
            <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
              <tr className="font-medium">
                <th className="text-left px-4 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                  Teacher Name
                </th>
                <th className="text-left px-4 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                  Course
                </th>
                <th className="text-left px-4 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                  Time
                </th>
                <th className="text-left px-4 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                  Class Type
                </th>
                <th className="text-left px-4 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="bg-white  dark:bg-[#343434] dark:divide-gray-600">
              {sortedPaginatedData.map((item, index) => (
                <tr
                  key={item._id}
                  className={`text-[12px] h-[50px] ${
                    index % 2 === 0
                      ? "bg-[#fff] dark:bg-[#2C2C2C]"
                      : "bg-[#F8F8F8] dark:bg-[#303030]"
                  }`}
                >
                  <td className="px-3 py-2 text-[#3D8FDE] font-medium text-left">
                    {toTitleCase(item.teacher.teacherName)}
                  </td>
                  <td className="px-3 py-2 text-[#17243E] dark:text-[#FDFDFD] text-left">
                    {item.course.courseName}
                  </td>
                  <td className="px-3 py-2 text-[#17243E] dark:text-[#FDFDFD] text-left">
                    {new Date(item.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-3 py-2 text-[#17243E] dark:text-[#FDFDFD] text-left">
                    <td className="px-3 py-2 text-[#17243E] dark:text-[#FDFDFD] text-left">
                      {item.startTime?.[0]?.replace(/ AM| PM/, "") || "--:--"} -{" "}
                      {item.endTime?.[0]?.replace(/ AM| PM/, "") || "--:--"}
                    </td>
                  </td>

                  <td className="px-3 py-2 text-[#17243E] dark:text-[#FDFDFD] text-left">
                    {formatSessionType(item.sessionClassType)}
                  </td>
                  <td className="px-3 py-2 text-[#17243E] dark:text-[#FDFDFD] text-left">
                    <span
                      className={`font-semibold px-3 py-1 rounded-md text-[10px] inline-block text-center min-w-[120px] ${
                        item.scheduleStatus === "Scheduled"
                          ? "bg-[#ECFDF3] dark:bg-[#374336] dark:text-[#377E36] text-[#377E36]"
                          : item.scheduleStatus === "Rescheduled"
                          ? "bg-[#E4E4E4] text-[#000] dark:bg-[#555] dark:text-[#fff]"
                          : "bg-[#ECFDF3] dark:bg-[#374336] dark:text-[#377E36] text-[#377E36]"
                      }`}
                    >
                      {item.scheduleStatus}
                    </span>
                  </td>

                  <td className="py-1 text-center relative" ref={dropdownRef}>
                    <button
                      onClick={() => toggleDropdown(index)}
                      className={`${
                        (activeTab === "scheduled" && 
                         ["Scheduled", "Reschedulerequested"].includes(item.scheduleStatus)) ||
                        activeTab === "completed" ||
                        activeTab === "unscheduled"
                          ? "cursor-pointer"
                          : "cursor-default"
                      }`}
                      disabled={
                        !((activeTab === "scheduled" && 
                         ["Scheduled", "Reschedulerequested"].includes(item.scheduleStatus)) ||
                        activeTab === "completed" ||
                        activeTab === "unscheduled")
                      }
                    >
                      <MoreVertical
                        className={`w-4 h-4 mr-12 ${
                          (activeTab === "scheduled" && 
                           ["Scheduled", "Reschedulerequested"].includes(item.scheduleStatus)) ||
                          activeTab === "completed" ||
                          activeTab === "unscheduled"
                            ? "text-slate-600 dark:text-[#FDFDFD]"
                            : "text-gray-500 dark:text-gray-200 opacity-50"
                        }`}
                      />
                    </button>

                    {activeDropdown === index && 
                     ((activeTab === "scheduled" && 
                       ["Scheduled", "Reschedulerequested"].includes(item.scheduleStatus)) ||
                      activeTab === "completed" ||
                      activeTab === "unscheduled") && (
                      <div
                        ref={dropdownRef}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border dark:border-[#5c5c5c] dark:bg-[#343434]"
                      >
                        <div className="py-1">
                          {activeTab === "completed" ? (
                            <button
                              className="w-full text-left px-4 py-2 text-[12px] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#444]"
                              onClick={() => {
                                handleViewCompletedDetails(item);
                                setActiveDropdown(null);
                              }}
                            >
                              View Details
                            </button>
                          ) : (
                            <button
                              className={`w-full text-left px-4 py-2 text-[12px] ${
                                studentListWrite
                                  ? "text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#444]"
                                  : "text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#444] cursor-not-allowed"
                              }`}
                              onClick={
                                studentListWrite
                                  ? () => {
                                      handleReschedule(
                                        item._id,
                                        item.course.courseName
                                      );
                                      setActiveDropdown(null);
                                    }
                                  : undefined
                              }
                              disabled={!studentListWrite}
                            >
                              {activeTab === "unscheduled" ? "Schedule" : "Reschedule"}
                            </button>
                          )}
                          <button
                            onClick={() => setActiveDropdown(null)}
                            className="w-full text-left px-4 py-2 text-red-600"
                          >
                            Cancel
                        </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        users={
          activeTab === "scheduled"
            ? scheduledClasses
            : activeTab === "completed"
            ? completedClasses
            : unscheduledClasses
        }
      />
      <CompletedClassDetailsModal
        isOpen={isCompletedDetailsModalOpen}
        onClose={() => setIsCompletedDetailsModalOpen(false)}
        classData={selectedCompletedClass}
      />
    </BaseLayout1>
  );
};

export default ManageStudentView;
