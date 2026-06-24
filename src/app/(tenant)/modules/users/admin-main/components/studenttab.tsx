"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { MdTune } from "react-icons/md";
import { PieChart, Pie, Cell } from "recharts";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || `${AppApiEndpoints.API_END_POINT}`; // Fallback to AppApiEndpoints if env variable is not set

type TabbedTableProps = {
  studentId: string;
  userId: string;
  courseName: string;
};
// types.ts (or wherever you define your types)
interface ClassSchedule {
  _id: string;
  classId: string;
  package: string;
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
  amount: string;
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
  course: {
    courseId: string;
    courseName: string;
  };
  teacher: {
    teacherId?: string;
    teacherName: string;
    teacherEmail?: string;
  };
}


interface StudentResponse {
  students: StudentItem[];
}

interface StudentItem {
  avatar?: string;
  rating?: number;
  percentage?: any;
  _id: string;
  username: string;
  password: string;
  course: string;
  role: string;
  status: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  __v: number;
  classScheduleCount?: number;
  student: StudentDetails;
  studentEvaluationDetails?: EvaluationDetails;
}

interface StudentDetails {
  studentId: string;
  studentEmail: string;
  studentPhone: number;
  package: string;
  city: string;
  country: string;
  gender: string;
}

interface EvaluationDetails {
  classStartDate: string;
  subscription: {
    subscriptionName: string;
  };
  status: string;
  [key: string]: any; // You can extend this as needed
}
interface StudentResponse {
  studentDetails: any;
}

interface CourseRow {
  id: string;
  name: string;
  date: string;
  package: string;
  status: string;
}

interface Invoice {
  _id: string;
  student: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentPhone: number;
  };
  courseName: string;
  amount: number;
  status: string;
  createdDate: string;
  createdBy: string;
  lastUpdatedDate: string;
  lastUpdatedBy: string;
  invoiceStatus: string;
}

interface PaymentRow {
  invoiceid: string;
  date: string;
  course: string;
  duebydays: number;
  paiddate: string;
  status: string;
}

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

// Define the PaymentResponse interface
interface PaymentResponse {
  id: string;
  object: string;
  amount: number;
  currency: string;
  status: string;
  automatic_payment_methods?: {
    allow_redirects: string;
    enabled: boolean;
  };
  // Add other fields from the paymentResponse object as needed
}

// Define the PaymentDetail interface
interface PaymentDetail {
  _id: string;
  userId: string;
  userName: string;
  course: string;
  paymentStatus: string;
  paymentAmount: string;
  paymentResponse: PaymentResponse;
  paymentDate: string;
  status: string;
  createdBy: string;
  createdDate: string;
  lastUpdatedDate: string;
  __v: number;
}

const TabbedTable: React.FC<TabbedTableProps> = ({ studentId, courseName, userId }) => {
  const [activeTab, setActiveTab] = useState("Class");
  const tabs = [
    "Class",
    "Courses",
    "Payment History",
    "Assignments",
    "Assessments",
  ];
  const [classData, setClassData] = useState<ClassSchedule[]>([]);
  const [coursesData, setCoursesData] = useState<CourseRow[]>([]);

  const [searchClass, setSearchClass] = useState(""); // For search query
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); // For filter modal visibility
  const [meetingFilters, setMeetingFilters] = useState({
    teacher: "",      // For Teacher Name
    course: "",       // For Course
    fromDate: "",     // For From Date
    toDate: "",       // For To Date
    startTime: "",    // For Start Time
    endTime: "",      // For End Time
    status: "",       // For Status
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [dashboardCounts, setDashboardCounts] = useState({
    totalLevel: 0,
    totalAttendance: 0,
    totalClasses: 0,
    presentCount: 0,
    totalDuration: 0,
  });
  const [maxDuration, setMaxDuration] = useState<number | undefined>(undefined); // No default value
  const [maxClasses, setMaxClasses] = useState<number | undefined>(undefined); // No default value


  const [paymentHistory, setPaymentHistory] = useState<PaymentDetail[]>([]);


  const [searchCourse, setSearchCourse] = useState("");
  const [searchPayment, setSearchPayment] = useState("");
  const [searchAssignment, setSearchAssignment] = useState("");

  const [applicationStudentId, setApplicationStudentId] = useState<string | null>(null);

  const [courseFilters, setCourseFilters] = useState({
    courseName: "",
    startDate: "",
    endDate: "",
    status: "",
  });

  const [paymentFilters, setPaymentFilters] = useState({
    courseName: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const [isCourseFilterModalOpen, setIsCourseFilterModalOpen] = useState(false);
  const [isPaymentFilterModalOpen, setIsPaymentFilterModalOpen] = useState(false);
  const [isAssignmentFilterModalOpen, setIsAssignmentFilterModalOpen] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {

        const token = localStorage.getItem("AdminAuthToken");

        if (!token || !studentId || !courseName) {
          console.error("❌ studentId or courseName missing in localStorage or props");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/dashboard/student/counts`, {
          params: { studentId, courseName },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",

          },
        });

        setDashboardCounts({
          totalLevel: Number(response.data.totalLevel) || 0,
          totalAttendance: Number(response.data.totalAttendance) || 0,
          totalClasses: Number(response.data.totalClasses) || 0,
          presentCount: 0,
          totalDuration: Number(response.data.totalDuration) || 0,
        });


        setMaxDuration(Number(response.data.totalDuration));
        setMaxClasses(Number(response.data.totalClasses));

      } catch (error) {
        console.error("❌ Error fetching dashboard counts:", error);
      }
    };

    fetchData();
  }, [studentId, courseName]);


  const data = [
    {
      title: "Level",
      value: `${Math.floor(dashboardCounts.totalLevel)}`,
      percentage: Math.floor(dashboardCounts.totalLevel),
      ringColor: "#7DB5CB",
      bgColor: "#E7EFF2",
    },

    {
      title: "Attendance",
      value: `${Math.floor(dashboardCounts.totalAttendance)}%`,
      percentage: Math.floor(dashboardCounts.totalAttendance),
      ringColor: "#9AD7D6",
      bgColor: "#E7EFF2",
    },

    {
      title: "Total Classes",
      value: `${Math.floor(dashboardCounts.totalClasses)}`,
      percentage: maxClasses ? Math.max(0, Math.min(100, Math.floor((dashboardCounts.totalClasses / maxClasses) * 100))) : 0,
      ringColor: "#8B93D2",
      bgColor: "#E7EFF2",
    },
    {
      title: "Duration",
      value: `${Math.floor(dashboardCounts.totalDuration)} Hr`,
      percentage: maxDuration ? Math.max(0, Math.floor((dashboardCounts.totalDuration / maxDuration) * 100)) : 0,
      ringColor: "#B690D5",
      bgColor: "#E7EFF2",
    },
  ];

  useEffect(() => {
    if (typeof window !== "undefined" && studentId) {
      const token = localStorage.getItem("AdminAuthToken");
      if (token) {
        fetchStudentDetails(token, studentId);
      } else {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      }
    }
  }, [studentId]);


  const fetchStudentDetails = async (token: string, studentId: string) => {
    try {
      const response = await axios.get<StudentResponse>(
        `${API_BASE_URL}/alstudents/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const classScheduleRes = await fetch(
        `${API_BASE_URL}/classShedule/students?studentId=${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const classScheduleData = await classScheduleRes.json();


      const studentDetailsFromAlstudents = response.data.studentDetails;
      setApplicationStudentId(studentDetailsFromAlstudents.student.studentId);

      const allCourses: CourseRow[] = (classScheduleData.classSchedule || []).map((classItem: ClassSchedule) => {
        return {
          id: classItem.course?.courseId || '',
          name: classItem.course?.courseName || '',
          package: classItem.package || '',
          status: classItem.status || '',
          date: classItem.startDate ? new Date(classItem.startDate).toLocaleDateString() : new Date().toLocaleDateString(),
        };
      });

      setCoursesData(allCourses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err) {
      console.error("Failed to fetch student data", err);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && studentId) {
      const token = localStorage.getItem("AdminAuthToken");
      if (token) {
        fetchClassSchedule(token, studentId);
      } else {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      }
    }
  }, [studentId]); // Changed dependency from [] to [studentId]

  const fetchClassSchedule = async (token: string, studentId: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/classShedule/students?studentId=${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      const sortedClassData = data.classSchedule.sort((a: ClassSchedule, b: ClassSchedule) => {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      });
      setClassData(sortedClassData);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  const assessment = [
    {
      subject: "islamic Studies",
      date: "1/12/2024",
      score: "85%",
      grade: "A",
      status: "Completed",
    },
    {
      subject: "islamic history",
      date: "1/12/2024",
      score: "85%",
      grade: "A",
      status: "Re-Scheduled",
    },
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredClassData = classData.filter((row) => {
    const search = searchClass.toLowerCase();
    const formattedDate = new Date(row.startDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    }).toLowerCase();

    const matchesSearch =
      row._id.toLowerCase().includes(search) ||
      row.teacher.teacherName.toLowerCase().includes(search) ||
      row.course.courseName.toLowerCase().includes(search) ||
      formattedDate.includes(search) ||
      row.startTime[0].includes(search);

    if (!matchesSearch) return false;

    // Filter by Teacher Name
    if (meetingFilters.teacher && !row.teacher.teacherName.toLowerCase().includes(meetingFilters.teacher.toLowerCase())) {
      return false;
    }
    // Filter by Course
    if (meetingFilters.course && !row.course.courseName.toLowerCase().includes(meetingFilters.course.toLowerCase())) {
      return false;
    }
    // Filter by Date Range
    if (meetingFilters.fromDate) {
      const rowDate = new Date(row.startDate);
      const fromDate = new Date(meetingFilters.fromDate);
      rowDate.setHours(0, 0, 0, 0);
      fromDate.setHours(0, 0, 0, 0);
      if (rowDate < fromDate) return false;
    }
    if (meetingFilters.toDate) {
      const rowDate = new Date(row.startDate);
      const toDate = new Date(meetingFilters.toDate);
      rowDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);
      if (rowDate > toDate) return false;
    }
    // Filter by Time Range
    if (meetingFilters.startTime && row.startTime[0] < meetingFilters.startTime) return false;
    if (meetingFilters.endTime && row.endTime[0] > meetingFilters.endTime) return false;
    // Filter by Status
    if (meetingFilters.status && row.scheduleStatus !== meetingFilters.status) return false;

    return true;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const displayedItemsCount = filteredClassData.length;

  const startItem = displayedItemsCount === 0 ? 0 : indexOfFirstItem + 1;
  const endItem = Math.min(indexOfLastItem, displayedItemsCount);

  const paginatedClassData = filteredClassData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginatedAssessmentData = assessment.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const handleViewDetails = (studentId: string) => {
    router.push(`/modules/users/admin-main/ui/studentclass?studentId=${studentId}`);
  };
  const handleViewDetailsAssignments = (studentId: string) => {
    router.push(`/modules/users/admin-main/ui/studentclassAssignments?studentId=${studentId}`);
  };
  const handleViewDetailsAssessments = (studentId: string) => {
    router.push(`/modules/users/admin-main/ui/studentclassAssessments?studentId=${studentId}`);
  };
  const [assignments, setAssignments] = useState<AssignmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState("");

  const [filters, setFilters] = useState({
    assignmentName: "",
    course: "",
    level: "",
    assignedDateFrom: "",
    assignedDateTo: "",
    dueDateFrom: "",
    dueDateTo: "",
    status: "",
    classType: ""
  });


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

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("AdminAuthToken");
        if (!token || !studentId) {
          console.error("Missing token or student ID for Assignments fetch"); // Modified message
          return;
        }

        const res = await fetch(`${API_BASE_URL}/assignments/student?studentId=${studentId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch assignments");
        const data = await res.json();
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
  const filterAssignments = (assignments: AssignmentType[]) => {
    return assignments.filter(assignment => {
      // Search by keyword in all table data (case-insensitive)
      if (
        searchKeyword &&
        !Object.values(assignment)
          .map(val => (typeof val === 'string' ? val.toLowerCase() : ''))
          .join(' ')
          .includes(searchKeyword.toLowerCase())
      ) {
        return false;
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
      // Status filter (use mapped status)
      if (filters.status && mapStatus(assignment.assignmentStatus) !== filters.status) {
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
      // Class Type filter
      if (filters.classType && assignment.sessionClassType !== filters.classType) {
        return false;
      }
      return true;
    });
  };

  // Tab logic (if you want to filter by assignmentStatus)
  const pendingAssignments = assignments.filter(a => mapStatus(a.assignmentStatus) !== "Completed");
  const completedAssignments = assignments.filter(a => {
    const isAssignmentCompleted = mapStatus(a.assignmentStatus) === "Completed";
    // If there are questions, check that none are "ASSIGNED"
    const allQuestionsNotAssigned = !a.questions || a.questions.every(q => mapStatus(q.status) !== "Assigned");
    return isAssignmentCompleted && allQuestionsNotAssigned;
  });

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

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      assignmentName: "",
      course: "",
      level: "",
      assignedDateFrom: "",
      assignedDateTo: "",
      dueDateFrom: "",
      dueDateTo: "",
      status: "",
      classType: "" // Reset classType
    });
  };



  // Fetch payment history
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const token = localStorage.getItem("AdminAuthToken");
        if (!token || !applicationStudentId) { // Use applicationStudentId
          console.error("Missing token or applicationStudentId");
          return;
        }

        const response = await axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PAYMENT.GET_STUDENT_PAYMENT_HISTORY}?userId=${applicationStudentId}`, { // Use applicationStudentId
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Backend returns { totalCount, paymentDetails }
        if (response.data.paymentDetails) {
          const mappedPaymentDetails = response.data.paymentDetails
            .filter((payment: any) => {
              // console.log("Comparing: ", { paymentUserId: payment._doc.userId, studentIdProp: applicationStudentId, paymentUserIdType: typeof payment._doc.userId, studentIdPropType: typeof applicationStudentId }); // Removed debugging log
              return payment._doc.userId === applicationStudentId; // Filter to match applicationStudentId
            }) // Filter to match studentId
            .map((payment: any) => ({
              _id: payment._doc._id,
              userId: payment._doc.userId,
              userName: payment._doc.userName,
              course: payment.course, // This is at the top level
              paymentStatus: payment._doc.paymentStatus,
              paymentAmount: payment._doc.paymentAmount,
              paymentResponse: payment._doc.paymentResponse,
              paymentDate: payment._doc.paymentDate,
              status: payment._doc.status,
              createdBy: payment._doc.createdBy,
              createdDate: payment._doc.createdDate,
              lastUpdatedDate: payment._doc.lastUpdatedDate,
              __v: payment._doc.__v,
            }));
          setPaymentHistory(mappedPaymentDetails);
          console.log("Filtered and mapped payment details:", mappedPaymentDetails);
        }
      } catch (error: any) {
        console.error("Failed to fetch payment history:", error);
        if (error.response) {
          console.error("API error response:", error.response.data);
        }
      }
    };

    fetchPaymentHistory();
  }, [applicationStudentId]); // Changed dependency to applicationStudentId

  // Function to apply filters
  const handleApplyFilters = () => {
    setCurrentPage(1); // Reset to first page on filter apply
    setIsFilterModalOpen(false); // Close the modal
  };

  // Function to reset filters
  const handleResetFilters = () => {
    setMeetingFilters({
      teacher: "",
      course: "",
      status: "",
      fromDate: "",
      toDate: "",
      startTime: "",
      endTime: "",
    });
    // setIsFilterModalOpen(false);
  };


  const filteredCourseData = coursesData.filter((course) => {
    const searchTerm = searchCourse.toLowerCase();
    const formattedDate = new Date(course.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).toLowerCase();

    const matchesSearch =
      course.id.toLowerCase().includes(searchTerm) ||
      course.name.toLowerCase().includes(searchTerm) ||
      formattedDate.includes(searchTerm) ||
      course.package.toLowerCase().includes(searchTerm);

    if (!matchesSearch) return false;

    // Filter by Course Name
    if (courseFilters.courseName && !course.name.toLowerCase().includes(courseFilters.courseName.toLowerCase())) {
      return false;
    }
    // Filter by Status
    if (courseFilters.status && course.status !== courseFilters.status) {
      return false;
    }
    // Filter by Date Range
    if (courseFilters.startDate) {
      const courseDate = new Date(course.date);
      const fromDate = new Date(courseFilters.startDate);
      courseDate.setHours(0, 0, 0, 0);
      fromDate.setHours(0, 0, 0, 0);
      if (courseDate < fromDate) return false;
    }
    if (courseFilters.endDate) {
      const courseDate = new Date(course.date);
      const toDate = new Date(courseFilters.endDate);
      courseDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);
      if (courseDate > toDate) return false;
    }

    return true;
  });

  // Filtered data for Payment History
  const filteredPaymentData = paymentHistory.filter((payment) => {
    // Ensure payment.userName exists before calling toLowerCase()
    const userName = payment.userName || ""; // Default to empty string if undefined
    const courseName = payment.course || ""; // Default to empty string if undefined
    const searchTerm = searchPayment.toLowerCase().trim();

    const matchesSearch = (
      userName.toLowerCase().includes(searchTerm) ||
      courseName.toLowerCase().includes(searchTerm) // Include course name in search
    );

    if (!matchesSearch) return false;

    // Filter by Course Name
    if (paymentFilters.courseName && !courseName.toLowerCase().includes(paymentFilters.courseName.toLowerCase())) {
      return false;
    }

    // Filter by Status
    if (paymentFilters.status && payment.paymentStatus.toLowerCase() !== paymentFilters.status.toLowerCase()) {
      return false;
    }

    // Filter by Date Range
    if (paymentFilters.startDate) {
      const paymentDate = new Date(payment.paymentDate);
      const fromDate = new Date(paymentFilters.startDate);
      paymentDate.setHours(0, 0, 0, 0);
      fromDate.setHours(0, 0, 0, 0);
      if (paymentDate < fromDate) return false;
    }
    if (paymentFilters.endDate) {
      const paymentDate = new Date(payment.paymentDate);
      const toDate = new Date(paymentFilters.endDate);
      paymentDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);
      if (paymentDate > toDate) return false;
    }

    return true;
  });

  // Fetch assignments data
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem("AdminAuthToken");
        if (!token || !studentId) {
          console.error("Missing token or student ID for Assignments re-fetch"); // Modified message
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/assignments/student?studentId=${studentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAssignments(response.data.data || []); // Ensure data is set correctly
      } catch (error) {
        console.error("Failed to fetch assignments:", error);
      }
    };

    fetchAssignments();
  }, [studentId]); // Changed dependency from [] to [studentId]

  // Filtered data for Assignments
  const filteredAssignmentData = assignments.filter((assignment) => {
    const searchTerm = searchAssignment.toLowerCase();

    const matchesSearch =
      (assignment.assignmentId && assignment.assignmentId.toLowerCase().includes(searchTerm)) ||
      (assignment.assignedTeacher && assignment.assignedTeacher.toLowerCase().includes(searchTerm)) ||
      (assignment.course && assignment.course.toLowerCase().includes(searchTerm)) ||
      (assignment.level && assignment.level.toLowerCase().includes(searchTerm)) ||
      (assignment.title && assignment.title.toLowerCase().includes(searchTerm)) ||
      (assignment.sessionClassType && assignment.sessionClassType.toLowerCase().includes(searchTerm));

    if (!matchesSearch) return false;

    // Filter by Assignment Name
    if (filters.assignmentName && !assignment.title?.toLowerCase().includes(filters.assignmentName.toLowerCase())) {
      return false;
    }
    // Filter by Course
    if (filters.course && assignment.course && !assignment.course.toLowerCase().includes(filters.course.toLowerCase())) {
      return false;
    }
    // Filter by Level
    if (filters.level && assignment.level && !assignment.level.toLowerCase().includes(filters.level.toLowerCase())) {
      return false;
    }
    // Filter by Status
    if (filters.status && mapStatus(assignment.assignmentStatus) !== filters.status) {
      return false;
    }
    // Filter by Assigned Date Range
    if (filters.assignedDateFrom && assignment.assignedDate) {
      const assignedDate = new Date(assignment.assignedDate);
      const fromDate = new Date(filters.assignedDateFrom);
      assignedDate.setHours(0, 0, 0, 0);
      fromDate.setHours(0, 0, 0, 0);
      if (assignedDate < fromDate) return false;
    }
    if (filters.assignedDateTo && assignment.assignedDate) {
      const assignedDate = new Date(assignment.assignedDate);
      const toDate = new Date(filters.assignedDateTo);
      assignedDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);
      if (assignedDate > toDate) return false;
    }
    // Filter by Due Date Range
    if (filters.dueDateFrom && assignment.dueDate) {
      const dueDate = new Date(assignment.dueDate);
      const fromDate = new Date(filters.dueDateFrom);
      dueDate.setHours(0, 0, 0, 0);
      fromDate.setHours(0, 0, 0, 0);
      if (dueDate < fromDate) return false;
    }
    if (filters.dueDateTo && assignment.dueDate) {
      const dueDate = new Date(assignment.dueDate);
      const toDate = new Date(filters.dueDateTo);
      dueDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);
      if (dueDate > toDate) return false;
    }
    // Filter by Class Type
    if (filters.classType && assignment.sessionClassType !== filters.classType) {
      return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredCourseData.length / itemsPerPage);
  const payment = Math.ceil(filteredPaymentData.length / itemsPerPage);
  const assignment = Math.ceil(filteredAssignmentData.length / itemsPerPage);

  return (
    <div className=" overflow-x-auto mt-4">
      {/* Tabs */}
      <div className="flex space-x-4  pb-1 text-sm text-black mb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 ${activeTab === tab
              ? "border-b-2 border-b-[#576CBC] text-[#576CBC]"
              : "text-[#010E30] dark:text-white"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Class" && (
        <div className="">
          <div className="rounded-xl overflow-hidden">
            <div className="flex flex-row sm:flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent outline-none text-[12px] w-32 py-3"
                value={searchClass}
                onChange={(e) => {
                  setSearchClass(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <div
                className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 cursor-pointer"
                onClick={() => setIsFilterModalOpen(true)}
              >
                <MdTune className="w-4 h-4" />
                <span>Filter</span>
              </div>
              <span className="text-[12px] text-gray-400 dark:text-gray-400 py-3">
                Showing {startItem} to {endItem} of {displayedItemsCount}
              </span>
            </div>
            <div className="overflow-x-auto max-h-none">
              <table
                className="w-full min-w-[900px] text-sm text-left table-auto"
                style={{ width: "100%", tableLayout: "fixed" }}
              >
                <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                  <tr className="font-medium">
                    <th className="p-4 font-semibold text-[12px] text-left">
                      Class ID
                    </th>
                    <th className="p-4 font-semibold text-[12px] text-left">
                      Teacher Name
                    </th>
                    <th className="p-4 font-semibold text-[12px] text-left">
                      Course
                    </th>
                    <th className="p-4 font-semibold text-[12px] text-left">
                      Date
                    </th>
                    <th className="p-4 font-semibold text-[12px] text-left">
                      Time
                    </th>
                    <th className="p-4 font-semibold text-[12px] text-left">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[10px] text-[#1D2939]">
                  {paginatedClassData.length > 0 ? (
                    paginatedClassData.map((row, index) => (
                      <tr
                        key={row.classId}
                        className={`text-left dark:text-white ${index % 2 === 0
                          ? "bg-[#fff] dark:bg-[#2C2C2C]"
                          : "bg-[#F8F8F8] dark:bg-[#303030]"
                          }`}
                      >
                        <td className="p-3">{row.classId}</td>
                        <td className="p-3">{row.teacher.teacherName}</td>
                        <td className="p-3">{row.course.courseName}</td>
                        <td className="p-3">
                          {new Date(row.startDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "2-digit"
                          })}
                        </td>
                        <td className="p-3">
                          {row.startTime[0]} - {row.endTime[0]}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center justify-center w-24 h-6 px-3 py-1 rounded-sm whitespace-nowrap ${row.scheduleStatus === "Rescheduled"
                              ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                              : row.scheduleStatus === "Scheduled"
                                ? "bg-[#ececfd] text-[#002c5f] dark:bg-[#2e333c] dark:text-[#fff]"
                                : " bg-[#ECFDF3] dark:bg-[#2E3C2E] dark:text-[#377E36] text-[#377E36]"
                              }`}
                          >
                            {row.scheduleStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center">
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
                  onClick={() => setIsFilterModalOpen(false)}
                >
                  &times;
                </button>
                <h2 className="text-[16px] font-semibold mb-5 dark:text-white">Filter by</h2>

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
                    <option value="Islamic Studies ">Islamic Studies </option>
                  </select>
                </div>


                <div className="mb-4">
                  <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Date</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="w-full border rounded-md p-2 text-[11px] dark:bg-[#343434] dark:text-white dark:border-[#5C5C5C] dark:[color-scheme:dark]"
                      value={meetingFilters.fromDate}
                      onChange={(e) => setMeetingFilters({ ...meetingFilters, fromDate: e.target.value })}
                    />
                    <input
                      type="date"
                      className="w-full px-3 py-2 border rounded text-[11px] dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434] dark:[color-scheme:dark]"
                      value={meetingFilters.toDate}
                      onChange={(e) => setMeetingFilters({ ...meetingFilters, toDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Time</label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      className="w-full px-3 py-2 border rounded text-[11px] dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434] dark:[color-scheme:dark]"
                      value={meetingFilters.startTime}
                      onChange={(e) => setMeetingFilters({ ...meetingFilters, startTime: e.target.value })}
                    />

                    <input
                      type="time"
                      className="w-full px-3 py-2 border rounded text-[11px] dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434] dark:[color-scheme:dark]"
                      value={meetingFilters.endTime}
                      onChange={(e) => setMeetingFilters({ ...meetingFilters, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Status</label>
                  <select
                    className="w-full px-3 py-2 border rounded text-xs dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]"
                    value={meetingFilters.status}
                    onChange={(e) => setMeetingFilters({ ...meetingFilters, status: e.target.value })}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Rescheduled">Rescheduled</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="px-3 py-1 text-[12px] rounded-md border border-[#576CBC] text-[#576CBC] font-medium hover:bg-[#EEF1FF] dark:hover:bg-[#343434]"
                  >
                    Reset
                  </button>
                  <button
                    className="px-3 text-[12px] py-1 bg-[#576CBC] text-white rounded-md font-medium hover:bg-[#475ab1]"
                    onClick={handleApplyFilters}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <button
              className="bg-transparent border border-[#576CBC] text-[#576CBC] dark:bg-[#2e3343] text-[11px] px-3 py-1 rounded-md shadow transition"
              onClick={() => handleViewDetails(studentId)}
            >
              View All
            </button>
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === "Courses" && (
        <div>

          {isCourseFilterModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-30">
              <div className="bg-white p-6 rounded-xl w-[400px] relative dark:bg-[#252525] shadow-xl">
                <button
                  className="absolute top-4 right-4 text-gray-400 text-2xl"
                  onClick={() => setIsCourseFilterModalOpen(false)}
                >
                  &times;
                </button>
                <h2 className="text-sm font-semibold mb-6 dark:text-white">Filter by</h2>

                <div className="mb-4">
                  <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Course Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded text-[11px] dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]"
                    value={courseFilters.courseName}
                    onChange={(e) => setCourseFilters({ ...courseFilters, courseName: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Start Date</label>
                  <input
                    type="date"
                    className="w-full border rounded-md p-2 text-[11px] dark:bg-[#343434] dark:text-white dark:border-[#5C5C5C]"
                    value={courseFilters.startDate}
                    onChange={(e) => setCourseFilters({ ...courseFilters, startDate: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">End Date</label>
                  <input
                    type="date"
                    className="w-full border rounded-md p-2 text-[11px] dark:bg-[#343434] dark:text-white dark:border-[#5C5C5C]"
                    value={courseFilters.endDate}
                    onChange={(e) => setCourseFilters({ ...courseFilters, endDate: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Status</label>
                  <select
                    className="w-full px-3 py-2 border rounded text-[11px] dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]"
                    value={courseFilters.status}
                    onChange={(e) => setCourseFilters({ ...courseFilters, status: e.target.value })}
                  >
                    <option value="">All</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    {/* Add more status options as needed */}
                  </select>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setCourseFilters({ courseName: "", startDate: "", endDate: "", status: "" })} // Reset filters
                    className="px-4 py-1 text-[12px] rounded-md border border-[#576CBC] text-[#576CBC] font-medium"
                  >
                    Reset
                  </button>
                  <button
                    className="px-4 py-1 text-[12px] rounded-md bg-[#576CBC] text-white font-medium"
                    onClick={() => {
                      setIsCourseFilterModalOpen(false);
                      // Apply filters logic here
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Donut/Progress Grid */}
          <div className="grid grid-cols-4 gap-4 text-left mb-6">
            {data.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl shadow-lg w-full bg-gradient-to-b from-white to-[#F9FAFB] dark:from-[#343434] dark:to-[#2A2A2A]"
              >
                <h3 className="text-[#010E30] dark:text-white text-[14px] font-medium mb-2">
                  {item.title}
                </h3>
                <div className="flex justify-center">
                  <div className="relative w-[80px] h-[80px]">
                    <PieChart width={80} height={80}>
                      <Pie
                        data={[{ value: 100 }]}
                        dataKey="value"
                        innerRadius={26}
                        outerRadius={35}
                        startAngle={90}
                        endAngle={-270}
                        stroke="none"
                        isAnimationActive={false}
                      >
                        <Cell fill={item.bgColor} />
                      </Pie>
                      <Pie
                        data={[
                          { value: item.percentage },
                          { value: 100 - item.percentage },
                        ]}
                        dataKey="value"
                        innerRadius={24}
                        outerRadius={38}
                        startAngle={90}
                        endAngle={-270}
                        cornerRadius={2}
                        stroke="none"
                        isAnimationActive={false}
                      >
                        <Cell fill={item.ringColor} />
                        <Cell fill="transparent" />
                      </Pie>
                    </PieChart>
                    <div className="absolute inset-0 flex items-center justify-center text-[14px] font-semibold text-[#010E30] dark:text-white">
                      {item.value}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl overflow-hidden">
            <div className="flex flex-row sm:flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent outline-none text-[12px] w-32 py-3"
                value={searchCourse}
                onChange={(e) => {
                  setSearchCourse(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <div
                className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 cursor-pointer"
                onClick={() => setIsCourseFilterModalOpen(true)} // Open filter modal on click
              >
                <MdTune className="w-4 h-4" />
                <span>Filter</span>
              </div>
              <span className="text-[12px] text-gray-400 dark:text-gray-400 py-3">
                Showing{" "}
                {filteredCourseData.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}{" "}
                to {Math.min(currentPage * itemsPerPage, coursesData.length)} of{" "}
                {coursesData.length}
              </span>
            </div>
            <div className="overflow-x-auto max-h-none">
              <table
                className="w-full min-w-[900px] text-sm text-left table-auto"
                style={{ width: "100%", tableLayout: "fixed" }}
              >
                <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                  <tr className="font-medium">
                    <th className="p-4 font-semibold text-[12px] text-left">
                      Course ID
                    </th>
                    <th className="p-4 font-semibold text-[12px] text-left">
                      Course Name
                    </th>
                    <th className="p-4 font-semibold text-[12px] text-left">
                      Start Date
                    </th>
                    <th className="p-4 font-semibold text-[12px] text-left">
                      Package
                    </th>
                    <th className="p-4 font-semibold text-[12px] text-left">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[10px] text-[#1D2939]">
                  {filteredCourseData.length > 0 ? (
                    filteredCourseData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((row, index) => (
                      <tr
                        key={row.id}
                        className={`text-left dark:text-white ${index % 2 === 0
                          ? "bg-[#fff] dark:bg-[#2C2C2C]"
                          : "bg-[#F8F8F8] dark:bg-[#303030]"
                          }`}
                      >
                        <td className="p-3">{row.id}</td>
                        <td className="p-3">{row.name}</td>
                        <td className="p-3">
                          {new Date(row.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td className="p-3">{row.package}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center justify-center w-16 h-6 px-3 py-1 rounded-sm ${row.status === "Active"
                              ? "bg-[#ECFDF3] dark:bg-[#2E3C2E] dark:text-[#377E36] text-[#377E36]"
                              : "bg-[#ececfd] text-[#002c5f] dark:bg-[#2e333c] dark:text-[#fff]"
                              }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center">
                        No data available
                      </td>
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
                totalPages={assignment}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Table for 'Payment History' Tab */}
      {activeTab === "Payment History" && (
        <div className="">
          <div className="rounded-xl overflow-hidden">
            <div className="flex flex-row sm:flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent outline-none text-[12px] w-32 py-3"
                value={searchPayment}
                onChange={(e) => {
                  setSearchPayment(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <div
                className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 cursor-pointer"
                onClick={() => setIsPaymentFilterModalOpen(true)}
              >
                <MdTune className="w-4 h-4" />
                <span>Filter</span>
              </div>
              <span className="text-[12px] text-gray-400 dark:text-gray-400 py-3">
                Showing {filteredPaymentData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPaymentData.length)} of {filteredPaymentData.length}
              </span>
            </div>
            <div className="overflow-x-auto max-h-none">
              <table className="w-full min-w-[900px] text-sm text-left table-auto">
                <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                  <tr className="font-medium">
                    <th className="p-4 font-semibold text-[12px] text-left">Invoice ID</th>
                    <th className="p-4 font-semibold text-[12px] text-left">Date</th>
                    <th className="p-4 font-semibold text-[12px] text-left">Course</th>
                    <th className="p-4 font-semibold text-[12px] text-left">Amount</th>
                    <th className="p-4 font-semibold text-[12px] text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="text-[10px] text-[#1D2939]">
                  {filteredPaymentData.length > 0 ? (
                    filteredPaymentData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((payment, index) => (
                      <tr key={payment._id} className={`text-left dark:text-white ${index % 2 === 0 ? "bg-[#fff] dark:bg-[#2C2C2C]" : "bg-[#F8F8F8] dark:bg-[#303030]"}`}>
                        <td className="p-3">{payment._id}</td>
                        <td className="p-3">{new Date(payment.paymentDate).toLocaleDateString("en-GB", {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}</td>
                        <td className="p-3">{payment.course}</td>
                        <td className="p-3">{payment.paymentAmount}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center justify-center w-16 h-6 px-3 py-1 rounded-md ${payment.paymentStatus === "succeeded" ? "bg-[#ECFDF3] dark:bg-[#2E3C2E] dark:text-[#377E36] text-[#377E36]" : "bg-[#ececfd] text-[#002c5f] dark:bg-[#2e333c] dark:text-[#fff]"}`}>
                            {payment.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Filter Modal for Payment History */}
          {isPaymentFilterModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-30">
              <div className="bg-white p-6 rounded-xl w-[400px] relative dark:bg-[#252525] shadow-xl">
                <button
                  className="absolute top-4 right-4 text-gray-400 text-2xl"
                  onClick={() => setIsPaymentFilterModalOpen(false)}
                >
                  &times;
                </button>
                <h2 className="text-sm font-semibold mb-6 dark:text-white">Filter by</h2>

                <div className="mb-4">
                  <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Course Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded text-[11px] dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]"
                    value={paymentFilters.courseName}
                    onChange={(e) => setPaymentFilters({ ...paymentFilters, courseName: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Status</label>
                  <select
                    className="w-full px-3 py-2 border rounded text-[11px] dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]"
                    value={paymentFilters.status}
                    onChange={(e) => setPaymentFilters({ ...paymentFilters, status: e.target.value })}
                  >
                    <option value="">All</option>
                    <option value="succeeded">Succeeded</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Date</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="w-full border rounded-md p-2 text-[11px] dark:bg-[#343434] dark:text-white dark:border-[#5C5C5C] dark:[color-scheme:dark]"
                      value={paymentFilters.startDate}
                      onChange={(e) => setPaymentFilters({ ...paymentFilters, startDate: e.target.value })}
                    />
                    <input
                      type="date"
                      className="w-full border rounded-md p-2 text-[11px] dark:bg-[#343434] dark:text-white dark:border-[#5C5C5C] dark:[color-scheme:dark]"
                      value={paymentFilters.endDate}
                      onChange={(e) => setPaymentFilters({ ...paymentFilters, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setPaymentFilters({ courseName: "", status: "", startDate: "", endDate: "" })}
                    className="px-3 py-1 text-[12px] rounded-md border border-[#576CBC] text-[#576CBC] font-medium hover:bg-[#EEF1FF] dark:hover:bg-[#343434]"
                  >
                    Reset
                  </button>
                  <button
                    className="px-3 text-[12px] py-1 bg-[#576CBC] text-white rounded-md font-medium hover:bg-[#475ab1]"
                    onClick={() => {
                      setIsPaymentFilterModalOpen(false);
                      setCurrentPage(1);
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          {payment > 1 && (
            <div className="flex justify-end">
              <Pagination
                currentPage={currentPage}
                totalPages={payment}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )
      }

      {/* Table for 'Assessments' Tab */}
      {
        activeTab === "Assessments" && (
          <div className="">
            <div className="rounded-xl overflow-hidden">
              <div className="flex flex-row sm:flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-transparent outline-none text-[12px] w-32 py-3"
                  // value and onChange can be implemented if you want search for assessments
                  disabled
                />
                <div
                  className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 cursor-pointer"
                >
                  <MdTune className="w-4 h-4" />

                  <span>Filter</span>
                </div>
                <span className="text-[12px] text-gray-400 dark:text-gray-400 py-3">
                  Showing{" "}
                  {paginatedAssessmentData.length === 0
                    ? 0
                    : (currentPage - 1) * itemsPerPage + 1}{" "}
                  to {Math.min(currentPage * itemsPerPage, assessment.length)} of{" "}
                  {assessment.length}
                </span>
              </div>
              <div className="overflow-x-auto max-h-none">
                <table
                  className="w-full min-w-[900px] text-sm text-left table-auto"
                  style={{ width: "100%", tableLayout: "fixed" }}
                >
                  <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                    <tr className="font-medium">
                      <th className="p-4 font-semibold text-[12px] text-left">
                        Subject
                      </th>
                      <th className="p-4 font-semibold text-[12px] text-left">
                        Date
                      </th>
                      <th className="p-4 font-semibold text-[12px] text-left">
                        Score
                      </th>
                      <th className="p-4 font-semibold text-[12px] text-left">
                        Grade
                      </th>
                      <th className="p-4 font-semibold text-[12px] text-left">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[10px] text-[#1D2939]">
                    {paginatedAssessmentData.length > 0 ? (
                      paginatedAssessmentData.map((row, index) => {
                        let statusClass = "";
                        switch (row.status) {
                          case "Completed":
                            statusClass = "bg-[#ECFDF3] dark:bg-[#2E3C2E] dark:text-[#377E36] text-[#377E36]";
                            break;
                          case "Re-Scheduled":
                            statusClass = "bg-[#ececfd] text-[#002c5f] dark:bg-[#2e333c] dark:text-[#fff]";
                            break;
                        }
                        return (
                          <tr
                            key={row.subject + row.date + index}
                            className={`text-left dark:text-white ${index % 2 === 0
                              ? "bg-[#fff] dark:bg-[#2C2C2C]"
                              : "bg-[#F8F8F8] dark:bg-[#303030]"
                              }`}
                          >
                            <td className="p-3">{row.subject}</td>
                            <td className="p-3">{row.date}</td>
                            <td className="p-3">{row.score}</td>
                            <td className="p-3">{row.grade}</td>
                            <td className="p-3">
                              <span
                                className={`inline-flex items-center justify-center w-28 h-6 px-3 py-1 rounded-md ${statusClass}`}
                              >
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {assignment > 1 && (
              <div className="flex justify-end">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        )
      }

      {/* Table for 'Assignments' Tab */}
      {
        activeTab === "Assignments" && (
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
                    // Reset pagination if needed
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
                  Showing {filteredAssignmentData.length} of {assignments.length}
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
                          className="p-3 font-semibold text-[12px] text-left"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-[10px] text-[#1D2939]">
                    {filteredAssignmentData.length > 0 ? (
                      filteredAssignmentData.map((assignment, index) => (
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="p-4 text-center">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="bg-transparent border border-[#576CBC] text-[#576CBC] dark:bg-[#2e3343] text-[11px] px-3 py-1 rounded-md shadow transition"
                onClick={() => handleViewDetailsAssignments(studentId)}
              >
                View All
              </button>
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
                  <h2 className="text-[16px] font-semibold mb-6 dark:text-white">Filter by</h2>

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
                        className="w-full border rounded-md p-2 text-[11px] dark:bg-[#343434] dark:text-white dark:border-[#5C5C5C] dark:[color-scheme:dark]"
                        value={filters.assignedDateFrom}
                        onChange={(e) => handleFilterChange('assignedDateFrom', e.target.value)}
                      />
                      <input
                        type="date"
                        className="w-full border rounded-md p-2 text-[11px] dark:bg-[#343434] dark:text-white dark:border-[#5C5C5C] dark:[color-scheme:dark]"
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
                        className="w-full border rounded-md p-2 text-[11px] dark:bg-[#343434] dark:text-white dark:border-[#5C5C5C] dark:[color-scheme:dark]"
                        value={filters.dueDateFrom}
                        onChange={(e) => handleFilterChange('dueDateFrom', e.target.value)}
                      />
                      <input
                        type="date"
                        className="w-full border rounded-md p-2 text-[11px] dark:bg-[#343434] dark:text-white dark:border-[#5C5C5C] dark:[color-scheme:dark]"
                        value={filters.dueDateTo}
                        onChange={(e) => handleFilterChange('dueDateTo', e.target.value)}
                      />
                    </div>
                  </div>



                  <div className="flex justify-end gap-3">
                    <button
                      onClick={resetFilters}
                      className="px-3 py-1 text-[12px] rounded-md border border-[#576CBC] text-[#576CBC] font-medium hover:bg-[#EEF1FF] dark:hover:bg-[#343434]"
                    >
                      Reset
                    </button>
                    <button
                      className="px-3 text-[12px] py-1 bg-[#576CBC] text-white rounded-md font-medium hover:bg-[#475ab1]"
                      onClick={() => {
                        setIsAssignmentFilterModalOpen(false);
                        // Apply filters logic here
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      }
    </div >
  );
};

export default TabbedTable;
