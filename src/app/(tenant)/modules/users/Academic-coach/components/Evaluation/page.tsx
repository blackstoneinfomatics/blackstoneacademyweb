"use client";

import { useState, useEffect } from "react";
import Modal from "react-modal";
import { FaEllipsisV } from "react-icons/fa";
import Popup from "../Popup";
import { useRouter } from "next/navigation";
import axios from "axios";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import Pagination from "@/components/Pagination";
import { getSocket } from "@/app/utils/socket";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";
import { toast } from "react-toastify";

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
  message?: string;
}
interface ClassPayload {
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
    const academicId = localStorage.getItem("AcademicCoachPortalId");
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AcademicCoachAuthToken")
        : null;

    if (!token) {
      toast.error(AppValidationMessages.ERROR_MESSAGES.MISSING_AUTH_TOKEN);
      return {
        success: false,
        data: [],
        message: AppValidationMessages.ERROR_MESSAGES.MISSING_AUTH_TOKEN,
      };
    }

    if (!academicId) {
      toast.error(AppValidationMessages.ERROR_MESSAGES.MISSING_ACADEMIC_COACH_ID);
      return {
        success: false,
        data: [],
        message: AppValidationMessages.ERROR_MESSAGES.MISSING_ACADEMIC_COACH_ID,
      };
    }

    const response = await axios.get(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.EVALUATION.GET_LIST}`,
      {
        params: { academicCoachId: academicId },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.data.evaluation || !Array.isArray(response.data.evaluation)) {
      toast.error(AppValidationMessages.DATA_FETCH.INVALID_DATA_STRUCTURE);
      throw new Error(AppValidationMessages.DATA_FETCH.INVALID_DATA_STRUCTURE);
    }

    if (response.data.evaluation.length === 0) {
      toast.warning(AppValidationMessages.ACADEMIC_COACH.NO_EVALUATION_DATA);
    }

    const transformedData: TransformedUser[] = response.data.evaluation.map(
      (item: any) => {
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
      },
    );

    console.log("Transformed Data:", transformedData);

    return {
      success: true,
      data: transformedData,
      message: "Users fetched successfully",
    };
  } catch (error) {
    console.error(AppFailureToastMessages.ACADEMIC_COACH_EVALUATION_FETCH, error);
    toast.error(AppFailureToastMessages.ACADEMIC_COACH_EVALUATION_FETCH);
    return {
      success: false,
      data: [],
      message: AppFailureToastMessages.ACADEMIC_COACH_EVALUATION_FETCH,
    };
  }
};

const getAllUsers = async (): Promise<GetAllUsersResponse> => {
  try {
    const academicId = localStorage.getItem("AcademicCoachPortalId");
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AcademicCoachAuthToken")
        : null;

    if (!token) {
      toast.error(AppValidationMessages.ERROR_MESSAGES.MISSING_AUTH_TOKEN);
      return {
        success: false,
        data: [],
        message: AppValidationMessages.ERROR_MESSAGES.MISSING_AUTH_TOKEN,
      };
    }

    if (!academicId) {
      toast.error(AppValidationMessages.ERROR_MESSAGES.MISSING_ACADEMIC_COACH_ID);
      return {
        success: false,
        data: [],
        message: AppValidationMessages.ERROR_MESSAGES.MISSING_ACADEMIC_COACH_ID,
      };
    }

    const response = await axios.get(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.STUDENT.GET_LIST}`,
      {
        params: { academicCoachId: academicId },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.data.students || !Array.isArray(response.data.students)) {
      toast.error(AppValidationMessages.DATA_FETCH.INVALID_DATA_STRUCTURE);
      throw new Error(AppValidationMessages.DATA_FETCH.INVALID_DATA_STRUCTURE);
    }

    if (response.data.students.length === 0) {
      toast.warning(AppValidationMessages.ACADEMIC_COACH.NO_STUDENTS_FOUND);
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
      },
    );

    return {
      success: true,
      data: transformedData,
      message: "Users fetched successfully",
    };
  } catch (error) {
    console.error(AppFailureToastMessages.ACADEMIC_COACH_STUDENT_FETCH, error);
    toast.error(AppFailureToastMessages.ACADEMIC_COACH_STUDENT_FETCH);
    return {
      success: false,
      data: [],
      message: AppFailureToastMessages.ACADEMIC_COACH_STUDENT_FETCH,
    };
  }
};

const FilterModal = ({
  isOpen,
  onClose,
  onApplyFilters,
  users,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: {
    country: string;
    course: string;
    teacher: string;
    status: string;
    trailId: string;
    studentName: string;
    email: string;
    mobile: string;
    time: string;
    evaluationStatus: string;
  }) => void;
  users: User[];
}) => {
  const [filters, setFilters] = useState({
    country: "",
    course: "",
    teacher: "",
    status: "",
    trailId: "",
    studentName: "",
    email: "",
    mobile: "",
    time: "",
    evaluationStatus: "",
  });

  // Get unique values for each filter
  const uniqueCountries = Array.from(
    new Set(users.map((user) => user.country)),
  );
  const uniqueCourses = Array.from(new Set(users.map((user) => user.course)));
  const uniqueTeachers = Array.from(
    new Set(users.map((user) => user.preferredTeacher)),
  );

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      country: "",
      course: "",
      teacher: "",
      status: "",
      trailId: "",
      studentName: "",
      email: "",
      mobile: "",
      time: "",
      evaluationStatus: "",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  p-8 rounded-lg  w-[500px]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="fixed inset-0  bg-opacity-40 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg w-[320px] relative dark:bg-[#252525]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[16px] font-semibold text-gray-800 dark:text-white">
              Filter by
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 text-xl absolute top-4 right-4"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Country */}
            <div>
              <label
                htmlFor="country"
                className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]"
              >
                Country
              </label>
              <select
                className="w-full px-3 py-2 border rounded text-xs text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
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
                className="w-full px-3 py-2 border rounded text-xs text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                value={filters.course}
                onChange={(e) =>
                  setFilters({ ...filters, course: e.target.value })
                }
              >
                <option value="">Select Courses</option>
                {uniqueCourses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            {/* Teacher */}
            <div>
              <label
                htmlFor="teachers"
                className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]"
              >
                Teachers
              </label>
              <select
                className="w-full px-3 py-2 border rounded text-xs text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                value={filters.teacher}
                onChange={(e) =>
                  setFilters({ ...filters, teacher: e.target.value })
                }
              >
                <option value="">Select Teachers</option>
                {uniqueTeachers.map((teacher) => (
                  <option key={teacher} value={teacher}>
                    {teacher}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]"
              >
                Status
              </label>
              <select
                className="w-full px-3 py-2 border rounded text-xs text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                value={filters.evaluationStatus}
                onChange={(e) =>
                  setFilters({ ...filters, evaluationStatus: e.target.value })
                }
              >
                <option value="">Select Status</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center pt-4 ">
              <button
                onClick={handleReset}
                className="px-3 py-1 text-[12px] rounded-md border border-[#576CBC] text-[#576CBC] font-medium hover:bg-[#EEF1FF] dark:hover:bg-[#343434]"
              >
                Reset
              </button>
              <button
                onClick={handleApply}
                className="px-3 py-1 text-[12px] rounded-md bg-[#576CBC] text-white font-medium hover:bg-[#455bb1]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const TrailManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState<User | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  console.log(setItemsPerPage);
  const [evaluationUsers, setEvaluationUsers] = useState<TransformedUser[]>([]);

  useEffect(() => {
    const fetchEvaluationUsers = async () => {
      const result = await getAllUser();
      if (result.success) {
        setEvaluationUsers(result.data);
      } else {
        setErrorMessage(result.message);
      }
    };
    fetchEvaluationUsers();
  }, []);
  useEffect(() => {
    const academicId =
      typeof window !== "undefined"
        ? localStorage.getItem("AcademicCoachPortalId")
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
              : user,
          ),
        );
        setUsers((prev) =>
          prev.map((user) =>
            user.studentId === student.studentId
              ? {
                  ...user,
                  evaluationStatus: student.evaluationStatus ?? "PENDING",
                  status: classPayload.studentStatus ?? "NOT JOINED",
                }
              : user,
          ),
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
      router.push("/modules/users/Academic-coach/ui/trailmanagement");
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
          setErrorMessage(
            allData.message ?? AppFailureToastMessages.ACADEMIC_COACH_STUDENT_FETCH,
          );
        }
      } catch {
        setErrorMessage(AppValidationMessages.ERROR_MESSAGES.UNEXPECTED_ERROR);
        toast.error(AppValidationMessages.ERROR_MESSAGES.UNEXPECTED_ERROR);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

  const mergedUsers = users.map((user) => {
    const evalUser = evaluationUsers.find(
      (evalUser) => evalUser.studentId === user.studentId,
    );
    return {
      ...user,
      studentStatus: evalUser?.studentStatus ?? "NOT JOINED",
    };
  });

  const closeModal = () => {
    setModalIsOpen(false);
  };

  useEffect(() => {
    console.log("Current users data:", users);
  }, [users]);

  const fetchStudents = async () => {
    try {
      const allData = await getAllUsers();
      if (allData.success && allData.data) {
        setUsers(allData.data);
      } else {
        setErrorMessage(
          allData.message ?? AppFailureToastMessages.ACADEMIC_COACH_STUDENT_FETCH,
        );
      }
    } catch {
      setErrorMessage(AppValidationMessages.ERROR_MESSAGES.UNEXPECTED_ERROR);
      toast.error(AppValidationMessages.ERROR_MESSAGES.UNEXPECTED_ERROR);
    }
  };

  const handleEditClick = (studentId: User) => {
    setSelectedUserData(studentId);
    setModalIsOpen(true);
  };

  // Add filter handling function
  const handleApplyFilters = (filters: {
    country: string;
    course: string;
    teacher: string;
    status: string;
    trailId: string;
    studentName: string;
    email: string;
    mobile: string;
    time: string;
    evaluationStatus: string;
  }) => {
    let filtered = [...users];

    if (filters.country) {
      filtered = filtered.filter((user) => user.country === filters.country);
    }
    if (filters.course) {
      filtered = filtered.filter((user) => user.course === filters.course);
    }
    if (filters.teacher) {
      filtered = filtered.filter(
        (user) => user.preferredTeacher === filters.teacher,
      );
    }
    if (filters.status) {
      filtered = filtered.filter(
        (user) => user.evaluationStatus === filters.status,
      );
    }
    if (filters.trailId) {
      filtered = filtered.filter((user) =>
        user.studentId.includes(filters.trailId),
      );
    }
    if (filters.studentName) {
      filtered = filtered.filter((user) =>
        `${user.fname} ${user.lname}`
          .toLowerCase()
          .includes(filters.studentName.toLowerCase()),
      );
    }
    if (filters.email) {
      filtered = filtered.filter((user) =>
        user.email.toLowerCase().includes(filters.email.toLowerCase()),
      );
    }
    if (filters.mobile) {
      filtered = filtered.filter((user) =>
        user.number.includes(filters.mobile),
      );
    }
    if (filters.time) {
      filtered = filtered.filter((user) => user.time.includes(filters.time));
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
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
    setCurrentPage(1);
  };

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-red-600">
        {errorMessage}
      </div>
    );
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div>
      <div className="">
        <div className="md:p-0 mx-auto mb-10">
          <div className="h-full w-full  flex flex-col justify-between">
            <div className="p-0 justify-between flex flex-col">
              <div className="w-full h-[588px] overflow-y-scroll scrollbar-none bg-[#FAFAFB] rounded-lg dark:bg-[#343434]">
                <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search"
                      className="bg-transparent outline-none text-[15px] w-52 py-3"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>

                  <div
                    className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
                    onClick={() => setIsFilterModalOpen(true)}
                  >
                    <MdTune className="w-4 h-4" />
                    <span>Filter</span>
                  </div>
                  <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                    <span className="text-left -ml-60 ">
                      Showing {currentItems.length} of {users.length}
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto w-full thin-scroll">
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
                          { label: "Action", width: "w-[6%]" },
                        ].map((header, index) => (
                          <th
                            key={header.label}
                            className={`px-3 py-2 text-left font-medium border border-[#4C6993] dark:border-[#6087C0] whitespace-nowrap ${header.width} ${
                              index === 0
                                ? "sticky left-0 z-20 bg-[#4C6993] text-white dark:bg-[#6087C0]"
                                : index === 9
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
                              className={`px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap w-[8%] sticky left-0 z-10 ${
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
                                },
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
                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap">
                              {(() => {
                                const evalUser = evaluationUsers.find(
                                  (eu) => eu.studentId === item.studentId,
                                );

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

                            <td
                              className={`px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap w-[7%] sticky right-0 z-10 ${
                                index % 2 === 0
                                  ? "bg-[#fff] dark:bg-[#2C2C2C]"
                                  : "bg-[#F8F8F8] dark:bg-[#303030]"
                              }`}
                            >
                              <div className="relative inline-block text-left">
                                <button
                                  disabled={
                                    item.evaluationStatus === "COMPLETED"
                                  }
                                  onClick={() =>
                                    item.evaluationStatus !== "COMPLETED" &&
                                    setOpenMenuId(
                                      openMenuId === item.id ? null : item.id,
                                    )
                                  }
                                  className={`text-center p-2 ${
                                    item.evaluationStatus === "COMPLETED"
                                      ? "opacity-40 cursor-not-allowed"
                                      : "hover:cursor-pointer"
                                  }`}
                                >
                                  <FaEllipsisV
                                    size={12}
                                    className={`${
                                      item.evaluationStatus === "COMPLETED"
                                        ? "text-gray-400"
                                        : "text-[#5F6368] dark:text-white"
                                    }`}
                                  />
                                </button>
                              </div>
                            </td>
                            {openMenuId === item.id &&
                              item.evaluationStatus !== "COMPLETED" && (
                                <div
                                  className="absolute right-16 mt-10 w-28 -ml-10 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-30 dark:bg-[#2E2E2E]"
                                  data-open={openMenuId === item.id}
                                >
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        handleEditClick(item);
                                        setOpenMenuId(null);
                                      }}
                                      className="block w-full px-3 py-2 text-left text-[11px] text-[#010E30E5] hover:bg-gray-100 dark:text-white dark:hover:bg-[#3A3A3A]"
                                    >
                                      Evaluate
                                    </button>

                                    <button
                                      onClick={() => setOpenMenuId(null)}
                                      className="block w-full px-3 py-2 text-left text-[11px] text-[#D34645] hover:bg-gray-100 dark:hover:bg-[#3A3A3A]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
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
                <style jsx>{`
                  .thin-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(100, 100, 100, 0.5) transparent;
                  }
                  .thin-scroll::-webkit-scrollbar {
                    height: 3px;
                  }
                  .thin-scroll::-webkit-scrollbar-track {
                    background: transparent;
                  }
                  .thin-scroll::-webkit-scrollbar-thumb {
                    background-color: rgba(100, 100, 100, 0.5);
                    border-radius: 9999px;
                  }
                  .thin-scroll table th,
                  .thin-scroll table td {
                    white-space: nowrap;
                  }
                `}</style>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg shadow-lg"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <h2>Edit User</h2>
        {selectedUserData ? (
          <div>
            <Popup
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              user={{
                ...selectedUserData,
                city: selectedUserData.city ?? "",
              }}
              isEditMode={isEditMode}
              onSave={() => {
                fetchStudents();
                closeModal();
              }}
            />
          </div>
        ) : (
          <div>No user data available for editing.</div>
        )}
      </Modal>
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        users={users}
      />
    </div>
  );
};

export default TrailManagement;
