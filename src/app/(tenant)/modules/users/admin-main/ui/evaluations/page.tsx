"use client";

import { useState, useEffect } from "react";
import Modal from "react-modal";
import { FaFilter } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { FaEllipsisV } from "react-icons/fa";
import Pagination from "@/components/Pagination";

import Dashboard from "../../components/evaluationcard";
import error from "next/error";
import { MdTune } from "react-icons/md";
import AcademicHeader from "@/app/(tenant)/modules/users/Academic-coach/components/academicHeader";
import axios from "axios";
import { getSocket } from "@/app/utils/socket";
import BaseLayout4 from "../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";


// Define the transformed user structure
interface TransformedUser {
  _id: string;
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  number: string;
  country: string;
  city: string;
  course: string; // Assuming this corresponds to `learningInterest`
  preferredTeacher: string;
  time: string;
  classStatus?: string;
  status?: string;
  trialClassStatus: string;
  paymentStatus: string;
  assignedTeacher: string;
  paymentLink: string;
  studentStatus: string; // Optional if not always present
  createdDate: Date; // Optional if not always present
}

// Define the return type of the getAllUsers function
interface User {
  sortTimestamp: any;
  id: string;
  studentId: string;
  fname: string;
  lname: string;
  email: string;
  number: string;
  country: string;
  course: string;
  preferredTeacher: string;
  date: string;
  time: string;
  status?: string;
  evaluationStatus?: string;
  city: string;
  students?: number;
  comment?: string;
  createdDate: Date;
}

interface GetAllUsersResponse {
  success: boolean;
  data: User[];
  message?: string; // Make message optional
}
interface ClassPayload {
  adminId: string;
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
    learningInterest?: string;
    numberOfStudents: number;
    preferredTeacher: string;
    preferredFromTime?: string;
    preferredToTime?: string;
    timeZone: string;
    referralSource: string;
    preferredDate?: string;
    evaluationStatus: string;
    status: string;
    createdDate: Date;
    createdBy: string;
  };
  classType: string;
  teacher: {
    teacherName: string;
  };
  classDay?: string[]; // assuming it's an array of days like ['Monday', 'Wednesday']
  startTime?: string[];
  endTime?: string[];
  isLanguageLevel: boolean;
  languageLevel: string;
  isReadingLevel: boolean;
  readingLevel: string;
  isGrammarLevel: boolean;
  grammarLevel: string;
  hours: number;
  subscription: {
    subscriptionName: string;
  };
  planTotalPrice: number;
  classStartDate: Date | string;
  classEndDate: Date | string;
  classStartTime: string;
  classEndTime: string;
  gardianName: string;
  gardianEmail: string;
  gardianPhone: string;
  gardianCity: string;
  gardianCountry: string;
  gardianTimeZone: string;
  gardianLanguage: string;
  assignedTeacher: string;
  accomplishmentTime?: string;
  studentRate: number;
  studentStatus: string;
  classStatus: string;
  comments: string;
  trialClassStatus: string;
  invoiceStatus: string;
  paymentLink: string;
  paymentStatus: string;
  teacherStatus: string;
  status: string;
  createdDate: Date;
  createdBy: string;
  updatedDate: Date;
  updatedBy: string;
}

const getAllUser = async (): Promise<{
  success: boolean;
  data: TransformedUser[];
  message: string;
}> => {
  try {
    const academicId = localStorage.getItem("AdminPortalId");
    console.log("academicId>>", academicId);
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AdminAuthToken")
        : null;

    if (!token) {
      console.error("❌ AdminAuthToken not found");
    }
    const response = await axios.get(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.EVALUATION.GET_LIST}`,
      {
        params: { adminId: academicId },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Add debug log for raw API response
    console.log("Raw API Response:", response.data.evaluation);

    // Transform API data to match TransformedUser interface
    const transformedData: TransformedUser[] = response.data.evaluation.map(
      (item: any) => {
        // Debug log for each item's studentStatus
        console.log("Item studentStatus before transform:", item.studentStatus);
        return {
          _id: item._id,
          studentId: item.student.studentId,
          studentFirstName: item.student.studentFirstName,
          studentLastName: item.student.studentLastName,
          number: item.student.studentPhone
            ? item.student.studentPhone.toString()
            : "",
          country: item.student.studentCountry,
          city: item.city,
          course: item.student.learningInterest,
          preferredTeacher: item.student.preferredTeacher,
          time: item.student.preferredFromTime,
          classStatus: item.student.classStatus,
          status: item.student.status,
          trialClassStatus: item.trialClassStatus,
          paymentStatus: item.paymentStatus,
          assignedTeacher: item.assignedTeacher,
          paymentLink: item.paymentLink,
          studentStatus: item.studentStatus,
        };
      }
    );

    // Debug log for transformed data
    console.log("Transformed Data:", transformedData);

    return {
      success: true,
      data: transformedData,
      message: "Users fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Failed to fetch users",
    };
  }
};

// Update the getAllUsers function to fetch from your API
const getAllUsers = async (): Promise<GetAllUsersResponse> => {
  try {
    const academicId = localStorage.getItem("AdminPortalId");
    console.log("academicId>>", academicId);
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AdminAuthToken")
        : null;

    if (!token) {
      console.error("❌ AdminAuthToken not found");
    }
    const response = await axios.get(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.STUDENT.GET_LIST}`,
      {
        params: { adminId: academicId },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Raw API Response:", JSON.stringify(response.data, null, 2));
    console.log(
      "First student data:",
      JSON.stringify(response.data.students[0], null, 2)
    );
    console.log("First student status:", response.data.students[0]?.status);
    console.log(
      "First student studentStatus:",
      response.data.students[0]?.studentStatus
    );

    if (!response.data.students || !Array.isArray(response.data.students)) {
      throw new Error("Invalid data structure received from API");
    }

    // Transform API data to match User interface
    const transformedData = response.data.students.map(
      (item: {
        _id: string;
        studentId: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        city: string;
        country: string;
        learningInterest: string;
        preferredTeacher: string;
        startDate: string;
        preferredFromTime: string;
        preferredToTime: string;
        evaluationStatus?: string;
        status?: string;
        createdDate: string;
      }) => {
        console.log("Processing item - Original data:", {
          status: item.status,
          allFields: Object.keys(item),
        });
        const transformed = {
          id: item._id,
          studentId: item.studentId,
          fname: item.firstName,
          lname: item.lastName,
          email: item.email,
          city: item.city,
          number: item.phoneNumber.toString(),
          country: item.country,
          course: item.learningInterest,
          preferredTeacher: item.preferredTeacher,
          date: new Date(item.startDate).toLocaleDateString(),
          time: item.preferredFromTime,
          evaluationStatus: item.evaluationStatus,
          createdDate: new Date(item.createdDate),
        };
        console.log("Transformed item - Final data:", {
          allFields: Object.keys(transformed),
        });
        return transformed;
      }
    );

    return {
      success: true,
      data: transformedData,
      message: "Users fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Failed to fetch users",
    };
  }
};

const TrailSection = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState<User | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  console.log(setItemsPerPage);

  const [evaluationUsers, setEvaluationUsers] = useState<TransformedUser[]>([]);

  useEffect(() => {
    const fetchEvaluationUsers = async () => {
      const result = await getAllUser();
      if (result.success) {
        setEvaluationUsers(result.data);
      }
    };
    fetchEvaluationUsers();
  }, []);
  useEffect(() => {
    const academicId =
      typeof window !== "undefined"
        ? localStorage.getItem("AdminPortalId")
        : null;
    if (!academicId) return;
    const socket = getSocket(academicId);
    const handleList = (data: {
      event: string;
      data: User | ClassPayload;
      sender: string;
    }) => {
      console.log("📩 Received WebSocket Data:", data);
      if ("studentId" in data.data) {
        const user = data.data as User;
        const formatted: User = {
          sortTimestamp: user.sortTimestamp,
          id: user.id,
          studentId: user.studentId,
          fname: user.fname,
          lname: user.lname,
          email: user.email,
          number: user.number,
          country: user.country,
          city: user.city,
          course: user.course,
          preferredTeacher: user.preferredTeacher,
          date: new Date(user.date).toLocaleDateString(),
          time: user.time,
          evaluationStatus: user.evaluationStatus ?? "PENDING",
          status: "PENDING",
          createdDate: new Date(user.createdDate),
        };

        console.log("➡️ Action: create", formatted.studentId);
        setFilteredUsers((prev) => [...prev, formatted]);
        setUsers((pre) => [...pre, formatted]);
      } else {
        const classPayload = data.data as ClassPayload;
        const student = classPayload.student;

        console.log("➡️ Action: update", student.studentId);

        setFilteredUsers((prev) =>
          prev.map((user) =>
            user.studentId === student.studentId
              ? {
                  ...user,
                  evaluationStatus: student.evaluationStatus ?? "PENDING",
                  status: classPayload.studentStatus ?? "NOT JOINED",
                }
              : user
          )
        );
        setUsers((prev) =>
          prev.map((user) =>
            user.studentId === student.studentId
              ? {
                  ...user,
                  evaluationStatus: student.evaluationStatus ?? "PENDING",
                  status: classPayload.studentStatus ?? "NOT JOINED",
                }
              : user
          )
        );
      }
    };

    socket.on("academicStudentList", handleList);
    return () => {
      socket.off("academicStudentList", handleList);
    };
  }, []);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allData = await getAllUsers();
        if (allData.success && allData.data) {
          setUsers(allData.data);
          setFilteredUsers(allData.data);
        } else {
          setErrorMessage(allData.message ?? "Failed to fetch users");
        }
      } catch (error) {
        setErrorMessage("An unexpected error occurred");
        console.error("An unexpected error occurred", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Modal.setAppElement("body");
  }, []);


  useEffect(() => {
    console.log("Current users data:", users);
  }, [users]);


  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = users.filter((user) => {
      const fullName = `${user.fname} ${user.lname}`.toLowerCase();
      return (
        user.studentId.toLowerCase().includes(query.toLowerCase()) ||
        fullName.includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.number.includes(query) ||
        user.country.toLowerCase().includes(query.toLowerCase()) ||
        user.course.toLowerCase().includes(query.toLowerCase()) ||
        user.preferredTeacher.toLowerCase().includes(query.toLowerCase()) ||
        user.time.toLowerCase().includes(query.toLowerCase()) ||
        user.evaluationStatus?.toLowerCase().includes(query.toLowerCase())
      );
    });
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const recentItems = [...filteredUsers]
    .sort((a, b) => b.sortTimestamp - a.sortTimestamp)
    .slice(0, 5);

  return (
    <BaseLayout4>
      <AcademicHeader currentSection="Trial Class Request" />
      <div className="h-full w-full md:mr-10 scrollbar-none">
        <div>
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
              {/* <span>Filter</span>  */}
            </div>
            <span className="text-[12px] text-gray-400 dark:text-gray-400 py-3">
              Showing {filteredUsers.length === 0 ? 0 : 1} to{" "}
              {Math.min(5, filteredUsers.length)} of {filteredUsers.length}
            </span>
          </div>

          <table className="min-w-full text-xs border-collapse table-fixed px-4">
            <thead className=" text-[12px] bg-[#4C6993] text-white dark:bg-[#44699d]">
              <tr>
                {[
                  { label: "Student ID" },
                  { label: "Student Name" },
                  { label: "Date" },
                  { label: "Mobile" },
                  { label: "Country" },
                  { label: "Course" },
                  { label: "Preferred Teacher" },
                  { label: "EvaluationStatus" },
                ].map((header) => (
                  <th
                    key={header.label}
                    className="py-4 px-2 font-semibold text-left border border-[#466993] dark:border-[#466993]"
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentItems.length > 0 ? (
                recentItems.map((item, index) => (
                  <tr
                    key={item.studentId}
                    className="text-[11px] px-2 py-4 border-none outline-none odd:bg-[#f8f8f8] even:bg-[#ffffff] dark:odd:bg-[#2c2c2c] dark:even:bg-[#303030]"
                  >
                    <td className="py-4 px-2 text-left">{item.studentId}</td>
                    <td className="py-4 px-2 text-left">
                      {item.fname} {item.lname}
                    </td>
                    <td className="py-4 px-2 text-left">
                      {new Date(item.createdDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-2 text-left">{item.number}</td>
                    <td className="py-4 px-2 text-left">{item.country}</td>
                    <td className="py-4 px-2 text-left">{item.course}</td>
                    <td className="py-4 px-2 text-left">
                      {item.preferredTeacher}
                    </td>
                    <td className="py-4 px-2 text-left">
                      <span
                        className={`px-1 text-[10px] text-center py-[3px] rounded-md ${
                          item.evaluationStatus === "COMPLETED"
                            ? "bg-[#ECFDF3] text-[#377E36] px-2 dark:bg-[#377E3633]"
                            : item.evaluationStatus === "INPROGRESS"
                            ? " bg-[#FDECEC] text-[#D34645]  px-3 dark:bg-[#D3464533]"
                            : "bg-[#FDF6EC] text-[#F0AD4E] px-3 dark:bg-[#F0AD4E33]"
                        }`}
                      >
                        {item.evaluationStatus === "COMPLETED"
                          ? "COMPLETED"
                          : item.evaluationStatus === "INPROGRESS"
                          ? "IN PROGRESS"
                          : "PENDING"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="p-4 text-center">
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
            onClick={() => router.push("/modules/users/admin-main/ui/trailclasslist")}
          >
            View All
          </button>
        </div>
      </div>
    </BaseLayout4>
  );
};

export default TrailSection;
