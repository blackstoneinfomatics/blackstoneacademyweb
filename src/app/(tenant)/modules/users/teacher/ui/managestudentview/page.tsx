"use client";

import BaseLayout from "@/app/(tenant)/modules/users/teacher/components/BaseLayout";
import React, { useState, useRef, useEffect } from "react";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Modal from "react-modal";
import { PieChart, Pie, Cell } from "recharts";
import TeacherHeader from "../../components/TeacherHeader";
import axios from "axios";
import { BsThreeDotsVertical } from "react-icons/bs";
import Pagination from "@/components/Pagination";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

export interface AssignmentItem {
  assignmentId?: string;
  assignmentType: string;
  status: string;
  assignmentName: string;
  title: string;
  assignedDate: string;
  dueDate: string;
  assignmentStatus: string;
}

export interface StudentCoreInfo {
  studentId: string;
  name: string;
}

export interface EvaluationStudentInfo {
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
}

export interface EvaluationTeacherInfo {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
}

export interface EvaluationSubscriptionInfo {
  subscriptionName: string;
}

export interface StudentEvaluationDetails {
  student: EvaluationStudentInfo;
  teacher: EvaluationTeacherInfo;
  subscription: EvaluationSubscriptionInfo;
  _id: string;
  academicCoachId: string;
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
  studentStatus: string;
  classStatus: string;
  comments: string;
  trialClassStatus: string;
  invoiceStatus: string;
  paymentLink: string;
  paymentStatus: string;
  teacherStatus: string;
  status: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  updatedBy: string;
  expectedFinishingDate: number;
  assignedTeacherId: string;
  assignedTeacherEmail: string;
  __v: number;
}

export interface StudentWithAssignments extends StudentCoreInfo {
  studentDetails: StudentEvaluationDetails;
  assignment: AssignmentItem[];
}

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

export interface Assignment {
  _id: string;
  studentId: string;
  studentName: string;
  assignmentName: string;
  assignedTeacher: string;
  assignedTeacherId: string;
  assignmentType: string;
  chooseType: boolean;
  trueorfalseType: boolean;
  question: string;
  hasOptions: boolean;
  options: {
    optionOne: string;
    optionTwo: string;
    optionThree: string;
    optionFour: string;
  };
  audioFile: string;
  uploadFile: string;
  status: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  updatedBy: string;
  level: string;
  courses: string;
  assignedDate: string;
  dueDate: string;
  answer: string;
  answerValidation: string;
  assignmentStatus: string;
  sessionClassType?: string;
  __v: number;
}

export interface AssignmentType {
  type: string;
}

export interface AssignmentData {
  _id: string;
  assignmentId: string;
  assignmentName: string;
  assignmentType: AssignmentType;
  questionName: string;
  assignedDate: string; // ISO Date string
  dueDate: string; // ISO Date string
  assignmentStatus: string; // e.g., "Completed"
}

export interface AssignmentApiResponse {
  assignmentData: AssignmentData[];
  totalCount: number;
}
const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const day = date.getDate();
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};
type CardProps = {
  title: string;
  value: string | number;
  description: string;
};

const ManageStudentView = () => {
  const itemsPerPage = 5;
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [data, setData] = useState<StudentDetails | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const initialFilters = {
    studentName: "",
    assignmentName: "",
    status: "",
    // Add more filter fields as needed
  };
  const [searchText, setSearchText] = useState("");
  const [studentListWrite, setStudentListWrite] = useState(false); // For Assign Group Class

  const [regularStudents, setRegularStudents] = useState<
    StudentWithAssignments[]
  >([]);
  const [groupStudents, setGroupStudents] = useState<StudentWithAssignments[]>(
    []
  );
  const [selectedStudentAssignments, setSelectedStudentAssignments] = useState<
    AssignmentData[]
  >([]);

  const [activeTab, setActiveTab] = useState<"Regular" | "Group">("Regular");
  const [assignmentData, setAssignmentData] = useState({
    totalAssigned: 0,
    totalCompleted: 0,
    totalPending: 0,
  });
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  // Calculate total pages for pagination
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentId = searchParams.get("studentId");
        const assignmentId = searchParams.get("assignmentId");
        const token = localStorage.getItem("TeacherAuthToken");

        if (!token || !studentId) {
          console.warn("Missing teacherId, token, or studentId");
          return;
        }

        const res = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ASSIGNMENT.GET_ASSIGNMNET_QUESTIONLIST}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            params: {
              studentId,
              assignmentId,
            },
          }
        );

        console.log("Filtered Assignments:", res.data.assignmentData);

        setSelectedStudentAssignments(res.data.assignmentData);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchData();
  }, []);

  const router = useRouter(); // Add this
  const handleViewProfile = (studentId: string) => {
    const studentId1 = searchParams.get("studentId");
    const assignmentId = searchParams.get("assignmentId");
    router.push(
      `/modules/users/teacher/ui/question?id=${studentId}&studentId=${studentId1}&assignmentId=${assignmentId}`
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Not Completed":
        return "bg-yellow-100 text-yellow-700";
      case "Not Assigned":
        return "bg-red-100 text-red-700";
      case "Assigned":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const [loading, setLoading] = useState(true);
  // Add this state at the top of your component
  const [assignmentStats, setAssignmentStats] = useState({
    assigned: 0,
    completed: 0,
  });

  // Add this useEffect to calculate stats when groupStudents changes
  useEffect(() => {
    if (groupStudents.length > 0) {
      let assignedCount = 0;
      let completedCount = 0;

      groupStudents.forEach((student) => {
        student.assignment.forEach((assignment) => {
          assignedCount++;
          if (
            assignment.assignmentStatus === "Completed" ||
            assignment.status === "Completed"
          ) {
            completedCount++;
          }
        });
      });

      setAssignmentStats({
        assigned: assignedCount,
        completed: completedCount,
      });
    }
  }, [groupStudents]);

  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("TeacherAuthToken")
            : null;
        if (!token) {
          console.error("❌ TeacherAuthToken not found");
          return;
        }
        const teacherId = localStorage.getItem("TeacherPortalId");

        if (!token || !teacherId) {
          console.error("Missing token or teacher ID");
          return;
        }

        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ASSIGNMENT.ASS_CARD_COUNT}?studentId=${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Log the full API response for debugging
        console.log("API response:", response.data);

        if (response.data.status === "success") {
          // Check if there are assignments
          if (response.data.data) {
            console.log("Setting assignment data:", response.data.data);
            setAssignmentData({
              totalAssigned: response.data.data.totalAssignments, // Use the correct property name
              totalCompleted: response.data.data.totalCompleted,
              totalPending: response.data.data.totalPending,
            });
            console.log("Updated assignment data:", {
              totalAssigned: response.data.data.totalAssignments,
              totalCompleted: response.data.data.totalCompleted,
              totalPending: response.data.data.totalPending,
            });
          } else {
            // Set totalAssigned to 0 if no assignments
            setAssignmentData({
              totalAssigned: 0,
              totalCompleted: 0,
              totalPending: 0,
            });
          }
        } else {
          console.error("Failed to fetch data:", response.data.message);
        }
      } catch (error) {
        console.error("API error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentData();
  }, []);

  const { totalAssigned, totalCompleted, totalPending } = assignmentData;

  const completionPercentage =
    totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

  const pendingPercentage =
    totalAssigned > 0 ? Math.round((totalPending / totalAssigned) * 100) : 0;

  console.log("Total Assigned:", totalAssigned);
  console.log("Total Completed:", totalCompleted);
  console.log("Total Pending:", totalPending);
  console.log("Completion Percentage:", completionPercentage);
  console.log("Pending Percentage:", pendingPercentage);

  const cards = [
    {
      title: "Total Assignment Assigned",
      count: assignmentData.totalAssigned,
      percentage:
        assignmentData.totalAssigned > 0
          ? Math.round((assignmentData.totalAssigned / assignmentData.totalAssigned) * 100)
          : 0,
      ringColor: "#7DB5CB",
      bgColor: "#CDD5E2",
      pieData:
        assignmentData.totalAssigned > 0
          ? [
            {
              value: Math.round(
                (assignmentData.totalAssigned / assignmentData.totalAssigned) * 100
              ),
            },
            {
              value:
                100 -
                Math.round(
                  (assignmentData.totalAssigned / assignmentData.totalAssigned) * 100
                ),
            },
          ]
          : [{ value: 0 }, { value: 100 }],
    },
    {
      title: "Total Assignment Completed",
      count: assignmentData.totalCompleted,
      percentage:
        assignmentData.totalAssigned > 0
          ? Math.round(
            (assignmentData.totalCompleted / assignmentData.totalAssigned) * 100
          )
          : 0,
      ringColor: "#88CF9B",
      bgColor: "#CDD5E2",
      pieData:
        assignmentData.totalAssigned > 0
          ? [
            {
              value: Math.round(
                (assignmentData.totalCompleted / assignmentData.totalAssigned) * 100
              ),
            },
            {
              value:
                100 -
                Math.round(
                  (assignmentData.totalCompleted / assignmentData.totalAssigned) * 100
                ),
            },
          ]
          : [{ value: 0 }, { value: 100 }],
    },
  ];



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

  // Optional: reset page to 1 when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  //Student data gettingby ID
  useEffect(() => {
    const fetchData = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("TeacherAuthToken")
          : null;
      if (!token) {
        console.error("❌ Academicoach not found");
        return;
      }

      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.GET}/${studentId}`,
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

  //Classschedule against the studentId

  const [filterState, setFilterState] = useState({
    studentName: "",
    assignmentName: "",
    status: "",
    course: "",
    level: "",
    fromDate: "",
    toDate: "",
  });
  const [filteredAssignments, setFilteredAssignments] = useState<
    AssignmentData[]
  >([]);
  const [searchedAssignments, setSearchedAssignments] = useState<
    AssignmentData[]
  >([]);

  // --- FILTER LOGIC ---
  const applyFilters = () => {
    let filtered = [...selectedStudentAssignments];

    if (filterState.assignmentName) {
      filtered = filtered.filter((a) =>
        a.assignmentName
          ?.toLowerCase()
          .includes(filterState.assignmentName.toLowerCase())
      );
    }
    if (filterState.status) {
      filtered = filtered.filter(
        (a) =>
          a.assignmentStatus?.toLowerCase() === filterState.status.toLowerCase()
      );
    }
    if (filterState.course) {
      filtered = filtered.filter((a) =>
        a.assignmentName
          ?.toLowerCase()
          .includes(filterState.course.toLowerCase())
      );
    }
    if (filterState.level) {
      filtered = filtered.filter((a) =>
        a.assignmentName
          ?.toLowerCase()
          .includes(filterState.level.toLowerCase())
      );
    }
    if (filterState.fromDate && filterState.toDate) {
      const from = new Date(filterState.fromDate);
      const to = new Date(filterState.toDate);
      filtered = filtered.filter((a) => {
        const assigned = new Date(a.assignedDate);
        return assigned >= from && assigned <= to;
      });
    }
    setFilteredAssignments(filtered);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilterState({
      studentName: "",
      assignmentName: "",
      status: "",
      course: "",
      level: "",
      fromDate: "",
      toDate: "",
    });
    setFilteredAssignments([]);
  };

  // --- SEARCH LOGIC ---
  const handleSearch = (text: string) => {
    setSearchText(text);
    if (!text.trim()) {
      setSearchedAssignments([]);
      return;
    }
    const lowerText = text.toLowerCase();
    const baseData =
      filteredAssignments.length > 0
        ? filteredAssignments
        : selectedStudentAssignments;
    const searched = baseData.filter((a) =>
      [
        a.assignmentId,
        a.assignmentName,
        a.assignmentType?.type,
        a.assignmentStatus,
        a.assignedDate,
        a.dueDate,
      ]
        .map((v) => (v ? String(v).toLowerCase() : ""))
        .join(" ")
        .includes(lowerText)
    );
    setSearchedAssignments(searched);
    setCurrentPage(1);
  };

  const isFilterActive = !!(
    filterState.assignmentName ||
    filterState.status ||
    filterState.fromDate ||
    filterState.toDate
  );

  const isSearchActive = !!searchText;

  // --- DATA TO RENDER ---
  const tableData = isSearchActive
    ? searchedAssignments
    : isFilterActive
      ? filteredAssignments
      : selectedStudentAssignments;
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  // Get current items for display
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);
  return (
    <BaseLayout>
      <div>
        <TeacherHeader currentSection="Assignments" />

        {/* Top section */}
        <div className="grid grid-cols-2 lg:flex-row  gap-6 mb-6">
          {/* Profile Card */}
          <div className="w-full h-[200px] grid grid-cols-2 bg-[#5E6578] rounded-lg text-white p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start">
            <div className="flex flex-col items-center sm:pr-6 sm:border-r border-white/30">
              <img
                src="/assets/images/alstudent.jpg"
                alt="profile"
                className="w-[115px] h-[115px] rounded-full object-cover border-4"
              />
              <h2 className="text-center text-[18px] font-semibold mt-1">
                {data?.studentDetails?.username}
              </h2>
              <p className="text-[12px] text-[#C9C9C9]">
                {data?.studentDetails?.student?.studentEmail}
              </p>
            </div>

            <div className="pt-2 sm:pl-6 w-full">
              <h3 className="text-[16px] font-semibold mb-2">Personal Info</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white text-[14px]">Contact</span>
                  <span className="text-[#DADADACC] text-[12px]">
                    {data?.studentDetails?.student?.studentPhone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white text-[14px]">Level</span>
                  <span className="text-[#DADADACC] text-[12px]">
                    {data?.studentEvaluationDetails?.readingLevel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white text-[14px]">Package</span>
                  <span className="text-[#DADADACC] text-[12px]">
                    {data?.studentDetails?.student?.package}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white text-[14px]">Class Type</span>
                  <span className="text-[#DADADACC] text-[12px]">
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
          <div className="grid grid-cols-2 gap-4">
            {cards.map((item, idx) => {
              const bgClass =
                idx === 0
                  ? "bg-gradient-to-b from-white to-[#F6FCFF] dark:from-[#343434] dark:to-[#343434]"
                  : idx === 1
                    ? "bg-gradient-to-b from-white to-[#F6FFFF] dark:from-[#343434] dark:to-[#343434]"
                    : "bg-gradient-to-b from-white to-[#F8F6FF] dark:from-[#343434] dark:to-[#343434]";

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl shadow-md ${bgClass} flex flex-col justify-between w-full h-[200px] transition transform hover:scale-[1.02]`}
                >
                  <h3 className="text-[#010E30] text-lg font-medium mb-2 leading-5 break-words whitespace-pre-line dark:text-[#fff]">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-center mt-2 gap-24 mb-10">
                    {" "}
                    {/* Changed to flex-col and centered */}
                    <span className="text-[22px] sm:text-[30px] md:text-[30px] text-[#010E30] font-semibold mt-20 dark:text-[#fff]">
                      {item.count}
                    </span>
                    <div className="relative w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] md:w-[120px] md:h-[120px] -mt-7">
                      <PieChart width={120} height={120}>
                        {/* Background Circle */}
                        <Pie
                          data={[{ value: 100 }]}
                          dataKey="value"
                          innerRadius={45}
                          outerRadius={55}
                          startAngle={90}
                          endAngle={-270}
                          isAnimationActive={false}
                          stroke="none"
                        >
                          <Cell fill={item.bgColor} />
                        </Pie>

                        {/* Foreground Ring */}
                        <Pie
                          data={item.pieData}
                          dataKey="value"
                          innerRadius={42}
                          outerRadius={58}
                          startAngle={90}
                          endAngle={-270}
                          cornerRadius={2}
                          isAnimationActive={false}
                          stroke="none"
                        >
                          <Cell fill={item.ringColor} />
                          <Cell fill="transparent" />
                        </Pie>
                      </PieChart>

                      {/* Center Text */}
                      <div className="absolute inset-0 flex items-center justify-center text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#333] dark:text-[#fff]">
                        {item.percentage}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs and Table Section */}

        <div className="w-full  bg-[#FAFAFB] rounded-lg dark:bg-[#343434] mt-2">
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
              {/* <BsFilterLeft /> */}
              <MdTune className="w-4 h-4" />
              <span>Filter</span>
            </div>

            <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
              <span className="text-left -ml-60 ">
                Showing {tableData.length} of{" "}
                {selectedStudentAssignments.length}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="relative">
            <table className="table-fixed w-full border border-gray-300 dark:border-gray-600">
              <thead className="text-[12px] bg-[#4C6993] text-white scrollbar-none">
                <tr>
                  {[
                    "Assignment ID",
                    "Assignment Name",
                    "Type",
                    "Assigned Date",
                    "Due Date",
                    "Status",
                    "Action",
                  ].map((header, idx) => (
                    <th
                      key={idx}
                      className="px-2 py-2 border border-[#4C6993] text-left text-wrap break-words"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
            <div className="overflow-y-auto" style={{ maxHeight: "300px" }}>
              <table className="table-fixed w-full">
                <tbody>
                  {currentItems.map((assignmentItem, index) => {
                    const statusValue = assignmentItem.assignmentStatus
                      ?.toLowerCase()
                      .trim();
                    return (
                      <tr
                        key={assignmentItem._id}
                        className={`text-[10px] ${index % 2 === 0
                            ? "bg-[#fff] dark:bg-[#2C2C2C]"
                            : "bg-[#F8F8F8] dark:bg-[#303030]"
                          }`}
                      >
                        <td className="px-3 py-3 break-words text-[12px]">
                          {assignmentItem.assignmentId}
                        </td>
                        <td className="px-3 py-3 break-words text-[12px]">
                          {assignmentItem.assignmentName}
                        </td>
                        <td className="px-3 py-3 break-words capitalize text-[12px]">
                          {assignmentItem.assignmentType?.type || "-"}
                        </td>
                        <td className="px-3 py-3 break-words text-[12px]">
                          {formatDate(assignmentItem.assignedDate)}
                        </td>
                        <td className="px-3 py-3 break-words text-[12px]">
                          {formatDate(assignmentItem.dueDate)}
                        </td>
                        <td className="px-3 py-2 break-words text-[12px]">
                          <span
                            className={`py-1 px-3 rounded-md text-[9px] min-w-[60px] inline-block ${getStatusStyle(
                              assignmentItem.assignmentStatus
                            )}`}
                          >
                            {assignmentItem.assignmentStatus || "Not Assigned"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-left relative">
                          <button
                            className="text-gray-500 hover:text-gray-700 dark:text-[#ffff]"
                            onClick={() =>
                              setOpenDropdownId(
                                openDropdownId === assignmentItem._id
                                  ? null
                                  : assignmentItem._id
                              )
                            }
                          >
                            <BsThreeDotsVertical className="w-4 h-5" />
                          </button>

                          {openDropdownId === assignmentItem._id && (
                            <div className="fixed z-50 w-32 space-y-2 bg-white rounded-md dark:bg-[#343434] text-left shadow-lg">
                              <button
                                className="block w-full px-3 py-1 text-[10px] dark:text-[#ffff] !text-left"
                                onClick={() =>
                                  handleViewProfile(assignmentItem._id)
                                }
                              >
                                View Question Form
                              </button>
                              <button
                                className="block text-center w-full px-3 py-1 text-[10px] dark:text-[#ffff]"
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
                  {tableData.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-4 text-gray-400"
                      >
                        No assignments found for the selected filter/search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      <Modal
        isOpen={isFilterModalOpen}
        onRequestClose={() => setIsFilterModalOpen(false)}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 rounded-xl bg-white  dark:bg-[#343434] w-[650px] z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-40"
      >
        <div>
          <h2 className="text-[16px] font-semibold mb-6 text-[#2D2D2D] dark:text-white">
            Filter by
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Assignment Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded text-xs"
                value={filterState.assignmentName}
                onChange={(e) =>
                  setFilterState({
                    ...filterState,
                    assignmentName: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border rounded text-xs"
                value={filterState.status}
                onChange={(e) =>
                  setFilterState({ ...filterState, status: e.target.value })
                }
              >
                <option value="">All</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Not Assigned">Not Assigned</option>
                {/* Add more statuses as needed */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                From Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded text-xs"
                value={filterState.fromDate}
                onChange={(e) =>
                  setFilterState({ ...filterState, fromDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded text-xs"
                value={filterState.toDate}
                onChange={(e) =>
                  setFilterState({ ...filterState, toDate: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={resetFilters}
              className="px-5 py-2 border border-[#576CBC] text-[#576CBC] bg-white rounded-lg text-sm font-medium hover:bg-[#f6f8ff]"
            >
              Reset
            </button>
            <button
              onClick={() => {
                applyFilters();
                setIsFilterModalOpen(false);
              }}
              className="px-5 py-2 bg-[#576CBC] text-white rounded-lg text-sm font-medium hover:bg-[#475ab1]"
            >
              Show Results
            </button>
          </div>
        </div>
      </Modal>
    </BaseLayout>
  );
};

export default ManageStudentView;
