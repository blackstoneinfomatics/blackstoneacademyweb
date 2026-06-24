"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdminHeader from "@/app/(tenant)/modules/users/admin-main/components/AdminHeader";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import BaseLayout4 from "../../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface Course {
  courseId: string;
  level: string;
  description: string;
  duration: string;
  createdDate: string;
  createdBy: string;
}

interface CourseData {
  id: string;
  courseId: string;
  description: string;
  level: string;
  duration: string;
  createdBy: string;
  createdDate: string;
}

const Page = () => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const searchParams = useSearchParams();
  const courseTitle = searchParams.get("title");
  const courseId = searchParams.get("courseId");
  const [currentPage, setCurrentPage] = useState(1);
  const [dashboardRead, setdashboardRead] = useState(false);
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
      fetchLevels(token); // call your function with token
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
  const fetchLevels = async (token: string) => {
    try {
      const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.LEVELS.GET_LIST}/${courseId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch course details");

      const data = await response.json();
      console.log(data);
      // Because response is not an array, update accordingly
      if (Array.isArray(data.data)) {
        const levels = data.data.map((level: any) => ({
          id: level._id,
          courseId: level.courseId,
          description: level.description,
          level: level.level,
          duration: level.duration,
          createdBy: level.createdBy,
          createdDate: level.createdDate,
        }));

        setCourses(levels);
      }
    } catch (error) {
      console.error("Error fetching levels:", error);
    }
  };

  const itemsPerPage = 4;

  const paginatedCourses = courses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalItems = courses.length;
  const totalPages = Math.ceil(courses.length / itemsPerPage);

  return (
    <BaseLayout4>
      <AdminHeader currentSection={courseTitle || ""} showBackButton={true} showBackPath="/modules/users/admin-main/ui/assignments"/>
      <div className=" sm:px-1 lg:px-2 bg-[#f5f5f5] dark:bg-[#3B3B3B] py-2 rounded-xl">
        {/* Grid of Cards */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center p-4 bg-gray-100 dark:bg-[#3B3B3B]">
          {paginatedCourses.map((course, index) => (
            <Link
              key={course.courseId || `course ${index}`}
              href={{
                pathname: `/modules/users/admin-main/ui/assignments/level/levelDetail`,
                query: {
                  levelId: course.id,
                  courseId: course.courseId,
                  level: course.level,
                  course: courseTitle,
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
    </BaseLayout4>
  );
};

const CourseCard = ({
  courseId,
  level,
  description,
  duration,
  createdDate,
  createdBy,
}: Course) => {
  return (
    <div className="w-full bg-white dark:bg-[#343434] rounded-xl hover:border-[#576CBC] hover:border-[2px] border border-gray-300 dark:border-[#444] shadow hover:shadow-md transition flex flex-col justify-between p-4 aspect-[4.8/5]">
      {/* Title */}
      <h2 className="text-sm sm:text-base font-bold text-[#0b2447] dark:text-white mb-2 text-center">
        Level {level}
      </h2>

      {/* Image + Description */}
      <div className="flex flex-col items-center gap-2 flex-grow mb-2 ">
        <div className="w-20 h-20 bg-gray-200 dark:bg-[#C4C4C4] rounded-md" />
        <p className="text-[11px] text-gray-600 dark:text-gray-300 text-center truncate w-full px-2">
          {description
            ? description.length > 100
              ? `${description.slice(0, 100)}...`
              : description
            : "No description"}
        </p>
      </div>

      {/* Info */}
      <div className="text-[11px] sm:text-xs  font-normal space-y-1 ">
        <div className="flex justify-between">
          <span className="font-medium text-[#000000] dark:text-[#FFFFFFE5]">
            Course ID
          </span>
          <span className="text-right text-[#322121cc] dark:text-[#DADADACC]">
            {courseId}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-[#000000] dark:text-[#FFFFFFE5]">
            Duration
          </span>
          <span className="text-[#322121cc] dark:text-[#DADADACC]">
            {duration}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-[#000000] dark:text-[#FFFFFFE5]">
            Date
          </span>
          <span className="text-[#322121cc] dark:text-[#DADADACC]">
            {new Date(createdDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-[#000000] dark:text-[#FFFFFFE5]">
            Created By
          </span>
          <span className="text-[#322121cc] dark:text-[#DADADACC]">
            {createdBy}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Page;
