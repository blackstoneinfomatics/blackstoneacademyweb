"use client";

import { useEffect, useState } from "react";
import { Video, Search } from "lucide-react";
import { MdTune } from "react-icons/md";
import AdminHeader from "../../components/AdminHeader";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";
import BaseLayout4 from "../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
type Video = {
  title: string;
  uploadedFile: {
    data: number[]; // or use `Buffer` if that's what you're using
  };
};

interface KnowledgeBaseItem {
  _id: string;
  courseName: string;
  base64File: string;
  subjectTitle: string;
  uploadedFormat: string;
  uploadedFile: string;
  status: string;
  createdDate: string;
  createdBy: string;
  __v: number;
}
interface Course {
  courseId: string;
  courseTitle: string;
}
interface CoursesListResponse {
  totalCount: number;
  courses: CourseAPIResponseItem[];
}
interface CourseAPIResponseItem {
  _id: string;
  courseName: string;
}
export default function KnowledgeBase() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredClass, setFilteredClass] = useState<KnowledgeBaseItem[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [filterCourse, setFilterCourse] = useState("");
  const [dashboardRead, setdashboardRead] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPage1, setCurrentPage1] = useState(1);
  const [pdfFiles, setPdfFiles] = useState<KnowledgeBaseItem[]>([]);
  const [videoFiles, setVideoFiles] = useState<KnowledgeBaseItem[]>([]);
  const [searchQuery1, setSearchQuery1] = useState("");
  const [filteredClass1, setFilteredClass1] = useState<KnowledgeBaseItem[]>([]);
  const [showFilter1, setShowFilter1] = useState(false);
  const [filterCourse1, setFilterCourse1] = useState("");

  // Empty dependency array ensures it runs once on mount
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AdminAuthToken")
        : null;

    if (!token) {
      console.error("❌ AdminAuthToken not found");
      return;
    }
    if (token) {
      fetchKnowledgeBaseList(token);
      fetchCourses(token);
    } else {
      toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
    }
    if (typeof window !== "undefined") {
      const roleAccessRaw = localStorage.getItem("AdminRolePermission");

      if (roleAccessRaw) {
        try {
          const roleAccess = JSON.parse(roleAccessRaw);
          const hasRead = roleAccess?.courses?.write ?? false;
          console.log(hasRead);
          setdashboardRead(hasRead);
        } catch (error) {
          console.error("Invalid JSON in AdminRolePermission:", error);
        }
      }
    }
  }, []);
  const fetchCourses = async (token: string) => {
    console.log("📥 Fetching courses...");
    try {
      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.COURSE.GET_LIST}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ Response received:", response);

      if (!response.ok) {
        throw new Error(
          `❌ Failed to fetch courses — Status: ${response.status}`
        );
      }

      const data: CoursesListResponse = await response.json();
      console.log("📦 Parsed JSON:", data);

      if (!data.courses || !Array.isArray(data.courses)) {
        throw new Error(
          "❌ Invalid data format: `courses` field missing or not an array"
        );
      }

      const transformedCourses: Course[] = data.courses
        .map((courseItem) => {
          if (!courseItem.courseName) {
            console.warn("⚠️ Missing `course` object in item:", courseItem);
            return null;
          }
          return {
            courseId: courseItem._id,
            courseTitle: courseItem.courseName,
          };
        })
        .filter(Boolean) as Course[];

      console.log("✅ Transformed Courses:", transformedCourses);
      setCourses(transformedCourses);
    } catch (err) {
      console.error("❌ Error in fetchCourses:", err);
    }
  };
  const createBlobUrl = async(resumeData: any) => {
    if (!resumeData) {
      console.error("No resume data provided");
      return null;
    }

    try {

     
    console.log("file " , resumeData)
    const res = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.FILEUPLOAD.GET_UPLOAD}/${resumeData}`, {
      method: "GET",
    });

    if (!res.ok) throw new Error("Failed to fetch file");
    const blob = await res.blob();

      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error creating blob URL:", error);
      return null;
    }
  };
   const fetchAndOpenFile = async (fileId: string) => {
  try {
    console.log("file ",fileId)
    const res = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.FILEUPLOAD.GET_UPLOAD}/${fileId}`, {
      method: "GET",
    });

    if (!res.ok) throw new Error("Failed to fetch file");
   const blob = await res.blob();     // ✅ ONLY READ ONCE
console.log("res", blob.type);
      const newBlobUrl =  await createBlobUrl(fileId);
      if (!newBlobUrl) {
        console.log("Failed to load resume");
        return;
      }

      // Open in new tab
      window.open(newBlobUrl, "_blank");
  } catch (err) {
    console.error("Error fetching file:", err);
  }
};
  const fetchKnowledgeBaseList = async (token: string) => {
    try {
      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.KNOWLEDGE_BASE.LIST}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
     console.log('result',result);
      if (result.status === "success") {
        const pdfs: KnowledgeBaseItem[] = [];
        const videos: KnowledgeBaseItem[] = [];

        result.data.forEach((item: KnowledgeBaseItem) => {
         

          if (item.uploadedFormat.toLowerCase() === "pdf") {
            pdfs.push(item);
          } else if (item.uploadedFormat.toLowerCase() === "video") {
            videos.push(item);
          }
        });

        setPdfFiles(pdfs);
        setVideoFiles(videos);
      } else {
        console.error("❌ Failed to fetch knowledge base list");
      }
    } catch (error) {
      console.error("❌ Error fetching knowledge base list:", error);
    }
  };
 
  useEffect(() => {
    const query = searchQuery.toLowerCase();

    const filtered = pdfFiles.filter((cls) => {
      const courseName = cls.courseName?.toLowerCase() ?? "";

      const matchesSearch = courseName.includes(query);
      const matchesCourse = filterCourse
        ? courseName === filterCourse.toLowerCase()
        : true;

      return matchesSearch && matchesCourse;
    });

    setFilteredClass(filtered);
    setCurrentPage(1);
  }, [searchQuery, filterCourse, pdfFiles]);

  useEffect(() => {
    const query = searchQuery1.toLowerCase();

    const filtered = videoFiles.filter((cls) => {
      const courseName = cls.courseName?.toLowerCase() ?? "";

      const matchesSearch = courseName.includes(query);
      const matchesCourse = filterCourse1
        ? courseName === filterCourse1.toLowerCase()
        : true;

      return matchesSearch && matchesCourse;
    });

    setFilteredClass1(filtered);
  }, [searchQuery1, filterCourse1, videoFiles]);

  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    if (selectedVideo?.uploadedFile?.data) {
      // Convert Buffer to base64 if it's a Buffer
      const base64String = Buffer.from(
        selectedVideo.uploadedFile.data
      ).toString("base64");

      try {
        const byteCharacters = atob(base64String); // Decode base64
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
          const slice = byteCharacters.slice(offset, offset + 1024);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          byteArrays.push(new Uint8Array(byteNumbers));
        }

        const blob = new Blob(byteArrays, { type: "video/mp4" });
        const url = URL.createObjectURL(blob);

        setVideoUrl(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error("Error decoding base64:", error);
      }
    }
  }, [selectedVideo]);
 
  const itemsPerPage = 5;

  const totalPages = Math.ceil(filteredClass.length / itemsPerPage);

  const paginatedCourses = filteredClass.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages1 = Math.ceil(filteredClass1.length / itemsPerPage);

  const paginatedCourses1 = filteredClass1.slice(
    (currentPage1 - 1) * itemsPerPage,
    currentPage1 * itemsPerPage
  );

  return (
    <BaseLayout4>
      <AdminHeader
        currentSection="knowledge base"
        showBackButton={true}
        showBackPath="courses"
      />
      <div className="w-full min-h-100vh mx-auto  sm:px-1 lg:px-2">
        <div className="relative w-full bg-[#F5F5F5] dark:bg-[#3B3B3B] rounded-xl">
          {/* Search + Filter + Count Bar */}

          {/* Top Filter/Search/Info Bar */}
          <div className="flex flex-col md:flex-row items-start dark:bg-[#343434] bg-[#FAFAFB] rounded-xl md:items-center px-4 relative gap-4 md:gap-0">
            <div className="flex-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300 justify-start py-3 px-4">
              <Search className="w-5 h-5 text-gray-400 dark:text-gray-300" />
              <input
                type="text"
                placeholder="Search by Course Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm outline-none bg-transparent placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-100"
              />
            </div>

            <button
              onClick={() => setShowFilter(true)}
              className="flex-1 flex items-center gap-2 text-sm text-gray-400 dark:text-gray-300 cursor-pointer justify-start border-y-0 border-l-2 border-r-2 border-gray-300 dark:border-[#868585] h-full md:h-[40px] px-4"
            >
              <MdTune className="w-5 h-5" />
              <span>Filter</span>
            </button>

            <div className="flex-1 flex items-center text-sm text-gray-500 dark:text-gray-300 py-3 px-4 justify-start">
              <span>
                Showing{" "}
                {Math.min(currentPage * itemsPerPage, paginatedCourses.length)}{" "}
                of {paginatedCourses.length} entries
              </span>
            </div>
          </div>

          <div className="overflow-x-auto shadow-sm border dark:border-[#3a3a3a]">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-[#3B568E] text-white text-sm text-left">
                  <th className="px-4 py-3 font-medium">Course Name</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCourses.length > 0 ? (
                  paginatedCourses.map((pdf, index) => (
                    <tr
                      key={pdf._id || index}
                      className={`text-sm ${
                        index % 2 === 0
                          ? "bg-white dark:bg-[#3b3b3b]"
                          : "bg-gray-50 dark:bg-[#2f2f2f]"
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                        {pdf.courseName || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                        {pdf.subjectTitle || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                        {new Date(
                          pdf?.createdDate || ""
                        ).toLocaleDateString() || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() =>
                            fetchAndOpenFile(pdf.uploadedFile)
                          }
                          className="text-xs px-4 py-1 rounded-md transition bg-[#4459A9] text-white hover:bg-[#3a4c90]"
                        >
                          View file
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-gray-500 dark:text-gray-400"
                    >
                      No PDF files found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {showFilter && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-sm rounded-xl shadow-xl p-6 relative space-y-5 mx-3 sm:mx-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-[#010E30] dark:text-white">
                    Filter by
                  </h3>
                  <button
                    className="text-red-500 hover:text-gray-700 dark:hover:text-white text-sm"
                    onClick={() => setShowFilter(false)}
                  >
                    ✕
                  </button>
                </div>

                {/* Course */}
                <div>
                  <label
                    htmlFor="jhvch"
                    className="text-sm text-[#010E30] dark:text-gray-300 mb-1 block"
                  >
                    Course
                  </label>
                  <select
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="w-full border border-gray-300 dark:border-[#444] px-3 py-2 rounded-md text-sm bg-white dark:bg-[#2D2D2D] text-[#010E30CC]/80 dark:text-white"
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.courseId} value={course.courseTitle}>
                        {course.courseTitle}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-7 pt-2 justify-center ">
                  <button
                    onClick={() => {
                      setFilterCourse("");
                      setShowFilter(false);
                    }}
                    className="px-4 py-1 border border-[#576CBC] rounded text-[#576CBC] hover:bg-gray-100 transition "
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowFilter(false)}
                    className="px-5 py-1 bg-[#576CBC] text-white rounded hover:bg-blue-700 transition"
                  >
                    Show {filteredClass.length} results
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-end items-center gap-2 mt-3">
          {/* Prev Button */}
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-md border flex items-center justify-center bg-[#F5F5F2] text-sm disabled:opacity-50 hover:bg-gray-300 dark:bg-[#565656] dark:hover:bg-[#939393]"
          >
            &lt;
          </button>

          {/* Page Numbers with Ellipsis */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
            )
            .map((page, idx, arr) => {
              const prevPage = arr[idx - 1];
              return (
                <>
                  {Boolean(prevPage && page - prevPage > 1) && (
                    <span className="px-2 text-sm text-gray-500 dark:text-gray-400">
                      …
                    </span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-md border flex items-center justify-center text-sm transition ${
                      page === currentPage
                        ? "bg-[#FAFAFB] text-[#203F78] border-[#203F78] dark:bg-[#939393]"
                        : "bg-white dark:bg-[#565656] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#939393]"
                    }`}
                  >
                    {page}
                  </button>
                </>
              );
            })}

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-md border flex items-center justify-center text-sm bg-[#F5F5F2]  disabled:opacity-50 hover:bg-gray-300 dark:bg-[#565656] dark:hover:bg-[#939393]"
          >
            &gt;
          </button>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[#002b4d] dark:text-white">
            Recorded Classes
          </h3>

          {/* Videos */}
          <div className="relative w-full bg-[#F5F5F5] dark:bg-[#3B3B3B] rounded-xl mt-2">
            {/* Top bar (search + filter) */}
            <div className="flex flex-col md:flex-row items-start dark:bg-[#343434] bg-[#FAFAFB] rounded-xl md:items-center px-4 gap-4">
              <div className="flex-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300 justify-start py-3 px-4">
                <Search className="w-5 h-5 text-gray-400 dark:text-gray-300" />
                <input
                  type="text"
                  placeholder="Search by Course Name"
                  value={searchQuery1}
                  onChange={(e) => setSearchQuery1(e.target.value)}
                  className="w-full text-sm outline-none bg-transparent placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-100"
                />
              </div>

              <button
                onClick={() => setShowFilter1(true)}
                className="flex-1 flex items-center gap-2 text-sm text-gray-400 dark:text-gray-300 cursor-pointer justify-start border-y-0 border-l-2 border-r-2 border-gray-300 dark:border-[#868585] h-full md:h-[40px] px-4"
              >
                <MdTune className="w-5 h-5" />
                <span>Filter</span>
              </button>

              <div className="flex-1 flex items-center text-sm text-gray-500 dark:text-gray-300 py-3 px-4 justify-start">
                Showing{" "}
                {Math.min(
                  currentPage1 * itemsPerPage,
                  paginatedCourses1.length
                )}{" "}
                of {paginatedCourses1.length} entries
              </div>
            </div>

            <div className="overflow-x-auto  shadow-sm border dark:border-[#3a3a3a]">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-[#3B568E] text-white text-sm text-left">
                    <th className="px-4 py-3 font-medium">Course Name</th>
                    <th className="px-4 py-3 font-medium">Subject</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCourses1.length > 0 ? (
                    paginatedCourses1.map((video, index) => (
                      <tr
                        key={video._id || index}
                        className={`text-sm ${
                          index % 2 === 0
                            ? "bg-white dark:bg-[#3b3b3b]"
                            : "bg-gray-50 dark:bg-[#2f2f2f]"
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                          {video.courseName}
                        </td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                          {video.subjectTitle}
                        </td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                          {new Date(
                            video?.createdDate || ""
                          ).toLocaleDateString() || "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            // onClick={() =>
                            //   setSelectedVideo({
                            //     title: video.courseName,
                            //     uploadedFile: video.uploadedFile,
                            //   })
                            // }
                            className="text-xs px-4 py-1 rounded-md transition bg-[#4459A9] text-white hover:bg-[#3a4c90]"
                          >
                            View file
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-6 text-gray-500 dark:text-gray-400"
                      >
                        No recorded classes found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Video Modal */}
              {selectedVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg overflow-hidden max-w-2xl w-full">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-[300px]"
                    />
                    <div className="flex justify-end p-3">
                      <button
                        onClick={() => setSelectedVideo(null)}
                        className="px-4 py-2 text-white bg-gray-800 rounded-lg"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showFilter1 && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-sm rounded-xl shadow-xl p-6 relative space-y-5 mx-3 sm:mx-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-[#010E30] dark:text-white">
                      Filter by
                    </h3>
                    <button
                      className="text-red-500 hover:text-gray-700 dark:hover:text-white text-sm"
                      onClick={() => setShowFilter1(false)}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Course */}
                  <div>
                    <label
                      htmlFor="jhvch"
                      className="text-sm text-[#010E30] dark:text-gray-300 mb-1 block"
                    >
                      Course
                    </label>
                    <select
                      value={filterCourse1}
                      onChange={(e) => setFilterCourse1(e.target.value)}
                      className="w-full border border-gray-300 dark:border-[#444] px-3 py-2 rounded-md text-sm bg-white dark:bg-[#2D2D2D] text-[#010E30CC]/80 dark:text-white"
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option
                          key={course.courseId}
                          value={course.courseTitle}
                        >
                          {course.courseTitle}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-7 pt-2 justify-center ">
                    <button
                      onClick={() => {
                        setFilterCourse1("");
                        setShowFilter1(false);
                      }}
                      className="px-4 py-1 border border-[#576CBC] rounded text-[#576CBC] hover:bg-gray-100 transition "
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setShowFilter1(false)}
                      className="px-5 py-1 bg-[#576CBC] text-white rounded hover:bg-blue-700 transition"
                    >
                      Show {filteredClass1.length} results
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Video Playback Modal */}
            {selectedVideo && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-xl p-6 max-w-3xl dark:bg-[#1D1D1D] h-[600px] w-full shadow-lg relative">
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="absolute top-2 right-2 text-gray-700 hover:text-black dark:hover:text-blue-900 text-xl"
                  >
                    &times;
                  </button>
                  <h3 className="text-lg font-semibold text-[#002b4d] dark:text-[#ffff] mb-4">
                    Course
                  </h3>
                  <video
                    src={videoUrl}
                    controls
                    className="w-[800px] h-[500px] rounded-lg"
                    autoPlay
                  >
                    <track
                      src="/assets/captions-en.vtt"
                      kind="captions"
                      srcLang="en"
                      label="English"
                      default
                    />
                  </video>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-end items-center gap-2 mt-3">
            {/* Prev Button */}
            <button
              onClick={() => setCurrentPage1(currentPage1 - 1)}
              disabled={currentPage1 === 1}
              className="w-8 h-8 rounded-md border flex items-center justify-center bg-[#F5F5F2] text-sm disabled:opacity-50 hover:bg-gray-300 dark:bg-[#565656] dark:hover:bg-[#939393]"
            >
              &lt;
            </button>

            {/* Page Numbers with Ellipsis */}
            {Array.from({ length: totalPages1 }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages1 ||
                  (page >= currentPage1 - 1 && page <= currentPage1 + 1)
              )
              .map((page, idx, arr) => {
                const prevPage = arr[idx - 1];
                return (
                  <>
                    {Boolean(prevPage && page - prevPage > 1) && (
                      <span className="px-2 text-sm text-gray-500 dark:text-gray-400">
                        …
                      </span>
                    )}
                    <button
                      onClick={() => setCurrentPage1(page)}
                      className={`w-8 h-8 rounded-md border flex items-center justify-center text-sm transition ${
                        page === currentPage1
                          ? "bg-[#FAFAFB] text-[#203F78] border-[#203F78] dark:bg-[#939393]"
                          : "bg-white dark:bg-[#565656] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#939393]"
                      }`}
                    >
                      {page}
                    </button>
                  </>
                );
              })}

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage1(currentPage1 + 1)}
              disabled={currentPage1 === totalPages1}
              className="w-8 h-8 rounded-md border flex items-center justify-center text-sm bg-[#F5F5F2]  disabled:opacity-50 hover:bg-gray-300 dark:bg-[#565656] dark:hover:bg-[#939393]"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </BaseLayout4>
  );
}