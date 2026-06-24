"use client";

import React, { useState, useEffect, useRef } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import axios from "axios";
import BaseLayout3 from "@/app/(tenant)/modules/users/supervisor/components/BaseLayout3";
import { useSearchParams } from "next/navigation";
import AdminHeader from "../../components/AdminHeader";
import BaseLayout4 from "../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
interface Attendance {
  id: string | null;
  studentId: string;
  name: string;
  startTime: string | null;
  endTime: string | null;
  joined: boolean;
  joinTime: string;
  leaveTime: string;
}

interface Admin {
  adminId: string;
  adminName: string;
  adminEmail: string;
  adminRole: string;
}

interface Teacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  attendee?: string;
  _id: string;
}

interface Meeting {
  _id: string;
  meetingName: string;
  meetingId: string;
  admin: Admin;
  selectedDate: string;
  startTime: string;
  endTime: string;
  teacher: Teacher[];
  description: string;
  meetingStatus: string;
  status: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  updatedBy: string;
  __v: number;
}

export default function Page() {
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [classData, setClassData] = useState<Meeting | null>(null);
  const [roomName, setRoomName] = useState("");
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const attendanceRef = useRef(attendance);
  const seacrh = useSearchParams();
  const meetingId = seacrh.get("meetingId");
  const [meetingUpdate, setMeetingUpdate] = useState(false);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("AdminAuthToken")
            : null;
        if (!token) {
          console.error("❌ AdminAuthToken not found");
          return;
        }

        // Use correct query string and expect array response
        const response = await axios.get<Meeting[]>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ADMIN_MEETING.GET}?meetingId=${meetingId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.data && response.data.length > 0) {
          // Use the first meeting for general info
          setClassData(response.data[0]);
          setRoomName(response.data[0].meetingId);

          // Flatten all teachers from all meetings
          const teacherAttendance = response.data.flatMap((meeting) =>
            meeting.teacher.map((teacher: Teacher) => ({
              id: null,
              studentId: teacher.teacherId,
              name: teacher.teacherName,
              startTime: null,
              endTime: null,
              joined: false,
              joinTime: "",
              leaveTime: "",
            })),
          );

          setAttendance(teacherAttendance);
        } else {
          setClassData(null);
        }
      } catch (err) {
        console.log("Error loading class details:", err);
      }
    };

    fetchClassData();
  }, []);
  useEffect(() => {
    attendanceRef.current = attendance;
  }, [attendance]);

  // Function to handle API update
  const handleMeetingMinutesUpdate = async () => {
    console.log("\uD83D\uDCCC Submit clicked");
    let duration = "";
    if (startTime && endTime) {
      duration = calculateDuration(startTime, endTime);
    } else {
      console.warn("Missing start or end time for duration calculation");
    }

    const payload = {
      duration: duration,
      meetingStatus: "Completed",
      teacher: attendance.map((a) => ({
  teacherId: a.studentId,
  teacherName: a.name,
  attendee: a.leaveTime ? "present" : "present", // joined = present
})),

    };

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AdminAuthToken")
          : null;
      if (!token) {
        console.error("AdminAuthToken not found");
        return;
      }

      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ADMIN_MEETING.UPDATE_ADMIN}/${meetingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      console.log("pay", payload);

      if (!response.ok) {
        throw new Error("Failed to update meeting minutes");
      }

      const result = await response.json();
      console.log(" Meeting Minutes Updated:", result);

      setMeetingUpdate(false); // close modal
    } catch (error) {
      console.error(" Error updating meeting minutes:", error);
    }
  };
  const calculateDuration = (startTime: string, endTime: string): string => {
    const today = new Date().toDateString(); // use today's date to construct full datetime

    const start = new Date(`${today} ${startTime}`);
    const end = new Date(`${today} ${endTime}`);

    const diffMs = end.getTime() - start.getTime(); // difference in milliseconds

    if (diffMs < 0) return "Invalid";

    const diffMins = Math.floor(diffMs / 60000); // convert to minutes
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;

    return `${hours}h ${minutes}m`;
  };

  const getCurrentUserInfo = () => {
    // Admin
    const adminId = localStorage.getItem("AdminId");
    const adminName = localStorage.getItem("AdminName");
    const adminEmail = localStorage.getItem("AdminEmail");

    if (adminId && adminName) {
      return {
        name: adminName,
        id: adminId,
        email: adminEmail || "admin@alfurqan.com",
        role: "admin",
      };
    }

    // Academic Coach
    const acId = localStorage.getItem("AcademicCoachPortalId");
    const acName = localStorage.getItem("AcademicCoachName");
    const acEmail = localStorage.getItem("AcademicCoachEmail");

    if (acId && acName) {
      return {
        name: acName,
        id: acId,
        email: acEmail || "coach@alfurqan.com",
        role: "academicCoach",
      };
    }

    // Supervisor
    const supId = localStorage.getItem("SupervisorId");
    const supName = localStorage.getItem("SupervisorName");
    const supEmail = localStorage.getItem("SupervisorEmail");

    if (supId && supName) {
      return {
        name: supName,
        id: supId,
        email: supEmail || "supervisor@alfurqan.com",
        role: "supervisor",
      };
    }

    // Teacher
    const teacherId = localStorage.getItem("TeacherId");
    const teacherName = localStorage.getItem("TeacherName");
    const teacherEmail = localStorage.getItem("TeacherEmail");

    if (teacherId && teacherName) {
      return {
        name: teacherName,
        id: teacherId,
        email: teacherEmail || "teacher@alfurqan.com",
        role: "teacher",
      };
    }

    // Student
    const studentId = localStorage.getItem("StudentId");
    const studentName = localStorage.getItem("StudentName");
    const studentEmail = localStorage.getItem("StudentEmail");

    if (studentId && studentName) {
      return {
        name: studentName,
        id: studentId,
        email: studentEmail || "student@alfurqan.com",
        role: "student",
      };
    }

    // Fallback
    return {
      name: "Guest",
      id: "UNKNOWN",
      email: "guest@alfurqan.com",
      role: "guest",
    };
  };

  const currentUser = getCurrentUserInfo();
  return (
    <BaseLayout4>
      <AdminHeader
        currentSection="Live Meeting"
        showBackButton={true}
        showBackPath="/modules/users/admin-main/ui/meeting"
      />
      <div className="flex flex-col min-h-screen px-4 sm:px-6 md:px-8">
        {/* Page Content */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 w-full max-w-screen-xl">
          <div className="flex-1 overflow-auto">
            <div className="p-1 sm:p-2 relative">
              <div className="bg-white dark:bg-[#343434] rounded-xl p-4">
                <div className="p-4">
                  {/* Meeting Name */}
                  <h2 className="font-semibold text-black text-[18px] px-3 dark:text-white">
                    {classData?.meetingName}
                  </h2>

                  {/* Info Row */}
                  <div className="mt-2 flex flex-wrap items-center gap-4 px-3">
                    {/* Meeting Name (again) */}
                    <span className="text-sm text-[#676666] dark:text-white opacity-60 border-r-2 border-r-[#676666] pr-4">
                      {classData?.meetingName}
                    </span>

                    {/* Time */}
                    <span className="text-sm text-[#676666] dark:text-white opacity-60 border-r-2 border-r-[#676666] pr-4">
                      {classData?.startTime} - {classData?.endTime}
                    </span>

                    {/* Date */}
                    <span className="text-sm text-[#676666] dark:text-white opacity-60">
                      {classData?.selectedDate &&
                        new Date(classData.selectedDate).toLocaleDateString()}
                    </span>

                    {/* Attendance Dropdown */}
                    <div className="ml-auto w-64">
                      <label
                        htmlFor="attendance-select"
                        className="block text-sm font-semibold mb-1 dark:text-white "
                      >
                        Attendance
                      </label>
                      <select
                        id="attendance-select"
                        className="w-full border p-2 rounded focus:outline-none text-[10px] dark:bg-[#252525] "
                      >
                        {attendance
                          .filter((s) => s.joined)
                          .map((s) => {
                            const statusLabel = s.leaveTime
                              ? `🚪 Left at ${s.leaveTime}`
                              : `✅ Joined at ${s.joinTime}`;

                            return (
                              <option
                                className="text-[12px]"
                                key={s.id}
                                value={s.id || ""}
                              >
                                {s.name} – {statusLabel}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Jitsi Video Box */}
                <div className="flex-1 min-w-0 w-full h-[50vh] md:h-[60vh] rounded-md overflow-hidden shadow-inner border border-gray-300">
                  {roomName && (
                    <JitsiMeeting
                      userInfo={{
                        displayName: `${currentUser.name} | ID : ${currentUser.id}`,
                        email: currentUser.email,
                      }}
                      roomName={roomName}
                      domain="meet.blackstoneinfomaticstech.com"
                      configOverwrite={{
                        startWithAudioMuted: false,
                        startWithVideoMuted: false,
                        toolbarButtons: [
                          "microphone",
                          "camera",
                          "closedcaptions",
                          "desktop",
                          "fullscreen",
                          "fodeviceselection",
                          "hangup",
                          "profile",
                          "chat",
                          "settings",
                          "raisehand",
                          "videoquality",
                          "filmstrip",
                          "shortcuts",
                          "tileview",
                          "recording",
                        ],
                      }}
                      onApiReady={(externalApi) => {
                        // ✅ Handle Participant Joined
                        externalApi.addListener(
                          "participantJoined",
                          (event) => {
                            const joinTime = new Date().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            });

                            const name = event.displayName || "Guest";

                            setAttendance((prev) => {
                              // prevent duplicate
                              const exists = prev.some(
                                (a) => a.id === event.id,
                              );
                              if (exists) return prev;

                              return [
                                ...prev,
                                {
                                  id: event.id,
                                  studentId: event.id, // use jitsi id
                                  name: name,
                                  startTime: null,
                                  endTime: null,
                                  joined: true,
                                  joinTime,
                                  leaveTime: "",
                                },
                              ];
                            });
                          },
                        );

                        // 🔴 Handle Participant Left
                          externalApi.addListener("participantLeft", (event) => {
                          const leaveTime = new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          });

                          setAttendance((prev) =>
                            prev.map((a) =>
                              a.id === event.id ? { ...a, leaveTime } : a,
                            ),
                          );
                        });

                        // 🎥 Host/teacher Joined Call
                        externalApi.addListener("videoConferenceJoined", () => {
                          const startCallTime = new Date().toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            },
                          );

                          console.log("Call started at", startCallTime);
                          setStartTime(startCallTime);
                        });
                        externalApi.addListener("videoConferenceLeft", () => {
                          const startCallTime = new Date().toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            },
                          );
                          setEndTime(startCallTime);
                          setMeetingUpdate(true);
                        });
                      }}
                      getIFrameRef={(iframeRef) => {
                        iframeRef.style.border = "0px";
                        iframeRef.style.height = "100%";
                        iframeRef.style.width = "100%";
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting minutes popup  */}
      {meetingUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-lg space-y-5 dark:bg-[#252525]">
            {/* Header */}
            <h2 className="text-lg font-semibold text-gray-800 dark:text-[#fff]">
              Update Meeting Minutes
            </h2>

            {/* Content */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Attendees List */}
              <div className="md:w-1/2 border border-[#343434] rounded-lg p-4 h-72 overflow-y-auto">
                <h3 className="text-base font-medium text-gray-700 mb-2 dark:text-[#fff]">
                  Attendees:
                </h3>
                <ul className="list-disc list-inside text-sm text-gray-800 space-y-1 dark:text-[#fff]">
                  {attendance
                    .filter((a) => a.joined)
                    .map((a) => {
                      const status = a.leaveTime ? (
                        <span className="text-gray-600">
                          🚪 Left at {a.leaveTime}
                        </span>
                      ) : (
                        <span className="text-green-600">
                          ✅ Joined at {a.joinTime}
                        </span>
                      );

                      return (
                        <li key={a.id}>
                          <span className="font-medium">{a.name}</span> –{" "}
                          {status}
                        </li>
                      );
                    })}
                </ul>
              </div>

              {/* Meeting Minutes Textarea */}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setMeetingUpdate(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleMeetingMinutesUpdate}
                className="px-4 py-2 bg-[#576CBC] text-white rounded hover:bg-[#43569e] text-sm font-medium"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </BaseLayout4>
  );
}
