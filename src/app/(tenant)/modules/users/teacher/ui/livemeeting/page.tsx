"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import BaseLayout from "@/app/(tenant)/modules/users/teacher/components/BaseLayout";
import TeacherHeader from "../../components/TeacherHeader";
import { JitsiMeeting } from "@jitsi/react-sdk";
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

interface Meeting {
  _id: string;
  meetingName: string;
  meetingId: string;
  selectedDate: string; // ISO date string
  startTime: string;
  endTime: string;
  description?: string;
  meetingStatus: "Completed" | "Scheduled" | "Pending" | string;
  status: "Active" | "Inactive" | string;
  teacher: Array<{
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
    attendee: string;
  }>;
}

const LiveMeeting = () => {
  const [startTime, setStartTime] = useState<string>("");
  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [roomName, setRoomName] = useState("");
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const params = useSearchParams();
  const meetingId = params.get("id");
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const startTimeRef = useRef<string>("");

  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        const token = localStorage.getItem("TeacherAuthToken");
        if (!token) {
          console.error("Missing auth token");
          return;
        }

        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TEACHERMEETING.GET_MEETING}`,
          {
            params: { meetingId },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const meeting = response.data.meetings[0]?.data; // Access the first meeting's data
        if (meeting && meeting.meetingStatus !== "Completed") {
          setMeetingData(meeting);
          setRoomName(meeting.meetingId);

          // Build initial attendance
          const initialAttendance = meeting.participants.map((p: any) => ({
            id: null,
            studentId: p.participantId,
            name: p.participantName,
            startTime: null,
            endTime: null,
            joined: false,
            joinTime: "",
            leaveTime: "",
          }));

          setAttendance(initialAttendance);
        }
      } catch (error) {
        console.error("Error fetching meeting data:", error);
      }
    };

    fetchMeetingData();
  }, [params]);

  const handleEndCall = async () => {
    const endCallTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const startTimeUsed = startTimeRef.current;

    if (!meetingData || !startTimeUsed) {
      console.error("Missing meeting data or start time");
      return;
    }

    const scheduledDate = meetingData.selectedDate;
    const scheduledTime = meetingData.startTime;
    const scheduledStart = dayjs(`${scheduledDate}T${scheduledTime}`);
    let joinHour = 0;
    let joinMinute = 0;

    if (startTimeUsed.includes(":")) {
      const [h, m] = startTimeUsed.split(":").map(Number);
      joinHour = h;
      joinMinute = m;
    }

    const actualJoin = dayjs(
      `${scheduledDate}T${String(joinHour).padStart(2, "0")}:${String(joinMinute).padStart(2, "0")}`,
    );
    const diffMinutes = actualJoin.diff(scheduledStart, "minute");
    const teacherAbsent = diffMinutes >= 15;

    const student = attendance[0]; // Assuming attendance is an array
    const studentJoined = student?.joinTime && student.joinTime !== "";
    const parsedStudentJoin = studentJoined
      ? dayjs(`${scheduledDate}T${student.joinTime}`)
      : null;
    const studentLateBy = parsedStudentJoin
      ? parsedStudentJoin.diff(scheduledStart, "minute")
      : Infinity;
    const studentAbsent = !studentJoined || studentLateBy > 15;
    const studentAttendee = studentAbsent ? "absent" : "present";

    const payload = {
      ...meetingData,
      sessionStarttime: startTimeUsed,
      sessionsEndtime: endCallTime,
      meetingStatus: "Completed",
      teacherAttendee: teacherAbsent ? "absent" : "present",
      studentAttendee,
    };

    try {
      const token = localStorage.getItem("TeacherAuthToken");
      await axios.put(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TEACHERMEETING.UPDATE}/${meetingId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log("Meeting schedule updated");
      setRedirectTo("/modules/users/teacher/ui/meeting");
    } catch (error) {
      console.error("Failed to update meeting schedule:", error);
    }
  };

  return (
    <BaseLayout>
      <TeacherHeader currentSection="Live Meeting" />
      <div className="flex h-screen">
        <div className="flex flex-col w-full min-h-screen px-4 sm:px-6 md:px-8">
          <div className="flex flex-col lg:flex-row gap-6 flex-1 w-full max-w-screen-xl mx-auto py-0">
            <div className="flex-1 overflow-auto">
              <div className="p-1 sm:p-2 relative w-full flex flex-col flex-1 h-[60vh] sm:h-[70vh] md:h-[75vh] lg:h-[80vh] xl:h-[85vh]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-medium">
                      {meetingData?.meetingName}
                    </h2>
                    <span className="text-sm text-gray-500">
                      {meetingData?.description}
                    </span>
                  </div>
                  <div className="ml-auto w-64">
                    <label
                      htmlFor="attendance-select"
                      className="block text-sm font-semibold mb-1"
                    >
                      Attendance
                    </label>
                    <select
                      id="attendance-select"
                      className="w-full border p-2 rounded focus:outline-none text-[10px] dark:bg-[#252525] "
                    >
     {attendance.map((s) => {

  let status = "❌ Not Joined";

  if (s.joined) {
    status = s.leaveTime
      ? `🚪 Left at ${s.leaveTime}`
      : `✅ Joined at ${s.joinTime}`;
  }

  return (
    <option key={s.studentId || s.id}>
      {s.name} – {status}
    </option>
  );
})}


                    </select>
                  </div>
                </div>
                {/* Jitsi Meeting Component */}
                {roomName && (
                  <JitsiMeeting
                    roomName={roomName}
                    domain="meet.blackstoneinfomaticstech.com"
                      userInfo={{
    displayName: `${localStorage.getItem("TeacherName")} | ID : ${localStorage.getItem("TeacherId")}`,
    email: localStorage.getItem("TeacherEmail") || "teacher@alfurqan.com",
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

  // ================= JOIN =================
 externalApi.addListener("participantJoined", (event) => {

  const joinTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  console.log("🟢 Joined:", event.displayName, event.id);

  let name = event.displayName || "Guest";

  // Remove "| ID : xxx" if exists
  if (name.includes("|")) {
    name = name.split("|")[0].trim();
  }

  setAttendance((prev) => {

    // 🔥 Match by JITSI ID
    const exists = prev.find((a) => a.id === event.id);

    if (exists) {
      return prev.map((a) =>
        a.id === event.id
          ? {
              ...a,
              joined: true,
              joinTime,
              leaveTime: "",
            }
          : a
      );
    }

    // 🔥 Update first "not joined" slot if exists
    const firstNotJoined = prev.find((a) => !a.joined);

    if (firstNotJoined) {
      return prev.map((a) =>
        a === firstNotJoined
          ? {
              ...a,
              id: event.id,
              name,
              joined: true,
              joinTime,
              leaveTime: "",
            }
          : a
      );
    }

    // 🔥 Otherwise add new
    return [
      ...prev,
      {
        id: event.id,
        studentId: event.id,
        name,
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

  console.log("🔴 Left:", event.id);

  setAttendance((prev) =>
    prev.map((a) =>
      a.id === event.id
        ? {
            ...a,
            joined: false,
            leaveTime,
          }
        : a
    )
  );
});

  // ================= HOST JOIN =================
  externalApi.addListener("videoConferenceJoined", () => {

    const startCallTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    startTimeRef.current = startCallTime;
    setStartTime(startCallTime);
  });

  // ================= HOST LEAVE =================
  externalApi.addListener("videoConferenceLeft", () => {
    handleEndCall();
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
    </BaseLayout>
  );
};

export default LiveMeeting;
