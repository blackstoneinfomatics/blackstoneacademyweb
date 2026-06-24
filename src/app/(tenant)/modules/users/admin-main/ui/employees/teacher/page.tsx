"use client";

import React, { useEffect, useState } from "react";
import { dateFnsLocalizer, Views } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { FaUserGraduate } from "react-icons/fa6";
import { FaRegEye, FaCalendarAlt } from "react-icons/fa";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import TeacherHeader from "@/app/(tenant)/modules/users/teacher/components/TeacherHeader";
import { Search, Users } from "lucide-react";
import { MdTune } from "react-icons/md";
import Pagination from "@/components/Pagination";
import FilterModal, { FilterField } from "@/components/FilterModal";
import BaseLayout4 from "../../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
interface StudentData {
  studentId: string;
  name: string;
  studentDetails: StudentDetails;
}

interface StudentDetails {
  student: Student;
  teacher: Teacher;
  subscription: Subscription;
  _id: string;
  academicCoachId: string;
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
  status: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  updatedBy: string;
  expectedFinishingDate: number;
  assignedTeacherId: string;
  assignedTeacherEmail: string;
  __v: number;
  teacherStatus: string;
}

interface Student {
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentGender?: string;
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

interface Teacher {
  teacherName: string;
}

interface Subscription {
  subscriptionName: string;
}

interface User {
  _id: string;
  userName: string;
  email: string;
  password: string;
  role: string[];
  profileImage: string | null;
  status: string;
  createdBy: string;
  lastUpdatedBy: string;
  userId: string;
  lastLoginDate: string;
  createdDate: string;
  lastUpdatedDate: string;
  gender: string;
  position: string;
  contact: string;
  country: string;
  city: string;
}
interface ScheduledClass {
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
  _id: string;
  classDay: string[];
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
}

interface WageData {
  _id: string;
  employeeId: string;
  employeeName: string;
  classType: {
    className: string;
    hoursMins: string;
    rate: string;
    currency: string;
  };
  status: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  updatedBy: string;
}

interface WagesResponse {
  employeeId: string;
  totalhours: number;
  totalearnings: number;
  monthlyData: Array<{
    year: number;
    month: number;
    totalhours: number;
  }>;
  wageRecords: WageData[];
}

interface MonthlyData {
  year: number;
  month: number; // 1 to 12
  totalclasses: number;
  totalstudents: number;
  totalhours: number;
  totalearnings: number;
}

interface TeacherCounts {
  totalclasses: number;
  totalstudents: number;
  totalhours: number;
  totalearnings: number;
  monthlyData?: MonthlyData[];
}

interface Student {
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
}

interface ShiftSchedule {
  date: string;
  day: string;
  fromTime: string;
  toTime: string;
}

interface TeacherOverview {
  studentCount: number;
  absentDays: number;
  totalClasses: number;
  totalEarned: number;
  leave: number;
  rescheduled: number;
}

interface SalaryWageRecord {
  _id: string;
  status: string;
  designation: string;
  employeeId: string;
  __v: number;
  balanceAmount: number;
  createdBy: string;
  createdDate: string;
  deductionAmount: number;
  employeeMail: string;
  employeeName: string;
  isSalaryProcessed: boolean;
  paymentMethod: string;
  paymentStatus: string;
  salaryAmount: number;
  comments: string;
}

const Teacher = () => {
  const [activeTab, setActiveTab] = useState("Students List");
  const [view, setView] = useState<"month" | "week" | "day" | "agenda">(
    "agenda"
  );
  const tabs = [
    "Students List",
    "Scheduled Class",
    "Earnings",
    "Payments",
    "Wages",
    "Working Hours",
  ];
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("teacherId");

  const [users, setUsers] = useState<User>();
  const [scheduledclass, setScheduledClass] = useState<ScheduledClass[]>([]);
  const [wages, setWages] = useState<WageData[]>([]);
  const [wagesResponse, setWagesResponse] = useState<WagesResponse | null>(
    null
  );

  const [students, setStudents] = useState<StudentData[]>([]);
  const [teacherCounts, setTeacherCounts] = useState<TeacherCounts>({
    totalclasses: 0,
    totalstudents: 0,
    totalhours: 0,
    totalearnings: 0,
  });
  const [schedule, setSchedule] = useState<ShiftSchedule[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchScheduledClass, setSearchScheduledClass] = useState("");
  const [searchPayments, setSearchPayments] = useState("");
  const [searchWages, setSearchWages] = useState("");
  const [searchWorkingHours, setSearchWorkingHours] = useState("");
  const [searchEarnings, setSearchEarnings] = useState("");
  const [selectedSalary, setSelectedSalary] = useState<SalaryWageRecord | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Filtered Earnings (months)
  const handleViewDownload = (item: SalaryWageRecord) => {
    setSelectedSalary(item);
    setIsReceiptModalOpen(true);
  };
  const filteredEarningsMonths = Array.from({ length: 12 })
    .map((_, index) => {
      const monthNumber = index + 1;
      const currentYear = new Date().getFullYear();
      const monthName = new Date(0, index).toLocaleString("default", {
        month: "short",
      });
      const monthly = teacherCounts.monthlyData?.find(
        (item) => item.month === monthNumber && item.year === currentYear
      );
      return {
        key: `${monthName}-${currentYear}`,
        monthName,
        currentYear,
        monthly,
      };
    })
    .filter((row) => {
      const searchFields = [row.monthName, row.currentYear];

      let matchesFilters = true;
      if (
        filters.month &&
        row.monthly &&
        row.monthly.month.toString() !== filters.month
      ) {
        matchesFilters = false;
      }
      if (filters.year && row.currentYear.toString() !== filters.year) {
        matchesFilters = false;
      }

      const matchesSearch = searchFields.some((field) =>
        field
          ? field
            .toString()
            .toLowerCase()
            .includes(searchEarnings.toLowerCase())
          : false
      );

      return matchesSearch && matchesFilters;
    })
    .sort((a, b) => {
      const monthOrder = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      return (
        b.currentYear - a.currentYear ||
        monthOrder.indexOf(b.monthName) - monthOrder.indexOf(a.monthName)
      );
    });

  const [teacherOverview, setTeacherOverview] =
    useState<TeacherOverview | null>(null);
  const [salaryWages, setSalaryWages] = useState<SalaryWageRecord[]>([]);

  const [earningsPage, setEarningsPage] = useState(1);
  const earningsPerPage = 5;
  const totalEarningsPages = Math.ceil(
    filteredEarningsMonths.length / earningsPerPage
  );
  const paginatedEarnings = filteredEarningsMonths.slice(
    (earningsPage - 1) * earningsPerPage,
    earningsPage * earningsPerPage
  );

  const statusStyle = {
    Complete: "bg-[#002F56] text-white",
    Pending: "bg-gray-300 text-gray-700",
    Rescheduled: "bg-yellow-300 text-black",
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const handleSaveRate = async (
    wageId: string,
    rate?: string,
    hoursMins?: string
  ) => {
    try {
      const token = localStorage.getItem("AdminAuthToken");
      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return;
      }

      // Step 2: Find wage to update
      const wageToUpdate = wages.find((wage) => wage._id === wageId);
      if (!wageToUpdate) {
        console.warn("⚠️ Wage not found for ID:", wageId);
        return;
      }


      // Step 3: Construct updated object
      const updatedClassType = {
        ...wageToUpdate.classType,
        ...(rate !== undefined && rate !== "" && { rate }),
        ...(hoursMins !== undefined && hoursMins !== "" && { hoursMins }),
      };

      const updatedWage = {
        ...wageToUpdate,
        classType: updatedClassType,
      };


      // Step 4: Send API request
      const response = await axios.put(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.OTHEREMPLOYEE.UPDATE_EMP_WAGES}/${wageId}`,
        updatedWage,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Step 5: Update local state
      setWages((prevWages) =>
        prevWages.map((wage) => (wage._id === wageId ? updatedWage : wage))
      );
    } catch (error: any) {
      // Step 6: Show detailed error
      console.error("❌ Error updating wage rate:", error.message || error);
      if (error.response) {
        console.error("🚨 Backend error response:", error.response.data);
      }
    }
  };

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AdminAuthToken")
        : null;

    if (!token) {
      console.error("❌ AdminAuthToken not found");
      return;
    }

    if (token && employeeId && employeeId !== "null") {
      fetchUsers(token);
      fetchSchedule(token);
      fetchWages(token);
      fetchClasses(token);
    } else {
      console.log("No auth token or employee ID found.");
    }
  }, [employeeId]); // re-run if employeeId changes

  const fetchUsers = async (token: string) => {
    try {
      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.USER.GET}/${employeeId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchSchedule = async (token: string) => {
    try {
      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TEACHER_CLASSES}?teacherId=${employeeId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Fetched schedule List>>>>:", response.data.classScheduleList);
      setScheduledClass(response.data.classScheduleList || []);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem("AdminAuthToken");
      
        const res = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.DASHBOARD.GET_TEACHER_COUNTS}`,
          {
            params: { teacherId: employeeId },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTeacherCounts(res.data);
      } catch (error: any) {
        console.error("Error fetching teacher counts:", error.message);
        if (error.response) {
          console.error("Server responded with:", error.response.data);
        }
      }
    };

    fetchCounts();
  }, []);

  const fetchWages = async (token: string) => {
    try {
      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.OTHEREMPLOYEE.GET_OTHER_EMPLOYEE_WAGES}?employeeId=${employeeId}`,
        {
          params: {
            employeeId: employeeId,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data: WagesResponse = response.data;
      setWagesResponse(data);
      setWages(data.wageRecords || []);
    } catch (error) {
      console.error("Error fetching wages:", error);
    }
  };

  const fetchClasses = async (token: string) => {
    try {
      const res = await axios.get<StudentData[]>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TEACHER_CLASS_LIST}?teacherId=${employeeId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStudents(res.data);
    } catch (error) {
      console.error("Failed to fetch classes", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AdminAuthToken")
          : null;

      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return;
      }
      try {
        const res = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.SHIFTSCHEDULE.GET}/${employeeId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSchedule(res.data || []);
      } catch (error) {
        console.error("Error fetching schedule:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchTeacherOverview = async () => {
      if (!employeeId) return;
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AdminAuthToken")
          : null;
      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return;
      }
      try {
        const res = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.RECRUITMENT.GET_TEACHER_OVERVIEW}?teacherId=${employeeId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTeacherOverview(res.data);
      } catch (error) {
        console.error("Error fetching teacher overview:", error);
      }
    };
    fetchTeacherOverview();
  }, [employeeId]);

  useEffect(() => {
    const fetchSalaryWages = async () => {
      if (!employeeId) return;
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AdminAuthToken")
          : null;
      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return;
      }
      try {
        const res = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.OTHEREMPLOYEE.SALARY_WAGES}?employeeId=${employeeId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSalaryWages(res.data.records || []);
      } catch (error) {
        console.error("Error fetching salary wages:", error);
      }
    };
    fetchSalaryWages();
  }, [employeeId]);


  const router = useRouter();

  const handleclickcalender = () => {
    router.push(
      `/modules/users/admin-main/ui/employees/teacher/calendar?teacherId=${employeeId}`
    );
  };

  const formatTime = (timeStr: string): string => {
    const [hour, minute] = timeStr.split(":");
    const date = new Date();
    date.setHours(Number(hour), Number(minute));
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // disables AM/PM
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchTerm(query);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredStudents = students.filter((item) => {
    const student = item.studentDetails?.student;
    const searchFields = [
      item.studentId,
      student?.studentFirstName,
      student?.studentLastName,
      student?.studentCountry,
      student?.learningInterest,
      student?.preferredTeacher,
      student?.status,
    ];

    let matchesFilters = true;
    if (
      filters.studentName &&
      student &&
      `${student.studentFirstName} ${student.studentLastName}` !==
      filters.studentName
    ) {
      matchesFilters = false;
    }
    if (
      filters.country &&
      student &&
      student.studentCountry !== filters.country
    ) {
      matchesFilters = false;
    }
    if (
      filters.subject &&
      student &&
      student.learningInterest !== filters.subject
    ) {
      matchesFilters = false;
    }

    const matchesSearch = searchFields.some((field) =>
      field
        ? field.toString().toLowerCase().includes(searchTerm.toLowerCase())
        : false
    );

    return matchesSearch && matchesFilters;
  });

  // Filtered scheduled classes for search
  const filteredScheduledClass = (scheduledclass || []).filter((event) => {
    const searchFields = [
      event.student.studentFirstName,
      event.student.studentId,
      event.sessionClassType,
      event.startDate,
    ];

    let matchesFilters = true;

    if (
      filters.studentName &&
      `${event.student.studentFirstName} ${event.student.studentLastName}` !==
      filters.studentName
    ) {
      matchesFilters = false;
    }
    if (
      filters.classType &&
      event.sessionClassType.toLowerCase() !== filters.classType.toLowerCase()
    ) {
      matchesFilters = false;
    }
    if (
      filters.status &&
      event.scheduleStatus.toLowerCase() !== filters.status.toLowerCase()
    ) {
      matchesFilters = false;
    }
    if (filters.dateRange) {
      const startDate = new Date(event.startDate);
      const from = filters.dateRange.from
        ? new Date(filters.dateRange.from)
        : null;
      const to = filters.dateRange.to ? new Date(filters.dateRange.to) : null;
      if (from && startDate < from) {
        matchesFilters = false;
      }
      if (to && startDate > to) {
        matchesFilters = false;
      }
    }

    const matchesSearch = searchFields.some((field) =>
      field
        ? field
          .toString()
          .toLowerCase()
          .includes(searchScheduledClass.toLowerCase())
        : false
    );
    return matchesSearch && matchesFilters;
  });

  // Payments tab: filter salaryWages by search, status, and date range
  const filteredSalaryWages = salaryWages.filter((item) => {
    // Search logic
    const searchFields = [
      new Date(item.createdDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      item.salaryAmount,
      item.deductionAmount,
      item.paymentMethod,
      item.paymentStatus,
      item.employeeName,
      item.designation,
    ];
    const matchesSearch = searchFields.some((field) =>
      field
        ? field.toString().toLowerCase().includes(searchPayments.toLowerCase())
        : false
    );
    // Status filter
    let matchesStatus = true;
    if (filters.status && filters.status.length > 0) {
      matchesStatus =
        item.paymentStatus.toLowerCase() === filters.status.toLowerCase();
    }
    // Date range filter
    let matchesDate = true;
    if (
      filters.paymentDate &&
      (filters.paymentDate.from || filters.paymentDate.to)
    ) {
      const itemDate = new Date(item.createdDate);
      const from = filters.paymentDate.from
        ? new Date(filters.paymentDate.from)
        : null;
      const to = filters.paymentDate.to
        ? new Date(filters.paymentDate.to)
        : null;
      if (from && itemDate < from) matchesDate = false;
      if (to && itemDate > to) matchesDate = false;
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Filtered Wages
  const filteredWages = Array.isArray(wages)
    ? wages.filter((item) => {
      const searchFields = [
        item.classType?.className || "",
        item.classType?.rate || "",
        item.classType?.currency || "",
      ];

      let matchesFilters = true;
      if (
        filters.className &&
        item.classType &&
        !item.classType.className
          .toLowerCase()
          .includes(filters.className.toLowerCase())
      ) {
        matchesFilters = false;
      }
      if (
        filters.currency &&
        item.classType &&
        item.classType.currency.toLowerCase() !==
        filters.currency.toLowerCase()
      ) {
        matchesFilters = false;
      }

      const matchesSearch = searchFields.some((field) =>
        field.toString().toLowerCase().includes(searchWages.toLowerCase())
      );

      return matchesSearch && matchesFilters;
    })
    : [];

  // Filtered Working Hours
  const filteredWorkingHours = schedule.filter((item) => {
    const searchFields = [item.day, item.date];

    let matchesFilters = true;
    if (filters.day && item.day.toLowerCase() !== filters.day.toLowerCase()) {
      matchesFilters = false;
    }
    if (filters.date) {
      const itemDate = new Date(item.date);
      const from = filters.date.from ? new Date(filters.date.from) : null;
      const to = filters.date.to ? new Date(filters.date.to) : null;
      if (from && itemDate < from) {
        matchesFilters = false;
      }
      if (to && itemDate > to) {
        matchesFilters = false;
      }
    }

    const matchesSearch = searchFields.some((field) =>
      field
        ? field
          .toString()
          .toLowerCase()
          .includes(searchWorkingHours.toLowerCase())
        : false
    );
    return matchesSearch && matchesFilters;
  });

  const groupedWorkingHours = Object.values(
    filteredWorkingHours.reduce((acc, item) => {
      acc[item.day] = item; // Only the last entry per day
      return acc;
    }, {} as Record<string, any>)
  );
  const weekOrder = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const sortedWorkingHours = groupedWorkingHours.sort((a, b) => {
    return weekOrder.indexOf(a.day) - weekOrder.indexOf(b.day);
  });

  const [wagesPage, setWagesPage] = useState(1);
  const wagesPerPage = 5;
  const totalWagesPages = Math.ceil(filteredWages.length / wagesPerPage);
  const paginatedWages = filteredWages.slice(
    (wagesPage - 1) * wagesPerPage,
    wagesPage * wagesPerPage
  );

  const studentNameOptions = students
    .map((s) =>
      s.studentDetails?.student
        ? `${s.studentDetails.student.studentFirstName} ${s.studentDetails.student.studentLastName}`
        : null
    )
    .filter((v, i, a) => a.indexOf(v) === i && v !== null)
    .map((name) => ({ value: name!, label: name! }));

  const scheduleStudentNameOptions = (scheduledclass || [])
    .map((s) =>
      s.student
        ? `${s.student.studentFirstName} ${s.student.studentLastName}`
        : null
    )
    .filter((v, i, a) => a.indexOf(v) === i && v !== null)
    .map((name) => ({ value: name!, label: name! }));

  const scheduleStatusOptions = (scheduledclass || [])
    .map((s) => s.scheduleStatus)
    .filter((v, i, a) => a.indexOf(v) === i && v !== null && v !== undefined)
    .map((status) => ({ value: status!, label: status! }));

  const countryOptions = students
    .map((s) => s.studentDetails?.student?.studentCountry)
    .filter((v, i, a) => a.indexOf(v) === i && v !== null && v !== undefined)
    .map((country) => ({ value: country!, label: country! }));

  const subjectOptions = students
    .map((s) => s.studentDetails?.student?.learningInterest)
    .filter((v, i, a) => a.indexOf(v) === i && v !== null && v !== undefined)
    .map((subject) => ({ value: subject!, label: subject! }));

  const studentslistFilterFields: FilterField[] = [
    {
      name: "studentName",
      label: "Student Name",
      type: "select",
      options: studentNameOptions,
    },
    {
      name: "country",
      label: "Country",
      type: "select",
      options: countryOptions,
    },
    {
      name: "subject",
      label: "Subject",
      type: "select",
      options: subjectOptions,
    },
  ];

  const scheduledClassFilterFields: FilterField[] = [
    {
      name: "studentName",
      label: "Student Name",
      type: "select",
      options: scheduleStudentNameOptions,
    },
    {
      name: "classType",
      label: "Class Type",
      type: "select",
      options: [
        { value: "trial", label: "Trial" },
        { value: "regular", label: "Regular" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: scheduleStatusOptions,
    },
    { name: "dateRange", label: "Date", type: "date-range" },
  ];

  const earningsFilterFields: FilterField[] = [
    {
      name: "month",
      label: "Month",
      type: "select",
      options: Array.from({ length: 12 }, (_, i) => ({
        value: (i + 1).toString(),
        label: new Date(0, i).toLocaleString("default", { month: "long" }),
      })),
    },
    { name: "year", label: "Year", type: "text" },
  ];

  const paymentsFilterFields: FilterField[] = [
    { name: "paymentDate", label: "Payment Date", type: "date-range" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "paid", label: "Paid" },
        { value: "pending", label: "Pending" },
      ],
    },
  ];

  const wagesFilterFields: FilterField[] = [
    { name: "className", label: "Class Name", type: "text" },
    {
      name: "currency",
      label: "Currency",
      type: "select",
      options: [
        { value: "usd", label: "USD" },
        { value: "eur", label: "EUR" },
      ],
    },
  ];

  const workingHoursFilterFields: FilterField[] = [
    {
      name: "day",
      label: "Day",
      type: "select",
      options: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ].map((d) => ({ value: d.toLowerCase(), label: d })),
    },
    { name: "date", label: "Date", type: "date-range" },
  ];

  const getFilterFieldsForTab = (tab: string) => {
    switch (tab) {
      case "Students List":
        return studentslistFilterFields;
      case "Scheduled Class":
        return scheduledClassFilterFields;
      case "Earnings":
        return earningsFilterFields;
      case "Payments":
        return paymentsFilterFields;
      case "Wages":
        return wagesFilterFields;
      case "Working Hours":
        return workingHoursFilterFields;
      default:
        return [];
    }
  };

  const formatClassName = (name: string) => {
    if (!name) return "-";

    // Remove wrong spaces like "TRAILCLAS S" → "TRAILCLASS"
    let cleaned = name.replace(/\s+/g, "");

    // Fix common spelling mistakes
    cleaned = cleaned.replace("TRAIL", "TRIAL").replace("GRUOP", "GROUP");

    // Add space before CLASS
    return cleaned.replace(/CLASS$/, " CLASS");
  };

  return (
    <BaseLayout4>
      <TeacherHeader
        currentSection="Employees"
        showBackPath="/modules/users/admin-main/ui/employees"
        showBackButton={true}
      />
      <div className="p-4 min-h-screen w-full">
        <div className="grid grid-cols-5 gap-2">
          {/* Left Card */}
          <div className="col-span-3 bg-[#5E6578] text-white px-4 py-3 rounded-lg shadow-sm flex flex-row">
            <div className="flex flex-col items-center w-[30%] pr-4 py-6 border-r border-[#BCBCBC] gap-y-2">
              <div className="w-[90px] h-[90px] rounded-full overflow-hidden border border-white">
                <img
                  src="/assets/images/Avatar.png"
                  alt="Avatar"
                  className="object-cover w-full h-full"
                />
              </div>
              <h2 className="text-[12px] font-semibold text-center mt-2">
                {users?.userName}
              </h2>
              <span className="text-gray-300 text-center text-[10px]">
                {users?.email}
              </span>
            </div>

            <div className="flex flex-col md:w-1/2 gap-4 px-3 border-r border-[#BCBCBC]">
              <h4 className="text-[13px] font-semibold mb-2 py-2">
                Personal Info
              </h4>
              <div className="text-xs">
                <div className="py-2 flex flex-row justify-between">
                  <span className="text-gray-200">Contact:</span>{" "}
                  <span className="text-gray-200 px-2 text-[10px]">
                    {users?.contact}
                  </span>
                </div>
                <div className="py-2 flex flex-row justify-between">
                  <span className="text-gray-200">Country:</span>{" "}
                  <span className="text-gray-200 px-2 text-[10px]">
                    {users?.country}
                  </span>
                </div>
                <div className="py-2 flex flex-row justify-between">
                  <span className="text-gray-200">Gender:</span>{" "}
                  <span className="text-gray-200 px-2 text-[10px]">
                    {users?.gender}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:w-1/2 gap-4 px-3">
              <h4 className="text-[13px] font-semibold mb-2 py-4">
                {/* Educational Information */}
              </h4>
              <div className="text-xs">
                <div className="py-2 flex flex-row justify-between">
                  <span className="text-gray-200">Nationality:</span>{" "}
                  <span className="text-gray-200 px-2 text-[10px]">
                    {users?.country}
                  </span>
                </div>
                <div className="py-2 flex flex-row justify-between">
                  <span className="text-gray-200">Course:</span>{" "}
                  <span className="text-gray-200 px-2 text-[10px]">
                    {users?.position}
                  </span>
                </div>
                <div className="py-2 flex flex-row justify-between">
                  <span className="text-gray-200">Employment:</span>{" "}
                  <span className="text-gray-200 px-2 text-[10px]">
                    Full Time
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Analytics Panel */}
          <div className="col-span-2 bg-[#7689BD] px-3 py-3 rounded-lg shadow-sm text-white">
            <div className="bg-[#ADB5E0] text-[#0F2C59] text-xs px-3 py-[4px] rounded-md w-[90px] outline-none mb-3">
              <span>Quran</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {teacherOverview ? (
                [
                  { value: teacherOverview.studentCount, label: "Students" },
                  { value: teacherOverview.absentDays, label: "Absent Days" },
                  {
                    value: teacherOverview.totalClasses,
                    label: "Total Classes",
                  },
                  { value: teacherOverview.leave, label: "Days On Leave" },
                  {
                    value: `$${teacherOverview.totalEarned}`,
                    label: "Total Earned",
                  },
                  { value: teacherOverview.rescheduled, label: "Rescheduled" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-[#9DA4C4] rounded-lg p-2 bg-[#7689BD]"
                  >
                    <p className="text-base font-semibold text-white">
                      {item.value}
                    </p>
                    <p className="text-xs text-[#E0E2F1]">{item.label}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-xs text-gray-200">
                  Loading...
                </div>
              )}
            </div>
          </div>
        </div>

        {/*Table card */}
        <div className="mt-4  h-min">
          <div className="flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`px-3 py-[7px] text-xs font-medium focus:outline-none transition-all duration-200 ${activeTab === tab
                  ? "border-b border-b-[#576CBC] text-[#576CBC]"
                  : "text-[#010E30] dark:text-white"
                  }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="py-2">
            {activeTab === "Students List" && (
              <div className="">
                <div className="rounded-xl overflow-hidden">
                  <div className="flex flex-row sm:flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
                    <input
                      type="text"
                      placeholder="Search"
                      className="bg-transparent outline-none text-[12px] w-32 py-3"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                    <div className="relative">
                      <button
                        className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-3 border-r-2 border-l-2 px-48 cursor-pointer"
                        onClick={() => setIsFilterModalOpen(true)}
                      >
                        <MdTune className="w-4 h-4" />
                        <span>Filter</span>
                      </button>
                    </div>
                    <span className="text-[12px] text-gray-400 dark:text-gray-400 py-3">
                      Showing {filteredStudents.length === 0 ? 0 : 1} to{" "}
                      {filteredStudents.length} of {filteredStudents.length}
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
                            Student ID
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Student Name
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Country
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Package
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Subject
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Duration
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px] text-[#1D2939]">
                        {filteredStudents.slice(-5).reverse().length > 0 ? (
                          filteredStudents
                            .slice(-5)
                            .reverse()
                            .map((item, index) => {
                              const student = item.studentDetails?.student;
                              const subscription =
                                item.studentDetails?.subscription;
                              return (
                                <tr
                                  key={item.studentId || index}
                                  className={`text-left dark:text-white ${index % 2 === 0
                                    ? "bg-[#fff] dark:bg-[#2C2C2C]"
                                    : "bg-[#F8F8F8] dark:bg-[#303030]"
                                    }`}
                                >
                                  <td className="p-3">{student?.studentId}</td>
                                  <td className="p-3">
                                    {student?.studentFirstName}
                                  </td>
                                  <td className="p-3">
                                    {student?.studentCountry}
                                  </td>
                                  <td className="p-3">
                                    {subscription?.subscriptionName}
                                  </td>
                                  <td className="p-3">
                                    {student?.learningInterest}
                                  </td>
                                  <td className="p-3">30 min</td>
                                </tr>
                              );
                            })
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
                <div className="flex justify-end mt-4">
                  <button
                    className="bg-transparent border border-[#576CBC] text-[#576CBC] dark:bg-[#2e3343] text-[11px] px-3 py-1 rounded-md shadow transition"
                    onClick={() => {
                      router.push(
                        `/modules/users/admin-main/ui/employees/teacher/studentlist?teacherId=${employeeId}`
                      );
                    }}
                  >
                    View All
                  </button>
                </div>
              </div>
            )}

            {activeTab === "Scheduled Class" && (
              <div className="space-y-2 -mt-8">
                <div className="justify-end text-end">
                  <button
                    className={`font-medium text-[14px] ${view === "month"
                      ? "text-black"
                      : "text-white bg-[#576CBC] py-[4px] px-2 rounded"
                      }`}
                    onClick={handleclickcalender}
                  >
                    <FaCalendarAlt />
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden">
                  <div className="flex flex-row sm:flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
                    <input
                      type="text"
                      placeholder="Search"
                      className="bg-transparent outline-none text-[12px] w-32 py-3"
                      value={searchScheduledClass}
                      onChange={(e) => setSearchScheduledClass(e.target.value)}
                    />
                    <div
                      className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-3 border-r-2 border-l-2 px-48 cursor-pointer"
                      onClick={() => setIsFilterModalOpen(true)}
                    >
                      <MdTune className="w-4 h-4" />
                      <span>Filter</span>
                    </div>
                    <span className="text-[12px] text-gray-400 dark:text-gray-400 py-3">
                      Showing {filteredScheduledClass.length === 0 ? 0 : 1} to{" "}
                      {filteredScheduledClass.length} of{" "}
                      {filteredScheduledClass.length}
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
                            Student ID
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Student Name
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Courses
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Class Type
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Course Duration
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
                        {filteredScheduledClass.length > 0 ? (
                          filteredScheduledClass
                            .slice(-5)
                            .reverse()
                            .map((event, index) => (
                              <tr
                                key={event._id}
                                className={`text-left dark:text-white ${index % 2 === 0
                                  ? "bg-[#fff] dark:bg-[#2C2C2C]"
                                  : "bg-[#F8F8F8] dark:bg-[#303030]"
                                  }`}
                              >
                                <td className="p-3 text-blue-600 font-medium">
                                  {event.student.studentId}
                                </td>
                                <td className="p-3">
                                  {event.student.studentFirstName}
                                </td>
                                <td className="p-3">Quran</td>
                                <td className="p-3">
                                  {event.sessionClassType
                                    ? formatClassName(event.sessionClassType)
                                    : "-"}
                                </td>
                                <td className="p-3">30 Min</td>
                                <td className="p-3">
                                  {new Date(event.startDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </td>
                                <td className="p-3">
                                  {formatTime(event.startTime[0])} –{" "}
                                  {formatTime(event.endTime[0])}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`text-[9px] dark:bg-[#2E3C2E] dark:text-[#377E36] font-semibold px-3 py-[2px] rounded-md inline-block ${statusStyle[
                                      event.scheduleStatus as keyof typeof statusStyle
                                    ]
                                      }`}
                                  >
                                    {event.scheduleStatus}
                                  </span>
                                </td>
                              </tr>
                            ))
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
                </div>
                <div className="flex justify-end">
                  <button
                    className="bg-transparent border border-[#576CBC] text-[#576CBC] dark:bg-[#2e3343] text-[11px] px-3 py-1 rounded-md shadow transition"
                    onClick={() => {
                      router.push(
                        `/modules/users/admin-main/ui/employees/teacher/scheduledclass?teacherId=${employeeId}`
                      );
                    }}
                  >
                    View All
                  </button>
                </div>
              </div>
            )}

            {activeTab === "Earnings" && (
              <div>
                {(() => {
                  const totalClasses = paginatedEarnings.reduce(
                    (sum, item) => sum + (item.monthly?.totalclasses ?? 0),
                    0
                  );

                  const totalHours = paginatedEarnings.reduce(
                    (sum, item) => sum + (item.monthly?.totalhours ?? 0),
                    0
                  );

                  const totalEarnings = paginatedEarnings.reduce(
                    (sum, item) => sum + (item.monthly?.totalearnings ?? 0),
                    0
                  );

                  return (
                    <>
                      {/* Cards Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { title: "Total Classes", count: totalClasses },
                          { title: "Total Hours", count: totalHours },
                          { title: "Total Earnings", count: totalEarnings },
                        ].map((card) => (
                          <div
                            key={card.title}
                            className="bg-[#7689BD] text-white shadow-md rounded-xl flex flex-col w-full p-3 h-full"
                          >
                            <div className="flex flex-col justify-between gap-y-4">
                              <p className="text-[15px] font-medium">{card.title}</p>
                              <h3 className="text-[24px] font-semibold">${card.count}</h3>
                            </div>
                          </div>
                        ))}
                      </div>

                      <br />

                      {/* Table */}
                      <div className="overflow-x-auto max-h-none">
                        <table
                          className="w-full min-w-[900px] text-sm text-left table-auto"
                          style={{ width: "100%", tableLayout: "fixed" }}
                        >
                          <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                            <tr className="font-medium">
                              <th className="p-4">Month</th>
                              <th className="p-4">Total Classes</th>
                              <th className="p-4">Total Hours</th>
                              <th className="p-4">Total Earnings</th>
                            </tr>
                          </thead>

                          <tbody className="text-[10px] text-[#1D2939]">
                            {paginatedEarnings.length > 0 &&
                              paginatedEarnings.map((row, index) => (
                                <tr
                                  key={row.key}
                                  className={`text-left dark:text-white ${index % 2 === 0
                                    ? "bg-[#fff] dark:bg-[#2C2C2C]"
                                    : "bg-[#F8F8F8] dark:bg-[#303030]"
                                    }`}
                                >
                                  <td className="p-3">{`${row.monthName} ${row.currentYear}`}</td>
                                  <td className="p-3">{row.monthly?.totalclasses ?? 0}</td>
                                  <td className="p-3">{row.monthly?.totalhours ?? 0}</td>
                                  <td className="p-3">
                                    ${row.monthly?.totalearnings ?? 0}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  );
                })()}

                {/* Pagination */}
                {totalEarningsPages > 1 && (
                  <div className="flex justify-end mt-2">
                    <Pagination
                      currentPage={earningsPage}
                      totalPages={totalEarningsPages}
                      onPageChange={setEarningsPage}
                    />
                  </div>
                )}
              </div>
            )}



            {activeTab === "Payments" && (
              <div className="space-y-6">
                <div className="rounded-xl overflow-hidden">
                  <div className="flex flex-row sm:flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
                    <input
                      type="text"
                      placeholder="Search"
                      className="bg-transparent outline-none text-[12px] w-32 py-3"
                      value={searchPayments}
                      onChange={(e) => setSearchPayments(e.target.value)}
                    />
                    <div
                      className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 cursor-pointer"
                      onClick={() => setIsFilterModalOpen(true)}
                    >
                      <MdTune className="w-4 h-4" />
                      <span>Filter</span>
                    </div>
                    <span className="text-[12px] text-gray-400 dark:text-gray-400 py-3">
                      Showing {filteredSalaryWages.length === 0 ? 0 : 1} to{" "}
                      {filteredSalaryWages.length} of{" "}
                      {filteredSalaryWages.length}
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
                            Payment ID
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Payment Date
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Amount
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Paid For

                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Payment Method
                          </th>
                          {/* <th className="p-4 font-semibold text-[12px] text-left">
                            Description
                          </th> */}
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Comments for Reference
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Status
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px] text-[#1D2939]">
                        {filteredSalaryWages.length > 0 ? (
                          filteredSalaryWages
                            .slice(-5)
                            .reverse()
                            .map((item, index) => (
                              <tr
                                key={item._id}
                                className={`text-left dark:text-white ${index % 2 === 0
                                  ? "bg-[#fff] dark:bg-[#2C2C2C]"
                                  : "bg-[#F8F8F8] dark:bg-[#303030]"
                                  }`}
                              >
                                <td className="p-3">{item._id}</td>
                                <td className="p-3">
                                  {new Date(
                                    item.createdDate
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </td>
                                <td className="p-3">{item.salaryAmount}</td>
                                <td className="p-3">{item.deductionAmount}</td>
                                <td className="p-3">{item.paymentMethod}</td>
                                {/* <td className="p-3">{item.description}</td> */}
                                <td className="p-3">
                                  <span
                                    className={`inline-flex items-center justify-center gap-1 px-3 py-[1px] rounded-md text-[10px] font-semibold
                                    ${item.paymentStatus.toLowerCase() ===
                                        "pending"
                                        ? "bg-red-100 text-[#D34645] dark:bg-[#D3464533] dark:bg-opacity-20 dark:text-[#D34645]"
                                        : "bg-green-100 text-green-700 dark:bg-[#2E3C2E] dark:text-[#377E36] px-6"
                                      }
                                  `}
                                  >
                                    {item.paymentStatus}
                                  </span>
                                </td>
                                <td className="p-3 text-left">
                                  <button
                                    className="text-blue-500 text-[11px]"
                                    onClick={() => handleViewDownload(item)}
                                  >
                                    View / Download
                                  </button>
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
                <div className="flex justify-end">
                  <button
                    className="bg-transparent border border-[#576CBC] text-[#576CBC] dark:bg-[#2e3343] text-[11px] px-3 py-1 rounded-md shadow transition"
                    onClick={() => {
                      router.push(
                        `/modules/users/admin-main/ui/employees/teacher/payments?teacherId=${employeeId}`
                      );
                    }}
                  >
                    View All
                  </button>
                </div>
              </div>
            )}
            {isReceiptModalOpen && selectedSalary && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white dark:bg-[#232323] p-6 rounded-lg w-[600px] relative">
                  <button
                    className="absolute top-2 right-2 text-xl text-gray-500 dark:text-gray-300"
                    onClick={() => setIsReceiptModalOpen(false)}
                  >
                    &times;
                  </button>

                  <div id="salary-receipt" className="p-4">
                    <h2 className="text-xl font-bold mb-4">Salary Receipt</h2>
                    <p><strong>Employee Name:</strong> {selectedSalary.employeeName}</p>
                    <p><strong>Employee ID:</strong> {selectedSalary.employeeId}</p>
                    <p><strong>Designation:</strong> {selectedSalary.designation}</p>
                    <p><strong>Salary Amount:</strong> ${selectedSalary.salaryAmount}</p>
                    <p><strong>Deductions:</strong> ${selectedSalary.deductionAmount}</p>
                    <p><strong>Payment Method:</strong> {selectedSalary.paymentMethod}</p>
                    <p><strong>Payment Status:</strong> {selectedSalary.paymentStatus}</p>
                    <p><strong>Date:</strong> {new Date(selectedSalary.createdDate).toLocaleDateString()}</p>
                  </div>

                  <button
                    className="mt-4 px-4 py-2 bg-[#6C74F6] text-white rounded"
                    onClick={() => {
                      import("jspdf").then(jsPDFModule => {
                        import("html2canvas").then(html2canvasModule => {
                          const jsPDF = jsPDFModule.default;
                          const html2canvas = html2canvasModule.default;
                          const input = document.getElementById("salary-receipt")!;
                          html2canvas(input).then(canvas => {
                            const imgData = canvas.toDataURL("image/png");
                            const pdf = new jsPDF("p", "mm", "a4");
                            const imgProps = pdf.getImageProperties(imgData);
                            const pdfWidth = pdf.internal.pageSize.getWidth();
                            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                            pdf.save(`Salary_Receipt_${selectedSalary.employeeName}.pdf`);
                          });
                        });
                      });
                    }}
                  >
                    Download
                  </button>
                </div>
              </div>
            )}
            {activeTab === "Wages" && (
              <div className="space-y-6">
                <div className="rounded-xl overflow-hidden">
                  <div className="flex flex-row sm:flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
                    <input
                      type="text"
                      placeholder="Search"
                      className="bg-transparent outline-none text-[12px] w-32 py-3"
                      value={searchWages}
                      onChange={(e) => setSearchWages(e.target.value)}
                    />
                    <div
                      className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 cursor-pointer"
                      onClick={() => setIsFilterModalOpen(true)}
                    >
                      <MdTune className="w-4 h-4" />
                      <span>Filter</span>
                    </div>
                    <span className="text-[12px] text-gray-400 dark:text-gray-400 py-3">
                      Showing{" "}
                      {filteredWages.length === 0
                        ? 0
                        : (wagesPage - 1) * wagesPerPage + 1}{" "}
                      to{" "}
                      {Math.min(wagesPage * wagesPerPage, filteredWages.length)}{" "}
                      of {filteredWages.length}
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
                            Class Name
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Rate
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Currency
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Duration
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px] text-[#1D2939]">
                        {paginatedWages.length > 0 ? (
                          paginatedWages.map((item, index) => (
                            <tr
                              key={item._id}
                              className={`text-left dark:text-white ${index % 2 === 0
                                ? "bg-[#fff] dark:bg-[#2C2C2C]"
                                : "bg-[#F8F8F8] dark:bg-[#303030]"
                                }`}
                            >
                              <td className="p-3">
                                {item.classType?.className
                                  ? formatClassName(item.classType.className)
                                  : "-"}
                              </td>

                              <td className="p-3">
                                <input
                                  type="text"
                                  className="w-16 px-2 py-1 text-xs dark:bg-[#2C2C2C] dark:text-white text-left"
                                  value={item.classType?.rate || ""}
                                  onChange={(e) => {
                                    const newRate = e.target.value;
                                    // update local state (editing value)
                                    setWages((prevWages) =>
                                      prevWages.map((wage) =>
                                        wage._id === item._id
                                          ? {
                                            ...wage,
                                            classType: {
                                              ...wage.classType,
                                              rate: newRate,
                                            },
                                          }
                                          : wage
                                      )
                                    );
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleSaveRate(
                                        item._id,
                                        item.classType?.rate,
                                        undefined
                                      );
                                    }
                                  }}
                                />
                              </td>
                              <td className="p-3">
                                {item.classType?.currency || "-"}
                              </td>
                              <td className="p-3">
                                {item.classType?.className === "TRAILCLASS" ? (
                                  <span className="text-xs dark:text-white">
                                    1 day
                                  </span>
                                ) : (
                                  <select
                                    className="w-20 px-2 py-1 text-xs dark:bg-[#2C2C2C] dark:text-white text-left"
                                    value={item.classType?.hoursMins || ""}
                                    onChange={(e) => {
                                      const hoursMins = e.target.value;

                                      // ✅ 1. Update local state
                                      setWages((prevWages) =>
                                        prevWages.map((wage) =>
                                          wage._id === item._id
                                            ? {
                                              ...wage,
                                              classType: {
                                                ...wage.classType,
                                                hoursMins: hoursMins,
                                              },
                                            }
                                            : wage
                                        )
                                      );

                                      // ✅ 2. Call save function with only duration
                                      handleSaveRate(
                                        item._id,
                                        undefined,
                                        hoursMins
                                      );
                                    }}
                                  >
                                    <option value="30 min">30 min</option>
                                    <option value="60 min">60 min</option>
                                  </select>
                                )}
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
                {totalWagesPages > 1 && (
                  <div className="flex justify-end mt-4">
                    <Pagination
                      currentPage={wagesPage}
                      totalPages={totalWagesPages}
                      onPageChange={setWagesPage}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === "Working Hours" && (
              <div className="space-y-6">
                <div className="rounded-xl overflow-hidden">
                  <div className="flex flex-row sm:flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
                    <input
                      type="text"
                      placeholder="Search"
                      className="bg-transparent outline-none text-[12px] w-32 py-3"
                      value={searchWorkingHours}
                      onChange={(e) => setSearchWorkingHours(e.target.value)}
                    />
                    <div
                      className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 cursor-pointer"
                      onClick={() => setIsFilterModalOpen(true)}
                    >
                      <MdTune className="w-4 h-4" />
                      <span>Filter</span>
                    </div>
                    <span className="text-[12px] text-gray-400 dark:text-gray-400 py-3">
                      Showing {filteredWorkingHours.length === 0 ? 0 : 1} to{" "}
                      {filteredWorkingHours.length} of{" "}
                      {filteredWorkingHours.length}
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
                            Day
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Date
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Working Hours
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            GMT
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px] text-[#1D2939]">
                        {sortedWorkingHours.map((item, index) => (
                          <tr
                            key={index}
                            className={`text-left dark:text-white ${index % 2 === 0
                              ? "bg-[#fff] dark:bg-[#2C2C2C]"
                              : "bg-[#F8F8F8] dark:bg-[#303030]"
                              }`}
                          >
                            <td className="p-3">{item.day}</td>
                            <td className="p-3">{item.date}</td>
                            <td className="p-3">
                              {item.fromTime} - {item.toTime}
                            </td>
                            <td className="p-3">GMT</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    className="bg-transparent border border-[#576CBC] text-[#576CBC] dark:bg-[#2e3343] text-[11px] px-3 py-1 rounded-md shadow transition"
                    onClick={() => {
                      router.push(
                        `/modules/users/admin-main/ui/employees/teacher/workinghours?teacherId=${employeeId}`
                      );
                    }}
                  >
                    View All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onFilter={handleFilterChange}
        onReset={handleResetFilters}
        filterFields={getFilterFieldsForTab(activeTab)}
        filterValues={filters}
        setFilterValues={setFilters}
      />
    </BaseLayout4>
  );
};

export default Teacher;
