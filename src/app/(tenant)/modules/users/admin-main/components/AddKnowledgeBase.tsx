"use client";

import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type LeaveFormProps = {
  readonly onClose: () => void;
};
interface KnowledgeBaseEntry {
  courseName: string;
  subjectTitle: string;
  uploadedFormat: string;
  uploadedFile: string;
  status: string;
  createdDate: string;
  createdBy: string;
  updatedBy: string;
  updatedDate: string;
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

export default function KnowledgeBaseForm({ onClose }: LeaveFormProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [success, setSucces] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [knowledgeBaseData, setKnowledgeBaseData] =
    useState<KnowledgeBaseEntry>({
      courseName: "",
      subjectTitle: "",
      uploadedFormat: "",
      uploadedFile: "",
      status: "Active",
      createdDate: new Date().toISOString(),
      createdBy: "admin",
      updatedBy: "admin",
      updatedDate: new Date().toISOString(),
    });
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AdminAuthToken")
        : null;

    if (!token) {
      console.error("❌ AdminAuthToken not found");
      return;
    }
    fetchCourses(token);
  }, []);
  const fetchCourses = async (token: string) => {
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

      if (!response.ok) {
        throw new Error(
          `❌ Failed to fetch courses — Status: ${response.status}`
        );
      }

      const data: CoursesListResponse = await response.json();

      if (!data.courses || !Array.isArray(data.courses)) {
        throw new Error(
          "❌ Invalid data format: `courses` field missing or not an array"
        );
      }

      const transformedCourses: Course[] = data.courses
        .map((courseItem) => {
          if (!courseItem.courseName) {
            console.warn("⚠️ Missing courseName:", courseItem);
            return null;
          }

          console.log("Course inside:", courseItem);

          return {
            courseId: courseItem._id, // unique id
            courseTitle: courseItem.courseName, // dropdown text
          };
        })
        .filter(Boolean) as Course[];
      setCourses(transformedCourses);
    } catch (err) {
      console.error("❌ Error in fetchCourses:", err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setKnowledgeBaseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      setSelectedFile(file);
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1]; // get base64 after comma
        setKnowledgeBaseData((prev) => ({
          ...prev,
          uploadedFile: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("Sending API request...");
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AdminAuthToken")
          : null;

      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return;
      }
     const formData = new FormData();

formData.append("courseName", knowledgeBaseData.courseName);
formData.append("subjectTitle", knowledgeBaseData.subjectTitle);
formData.append("uploadedFormat", knowledgeBaseData.uploadedFormat);
formData.append("uploadedFile", knowledgeBaseData.uploadedFile); // <- File object
formData.append("status", knowledgeBaseData.status);
formData.append("createdDate", knowledgeBaseData.createdDate);
formData.append("createdBy", knowledgeBaseData.createdBy);
formData.append("updatedBy", knowledgeBaseData.updatedBy || "");
formData.append("updatedDate", knowledgeBaseData.updatedDate || "");

const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.KNOWLEDGE_BASE.CREATE}`,
   {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`, 
  },
  body: formData,
});


      console.log("Response Status:", response.status);
      if ([200, 201].includes(response.status)) {
        console.log("Successfully uploaded");
        setTimeout(() => {
          onClose();
        }, 3000);
        setSucces(true);
        setKnowledgeBaseData({
          courseName: "",
          subjectTitle: "",
          uploadedFormat: "",
          uploadedFile: "",
          status: "Active",
          createdDate: new Date().toISOString(),
          createdBy: "admin",
          updatedBy: "admin",
          updatedDate: new Date().toISOString(),
        });
      } else {
        console.error("Upload failed with status:", response.status);
      }
    } catch (err) {
      const error = err as AxiosError;
      const status = error.response?.status;
      if (Number(status === 400)) {
        setFailedMessage("Please check the form inputs.");
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-[#1D1D1D] p-4 md:p-6 rounded-xl w-full max-w-md shadow-xl text-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-[#002b4d] dark:text-white">
              Knowledge Base File Upload
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
            >
              &times;
            </button>
          </div>

          {/* Course Name */}
          <div className="mb-4">
            <label
              htmlFor="courseName"
              className="block font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Course Name
            </label>
            <select
              name="courseName"
              value={knowledgeBaseData.courseName || ""}
              onChange={handleInputChange}
              className="w-full border rounded-md px-4 py-2 bg-white dark:bg-[#343434] dark:border-[#5C5C5C] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#002b4d]"
            >
              <option value="" disabled>
                Select a course
              </option>
              {courses.map((course) => (
                <option key={course.courseId} value={course.courseTitle}>
                  {course.courseTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Title */}
          <div className="mb-4">
            <label
              htmlFor="hvyvuy"
              className="block font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Subject Title
            </label>
            <input
              type="text"
              name="subjectTitle"
              value={knowledgeBaseData.subjectTitle}
              onChange={handleInputChange}
              placeholder="Mercy"
              className="w-full border rounded-md px-4 py-2 bg-white dark:bg-[#343434] dark:border-[#5C5C5C] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#002b4d]"
            />
          </div>

          {/* Upload Format */}
          <div className="mb-4">
            <label
              htmlFor="uyvuyv"
              className="block font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Upload Format
            </label>
            <select
              name="uploadedFormat"
              value={knowledgeBaseData.uploadedFormat}
              onChange={handleInputChange}
              className="w-full border rounded-md px-4 py-2 bg-white dark:bg-[#343434] dark:border-[#5C5C5C] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#002b4d]"
            >
              <option value="">Select Format</option>
              <option value="Pdf">Pdf</option>
              <option value="Video">Video</option>
            </select>
          </div>

          {/* Uploaded By */}
          <div className="mb-4">
            <label
              htmlFor="uyvyvf"
              className="block font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Uploaded By
            </label>
            <input
              type="text"
              value="Admin"
              disabled
              className="w-full border rounded-md px-4 py-2 text-gray-400 bg-gray-100 dark:bg-[#343434] dark:border-[#5C5C5C] dark:text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Upload File */}
          {/* Upload File */}
          <div className="mb-6">
            <label
              htmlFor="uyfuy"
              className="block font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Upload File
            </label>

            <div className="w-full h-20 border-2 border-gray-300 rounded-md bg-gray-50 dark:bg-[#343434] dark:border-[#5C5C5C] flex items-center justify-center relative">
              <input
                type="file"
                accept=".pdf,.mp4"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />

              <div className="flex flex-col items-center pointer-events-none">
                <div className="bg-[#576CBC] text-white rounded-full w-6 h-6 flex items-center justify-center text-lg font-normal">
                  +
                </div>

                {/* Show file name */}
                {selectedFile && (
                  <p className="text-xs mt-2 text-gray-700 dark:text-gray-300">
                    {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              className="px-3 py-1 border border-[#576CBC] text-[#576CBC] hover:border-[#4459A9] rounded hover:bg-[#E6E9F5] dark:hover:bg-[#333]"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-1 bg-[#576CBC] text-white rounded hover:bg-[#4459A9]"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
      {success && (
        <SuccessPopup onClose={() => setSucces(false)} title="Form Submitted" />
      )}
      {failed && (
        <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
      )}
    </div>
  );
}