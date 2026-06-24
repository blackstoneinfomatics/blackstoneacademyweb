"use client";
import React, { useState, useEffect, useMemo } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import axios, { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { AiOutlineClockCircle } from "react-icons/ai";
import { FaUser } from "react-icons/fa";
import { MdDateRange } from "react-icons/md";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import { toast } from "react-toastify";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface Student {
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
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
  classDay: string[];
  package: string;
  preferedTeacher: string;
  totalHourse: number;
  startDate: string;
  endDate: string;
  course: Course;
  startTime: string[];
  endTime: string[];
  scheduleStatus: string;
  classLink: string;
  status: string;
  createdBy: string;
  createdDate: string;
  lastUpdatedDate: string;
  __v: number;
}

function LiveClass() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showFeedback, setShowFeedback] = useState(false);
  const [ratings, setRatings] = useState([0, 0, 0]);
  const [feedback, setFeedback] = useState("");
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [roomName, setRoomName] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const studentId = localStorage.getItem("StudentPortalId");
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("StudentAuthToken")
            : null;
        const id = searchParams.get("id");
        if (!studentId || !token) {
          toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
          return;
        }

        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET}/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const nextClass = response.data;
        setRoomName(nextClass?.classLink ?? "");

        if (nextClass) {
          setClassData(nextClass);
        } else {
          setClassData(null);
        }
      } catch (err) {
        toast.error(AppFailureToastMessages.NEXT_CLASS_FETCH);
      }
    };

    fetchClassData();
  }, []);


  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("StudentAuthToken")
          : null;
      const id = searchParams.get("id");

      if (!token || !id) {
        return;
      }

      const payload = {
        token,
        isBeacon: true,
        student: {
          studnetSessionEnd: new Date().toTimeString().slice(0, 5),
        },
      };

      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });

      navigator.sendBeacon(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.UPDATE_CLASS_ATTENDANCE}/${id}`,
        blob
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const updateAttendance = async (data: any) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("StudentAuthToken")
          : null;
      const id = searchParams.get("id");
      if (!token) {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
        return;
      }
      const res = await axios.put(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.UPDATE_CLASS_ATTENDANCE}/${id}`,
        { student: data },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res;
    } catch (err) {
      toast.error(AppFailureToastMessages.CLASS_SESSION_UPDATE);
      return null;
    }
  };
  const handleJoinCall = async () => {
    const now = new Date();
    const sessionStartTime = now.toTimeString().slice(0, 5);

    await updateAttendance({
      studnetSessionStart: sessionStartTime,
    });
  };
  const handleEndCall = async () => {
    const now = new Date();
    const sessionEndTime = now.toTimeString().slice(0, 5);
    
    const res = await updateAttendance({
      studnetSessionEnd: sessionEndTime,
    });
    if (res && res.status === 200) {
      setShowFeedback(true);
    }
  };
  const handleSubmitfeed = async () => {
    const feedbackData = {
      student: {
        studentId: classData?.student.studentId,
        studentFirstName: classData?.student.studentFirstName,
        studentLastName: classData?.student.studentLastName,
        studentEmail: classData?.student.studentEmail,
      },
      teacher: {
        teacherId: classData?.teacher.teacherId,
        teacherName: classData?.teacher.teacherName,
        teacherEmail: classData?.teacher.teacherEmail,
      },
      classDay: classData?.classDay[0],
      preferedTeacher: classData?.preferedTeacher,
      course: {
        courseId: classData?.course.courseId,
        courseName: classData?.course.courseName,
      },
      studentsRating: {
        classUnderstanding: ratings[0],
        engagement: ratings[1],
        homeworkCompletion: ratings[2],
      },
      startDate: classData?.startDate,
      endDate: classData?.endDate,
      startTime: classData?.startTime[0],
      endTime: classData?.endTime[0],
      feedbackmessage: feedback,
      createdDate: new Date().toISOString(),
      createdBy: "Student",
      lastUpdatedDate: new Date().toISOString(),
      lastUpdatedBy: "Student",
    };

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("StudentAuthToken")
          : null;

      if (!token) {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
        return;
      }
      const response = await axios.post(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.FEEBACK.CREATE_FEEDBACK}`,
        feedbackData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if ([200, 201].includes(response.status)) {
        setSuccess(true);
        setTimeout(()=>{
          window.close();
        },3000);
      }
    } catch (err) {
      const error = err as AxiosError;
      const status = error.response?.status;
      if (status === 400) {
        setFailedMessage(AppFailureToastMessages.BAD_REQUEST);
        setFailed(true);
        toast.error(AppFailureToastMessages.BAD_REQUEST);
      } else if (status === 401) {
        setFailedMessage(AppFailureToastMessages.UNAUTHORIZED);
        setFailed(true);
        toast.error(AppFailureToastMessages.UNAUTHORIZED);
      } else if (status === 403) {
        setFailedMessage(AppFailureToastMessages.FORBIDDEN);
        setFailed(true);
        toast.error(AppFailureToastMessages.FORBIDDEN);
      } else if (status === 500) {
        setFailedMessage(AppFailureToastMessages.SERVER_ERROR);
        setFailed(true);
        toast.error(AppFailureToastMessages.SERVER_ERROR);
      } else {
        setFailed(true);
        toast.error(AppFailureToastMessages.UNEXPECTED_ERROR + (status ?? ""));
      }
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
            className={`cursor-pointer text-xl ${
              star <= value ? "text-[#4754DC]" : "text-yellow-400"
            }`}
            onClick={() => onChange(star)}
          >
            ★
          </button>
        ))}
      </div>
    );
  };
  const DetailRow = ({ label, value }: { label: string; value?: string }) => (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="text-[#959595] dark:text-[#A1A1A1]">
        {value ?? "--"}
      </span>
    </div>
  );
  const userInfo = useMemo(
    () => ({
      displayName: `${classData?.student?.studentFirstName} | ID : ${classData?.student?.studentId}`,
      email: `${classData?.student?.studentEmail}`,
    }),
    [
      classData?.student?.studentFirstName,
      classData?.student?.studentId,
      classData?.student?.studentEmail,
    ]
  );

  const categories = [
    "Knowledge of Students and Content",
    "Assessment of Students",
    "Communication and Collaboration",
    "Professionalism",
  ];

  return (
      <div className=" min-w-screen min-h-screen px-1 sm:px-2 md:px-4 ">
        {/* ✅ Page Layout */}
        <div className="flex flex-col lg:flex-row gap-2 w-full max-w-screen-xl mx-auto flex-grow">
          <div className="w-full">
            {/* Content Area */}
            {showFeedback ? (
              <div className="flex flex-col xl:flex-row gap-4 items-stretch justify-start px-4 py-6 w-full">
                <div className="fixed top-17 right-4 z-[9999] bg-blue-100 text-blue-800 text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow border border-blue-400">
                  ℹ️ Once feedback done, class will be closed completely
                </div>
                {/* Class Details Card */}
                <div className="bg-white dark:bg-[#3B3B3B] rounded-2xl shadow w-full xl:w-[35%] flex flex-col">
                  <img
                    src="/assets/images/tajweedmasterclass2.png"
                    alt="Tajweed Masterclass with Quran open"
                    className="w-full h-48 object-cover rounded-t-2xl"
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold dark:text-white text-center mb-1">
                      {classData?.course?.courseName ?? "TAJWEED"} Class
                    </h3>

                    <h4 className="text-sm font-semibold text-[#010E30] dark:text-white mb-4">
                      Class details
                    </h4>

                    <div className="text-sm text-[#010E30]/90 dark:text-white space-y-4">
                      <DetailRow
                        label="Class Name"
                        value={classData?.course?.courseName}
                      />
                      <DetailRow
                        label="Teacher Name"
                        value={classData?.teacher?.teacherName}
                      />
                      <DetailRow
                        label="Time"
                        value={`${classData?.startTime?.[0]} - ${classData?.endTime?.[0]}`}
                      />
                      <DetailRow
                        label="Teacher Id"
                        value={classData?.teacher.teacherId}
                      />
                      <DetailRow label="Day" value={classData?.classDay[0]} />
                      <DetailRow
                        label="Status"
                        value={classData?.scheduleStatus}
                      />
                      <DetailRow
                        label="Date"
                        value={
                          classData?.startDate
                            ? new Date(classData.startDate).toLocaleDateString()
                            : "January 20, 2024"
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Feedback Form */}
                <div className="rounded-2xl w-full xl:w-1/2 py-4 px-6   text-[#010E30] dark:text-white">
                  <h3 className="text-lg font-semibold mb-6">Class feedback</h3>

                  {categories.map((category, i) => (
                    <div key={category} className="mb-4">
                      <p className="text-sm font-medium mb-1 text-[#3c3e44]">
                        {category}
                      </p>
                      <StarRating
                        value={ratings[i]}
                        onChange={(val) => {
                          const newRatings = [...ratings];
                          newRatings[i] = val;
                          setRatings(newRatings);
                        }}
                      />
                    </div>
                  ))}

                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">
                      Additional feedback
                    </h4>
                    <textarea
                      placeholder="Type your feedback here..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full h-28 text-xs p-3 border border-[#D1D5DB] rounded-lg placeholder-gray-400 resize-none bg-white dark:bg-[#4B4B4B] dark:text-white"
                    />
                  </div>

                  <button
                    onClick={handleSubmitfeed}
                    className="mt-4 bg-[#4754DC] hover:bg-[#3B44B0] text-white text-sm font-medium px-6 py-2 rounded-lg transition"
                  >
                    Submit
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 ">
                {/* Student Info */}
                <div className="space-y-3 ml-3">
                  <h2 className="text-lg font-semibold text-[#1C3557] dark:text-white">
                    {classData?.course.courseName} Class
                  </h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm sm:text-sm md:text-base">
                    <span className="flex items-center gap-1">
                      <FaUser className="dark:text-[#FFFFFFCC]/70 text-base sm:text-sm text-[#010E30]" />
                      <div className="dark:text-[#FFFFFFCC]/70 text-base sm:text-sm text-[#010E30]">
                        {classData?.teacher?.teacherName ?? "Unknown"}
                      </div>
                    </span>

                    <span className="flex items-center gap-1 border-y-0 border-l-2 border-r-2 px-4 border-[#010E30] dark:border-[#868585]">
                      <MdDateRange className="dark:text-[#FFFFFFCC]/70 text-base sm:text-sm text-[#010E30]" />
                      <div className="dark:text-[#FFFFFFCC]/70 text-base sm:text-sm text-[#010E30]">
                        {classData?.startDate &&
                          (() => {
                            const d = new Date(classData.startDate);
                            return `${String(d.getDate()).padStart(
                              2,
                              "0"
                            )}-${String(d.getMonth() + 1).padStart(
                              2,
                              "0"
                            )}-${d.getFullYear()}`;
                          })()}
                      </div>
                    </span>

                    <span className="flex items-center gap-1">
                      <AiOutlineClockCircle className="dark:text-[#FFFFFFCC]/70 text-base sm:text-sm text-[#010E30]" />
                      <div className="dark:text-[#FFFFFFCC]/70 text-base sm:text-sm text-[#010E30]">
                        {classData?.startTime?.[0] ?? "09:00"}
                      </div>
                    </span>
                  </div>
                </div>

                {/* ✅ Responsive Video Area */}
                <div className="w-full h-[60vh] md:h-[70vh] rounded-md overflow-hidden shadow-inner border border-gray-300 dark:border-gray-600">
                  {roomName && (
                    <JitsiMeeting
                      roomName={roomName}
                      domain="meet.blackstoneinfomaticstech.com"
                      userInfo={userInfo}
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
                        ],
                      }}
                      interfaceConfigOverwrite={{
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_BRAND_WATERMARK: false,
                        SHOW_PROMOTIONAL_CLOSE_PAGE: false,
                        SHOW_POWERED_BY: false,
                      }}
                      onApiReady={(api) => {
                        api.addListener(
                          "videoConferenceJoined",
                          handleJoinCall
                        );
                        api.addListener("videoConferenceLeft", handleEndCall);
                        api.addListener(
                          "connectionDisconnected",
                          handleEndCall
                        );
                      }}
                      getIFrameRef={(ref) => {
                        ref.style.border = "0px";
                        ref.style.height = "100%";
                        ref.style.width = "100%";
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
 {success && (
        <SuccessPopup onClose={() => setSuccess(false)} title="Feedback" />
      )}
      {failed && (
        <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
      )}

      </div>
  );
}

export default LiveClass;
