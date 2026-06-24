"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import BaseLayout3 from "@/app/(tenant)/modules/users/supervisor/components/BaseLayout3";
import SupervisorHeader from "../../components/supervisorHeader";
import Pagination from "@/components/Pagination";
import { MdTune } from "react-icons/md";
import { getSocket } from "@/app/utils/socket";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

 interface IProfessionalExperience {
  jobRole: string;
  organizationName: string;
  jobLocation: string;
  fromDate: string | null;
  toDate: string | null;
  jobDescription: string;
  _id: string;
}

 interface ICandidateApplication {
  _id: string;
  candidateFirstName: string;
  candidateLastName: string;
  supervisor: {
    supervisorId: string;
    supervisorName: string;
    supervisorEmail: string;
    supervisorRole: string;
  };
  gender: string;
  applicationDate: string; // ISO date string
  candidateEmail: string;
  candidatePhoneNumber: number;
  candidateCountry: string;
  candidateCity: string;
  positionApplied: string;
  currency: string;
  expectedSalary: number;
  preferedWorkingHours: string;
  comments: string;
  applicationStatus: string;
  overallRating: number;
  professionalExperience: IProfessionalExperience[];
  skills: string;
  status: string;
  createdDate: string; // ISO date string
  createdBy: string;
  __v: number;
}


const items = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
}));

const ManageTeacher: React.FC = () => {
  const router = useRouter();
  const [teachers, setTeachers] = useState<ICandidateApplication[]>([]);  
  // Active filters (applied)
  const [filterName, setFilterName] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  
  // Temporary filters (for input)
  const [tempFilterName, setTempFilterName] = useState("");
  const [tempFilterLevel, setTempFilterLevel] = useState("");
  const [tempFilterCourse, setTempFilterCourse] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [searchQuery, setSearchQuery] = useState("");

  // Filter teachers based on both search query and filters
  const filteredTeachers = teachers.filter((teacher) => {
    // Search query filtering
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${teacher.candidateFirstName} ${teacher.candidateLastName}`.toLowerCase();
    const nameMatch = fullName.includes(searchLower);
    const levelMatch = teacher.overallRating?.toString().includes(searchLower);
    const courseMatch = teacher.positionApplied?.toLowerCase().includes(searchLower);
    const searchMatch = nameMatch || levelMatch || courseMatch;

    // Filter criteria
    const filterNameMatch = !filterName || 
      fullName.includes(filterName.toLowerCase());
    const filterLevelMatch = !filterLevel || 
      teacher.overallRating?.toString() === filterLevel;
    const filterCourseMatch = !filterCourse || 
      teacher.positionApplied?.toLowerCase() === filterCourse.toLowerCase();

    // Combine both search and filter results
    return searchMatch && filterNameMatch && filterLevelMatch && filterCourseMatch;
  });

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplicants = filteredTeachers.slice(startIndex, endIndex);

  // Reset filters
  const handleResetFilters = () => {
    setFilterName("");
    setFilterLevel("");
    setFilterCourse("");
    setTempFilterName("");
    setTempFilterLevel("");
    setTempFilterCourse("");
    setFilter(false);
  };

  // Apply filters
  const handleApplyFilters = () => {
    setFilterName(tempFilterName);
    setFilterLevel(tempFilterLevel);
    setFilterCourse(tempFilterCourse);
    setCurrentPage(1); // Reset to first page when applying filters
    setFilter(false);
  };

  // Initialize temp filters when opening filter modal
  const handleOpenFilter = () => {
    setTempFilterName(filterName);
    setTempFilterLevel(filterLevel);
    setTempFilterCourse(filterCourse);
    setFilter(true);
  };

  const [Filter, setFilter] = useState(false);
  useEffect(()=>{
    const userId = typeof window != 'undefined' ? localStorage.getItem('SupervisorPortalId') : null;
     const socket = getSocket(userId ?? '');
     const handleList = ({ data }: { data: ICandidateApplication }) =>{
       console.log("📩 Received WebSocket Data:", data);
       setTeachers(pre => [...pre, data]);
     };
     socket.on('supervisorteacherlist',handleList);
    return () =>{
      socket.off('supervisorteacherlist',handleList);
    }
  },[]);
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("SupervisorAuthToken")
            : null;

        if (!token) {
          console.error("❌ SupervisorAuthToken not found");
          return;
        }
        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.APPLICANTS.GET_LIST}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "appliation/json",
            },
          }
        );
        if (!response.ok) {
  throw new Error(`Failed to fetch teachers (${response.status})`);
}

const data = await response.json();

        console.log("Fetched data:", data);

       if (data && Array.isArray(data.applicants)) {
  const approvedApplicants = data.applicants.filter(
    (applicant : ICandidateApplication) => applicant.applicationStatus === "APPROVED"
  );
  console.log(approvedApplicants);
  setTeachers(approvedApplicants);
} else {
  console.error("Unexpected API response structure:", data);
}

      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };


    fetchTeachers();
  }, []);
 

  const handleViewTeacherSchedule = (teacherId: string) => {
    if (!teacherId) {
      console.error("Teacher ID is undefined.");
      return;
    }
    localStorage.setItem("supervisormanageTeacherId", teacherId);
    console.log("Teacher ID:", teacherId); // Debugging
    router.push(`/modules/users/supervisor/ui/teacherDetails?teacherId=${teacherId}`);
  };

 
  return (
    <BaseLayout3>
      <SupervisorHeader currentSection="Teacher's List" />
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1">
          {/* Cards */}
          <div className="w-full h-[605px] shadow bg-[#FAFAFB] rounded-lg dark:bg-[#343434] dark:text-[#dedede]">
            <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434] h-10">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-transparent outline-none text-[15px] w-52 py-3"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="relative ">
                {/* Filter Button: Tune + Filter Left, Arrow Right */}
                <button
                  className="flex items-center gap-2 text-sm text-gray-400 border-[#f5f5f5] dark:border-[#3b3b3b] mt-2 py-[13px] border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
                  onClick={handleOpenFilter}
                >
                  {/* <BsFilterLeft /> */}
                  <MdTune className="w-4 h-4" />
                  <span>Filter</span>
                </button>

                {/* Filter Popup */}
                {Filter && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-[350px] relative dark:bg-[#252525]">
                      {/* Close Icon */}
                      <button
                        className="absolute top-2 right-3 text-gray-400 text-xl"
                        onClick={() => setFilter(false)}
                      >
                        &times;
                      </button>

                      <h2 className="text-lg font-semibold mb-4">Filter by</h2>

                      {/* Position Applied */}
                      <div className="mb-4">
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium mb-1"
                        >
                          Name
                        </label>
                        <div>
                          <input
                            type="text"
                            value={tempFilterName}
                            onChange={(e) => setTempFilterName(e.target.value)}
                            placeholder="Search by teacher name"
                            className="w-full border rounded-md p-2 text-[12px] dark:bg-[#343434] dark:text-[#D6D6D6] dark:border-[#565656]"
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="level"
                          className="block text-sm font-medium mb-1"
                        >
                          Level
                        </label>
                        <select 
                          value={tempFilterLevel}
                          onChange={(e) => setTempFilterLevel(e.target.value)}
                          className="w-full border rounded-md p-2 text-[12px] dark:bg-[#343434] dark:text-[#D6D6D6] dark:border-[#565656]"
                        >
                          <option value="">All Levels</option>
                          <option value="1">Level 1</option>
                          <option value="2">Level 2</option>
                          <option value="3">Level 3</option>
                          <option value="4">Level 4</option>
                          <option value="5">Level 5</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="position"
                          className="block text-sm font-medium mb-1"
                        >
                          Course
                        </label>
                        <select 
                          value={tempFilterCourse}
                          onChange={(e) => setTempFilterCourse(e.target.value)}
                          className="w-full border rounded-md p-2 text-[12px] dark:bg-[#343434] dark:text-[#D6D6D6] dark:border-[#565656]"
                        >
                          <option value="">All Courses</option>
                          <option value="Quran Teacher">Quran Teacher</option>
                          <option value="Arabic Teacher">Arabic Teacher</option>
                          <option value="Islamic Teacher">Islamic Teacher</option>
                        </select>
                      </div>
                      {/* Buttons */}
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={handleResetFilters}
                          className="px-4 py-1 rounded-md border border-[#576CBC] text-[#576CBC] font-medium"
                        >
                          Reset
                        </button>
                        <button 
                          onClick={handleApplyFilters}
                          className="px-4 py-1 rounded-md bg-[#576CBC] text-white font-medium"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                <span className="text-left -ml-60 ">
                  Showing {currentApplicants.length} Of {filteredTeachers.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-2 gap-x-4 p-3 px-4 bg-[#f5f5f5] dark:bg-[#3b3b3b] w-[180] h-[260px] ">
              {currentApplicants.map((teacher: ICandidateApplication) => (
                <div
                  key={teacher._id}
                  className="bg-white dark:bg-[#343434] h-[260px] shadow-md rounded-lg p-4"
                >
                  <div className="items-center">
                    <div className="h-[126px] rounded-md bg-[#e8e8e8] dark:bg-[#dadada] flex items-center justify-center">
                      <Image
                        src={"/assets/images/profilebg.png"}
                        alt="Teacher"
                        className="rounded-md"
                        width={160}
                        height={160}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <h3 className="text-[12px] font-semibold text-[#010e30] dark:text-[#fff] mb-1">
                      {teacher.candidateFirstName} {teacher.candidateLastName}
                    </h3>
                    <p className="text-[#717579] text-[10px] dark:text-[#fff]">
                      Level: {teacher.overallRating}
                    </p>
                    <p className="text-[#717579] text-[10px] dark:text-[#fff]">
                      {teacher.positionApplied} 
                    </p>
                    <div className="flex justify-center">
                      <FaStar className="text-[#faab3c] text-[10px]" />
                      <FaStar className="text-[#faab3c] text-[10px] mx-1" />
                      <FaStar className="text-[#faab3c] text-[10px]" />
                      <FaStar className="text-gray-300 text-[10px] mx-1" />
                      <FaStar className="text-gray-300 text-[10px]" />
                    </div>
                    <button
                      className="mt-[8px] text-[11px] bg-[#576cbc] text-[#fff] px-4 py-1 rounded-lg w-full h-[27px]"
                      onClick={() => handleViewTeacherSchedule(teacher._id)}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
        </div>
      </div>

    
    </BaseLayout3>
  );
};

export default ManageTeacher;

