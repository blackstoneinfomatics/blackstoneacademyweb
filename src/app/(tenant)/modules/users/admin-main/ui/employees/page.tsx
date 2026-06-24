"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, MoreVertical } from "lucide-react";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  TooltipProps,
} from "recharts";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip as ChartTooltip,
  Filler,
} from "chart.js";
import ApplicantsPage from "../../components/employeesrecruitment";
import axios from "axios";
import Flag from "react-world-flags";
import { MdTune } from "react-icons/md";
import Pagination from "@/components/Pagination";
import ReactDOM from "react-dom";
import AdminHeader from "../../components/AdminHeader";
import BaseLayout4 from "../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

// Register chart.js modules
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ChartTooltip,
  Filler
);
interface OtherEmployeess {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number;
  nationality: string;
  country: string;
  city: string;
  dateOfBirth: string;
  gender: string;
  residentialAddress: string;
  higherQualification: string;
  universityName: string;
  previousJob: string;
  experience: string;
  bankName: string;
  accountNumber: number;
  bankCode: string;
  passportNumber: string;
  languagesKnown: string[];
  emergencyContactNumber: number;
  relationshipWithEmployee: string;
  address: string;
  designation: string;
  department: string;
  preferedWorkingHours: number;
  preferedShiftFrom: string;
  preferedShiftTo: string;
  comments: string;
  profileImage: string | null;
  applicationDate: string;
  currency: string;
  expectedSalary: number;
  applicationStatus: string;
  preferedWorkingDays: string[];
  status: string;
}

interface EmpCountryData {
  country: string;
  count: number;
  percentage: number;
}

interface Teacher {
  _id: string;
  userId: string;
  userName: string;
  password: string;
  email: string;
  profileImage: string | null;
  level?: string;
  subject?: string;
  position?: string;
  rating?: number;
  gender?: string;
}
interface OtherEmployee {
  _id: string;
  userId: string;
  userName: string;
  email: string;
  profileImage: string | null;
  role: string[];
  status: string;
  gender: string;
  createdBy: string;
  lastUpdatedBy: string;
  createdDate: string;
  lastUpdatedDate: string;
  lastLoginDate: string;
  password: string;
}

interface OtherEmployeesResponse {
  users: OtherEmployee[];
  totalCount: number;
}
type ChartData = {
  name: string;
  value: number;
  color: string;
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "#AFC0FF",
  ACADEMICCOACH: "#9FD0FF",
  SUPERVISOR: "#78A1DB",
  USER: "#B9DDFF",
};
interface GenderResponse {
  teacherPercentage: number;
  teacherMalePercentage: string; // or number if you convert it
  teacherFemalePercentage: string; // or number
}

interface GenderChartData {
  name: string;
  value: number;
  color: string;
}
countries.registerLocale(enLocale);

interface CountryStat {
  country: string;
  count: number;
  percentage: number;
}
interface OtherEmpCountResponse {
  totalOtherEmpCount: number;
  otherEmpCount: OtherEmpEntry[];
}

interface OtherEmpEntry {
  country: string[]; // e.g., ["ADMIN"]
  count: number;
  percentage: number;
}
const formatRole = (role: string) => {
  switch (role) {
    case "ACADEMICCOACH":
      return "Academic Coach";
    case "SUPERVISOR":
      return "Supervisor";
    case "USER":
      return "User";
    case "ADMIN":
      return "Admin";
    default:
      return role;
  }
};
// Replace COLORS object with array for correct indexing
const COLORS = ["#A3D3FF", "#FFD6F7", "#B4C7ED"];
const formatPercentageValue = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }
  const rounded = Number(value.toFixed(2));
  if (Number.isInteger(rounded)) {
    return rounded.toString();
  }
  return rounded.toFixed(2);
};
interface GenderCountResponse {
  employeePercentage: number;
  employeeMalePercentage: string;
  employeeFemalePercentage: string;
}
interface DashboardCounts {
  totalApplication: number;
  shortlisted: number;
  rejected: number;
  waiting: number;
}
type LeaveStatus = "APPROVED" | "WAITINGLIST" | "REJECTED";

// Add interface for leave request list API
interface LeaveRequest {
  _id: string;
  name: string;
  employeeId: string;
  role: string;
  fromDate: string;
  toDate: string;
  leaveStatus: string;
  leaveType: string;
  approvedId: string;
  approvedName: string;
  reason: string;
  status: string;
  approvedDays: string;
  deductionDays: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  __v: number;
}

// Update the interface for the new API response
interface LeaveSummaryListResponse {
  totalCount: number;
  leavesummary: LeaveRequest[];
}

const Page = () => {
  const [activeTab, setActiveTab] = useState<
    "teachers" | "otheremployees" | "recruitment" | "leave"
  >("teachers");

  const router = useRouter();
  const [dashboardRead, setdashboardRead] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchQuery1, setSearchQuery1] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [showTeacherfilterForm, setshowTeacherfilterForm] = useState(false);
  const [showOtherEmployeesFilterForm, setShowOtherEmployeesFilterForm] =
    useState(false);
  const [filterCourse, setFilterCourse] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterOtherEmployeeName, setFilterOtherEmployeeName] = useState("");
  const [filterOtherEmployeeRole, setFilterOtherEmployeeRole] = useState("");
  const [selectedLeave, setSelectedLeave] = useState<{
    employeeId: string;
    id: string;
    name: string;
    designation: string;
    fromDate: string;
    toDate: string;
    leaveType: string;
    dateRange: string;
    reason: string;
    status: string;
    approvedDays: string;
    deductionDays: string;
  } | null>(null);

  const [isLeaveFilterModalOpen, setIsLeaveFilterModalOpen] = useState(false);
  const [leaveFilterName, setLeaveFilterName] = useState("");
  const [leaveFilterRole, setLeaveFilterRole] = useState("");
  const [leaveFilterStatus, setLeaveFilterStatus] = useState("");
  const [leaveFilterFrom, setLeaveFilterFrom] = useState<Date | null>(null);
  const [leaveFilterTo, setLeaveFilterTo] = useState<Date | null>(null);

  const [barData, setBarData] = useState<ChartData[]>([]);
  const [genderData, setGenderData] = useState<GenderChartData[]>([]);
  const [countryData, setCountryData] = useState<CountryStat[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [chartData, setChartData] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [empData, setEmpData] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [employees, setEmployees] = useState<OtherEmployee[]>([]);
  const [counts, setCounts] = useState<DashboardCounts>({
    totalApplication: 0,
    shortlisted: 0,
    rejected: 0,
    waiting: 0,
  });
  const [formData, setFormData] = useState<OtherEmployeess>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: 0,
    nationality: "",
    country: "",
    city: "",
    dateOfBirth: "",
    gender: "",
    residentialAddress: "",
    higherQualification: "",
    universityName: "",
    previousJob: "",
    experience: "",
    bankName: "",
    accountNumber: 0,
    bankCode: "",
    passportNumber: "",
    languagesKnown: [],
    emergencyContactNumber: 0,
    relationshipWithEmployee: "",
    address: "",
    designation: "",
    department: "",
    preferedWorkingHours: 8,
    preferedShiftFrom: "09:00 AM",
    preferedShiftTo: "09:00 PM",
    comments: "",
    profileImage: null,
    applicationDate: new Date().toISOString(),
    currency: "USD",
    expectedSalary: 0,
    applicationStatus: "Pending",
    preferedWorkingDays: [],
    status: "Active",
  });
  const [countryDataemp, setCountryDataemp] = useState<EmpCountryData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const filteredTeachers = teachers.filter(
    (teacher) =>
      (filterCourse === "" || teacher.position === filterCourse) &&
      (filterName === "" ||
        teacher.userName.toLowerCase().includes(filterName.toLowerCase())) &&
      (teacher.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex);
  const [leaveCard, setLeaveCard] = useState({
    totalApplication: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [filteredLeaveRequests, setFilteredLeaveRequests] = useState<
    LeaveRequest[]
  >([]);
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const [approvedDays, setApprovedDays] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [deductionDays, setDeductionDays] = useState(""); // Optional

  const filteredEmployees = (employees ?? []).filter(
    (emp) =>
      (!filterOtherEmployeeRole ||
        emp.role.includes(filterOtherEmployeeRole)) &&
      (!filterOtherEmployeeName ||
        emp.userName
          .toLowerCase()
          .includes(filterOtherEmployeeName.toLowerCase())) &&
      (emp.userName.toLowerCase().includes(searchQuery1.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery1.toLowerCase()))
  );

  const totalEmployeePages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startEmployeeIndex = (currentPage - 1) * itemsPerPage;
  const endEmployeeIndex = startEmployeeIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(
    startEmployeeIndex,
    endEmployeeIndex
  );

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AdminAuthToken")
        : null;

    if (!token) {
      console.error("❌ AdminAuthToken not found");
      return;
    }
    const roleAccessRaw = localStorage.getItem("AdminRolePermission");

    if (roleAccessRaw) {
      try {
        const roleAccess = JSON.parse(roleAccessRaw);
        const hasRead = roleAccess?.employees?.write ?? false;
        console.log(hasRead);
        setdashboardRead(hasRead);
      } catch (error) {
        console.error("Invalid JSON in AdminRolePermission:", error);
      }
    }

    // Fetch teacher status count
    axios
      .get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.USER.GET_TEACHER_STATUS_COUNT}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const data = response.data;
        if (data) {
          const count = data;
          const max = count.overallCount;

          const chartData = [
            {
              name: "Total Teachers",
              value: count.teacherTotalCount,
              scaledValue: (count.teacherTotalCount / max) * 100,
              color: "#AFC0FF",
            },
            {
              name: "Active Teachers",
              value: count.activeTeacher,
              scaledValue: (count.activeTeacher / max) * 100,
              color: "#9FD0FF",
            },
            {
              name: "Inactive Teachers",
              value: count.inActiveTeacher,
              scaledValue: (count.inActiveTeacher / max) * 100,
              color: "#78A1DB",
            },
            {
              name: "Teachers on Leave",
              value: count.leaveOnTeacher,
              scaledValue: (count.leaveOnTeacher / max) * 100,
              color: "#B9DDFF",
            },
          ];
          setBarData(chartData);
        }
      })

      .catch((error) => {
        console.error("Error fetching teacher status count:", error);
      });

    // Fetch teacher gender count
    axios
      .get<GenderResponse>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.USER.GET_TEACHER_GENDER_COUNT}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        const res = response.data;
        const chartData: GenderChartData[] = [
          {
            name: "Female",
            value: parseFloat(res.teacherFemalePercentage),
            color: "#FF82F5",
          },
          {
            name: "Male",
            value: parseFloat(res.teacherMalePercentage),
            color: "#00CFFF",
          },
        ];
        setGenderData(chartData);
      })
      .catch((error) => {
        console.error("Error fetching gender count:", error);
      });

    // Fetch student count by country
    axios
      .get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.APPLICANTS.GET_APPLICANT_COUNT_BY_COUNTRY}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setCountryData(res.data.studentCountByCountry);
      })
      .catch((err) => console.error("Failed to fetch country stats", err));

    // Fetch teachers list
    const fetchTeachers = async () => {
      try {
        const res = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.USER.GET}?role=TEACHER`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const teacherData: Teacher[] = res.data.users.map((user: any) => ({
          _id: user._id,
          userId: user.userId,
          userName: user.userName,
          password: user.password,
          email: user.email,
          profileImage: user.profileImage ?? "/assets/images/proff.jpg",
          position: user.position ?? "General",
          rating: 1.0, // optionally calculate or default
          gender: user.gender,
        }));
        setTeachers(teacherData);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };
    fetchTeachers();

    // Fetch other employee count data
    const fetchDataemp = async () => {
      try {
        const res = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.OTHEREMPLOYEE.GET_OTHER_EMPLOYEE_COUNT}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const json: OtherEmpCountResponse = await res.json();
        const transformed = json.otherEmpCount.map((entry) => {
          const role = entry.country[0];
          return {
            name: formatRole(role),
            value: entry.count,
            color: ROLE_COLORS[role] || "#999999",
          };
        });
        setChartData(transformed);
      } catch (error) {
        console.error("Error fetching role data", error);
      }
    };
    fetchDataemp();

    // Fetch gender data for employees
    const fetchGenderData = async () => {
      try {
        const res = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.OTHEREMPLOYEE.GET_OTHER_EMPLOYEE_GENDER_COUNT}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const json: GenderCountResponse = await res.json();
        const data = [
          {
            name: "Female",
            value: parseFloat(json.employeeFemalePercentage),
            color: COLORS[0],
          },
          {
            name: "Male",
            value: parseFloat(json.employeeMalePercentage),
            color: COLORS[1],
          },
        ];
        setEmpData(data);
      } catch (error) {
        console.error("Error fetching gender data:", error);
      }
    };
    fetchGenderData();

    // Fetch employees list
    const fetchEmployees = async () => {
      try {
        const res = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.USER.GET_OTHER_EMPLOYEES}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data: OtherEmployeesResponse = await res.json();
        setEmployees(data.users);
        console.log(data.users);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();

    // Fetch supervisor dashboard counts
    const fetchCounts = async () => {
      try {
        const response = await axios.get<DashboardCounts>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.DASHBOARD.GET_SUPERVISOR_COUNTS}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCounts(response.data);
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
      }
    };
    fetchCounts();

    // Fetch other employee count by country
    axios
      .get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.OTHEREMPLOYEE.GET_OTHER_EMPLOYEE_COUNT_BY_COUNTRY}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setCountryDataemp(res.data.otherEmpCountByCountry);
      })
      .catch((err) => console.error("Failed to fetch country stats", err));

    // Fetch leave card summary
    const fetchLeaveCard = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AdminAuthToken")
          : null;
      if (!token) return;
      try {
        const res = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.LEAVE.LEAVE_CARD}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setLeaveCard(res.data);
      } catch (err) {
        console.error("Error fetching leave card summary", err);
      }
    };
    fetchLeaveCard();

    // Fetch leave request list
    const fetchLeaveRequests = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AdminAuthToken")
          : null;
      if (!token) return;
      try {
        const res = await axios.get<LeaveSummaryListResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.LEAVE.LEAVE_SUMMARY_LIST}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const sortedData = res.data.leavesummary.sort(
          (a, b) =>
            new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime()
        );

        setLeaveRequests(sortedData);
      } catch (err) {
        console.error("Error fetching leave summary list", err);
      }
    };
    fetchLeaveRequests();
  }, []); // Empty dependency array means this effect runs once on component mount

  useEffect(() => {
    let filtered = leaveRequests;

    // Filter by search query
    const search = searchQuery1.trim().toLowerCase();
    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.employeeId.toLowerCase().includes(search) ||
          item.name.toLowerCase().includes(search) ||
          item.role.toLowerCase().includes(search) ||
          item.leaveType.toLowerCase().includes(search) ||
          item.fromDate.toLowerCase().includes(search) ||
          item.toDate.toLowerCase().includes(search) ||
          item.reason.toLowerCase().includes(search) ||
          item.leaveStatus.toLowerCase().includes(search)
      );
    }

    // Filter by modal inputs
    if (leaveFilterName) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(leaveFilterName.toLowerCase())
      );
    }
    if (leaveFilterRole) {
      filtered = filtered.filter((item) => item.role === leaveFilterRole);
    }
    if (leaveFilterStatus) {
      filtered = filtered.filter(
        (item) => item.leaveStatus === leaveFilterStatus
      );
    }
    if (leaveFilterFrom) {
      filtered = filtered.filter(
        (item) => new Date(item.fromDate) >= leaveFilterFrom
      );
    }
    if (leaveFilterTo) {
      filtered = filtered.filter(
        (item) => new Date(item.toDate) <= leaveFilterTo
      );
    }

    setFilteredLeaveRequests(filtered);
  }, [
    leaveRequests,
    searchQuery1,
    leaveFilterName,
    leaveFilterRole,
    leaveFilterStatus,
    leaveFilterFrom,
    leaveFilterTo,
  ]);

  const handleViewTeacher = (teacherId: string) => {
    if (!teacherId) {
      console.error("Teacher ID is undefined.");
      return;
    }

    console.log("Teacher ID:", teacherId);
    router.push(`/modules/users/admin-main/ui/employees/teacher?teacherId=${teacherId}`);
  };

  const handleViewEmployee = (employeeId: string, userId: string) => {
    if (!employeeId) {
      console.error("Employee ID is undefined.");
      return;
    }
    // Log employeeId (for debugging)
    console.log(employeeId);
    router.push(
      `/modules/users/admin-main/ui/employees/otheremployees?employeeId=${employeeId}&userId=${userId}`
    );
  };

  function handlePortalAccess(username: string, password: string) {
    const encodedUsername = encodeURIComponent(username);
    const encodedPassword = encodeURIComponent(password);
    const portalURL = `/modules/users/teacher/ui/sign?username=${encodedUsername}&password=${encodedPassword}`;
    window.location.href = portalURL;
  }
  function handlePortalAccessforemployee(username: string, password: string, roles: string[]) {
    const encodedUsername = encodeURIComponent(username);
    const encodedPassword = encodeURIComponent(password);

    let portalURL = "";

    if (roles.includes("ACADEMICCOACH")) {
      portalURL = `/modules/users/Academic-coach/ui/login?username=${encodedUsername}&password=${encodedPassword}`;
    } else if (roles.includes("ADMIN")) {
      portalURL = `/modules/users/admin-main/ui/login?username=${encodedUsername}&password=${encodedPassword}`;
    } else {
      portalURL = `/modules/users/supervisor/ui/sign?username=${encodedUsername}&password=${encodedPassword}`;
    }

    window.location.href = portalURL;
  }
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const formatTime = (value: any) => {
    // if you're using a 24h input, convert to AM/PM
    const [hour, minute] = value.split(":");
    const h = parseInt(hour, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    return `${formattedHour.toString().padStart(2, "0")}:${minute} ${suffix}`;
  };

  const handleSubmit = async () => {
    try {
      console.log(formData);
      const form = new FormData();
      for (const key in formData) {
        const value = (formData as any)[key];
        form.append(key, Array.isArray(value) ? JSON.stringify(value) : value);
      }
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AdminAuthToken")
          : null;

      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return;
      }
      await axios.post(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.OTHEREMPLOYEE.CREATE}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Employee added successfully!");
      setShowForm(false);
    } catch (error) {
      console.error(error);
      alert("Error adding employee.");
    }
  };

  //update leave
  const handleApprove = async () => {
    if (!fromDate || !toDate || !approvedDays) {
      alert("From Date, To Date, and Approved Days are required");
      return;
    }

    const token = localStorage.getItem("AdminAuthToken");

    if (!token) {
      alert("Admin token not found. Please login again.");
      return;
    }

    // Logging the actual _id
    console.log("Updating leave summary for _id:", selectedLeave?.id);

    try {
      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.LEAVE.UPDATE}/${selectedLeave?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fromDate,
            toDate,
            leaveStatus: "APPROVED",
            approvedDays: Number(approvedDays),
            deductionDays: Number(deductionDays) || 0,
            approvedName: "Admin",
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Leave approved successfully");
        setSelectedLeave(null);
      } else {
        alert(data.message || "Failed to approve leave");
      }
    } catch (error) {
      console.error("Error approving leave:", error);
      alert("Something went wrong");
    }
  };

  // Preprocess countryData to standardize country names for flag display
  const preprocessCountryData = (data: typeof countryData) =>
    data.map((item) => ({
      ...item,
      country: item.country === "The Bahamas" ? "Bahamas" : item.country,
    }));

  const processedCountryData = preprocessCountryData(countryData);

  // Helper function to calculate label position for Pie segments
  function getPieLabelPosition(
    cx: number,
    cy: number,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number
  ) {
    const midAngle = (startAngle + endAngle) / 2;
    const radius = (innerRadius + outerRadius) / 2;
    const RADIAN = Math.PI / 180;
    return {
      x: cx + radius * Math.cos(-midAngle * RADIAN),
      y: cy + radius * Math.sin(-midAngle * RADIAN),
    };
  }
  //leave colur
  const leaveStatusStyles: Record<LeaveStatus | "DEFAULT", string> = {
    APPROVED:
      "bg-[#EEEEFF] text-[#38619A] dark:bg-[#2F3642] dark:text-[#225BAA] rounded-md px-8 text-[10px]",
    WAITINGLIST:
      "bg-[#FDF6EC] dark:bg-[#534634] dark:text-[#F0AD4E] text-[#F0AD4E] rounded-md px-8 text-[10px]",
    REJECTED:
      "bg-[#FDECEC] dark:bg-[#503434] dark:text-[#D34645] text-[#D34645] rounded-md px-8 text-[10px]",
    DEFAULT: "bg-gray-200 text-gray-700 border border-gray-300 px-3",
  };

  function getLeaveStatusStyle(status: string): string {
    return (
      leaveStatusStyles[status as LeaveStatus] || leaveStatusStyles.DEFAULT
    );
  }

  const CustomTooltip = ({
    active,
    payload,
  }: TooltipProps<any, any>) => {
    const isDark =
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark");
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-2 rounded shadow-md text-[12px] border ${isDark
            ? "bg-[#22223b] text-white border-[#444]"
            : "bg-white text-[#22223b] border-gray-200"
            }`}
        >
          <div
            className={`font-normal ${isDark ? "text-white" : "text-[#22223b]"
              }`}
          >
            {payload[0].payload.name}
          </div>
          <div>
            {payload.map((entry: any, idx: number) => (
              <div
                key={idx}
                className={
                  isDark
                    ? "text-white text-[10px]"
                    : "text-[#22223b] text-[10px]"
                }
              >
                {entry.payload.value}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Find the maximum value for Teachers Record
  const maxTeacherValue = Math.max(...barData.map((d) => d.value));
  const normalizedBarData = barData.map((d) => ({
    ...d,
    scaledValue: maxTeacherValue ? (d.value / maxTeacherValue) * 100 : 0,
  }));
  // Find the maximum value for Employees Record
  const maxEmployeeValue = Math.max(...chartData.map((d) => d.value));
  const normalizedChartData = chartData.map((d) => ({
    ...d,
    scaledValue: maxEmployeeValue ? (d.value / maxEmployeeValue) * 100 : 0,
  }));

  const malePercentage = genderData.find((g) => g.name === "Male")?.value || 0;
  const femalePercentage =
    genderData.find((g) => g.name === "Female")?.value || 0;

  const total = malePercentage + femalePercentage;
  // total percentage = 100

  // convert percentage → count
  const maleCount = Math.round((malePercentage / 1000) * total);
  const femaleCount = Math.round((femalePercentage / 1000) * total);

  return (
    <BaseLayout4>
      <AdminHeader
        currentSection="Employees"
        employeeActiveTab={activeTab} // Pass the activeTab state from your page
      />
      <div className="h-full w-full p-2 md:mr-10 scrollbar-none">
        <div className="max-w-7xl w-full mx-auto scrollbar-none">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 sm:space-x-4 py-2 overflow-x-auto">
            <button
              className={`px-3 py-2 text-xs sm:text-[14px] font-semibold whitespace-nowrap ${activeTab === "teachers"
                ? "text-[#576CBC] border-b-2 border-b-[#576CBC]"
                : ""
                }`}
              onClick={() => setActiveTab("teachers")}
            >
              Teachers
            </button>
            <button
              className={`px-3 py-2 text-xs sm:text-[14px] font-semibold whitespace-nowrap ${activeTab === "otheremployees"
                ? "text-[#576CBC] border-b-2 border-b-[#576CBC]"
                : ""
                }`}
              onClick={() => setActiveTab("otheremployees")}
            >
              Other Employees
            </button>
            <button
              className={`px-3 py-2 text-xs sm:text-[14px] font-semibold whitespace-nowrap ${activeTab === "recruitment"
                ? "text-[#576CBC] border-b-2 border-b-[#576CBC]"
                : ""
                }`}
              onClick={() => setActiveTab("recruitment")}
            >
              Recruitment
            </button>
            <button
              className={`px-3 py-2 text-xs sm:text-[14px] font-semibold whitespace-nowrap ${activeTab === "leave"
                ? "text-[#576CBC] border-b-2 border-b-[#576CBC]"
                : ""
                }`}
              onClick={() => setActiveTab("leave")}
            >
              Leave
            </button>
          </div>

          {/* Tab Content */}
          <div className="w-full py-2">
            {activeTab === "teachers" && (
              <div className="flex flex-col gap-3 w-full ">
                <div className="h-[600px] overflow-y-auto scrollbar-none">
                  <div className="flex flex-row gap-4 sm:gap-4 md:gap-4 lg:gap-4 xl:gap-4  ">
                    {/* Teachers Records */}
                    <div className="bg-[#FFFF] dark:bg-[#343434] p-5 rounded-2xl shadow-md w-full sm:max-w-[370px] md:max-w-[390px] lg:max-w-[620px] h-[280px]">
                      <h2 className="text-[16px] font-semibold text-[#0B0F19] dark:text-white mb-4">
                        Teachers Record
                      </h2>
                      <div className="flex items-start justify-between gap-10">
                        {/* Legend Section */}
                        <div className="space-y-8 text-[13px] mt-3 text-[#0B0F19] dark:text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-[4px] bg-[#AFC0FF]"></div>
                            <span>Total Teachers</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-[4px] bg-[#9FD0FF]"></div>
                            <span>Active Teachers</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-[4px] bg-[#78A1DB]"></div>
                            <span>Inactive Teachers</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-[4px] bg-[#B9DDFF]"></div>
                            <span>Teachers on Leave</span>
                          </div>
                        </div>

                        {/* Bar Chart Section */}
                        <div className="flex-1 h-[220px] pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={normalizedBarData} barSize={40}>
                              <XAxis
                                dataKey="name"
                                axisLine={false}
                                tick={false}
                              />
                              <YAxis hide domain={[0, 100]} />
                              <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: "transparent" }}
                              />
                              <Bar
                                dataKey="scaledValue"
                                radius={[10, 10, 10, 10]}
                              >
                                {normalizedBarData.map((entry) => (
                                  <Cell key={entry.name} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Gender Chart (Teachers section) */}
                    <div className="bg-[#FFF] dark:bg-[#343434] p-5 rounded-2xl shadow-md w-full sm:max-w-[312px] flex flex-col">
                      <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white">
                        Gender
                      </h2>

                      {/* Chart */}
                      <div className="relative flex items-center justify-center -ml-2 mt-2">
                        <PieChart width={150} height={150}>
                          {/* Male Segment */}
                          {(() => {
                            const male =
                              genderData.find((g) => g.name === "Male")
                                ?.value || 0;
                            const female =
                              genderData.find((g) => g.name === "Female")
                                ?.value || 0;
                            const total = male + female;
                            const percent =
                              total > 0 ? Math.round((male / total) * 100) : 0;

                            const startAngle = -90;
                            const endAngle = -90 + (male / (total || 1)) * 360;

                            const pos = getPieLabelPosition(
                              75,
                              75,
                              0,
                              55,
                              startAngle,
                              endAngle
                            );

                            return (
                              <>
                                <Pie
                                  data={[{ name: "Male", value: male }]}
                                  cx={75}
                                  cy={75}
                                  innerRadius={0}
                                  outerRadius={55}
                                  startAngle={startAngle}
                                  endAngle={endAngle}
                                  dataKey="value"
                                  strokeWidth={0}
                                  fill={COLORS[0]}
                                  label={false}
                                  labelLine={false}
                                />

                                {male > 0 && (
                                  <text
                                    x={pos.x}
                                    y={pos.y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize="12px"
                                    fontWeight="bold"
                                    fill="#fff"
                                  >
                                    {percent}%
                                  </text>
                                )}
                              </>
                            );
                          })()}

                          {/* Female Segment */}
                          {(() => {
                            const male =
                              genderData.find((g) => g.name === "Male")
                                ?.value || 0;
                            const female =
                              genderData.find((g) => g.name === "Female")
                                ?.value || 0;
                            const total = male + female;
                            const percent =
                              total > 0
                                ? Math.round((female / total) * 100)
                                : 0;

                            const startAngle =
                              -90 + (male / (total || 1)) * 360;
                            const endAngle = 270;

                            const pos = getPieLabelPosition(
                              75,
                              75,
                              0,
                              50,
                              startAngle,
                              endAngle
                            );

                            return (
                              <>
                                <Pie
                                  data={[{ name: "Female", value: female }]}
                                  cx={75}
                                  cy={75}
                                  innerRadius={0}
                                  outerRadius={50}
                                  startAngle={startAngle}
                                  endAngle={endAngle}
                                  dataKey="value"
                                  strokeWidth={0}
                                  fill={COLORS[1]}
                                  label={false}
                                  labelLine={false}
                                />

                                {female > 0 && (
                                  <text
                                    x={pos.x}
                                    y={pos.y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize="12px"
                                    fontWeight="bold"
                                    fill="#fff"
                                  >
                                    {percent}%
                                  </text>
                                )}
                              </>
                            );
                          })()}

                          {/* Outline */}
                          {(() => {
                            const male =
                              genderData.find((g) => g.name === "Male")
                                ?.value || 0;
                            const female =
                              genderData.find((g) => g.name === "Female")
                                ?.value || 0;

                            const startAngle = -90;
                            const endAngle =
                              -90 + (male / (male + female || 1)) * 360;

                            return (
                              <Pie
                                data={[{ name: "Male", value: male }]}
                                cx={75}
                                cy={75}
                                innerRadius={58}
                                outerRadius={62}
                                startAngle={startAngle}
                                endAngle={endAngle}
                                dataKey="value"
                                strokeWidth={0}
                                fill={COLORS[2]}
                              />
                            );
                          })()}
                        </PieChart>
                      </div>

                      {/* Legend */}
                      {/* Legend */}
                      <div className="grid grid-cols-2 w-full mt-8 place-items-center">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-[3px]">
                            <div
                              className="w-[12px] h-[12px] rounded-[2px]"
                              style={{ backgroundColor: COLORS[0] }}
                            ></div>
                            <span className="text-[10px] font-medium text-[#010E30] dark:text-white">
                              Male
                            </span>
                          </div>
                          <div className="text-[10px] font-medium mt-[2px] text-[#010E30] dark:text-white/70">
                            {maleCount}
                          </div>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-[3px]">
                            <div
                              className="w-[12px] h-[12px] rounded-[2px]"
                              style={{ backgroundColor: COLORS[1] }}
                            ></div>
                            <span className="text-[10px] font-medium text-[#010E30] dark:text-white">
                              Female
                            </span>
                          </div>
                          <div className="text-[10px] font-medium mt-[2px] text-[#010E30] dark:text-white/70">
                            {femaleCount}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Countries Block */}
                    <div className="bg-[#FFF] dark:bg-[#343434] p-5 rounded-2xl shadow-md w-full sm:max-w-[312px] h-[280px] flex flex-col">
                      <h2 className="text-[16px] font-semibold text-[#0B0F19] dark:text-white">
                        Countries
                      </h2>
                      <div className="space-y-2 mt-2 flex-1 overflow-y-auto scrollbar-none">
                        {processedCountryData.map((country) => {
                          const countryCode = countries.getAlpha2Code(
                            country.country,
                            "en"
                          );
                          return (
                            <div
                              key={country.country}
                              className="flex items-center justify-between border-b dark:border-b-[#5C5C5C] py-1"
                            >
                              <div className="flex items-center gap-2">
                                {countryCode ? (
                                  <Flag
                                    code={countryCode}
                                    style={{
                                      width: "24px",
                                      height: "16px",
                                      borderRadius: "10%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <div className="w-6 h-4 bg-gray-300 rounded" />
                                )}
                                <span className="text-[12px] text-gray-700 dark:text-white">
                                  {country.country}
                                </span>
                              </div>
                              <span className="text-[12px] font-medium text-gray-900 dark:text-white">
                                {country.count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Search & Cards Section */}
                  <div className="mt-6 w-full shadow bg-[#f5f5f5] rounded-lg dark:bg-[#343434] dark:text-[#dedede]">
                    <div className="flex justify-between bg-[#fafafb] items-center px-4 py-0 rounded-md dark:bg-[#343434]">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search"
                          className="bg-transparent outline-none text-[15px] w-52 py-3"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="relative ">
                        {/* Filter Button (opens your filter popup) */}
                        <button
                          className="flex items-center gap-2 text-sm text-gray-400 border-[#f5f5f5] dark:border-[#3b3b3b] mt-2 py-[13px] border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
                          onClick={() => setshowTeacherfilterForm(true)}
                        >
                          <MdTune className="w-4 h-4" />
                          <span>Filter</span>
                        </button>
                        {/* Filter Popup */}
                        {showTeacherfilterForm && (
                          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center overflow-auto">
                            <div className="w-full max-w-sm bg-white dark:bg-[#252525] rounded-2xl shadow-lg overflow-hidden m-4 relative">
                              <button
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
                                onClick={() => setshowTeacherfilterForm(false)}
                                aria-label="Close"
                              >
                                ×
                              </button>
                              <div className="p-6 space-y-4">
                                <h2 className="text-lg font-semibold mb-2 dark:text-[#fff]">
                                  Filter by
                                </h2>
                                <div className="flex flex-col gap-3">
                                  <label className="text-sm font-medium text-gray-700 dark:text-[#fff] mt-2">
                                    Name
                                  </label>
                                  <input
                                    type="text"
                                    className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm"
                                    placeholder="Enter name"
                                    value={filterName}
                                    onChange={(e) =>
                                      setFilterName(e.target.value)
                                    }
                                  />
                                  <label className="text-sm font-medium text-gray-700 dark:text-[#fff]">
                                    Role
                                  </label>
                                  <select
                                    className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm"
                                    value={filterCourse}
                                    onChange={(e) =>
                                      setFilterCourse(e.target.value)
                                    }
                                  >
                                    <option value="">Select Course</option>
                                    <option value="Quran Teacher">
                                      Quran Teacher
                                    </option>
                                    <option value="Arabic Teacher">
                                      Arabic Teacher
                                    </option>
                                    <option value="Islamic Teacher">
                                      Islamic Teacher
                                    </option>
                                  </select>
                                </div>
                                <div className="flex gap-3 mt-6">
                                  <button
                                    className="flex-1 border border-[#576CBC] text-[#576CBC] rounded-lg py-2 font-medium"
                                    onClick={() => {
                                      setFilterCourse("");
                                      setFilterName("");
                                    }}
                                  >
                                    Reset
                                  </button>
                                  <button
                                    className="flex-1 bg-[#576CBC] text-white rounded-lg py-2 font-medium"
                                    onClick={() =>
                                      setshowTeacherfilterForm(false)
                                    }
                                  >
                                    Show{" "}
                                    {
                                      filteredTeachers.filter(
                                        (t) =>
                                          (!filterCourse ||
                                            t.position === filterCourse) &&
                                          (!filterName ||
                                            t.userName
                                              .toLowerCase()
                                              .includes(
                                                filterName.toLowerCase()
                                              )) &&
                                          (t.userName
                                            .toLowerCase()
                                            .includes(
                                              searchQuery.toLowerCase()
                                            ) ||
                                            t.email
                                              .toLowerCase()
                                              .includes(
                                                searchQuery.toLowerCase()
                                              ))
                                      ).length
                                    }{" "}
                                    results
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                        <span className="text-left -ml-60 ">
                          Showing{" "}
                          {
                            teachers.filter(
                              (teacher) =>
                                (filterCourse === "" ||
                                  teacher.position === filterCourse) &&
                                (filterName === "" ||
                                  teacher.userName
                                    .toLowerCase()
                                    .includes(filterName.toLowerCase())) &&
                                (teacher.userName
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase()) ||
                                  teacher.email
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase()))
                            ).length
                          }{" "}
                          Of {teachers.length}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#3b3b3b] grid grid-cols-1 xs:grid-cols-2 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-7 overflow-y-auto">
                      {paginatedTeachers.map((teacher) => (
                        <div
                          key={teacher._id}
                          className="bg-white dark:bg-[#343434] h-full shadow-md rounded-lg p-4 flex flex-col justify-between"
                        >
                          <div className="items-center">
                            <div className="h-[126px] rounded-md bg-[#e8e8e8] dark:bg-[#dadada] flex items-center justify-center">
                              <Image
                                src={
                                  teacher.profileImage ??
                                  "/assets/images/profilePicture.png"
                                }
                                alt="Teacher"
                                className="rounded-md"
                                width={90}
                                height={90}
                              />
                            </div>
                          </div>
                          <div className="mt-2 text-center">
                            <h3 className="text-[12px] font-semibold text-[#010e30] dark:text-[#fff] mb-1">
                              {teacher.userName}
                            </h3>
                            <p className="text-[#717579] text-[10px] dark:text-[#fff]">
                              {teacher.position}
                            </p>
                            <div className="flex justify-center mb-2">
                              {/* Star rating placeholder */}
                              <svg
                                className="text-[#faab3c] text-[10px]"
                                width="12"
                                height="12"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.175 0l-3.388 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z" />
                              </svg>
                              <svg
                                className="text-[#faab3c] text-[10px] mx-1"
                                width="12"
                                height="12"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.175 0l-3.388 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z" />
                              </svg>
                              <svg
                                className="text-[#faab3c] text-[10px]"
                                width="12"
                                height="12"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.175 0l-3.388 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z" />
                              </svg>
                              <svg
                                className="text-gray-300 text-[10px] mx-1"
                                width="12"
                                height="12"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.175 0l-3.388 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z" />
                              </svg>
                              <svg
                                className="text-gray-300 text-[10px]"
                                width="12"
                                height="12"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.175 0l-3.388 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z" />
                              </svg>
                            </div>
                            <div className="flex flex-col justify-center gap-2 px-5 mt-2">
                              <button
                                className="text-[12px] border border-[#576CBC] text-[#576CBC] dark:text-[#fff] px-2 py-1 rounded-lg"
                                onClick={() =>
                                  handlePortalAccess(
                                    teacher.userName,
                                    teacher.password
                                  )
                                }
                                disabled={!dashboardRead}
                              >
                                Portal Access
                              </button>
                              <button
                                className="text-[12px] bg-[#576CBC] text-white px-2 py-1 rounded-lg"
                                onClick={() =>
                                  handleViewTeacher(teacher.userId)
                                }
                              >
                                View Profile
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Pagination */}
                  <div className="flex justify-end mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "otheremployees" && (
              <div className="flex flex-col gap-3 w-full ">
                <div className="h-[600px] overflow-y-auto scrollbar-none">
                  {/* Top analytics/statistics cards (Employees Record, Gender, Countries) - keep as is */}
                  <div className="flex flex-row gap-4 sm:gap-4 md:gap-4 lg:gap-4 xl:gap-4">
                    {/* Employees Record card */}
                    <div className="bg-[#FFFFFF] dark:bg-[#343434] p-5 rounded-2xl shadow-md w-full sm:max-w-[370px] md:max-w-[390px] lg:max-w-[620px] h-[280px]">
                      <h2 className="text-[16px] font-semibold text-[#0B0F19] dark:text-white mb-4">
                        Employees Record
                      </h2>
                      <div className="flex items-start justify-between gap-10">
                        {/* Legend Section */}
                        <div className="space-y-8 text-[13px] mt-3 text-[#0B0F19] dark:text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-[4px] bg-[#AFC0FF]"></div>
                            <span>Admin</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-[4px] bg-[#9FD0FF]"></div>
                            <span>Academic Coach</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-[4px] bg-[#78A1DB]"></div>
                            <span>Supervisor</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-[4px] bg-[#B9DDFF]"></div>
                            <span>Others</span>
                          </div>
                        </div>

                        {/* Bar Chart Section */}
                        <div className="flex-1 h-[220px] pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={normalizedChartData} barSize={40}>
                              <XAxis
                                dataKey="name"
                                axisLine={false}
                                tick={false}
                              />
                              <YAxis hide domain={[0, 100]} />
                              <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: "transparent" }}
                              />
                              <Bar
                                dataKey="scaledValue"
                                radius={[10, 10, 10, 10]}
                              >
                                {normalizedChartData.map((entry) => (
                                  <Cell key={entry.name} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Gender Chart (Employees section) */}
                    <div className="bg-[#FFFFFF] dark:bg-[#343434] p-5 rounded-2xl shadow-md w-full sm:max-w-[312px] h-[280px] flex flex-col items-center justify-between relative">
                      <h2 className="text-[16px] font-semibold text-[#0B0F19] dark:text-white self-start">
                        Gender
                      </h2>
                      {/* Chart */}
                      <div className="relative flex items-center justify-center w-full h-[170px]">
                        <PieChart width={150} height={150}>
                          {/* Male Segment */}
                          {(() => {
                            const male =
                              empData.find((g) => g.name === "Male")?.value ||
                              0;
                            const female =
                              empData.find((g) => g.name === "Female")?.value ||
                              0;
                            const total = male + female;
                            const percent =
                              total > 0 ? Math.round((male / total) * 100) : 0;
                            const startAngle = -90;
                            const endAngle = -90 + (male / (total || 1)) * 360;
                            const pos = getPieLabelPosition(
                              75,
                              75,
                              0,
                              55,
                              startAngle,
                              endAngle
                            );
                            return (
                              <>
                                <Pie
                                  data={[{ name: "Male", value: male }]}
                                  cx={75}
                                  cy={75}
                                  innerRadius={0}
                                  outerRadius={55}
                                  startAngle={startAngle}
                                  endAngle={endAngle}
                                  dataKey="value"
                                  strokeWidth={0}
                                  fill={COLORS[0]}
                                  label={false}
                                  labelLine={false}
                                />
                                {male > 0 && (
                                  <text
                                    x={pos.x}
                                    y={pos.y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize="14px"
                                    fontWeight="bold"
                                    fill="#fff"
                                  >
                                    {percent}%
                                  </text>
                                )}
                              </>
                            );
                          })()}
                          {/* Female Segment */}
                          {(() => {
                            const male =
                              empData.find((g) => g.name === "Male")?.value ||
                              0;
                            const female =
                              empData.find((g) => g.name === "Female")?.value ||
                              0;
                            const total = male + female;
                            const percent =
                              total > 0
                                ? Math.round((female / total) * 100)
                                : 0;
                            const startAngle =
                              -90 + (male / (total || 1)) * 360;
                            const endAngle = 270;
                            const pos = getPieLabelPosition(
                              75,
                              75,
                              0,
                              50,
                              startAngle,
                              endAngle
                            );
                            return (
                              <>
                                <Pie
                                  data={[{ name: "Female", value: female }]}
                                  cx={75}
                                  cy={75}
                                  innerRadius={0}
                                  outerRadius={50}
                                  startAngle={startAngle}
                                  endAngle={endAngle}
                                  dataKey="value"
                                  strokeWidth={0}
                                  fill={COLORS[1]}
                                  label={false}
                                  labelLine={false}
                                />
                                {female > 0 && (
                                  <text
                                    x={pos.x}
                                    y={pos.y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize="13px"
                                    fontWeight="bold"
                                    fill="#fff"
                                  >
                                    {percent}%
                                  </text>
                                )}
                              </>
                            );
                          })()}
                          {/* Outline */}
                          {(() => {
                            const male =
                              empData.find((g) => g.name === "Male")?.value ||
                              0;
                            const female =
                              empData.find((g) => g.name === "Female")?.value ||
                              0;
                            const total = male + female;
                            const startAngle = -90;
                            const endAngle = -90 + (male / (total || 1)) * 360;
                            return (
                              <Pie
                                data={[{ name: "Male", value: male }]}
                                cx={75}
                                cy={75}
                                innerRadius={58}
                                outerRadius={62}
                                startAngle={startAngle}
                                endAngle={endAngle}
                                dataKey="value"
                                strokeWidth={0}
                                fill={COLORS[2]}
                              />
                            );
                          })()}
                        </PieChart>
                      </div>
                      <div className="grid grid-cols-2 gap-1 w-full mt-10">
                        {/* Legend for Male and Female */}
                        <div className="flex flex-col items-center text-start">
                          <div className="flex items-center gap-[3px]">
                            <div
                              className="w-[12px] h-[12px] rounded-[2px]"
                              style={{ backgroundColor: COLORS[0] }}
                            ></div>
                            <span className="text-[10px] font-semibold text-[#010E30] dark:text-white">
                              Male
                            </span>
                          </div>
                          <div className="text-[10px] font-medium mt-[2px] text-[#010E30] dark:text-white/70">
                            {formatPercentageValue(
                              empData.find((g) => g.name === "Male")?.value
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-center text-start">
                          <div className="flex items-center gap-[3px]">
                            <div
                              className="w-[12px] h-[12px] rounded-[2px]"
                              style={{ backgroundColor: COLORS[1] }}
                            ></div>
                            <span className="text-[10px] font-semibold text-[#010E30] dark:text-white">
                              Female
                            </span>
                          </div>
                          <div className="text-[10px] font-medium mt-[2px] text-[#010E30] dark:text-white/70">
                            {formatPercentageValue(
                              empData.find((g) => g.name === "Female")?.value
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Countries Block */}
                    <div className="bg-[#FFFFFF] dark:bg-[#343434] p-5 rounded-2xl shadow-md w-full sm:max-w-[312px] h-[280px] flex flex-col">
                      <h2 className="text-[16px] font-semibold text-[#0B0F19] dark:text-white">
                        Countries
                      </h2>
                      <div className="space-y-2 mt-2 flex-1 overflow-y-auto scrollbar-none">
                        {processedCountryData.map((country) => {
                          const countryCode = countries.getAlpha2Code(
                            country.country,
                            "en"
                          );
                          return (
                            <div
                              key={country.country}
                              className="flex items-center justify-between border-b dark:border-b-[#5C5C5C] py-1"
                            >
                              <div className="flex items-center gap-2">
                                {countryCode ? (
                                  <Flag
                                    code={countryCode}
                                    style={{
                                      width: "24px",
                                      height: "16px",
                                      borderRadius: "10%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <div className="w-6 h-4 bg-gray-300 rounded" />
                                )}
                                <span className="text-[12px] text-gray-700 dark:text-white">
                                  {country.country}
                                </span>
                              </div>
                              <span className="text-[12px] font-medium text-gray-900 dark:text-white">
                                {country.count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="py-3">
                    <div className="mt-3 w-full h-full shadow bg-[#f5f5f5] rounded-lg dark:bg-[#343434] dark:text-[#dedede]">
                      <div className="flex justify-between bg-[#fafafb] items-center px-4 py-0 rounded-md dark:bg-[#343434] h-12">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search"
                            className="bg-transparent outline-none text-[15px] w-52 py-3"
                            value={searchQuery1}
                            onChange={(e) => setSearchQuery1(e.target.value)}
                          />
                        </div>
                        <div className="relative ">
                          {/* Filter Button (opens your filter popup) */}
                          <button
                            className="flex items-center gap-2 text-sm text-gray-400 border-[#f5f5f5] dark:border-[#3b3b3b] mt-2 py-[13px] border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
                            onClick={() =>
                              setShowOtherEmployeesFilterForm(true)
                            }
                          >
                            <MdTune className="w-4 h-4" />
                            <span>Filter</span>
                          </button>
                          {showOtherEmployeesFilterForm && (
                            <div className="fixed inset-0 bg-black bg-opacity-10 z-50 flex justify-center items-center overflow-auto">
                              <div className="w-full max-w-sm bg-white dark:bg-[#252525] rounded-2xl shadow-lg overflow-hidden m-4 relative">
                                <button
                                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
                                  onClick={() =>
                                    setShowOtherEmployeesFilterForm(false)
                                  }
                                  aria-label="Close"
                                >
                                  ×
                                </button>
                                <div className="p-6 space-y-4">
                                  <h2 className="text-lg font-semibold mb-2">
                                    Filter by
                                  </h2>
                                  <div className="flex flex-col gap-3">
                                    <label className="text-sm font-medium text-gray-700 dark:text-white mt-2">
                                      Name
                                    </label>
                                    <input
                                      type="text"
                                      className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm"
                                      placeholder="Enter name"
                                      value={filterOtherEmployeeName}
                                      onChange={(e) =>
                                        setFilterOtherEmployeeName(
                                          e.target.value
                                        )
                                      }
                                    />
                                    <label className="text-sm font-medium text-gray-700 dark:text-white">
                                      Role
                                    </label>
                                    <select
                                      className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm"
                                      value={filterOtherEmployeeRole}
                                      onChange={(e) =>
                                        setFilterOtherEmployeeRole(
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option value="">Select Role</option>
                                      <option value="ADMIN">Admin</option>
                                      <option value="ACADEMICCOACH">
                                        Academic Coach
                                      </option>
                                      <option value="SUPERVISOR">
                                        Supervisor
                                      </option>
                                      <option value="OTHERS">Others</option>
                                    </select>
                                  </div>
                                  <div className="flex gap-3 mt-6">
                                    <button
                                      className="flex-1 text-[15px] border border-[#576CBC] text-[#576CBC] rounded-lg py-2 font-medium"
                                      onClick={() => {
                                        setFilterOtherEmployeeName("");
                                        setFilterOtherEmployeeRole("");
                                      }}
                                    >
                                      Reset
                                    </button>
                                    <button
                                      className="flex-1 text-[15px] bg-[#576CBC] text-white rounded-lg py-2 font-medium"
                                      onClick={() =>
                                        setShowOtherEmployeesFilterForm(false)
                                      }
                                    >
                                      Show{" "}
                                      {
                                        employees.filter(
                                          (emp) =>
                                            (!filterOtherEmployeeRole ||
                                              emp.role.includes(
                                                filterOtherEmployeeRole
                                              )) &&
                                            (!filterOtherEmployeeName ||
                                              emp.userName
                                                .toLowerCase()
                                                .includes(
                                                  filterOtherEmployeeName.toLowerCase()
                                                )) &&
                                            (emp.userName
                                              .toLowerCase()
                                              .includes(
                                                searchQuery1.toLowerCase()
                                              ) ||
                                              emp.email
                                                .toLowerCase()
                                                .includes(
                                                  searchQuery1.toLowerCase()
                                                ))
                                        ).length
                                      }{" "}
                                      results
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                          <span className="text-left -ml-60">
                            Showing {filteredEmployees.length} Of{" "}
                            {employees.length}
                          </span>
                        </div>
                      </div>
                      {/* Employee Cards - match Teachers card grid */}
                      <div className="grid grid-cols-1 bg-white dark:bg-[#3b3b3b] xs:grid-cols-2 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-7 overflow-y-auto">
                        {paginatedEmployees.map((employee) => (
                          <div
                            key={employee._id}
                            className="bg-white dark:bg-[#343434] h-full shadow-md rounded-lg p-4 flex flex-col justify-between"
                          >
                            <div className="items-center">
                              <div className="h-[126px] rounded-md bg-[#e8e8e8] dark:bg-[#dadada] flex items-center justify-center">
                                <Image
                                  src={
                                    employee.profileImage ??
                                    "/assets/images/proff.jpg"
                                  }
                                  alt="Employee"
                                  className="rounded-md"
                                  width={90}
                                  height={90}
                                />
                              </div>
                            </div>
                            <div className="mt-2 text-center">
                              <h3 className="text-[12px] font-semibold text-[#010e30] dark:text-[#fff] mb-1">
                                {employee.userName}
                              </h3>
                              <p className="text-[#717579] text-[10px] dark:text-[#fff]">
                                Role: {employee.role.join(", ")}
                              </p>
                              <p className="text-[#717579] text-[10px] dark:text-[#fff]">
                                {employee.gender}
                              </p>
                              <div className="flex flex-col justify-center gap-2 px-5 mt-2">
                                <button
                                  className="text-[12px] border border-[#576CBC] text-[#576CBC] dark:text-[#fff] px-2 py-1 rounded-lg"
                                  onClick={() =>
                                    handlePortalAccessforemployee(
                                      employee.userName,
                                      employee.password,
                                      employee.role
                                    )
                                  }
                                  disabled={!dashboardRead}
                                >
                                  Portal Access
                                </button>
                                <button
                                  className="text-[12px] bg-[#576CBC] text-white px-2 py-1 rounded-lg"
                                  onClick={() =>
                                    handleViewEmployee(
                                      employee.userId,
                                      employee._id
                                    )
                                  }
                                >
                                  View Profile
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Pagination (if needed, match Teachers section) */}
                    <div className="flex justify-end mt-4">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalEmployeePages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "recruitment" && (
              <div className="flex flex-col overflow-y-auto scrollbar-none ">
                <main className="flex-grow">
                  {/* ✅ Section 1: Stats Card Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        title: "Total Applications",
                        count: counts.totalApplication,
                        color: "gray",
                        iconBg: "bg-gray-100",
                        iconColor: "text-gray-500",
                        chartColor: "#64748b",
                      },
                      {
                        title: "Shortlisted Candidates",
                        count: counts.shortlisted,
                        color: "indigo",
                        iconBg: "bg-indigo-100",
                        iconColor: "text-indigo-500",
                        chartColor: "#6366f1",
                      },
                      {
                        title: "Rejected Candidates",
                        count: counts.rejected,
                        color: "cyan",
                        iconBg: "bg-cyan-100",
                        iconColor: "text-cyan-500",
                        chartColor: "#06b6d4",
                      },
                      {
                        title: "Waiting Candidates",
                        count: counts.waiting,
                        color: "blue",
                        iconBg: "bg-blue-100",
                        iconColor: "text-blue-500",
                        chartColor: "#3b82f6",
                      },
                    ].map((card) => (
                      <div
                        key={card.title}
                        className="bg-[#7689BD] text-white shadow-md rounded-xl flex flex-col  w-full p-3 h-full"
                      >
                        <div className="flex flex-col justify-between gap-y-8">
                          <div>
                            <p className="text-[16px] font-medium dark:text-white text-white">
                              {card.title}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-[28px] font-semibold dark:text-white text-white">
                              {card.count}
                            </h3>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ✅ Section 2: Applicants Table */}
                  <div className="mt-6 overflow-x-auto">
                    <div className="min-w-[800px]">
                      <ApplicantsPage />
                    </div>
                  </div>
                </main>
              </div>
            )}

            {activeTab === "leave" && (
              <div className="space-y-4 overflow-y-auto scrollbar-none">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      title: "Total Leave Requests",
                      count: leaveCard.totalApplication,
                    },
                    {
                      title: "Total Approved",
                      count: leaveCard.approved,
                    },
                    {
                      title: "Total Declined",
                      count: leaveCard.rejected,
                    },
                  ].map((card) => (
                    <div
                      key={card.title}
                      className="bg-[#7689BD] text-white shadow-md rounded-xl flex flex-col w-full p-3 h-full"
                    >
                      <div className="flex flex-col justify-between gap-y-8">
                        <div>
                          <p className="text-[16px] font-medium dark:text-white text-white">
                            {card.title}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-[28px] font-semibold dark:text-white text-white">
                            {card.count}
                          </h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="overflow-y-scroll scrollbar-none w-full h-[350px] bg-[#FAFAFB] rounded-lg dark:bg-[#343434]">
                  <div className="flex justify-between items-center px-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Search className="w-3 h-3 text-gray-400 dark:text-gray-400 -mt-[1px]" />
                      <input
                        type="text"
                        placeholder="Search"
                        className="bg-transparent outline-none text-[12px] w-52 py-3"
                        value={searchQuery1}
                        onChange={(e) => setSearchQuery1(e.target.value)}
                      />
                    </div>
                    <div
                      className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48  cursor-pointer"
                      onClick={() => setIsLeaveFilterModalOpen(true)}
                    >
                      <MdTune className="w-4 h-4" />
                      <span>Filter</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-gray-400 dark:text-gray-400 mr-20">
                      <span className="text-left">
                        Showing{" "}
                        {(filteredLeaveRequests?.length ?? 0) === 0 ? 0 : 1} to{" "}
                        {filteredLeaveRequests?.length ?? 0} of{" "}
                        {filteredLeaveRequests?.length ?? 0}
                      </span>
                    </div>
                  </div>

                  <table
                    className="w-full min-w-[900px] text-sm text-left table-auto"
                    style={{ width: "100%", tableLayout: "fixed" }}
                  >
                    <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                      <tr className="font-medium">
                        {[
                          "Employee ID",
                          "Employee Name",
                          "Role",
                          "Leave Type",
                          "Date Range",
                          "Reason For Leave",
                          "Status",
                          "Action",
                        ].map((header) => (
                          <th
                            key={header}
                            className={`className="px-4 py-4 font-semibold text-[12px] text-center  break-words`}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-[10px] text-[#1D2939]">
                      {(filteredLeaveRequests?.length ?? 0) > 0 ? (
                        filteredLeaveRequests
                          .slice(0, 5) // Show only the first 7 entries
                          .map((item, index) => {
                            const btnId = `action-btn-${item._id}`;
                            return (
                              <tr
                                key={item._id}
                                className={`text-[12px] ${index % 2 === 0
                                  ? "bg-[#fff] dark:bg-[#2C2C2C]"
                                  : "bg-[#F8F8F8] dark:bg-[#303030]"
                                  }`}
                              >
                                <td className="px-3 py-3 text-[#17243E] dark:text-[#FDFDFD] text-left overflow-hidden text-ellipsis whitespace-nowrap">
                                  {item.employeeId}
                                </td>
                                <td className="px-3 py-3 text-[#3D8FDE] font-medium text-left break-words">
                                  {item.name}
                                </td>
                                <td className="px-3 py-3 text-[#17243E] dark:text-[#FDFDFD] text-left overflow-hidden text-ellipsis whitespace-nowrap">
                                  {item.role}
                                </td>
                                <td className="px-3 py-3 text-[#17243E] dark:text-[#FDFDFD] text-left overflow-hidden text-ellipsis whitespace-nowrap">
                                  {item.leaveType}
                                </td>
                                <td className="px-3 py-3 text-[#17243E] dark:text-[#FDFDFD] text-left overflow-hidden text-ellipsis whitespace-nowrap">
                                  {`${new Date(
                                    item.fromDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })} - ${new Date(
                                    item.toDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}`}
                                </td>
                                <td className="px-3 py-3 text-[#17243E] dark:text-[#FDFDFD] text-left overflow-hidden text-ellipsis whitespace-nowrap">
                                  {item.reason}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap align-middle">
                                  <span
                                    className={`text-[10px] font-semibold py-1 rounded-lg inline-block w-[120px] text-center leading-tight break-words ${getLeaveStatusStyle(
                                      item.leaveStatus
                                    )}`}
                                  >
                                    {item.leaveStatus}
                                  </span>
                                </td>

                                <td className="px-3 py-3 text-center">
                                  <button
                                    id={btnId}
                                    className="text-[10px] font-semibold dark:text-white  "
                                    onClick={(e) => {
                                      if (actionDropdown === item._id) {
                                        setActionDropdown(null);
                                        setDropdownPos(null);
                                      } else {
                                        const rect = (
                                          e.target as HTMLElement
                                        ).getBoundingClientRect();
                                        setDropdownPos({
                                          top: rect.bottom + window.scrollY,
                                          left: rect.left + window.scrollX,
                                        });
                                        setActionDropdown(item._id);
                                      }
                                    }}
                                  >
                                    <MoreVertical size={16} />
                                  </button>
                                  {/* Portal dropdown */}
                                  {actionDropdown === item._id &&
                                    dropdownPos &&
                                    typeof window !== "undefined" &&
                                    ReactDOM.createPortal(
                                      <div
                                        style={{
                                          position: "absolute",
                                          top: dropdownPos.top + 4,
                                          left: dropdownPos.left - 50,
                                          zIndex: 9999,
                                          width: "7.5rem",
                                        }}
                                        className="bg-white dark:bg-[#3b3b3b] shadow-md text-center rounded-md"
                                      >
                                        <button
                                          className="w-full px-2 py-1 text-[10px] text-[#17243E] dark:text-[#FDFDFD] dark:bg-[#3b3b3b] border-b border-b-gray-200 dark:border-b-gray-600"
                                          onClick={() => {
                                            setSelectedLeave({
                                              id: item._id, // 🟡 use MongoDB document ID
                                              employeeId: item.employeeId, // ✅ required for backend API
                                              name: item.name,
                                              designation: item.role,
                                              leaveType: item.leaveType,
                                              fromDate: item.fromDate,
                                              toDate: item.toDate,
                                              dateRange: `${new Date(
                                                item.fromDate
                                              ).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                              })} - ${new Date(
                                                item.toDate
                                              ).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                              })}`,
                                              reason: item.reason,
                                              status: item.leaveStatus,
                                              approvedDays: item.approvedDays,
                                              deductionDays: item.deductionDays,
                                            });
                                            setActionDropdown(null);
                                            setDropdownPos(null);
                                          }}
                                        >
                                          View
                                        </button>
                                        <button
                                          className="w-full px-2 py-1 text-[10px] text-[#17243E] dark:text-[#FDFDFD] dark:bg-[#3b3b3b] border-b border-b-gray-200 dark:border-b-gray-600"
                                          onClick={() => {
                                            // Implement cancel logic here
                                            setActionDropdown(null);
                                            setDropdownPos(null);
                                          }}
                                        >
                                          Cancel
                                        </button>
                                      </div>,
                                      document.body
                                    )}
                                </td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td colSpan={8} className="p-4 text-center">
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    className="bg-transparent border border-[#576CBC] text-[#576CBC] text-[11px] px-3 py-1 rounded-md shadow transition"
                    onClick={() => router.push("/modules/users/admin-main/ui/leavelist")}
                  >
                    View All
                  </button>
                </div>

                {selectedLeave && (
                  <div className="fixed inset-0 z-50 bg-black bg-opacity-30 shadow-md flex items-center justify-center ">
                    <div className="bg-white rounded-xl w-full max-w-4xl p-6 shadow-xl relative dark:bg-[#2c2c2c]">
                      <h2 className="text-lg font-semibold text-[#0d1b3e] mb-6 dark:text-[#fcfcfc]">
                        Leave Request Approval
                      </h2>

                      <button
                        onClick={() => setSelectedLeave(null)}
                        className="absolute top-4 right-4 text-xl text-[#0d1b3e] hover:text-gray-600 dark:text-[#fcfcfc]"
                      >
                        ✕
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Section */}
                        <div className="grid grid-cols-[160px_1fr] items-center">
                          {/* Employee ID */}
                          <label
                            htmlFor="employeeID"
                            className="font-medium text-sm"
                          >
                            Employee ID
                          </label>
                          <input
                            className="w-full border border-[#a6b0c3] rounded-md px-4 py-2 text-gray-600 text-[10px] dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d]"
                            value={selectedLeave.id}
                            disabled
                          />

                          {/* Employee Name */}
                          <label
                            htmlFor="employeeName"
                            className="font-medium text-sm"
                          >
                            Employee Name
                          </label>
                          <input
                            className="w-full border border-[#a6b0c3] rounded-md px-4 py-2 text-gray-600 text-xs dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d]"
                            value={selectedLeave.name}
                            disabled
                          />

                          {/* Designation */}
                          <label
                            htmlFor="Designation"
                            className="font-medium text-sm"
                          >
                            Designation
                          </label>
                          <input
                            className="w-full border border-[#a6b0c3] rounded-md px-4 py-2 text-gray-600 text-xs dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d]"
                            value={selectedLeave.designation}
                            disabled
                          />

                          {/* Leave Type */}
                          <label
                            htmlFor="Leavetype"
                            className="font-medium text-sm"
                          >
                            Leave Type
                          </label>
                          <input
                            className="w-full border border-[#a6b0c3] rounded-md px-4 py-2 text-gray-600 text-xs dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d]]"
                            value={selectedLeave.leaveType}
                            disabled
                          />

                          {/* From Date */}
                          <label
                            htmlFor="from date"
                            className="font-medium text-sm"
                          >
                            From Date
                          </label>
                          <input
                            className="w-full border border-[#a6b0c3] rounded-md px-4 py-2 text-gray-600 text-xs dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d]"
                            value={new Date(
                              selectedLeave.fromDate
                            ).toLocaleDateString("en-GB")}
                            disabled
                          />

                          {/* To Date */}
                          <label
                            htmlFor="todate"
                            className="font-medium text-sm"
                          >
                            To Date
                          </label>
                          <input
                            className="w-full border border-[#a6b0c3] rounded-md px-4 py-2 text-gray-600 text-xs dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d]"
                            value={new Date(
                              selectedLeave.toDate
                            ).toLocaleDateString("en-GB")}
                            disabled
                          />

                          {/* Reason For Leave */}
                          <label
                            htmlFor="reason"
                            className="font-medium text-sm"
                          >
                            Reason For Leave
                          </label>
                          <textarea
                            className="w-full border border-[#a6b0c3] rounded-md px-4 py-2 text-gray-600 text-xs dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d]"
                            rows={3}
                            value={selectedLeave.reason}
                            disabled
                          />
                        </div>

                        {/* Right Section */}
                        <div className="space-y-4 text-[#0d1b3e] text-sm  dark:text-[#cfcfcf]">
                          <h3 className="font-semibold text-[#1e2a50] dark:text-[#fcfcfc] ">
                            Leave Records
                          </h3>

                          {/* Leave Records Box */}
                          <div className="border dark:border-[#8e8d8d] rounded-xl p-4 space-y-3">
                            {[
                              { label: "Sick Leave", value: "2" },
                              { label: "Casual Leave", value: "2" },
                            ].map((item) => (
                              <div
                                key={item.label}
                                className="flex items-center justify-between"
                              >
                                <span>{item.label}</span>
                                <input
                                  className="w-20 border border-gray-300 rounded-md px-2 py-1 text-center text-[#0d1b3e] shadow-sm focus:outline-none dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d]"
                                  value={item.value}
                                  readOnly
                                />
                              </div>
                            ))}
                          </div>

                          <div className="space-y-4 text-[#0d1b3e] text-sm  dark:text-[#cfcfcf]">
                            {/* Deductions */}
                            <div className="flex items-center gap-3">
                              <label
                                htmlFor="deductions"
                                className="w-32 font-medium"
                              >
                                Deductions
                              </label>
                              <input
                                type="checkbox"
                                checked
                                className="w-5 h-5 border border-gray-400 rounded accent-[#576CBC]"
                                readOnly
                              />
                            </div>

                            {/* Approved Days */}
                            <div className="flex items-center gap-3 dark:bg-[#2c2c2c] ">
                              <label
                                className="font-medium text-sm dark:bg-[#2c2c2c]"
                                htmlFor="approveddays"
                              >
                                Approved Days
                              </label>
                              <div className="relative w-full">
                                <input
                                  type="text"
                                  value={
                                    selectedLeave?.status === "APPROVED" ||
                                      selectedLeave?.status === "REJECTED"
                                      ? selectedLeave?.approvedDays || ""
                                      : approvedDays
                                  }
                                  onChange={(e) =>
                                    selectedLeave?.status === "WAITINGLIST" &&
                                    setApprovedDays(e.target.value)
                                  }
                                  className="w-full border border-[#bfc6db] rounded-md px-4 py-2 text-[#012A4A] pr-10 shadow-sm 
    dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d]"
                                  disabled={
                                    selectedLeave?.status !== "WAITINGLIST"
                                  }
                                />
                              </div>
                            </div>

                            {/* From Date */}
                            <div className="flex items-center gap-3">
                              <label
                                htmlFor="fromdate"
                                className="w-32 font-medium"
                              >
                                From Date
                              </label>
                              <div className="relative w-full">
                                <input
                                  type="date"
                                  value={
                                    selectedLeave?.status === "APPROVED" ||
                                      selectedLeave?.status === "REJECTED"
                                      ? selectedLeave.fromDate || ""
                                      : fromDate
                                  }
                                  onChange={(e) =>
                                    selectedLeave?.status === "WAITINGLIST" &&
                                    setFromDate(e.target.value)
                                  }
                                  className="w-full border border-[#a6b0c3] rounded-md px-4 py-2 text-gray-600 text-xs dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d] "
                                  disabled={
                                    selectedLeave?.status !== "WAITINGLIST"
                                  }
                                />
                              </div>
                            </div>

                            {/* To Date */}
                            <div className="flex items-center gap-3">
                              <label
                                htmlFor="todate"
                                className="w-32 font-medium"
                              >
                                To Date
                              </label>
                              <div className="relative w-full">
                                <input
                                  type="date"
                                  value={
                                    selectedLeave?.status === "APPROVED" ||
                                      selectedLeave?.status === "REJECTED"
                                      ? selectedLeave?.toDate || ""
                                      : toDate
                                  }
                                  onChange={(e) =>
                                    selectedLeave?.status === "WAITINGLIST" &&
                                    setToDate(e.target.value)
                                  }
                                  className="w-full border border-[#a6b0c3] rounded-md px-4 py-2 text-gray-600 text-xs dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d] "
                                  disabled={
                                    selectedLeave?.status !== "WAITINGLIST"
                                  }
                                />
                              </div>
                            </div>

                            {/* Deduction Days */}
                            <div className="flex items-center gap-3">
                              <label
                                htmlFor="deductiondays"
                                className="w-32 font-medium"
                              >
                                Deduction Days
                              </label>
                              <div className="relative w-full">
                                <input
                                  type="text"
                                  value={
                                    selectedLeave?.status === "APPROVED" ||
                                      selectedLeave?.status === "REJECTED"
                                      ? selectedLeave?.deductionDays || ""
                                      : deductionDays
                                  }
                                  onChange={(e) =>
                                    selectedLeave?.status === "WAITINGLIST" &&
                                    setDeductionDays(e.target.value)
                                  }
                                  className="w-full border border-[#a6b0c3] rounded-md px-4 py-2 text-gray-600 text-xs dark:text-[#cfcfcf] dark:bg-[#2c2c2c] dark:border-[#8e8d8d] "
                                  disabled={
                                    selectedLeave?.status !== "WAITINGLIST"
                                  }
                                />

                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-4 mt-6">
                        {selectedLeave?.status === "WAITINGLIST" ? (
                          <>
                            {/* Decline Button */}
                            <button
                              onClick={() => setSelectedLeave(null)}
                              className="px-4 py-1 border border-[#576CBC] text-[#576CBC] rounded-lg transition"
                            >
                              Decline
                            </button>

                            {/* Approve Button */}
                            <button
                              onClick={handleApprove}
                              className="px-4 py-1 bg-[#576CBC] text-white rounded-lg hover:bg-[#576CBC] transition"
                            >
                              Approve
                            </button>
                          </>
                        ) : selectedLeave?.status === "APPROVED" ||
                          selectedLeave?.status === "REJECTED" ? (
                          <>
                            {/* Disabled Decline Button */}
                            <button
                              disabled
                              className="px-4 py-1 border border-[#576CBC] text-[#576CBC] rounded-lg opacity-50 cursor-not-allowed"
                            >
                              Decline
                            </button>

                            {/* Disabled Approve Button */}
                            <button
                              disabled
                              className="px-4 py-1 bg-[#576CBC] text-white rounded-lg opacity-50 cursor-not-allowed"
                            >
                              Approve
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}

                {isLeaveFilterModalOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center overflow-auto">
                    <div className="w-full max-w-md bg-white dark:bg-[#252525] rounded-2xl shadow-lg overflow-hidden m-4 relative">
                      <button
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
                        onClick={() => setIsLeaveFilterModalOpen(false)}
                        aria-label="Close"
                      >
                        ×
                      </button>
                      <div className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold mb-2 dark:text-[#fff]">
                          Filter by
                        </h2>
                        <div className="flex flex-col gap-3">
                          <label className="text-sm font-medium text-gray-700 dark:text-[#fff] mt-2">
                            Employee Name
                          </label>
                          <input
                            type="text"
                            className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm"
                            placeholder="Enter name"
                            value={leaveFilterName}
                            onChange={(e) => setLeaveFilterName(e.target.value)}
                          />
                          <label className="text-sm font-medium text-gray-700 dark:text-[#fff]">
                            Role
                          </label>
                          <select
                            className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm"
                            value={leaveFilterRole}
                            onChange={(e) => setLeaveFilterRole(e.target.value)}
                          >
                            <option value="">All Roles</option>
                            <option value="SUPERVISOR">Supervisor</option>
                            <option value="ACADEMICCOACH">
                              Academic Coach
                            </option>
                            <option value="TEACHER">Teacher</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                          <label className="text-sm font-medium text-gray-700 dark:text-[#fff]">
                            Status
                          </label>
                          <select
                            className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm"
                            value={leaveFilterStatus}
                            onChange={(e) =>
                              setLeaveFilterStatus(e.target.value)
                            }
                          >
                            <option value="">All Statuses</option>
                            <option value="APPROVED">Approved</option>
                            <option value="WAITINGLIST">Waiting List</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="text-sm font-medium text-gray-700 dark:text-[#fff]">
                                From Date
                              </label>
                              <input
                                type="date"
                                className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm w-full"
                                value={
                                  leaveFilterFrom
                                    ? leaveFilterFrom
                                      .toISOString()
                                      .split("T")[0]
                                    : ""
                                }
                                onChange={(e) =>
                                  setLeaveFilterFrom(
                                    e.target.value
                                      ? new Date(e.target.value)
                                      : null
                                  )
                                }
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-sm font-medium text-gray-700 dark:text-[#fff]">
                                To Date
                              </label>
                              <input
                                type="date"
                                className="border dark:border-[#5C5C5C] dark:bg-[#343434] rounded px-3 py-2 text-sm w-full"
                                value={
                                  leaveFilterTo
                                    ? leaveFilterTo.toISOString().split("T")[0]
                                    : ""
                                }
                                onChange={(e) =>
                                  setLeaveFilterTo(
                                    e.target.value
                                      ? new Date(e.target.value)
                                      : null
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                          <button
                            className="flex-1 border border-[#576CBC] text-[#576CBC] rounded-lg py-2 font-medium"
                            onClick={() => {
                              setLeaveFilterName("");
                              setLeaveFilterRole("");
                              setLeaveFilterStatus("");
                              setLeaveFilterFrom(null);
                              setLeaveFilterTo(null);
                            }}
                          >
                            Reset
                          </button>
                          <button
                            className="flex-1 bg-[#576CBC] text-white rounded-lg py-2 font-medium"
                            onClick={() => setIsLeaveFilterModalOpen(false)}
                          >
                            Show results
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center overflow-auto">
          <div className="w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-lg overflow-hidden m-4">
            <div className="h-full overflow-y-auto p-6 space-y-6">
              <h2 className="text-xl font-semibold mb-4">Add Employee</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "First name", name: "firstName", type: "text" },
                  { label: "Last name", name: "lastName", type: "text" },
                  { label: "Email", name: "email", type: "email" },
                  {
                    label: "Phone number",
                    name: "phoneNumber",
                    type: "number",
                  },
                  { label: "City", name: "city", type: "text" },
                  { label: "Nationality", name: "nationality", type: "text" },
                  { label: "Date of Birth", name: "dateOfBirth", type: "date" },
                  { label: "Country", name: "country", type: "text" },
                  { label: "Gender", name: "gender", type: "text" },
                  {
                    label: "Residential Address",
                    name: "residentialAddress",
                    type: "text",
                    full: true,
                  },
                  {
                    label: "Highest Qualification",
                    name: "higherQualification",
                    type: "text",
                  },
                  {
                    label: "University/Institute Name",
                    name: "universityName",
                    type: "text",
                  },
                  {
                    label: "Previous Job Title",
                    name: "previousJob",
                    type: "text",
                  },
                  {
                    label: "Experience (in years)",
                    name: "experience",
                    type: "text",
                  },
                  { label: "Bank Name", name: "bankName", type: "text" },
                  {
                    label: "Account Number",
                    name: "accountNumber",
                    type: "number",
                  },
                  {
                    label: "Bank Code",
                    name: "bankCode",
                    type: "text",
                    full: true,
                  },
                  {
                    label: "Passport Number",
                    name: "passportNumber",
                    type: "text",
                  },
                  {
                    label: "Emergency Contact Number",
                    name: "emergencyContactNumber",
                    type: "number",
                  },
                  {
                    label: "Relationship with Employee",
                    name: "relationshipWithEmployee",
                    type: "text",
                  },
                  {
                    label: "Address",
                    name: "address",
                    type: "text",
                    full: true,
                  },
                  { label: "Designation", name: "designation", type: "text" },
                  { label: "Department", name: "department", type: "text" },
                  {
                    label: "Preferred Working Hours",
                    name: "preferedWorkingHours",
                    type: "number",
                  },
                ].map((field, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${field.full ? "col-span-2" : ""
                      }`}
                  >
                    <label className="text-xs font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={
                        Array.isArray(
                          formData[field.name as keyof OtherEmployeess]
                        )
                          ? (
                            formData[
                            field.name as keyof OtherEmployeess
                            ] as string[]
                          ).join(", ")
                          : formData[field.name as keyof OtherEmployeess] ?? ""
                      }
                      onChange={(e) => {
                        if (
                          field.name === "languagesKnown" ||
                          field.name === "preferedWorkingDays"
                        ) {
                          setFormData((prev) => ({
                            ...prev,
                            [field.name]: e.target.value
                              .split(",")
                              .map((item) => item.trim()),
                          }));
                        } else {
                          handleChange(e);
                        }
                      }}
                      className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-xs"
                    />
                  </div>
                ))}

                {/* Time Picker with Formatting */}
                {["preferedShiftFrom", "preferedShiftTo"].map((name, index) => (
                  <div key={index} className="flex flex-col">
                    <label className="text-xs font-medium text-gray-700 mb-1">
                      {name === "preferedShiftFrom"
                        ? "Preferred Shift From"
                        : "Preferred Shift To"}
                    </label>
                    <input
                      type="time"
                      name={name}
                      onChange={(e) => {
                        const formatted = formatTime(e.target.value);
                        setFormData((prev) => ({ ...prev, [name]: formatted }));
                      }}
                      className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-xs"
                    />
                  </div>
                ))}

                {/* Language Input */}
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                    Languages Known
                  </label>
                  <input
                    type="text"
                    name="languagesKnown"
                    value={formData.languagesKnown.join(", ")}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        languagesKnown: e.target.value
                          .split(",")
                          .map((item) => item.trim()),
                      }))
                    }
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-xs"
                  />
                </div>

                {/* Currency Dropdown */}
                <div>
                  <label className="text-xs font-medium text-gray-700 block">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-xs"
                  >
                    <option value="">Select Currency</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="INR">INR</option>
                    <option value="AED">AED</option>
                  </select>
                </div>

                {/* Expected Salary */}
                <div>
                  <label className="text-xs font-medium text-gray-700 block">
                    Expected Salary
                  </label>
                  <input
                    type="number"
                    name="expectedSalary"
                    value={formData.expectedSalary}
                    onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-xs"
                  />
                </div>

                {/* Working Days Checkbox */}
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-700 block">
                    Preferred Working Days
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day) => (
                      <label
                        key={day}
                        className="flex items-center space-x-2 text-xs"
                      >
                        <input
                          type="checkbox"
                          value={day}
                          checked={formData.preferedWorkingDays.includes(day)}
                          onChange={(e) => {
                            const { checked, value } = e.target;
                            setFormData((prev) => {
                              const days = new Set(prev.preferedWorkingDays);
                              checked ? days.add(value) : days.delete(value);
                              return {
                                ...prev,
                                preferedWorkingDays: Array.from(days),
                              };
                            });
                          }}
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Profile Image */}
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-700 block">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData((prev) => ({
                            ...prev,
                            profileImage: reader.result as string,
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs bg-gray-100 border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                {/* Comments */}
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-700 block">
                    Additional Comments
                  </label>
                  <textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-400 rounded-lg text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-900 text-white rounded-lg text-sm hover:bg-blue-800"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </BaseLayout4>
  );
};

export default Page;
