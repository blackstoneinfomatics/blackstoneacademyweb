"use client";


import React, { useEffect, useState } from "react";
import Image from "next/image";
import AdminHeader from "@/app/(tenant)/modules/users/admin-main/components/AdminHeader";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip as ChartTooltip,
  Filler,
} from "chart.js";
import axios from "axios";
import { MdTune } from "react-icons/md";
import Pagination from "@/components/Pagination";
import BaseLayout4 from "../../../../components/BaseLayout4";
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

countries.registerLocale(enLocale);

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

interface ShiftSchedule {
  date: string;
  day: string;
  fromTime: string;
  toTime: string;
}

const page = () => {


  const searchParams = useSearchParams();
  const employeeId = searchParams.get("teacherId");
  const [schedule, setSchedule] = useState<ShiftSchedule[]>([]);
  const [scheduledclass, setScheduledClass] = useState<ScheduledClass[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchWorkingHours, setSearchWorkingHours] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});

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
      setScheduledClass(response.data.classSchedule);
    } catch (error) {
      console.error("Error fetching schedule:", error);
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
        setSchedule(res.data);
      } catch (error) {
        console.error("Error fetching schedule:", error);
      }
    };

    fetchData();
  }, []);



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

  const totalPages = Math.ceil(filteredWorkingHours.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  return (
    <BaseLayout4>
      <AdminHeader currentSection="Working Hours" showBackButton={true} showBackPath={`/modules/users/admin-main/ui/employees/teacher?teacherId=${employeeId}`} />
      <div>
        <div>
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
                className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-3 border-r-2 border-l-2 px-48 cursor-pointer"
                onClick={() => setIsFilterModalOpen(true)}
              >
                <MdTune className="w-4 h-4" />
                <span>Filter</span>
              </div>
              <span className="text-[12px] text-gray-400 dark:text-gray-400 py-3">
                Showing {filteredWorkingHours.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredWorkingHours.length)} of {filteredWorkingHours.length}
              </span>
            </div>
            {/* Filter Modal */}
            {isFilterModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-[#232323] p-6 rounded-lg w-96">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-black dark:text-white">Filter by</h2>
                    <button onClick={() => setIsFilterModalOpen(false)} className="text-gray-500 dark:text-gray-300 text-2xl">&times;</button>
                  </div>
                  <label className="block mb-2 text-black dark:text-white">Day</label>
                  <select
                    className="w-full p-2 mb-4 rounded bg-gray-100 dark:bg-[#343434] text-black dark:text-white text-xs"
                    value={filterDay}
                    onChange={e => setFilterDay(e.target.value)}
                  >
                    <option value="" className="text-black dark:text-white text-xs">Select Day</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                  <label className="block mb-2 text-black dark:text-white">Date</label>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="date"
                      className="w-1/2 p-2 rounded bg-gray-100 dark:bg-[#343434] text-black dark:text-white text-xs"
                      value={filterStartDate}
                      onChange={e => setFilterStartDate(e.target.value)}
                    />
                    <input
                      type="date"
                      className="w-1/2 p-2 rounded bg-gray-100 dark:bg-[#343434] text-black dark:text-white text-xs"
                      value={filterEndDate}
                      onChange={e => setFilterEndDate(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between">
                    <button
                      className="px-4 py-2 border rounded text-black dark:text-white text-sm"
                      onClick={() => {
                        setFilterDay("");
                        setFilterStartDate("");
                        setFilterEndDate("");
                      }}
                    >
                      Reset
                    </button>
                    <button
                      className="px-4 py-2 bg-[#576CBC] text-white rounded text-sm"
                      onClick={() => setIsFilterModalOpen(false)}
                    >
                      Show results
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                            className={`text-left dark:text-white ${
                              index % 2 === 0
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
      </div>
    </BaseLayout4>
  );
};

export default page;
