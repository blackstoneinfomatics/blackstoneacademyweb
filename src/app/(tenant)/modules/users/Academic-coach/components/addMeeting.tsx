"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@headlessui/react";
import { Plus } from "lucide-react";
import axios, { AxiosError } from "axios";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type Props = {
  readonly onClose: () => void;
  readonly onSuccess?: () => void; // notify parent to refresh table
};
export interface StudentData {
  _id: string;
  username: string;
  password: string;
  role: string;
  status: string;
  createdBy: string;
  createdDate: string; // ISO date string
  updatedDate: string; // ISO date string
  classScheduleCount: number;
  student: {
    city: string;
    country: string;
    course: string;
    gender: string;
    package: string;
    studentEmail: string;
    studentId: string;
    studentPhone: number | string;
  };
  __v?: number;
}

type SimpleUser = {
  _id: string;
  userId : string;
  username: string;
  email?: string;
  role: string;
  position?: string;
};

export default function AddMeeting({ onClose, onSuccess }: Props) {
  const router = useRouter();
  const [meetingTitle, setMeetingTitle] = useState("Weekly Meeting");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [selectedTeachers, setSelectedTeachers] = useState<StudentData[]>([]);
  const [Teachers, setTeachers] = useState<StudentData[]>([]);
  const [allUsers, setAllUsers] = useState<SimpleUser[]>([]);
  const [roleTab, setRoleTab] = useState<"Student" | "Teacher" | "Admin">("Student");
  const [selectedTeacherUsers, setSelectedTeacherUsers] = useState<SimpleUser[]>([]);
  const [selectedAdminUsers, setSelectedAdminUsers] = useState<SimpleUser[]>([]);
  const [teacherCategoryTab, setTeacherCategoryTab] = useState<
    "All" | "Quran Teacher" | "Arabic Teacher" | "Islamic Teacher"
  >("All");
  const tabs = ["All", "Quran", "Arabic", "Islamic"] as const;
  type Tab = (typeof tabs)[number];

  const formatLocalDateYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const minDateForMeeting = (() => {
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    return formatLocalDateYYYYMMDD(tomorrow);
  })();

  useEffect(() => {
    const FetachTeachers = async () => {
      console.log("Active tabs", activeTab);
      try {
        const Id =
          typeof window !== "undefined"
            ? localStorage.getItem("AcademicCoachPortalId")
            : null;
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("AcademicCoachAuthToken")
            : null;
        const url = `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.GET}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data);
        setTeachers(response.data.students ?? []);
      } catch (error) {
        console.log(error);
        setTeachers([]);
      }
    };
    FetachTeachers();
  }, [activeTab]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("AcademicCoachAuthToken")
            : null;
        if (!token) return;
        const url = `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.USER.GET}`;
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const users: SimpleUser[] = (response.data?.users || response.data || []).map((u: any) => {
          const roleValue = Array.isArray(u.role) ? (u.role[0] ?? "") : (u.role ?? u.userRole ?? "");
          const nameValue = u.userName ?? u.username ?? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
          return {
            _id: u._id ?? u.id ?? "",
            userId: u.userId ?? u.userId ?? "",
            username: nameValue,
            email: u.email ?? u.userEmail ?? "",
            role: String(roleValue),
            position: u.position ?? "",
          } as SimpleUser;
        });
        setAllUsers(users);
      } catch (e) {
        console.error("Failed to fetch users", e);
        setAllUsers([]);
      }
    };
    fetchAllUsers();
  }, []);

  const toggleTeacher = (teacher: StudentData) => {
    setSelectedTeachers((prev) => {
      const exists = prev.some((t) => t._id === teacher._id);
      return exists
        ? prev.filter((t) => t._id !== teacher._id)
        : [...prev, teacher];
    });
  };

  const toggleUserByRole = (user: SimpleUser, role: "Teacher" | "Admin") => {
    if (role === "Teacher") {
      setSelectedTeacherUsers((prev) => {
        const exists = prev.some((t) => t._id === user.userId);
        return exists ? prev.filter((t) => t._id !== user.userId) : [...prev, user];
      });
    } else {
      setSelectedAdminUsers((prev) => {
        const exists = prev.some((t) => t._id === user.userId);
        return exists ? prev.filter((t) => t._id !== user.userId) : [...prev, user];
      });
    }
  };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    
      if (!meetingTitle || !selectedDate || !startTime || !endTime) {
        alert("Please fill all required fields!");
        return;
      }
    
      if (!description || description.trim().length < 5) {
        setFailedMessage("Description must contain at least 5 characters.");
        setFailed(true);
        return;
      }
    
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const picked = selectedDate ? new Date(selectedDate) : null;
      if (!picked) {
        alert("Please select a meeting date.");
        return;
      }
    
      const pickedLocal = new Date(picked.getFullYear(), picked.getMonth(), picked.getDate());
      if (pickedLocal <= startOfToday) {
        alert("Meetings cannot be scheduled for today. Please pick a future date.");
        return;
      }
    
      const formattedDate = new Date(selectedDate).toISOString();
      const createdDate = new Date().toISOString();
    
      const participants = [
        ...selectedTeacherUsers.map((u) => ({
          participantId: u.userId,
          participantName: u.username,
          participantEmail: u.email || "",
          role: "teacher" as const,
          attendee: "Teacher",
        })),
        ...selectedTeachers.map((t) => ({
          participantId: t.student.studentId,
          participantName: t.username,
          participantEmail: t.student.studentEmail || "",
          role: "student" as const,
          attendee: "Student",
        })),
        ...selectedAdminUsers.map((u) => ({
          participantId: u.userId,
          participantName: u.username,
          participantEmail: u.email || "",
          role: "admin" as const,
          attendee: "Admin",
        })),
      ];
      
    
      // 🧩 Supervisor info
      const organizerId = localStorage.getItem("AcademicCoachPortalId") || "";
      const organizerName = localStorage.getItem("AcademicCoachPortalName") || "";
      const organizerEmail = localStorage.getItem("AcademicCoachPortalEmail") || "";
      const organizerRole = localStorage.getItem("AcademicCoachPortalRole") || "Academic Coach";

      const organizer = organizerEmail && organizerEmail.includes("@")
        ? { organizerId, organizerName, organizerEmail, organizerRole }
        : { organizerId, organizerName, organizerRole };
  
      // ✅ Final payload (typed as IMeetingCreate)
      const formattedPayload = {
        meetingName: meetingTitle,
        meetingId: `meet-${crypto.randomUUID()}`,
        selectedDate: formattedDate,
        startTime,
        endTime,
        meetingStatus: "Scheduled",
        organizer,
        participants,
        description,
        status: "Active",
        duration: "", 
        createdDate,
        createdBy: organizerName || "System",
      };
    
      console.log("🧾 Final Payload:", formattedPayload);
    
      try {
        const token = localStorage.getItem("AcademicCoachAuthToken");
        if (!token) {
          setFailedMessage("Please login again.");
          setFailed(true);
          return;
        }
    
        const response = await axios.post("${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MEETING.CREATE}", formattedPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
    
        console.log("✅ Response:", response.data);
        if (response.status >= 200 && response.status < 300) {
          setSuccess(true);
        } else {
          setFailedMessage("Request failed. Please try again.");
          setFailed(true);
        }
      } catch (err) {
        const error = err as AxiosError;
        console.error("❌ API Error:", error.response?.data || error.message);
        setFailedMessage("Something went wrong. Please try again.");
        setFailed(true);
      }
    };
  
  

  return (
<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
  <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#1f1f1f] rounded-lg shadow-xl p-5 w-full max-w-xl mx-3 text-sm scrollbar-none"
                style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
    <h1 className="text font-semibold text-gray-800 mb-4 dark:text-white dark:border-gray-700 pb-2">
    Add Meeting
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left */}
          <div>
            <div>
              <label
                htmlFor="uyvuhvyuc"
                className="block text-sm mb-2 text-gray-600 dark:text-gray-300">
                Meeting Name
              </label>
              <input
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                type="text"
                className="w-full text-xs border border-[#D4D4D4] dark:border-[#3F3F46] rounded-lg px-3 py-2 
          focus:outline-none focus:ring-1 focus:ring-[#6366F1] bg-white dark:bg-[#2A2A2A] 
          text-[#1E1E1E] dark:text-[#E4E4E7]"
                />
            </div>
            <div className="mt-4">              
              <label
                htmlFor="uyvuhvyuc"
                className="block text-sm mb-2 text-gray-600 dark:text-gray-300">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs border border-[#D4D4D4] dark:border-[#3F3F46] rounded-lg px-3 py-2 
          focus:outline-none focus:ring-1 focus:ring-[#6366F1] bg-white dark:bg-[#2A2A2A] 
          text-[#1E1E1E] dark:text-[#E4E4E7] dark:[color-scheme:dark]"
                />
            </div>
            <div className="mt-4">              
              <label
                htmlFor="uyvuhvyuc"
                className="block text-sm mb-2 text-gray-600 dark:text-gray-300">
              
                Add Participants
              </label>
              <div className="relative flex items-center  dark:bg-[#2B2B2B]  w-full text-xs border border-[#D4D4D4] dark:border-[#3F3F46] rounded-lg px-2 py-2 
          focus:outline-none focus:ring-1 focus:ring-[#6366F1] bg-white 
          text-[#1E1E1E] dark:text-[#E4E4E7]">
              <div className="flex-1 px-2 text-xs text-gray-500 dark:text-gray-300 font-light">
              Select Participants                </div>
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="text-[#576CBC] hover:text-blue-700 ml-2"
                >
                  <Plus size={18} />
                </button>
              </div>
              <Dialog
                open={open}
                onClose={() => setOpen(false)}
                className="relative z-50"
              >
                <div className="fixed inset-0 bg-black/50" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                <section className="bg-white dark:bg-[#1D1D1D] rounded-xl p-6 w-full max-w-md shadow-xl">
                <h2 className="text-[16px] font-medium mb-4 text-gray-800 dark:text-white">
                      Select Participants
                    </h2>
                    <div className="flex items-center gap-2 mb-3 border-b border-gray-300 dark:border-gray-600 pb-2">
                      <button onClick={() => setRoleTab("Teacher")} className={`px-3 py-1.5 text-xs rounded-md ${roleTab === "Teacher" ? "bg-[#576CBC] text-white" : "bg-gray-100 dark:bg-[#2B2B2B] text-gray-800 dark:text-white"}`}>Teachers</button>
                    </div>
                   
                    {roleTab === "Teacher" && (
                      <>
                        <div className="flex gap-2 mb-2">
                          {(["All", "Quran Teacher", "Arabic Teacher", "Islamic Teacher"] as const).map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setTeacherCategoryTab(tab)}
                              className={`px-3 py-1.5 text-xs rounded-md transition ${
                                teacherCategoryTab === tab
                                  ? "bg-[#576CBC] text-white"
                                  : "bg-gray-100 dark:bg-[#2B2B2B] text-gray-800 dark:text-white"
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto text-sm pr-1">
                          {allUsers
                            .filter((u) => {
                              const r = (u.role || "").toLowerCase();
                              if (r !== "teacher") return false;
                              if (teacherCategoryTab === "All") return true;
                              return (u.position || "").toLowerCase() === teacherCategoryTab.toLowerCase();
                            })
                            .map((user) => (
                              <label key={user.userId} className="flex items-center gap-2 px-1">
                                <input
                                  type="checkbox"
                                  checked={selectedTeacherUsers.some((t) => t.userId === user.userId)}
                                  onChange={() => toggleUserByRole(user, "Teacher")}
                                />
                                <span className="dark:text-white text-gray-700">{user.username}</span>
                              </label>
                            ))}
                        </div>
                      </>
                    )}
                   
                    <div className="flex justify-end mt-6 gap-3">
                    <button
                        onClick={() => setOpen(false)}
                        className="px-3 py-1 text-xs border border-gray-400 rounded-lg text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#2B2B2B]"
                        >
                        Cancel
                      </button>
                      <button
                        onClick={() => setOpen(false)}
                        className="px-3 py-1 text-xs bg-[#576CBC] text-white rounded-lg hover:bg-[#4459A9]"
                        >
                        Done
                      </button>
                    </div>
                  </section>
                </div>
              </Dialog>
            </div>
            {selectedTeachers.length > 0 && (
              <div className="mt-3">
                <label className="block text-xs mb-1 text-gray-600 dark:text-gray-300">
                  Selected Students
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedTeachers.map((t) => (
                    <span
                      key={t._id}
                      className="inline-flex items-center gap-2 px-1.5 py-0.5 rounded text-[10px] border border-gray-300 text-gray-700 dark:text-white dark:border-[#5C5C5C] dark:bg-[#2B2B2B]"
                    >
                      {t.username}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedTeachers((prev) => prev.filter((p) => p._id !== t._id))
                        }
                        className="ml-1 text-gray-500 hover:text-red-600"
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {selectedTeacherUsers.length > 0 && (
              <div className="mt-3">
                <label className="block text-xs mb-1 text-gray-600 dark:text-gray-300">
                  Selected Teachers
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedTeacherUsers.map((t) => (
                    <span key={t._id} className="inline-flex items-center gap-2 px-1.5 py-0.5 rounded text-[10px] border border-gray-300 text-gray-700 dark:text-white dark:border-[#5C5C5C] dark:bg-[#2B2B2B]">
                      {t.username}
                      <button
                        type="button"
                        onClick={() => setSelectedTeacherUsers((prev) => prev.filter((p) => p._id !== t._id))}
                        className="ml-1 text-gray-500 hover:text-red-600"
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {selectedAdminUsers.length > 0 && (
              <div className="mt-3">
                <label className="block text-xs mb-1 text-gray-600 dark:text-gray-300">
                  Selected Admins
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedAdminUsers.map((t) => (
                    <span key={t._id} className="inline-flex items-center gap-2 px-1.5 py-0.5 rounded text-[10px] border border-gray-300 text-gray-700 dark:text-white dark:border-[#5C5C5C] dark:bg-[#2B2B2B]">
                      {t.username}
                      <button
                        type="button"
                        onClick={() => setSelectedAdminUsers((prev) => prev.filter((p) => p._id !== t._id))}
                        className="ml-1 text-gray-500 hover:text-gray-800"
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right */}
          <div>
            <div className="mb-3">
              <label
                htmlFor="uyvuhvyuc"
                className="block text-sm mb-2 text-gray-600 dark:text-gray-300">
                      Date                 
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDateForMeeting}
                className="w-full text-xs border border-[#D4D4D4] dark:border-[#3F3F46] rounded-lg px-3 py-2 
          focus:outline-none focus:ring-1 focus:ring-[#6366F1] bg-white dark:bg-[#2A2A2A] 
          text-[#1E1E1E] dark:text-[#E4E4E7] dark:[color-scheme:dark]"
                />
            </div>
            <div className="mt-4">
              <label
                htmlFor="uyvuhvyuc"
               className="block text-sm mb-2 text-gray-600 dark:text-gray-300"
              >
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs border border-[#D4D4D4] dark:border-[#3F3F46] rounded-lg px-3 py-2 
          focus:outline-none focus:ring-1 focus:ring-[#6366F1] bg-white dark:bg-[#2A2A2A] 
          text-[#1E1E1E] dark:text-[#E4E4E7] dark:[color-scheme:dark]"
                />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-5">
        <label
            htmlFor="uyvuhvyuc"
            className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full text-xs border border-gray-300 dark:border-[#5C5C5C] rounded-lg px-3 py-3 text-[13px] font-light text-gray-800 dark:text-white dark:bg-[#2B2B2B] focus:ring-2 focus:ring-[#576CBC] outline-none resize-none"
            placeholder="Write meeting details..."
          />
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4 flex justify-end gap-3">
        <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs border border-[#576CBC] text-[#576CBC] rounded-lg hover:bg-[#E6E9F5] dark:hover:bg-[#2B2B2B]"
            >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs bg-[#576CBC] text-white rounded-lg hover:bg-[#4459A9]"
            >
            Submit
          </button>
        </div>
      </form>

      {success && (
        <SuccessPopup
          onClose={() => {
            setSuccess(false);
            try {
              onSuccess?.();
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("meeting:created"));
              }
            } catch {}
            setMeetingTitle("");
            setSelectedDate("");
            setStartTime("");
            setEndTime("");
            setSelectedTeachers([]);
            setDescription("");
            onClose();
            try {
              router.push("/modules/users/Academic-coach/ui/schedule");
            } catch {}
          }}
          title="Meeting"
        />
      )}
      {failed && (
        <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
      )}
    </div>
  );
}
