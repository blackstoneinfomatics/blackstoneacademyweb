"use client";

import { useState, useEffect } from "react";
import Modal from "react-modal";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Pagination from "@/components/Pagination";
import { MdTune } from "react-icons/md";
import axios from "axios";
import AdminHeader from "../../components/AdminHeader";
import { getSocket } from "@/app/utils/socket";
import BaseLayout4 from "../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";


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

// Updated FilterModal component
const FilterModal = ({
  isOpen,
  onClose,
  onApplyFilters,
  users,
  evaluationUsers,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: {
    studentId: string;
    studentName: string;
    date: string;
    mobile: string;
    country: string;
    course: string;
    preferredTeacher: string;
    evaluationStatus: string;
    studentStatus: string;
  }) => void;
  users: User[];
  evaluationUsers: TransformedUser[];
}) => {
  const [filters, setFilters] = useState({
    studentId: "",
    studentName: "",
    date: "",
    mobile: "",
    country: "",
    course: "",
    preferredTeacher: "",
    evaluationStatus: "",
    studentStatus: "",
  });

  // Get unique values for each filter
  const uniqueCountries = Array.from(
    new Set(users.map((user) => user.country))
  ).filter(Boolean);
  
  const uniqueCourses = Array.from(
    new Set(users.map((user) => user.course))
  ).filter(Boolean);
  
  const uniqueTeachers = Array.from(
    new Set(users.map((user) => user.preferredTeacher))
  ).filter(Boolean);
  
  const uniqueEvaluationStatus = Array.from(
    new Set(users.map((user) => user.evaluationStatus))
  ).filter(Boolean);

  // Get unique student statuses from evaluationUsers data
  const uniqueStudentStatus = Array.from(
    new Set(
      users.map((user) => {
        const evalUser = evaluationUsers.find(
          (evalUser) => evalUser.studentId === user.studentId
        );
        return evalUser?.studentStatus?.toUpperCase() || "NOT JOINED";
      })
    )
  ).filter(Boolean);

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      studentId: "",
      studentName: "",
      date: "",
      mobile: "",
      country: "",
      course: "",
      preferredTeacher: "",
      evaluationStatus: "",
      studentStatus: "",
    });
  };

  // Calculate result count
  const resultCount = users.filter((user) => {
    // Get student status for this user
    const evalUser = evaluationUsers.find(
      (evalUser) => evalUser.studentId === user.studentId
    );
    const userStudentStatus = evalUser?.studentStatus?.toUpperCase() || "NOT JOINED";

    return (
      (!filters.studentId || 
        user.studentId.toLowerCase().includes(filters.studentId.toLowerCase())) &&
      (!filters.studentName ||
        `${user.fname} ${user.lname}`
          .toLowerCase()
          .includes(filters.studentName.toLowerCase())) &&
      (!filters.date ||
        new Date(user.createdDate).toLocaleDateString().includes(filters.date)) &&
      (!filters.mobile || user.number.includes(filters.mobile)) &&
      (!filters.country || user.country === filters.country) &&
      (!filters.course || user.course === filters.course) &&
      (!filters.preferredTeacher || user.preferredTeacher === filters.preferredTeacher) &&
      (!filters.evaluationStatus || user.evaluationStatus === filters.evaluationStatus) &&
      (!filters.studentStatus || userStudentStatus === filters.studentStatus)
    );
  }).length;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 rounded-lg w-[500px]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="fixed inset-0 bg-opacity-40 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg w-[400px] max-h-[80vh] overflow-y-auto relative dark:bg-[#252525]">
          <div className="flex justify-between items-center mb-6 sticky top-0 z-10 bg-white dark:bg-[#252525] pb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Filter by
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 text-xl hover:text-gray-600 dark:hover:text-gray-200"
            >
              ×
            </button>
          </div>

          <div className="space-y-4 bg-white dark:bg-[#252525]">
            {/* Student ID */}
            <div>
              <label
                htmlFor="studentId"
                className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]"
              >
                Student ID
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded text-sm text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                value={filters.studentId}
                onChange={(e) =>
                  setFilters({ ...filters, studentId: e.target.value })
                }
                placeholder="Enter Student ID"
              />
            </div>

            {/* Student Name */}
            <div>
              <label
                htmlFor="studentName"
                className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]"
              >
                Student Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded text-sm text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                value={filters.studentName}
                onChange={(e) =>
                  setFilters({ ...filters, studentName: e.target.value })
                }
                placeholder="Enter Student Name"
              />
            </div>

            {/* Date */}
            <div>
              <label
                htmlFor="date"
                className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]"
              >
                Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded text-sm text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                value={filters.date}
                onChange={(e) =>
                  setFilters({ ...filters, date: e.target.value })
                }
              />
            </div>

            {/* Mobile */}
            <div>
              <label
                htmlFor="mobile"
                className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]"
              >
                Mobile
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded text-sm text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                value={filters.mobile}
                onChange={(e) =>
                  setFilters({ ...filters, mobile: e.target.value })
                }
                placeholder="Enter Mobile Number"
              />
            </div>

            {/* Country */}
            <div>
              <label
                htmlFor="country"
                className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]"
              >
                Country
              </label>
              <select
                className="w-full px-3 py-2 border rounded text-sm text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                value={filters.country}
                onChange={(e) =>
                  setFilters({ ...filters, country: e.target.value })
                }
              >
                <option value="">Select Country</option>
                {uniqueCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Course */}
            <div>
              <label
                htmlFor="course"
                className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]"
              >
                Course
              </label>
              <select
                className="w-full px-3 py-2 border rounded text-sm text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                value={filters.course}
                onChange={(e) =>
                  setFilters({ ...filters, course: e.target.value })
                }
              >
                <option value="">Select Course</option>
                {uniqueCourses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred Teacher */}
            <div>
              <label
                htmlFor="preferredTeacher"
                className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]"
              >
                Preferred Teacher
              </label>
              <select
                className="w-full px-3 py-2 border rounded text-sm text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                value={filters.preferredTeacher}
                onChange={(e) =>
                  setFilters({ ...filters, preferredTeacher: e.target.value })
                }
              >
                <option value="">Select Teacher</option>
                {uniqueTeachers.map((teacher) => (
                  <option key={teacher} value={teacher}>
                    {teacher}
                  </option>
                ))}
              </select>
            </div>

            {/* Evaluation Status */}
            <div>
              <label
                htmlFor="evaluationStatus"
                className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]"
              >
                Evaluation Status
              </label>
              <select
                className="w-full px-3 py-2 border rounded text-sm text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                value={filters.evaluationStatus}
                onChange={(e) =>
                  setFilters({ ...filters, evaluationStatus: e.target.value })
                }
              >
                <option value="">Select Evaluation Status</option>
                {uniqueEvaluationStatus.map((status) => (
                  <option key={status} value={status}>
                    {status === "COMPLETED" ? "COMPLETED" : 
                     status === "INPROGRESS" ? "IN PROGRESS" : 
                     status || "PENDING"}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Status */}
            <div>
              <label
                htmlFor="studentStatus"
                className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]"
              >
                Student Status
              </label>
              <select
                className="w-full px-3 py-2 border rounded text-sm text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                value={filters.studentStatus}
                onChange={(e) =>
                  setFilters({ ...filters, studentStatus: e.target.value })
                }
              >
                <option value="">Select Student Status</option>
                {uniqueStudentStatus.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center pt-4 sticky bottom-0 bg-white dark:bg-[#252525] pb-2">
              <button
                onClick={handleReset}
                className="w-[45%] py-2 border border-[#576CBC] text-[#576CBC] rounded-md text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Reset
              </button>
              <button
                onClick={handleApply}
                className="w-[50%] py-2 bg-[#576CBC] text-white rounded-md text-sm font-medium hover:bg-[#475a9c]"
              >
                Show {resultCount} results
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const TrailSection = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [filter, setFilter] = useState({
    course: "",
    country: "",
    preferredTeacher: "",
    assignedCoach: "",
    fromDate: "",
    toDate: "",
    time: "",
  });

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
  const handleSyncClick = () => {
    if (router) {
      router.push("/modules/users/admin-main/ui/trailmanagement");
    } else {
      console.error("Router is not available");
    }
  };

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
    Modal.setAppElement("body");
  }, []);


  useEffect(() => {
    console.log("Current users data:", users);
  }, [users]);

  const fetchStudents = async () => {
    try {
      const allData = await getAllUsers();
      if (allData.success && allData.data) {
        setUsers(allData.data);
      } else {
        setErrorMessage(allData.message ?? "Failed to fetch users");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred");
      console.error("An unexpected error occurred", error);
    }
  };


  // Updated filter handling function
  const handleApplyFilters = (filters: {
    studentId: string;
    studentName: string;
    date: string;
    mobile: string;
    country: string;
    course: string;
    preferredTeacher: string;
    evaluationStatus: string;
    studentStatus: string;
  }) => {
    let filtered = [...users];

    if (filters.studentId) {
      filtered = filtered.filter((user) =>
        user.studentId.toLowerCase().includes(filters.studentId.toLowerCase())
      );
    }
    
    if (filters.studentName) {
      filtered = filtered.filter((user) =>
        `${user.fname} ${user.lname}`
          .toLowerCase()
          .includes(filters.studentName.toLowerCase())
      );
    }
    
    if (filters.date) {
      filtered = filtered.filter((user) =>
        new Date(user.createdDate).toLocaleDateString().includes(filters.date)
      );
    }
    
    if (filters.mobile) {
      filtered = filtered.filter((user) =>
        user.number.includes(filters.mobile)
      );
    }
    
    if (filters.country) {
      filtered = filtered.filter((user) => user.country === filters.country);
    }
    
    if (filters.course) {
      filtered = filtered.filter((user) => user.course === filters.course);
    }
    
    if (filters.preferredTeacher) {
      filtered = filtered.filter((user) => user.preferredTeacher === filters.preferredTeacher);
    }
    
    if (filters.evaluationStatus) {
      filtered = filtered.filter((user) => user.evaluationStatus === filters.evaluationStatus);
    }
    
    if (filters.studentStatus) {
      filtered = filtered.filter((user) => {
        const evalUser = evaluationUsers.find(
          (evalUser) => evalUser.studentId === user.studentId
        );
        const userStudentStatus = evalUser?.studentStatus?.toUpperCase() || "NOT JOINED";
        return userStudentStatus === filters.studentStatus;
      });
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

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

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-red-600">
        {errorMessage === "Failed to fetch users" ? "Not Found" : errorMessage}
      </div>
    );
  }

  // Pagination logic: calculate currentItems based on filteredUsers, currentPage, and itemsPerPage
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <BaseLayout4>
      <AdminHeader currentSection="Trial Management" showBackButton showBackPath="evaluations"/>
      <div className="h-full w-full py-2 md:mr-10 scrollbar-none">
        <div className="w-full bg-[#FAFAFB] rounded-lg dark:bg-[#343434]">
          <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
            <div className="flex items-center gap-2 text-sm text-gray-500 px-2">
              <Search className="w-3 h-3 text-gray-400 dark:text-gray-400 -mt-[1px]" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent outline-none text-[12px] w-52 py-3"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
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
                Showing {filteredUsers.length === 0 ? 0 : indexOfFirstItem + 1}{" "}
                to {Math.min(indexOfLastItem, filteredUsers.length)} of{" "}
                {filteredUsers.length}
              </span>
            </div>
          </div>
          <div className="overflow-x-auto w-full thin-scroll scrollbar-thin">
            <table className="w-full table-fixed min-w-max">
              <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                <tr>
                  {[
                    { label: "Student ID", width: "w-[10%]" },
                    { label: "Student Name", width: "w-[12%]" },
                    { label: "Date", width: "w-[12%]" },
                    { label: "Mobile", width: "w-[10%]" },
                    { label: "Country", width: "w-[8%]" },
                    { label: "Course", width: "w-[10%]" },
                    { label: "Preferred Teacher", width: "w-[10%]" },
                    { label: "Evaluation Status", width: "w-[8%]" },
                    { label: "Student Status", width: "w-[10%]" },
                  ].map((header, index) => (
                    <th
                      key={header.label}
                      className={`px-2 py-2 text-left z-20 font-medium border border-[#4C6993] dark:border-[#6087C0] whitespace-nowrap ${
                        header.width
                      } ${
                        index === 0
                          ? "sticky left-0 z-20 bg-[#4C6993] text-white dark:bg-[#6087C0]"
                          : index === 8
                          ? "sticky right-0 z-20 bg-[#4C6993] text-white dark:bg-[#6087C0]"
                          : ""
                      }`}
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => (
                    <tr
                      key={item.studentId || index}
                      className={`text-[12px] ${
                        index % 2 === 0
                          ? "bg-[#fff] dark:bg-[#2C2C2C] "
                          : "bg-[#F8F8F8] dark:bg-[#303030]"
                      }`}
                    >
                      <td
                        className={`px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap w-[10%] sticky left-0 z-10 ${
                          index % 2 === 0
                            ? "bg-[#fff] dark:bg-[#2C2C2C]"
                            : "bg-[#F8F8F8] dark:bg-[#303030]"
                        }`}
                      >
                        {item.studentId}
                      </td>
                      <td className="px-5 py-2 text-[#3D8FDE] font-medium text-left text-[11px] whitespace-nowrap w-[12%]">
                        {item.fname} {item.lname}
                      </td>
                      <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap w-[15%]">
                        {new Date(item.createdDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap w-[10%]">
                        {item.number}
                      </td>
                      <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap w-[8%]">
                        {item.country}
                      </td>
                      <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap w-[10%]">
                        {item.course}
                      </td>
                      <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap w-[10%]">
                        {item.preferredTeacher}
                      </td>

                      <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap">
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
                      <td className={`px-2 py-4 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap sticky right-0 z-10 w-[10%] ${
                          index % 2 === 0
                            ? "bg-[#fff] dark:bg-[#2C2C2C]"
                            : "bg-[#F8F8F8] dark:bg-[#303030]"
                        }`} >
                        {(() => {
                          // Find the evaluation user for this student
                          const evalUser = evaluationUsers.find(
                            (eu) => eu.studentId === item.studentId
                          );

                          // If evaluation status is PENDING, set student status to PENDING
                          let status = "NOT JOINED";
                          if (item.evaluationStatus === "PENDING") {
                            status = "PENDING";
                          } else {
                            status =
                              evalUser?.studentStatus?.toUpperCase() ||
                              "NOT JOINED";
                          }

                          const statusClass =
                            status === "JOINED"
                              ? "bg-[#ECFDF3] text-[#377E36] px-6 dark:bg-[#377E3633]"
                              : status === "WAITING"
                              ? "bg-[#FDF6EC] text-[#F0AD4E] px-3 dark:bg-[#F0AD4E33]"
                              : status === "PENDING"
                              ? "bg-[#FDF6EC] text-[#F0AD4E] px-5 dark:bg-[#F0AD4E33]"
                              : "bg-[#FDECEC] text-[#D34645] px-5 dark:bg-[#D3464533]";

                          return (
                            <span
                              className={`px-1 text-[10px] text-center py-[3px] rounded-md ${statusClass}`}
                            >
                              {status}
                            </span>
                          );
                        })()}
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

        </div>
        <div className="mt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Filter Modal */}
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilters={handleApplyFilters}
          users={users}
          evaluationUsers={evaluationUsers}
        />
      </div>
    </BaseLayout4>
  );
};

export default TrailSection;