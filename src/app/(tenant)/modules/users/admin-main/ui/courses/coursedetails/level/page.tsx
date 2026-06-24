"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AxiosError } from "axios";
import AdminHeader from "@/app/(tenant)/modules/users/admin-main/components/AdminHeader";
import BaseLayout4 from "../../../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";

interface Course {
  courseId: string;
  level: string;
  description: string;
  duration: string;
  createdDate: string;
  createdBy: string;
}

interface CoursePayload {
  courseId: string;
  level: string;
  description: string;
  duration: string;
  createdDate: string;
  createdBy: string;
}

interface CourseData {
  courseId: string;
  description: string;
  level: string;
  duration: string;
  createdBy: string;
  createdDate: string;
}

const Page = () => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectLevel, setselectlevel] = useState<CourseData>({
    courseId: "",
    description: "",
    duration: "",
    level: "",
    createdBy: "Admin",
    createdDate: "",
  });
  const searchParams = useSearchParams();
  const courseTitle = searchParams.get("title");
  const courseId = searchParams.get("courseId");
  const maxLevels = parseInt(searchParams.get("maxLevels") || "0");
  const courseTotalHours = searchParams.get("d");
  const [currentLevelCount, setCurrentLevelCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [dashboardRead, setdashboardRead] = useState(false);
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AdminAuthToken")
        : null;

    if (!token) {
      toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      return;
    }

    // Fetch levels using the valid token
    fetchLevels(token);

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
      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.LEVELS.GET_LIST}/${courseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch course details");

      const data = await response.json();
      console.log(data);
      // Because response is not an array, update accordingly
      if (Array.isArray(data.data)) {
        const levels = data.data.map((level: any) => ({
          courseId: level.courseId,
          description: level.description,
          level: level.level,
          duration: level.duration,
          createdBy: level.createdBy,
          createdDate: level.createdDate,
        }));

        setCourses(levels);
        setCurrentLevelCount(levels.length);
      }
    } catch (error) {
      console.error("Error fetching levels:", error);
    }
  };

  const [form, setForm] = useState<CourseData>({
    courseId: courseId || "",
    description: "",
    duration: "",
    level: "",
    createdBy: "Admin",
    createdDate: "",
  });

  const handleSubmit = async () => {
    if (currentLevelCount >= maxLevels) {
      toast.error(
        `Cannot add more levels. Maximum ${maxLevels} levels allowed for this course.`
      );
      return;
    }
    const newLevelDuration = parseInt(form.duration || "0");
    const existingDurationSum = courses.reduce(
      (acc, level) => acc + parseInt(level.duration),
      0
    );
    const totalWithNew = existingDurationSum + newLevelDuration;

    if (totalWithNew > parseInt(courseTotalHours || "0")) {
      toast.error(
        `Total duration exceeded. Course limit: ${courseTotalHours} hrs, current used: ${existingDurationSum} hrs`
      );
      return;
    }

    const newLevelNumber = currentLevelCount + 1;
    const payload: CoursePayload = {
      courseId: courseId || "",
      duration: form.duration,
      description: form.description,
      level: form.level,
      createdDate: "",
      createdBy: "Admin",
    };

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AdminAuthToken")
          : null;

      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return;
      }
      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.LEVELS.CREATE}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      // Add the new level with its specific number
      const newCourse = {
        ...form,
      };
      if ([200, 201].includes(res.status)) {
        setSuccess(true);
        setCourses((prevCourses) => [...prevCourses, newCourse]);
        setCurrentLevelCount(newLevelNumber);

        setForm({
          courseId: "",
          description: "",
          duration: "",
          level: "",
          createdBy: "Admin",
          createdDate: "",
        });
        setShowForm(false);
      }
    } catch (err) {
      const error = err as AxiosError;
      const status = error.response?.status;
      setShowForm(false);
      if (Number(status === 400)) {
        const message =
          (error.response?.data as any)?.message ??
          "Please check the form inputs.";
        setFailedMessage(message);
        setFailed(true);
      } else if (status === 401) {
        setFailedMessage("Please login again.");
        setFailed(true);
      } else if (status === 403) {
        setFailedMessage("You don't have permission to perform this action.");
        setFailed(true);
      } else if (status === 500) {
        setFailedMessage("Server error");
        setFailed(true);
      } else {
        setFailed(true);
        console.error(`Unexpected error: ${status}`);
      }
    }
  };

  const handleUpdateSubmit = async () => {
    if (currentLevelCount >= maxLevels) {
      toast.error(
        `Cannot add more levels. Maximum ${maxLevels} levels allowed for this course.`
      );
      return;
    }
    const newLevelDuration = parseInt(selectLevel.duration || "0");
    const existingDurationSum = courses.reduce(
      (acc, level) => acc + parseInt(level.duration),
      0
    );
    const totalWithNew = existingDurationSum + newLevelDuration;

    if (totalWithNew > parseInt(courseTotalHours || "0")) {
      toast.error(
        `Total duration exceeded. Course limit: ${courseTotalHours} hrs, current used: ${existingDurationSum} hrs`
      );
      return;
    }

    const payload: CoursePayload = {
      courseId: courseId || "",
      duration: selectLevel.duration,
      description: selectLevel.description,
      level: selectLevel.level,
      createdDate: "",
      createdBy: "Admin",
    };

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AdminAuthToken")
          : null;

      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return;
      }
      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.LEVELS.UPDATE}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );


      if ([200, 201].includes(res.status)) {
        setSuccess(true);
        setCourses((prev) =>
          prev.map((item) =>
            item.level === payload.level ? { ...item, ...payload } : item
          )
        );

        setselectlevel({
          courseId: "",
          description: "",
          duration: "",
          level: "",
          createdBy: "Admin",
          createdDate: "",
        });
        setShowUpdateForm(false);
      }
    } catch (err) {
      const error = err as AxiosError;
      const status = error.response?.status;
      setShowForm(false);
      if (Number(status === 400)) {
        const message =
          (error.response?.data as any)?.message ??
          "Please check the form inputs.";
        setFailedMessage(message);
        setFailed(true);
      } else if (status === 401) {
        setFailedMessage("Please login again.");
        setFailed(true);
      } else if (status === 403) {
        setFailedMessage("You don't have permission to perform this action.");
        setFailed(true);
      } else if (status === 500) {
        setFailedMessage("Server error");
        setFailed(true);
      } else {
        setFailed(true);
        console.error(`Unexpected error: ${status}`);
      }
    }
  };

  const itemsPerPage = 4;

  const offset = currentPage === 1 ? 0 : 3 + (currentPage - 2) * itemsPerPage;
  const limit = currentPage === 1 ? 3 : offset + itemsPerPage;

  const paginatedCourses = courses.slice(offset, limit);

  const totalItems = courses.length;
  const totalPages = Math.ceil(Math.max(0, totalItems - 3) / itemsPerPage + 1);

  const CourseCard = ({
    courseId,
    level,
    description,
    duration,
    createdDate,
    createdBy,
  }: Course) => {
    const selectUpadteLevel = (course: CourseData) => {
      setShowUpdateForm(true);
      setselectlevel(course);
    };

    return (
      <button
        onClick={() =>
          selectUpadteLevel({
            courseId,
            level,
            description,
            duration,
            createdDate,
            createdBy,
          })
        }
        className="w-full bg-white dark:bg-[#343434] rounded-xl hover:border-[#576CBC] hover:border-[2px] border border-gray-300 dark:border-[#444] shadow hover:shadow-md transition flex flex-col justify-between p-4 aspect-[4.8/5]"
      >
        {/* Title */}
        <h2 className="text-sm sm:text-base font-bold text-[#fff] bg-[#576CBC] rounded-sm dark:text-white mb-4 text-center">
          Level {level}
        </h2>

        {/* Image + Description */}
        <div className="flex flex-col items-center gap-2 flex-grow mb-2 ">
          <p className="text-[11px] text-gray-600 dark:text-gray-300 text-center truncate w-full px-2">
            {description
              ? description.length > 200
                ? `${description.slice(0, 200)}...`
                : description
              : "No description"}
          </p>
        </div>

        {/* Info */}
        <div className="text-[11px] sm:text-xs  font-normal space-y-1 ">
          <div className="flex justify-between">
            <span className="font-medium text-[#000000] dark:text-[#FFFFFFE5]">
              Duration
            </span>
            <span className="text-[#322121cc] dark:text-[#DADADACC]">
              {duration} hrs
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
      </button>
    );
  };

  return (
    <BaseLayout4>
      <AdminHeader
        currentSection={courseTitle || ""}
        showBackButton={true}
        showBackPath="/modules/users/admin-main/ui/courses/coursedetails"
      />
      <div className=" sm:px-1 lg:px-2 bg-[#f5f5f5] dark:bg-[#3B3B3B] py-2 rounded-xl">
        {/* Grid of Cards */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center p-4 bg-gray-100 dark:bg-[#3B3B3B]">
          {/* Add Button Only on First Page */}
          {currentPage === 1 && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full h-full bg-white dark:bg-[#343434] border border-gray-300 dark:border-[#444]  hover:border-[#576CBC] hover:border-[2px] rounded-xl shadow hover:shadow-md transition flex flex-col items-center justify-center p-4 aspect-[4.8/5]"
            >
              <div className="w-14 h-14 bg-[#576CBC] dark:bg-[#C4C4C4] rounded-full flex items-center justify-center">
                <Plus color="white" size={28} />
              </div>
            </button>
          )}

          {paginatedCourses.map((course, index) => (
            <div
              key={course.level || `level-${index}`}
              className="w-full max-w-xs"
            >
              <CourseCard {...course} />
            </div>
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
              Add New Level
            </h3>
            <CourseFormInput
              label="Course ID"
              value={courseId || ""}
              onChange={() => {}}
            />

            <CourseFormInput
              label="Course Duration in hrs"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
            <CourseFormInput
              label="Level"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
            />
            <CourseFormInput
              label="Course Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              textarea
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
              onChange={() => {}}
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
      {showUpdateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-[#1e1e1e] text-black dark:text-white rounded-xl p-6 w-[400px] max-h-[90vh] overflow-y-auto shadow-xl">
            <h3 className="text-lg font-semibold text-[#002b4d] dark:text-[#FFFFFF] mb-6">
              Update Level
            </h3>
            <CourseFormInput
              label="Course ID"
              value={selectLevel?.courseId || ""}
              onChange={() => {}}
            />

            <CourseFormInput
              label="Course Duration in hrs"
              value={selectLevel?.duration}
              onChange={() => {}}
            />
            <CourseFormInput
              label="Level"
              value={selectLevel?.level}
              onChange={() => {}}
            />
            <CourseFormInput
              label="Course Description"
              value={selectLevel?.description}
              onChange={(e) =>
                setselectlevel({ ...selectLevel, description: e.target.value })
              }
              textarea
            />
            <CourseFormInput
              label="Creation Date"
              type="date"
              value={selectLevel.createdDate}
             onChange={() => {}}
            />
            <CourseFormInput
              label="Created By"
              value={selectLevel.createdBy}
              onChange={() => {}}
            />

            <div className="border-t pt-4 mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowUpdateForm(false)}
                className="px-3 py-1 border border-[#576CBC] text-[#576CBC] hover:border-[#4459A9] rounded hover:bg-[#E6E9F5] dark:hover:bg-[#333]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateSubmit()}
                className="px-3 py-1 bg-[#576CBC] text-white rounded hover:bg-[#4459A9]"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />

      {success && (
        <SuccessPopup onClose={() => setSuccess(false)} title="Course Added" />
      )}
      {failed && (
        <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
      )}
    </BaseLayout4>
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
