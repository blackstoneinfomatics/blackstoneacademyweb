"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

import { useRouter, } from "next/navigation";
import Modal from "react-modal";
import StudentHeader from "../../components/StudentHeader";
import { FcEditImage } from "react-icons/fc";
import { AppFailureToastMessages, appSuccessToastMessages } from "@/app/_components/contents/toast_message";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";

import Image from "next/image";
import BaseLayout2 from "@/app/(tenant)/modules/users/student/components/BaseLayout2";
import axios from "axios";
import { X } from "lucide-react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface Student {
  course: string;
  studentId: string;
  studentEmail: string;
  studentPhone: number;
  gender: string;
  package: string;
  photoUrl?: string;
}

interface StudentRecord {
  student: Student;
  _id: string;
  username: string;
  password: string;
  role: string;
  status: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  __v: number;
  classScheduleCount: number;
}
interface StudentDashboardCounts {
  totalLevel: number;
  totalAttendance: number;
  totalClasses: number;
  totalDuration: number;
}

interface ApiResponse {
  totalCount: number;
  students: StudentRecord[];
}

type CardProps = {
  title: string;
  value: string | number;
  description: string;
  image?: string; // <-- added
};

const Card = ({ title, value, description, image }: CardProps) => (
  <div className="bg-[#7689BD] rounded-lg shadow-md p-4 flex items-center gap-4">
    <div>
      <div className="text-[20px] text-[#fff] font-semibold mb-2">{title}</div>
      <div className="text-[14px] text-[#fff] font-semibold flex gap-2">
        {value}{" "}
        {image && (
          <Image
            src={image}
            alt={title}
            width={50}
            height={50}
            className="object-cover w-4 h-4"
          />
        )}
      </div>
      <div className="text-[12px] text-[#fff]">{description}</div>
    </div>
  </div>
);

const StudentProfile = () => {
 
  const [studentData, setStudentData] = useState<StudentData>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  interface StudentData {
    _id: string;
    username: string;
    role: string;
    status: string;
    createdDate: string;
    createdBy: string;
    updatedDate: string;
    classScheduleCount: number;
    student: {
      studentId: string;
      studentEmail: string;
      studentPhone: number;
      gender: string;
      package: string;
      course: string;
      city?: string;
      country?: string;
      photoUrl?: string;
    };
  }

  // Open modal and initialize form data
  const handleEditClick = () => {
    if (studentData) {
      setFormEmail(studentData.student.studentEmail || "");
      setFormPhone(studentData.student.studentPhone?.toString() || "");
      setIsEditModalOpen(true);
    }
  };

 


  // Handle save all changes
  const handleSaveAll = async () => {
    if (!studentData) return;
  
    setIsUpdating(true);
  
    try {
      const token = localStorage.getItem("StudentAuthToken");
      const studentId = studentData._id;
  
      if (!token) {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
        setIsUpdating(false);
        return;
      }
  
      const updateData: { student: Partial<StudentData["student"]> } = { student: {} };
  
      if (formEmail !== studentData.student.studentEmail) {
        updateData.student.studentEmail = formEmail;
      }
  
      if (formPhone !== studentData.student.studentPhone?.toString()) {
        updateData.student.studentPhone = Number(formPhone);
      }
  
      if (Object.keys(updateData.student).length === 0) {
        setIsEditModalOpen(false);
        setIsUpdating(false);
        return;
      }
  
      await axios.put(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PROFILE.STUDENT_PROFILE}/${studentId}`,
        updateData,
        {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        }
      );
  
      setStudentData((prev) =>
        prev
          ? {
              ...prev,
              student: {
                ...prev.student,
                ...updateData.student,
              },
            }
          : prev
      );

      toast.success(appSuccessToastMessages.PROFILE_UPDATED);
      setIsEditModalOpen(false);
      } catch (error) {
        toast.error(AppFailureToastMessages.PROFILE_UPDATE_FAILED);
    } finally {
      setIsUpdating(false);
    }
  };
  
  
  

 
  useEffect(() => {
    const studentId = localStorage.getItem("StudentPortalId");

    if (!studentId) {
      toast.error(AppValidationMessages.AUTH.STUDENT_REQUIRED);
    }

    if (studentId) {
      const fetchData = async () => {
        try {
          const token =
            typeof window !== "undefined"
              ? localStorage.getItem("StudentAuthToken")
              : null;

          if (!token) {
            toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
            return;
          }
          const studentId = localStorage.getItem("StudentPortalId");
          const response = await axios.get<ApiResponse>(
            `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.GET}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!studentId) {
            // StudentPortalId is required for filtering student data.
            return;
          }

          // Filter the student based on studentId
          const filteredStudent = response.data.students.find(
            (student) => student._id === studentId
          );

          if (filteredStudent) {
            // Ensure the filteredStudent matches the StudentData type
            setStudentData({
              ...filteredStudent,
              student: {
                studentId: filteredStudent.student.studentId,
                studentEmail: filteredStudent.student.studentEmail,
                studentPhone: filteredStudent.student.studentPhone,
                gender: filteredStudent.student.gender,
                package: filteredStudent.student.package,
                course: filteredStudent.student.course ?? "", // fallback if course is missing
                city: (filteredStudent.student as any).city,
                country: (filteredStudent.student as any).country,
                photoUrl: filteredStudent.student.photoUrl,
              },
            });
            
          } else {
            console.warn(
              "No matching student found for StudentPortalId:",
              studentId
            );
          }
        } catch (error) {
          toast.error(AppFailureToastMessages.STUDENT_FETCH);
        }
      };

      fetchData();
    }
  }, []);

  // Add state for dashboard stats
  const [dashboardStats, setDashboardStats] =
    useState<StudentDashboardCounts | null>(null);


  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("StudentAuthToken")
            : null;
        const studentId = localStorage.getItem("StudentPortalId");
        if (!token || !studentId) {
          return;
        }
        const response = await axios.get<StudentDashboardCounts>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.DASHBOARD.DASHBOARD_STUDENT_COUNTS}`,
          {
            params: { studentId },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDashboardStats(response.data);
        } catch (err) {
         toast.error(AppFailureToastMessages.STUDENT_FETCH);
      } 
    };
    fetchStats();
  }, []);
  return (
    <BaseLayout2>
      <div>
        <StudentHeader
          currentSection="Profile"
          showBackButton={true}
          showBackPath="dashboard"
        />

        {/* Top section */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Profile Card */}
          <div className="w-[560px] h-[246px] bg-[#54638C] rounded-lg text-white p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start">
            {/* Profile Image + Name */}
            <div className="flex flex-col items-center px-5 py-6">
              <div className="relative">
                <img
                  src={
                    studentData?.student?.photoUrl ||
                    "/assets/images/stportfolio.svg"
                  }
                  alt="profile"
                  className="w-[112px] h-[112px] rounded-full object-cover bg-center"
                />
                  {/* Edit Icon */}
                  <button
                    onClick={handleEditClick}
                    className="absolute bottom-32 -right-4 ml-8 hover:bg-[#ffffff13] bg-[#ffffff10] p-1 rounded-sm cursor-pointer"
                  >
                    <FcEditImage/>
                  </button>
                
                <h2 className="text-center text-[18px] font-semibold mt-2">
                  {studentData?.username ?? ""}
                </h2>
                <p className="text-[12px] text-[#C9C9C9] mt-0">
                  {studentData?.student?.studentEmail}
                </p>
              </div>
            </div>

            {/* Personal Info */}
            <div className="pt-8 sm:pl-8 ml-6 w-full sm:border-l border-[#BCBCBC] h-full">
              <h3 className="text-[16px] font-semibold mb-3">Personal Info</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white text-[14px]">Contact</span>
                  <span className="text-[#DADADACC] text-[12px]">
                    {studentData?.student?.studentPhone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white text-[14px]">Level</span>
                  <span className="text-[#DADADACC] text-[12px]">
                    {dashboardStats ? dashboardStats.totalLevel : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white text-[14px]">Package</span>
                  <span className="text-[#DADADACC] text-[12px]">
                    {studentData &&
                    studentData.student &&
                    studentData.student.package
                      ? studentData.student.package
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white text-[14px]">Course</span>
                  <span className="text-[#DADADACC] text-[12px]">
                    {studentData?.student?.course}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <Card
              title="Performance"
              value="72%"
              description="60% increase than Last Month"
              image="/performance.svg"
            />
            <Card
              title="Package"
              value={
                studentData &&
                studentData.student &&
                studentData.student.package
                  ? studentData.student.package
                  : "-"
              }
              description="Upgraded package"
            />
            <Card
              title="Level"
              value={dashboardStats ? dashboardStats.totalLevel : "-"}
              description="Level of the Student"
            />
            <Card
              title="Total Attendance"
              value={dashboardStats ? dashboardStats.totalAttendance : "-"}
              description="Your total attendance"
            />
          </div>
        </div>

        <div className="w-full bg-[#FAFAFB] rounded-lg dark:bg-[#343434] mt-2">
          <div className="mx-auto p-3">
            <h2 className="text-[18px] font-semibold text-black dark:text-white px-4 mt-3">
              Terms and Conditions
            </h2>
            <h3 className="text-[15px] text-black dark:text-white font-semibold mt-4 px-4">
              Your Agreement
            </h3>
            <div className="px-4 pr-12 pb-6 mt-4 rounded-md max-h-[300px] overflow-y-auto  scrollbar-none">
              <p className="mt-2 text-[13px] dark:text-[#ccc] text-justify">
                We advise that the user read the Terms and Conditions carefully
                as they govern your use of the application whether as a guest or
                registered user, explain the policies governing your use of this
                application, and provide other information regarding your
                rights.
              </p>
              <h4 className="mt-4 text-[13px] dark:text-[#ccc]">
                Admission & Registration:
              </h4>
              <p className=" text-[13px] mt-1 dark:text-[#ccc] text-justify">
                The academy’s selection is solely based on the information
                provided in the application form. If the academy finds out that
                you have merely provided misleading information or overlooked
                important information, it maintains the right to deny admission.
              </p>
              <h4 className="mt-4 text-[13px] dark:text-[#ccc]">
                Fees & Payments:
              </h4>
              <p className="text-[13px] mt-1 dark:text-[#ccc] text-justify">
                All fee payments made to the Academy—whether for the course or
                the application—are non-refundable.
              </p>
              <p className="text-[13px] mt-1 dark:text-[#ccc] text-justify">
                If a student decides to withdraw from the course midway, the
                fees already paid will not be refunded. This is precisely why we
                offer a monthly payment structure, allowing students who choose
                to discontinue to forfeit only the fee for one month.{" "}
              </p>
              <p className="text-[13px] mt-1 dark:text-[#ccc] text-justify">
                The Academy reserves the right to increase the course fees at
                any point during the program. However, any such increase will be
                communicated at least one month in advance. Increase in fee
                structure will only be made if the Academy is unable to sustain
                the rising costs associated with maintaining the quality of the
                study system.
              </p>
              <div className="text-[13px] mt-1 dark:text-[#ccc] text-justify">
                Our payment schedule is every 28 days. The payment schedule will
                cover all sessions as per the selected Plan. Students are
                required to pay the monthly fee within due date of 2 days from
                the invoice generation date.
              </div>
              <p className="text-[13px] mt-1 dark:text-[#ccc] text-justify">
                If failed to pay any amount in accordance with the payment
                schedule, the Academy reserves the right to charge a late fee of
                10% on the outstanding amount(s).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
          content: {
            position: "relative",
            inset: "auto",
            border: "none",
            background: "transparent",
            padding: 0,
            maxWidth: "42rem",
            width: "90%",
            maxHeight: "90vh",
          },
        }}
        contentLabel="Edit Profile"
        ariaHideApp={false}
      >
        <div className="bg-white dark:bg-[#252525] rounded-xl shadow-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Update Profile
            </h2>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6">
          

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            {/* Update Contact Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Update Contact
              </h3>
              <div className="space-y-4">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#54638C] focus:border-transparent outline-none bg-white dark:bg-[#343434] text-gray-800 dark:text-white"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#54638C] focus:border-transparent outline-none bg-white dark:bg-[#343434] text-gray-800 dark:text-white"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isUpdating}
              className="px-6 py-2 bg-[#54638C] text-white rounded-lg hover:bg-[#445275] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>
    </BaseLayout2>
  );
};

export default StudentProfile;
