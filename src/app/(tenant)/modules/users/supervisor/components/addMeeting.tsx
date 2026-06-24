"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Plus } from "lucide-react";
import axios, { AxiosError } from "axios";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { toast, ToastContainer } from "react-toastify";

type Props = {
  readonly onClose: () => void;
};
interface Teacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  attendee: string;
}

export default function AddMeeting({ onClose }: Props) {
const [meetingTitle, setMeetingTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [selectedTeachers, setSelectedTeachers] = useState<Teacher[]>([]);
  const [Teachers, setTeachers] = useState<Teacher[]>([]);
  const tabs = ["All", "Quran", "Arabic", "Islamic"] as const;
  type Tab = (typeof tabs)[number];

  useEffect(() => {
    const FetachTeachers = async () => {
      console.log("Active tabs", activeTab);
      try {
        const Id =
          typeof window !== "undefined"
            ? localStorage.getItem("SupervisorPortalId")
            : null;
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("SupervisorAuthToken")
            : null;
        const url = `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TEACHERMEETING.GET_TEACHER_MEET}`;

        const params: Record<string, string> = {
          supervisorId: Id ?? "",
        };

        if (activeTab !== "All") {
          params.teacherGroup = `${activeTab} Teacher`;
          console.log("inserted", activeTab);
        }

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        });
        console.log(response.data);
        console.log("Final Axios params:", params);
        setTeachers(response.data.teachers ?? []);
      } catch (error) {
        console.log(error);
        setTeachers([]);
      }
    };
    FetachTeachers();
  }, [activeTab]);

  const toggleTeacher = (teacher: Teacher) => {
    setSelectedTeachers((prev) => {
      const exists = prev.some((t) => t.teacherId === teacher.teacherId);
      return exists
        ? prev.filter((t) => t.teacherId !== teacher.teacherId)
        : [...prev, teacher];
    });
  };

  const validateForm = () => {
  if (!meetingTitle.trim()) {
    console.log("TITLE FAILED");
    toast.error(
      AppValidationMessages.MEETING.TITLE_REQUIRED
    );
    return false;
  }

  if (meetingTitle.trim().length < 3) {
    toast.error(AppValidationMessages.MEETING.TITLE_MIN);
    return false;
  }

  if (!selectedDate) {
    toast.error(AppValidationMessages.MEETING.DATE_REQUIRED);
    return false;
  }

  if (!startTime) {
    toast.error(AppValidationMessages.MEETING.START_TIME_REQUIRED);
    return false;
  }

  if (!endTime) {
    toast.error(AppValidationMessages.MEETING.END_TIME_REQUIRED);
    return false;
  }

  if (startTime >= endTime) {
    toast.error(AppValidationMessages.MEETING.INVALID_TIME);
    return false;
  }

  if (selectedTeachers.length === 0) {
    toast.error(AppValidationMessages.MEETING.PARTICIPANT_REQUIRED);
    return false;
  }

  if (!description.trim()) {
    toast.error(AppValidationMessages.MEETING.DESCRIPTION_REQUIRED);
    return false;
  }

  if (description.trim().length < 10) {
    toast.error(AppValidationMessages.MEETING.DESCRIPTION_MIN);
    return false;
  }

  return true;
};
 const handleSubmit = async (
  event: FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

 if (!validateForm()) {
    console.log("VALIDATION FAILED");
    return;
  }

  console.log("VALIDATION PASSED");

    if (
      !meetingTitle ||
      !selectedDate ||
      !startTime ||
      !endTime ||
      selectedTeachers.length === 0
    ) {
      alert("Please fill all required fields!");
      return;
    }

    const formattedDate = new Date(selectedDate).toISOString();
    const createdDate = new Date().toISOString();

    const participants = selectedTeachers.map((teacher) => ({
      participantId: teacher.teacherId,
      participantName: teacher.teacherName,
      participantEmail: teacher.teacherEmail,
      role: "teacher",
    }));

    const requestData = {
      meetingId: "",
      meetingName: meetingTitle,
      selectedDate: formattedDate,
      startTime,
      endTime,
      meetingStatus: "Scheduled",
      organizer: {
        organizerId: localStorage.getItem("SupervisorPortalId"),
        organizerName: localStorage.getItem("SupervisorPortalName"),
        organizerEmail: localStorage.getItem("SupervisorPortalEmail"),
        role: "supervisor",
      },
      participants,
      meetingminutes: " ",
      description,
      status: "Active",
      createdDate,
      createdBy: localStorage.getItem("SupervisorPortalName"),
    };

    try {
      const token = localStorage.getItem("SupervisorAuthToken");
      if (!token) {
        console.error("❌ SupervisorAuthToken not found");
        return;
      }

      const response = await axios.post(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MEETING.CREATE}`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if ([200, 201].includes(response.status)) {
        setSuccess(true);
        setTimeout(() => {
          setMeetingTitle("");
          setSelectedDate("");
          setStartTime("");
          setEndTime("");
          setSelectedTeachers([]);
          setDescription("");
          onClose();
        }, 2000);
      }
    } catch (err) {
      const error = err as AxiosError;
      const status = error.response?.status;
      setTimeout(() => {
        onClose();
      }, 3000);
      if (status === 400)  {
        console.log("please >");
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
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#1D1D1D] rounded-lg shadow-xl p-5 w-full max-w-2xl mx-3 text-sm"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <h1 className="text-lg font-normal text-gray-800 mb-3 dark:text-white">
          Add Meeting
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left */}
          <div>
            <div className="mb-3">
              <label
                htmlFor="uyvuhvyuc"
                className="block text-sm text-gray-600 dark:text-white"
              >
                Meeting Name
              </label>
              <input
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                type="text"
                className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="uyvuhvyuc"
                className="block text-sm text-gray-600 dark:text-white"
              >
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="uyvuhvyuc"
                className="text-sm text-gray-600 dark:text-white flex justify-between"
              >
                Add Teacher
              </label>
              <div className="relative flex items-center border rounded px-2 py-1 dark:bg-[#343434] dark:border-[#5C5C5C]">
                <div className="flex-1 text-xs px-2 py-1.5 dark:text-white">
                  Select Teacher
                </div>
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
                  <section className="bg-white dark:bg-[#1D1D1D] rounded-lg p-5 w-full max-w-md">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                      Select Teachers
                    </h2>
                    <div className="flex gap-2 mb-4">
                      {tabs.map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-3 py-2 text-xs rounded ${
                            activeTab === tab
                              ? "bg-[#576CBC] text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto text-sm">
                      {Teachers.map((teacher) => (
                        <label
                          key={teacher.teacherId}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTeachers.includes(teacher)}
                            onChange={() => toggleTeacher(teacher)}
                          />
                          <span className="dark:text-white">
                            {teacher.teacherName}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="flex justify-end mt-4 gap-2">
                      <button
  type="button"
  onClick={() => setOpen(false)}
  className="px-3 py-1 border text-[#576CBC] rounded"
>
  Cancel
</button>

<button
  type="button"
  onClick={() => setOpen(false)}
  className="px-4 py-1 bg-[#576CBC] text-white rounded"
>
  Done
</button>
                    </div>
                  </section>
                </div>
              </Dialog>
              {selectedTeachers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedTeachers.map((t) => (
                    <span
                      key={t.teacherId}
                      className="text-xs px-2 py-1 rounded bg-[#E9EEF7] text-[#344055] dark:bg-[#2E2E2E] dark:text-white flex items-center gap-1"
                    >
                      {t.teacherName}
                      <button
                        onClick={() => toggleTeacher(t)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div>
            <div className="mb-3">
              <label
                htmlFor="uyvuhvyuc"
                className="block text-sm text-gray-600 dark:text-white"
              >
                Meeting Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="uyvuhvyuc"
                className="block text-sm text-gray-600 dark:text-white"
              >
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4 mt-2">
          <label
            htmlFor="uyvuhvyuc"
            className="block text-sm text-gray-600 dark:text-white"
          >
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
            placeholder="Write meeting details..."
          />
        </div>

        {/* Actions */}
        <div className="border-t pt-4 mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 border border-[#576CBC] text-[#576CBC] rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 bg-[#576CBC] text-white rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </form>
  <ToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    pauseOnHover
    draggable
    closeButton={false}
    theme="colored"
  />
      {success && (
        <SuccessPopup onClose={() => setSuccess(false)} title="Meeting" />
      )}
      {failed && (
        <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
      )}
    </div>
  );
}
