"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Search } from "lucide-react";
import { MdTune } from "react-icons/md";
import Pagination from "@/components/Pagination";
import AdminHeader from "../../components/AdminHeader";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";
import BaseLayout4 from "../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

export interface TransformedUser {
  _id: string;
  trialId: string;
  academicCoachId: string;
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
    preferredDate: string; // ISO Date string
    evaluationStatus: string;
    status: string;
    createdDate: string; // ISO Date string
    createdBy: string;
  };
  teacher: {
    teacherName: string;
  };
  subscription: {
    subscriptionName: string;
  };
  classDay: string[]; // e.g., ["Monday", "Tuesday"]
  startTime: string[]; // e.g., ["09:00", "09:00"]
  endTime: string[]; // e.g., ["09:30", "09:30"]
  isLanguageLevel: boolean;
  languageLevel: string;
  isReadingLevel: boolean;
  readingLevel: string;
  isGrammarLevel: boolean;
  grammarLevel: string;
  hours: number;
  planTotalPrice: number;
  classStartDate: string; // ISO Date string
  classEndDate: string; // ISO Date string
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
  createdDate: string; // ISO Date string
  createdBy: string;
  updatedDate: string; // ISO Date string
  updatedBy: string;
  expectedFinishingDate: number;
  teacherStatus: string;
  __v: number;
}

const Trailclasslist = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredUsers, setFilteredUsers] = useState<TransformedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    course: "",
    country: "",
    preferredTeacher: "",
    assignedCoach: "",
    fromDate: "",
    toDate: "",
    time: "",
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("AdminAuthToken") : null;

    if (!token) {
      console.error("❌ AdminAuthToken not found");
      return;
    }
    if (token) {
      getAllUsers(token); // Or call the function that performs the GET request
    } else {
      toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
    }
  }, []);
  const getAllUsers = async (token: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.ALL_TRIAL_CLASSES}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      const pendingClasses = data.evaluation.filter(
        (item: { trialClassStatus: string }) =>
          item.trialClassStatus === "COMPLETED"
      );
      setFilteredUsers(pendingClasses); // Only pending data
      setErrorMessage(null);
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMessage("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  const router = useRouter();

  // Extract unique values for dropdowns
  const uniqueCourses = Array.from(new Set(filteredUsers.map(u => u.student.learningInterest).filter(Boolean)));
  const uniqueCountries = Array.from(new Set(filteredUsers.map(u => u.student.studentCountry).filter(Boolean)));
  const uniquePreferredTeachers = Array.from(new Set(filteredUsers.map(u => u.student.preferredTeacher).filter(Boolean)));
  const uniqueAssignedCoaches = Array.from(new Set(filteredUsers.map(u => u.assignedTeacher).filter(Boolean)));

  // Filtering logic
  const filteredItemsAll = filteredUsers.filter((item) => {
    const searchFields = [
      item._id,
      `${item.student.studentFirstName} ${item.student.studentLastName}`,
      item.student.studentPhone,
      item.student.studentCountry,
      item.student.learningInterest,
      item.student.preferredTeacher,
      item.assignedTeacher,
      item.classStartTime,
      item.classStatus,
      item.paymentStatus,
      item.status,
    ];
    const matchesSearch = searchFields.some((field) =>
      field ? field.toString().toLowerCase().includes(searchQuery.toLowerCase()) : false
    );
    const matchesCourse = !filter.course || item.student.learningInterest === filter.course;
    const matchesCountry = !filter.country || item.student.studentCountry === filter.country;
    const matchesPreferredTeacher = !filter.preferredTeacher || item.student.preferredTeacher === filter.preferredTeacher;
    const matchesAssignedCoach = !filter.assignedCoach || item.assignedTeacher === filter.assignedCoach;
    const matchesFromDate = !filter.fromDate || (item.classStartDate && new Date(item.classStartDate) >= new Date(filter.fromDate));
    const matchesToDate = !filter.toDate || (item.classStartDate && new Date(item.classStartDate) <= new Date(filter.toDate));
    const matchesTime = !filter.time || item.classStartTime === filter.time;
    return (
      matchesSearch &&
      matchesCourse &&
      matchesCountry &&
      matchesPreferredTeacher &&
      matchesAssignedCoach &&
      matchesFromDate &&
      matchesToDate &&
      matchesTime
    );
  });

  const totalPages = Math.ceil(filteredItemsAll.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredItems = filteredItemsAll.slice(indexOfFirstItem, indexOfLastItem);


  return (
    <BaseLayout4>
      <AdminHeader currentSection="Scheduled Trial Class" showBackButton showBackPath="trailmanagement" />
      <div className="py-2 px-4 mx-auto w-full ">
        <div className="w-full bg-[#FAFAFB] rounded-lg dark:bg-[#343434]">
          <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
            <div className="flex items-center gap-2 text-sm text-gray-500 px-2">
              <Search className="w-3 h-3 text-gray-400 dark:text-gray-400 -mt-[1px]" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent outline-none text-[12px] w-52 py-3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div
              className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
              onClick={() => setIsFilterModalOpen(true)}
            >
              <MdTune className="w-4 h-4" />
              <span>Filter</span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-gray-400 dark:text-gray-400">
              <span className="text-left -ml-60 ">
                Showing {filteredItemsAll.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredItemsAll.length)} of {filteredItemsAll.length}
              </span>
            </div>
          </div>
          <table className="table-auto w-full"
            style={{ width: "100%", tableLayout: "fixed" }}>
            <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
              <tr className="font-medium">
                {[
                  { label: "Trial ID", width: "w-[11%]" },
                  { label: "Student Name", width: "w-[12%]" },
                  { label: "Mobile", width: "w-[10%]" },
                  { label: "Country", width: "w-[8%]" },
                  { label: "Course", width: "w-[10%]" },
                  { label: "Preferred Teacher", width: "w-[10%]" },
                  { label: "Assigned Teacher", width: "w-[10%]" },
                  { label: "Date", width: "w-[10%]" },
                  { label: "Time", width: "w-[10%]" },
                  { label: "Class Status", width: "w-[8%]" },
                  { label: "Student Status", width: "w-[10%]" },
                  { label: "Payment Status", width: "w-[8%]" },

                ].map((header, i) => (
                  <th
                    key={header.label}
                    className={`text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0] break-words ${header.width}`}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <tr
                    key={item.trialId}
                    className={`text-[11px] text-[#010E30E5]  ${index % 2 === 0 ? "bg-[#fff] dark:bg-[#2C2C2C] "
                        : "bg-[#F8F8F8] dark:bg-[#303030]"
                      }`}
                  >
                    <td className="px-3 py-3 text-[#010E30E5] dark:text-white break-words w-[11%]">
                      {item.trialId}
                    </td>
                    <td className="px-5 py-2 text-[#3D8FDE] font-medium text-left break-words w-[12%]">
                      {item.student.studentFirstName} {item.student.studentLastName}
                    </td>
                    <td className="px-3 py-2 text-[#010E30E5] dark:text-white break-words w-[10%]">
                      {item.student.studentPhone}
                    </td>
                    <td className="px-3 py-2 text-[#010E30E5] dark:text-white w-[8%]">
                      {item.student.studentCountry}
                    </td>
                    <td className="px-3 py-2 text-[#010E30E5] dark:text-white w-[10%]">
                      {item.student.learningInterest}
                    </td>
                    <td className="px-3 py-2 text-[#010E30E5] dark:text-white w-[10%]">
                      {item.student.preferredTeacher}
                    </td>
                    <td className="px-3 py-2 text-[#010E30E5] dark:text-white w-[10%]">
                      {item.assignedTeacher}
                    </td>
                    <td className="px-3 py-2 text-[#010E30E5] dark:text-white w-[8%]">
                      {item.classStartDate
                        ? new Date(item.classStartDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                        : ""}
                    </td>
                    <td className="px-3 py-2 text-[#010E30E5] dark:text-white w-[8%]">
                      {item.classStartTime}
                    </td>
                    {/* Class Status */}
                    <td className="px-3 py-2">
                      <span
                        className={`px-1 text-[10px] text-center py-[3px] rounded-md ${item.trialClassStatus === "COMPLETED"
                            ? "bg-[#ECFDF3] dark:bg-[#2E3C2E] text-[#377E36] px-2"
                            : item.trialClassStatus === "INPROGRESS"
                              ? "bg-[#FDECEC] dark:bg-[#D3464533] text-[#D34645] px-3"
                              : "bg-[#FDF6EC] dark:bg-[#F0AD4E33] text-[#F0AD4E] px-3"
                          }`}
                      >
                        {item.trialClassStatus}
                      </span>
                    </td>

                    {/* Student Status */}
                    <td className="px-3 py-2">
                      <span
                        className={`px-1 text-[10px] text-center py-[3px] rounded-md ${item.status === "Active"
                            ? "bg-[#ECFDF3] dark:bg-[#2E3C2E] text-[#377E36] px-3"
                            : item.status === "PENDING"
                              ? "bg-[#FDF6EC] dark:bg-[#F0AD4E33] text-[#F0AD4E] px-3"
                              : "bg-[#FDECEC] dark:bg-[#D3464533] text-[#D34645] px-3"
                          }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    {/* Payment Status */}
                    <td className="px-3 py-2">
                      <span
                        className={`px-1 text-[10px] text-center py-[3px] rounded-md ${item.paymentStatus === "PAID"
                            ? "bg-[#ECFDF3] dark:bg-[#2E3C2E] text-[#377E36] px-4"
                            : item.paymentStatus === "PENDING"
                              ? "bg-[#FDF6EC] dark:bg-[#F0AD4E33] text-[#F0AD4E] px-3"
                              : "bg-[#FDECEC] dark:bg-[#D3464533] text-[#D34645] px-3"
                          }`}
                      >
                        {item.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="p-4 text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <Modal
        isOpen={isFilterModalOpen}
        onRequestClose={() => setIsFilterModalOpen(false)}
        className="bg-white dark:bg-[#252525] rounded-lg p-4 w-[400px] mx-auto mt-10 shadow-xl outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
      >
        <h2 className="text-[14px] font-semibold mb-3 dark:text-white">Filter By</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium mb-1 dark:text-gray-200">course</label>
            <select
              className="w-full rounded border dark:border dark:border-[#5c5c5c] px-3 py-2 dark:bg-[#343434] dark:text-white text-[11px]"
              value={filter.course}
              onChange={e => setFilter(f => ({ ...f, course: e.target.value }))}
            >
              <option value="">All</option>
              {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1 dark:text-gray-200">country</label>
            <select
              className="w-full rounded border dark:border dark:border-[#5c5c5c] px-3 py-2 dark:bg-[#343434] dark:text-white text-[11px]"
              value={filter.country}
              onChange={e => setFilter(f => ({ ...f, country: e.target.value }))}
            >
              <option value="">All</option>
              {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1 dark:text-gray-200">preferred teacher</label>
            <select
              className="w-full rounded border dark:border dark:border-[#5c5c5c] px-3 py-2 dark:bg-[#343434] dark:text-white text-[11px]"
              value={filter.preferredTeacher}
              onChange={e => setFilter(f => ({ ...f, preferredTeacher: e.target.value }))}
            >
              <option value="">All</option>
              {uniquePreferredTeachers.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1 dark:text-gray-200">Assigned Teacher</label>
            <select
              className="w-full rounded border dark:border dark:border-[#5c5c5c] px-3 py-2 dark:bg-[#343434] dark:text-white text-[11px]"
              value={filter.assignedCoach}
              onChange={e => setFilter(f => ({ ...f, assignedCoach: e.target.value }))}
            >
              <option value="">All</option>
              {uniqueAssignedCoaches.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[12px] font-medium mb-1 dark:text-gray-200">From Date</label>
              <input
                type="date"
                className="w-full rounded border dark:border dark:border-[#5c5c5c] px-3 py-2 dark:bg-[#343434] dark:text-white text-[11px] [&::-webkit-calendar-picker-indicator]:dark:invert"
                value={filter.fromDate}
                onChange={e => setFilter(f => ({ ...f, fromDate: e.target.value }))}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-medium mb-1 dark:text-gray-200">To Date</label>
              <input
                type="date"
                className="w-full rounded border dark:border dark:border-[#5c5c5c] px-3 py-2 dark:bg-[#343434] dark:text-white text-[11px] [&::-webkit-calendar-picker-indicator]:dark:invert"
                value={filter.toDate}
                onChange={e => setFilter(f => ({ ...f, toDate: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1 dark:text-gray-200">Time</label>
            <input
              type="time"
              className="w-full rounded border dark:border dark:border-[#5c5c5c]  px-3 py-2 dark:bg-[#343434] dark:text-white text-[11px] [&::-webkit-calendar-picker-indicator]:dark:invert"
              value={filter.time}
              onChange={e => setFilter(f => ({ ...f, time: e.target.value }))}
            />
          </div>
          <div className="flex justify-between mt-4">
            <button
              className="px-4 py-2 text-[12px] rounded bg-gray-200 dark:bg-[#232323] text-gray-700 dark:text-white border dark:border-gray-600"
              onClick={() => {
                setFilter({
                  course: "",
                  country: "",
                  preferredTeacher: "",
                  assignedCoach: "",
                  fromDate: "",
                  toDate: "",
                  time: "",
                });
                setIsFilterModalOpen(false);
              }}
            >
              Reset
            </button>
            <button
              className="px-4 py-2 text-[12px] rounded bg-[#23406a] text-white font-semibold"
              onClick={() => setIsFilterModalOpen(false)}
            >
              Apply
            </button>
          </div>
        </div>
      </Modal>
    </BaseLayout4>
  );
};

export default Trailclasslist;
