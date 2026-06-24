"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Plus } from "lucide-react";
import axios, { AxiosError } from "axios";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";

type Props = {
  readonly onClose: () => void;
};

interface Participants {
  studentId: string;
  name: string;
  studentDetails: {
    student: {
      studentId: string;
      studentFirstName: string;
      studentLastName: string;
      studentEmail: string;
      studentGender: string;
      studentPhone: number;
      studentCity: string;
      studentCountry: string;
      studentCountryCode: string;
      learningInterest: string;
      numberOfStudents: number;
      preferredTeacher: string;
      preferredFromTime: string;
      preferredToTime: string;
      timeZone: string;
      referralSource: string;
      preferredDate: string;
      evaluationStatus: string;
      status: string;
      createdDate: string;
      createdBy: string;
    };
    teacher: {
      teacherId: string;
      teacherName: string;
      teacherEmail: string;
    };
    subscription: {
      subscriptionName: string;
    };
    _id: string;
    academicCoachId: string;
    classType: string;
    classDay: string[];
    startTime: string;
    endTime: string;
    isLanguageLevel: boolean;
    languageLevel: string;
    isReadingLevel: boolean;
    readingLevel: string;
    isGrammarLevel: boolean;
    grammarLevel: string;
    hours: number;
    planTotalPrice: number;
    classStartDate: string;
    classEndDate: string;
    classStartTime: string;
    classEndTime: string;
    accomplishmentTime: string;
    studentRate: number;
    gardianName: string;
    gardianEmail: string;
    gardianPhone: string;
    gardianCity: string;
    gardianCountry: string;
    gardianTimeZone: string;
    gardianLanguage: string;
    assignedTeacher: string;
    studentStatus: string;
    classStatus: string;
    comments: string;
    trialClassStatus: string;
    invoiceStatus: string;
    paymentLink: string;
    paymentStatus: string;
    teacherStatus: string;
    status: string;
    createdDate: string;
    createdBy: string;
    updatedDate: string;
    updatedBy: string;
    expectedFinishingDate: number;
    assignedTeacherId: string;
    assignedTeacherEmail: string;
    __v: number;
  };
}

const tabs = ["All", "Quran", "Arabic", "Islamic"] as const;
type Tab = (typeof tabs)[number];

export default function AddMeeting({ onClose }: Props) {
  const [meetingTitle, setMeetingTitle] = useState("Weekly Sync");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [selectedParticipants, setSelectedParticipants] = useState<
    Participants[]
  >([]);
  const [Participants, setParticipants] = useState<Participants[]>([]);

  // Compute tomorrow's date in local time to disable today in the date picker
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
    if (!open) return; // ✅ Only run when modal is open

    const fetchTeachers = async () => {
      try {
        const teacherId = localStorage.getItem("TeacherPortalId") ?? "";
        const token = localStorage.getItem("TeacherAuthToken") ?? "";

        const params: Record<string, string> = {
          teacherId,
        };

        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TEACHER_CLASS_LIST}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params,
          }
        );

        const allParticipants = response.data ?? [];
        console.log("Applicants received:", allParticipants);
        
        // Debug: Log all unique learning interests
        const allInterests = allParticipants.map((p: any) => p.studentDetails?.student?.learningInterest).filter(Boolean);
        const uniqueInterests = allInterests.filter((interest: any, index: number) => allInterests.indexOf(interest) === index);
        console.log("Unique learning interests found:", uniqueInterests);

        const filteredParticipants =
          activeTab === "All"
            ? allParticipants
            : allParticipants.filter(
                (participant: any) => {
                  const learningInterest = participant.studentDetails?.student?.learningInterest;
                  if (!learningInterest) return false;
                  
                  // Handle different possible values for Islamic studies
                  const normalizedInterest = learningInterest.toLowerCase().trim();
                  const normalizedTab = activeTab.toLowerCase().trim();
                  
                  // Debug logging for Islamic tab
                  if (normalizedTab === "islamic") {
                    const matches = normalizedInterest === "islamic" || 
                                   normalizedInterest === "islamic studies" ||
                                   normalizedInterest === "islam" ||
                                   normalizedInterest.includes("islamic");
                    console.log(`Islamic filter: "${learningInterest}" -> "${normalizedInterest}" -> matches: ${matches}`);
                    return matches;
                  }
                  
                  const matches = normalizedInterest === normalizedTab;
                  if (normalizedTab !== "all") {
                    console.log(`${normalizedTab} filter: "${learningInterest}" -> "${normalizedInterest}" -> matches: ${matches}`);
                  }
                  return matches;
                }
              );

        setParticipants(filteredParticipants);
      } catch (error) {
        console.error("Error fetching teachers", error);
        setParticipants([]);
      }
    };

    fetchTeachers();
  }, [open, activeTab]);



  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!meetingTitle.trim()) {
  setFailedMessage(
    AppValidationMessages.MEETING.TITLE_REQUIRED
  );
  setFailed(true);
  return;
}

if (meetingTitle.trim().length < 3) {
  setFailedMessage(
    AppValidationMessages.MEETING.TITLE_MIN
  );
  setFailed(true);
  return;
}

if (selectedParticipants.length === 0) {
  setFailedMessage(
    AppValidationMessages.MEETING.PARTICIPANT_REQUIRED
  );
  setFailed(true);
  return;
}

if (!selectedDate) {
  setFailedMessage(
    AppValidationMessages.MEETING.DATE_REQUIRED
  );
  setFailed(true);
  return;
}

if (!startTime) {
  setFailedMessage(
    AppValidationMessages.MEETING.START_TIME_REQUIRED
  );
  setFailed(true);
  return;
}

if (!endTime) {
  setFailedMessage(
    AppValidationMessages.MEETING.END_TIME_REQUIRED
  );
  setFailed(true);
  return;
}

if (startTime >= endTime) {
  setFailedMessage(
    AppValidationMessages.MEETING.INVALID_TIME
  );
  setFailed(true);
  return;
}

if (!description.trim()) {
  setFailedMessage(
    AppValidationMessages.MEETING.DESCRIPTION_REQUIRED
  );
  setFailed(true);
  return;
}

if (description.trim().length < 10) {
  setFailedMessage(
    AppValidationMessages.MEETING.DESCRIPTION_MIN
  );
  setFailed(true);
  return;
}

    // Prevent scheduling on the same date or past dates
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

    if (
  !meetingTitle ||
  !selectedDate ||
  !startTime ||
  !endTime ||
  selectedParticipants.length === 0
) {
  alert("Please fill all required fields!");
  return;
}



// ✅ Debug logs
console.log("Start Time:", startTime);
console.log("End Time:", endTime);
console.log("Selected Date:", selectedDate);


    const studentPayload = selectedParticipants.map((student) => ({
      studentId: student.studentId,
      studentName: student.name,
      studentEmail: student.studentDetails.student.studentEmail,
      _id: student.studentId,
      attendee: "absent",
    }));

    const requestData = {
      meetingId: "",
      meetingName: meetingTitle,
      selectedDate: formattedDate, // ✅ Changed from selectedDate
     startTime,
endTime,
      meetingStatus: "Scheduled",
      teacher: {
        teacherId: localStorage.getItem("TeacherPortalId"),
        teacherName: localStorage.getItem("TeacherPortalName"),
        teacherEmail: "gomathi.blackstone@gmail.com",
        teacherrRole: "Teacher",
      },
      participants: studentPayload,
      meetingminutes: " ",
      description,
      status: "Active",
      createdDate,
      createdBy: localStorage.getItem("TeacherPortalName"),
    };

try {
  const token = localStorage.getItem("TeacherAuthToken");

  const response = await axios.post(
    `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TEACHERMEETING.CREATE}`,
    requestData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  console.log("Meeting created successfully:", response.data);

  if ([200, 201].includes(response.status)) {
    setSuccess(true);

    setTimeout(() => {
      setMeetingTitle("");
      setSelectedDate("");
      setStartTime("");
      setEndTime("");
      setSelectedParticipants([]);
      setDescription("");
    }, 2000);
  }
}
    
    catch (err) {
      const error = err as AxiosError;
      const status = error.response?.status;

      if (status === 400) {
        setFailedMessage(AppFailureToastMessages.BAD_REQUEST);
      } else if (status === 401) {
        setFailedMessage(AppFailureToastMessages.UNAUTHORIZED);
      } else if (status === 403) {
        setFailedMessage(AppFailureToastMessages.FORBIDDEN);
      } else if (status === 500) {
        setFailedMessage(AppFailureToastMessages.SERVER_ERROR);
      } 

      setFailed(true);
      console.error(`Error (${status}):`, error.message);
    }
  };
const toggleTeacher = (student: Participants) => {
  setSelectedParticipants((prev) => {
    const exists = prev.find((p) => p.studentId === student.studentId);

    if (exists) {
      // Remove
      return prev.filter((p) => p.studentId !== student.studentId);
    } else {
      // Add
      return [...prev, student];
    }
  });
};

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#1D1D1D] rounded-lg shadow-xl p-5 w-full max-w-xl mx-3 text-sm"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <h1 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          Add Meeting
        </h1>

        {/* Meeting Name */}
        <div className="mb-4">
          <label
            htmlFor="meetingname"
            className="block text-sm text-gray-600 dark:text-white mb-1"
          >
            Meeting Name
          </label>
          <input
            type="text"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            placeholder="Weekly Meeting"
            className="w-full border rounded px-3 py-2 text-sm dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
          />
        </div>

        {/* Add Participants */}
     {/* Add Participants */}
<div className="mb-4">
  <label className="block text-sm text-gray-600 dark:text-white mb-1">
    Add Participants
  </label>

  {/* Input */}
  <div className="relative">
    <input
      type="text"
      readOnly
      value={selectedParticipants.map((p) => p.name).join(", ")}
      placeholder="Select participants"
      className="w-full border rounded px-3 py-2 text-sm pr-10 dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
    />

    <button
      type="button"
      onClick={() => setOpen(true)}
      className="absolute inset-y-0 right-0 flex items-center"
    >
      <Plus
        size={19}
        className="dark:text-[#fff] border border-[#858B94] rounded-sm -ml-7 p-[2px]"
      />
    </button>
  </div>

  {/* Selected Participants Chips */}
  {selectedParticipants.length > 0 && (
    <div className="mt-2 p-2 border rounded bg-gray-50 dark:bg-[#2A2A2A]">
      <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
        Selected Participants:
      </p>

      <div className="flex flex-wrap gap-2">
        {selectedParticipants.map((p) => (
          <span
            key={p.studentId}
            className="px-2 py-1 bg-[#1d1d1d46] text-white text-xs rounded-md flex items-center gap-1"
          >
            {p.name}

            <button
              type="button"
              onClick={() => toggleTeacher(p)}
              className="hover:text-red-500"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  )}

  {/* Dialog */}
  <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
    <div className="fixed inset-0 bg-black/50" />

    <div className="fixed inset-0 flex items-center justify-center p-4">
      <section className="bg-white dark:bg-[#1D1D1D] rounded-lg p-5 w-full max-w-md">

        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Select Participants
        </h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs rounded ${
                activeTab === tab
                  ? "bg-[#576CBC] text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Participant List */}
        <div className="space-y-2 max-h-48 overflow-y-auto text-sm">
          {Participants.length === 0 && (
            <p className="text-center text-gray-400 text-xs">
              No participants found
            </p>
          )}

          {Participants.map((student) => (
            <label
              key={student.studentId}
              className="flex items-center gap-2"
            >
              <input
                type="checkbox"
                checked={selectedParticipants.some(
                  (p) => p.studentId === student.studentId
                )}
                onChange={() => toggleTeacher(student)}
              />

              <span className="dark:text-white">
                {student.name}
              </span>
            </label>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-4 gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-3 py-1 border text-[#576CBC] rounded text-xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-1 bg-[#576CBC] text-white rounded text-xs"
          >
            Done
          </button>
        </div>

      </section>
    </div>
  </Dialog>
</div>


        {/* Participants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="meetingdate"
              className="block text-sm text-gray-600 dark:text-white mb-1"
            >
              Meeting Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={minDateForMeeting}
              className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C] dark:[color-scheme:dark]"
            />
          </div>

       
        </div>

        <div className="mb-4">
          <label
            htmlFor="meetingtime"
            className="block text-sm text-gray-600 dark:text-white mb-1"
          >
            Meeting Time
          </label>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C] dark:[color-scheme:dark]"
            />
            <span className="text-gray-500 dark:text-white">-</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C] dark:[color-scheme:dark]"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm text-gray-600 dark:text-white mb-1"
          >
            Add Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Write a description here..."
            className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-[#576CBC] border rounded hover:bg-[#576bbc1a] text-[12px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-2 bg-[#576CBC] text-white rounded hover:bg-[#576bbcaf] text-[12px]"
          >
            Submit
          </button>
        </div>

        {/* Success & Error Messages */}

              {success && (
          <SuccessPopup
            onClose={() => {
              setSuccess(false);
              onClose();
            }}
            title="Meeting"
          />
        )}
        {failed && (
          <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
        )}
      </form>
    </div>
  );
}
