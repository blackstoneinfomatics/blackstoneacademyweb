"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FaRegEdit } from "react-icons/fa";
import { VscGraphLeft } from "react-icons/vsc";
import { ImAttachment } from "react-icons/im";

import BaseLayout3 from "@/app/(tenant)/modules/users/supervisor/components/BaseLayout3";
import SupervisorHeader from "../../components/supervisorHeader";
import { AppApiEndpoints } from "../../../../../../_components/contents/api-endpoints";

const TeacherDetails = () => {
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
    applicationDate: string;
    candidateEmail: string;
    candidatePhoneNumber: number;
    candidateCountry: string;
    candidateCity: string;
    positionApplied: string;
    currency: string;
    expectedSalary: number;
    preferedWorkingHours: string;
    uploadResume: { type: string; data: number[] } | string;
    comments: string;
    applicationStatus: string;
    overallRating: number;
    professionalExperience: IProfessionalExperience[];
    skills: string;
    status: string;
    createdDate: string;
    createdBy: string;
    __v: number;
  }

  interface Student {
    studentId: string;
    studentFirstname: string;
    studentLastName: string;
  }

  interface StatsResponse {
    totalstudents: number;
    totalclasses: number;
    totalhours: number;
    totalearnings: number;
    monthlyData: any[];
    overallPerformance?: number; // Fetched from secondary API
  }

  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [teachers, setTeachers] = useState<ICandidateApplication>();
  const [resumeBlobUrl, setResumeBlobUrl] = useState<string | null>(null);
  const search = useSearchParams();
  const teacherId = search.get("teacherId");

  useEffect(() => {
    if (!teacherId) {
  console.error("Teacher ID not found");
  return;
}
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
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.APPLICANTS.GET_LIST}/${teacherId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        console.log("Fetched data:", data);
        setTeachers(data);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };

    const fetchStats = async () => {
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
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.DASHBOARD.GET_TEACHER_COUNTS}?teacherId=${teacherId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();

        // Fetch Overall Performance from secondary API
        let overallPerformance = 0;
        try {
          const perfResponse = await fetch(
            `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET_CLASS_STUDENT_ATT_COUNT}?teacherId=${teacherId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (perfResponse.ok) {
            const perfData = await perfResponse.json();
            overallPerformance = perfData.overallPerformance || 0;
          }
        } catch (perfError) {
          console.warn("Failed to fetch overall performance:", perfError);
        }

        console.log("Merged stats:", { ...data, overallPerformance });
        setStats({ ...data, overallPerformance });
      } catch (err: any) {
        console.log(err.message ?? "Unknown error");
      }
    };

    fetchStats();
    fetchTeachers();
  }, [teacherId]);

  // Format working hours like "32h 40m"
  const formatWorkingHours = (hours: number | string) => {
    if (typeof hours === "number") {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      return `${h}h ${m}m`;
    }
    return hours;
  };

  // Resume viewing functions (same as recruitment page)
  function base64ToBlob(base64: string, contentType = 'application/pdf'): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  function getResumeBlobUrl(uploadResume?: string | { type: string; data: number[] }): string | undefined {
    if (!uploadResume) return undefined;

    if (typeof uploadResume === 'string') {
      const base64Data = uploadResume.includes('base64,')
        ? uploadResume.split('base64,')[1]
        : uploadResume;
      const blob = base64ToBlob(base64Data);
      return URL.createObjectURL(blob);
    } else if (uploadResume.data && uploadResume.type) {
      const byteArray = new Uint8Array(uploadResume.data);
      const blob = new Blob([byteArray], { type: uploadResume.type });
      return URL.createObjectURL(blob);
    }
    return undefined;
  }

  const handleResumeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!teachers?.uploadResume) return;

    const url = getResumeBlobUrl(teachers.uploadResume);
    if (url) {
      setResumeBlobUrl(url);
      window.open(url, '_blank');
    }
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (resumeBlobUrl) URL.revokeObjectURL(resumeBlobUrl);
    };
  }, [resumeBlobUrl]);

  return (
    <BaseLayout3>
      <SupervisorHeader
        currentSection="Teacher Details"
        showBackButton={true}
        showBackPath="/modules/users/supervisor/ui/teachers"
      />
      <div className="p-2 mx-auto">
        {/* Main Container */}
        <div className="flex gap-x-5 w-auto">
          {/* Left Profile Card */}
          <div className="bg-white dark:bg-[#3b3b3b] shadow-lg rounded-xl p-0 h-[616px] w-[400px]">
            {/* Header with edit icon */}
            <div className="bg-[#5e6578] h-[200px] rounded-t-xl relative">
              {/* Profile image */}
              <div className="absolute left-1/2 -bottom-16 transform -translate-x-1/2">
                <Image
                  className="rounded-full border-2 border-white"
                  src={"/assets/images/proff.jpg"}
                  width={155}
                  height={155}
                  alt="Profile"
                />
              </div>
            </div>
            {/* Name and role */}
            <div className="pt-20 pb-2 text-center">
              <h2 className="text-xl font-semibold text-[#22223b] dark:text-[#fff]">
                {teachers?.candidateFirstName ?? "Will Jonto"}
              </h2>
              <p className="text-[#4b5563] dark:text-[#a1a1a1] text-sm">
                Teacher
              </p>
            </div>
            {/* Divider */}
            <hr className="my-2 border-gray-200" />
            {/* Personal Info */}
            <div className="px-6 pb-6">
              <h3 className="text-[16px] font-semibold mb-4 text-[#22223b] dark:text-[#fff]">
                Personal Info
              </h3>
              <ul className="space-y-2 text-[14px]">
                <li className="flex justify-between">
                  <span className="font-normal text-gray-600 dark:text-[#fff] opacity-[90%]">
                    Full Name
                  </span>
                  <span className="text-gray-500 text-[12px] dark:text-[#a1a1a1]">
                    {teachers?.candidateFirstName} {teachers?.candidateLastName}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="font-normal text-gray-600 dark:text-[#fff] opacity-[90%]">
                    Email
                  </span>
                  <span className="text-gray-500 text-[12px] dark:text-[#a1a1a1]">
                    {teachers?.candidateEmail}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="font-normal text-gray-600 dark:text-[#fff] opacity-[90%]">
                    Country
                  </span>
                  <span className="text-gray-500 text-[12px] dark:text-[#a1a1a1]">
                    {teachers?.candidateCountry}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="font-normal text-gray-600 dark:text-[#fff] opacity-[90%]">
                    Level
                  </span>
                  <span className="text-gray-500 text-[12px] dark:text-[#a1a1a1]">
                    {teachers?.overallRating}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="font-normal text-gray-600 dark:text-[#fff] opacity-[90%]">
                    Date Of Joining
                  </span>
                  <span className="text-gray-500 text-[12px] dark:text-[#a1a1a1]">
                    {teachers?.applicationDate && new Date(teachers.applicationDate).toLocaleDateString()}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="font-normal text-gray-600 dark:text-[#fff] opacity-[90%]">
                    Course Handling
                  </span>
                  <span className="text-gray-500 text-[12px] dark:text-[#a1a1a1]">
                    {teachers?.positionApplied}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="font-normal text-gray-600 dark:text-[#fff] opacity-[90%]">
                    BioData
                  </span>
                  <button
                    onClick={handleResumeClick}
                    className="text-[#5183ca] underline flex items-center gap-1 hover:text-[#3a6cb3]"
                    disabled={!teachers?.uploadResume}
                  >
                    <ImAttachment className="w-4 h-4" />
                    Resume
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Section */}
          <div className="items-center rounded-xl w-[915px] h-[616px]">
            {/* Lecture Performance */}
            <div className="bg-[#5e6578] h-[316px] text-white p-4 rounded-2xl shadow-lg text-center flex flex-col justify-center items-center">
              <h4 className="text-[24px] font-medium">Lecture Performance</h4>
              <div className="flex items-center space-x-4 mt-4">
                <div className="text-center">
                  <p className="text-[20px] font-medium">{stats?.overallPerformance?.toFixed(1) ?? 0}%</p>
                  <p className="text-[16px] font-normal">
                    Overall Performance Score
                  </p>
                </div>
              </div>
              <div className="bg-[#6e768c] p-4 mt-4 rounded-xl">
                <p className="text-[14px] font-normal">
                  Performance has increased by 20% than the Previous Month
                </p>
              </div>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                {
                  title: "Total Students",
                  value: stats?.totalstudents?.toString() ?? "-",
                  sub: "60% increase than Last Month",
                },
                {
                  title: "Total Classes",
                  value: stats?.totalclasses?.toString() ?? "-",
                  sub: "80% increase than Last Month",
                },
                {
                  title: "Total Earnings",
                  value: stats?.totalearnings?.toString() ?? "-",
                  sub: "90% Progressive than Last Month",
                },
                {
                  title: "Total Working Hours",
                  value: formatWorkingHours(stats?.totalhours ?? "-"),
                  sub: "95% Progressive than Last Month",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-[#7689bd] text-white p-6 rounded-2xl shadow-lg"
                >
                  <h4 className="text-[20px] font-semibold mb-[19px]">
                    {item.title}
                  </h4>
                  <p className="text-[15px] font-semibold mt-2 flex gap-1">
                    {item.value}{" "}
                    <VscGraphLeft className="rotate-180 mt-[2px]" />
                  </p>
                  <p className="text-[12px] mt-1">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BaseLayout3>
  );
};

export default TeacherDetails;