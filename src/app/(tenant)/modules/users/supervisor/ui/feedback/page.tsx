
"use client";

import React, { useEffect, useState } from "react";
import BaseLayout3 from "@/app/(tenant)/modules/users/supervisor/components/BaseLayout3";
import SupervisorHeader from "../../components/supervisorHeader";
import { FaStar } from "react-icons/fa";
import { Search } from "lucide-react";
import Pagination from "@/components/Pagination"; 
import { MdTune } from "react-icons/md";
import axios from "axios";
import { IoPersonOutline } from "react-icons/io5";
import { AiOutlineMenuUnfold } from "react-icons/ai";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface FlattenedFeedbackItem {
  _id: string;
  Review: string;
  Teacher: string;
  class: string;
  Feedback: string;
  level: number;
  studentId: string;
  teacherId: string;
  studentFirstName: string;
  studentLastName: string;
  teacherName: string;
  courseName: string;
  feedbackmessage: string;
  studentsRating?: StudentsRating;
  teacherRatings?: TeacherRatings;
  classDay: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  createdDate: string;
}

interface Student {
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
}

interface Teacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
}

interface Course {
  courseId: string;
  courseName: string;
}

interface StudentsRating {
  classUnderstanding: number;
  engagement: number;
  homeworkCompletion: number;
}

interface TeacherRatings {
  listeningAbility: number;
  readingAbility: number;
  overallPerformance: number;
}

interface RawFeedbackItem {
  _id: string;
  student: Student;
  teacher: Teacher;
  course: Course;
  studentsRating?: StudentsRating;
  teacherRatings?: TeacherRatings;
  classDay: string;
  preferedTeacher?: string;
  sessionId?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  feedbackmessage: string;
  createdDate: string;
  createdBy: string;
  lastUpdatedDate: string;
  lastUpdatedBy: string;
}

interface GroupedFeedback {
  studentId: string;
  teacherId: string;
  studentName: string;
  teacherName: string;
  className: string;
  date:string;
  time:string;
  feedbacks: FlattenedFeedbackItem[];
  averageRating: number;
  totalFeedbacks: number;
}

const FeedbackDetails: React.FC = () => {
  const [groupedFeedbacks, setGroupedFeedbacks] = useState<GroupedFeedback[]>([]);
  const [allFeedbacks, setAllFeedbacks] = useState<FlattenedFeedbackItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState<GroupedFeedback | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [tempCourse, setTempCourse] = useState("");
  const [openFeedbackDropdownId, setOpenFeedbackDropdownId] = useState<string | null>(null);

  // 🔹 UPDATED: Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCourse, searchQuery]);

  const toggleFeedbackDropdown = (id: string) => {
    setOpenFeedbackDropdownId((prev) => (prev === id ? null : id));
  };

  const groupFeedbacksByStudentTeacher = (feedbacks: FlattenedFeedbackItem[]): GroupedFeedback[] => {
    const groupedMap = new Map<string, GroupedFeedback>();
    
    feedbacks.forEach(feedback => {
      const key = `${feedback.studentId}-${feedback.teacherId}`;
      
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          studentId: feedback.studentId,
          teacherId: feedback.teacherId,
          studentName: feedback.Review,
          teacherName: feedback.Teacher,
          className: feedback.class,
          date:feedback.createdDate,
          time:feedback.startTime,
          feedbacks: [],
          averageRating: 0,
          totalFeedbacks: 0
        });
      }
      
      const group = groupedMap.get(key)!;
      group.feedbacks.push(feedback);
    });
    
    return Array.from(groupedMap.values()).map(group => {
      const totalRating = group.feedbacks.reduce((sum, feedback) => sum + feedback.level, 0);
      const averageRating = group.feedbacks.length > 0 ? totalRating / group.feedbacks.length : 0;
      
      return {
        ...group,
        averageRating: Math.round(averageRating * 10) / 10,
        totalFeedbacks: group.feedbacks.length
      };
    });
  };
const resetFilters = () => {
  setSelectedCourse("");    // Clear course filter
  setSearchQuery("");       // Clear search input
  setCurrentPage(1);        // Reset pagination
};

  const calculateLevel = (item: RawFeedbackItem): number => {
    if (item.studentsRating) {
      const values = Object.values(item.studentsRating).filter(n => typeof n === "number");
      if (values.length === 0) return 0;
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return Math.min(5, Math.max(0, Math.round(avg)));
    }
    if (item.teacherRatings) {
      const values = Object.values(item.teacherRatings).filter(n => typeof n === "number");
      if (values.length === 0) return 0;
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return Math.min(5, Math.max(0, Math.round(avg)));
    }
    return 0;
  };

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("SupervisorAuthToken") : null;

        if (!token) {
          console.error("❌ SupervisorAuthToken not found");
          return;
        }

        // 🔹 UPDATED: Send courseId or empty
        const url = selectedCourse 
          ? `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.FEEBACK.SUPERVISOR_FEEDBACK}?course=${selectedCourse}`
          : `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.FEEBACK.SUPERVISOR_FEEDBACK}`;

        const response = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.data || !response.data.feedbackRecords) {
          setAllFeedbacks([]);
          return;
        }

        const feedbackArray: RawFeedbackItem[] = response.data.feedbackRecords;

        const formattedData: FlattenedFeedbackItem[] = feedbackArray.map(item => ({
          _id: item._id,
          Review: `${item.student?.studentFirstName || ''} ${item.student?.studentLastName || ''}`.trim(),
          Teacher: item.teacher?.teacherName || "Unknown",
          class: item.course?.courseName || "Unknown",
          Feedback: item.feedbackmessage || "",
          level: calculateLevel(item),
          studentId: item.student?.studentId || "",
          teacherId: item.teacher?.teacherId || "",
          studentFirstName: item.student?.studentFirstName || "",
          studentLastName: item.student?.studentLastName || "",
          teacherName: item.teacher?.teacherName || "",
          courseName: item.course?.courseName || "",
          feedbackmessage: item.feedbackmessage || "",
          studentsRating: item.studentsRating,
          teacherRatings: item.teacherRatings,
          classDay: item.classDay || "",
          startDate: item.startDate || "",
          endDate: item.endDate || "",
          startTime: item.startTime || "",
          endTime: item.endTime || "",
          createdDate: item.createdDate || ""
        }));

        setAllFeedbacks(formattedData);
        const grouped = groupFeedbacksByStudentTeacher(formattedData);
        setGroupedFeedbacks(grouped);

      } catch (error) {
        console.error("Error fetching feedback:", error);
        setAllFeedbacks([]);
      }
    };

    fetchFeedback();
  }, [selectedCourse]);

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', '');
    } catch {
      return 'Invalid date';
    }
  };

  // 🔹 UPDATED: Client-side filter fallback
  const filteredGroupedFeedbacks = groupedFeedbacks.filter((group) => {
    const searchLower = searchQuery.toLowerCase();
    const studentMatch = group.studentName.toLowerCase().includes(searchLower);
    const teacherMatch = group.teacherName.toLowerCase().includes(searchLower);
    const classMatch = group.className.toLowerCase().includes(searchLower);

    // Filter by course if selectedCourse exists
    const courseMatch = selectedCourse ? group.className === selectedCourse : true;

    return (studentMatch || teacherMatch || classMatch) && courseMatch;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredGroupedFeedbacks.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredGroupedFeedbacks.slice(indexOfFirst, indexOfLast);

  const [showModal, setShowModal] = useState(false);

  const handleDetailsClick = (group: GroupedFeedback) => {
    setSelectedGroup(group);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedGroup(null);
  };

  const calculateDetailedRatings = (feedbacks: FlattenedFeedbackItem[]) => {
    let totalClassUnderstanding = 0;
    let totalEngagement = 0;
    let totalHomeworkCompletion = 0;
    let totalListeningAbility = 0;
    let totalReadingAbility = 0;
    let totalOverallPerformance = 0;
    
    let studentRatingCount = 0;
    let teacherRatingCount = 0;

    feedbacks.forEach(feedback => {
      if (feedback.studentsRating) {
        totalClassUnderstanding += feedback.studentsRating.classUnderstanding || 0;
        totalEngagement += feedback.studentsRating.engagement || 0;
        totalHomeworkCompletion += feedback.studentsRating.homeworkCompletion || 0;
        studentRatingCount++;
      }
      
      if (feedback.teacherRatings) {
        totalListeningAbility += feedback.teacherRatings.listeningAbility || 0;
        totalReadingAbility += feedback.teacherRatings.readingAbility || 0;
        totalOverallPerformance += feedback.teacherRatings.overallPerformance || 0;
        teacherRatingCount++;
      }
    });

    return {
      classUnderstanding: studentRatingCount > 0 ? totalClassUnderstanding / studentRatingCount : 0,
      engagement: studentRatingCount > 0 ? totalEngagement / studentRatingCount : 0,
      homeworkCompletion: studentRatingCount > 0 ? totalHomeworkCompletion / studentRatingCount : 0,
      listeningAbility: teacherRatingCount > 0 ? totalListeningAbility / teacherRatingCount : 0,
      readingAbility: teacherRatingCount > 0 ? totalReadingAbility / teacherRatingCount : 0,
      overallPerformance: teacherRatingCount > 0 ? totalOverallPerformance / teacherRatingCount : 0,
    };
  };

  return (
    <BaseLayout3>
      <SupervisorHeader
        currentSection="Teachers and Students Feedback"
        showBackButton={true}
        showBackPath="/modules/users/supervisor/ui/teachers"
      />
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-3 md:space-y-0">
          <div className="flex flex-wrap gap-2 mb-0">
            {/* Add any additional controls here */}
          </div>
        </div>

        <div className="w-full h-[590px] bg-[#FAFAFB] rounded-lg dark:bg-[#343434]">
          {/* Header Search & Filter */}
          <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434] h-10">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search by Keywords"
                className="bg-transparent outline-none text-[15px] w-52 py-3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative">
              <div
                className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] mt-2 py-[13px] border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
                onClick={() => setFilterOpen(true)}
              >
                <MdTune className="w-4 h-4" />
                <span>Filter</span>
              </div>

              {filterOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                  <div className="bg-white p-6 rounded-lg w-[350px] relative dark:bg-[#252525]">
                    <button
                      className="absolute top-2 right-3 text-gray-400 text-xl"
                      onClick={() => setFilterOpen(false)}
                    >
                      &times;
                    </button>

                    <h2 className="text-lg font-semibold mb-4">Filter by</h2>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">
                        Course
                      </label>
                      <select
                        className="w-full border rounded-md p-2 text-[12px] dark:bg-[#343434] dark:text-[#D6D6D6] dark:border-[#565656]"
                        value={tempCourse}
                        onChange={(e) => setTempCourse(e.target.value)}
                      >
                        <option value="">-- Select Class --</option>
                        <option value="Quran Studies">Quran Studies</option>
                        <option value="Islamic Studies">Islamic Studies</option>
                        <option value="Arabic Studies">Arabic Studies</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
    onClick={resetFilters}
                        className="px-4 py-1 rounded-md border border-[#576CBC] text-[#576CBC] font-medium"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCourse(tempCourse);
                          setFilterOpen(false);
                        }}
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
              <span className="text-left -ml-60">
                Showing {currentItems.length} Of {filteredGroupedFeedbacks.length}
              </span>
            </div>
          </div>

          {/* Table */}
          <table className="table-auto w-full border-separate border-spacing-y-2" style={{ tableLayout: "fixed" }}>
            <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
              <tr className="font-medium">
                {[
                  "Student Name",
                  "Teacher Name",
                  "Class",
                  "Date",
                  "Time",
                  "Feedback",
                  "Total Feedbacks",
                  "Average Rating",
                  "Details",
                ].map((header) => (
                  <th
                    key={header}
                    className="text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0] truncate"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((group, index) => {
                const groupId = `${group.studentId}-${group.teacherId}`;
                
                return (
                  <tr
                    key={groupId}
                    className={`text-[12px] ${
                      index % 2 === 0
                        ? "bg-[#fff] dark:bg-[#2C2C2C]"
                        : "bg-[#F8F8F8] dark:bg-[#303030]"
                    }`}
                  >
                    <td className="px-3 py-2 text-[#17243E] dark:text-white truncate">
                      {group.studentName}
                    </td>
                    <td className="px-3 py-2 text-[#17243E] dark:text-white truncate">
                      {group.teacherName}
                    </td>
                    <td className="px-3 py-2 text-[#17243E] dark:text-white truncate">
                      {group.className}
                    </td>
                    <td className="px-3 py-2 text-[#17243E] dark:text-white truncate">
                      {formatDate(group.date)}
                    </td> <td className="px-3 py-2 text-[#17243E] dark:text-white truncate">
                      {group.time}
                    </td>
                    <td className="px-3 py-2 text-left text-[#17243E] dark:text-white">
                      <div className="relative">
                        {group.feedbacks.length > 1 ? (
                          <>
                            <button
                              onClick={() => toggleFeedbackDropdown(groupId)}
                              className="flex items-center gap-2 font-medium hover:text-[#5c5c5c] dark:hover:text-[#5c5c5c]"
                            >
                              <AiOutlineMenuUnfold />
                              View List ({group.feedbacks.length})
                            </button>

                            {openFeedbackDropdownId === groupId && (
                              <div className="absolute z-10 mt-2 w-96 bg-white rounded shadow-lg p-3 dark:bg-[#343434] border border-gray-200 dark:border-gray-600 max-h-60 overflow-y-auto">
                                <h4 className="font-semibold text-sm mb-2 text-[#17243E] dark:text-[#FDFDFD]">
                                  All Feedbacks:
                                </h4>
                                {group.feedbacks.map((feedback, idx) => (
                                  <div
                                    key={feedback._id}
                                    className="py-2 text-[#17243E] dark:text-[#FDFDFD] border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                                  >
                                    <div className="flex items-start gap-2">
                                      <IoPersonOutline className="flex-shrink-0 mt-1" />
                                      <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                          <div className="font-medium text-sm">
                                            Feedback #{idx + 1}
                                          </div>
                                          <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                              <FaStar
                                                key={star}
                                                className={`w-3 h-3 ${
                                                  feedback.level >= star
                                                    ? "text-[#FAAB3C]"
                                                    : "text-gray-300"
                                                }`}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                          {formatDate(feedback.createdDate)}
                                        </div>
                                        <div className="text-sm">
                                          {feedback.Feedback}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        ) : group.feedbacks.length === 1 ? (
                          <div className="flex items-start gap-2">
                            <IoPersonOutline className="flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium">Single Feedback</span>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                      key={star}
                                      className={`w-3 h-3 ${
                                        group.feedbacks[0].level >= star
                                          ? "text-[#FAAB3C]"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                {new Date(group.feedbacks[0].createdDate).toLocaleDateString()}
                              </div>
                              <div className="text-sm max-h-20 overflow-y-auto">
                                {group.feedbacks[0].Feedback}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">No feedback</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[#17243E] dark:text-white truncate text-center">
                      {group.totalFeedbacks}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={`w-4 h-4 ${
                              group.averageRating >= star
                                ? "text-[#FAAB3C]"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                          ({group.averageRating.toFixed(1)})
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        className="text-xs px-3 py-1 rounded-md bg-[#4C6993] text-white dark:bg-[#6087C0] hover:bg-[#3b5574] dark:hover:bg-[#4e72a0] transition-colors"
                        onClick={() => handleDetailsClick(group)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Details Modal - Keep the existing modal for detailed view */}
        {showModal && selectedGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-[800px] max-h-[90vh] overflow-y-auto p-6 relative dark:bg-[#252525]">
              <h2 className="text-xl font-semibold mb-6">Feedback Details</h2>

              {/* Student-Teacher Information */}
              <div className="grid grid-cols-2 gap-6 text-sm mb-6">
                <div>
                  <label className="font-medium mb-2 block text-gray-800 dark:text-white">
                    Student Name
                  </label>
                  <div className="border p-2 rounded w-full dark:bg-[#343434] dark:border-[#5C5C5C]">
                    {selectedGroup.studentName}
                  </div>
                </div>
                <div>
                  <label className="font-medium mb-2 block text-gray-800 dark:text-white">
                    Teacher Name
                  </label>
                  <div className="border p-2 rounded w-full dark:bg-[#343434] dark:border-[#5C5C5C]">
                    {selectedGroup.teacherName}
                  </div>
                </div>
                <div>
                  <label className="font-medium mb-2 block text-gray-800 dark:text-white">
                    Class
                  </label>
                  <div className="border p-2 rounded w-full dark:bg-[#343434] dark:border-[#5C5C5C]">
                    {selectedGroup.className}
                  </div>
                </div>
                <div>
                  <label className="font-medium mb-2 block text-gray-800 dark:text-white">
                    Total Feedbacks
                  </label>
                  <div className="border p-2 rounded w-full dark:bg-[#343434] dark:border-[#5C5C5C]">
                    {selectedGroup.totalFeedbacks}
                  </div>
                </div>
              </div>

              {/* Average Ratings */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Average Ratings</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium mb-2 block text-gray-800 dark:text-white">
                      Overall Average Rating
                    </label>
                    <div className="flex items-center gap-2 border p-2 rounded dark:bg-[#343434] dark:border-[#5C5C5C]">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={`w-4 h-4 ${
                              selectedGroup.averageRating >= star
                                ? "text-[#FAAB3C]"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">({selectedGroup.averageRating.toFixed(1)})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Ratings */}
              {selectedGroup.feedbacks[0]?.studentsRating || selectedGroup.feedbacks[0]?.teacherRatings ? (
                <div className="mb-6">
                  <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Detailed Average Ratings</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedGroup.feedbacks[0].studentsRating && (
                      <>
                        <div>
                          <label className="font-medium mb-1 block text-gray-800 dark:text-white">
                            Class Understanding
                          </label>
                          <div className="border p-2 rounded dark:bg-[#343434] dark:border-[#5C5C5C]">
                            {calculateDetailedRatings(selectedGroup.feedbacks).classUnderstanding.toFixed(1)}
                          </div>
                        </div>
                        <div>
                          <label className="font-medium mb-1 block text-gray-800 dark:text-white">
                            Engagement
                          </label>
                          <div className="border p-2 rounded dark:bg-[#343434] dark:border-[#5C5C5C]">
                            {calculateDetailedRatings(selectedGroup.feedbacks).engagement.toFixed(1)}
                          </div>
                        </div>
                        <div>
                          <label className="font-medium mb-1 block text-gray-800 dark:text-white">
                            Homework Completion
                          </label>
                          <div className="border p-2 rounded dark:bg-[#343434] dark:border-[#5C5C5C]">
                            {calculateDetailedRatings(selectedGroup.feedbacks).homeworkCompletion.toFixed(1)}
                          </div>
                        </div>
                      </>
                    )}
                    {selectedGroup.feedbacks[0].teacherRatings && (
                      <>
                        <div>
                          <label className="font-medium mb-1 block text-gray-800 dark:text-white">
                            Listening Ability
                          </label>
                          <div className="border p-2 rounded dark:bg-[#343434] dark:border-[#5C5C5C]">
                            {calculateDetailedRatings(selectedGroup.feedbacks).listeningAbility.toFixed(1)}
                          </div>
                        </div>
                        <div>
                          <label className="font-medium mb-1 block text-gray-800 dark:text-white">
                            Reading Ability
                          </label>
                          <div className="border p-2 rounded dark:bg-[#343434] dark:border-[#5C5C5C]">
                            {calculateDetailedRatings(selectedGroup.feedbacks).readingAbility.toFixed(1)}
                          </div>
                        </div>
                        <div>
                          <label className="font-medium mb-1 block text-gray-800 dark:text-white">
                            Overall Performance
                          </label>
                          <div className="border p-2 rounded dark:bg-[#343434] dark:border-[#5C5C5C]">
                            {calculateDetailedRatings(selectedGroup.feedbacks).overallPerformance.toFixed(1)}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Individual Feedback List */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">All Feedbacks ({selectedGroup.feedbacks.length})</h3>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {selectedGroup.feedbacks.map((feedback, index) => (
                    <div key={feedback._id} className="border rounded-lg p-4 dark:bg-[#343434] dark:border-[#5C5C5C]">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Feedback #{index + 1}
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              className={`w-3 h-3 ${
                                feedback.level >= star
                                  ? "text-[#FAAB3C]"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                            ({feedback.level})
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Date: {new Date(feedback.createdDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {feedback.Feedback}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm font-medium dark:text-[#576CBC] dark:bg-[#576CBC1A] dark:border-[#576CBC]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </BaseLayout3>
  );
};

export default FeedbackDetails;