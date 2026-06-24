"use client";

import React, { useState, useEffect, useRef } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import axios from "axios";
import BaseLayout1 from "@/app/(tenant)/modules/users/Academic-coach/components/BaseLayout1";
import { useSearchParams } from "next/navigation";
import AcademicHeader from "../../components/academicHeader";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";
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

  selectedDate: string; // ISO date string
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

  // Optional supervisor (some meetings)
  supervisor?: {
    supervisorId: string;
    supervisorName: string;
    supervisorEmail: string;
  };

  // Optional admin (some meetings)
  admin?: {
    adminId: string;
    adminName: string;
    adminEmail: string;
    adminRole: string;
  };

  // Optional single or multiple teachers
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

  // Optional participants (student meetings)
  participants?: Array<{
    studentId: string;
    studentName: string;
    studentEmail: string;
  }>;
}

export default function Page() {
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [classData, setClassData] = useState<Meeting | null>(null);
  const [roomName, setRoomName] = useState("");
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const attendanceRef = useRef(attendance);
  const seacrh = useSearchParams();
  const meetingId = seacrh.get("id");
  const [meetingUpdate, setMeetingUpdate] = useState(false);
  const [meetingMinutes, setMeetingMinutes] = useState<string>("");

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const token = localStorage.getItem("AcademicCoachAuthToken");
        if (!token || !meetingId) return;

        const acId = localStorage.getItem("AcademicCoachPortalId");

        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CALENDAR.GET}?academicCoachId=${acId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const { academicCoach, meetingList, adminMeetingList } = response.data;

        // ✅ Merge all meetings
        const allMeetings = [
          ...academicCoach,
          ...meetingList,
          ...adminMeetingList,
        ];

        // ✅ Find selected meeting
        const meeting = allMeetings.find(
          (m: any) => m._id === meetingId || m.meetingId === meetingId,
        );

        if (!meeting) {
          console.log("❌ No meeting found for:", meetingId);
          return;
        }

        console.log("✅ Found Meeting:", meeting);

        setClassData(meeting);

        // ✅ Jitsi Room
        setRoomName(meeting.meetingId || meeting._id);

        // ✅ Attendance (if participants exist)
        const tempAttendance: Attendance[] = [];

        // ✅ Students
        if (meeting.participants?.length) {
          meeting.participants.forEach((p: any) => {
            tempAttendance.push({
              id: null,
              studentId: p.studentId || p.participantId,
              name: p.studentName || p.participantName,
              startTime: null,
              endTime: null,
              joined: false,
              joinTime: "",
              leaveTime: "",
            });
          });
        }

        // ✅ Teachers
        if (meeting.teacher) {
          const teachers = Array.isArray(meeting.teacher)
            ? meeting.teacher
            : [meeting.teacher];

          teachers.forEach((t: any) => {
            tempAttendance.push({
              id: null,
              studentId: t.teacherId,
              name: t.teacherName,
              startTime: null,
              endTime: null,
              joined: false,
              joinTime: "",
              leaveTime: "",
            });
          });
        }

        // ✅ Supervisor
        if (meeting.supervisor) {
          tempAttendance.push({
            id: null,
            studentId: meeting.supervisor.supervisorId,
            name: meeting.supervisor.supervisorName,
            startTime: null,
            endTime: null,
            joined: false,
            joinTime: "",
            leaveTime: "",
          });
        }

        // ✅ Admin
        if (meeting.admin) {
          tempAttendance.push({
            id: null,
            studentId: meeting.admin.adminId,
            name: meeting.admin.adminName,
            startTime: null,
            endTime: null,
            joined: false,
            joinTime: "",
            leaveTime: "",
          });
        }

        setAttendance(tempAttendance);
      } catch (err) {
        toast.error(AppValidationMessages.ERROR_MESSAGES.FAILED_TO_UPDATE);
      }
    };

    fetchClassData();
  }, [meetingId]);

  useEffect(() => {
    attendanceRef.current = attendance;
  }, [attendance]);

  // Function to handle API update
  const handleMeetingMinutesUpdate = async () => {
    let duration = "";
    if (startTime && endTime) {
      duration = calculateDuration(startTime, endTime);
    } else {
    }

    const normalizedTeachers = Array.isArray(classData?.teacher)
      ? classData.teacher
      : [classData?.teacher];

    // ✅ Build payload from LIVE attendance
const payload = {
  meetingminutes: meetingMinutes,
  duration,
  meetingStatus: "Completed",
  teacher: attendance.map((a) => ({
    teacherId: a.studentId,   // real DB id
    teacherName: a.name,
    attendee: "present",
  })),
};

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AcademicCoachAuthToken")
          : null;
      if (!token) {
        toast.error(AppValidationMessages.DATA_FETCH.MISSING_TOKEN);
        return;
      }

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

      if (!response.ok) {
        throw new Error(AppValidationMessages.ERROR_MESSAGES.FAILED_TO_UPDATE);
      }

      const result = await response.json();

      setMeetingUpdate(false); // close modal
    } catch (error) {
      toast.error(AppValidationMessages.ERROR_MESSAGES.FAILED_TO_UPDATE);
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
  const getCurrentUser = () => {
    const teacherId = localStorage.getItem("TeacherId");
    const teacherName = localStorage.getItem("TeacherName");
    const teacherEmail = localStorage.getItem("TeacherEmail");

    if (teacherId && teacherName) {
      return {
        id: teacherId,
        name: teacherName,
        email: teacherEmail || "teacher@alfurqan.com",
      };
    }

    const coachId = localStorage.getItem("AcademicCoachPortalId");
    const coachName = localStorage.getItem("AcademicCoachName");
    const coachEmail = localStorage.getItem("AcademicCoachEmail");

    if (coachId && coachName) {
      return {
        id: coachId,
        name: coachName,
        email: coachEmail || "coach@alfurqan.com",
      };
    }

    return {
      id: "UNKNOWN",
      name: "Guest",
      email: "guest@alfurqan.com",
    };
  };
  const currentUser = getCurrentUser();

  return (
    <BaseLayout1>
      <AcademicHeader
        currentSection="Meeting"
        showBackButton={true}
        showBackPath="/modules/users/Academic-coach/ui/schedule"
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
  .filter((s) => s.joined) // only real participants
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
        key={s.id}
        value={s.id ||""}
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
                      roomName={roomName}
                      domain="meet.blackstoneinfomaticstech.com"
                      // ✅ Always send user info
                      userInfo={{
                        displayName: `${currentUser.name} | ID : ${currentUser.id}`,
                        email: currentUser.email,
                      }}
                      // ✅ Disable prejoin + lock name
                      configOverwrite={{
                        prejoinPageEnabled: false, // ⭐ VERY IMPORTANT
                        startWithAudioMuted: false,
                        startWithVideoMuted: false,

                        toolbarButtons: [
                          "microphone",
                          "camera",
                          "desktop",
                          "fullscreen",
                          "hangup",
                          "chat",
                          "raisehand",
                          "tileview",
                          "settings",
                        ],
                      }}
                      // ✅ Disable rename/profile
                      interfaceConfigOverwrite={{
                        DISABLE_PROFILE: true,
                        DISABLE_RENAME: true,
                      }}
                      onApiReady={(externalApi) => {
                        // ✅ Force display name after join
                        externalApi.executeCommand(
                          "displayName",
                          `${currentUser.name} | ID : ${currentUser.id}`,
                        );

                        // ================= JOIN =================
                       externalApi.addListener("participantJoined", (event) => {

  const joinTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  let realId = "";
  let realName = "Guest";

  // ✅ Extract ID from displayName
  if (event.displayName?.includes("| ID :")) {
    const parts = event.displayName.split("| ID :");
    realName = parts[0].trim();
    realId = parts[1].trim();
  } else {
    realName = event.displayName || "Guest";
  }

  // ❌ If no ID → ignore
  if (!realId) {
    console.warn("⚠️ No ID found:", event.displayName);
    return;
  }

  setAttendance((prev) => {

    // ✅ Avoid duplicate entry
    const exists = prev.some(a => a.studentId === realId);

    if (exists) {
      return prev.map(a =>
        a.studentId === realId
          ? { ...a, id: event.id, joined: true, joinTime }
          : a
      );
    }

    // ✅ New join
    return [
      ...prev,
      {
        id: event.id,          // jitsi id
        studentId: realId,     // ✅ REAL DB ID
        name: realName,
        startTime: null,
        endTime: null,
        joined: true,
        joinTime,
        leaveTime: "",
      },
    ];
  });
});


                        // ================= LEAVE =================
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

                        // ================= HOST JOIN =================
                        externalApi.addListener("videoConferenceJoined", () => {
                          const startCallTime = new Date().toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            },
                          );

                          setStartTime(startCallTime);
                        });

                        // ================= HOST LEAVE =================
                        externalApi.addListener("videoConferenceLeft", () => {
                          const endCallTime = new Date().toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            },
                          );

                          setEndTime(endCallTime);
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
    .filter((a) => a.joined) // only real participants
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
            ✅ Joined at {a.joinTime}
          </span>
        );
      }

      return (
        <li key={a.id}>
          <span className="font-medium">{a.name}</span> – {status}
        </li>
      );
    })}
</ul>

              </div>

              {/* Meeting Minutes Textarea */}
              <div className="md:w-1/2 border border-[#343434] rounded-lg p-4 h-72 flex flex-col">
                <label
                  htmlFor="htmldaad"
                  className="text-base font-medium text-gray-700 mb-2 dark:text-[#fff]"
                >
                  Meeting Minutes
                </label>
                <textarea
                  value={meetingMinutes}
                  onChange={(e) => setMeetingMinutes(e.target.value)}
                  className="flex-grow rounded p-2 text-sm resize-none focus:outline-none dark:bg-[#252525] "
                  placeholder="Enter your notes here..."
                />
              </div>
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
    </BaseLayout1>
  );
}
