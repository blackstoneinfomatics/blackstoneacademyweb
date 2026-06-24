"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Star,
  MoreVertical,
  FileText,
  Search,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { ImAttachment } from "react-icons/im";
import BaseLayout3 from "@/app/(tenant)/modules/users/supervisor/components/BaseLayout3";
import axios from "axios";
import { pdfjs } from "react-pdf";
import Pagination from "@/components/Pagination";

import SupervisorHeader from "../../components/supervisorHeader";
import { IoCloseOutline } from "react-icons/io5";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar } from "react-icons/fi";
import { MdTune } from "react-icons/md";
import SuccessPopup from "../../components/successPopup";
import FailedPopup from "../../components/failedPopup";
import { getSocket } from "@/app/utils/socket";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface Applicant {
  _id: string;
  candidateFirstName: string;
  candidateLastName: string;
  applicationDate: string;
  candidateEmail: string;
  candidatePhoneNumber: number;

  candidateCountry: string;
  candidateCity: string;
  positionApplied: string;
  currency: string;
  expectedSalary: string;
  preferedWorkingHours: string;
  uploadResume: string;
  comments: string;
  applicationStatus: string;
  status: string;
  createdDate: string;
  createdBy: string;
  level: string;
}
interface ProfessionalExperience {
  jobRole: string;
  organizationName: string;
  jobLocation: string;
  fromDate: string; // ISO date string
  toDate: string; // ISO date string
  jobDescription: string;
  _id: string;
}

interface UploadResume {
  type: string;
  data: number[];
}

interface ApiResponse {
  candidateFirstName: string;
  candidateLastName: string;
  applicationDate: string;
  candidateEmail: string;
  candidatePhoneNumber: number;
  candidateCountry: string;
  candidateCity: string;
  positionApplied: string;
  currency: string;
  gender: string;
  expectedSalary: string;
  preferedWorkingHours: string;
  uploadResume: UploadResume;
  comments: string;
  preferedWorkingDays: string;
  quranReading: string;
  tajweed: string;
  arabicSpeaking: string;
  arabicWriting: string;
  englishSpeaking: string;
  overallRating: number;
  applicationStatus: string;
  professionalExperience: ProfessionalExperience[];
  skills: string;
  status: string;
  createdDate: string;
  createdBy: string;
  _id: string;
  __v: number;
  supervisor?: { // Add this if it exists in your response
    supervisorId?: string;
    supervisorName?: string;
    supervisorEmail?: string;
    supervisorRole?: string;
  };
}

interface RadioOptionProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

const items = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
}));

const RadioOption: React.FC<RadioOptionProps> = ({
  label,
  checked,
  onChange,
}) => (
  <label className="inline-flex items-center mr-4">
    <input
      type="radio"
      className="form-radio h-4 w-4 text-blue-600"
      checked={checked}
      onChange={onChange}
    />
    <span className="ml-2 text-sm text-gray-700">{label}</span>
  </label>
);

interface SkillBadgeProps {
  name: string;
}

const SkillBadge: React.FC<SkillBadgeProps> = ({ name }) => (
  <span className="px-3 py-1 text-sm bg-gray-100 rounded-full text-gray-700 mr-2 mb-2">
    {name}
  </span>
);

// Create a Map to store blob URLs
const blobUrlCache = new Map<string, string>();

// Function to store resume data in sessionStorage
const storeResumeData = (applicantId: string, resumeData: any) => {
  try {
    sessionStorage.setItem(
      `resume_data_${applicantId}`,
      JSON.stringify(resumeData)
    );
  } catch (error) {
    console.error("Error storing resume data:", error);
  }
};

// Function to get resume data from sessionStorage
const getStoredResumeData = (applicantId: string): any => {
  try {
    const data = sessionStorage.getItem(`resume_data_${applicantId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting stored resume data:", error);
    return null;
  }
};

const createBlobUrlFromData = (resumeData: any, applicantId: string) => {
  if (!resumeData?.data) return null;

  try {
    const byteArray = new Uint8Array(resumeData.data);
    const blob = new Blob([byteArray], {
      type: resumeData.type || "application/pdf",
    });
    const blobUrl = URL.createObjectURL(blob);
    blobUrlCache.set(applicantId, blobUrl);
    return blobUrl;
  } catch (error) {
    console.error("Error creating blob URL:", error);
    return null;
  }
};

// Cleanup function to revoke all blob URLs
function cleanupBlobUrls(): void {
  blobUrlCache.forEach((url) => {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error revoking blob URL:", error);
    }
  });
  blobUrlCache.clear();
}

const ResumeLink: React.FC<{ applicant: any }> = ({ applicant }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const resumeData = applicant.uploadResume;
      if (!resumeData) {
        setError("Resume not available");
        return;
      }

      // Create new blob URL on each click
      const newBlobUrl =  await createBlobUrl(resumeData);
      if (!newBlobUrl) {
        setError("Failed to load resume");
        return;
      }

      // Clean up old blob URL if it exists
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }

      setBlobUrl(newBlobUrl);

      // Open in new tab
      window.open(newBlobUrl, "_blank");
    } catch (error) {
      console.error("Error handling resume click:", error);
      setError("Failed to open resume");
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  return (
    <div className="flex flex-col">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="text-[#38619A] hover:underline flex items-center gap-1 disabled:opacity-50"
      >
        <ImAttachment className="w-4 h-4" />
        {isLoading ? "Loading..." : "Resume"}
      </button>
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
};

// Add cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", cleanupBlobUrls);
}

function base64ToBlob(base64: string, contentType = "application/pdf"): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

function getResumeBlobUrl(
  uploadResume?: string | { type: string; data: number[] }
): string | undefined {
  if (!uploadResume) return undefined;

  if (typeof uploadResume === "string") {
    // Assume base64 string, strip possible data URI prefix
    const base64Data = uploadResume.includes("base64,")
      ? uploadResume.split("base64,")[1]
      : uploadResume;
    const blob = base64ToBlob(base64Data);
    return URL.createObjectURL(blob);
  } else if (uploadResume.data && uploadResume.type) {
    // Object with type and data array
    const byteArray = new Uint8Array(uploadResume.data);
    const blob = new Blob([byteArray], { type: uploadResume.type });
    return URL.createObjectURL(blob);
  }

  return undefined;
}

export default function ApplicantsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null
  );
  const [parsedSkills, setParsedSkills] = useState<string[]>([]);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [Applicantbyid, setApplicantbyid] = useState<ApiResponse | null>(null);
  const [resumeImages, setResumeImages] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [quranReading, setQuranReading] = useState("Medium");
  const [tajweed, setTajweed] = useState("Medium");
  const [arabicSpeaking, setArabicSpeaking] = useState("Advanced");
  const [arabicWriting, setArabicWriting] = useState("Advanced");
  const [englishSpeaking, setEnglishSpeaking] = useState("Advanced");
  const [rating, setRating] = useState(4);
  const [comments, setComments] = useState("");
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [showModal, setShowModal] = useState(false);
  const fromWrapperRef = useRef<HTMLDivElement>(null);
  const toWrapperRef = useRef<HTMLDivElement>(null);
  const [supervisorId, setSupervisorId] = React.useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [positionApplied, setPositionApplied] = useState("");
  const [applicationStatus, setApplicationStatus] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [workingDays, setWorkingDays] = useState(""); // final formatted result
  const [preferredWorkingHours, setPreferredWorkingHours] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");

  // State for dynamic filter options
  const [positionOptions, setPositionOptions] = useState<string[]>([
    "Islamic Teacher",
    "Quran Teacher",
    "Arabic Teacher",
  ]);
  const [statusOptions, setStatusOptions] = useState<string[]>([
    "Shortlisted",
    "Rejected",
    "Waiting",
    "Approved",
    "NewApplication",
  ]);

  // Extract skills utility function (moved to top-level for ES5 strict mode)
  const extractSkills = (rawText: string): string[] => {
    // Only keep content before "Accomplishments" or "Certifications"
    const relevantSection = rawText.split(/Accomplishments|Certifications/i)[0];
    // Match all bullet point items (• React, etc.)
    const matches = relevantSection.match(/•\s*[^•\n]+/g);
    const skills = matches
      ? matches
          .map((skill) => skill.replace(/•\s*/, "").trim()) // remove bullet and whitespace
          .flatMap((s) => s.split(",").map((sub) => sub.trim())) // split comma-separated items
          .filter(Boolean) // remove empty strings
      : [];
    return skills;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("SupervisorPortalId")?.trim() ?? null;
      setSupervisorId(id);
    }
  }, []);

  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

  // Fetch applicants with optional filters
  const fetchApplicants = async (filters: any = {}) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("SupervisorAuthToken")
        : null;
    if (!token) {
      console.error("❌ SupervisorAuthToken not found");
      return;
    }
    try {
      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.APPLICANTS.GET_LIST}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: filters,
        }
      );
      setApplicants(response.data.applicants);
      // Update filter dropdowns with unique values from API response
      const applicantsList = response.data.applicants || [];
      const uniquePositions = Array.from(
        new Set(
          applicantsList
            .map((a: any) => a.positionApplied)
            .filter((x: any): x is string => typeof x === "string")
        )
      ) as string[];
      const uniqueStatuses = Array.from(
        new Set(
          applicantsList
            .map((a: any) => a.applicationStatus)
            .filter((x: any): x is string => typeof x === "string")
        )
      ) as string[];
      if (uniquePositions.length > 0) setPositionOptions(uniquePositions);
      if (uniqueStatuses.length > 0) setStatusOptions(uniqueStatuses);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };

  // On mount, fetch all applicants
  useEffect(() => {
    fetchApplicants();
  }, []);
  const fetchAndOpenFile = async (fileId: string) => {
  try {
    console.log("file ",fileId)
    const res = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.FILEUPLOAD.GET_UPLOAD}/${fileId}`, {
      method: "GET",
    });

    if (!res.ok) throw new Error("Failed to fetch file");
  console.log('res',res)
    const blob = await res.blob();
       const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
  } catch (err) {
    console.error("Error fetching file:", err);
  }
};

  // When Reset is clicked, clear filters and fetch all applicants
  const handleResetFilter = () => {
    setSearchText("");
    setFromDate("");
    setToDate("");
    setPositionApplied("");
    setApplicationStatus("");
    fetchApplicants();
  };

  // When dropdowns change, fetch filtered applicants immediately
  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPositionApplied(value);
    fetchApplicants({
      ...(value ? { positionApplied: value } : {}),
      ...(applicationStatus ? { applicationStatus } : {}),
      ...(searchText ? { searchText } : {}),
      ...(fromDate && toDate
        ? { "dateRange.from": fromDate, "dateRange.to": toDate }
        : {}),
    });
  };
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setApplicationStatus(value);
    fetchApplicants({
      ...(positionApplied ? { positionApplied } : {}),
      ...(value ? { applicationStatus: value } : {}),
      ...(searchText ? { searchText } : {}),
      ...(fromDate && toDate
        ? { "dateRange.from": fromDate, "dateRange.to": toDate }
        : {}),
    });
  };

  // Submit button for other filters (search, date)
  const handleFilter = async () => {
    setShowModal(false);
    const params: any = {};
    if (searchText) params.searchText = searchText;
    if (fromDate && toDate) {
      params["dateRange.from"] = fromDate;
      params["dateRange.to"] = toDate;
    }
    if (positionApplied) params.positionApplied = positionApplied;
    if (applicationStatus) params.applicationStatus = applicationStatus;
    fetchApplicants(params);
  };
  useEffect(() => {
    const Id =
      typeof window !== "undefined"
        ? localStorage.getItem("SupervisorPortalId")
        : null;
    console.log("dashobarcgc id", Id);
    if (!Id) return;
    const socket = getSocket(Id);
    const handleList = (data: { event: string; data: Applicant }) => {
      console.log("📩 Received WebSocket Data:", data);

      if (data.event === "create") {
        console.log("➡️ Action: create", data.data._id);
        setApplicants((prev) => [data.data, ...prev]);
      } else if (data.event === "update") {
        console.log("➡️ Action: update", data.data._id);
        setApplicants((prev) =>
          prev.map((app) =>
            app._id.toString() === data.data._id.toString()
              ? { ...data.data, __updatedAt: Date.now() }
              : app
          )
        );
      } else {
        console.warn("⚠️ Unknown event type:", data.event);
      }
    };

    socket.on("recruitmentlist", handleList);
    return () => {
      socket.off("recruitmentlist", handleList);
    };
  }, []);

  const tabs = ["All", "New Application", "Shortlisted", "Rejected", "Waiting"];

  const filterApplicants = (applicants: Applicant[], searchQuery: string) => {
    if (!searchQuery.trim()) return applicants;

    const query = searchQuery.toLowerCase().trim();

    return applicants.filter((applicant) => {
      const searchableFields = [
        applicant.candidateFirstName,
        applicant.candidateLastName,
        applicant.applicationDate,
        applicant.candidatePhoneNumber?.toString(),
        applicant.candidateEmail,
        applicant.positionApplied,
        applicant.applicationStatus,
        applicant.level?.toString(),
      ];

      return searchableFields.some(
        (field) => field && field.toString().toLowerCase().includes(query)
      );
    });
  };

  const filteredApplicants = filterApplicants(
    activeTab === "All"
      ? applicants
      : applicants.filter(
          (applicant) =>
            applicant.applicationStatus.replace(/\s+/g, "").toUpperCase() ===
            activeTab.replace(/\s+/g, "").toUpperCase()
        ),
    searchText
  );

  // Calculate pagination variables at the top of the component so they are always in scope
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentApplicants = filteredApplicants.slice(indexOfFirst, indexOfLast);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEWAPPLICATION":
        return "bg-[#DDF6FC] text-[#35A0D5] dark:bg-[#2E3F42] dark:text-[#35A0D5] rounded-md px-4 text-[9px]";
      case "SHORTLISTED":
        return "bg-[#ECFDF3] dark:bg-[#374336] dark:text-[#377E36] text-[#377E36] rounded-md px-6 text-[9px]";
      case "REJECTED":
        return "bg-[#FDECEC] dark:bg-[#503434] dark:text-[#D34645] text-[#D34645] rounded-md px-8 text-[9px]";
      case "SENDAPPROVAL":
        return "bg-[#FDF9D9] dark:bg-[#4f4b29] dark:text-[#d0c02f] text-[#d0c02f] rounded-md px-6 text-[9px]";
      case "WAITING":
        return "bg-[#FDF6EC] dark:bg-[#534634] dark:text-[#F0AD4E] text-[#F0AD4E] rounded-md px-8 text-[9px]";
      case "APPROVED":
        return "bg-[#EEEEFF] text-[#38619A] dark:bg-[#2F3642] dark:text-[#225BAA] rounded-md px-8 text-[9px]";
    }
  };

 const handleMenuClick = async (_id: string) => {
  setOpenMenuId(openMenuId === _id ? null : _id);

  if (openMenuId !== _id) {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("SupervisorAuthToken")
          : null;

      if (!token) {
        console.error("❌ SupervisorAuthToken not found");
        return;
      }

      const response = await axios.get<ApiResponse>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.APPLICANTS.GET_LIST}/${_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Applicant data received:", response.data);
      setApplicantbyid(response.data);

      // ✅ Initialize ALL editable fields with actual data from API
      setPreferredWorkingHours(response.data.preferedWorkingHours || "");
      setExpectedSalary(response.data.expectedSalary?.toString() || "");
     
      // Parse working days from backend data
      if (response.data.preferedWorkingDays) {
        parseWorkingDays(response.data.preferedWorkingDays);
      } else {
        setSelectedDays([]);
        setWorkingDays("");
      }

      // Initialize other skill fields
      setQuranReading(response.data.quranReading || "Medium");
      setTajweed(response.data.tajweed || "Medium");
      setArabicSpeaking(response.data.arabicSpeaking || "Advanced");
      setArabicWriting(response.data.arabicWriting || "Advanced");
      setEnglishSpeaking(response.data.englishSpeaking || "Advanced");
      setRating(response.data.overallRating || 4);
      setComments(response.data.comments || "");

      // Parse and set skills
      const skillsFromApi = response.data.skills || "";
      const skillsArray = extractSkills(skillsFromApi);
      setParsedSkills(skillsArray);

      // Handle resume
      if (response.data.uploadResume) {
        const resumeUrl = getResumeBlobUrl(response.data.uploadResume);
        setResumeImages(resumeUrl || null);
      }

      // Debug log to verify all data is loaded
      console.log("📥 Loaded applicant data:", {
        preferredWorkingHours: response.data.preferedWorkingHours,
        expectedSalary: response.data.expectedSalary,
        workingDays: response.data.preferedWorkingDays,
        quranReading: response.data.quranReading,
        tajweed: response.data.tajweed,
        comments: response.data.comments
      });

    } catch (error) {
      console.error("❌ Error fetching applicant data:", error);
    }
  }
};

  // Helper function to parse working days
  const parseWorkingDays = (daysString: string) => {
  console.log("🔄 Parsing working days:", daysString);
 
  if (!daysString || daysString.trim() === "") {
    setSelectedDays([]);
    setWorkingDays("");
    return;
  }

  // Handle various formats
  if (daysString.includes("-")) {
    // Format: "Monday-Friday" or "Mon-Fri"
    const [startDay, endDay] = daysString.split("-");
    const fullDaysList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const shortDaysList = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
   
    // Try full day names first
    let startIndex = fullDaysList.indexOf(startDay);
    let endIndex = fullDaysList.indexOf(endDay);
   
    // If not found, try short day names
    if (startIndex === -1) {
      startIndex = shortDaysList.indexOf(startDay);
    }
    if (endIndex === -1) {
      endIndex = shortDaysList.indexOf(endDay);
    }

    if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
      const selected = [];
      for (let i = startIndex; i <= endIndex; i++) {
        selected.push(daysList[i]);
      }
      setSelectedDays(selected);
      setWorkingDays(`${fullDaysList[startIndex]}-${fullDaysList[endIndex]}`);
      console.log("✅ Parsed day range:", selected);
    } else {
      console.warn("❌ Could not parse day range:", daysString);
      setSelectedDays([]);
      setWorkingDays("");
    }
  } else {
    // Single day
    const dayMap: { [key: string]: string } = {
      "Monday": "Mon", "Tuesday": "Tue", "Wednesday": "Wed",
      "Thursday": "Thu", "Friday": "Fri", "Saturday": "Sat", "Sunday": "Sun",
      "Mon": "Mon", "Tue": "Tue", "Wed": "Wed", "Thu": "Thu",
      "Fri": "Fri", "Sat": "Sat", "Sun": "Sun"
    };
   
    const fullDayMap: { [key: string]: string } = {
      "Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday",
      "Thu": "Thursday", "Fri": "Friday", "Sat": "Saturday", "Sun": "Sunday"
    };
   
    const shortDay = dayMap[daysString] || daysString;
    const fullDay = fullDayMap[shortDay] || daysString;
   
    setSelectedDays([shortDay]);
    setWorkingDays(fullDay);
    console.log("✅ Parsed single day:", shortDay, "->", fullDay);
  }
};

  const handleViewDetails = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setOpenMenuId(null);
    setMode("view"); // Always set to view mode
  };

  const handleEdit = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setOpenMenuId(null);
    setMode("edit");
  };

  const handleviewclose = () => {
    setSelectedApplicant(null);
    setResumeImages(null);
    setOpenMenuId(null);
    setQuranReading("Medium");
    setTajweed("Medium");
    setArabicSpeaking("Advanced");
    setArabicWriting("Advanced");
    setEnglishSpeaking("Advanced");
    setPreferredWorkingHours("");
    setExpectedSalary("");
    setSelectedDays([]);
    setWorkingDays("");
    setRating(4);
    setComments("");
    setApplicationStatus("");
    setMode("view");
  };

const handlesendupdate = async (id: string, status: string) => {
  // Validate required fields
  if (!preferredWorkingHours.trim()) {
    setFailed(true);
    setFailedMessage("Preferred working hours is required");
    return;
  }

  if (!expectedSalary.trim()) {
    setFailed(true);
    setFailedMessage("Expected salary is required");
    return;
  }

  if (isNaN(parseFloat(expectedSalary))) {
    setFailed(true);
    setFailedMessage("Expected salary must be a valid number");
    return;
  }

  if (selectedDays.length === 0) {
    setFailed(true);
    setFailedMessage("At least one working day must be selected");
    return;
  }

  if (!Applicantbyid) {
    setFailed(true);
    setFailedMessage("Applicant data not loaded");
    return;
  }

  // ✅ USE THE UPDATED STATE VALUES, NOT THE OLD ONES
 const updateData = {
    preferedWorkingHours: preferredWorkingHours,
    expectedSalary: parseFloat(expectedSalary), // Convert to number
    preferedWorkingDays: workingDays, // ✅ Correct field name
    comments: comments,
    overallRating: rating, // ✅ Correct field name
    quranReading: quranReading,
    tajweed: tajweed,
    arabicSpeaking: arabicSpeaking,
    arabicWriting: arabicWriting,
    englishSpeaking: englishSpeaking,
    applicationStatus: status,
    status: "Active",
    updatedDate: new Date().toISOString()
  };

  console.log("📤 UPDATED VALUES BEING SENT:", updateData);

  try {
    const token = localStorage.getItem("SupervisorAuthToken");
    if (!token) {
      setFailed(true);
      setFailedMessage("Authentication token not found");
      return;
    }

    const response = await axios.put(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.APPLICANTS.GET_LIST}/${id}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Update successful with NEW values:", {
      sent: updateData,
      received: response.data
    });
   
    setSuccess(true);
    setSuccessMessage(`Successfully ${status.toLowerCase()} the application`);
    fetchApplicants();
    handleviewclose();
   
  } catch (error: any) {
    console.error("❌ Update failed:", error.response?.data);
    setFailed(true);
    setFailedMessage(error.response?.data?.message || "Update failed");
  }
};
  const [country, setCountry] = useState("USA");
  const [cities, setCities] = useState([]);
  const countriesCities = require("countries-cities");

  useEffect(() => {
    const fetchedCities = countriesCities.getCities(country);
    setCities(fetchedCities);
  }, [country]);

  const daysList = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const fullDaysMap: { [key: string]: string } = {
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday",
  };

  const handleDaySelection = (day: string) => {
    if (mode === "view") return; // Don't allow selection in view mode

    let updated = [...selectedDays];

    if (updated.includes(day)) {
      updated = updated.filter((d) => d !== day);
    } else {
      updated.push(day);
    }

    // Sort by actual weekday order
    updated.sort((a, b) => daysList.indexOf(a) - daysList.indexOf(b));
    setSelectedDays(updated);

    // Format output: "Monday-Friday"
    if (updated.length >= 2) {
      const first = fullDaysMap[updated[0]];
      const last = fullDaysMap[updated[updated.length - 1]];
      setWorkingDays(`${first}-${last}`);
    } else if (updated.length === 1) {
      setWorkingDays(fullDaysMap[updated[0]]);
    } else {
      setWorkingDays("");
    }
  };

  return (
    <BaseLayout3>
      <div className="">
        <SupervisorHeader currentSection="Applicants" />
        <div className="md:p-0 mx-auto">
          <div className="h-full w-full  flex flex-col justify-between">
            <div className="p-0 justify-between flex flex-col">
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
                  <div className="flex flex-wrap gap-2 mb-0">
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 md:px-3 md:py-1 text-[16px] font-medium
                           ${
                             activeTab === tab
                               ? "text-[#576CBC] border-b-2 border-b-[#576CBC] mt-[2px] dark:text-[#576CBC]"
                               : "text-[#010E30] mt-0 dark:text-[white]"
                           }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full h-[588px] bg-[#FAFAFB] rounded-lg dark:bg-[#343434]">
                  {/* Header Search & Filter */}
                  <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search"
                        className="bg-transparent outline-none text-[15px] w-52 py-3"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                    </div>

                    <div
                      className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
                      onClick={() => setShowModal(true)}
                    >
                      {/* <BsFilterLeft /> */}
                      <MdTune className="w-4 h-4" />
                      <span>Filter</span>
                    </div>
                    {/* Modal */}
                    {showModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg w-[500px] relative dark:bg-[#252525]">
                          {/* X Icon for close */}
                          <button
                            className="absolute top-2 right-3 text-gray-400 text-2xl font-bold hover:text-gray-600"
                            onClick={() => setShowModal(false)}
                            aria-label="Close filter modal"
                          >
                            <IoCloseOutline />
                          </button>
                          <h2 className="text-lg font-semibold mb-4">
                            Filter by
                          </h2>
                          {/* Date Input */}
                          <div className="mb-4">
                            <label className="text-sm font-medium mb-1 dark:text-[#D6D6D6]">
                              Date Range
                            </label>
                            <div className="flex gap-2 mb-2">
                              <input
                                type="date"
                                className="w-1/2 px-3 py-2 border rounded text-xs text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                              />
                              <input
                                type="date"
                                className="w-1/2 px-3 py-2 border rounded text-xs text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                              />
                            </div>
                          </div>
                          {/* Position Applied */}
                          <div className="mb-4">
                            <label
                              htmlFor="position"
                              className="block text-sm font-medium mb-1"
                            >
                              Position Applied
                            </label>
                            <select
                              className="w-full border rounded-md p-2 text-[12px] dark:bg-[#343434] dark:text-[#D6D6D6] dark:border-[#565656]"
                              value={positionApplied}
                              onChange={handlePositionChange}
                            >
                              <option value="">All</option>
                              {positionOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                          {/* Status */}
                          <div className="mb-6">
                            <label
                              htmlFor="status"
                              className="block text-sm font-medium mb-1"
                            >
                              Application Status
                            </label>
                            <select
                              className="w-full border rounded-md p-2 text-[12px] dark:bg-[#343434] dark:text-[#D6D6D6] dark:border-[#565656]"
                              value={applicationStatus}
                              onChange={handleStatusChange}
                            >
                              <option value="">All</option>
                              {statusOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                          {/* Buttons */}
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={handleResetFilter}
                              className="px-4 py-1 rounded-md border border-[#576CBC] text-[#576CBC] font-medium"
                            >
                              Reset
                            </button>
                            <button
                              className="px-4 py-1 rounded-md bg-[#576CBC] text-white font-medium"
                              onClick={handleFilter}
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                      <span className="text-left -ml-60 ">
                        Showing {currentApplicants.length} of{" "}
                        {applicants.length}
                      </span>
                    </div>
                  </div>

                  {/* Table */}
                  <table
                    className="table-auto w-full"
                    style={{ width: "100%", tableLayout: "fixed" }}
                  >
                    <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                      <tr className="font-medium">
                        <th className="text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                          Applicant Name
                        </th>
                        <th className="text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                          Application Date
                        </th>
                        <th className="text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                          Contact
                        </th>
                        <th
                          className="text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]"
                          style={{ wordWrap: "break-word", width: "15%" }}
                        >
                          Email id
                        </th>
                        <th className="text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                          Position Applied
                        </th>
                        <th className="text-left px-4 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                          Resume
                        </th>
                        <th className="text-left px-6 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                          Status
                        </th>
                        <th className="text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                          Level
                        </th>
                        <th className="text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentApplicants.map(
                        (applicant: any, index: number) => (
                          <tr
                            key={applicant._id}
                            className={`text-[12px] ${
                              index % 2 === 0
                                ? "bg-[#fff] dark:bg-[#2C2C2C] "
                                : "bg-[#F8F8F8] dark:bg-[#303030]"
                            }`}
                          >
                            <td className="px-5 py-2 text-[#3D8FDE] font-medium text-left">
                              {applicant.candidateFirstName}
                            </td>
                            <td className="px-3 py-2 text-[#17243E] dark:text-[#FDFDFD]">
                              {new Date(applicant.applicationDate)
                                .toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric",
                                })
                                .replace(",", ",")}
                            </td>
                            <td className="px-3 py-2 text-[#17243E] dark:text-[#FDFDFD]">
                              {applicant.candidatePhoneNumber}
                            </td>
                            <td
                              className="px-3 py-2 text-[#17243E] dark:text-[#FDFDFD]"
                              style={{ wordWrap: "break-word" }}
                            >
                              {applicant.candidateEmail}
                            </td>
                            <td className="px-3 py-2 text-[#17243E] dark:text-[#FDFDFD]">
                              {applicant.positionApplied}
                            </td>
                            <td className="px-3 py-2">
                              <ResumeLink applicant={applicant} />
                            </td>

                            <td className=" py-2">
                              <span
                                className={`text-[10px] font-semibold px-3 py-1 rounded-full ${getStatusColor(
                                  applicant.applicationStatus
                                )}`}
                              >
                                {applicant.applicationStatus}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={`star-${star}`}
                                    className={`w-4 h-4 ${
                                      (Number(applicant?.level) || 0) >= star
                                        ? "text-[#FAAB3C]"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="relative">
                                <button
                                  onClick={() => handleMenuClick(applicant._id)}
                                  className="p-2 rounded-md"
                                >
                                  <MoreVertical className="w-4 h-4 text-slate-600 dark:text-[#FDFDFD]" />
                                </button>
                                {openMenuId === applicant._id && (
                                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10 dark:bg-[#252525] dark:text-[#fff]">
                                    {/* Show Edit only if supervisorId matches */}
                                    {supervisorId &&
                                      supervisorId ===
                                        String(
                                          applicant.supervisor?.supervisorId
                                        ) &&
                                      applicant.applicationStatus !==
                                        "APPROVED" && (
                                        <button
                                          onClick={() => handleEdit(applicant)}
                                          className="block w-full px-4 py-2 text-left text-[12px] text-slate-600 dark:text-[#fff]"
                                        >
                                          Edit
                                        </button>
                                      )}

                                    <button
                                      onClick={() =>
                                        handleViewDetails(applicant)
                                      }
                                      className="block w-full px-4 py-2 text-left text-[12px] text-slate-600 dark:text-[#fff]"
                                    >
                                      View Details
                                    </button>
                                    <button
                                      onClick={() => setOpenMenuId(null)}
                                      className="block w-full px-4 py-2 text-left text-red-600 "
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {success && (
        <SuccessPopup
          onClose={() => setSuccess(false)}
          title={successMessage}
        />
      )}
      {failed && (
        <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
      )}

      {selectedApplicant && (
        <>
          {/* Dimmed background that closes the panel on click */}
          <button
            className="fixed inset-0 bg-black bg-opacity-60 z-40"
            onClick={handleviewclose}
            aria-label="Close panel"
          />

          {/* Slide-over panel */}
          <div className="fixed top-0 h-full w-[666px] right-0 z-50 bg-white  shadow-xl flex flex-col  dark:bg-[#343434]">
            {/* Header (Fixed) */}
            <div
              className="flex justify-between items-center p-6 border-b dark: border-none bg-[#FCFCFD] dark:bg-[#343434] z-10"
              style={{
                width: "666px",
                height: "114px",
                position: "sticky",
                top: 0,
              }}
            >
              {/* Left: Profile Info */}
              <div className="flex items-center gap-4">
                <img
                  src="/assets/images/proff.jpg"
                  alt="Profile"
                  className="w-[60px] h-[60px] rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[16px] font-bold text-[#0A0A14] leading-tight dark:text-[#fff]">
                      {Applicantbyid?.candidateFirstName}{" "}
                      {Applicantbyid?.candidateLastName}
                    </h2>
                  </div>
                  <div className="mt-1 text-[10px] text-[#0A0A14] font-medium flex items-center gap-2 dark:text-[#D6D6D6]">
                    <span>Applied for</span>
                    <span className="text-[#D28F35] px-3 py-1 text-sm rounded-md font-medium text-[10px]">
                      {Applicantbyid?.positionApplied}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Status + Close */}
              <div className="flex flex-col items-end gap-3">
                {/* Close Button */}
                <button
                  onClick={handleviewclose}
                  className="text-[#0A0A14] text-[18px] font-bold hover:text-black dark:text-[#fff]"
                >
                  <IoCloseOutline />
                </button>

                {/* Status */}
                <div className="flex items-center gap-2">
                  {/* STATUS label */}
                  <span className="text-[12px] text-[#0A0A14] font-medium tracking-wide uppercase dark:text-[#fff]">
                    STATUS
                  </span>

                  {/* STATUS value */}
                  <span className="text-[12px] font-medium text-[#0A0A14] border border-[#E5E7EB] px-4 py-1.5 rounded-xl dark:border-[#5f5959] dark:text-[#B8B8B8]">
                    {Applicantbyid?.applicationStatus ?? "New Application"}
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto scrollbar-none flex-grow px-8 py-4 space-y-6">
              <div className="flex items-stretch gap-4 w-full">
                {/* Left Column */}
                <div className="flex flex-col w-[262px] gap-4 flex-shrink-0">
                  {/* Personal Details */}
                  <div className=" border border-[#E0E4E9] rounded-2xl p-4 text-sm text-gray-800 shadow-sm dark:border-[#5F5959]">
                    <h3 className="text-[12px] font-semibold mb-6 text-[#010E30] dark:text-[#fff]">
                      Personal details
                    </h3>
                    {[
                      {
                        label: "FULL NAME",
                        value: `${Applicantbyid?.candidateFirstName} ${Applicantbyid?.candidateLastName}`,
                      },
                      {
                        label: "E-MAIL",
                        icon: <Mail className="w-4 h-4" />,
                        value: Applicantbyid?.candidateEmail,
                      },
                      {
                        label: "PHONE",
                        icon: <Phone className="w-4 h-4" />,
                        value: Applicantbyid?.candidatePhoneNumber,
                      },
                      { label: "LINKEDIN", value: "linkedInjd/in/j.str" },
                      { label: "APPLIED", value: Applicantbyid?.createdDate },
                    ].map(({ label, value, icon }) => (
                      <div
                        key={label}
                        className="flex justify-between items-center py-2 border-t border-[#E0E4E9] dark:border-[#5F5959]"
                      >
                        <div className="uppercase text-[10px] text-gray-500 font-medium dark:text-[#D6D6D6]">
                          {label}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-medium text-[#010E30] dark:text-[#D6D6D6]">
                          {icon}
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Experience */}
                  {Applicantbyid &&
                    Applicantbyid.professionalExperience &&
                    Applicantbyid.professionalExperience.length > 0 && (
                      <div className="h-[300px] overflow-y-auto border dark:border-[#5e5959] rounded-2xl p-4 text-sm text-gray-800 shadow-sm">
                        <h3 className="text-[12px] font-semibold text-[#010E30] dark:text-white mb-3">
                          Professional Experience
                        </h3>
                        {Applicantbyid.professionalExperience.map(
                          (exp, idx) => (
                            <div key={idx} className="mb-4">
                              <h4 className="text-[12px] text-[#010E30] dark:text-white font-semibold">
                                {exp.jobRole}
                              </h4>
                              <div className="flex justify-between text-[10px] text-[#8f8f8f] mt-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {new Date(
                                      exp.fromDate
                                    ).toLocaleDateString()}{" "}
                                    -{" "}
                                    {new Date(exp.toDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <span>{exp.jobLocation}</span>
                              </div>
                              {exp.jobDescription && (
                                <p className="mt-2 text-[11px] text-[#4B5563] dark:text-[#dbdbdb]">
                                  {exp.jobDescription}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="flex flex-col w-[300px] gap-1 flex-shrink-0">
                  {[
                    {
                      label: "Quran Reading",
                      state: quranReading,
                      setState: setQuranReading,
                    },
                    { label: "Tajweed", state: tajweed, setState: setTajweed },
                    {
                      label: "Arabic Speaking",
                      state: arabicSpeaking,
                      setState: setArabicSpeaking,
                    },
                    {
                      label: "Arabic Writing",
                      state: arabicWriting,
                      setState: setArabicWriting,
                    },
                    {
                      label: "English Speaking",
                      state: englishSpeaking,
                      setState: setEnglishSpeaking,
                    },
                  ].map(({ label, state, setState }) => (
                    <div key={label} className="mt-3">
                      <div className="text-[12px] font-Medium text-[#1E2A41] dark:text-[#fff]">
                        {label}
                      </div>
                      <div className="flex gap-3 mt-1 text-[10px] font-medium text-[#989292]">
                        {["Basic", "Medium", "Advanced"].map((level) => (
                          <label
                            key={level}
                            className={`flex items-center gap-2 rounded px-3 py-1 transition-all dark:border border-[#E0E4EA] ${
                              state === level
                                ? "border border-[#D9DEE8]"
                                : "border border-[#D9DEE8]"
                            }`}
                          >
                            <input
                              type="radio"
                              name={label}
                              value={level}
                              checked={state === level}
                              onChange={() => setState(level)}
                              disabled={mode === "view"}
                              className="appearance-none w-[10px] h-[10px] rounded-full border border-[#333D58] checked:bg-[#1E2A41] checked:ring-1 checked:ring-offset-1 transition-all
                                       dark:border-[#A9A9A9] dark:checked:bg-[#E5E5E5] dark:checked:ring-[#E5E5E5] dark:ring-offset-[#333D58] disabled:opacity-50"
                            />
                            {level}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Preferences */}
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    {/* Preferred Working Days */}
                    {/* Preferred Working Hours */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1E2A41] mb-1 dark:text-[#fff]">
                        Preferred Working Hours
                        {mode === "edit" && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <input
                        type="text"
                        className={`border rounded px-2 py-1 w-full text-[10px] font-medium text-[#1E2A41] dark:bg-[#343434] dark:border-[#5f5959] dark:text-[#989292] ${
                          mode === "view"
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-white border-gray-300"
                        }`}
                        value={preferredWorkingHours}
                        onChange={(e) =>
                          setPreferredWorkingHours(e.target.value)
                        }
                        disabled={mode === "view"}
                        placeholder="e.g., 9 AM - 6 PM"
                      />
                    </div>

                    {/* Expected Salary per Hour */}
                    <div>
                      <label className="block text-[11px] font-medium text-[#1E2A41] mb-1 dark:text-[#fff]">
                        Expected Salary per Hour
                           {mode === "edit" && <span className="text-red-500 ml-1">*</span>}

                      </label>
                       <input
    type="number"
    className={`border rounded px-2 py-1 w-full text-[10px] font-medium text-[#1E2A41] dark:bg-[#343434] dark:border-[#5f5959] dark:text-[#989292] ${
      mode === "view" ? "bg-gray-100 cursor-not-allowed" : "bg-white border-gray-300"
    }`}
    value={expectedSalary}
    onChange={(e) => {
      // Ensure we're storing as string but will convert to number when sending
      setExpectedSalary(e.target.value);
    }}
    disabled={mode === "view"}
    placeholder="Enter expected salary"
    min="0"
    step="0.01"
    onBlur={(e) => {
      // Format the number when user leaves the field
      const value = e.target.value;
      if (value && !isNaN(parseFloat(value))) {
        setExpectedSalary(parseFloat(value).toString());
      }
    }}
  />
                    </div>

                    {/* Preferred Working Days */}
                    <div>
                      <label className="block text-[11px] font-medium text-[#1E2A41] mb-1 dark:text-[#fff]">
                        Preferred Working Days
                        {mode === "edit" && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>

                      <div className="grid grid-cols-3 gap-2 text-[11px] dark:text-[#989292]">
                        {daysList.map((day) => (
                          <label
                            key={day}
                            className={`flex items-center gap-2 p-1 rounded ${
                              mode === "view"
                                ? "cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedDays.includes(day)}
                              onChange={() => handleDaySelection(day)}
                              disabled={mode === "view"}
                              className={
                                mode === "view"
                                  ? "cursor-not-allowed"
                                  : "cursor-pointer"
                              }
                            />
                            {day}
                          </label>
                        ))}
                      </div>

                      {/* Display current selection */}
                      {workingDays && (
                        <p className="mt-2 text-[12px] font-semibold text-[#1E2A41] dark:text-[#fff]">
                          Selected: {workingDays}
                        </p>
                      )}
                    </div>

                    {/* Overall Rating */}
                    <div>
                      <label
                        htmlFor="Overall Rating"
                        className="block text-[11px] font-medium text-[#1E2A41] mb-1 dark:text-[#fff]"
                      >
                        Overall Rating
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            className={`text-xl cursor-pointer ${
                              rating >= star
                                ? "text-yellow-500"
                                : "text-gray-300"
                            } ${mode === "view" ? "cursor-default" : ""}`}
                            onClick={() => mode !== "view" && setRating(star)}
                            type="button"
                            disabled={mode === "view"}
                            aria-label={`Rate ${star} star${
                              star > 1 ? "s" : ""
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="mt-3">
                    <div className="text-[11px] font-medium text-[#1E2A41] mb-1 dark:text-[#fff]">
                      Comments
                    </div>
                    <textarea
                      className="w-full p-2 border rounded h-24 resize-none text-[10px] font-medium text-[#1E2A41] dark:bg-[#343434] dark:border-[#5f5959] dark:text-[#989292] disabled:opacity-50"
                      placeholder="Add your comments here..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      disabled={mode === "view"}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-[12px] border-b border-[#E0E4E9] dark:border-[#5F5959] pb-1 mb-3 text-[#1E2A41] dark:text-[#fff]">
                  Skills
                </h3>

                <div className="flex flex-wrap gap-2 text-[10px]">
                  {(Applicantbyid?.skills
                    ? Applicantbyid.skills
                        .split(",")
                        .map((skill) => skill.trim())
                    : []
                  ).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 border rounded-full text-[#010E30E5] bg-gray-50 dark:bg-[#343434] dark:text-[#d5d5d5] border-[#E0E4E9] dark:border-[#5F5959]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-medium text-[#010E30] text-[12px] border-b dark:border-b-[#5F5959] pb-1 mb-3 dark:text-[#fff]">
                  Documents
                </h3>
                <div className="flex items-center gap-2">
                  {resumeImages && (
                    <button
                      onClick={() => {
                        window.open(resumeImages, "_blank");
                      }}
                      className="text-[#38619A] hover:underline text-[12px] flex items-center gap-1"
                    >
                      <ImAttachment className="w-3 h-3" />
                      View Resume
                    </button>
                  )}
                </div>
              </div>
            </div>
            {/* Footer (Fixed) */}
            <div className="w-full border-t p-3 flex justify-end gap-3 bg-white z-10 dark:bg-[#343434] dark:border-t-[#5F5959]">
              {mode === "edit" && (
                <>
                  <button
                    onClick={() =>
                      handlesendupdate(Applicantbyid?._id ?? "", "REJECTED")
                    }
                    className="px-4 py-2 text-[12px] text-[#D34645] bg-[#FDECEC] rounded-lg dark:bg-[#543838]"
                  >
                    Rejected
                  </button>
                  <button
                    onClick={() =>
                      handlesendupdate(Applicantbyid?._id ?? "", "WAITING")
                    }
                    className="px-4 py-2 text-[12px] text-[#F0AD4E] bg-[#FDF6EC] rounded-lg dark:bg-[#5A4D3B]"
                  >
                    Waiting
                  </button>
                  <button
                    onClick={() =>
                      handlesendupdate(Applicantbyid?._id ?? "", "SHORTLISTED")
                    }
                    className="px-4 py-2 text-[12px] text-[#377E36] bg-[#ECFDF3] rounded-lg dark:bg-[#377E3633]"
                  >
                    Shortlisted
                  </button>
                  <button
                    onClick={() =>
                      handlesendupdate(Applicantbyid?._id ?? "", "SENDAPPROVAL")
                    }
                    className="px-4 py-2 text-[12px] text-[#4E91F0] bg-[#ECF3FD] rounded-lg dark:bg-[#39475A]"
                  >
                    Send for Approval
                  </button>
                </>
              )}
              {mode === "view" && (
                <button
                  onClick={handleviewclose}
                  className="px-4 py-2 text-[12px] text-[#4E91F0] bg-[#ECF3FD] rounded-lg dark:bg-[#39475A]"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </BaseLayout3>
  );
}