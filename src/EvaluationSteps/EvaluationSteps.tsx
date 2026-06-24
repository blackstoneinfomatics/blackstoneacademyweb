"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CountryDropdown } from "react-country-region-selector";
import ISO6391 from "iso-639-1";
import {
  CalendarDays,
  Clock3,
  Trash2,
  PlusCircle,
  CheckCircle,
} from "lucide-react";
import TimezoneSelect from "react-timezone-select";
import { getSocket } from "@/app/utils/socket";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";

interface AcademicCoach {
  academicCoachId: string; // Assuming it's a string or number
  name: string;
  role: string;
  email: string;
}

interface StudentData {
  _id: string; // Assuming _id is a string, or use ObjectId if you're using MongoDB
  studentId:string;
  firstName: string;
  lastName: string;
  academicCoach: AcademicCoach;
  email: string;
  gender: string; // Assuming it's a string
  phoneNumber: string;
  city: string; // If it's a number, you can change this to `number`
  country: string;
  countryCode: string; // Assuming it's a string
  learningInterest: string; // Assuming it's a string, could be an array of strings if needed
  numberOfStudents: number; // Assuming this is a number
  preferredTeacher: string; // Assuming it's a string, or can be an object if needed
  preferredFromTime: string; // Or use `Date` if it's a Date object
  preferredToTime: string; // Or use `Date` if it's a Date object
  timeZone: string; // Assuming it's a string
  referralSource: string; // Assuming it's a string, could be an enum if fixed
  startDate: string; // Or use `Date` if it's a Date object
  evaluationStatus: string; // Assuming it's a string (e.g., "Completed", "Pending")
  status: string; // Assuming it's a string (e.g., "Active", "Inactive")
  createdDate: string; // Or use `Date` if it's a Date object
  createdBy: string; // Assuming it's a string (could be an object or ID if needed)
  lastUpdatedBy: string; // Same as createdBy
  lastUpdatedDate: string; // Or use `Date` if it's a Date object
}

// Interface for Evaluation Data
interface EvaluationData {
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentGender: string;
  studentCity: string;
  studentPhone: number;
  studentCountry: string;
  studentCountryCode: string;
  learningInterest: string;
  numberOfStudents: number;
  preferredTeacher: string;
  preferredFromTime: string;
  preferredToTime: string;
  timeZone: string;
  referralSource: string;
  preferredDate: Date;
  evaluationStatus: string;
  status: string;
  createdDate: Date;
  createdBy: string;
}

// Step 1 Component
const Step1: React.FC<{ nextStep: (data: any) => void }> = ({ nextStep }) => {
  const steps = [
    {
      id: "step1",
      step: "1",
      title: "Clarify",
      description: "Clarify your interest from our experienced teacher",
      color: "bg-gradient-to-br from-purple-600 to-blue-600",
      icon: "👋",
    },
    {
      id: "step2",
      step: "2",
      title: "Assess",
      description: "Assess your level with our best evaluation test exams",
      color: "bg-gradient-to-br from-blue-500 to-teal-400",
      icon: "🖊️",
    },
    {
      id: "step3",
      step: "3",
      title: "Schedule",
      description: "Schedule a time for your evaluation",
      color: "bg-gradient-to-br from-orange-400 to-pink-500",
      icon: "📅",
    },
    {
      id: "step4",
      step: "4",
      title: "Question",
      description: "Ask and clarify all your doubts",
      color: "bg-gradient-to-br from-red-500 to-purple-500",
      icon: "❓",
    },
  ];

  const handleStartEvaluations = () => {
    console.log("1>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>...");
    const validData = {
      /* your valid data here */
    };
    nextStep(validData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center relative overflow-hidden p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/assets/images/grid.svg')] opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 to-blue-500/10"></div>

      {/* Logo */}
      <div className="absolute top-0 left-5 p-10 hover:scale-105 transition-transform">
        <Image
         src="/assets/images/blackstone.png"
          alt="Logo"
          className="w-40 drop-shadow-2xl"
          width={100}
          height={100}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
          Purpose of{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Evaluation
          </span>
        </h1>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Begin your learning journey with a personalized evaluation process
          designed just for you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl overflow-hidden hover:scale-105 transition-all duration-300"
            >
              <div
                className={`absolute inset-0 ${item.color} opacity-90`}
              ></div>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>

              <div className="relative p-6 h-full flex flex-col items-center text-center">
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  {item.title}
                </h2>
                <p className="text-white/80 text-sm">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm mb-6">
            Unlocking Knowledge Anywhere Anytime Lets Learn Together
          </p>
          <button
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-full
                     font-semibold hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 
                     transition-all duration-200 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 
                     focus:ring-offset-gray-900"
            onClick={handleStartEvaluations}
          >
            Start Evaluations →
          </button>
        </div>
      </div>
    </div>
  );
};

// Step 2 Component

// Step 2 Component
const Step2: React.FC<{
  prevStep: () => void;
  nextStep: (data: StudentData) => void;
  studentDatas?: StudentData;
}> = ({ prevStep, nextStep, studentDatas }) => {
  const [studentData, setStudentData] = useState<StudentData>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Make details editable in Step2 and propagate to later steps
  const [editableStudentData, setEditableStudentData] = useState<StudentData | null>(null);
  const id = window.location.href;
  const queryString = id.split("?")[1]; // Extract the query string
  const params = new URLSearchParams(queryString);
  const studentId = params.get("studentId");

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("AcademicCoachAuthToken")
            : null;

        if (!token) {
          console.error("❌ AdminAuthToken not found");
          return;
        }
        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.STUDENT.GET_LIST}/${studentId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("response>>>", response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched student data:", data);
        setStudentData(data);
        setEditableStudentData(data); // initialize editable copy
        localStorage.setItem("studentData", JSON.stringify(data));
        console.log(studentData);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const handleStudentDataChange = (field: keyof StudentData, value: any) => {
    setEditableStudentData((prev) => (prev ? { ...prev, [field]: value } as StudentData : prev));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading student data...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!studentData || !editableStudentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">No student data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-10 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/assets/images/grid.svg')] opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>

      {/* Logo */}
      <div className="absolute top-0 left-5 p-10 hover:scale-105 transition-transform">
        <Image
          src="/assets/images/blackstone.png"
          alt="Logo"
          className="w-40 drop-shadow-2xl"
          width={100}
          height={100}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          Student Details
        </h1>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <div
            key={editableStudentData.email || editableStudentData.phoneNumber?.toString()}
            className="mb-8 last:mb-0"
          >
            <h2 className="text-2xl font-semibold text-white mb-4">
              {editableStudentData.firstName || "N/A"} {editableStudentData.lastName || "N/A"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
          
                { label: "Email", field: "email", type: "email" },
                { label: "Phone Number", field: "phoneNumber", type: "tel" },
                { label: "City", field: "city", type: "text" },
                { label: "Country", field: "country", type: "text" },
                { label: "Country Code", field: "countryCode", type: "text" },
                { label: "Learning Interest", field: "learningInterest", type: "text" },
                { label: "Number of Students", field: "numberOfStudents", type: "number" },
                { label: "Preferred Teacher", field: "preferredTeacher", type: "text" },
                { label: "Preferred From Time", field: "preferredFromTime", type: "time" },
                { label: "Preferred To Time", field: "preferredToTime", type: "time" },
                { label: "Time Zone", field: "timeZone", type: "text" },
                { label: "Referral Source", field: "referralSource", type: "text" },
                { label: "Evaluation Status", field: "evaluationStatus", type: "text" },
              ].map(({ label, field, type }) => (
                <div key={label} className="group">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white/60 group-hover:text-white/90 transition-colors">
                      {label === "Email"
                        ? "📧"
                        : label === "Phone Number"
                        ? "📞"
                        : label.includes("Time")
                        ? "⏰"
                        : label === "City" || label === "Country" || label === "Country Code"
                        ? "🌍"
                        : label === "Time Zone"
                        ? "🌐"
                        : label === "Referral Source"
                        ? "📢"
                        : label === "Preferred Teacher"
                        ? "👨‍🏫"
                        : label === "Number of Students"
                        ? "👥"
                        : label === "Evaluation Status"
                        ? "📋"
                        : ""}
                    </span>
                    <label className="text-sm font-semibold text-white/60 group-hover:text-white/90 transition-colors">
                      {label}
                    </label>
                  </div>
                  <input
                    type={type}
                    value={(editableStudentData as any)[field] ?? ""}
                    onChange={(e) =>
                      handleStudentDataChange(field as keyof StudentData, type === "number" ? Number(e.target.value) : e.target.value)
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white
                       focus:bg-white/10 focus:border-white/20 focus:ring-2 focus:ring-purple-500/20
                       transition-all duration-200"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 text-white transition-all duration-300 
                     bg-white/10 hover:bg-white/20 rounded-lg group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            <span>Back</span>
          </button>

          <button
            onClick={() => {
              console.log("Passing edited studentData to next step:", editableStudentData);
              nextStep(editableStudentData as StudentData);
            }}
            className="flex items-center gap-2 px-6 py-3 text-white transition-all duration-300 
                     bg-gradient-to-r from-blue-500 to-purple-500 
                     hover:from-blue-600 hover:to-purple-600 rounded-lg group"
          >
            <span>Next</span>
            <span className="transform group-hover:translate-x-1 transition-transform duration-300">
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Step 3 Component
const Step3 = ({
  prevStep,
  nextStep,
  studentData,
}: {
  prevStep: () => void;
  nextStep: (studentData: StudentData) => void;
  studentData: StudentData;
}) => {
  console.log("Student Data in Step3:", studentData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-10 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/assets/images/grid.svg')] opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>

      {/* Logo */}
      <div className="absolute top-0 left-5 p-10 hover:scale-105 transition-transform">
        <Image
         src="/assets/images/blackstone.png"
          alt="Logo"
          className="w-40 drop-shadow-2xl"
          width={100}
          height={100}
        />
      </div>

      {/* User Info */}
      <div className="absolute top-5 right-5 bg-white/10 backdrop-blur-lg rounded-full px-6 py-2">
        <div className="text-sm font-semibold text-white flex items-center gap-2">
          {studentData.firstName}&nbsp;{studentData.lastName}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Skills Selection */}
        <div className="flex items-center justify-between mb-12">
          <div className="relative group">
            <select
              className="appearance-none bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-lg
                           border border-white/20 focus:border-white/30 focus:ring-2 focus:ring-purple-500/20
                           transition-all duration-200 pr-12"
            >
              <option>Skills: Arabic</option>
              <option>Skills: English</option>
              <option>Skills: French</option>
            </select>
            <div
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none
                          group-hover:text-white/90 transition-colors"
            >
              ▼
            </div>
          </div>
          <div
            className="text-white/80 font-medium px-6 py-2 bg-white/10 backdrop-blur-md rounded-lg
                         border border-white/20"
          >
            Skills: Reading & Listening
          </div>
        </div>

        {/* Word Display Card */}
        <div
          className="bg-white/10 backdrop-blur-md rounded-2xl p-12 shadow-xl text-center mb-12
                     transform hover:scale-105 transition-all duration-300"
        >
          <h1 className="text-3xl font-bold text-white mb-8">
            Read the following word
          </h1>
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur"></div>
            <div className="relative bg-gray-900 rounded-lg p-8">
              <div
                className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r 
                           from-blue-400 to-purple-400 arabic-text"
              >
                رسلها
              </div>
            </div>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex justify-center mb-12">
          <button
            className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-full
                         hover:bg-white/20 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-white/60 group-hover:text-white/90">
                🎙️
              </span>
              <span className="text-white/80 group-hover:text-white">
                Click to Record
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Buttons - Add this at the bottom of the main content div */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 text-white transition-all duration-300 
                       bg-white/10 hover:bg-white/20 rounded-lg group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            <span>Back</span>
          </button>

          {/* Progress Indicators */}
          <div className="flex space-x-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  index === 1
                    ? "bg-gradient-to-r from-blue-400 to-purple-400 w-8"
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>

          <button
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg
                     hover:from-blue-600 hover:to-purple-600 transition-all duration-200
                     flex items-center space-x-2"
            onClick={() => {
              nextStep(studentData);
            }}
          >
            <span>Next</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Optional: Add floating decorative elements */}
      <div className="absolute top-20 right-20 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"></div>
    </div>
  );
};
// Step 4 Component
const Step4 = ({
  prevStep,
  nextStep,
  studentData,
}: {
  prevStep: () => void;
  nextStep: (studentData: StudentData) => void;
  studentData: StudentData;
}) => {
  const [time, setTime] = useState(120); // 120 seconds = 2 minutes
  const [isActive, setIsActive] = useState(false);
  console.log(studentData);
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isActive && time > 0) {
      intervalId = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    }
    if (time === 0) {
      setIsActive(false);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isActive, time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    setTime(120);
    setIsActive(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-10 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/assets/images/grid.svg')] opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>

      {/* Logo */}
      <div className="absolute top-0 left-5 p-10 hover:scale-105 transition-transform">
        <Image
          src="/assets/images/blackstone.png"
          alt="Logo"
          className="w-40 drop-shadow-2xl"
          width={100}
          height={100}
        />
      </div>

      {/* User Info */}
      <div className="absolute top-5 right-5 bg-white/10 backdrop-blur-lg rounded-full px-6 py-2">
        <div className="text-sm font-semibold text-white flex items-center gap-2">
          {studentData.firstName}&nbsp;{studentData.lastName}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Skills Selection */}
        <div className="flex items-center justify-between mb-12">
          <div className="relative group">
            <select
              className="appearance-none bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-lg
                           border border-white/20 focus:border-white/30 focus:ring-2 focus:ring-purple-500/20
                           transition-all duration-200 pr-12"
            >
              <option>Skills: Arabic</option>
              <option>Skills: English</option>
              <option>Skills: French</option>
            </select>
            <div
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none
                          group-hover:text-white/90 transition-colors"
            >
              ▼
            </div>
          </div>
          <div
            className="text-white/80 font-medium px-6 py-2 bg-white/10 backdrop-blur-md rounded-lg
                         border border-white/20"
          >
            Skills: Speaking
          </div>
        </div>

        {/* Timer Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 shadow-xl text-center mb-12">
          <h1
            className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r 
                      from-blue-400 to-purple-400 mb-8"
          >
            Talk about yourself within two minutes
          </h1>

          {/* Timer Display */}
          <div className="relative mb-12">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md"></div>
            <div className="relative bg-gray-900/80 backdrop-blur-md rounded-full p-8 inline-block">
              <div
                className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r 
                           from-blue-400 to-purple-400 tabular-nums"
              >
                {formatTime(time)}
              </div>
            </div>
          </div>

          {/* Recording Button */}
          <button
            className={`relative group px-8 py-4 rounded-full transition-all duration-300 
                     ${
                       isActive
                         ? "bg-red-500/20 hover:bg-red-500/30"
                         : "bg-white/10 hover:bg-white/20"
                     }`}
            onClick={handleStart}
            disabled={isActive}
          >
            <div className="flex items-center space-x-3">
              {isActive && (
                <span className="absolute -left-1 -top-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
              )}
              <span
                className={`text-2xl ${
                  isActive ? "text-red-400" : "text-white/60"
                } 
                            group-hover:scale-110 transition-transform`}
              >
                🎙️
              </span>
              <span className="text-white/80 group-hover:text-white">
                {isActive ? "Recording..." : "Click to Start Recording"}
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Buttons - Add this at the bottom of the main content div */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 text-white transition-all duration-300 
                       bg-white/10 hover:bg-white/20 rounded-lg group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            <span>Back</span>
          </button>

          {/* Progress Indicators */}
          <div className="flex space-x-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  index === 2
                    ? "bg-gradient-to-r from-blue-400 to-purple-400 w-8"
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>

          <button
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg
                     hover:from-blue-600 hover:to-purple-600 transition-all duration-200
                     flex items-center space-x-2"
            onClick={() => {
              nextStep(studentData);
            }}
          >
            <span>Next</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"></div>
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-purple-500/5 transition-all duration-500"></div>
      )}
    </div>
  );
};

// Step 5 Component
const Step5 = ({
  prevStep,
  nextStep,
  studentData,
}: {
  prevStep: () => void;
  nextStep: (updatedStudentData: any) => void;
  studentData: StudentData;
}) => {
  const [isLanguageChecked, setIsLanguageChecked] = useState(false);
  const [isReadingChecked, setIsReadingChecked] = useState(false);
  const [isGrammarChecked, setIsGrammarChecked] = useState(false);
  const [languageLevel, setLanguageLevel] = useState("");
  const [readingLevel, setReadingLevel] = useState("");
  const [grammarLevel, setGrammarLevel] = useState<string>("");
  const [accomplishmentTime, setAccomplishmentTime] = useState<number>(0);
  const [studentRate, setStudentRate] = useState(0);
  const [expectedFinishingDate] = useState(28);
  const [subscriptionName, setSubscriptionName] = useState<string>();
  const [planTotalPrice, setPlanTotalPrice] = useState<number>();
  const [selectedHours, setSelectedHours] = useState<number>(0); 

  // First, add state to track which plan's total is being calculated
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [classType, setClassType] = useState<string | null>(null);

  const handleSelect = (type: string) => {
    setClassType(type.toUpperCase());
  };
  console.log(selectedPlan);
  // Modify the calculatePrice function to return null if plan isn't selected
  const calculatePrice = (rate: number, planLabel: string) => {
    if (selectedPlan !== planLabel) {
      return "";
    }
    return selectedHours * rate * 4;
  };
  useEffect(() => {
    // Only set planTotalPrice when a plan is selected
    if (selectedPlan) {
      const plan = pricingPlans.find((p) => p.label === selectedPlan);
      if (plan) {
        const price = calculatePrice(plan.rate, plan.label);
        setPlanTotalPrice(price || 0);
      }
    }
  }, [selectedPlan, selectedHours]);

  // Pricing plans data
  const pricingPlans = [
    { label: "Simple", rate: 8, basePrice: "$8/h" },
    { label: "Essential", rate: 9, basePrice: "$9/h" },
    { label: "Pro", rate: 11, basePrice: "$11/h" },
    { label: "Elite", rate: 16, basePrice: "$16/h" },
  ];
  const handleNextStep = () => {
    const updatedStudentData = {
      ...studentData,
      isLanguageChecked,
      isReadingChecked,
      isGrammarChecked,
      languageLevel,
      readingLevel,
      grammarLevel,
      accomplishmentTime,
      studentRate,
      expectedFinishingDate,
      subscriptionName,
      selectedHours,
      planTotalPrice,
      classType,
    };
    nextStep(updatedStudentData); // Pass updated data to nextStep
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-10 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/assets/images/grid.svg')] opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>

      {/* Logo */}
      <div className="absolute top-0 left-5 p-10 hover:scale-105 transition-transform">
        <Image
          src="/assets/images/blackstone.png"
          alt="Logo"
          className="w-40 drop-shadow-2xl"
          width={100}
          height={100}
        />
      </div>

      {/* User Info */}
      <div className="absolute top-5 right-5 bg-white/10 backdrop-blur-lg rounded-full px-6 py-2">
        <div className="text-sm font-semibold text-white flex items-center gap-2">
          {studentData.firstName}&nbsp;{studentData.lastName}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Arabic Language Course Selection
          </h1>

          <h2 className="text-white/90 font-light hover:text-white transition-colors mb-2">
            Level
          </h2>

          {/* Level Section */}
          <div className="flex items-center justify-between mb-2 bg-white/5 p-3 rounded-xl">
            {/* My Beautiful Language Section */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="checkbox"
                  id="my-beautiful-language"
                  checked={isLanguageChecked}
                  onChange={(e) => setIsLanguageChecked(e.target.checked)}
                  className="w-3 h-3 border-white/20 bg-white/10
                           checked:bg-gradient-to-r checked:from-blue-500 checked:to-purple-500
                           focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                />
                &nbsp; &nbsp;
                <label
                  htmlFor="my-beautiful-language"
                  className="text-white/90 font-normal text-[12px] hover:text-white transition-colors"
                >
                  My Beautiful Language
                </label>
              </div>
              {isLanguageChecked && (
                <select
                  className="bg-white/10 text-white/90 border border-white/20 rounded-lg px-4 py-2
                                focus:ring-2 focus:ring-purple-500/20 focus:border-white/30 transition-all duration-200 text-[12px]"
                  onChange={(e) => setLanguageLevel(e.target.value)}
                >
                   <option className="bg-gray-900">Select</option>
                  <option className="bg-gray-900">Level: A1</option>
                  <option className="bg-gray-900">Level: A2</option>
                  <option className="bg-gray-900">Level: A3</option>
                  <option className="bg-gray-900">Level: A4</option>
                </select>
              )}
            </div>

            {/* Reading Section */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="reading"
                checked={isReadingChecked}
                onChange={(e) => setIsReadingChecked(e.target.checked)}
                className="h-3 w-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="reading"
                className="text-white font-normal text-[12px]"
              >
                Reading
              </label>
              {isReadingChecked && (
                <select
                  className="bg-white/10 text-white/90 border border-white/20 rounded-lg px-4 py-2
                                focus:ring-2 focus:ring-purple-500/20 focus:border-white/30 transition-all duration-200 text-[12px]"
                  onChange={(e) => setReadingLevel(e.target.value)}
                >
                  <option className="bg-gray-900">Select</option>
                  <option className="bg-gray-900">1</option>
                  <option className="bg-gray-900">2</option>
                  <option className="bg-gray-900">3</option>
                  <option className="bg-gray-900">4</option>
                  <option className="bg-gray-900">5</option>
                </select>
              )}
            </div>

            {/* Grammar Section */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="grammar"
                checked={isGrammarChecked}
                onChange={(e) => setIsGrammarChecked(e.target.checked)}
                className="h-3 w-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="grammar"
                className="text-white font-normal text-[12px]"
              >
                Grammar
              </label>
              {isGrammarChecked && (
                <select
                  className="bg-white/10 text-white border border-white/20 rounded-lg px-4 py-2
                                focus:ring-2 focus:ring-purple-500/20 focus:border-white/30 transition-all duration-200 text-[12px]"
                  onChange={(e) => setGrammarLevel(e.target.value)}
                >
                  <option className="bg-gray-900">Select</option>
                  <option className="bg-gray-900">0</option>
                  <option className="bg-gray-900">1</option>
                  <option className="bg-gray-900">2</option>
                  <option className="bg-gray-900">3</option>
                  <option className="bg-gray-900">4</option>
                  <option className="bg-gray-900">5</option>
                </select>
              )}
            </div>
          </div>

          {/* Hours Section */}
          <div className="mb-4">
            <h2 className="text-base font-light text-white/90 mb-2">
              Select Preferred Hours / week
            </h2>
            <div className="flex flex-wrap gap-3">
              {[1, 1.5, 2, 2.5, 3, 4, 5].map((hour) => (
                <button
                  key={hour}
                  onClick={() => {
                    setSelectedHours(hour);
                    setAccomplishmentTime(hour * 4);
                    setStudentRate(hour);
                  }}
                  className={`px-4 py-1 rounded-xl transition-all duration-300 transform hover:scale-105
                           ${
                             hour === selectedHours
                               ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                               : "bg-white/10 text-white/80 hover:bg-white/20"
                           }`}
                >
                  {hour}h
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mb-2">
            <h2 className="text-base font-light text-white/90 mb-2">
              Select Preferred Pricing per month
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {pricingPlans.map((plan) => (
                <button
                  key={plan.label}
                  className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105"
                    onClick={() => {
                    if (selectedHours > 0) {
                      setSelectedPlan(plan.label);
                      setSubscriptionName(plan.label); // Set the selected plan when clicked
                    } else {
                      toast.error(AppValidationMessages.EVALUATION.PREFERRED_HOURS_REQUIRED);
                    }
                  }}
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 
                            group-hover:opacity-100 transition-opacity duration-300"
                  ></div>
                  <div
                    className="relative bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10
                            group-hover:border-white/20 transition-all duration-300"
                  >
                    {/* Plan Name Section */}
                    <div className="border-b border-white/10 pb-3 mb-3">
                      <h3 className="text-sm font-bold text-white">
                        {plan.label}
                      </h3>
                    </div>

                    {/* Rate Per Hour Section */}
                    <div className="border-b border-white/10 pb-3 mb-3">
                      <div
                        className="text-lg text-center font-bold text-transparent bg-clip-text bg-gradient-to-r 
                                from-blue-400 to-purple-400"
                      >
                        {plan.basePrice}
                      </div>
                    </div>

                    {/* Total Section */}
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-sm text-white/60 mb-1">Total</div>
                      <div className="text-xl font-semibold text-white">
                        {(() => {
                          if (
                            selectedPlan === plan.label &&
                            planTotalPrice !== undefined
                          ) {
                            return `$${planTotalPrice.toFixed(2)}`;
                          }
                          return ""; // Return an empty string if conditions are not met
                        })()}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Completion Section */}
          <div className="flex flex-wrap items-center justify-between mt-3 bg-white/5 p-3 rounded-xl">
            <div className="text-white/80 text-[12px]">
              Accomplishment Time:{" "}
              <span className="font-normal text-white text-[10px]">
                {accomplishmentTime} Hours
              </span>
            </div>
            <div className="text-white/80 text-[12px]">
              Your Rate:{" "}
              <span className="font-normal text-white text-[10px]">
                {studentRate} hr/week
              </span>
            </div>
            <div className="text-white/80 text-[12px]">
              Expected Finishing Date:{" "}
              <span className="font-normal text-[10px] text-white">
                28 Days
              </span>
            </div>
          </div>
          <div className="mb-2 mt-2">
            <h2 className="text-base font-light text-white/90 mb-3">
              Class Type :
            </h2>
            <div className="flex gap-3">
              {["REGULARCLASS", "GROUPCLASS"].map((type) => (
                <button
                  key={type}
                  onClick={() => handleSelect(type)}
                  className={`px-3 py-1 rounded-md text-sm font-light uppercase transition-colors duration-200
              ${
                classType === type
                  ? "bg-white text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Buttons - Add this at the bottom of the main content div */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 text-white transition-all duration-300 
                       bg-white/10 hover:bg-white/20 rounded-lg group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            <span>Back</span>
          </button>

          {/* Progress Indicators */}
          <div className="flex space-x-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  index === 3
                    ? "bg-gradient-to-r from-blue-400 to-purple-400 w-8"
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>

          <button
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg
                     hover:from-blue-600 hover:to-purple-600 transition-all duration-200
                     flex items-center space-x-2"
            onClick={handleNextStep}
          >
            <span>Next</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"></div>
    </div>
  );
};
const Step6 = ({
  prevStep,
  nextStep,
  updatedStudentData,
}: {
  prevStep: (updatedStudentData: any) => void;
  nextStep: (updatedStudentDatas: any) => void;
  updatedStudentData: any;
}) => {
  console.log(updatedStudentData);
  interface TimeSlot {
    startTime: string;
    endTime: string;
  }

  interface ScheduleItem {
    day: string;
    times: TimeSlot[];
    isSelected: boolean;
  }
  const [teachers, setTeachers] = useState<TeacherList[]>([]);
  interface TeacherList {
    teacherId: string;
    teacherName: string;
  }
  interface Teacher {
    _id: string;
    userName: string;
    email: string;
    password: string;
    role: string[];
    profileImage: string | null;
    status: string;
    createdBy: string;
    lastUpdatedBy: string;
    userId: string;
    lastLoginDate: string;
    createdDate: string;
    lastUpdatedDate: string;
  }
  type WeeklySlotMap = {
    [day: string]: { from: string; to: string }[];
  };
  interface TimeSlot {
    startTime: string;
    endTime: string;
  }

  interface ScheduleItem {
    day: string;
    times: TimeSlot[];
    isSelected: boolean;
  }
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherList | null>(
    null
  );
  const [startDate, setStartDate] = useState("");
  const [trailStartDate, setTrailStartDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [fromHour, setFromHour] = useState("");
  const [fromMinute, setFromMinute] = useState("");
  const [suggestedSlots, setSuggestedSlots] = useState<WeeklySlotMap>({});
  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].map((day) => ({
      day,
      times: [],
      isSelected: false,
    }))
  );
  const weeklyHourLimit = updatedStudentData.selectedHours;
  const isGroupClass = updatedStudentData.classType === "GROUPCLASS";
  const buildWeeklySlots = () => {
    const map: WeeklySlotMap = {};
    schedule.forEach((item) => {
      if (item.isSelected && item.times.length > 0) {
        map[item.day] = item.times.map((t) => ({
          from: t.startTime,
          to: t.endTime,
        }));
      }
    });
    return map;
  };

  const calculateTotalHours = () => {
    let totalHours = 0;

    schedule.forEach((item) => {
      if (item.isSelected) {
        item.times.forEach((time) => {
          if (time.startTime && time.endTime) {
            const start = new Date(`2023-01-01T${time.startTime}`);
            const end = new Date(`2023-01-01T${time.endTime}`);
            const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Convert to hours
            totalHours += diff;
          }
        });
      }
    });

    return totalHours;
  };
  const showRemainingHoursPopup = () => {
    const totalHours = calculateTotalHours();
    const remainingHours = weeklyHourLimit - totalHours;

    if (remainingHours === 0) {
      toast.warning(AppValidationMessages.EVALUATION.WEEKLY_HOUR_LIMIT, {
        className:
          "w-[340px] px-4 py-3 text-sm rounded-lg shadow bg-yellow-600 text-white",
      });
    } else {
      toast.info(
        `You have ${remainingHours.toFixed(2)} hours remaining this week.`,
        {
          className:
            "w-[340px] px-4 py-3 text-sm rounded-lg shadow bg-blue-600 text-white",
        }
      );
    }
  };

  const handleNextStep = () => {
    const updatedStudentDatas = {
      ...updatedStudentData,
      joiningDate: isGroupClass ? new Date() : startDate,
      preferredTrialDate: trailStartDate,
      preferredTrialFromTime: fromTime,
      preferredTrialToTime: toTime,
      weeklySlots: buildWeeklySlots(),
      teacher:{
            teacherId: selectedTeacher?.teacherId ?? "",
            teacherName: selectedTeacher?.teacherName ?? "",
            teacherEmail: "demoteacher@gmail.com",
          },
      classDay: isGroupClass
        ? []
        : schedule
            .filter((item) => item.isSelected)
            .map((item) => ({ label: item.day, value: item.day })),
      startTime: isGroupClass
        ? []
        : schedule
            .filter((item) => item.isSelected)
            .flatMap((item) =>
              item.times.map((time) => ({
                label: time.startTime,
                value: time.startTime,
              }))
            ),
      endTime: isGroupClass
        ? []
        : schedule
            .filter((item) => item.isSelected)
            .flatMap((item) =>
              item.times.map((time) => ({
                label: time.endTime,
                value: time.endTime,
              }))
            ),
    };

    nextStep(updatedStudentDatas);
  };

  useEffect(() => {
    if (!trailStartDate || !fromTime) return;
    const calculatedToTime = moment(fromTime, "HH:mm")
      .add(30, "minutes")
      .format("HH:mm");
    setToTime(calculatedToTime);
    const academicId =
      typeof window !== "undefined"
        ? localStorage.getItem("AcademicCoachPortalId")
        : null;
    if (!academicId || !trailStartDate) return;
    const socket = getSocket(academicId);
     const position =
  updatedStudentData.learningInterest === "Islamic Studies"
    ? "Islamic Teacher"
    : `${updatedStudentData.learningInterest} Teacher`;
    console.log("📤 Sending academicTrialClassTeacherListRequest");
    console.log("📤 Sending with payload:", {
      startDate: trailStartDate,
      from: fromTime,
      to: calculatedToTime,
      position :position,
    });
    socket.emit("academicTrailClassTeacherListRequest", {
      requestId: academicId,
      startDate: trailStartDate,
      from: fromTime,
      to: calculatedToTime,
      position :position,
    });

    const handleResponse = (data: Record<string, string>) => {
      const teacherArray = Object.entries(data).map(
        ([teacherId, teacherName]) => ({
          teacherId,
          teacherName,
        })
      );
      setTeachers(teacherArray);
    };

    socket.on("academicTrailClassTeacherListResponse", handleResponse);
    return () => {
      socket.off("academicTrailClassTeacherListResponse", handleResponse);
    };
  }, [trailStartDate, fromTime]);
  useEffect(() => {
    const academicId =
      typeof window !== "undefined"
        ? localStorage.getItem("AcademicCoachPortalId")
        : null;
    if (!academicId || !startDate) return;
    const socket = getSocket(academicId);
    console.log("📤 Sending academicTeacherWeeklySlotsListRequest");
    socket.emit("academicTeacherWeeklySlotsListRequest", {
      requestId: academicId,
      startDate: startDate,
      teacherId: selectedTeacher?.teacherId,
    });

    const handleResponse = (data: WeeklySlotMap) => {
      console.log("weekyl", data);
      setSuggestedSlots(data);
    };

    socket.on("academicTeacherWeeklySlotsListResponse", handleResponse);
    return () => {
      socket.off("academicTeacherWeeklySlotsListResponse", handleResponse);
    };
  }, [startDate, selectedTeacher]);

  const normalizeTime = (time: string) => time.slice(0, 5);

  const handleAddSuggestedSlot = (day: string, from: string, to: string) => {
    if (calculateTotalHours() >= weeklyHourLimit) {
      toast.warning(AppValidationMessages.EVALUATION.WEEKLY_HOUR_LIMIT);
      return;
    }
    const index = schedule.findIndex((item) => item.day === day);
    if (index === -1) return;

    const updated = [...schedule];
    const times = updated[index].times;

    const isDuplicate = times.some(
      (t) =>
        normalizeTime(t.startTime) === normalizeTime(from) &&
        normalizeTime(t.endTime) === normalizeTime(to)
    );

    if (isDuplicate) {
      toast.error(AppValidationMessages.EVALUATION.DUPLICATE_SLOT);
      return;
    }

    updated[index].isSelected = true;
    updated[index].times.push({
      startTime: normalizeTime(from),
      endTime: normalizeTime(to),
    });

    updated[index].times.sort((a, b) => a.startTime.localeCompare(b.startTime));

    setSchedule(updated);
    showRemainingHoursPopup();
  };

  const handleRemoveSlot = (day: string, from: string, to: string) => {
    const index = schedule.findIndex((item) => item.day === day);
    if (index === -1) return;

    const updated = [...schedule];

    updated[index].times = updated[index].times.filter(
      (t) =>
        !(
          normalizeTime(t.startTime) === normalizeTime(from) &&
          normalizeTime(t.endTime) === normalizeTime(to)
        )
    );

    if (updated[index].times.length === 0) {
      updated[index].isSelected = false;
    }

    setSchedule(updated);
    showRemainingHoursPopup();
  };

  const handleTimeChange = (
    dayIndex: number,
    timeIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[dayIndex].times[timeIndex][field] = value;
    setSchedule(updatedSchedule);
  };
  const handleTimeChange1 = (hour: any, minute: any) => {
    setFromHour(hour);
    setFromMinute(minute);

    if (hour && minute) {
      setFromTime(`${hour}:${minute}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-10 relative overflow-hidden scrollbar-none">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/assets/images/grid.svg')] opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
      {/* Logo */}
      <div className="absolute top-0 left-5 p-10 hover:scale-105 transition-transform">
        <Image
          src="/assets/images/blackstone.png"
          alt="Logo"
          className="w-28 drop-shadow-2xl"
          width={100}
          height={100}
        />
      </div>

      {/* User Info */}
      <div className="absolute top-5 right-5 bg-white/10 backdrop-blur-lg rounded-full px-6 py-2">
        <div className="text-sm font-semibold text-white flex items-center gap-2">
          {updatedStudentData.firstName} &nbsp; {updatedStudentData.lastName}
        </div>
      </div>
      <div className={`relative z-10 w-full max-w-4xl `}>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <div className="flex items-center  mb-5">
            <h2 className="text-[18px] font-medium text-white">Trial Class</h2>
          </div>
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex items-center gap-2">
              <label htmlFor="ugcuc" className="font-medium text-white text-sm">
                Date:
              </label>
              <input
                type="date"
                id="ugcuc"
                className="border rounded text-sm px-1 bg-white/5 border-[#4f5154] text-[#c9c7c7]"
                value={trailStartDate}
                onChange={(e) => setTrailStartDate(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="fromTime"
                className="font-medium text-white text-sm"
              >
                From:
              </label>

              {/* Hours Dropdown */}
              <select
                value={fromHour}
                onChange={(e) => handleTimeChange1(e.target.value, fromMinute)}
                size={1}
                style={{
                  scrollbarWidth: "none",
                  overflow: "hidden",
                  WebkitOverflowScrolling: "touch",
                }}
                className="h-8 w-16 text-sm px-2 rounded border border-[#4f5154] bg-white/5 text-black appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500  dark:text-white"
              >
                <option value="">HH</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i.toString().padStart(2, "0")}>
                    {i.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>

              {/* Minutes Dropdown */}
              <select
                value={fromMinute}
                onChange={(e) => handleTimeChange1(fromHour, e.target.value)}
                className="h-8 w-16 text-sm px-2 rounded border border-[#4f5154] bg-white/5 text-black appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500  dark:text-white"
              >
                <option value="">MM</option>
                <option value="00">00</option>
                <option value="30">30</option>
              </select>
            </div>

            {/* Teacher Dropdown */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="teacher"
                className="font-medium text-white text-sm"
              >
                Teacher:
              </label>
              <select
                className="form-select w-full text-xs  text-black border-[#4f5154] bg-white/5 p-1 rounded-lg dark:text-[#c1c1c1] dark:bg-white/5"
                onChange={(e) => {
                  const selected = teachers.find(
                    (teacher) => teacher.teacherId === e.target.value
                  );
                  setSelectedTeacher(selected || null);
                }}
              >
                <option value="">Select a Teacher</option>
                {teachers.length === 0 ? (
                  <option disabled>🔍 Searching...</option>
                ) : (
                  teachers.map((teacher) => (
                    <option key={teacher.teacherId} value={teacher.teacherId}>
                      {teacher.teacherName}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between my-5">
            <h2 className="text-[18px] font-medium text-white">
              Schedule Classes
            </h2>

            <div className="flex items-center gap-2">
              <label htmlFor="ugcuc" className="font-medium text-white text-sm">
                Join Date:
              </label>
              <input
                type="date"
                id="ugcuc"
                className="border rounded text-sm px-1 bg-white/5 border-[#4f5154] text-[#c9c7c7]"
                value={startDate}
                disabled={isGroupClass}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${
              updatedStudentData.classType === "GROUPCLASS"
                ? "pointer-events-none opacity-30"
                : ""
            }`}
          >
            {schedule.map((item, index) => (
              <div
                key={item.day}
                className="flex flex-col justify-between bg-white/10 border border-[#2c3444] rounded-2xl p-4 shadow-lg transition-transform hover:scale-[1.01] duration-200"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm tracking-wide">
                    <CalendarDays size={18} className="text-blue-400" />
                    {item.day}
                  </div>
                </div>

                {/* Added Slots */}
                {item.times.length > 0 && (
                  <div className="flex flex-col gap-2 mb-3 max-h-28 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {item.times.map((time, timeIndex) => (
                      <div
                        key={`${time.startTime}-${timeIndex}`}
                        className="flex items-center gap-2 bg-[#2a3142] px-3 py-2 rounded-xl"
                      >
                        <input
                          type="time"
                          value={time.startTime}
                          onChange={(e) =>
                            handleTimeChange(
                              index,
                              timeIndex,
                              "startTime",
                              e.target.value
                            )
                          }
                          className="bg-[#12161f] border border-gray-600 text-white text-xs rounded-lg px-1 py-1 w-15 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-white text-xs">⏤</span>
                        <input
                          type="time"
                          value={time.endTime}
                          onChange={(e) =>
                            handleTimeChange(
                              index,
                              timeIndex,
                              "endTime",
                              e.target.value
                            )
                          }
                          className="bg-[#12161f] border border-gray-600 text-white text-xs rounded-lg px-1 py-1 w-15 focus:ring-2 focus:ring-blue-500"
                        />

                        {/* Remove Button */}
                        <button
                          onClick={() =>
                            handleRemoveSlot(
                              item.day,
                              time.startTime,
                              time.endTime
                            )
                          }
                          className="ml-auto text-xs px-2 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center gap-1"
                          title="Remove slot"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested Slots */}
                {suggestedSlots[item.day] && (
                  <div className="flex flex-col gap-2 max-h-32 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {suggestedSlots[item.day].map((slot, i) => {
                      const isAlready = item.times.some(
                        (t) =>
                          normalizeTime(t.startTime) ===
                            normalizeTime(slot.from) &&
                          normalizeTime(t.endTime) === normalizeTime(slot.to)
                      );

                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-[#242b38] px-3 py-2 rounded-xl"
                        >
                          <div className="flex items-center gap-1 text-white text-xs">
                            <Clock3 size={14} className="text-blue-400" />
                            {slot.from} - {slot.to}
                          </div>
                          <button
                            disabled={isAlready}
                            onClick={() =>
                              handleAddSuggestedSlot(
                                item.day,
                                slot.from,
                                slot.to
                              )
                            }
                            className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-lg transition-all ${
                              isAlready
                                ? "bg-gray-600 text-white cursor-not-allowed"
                                : "bg-[#576CBC] hover:bg-[#4459A9] text-white"
                            }`}
                          >
                            {isAlready ? (
                              <>
                                <CheckCircle size={14} /> Added
                              </>
                            ) : (
                              <>
                                <PlusCircle size={14} /> Add
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl mt-4">
        <div className="flex items-center text-right justify-between mb-8">
          <button
            onClick={() => prevStep(updatedStudentData)}
            className="flex items-center gap-2 px-6 py-3 text-white transition-all duration-300 
                     bg-white/10 hover:bg-white/20 rounded-lg group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            <span>Back</span>
          </button>
          <button
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg
                        hover:from-blue-600 hover:to-purple-600 transition-all duration-200
                        flex items-center space-x-2"
            onClick={handleNextStep}
          >
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Step 6 Component
const Step7 = ({
  prevStep,
  nextStep,
  updatedStudentDatas,
}: {
  prevStep: () => void;
  nextStep: (updatedStudentDatass: any) => void;
  updatedStudentDatas: any;
}) => {
  const [guardianName, setGuardianName] = useState<string>("");
  const [guardianEmail, setGuardianEmail] = useState<string>("");
  const [guardianPhone, setGuardianPhone] = useState<string>("");
  const [guardianCountry, setGuardianCountry] = useState<string>("");
  const [guardianCity, setGuardianCity] = useState<string>("");
  const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [guardianTimeZone, setGuardianTimeZone] =
    useState<string>(defaultTimezone);
  const [cities, setCities] = useState([]);
  const countriesCities = require("countries-cities");
  const [guardianLanguage, setGuardianLanguage] = useState("");

  // Get all languages
  const languages = ISO6391.getAllNames();
  const languageCodes = ISO6391.getAllCodes();

  console.log(updatedStudentDatas);
  const handleNextStep = () => {
    const updatedStudentDatass = {
      ...updatedStudentDatas,
      guardianName,
      guardianEmail,
      guardianPhone,
      guardianCountry,
      guardianCity,
      guardianLanguage,
      guardianTimeZone,
    };
    nextStep(updatedStudentDatass); // Pass updated data to nextStep
  };

  useEffect(() => {
    const fetchedCities = countriesCities.getCities(guardianCountry);
    setCities(fetchedCities);
    setGuardianCity("");
  }, [guardianCountry]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-10 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/assets/images/grid.svg')] opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>

      {/* Logo */}
      <div className="absolute top-0 left-5 p-10 hover:scale-105 transition-transform">
        <Image
          src="/assets/images/blackstone.png"
          alt="Logo"
          className="w-40 drop-shadow-2xl"
          width={100}
          height={100}
        />
      </div>

      {/* User Info */}
      <div className="absolute top-5 right-5 bg-white/10 backdrop-blur-lg rounded-full px-6 py-2">
        <div className="text-sm font-semibold text-white flex items-center gap-2">
          {updatedStudentDatas.firstName} &nbsp;{updatedStudentDatas.lastName}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Guardian Information
          </h1>

          <div className="space-y-6">
            {/* Guardian's Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Guardian's Name */}
              <div className="group">
                <label
                  htmlFor="guardian-name"
                  className="block text-white/60 group-hover:text-white/90 text-sm font-semibold mb-2 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>👤</span>
                    <span>Guardian&apos;s Name</span>
                  </span>
                  <input
                    id="guardian-name"
                    type="text"
                    placeholder="Enter guardian's name"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white
                           placeholder-white/30 focus:bg-white/10 focus:border-white/20 
                           focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                    aria-labelledby="guardian-name"
                  />
                </label>
              </div>

              {/* Guardian's Email */}
              <div className="group">
                <label
                  htmlFor="guardianEmail"
                  className="block text-white/60 group-hover:text-white/90 text-sm font-semibold mb-2 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>📧</span>
                    <span>Guardian Email</span>
                  </span>
                  <input
                    type="text"
                    placeholder="Enter guardian's email"
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white
                           placeholder-white/30 focus:bg-white/10 focus:border-white/20 
                           focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                    aria-labelledby="guardian-email"
                  />
                </label>
              </div>

              {/* Phone Number */}
              <div className="group">
                <label
                  htmlFor="guardianPhone"
                  className="block text-white/60 group-hover:text-white/90 text-sm font-semibold mb-2 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>📱</span>
                    <span>Phone Number</span>
                  </span>

                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white
                           placeholder-white/30 focus:bg-white/10 focus:border-white/20 
                           focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                    aria-labelledby="guardian-phone"
                  />
                </label>
              </div>

              {/* Country */}
              <div className="group relative">
                <label
                  htmlFor="guardianCountry"
                  aria-label="Select your country"
                  className="block text-white/60 group-hover:text-white/90 text-sm font-semibold mb-0 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>🌍</span>
                    <span>Country</span>
                  </span>
                </label>
                <CountryDropdown
                  value={guardianCountry}
                  onChange={(val) => {
                    setGuardianCountry(val);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white
                                placeholder-white/30 focus:bg-white/10 focus:border-white/20 
                                focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 
                                text-[13px] font-semibold appearance-none cursor-pointer"
                  style={{
                    backgroundColor: "", // Background of the select
                    color: "white", // Text color of the select
                  }}
                />
                {/* Inline styles for options (workaround using JS) */}
                <style>
                  {`
                        select option {
                          background-color: black !important; 
                          color: white !important;
                        }
                      `}
                </style>
              </div>
            </div>

            {/* City and Language Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* City */}
              <div className="group">
                <label
                  htmlFor="guardianCity"
                  aria-label="Select your countrys"
                  className="block text-white/60 group-hover:text-white/90 text-sm font-semibold mb-0 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>🏙️</span>
                    <span>City</span>
                  </span>
                </label>
                <select
                  id="city"
                  value={guardianCity}
                  onChange={(e) => setGuardianCity(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white
                              focus:bg-white/10 focus:border-white/20 focus:ring-2 
                              focus:ring-purple-500/20 transition-all duration-200"
                  aria-labelledby="city"
                >
                  <option value="" className="bg-gray-900">
                    Select a city
                  </option>
                  {cities?.map((cityName) => (
                    <option
                      key={cityName}
                      value={cityName}
                      className="bg-gray-900"
                    >
                      {cityName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div className="group">
                <label
                  htmlFor="guardianLanguage"
                  className="block text-white/60 group-hover:text-white/90 text-sm font-semibold mb-2 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>🗣️</span>
                    <span>Preferred Language</span>
                  </span>
                  <select
                    value={guardianLanguage}
                    onChange={(e) => setGuardianLanguage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white
                              focus:bg-white/10 focus:border-white/20 focus:ring-2 
                              focus:ring-purple-500/20 transition-all duration-200"
                    aria-labelledby="guardian-language"
                  >
                    <option value="" className="bg-gray-900">
                      Select language
                    </option>
                    {languages.map((lang, index) => (
                      <option
                        key={languageCodes[index]}
                        value={languageCodes[index]}
                        className="bg-gray-900"
                      >
                        {lang}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* Time Zone Section */}
            <div className="group relative">
              <label
                htmlFor="guardianTimeZone"
                aria-label="Select your countrzczy"
                className="block text-white/60 group-hover:text-white/90 text-sm font-semibold mb-2 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span>🕒</span>
                  <span>Time Zone</span>
                </span>
              </label>

              <TimezoneSelect
                value={{
                  value: guardianTimeZone,
                  label: guardianTimeZone.replace("_", " "),
                }}
                onChange={(timezone) => setGuardianTimeZone(timezone.value)} // ✅ Store only string
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: "#444A60", // ✅ Input box background color
                    borderColor: "#444A60", // ✅ Border color
                    color: "#fff", // ✅ Text color inside input
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "#444A60", // ✅ Dropdown menu background color
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#5A6080" : "#444A60", // ✅ Hover & default color
                    color: "#fff", // ✅ Text color
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "#fff", // ✅ Selected value text color
                  }),
                }}
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center space-x-3 group">
              <input
                type="checkbox"
                id="terms"
                className="w-5 h-5 rounded border-white/20 bg-white/10
                         checked:bg-gradient-to-r checked:from-blue-500 checked:to-purple-500
                         focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
              />
              <label
                htmlFor="terms"
                className="text-white/60 group-hover:text-white/90 text-sm transition-colors"
              >
                I agree to the terms and conditions
              </label>
            </div>
          </div>
        </div>

        {/* Navigation Buttons - Add this at the bottom of the main content div */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 text-white transition-all duration-300 
                       bg-white/10 hover:bg-white/20 rounded-lg group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            <span>Back</span>
          </button>

          {/* Progress Indicators */}
          <div className="flex space-x-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  index === 4
                    ? "bg-gradient-to-r from-blue-400 to-purple-400 w-8"
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>

          <button
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg
                     hover:from-blue-600 hover:to-purple-600 transition-all duration-200
                     flex items-center space-x-2"
            onClick={handleNextStep}
          >
            <span>Next</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Step 7 Component (Thank You Page)
const Step8 = ({
  prevStep,
  nextStep,
  updatedStudentDatass,
}: {
  prevStep: (updatedStudentDatass: any) => void;
  nextStep: (updatedStudentDatass: any) => void;
  updatedStudentDatass: any;
}) => {
  console.log(updatedStudentDatass);
  const handlenextstep = () => {
    nextStep(updatedStudentDatass);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-10 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/assets/images/grid.svg')] opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>

      {/* Animated Background Circles */}
      {/* <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 animate-float"
            style={{
              width: `${Math.random() * 200 + 50}px`,
              height: `${Math.random() * 200 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          ></div>
        ))}
      </div> */}

      {/* Logo */}
      <div className="absolute top-0 left-5 p-10 hover:scale-105 transition-transform">
        <Image
           src="/assets/images/blackstone.png"
          alt="Logo"
          className="w-28 drop-shadow-2xl"
          width={100}
          height={100}
        />
      </div>

      {/* User Info */}
      <div className="absolute top-5 right-5 bg-white/10 backdrop-blur-lg rounded-full px-6 py-2">
        <div className="text-sm font-semibold text-white flex items-center gap-2">
          {updatedStudentDatass.firstName} &nbsp;{" "}
          {updatedStudentDatass.lastName}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl">
        <div className="flex items-center text-right justify-between mb-8">
          <button
            onClick={() => prevStep(updatedStudentDatass)}
            className="flex items-center gap-2 px-6 py-3 text-white transition-all duration-300 
                     bg-white/10 hover:bg-white/20 rounded-lg group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            <span>Back</span>
          </button>
          <button
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg
                        hover:from-blue-600 hover:to-purple-600 transition-all duration-200
                        flex items-center space-x-2"
            onClick={handlenextstep}
          >
            <span>→</span>
          </button>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 shadow-xl text-center">
          {/* Success Icon */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-green-400 to-blue-400 w-24 h-24 rounded-full mx-auto flex items-center justify-center">
              <span className="text-4xl">✓</span>
            </div>
          </div>

          {/* Thank You Message */}
          <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Thank You!
          </h1>

          <p className="text-xl text-white/80 mb-8">
            Your information has been successfully submitted.
          </p>
        </div>
      </div>
    </div>
  );
};

// Step 8 Component
const Step9 = ({
  prevStep,
  nextStep,
  updatedStudentDatass,
}: {
  prevStep: () => void;
  nextStep: (data?: any) => void;
  updatedStudentDatass: any;
}) => {
  const router = useRouter();
  const [classStatus, setClassStatus] = useState("COMPLETED");
  const [studentStatus, setStudentStatus] = useState("JOINED");
  console.log(updatedStudentDatass);
  // Function to handle form submission
  const handleSubmit = async () => {
    try {
      const startDate = new Date(updatedStudentDatass.joiningDate);
      const classEndDate = new Date(startDate);
      classEndDate.setDate(classEndDate.getDate() + 28);
      console.log(">>>", updatedStudentDatass.academicCoach.academicCoachId);
      const submitData = {
        academicCoachId: updatedStudentDatass.academicCoach.academicCoachId,
        student: {
          studentId: updatedStudentDatass.studentId,
          studentRegisterId:updatedStudentDatass._id,
          studentFirstName: updatedStudentDatass.firstName,
          studentLastName: updatedStudentDatass.lastName,
          studentEmail: updatedStudentDatass.email,
          studentGender: updatedStudentDatass.gender,
          studentPhone: updatedStudentDatass.phoneNumber,
          studentCity: updatedStudentDatass.city ?? "N/A",
          studentCountry: updatedStudentDatass.country,
          studentCountryCode: updatedStudentDatass.countryCode,
          learningInterest: updatedStudentDatass.learningInterest,
          numberOfStudents: updatedStudentDatass.numberOfStudents,
          preferredTeacher: updatedStudentDatass.preferredTeacher,
          preferredFromTime: updatedStudentDatass.preferredFromTime,
          preferredToTime: updatedStudentDatass.preferredToTime,
          timeZone: updatedStudentDatass.timeZone,
          referralSource: updatedStudentDatass.referralSource,
          preferredDate: updatedStudentDatass.startDate,
          evaluationStatus: classStatus,
          status: updatedStudentDatass.status,
          createdDate: updatedStudentDatass.createdDate,
          createdBy: updatedStudentDatass.createdBy,
        },
        isLanguageLevel: updatedStudentDatass.isLanguageChecked,
        languageLevel: updatedStudentDatass.languageLevel,
        isReadingLevel: updatedStudentDatass.isReadingChecked,
        readingLevel: updatedStudentDatass.readingLevel,
        isGrammarLevel: updatedStudentDatass.isGrammarChecked,
        grammarLevel: updatedStudentDatass.grammarLevel,
        hours: updatedStudentDatass.selectedHours,
        subscription: {
          subscriptionName: updatedStudentDatass.subscriptionName,
        },
        teacher: {
          teacherId: updatedStudentDatass.teacher.teacherId,
          teacherName: updatedStudentDatass.teacher.teacherName,
          teacherEmail: updatedStudentDatass.teacher.teacherEmail,
        },
        classDay: updatedStudentDatass.classDay,
        startTime: updatedStudentDatass.startTime,
        endTime: updatedStudentDatass.endTime,
        joiningDate: updatedStudentDatass.joiningDate,
        amount: "",
        currency: "",
        planTotalPrice: updatedStudentDatass.planTotalPrice,
        classType: updatedStudentDatass.classType,
        weeklySlots: updatedStudentDatass.weeklySlots,
        classStartDate: startDate,
        classEndDate: classEndDate,
        classStartTime: updatedStudentDatass.preferredFromTime,
        classEndTime: updatedStudentDatass.preferredToTime,
        preferredTrialDate: updatedStudentDatass.preferredTrialDate,
        preferredTrialFromTime: updatedStudentDatass.preferredTrialFromTime,
        preferredTrialToTime: updatedStudentDatass.preferredTrialToTime,
        accomplishmentTime: updatedStudentDatass.accomplishmentTime.toString(),
        studentRate: updatedStudentDatass.studentRate,
        expectedFinishingDate: updatedStudentDatass.expectedFinishingDate,
        gardianName: updatedStudentDatass.guardianName,
        gardianEmail: updatedStudentDatass.guardianEmail,
        gardianPhone: updatedStudentDatass.guardianPhone.toString(),
        gardianCity: updatedStudentDatass.guardianCity,
        gardianCountry: updatedStudentDatass.guardianCountry,
        gardianTimeZone: updatedStudentDatass.guardianTimeZone,
        gardianLanguage: updatedStudentDatass.guardianLanguage,
        assignedTeacher: updatedStudentDatass.assignedTeacher,
        studentStatus: studentStatus,
        classStatus: classStatus,
        trialClassStatus: updatedStudentDatass.trialClassStatus,
        status: updatedStudentDatass.status,
        createdDate: updatedStudentDatass.createdDate,
        createdBy: updatedStudentDatass.academicCoach.name,
        updatedDate: new Date().toISOString(),
        updatedBy: "system", // or replace with the current user's email/ID
      };
      console.log("Payload being sent:", JSON.stringify(submitData, null, 2));
      // Make POST request to your API
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AcademicCoachAuthToken")
          : null;

      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return;
      }
      const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.EVALUATION.CREATE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Server error details:", errorDetails);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Status updated successfully:", result);
      alert("Status updated successfully!");
      router.push("/modules/users/Academic-coach/ui/trailmanagement");
    } catch (error) {
      console.error("Error submitting status:", error);
      alert("Error updating status. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-10 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/assets/images/grid.svg')] opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>

      {/* Logo */}
      <div className="absolute top-0 left-5 p-10 hover:scale-105 transition-transform">
        <Image
          src="/assets/images/blackstone.png"
          alt="Logo"
          className="w-40 drop-shadow-2xl"
          width={100}
          height={100}
        />
      </div>

      {/* User Info */}
      <div className="absolute top-5 right-5 bg-white/10 backdrop-blur-lg rounded-full px-6 py-2">
        <div className="text-sm font-semibold text-white flex items-center gap-2">
          {updatedStudentDatass.firstName} &nbsp;{updatedStudentDatass.lastName}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 text-white transition-all duration-300 
                     bg-white/10 hover:bg-white/20 rounded-lg group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            <span>Back</span>
          </button>

          <button
            onClick={nextStep}
            className="items-center gap-2 px-6 py-3 text-white transition-all duration-300 
                     bg-gradient-to-r from-blue-500 to-purple-500 
                     hover:from-blue-600 hover:to-purple-600 rounded-lg group hidden"
          >
            <span>Next</span>
            <span className="transform group-hover:translate-x-1 transition-transform duration-300">
              →
            </span>
          </button>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Final Status Update
          </h1>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Class Status Card */}
            <div className="group">
              <label
                htmlFor="classstatus"
                className="block text-white/60 group-hover:text-white/90 text-lg font-semibold mb-4 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">👨‍🏫</span>
                  <span>Class Status</span>
                </div>
                <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>

                <div className="relative">
                  <select
                    value={classStatus}
                    onChange={(e) => setClassStatus(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white
                            appearance-none cursor-pointer focus:outline-none focus:ring-2 
                            focus:ring-purple-500/20 focus:border-white/20 transition-all duration-200
                            hover:bg-white/10"
                    aria-labelledby="classstatus"
                  >
                    <option value="COMPLETED" className="bg-gray-900">
                      COMPLETED
                    </option>
                    <option value="NOT COMPLETED" className="bg-gray-900">
                      NOT COMPLETED
                    </option>
                  </select>
                </div>
              </label>
            </div>

            {/* Student Status Card */}
            <div className="group">
              <label
                htmlFor="studentstatus"
                className="block text-white/60 group-hover:text-white/90 text-lg font-semibold mb-4 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">👥</span>
                  <span>Student Status</span>
                </div>
                <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>

                <div className="relative">
                  <select
                    value={studentStatus}
                    onChange={(e) => setStudentStatus(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white
                            appearance-none cursor-pointer focus:outline-none focus:ring-2 
                            focus:ring-purple-500/20 focus:border-white/20 transition-all duration-200
                            hover:bg-white/10"
                    aria-labelledby="studentstatus"
                  >
                    <option value="JOINED" className="bg-gray-900">
                      JOINED
                    </option>
                    <option value="NOT JOINED" className="bg-gray-900">
                      NOT JOINED
                    </option>
                    <option value="WAITING" className="bg-gray-900">
                      WAITING
                    </option>
                  </select>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-xl
                      hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-[1.02]
                      font-semibold text-lg shadow-lg"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

// Main EvaluationSteps component - Update total number of steps
const EvaluationSteps: React.FC<{ userId: string }> = ({ userId }) => {
  const [step, setStep] = useState(1);
  const [studentData, setStudentData] = useState<StudentData>();
  const [updatedStudentData, setUpdatedStudentData] = useState<any>(null);
  const [updatedStudentDatas, setUpdatedStudentDatas] = useState<any>(null);
  const [updatedStudentDatass, setUpdatedStudentDatass] = useState<any>({});
  const totalSteps = 9;

  // Single draft that aggregates all step data
  const [evaluationDraft, setEvaluationDraft] = useState<any>({});

  const nextStep = (data: any) => {
    console.log("Current step:", step);
    // Merge into draft
    setEvaluationDraft((prev: any) => ({ ...prev, ...data }));

    if (step === 2 || step === 3 || step === 4) {
      setStudentData({ ...(studentData as any), ...data });
    }
    if (step === 5) {
      setUpdatedStudentData(data);
    }
    if (step === 6 || step === 7) {
      setUpdatedStudentDatas(data);
      setUpdatedStudentDatass(data);
    }
    if (step === 8 || step === 9) {
      setUpdatedStudentDatass(data);
    }
    if (step < totalSteps) {
      setStudentData({ ...(studentData as any), ...data });
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    console.log("Current step:", step);
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  console.log("Rendering step:", step);

  return (
    <>
      {step === 1 && <Step1 nextStep={nextStep} />}
      {step === 2 && (
        <Step2
          prevStep={prevStep}
          nextStep={(data: StudentData) => nextStep(data)}
          studentDatas={studentData ?? ({} as StudentData)} // Handle undefined
        />
      )}
      {step === 3 && (
        <Step3
          prevStep={prevStep}
          nextStep={(data: StudentData) => nextStep(data)}
          studentData={studentData ?? ({} as StudentData)}
        />
      )}
      {step === 4 && (
        <Step4
          prevStep={prevStep}
          nextStep={(data: StudentData) => nextStep(data)}
          studentData={studentData ?? ({} as StudentData)}
        />
      )}
      {step === 5 && (
        <Step5
          prevStep={prevStep}
          nextStep={(data: StudentData) => nextStep(data)}
          studentData={studentData ?? ({} as StudentData)}
        />
      )}
      {step === 6 && (
        <Step6
          prevStep={prevStep}
          nextStep={(data: any) => nextStep(data)}
          updatedStudentData={updatedStudentData}
        />
      )}
      {step === 7 && (
        <Step7
          prevStep={prevStep}
          nextStep={(data: any) => nextStep(data)}
          updatedStudentDatas={updatedStudentDatas}
        />
      )}
      {step === 8 && (
        <Step8
          prevStep={prevStep}
          nextStep={nextStep}
          updatedStudentDatass={updatedStudentDatass}
        />
      )}
      {step === 9 && (
        <Step9
          prevStep={prevStep}
          nextStep={(data: any) => nextStep(data)}
          updatedStudentDatass={{ ...evaluationDraft, ...updatedStudentDatass }}
        />
      )}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </>
  );
};

export default EvaluationSteps;
