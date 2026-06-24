"use client";

import React, { useState, useEffect, useRef } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import axios from "axios";
import BaseLayout3 from "@/app/(tenant)/modules/users/supervisor/components/BaseLayout3";
import SupervisorHeader from "../../components/supervisorHeader";
import { useSearchParams } from "next/navigation";
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

interface Supervisor {
  supervisorId: string;
  supervisorName: string;
  supervisorEmail: string;
  supervisorRole: string;
}

interface Teacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  attendee: string;
  _id: string;
}

interface Meeting {
  _id: string;
  meetingName: string;
  meetingId: string;
  selectedDate: string;
  startTime: string;
  endTime: string;
  description?: string;
  meetingStatus: "Completed" | "Scheduled" | "Pending" | string;
  duration?: string;
  status: "Active" | "Inactive" | string;
  createdDate: string;
  createdBy: string;
  updatedDate?: string;
  updatedBy?: string;
  __v?: number;
  supervisor?: {
    supervisorId: string;
    supervisorName: string;
    supervisorEmail: string;
  };
  admin?: {
    adminId: string;
    adminName: string;
    adminEmail: string;
    adminRole: string;
  };
  teacher:
    | Array<{
        teacherId: string;
        teacherName: string;
        teacherEmail: string;
        attendee?: string;
      }>
    | {
        teacherId: string;
        teacherName: string;
        teacherEmail: string;
      };
  participants?: Array<{
    studentId: string;
    studentName: string;
    studentEmail: string;
  }>;
}

export default function Page() {
  console.log("🚀 PAGE LOADED");

  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [classData, setClassData] = useState<Meeting | null>(null);
  const [roomName, setRoomName] = useState("");
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const attendanceRef = useRef(attendance);
  const seacrh = useSearchParams();
  const meetingId = seacrh.get("id");
  console.log("📌 MEETING ID:", meetingId);
if (!meetingId) {
  console.error("Meeting ID missing");
  return;
}
  const [meetingUpdate, setMeetingUpdate] = useState(false);
  const [meetingMinutes, setMeetingMinutes] = useState<string>("");


  
  useEffect(() => {
    console.log("📡 FETCHING CLASS DATA...");

    const fetchClassData = async () => {
      try {
        const token = localStorage.getItem("SupervisorAuthToken");
        console.log("🔑 TOKEN EXISTS:", !!token);

        if (!token) {
          console.error("❌ NO TOKEN FOUND");
          return;
        }

        console.log("🌐 CALLING API FOR MEETING ID:", meetingId);

        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TEACHERMEETING.GET_MEETING}?meetingId=${meetingId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log("✅ API RESPONSE:", response.data);

        const meeting = response?.data?.meetings?.[0]?.data;

if (!meeting) {
  console.error("Meeting data not found");
  return;
}

        if (!meeting) {
          console.log("⚠️ NO MEETING FOUND IN RESPONSE");
          return;
        }

        console.log("📋 MEETING DATA:", meeting);
        setClassData(meeting);
        setRoomName(meeting.meetingId);
        console.log("🎯 ROOM NAME SET TO:", meeting.meetingId);

        // ✅ Initialize attendance
        const initialAttendance = (meeting.participants || []).map((p: any) => ({
          id: null,
          studentId: (p.studentId || p.participantId || p._id || "")
            .toString()
            .replace(/\s/g, "")
            .trim(),
          name: p.studentName || p.participantName,
          startTime: null,
          endTime: null,
          joined: false,
          joinTime: "",
          leaveTime: "",
        }));

        console.log("👥 INITIAL ATTENDANCE LIST:", initialAttendance);
        setAttendance(initialAttendance);
      } catch (err) {
        console.error("❌ ERROR LOADING MEETING:", err);
      }
    };

    fetchClassData();
  }, [meetingId]);

  useEffect(() => {
    console.log("📝 ATTENDANCE STATE UPDATED:", attendance);
    attendanceRef.current = attendance;
  }, [attendance]);

  // Function to handle API update
  const handleMeetingMinutesUpdate = async () => {
    console.log("═══════════════════════════════════════════════════");
    console.log("📌 SUBMIT CLICKED - UPDATING MEETING MINUTES");
    console.log("═══════════════════════════════════════════════════");

    console.log("⏰ START TIME:", startTime);
    console.log("⏰ END TIME:", endTime);
    console.log("📋 CLASS DATA:", classData);

    let duration = "";
    if (startTime && endTime) {
      duration = calculateDuration(startTime, endTime);
      console.log("⏱️ CALCULATED DURATION:", duration);
    } else {
      console.warn("⚠️ MISSING START OR END TIME");
    }

    console.log("════ CURRENT ATTENDANCE STATE ════");
    console.log(JSON.stringify(attendance, null, 2));

    // Use participants and map to teacher format
    const participants = classData?.participants || [];
    console.log("👥 PARTICIPANTS FROM CLASS DATA:", participants);

    // Create teacher payload from participants and match with attendance
    const teacherPayload = participants.map((p: any) => {
      const id = p.participantId || p.studentId || p._id;
      const name = p.participantName || p.studentName || "Unknown Participant";
      const email = p.participantEmail || p.studentEmail || "no email";

      console.log("PROCESSING:", { id, name, email });

      // Check if participant is in attendance list and if they joined
      

      return {
        teacherId: id,
        teacherName: name,
        teacherEmail: email,
        attendee: "present",
      };
    });

    console.log("👨‍🏫 FINAL TEACHER PAYLOAD:", teacherPayload);

    const payload = {
      meetingminutes: meetingMinutes,
      duration,
      meetingStatus: "Completed",
      teacher: teacherPayload,
    };

    console.log("════ FINAL PAYLOAD TO SEND ════");
    console.log(JSON.stringify(payload, null, 2));
    console.log("════════════════════════════════");

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("SupervisorAuthToken")
          : null;

      console.log("🔑 TOKEN EXISTS:", !!token);

      if (!token) {
        console.error("❌ NO TOKEN FOUND");
        return;
      }

      console.log("📤 SENDING PUT REQUEST");
      console.log("URL:", `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MEETING_MINUTES.UPDATE_MINUTES}/${meetingId}`);
      console.log("METHOD: PUT");
      console.log("BODY:", JSON.stringify(payload, null, 2));

      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MEETING_MINUTES.UPDATE_MINUTES}/${meetingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      console.log("📨 RESPONSE STATUS:", response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("❌ RESPONSE ERROR:", errorData);
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ MEETING MINUTES UPDATED SUCCESSFULLY:");
      console.log(JSON.stringify(result, null, 2));

      setMeetingUpdate(false);
    } catch (error) {
      console.error("❌ ERROR UPDATING MEETING MINUTES:", error);
    }
  };

  const calculateDuration = (startTime: string, endTime: string): string => {
    const today = new Date().toDateString();
    const start = new Date(`${today} ${startTime}`);
    const end = new Date(`${today} ${endTime}`);
    if (!startTime || !endTime) {
  return "0h 0m";
}
if (isNaN(start.getTime()) || isNaN(end.getTime())) {
  return "Invalid";
}
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return "Invalid";
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <BaseLayout3>
      <SupervisorHeader
        currentSection="Weekly Meeting"
        showBackButton={true}
        showBackPath="/modules/users/supervisor/ui/meetingandtraining"
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
                            let statusLabel = "";

                            if (s.leaveTime) {
                              statusLabel = `🚪 Left at ${s.leaveTime}`;
                            } else {
                              statusLabel = `✅ Joined at ${s.joinTime}`;
                            }

                            return (
                              <option
                                className="text-[12px]"
                                key={s.studentId}
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
                  {roomName?.trim() && (
  <JitsiMeeting
                      roomName={roomName}
                      domain="meet.blackstoneinfomaticstech.com"
                      userInfo={{
                        displayName: `${localStorage.getItem("StudentName")} | ID : ${localStorage.getItem("StudentId")}`,
                        email:
                          localStorage.getItem("StudentEmail") ||
                          "student@alfurqan.com",
                      }}
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
                        console.log("🎥 JITSI API READY");

                        // ✅ Handle Participant Joined
                        externalApi.addListener(
                          "participantJoined",
                          (event) => {
                            console.log("👤 PARTICIPANT JOINED:", event);
                            const joinTime = new Date().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            });

                            // try extract studentId from displayName like "Name | ID : <studentId>"
                            let name = event.displayName || "Guest";
                            if (!event) return;
                            let extractedStudentId: string | null = null;
                            if (name.includes("| ID :")) {
                              const parts = name.split("| ID :");
                              name = parts[0].trim();
                              extractedStudentId = parts[1].replace(/\s/g, "").trim();
                            }

                            setAttendance((prev) => {
                              // try match by studentId (from DB), then by name, else fallback to jitsi id
                              const byStudentIdIndex = extractedStudentId
                                ? prev.findIndex((a) => a.studentId === extractedStudentId)
                                : -1;
                              const byNameIndex = prev.findIndex((a) => a.name?.toLowerCase().trim() === name.toLowerCase().trim());
                              const existingIndex = byStudentIdIndex !== -1 ? byStudentIdIndex : byNameIndex;

                              const updated = [...prev];

                              if (existingIndex !== -1) {
                                // update existing DB record (keep DB studentId) and store jitsi id
                                const existing = updated[existingIndex];
                                updated[existingIndex] = {
                                  ...existing,
                                  id: event.id, // jitsi id
                                  studentId: existing.studentId || extractedStudentId || event.id,
                                  name: existing.name || name,
                                  joined: true,
                                  joinTime,
                                  leaveTime: "",
                                };
                              } else {
                                // add new attendee (use extractedStudentId if present, else jitsi id)
                                updated.push({
                                  id: event.id,
                                  studentId: extractedStudentId || event.id,
                                  name,
                                  startTime: null,
                                  endTime: null,
                                  joined: true,
                                  joinTime,
                                  leaveTime: "",
                                });
                              }

                              return updated;
                            });
                          },
                        );

                        // 🔴 Handle Participant Left
                        externalApi.addListener("participantLeft", (event) => {
                          console.log("👤 PARTICIPANT LEFT:", event);
                          const leaveTime = new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          });

                          setAttendance((prev) => {
                            const updated = prev.map((a) =>
                              a.id === event.id
                                ? {
                                    ...a,
                                    leaveTime,
                                    // keep joined=true so payload treats them as present if they had joined
                                    joined: true,
                                  }
                                : a,
                            );
                            return updated;
                          });
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

                          console.log("🎥 VIDEO CONFERENCE JOINED");
                          console.log("⏰ CALL START TIME:", startCallTime);
                          setStartTime(startCallTime);
                        });

                        externalApi.addListener("videoConferenceLeft", () => {
                          const endCallTime = new Date().toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            },
                          );

                          console.log("🎥 VIDEO CONFERENCE LEFT");
                          console.log("⏰ CALL END TIME:", endCallTime);
                          setEndTime(endCallTime);
                          console.log("📋 OPENING MEETING UPDATE MODAL");
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
              {/* Attendees List - ONLY SHOW WHO JOINED */}
              <div className="md:w-1/2 border border-[#343434] rounded-lg p-4 h-72 overflow-y-auto">
                <h3 className="text-base font-medium text-gray-700 mb-2 dark:text-[#fff]">
                  Attendees:
                </h3>
                <ul className="list-disc list-inside text-sm text-gray-800 space-y-1 dark:text-[#fff]">
                  {attendance
                    .filter((a) => a.joined) // ✅ Only show who joined
                    .map((a) => {
                      let status: JSX.Element;

                      if (a.leaveTime) {
                        status = (
                          <span className="text-gray-600">
                            🚪 Left at {a.leaveTime}
                          </span>
                        );
                      } else {
                        status = (
                          <span className="text-green-600">
                            ✅ In Meeting
                          </span>
                        );
                      }

                      console.log("📋 RENDERING ATTENDEE:", {
                        name: a.name,
                        studentId: a.studentId,
                        joined: a.joined,
                        joinTime: a.joinTime,
                        leaveTime: a.leaveTime,
                      });

                      return (
                        <li key={a.id || a.studentId}>
                          <span className="font-medium">{a.name}</span> –{" "}
                          {status}
                        </li>
                      );
                    })}
                </ul>

                {/* Show message if no one joined */}
                {attendance.filter((a) => a.joined).length === 0 && (
                  <p className="text-gray-500 italic mt-4">
                    No one joined this meeting
                  </p>
                )}
              </div>

              {/* Meeting Minutes Textarea */}
              <div className="md:w-1/2 border border-[#343434] rounded-lg p-4 h-72 flex flex-col">
                <label
                  htmlFor="meeting-minutes"
                  className="text-base font-medium text-gray-700 mb-2 dark:text-[#fff]"
                >
                  Meeting Minutes
                </label>
                <textarea
                  id="meeting-minutes"
                  value={meetingMinutes}
                  onChange={(e) => {
                    console.log("✍️ MEETING MINUTES UPDATED:", e.target.value);
                    setMeetingMinutes(e.target.value);
                  }}
                  className="flex-grow rounded p-2 text-sm resize-none focus:outline-none dark:bg-[#252525] border border-gray-300"
                  placeholder="Enter your notes here..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  console.log("❌ MEETING UPDATE CANCELLED");
                  setMeetingUpdate(false);
                }}
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
    </BaseLayout3>
  );
}
