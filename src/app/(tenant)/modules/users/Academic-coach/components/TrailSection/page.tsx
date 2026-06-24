"use client";

import { useState, useEffect } from "react";
import Modal from "react-modal";
import { FaEllipsisV } from "react-icons/fa";
import BaseLayout1 from "@/app/(tenant)/modules/users/Academic-coach/components/BaseLayout1";
import { useRouter } from "next/navigation";
import AddEvaluationModal from "@/app/(tenant)/modules/users/Academic-coach/Academic/AddEvaluationModel";
import { User } from "@/types";
import axios from "axios";
import { Search } from "lucide-react";
import { MdTune } from "react-icons/md";
import Pagination from "@/components/Pagination";
import { getSocket } from "@/app/utils/socket";
import moment from "moment";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";


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


interface TransformedUser {
  _id: string;
  trialId: string;
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  number: string;
  prefferedDate: string;
  country: string;
  course: string;
  preferredTeacher: string;
  time: string;
  classStatus?: string;
  status?: string;
  trialClassStatus: string;
  paymentStatus: string;
  assignedTeacher: string;
  paymentLink: string;
  studentStatus: string;
}

export interface IMeeting {
  _id: string;
  subject: string;
  meetingLocation: string;
  classType: string;
  meetingType: string;
  meetingLink: string;
  isScheduledMeeting: boolean;
  scheduledStartDate: string;
  scheduledEndDate: string;
  scheduledFrom: string;
  scheduledTo: string;
  timeZone: string;
  description: string;
  meetingStatus: string;
  studentResponse: string;
  status: string;
  createdDate: string;
  createdBy: string;
  lastUpdatedDate: string;
  lastUpdatedBy: string;
  academicCoach: {
    academicCoachId: string;
    name: string;
    email: string;
  };
  teacher: {
    teacherId: string | null;
    name: string | null;
    email: string | null;
  };
  student: {
    studentId: string;
    name: string;
    email: string;
  };
  course: {
    courseId: string;
    courseName: string;
  };
}



const getAllUsers = async (): Promise<{
  success: boolean;
  data: TransformedUser[];
  message: string;
}> => {
  try {
    const academicId = localStorage.getItem("AcademicCoachPortalId");
    console.log("academicId>>", academicId);
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AcademicCoachAuthToken")
        : null;

    if (!token) {
      console.error("❌ AcademicCoachAuthToken not found");
    }
    const response = await axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.EVALUATION.GET_LIST}`, {
      params: { academicCoachId: academicId },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Raw API Response:", response.data.evaluation);

    const transformedData: TransformedUser[] = response.data.evaluation.map(
      (item: any) => {
        console.log("Item studentStatus before transform:", item.studentStatus);
        return {
          _id: item._id,
          trialId: item.trialId,
          studentId: item.student.studentId,
          studentFirstName: item.student.studentFirstName,
          studentLastName: item.student.studentLastName,
          number: item.student.studentPhone
            ? item.student.studentPhone.toString()
            : "",
          country: item.student.studentCountry,
          course: item.student.learningInterest,
          preferredTeacher: item.student.preferredTeacher,
          prefferedDate: item.student.preferredDate,
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
  }) => void;
  users: User[];
}) => {
  const [filters, setFilters] = useState({
    country: "",
    course: "",
    teacher: "",
    status: "",
  });

  // Get unique values for each filter
  const uniqueCountries = Array.from(
    new Set(users.map((user) => user.country))
  );
  const uniqueCourses = Array.from(new Set(users.map((user) => user.course)));
  const uniqueTeachers = Array.from(
    new Set(users.map((user) => user.preferredTeacher))
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
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg shadow-lg w-[500px]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Filter Options</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ×
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="ayvayv"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Country
          </label>
          <select
            className="w-full p-2 border rounded-lg"
            value={filters.country}
            onChange={(e) =>
              setFilters({ ...filters, country: e.target.value })
            }
          >
            <option value="">All Countries</option>
            {uniqueCountries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="ciuviuva"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Course
          </label>
          <select
            className="w-full p-2 border rounded-lg"
            value={filters.course}
            onChange={(e) => setFilters({ ...filters, course: e.target.value })}
          >
            <option value="">All Courses</option>
            {uniqueCourses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="ivbiucv"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Teacher
          </label>
          <select
            className="w-full p-2 border rounded-lg"
            value={filters.teacher}
            onChange={(e) =>
              setFilters({ ...filters, teacher: e.target.value })
            }
          >
            <option value="">All Teachers</option>
            {uniqueTeachers.map((teacher) => (
              <option key={teacher} value={teacher}>
                {teacher}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="daiuiauv"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            className="w-full p-2 border rounded-lg"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={handleReset}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </Modal>
  );
};

const TrailSection = () => {
  const [users, setUsers] = useState<TransformedUser[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<TransformedUser[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [meetings, setMeetings] = useState<IMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [trialClassStatus, setTrialClassStatus] = useState("");
  const [studentStatus, setStudentStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  console.log(setItemsPerPage);

  // Add new state variables for editable fields
  const [editableData, setEditableData] = useState({
    changeTime: "",
    changeDate: "",
    availableTeacher: "",
  });
  const [availableTeachers, setAvailableTeachers] = useState<
    { teacherId: string; teacherName: string; teacherEmail?: string }[]
  >([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [openActionMenuForId, setOpenActionMenuForId] = useState<string | null>(null);
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MEETING.GET_LIST}`);
        if (!response.ok) throw new Error("Failed to fetch meetings");
        const data = await response.json();
        setMeetings(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  // Function to handle editable field changes
  const handleEditableFieldChange = (field: string, value: string) => {
    setEditableData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Function to fetch available teachers for a specific time and date
  const fetchAvailableTeachers = async (date: string, time: string) => {
    if (!date || !time) return;

    setIsLoadingTeachers(true);
    try {
      const academicId = localStorage.getItem("AcademicCoachPortalId");
      if (!academicId) return;

      const socket = getSocket(academicId);
      const position =
        formData.student.learningInterest === "Islamic Studies"
          ? "Islamic Teacher"
          : `${formData.student.learningInterest} Teacher`;
      console.log("📤 Sending academicTrailClassTeacherListRequest");
      console.log("📤 Sending with payload:", {
        startDate: formData.student.preferredDate,
        from: formData.student.preferredFromTime,
        to: formData.student.preferredToTime,
        position: position,
      });
      const calculatedToTime = moment(time, "HH:mm")
        .add(30, "minutes")
        .format("HH:mm");
      console.log("📤 Sending with payload:", {
        requestId: academicId,
        startDate: date,
        from: time,
        to: calculatedToTime,
        position: position,
      });
      socket.emit("academicTrailClassTeacherListRequest", {
        requestId: academicId,
        startDate: date,
        from: time,
        to: calculatedToTime,
        position: position,
      });

      const handleResponse = (data: Record<string, string>) => {
        const teacherArray = Object.entries(data).map(
          ([teacherId, teacherName]) => ({
            teacherId,
            teacherName,
          })
        );
        setAvailableTeachers(teacherArray);
        setIsLoadingTeachers(false);
      };

      socket.on("academicTrailClassTeacherListResponse", handleResponse);

      // Cleanup listener after a delay
      setTimeout(() => {
        socket.off("academicTrailClassTeacherListResponse", handleResponse);
      }, 5000);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setIsLoadingTeachers(false);
    }
  };

  // Function to handle time change and trigger teacher fetch
  const handleTimeChange = (time: string) => {
    handleEditableFieldChange("changeTime", time);
    const date = editableData.changeDate || formData?.student.preferredDate;
    if (date && time) {
      fetchAvailableTeachers(date, time);
    }
  };

  // Function to handle date change and trigger teacher fetch
  const handleDateChange = (date: string) => {
    handleEditableFieldChange("changeDate", date);
    const time = editableData.changeTime || formData?.student.preferredFromTime;
    // If only date is selected, still show the teacher section by triggering fetch with existing time
    if (date && time) {
      fetchAvailableTeachers(date, time);
    }
  };

  // Save changes and trigger email in one step
  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("AcademicCoachAuthToken");
      if (!token) return alert("Token missing!");
      if (!formData?._id) return alert("No evaluationId found!");

      const effectiveDate = editableData.changeDate || formData?.student.preferredDate;
      const effectiveTime = editableData.changeTime || formData?.student.preferredFromTime;

      if (!effectiveDate || !effectiveTime || !editableData.availableTeacher) {
        return alert(
          "Please select Change Date, Change Time and Available Teacher."
        );
      }

      // 🔹 Find teacher info
      const selectedTeacher = availableTeachers.find(
        (t) => t.teacherId === editableData.availableTeacher
      );

      // 🔹 Compute time range (30 min duration)
      const changeFromTime = editableData.changeTime || formData?.student.preferredFromTime;
      const changeToTime = moment(changeFromTime, "HH:mm")
        .add(30, "minutes")
        .format("HH:mm");

      // 🔹 Build payload that backend expects (for Zoom scheduling)
      const payload = {
        teacher: {
          teacherId: selectedTeacher?.teacherId || editableData.availableTeacher,
          teacherName: selectedTeacher?.teacherName || "",
          teacherEmail: selectedTeacher?.teacherEmail || "",
        },
        // Also update assigned teacher fields used by the list/table
        assignedTeacher: selectedTeacher?.teacherName || "",
        assignedTeacherId: selectedTeacher?.teacherId || editableData.availableTeacher,
        assignedTeacherEmail: selectedTeacher?.teacherEmail || "",
        preferredTrialDate: editableData.changeDate,
        preferredTrialFromTime: changeFromTime,
        preferredTrialToTime: changeToTime,
      };
      console.log("📤 Sending payload to backend:", payload);

      // 🔹 Send update request
      const response = await axios.put(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.EVALUATION.UPDATE}/${formData._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Backend response:", response.data);

      if (response.status === 200 || response.status === 204) {
        alert("✅ Changes saved. Zoom schedule update & email will be triggered.");

        // Optimistically update table and modal state
        setUsers((prev) =>
          prev.map((u) =>
            u._id === formData._id
              ? {
                ...u,
                assignedTeacher: selectedTeacher?.teacherName || u.assignedTeacher,
                time: changeFromTime,
                prefferedDate: editableData.changeDate || u.prefferedDate,
              }
              : u
          )
        );
        setFilteredUsers((prev) =>
          prev.map((u) =>
            u._id === formData._id
              ? {
                ...u,
                assignedTeacher: selectedTeacher?.teacherName || u.assignedTeacher,
                time: changeFromTime,
                prefferedDate: editableData.changeDate || u.prefferedDate,
              }
              : u
          )
        );
        setFormData((prev: any) => ({
          ...prev,
          assignedTeacher: selectedTeacher?.teacherName || prev?.assignedTeacher,
          assignedTeacherId:
            selectedTeacher?.teacherId || editableData.availableTeacher || prev?.assignedTeacherId,
          assignedTeacherEmail: selectedTeacher?.teacherEmail || prev?.assignedTeacherEmail,
          student: {
            ...prev?.student,
            preferredDate: editableData.changeDate || prev?.student?.preferredDate,
            preferredFromTime: changeFromTime || prev?.student?.preferredFromTime,
            preferredToTime: changeToTime || prev?.student?.preferredToTime,
          },
        }));

        setShowModal(false);
        fetchStudents();
      }
    } catch (error: any) {
      console.error("❌ Error saving changes:", error?.response?.data || error);
      alert("❌ Failed to save changes. Please try again.");
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const allData = await getAllUsers();
        if (allData.success && allData.data) {
          setUsers(allData.data); // Cast TransformedUser[] to User[]
          setFilteredUsers(allData.data); // Initialize filtered users
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
    const academicId =
      typeof window !== "undefined"
        ? localStorage.getItem("AcademicCoachPortalId")
        : null;
    if (!academicId) return;
    const socket = getSocket(academicId);
    const handleList = (data: {
      event: string;
      data: ClassPayload;
      sender: string;
    }) => {
      console.log("📩 Received WebSocket Data:", data);
      if (data.event === "update") {
        const classPayload = data.data as ClassPayload;
        const student = classPayload.student;

        console.log("➡️ Action: update", student.studentId);

        setFilteredUsers((prev) =>
          prev.map((user) =>
            user.studentId === student.studentId
              ? {
                ...user,
                paymentStatus: classPayload.paymentStatus ?? "NOT JOINED",
                trialClassStatus:
                  classPayload.trialClassStatus ?? "NOT COMPLETED",
                studentStatus: classPayload.studentStatus ?? "NOT JOINED",
              }
              : user
          )
        );
        setUsers((prev) =>
          prev.map((user) =>
            user.studentId === student.studentId
              ? {
                ...user,
                paymentStatus: classPayload.paymentStatus ?? "NOT JOINED",
                trialClassStatus:
                  classPayload.trialClassStatus ?? "NOT COMPLETED",
                studentStatus: classPayload.studentStatus ?? "NOT JOINED",
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

  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

  const [options, setOptions] = useState({
    trialClassStatus: ["PENDING", "INPROGRESS", "COMPLETED"],
    studentStatus: ["JOINED", "NOT JOINED", "WAITING"],
    paymentStatus: ["PAID", "FAILED", "PENDING"],
  });

  const router = useRouter();
  const handleSyncClick = () => {
    if (router) {
      router.push("trailManagement");
    } else {
      console.error("Router is not available");
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  interface FormData {
    _id: string;
    student: {
      city: string;
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
      preferredDate: string; // ISO date string
      evaluationStatus: string;
      status: string;
      createdDate: string; // ISO date string
      createdBy: string;
    };
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
    classStartDate: string; // ISO date string
    classEndDate: string; // ISO date string
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
    createdDate: string; // ISO date string
    createdBy: string;
    updatedDate: string; // ISO date string
    updatedBy: string;
    expectedFinishingDate: number;
    __v: number;
  }
  const openModal = (user: User | null = null) => {
    setIsEditMode(!!user);
    setIsModalOpen(true);
    setModalIsOpen(true);

    if (!user) {
      setTrialClassStatus("PENDING");
      setStudentStatus("NOT JOINED");
      setPaymentStatus("PENDING");
      setPaymentLink("");
    } else {
      handleClick(user._id.toString());
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalIsOpen(false);
  };

  useEffect(() => {
    console.log("Current users data:", users);
  }, [users]);

  const fetchStudents = async () => {
    try {
      const allData = await getAllUsers();
      if (allData.success && allData.data) {
        setUsers(allData.data); // Cast to User[] to resolve type error
      } else {
        setErrorMessage(allData.message ?? "Failed to fetch users");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred");
      console.error("An unexpected error occurred", error);
    }
  };

  const handleClick = async (id: string) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AcademicCoachAuthToken")
          : null;

      if (!token) {
        console.error("❌ AcademicCoachAuthToken not found");
        return;
      }
      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.EVALUATION.GET_LIST}/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOptions((prev) => ({
        trialClassStatus: prev.trialClassStatus.includes(data.trialClassStatus)
          ? prev.trialClassStatus
          : [...prev.trialClassStatus, data.trialClassStatus],
        studentStatus: prev.studentStatus.includes(data.studentStatus)
          ? prev.studentStatus
          : [...prev.studentStatus, data.studentStatus],
        paymentStatus: prev.paymentStatus.includes(data.paymentStatus)
          ? prev.paymentStatus
          : [...prev.paymentStatus, data.paymentStatus],
      }));
      setTrialClassStatus(data.trialClassStatus);
      setStudentStatus(data.studentStatus);
      setPaymentStatus(data.paymentStatus);
      setPaymentLink(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.INVOICE.GET_LIST}?id=${encodeURIComponent(data._id)}`
      );
      setFormData(data);
      console.log(data);

      // Open the modal after setting the form data
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Move FilterModal outside of the TrailManagement component
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
      trialClassStatus: string;
    }) => void;
    users: TransformedUser[];
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
      trialClassStatus: "",
    });

    // Get unique values for each filter
    const uniqueCountries = Array.from(
      new Set(users.map((user) => user.country))
    );
    const uniqueCourses = Array.from(new Set(users.map((user) => user.course)));
    const uniqueTeachers = Array.from(
      new Set(users.map((user) => user.preferredTeacher))
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
        trialClassStatus: "",
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
                  value={filters.trialClassStatus}
                  onChange={(e) =>
                    setFilters({ ...filters, trialClassStatus: e.target.value })
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

  const handleCloseModal = () => {
    setShowModal(false);
  };
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (openActionMenuForId) {
        setOpenActionMenuForId(null);
      }
    };
    if (openActionMenuForId) {
      document.addEventListener("click", onDocClick);
    }
    return () => document.removeEventListener("click", onDocClick);
  }, [openActionMenuForId]);
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
    trialClassStatus: string;
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
        (user) => user.preferredTeacher === filters.teacher
      );
    }
    if (filters.status) {
      filtered = filtered.filter((user) => user.status === filters.status);
    }
    if (filters.trailId) {
      filtered = filtered.filter((user) =>
        user.studentId.includes(filters.trailId)
      );
    }
    if (filters.studentName) {
      filtered = filtered.filter((user) =>
        `${user.studentFirstName} ${user.studentLastName}`
          .toLowerCase()
          .includes(filters.studentName.toLowerCase())
      );
    }
    if (filters.email) {
      // No email property in TransformedUser, so skip or use a relevant property if available
      // Example: filter by studentId as a placeholder
      filtered = filtered.filter((user) =>
        user.studentId.toLowerCase().includes(filters.email.toLowerCase())
      );
    }
    if (filters.mobile) {
      filtered = filtered.filter((user) =>
        user.number.includes(filters.mobile)
      );
    }
    if (filters.time) {
      filtered = filtered.filter((user) => user.time.includes(filters.time));
    }
    if (filters.trialClassStatus) {
      filtered = filtered.filter(
        (user) => user.trialClassStatus === filters.trialClassStatus
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredUsers(users); // Show all if search is empty
      setCurrentPage(1);
      return;
    }

    const lowerQuery = query.toLowerCase();

    const filtered = users.filter((user) => {
      const fullName =
        `${user.studentFirstName} ${user.studentLastName}`.toLowerCase();

      return (
        (user._id?.toLowerCase() || "").includes(lowerQuery) ||
        (user.studentId?.toLowerCase() || "").includes(lowerQuery) ||
        fullName.includes(lowerQuery) ||
        (user.number || "").includes(query) ||
        (user.country?.toLowerCase() || "").includes(lowerQuery) ||
        (user.course?.toLowerCase() || "").includes(lowerQuery) ||
        (user.preferredTeacher?.toLowerCase() || "").includes(lowerQuery) ||
        (user.time?.toLowerCase() || "").includes(lowerQuery) ||
        (user.classStatus?.toLowerCase() || "").includes(lowerQuery) ||
        (user.status?.toLowerCase() || "").includes(lowerQuery) ||
        (user.trialClassStatus?.toLowerCase() || "").includes(lowerQuery) ||
        (user.paymentStatus?.toLowerCase() || "").includes(lowerQuery) ||
        (user.assignedTeacher?.toLowerCase() || "").includes(lowerQuery) ||
        (user.paymentLink?.toLowerCase() || "").includes(lowerQuery) ||
        (user.studentStatus?.toLowerCase() || "").includes(lowerQuery)
      );
    });

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page
  };

  if (errorMessage) {
    return (
      <BaseLayout1>
        <div className="min-h-screen p-2">{errorMessage}</div>
      </BaseLayout1>
    );
  }
  const updateClick = async (id: string | undefined) => {
    const formDataNames = {
      _id: formData?._id ?? "",
      student: {
        studentId: formData?.student.studentId,
        studentFirstName: formData?.student.studentFirstName,
        studentLastName: formData?.student.studentLastName,
        studentEmail: formData?.student.studentEmail,
        studentGender: formData?.student.studentGender,
        studentPhone: formData?.student.studentPhone,
        studentCity: formData?.student.studentCity,
        studentCountry: formData?.student.studentCountry,
        studentCountryCode: formData?.student.studentCountryCode,
        learningInterest: formData?.student.learningInterest,
        numberOfStudents: formData?.student.numberOfStudents,
        preferredTeacher: formData?.student.preferredTeacher,
        preferredFromTime: formData?.student.preferredFromTime,
        preferredToTime: formData?.student.preferredToTime,
        timeZone: formData?.student.timeZone,
        referralSource: formData?.student.referralSource,
        preferredDate: formData?.student.preferredDate,
        evaluationStatus: formData?.student.evaluationStatus,
        status: formData?.student.status,
        createdDate: formData?.student.createdDate,
        createdBy: formData?.student.createdBy,
      },
      isLanguageLevel: formData?.isLanguageLevel,
      languageLevel: formData?.languageLevel,
      isReadingLevel: formData?.isReadingLevel,
      readingLevel: formData?.readingLevel,
      isGrammarLevel: formData?.isGrammarLevel,
      grammarLevel: formData?.grammarLevel,
      hours: formData?.hours,
      subscription: {
        subscriptionName: formData?.subscription.subscriptionName,
      },
      classStartDate: formData?.classStartDate,
      classEndDate: formData?.classEndDate,
      classStartTime: formData?.classStartTime,
      classEndTime: formData?.classEndTime,
      gardianName: formData?.gardianName,
      gardianEmail: formData?.gardianEmail,
      gardianPhone: formData?.gardianPhone,
      gardianCity: formData?.gardianCity,
      gardianCountry: formData?.gardianCountry,
      gardianTimeZone: formData?.gardianTimeZone,
      gardianLanguage: formData?.gardianLanguage,
      assignedTeacher: formData?.assignedTeacher,
      studentStatus: studentStatus,
      classStatus: formData?.classStatus,
      comments: formData?.comments,
      trialClassStatus: trialClassStatus,
      invoiceStatus: formData?.invoiceStatus,
      paymentLink: paymentLink,
      paymentStatus: paymentStatus,
      status: formData?.status,
      createdDate: formData?.createdDate,
      createdBy: formData?.createdBy,
      updatedDate: formData?.updatedDate,
      updatedBy: formData?.updatedBy,
      planTotalPrice: formData?.planTotalPrice,
      accomplishmentTime: formData?.accomplishmentTime,
      studentRate: formData?.studentRate,
      expectedFinishingDate: formData?.expectedFinishingDate,
    };

    alert(JSON.stringify(formDataNames));
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AcademicCoachAuthToken")
          : null;

      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return;
      }
      const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.EVALUATION.UPDATE}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formDataNames),
      });

      console.log("response", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Open the modal after setting the form data
      // setShowModal(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLSelectElement>) => {
      console.log(`Field: ${field}, Value: ${event.target.value}`);
      switch (field) {
        case "TrialClassStatus":
          setTrialClassStatus(event.target.value);
          // If trial status is PENDING, set student status to PENDING
          if (event.target.value === "PENDING") {
            setStudentStatus("PENDING");
          }
          break;
        case "studentStatus":
          setStudentStatus(event.target.value);
          break;
        case "paymentStatus":
          setPaymentStatus(event.target.value);
          break;
        default:
          break;
      }
    };
  useEffect(() => {
    console.log(`Updated TrialClassStatus: ${trialClassStatus}`);
  }, [trialClassStatus]);

  const filteredItems = currentItems.filter((item) => {
    const searchFields = [
      item._id,
      `${item.studentFirstName} ${item.studentLastName}`,
      item.number,
      item.country,
      item.course,
      item.preferredTeacher,
      item.assignedTeacher,
      item.time,
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

  if (errorMessage) {
    return (
      <BaseLayout1>
        <div className="min-h-screen p-4">{errorMessage}</div>
      </BaseLayout1>
    );
  }

  // Utility to find relevant meeting for a user
  const getMeetingForUser = (user: TransformedUser) => {
    return meetings.find(
      (m) => m.student && m.student.studentId && m.student.studentId === user.studentId
    );
  };

  return (
    <div>
      <div className="">
        <div className="md:p-0 mx-auto mb-10">
          <div className="h-full w-full flex flex-col justify-between">
            <div className="p-0 justify-between flex flex-col">
              <div className="w-full h-[588px] overflow-y-scroll scrollbar-none bg-[#FAFAFB] rounded-lg dark:bg-[#343434] min-h-[calc(100vh-200px)]">
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
                          { label: "Trial ID", width: "w-[18%]" },
                          { label: "Student Name", width: "w-[14%]" },
                          { label: "Mobile", width: "w-[10%]" },
                          { label: "Country", width: "w-[8%]" },
                          { label: "Course", width: "w-[10%]" },
                          { label: "Time", width: "w-[8%]" },
                          { label: "Date", width: "w-[10%]" },
                          { label: "Preferred Teacher", width: "w-[12%]" },
                          { label: "Assigned Teacher", width: "w-[12%]" },
                          { label: "Trial Status", width: "w-[12%]" },
                          { label: "Student Status", width: "w-[12%]" },
                          { label: "Payment Status", width: "w-[12%]" },
                          { label: "Action", width: "w-[7%]" },
                        ].map((header, index) => (
                          <th
                            key={header.label}
                            className={`px-3 py-2 text-left font-medium border border-[#4C6993] dark:border-[#6087C0] whitespace-nowrap ${header.width} ${index === 0
                                ? "sticky left-0 z-20 bg-[#4C6993] text-white dark:bg-[#6087C0]"
                                : index === 12
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
                            key={item.trialId}
                            className={`text-[12px] ${index % 2 === 0
                                ? "bg-[#fff] dark:bg-[#2C2C2C] "
                                : "bg-[#F8F8F8] dark:bg-[#303030]"
                              }`}
                          >
                            <td className={`px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap w-[18%] sticky left-0 z-10 ${index % 2 === 0
                                ? "bg-[#fff] dark:bg-[#2C2C2C]"
                                : "bg-[#F8F8F8] dark:bg-[#303030]"
                              }`}>
                              {item.trialId}
                            </td>
                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap w-[14%]">
                              {item.studentFirstName} {item.studentLastName}
                            </td>
                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap w-[10%]">
                              {item.number}
                            </td>
                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap w-[10%]">
                              {item.country}
                            </td>
                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap w-[10%]">
                              {item.course}
                            </td>

                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap w-[8%]">
                              {(() => {
                                const meeting = getMeetingForUser(item);
                                return meeting
                                  ? `${meeting.scheduledFrom || ''}${meeting.scheduledTo ? ' - ' + meeting.scheduledTo : ''}`
                                  : item.time;
                              })()}
                            </td>
                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap w-[10%]">
                              {(() => {
                                const meeting = getMeetingForUser(item);
                                return meeting
                                  ? (meeting.scheduledStartDate ? new Date(meeting.scheduledStartDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "")
                                  : (item.prefferedDate ? new Date(item.prefferedDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "");
                              })()}
                            </td>
                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap w-[10%]">
                              {item.preferredTeacher}
                            </td>
                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap w-[12%]">
                              {(() => {
                                const meeting = getMeetingForUser(item);
                                const name = meeting && meeting.teacher && meeting.teacher.name
                                  ? meeting.teacher.name
                                  : item.assignedTeacher;
                                return name && name.length > 0
                                  ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
                                  : name;
                              })()}
                            </td>

                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap w-[12%]">
                              <span
                                className={`px-1 text-[10px] text-center py-[3px] rounded-md ${item.trialClassStatus === "COMPLETED"
                                    ? "bg-[#ECFDF3] text-[#377E36] px-2 dark:bg-[#377E3633]"
                                    : item.trialClassStatus === "INPROGRESS"
                                      ? " bg-[#FDECEC] text-[#D34645]  px-3 dark:bg-[#D3464533]"
                                      : "bg-[#FDF6EC] text-[#F0AD4E] px-3 dark:bg-[#F0AD4E33]"
                                  }`}
                              >
                                {item.trialClassStatus === "COMPLETED"
                                  ? "COMPLETED"
                                  : item.trialClassStatus === "INPROGRESS"
                                    ? "IN PROGRESS"
                                    : "PENDING"}
                              </span>
                            </td>

                            <td className="px-3 py-2 text-[11px] text-[#010E30E5] dark:text-[#FDFDFD] whitespace-nowrap w-[12%]">
                              {(() => {
                                console.log("Table display studentStatus:", {
                                  original: item.studentStatus,
                                  upperCase: item.studentStatus?.toUpperCase(),
                                  isJoined:
                                    item.studentStatus?.toUpperCase() ===
                                    "JOINED",
                                  isWaiting:
                                    item.studentStatus?.toUpperCase() ===
                                    "WAITING",
                                  isPending:
                                    item.studentStatus?.toUpperCase() ===
                                    "PENDING",
                                });
                                return (
                                  <span
                                    className={`px-1 text-[10px] text-center py-[3px] rounded-md ${item.studentStatus?.toUpperCase() ===
                                        "JOINED"
                                        ? "bg-[#ECFDF3] text-[#377E36] px-6 dark:bg-[#377E3633]"
                                        : item.studentStatus?.toUpperCase() ===
                                          "WAITING"
                                          ? "bg-[#FDF6EC] text-[#F0AD4E] px-3 dark:bg-[#F0AD4E33]"
                                          : item.studentStatus?.toUpperCase() ===
                                            "PENDING"
                                            ? "bg-[#FDF6EC] text-[#F0AD4E] px-3 dark:bg-[#F0AD4E33]"
                                            : "bg-[#FDECEC] text-[#D34645] px-3 dark:bg-[#D3464533]"
                                      }`}
                                  >
                                    {item.studentStatus?.toUpperCase() ||
                                      "PENDING"}
                                  </span>
                                );
                              })()}
                            </td>

                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD]  w-[12%] whitespace-nowrap">
                              <span
                                className={`px-1 text-[10px] text-center py-[3px] rounded-md ${item.paymentStatus === "PAID"
                                    ? "bg-[#ECFDF3] text-[#377E36] px-5 dark:bg-[#377E3633]"
                                    : item.paymentStatus === "FAILED"
                                      ? "bg-[#FDECEC] text-[#D34645] px-3 dark:bg-[#D3464533]"
                                      : "bg-[#FDF6EC] text-[#F0AD4E] px-3 dark:bg-[#F0AD4E33]" // for Pending or other statuses
                                  }`}
                              >
                                {item.paymentStatus ?? "PAID"}
                              </span>
                            </td>
                            <td
                              className={`px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap w-[7%] sticky right-0 z-10 ${index % 2 === 0
                                  ? "bg-[#fff] dark:bg-[#2C2C2C]"
                                  : "bg-[#F8F8F8] dark:bg-[#303030]"
                                }`}
                            >
                              <div className="relative inline-block text-left">
                                <button
                                  disabled={item.trialClassStatus === "COMPLETED"}
                                  onClick={() =>
                                    setOpenActionMenuForId((prev) =>
                                      prev === item._id ? null : item._id
                                    )
                                  }
                                  className={`text-center p-2 ${item.trialClassStatus === "COMPLETED"
                                    ? "opacity-40 cursor-not-allowed"
                                    : "hover:cursor-pointer"
                                    }`}
                                >
                                  <FaEllipsisV
                                    size={12}
                                    className={`${item.trialClassStatus === "COMPLETED"
                                      ? "text-gray-400"
                                      : "text-[#5F6368] dark:text-white"
                                      }`}
                                  />
                                </button>
                              </div>
                            </td>
                            {openActionMenuForId === item._id && item.trialClassStatus !== "COMPLETED" && (
                              <div className="absolute right-16 mt-10 w-28 -ml-10 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-30 dark:bg-[#2E2E2E]">
                                <div className="py-1">
                                  <button
                                    className="block w-full px-3 py-2 text-left text-[11px] text-[#010E30E5] hover:bg-gray-100 dark:text-white dark:hover:bg-[#3A3A3A]"
                                    onClick={() => {
                                      handleClick(item.trialId.toString());
                                      setOpenActionMenuForId(null);
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="block w-full px-3 py-2 text-left text-[11px] text-[#D34645] hover:bg-gray-100 dark:hover:bg-[#3A3A3A]"
                                    onClick={() => setOpenActionMenuForId(null)}
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
                  .thin-scroll { scrollbar-width: thin; scrollbar-color: rgba(100,100,100,.5) transparent; }
                  .thin-scroll::-webkit-scrollbar { height: 3px; }
                  .thin-scroll::-webkit-scrollbar-track { background: transparent; }
                  .thin-scroll::-webkit-scrollbar-thumb { background-color: rgba(100,100,100,.5); border-radius: 9999px; }
                `}</style>
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
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg shadow-lg"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <h2>Edit User</h2>
      </Modal>
      <AddEvaluationModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        isEditMode={isEditMode}
        onSave={() => {
          fetchStudents();
          closeModal();
        }}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 scrollbar-none">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-4xl h-auto overflow-y-auto max-h-[90vh] scrollbar-none dark:bg-[#252525]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[15px] font-bold bg-gradient-to-r from-[#415075] via-[#1e273c] to-[#1e273c] text-transparent bg-clip-text text-[#010E30] dark:text-[#FFFFFF]">
                Student Details
              </h3>
              <button
                className="text-gray-600 hover:text-gray-800  dark:text-white"
                onClick={handleCloseModal}
              >
                ✖
              </button>
            </div>

            <form className="grid grid-cols-2  gap-5">
              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  First name
                </label>
                <input
                  value={formData?.student.studentFirstName || ""}
                  disabled
                  readOnly
                  className="w-full p-2  border border-gray-300 rounded text-[10px] mt-2  dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C] "
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  Last name
                </label>
                <input
                  value={formData?.student.studentLastName || ""}
                  disabled
                  readOnly
                  className="w-full p-2  border border-gray-300 rounded text-[10px] mt-2  dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  Email
                </label>
                <input
                  value={formData?.student.studentEmail || ""}
                  disabled
                  readOnly
                  className="w-full p-2  border border-gray-300 rounded text-[10px] mt-2  dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C] "
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  Phone number
                </label>
                <input
                  value={formData?.student.studentPhone || ""}
                  disabled
                  readOnly
                  className="w-full p-2  border border-gray-300 rounded text-[10px] mt-2 dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  Country
                </label>
                <input
                  value={formData?.student.studentCountry || ""}
                  disabled
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded text-[10px] mt-2  dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  City
                </label>
                <input
                  value={formData?.student.studentCity || ""}
                  disabled
                  readOnly
                  className="w-full p-2  border border-gray-300 rounded text-[10px] mt-2  dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  Time Zone
                </label>
                <input
                  value={formData?.student.studentCity || ""}
                  disabled
                  readOnly
                  className="w-full p-2  border border-gray-300 rounded text-[10px] mt-2  dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  Trial ID
                </label>
                <input
                  value={formData?._id || ""}
                  disabled
                  readOnly
                  className="w-full p-2  border border-gray-300 rounded text-[10px] mt-2 dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C] "
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  Course
                </label>
                <input
                  value={formData?.student.learningInterest || ""}
                  disabled
                  readOnly
                  className="w-full p-2  border border-gray-300 rounded text-[10px] mt-2 dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  Preferred Teacher
                </label>
                <input
                  value={formData?.student.preferredTeacher || ""}
                  disabled
                  readOnly
                  className="w-full p-2  border border-gray-300 rounded text-[10px] mt-2 dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  Level
                </label>
                <input
                  value={formData?.languageLevel || ""}
                  disabled
                  readOnly
                  className="w-full p-2  border border-gray-300 rounded text-[10px] mt-2 dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  Original Preferred Date
                </label>
                <input
                  type="date"
                  value={
                    editableData.changeDate
                      ? editableData.changeDate
                      : formData?.student.preferredDate
                        ? new Date(formData.student.preferredDate)
                          .toISOString()
                          .split("T")[0]
                        : ""
                  }
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-[10px] mt-2 dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  Original Preferred Time
                </label>
                <input
                  type="time"
                  value={
                    editableData.changeTime ||
                    `${formData?.student.preferredFromTime || ""}`
                  }
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-[10px] mt-2 dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  Preferred Hours
                </label>
                <input
                  value={formData?.hours || ""}
                  disabled
                  readOnly
                  className="w-full p-2  border border-gray-300 rounded text-[10px] mt-2 dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  Change Assigned Teacher
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded text-[10px] mt-2 dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                  value={
                    editableData.availableTeacher
                      ? editableData.availableTeacher
                      : formData?.assignedTeacherId || ""
                  }
                  onChange={(e) => handleEditableFieldChange('availableTeacher', e.target.value)}
                  disabled={isLoadingTeachers}
                >
                  <option value="">Select Teacher</option>
                  {isLoadingTeachers ? (
                    <option disabled>🔍 Searching...</option>
                  ) : (
                    availableTeachers.map((teacher) => (
                      <option key={teacher.teacherId} value={teacher.teacherId}>
                        {teacher.teacherName}
                      </option>
                    ))
                  )}
                </select>

                {isLoadingTeachers && (
                  <div className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                    Searching for available teachers...
                  </div>
                )}
                {availableTeachers.length > 0 && !isLoadingTeachers && (
                  <div className="text-xs text-green-500 mt-1">
                    Found {availableTeachers.length} available teacher(s)
                  </div>
                )}
              </div>

              <div> <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]"> Original Assigned Teacher </label> <input value={formData?.assignedTeacher || ""} disabled readOnly className="w-full p-2 border border-gray-300 rounded text-[10px] mt-2 dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]" /> </div>

              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  Preferred Package
                </label>
                <input
                  value={formData?.subscription?.subscriptionName || ""}
                  disabled
                  readOnly
                  className="w-full p-2  border border-gray-300 rounded text-[10px] mt-2 dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  Guardian Name
                </label>
                <input
                  value={formData?.gardianName || ""}
                  disabled
                  readOnly
                  className="w-full p-2  border border-gray-300 rounded text-[10px] mt-2 dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  Guardian Email
                </label>
                <input
                  value={formData?.gardianEmail || ""}
                  disabled
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded text-[10px] mt-2 dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  Guardian Phone Number
                </label>
                <input
                  value={formData?.gardianPhone || ""}
                  disabled
                  readOnly
                  className="w-full p-2  border border-gray-300 rounded text-[10px] mt-2 dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  Student Status
                </label>
                <div className="w-full p-2 border border-gray-300 rounded text-[10px] mt-2 dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]">
                  {studentStatus?.toUpperCase() || "NOT JOINED"}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-black text-[12px] dark:text-[#D6D6D6]">
                  Trial Class Status
                </label>
                <div className="w-full p-2 border border-gray-300 rounded text-[10px] mt-2 dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]">
                  {trialClassStatus || "PENDING"}
                </div>
              </div>
              <div className="col-span-2 flex justify-end gap-2 ">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className=" bg-[#576CBC1A] text-[#576CBC] px-5 py-2 rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium border border-[#576CBC1A] hover:bg-[#576CBC33] hover:text-[#576CBC] dark:hover:bg-[#576CBC33] dark:hover:text-[#576CBC]"
                >
                  Cancel
                </button>
                {((editableData.availableTeacher || formData?.assignedTeacherId) &&
                  ((editableData.changeDate || formData?.student.preferredDate) &&
                    (editableData.changeTime || formData?.student.preferredFromTime))
                ) && (
                    <button
                      type="button"
                      onClick={handleSaveChanges}
                      className="bg-[#576CBC] text-white px-5 py-2 rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium"
                    >
                      Save & Send Email
                    </button>
                  )}
              </div>
            </form>
          </div>
        </div>
      )}

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        users={users}
      />
    </div>
  );
};
export default TrailSection;
