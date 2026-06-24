"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdTune, MdFormatListBulleted } from "react-icons/md";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";
import { AnimatePresence, motion } from "framer-motion";
import SuccessPopup from "@/app/(tenant)/modules/users/admin-main/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/admin-main/components/failedPopup";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
export interface AssignmentItem {
  assignmentId?: string;
  assignmentType: string;
  status: string;
  assignmentName: string;
  title: string;
  assignmentStatus: string;
  assignedDate: string;
  dueDate: string;
}
interface GroupedAssignment {
  assignmentId: string;
  assignmentName: string;
  questionCount: number;
  assignments: AssignmentQuestion[];
}

interface AssignmentQuestion {
  _id: string;
  levelId: string;
  levelName: string;
  courseId: string;
  courseName: string;
  assignmentId: string;
  assignmentName: string;
  assignmentType: string;
  questionName: string;
  chooseType: boolean;
  trueorfalseType: boolean;
  question?: string;
  options?: string[];
  audioFile?: string | Buffer | Uint8Array;
  uploadFile?: string | Buffer | Uint8Array;
  answerValidation: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  updatedBy: string;
  __v: number;
}

export interface StudentCoreInfo {
  studentId: string;
  name: string;
}

export interface EvaluationStudentInfo {
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
  preferredDate: string;
  evaluationStatus: string;
  status: string;
  createdDate: string;
  createdBy: string;
}

export interface EvaluationTeacherInfo {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
}

export interface EvaluationSubscriptionInfo {
  subscriptionName: string;
}

export interface StudentEvaluationDetails {
  student: EvaluationStudentInfo;
  teacher: EvaluationTeacherInfo;
  subscription: EvaluationSubscriptionInfo;
  id: string;
  academicCoachId: string;
  classType: string;
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
  teacherStatus: string;
  status: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  updatedBy: string;
  expectedFinishingDate: number;
  assignedTeacherId: string;
  assignedTeacherEmail: string;
  __v: number;
}

export interface StudentWithAssignments extends StudentCoreInfo {
  studentDetails: StudentEvaluationDetails;
  classType: string;
  groupClassId: string;
  assignment: AssignmentItem[];
  level?: string;
}

const GroupStudents = () => {
  const [openModal, setOpenModal] = useState(false);
  const [step, setStep] = useState(1);
  const [adminTitle, setAdminTitle] = useState("");
  const [adminAssignedDate, setAdminAssignedDate] = useState("");
  const [adminDueDate, setAdminDueDate] = useState("");
  const [adminComment, setAdminComment] = useState("");
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [success, setSucces] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [openModalId, setOpenModalId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [assignedDate, setAssignedDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [comment, setComment] = useState("");
  const [groupStudents, setGroupStudents] = useState<StudentWithAssignments[]>(
    []
  );
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [sessionClassType, setSessionClassType] = useState("");
  const [assignedTeacher, setAssignedTeacher] = useState("");
  const [assignedTeacherId, setAssignedTeacherId] = useState("");
  const [course, setCourse] = useState("");
  const [groupClassId, setGroupClassId] = useState("");
  const [level, setLevel] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGroups, setFilteredGroups] = useState<
    Record<string, StudentWithAssignments[]>
  >({});
  const itemsPerPage = 8;
  const [adminAssignmentList, setAdminAssignmentList] = useState<
    {
      assignmentId: string;
      assignmentName: string;
      questionCount: number;
    }[]
  >([]);

  const [assignmentMap, setAssignmentMap] = useState<
    Record<string, AssignmentQuestion[]>
  >({});
  const [assignData, setAssignData] = useState<{
    studentId: string;
    studentFirstName: string;
    course: string;
    level: string;
    groupId?: string;
  }>({
    studentId: "",
    studentFirstName: "",
    course: "",
    level: "",
    groupId: "",
  });
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  // Add these to your existing state declarations
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    studentName: "",
    studentId: "",
    assignmentName: "",
    status: "",
    fromDate: "",
    toDate: "",
    groupId: "",
    course: "",
    level: "",
  });

  const router = useRouter();
  useEffect(() => {
    setFilteredGroups(groupedStudents);
  }, [groupStudents]);
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const lowerQuery = query.toLowerCase();

    if (!query.trim()) {
      setFilteredGroups(groupedStudents);
      return;
    }

    const filtered = Object.entries(groupedStudents).reduce(
      (acc, [groupId, students]) => {
        const matchingStudents = students.filter((student) => {
          const studentInfo = student.studentDetails?.student;
          const fullName = `${studentInfo?.studentFirstName || ""} ${studentInfo?.studentLastName || ""}`.toLowerCase();

          // Check all assignments for this student
          const assignmentMatch = student.assignment.some((assignment) => {
            // Format dates for search
            const assignedDateStr = assignment.assignedDate ? formatDate(assignment.assignedDate).toLowerCase() : "";
            const dueDateStr = assignment.dueDate ? formatDate(assignment.dueDate).toLowerCase() : "";

            return (
              assignment.assignmentId?.toLowerCase().includes(lowerQuery) ||
              assignment.assignmentName?.toLowerCase().includes(lowerQuery) ||
              assignment.assignmentStatus?.toLowerCase().includes(lowerQuery) ||
              assignment.assignmentType?.toLowerCase().includes(lowerQuery) ||
              assignment.title?.toLowerCase().includes(lowerQuery) ||
              assignedDateStr.includes(lowerQuery) ||
              dueDateStr.includes(lowerQuery)
            );
          });

          return (
            student.studentId?.toLowerCase()?.includes(lowerQuery) ||
            fullName.includes(lowerQuery) ||
            studentInfo?.studentEmail?.toLowerCase()?.includes(lowerQuery) ||
            studentInfo?.studentPhone?.toString()?.includes(lowerQuery) ||
            studentInfo?.studentCountry?.toLowerCase()?.includes(lowerQuery) ||
            student.studentDetails?.subscription?.subscriptionName?.toLowerCase()?.includes(lowerQuery) ||
            studentInfo?.preferredTeacher?.toLowerCase()?.includes(lowerQuery) ||
            studentInfo?.preferredFromTime?.toLowerCase()?.includes(lowerQuery) ||
            studentInfo?.evaluationStatus?.toLowerCase()?.includes(lowerQuery) ||
            (student.level || "").toLowerCase().includes(lowerQuery) ||
            (student.studentDetails?.student?.learningInterest || "").toLowerCase().includes(lowerQuery) ||
            groupId.toLowerCase().includes(lowerQuery) ||
            assignmentMatch
          );
        });

        if (matchingStudents.length > 0) {
          acc[groupId] = matchingStudents;
        }

        return acc;
      },
      {} as Record<string, StudentWithAssignments[]>
    );

    setFilteredGroups(filtered);
  };

  const handleApplyFilters = () => {
    let filtered = { ...groupedStudents };

    // Apply each filter if it has a value
    if (filters.studentName) {
      const lowerName = filters.studentName.toLowerCase();
      filtered = Object.entries(filtered).reduce((acc, [groupId, students]) => {
        const matchingStudents = students.filter((student) => {
          const studentInfo = student.studentDetails?.student;
          const fullName = `${studentInfo?.studentFirstName || ""} ${
            studentInfo?.studentLastName || ""
          }`.toLowerCase();
          return fullName.includes(lowerName);
        });
        if (matchingStudents.length > 0) {
          acc[groupId] = matchingStudents;
        }
        return acc;
      }, {} as Record<string, StudentWithAssignments[]>);
    }

    if (filters.studentId) {
      const lowerId = filters.studentId.toLowerCase();
      filtered = Object.entries(filtered).reduce((acc, [groupId, students]) => {
        const matchingStudents = students.filter((student) =>
          student.studentId.toLowerCase().includes(lowerId)
        );
        if (matchingStudents.length > 0) {
          acc[groupId] = matchingStudents;
        }
        return acc;
      }, {} as Record<string, StudentWithAssignments[]>);
    }

    if (filters.assignmentName) {
      const lowerAssignment = filters.assignmentName.toLowerCase();
      filtered = Object.entries(filtered).reduce((acc, [groupId, students]) => {
        const matchingStudents = students.filter((student) =>
          student.assignment.some((assignment) =>
            assignment.title.toLowerCase().includes(lowerAssignment)
          )
        );
        if (matchingStudents.length > 0) {
          acc[groupId] = matchingStudents;
        }
        return acc;
      }, {} as Record<string, StudentWithAssignments[]>);
    }

    if (filters.status) {
      filtered = Object.entries(filtered).reduce((acc, [groupId, students]) => {
        const matchingStudents = students.filter((student) =>
          student.assignment.some(
            (assignment) =>
              (assignment.assignmentStatus || assignment.status) ===
              filters.status
          )
        );
        if (matchingStudents.length > 0) {
          acc[groupId] = matchingStudents;
        }
        return acc;
      }, {} as Record<string, StudentWithAssignments[]>);
    }

    if (filters.fromDate && filters.toDate) {
      const from = new Date(filters.fromDate);
      const to = new Date(filters.toDate);
      filtered = Object.entries(filtered).reduce((acc, [groupId, students]) => {
        const matchingStudents = students.filter((student) =>
          student.assignment.some((assignment) => {
            const assignedDate = new Date(assignment.assignedDate);
            return assignedDate >= from && assignedDate <= to;
          })
        );
        if (matchingStudents.length > 0) {
          acc[groupId] = matchingStudents;
        }
        return acc;
      }, {} as Record<string, StudentWithAssignments[]>);
    }

    if (filters.groupId) {
      const lowerGroupId = filters.groupId.toLowerCase();
      filtered = Object.entries(filtered).reduce((acc, [groupId, students]) => {
        if (groupId.toLowerCase().includes(lowerGroupId)) {
          acc[groupId] = students;
        }
        return acc;
      }, {} as Record<string, StudentWithAssignments[]>);
    }

    if (filters.course) {
      const lowerCourse = filters.course.toLowerCase();
      filtered = Object.entries(filtered).reduce((acc, [groupId, students]) => {
        const matchingStudents = students.filter((student) =>
          student.studentDetails?.student?.learningInterest
            ?.toLowerCase()
            .includes(lowerCourse)
        );
        if (matchingStudents.length > 0) {
          acc[groupId] = matchingStudents;
        }
        return acc;
      }, {} as Record<string, StudentWithAssignments[]>);
    }

    if (filters.level) {
      const lowerLevel = filters.level.toLowerCase();
      filtered = Object.entries(filtered).reduce((acc, [groupId, students]) => {
        const matchingStudents = students.filter((student) =>
          student.studentDetails?.languageLevel
            ?.toLowerCase()
            .includes(lowerLevel)
        );
        if (matchingStudents.length > 0) {
          acc[groupId] = matchingStudents;
        }
        return acc;
      }, {} as Record<string, StudentWithAssignments[]>);
    }

    setFilteredGroups(filtered);
    setShowFilterModal(false);
  };

  const handleResetFilters = () => {
    setFilters({
      studentName: "",
      studentId: "",
      assignmentName: "",
      status: "",
      fromDate: "",
      toDate: "",
      groupId: "",
      course: "",
      level: "",
    });
    setFilteredGroups(groupedStudents);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teacherId = localStorage.getItem("TeacherPortalId");
        const token = localStorage.getItem("TeacherAuthToken");

        if (!token || !teacherId) {
          console.warn("Missing teacherId or token");
          return;
        }

        console.log("Fetching data for teacherId:", teacherId);

        const res = await axios.get<StudentWithAssignments[]>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TEACHER_CLASS_LIST}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            params: { teacherId },
          }
        );

        const allStudents = res.data;
        console.log("API Response:", allStudents);

        // Filter for group students only
        const group = allStudents.filter(
          (student) => student.classType?.toUpperCase() === "GROUPCLASS"
        );

        console.log("Group students filtered:", group);
        setGroupStudents(group);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchData();
  }, []);

  // Group students by groupClassId
  const groupedStudents = groupStudents.reduce((acc, student) => {
    const groupId = student.groupClassId || "no-group";
    if (!acc[groupId]) {
      acc[groupId] = [];
    }
    acc[groupId].push(student);
    return acc;
  }, {} as Record<string, StudentWithAssignments[]>);

  // Pagination logic helpers for group students
  // Flatten the filteredGroups object into a single array for pagination
  const displayList = Object.values(filteredGroups).flat();
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedList = displayList.slice(startIdx, endIdx);

  const handleViewProfile = (studentId: string, assignmentId: string) => {
    if (assignmentId && assignmentId.trim() !== "") {
      router.push(
        `/modules/users/teacher/ui/managestudentview?studentId=${studentId}&assignmentId=${assignmentId}`
      );
    } else {
      router.push(`/modules/users/teacher/ui/managestudentview?studentId=${studentId}`);
    }
  };

  const handleClick = (courseValue?: string, levelValue?: string) => {
    const finalCourse = courseValue || course;
    const finalLevel = levelValue || level;
    // Split the comma-separated strings back into arrays
    const studentIds = studentId.split(",");
    const studentNames = studentName.split(",");

    // Create an array of student objects
    const studentsData = studentIds.map((id, index) => ({
      studentId: id.trim(),
      studentName: studentNames[index]?.trim() || "Student",
    }));
    console.log("🔍 Debug - Values being passed:");
    console.log("course:", finalCourse);
    console.log("level:", finalLevel);
    console.log("studentId:", studentId);
    console.log("studentName:", studentName);

    const query = new URLSearchParams({
      title,
      assignedDate,
      dueDate,
      comment,
      sessionClassType,
      assignedTeacher,
      assignedTeacherId,
      course: finalCourse,
      level: finalLevel,
      groupClassId: groupClassId || "", // Include groupClassId
      students: JSON.stringify(studentsData), // Pass students as JSON
    }).toString();

    console.log(
      "🔍 Final URL:",
      `/modules/users/teacher/ui/addinggroupnewassignment?${query}`
    );
    router.push(`/modules/users/teacher/ui/addinggroupnewassignment?${query}`);
  };

  const handleStudentClick = (studentId: string) => {
    router.push(`/modules/users/teacher/ui/managestudentview?studentId=${studentId}`);
  };

  useEffect(() => {
    const metaData = localStorage.getItem("assignmentMeta");
    if (metaData) {
      const { title, assignedDate, dueDate, comment } = JSON.parse(metaData);
      setTitle(title);
      setAssignedDate(assignedDate);
      setDueDate(dueDate);
      setComment(comment);
    }
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-[#ECFDF3] text-[#377E36] dark:bg-[#377E3633] dark:text-[#377E36]";
      case "Not Completed":
        return "bg-[#FDF6EC] text-[#F0AD4E] dark:bg-[#F0AD4E33] dark:text-[#F0AD4E]";
      case "Not Assigned":
        return "bg-[#FDECEC] text-[#D34645] dark:text-[#D34645] dark:bg-[#D3464533]" ;
      case "Assigned":
        return "bg-[#225BAA] text[#225BAA] dark:bg-[#225BAA33] dark:text-[#225BAA]";
      case "Pending":
        return "bg-blue-100 text-blue-700 dark:bg-[#F0AD4E33] dark:text-[#F0AD4E]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const toggleStudentList = (groupId: string) => {
    setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
  };
  // Format date as 'Sep 20, 2020'
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };
  const handleAssign = async (
    studentIds: string[],
    studentFirstName: string,
    course: string,
    level: string
  ) => {
    try {
      setAssignData({
        studentId: studentIds.join(","),
        studentFirstName,
        course,
        level,
      });
      setOpenModal(true);

      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ASSIGNMENT.GET_ADMIN_ASS}`,
        {
          params: {
            courseName: course,
            levelName: level,
          },
        }
      );

      console.log("[GET ASSIGNMENT] Raw API response:", response.data);
      const data: GroupedAssignment[] = response.data.data.assignments;
      console.log("[GET ASSIGNMENT] Parsed assignments:", data);

      const commonList = data.map((item) => ({
        assignmentId: item.assignmentId,
        assignmentName: item.assignmentName,
        questionCount: item.questionCount,
      }));
      console.log("[GET ASSIGNMENT] commonList:", commonList);

      const assignmentMapData: Record<string, AssignmentQuestion[]> = {};
      data.forEach((item) => {
        assignmentMapData[item.assignmentId] = item.assignments;
        // Check file types for each question
        item.assignments.forEach((q, idx) => {
          if (q.uploadFile) {
            const isArrayBuffer = q.uploadFile instanceof ArrayBuffer;
            const isUint8Array = q.uploadFile instanceof Uint8Array;
            let isBase64 = false;
            if (typeof q.uploadFile === "string") {
              isBase64 = /^[A-Za-z0-9+/=]+$/.test(
                (q.uploadFile as string).replace(/\s/g, "")
              );
            }
            console.log(
              `[GET ASSIGNMENT] AssignmentId: ${item.assignmentId}, Question ${idx} uploadFile type:`,
              {
                isArrayBuffer,
                isUint8Array,
                isBase64,
                typeof: typeof q.uploadFile,
                value: q.uploadFile,
              }
            );
          }
          if (q.audioFile) {
            const isArrayBuffer = q.audioFile instanceof ArrayBuffer;
            const isUint8Array = q.audioFile instanceof Uint8Array;
            let isBase64 = false;
            if (typeof q.audioFile === "string") {
              isBase64 = /^[A-Za-z0-9+/=]+$/.test(
                (q.audioFile as string).replace(/\s/g, "")
              );
            }
            console.log(
              `[GET ASSIGNMENT] AssignmentId: ${item.assignmentId}, Question ${idx} audioFile type:`,
              {
                isArrayBuffer,
                isUint8Array,
                isBase64,
                typeof: typeof q.audioFile,
                value: q.audioFile,
              }
            );
          }
        });
      });

      console.log("[GET ASSIGNMENT] assignmentMapData:", assignmentMapData);
      setAdminAssignmentList(commonList);
      setAssignmentMap(assignmentMapData);
    } catch (error) {
      console.error("❌ Failed to fetch assignments:", error);
    }
  };

  const toggleAssignment = (id: string) => {
    setSelectedAssignments((prev) =>
      prev.includes(id) ? prev.filter((aid) => aid !== id) : [...prev, id]
    );
  };

  const handleAdminClose = () => {
    setOpenModal(false);
    setAssignData({
      studentId: "",
      studentFirstName: "",
      course: "",
      level: "",
    });
    setStep(1);
    setAdminTitle("");
    setAdminAssignedDate("");
    setAdminDueDate("");
    setAdminComment("");
    setSelectedAssignments([]);
    setAdminAssignmentList([]);
    setAssignmentMap({});
  };

  const handleSaveAssignment = async ({
    adminTitle,
    adminAssignedDate,
    adminDueDate,
    adminComment,
    selectedAssignments,
  }: {
    adminTitle: string;
    adminAssignedDate: string;
    adminDueDate: string;
    adminComment: string;
    selectedAssignments: string[];
  }) => {
    try {
      if (!selectedAssignments.length) {
        setFailedMessage(AppValidationMessages.ASSIGNMENT.SELECT_REQUIRED);
        setFailed(true);
        return;
      }

      const token = localStorage.getItem("TeacherAuthToken") || "";
      const teacherName = localStorage.getItem("TeacherPortalName") || "";
      const teacherId = localStorage.getItem("TeacherPortalId") || "";

      // Prepare students list - ensure we have valid student names
      const studentIds = assignData.studentId.split(",");
      const studentNames = assignData.studentFirstName.split(",");

      // Create students array with fallback for missing names
      const students = studentIds.map((id, index) => {
        const studentId = id.trim();
        let studentName = studentNames[index]?.trim() || "";

        // If name is empty, try to get it from localStorage or use a default
        if (!studentName) {
          studentName =
            localStorage.getItem(`studentName_${studentId}`) || "Student";
          console.warn(
            `Missing student name for ID ${studentId}, using fallback: ${studentName}`
          );
        }

        return {
          studentId,
          studentName,
        };
      });

      // Validate we have at least one student
      if (students.length === 0) {
        setFailedMessage("No valid students found");
        setFailed(true);
        return;
      }

      const formData = new FormData();

      const groupAssignmentId = `GRP-${Date.now()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      // Add shared fields
      formData.append("students", JSON.stringify(students));
      formData.append("sessionClassType", "GROUPCLASS");
      formData.append("assignedTeacher", teacherName);
      formData.append("assignedTeacherId", teacherId);
      formData.append("course", assignData.course?.trim() || "");
      formData.append("level", assignData.level?.trim() || "");
      formData.append("createdBy", "System");
      formData.append("updatedBy", teacherName);
      formData.append("commends", adminComment?.trim() || "");
      formData.append("groupId", assignData.groupId || "");
      formData.append("groupAssignmentId", groupAssignmentId);

      // Process each assignment
      selectedAssignments.forEach((assignmentId, index) => {
        const questions = assignmentMap[assignmentId] || [];
        questions.forEach((q: AssignmentQuestion, qIndex) => {
          const prefix = `assignments[${index}]`;

          // Assignment type handling
          let assignmentTypeValue;
          try {
            assignmentTypeValue = JSON.stringify({
              type:
                q.assignmentType?.toLowerCase() === "image"
                  ? "image identification"
                  : q.assignmentType?.toLowerCase() === "wordmatch"
                  ? "word match"
                  : q.assignmentType?.toLowerCase() || "quiz",
              name: q.assignmentType || "quiz",
            });
          } catch (err) {
            console.error("Error stringifying assignmentType:", err);
            assignmentTypeValue = JSON.stringify({
              type: "quiz",
              name: "quiz",
            });
          }

          // Core assignment fields
          formData.append(
            `${prefix}[assignmentName]`,
            q.assignmentName || "Unnamed Assignment"
          );
          formData.append(`${prefix}[assignmentType]`, assignmentTypeValue);
          formData.append(`${prefix}[questionName]`, q.questionName || "");
          formData.append(
            `${prefix}[questionType]`,
            q.chooseType
              ? "choose"
              : q.trueorfalseType
              ? "truefalse"
              : "noOption"
          );
          formData.append(`${prefix}[title]`, adminTitle.trim());
          formData.append(`${prefix}[question]`, q.question || "");
          formData.append(
            `${prefix}[hasOptions]`,
            String(q.chooseType || q.trueorfalseType)
          );
          formData.append(
            `${prefix}[assignedDate]`,
            new Date(adminAssignedDate).toISOString()
          );

          // Options handling
          try {
            const optionsValue = JSON.stringify({
              optionOne: q.options?.[0] ?? "",
              optionTwo: q.options?.[1] ?? "",
              optionThree: q.options?.[2] ?? "",
              optionFour: q.options?.[3] ?? "",
            });
            formData.append(`${prefix}[options]`, optionsValue);
          } catch (err) {
            console.error("Error stringifying options:", err);
            formData.append(
              `${prefix}[options]`,
              JSON.stringify({
                optionOne: "",
                optionTwo: "",
                optionThree: "",
                optionFour: "",
              })
            );
          }

          // Dates and status fields
          const currentDate = new Date().toISOString();
          formData.append(`${prefix}[createdDate]`, currentDate);
          formData.append(
            `${prefix}[dueDate]`,
            new Date(adminDueDate).toISOString()
          );
          formData.append(`${prefix}[updatedDate]`, currentDate);
          formData.append(`${prefix}[status]`, "Active");
          formData.append(`${prefix}[assignmentStatus]`, "Assigned");
          formData.append(`${prefix}[answer]`, "");
          formData.append(
            `${prefix}[answerValidation]`,
            q.answerValidation || ""
          );
          formData.append(
            `${prefix}[chooseType]`,
            String(q.chooseType || false)
          );
          formData.append(
            `${prefix}[trueorfalseType]`,
            String(q.trueorfalseType || false)
          );

          // File handling
          if (q.uploadFile) {
            try {
              if (q.uploadFile instanceof File) {
                formData.append(
                  `${prefix}[uploadFile]`,
                  q.uploadFile,
                  `assignment_${index}_${qIndex}.${q.uploadFile.name
                    .split(".")
                    .pop()}`
                );
              } else if (typeof q.uploadFile === "string") {
                // Handle base64 string
                let base64Data = q.uploadFile;
                let mimeType = "application/octet-stream";
                if (q.uploadFile.startsWith("data:")) {
                  mimeType =
                    q.uploadFile.match(/^data:(.*?);/)?.[1] || mimeType;
                  base64Data = q.uploadFile.split(",")[1];
                }
                if (/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
                  const byteCharacters = atob(base64Data);
                  const byteNumbers = new Array(byteCharacters.length);
                  for (let j = 0; j < byteCharacters.length; j++) {
                    byteNumbers[j] = byteCharacters.charCodeAt(j);
                  }
                  const byteArray = new Uint8Array(byteNumbers);
                  const blob = new Blob([byteArray], { type: mimeType });
                  formData.append(
                    `${prefix}[uploadFile]`,
                    blob,
                    `assignment_${index}_${qIndex}.jpg`
                  );
                }
              }
            } catch (err) {
              console.error("Error processing file:", err);
            }
          }

          // Audio file handling
          if (q.audioFile) {
            try {
              if (q.audioFile instanceof File) {
                formData.append(
                  `${prefix}[audioFile]`,
                  q.audioFile,
                  `assignment_${index}_${qIndex}.mp3`
                );
              } else if (typeof q.audioFile === "string") {
                // Handle base64 audio string
                let base64Data = q.audioFile;
                let mimeType = "audio/mpeg";
                if (q.audioFile.startsWith("data:")) {
                  mimeType = q.audioFile.match(/^data:(.*?);/)?.[1] || mimeType;
                  base64Data = q.audioFile.split(",")[1];
                }
                if (/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
                  const byteCharacters = atob(base64Data);
                  const byteNumbers = new Array(byteCharacters.length);
                  for (let j = 0; j < byteCharacters.length; j++) {
                    byteNumbers[j] = byteCharacters.charCodeAt(j);
                  }
                  const byteArray = new Uint8Array(byteNumbers);
                  const blob = new Blob([byteArray], { type: mimeType });
                  formData.append(
                    `${prefix}[audioFile]`,
                    blob,
                    `assignment_${index}_${qIndex}.mp3`
                  );
                }
              }
            } catch (err) {
              console.error("Error processing audio file:", err);
            }
          }
        });
      });

      // Debug: Log FormData before sending
      formData.forEach((value, key) => {
        console.log(
          key,
          value instanceof Blob ? `[Blob ${value.type}]` : value
        );
      });

      // Submit to API
      const res = await axios.post(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ASSIGNMENT.GROUP_ASSIGNMENTS}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if ([200, 201].includes(res.status)) {
        setSucces(true);
        handleAdminClose();
      }
    } catch (err) {
      console.error("Submission error:", err);
      const error = err as AxiosError;

      let errorMessage = "Failed to submit assignment";
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = "Invalid request data - please check all fields";
            break;
          case 401:
            errorMessage = "Session expired - please login again";
            break;
          case 403:
            errorMessage = "You don't have permission to perform this action";
            break;
          case 500:
            errorMessage = "Server error - please try again later";
            break;
        }
      }

      setFailedMessage(errorMessage);
      setFailed(true);
    }
  };
  return (
    <div className="md:p-0 mx-auto w-full">
      <div className="flex flex-col h-full w-full justify-between">
        <div className="flex flex-col">
          <div className="w-full bg-[#FAFAFB] dark:bg-[#343434] rounded-lg">
            <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by keyword"
                  className="bg-transparent outline-none text-[15px] w-52 py-3"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer">
                <MdTune className="w-4 h-4" />
                <span onClick={() => setShowFilterModal(true)}>Filter</span>
              </div>
              {showFilterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-30">
                  <div className="bg-white p-5 rounded-lg w-[400px] relative dark:bg-[#252525]">
                    <button
                      className="absolute top-2 right-3 text-gray-400 text-xl"
                      onClick={() => setShowFilterModal(false)}
                    >
                      &times;
                    </button>
                    <h2 className="text-lg font-semibold mb-4 dark:text-[#fff]">
                      Filter Students
                    </h2>

                    <div className="mb-4">
                      <label className="text-sm font-medium mb-1 dark:text-[#D6D6D6]">
                        Group ID
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded text-xs dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]"
                        value={filters.groupId}
                        onChange={(e) =>
                          setFilters({ ...filters, groupId: e.target.value })
                        }
                      />
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-medium mb-1 dark:text-[#D6D6D6]">
                        Assignment Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded text-xs dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]"
                        value={filters.assignmentName}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            assignmentName: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-medium mb-1 dark:text-[#D6D6D6]">
                        Course
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded text-xs dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]"
                        value={filters.course}
                        onChange={(e) =>
                          setFilters({ ...filters, course: e.target.value })
                        }
                      />
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-medium mb-1 dark:text-[#D6D6D6]">
                        Level
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded text-xs dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]"
                        value={filters.level}
                        onChange={(e) =>
                          setFilters({ ...filters, level: e.target.value })
                        }
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1 dark:text-[#D6D6D6]">
                        Assignment Date
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          className="w-1/2 px-3 py-2 border rounded text-xs dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434] [&::-webkit-calendar-picker-indicator]:dark:invert"
                          value={filters.fromDate}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              fromDate: e.target.value,
                            })
                          }
                        />
                        <input
                          type="date"
                          className="w-1/2 px-3 py-2 border rounded text-xs dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434] [&::-webkit-calendar-picker-indicator]:dark:invert"
                          value={filters.toDate}
                          onChange={(e) =>
                            setFilters({ ...filters, toDate: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="text-sm font-medium mb-1 dark:text-[#D6D6D6]">
                        Status
                      </label>
                      <select
                        className="w-full border rounded-md p-2 text-[12px] dark:text-[#fff] dark:border-[#5C5C5C] dark:bg-[#343434]"
                        value={filters.status}
                        onChange={(e) =>
                          setFilters({ ...filters, status: e.target.value })
                        }
                      >
                        <option value="">Select status</option>
                        <option value="Completed">Completed</option>
                        <option value="Not Completed">Not Completed</option>
                        <option value="Not Assigned">Not Assigned</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={handleResetFilters}
                        className="px-4 py-1 rounded-md border border-[#576CBC] text-[#576CBC] font-medium dark:text-[#576CBC] dark:border-[#576CBC]"
                      >
                        Reset
                      </button>
                      <button
                        className="px-4 py-1 rounded-md bg-[#576CBC] text-white font-medium"
                        onClick={handleApplyFilters}
                      >
                        Show {Object.keys(filteredGroups).length} results
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                <span className="text-left -ml-60">
                  Showing {Object.keys(filteredGroups).length} of{" "}
                  {Object.keys(groupedStudents).length}
                </span>
              </div>
            </div>

            {/* Table */}
            <table className="table-fixed w-full border border-gray-300 dark:border-gray-600">
              <thead className="text-[12px] bg-[#4C6993] text-white">
                <tr>
                  {[
                    { label: "Assignment ID", width: "w-[14%]" },
                    { label: "Student Name", width: "w-[13%]" },
                    { label: "Group ID", width: "w-[15%]" },
                    { label: "Level", width: "w-[6%]" },
                    { label: "Course", width: "w-[10%]" },
                    { label: "Assignment Name", width: "w-[15%]" },
                    { label: "Assign Date", width: "w-[11%]" },
                    { label: "Due Date", width: "w-[11%]" },
                    { label: "Status", width: "w-[12%]" },
                    { label: "Action", width: "w-[8%]" },
                  ].map((header) => (
                    <th
                      key={header.label}
                      className={`px-2 py-2 border border-[#4C6993] text-left text-wrap break-words ${header.width}`}
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Render only paginated students, grouped by groupId */}
                {(() => {
                  // Group paginatedList by groupId for rendering
                  const groupMap = paginatedList.reduce((acc, student) => {
                    if (!acc[student.groupClassId])
                      acc[student.groupClassId] = [];
                    acc[student.groupClassId].push(student);
                    return acc;
                  }, {} as Record<string, StudentWithAssignments[]>);
                  return Object.entries(groupMap).flatMap(
                    ([groupId, students], groupIndex) => {
                      // Get the first student's details for the group row
                      const firstStudent = students[0];
                      const studentInfo = firstStudent.studentDetails?.student;
                      const studentDetails = firstStudent.studentDetails;

                      // If no assignments, show one row with empty assignment data
                      if (firstStudent.assignment.length === 0) {
                        // Define modalId for no-assignment case
                        const modalIdNoAssignment = `${groupId}-no-assignment`;
                        return (
                          <tr
                            key={modalIdNoAssignment}
                            className={`text-[12px] border-b border-gray-300 dark:border-gray-600 ${
                              groupIndex % 2 === 0
                                ? "bg-white dark:bg-[#2C2C2C]"
                                : "bg-[#F8F8F8] dark:bg-[#303030]"
                            }`}
                          >
                            <td className="px-3 py-2 break-words">-</td>
                            <td className="px-3 py-2 break-words relative">
                              <button
                                onClick={() => toggleStudentList(groupId)}
                                className="text-[#3D8FDE] font-medium hover:underline flex items-center gap-1"
                              >
                                <MdFormatListBulleted className="w-5 h-5 text-[#3D8FDE]" />
                                View List ({students.length} students)
                              </button>
                              {expandedGroupId === groupId && (
                                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 p-2 z-10 min-w-[200px]">
                                  {students.map((student) => {
                                    const studentData =
                                      student.studentDetails?.student;
                                    return (
                                      <div
                                        key={student.studentId}
                                        className="text-[11px] py-2 px-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                        onClick={() =>
                                          handleStudentClick(student.studentId)
                                        }
                                      >
                                        <div className="font-medium">
                                          {studentData?.studentFirstName}{" "}
                                          {studentData?.studentLastName}
                                        </div>
                                        <div className="text-gray-500 text-[10px]">
                                          ID: {student.studentId}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 break-words">
                              {groupId === "no-group" ? "-" : groupId}
                            </td>
                            <td className="px-3 py-2 break-words">
                              {students[0]?.level || "-"}
                            </td>
                            <td className="px-3 py-2 break-words">
                              {studentDetails?.student?.learningInterest}
                            </td>
                            <td className="px-3 py-2 break-words">-</td>
                            <td className="px-3 py-2 break-words">-</td>
                            <td className="px-3 py-2 break-words">-</td>
                            <td className="px-3 py-2 break-words">
                              <span
                                className={`py-1 px-2 rounded-md text-[10px] flex items-center justify-center min-w-[80px] ${getStatusStyle(
                                  "Not Assigned"
                                )}`}
                              >
                                Not Assigned
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center relative">
                              <button
                                className="text-gray-500 hover:text-gray-700 dark:text-[#ffff]"
                                onClick={() =>
                                  setOpenDropdownId(
                                    openDropdownId === modalIdNoAssignment
                                      ? null
                                      : modalIdNoAssignment
                                  )
                                }
                              >
                                <BsThreeDotsVertical />
                              </button>

                              {openDropdownId === modalIdNoAssignment && (
                                <div className="absolute right-0 w-36 shadow-2xl space-y-2 bg-white rounded-md z-50 border border-gray-200 dark:bg-[#343434]">
                                  <button
                                    className="block w-full px-4 py-1 text-[12px] text-black dark:text-[#ffff]"
                                    onClick={() => {
                                      // Get all student IDs in the group
                                      const studentIds = students.map(
                                        (s) => s.studentId
                                      );
                                      handleAssign(
                                        studentIds,
                                        firstStudent.studentDetails.student
                                          .studentFirstName,
                                        firstStudent.studentDetails.student
                                          .learningInterest,
                                        firstStudent.level || ""
                                      );
                                    }}
                                  >
                                   Admin Assign
                                  </button>
                                  <button
                                    className="block w-full px-4 py-1 text-[12px] dark:text-[#ffff]"
                                    onClick={() => {
                                      const studentIds = students.map(
                                        (s) => s.studentId
                                      );
                                      setStudentId(studentIds.join(","));
                                      setStudentName(
                                        `${
                                          studentInfo?.studentFirstName ?? ""
                                        } ${studentInfo?.studentLastName ?? ""}`
                                      );
                                      setSessionClassType(
                                        studentDetails?.classType ??
                                          "GROUPCLASS"
                                      );
                                      setAssignedTeacher(
                                        studentDetails?.teacher?.teacherName ??
                                          ""
                                      );
                                      setAssignedTeacherId(
                                        studentDetails?.teacher?.teacherId ?? ""
                                      );
                                      setCourse(
                                        studentDetails?.student
                                          ?.learningInterest || ""
                                      );
                                      setLevel(
                                        studentDetails?.languageLevel || ""
                                      );
                                      setOpenModalId(modalIdNoAssignment);
                                    }}
                                  >
                                    New Assignment
                                  </button>
                                  <button
                                    className="block w-full px-4 py-1 text-[12px] dark:text-[#ffff]"
                                    onClick={() => setOpenDropdownId(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}

                              {/* Assignment Modal for students with no assignments */}
                              {openModalId === modalIdNoAssignment && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                  <div className="bg-white rounded-lg w-[400px] h-[500px] p-6 border flex flex-col justify-between text-left dark:bg-[#343434]">
                                    <div>
                                      <h2 className="text-lg font-semibold mb-4 dark:text-[#fff]">
                                        Assign
                                      </h2>
                                      <div className="mb-4">
                                        <label className="text-sm block mb-1 dark:text-[#fff]">
                                          Title
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="Enter title"
                                          value={title}
                                          onChange={(e) =>
                                            setTitle(e.target.value)
                                          }
                                          className="w-full border rounded-md px-2 py-2 dark:text-[#fff] dark:bg-[#5C5C5C]"
                                        />
                                      </div>
                                      <div className="flex gap-4 mb-4">
                                        <div className="flex-1">
                                          <label className="text-sm block mb-1 dark:text-[#fff]">
                                            Assigned Date
                                          </label>
                                          <input
                                            type="date"
                                            className="w-full border rounded-md px-2 py-2 dark:text-[#fff] dark:bg-[#5C5C5C]"
                                            value={assignedDate}
                                            onChange={(e) =>
                                              setAssignedDate(e.target.value)
                                            }
                                          />
                                        </div>
                                        <div className="flex-1">
                                          <label className="text-sm block mb-1 dark:text-[#fff]">
                                            Due Date
                                          </label>
                                          <input
                                            type="date"
                                            className="w-full border rounded-md px-2 py-2 dark:bg-[#5C5C5C] dark:text-[#fff]"
                                            value={dueDate}
                                            onChange={(e) =>
                                              setDueDate(e.target.value)
                                            }
                                          />
                                        </div>
                                      </div>
                                      <div className="mb-4">
                                        <label className="text-sm block mb-1 dark:text-[#fff]">
                                          Comment
                                        </label>
                                        <textarea
                                          placeholder="Write your comment here..."
                                          value={comment}
                                          onChange={(e) =>
                                            setComment(e.target.value)
                                          }
                                          className="w-full border rounded-md px-2 py-2 h-28 resize-none dark:bg-[#5C5C5C] dark:text-[#fff]"
                                        ></textarea>
                                      </div>
                                    </div>
                                    <div className="flex justify-end gap-3">
                                      <button
                                        className="bg-gray-200 text-gray-800 px-4 py-2 bg-[#576CBC/10] rounded-md dark:text-[#576CBC] dark:bg-[#576CBC] dark:bg-opacity-10 dark:border-[#576CBC] border border-[#576CBC]"
                                        onClick={() => setOpenModalId(null)}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        className="bg-[#576CBC] text-white px-4 py-2 rounded-md dark:text-[#fff]"
                                        onClick={() => handleClick()}
                                      >
                                        Create Assignment
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      }

                      // Ensure unique assignments per group
                      const uniqueAssignmentsMap = new Map<
                        string,
                        AssignmentItem
                      >();
                      students.forEach((student) => {
                        student.assignment.forEach((item) => {
                          const id =
                            item.assignmentId ||
                            `${item.assignmentName}-${item.title}`;
                          if (!uniqueAssignmentsMap.has(id)) {
                            uniqueAssignmentsMap.set(id, item);
                          }
                        });
                      });
                      const uniqueAssignments = Array.from(
                        uniqueAssignmentsMap.values()
                      );

                      return uniqueAssignments.map(
                        (assignmentItem, assignIndex) => {
                          const modalId = `${groupId}-${assignmentItem.assignmentName}-${assignIndex}`;

                          return (
                            <tr
                              key={`${groupId}-${assignIndex}`}
                              className={`text-[12px] border-b border-gray-300 dark:border-gray-600 ${
                                groupIndex % 2 === 0
                                  ? "bg-white dark:bg-[#2C2C2C]"
                                  : "bg-[#F8F8F8] dark:bg-[#303030]"
                              }`}
                            >
                              <td className="px-3 py-2 break-words">
                                {assignmentItem.assignmentId || ""}
                              </td>
                              <td className="px-3 py-2 break-words relative">
                                <button
                                  onClick={() => toggleStudentList(groupId)}
                                  className="text-[#3D8FDE] font-medium hover:underline flex items-center gap-1"
                                >
                                  <MdFormatListBulleted className="w-5 h-5 text-[#3D8FDE]" />
                                  View List{" "}
                                  <span className="text-[8px]">
                                    ({students.length} students)
                                  </span>
                                </button>
                                {expandedGroupId === groupId && (
                                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 p-2 z-10 min-w-[300px]">
                                    {students.map((student) => {
                                      const studentData =
                                        student.studentDetails?.student;
                                      const isSelected =
                                        viewingStudentId === student.studentId;

                                      return (
                                        <div key={student.studentId}>
                                          <div
                                            className={`text-[11px] py-2 px-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${
                                              isSelected
                                                ? "bg-blue-50 dark:bg-blue-900"
                                                : ""
                                            }`}
                                            onClick={() =>
                                              setViewingStudentId(
                                                isSelected
                                                  ? null
                                                  : student.studentId
                                              )
                                            }
                                          >
                                            {studentData?.studentFirstName}{" "}
                                            {studentData?.studentLastName}
                                          </div>

                                          {isSelected && (
                                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm text-xs w-full max-w-sm">
                                              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                                {/* Email */}
                                                <div>
                                                  <p className="text-gray-500 font-medium">
                                                    Email:
                                                  </p>
                                                  <p className="text-gray-900 dark:text-gray-100 break-words">
                                                    {studentData?.studentEmail ||
                                                      "-"}
                                                  </p>
                                                </div>

                                                {/* Country */}
                                                <div>
                                                  <p className="text-gray-500 font-medium">
                                                    Country:
                                                  </p>
                                                  <p className="text-gray-900 dark:text-gray-100">
                                                    {studentData?.studentCountry ||
                                                      "-"}
                                                  </p>
                                                </div>

                                                {/* Level */}
                                                <div>
                                                  <p className="text-gray-500 font-medium">
                                                    Level:
                                                  </p>
                                                  <p className="text-gray-900 dark:text-gray-100">
                                                    {student?.level || "-"}
                                                  </p>
                                                </div>

                                                {/* Course */}
                                                <div>
                                                  <p className="text-gray-500 font-medium">
                                                    Course:
                                                  </p>
                                                  <p className="text-gray-900 dark:text-gray-100">
                                                    {studentData?.learningInterest ||
                                                      "-"}
                                                  </p>
                                                </div>
                                              </div>
                                              <br />
                                              {/* View Profile Button */}
                                              <div className=" text-right">
                                                <button
                                                  className="text-[#576CBC] dark:text-[#576CBC] border border-[#576CBC] text-xs bg-gray-100 px-2 rounded-md py-2 font-semibold hover:underline"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewProfile(
                                                      student.studentId,
                                                      assignmentItem.assignmentId ||
                                                        ""
                                                    );
                                                  }}
                                                >
                                                  View Profile
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-2 break-words">
                                {groupId === "no-group" ? "-" : groupId}
                              </td>
                           
                              <td className="px-3 py-2 break-words">
                                {students[0]?.level || "-"}
                              </td>
                              <td className="px-3 py-2 break-words">
                                {studentDetails?.student?.learningInterest}
                              </td>
                                 <td className="px-3 py-2 break-words">
                                {assignmentItem.title}
                              </td>
                              <td className="px-3 py-2 break-words">
                                {formatDate(assignmentItem?.assignedDate)}
                              </td>
                              <td className="px-3 py-2 break-words">
                                {formatDate(assignmentItem?.dueDate)}
                              </td>
                              <td
                                className={`px-3 py-2 break-words ${
                                  (assignmentItem?.assignmentStatus ||
                                    assignmentItem?.status) === "Completed"
                                    ? "bg-green-100 text-green-700"
                                    : (assignmentItem?.assignmentStatus ||
                                        assignmentItem?.status) === "Pending"
                                    ? "bg-orange-100 text-orange-700"
                                    : ""
                                }`}
                              >
                                <span
                                  className={`py-1 px-2 rounded-md text-[10px] flex items-center justify-center min-w-[80px] ${getStatusStyle(
                                    assignmentItem?.assignmentStatus ||
                                      assignmentItem?.status ||
                                      "Not Assigned"
                                  )}`}
                                >
                                  {assignmentItem?.assignmentStatus ||
                                    assignmentItem?.status ||
                                    "Not Assigned"}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-center relative">
                                <button
                                  className={`text-gray-500 dark:text-[#ffff] ${
                                    status === "Assigned"
                                      ? "opacity-50 cursor-not-allowed"
                                      : "hover:text-gray-700"
                                  }`}
                                  disabled={status === "Assigned"}
                                  onClick={() => {
                                    if (status !== "Assigned") {
                                      setOpenDropdownId(
                                        openDropdownId === modalId
                                          ? null
                                          : modalId
                                      );
                                    }
                                  }}
                                >
                                  <BsThreeDotsVertical />
                                </button>

                                {openDropdownId === modalId && (
                                  <div className="absolute right-0 w-36 shadow-2xl space-y-2 bg-white rounded-md z-50 border border-gray-200 dark:bg-[#343434]">
                                    {(() => {
                                      const status =
                                        assignmentItem.assignmentStatus ||
                                        assignmentItem.status;
                                      if (status === "Completed") {
                                        return (
                                          <>
                                            <button
                                              className="block w-full px-4 py-1 text-[12px] text-black dark:text-[#ffff]"
                                              onClick={() =>
                                                handleViewProfile(
                                                  firstStudent.studentId,
                                                  assignmentItem.assignmentId ||
                                                    ""
                                                )
                                              }
                                            >
                                              View Profile
                                            </button>
                                            <button
                                              className="block w-full px-4 py-1 text-[12px] dark:text-[#ffff]"
                                              onClick={() => {
                                                // Get all student IDs in the group
                                                const studentIds = students.map(
                                                  (s) => s.studentId
                                                );
                                                const studentNames =
                                                  students.map(
                                                    (s) =>
                                                      `${
                                                        s.studentDetails
                                                          ?.student
                                                          ?.studentFirstName ||
                                                        ""
                                                      } ${
                                                        s.studentDetails
                                                          ?.student
                                                          ?.studentLastName ||
                                                        ""
                                                      }`
                                                  );

                                                setStudentId(
                                                  studentIds.join(",")
                                                );
                                                setStudentName(
                                                  studentNames.join(",")
                                                );
                                                setSessionClassType(
                                                  studentDetails?.classType ??
                                                    "GROUPCLASS"
                                                );
                                                setAssignedTeacher(
                                                  studentDetails?.teacher
                                                    ?.teacherName ?? ""
                                                );
                                                setAssignedTeacherId(
                                                  studentDetails?.teacher
                                                    ?.teacherId ?? ""
                                                );
                                                setGroupClassId(groupId); // Set the groupClassId from current row

                                                const courseValue =
                                                  studentDetails?.student
                                                    ?.learningInterest || "";
                                                const levelValue =
                                                  students[0]?.level || "";

                                                setCourse(courseValue);
                                                setLevel(levelValue);
                                                setOpenModalId(modalId);
                                              }}
                                            >
                                              New Assignment
                                            </button>
                                            <button
                                              className="block w-full px-4 py-1 text-[12px] text-black dark:text-[#ffff]"
                                              onClick={() => {
                                                // Get all student IDs in the group
                                                const studentIds = students.map(
                                                  (s) => s.studentId
                                                );
                                                handleAssign(
                                                  studentIds,
                                                  firstStudent.studentDetails
                                                    .student.studentFirstName,
                                                  firstStudent.studentDetails
                                                    .student.learningInterest,
                                                  firstStudent.level || ""
                                                );
                                              }}
                                            >
                                             Admin Assign
                                            </button>
                                            <button
                                              className="block w-full px-4 py-1 text-[12px] dark:text-[#ffff]"
                                              onClick={() =>
                                                setOpenDropdownId(null)
                                              }
                                            >
                                              Cancel
                                            </button>
                                          </>
                                        );
                                      } else if (status === "Not Completed") {
                                        return (
                                          <>
                                            <button
                                              className="block w-full px-4 py-1 text-[12px] text-black dark:text-[#ffff]"
                                              onClick={() =>
                                                handleViewProfile(
                                                  firstStudent.studentId,
                                                  assignmentItem.assignmentId ||
                                                    ""
                                                )
                                              }
                                            >
                                              View Profile
                                            </button>
                                            <button
                                              className="block w-full px-4 py-1 text-[12px] dark:text-[#ffff]"
                                              onClick={() =>
                                                setOpenDropdownId(null)
                                              }
                                            >
                                              Cancel
                                            </button>
                                          </>
                                        );
                                      } else if (status === "Not Assigned") {
                                        return (
                                          <>
                                            <button
                                              className="block w-full px-4 py-1 text-[12px] text-black dark:text-[#ffff]"
                                              onClick={() =>
                                                handleViewProfile(
                                                  firstStudent.studentId,
                                                  assignmentItem.assignmentId ||
                                                    ""
                                                )
                                              }
                                            >
                                             Admin Assign
                                            </button>
                                            <button
                                              className="block w-full px-4 py-1 text-[12px] dark:text-[#ffff]"
                                              onClick={() => {
                                                setStudentId(
                                                  firstStudent.studentId
                                                );
                                                setStudentName(
                                                  `${
                                                    studentInfo?.studentFirstName ??
                                                    ""
                                                  } ${
                                                    studentInfo?.studentLastName ??
                                                    ""
                                                  }`
                                                );
                                                setSessionClassType(
                                                  studentDetails?.classType ??
                                                    "GROUPCLASS"
                                                );
                                                setAssignedTeacher(
                                                  studentDetails?.teacher
                                                    ?.teacherName ?? ""
                                                );
                                                setAssignedTeacherId(
                                                  studentDetails?.teacher
                                                    ?.teacherId ?? ""
                                                );
                                                console.log(
                                                  "🔍 GroupStudents - Setting values for student:",
                                                  firstStudent.studentId
                                                );
                                                console.log(
                                                  "🔍 students array:",
                                                  students
                                                );
                                                console.log(
                                                  "🔍 students[0]:",
                                                  students[0]
                                                );
                                                console.log(
                                                  "🔍 students[0]?.level:",
                                                  students[0]?.level
                                                );
                                                console.log(
                                                  "🔍 studentDetails?.student?.learningInterest:",
                                                  studentDetails?.student
                                                    ?.learningInterest
                                                );

                                                const courseValue =
                                                  studentDetails?.student
                                                    ?.learningInterest || "";
                                                const levelValue =
                                                  students[0]?.level || "";

                                                console.log(
                                                  "🔍 Final courseValue:",
                                                  courseValue
                                                );
                                                console.log(
                                                  "🔍 Final levelValue:",
                                                  levelValue
                                                );

                                                setCourse(courseValue);
                                                setLevel(levelValue);
                                                setOpenModalId(modalId);
                                              }}
                                            >
                                              New Assignment
                                            </button>
                                            <button
                                              className="block w-full px-4 py-1 text-[12px] dark:text-[#ffff]"
                                              onClick={() =>
                                                setOpenDropdownId(null)
                                              }
                                            >
                                              Cancel
                                            </button>
                                          </>
                                        );
                                      } else {
                                        return <></>;
                                      }
                                    })()}
                                  </div>
                                )}

                                {/* Assignment Modal */}
                                {openModalId === modalId && (
                                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-lg w-[400px] h-[500px] p-6 border flex flex-col justify-between text-left dark:bg-[#343434]">
                                      <div>
                                        <h2 className="text-lg font-semibold mb-4 dark:text-[#fff]">
                                          Assign
                                        </h2>
                                        <div className="mb-4">
                                          <label className="text-sm block mb-1 dark:text-[#fff]">
                                            Title
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="Enter title"
                                            value={title}
                                            onChange={(e) =>
                                              setTitle(e.target.value)
                                            }
                                            className="w-full border rounded-md px-2 py-2 dark:text-[#fff] dark:bg-[#5C5C5C]"
                                          />
                                        </div>
                                        <div className="flex gap-4 mb-4">
                                          <div className="flex-1">
                                            <label className="text-sm block mb-1 dark:text-[#fff]">
                                              Assigned Date
                                            </label>
                                            <input
                                              type="date"
                                              className="w-full border rounded-md px-2 py-2 dark:text-[#fff] dark:bg-[#5C5C5C]"
                                              value={assignedDate}
                                              onChange={(e) =>
                                                setAssignedDate(e.target.value)
                                              }
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <label className="text-sm block mb-1 dark:text-[#fff]">
                                              Due Date
                                            </label>
                                            <input
                                              type="date"
                                              className="w-full border rounded-md px-2 py-2 dark:bg-[#5C5C5C] dark:text-[#fff]"
                                              value={dueDate}
                                              onChange={(e) =>
                                                setDueDate(e.target.value)
                                              }
                                            />
                                          </div>
                                        </div>
                                        <div className="mb-4">
                                          <label className="text-sm block mb-1 dark:text-[#fff]">
                                            Comment
                                          </label>
                                          <textarea
                                            placeholder="Write your comment here..."
                                            value={comment}
                                            onChange={(e) =>
                                              setComment(e.target.value)
                                            }
                                            className="w-full border rounded-md px-2 py-2 h-28 resize-none dark:bg-[#5C5C5C] dark:text-[#fff]"
                                          ></textarea>
                                        </div>
                                      </div>
                                      <div className="flex justify-end gap-3">
                                        <button
                                          className="bg-gray-200 text-gray-800 px-4 py-2 bg-[#576CBC/10] rounded-md dark:text-[#576CBC] dark:bg-[#576CBC] dark:bg-opacity-10 dark:border-[#576CBC] border border-[#576CBC]"
                                          onClick={() => setOpenModalId(null)}
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          className="bg-[#576CBC] text-white px-4 py-2 rounded-md dark:text-[#fff]"
                                          onClick={() => {
                                            const courseValue =
                                              studentDetails?.student
                                                ?.learningInterest || "";
                                            const levelValue =
                                              students[0]?.level || "";
                                            handleClick(
                                              courseValue,
                                              levelValue
                                            );
                                          }}
                                        >
                                          Create Assignment
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        }
                      );
                    }
                  );
                })()}
              </tbody>
            </table>
          </div>
          {openModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-2xl font-bold mb-6 text-center">
                  Assign to Students
                </h2>

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-4">
                        <InputField
                          label="Title"
                          value={adminTitle}
                          onChange={setAdminTitle}
                          placeholder="Enter assignment title"
                        />

                        <div className="flex gap-4">
                          <InputField
                            label="Assigned Date"
                            type="date"
                            value={adminAssignedDate}
                            onChange={setAdminAssignedDate}
                          />
                          <InputField
                            label="Due Date"
                            type="date"
                            value={adminDueDate}
                            onChange={setAdminDueDate}
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1 text-gray-800 dark:text-gray-300">
                            Comment
                          </label>
                          <textarea
                            value={adminComment}
                            onChange={(e) => setAdminComment(e.target.value)}
                            className="w-full p-3 rounded-lg text-[13px] bg-gray-100 dark:bg-[#2d2d2d] border border-gray-300 dark:border-gray-700 resize-none h-24"
                            placeholder="Write your comment here..."
                          />
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          onClick={handleAdminClose}
                          className="px-4 py-1 rounded-md border border-gray-400 dark:border-[#576CBC] text-[#576CBC] dark:bg-[#576CBC]/10 hover:bg-gray-100 dark:hover:bg-[#576CBC]/20 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => setStep(2)}
                          className="px-4 py-1 rounded-md bg-[#576CBC] text-white hover:bg-[#475aa1] transition"
                        >
                          Next
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                        {adminAssignmentList.map((assignment) => (
                          <div
                            key={assignment.assignmentId}
                            className={`flex items-center justify-between p-4 rounded-lg border dark:border-gray-700 transition ${
                              selectedAssignments.includes(
                                assignment.assignmentId
                              )
                                ? "bg-green-100 dark:bg-green-900"
                                : "bg-white dark:bg-[#262626]"
                            }`}
                          >
                            <div>
                              <p className="font-medium">
                                {assignment.assignmentName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Questions: {assignment.questionCount}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                toggleAssignment(assignment.assignmentId)
                              }
                              className="text-sm font-semibold text-red-500 hover:opacity-80"
                            >
                              {selectedAssignments.includes(
                                assignment.assignmentId
                              )
                                ? "Remove"
                                : "Add"}
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex justify-between gap-3">
                        <button
                          onClick={() => setStep(1)}
                          className="px-4 py-2 rounded-lg border text-[#576CBC] dark:border-[#576CBC] dark:bg-[#576CBC]/10 hover:bg-gray-100 dark:hover:bg-[#576CBC]/20 transition"
                        >
                          Back
                        </button>
                        <button
                          onClick={() =>
                            handleSaveAssignment({
                              adminTitle,
                              adminAssignedDate,
                              adminDueDate,
                              adminComment,
                              selectedAssignments,
                            })
                          }
                          className="px-4 py-2 rounded-lg bg-[#576CBC] text-white hover:bg-[#475aa1] transition"
                        >
                          Save
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
          {success && (
            <SuccessPopup onClose={() => setSucces(false)} title="Assignment" />
          )}
          {failed && (
            <FailedPopup
              onClose={() => setFailed(false)}
              title={failedMessage}
            />
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(displayList.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};
const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) => (
  <div className="flex-1">
    <label className="block text-sm mb-1 text-gray-800 dark:text-gray-300">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg text-[13px] bg-gray-100 dark:bg-[#2d2d2d] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
    />
  </div>
);

export default GroupStudents;
