"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface Student {
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  city: string;
  country: string;
  level: number;
  trailId: string;
  course: string;
  classStatus: string;
}

interface Teacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
}
interface Course {
  courseId: string;
  courseName: string;
}

interface ClassData {
  _id: string;
  student: Student;
  teacher: Teacher;
  classDay: string[]; // Keep this as an array of strings
  package: string;
  preferedTeacher: string;
  totalHourse: number;
  startDate: string;
  endDate: string;
  startTime: string[]; // Array of strings for startTime
  endTime: string[]; // Array of strings for endTime
  scheduleStatus: string;
  classLink: string;
  course: Course;
  sessionStarttime: string;
  sessionsEndtime: string;
  sessionStatus: string;
  sessionClassType: string;
  teacherAttendee: string;
  studentAttendee: string;
  status: string;
  createdBy: string;
  createdDate: string;
  lastUpdatedDate: string;
  __v: number;
}

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

export default function LiveClass() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [ratings, setRatings] = useState([0, 0, 0]);
  const [feedback, setFeedback] = useState("");
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [roomName, setRoomName] = useState("");
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const params = useSearchParams();
  const [editableLevel, setEditableLevel] = useState(
    classData?.student.level || ""
  );

  const startTimeRef = useRef<string>("");
  const userInfo = useMemo(
    () => ({
      displayName: `${classData?.teacher?.teacherName} | ID : ${classData?.teacher?.teacherId}`,
      email: `${classData?.teacher?.teacherEmail}`,
    }),
    [
      classData?.teacher?.teacherName,
      classData?.teacher?.teacherId,
      classData?.teacher?.teacherEmail
    ]
  );
  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const teacherId =
          typeof window !== "undefined"
            ? localStorage.getItem("TeacherPortalId")
            : null;
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("TeacherAuthToken")
            : null;
        if (!token) {
          console.error("❌ TeacherAuthToken not found");
          return;
        }
        if (!teacherId || !token) {
          console.log("Missing studentId or authToken");
          return;
        }
        const id = params.get("id");
        console.log("teacherid", teacherId);
        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET}/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Raw API Response:", response.data); // Check data format

        const nextClass = response.data;

        console.log("Filtered Next Class:", nextClass); // Debug if nextClass is valid

        if (nextClass && nextClass.sessionStatus === "NotCompleted") {
          console.log("Setting classData to:", nextClass);
          setClassData(nextClass);
          setRoomName(nextClass.classLink);
          setEditableLevel(nextClass.student.level);
          setAttendance([
            {
              id: "",
              studentId: nextClass.student.studentId,
              name: nextClass.student.studentFirstName,
              startTime: null,
              endTime: null,
              joined: false,
              joinTime: "",
              leaveTime: "",
            },
          ]);
        } else {
          console.log("No upcoming class found.");
          setClassData(null);
        }
      } catch (err) {
        console.log("Error loading class details:", err);
        console.log("Submitting feedback:", feedback);
      }
    };

    fetchClassData();
  }, []);
  const updateAttendance = async (data: any) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("TeacherAuthToken")
          : null;
      const id = params.get("id");
      if (!token) {
        console.error("Token not found. User may not be logged in.");
        return;
      }
      const res = await axios.put(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.UPDATE_CLASS_ATTENDANCE}/${id}`,
        { teacher: data },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Attendance updated:", res.data);
      return res;
    } catch (err) {
      console.error("Failed to update attendance", err);
      return null;
    }
  };
  const handleJoinCall = async () => {
    const now = new Date();
    const sessionStartTime = now.toTimeString().slice(0, 5);
    console.log("Joined at:", sessionStartTime);

    if (classData?.sessionClassType === 'GROUPCLASS') {
      await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.UPDATE_GROUP_CLASSSCHEDULE}/${classData.classLink}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teacher: { teacherSessionStart: sessionStartTime }
          })
        }
      );
    } else {
      await updateAttendance({
        teacherSessionStart: sessionStartTime,
      });
    }
  };

  const handleEndCall = async () => {
    const now = new Date();
    const sessionEndTime = now.toTimeString().slice(0, 5);
    console.log("Left at:", sessionEndTime);

    let res;

    if (classData?.sessionClassType === 'GROUPCLASS') {
      res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.UPDATE_GROUP_CLASSSCHEDULE}/${classData.classLink}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teacher: { teacherSessionEnd: sessionEndTime }
          })
        }
      );
    } else {
      res = await updateAttendance({
        teacherSessionEnd: sessionEndTime,
      });
    }
    if (res && (res.status === 200)) {
      setShowFeedback(true);
    }
  };


  const StarRating = ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (rating: number) => void;
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`cursor-pointer text-xl ${star <= value ? "text-[#FAAB3C]" : "text-gray-300"
              }`}
            onClick={() => onChange(star)}
          >
            ★
          </button>
        ))}
      </div>
    );
  };
  useEffect(() => {
    let timeoutId: number | undefined;
    if (showPopup) {
      timeoutId = window.setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [showPopup]);

  const handleSubmit = async () => {
    const feedbackData = {
      student: {
        studentId: classData!.student.studentId,
        studentFirstName: classData!.student.studentFirstName,
        studentLastName: classData!.student.studentLastName,
        studentEmail: classData!.student.studentEmail,
      },
      level: Number(editableLevel), // outside student
      debug: {
        editableLevel,
        fromClassData: classData?.student.level,
      },

      teacher: {
        teacherId: classData!.teacher.teacherId,
        teacherName: classData!.teacher.teacherName,
        teacherEmail: classData!.teacher.teacherEmail,
      },
      classDay: classData!.classDay[0],
      preferedTeacher: classData!.preferedTeacher,
      course: {
        courseId: classData!.course.courseId,
        courseName: classData!.course.courseName,
      },
      teacherRatings: {
        listeningAbility: ratings[0],
        readingAbility: ratings[1],
        overallPerformance: ratings[2],
        communicationConcentration: ratings[3],
      },
      startDate: classData!.startDate,
      endDate: classData!.endDate,
      startTime: classData!.startTime[0],
      endTime: classData!.endTime[0],
      feedbackmessage: feedback,
      createdDate: new Date().toISOString(),
      createdBy: "User",
      lastUpdatedDate: new Date().toISOString(),
      lastUpdatedBy: "User",
    };

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("TeacherAuthToken")
          : null;

      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return;
      }
      const response = await axios.post(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.FEEBACK.TEACHER_FEEDBACK}`,
        feedbackData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        setShowPopup(true);
        setTimeout(() => { setShowPopup(false),window.close() }, 3000);
      } else {
        console.log("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      console.log("Error submitting feedback. Please try again.");
      console.log("🚀 Final feedbackData:", feedbackData);
    }
  };

  const attendanceRef = useRef(attendance);
  useEffect(() => {
    attendanceRef.current = attendance;
  }, [attendance]);
  const categories = [
    "Listening Ability",
    "Reading Ability",
    "Overall Performance",
    "Communication and Concentration",
  ];

  return (
    <div className="flex h-screen">
      <div className="flex flex-col w-full min-h-screen px-4 sm:px-6 md:px-8">
        {/* Page Content */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 w-full max-w-screen-xl mx-auto py-0">
          <div className="flex-1 overflow-auto">
            {showPopup && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md px-6 py-8 text-center relative">
                  <div className="flex justify-center items-center w-14 h-14 mx-auto bg-green-100 rounded-full mb-4">
                    <svg
                      className="w-7 h-7 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    Feedback Added
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Your feedback added successfully!
                  </p>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {showFeedback ? (
              <div className="flex flex-col xl:flex-row gap-4 items-stretch justify-center px-4 py-6 w-full">
                <div className="fixed top-17 right-4 z-[9999] bg-blue-100 text-blue-800 text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow border border-blue-400">
                  ℹ️ Once feedback done, class will be closed completely
                </div>
                <div className="flex flex-col xl:flex-row gap-6 items-stretch justify-center px-6 py-8 w-full">
                  {/* Student Info Card */}
                  <div className="bg-white dark:bg-[#3B3B3B] rounded-2xl shadow flex flex-col w-full xl:w-1/2">
                    <img
                      src="/assets/images/tajweedmasterclass2.png"
                      alt="Tajweed"
                      className="w-full h-48 object-cover rounded-t-2xl"
                    />
                    <div className="p-6">
                      <h3 className="text-lg font-semibold dark:text-[#FFF] text-center text-[#111827] mb-1">
                        {classData?.student.course}
                      </h3>
                      <p className="text-sm text-center text-[#959595] mb-5">
                        {classData?.sessionClassType}
                      </p>

                      <h4 className="text-sm font-semibold text-[#010E30]  dark:text-[#FFF] mb-4">
                        Class details
                      </h4>
                      <div className="text-sm text-[#010E30]/90  dark:text-[#FFF] space-y-2">
                        <div className="flex justify-between">
                          <span>Student Name</span>
                          <span className=" text-[#959595]  dark:text-[#A1A1A1] mb-4">
                            {" "}
                            {classData?.student.studentFirstName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Student ID</span>
                          <span className=" text-[#959595]  dark:text-[#A1A1A1] mb-4">
                            {classData?.student.studentId}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Course</span>
                          <span className=" text-[#959595]  dark:text-[#A1A1A1] mb-4">
                            {classData?.course.courseName}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span>Time</span>
                          <p className=" text-[#959595]  dark:text-[#A1A1A1] mb-4">
                            {classData?.startTime[0]} to{" "}
                            {classData?.endTime[0]}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <span>Day</span>
                          <span className=" text-[#959595]  dark:text-[#A1A1A1] mb-4">
                            {classData?.classDay}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date</span>
                          <p className=" text-[#959595]  dark:text-[#A1A1A1] mb-4">
                            {" "}
                            {classData?.classDay} -{" "}
                            {new Date(
                              classData?.startDate ?? "2022-01-01"
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Student Performance Card */}
                  <div className=" rounded-2xl flex-col w-full xl:w-1/2 p-6 text-[#010E30] dark:text-[#FFFFFF]">
                    <h3 className="text-lg font-semibold mb-6 text-[#010E30] dark:text-[#FFFFFF]">
                      Student Performance
                    </h3>

                    {categories.map((category, index) => (
                      <div key={category} className="mb-4">
                        <p className="text-base font-medium  text-[#010E30] dark:text-[#FFFFFF]">
                          {category}
                        </p>
                        <StarRating
                          value={ratings[index]}
                          onChange={(rating) => {
                            const newRatings = [...ratings];
                            newRatings[index] = rating;
                            setRatings(newRatings);
                          }}
                        />
                      </div>
                    ))}
                    <div className="mt-4">
                      <label htmlFor="ytcyuc" className="text-sm font-medium text-[#010E30] dark:text-[#FFFFFF] mb-2 block">
                        Student Current Level:
                      </label>
                      <input
                        type="text"
                        value={editableLevel}
                        onChange={(e) => setEditableLevel(e.target.value)}
                        className=" w-14 h-8 px-3 py-2  rounded-md text-sm bg-[#576CBC]  text-white dark:text-white"
                      />
                    </div>
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-2 text-[#010E30] dark:text-[#FFFFFF]">
                        Additional feedback
                      </h4>
                      <textarea
                        className="w-full h-28 bg-transparent text-xs p-3 border border-[#D1D5DB] rounded-lg placeholder-gray-400 resize-none"
                        placeholder="Type your feedback here..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                      />
                    </div>

                    <button
                      className="mt-4 self-end bg-[#4754DC] hover:bg-[#3B44B0] text-white text-sm font-medium px-6 py-2 rounded-lg transition"
                      onClick={handleSubmit}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-1 sm:p-2 relative w-full flex flex-col flex-1 h-[60vh] sm:h-[70vh] md:h-[75vh] lg:h-[80vh] xl:h-[85vh]">
                {/* Student Info */}
                <div className="flex justify-between items-start mb-4">
                  <div className="mt-2">
                    {classData?.sessionClassType === 'REGULARCLASS' ?
                      <h2 className="text-lg font-medium">
                        {classData?.student.studentFirstName}{" "}
                        {classData?.student.studentLastName}
                      </h2>
                      :
                      <h2 className="text-lg font-medium">
                        {classData?.sessionClassType}
                      </h2>
                    }
                    <span className="text-sm  text-gray-500">
                      {classData?.course.courseName}
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
                      className="w-full border text-xs p-2 rounded dark:text-gray-500"
                    >
                      {attendance.map((s) => {
                        let statusLabel = "❌ Not Joined";

                        if (s.joined) {
                          statusLabel = s.leaveTime
                            ? `🚪 Left at ${s.leaveTime}`
                            : `✅ Joined at ${s.joinTime}`;
                        }

                        return (
                          <option key={s.studentId} value={s.studentId}>
                            {s.name} – {statusLabel}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Jitsi Video Box */}
                <div className="flex-1 min-w-0 w-full h-[50vh] md:h-[60vh] rounded-md overflow-hidden shadow-inner border border-gray-300">
                  {roomName && (
                    <JitsiMeeting
                      roomName={roomName}
                      userInfo={userInfo}
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
                        type ParticipantLog = {
                          id: string;
                          name?: string;
                          studentId?: string;
                          startCallTime: string;
                          endCallTime?: string;
                        };
                        // ✅ Handle Participant Joined
                        externalApi.addListener(
                          "participantJoined",
                          (event: { id: string; displayName?: string }) => {
                            const joinTime = new Date().toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              }
                            );
                            const parts = event.displayName?.split("| ID :");
                            const name = parts?.[0]?.trim() ?? "Unknown";
                            const studentId = parts?.[1]?.trim() ?? "N/A";
                            console.log("🟢 New participant joined:", {
                              name,
                              studentId,
                            });
                            const updated = attendanceRef.current.map((a) =>
                              a.studentId === studentId
                                ? {
                                  ...a,
                                  id: event.id,
                                  joined: true,
                                  joinTime: joinTime,
                                  startTime: joinTime,
                                }
                                : a
                            );
                            setAttendance(updated);
                            console.log(updated);
                          }
                        );
                        // 🔴 Handle Participant Left
                        externalApi.addListener(
                          "participantLeft",
                          (event: { id: string }) => {
                            const leaveTime = new Date().toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              }
                            );
                            const participant = attendanceRef.current.find(
                              (p) => p.id === event.id
                            );
                            if (participant) {
                              setAttendance((prev) =>
                                prev.map((a) =>
                                  a.id === event.id ? { ...a, leaveTime } : a
                                )
                              );
                              console.log(
                                `🔴 ${participant.name} left at ${leaveTime}`
                              );
                            } else {
                              console.warn(
                                `❗ Participant with id ${event.id} not found in attendance.`
                              );
                            }
                          }
                        );
                        // 🎥 Host/Teacher Joined
                        externalApi.addListener("videoConferenceJoined", async () => {
                          // 1. Store teacher join time
                          const startCallTime = new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          });
                          startTimeRef.current = startCallTime;
                          console.log("✅ Teacher joined, call started at", startCallTime);
                          // 2. Mark teacher as joined (if you're tracking them in state/backend)
                          handleJoinCall(); // your existing attendance update logic
                          // 3. Get already-present participants (likely students who joined before teacher)
                          const existingParticipants = externalApi.getParticipantsInfo();
                          console.log("🎯 Checking existing participants:", existingParticipants);
                          existingParticipants.forEach((participant: any) => {
                            const parts = participant.displayName?.split("| ID :");
                            const name = parts?.[0]?.trim() ?? "Unknown";
                            const studentId = parts?.[1]?.trim() ?? "N/A";
                            console.log("👀 Already present:", { name, studentId });
                            // 4. Mark only presence; don’t overwrite joinTime
                            setAttendance((prev) =>
                              prev.map((a) =>
                                a.studentId === studentId && !a.joined
                                  ? {
                                    ...a,
                                    id: participant.participantId,
                                    joined: true,
                                    joinTime: a.joinTime || "", // don't overwrite if already set
                                  }
                                  : a
                              )
                            );
                          });
                        });
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
                <div className="mt-3 bg-blue-100 text-yellow-900 dark:bg-blue-900 dark:text-yellow-100 px-4 py-2 text-center rounded shadow text-sm font-medium border border-blue-300 dark:border-blue-700">
                  ⚠ Please don’t switch the tab or leave this page. The video
                  call will end.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
