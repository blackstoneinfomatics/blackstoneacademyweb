"use client";

import { useEffect, useState } from "react";

import { MdOutlineCancel } from "react-icons/md";
import { useSearchParams } from "next/navigation";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import axios from "axios";
import { user } from "@nextui-org/react";
import AdminHeader from "@/app/(tenant)/modules/users/admin-main/components/AdminHeader";
import Pagination from "@/components/Pagination";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import { TooltipProps } from "recharts";
import FilterModal, { FilterField } from "@/components/FilterModal";
import { toDate } from "date-fns";
import { MdEditSquare } from "react-icons/md";
import BaseLayout4 from "../../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface Employee {
  _id: string;
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
  languagesKnown: string; // or JSON.parse to array
  emergencyContactNumber: number;
  relationshipWithEmployee: string;
  address: string;
  designation: string;
  department: string;
  preferedWorkingHours: number;
  preferedShiftFrom: string;
  preferedShiftTo: string;
  comments: string;
  profileImage: string;
  applicationDate: string;
  currency: string;
  expectedSalary: number;
  applicationStatus: string;
  preferedWorkingDays: string; // or JSON.parse to array
  status: string;
  __v: number;
}

interface MonthlyEarnings {
  year: number;
  month: number;
  totalhours: number;
}

interface EmployeeWage {
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
  totalhours?: number;
  totalearnings?: number;
  monthlyData?: MonthlyEarnings[];
}
interface EmployeeWagesResponse {
  employeeId: string;
  totalhours?: number;
  totalearnings?: number;
  monthlyData?: MonthlyEarnings[];
  wageRecords: EmployeeWage[];
}
interface ShiftSchedule {
  workhrs: string;
  employeeId: string;
  _id: string;
  date?: string;
  day: string;
  fromTime: string;
  toTime: string;
  isExpanded?: boolean;
  timings: { fromTime: string; toTime: string; date: string }[]; // Make date required here
}

// interfaces/LeaveRequest.ts

export interface ILeaveRecord {
  _id: string;
  name: string;
  employeeId: string;
  role: string;
  fromDate: string;
  toDate: string;
  leaveStatus: "WAITINGLIST" | "APPROVED" | "DECLINED";
  leaveType: string;
  approvedId: string;
  approvedName: string;
  reason: string;
  status: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  __v: number;
}

export interface ILeaveSummary {
  totalApplied: number;
  totalApproved: number;
  totalDeclined: number;
}

type LeaveStatus = "APPROVED" | "WAITINGLIST" | "REJECTED";
// CustomTooltip for dark mode
const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  const isDark =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");
  if (active && payload && payload.length) {
    return (
      <div
        className={`p-2 rounded shadow-md text-[12px] border ${
          isDark
            ? "bg-[#22223b] text-white border-[#444]"
            : "bg-white text-[#22223b] border-gray-200"
        }`}
      >
        <div
          className={`font-normal ${isDark ? "text-white" : "text-[#22223b]"}`}
        >
          {label}
        </div>
        <div>
          {payload.map((entry: any, idx: number) => (
            <div
              key={idx}
              className={
                isDark ? "text-white text-[10px]" : "text-[#22223b] text-[10px]"
              }
            >
              {entry.value} Employees
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const EmployeePage = () => {
  const [activeTab, setActiveTab] = useState("Wages");
  const [schedule, setSchedule] = useState<ShiftSchedule[]>([]);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(
    null
  );

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  // const [isEditOpen, setIsEditOpen] = useState(false);

  const tabs = ["Wages", "Earnings", "Leave Requests", "Working Hours"];
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isFetched, setIsFetched] = useState(false); // Flag to check if data is fetched
  const searchParams = useSearchParams(); // Get the search params from the URL
  const [wages, setWages] = useState<EmployeeWage[]>([]); // was wage (single), now array
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    employeeId: "",
    fromtime: "",
    totime: "",
    workhrs: "",
  });

  const [wageSummary, setWageSummary] = useState<{
    totalhours: number;
    totalearnings: number;
    monthlyData: MonthlyEarnings[];
  }>({
    totalhours: 0,
    totalearnings: 0,
    monthlyData: [],
  });
  const [searchWages, setSearchWages] = useState("");
  const [wagesPage, setWagesPage] = useState(1);
  const wagesPerPage = 5;
  const [leaveData, setLeaveData] = useState<ILeaveRecord[]>([]);
  const [summary, setSummary] = useState<ILeaveSummary>({
    totalApplied: 0,
    totalApproved: 0,
    totalDeclined: 0,
  });
  const [earningsPage, setEarningsPage] = useState(1);
  const earningsPerPage = 5;
  const [searchEarnings, setSearchEarnings] = useState("");
  const [leavePage, setLeavePage] = useState(1);
  const leavePerPage = 5;
  const [searchLeave, setSearchLeave] = useState("");
  const [workingPage, setWorkingPage] = useState(1);
  const workingPerPage = 5;
  const [searchWorking, setSearchWorking] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedEmpId, setSelectedEmpId] = useState("");
  // Add this helper function to format dates
  const formatDate = (dateString: string): string => {
    if (!dateString || dateString === "N/A") return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };
  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  useEffect(() => {
    setFormData(employee);
  }, [employee]);

  const [formData, setFormData] = useState<Employee | null>(null);

  // Paginated months for earnings
  const monthsArray = Array.from({ length: 12 }).map((_, index) => {
    const monthNumber = index + 1;
    const currentYear = new Date().getFullYear();
    const monthName = new Date(0, index).toLocaleString("default", {
      month: "short",
    });
    const monthly = wageSummary.monthlyData?.find(
      (item) => item.month === monthNumber && item.year === currentYear
    );
    const rate = parseFloat(wages[0]?.classType?.rate ?? "0");
    const totalhours = monthly?.totalhours ?? 0;
    const earnings = totalhours * rate;
    return {
      key: `${monthName}-${currentYear}`,
      monthName,
      monthNumber,
      currentYear,
      totalhours,
      earnings,
    };
  });
  const filteredEarnings = monthsArray
    .filter((row) => {
      const searchMatch =
        row.monthName.toLowerCase().includes(searchEarnings.toLowerCase()) ||
        row.currentYear.toString().includes(searchEarnings);

      let filterMatch = true;
      if (filters.month && row.monthNumber.toString() !== filters.month) {
        filterMatch = false;
      }
      if (
        filters.totalhours &&
        row.totalhours.toString() !== filters.totalhours
      ) {
        filterMatch = false;
      }
      if (filters.earnings && row.earnings.toFixed(2) !== filters.earnings) {
        filterMatch = false;
      }

      return searchMatch && filterMatch;
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
  const totalEarningsPages = Math.ceil(
    filteredEarnings.length / earningsPerPage
  );
  const paginatedEarnings = filteredEarnings.slice(
    (earningsPage - 1) * earningsPerPage,
    earningsPage * earningsPerPage
  );

  const filteredLeave = leaveData.filter((item) => {
    const searchMatch =
      item.name?.toLowerCase().includes(searchLeave.toLowerCase()) ||
      item.employeeId?.toLowerCase().includes(searchLeave.toLowerCase()) ||
      item.role?.toLowerCase().includes(searchLeave.toLowerCase()) ||
      item.leaveType?.toLowerCase().includes(searchLeave.toLowerCase()) ||
      item.leaveStatus?.toLowerCase().includes(searchLeave.toLowerCase());

    let filterMatch = true;
    if (filters.leaveType && item.leaveType !== filters.leaveType) {
      filterMatch = false;
    }
    if (filters.status && item.leaveStatus !== filters.status) {
      filterMatch = false;
    }
    if (filters.dateRange) {
      const itemFrom = new Date(item.fromDate);
      const itemTo = new Date(item.toDate);
      const filterFrom = filters.dateRange.from
        ? new Date(filters.dateRange.from)
        : null;
      const filterTo = filters.dateRange.to
        ? new Date(filters.dateRange.to)
        : null;

      if (filterFrom && itemTo < filterFrom) {
        filterMatch = false;
      }
      if (filterTo && itemFrom > filterTo) {
        filterMatch = false;
      }
    }
    return searchMatch && filterMatch;
  });
  const totalLeavePages = Math.ceil(filteredLeave.length / leavePerPage);
  const paginatedLeave = filteredLeave.slice(
    (leavePage - 1) * leavePerPage,
    leavePage * leavePerPage
  );

  const filteredWorking = schedule.filter((item) => {
    const searchMatch = item.day
      ?.toLowerCase()
      .includes(searchWorking.toLowerCase());

    let filterMatch = true;
    if (filters.day && item.day !== filters.day) {
      filterMatch = false;
    }
    console.log("filetred serach match", searchMatch);
    console.log("filetred  match", filterMatch);

    return searchMatch && filterMatch;
  });

  useEffect(() => {
    console.log("empon edit", editData);
  }, [editData]);

  const totalWorkingPages = Math.ceil(filteredWorking.length / workingPerPage);
  const paginatedWorking = filteredWorking.slice(
    (workingPage - 1) * workingPerPage,
    workingPage * workingPerPage
  );
  useEffect(() => {
    // Retrieve employeeId and userId from search params
    const employeeId = searchParams.get("employeeId");
    const userId = searchParams.get("userId");

    if (!employeeId) {
      console.error("No employee ID found in search params");
      return;
    }

    // Fetch employee data if not already fetched
    if (!isFetched && employee === null) {
      fetchEmployee(employeeId);
      fetchWages(employeeId);
      fetchData(employeeId); // Fetch shift schedule data
      setSelectedEmpId(employeeId);
      if (userId) {
        fetchLeaveData(userId); // ✅ Only call if userId is not null
      } else {
        console.error("No user ID found in search params");
      }
    }
  }, [isFetched, employee, searchParams]);

  const fetchEmployee = async (_id: string) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AdminAuthToken")
        : null;

    if (!token) {
      console.error("❌ AdminAuthToken not found");
      return;
    }

    try {
      const response = await axios.get<Employee>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.OTHEREMPLOYEE.GET_OTHER_EMPLOYEE}/${_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEmployee(response.data);
      setIsFetched(true); // Mark the data as fetched
    } catch (error: any) {
      console.error(
        "Error fetching employee:",
        error.response?.data ?? error.message
      );
    }
  };

  const fetchWages = async (employeeId: string) => {
    if (!employeeId) return;
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AdminAuthToken")
        : null;
    if (!token) return;
    try {
      const response = await axios.get<
        EmployeeWagesResponse | EmployeeWage[] | EmployeeWage
      >(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.OTHEREMPLOYEE.GET_OTHER_EMPLOYEE_WAGES}?employeeId=${employeeId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      if (data && typeof data === "object" && "wageRecords" in data) {
        const typed = data as EmployeeWagesResponse;
        setWages(typed.wageRecords || []);
        setWageSummary({
          totalhours: typed.totalhours ?? 0,
          totalearnings: typed.totalearnings ?? 0,
          monthlyData: typed.monthlyData ?? [],
        });
      } else {
        const wageArray = Array.isArray(data) ? data : [data];
        setWages(wageArray as EmployeeWage[]);
        const fallbackMonthly =
          (!Array.isArray(data) && (data as EmployeeWage)?.monthlyData) || [];
        setWageSummary({
          totalhours: (wageArray as EmployeeWage[]).reduce(
            (acc, wage) => acc + (wage.totalhours ?? 0),
            0
          ),
          totalearnings: (wageArray as EmployeeWage[]).reduce(
            (acc, wage) => acc + (wage.totalearnings ?? 0),
            0
          ),
          monthlyData: fallbackMonthly ?? [],
        });
      }
    } catch (error: any) {
      console.error(
        "Error fetching wages:",
        error.response?.data ?? error.message
      );
      console.log(error.response?.data ?? error.message);
      setWages([]);
      setWageSummary({
        totalhours: 0,
        totalearnings: 0,
        monthlyData: [],
      });
    }
  };

  const fetchLeaveData = async (userId: string) => {
    try {
      const res = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.LEAVE.GET}?employeeId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("AdminAuthToken")}`,
          },
        }
      );
      setLeaveData(res.data.records);
      setSummary({
        totalApplied: res.data.totalApplied,
        totalApproved: res.data.totalApproved,
        totalDeclined: res.data.totalDeclined,
      });
    } catch (error) {
      console.error("Failed to fetch leave data", error);
    }
  };

  const fetchData = async (employeeId: string) => {
    try {
      const res = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.SHIFTSCHEDULE.GET}/${employeeId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("AdminAuthToken")}`,
          },
        }
      );

      // Group schedules by day
      const groupedSchedules = groupSchedulesByDay(res.data);
      setSchedule(groupedSchedules);
    } catch (error) {
      console.error("Failed to fetch shift schedule", error);
      setSchedule([]);
    }
  };

  const updateWorkingHours = async (editData: any) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AdminAuthToken")
          : null;

      if (!selectedEmpId) {
        setToast({
          type: "error",
          message: "Employee ID missing!",
        });
        return;
      }

      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.SHIFTSCHEDULE.PUT}?employeeId=${selectedEmpId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            employeeId: selectedEmpId,
            fromtime: editData.fromtime,
            totime: editData.totime,
            workhrs: editData.workhrs,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setToast({
          type: "error",
          message: result.message || "Failed to update working hours",
        });
        return;
      }

      setToast({
        type: "success",
        message: "Working hours updated successfully!",
      });

      setIsEditOpen(false);
      fetchData(selectedEmpId);
    } catch (error) {
      console.error(error);

      setToast({
        type: "error",
        message: "Failed to update working hours",
      });
    }
  };

  const handleUpdate = async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AdminAuthToken")
          : null;

      if (!token) {
        setToast({ type: "error", message: "Auth token not found" });
        return;
      }

      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.OTHEREMPLOYEE.UPDATE}/${employee?._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        setToast({
          type: "error",
          message: result.message || "Failed to update employee",
        });
        return;
      }

      setToast({
        type: "success",
        message: "Employee updated successfully!",
      });

      // fetchEmployee(employee?._id);
      setIsEditOpen(false);
    } catch (error) {
      console.error(error);
      setToast({ type: "error", message: "Something went wrong!" });
    }
  };


  const groupSchedulesByDay = (
    scheduleData: ShiftSchedule[]
  ): ShiftSchedule[] => {
    const dayOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const groupedByDay: {
      [key: string]: { fromTime: string; toTime: string; date: string }[];
    } = {};

    scheduleData.forEach((item) => {
      const day = item.day;
      if (!groupedByDay[day]) {
        groupedByDay[day] = [];
      }
      groupedByDay[day].push({
        fromTime: item.fromTime,
        toTime: item.toTime,
        date: item.date || "N/A", // Ensure date is always present
      });
    });

    const result: ShiftSchedule[] = dayOrder.map((day) => {
      const dayTimings = groupedByDay[day] || [
        { fromTime: "N/A", toTime: "N/A", date: "N/A" },
      ];

      return {
        _id: "",
        employeeId: "",
        workhrs: "0",

        day: day,
        fromTime: dayTimings[0].fromTime,
        toTime: dayTimings[0].toTime,
        timings: dayTimings,
        isExpanded: false,
      };
    });

    return result;
  };

  const toggleDayExpansion = (day: string) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day === day ? { ...item, isExpanded: !item.isExpanded } : item
      )
    );
  };

  // Filtered and paginated wages
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
          item.classType?.className !== filters.className
        ) {
          matchesFilters = false;
        }
        if (filters.rate && item.classType?.rate !== filters.rate) {
          matchesFilters = false;
        }
        if (filters.currency && item.classType?.currency !== filters.currency) {
          matchesFilters = false;
        }

        const matchesSearch = searchFields.some((field) =>
          field.toString().toLowerCase().includes(searchWages.toLowerCase())
        );
        return matchesSearch && matchesFilters;
      })
    : [];
  const totalWagesPages = Math.ceil(filteredWages.length / wagesPerPage);
  const paginatedWages = filteredWages.slice(
    (wagesPage - 1) * wagesPerPage,
    wagesPage * wagesPerPage
  );

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

  const wageClassNameOptions = Array.from(
    new Set(wages.map((w) => w.classType?.className).filter(Boolean))
  ).map((o) => ({ value: o!, label: o! }));
  const wageRateOptions = Array.from(
    new Set(wages.map((w) => w.classType?.rate).filter(Boolean))
  ).map((o) => ({ value: o!, label: o! }));
  const wageCurrencyOptions = Array.from(
    new Set(wages.map((w) => w.classType?.currency).filter(Boolean))
  ).map((o) => ({ value: o!, label: o! }));

  const wagesFilterFields: FilterField[] = [
    {
      name: "className",
      label: "Class Name",
      type: "select",
      options: wageClassNameOptions,
    },
    { name: "rate", label: "Rate", type: "select", options: wageRateOptions },
    {
      name: "currency",
      label: "Currency",
      type: "select",
      options: wageCurrencyOptions,
    },
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
    { name: "totalhours", label: "Total Hours", type: "text" },
    { name: "earnings", label: "Total Earnings", type: "text" },
  ];

  const leaveTypeOptions = Array.from(
    new Set(leaveData.map((l) => l.leaveType).filter(Boolean))
  ).map((o) => ({ value: o!, label: o! }));
  const leaveStatusOptions = Array.from(
    new Set(leaveData.map((l) => l.leaveStatus).filter(Boolean))
  ).map((o) => ({ value: o as string, label: o as string }));

  const leaveRequestFilterFields: FilterField[] = [
    {
      name: "leaveType",
      label: "Leave Type",
      type: "select",
      options: leaveTypeOptions,
    },
    { name: "dateRange", label: "Date", type: "date-range" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: leaveStatusOptions,
    },
  ];

  const workingHoursDayOptions = Array.from(
    new Set(schedule.map((s) => s.day).filter(Boolean))
  ).map((o) => ({ value: o!, label: o! }));

  const workingHoursFilterFields: FilterField[] = [
    {
      name: "day",
      label: "Day",
      type: "select",
      options: workingHoursDayOptions,
    },
  ];

  const getFilterFieldsForTab = (tab: string) => {
    switch (tab) {
      case "Wages":
        return wagesFilterFields;
      case "Earnings":
        return earningsFilterFields;
      case "Leave Requests":
        return leaveRequestFilterFields;
      case "WorkingHours":
        return workingHoursFilterFields;
      default:
        return [];
    }
  };

  const calculateWorkHours = (from: string, to: string) => {
    if (!from || !to) return "";

    const start = new Date(`2000-01-01T${from}:00`);
    const end = new Date(`2000-01-01T${to}:00`);

    if (end < start) return ""; // optional: avoid negative hours

    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours.toFixed(2); // format example: "2.50"
  };

  return (
    <BaseLayout4>
      <AdminHeader
        currentSection="Other Employees"
        showBackButton
        showBackPath="/modules/users/admin-main/ui/employees"
      />
      <div className="p-2 min-h-screen w-full">
        <div className="col-span-3 bg-[#5E6578] text-white px-4 py-3 rounded-lg shadow-sm flex flex-row">
          <div className="flex flex-col items-center w-[30%] pr-4 py-6 border-r border-[#BCBCBC] gap-y-2">
            <div className="flex">
              <div className="w-[90px] h-[90px] rounded-full overflow-hidden border border-white">
                <img
                  src="/assets/images/Avatar.png"
                  alt="Avatar"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="">
                <button
                  onClick={() => setIsEditOpen(true)}
                  className=" text-white px-1 py-1 rounded-md text-xs font-semibold shadow border"
                >
                  <MdEditSquare />
                </button>
              </div>
            </div>

            <h2 className="text-[12px] font-semibold text-center mt-2">
              {employee?.firstName} {employee?.lastName}
            </h2>
            <p className="text-[11px] text-gray-300 text-center">
              {employee?.designation}
            </p>
            <span className="text-gray-300 text-center text-[10px]">
              {employee?.email}
            </span>
          </div>

          <div className="flex flex-col md:w-1/2 gap-4 px-3 border-r border-[#BCBCBC]">
            <h4 className="text-[13px] font-semibold mb-2">
              Contact & Details
            </h4>
            <div className="text-xs">
              <div className="py-2 flex flex-row justify-between">
                <span className="text-gray-200">Phone:</span>{" "}
                <span className="text-gray-200 px-2 text-[10px]">
                  {employee?.phoneNumber}
                </span>
              </div>
              <div className="py-2 flex flex-row justify-between">
                <span className="text-gray-200">Date of Birth:</span>{" "}
                <span className="text-gray-200 px-2 text-[10px]">
                  {employee?.dateOfBirth}
                </span>
              </div>
              <div className="py-2 flex flex-row justify-between">
                <span className="text-gray-200">Country:</span>{" "}
                <span className="text-gray-200 px-2 text-[10px]">
                  {employee?.country}
                </span>
              </div>
              <div className="py-2 flex flex-row justify-between">
                <span className="text-gray-200">City:</span>{" "}
                <span className="text-gray-200 px-2 text-[10px]">
                  {employee?.city}
                </span>
              </div>
              <div className="py-2 flex flex-row justify-between">
                <span className="text-gray-200">Residential Address:</span>{" "}
                <span className="text-gray-200 px-2 text-[10px]">
                  {employee?.address}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:w-1/2 gap-4 px-3 border-r border-[#BCBCBC]">
            <h4 className="text-[13px] font-semibold mb-2">
              Educational Information
            </h4>
            <div className="text-xs">
              <div className="py-2 flex flex-row justify-between">
                <span className="text-gray-200">Highest Qualification:</span>{" "}
                <span className="text-gray-200 px-2 text-[10px]">
                  {employee?.higherQualification}
                </span>
              </div>
              <div className="py-2 flex flex-row justify-between">
                <span className="text-gray-200">University/Institute:</span>{" "}
                <span className="text-gray-200 px-2 text-[10px]">
                  {employee?.universityName}
                </span>
              </div>
              <div className="py-2 flex flex-row justify-between">
                <span className="text-gray-200">Languages Known:</span>{" "}
                <span className="text-gray-200 px-2 text-[10px]">
                  {employee?.languagesKnown}
                </span>
              </div>
              <div className="py-2 flex flex-row justify-between">
                <span className="text-gray-200">Experience:</span>{" "}
                <span className="text-gray-200 px-2 text-[10px]">
                  {employee?.experience}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:w-1/2 gap-4 px-3">
            <h4 className="text-[13px] font-semibold mb-2">Bank Details </h4>
            <div className="text-xs">
              <div className="py-2 flex flex-row justify-between">
                <span className="text-gray-200">Passport Number:</span>{" "}
                <span className="text-gray-200 px-2 text-[10px]">
                  {employee?.passportNumber}
                </span>
              </div>
              <div className="py-2 flex flex-row justify-between">
                <span className="text-gray-200">Bank Name:</span>{" "}
                <span className="text-gray-200 px-2 text-[10px]">
                  {employee?.bankName}
                </span>
              </div>
              <div className="py-2 flex flex-row justify-between">
                <span className="text-gray-200">Account Number:</span>{" "}
                <span className="text-gray-200 px-2 text-[10px]">
                  {employee?.accountNumber}
                </span>
              </div>
              <div className="py-2 flex flex-row justify-between">
                <span className="text-gray-200">Bank Code:</span>{" "}
                <span className="text-gray-200 px-2 text-[10px]">
                  {employee?.bankCode}
                </span>
              </div>
            </div>
          </div>
        </div>

        {isEditOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-[750px] max-h-[90vh] overflow-y-scroll scrollbar-none rounded-xl p-8 shadow-2xl border border-gray-200">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">
                Edit Employee Details
              </h2>

              <div className="grid grid-cols-2 gap-5">
                {/* PERSONAL DETAILS */}
                <h3 className="col-span-2 text-md font-semibold text-blue-700 border-l-4 border-blue-600 pl-3">
                  Personal Information
                </h3>

                {/* First Name */}
                <div className="gap-2 ml-1">
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.firstName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData!, firstName: e.target.value })
                    }
                  />
                </div>

                {/* Last Name */}
                <div className="gap-2 ml-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.lastName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData!, lastName: e.target.value })
                    }
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.gender || ""}
                    onChange={(e) =>
                      setFormData({ ...formData!, gender: e.target.value })
                    }
                  />
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.dateOfBirth?.substring(0, 10) || ""}
                    onChange={(e) =>
                      setFormData({ ...formData!, dateOfBirth: e.target.value })
                    }
                  />
                </div>

                {/* Divider */}
                <div className="col-span-2 border-b border-gray-200 my-2"></div>

                {/* CONTACT DETAILS */}
                <h3 className="col-span-2 text-md font-semibold text-blue-700 border-l-4 border-blue-600 pl-3">
                  Contact Details
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData!, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.phoneNumber || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData!,
                        phoneNumber: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.country || ""}
                    onChange={(e) =>
                      setFormData({ ...formData!, country: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.city || ""}
                    onChange={(e) =>
                      setFormData({ ...formData!, city: e.target.value })
                    }
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Residential Address
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.address || ""}
                    onChange={(e) =>
                      setFormData({ ...formData!, address: e.target.value })
                    }
                  />
                </div>

                {/* Divider */}
                <div className="col-span-2 border-b border-gray-200 my-2"></div>

                {/* EDUCATIONAL INFORMATION */}
                <h3 className="col-span-2 text-md font-semibold text-blue-700 border-l-4 border-blue-600 pl-3">
                  Educational Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Highest Qualification
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.higherQualification || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData!,
                        higherQualification: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    University / Institute
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.universityName || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData!,
                        universityName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Languages Known
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.languagesKnown || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData!,
                        languagesKnown: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Experience (Years)
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.experience || ""}
                    onChange={(e) =>
                      setFormData({ ...formData!, experience: e.target.value })
                    }
                  />
                </div>

                {/* Divider */}
                <div className="col-span-2 border-b border-gray-200 my-2"></div>

                {/* BANK DETAILS */}
                <h3 className="col-span-2 text-md font-semibold text-blue-700 border-l-4 border-blue-600 pl-3">
                  Bank Details
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bank Name
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.bankName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData!, bankName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Account Number
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.accountNumber || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData!,
                        accountNumber: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bank Code
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.bankCode || ""}
                    onChange={(e) =>
                      setFormData({ ...formData!, bankCode: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Passport Number
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.passportNumber || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData!,
                        passportNumber: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Divider */}
                <div className="col-span-2 border-b border-gray-200 my-2"></div>

                {/* EMERGENCY CONTACT */}
                <h3 className="col-span-2 text-md font-semibold text-blue-700 border-l-4 border-blue-600 pl-3">
                  Emergency Contact
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Emergency Contact Number
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.emergencyContactNumber || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData!,
                        emergencyContactNumber: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Relationship
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.relationshipWithEmployee || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData!,
                        relationshipWithEmployee: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Divider */}
                <div className="col-span-2 border-b border-gray-200 my-2"></div>

                {/* JOB INFO */}
                <h3 className="col-span-2 text-md font-semibold text-blue-700 border-l-4 border-blue-600 pl-3">
                  Job Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Designation
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.designation || ""}
                    onChange={(e) =>
                      setFormData({ ...formData!, designation: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData!.department || ""}
                    onChange={(e) =>
                      setFormData({ ...formData!, department: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end mt-6 gap-3">
                <button
                  className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition text-xs"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdate}
                  className="px-3 py-2 bg-[#4C6993] text-white rounded-md hover:bg-[#4C6993] transition text-xs"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs Section */}
        <div className="mt-4 h-min">
          {/* Tabs */}
          <div className="flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`px-3 py-[7px] text-xs font-medium focus:outline-none transition-all duration-200 ${
                  activeTab === tab
                    ? "border-b border-b-[#576CBC] text-[#576CBC]"
                    : "text-[#010E30] dark:text-white"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="py-2">
            {activeTab === "Wages" && (
              <div className="">
                <div className="rounded-xl overflow-hidden">
                  <div className="flex flex-row sm:flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
                    <input
                      type="text"
                      placeholder="Search"
                      className="bg-transparent outline-none text-[12px] w-32 py-3"
                      value={searchWages}
                      onChange={(e) => {
                        setSearchWages(e.target.value);
                        setWagesPage(1);
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
                              className={`text-center dark:text-white ${
                                index % 2 === 0
                                  ? "bg-[#fff] dark:bg-[#2C2C2C]"
                                  : "bg-[#F8F8F8] dark:bg-[#303030]"
                              }`}
                            >
                              <td className="p-3 text-left">
                                {item.classType?.className || "-"}
                              </td>
                              <td className="p-3 text-left">
                                {item.classType?.rate || "-"}
                              </td>
                              <td className="p-3 text-left">
                                {item.classType?.currency || "-"}
                              </td>
                              <td className="p-3 text-left">
                                {item.classType?.hoursMins
                                  ? `${item.classType.hoursMins} mins`
                                  : "-"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-4 text-left">
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

            {/* Earnings tab */}

            {activeTab === "Earnings" && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      title: "Total Earnings",
                      count: wageSummary.totalearnings || 0,
                      color: "gray",
                      iconBg: "bg-gray-100",
                      iconColor: "text-gray-500",
                      chartColor: "#64748b",
                    },
                    {
                      title: "Total Deductions",
                      count: 0,
                      color: "indigo",
                      iconBg: "bg-indigo-100",
                      iconColor: "text-indigo-500",
                      chartColor: "#6366f1",
                    },
                  ].map((card) => (
                    <div
                      key={card.title}
                      className="bg-[#7689BD] text-white shadow-md rounded-xl flex flex-col  w-full p-3 h-full"
                    >
                      <div className="flex flex-col justify-between gap-y-4">
                        <div>
                          <p className="text-[15px] font-medium dark:text-white text-white">
                            {card.title}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-[24px] font-semibold dark:text-white text-white">
                            ${card.count}
                          </h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Earnings Table */}
                <div className="rounded-xl overflow-hidden">
                  <div className="flex flex-row sm:flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
                    <input
                      type="text"
                      placeholder="Search"
                      className="bg-transparent outline-none text-[12px] w-32 py-3"
                      value={searchEarnings}
                      onChange={(e) => {
                        setSearchEarnings(e.target.value);
                        setEarningsPage(1);
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
                      Showing{" "}
                      {filteredEarnings.length === 0
                        ? 0
                        : (earningsPage - 1) * earningsPerPage + 1}{" "}
                      to{" "}
                      {Math.min(
                        earningsPage * earningsPerPage,
                        filteredEarnings.length
                      )}{" "}
                      of {filteredEarnings.length}
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
                            Month
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Total Hours
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Total Earnings
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Total Deductions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px] text-[#1D2939]">
                        {paginatedEarnings.length > 0 ? (
                          paginatedEarnings.map((row, index) => (
                            <tr
                              key={row.key}
                              className={`text-center dark:text-white ${
                                index % 2 === 0
                                  ? "bg-[#fff] dark:bg-[#2C2C2C]"
                                  : "bg-[#F8F8F8] dark:bg-[#303030]"
                              }`}
                            >
                              <td className="p-3 text-left">{`${row.monthName} ${row.currentYear}`}</td>
                              <td className="p-3 text-left">
                                {row.totalhours}
                              </td>
                              <td className="p-3 text-left">
                                ${row.earnings.toFixed(2)}
                              </td>
                              <td className="p-3 text-left">$0</td>{" "}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-4 text-center">
                              No data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                {totalEarningsPages > 1 && (
                  <div className="flex justify-end mt-4">
                    <Pagination
                      currentPage={earningsPage}
                      totalPages={totalEarningsPages}
                      onPageChange={setEarningsPage}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Leave Record Tab */}

            {activeTab === "Leave Requests" && (
              <div className="space-y-2 ">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      title: "Total Applied Leave",
                      count: summary.totalApplied || 0,
                      color: "gray",
                      iconBg: "bg-gray-100",
                      iconColor: "text-gray-500",
                      chartColor: "#64748b",
                    },
                    {
                      title: "Total Approved",
                      count: summary.totalApproved || 0,
                      color: "indigo",
                      iconBg: "bg-indigo-100",
                      iconColor: "text-indigo-500",
                      chartColor: "#6366f1",
                    },
                    {
                      title: "Total Declined",
                      count: summary.totalDeclined || 0,
                      color: "indigo",
                      iconBg: "bg-indigo-100",
                      iconColor: "text-indigo-500",
                      chartColor: "#6366f1",
                    },
                  ].map((card) => (
                    <div
                      key={card.title}
                      className="bg-[#7689BD] text-white shadow-md rounded-xl flex flex-col  w-full p-3 h-full"
                    >
                      <div className="flex flex-col justify-between gap-y-4">
                        <div>
                          <p className="text-[15px] font-medium dark:text-white text-white">
                            {card.title}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-[24px] font-semibold dark:text-white text-white">
                            ${card.count}
                          </h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Leave Table */}
                <div className="rounded-xl overflow-hidden">
                  <div className="flex flex-row sm:flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
                    <input
                      type="text"
                      placeholder="Search"
                      className="bg-transparent outline-none text-[12px] w-32 py-3"
                      value={searchLeave}
                      onChange={(e) => {
                        setSearchLeave(e.target.value);
                        setLeavePage(1);
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
                      Showing{" "}
                      {filteredLeave.length === 0
                        ? 0
                        : (leavePage - 1) * leavePerPage + 1}{" "}
                      to{" "}
                      {Math.min(leavePage * leavePerPage, filteredLeave.length)}{" "}
                      of {filteredLeave.length}
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
                            Leave Type
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Date Range
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Reason For Leave
                          </th>
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px] text-[#1D2939]">
                        {paginatedLeave.length > 0 ? (
                          paginatedLeave.map((item, index) => (
                            <tr
                              key={item._id}
                              className={`text-left dark:text-white ${
                                index % 2 === 0
                                  ? "bg-[#fff] dark:bg-[#2C2C2C]"
                                  : "bg-[#F8F8F8] dark:bg-[#303030]"
                              }`}
                            >
                              <td className="p-3 text-left">
                                {item.leaveType}
                              </td>
                              <td className="p-3 text-left">
                                {new Date(item.fromDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}{" "}
                                -{" "}
                                {new Date(item.toDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </td>
                              <td className="p-3 text-left">{item.reason}</td>
                              <td className="p-3 text-left">
                                <div className="flex items-left gap-2 justify-center">
                                  <span
                                    className={getLeaveStatusStyle(
                                      item.leaveStatus
                                    )}
                                  >
                                    {item.leaveStatus}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="p-4 text-center">
                              No data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                {totalLeavePages > 1 && (
                  <div className="flex justify-end mt-4">
                    <Pagination
                      currentPage={leavePage}
                      totalPages={totalLeavePages}
                      onPageChange={setLeavePage}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Working Hours Tab */}
            {activeTab === "Working Hours" && (
              <div className="">
                <div className="rounded-xl overflow-hidden">
                  <div className="flex flex-row sm:flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
                    <input
                      type="text"
                      placeholder="Search by day"
                      className="bg-transparent outline-none text-[12px] w-32 py-3"
                      value={searchWorking}
                      onChange={(e) => {
                        setSearchWorking(e.target.value);
                        setWorkingPage(1);
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
                      Showing {filteredWorking.length} days
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

                          {/* NEW EDIT COLUMN */}
                          <th className="p-4 font-semibold text-[12px] text-left">
                            Edit
                          </th>
                        </tr>
                      </thead>

                      <tbody className="text-[10px] text-[#1D2939]">
                        {paginatedWorking.length > 0 ? (
                          paginatedWorking.map((item, index) => {
                            const itemTimings = item.timings || [
                              {
                                fromTime: item.fromTime,
                                toTime: item.toTime,
                                date: item.date,
                              },
                            ];

                            const hasMultipleTimings = itemTimings.length > 1;

                            const fromDate = formatDate(
                              itemTimings[0]?.date || "N/A"
                            );
                            const toDate = formatDate(
                              itemTimings[itemTimings.length - 1]?.date || "N/A"
                            );

                            const allDatesSame = itemTimings.every(
                              (timing) => timing.date === itemTimings[0]?.date
                            );

                            const dateDisplay = allDatesSame
                              ? fromDate
                              : `${fromDate} - ${toDate}`;

                            return (
                              <>
                                {/* Main Row */}
                                <tr
                                  key={item.day}
                                  className={`text-left dark:text-white cursor-pointer ${
                                    index % 2 === 0
                                      ? "bg-[#fff] dark:bg-[#2C2C2C]"
                                      : "bg-[#F8F8F8] dark:bg-[#303030]"
                                  }`}
                                  onClick={() => toggleDayExpansion(item.day)}
                                >
                                  <td className="p-3 text-left font-medium">
                                    {item.day}
                                  </td>

                                  <td className="p-3 text-left">
                                    {dateDisplay}
                                  </td>

                                  <td className="p-3 text-left">
                                    {!hasMultipleTimings ? (
                                      `${itemTimings[0].fromTime} - ${itemTimings[0].toTime}`
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <span>{`${itemTimings[0].fromTime} - ${itemTimings[0].toTime}`}</span>
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                          +{itemTimings.length - 1} more
                                        </span>
                                      </div>
                                    )}
                                  </td>

                                  <td className="p-3 text-left">GMT</td>

                                  {/* EDIT BUTTON */}
                                  <td className="p-3 text-left">
                                    <button
                                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditData({
                                          id: item._id,
                                          employeeId: item.employeeId,
                                          fromtime: itemTimings[0].fromTime,
                                          totime: itemTimings[0].toTime,
                                          workhrs: item.workhrs || "",
                                        });
                                        setIsEditOpen(true);
                                      }}
                                    >
                                      Edit
                                    </button>
                                  </td>
                                </tr>

                                {/* Expanded Rows */}
                                {item.isExpanded &&
                                  hasMultipleTimings &&
                                  itemTimings
                                    .slice(1)
                                    .map((timing, timingIndex) => (
                                      <tr
                                        key={`${item.day}-${timingIndex}`}
                                        className={`text-left dark:text-white ${
                                          index % 2 === 0
                                            ? "bg-[#f5f5f5] dark:bg-[#3a3a3a]"
                                            : "bg-[#f0f0f0] dark:bg-[#404040]"
                                        }`}
                                      >
                                        <td className="p-3 text-left pl-8 text-gray-500">
                                          ↳ {item.day}
                                        </td>

                                        <td className="p-3 text-left">
                                          {formatDate(timing.date || "N/A")}
                                        </td>

                                        <td className="p-3 text-left">{`${timing.fromTime} - ${timing.toTime}`}</td>

                                        <td className="p-3 text-left">GMT</td>
                                        <td></td>
                                      </tr>
                                    ))}
                              </>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-4 text-left">
                              No data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* -------------------- EDIT MODAL -------------------- */}
                {isEditOpen && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white dark:bg-[#2C2C2C] p-6 rounded-lg w-[350px] shadow-lg">
                      <h2 className="text-lg font-semibold mb-4 dark:text-white">
                        Edit Working Hours
                      </h2>

                      <div className="space-y-3">
                        <div>
                          <label className="text-sm dark:text-white">
                            From Time
                          </label>
                          <input
                            type="time"
                            value={editData.fromtime}
                            onChange={(e) => {
                              const newFrom = e.target.value;
                              const newWorkHrs = calculateWorkHours(
                                newFrom,
                                editData.totime
                              );

                              setEditData({
                                ...editData,
                                fromtime: newFrom,
                                workhrs: newWorkHrs,
                              });
                            }}
                            className="w-full p-2 border rounded dark:bg-[#343434] dark:text-white text-[12px]"
                          />
                        </div>

                        <div>
                          <label className="text-sm dark:text-white">
                            To Time
                          </label>
                          <input
                            type="time"
                            value={editData.totime}
                            onChange={(e) => {
                              const newTo = e.target.value;
                              const newWorkHrs = calculateWorkHours(
                                editData.fromtime,
                                newTo
                              );

                              setEditData({
                                ...editData,
                                totime: newTo,
                                workhrs: newWorkHrs,
                              });
                            }}
                            className="w-full p-2 border rounded dark:bg-[#343434] dark:text-white text-[12px]"
                          />
                        </div>

                        <div>
                          <label className="text-sm dark:text-white">
                            Work Hours
                          </label>
                          <input
                            type="number"
                            value={editData.workhrs}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                workhrs: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded dark:bg-[#343434] dark:text-white text-[12px]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 mt-5">
                        <button
                          className="px-3 py-1 text-sm bg-gray-300 dark:bg-gray-600 dark:text-white rounded"
                          onClick={() => setIsEditOpen(false)}
                        >
                          Cancel
                        </button>

                        <button
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
                          onClick={() => {
                            updateWorkingHours(editData);
                          }}
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {toast && (
            <div className="fixed inset-0 flex items-center justify-center z-[9999] p-6">
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/80"></div>

              {/* Popup */}
              <div
                className={`relative px-6 py-3 rounded-lg text-white text-sm font-medium shadow-xl
        animate-fadeIn
        ${toast.type === "success" ? "bg-green-600 p-4" : "bg-red-600 p-4"}`}
              >
                {toast.message}
              </div>
            </div>
          )}
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

export default EmployeePage;
