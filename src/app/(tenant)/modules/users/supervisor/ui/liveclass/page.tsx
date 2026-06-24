"use client";

import React, { useState, useEffect } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import BaseLayout3 from "@/app/(tenant)/modules/users/supervisor/components/BaseLayout3";
import SupervisorHeader from "../../components/supervisorHeader";
import SuccessPopup from "../../components/successPopup";
import FailedPopup from "../../components/failedPopup";
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
interface Course{
  courseId:string;
  courseName:string;
}
interface ClassData {
  _id: string;
  student: Student;
  teacher: Teacher;
  course:Course;
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
  status: string;
  createdBy: string;
  createdDate: string;
  lastUpdatedDate: string;
  __v: number;
}
interface ApiResponse {
  totalCount: number;
  classSchedule: ClassData;
}

function LiveClass() {
  const [showFeedback, setShowFeedback] = useState(false);
  const search = useSearchParams();
  const classScheduleid = search.get('id');
  const [ratings, setRatings] = useState([0, 0, 0, 0]);
  const [feedback, setFeedback] = useState("");
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [roomName, setRoomName] = useState("");
    const [success, setSuccess] = useState(false);
    const [failed, setFailed] = useState(false);
    const [failedMessage, setFailedMessage] = useState("");
    const [successMessage,setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("SupervisorAuthToken")
            : null;

        if (!token) {
          console.error("❌ SupervisorAuthToken not found");
          return;
        }
        console.log(classScheduleid);
        const response = await axios.get<ClassData>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET}/${classScheduleid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Full API Response:", response.data); // ✅ Log full response

        if (response.data) {
          console.log("Setting classData:", response.data); // ✅ Log before setting state
          setClassData(response.data);
           setRoomName(response.data.classLink);
        } else {
          console.log("Error: classSchedule is missing in API response");
        }
      } catch (err) {
        console.log("Error loading class details:", err);
      }
    };
    fetchClassData();
  }, []);
  useEffect(() => {
    console.log("Updated classData:", classData); // ✅ Log changes to classData
  }, [classData]);
  const handleSubmitfeed = async () => {
    // Create request body
    const feedbackData = {
      supervisor: {
        supervisorId: localStorage.getItem("SupervisorPortalId"),
        supervisorFirstName: localStorage.getItem("SupervisorPortalName"),
        supervisorLastName: localStorage.getItem("SupervisorPortalName"),
        supervisorEmail: "john.doe@example.com",
      },
      teacher: {
        teacherId: classData?.teacher.teacherId,
        teacherName: classData?.teacher.teacherName,
        teacherEmail: classData?.teacher.teacherEmail,
      },
      classDay: classData?.classDay[0],
      preferedTeacher: classData?.preferedTeacher,
      course: {
        courseId:classData?.course.courseId,
        courseName: classData?.course.courseName,
      },
      studentsRating: {
        knowledgeofstudentsandcontent: ratings[0],
        assessmentofstudents: ratings[1],
        communicationandcollaboration: ratings[2],
        professionalism: ratings[3],
      },
      startDate: classData?.startDate,
      endDate: classData?.endDate,
      startTime: classData?.startTime[0],
      endTime: classData?.endTime[0],
      feedbackmessage: feedback,
      createdDate: new Date().toISOString(),
      createdBy: "User",
      lastUpdatedDate: new Date().toISOString(),
      lastUpdatedBy: "User",
    };
    console.log(feedbackData);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("SupervisorAuthToken")
          : null;

      if (!token) {
        console.error("❌ SupervisorAuthToken not found");
        return;
      }
      const response = await axios.post(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.FEEBACK.SUPERVISORS_FEEDBACK}`,
        feedbackData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        setSuccessMessage('Feedback');
        setTimeout(() => setShowFeedback(false), 3000);
      } else {
        console.log("Failed to submit feedback. Please try again.");
        setFailedMessage('Check Inputs');
      }
    } 
    catch (error) {
      console.error("Error submitting feedback:", error);
      console.log("Error submitting feedback. Please try again.");
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
              star <= value ? "text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => onChange(star)}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const categories = [
    "knowledge of students and content",
    "Assessment of Students",
    " Communication and Collaboration",
    "Professionalism",
  ];

  return (
    <BaseLayout3>
      <SupervisorHeader currentSection="Live Classes" showBackButton={true} showBackPath="/modules/users/supervisor/ui/viewschedule" />
      <div className="flex flex-col min-h-screen px-4 sm:px-6 md:px-8">
        {/* Centered Popup */}
              {success && (
        <SuccessPopup onClose={() => setSuccess(false)} title={successMessage} />
      )}
      {failed && (
        <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
      )}

        {/* Page Content */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 w-full max-w-screen-xl mr-20">
          <div className="flex-1 overflow-auto">
            {/* Remove Header with Logout */}
            {showFeedback ? (
              <div className="flex flex-col xl:flex-row gap-6 items-start justify-center px-2 py-2 min-h-screen">
              {/* Class Details Card */}
              <div className="bg-white dark:bg-[#3b3b3b] dark:text-[#fff] rounded-xl shadow w-full max-w-md h-[610px] mr-10 -ml-20">
                <img
                  src="/assets/images/arabics.jpg"
                  alt="Tajweed"
                  className="w-full h-[200px] object-cover rounded-t-2xl"
                />
                <div className="text-center py-4 border-b border-gray-200">
                  <h2 className="text-[18px] font-bold text-[#1E1E1E] uppercase dark:text-[#fff]">TAJWEED</h2>
                  <p className="text-[14px] text-gray-500 dark:text-[#fff]">Master Class</p>
                </div>
                <div className="px-6 py-4  ">
                  <h3 className="text-[15px] font-semibold text-[#1E1E1E] mb-4 dark:text-[#fff]">Class details</h3>
                  <div className="space-y-2 text-[14px] text-gray-700 dark:text-[#fff]">
                    <div className="flex justify-between">
                      <span>Class Name</span>
                      <span className="dark:text-[#a1a1a1]">{classData?.classDay ?? "Tajweed"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Professor Name</span>
                      <span className="dark:text-[#a1a1a1]">{classData?.teacher?.teacherName ?? "Smith"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time</span>
                      <span className="dark:text-[#a1a1a1]">{classData?.startTime?.[0] ?? "9.00"} - {classData?.endTime?.[0] ?? "10.30 AM"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date</span>
                      <span className="dark:text-[#a1a1a1]">{new Date(classData?.startDate ?? "2023-10-06").toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            
              {/* Feedback Form */}
              <div className="bg-transparent dark:bg-transparent rounded-xl w-full max-w-xl p-4 h-[640px]">
                <h2 className="text-[18px] font-semibold text-[#1E1E1E] dark:text-[#fff] mb-6">Class feedback</h2>
            
                <div className="space-y-5">
                  {categories.map((category, index) => (
                    <div key={category}>
                      <p className="text-[14px] font-medium text-[#1E1E1E] dark:text-[#fff] mb-1">{category}</p>
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
            
                  <div>
                    <p className="text-[14px] font-medium text-[#1E1E1E] dark:text-[#fff] mb-1">Additional feedback</p>
                    <textarea
                      className="w-full min-h-[120px] p-3 rounded-lg text-sm border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#4C6993] resize-none"
                      placeholder="Type your feedback here..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                  </div>
                </div>
            
                <div className="text-right mt-16">
                  <button
                    onClick={handleSubmitfeed}
                    className="bg-[#576cbc] hover:bg-[#3e5b80] text-white text-[14px] font-medium py-2 px-6 rounded-md transition duration-200"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
            
            
            ) : (
              <div className="p-1 sm:p-2 relative">
                <div className="bg-white dark:bg-[#343434] rounded-xl p-4">
                  <h2 className="font-semibold text-black text-[18px] px-3 dark:text-[#fff]">Live Class</h2>
                  {/* Student Info */}
                  <div className="mb-4 flex gap-2">
                    <h2 className="text-[14px] text-[#676666] dark:text-[#fff] opacity-60 border-r-2 border-r-[#676666] px-4">
                     {classData?.teacher.teacherName}
                    </h2>
                    <h2 className="text-[14px] text-[#676666] border-r-2 border-r-[#676666] px-4 dark:text-[#fff] opacity-60">
                      {classData?.startTime} - {classData?.endTime}
                    </h2>
                    <span className="text-[14px] text-[#676666] dark:text-[#fff] opacity-60">
                      {classData?.startDate && new Date(classData.startDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Jitsi Video Box */}
                  <div className="w-full h-[60vh] md:h-[70vh] rounded-xl overflow-hidden shadow-inner border border-gray-300">
                    {roomName && (
                      <JitsiMeeting
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
                        getIFrameRef={(iframeRef) => {
                          iframeRef.style.border = "0px";
                          iframeRef.style.height = "100%";
                          iframeRef.style.width = "100%";
                        }}
                        onApiReady={(apiObj) => {
                          apiObj.addListener('videoConferenceLeft', () => {
                            setShowFeedback(true);
                          });
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout3>
  );
}

export default LiveClass;
