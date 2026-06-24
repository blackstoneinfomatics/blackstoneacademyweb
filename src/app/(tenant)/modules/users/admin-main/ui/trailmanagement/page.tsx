"use client";

import { useState, useEffect } from "react";
import Modal from "react-modal";
import { useRouter } from "next/navigation";
import Dashboard from "@/app/(tenant)/modules/users/admin-main/components/trailmanagementcard";
import { Search } from "lucide-react";
import { MdTune } from "react-icons/md";
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

const TrailManagement = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<TransformedUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  console.log(setItemsPerPage);

  const router = useRouter();
  useEffect(() => {
    Modal.setAppElement("body");
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AdminAuthToken")
        : null;

    if (!token) {
      console.error("❌ AdminAuthToken not found");
      return;
    }
    if (token) {
      getAllUsers(token); // call your function with token
    } else {
      toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
    }
  }, []);

  const getAllUsers = async (token: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.ALL_TRIAL_CLASSES}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchTerm(query);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const filteredItems = currentItems.filter((item) => {
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
    return searchFields.some((field) =>
      field
        ? field.toString().toLowerCase().includes(searchTerm.toLowerCase())
        : false
    );
  });

  return (
    <BaseLayout4>
    <AdminHeader currentSection="Scheduled Trial Classes"/>
      <div className="py-2 md:mr-10 w-full scrollbar-none mx-auto h-full">
        <div className="p-2">
          <Dashboard />
        </div>
        <div className="w-full h-[350px] overflow-y-scroll scrollbar-none bg-[#FAFAFB] rounded-lg dark:bg-[#343434]">
        <div className="flex flex-row sm:flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
        <input
                  type="text"
                  placeholder="Search"
                  className="bg-transparent outline-none text-[12px] w-52 py-3"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              <div 
                      className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 cursor-pointer"
                      onClick={() => setIsFilterModalOpen(true)}
              >
                <MdTune className="w-4 h-4" />
                {/* <span>Filter</span> */}
              </div>
              <span className="text-[12px] text-gray-400 dark:text-gray-400 py-3">
              Showing {filteredUsers.length === 0 ? 0 : 1} to{" "}
                  {Math.min(5, filteredUsers.length)} of {filteredUsers.length}
                </span>
            </div>

            <table className="w-full table-auto" style={{ width: "100%", tableLayout: "fixed" }}>
              <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                <tr className="font-medium">
                  {[
                    { label: "Trial ID", width: "w-[10%]" },
                    { label: "Student Name", width: "w-[12%]" },
                    { label: "Mobile", width: "w-[10%]" },
                    { label: "Country", width: "w-[8%]" },
                    { label: "Course", width: "w-[10%]" },
                    { label: "Preferred Teacher", width: "w-[9%]" },
                    { label: "Assigned Teacher", width: "w-[13%]" },
                    { label: "Date", width: "w-[10%]" },
                    { label: "Time", width: "w-[8%]" },
                    { label: "Class Status", width: "w-[10%]" },
                    { label: "Student Status", width: "w-[8%]" },
                    { label: "Payment Status", width: "w-[10%]" },
                  ].map((header, i) => (
                    <th
                      key={header.label}
                      className={`text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0] ${header.width}`}
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.slice(-5).reverse().map((item, index) => (
                    <tr
                      key={item.trialId}
                      className={`text-[11px] ${
                        index % 2 === 0 ? "bg-[#fff] dark:bg-[#2C2C2C]" : "bg-[#F8F8F8] dark:bg-[#303030]"
                      }`}
                    >
                      <td className="px-3 py-2 text-[#010E30E5] dark:text-[#fff] break-words w-[10%]">
                        {item.trialId}
                      </td>
                      <td className="px-5 py-2 text-[#3D8FDE] font-medium text-left break-words w-[12%]">
                        {item.student.studentFirstName}{" "}
                        {item.student.studentLastName}
                      </td>
                      <td className="px-3 py-2 text-[#010E30E5] dark:text-[#fff] break-words w-[10%]">
                        {item.student.studentPhone}
                      </td>
                      <td className="px-3 py-2 text-[#010E30E5] dark:text-[#fff] w-[8%]">
                        {item.student.studentCountry}
                      </td>
                      <td className="px-3 py-2 text-[#010E30E5] dark:text-[#fff] w-[10%]">
                        {item.student.learningInterest}
                      </td>
                      <td className="px-3 py-2 text-[#010E30E5] dark:text-[#fff] break-words w-[10%]">
                        {item.student.preferredTeacher}
                      </td>
                      <td className="px-3 py-2 text-[#010E30E5] dark:text-[#fff] w-[10%]">
                        {item.assignedTeacher}
                      </td>
                      <td className="px-3 py-2 text-[#010E30E5] dark:text-[#fff] w-[8%]">
                        {item.classStartDate
                          ? new Date(item.classStartDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : ""}
                      </td>
                      <td className="px-3 py-2 text-[#010E30E5] dark:text-[#fff] w-[8%]">
                        {item.classStartTime}
                      </td>
                      {/* Class Status */}
                      <td className="px-3 py-2 text-[12px] w-[20%]">
                        <span
                          className={`px-1 text-[10px] text-center py-[3px] rounded-md ${
                            item.trialClassStatus === "COMPLETED"
                              ? "bg-[#ECFDF3] dark:bg-[#2E3C2E] text-[#377E36] px-2"
                              : item.trialClassStatus === "INPROGRESS"
                              ? "bg-[#FDECEC] dark:bg-[#D3464533] dark:opacity-20 text-[#D34645] px-3"
                              : "bg-[#FDF6EC] dark:bg-[#F0AD4E33] dark:opacity-20 text-[#F0AD4E] px-3"
                          }`}
                        >
                          {item.trialClassStatus}
                        </span>
                      </td>
                      {/* Student Status */}
                      <td className="px-3 py-2 text-[12px]">
                        <span
                          className={`px-1 text-[11px] text-center py-[3px] rounded-md ${
                            item.status === "Active"
                              ? "bg-[#ECFDF3] dark:bg-[#2E3C2E] text-[#377E36] px-3"
                              : item.status === "PENDING"
                              ? "bg-[#FDF6EC] dark:bg-[#F0AD4E33] dark:opacity-20 text-[#F0AD4E] px-3"
                              : "bg-[#FDECEC] dark:bg-[#D3464533] dark:opacity-20 text-[#D34645] px-3"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      {/* Payment Status */}
                      <td className="px-3 py-2 text-[11px]">
                        <span
                          className={`px-1 text-[11px] text-center py-[3px] rounded-md ${
                            item.paymentStatus === "PAID"
                              ? "bg-[#ECFDF3] dark:bg-[#2E3C2E] text-[#377E36] px-4"
                              : item.paymentStatus === "PENDING"
                              ? "bg-[#FDF6EC] dark:bg-[#F0AD4E33] dark:opacity-20 text-[#F0AD4E] px-3"
                              : "bg-[#FDECEC] dark:bg-[#D3464533] dark:bg-opacity-20 text-[#D34645] px-3"
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
        <div className="flex justify-end mt-4">
            <button
              className="bg-transparent border border-[#576CBC] text-[#576CBC] text-[11px] px-3 py-1 rounded-md shadow transition"
              onClick={() =>
                router.push("/modules/users/admin-main/ui/scheduledtrailclasslist")
              }
            >
              View All
            </button>
          </div>
      </div>
    </BaseLayout4>
  );
};

export default TrailManagement;
