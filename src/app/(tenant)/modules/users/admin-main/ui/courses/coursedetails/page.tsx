"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { AxiosError } from "axios";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import AdminHeader from "@/app/(tenant)/modules/users/admin-main/components/AdminHeader";
import BaseLayout4 from "../../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface CourseInfo {
  courseId: string;
  courseTitle: string;
  courseDuration: string;
  courseDescription: string;
  courseLevel: string;
}

interface Level {
  levelId: string;
  contentLevel: string;
  descriptions: {
    type: string;
    data: any;
  };
  duration: string;
  _id: string;
}

interface CourseAPIResponseItem {
  _id: string;
  course: CourseInfo;
  courseName: string;
  level: string;
  status: string;
  createdDate: string;
  createdBy: string;
  lastUpdatedDate: string;
  lastUpdatedBy: string;
  __v: number;
}

interface CoursesListResponse {
  totalCount: number;
  courses: CourseAPIResponseItem[];
}

interface Course {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  courseDuration: string;
  level: string;
  createdDate: string;
  createdBy: string;
}

const Page = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [dashboardRead, setdashboardRead] = useState(false);
  // Load courses from localStorage on component mount

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
      fetchCourses(token); // call your function with token
    } else {
      console.error("❌ AdminAuthToken not found");
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
          if (!courseItem.course) {
            console.warn("⚠️ Missing `course` object in item:", courseItem);
            return null;
          }

          return {
            courseId: courseItem.course.courseId,
            courseTitle: courseItem.course.courseTitle,
            courseDescription: courseItem.course.courseDescription,
            courseDuration: courseItem.course.courseDuration,
            level: courseItem.level,
            createdDate: new Date(courseItem.createdDate).toLocaleDateString(),
            createdBy: courseItem.createdBy,
            status: courseItem.status,
          };
        })
        .filter(Boolean) as Course[];

      console.log("✅ Transformed Courses:", transformedCourses);
      setCourses(transformedCourses);
    } catch (err) {
      console.error("❌ Error in fetchCourses:", err);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState<Omit<Course, "status">>({
    courseId: "",
    courseTitle: "",
    courseDescription: "",
    courseDuration: "",
    level: "",
    createdDate: new Date().toISOString().split("T")[0],
    createdBy: "Admin",
  });

  const handleSubmit = async () => {
    try {
      
      if ( !form.level.trim()) {
        setFailedMessage("Number of Levels must be a positive number");
           setFailed(true);
      return;
      }
  if (!form.courseDescription?.trim()) {
      setFailedMessage("Course description is required");
      setFailed(true);
      return;
    }
    if (!form.courseTitle.trim()) {
      setFailedMessage("Course title is required");
      setFailed(true);
      return;
    }
    if (!form.courseDuration.trim()) {
      setFailedMessage("Course duration is required");
      setFailed(true);
      return;
    }
      // Prepare data for API
      const newCourse = {
        course: {
          courseId: form.courseId,
          courseTitle: form.courseTitle,
          courseDuration: form.courseDuration,
          courseDescription: form.courseDescription,
          courseLevel: "Beginner",
        },
        courseName: form.courseTitle,
        level: form.level,
        status: "Active",
        createdDate: new Date().toISOString(),
        createdBy: form.createdBy,
        lastUpdatedDate: new Date().toISOString(),
        lastUpdatedBy: "Admin",
      };

      console.log("Sending data to API:", newCourse);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AdminAuthToken")
          : null;

      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return;
      }
      // API call to create course
      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.COURSE.CREATE}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newCourse),
        }
      );

      const responseData = await response.json();
      console.log("API Response:", responseData);

      if (!response.ok) {
        throw new Error("Failed to create course");
      }
      if ([200, 201].includes(response.status)) {
        setSuccess(true);
        setTimeout(() => {
          setForm({
            courseId: "",
            courseTitle: "",
            courseDescription: "",
            courseDuration: "",
            level: "",
            createdDate: new Date().toISOString().split("T")[0],
            createdBy: "Admin",
          });
          setShowForm(false);
        }, 2000);
        fetchCourses(token);
      }
   } catch (err) {
  const error = err as AxiosError;
  const status = error.response?.status;

  setShowForm(false);
  setFailed(true);

  if (status === 400) {
    setFailedMessage(
      (error.response?.data as any)?.message ||
      "Invalid form data. Please check description and other fields."
    );
  } else if (status === 401) {
    setFailedMessage("Please login again.");
  } else if (status === 403) {
    setFailedMessage("You don't have permission to perform this action.");
  } else if (status === 500) {
    setFailedMessage("Server error. Try again later.");
  } else {
    setFailedMessage("Something went wrong. Please try again.");
  }
}
  };
  const itemsPerPage = 4;

  const offset = currentPage === 1 ? 0 : 3 + (currentPage - 2) * itemsPerPage;
  const limit = currentPage === 1 ? 3 : offset + itemsPerPage;

  const paginatedCourses = courses.slice(offset, limit);

  const totalItems = courses.length;
  const totalPages = Math.ceil(Math.max(0, totalItems - 3) / itemsPerPage + 1);

  return (
    <BaseLayout4>
      <AdminHeader currentSection="course" showBackButton={true} showBackPath="/modules/users/admin-main/ui/courses" />
      <div className=" sm:px-1 lg:px-2 bg-[#f5f5f5] dark:bg-[#3B3B3B] py-2 rounded-xl">
        {/* Grid of Cards */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center p-4 bg-gray-100 dark:bg-[#3B3B3B]">
          {/* Add Button Only on First Page */}
          {currentPage === 1 && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full h-full bg-white dark:bg-[#343434] border hover:border-[#576CBC] hover:border-[2px] border-gray-300 dark:border-[#444] rounded-xl shadow hover:shadow-md transition flex flex-col items-center justify-center p-4 aspect-[4.8/5]"
            >
              <div className="w-8 h-8 bg-[#576CBC] dark:bg-[#C4C4C4] rounded-full flex items-center justify-center">
                <Plus color="white" size={28} />
              </div>
            </button>
          )}

          {/* Course Cards */}
          {paginatedCourses.map((course, index) => (
            <Link
              key={course.courseId || `course ${index}`}
              href={{
                pathname: `/modules/users/admin-main/ui/courses/coursedetails/level`,
                query: {
                  title: course.courseTitle,
                  courseId: course.courseId,
                  maxLevels: course.level.toString(),
                  d: course.courseDuration,
                },
              }}
              className="w-full max-w-xs"
            >
              <CourseCard {...course} />
            </Link>
          ))}
        </div>
      </div>
      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-3 px-4">
        {/* Showing entries info */}
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
          entries
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-wrap justify-center items-center gap-2 mt-3">
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
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-[#1e1e1e] text-black dark:text-white rounded-xl p-6 w-[400px] max-h-[90vh] overflow-y-auto shadow-xl">
            <h3 className="text-lg font-semibold text-[#002b4d] dark:text-[#FFFFFF] mb-6">
              Add New Course
            </h3>

            <CourseFormInput
              label="Course Title"
              value={form.courseTitle}
              onChange={(e) =>
                setForm({ ...form, courseTitle: e.target.value })
              }
            />
            <CourseFormInput
              label="Course Description"
              value={form.courseDescription}
              onChange={(e) =>
                setForm({ ...form, courseDescription: e.target.value })
              }
              textarea
            />
            <CourseFormInput
              label="Course Duration"
              value={form.courseDuration}
              onChange={(e) =>
                setForm({ ...form, courseDuration: e.target.value })
              }
            />
            <CourseFormInput
              label="Number of Levels"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
            />
            <CourseFormInput
              label="Creation Date"
              type="date"
              value={form.createdDate}
              onChange={(e) =>
                setForm({ ...form, createdDate: e.target.value })
              }
            />
            <CourseFormInput
              label="Created By"
              value={form.createdBy}
              onChange={(e) => setForm({ ...form, createdBy: e.target.value })}
            />

            <div className="border-t pt-4 mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-3 py-1 border border-[#576CBC] text-[#576CBC] hover:border-[#4459A9] rounded hover:bg-[#E6E9F5] dark:hover:bg-[#333]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit()}
                className="px-3 py-1 bg-[#576CBC] text-white rounded hover:bg-[#4459A9]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {success && (
        <SuccessPopup onClose={() => setSuccess(false)} title="Course Added" />
      )}
      {failed && (
        <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
      )}
    </BaseLayout4>
  );
};

const CourseCard = ({
  courseTitle,
  courseId,
  courseDescription,
  courseDuration,
  level,
  createdDate,
  createdBy,
}: Course) => {
  return (
    <div className="w-full bg-white dark:bg-[#343434] rounded-xl border hover:border-[#576CBC] hover:border-[2px] border-gray-300 dark:border-[#444] shadow hover:shadow-md transition flex flex-col justify-between p-5 aspect-[4.8/5]">
      {/* Title */}
      <h2 className="text-sm sm:text-base font-bold text-[#fff] bg-[#576CBC] rounded-sm dark:text-white mb-4 text-center">
        {courseTitle}
      </h2>

      {/* Image + Description */}
      <div className="flex flex-col items-center gap-2 flex-grow mb-2 ">
        <p className="text-[11px] text-gray-600 dark:text-gray-300 text-center truncate w-full px-2 ">
          {courseDescription.length > 200
            ? `${courseDescription.slice(0, 200)}...`
            : courseDescription}
        </p>
      </div>

      {/* Info */}
      <div className="text-[11px] sm:text-xs  font-normal space-y-1 ">
        <div className="flex justify-between">
          <span className="font-medium text-[#000000] dark:text-[#FFFFFFE5]">
            Duration
          </span>
          <span className="text-[#322121cc] dark:text-[#DADADACC]">
            {courseDuration} hrs
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-[#000000] dark:text-[#FFFFFFE5]">
            Levels
          </span>
          <span className="text-[#322121cc] dark:text-[#DADADACC]">
            {level}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-[#000000] dark:text-[#FFFFFFE5]">
            Date
          </span>
          <span className="text-[#322121cc] dark:text-[#DADADACC]">
            {createdDate.toString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-[#000000] dark:text-[#FFFFFFE5]">
            By
          </span>
          <span className="text-[#322121cc] dark:text-[#DADADACC]">
            {createdBy}
          </span>
        </div>
      </div>
    </div>
  );
};

const CourseFormInput = ({
  label,
  value,
  onChange,
  textarea = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  textarea?: boolean;
  type?: string;
}) => (
  <div className="mb-2">
    <label className="block text-sm font-normal text-gray-700 dark:text-[#FFFFFF] mb-1">
      {label}
    </label>
    {textarea ? (
      <textarea
        value={value}
        onChange={onChange}
        rows={3}
        className="mt-1 w-full px-3 py-2 text-sm border-[#fff] border-[2px] rounded-xl bg-[#F7F7F8] dark:bg-[#343434] dark:border-[#5C5C5C]"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border rounded-sm px-4 py-2 text-sm text-gray-700 dark:text-[#FFFFFF] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#002b4d] dark:focus:ring-[#5C5C5C] dark:bg-[#343434]"
      />
    )}
  </div>
);

export default Page;