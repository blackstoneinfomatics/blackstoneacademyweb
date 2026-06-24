"use client";

import { useState, useEffect } from "react";
import Modal from "react-modal";
import {
  FaSyncAlt,
  FaFilter,
  FaPlus,
  FaEdit,
  FaEllipsisV,
} from "react-icons/fa";
import BaseLayout1 from "@/app/(tenant)/modules/users/Academic-coach/components/BaseLayout1";
import AddStudentModal from "@/app/(tenant)/modules/users/Academic-coach/Academic/AddStudentModel";
import Popup from "@/app/(tenant)/modules/users/Academic-coach/Academic/Popup";
import { useRouter } from "next/navigation";
import { table } from "console";
import axios from "axios";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import Pagination from "@/components/Pagination";
import SupervisorHeader from "@/app/(tenant)/modules/users/supervisor/components/supervisorHeader";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

// Define the return type of the getAllUsers function
interface User {
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
  city?: string;
  students?: number;
  comment?: string;
}

interface GetAllUsersResponse {
  success: boolean;
  data: User[];
  message?: string; // Make message optional
}

// Update the getAllUsers function to fetch from your API
const getAllUsers = async (): Promise<GetAllUsersResponse> => {
  try {
    const academicId = localStorage.getItem("AcademicCoachPortalId");
    console.log("academicId>>", academicId);
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AcademicCoachAuthToken")
        : null;

    if (!token) {
      console.error("❌ AdminAuthToken not found");
    }
    const response = await axios.get(
      `{AppApiEndpoints.API_END_POINT}${AppApiEndpoints.STUDENT.GET_LIST}`,
      {
        params: { academicCoachId: academicId },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("response>>>", response);

    // const rawData = JSON.stringify(response.data);
    // console.log('Raw API Response:', rawData); // Debug log
    // Check if rawData.students exists and is an array
    if (!response.data.students || !Array.isArray(response.data.students)) {
      throw new Error("Invalid data structure received from API");
    }

    // Transform API data to match User interface
    const transformedData = response.data.students.map(
      (item: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        country: string;
        learningInterest: string;
        preferredTeacher: string;
        startDate: string;
        preferredFromTime: string;
        preferredToTime: string;
        evaluationStatus?: string;
      }) => ({
        studentId: item._id,
        fname: item.firstName,
        lname: item.lastName,
        email: item.email,
        number: item.phoneNumber.toString(),
        country: item.country,
        course: item.learningInterest,
        preferredTeacher: item.preferredTeacher,
        date: new Date(item.startDate).toLocaleDateString(),
        time: item.preferredFromTime,
        evaluationStatus: item.evaluationStatus,
      })
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
      evaluationStatus: "",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-100 border border-gray-300 p-8 rounded-lg shadow-lg w-[500px]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
   <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
  <div className="bg-white p-6 rounded-lg w-[320px] relative dark:bg-[#252525]">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Filter by</h2>
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
        <label htmlFor="country" className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Country</label>
        <select
          className="w-full px-3 py-2 border rounded text-sm text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
          value={filters.country}
          onChange={(e) => setFilters({ ...filters, country: e.target.value })}
        >
          <option value="">Select Country</option>
          {uniqueCountries.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>

      {/* Course */}
      <div>
        <label htmlFor="course" className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Course</label>
        <select
          className="w-full px-3 py-2 border rounded text-sm text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
          value={filters.course}
          onChange={(e) => setFilters({ ...filters, course: e.target.value })}
        >
          <option value="">Select Courses</option>
          {uniqueCourses.map((course) => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
      </div>

      {/* Teacher */}
      <div>
        <label htmlFor="teachers" className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Teachers</label>
        <select
          className="w-full px-3 py-2 border rounded text-sm text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
          value={filters.teacher}
          onChange={(e) => setFilters({ ...filters, teacher: e.target.value })}
        >
          <option value="">Select Teachers</option>
          {uniqueTeachers.map((teacher) => (
            <option key={teacher} value={teacher}>{teacher}</option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="text-sm font-medium mb-1 block dark:text-[#D6D6D6]">Status</label>
        <select
          className="w-full px-3 py-2 border rounded text-sm text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
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
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={handleReset}
          className="w-[45%] py-2 border border-[#576CBC] text-[#576CBC] rounded-md text-sm font-medium hover:bg-blue-50"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="w-[50%] py-2 bg-[#576CBC] text-white rounded-md text-sm font-medium"
        >
          Show {
            users.filter((user) => {
              return (
                (!filters.country || user.country === filters.country) &&
                (!filters.course || user.course === filters.course) &&
                (!filters.teacher || user.preferredTeacher === filters.teacher) &&
                (!filters.status || user.evaluationStatus === filters.status) &&
                (!filters.trailId || user.studentId.includes(filters.trailId)) &&
                (!filters.studentName ||
                  `${user.fname} ${user.lname}`.toLowerCase().includes(filters.studentName.toLowerCase())) &&
                (!filters.email || user.email.toLowerCase().includes(filters.email.toLowerCase())) &&
                (!filters.mobile || user.number.includes(filters.mobile)) &&
                (!filters.time || user.time.includes(filters.time)) &&
                (!filters.evaluationStatus || user.evaluationStatus === filters.evaluationStatus)
              );
            }).length
          } results
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

  const openModal = (user: User | null = null) => {
    setIsEditMode(!!user);
    setIsModalOpen(true);
    setModalIsOpen(true);
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
        setUsers(allData.data);
      } else {
        setErrorMessage(allData.message ?? "Failed to fetch users");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred");
      console.error("An unexpected error occurred", error);
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
        (user) => user.preferredTeacher === filters.teacher
      );
    }
    if (filters.status) {
      filtered = filtered.filter(
        (user) => user.evaluationStatus === filters.status
      );
    }
    if (filters.trailId) {
      filtered = filtered.filter((user) =>
        user.studentId.includes(filters.trailId)
      );
    }
    if (filters.studentName) {
      filtered = filtered.filter((user) =>
        `${user.fname} ${user.lname}`
          .toLowerCase()
          .includes(filters.studentName.toLowerCase())
      );
    }
    if (filters.email) {
      filtered = filtered.filter((user) =>
        user.email.toLowerCase().includes(filters.email.toLowerCase())
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
      <BaseLayout1>
        <div className="min-h-screen p-2">{errorMessage}</div>
      </BaseLayout1>
    );
  }

  // Pagination logic: calculate currentItems based on filteredUsers, currentPage, and itemsPerPage
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <BaseLayout1>
      <div className="">
        <SupervisorHeader currentSection="Applicants" />
        <div className="md:p-0 mx-auto mb-8">
          <div className="h-full w-full  flex flex-col justify-between">
            <div className="p-0 justify-between flex flex-col">
              <div className="w-full h-[588px] bg-[#FAFAFB] rounded-lg dark:bg-[#343434]">
                <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search"
                      className="bg-transparent outline-none text-[15px] w-52 py-3"
                      // value={searchText}
                      // onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>

                  <div
                    className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
                    onClick={() => setIsFilterModalOpen(true)}
                  >
                    <MdTune className="w-4 h-4" />
                    <span>Filter</span>
                  </div>
                  {/* Modal */}
                  {/* FilterModal is rendered below, so no need for inline modal JSX here */}
                  <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                    <span className="text-left -ml-60 ">
                      Showing {currentItems.length} of {users.length}
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full table-fixed">
                    <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                      <tr>
                        {[
                          { label: "Trial ID" },
                          { label: "Student Name" },
                          { label: "Email" },
                          { label: "Mobile" },
                          { label: "Country" },
                          { label: "Course" },
                          { label: "Preferred Teacher" },
                          { label: "Time" },
                          { label: "Evaluation Status" },
                          { label: "Status" },
                          { label: "Action" },
                        ].map((header, index) => (
                          <th
                            key={header.label}
                            className="px-3 py-2 text-left font-medium border border-[#4C6993] dark:border-[#6087C0] break-words"
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
                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] break-words">
                              {item.studentId}
                            </td>
                            <td className="px-5 py-2 text-[#3D8FDE] font-medium text-left text-[11px] break-words">
                              {item.fname} {item.lname}
                            </td>
                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] break-words ">
                              {item.email}
                            </td>
                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px] whitespace-nowrap">
                              {item.number}
                            </td>
                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px]">
                              {item.country}
                            </td>
                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px]">
                              {item.course}
                            </td>
                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px]">
                              {item.preferredTeacher}
                            </td>
                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px]">
                              {item.time}
                            </td>
                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px]">
                              <span
                                className={`text-[8px] text-center py-1 rounded-lg ${
                                  item.evaluationStatus === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800 border border-yellow-900 px-3"
                                    : "bg-green-100 text-green-800 border border-green-900 px-2"
                                }`}
                              >
                                {item.evaluationStatus ?? "PENDING"}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[12px]">
                              <span
                                className={`px-2 text-[8px] text-center py-1 rounded-lg ${
                                  item.status === "Active"
                                    ? "bg-yellow-100 text-yellow-800 border border-yellow-900"
                                    : "bg-green-100 text-green-800 border border-green-900"
                                }`}
                              >
                                {item.status ?? "Active"}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-[#010E30E5] dark:text-[#FDFDFD] text-[11px]">
                              <button
                                onClick={() => handleEditClick(item)}
                                className=" hover:cursor-pointer text-center text-white p-2 color-black"
                              >
                                <FaEllipsisV
                                  size={14}
                                  className="text-[#5F6368]"
                                />{" "}
                              </button>
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

              
            </div>
          </div>
        </div>
        {/* Pagination */}

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
               
              />
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
                city: selectedUserData.city ?? "", // Provide a default value for city if undefined
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
      <AddStudentModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        isEditMode={isEditMode}
        onSave={() => {
          fetchStudents();
          closeModal();
        }}
      />
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        users={users}
      />
    </BaseLayout1>
  );
};

export default TrailManagement;
