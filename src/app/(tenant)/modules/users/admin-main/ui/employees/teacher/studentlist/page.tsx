"use client";


import React, { useEffect, useState } from "react";
import Image from "next/image";
import AdminHeader from "@/app/(tenant)/modules/users/admin-main/components/AdminHeader";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MoreVertical } from "lucide-react";
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
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  __v: number;
}

const page = () => {

  const searchParams = useSearchParams();
  const employeeId = searchParams.get("teacherId");

  const [scheduledclass, setScheduledClass] = useState<ScheduledClass[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);


  // Place filter state hooks before filteredStudents logic
  const [filterStudentName, setFilterStudentName] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterSubject, setFilterSubject] = useState("");


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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchTerm(query);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Extract unique filter options
  const studentNames = Array.from(new Set(students.map(
    s => s.studentDetails?.student?.studentFirstName
  ).filter(Boolean)));
  const countries = Array.from(new Set(students.map(
    s => s.studentDetails?.student?.studentCountry
  ).filter(Boolean)));
  const subjects = Array.from(new Set(students.map(
    s => s.studentDetails?.student?.learningInterest
  ).filter(Boolean)));
  const filteredStudents = students.filter((item) => {
    const student = item.studentDetails?.student;
    const matchesSearch = [
      item.studentId,
      student?.studentFirstName,
      student?.studentLastName,
      student?.studentCountry,
      student?.learningInterest,
      student?.preferredTeacher,
      student?.status,
    ].some((field) =>
      field
        ? field.toString().toLowerCase().includes(searchTerm.toLowerCase())
        : false
    );
    const matchesName = filterStudentName ? student?.studentFirstName === filterStudentName : true;
    const matchesCountry = filterCountry ? student?.studentCountry === filterCountry : true;
    const matchesSubject = filterSubject ? student?.learningInterest === filterSubject : true;
    return matchesSearch && matchesName && matchesCountry && matchesSubject;
  });
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const currentItems = filteredStudents.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <BaseLayout4>
      <AdminHeader currentSection="Student List" showBackButton showBackPath={`/modules/users/admin-main/ui/employees/teacher?teacherId=${employeeId}`} />
      <div>
        <div className="rounded-lg overflow-hidden">
        <div className="flex flex-row sm:flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent outline-none text-[12px] w-32 py-3"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
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
            Showing{" "}
                {filteredStudents.length === 0 ? 0 : indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredStudents.length)} of{" "}
                {filteredStudents.length}
              </span>
          </div>
          {/* Filter Modal */}
          {isFilterModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-[#232323] p-6 rounded-lg w-96">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-black dark:text-white">Filter by</h2>
                  <button onClick={() => setIsFilterModalOpen(false)} className="text-gray-500 dark:text-gray-300 text-2xl">&times;</button>
                </div>
                <label className="block mb-2 text-black dark:text-white text-sm">Student Name</label>
                <select
                  className="w-full p-2 mb-4 rounded bg-gray-100 dark:bg-[#343434] text-black dark:text-white text-xs"
                  value={filterStudentName}
                  onChange={e => setFilterStudentName(e.target.value)}
                >
                  <option value="" className="text-black dark:text-white text-xs">Select Student Name</option>
                  {studentNames.map(name => (
                    <option className="text-black dark:text-white text-xs" key={name} value={name}>{name}</option>
                  ))}
                </select>
                <label className="block mb-2 text-black dark:text-white text-sm">Country</label>
                <select
                  className="w-full p-2 mb-4 rounded bg-gray-100 dark:bg-[#343434] text-black dark:text-white text-xs"
                  value={filterCountry}
                  onChange={e => setFilterCountry(e.target.value)}
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                <label className="block mb-2 text-black dark:text-white text-sm">Subject</label>
                <select
                  className="w-full p-2 mb-4 rounded bg-gray-100 dark:bg-[#343434] text-black dark:text-white text-xs"
                  value={filterSubject}
                  onChange={e => setFilterSubject(e.target.value)}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                <div className="flex justify-between">
                  <button
                    className="px-2 py-1 border rounded text-black dark:text-white text-sm"
                    onClick={() => {
                      setFilterStudentName("");
                      setFilterCountry("");
                      setFilterSubject("");
                    }}
                  >
                    Reset
                  </button>
                  <button
                    className="px-2 py-1 bg-[#576CBC] text-white rounded text-sm"
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
                  <th className="p-3 font-semibold text-[12px] text-left">
                    Student ID
                  </th>
                  <th className="p-3 font-semibold text-[12px] text-left">
                  Student Name
                  </th>
                  <th className="p-3 font-semibold text-[12px] text-left">
                    Country
                  </th>
                  <th className="p-3 font-semibold text-[12px] text-left">
                    Subject
                  </th>
                  <th className="p-3 font-semibold text-[12px] text-left">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="text-[10px] text-[#1D2939]">
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => {
                    const student = item.studentDetails?.student;
                    return (
                      <tr
                        key={item.studentId || index}
                        className={`text-left dark:text-white ${
                          index % 2 === 0
                            ? "bg-[#fff] dark:bg-[#2C2C2C]"
                            : "bg-[#F8F8F8] dark:bg-[#303030]"
                        }`}
                      >
                        <td className="p-3">{student?.studentId}</td>
                        <td className="p-3">{student?.studentFirstName}</td>
                        <td className="p-3">{student?.studentCountry}</td>
                        <td className="p-3">{student?.learningInterest}</td>
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
        {totalPages >= 1 && (
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
