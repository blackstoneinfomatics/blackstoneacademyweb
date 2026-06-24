"use client";

import { useEffect, useState } from "react";
import { MoreVertical, Search } from "lucide-react";
import BaseLayout1 from "@/app/(tenant)/modules/users/Academic-coach/components/BaseLayout1";
import { MdTune } from "react-icons/md";
import Pagination from "@/components/Pagination";
import { useRouter } from "next/navigation";
import AcademicHeader from "../../components/academicHeader";
import Modal from "react-modal";
import { getSocket } from "@/app/utils/socket";
import Swal from "sweetalert2";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

export interface Student {
  _id: string;
  teacherName: string;
  sessionClassType: string;
  username: string;
  password: string;
  role: string;
  status: string;
  createdDate: string | number | Date;
  createdBy: string;
  updatedDate: string | number | Date;
  __v: number;
  classScheduleCount: number;
  level: string;
  student: {
    studentId: string;
    studentEmail: string;
    studentPhone: string | number;
    course: string;
    package: string;
    city: string;
    country: string;
    gender: string;
  };
  evaluation?: Evaluation[];
}

export interface Evaluation {
  _id: string;
  academicCoachId: string;
  student: EvaluationStudent;
  classType: string;
  teacher: {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
  };
  joiningDate: string | number | Date;
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
  subscription: {
    subscriptionName: string;
  };
  planTotalPrice: number;
  classStartDate: string | number | Date;
  classEndDate: string | number | Date;
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
  amount: string;
  currency: string;
  status: string;
  createdDate: string | number | Date;
  createdBy: string;
  updatedDate: string | number | Date;
  updatedBy: string;
  expectedFinishingDate: number;
  assignedTeacherId: string;
  assignedTeacherEmail: string;
  __v: number;
}

export interface EvaluationStudent {
  studentId: string;
  studentRegisterId: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentGender: string;
  studentPhone: string | number;
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
  preferredDate: string | number | Date;
  evaluationStatus: string;
  status: string;
  createdDate: string | number | Date;
  createdBy: string;
}

export interface Users {
  totalCount: number;
  students: Student[];
}

const ManageStudents = () => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [studentData, setStudentData] = useState<Users>({
    totalCount: 0,
    students: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<Student[] | null>(null);
  const [totalPackages, setTotalPackages] = useState<string>("");
  const [totalCourses, setTotalCourses] = useState<string>("");
  const [totalHours, setTotalHours] = useState<number>(0);
  const router = useRouter();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(studentData.students.length / itemsPerPage);
  const studentsToRender = filteredUsers ? filteredUsers : studentData.students;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = studentsToRender.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  useEffect(() => {
    const fetchData = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AcademicCoachAuthToken")
          : null;
       const acId = typeof window !== "undefined" ? localStorage.getItem("AcademicCoachPortalId") : null;   

      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return;
      }
      const params = {
    academicCoachId: acId,
};
      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.GET}`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.data;
      setStudentData(data);
      setCurrentPage(1);
    };

    fetchData();
  }, []);
  useEffect(() => {
    if (selectedStudents.length === 0) {
      setTotalPackages("");
      setTotalCourses("");
      setTotalHours(0);
      return;
    }

    const first = selectedStudents[0];

    const allSame = selectedStudents.every((s) => {
      const firstEval = first?.evaluation?.[0];
      const evalData = s?.evaluation?.[0];

      return (
        s?.student?.course === first?.student?.course &&
        s?.student?.package === first?.student?.package &&
        evalData?.accomplishmentTime === firstEval?.accomplishmentTime
      );
    });

    if (!allSame) {
      Swal.fire({
        icon: "warning",
        title: "Mismatch Detected ⚠️",
        text: "All selected students must have the same course, package, and accomplishment time.",
        confirmButtonColor: "#576cbc",
      });

      setTotalPackages("");
      setTotalCourses("");
      setTotalHours(0);
    } else {
      setTotalPackages(first?.student?.package || "");
      setTotalCourses(first?.student?.course || "");

      const accomplishmentHours =
        Number(first?.evaluation?.[0]?.hours) || 0;

      setTotalHours(accomplishmentHours);
      console.log("✅ All matched, totals set.");
      console.log("Package:", first?.student?.package);
      console.log("Course:", first?.student?.course);
      console.log("Hours:", accomplishmentHours);
    }
  }, [selectedStudents]);
  useEffect(() => {
    const academicId =
      typeof window !== "undefined"
        ? localStorage.getItem("AcademicCoachPortalId")
        : null;
    if (!academicId) return;
    const socket = getSocket(academicId);
    const handleList = (data: { data: Student; sender: string }) => {
      console.log("web socket");
      setStudentData((prev) => ({
        totalCount: prev.totalCount + 1,
        students: [...prev.students, data.data],
      }));
    };

    socket.on("academicStudentProfile", handleList);
    return () => {
      socket.off("academicStudentProfile", handleList);
    };
  }, []);

  const toggleSelect = (index: number) => {
    const student = studentsToRender[index];
    if (student.sessionClassType === "REGULAR") return; // Prevent selection for REGULAR class type
    setSelectedRows((prev) => {
      let newSelectedRows;
      if (prev.includes(index)) {
        newSelectedRows = prev.filter((i) => i !== index);
      } else {
        newSelectedRows = [...prev, index];
      }
      const newSelectedStudents = newSelectedRows.map(
        (i) => studentsToRender[i]
      );
      setSelectedStudents(newSelectedStudents);
      return newSelectedRows;
    });
  };

  const toggleSelectAll = () => {
    const selectableIndices = studentsToRender
      .map((student, idx) =>
        student.sessionClassType !== "REGULAR" ? idx : null
      )
      .filter((idx) => idx !== null) as number[];
    if (selectedRows.length === selectableIndices.length) {
      setSelectedRows([]);
      setSelectedStudents([]);
    } else {
      setSelectedRows(selectableIndices);
      setSelectedStudents(selectableIndices.map((i) => studentsToRender[i]));
    }
  };

  const handleSyncClick = (_id: string) => {
    setOpenMenuId((prev) => (prev === _id ? null : _id));
  };

  const handleViewDetails = (_id: string) => {
    localStorage.setItem("studentManageID", _id);
    router.push(`/modules/users/Academic-coach/ui/managestudentview?id=${_id}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const q = query.trim().toLowerCase();
    if (!q) {
      setFilteredUsers(null);
      setCurrentPage(1);
      return;
    }

    const filtered = studentData.students.filter((item) => {
      const studentId = (item.student?.studentId ?? "").toString().toLowerCase();
      const datePretty = new Date(item.createdDate)
        .toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
        .toLowerCase();
      const fullName = (item.username ?? "").toLowerCase();
      const teacherEval = (item.evaluation?.[0]?.teacher?.teacherName ?? "").toLowerCase();
      const teacherTop = (item.teacherName ?? "").toLowerCase();
      const teacher = teacherEval || teacherTop;
      const classTypeEval = (item.evaluation?.[0]?.classType ?? "").toLowerCase();
      const classTypeTop = (item.sessionClassType ?? "").toLowerCase();
      const classType = classTypeEval || classTypeTop;
      const contact = (item.student?.studentPhone ?? "").toString().toLowerCase();
      const classCount = (item.classScheduleCount ?? "").toString().toLowerCase();
      const level = (item.level ?? "").toLowerCase();

      return (
        studentId.includes(q) ||
        datePretty.includes(q) ||
        fullName.includes(q) ||
        teacher.includes(q) ||
        classType.includes(q) ||
        contact.includes(q) ||
        classCount.includes(q) ||
        level.includes(q)
      );
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
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
      studentName: string;
      studentID: string;
      Date: string;
      TeacherName: string;
      contact: string;
      scheduledClasses: string;
      level: string;
      Time: string;
      classType: string;
      status: string;
    }) => void;
    users: Student[];
  }) => {
    const [filters, setFilters] = useState({
      studentName: "",
      studentID: "",
      Date: "",
      TeacherName: "",
      contact: "",
      scheduledClasses: "",
      level: "",
      Time: "",
      classType: "",
      status: "",
    });

    const handleApply = () => {
      onApplyFilters(filters);
      onClose();
    };

    const handleReset = () => {
      setFilters({
        studentName: "",
        studentID: "",
        Date: "",
        TeacherName: "",
        contact: "",
        scheduledClasses: "",
        level: "",
        Time: "",
        classType: "",
        status: "",
      });
    };

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  p-8 rounded-lg  w-[500px]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="fixed inset-0 bg-opacity-40 flex justify-center items-center">
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
              
              <div>
                <label
                  htmlFor="studentId"
                  className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]"
                >
                  Student ID
                </label>
                <input
                  value={filters.studentID}
                  onChange={(e) =>
                    setFilters({ ...filters, studentID: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded text-xs dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="studentname"
                  className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]"
                >
                  Student Name
                </label>
                <input
                  type="text"
                  value={filters.studentName}
                  onChange={(e) =>
                    setFilters({ ...filters, studentName: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded text-xs dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="date"
                  className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]"
                >
                  Date
                </label>
                <input
                  type="date"
                  value={filters.Date}
                  onChange={(e) =>
                    setFilters({ ...filters, Date: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded text-xs dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white dark:[color-scheme:dark]"
                />
              </div>
              <div>
                <label
                  htmlFor="Time"
                  className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]"
                >
                  Time
                </label>
                <input
                  type="time"
                  value={filters.Time}
                  onChange={(e) =>
                    setFilters({ ...filters, Time: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded text-xs dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white dark:[color-scheme:dark]"
                />
              </div>
              <div>
                <label
                  htmlFor="classtype"
                  className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]"
                >
                  Class Type
                </label>
                <select
                  value={filters.classType}
                  onChange={(e) =>
                    setFilters({ ...filters, classType: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded text-xs dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white"
                >
                  <option value="">Select Class Type</option>
                  <option value="REGULAR">Regular Class</option>
                  <option value="GROUP">Group Class</option>
                  <option value="TRAIL">Trial Class</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="stauts"
                  className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]"
                >
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded text-xs dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-white"
                >
                  <option value="">Select Status</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="RESCHEDULED">Rescheduled</option>
                </select>
              </div>
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

  const handleApplyFilters = (filters: {
    studentName: string;
    studentID: string;
    Date: string;
    TeacherName: string;
    contact: string;
    scheduledClasses: string;
    level: string;
    Time: string;
    classType: string;
    status: string;
  }) => {
    const formatDate = (date: Date | string) =>
      new Date(date).toISOString().split("T")[0];

    let filtered = [...studentData.students];

    if (filters.studentName) {
      filtered = filtered.filter((user) =>
        `${user.username ?? ""}`
          .toLowerCase()
          .includes(filters.studentName.toLowerCase())
      );
    }

    if (filters.studentID) {
      filtered = filtered.filter((user) =>
        (user.student?.studentId ?? "")
          .toLowerCase()
          .includes(filters.studentID.toLowerCase())
      );
    }

    if (filters.Date) {
      filtered = filtered.filter(
        (user) => formatDate(user.createdDate as string | Date) === filters.Date
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };
  return (
    <BaseLayout1>
      <div>
        <AcademicHeader
          currentSection="Student List"
          students={selectedStudents}
          packageName={totalPackages}
          course={totalCourses}
          totalHours={totalHours}
        />

        <div className=" mx-auto">
          <div className="h-full w-full flex flex-col justify-between">
            <div className="p-0 justify-between flex flex-col">
              <div className="w-full h-[610px] bg-[#FAFAFB] rounded-lg dark:bg-[#343434] mt-2">
                <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by keyword"
                      className="bg-transparent outline-none text-[15px] w-52 py-3 "
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
                      Showing {currentItems.length} of {studentsToRender.length}
                    </span>
                  </div>
                </div>
                <table className="w-full">
                  <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0] h-[46px]">
                    <tr className="font-medium ">
                      <th className="text-left h-[46px] px-3 py-2 text-[12px] font-medium border border-[#4C6993] dark:border-[#6087C0] w-[40px]">
                        <input
                          type="checkbox"
                          checked={
                            currentItems.length > 0 &&
                            currentItems.every((_, i) =>
                              selectedRows.includes(indexOfFirstItem + i)
                            )
                          }
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded-3xl"
                        />
                      </th>
                      <th className="text-left px-3 py-2 text-[12px] font-medium border border-[#4C6993] dark:border-[#6087C0] w-[130px]">
                        Student ID
                      </th>
                      <th className="text-left px-3 py-2 text-[12px] font-medium border border-[#4C6993] dark:border-[#6087C0] w-[140px]">
                        Date of Joining
                      </th>
                      <th className="text-left px-3 py-2 text-[12px] font-medium border border-[#4C6993] dark:border-[#6087C0] w-[180px]">
                        Student Name
                      </th>
                      <th className="text-left px-3 py-2 text-[12px] font-medium border border-[#4C6993] dark:border-[#6087C0] w-[180px]">
                        Teacher Name
                      </th>
                      <th className="text-left px-3 py-2 text-[12px] font-medium border border-[#4C6993] dark:border-[#6087C0] w-[140px]">
                        Course
                      </th>
                      <th className="text-left px-3 py-2 text-[12px] font-medium border border-[#4C6993] dark:border-[#6087C0] w-[140px]">
                        Package
                      </th>
                      <th className="text-left px-3 py-2 text-[12px] font-medium border border-[#4C6993] dark:border-[#6087C0] w-[140px]">
                        Class Type
                      </th>
                      <th className="text-left px-3 py-2 text-[12px] font-medium border border-[#4C6993] dark:border-[#6087C0] w-[140px]">
                        Contact
                      </th>
                      <th className="text-left px-3 py-2 text-[12px] font-medium border border-[#4C6993] dark:border-[#6087C0] w-[100px]">
                        Scheduled Classes
                      </th>
                      <th className="text-left px-3 py-2 text-[12px] font-medium border border-[#4C6993] dark:border-[#6087C0] w-[80px]">
                        Level
                      </th>
                      <th className="text-left px-3 py-2 text-[12px] font-medium border border-[#4C6993] dark:border-[#6087C0] w-[60px]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentItems.map((item, index) => (
                      <tr
                        key={`${item._id}-${index}`}
                        className={`text-[12px] h-[50px]  ${index % 2 === 0
                            ? "bg-[#fff] dark:bg-[#2C2C2C]"
                            : "bg-[#F8F8F8] dark:bg-[#303030]"
                          }`}
                      >
                        <td className="px-3 py-2 w-[40px]">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(
                              index + indexOfFirstItem
                            )}
                            onChange={() =>
                              toggleSelect(index + indexOfFirstItem)
                            }
                            disabled={item.sessionClassType === "REGULARCLASS"}
                            className={`accent-[#4C6993] ${item.sessionClassType === "REGULARCLASS"
                                ? "cursor-not-allowed"
                                : ""
                              }`}
                          />
                        </td>

                        <td className="px-3 py-2">{item.student.studentId}</td>
                        <td className="px-3 py-2">
                          {new Date(item.createdDate)
                            .toLocaleDateString("en-US", {
                              month: "short",
                              day: "2-digit",
                              year: "numeric",
                            })
                            .replace(",", ",")}
                        </td>
                        <td className="px-3 py-2 text-[#3D8FDE] font-medium">
                          {(() => {
                            const val = item.username ?? "";
                            return val
                              ? `${val.charAt(0).toUpperCase()}${val.slice(1).toLowerCase()}`
                              : "";
                          })()}
                        </td>
                        <td className="px-3 py-2">
                          {(() => {
                            const val = item.evaluation?.[0]?.teacher?.teacherName;
                            return val
                              ? `${val.charAt(0).toUpperCase()}${val.slice(1).toLowerCase()}`
                              : "-";
                          })()}
                        </td>
                        <td className="px-3 py-2">
                          {(() => {
                            const val = item.evaluation?.[0]?.student?.learningInterest;
                            return val
                              ? `${val.charAt(0).toUpperCase()}${val.slice(1).toLowerCase()}`
                              : "-";
                          })()}
                        </td>
                        <td className="px-3 py-2">
                          {(() => {
                            const val = item.evaluation?.[0]?.subscription?.subscriptionName;
                            const val1 = item.evaluation?.[0]?.hours;
                            return val
                              ? `${val.charAt(0).toUpperCase()}${val.slice(1).toLowerCase()} - ${val1}hrs`
                              : "-";
                          })()}
                        </td>
                        <td className="px-3 py-2">
                          {(() => {
                            const val = item.evaluation?.[0]?.classType;
                            return val
                              ? `${val.charAt(0).toUpperCase()}${val.slice(1).toLowerCase()}`
                              : "-";
                          })()}
                        </td>
                        <td className="px-3 py-2">
                          {item.student.studentPhone}
                        </td>

                        <td className="px-3 py-2 whitespace-nowrap">
                          {item.classScheduleCount}
                        </td>
                        <td className="px-3 py-2">{item.level}</td>
                        <td className="relative px-3 py-2">
                          <button
                            className="p-1"
                            onClick={() => handleSyncClick(item._id)}
                          >
                            <MoreVertical className="w-4 h-4 text-slate-600 dark:text-[#FDFDFD]" />
                          </button>

                          {openMenuId === item._id && (
                            <div className="absolute right-0 mt-2 w-[120px] bg-white border rounded-lg shadow-md z-10 dark:bg-[#2d2d2d]">
                              <button
                                onClick={() => handleViewDetails(item._id)}
                                className="w-full text-left px-4 py-2 "
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => setOpenMenuId(null)}
                                className="w-full text-left px-4 py-2 text-red-600"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
            <FilterModal
              isOpen={isFilterModalOpen}
              onClose={() => setIsFilterModalOpen(false)}
              onApplyFilters={handleApplyFilters}
              users={studentData.students}
            />
          </div>
        </div>
      </div>
    </BaseLayout1>
  );
};

export default ManageStudents;
