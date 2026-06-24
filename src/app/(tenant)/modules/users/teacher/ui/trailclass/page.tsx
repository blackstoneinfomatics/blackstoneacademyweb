"use client";
import React, { useState, useEffect, useRef } from "react";
import BaseLayout from "@/app/(tenant)/modules/users/teacher/components/BaseLayout";
import axios from "axios";
import NextTrailSession from "../../components/NextTrailSession";
import TeacherHeader from "../../components/TeacherHeader";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface Student {
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  email: string;
  phonenumber: string;
  city: string;
  country: string;
  trailId: string;
  course: string;
  classStatus: string;
}

interface Teacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
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
  sessionStatus: string;
  status: string;
  createdBy: string;
  createdDate: string;
  lastUpdatedDate: string;
  __v: number;
}
interface ApiResponse {
  totalCount: number;
  classSchedule: ClassData[];
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
interface FormData {
  _id: string;
  trailId : string;
  student: {
    studentId: string;
    studentRegisterId:string;
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
    preferredDate: string; // ISO date string
    evaluationStatus: string;
    status: string;
    createdDate: string; // ISO date string
    createdBy: string;
  };
  teacher:{
     teacherId:string;
     teacherName:string;
     teacherEmail:string };
  isLanguageLevel: boolean;
  languageLevel: string;
  isReadingLevel: boolean;
  readingLevel: string;
  isGrammarLevel: boolean;
  grammarLevel: string;
  hours: number;
  subscription: {
    subscriptionName: string;
  };
  planTotalPrice: number;
  classStartDate: string; // ISO date string
  classEndDate: string; // ISO date string
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
  assignedTeacherId: string;
  assignedTeacherEmail: string;
  studentStatus: string;
  classStatus: string;
  comments: string;
  trialClassStatus: string;
  invoiceStatus: string;
  paymentLink: string;
  paymentStatus: string;
  status: string;
  createdDate: string; // ISO date string
  createdBy: string;
  updatedDate: string; // ISO date string
  updatedBy: string;
  expectedFinishingDate: number;
  __v: number;
}

interface TrialClass {
  _id: string;
  trialId: string;
  subject: string;
  meetingLocation: string;
  classType: string;
  meetingType: string;
  meetingLink: string;
  isScheduledMeeting: boolean;
  scheduledStartDate: string;
  scheduledEndDate: string;
  scheduledFrom: string;
  scheduledTo: string;
  timeZone: string;
  description: string;
  meetingStatus: string;
  studentResponse: string;
  status: string;
  createdDate: string;
  createdBy: string;
  lastUpdatedDate: string;
  lastUpdatedBy: string;
  __v: number;

  academicCoach: {
    academicCoachId: string | null;
    name: string | null;
    email: string | null;
  };

  teacher: {
    teacherId: string;
    name: string;
    email: string;
  };

  student: {
    studentId: string;
    name: string;
    email: string;
    city: string;
    phonenumber: string;
    country: string;
  };

  course: {
    courseId: string;
    courseName: string;
  };
}

function LiveClass() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [ratings, setRatings] = useState([0, 0, 0]);
  const [feedback, setFeedback] = useState("");
  const [startTime, setStartTime] = useState<string | null>(null);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [isFormData, setIsFormData] = useState(true);
  const [roomName, setRoomName] = useState("");
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [formData, setFormData] = useState<FormData>();
  const [trialClassStatus, setTrialClassStatus] = useState("");
  const [studentStatus, setStudentStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentLink, setPaymentLink] = useState("");

  const [options, setOptions] = useState({
    trialClassStatus: ["PENDING", "INPROGRESS", "COMPLETED"],
    studentStatus: ["JOINED", "NOT JOINED", "WAITING"],
    paymentStatus: ["PAID", "FAILED", "PENDING"],
  });

  const [selectedTrial, setSelectedTrial] = useState<TrialClass | null>(null);
  const fullName = selectedTrial?.student.name || "";
  const [firstName, ...lastNameParts] = fullName.trim().split(" ");
  const lastName = lastNameParts.join(" ");

  useEffect(() => {
    const teacherId = localStorage.getItem("TeacherPortalId");
    const token = localStorage.getItem("TeacherAuthToken");

    if (!teacherId) {
      console.error("❌ TeacherId not found in localStorage");
      return;
    }

    if (!token) {
      console.error("❌ TeacherAuthToken not found in localStorage");
      return;
    }

    console.log("Fetching trial classes for teacherId:", teacherId);

    axios
      .get<TrialClass[]>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET_TEACHER_TRAILCLASS}`,
        {
          params: { teacherId },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        console.log("API Response:", response.data);
        const data = response.data;
        if (data.length > 0) {
          setSelectedTrial(data[0]);
        }
      })
      .catch((error) => {
        console.error("API Error:", error);
      });
  }, []);

  useEffect(() => {
    console.log("select");
    console.log("select", selectedTrial?.trialId);
  }, [selectedTrial]);

  const filterUpcomingClass = (response: {
    totalCount: number;
    classSchedule: any[];
  }): ClassData | null => {
    const classes = response.classSchedule;

    if (!Array.isArray(classes)) {
      console.log("Expected an array, but received:", classes);
      return null;
    }

    const now = new Date();
    let upcomingClass: ClassData | null = null;

    classes.forEach((cls) => {
      console.log(
        `Processing Class ID: ${cls._id}, startDate: ${cls.startDate}, startTime:`,
        cls.startTime
      );

      // Validate startDate
      if (!cls.startDate || typeof cls.startDate !== "string") {
        console.log(
          `Skipping class ${cls._id} due to missing or invalid startDate`
        );
        return;
      }

      const classDate = new Date(cls.startDate);
      if (isNaN(classDate.getTime())) {
        console.log(`Invalid startDate for class ${cls._id}:`, cls.startDate);
        return;
      }

      // Validate startTime and endTime
      if (!Array.isArray(cls.startTime) || !Array.isArray(cls.endTime)) {
        console.log(
          `Skipping class ${cls._id} due to incorrect startTime or endTime format`,
          cls.startTime,
          cls.endTime
        );
        return;
      }

      // Assuming startTime and endTime are arrays of strings in "HH:mm" format
      const startTime = cls.startTime[0];
      const endTime = cls.endTime[0];

      const startTimeParts = startTime.split(":").map(Number);
      const endTimeParts = endTime.split(":").map(Number);

      if (startTimeParts.length !== 2 || endTimeParts.length !== 2) {
        console.log(
          `Skipping class ${cls._id} due to invalid time format: startTime=${startTime}, endTime=${endTime}`
        );
        return;
      }

      const [startHours, startMinutes] = startTimeParts;
      const [endHours, endMinutes] = endTimeParts;

      if (
        isNaN(startHours) ||
        isNaN(startMinutes) ||
        isNaN(endHours) ||
        isNaN(endMinutes) ||
        startHours < 0 ||
        startHours > 23 ||
        endHours < 0 ||
        endHours > 23 ||
        startMinutes < 0 ||
        startMinutes > 59 ||
        endMinutes < 0 ||
        endMinutes > 59
      ) {
        console.log(
          `Skipping class ${cls._id} due to out-of-range time values: startTime=${startTime}, endTime=${endTime}`
        );
        return;
      }

      // Set start and end times correctly in 24-hour format
      classDate.setHours(startHours, startMinutes, 0, 0);
      const classEndDate = new Date(classDate);
      classEndDate.setHours(endHours, endMinutes, 0, 0);

      console.log(
        `Checking class: ${
          cls._id
        }, Start: ${classDate.toISOString()}, End: ${classEndDate.toISOString()}, Now: ${now.toISOString()}`
      );

      // Check if the class is currently ongoing
      if (now >= classDate && now <= classEndDate) {
        console.log(`Class ${cls._id} is currently LIVE`);
        upcomingClass = cls;
      }
      // If no live class, find the next upcoming class
      else if (
        classDate > now &&
        cls.sessionStatus !== "Completed" &&
        (!upcomingClass || classDate < new Date(upcomingClass.startDate))
      ) {
        console.log(`Class ${cls._id} is in the future and not completed`);
        upcomingClass = cls;
      }
    });

    console.log("Selected Class:", upcomingClass);
    return upcomingClass;
  };

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("TeacherAuthToken")
            : null;

        if (!token) {
          console.error("❌ AdminAuthToken not found");
          return;
        }

        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.EVALUATION.GET_LIST}/${selectedTrial?.trialId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("data>>>>", data);
        setOptions((prev) => ({
          trialClassStatus: prev.trialClassStatus.includes(
            data.trialClassStatus
          )
            ? prev.trialClassStatus
            : [...prev.trialClassStatus, data.trialClassStatus],
          studentStatus: prev.studentStatus.includes(data.studentStatus)
            ? prev.studentStatus
            : [...prev.studentStatus, data.studentStatus],
          paymentStatus: prev.paymentStatus.includes(data.paymentStatus)
            ? prev.paymentStatus
            : [...prev.paymentStatus, data.paymentStatus],
        }));
        setTrialClassStatus(data.trialClassStatus);
        setStudentStatus(data.studentStatus);
        setPaymentStatus(data.paymentStatus);
        setPaymentLink(
          `https://blackstoneinfomaticstech.com/invoice?id=${encodeURIComponent(
            data.trialId
          )}`
        );
        setFormData(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchClassData();
  }, [selectedTrial?.trialId]);

  const updateClick = async (id: string | undefined) => {
    const formDataNames = {
      _id: formData?._id ?? "",
      trailId : formData?.trailId,
      student: {
        studentId: formData?.student.studentId,
        studentRegisterId:formData?.student.studentRegisterId,
        studentFirstName: formData?.student.studentFirstName,
        studentLastName: formData?.student.studentLastName,
        studentEmail: formData?.student.studentEmail,
        studentGender: formData?.student.studentGender,
        studentPhone: formData?.student.studentPhone,
        studentCity: formData?.student.studentCity,
        studentCountry: formData?.student.studentCountry,
        studentCountryCode: formData?.student.studentCountryCode,
        learningInterest: formData?.student.learningInterest,
        numberOfStudents: formData?.student.numberOfStudents,
        preferredTeacher: formData?.student.preferredTeacher,
        preferredFromTime: formData?.student.preferredFromTime,
        preferredToTime: formData?.student.preferredToTime,
        timeZone: formData?.student.timeZone,
        referralSource: formData?.student.referralSource,
        preferredDate: formData?.student.preferredDate,
        evaluationStatus: formData?.student.evaluationStatus,
        status: formData?.student.status,
        createdDate: formData?.student.createdDate,
        createdBy: formData?.student.createdBy,
      },
      teacher :{
        teacherId:formData?.teacher.teacherId,
        teacherName:formData?.teacher.teacherName,
        teacherEmail:formData?.teacher.teacherEmail,
      },
      isLanguageLevel: formData?.isLanguageLevel,
      languageLevel: formData?.languageLevel,
      isReadingLevel: formData?.isReadingLevel,
      readingLevel: formData?.readingLevel,
      isGrammarLevel: formData?.isGrammarLevel,
      grammarLevel: formData?.grammarLevel,
      hours: formData?.hours,
      subscription: {
        subscriptionName: formData?.subscription.subscriptionName,
      },
      classStartDate: formData?.classStartDate,
      classEndDate: formData?.classEndDate,
      classStartTime: formData?.classStartTime,
      classEndTime: formData?.classEndTime,
      gardianName: formData?.gardianName,
      gardianEmail: formData?.gardianEmail,
      gardianPhone: formData?.gardianPhone,
      gardianCity: formData?.gardianCity,
      gardianCountry: formData?.gardianCountry,
      gardianTimeZone: formData?.gardianTimeZone,
      gardianLanguage: formData?.gardianLanguage,
      assignedTeacher: formData?.assignedTeacher,
      studentStatus: studentStatus,
      classStatus: formData?.classStatus,
      comments: formData?.comments,
      trialClassStatus: trialClassStatus,
      invoiceStatus: formData?.invoiceStatus,
      paymentLink: paymentLink,
      paymentStatus: paymentStatus,
      status: formData?.status,
      createdDate: formData?.createdDate,
      createdBy: formData?.createdBy,
      updatedDate: formData?.updatedDate,
      updatedBy: formData?.updatedBy,
      planTotalPrice: formData?.planTotalPrice,
      accomplishmentTime: formData?.accomplishmentTime,
      studentRate: formData?.studentRate,
      expectedFinishingDate: formData?.expectedFinishingDate,
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
      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.EVALUATION.UPDATE}/${formData?._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formDataNames),
        }
      );

      console.log("response", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Open the modal after setting the form data
      // setShowModal(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLSelectElement>) => {
      console.log(`Field: ${field}, Value: ${event.target.value}`);
      switch (field) {
        case "TrialClassStatus":
          setTrialClassStatus(event.target.value);
          break;
        case "studentStatus":
          setStudentStatus(event.target.value);
          break;
        case "paymentStatus":
          setPaymentStatus(event.target.value);
          break;
        default:
          break;
      }
    };

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
        console.log("teacherid", teacherId);
        const response = await axios.get<ApiResponse>(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TEACHER_CLASSES}`,
          {
            params: { teacherId },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Raw API Response:", response.data.classSchedule); // Check data format

        const nextClass = filterUpcomingClass(response.data);

        console.log("Filtered Next Class:", nextClass); // Debug if nextClass is valid

        if (nextClass) {
          setClassData(nextClass);
          setRoomName(nextClass.classLink);
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
      }
    };

    fetchClassData();
  }, []);
  const handleEndCall = async () => {
    const endCallTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    setShowFeedback(true);

    console.log("startTime:", startTime);
    console.log("endTime:", endCallTime);

    if (!classData?._id || !startTime) {
      console.error("Missing class data or start time.");
      return;
    }

    const payload = {
      ...classData,
      classDay: classData.classDay.map((day) => ({
        label: day,
        value: day,
      })),
      startTime: classData.startTime.map((time) => ({
        label: time,
        value: time,
      })),
      endTime: classData.endTime.map((time) => ({
        label: time,
        value: time,
      })),
      sessionStarttime: startTime, // new/updated field
      sessionsEndtime: endCallTime, // new/updated field
      sessionClassType: "regular",
      sessionStatus: "Completed",
    };
    console.log(payload);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("TeacherAuthToken")
          : null;
      const response = await axios.put(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.UPDATE_SLECTED_CLASS}/${classData._id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Class schedule updated:", response.data);
    } catch (error) {
      console.error("Failed to update class schedule:", error);
    }
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
  const attendanceRef = useRef(attendance);
  useEffect(() => {
    attendanceRef.current = attendance;
  }, [attendance]);
  const [timeRemaining, setTimeRemaining] = useState("");
  useEffect(() => {
    if (!classData) return;
    const updateRemainingTime = () => {
      const now = new Date();

      // Extract class date and time
      const classDate = new Date(classData.startDate);
      const [hours, minutes] = classData.startTime[0].split(":").map(Number); // Assuming startTime is an array

      classDate.setHours(hours, minutes, 0, 0); // Set time for the class

      const diff = classDate.getTime() - now.getTime();

      if (diff > 0) {
        const remainingDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        const remainingHours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const remainingMinutes = Math.floor(
          (diff % (1000 * 60 * 60)) / (1000 * 60)
        );

        setTimeRemaining(
          `${remainingDays}d ${remainingHours}h ${remainingMinutes}m`
        );
      } else {
        setTimeRemaining("Started");
      }
    };

    updateRemainingTime(); // Initial call

    const timer = setInterval(updateRemainingTime, 60000); // Update every minute

    return () => clearInterval(timer); // Cleanup on unmount
  }, [classData]);

  return (
    <BaseLayout>
      <TeacherHeader currentSection="Trial class" />
<div className="min-h-screen grid grid-rows-10 gap-4 "> 
   {isFormData ? (
    <>
   {/* Top Section - 2 parts (20%) */}
      <div className="row-span-1 flex justify-center items-center">
        <div className="w-full max-w-4xl">
          <NextTrailSession />
        </div>
      </div>

           <div className="row-span-9 flex justify-center items-start">
        <form className="bg-white dark:bg-[#252525] dark:shadow-lg w-full max-w-4xl rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-6 dark:text-[#FFF] text-gray-800">
          Student Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label className="block text-[14px] text-[#010E30] dark:text-[#FFF] mb-1">
              First name
            </label>
            <input
              type="text"
              name="firstName"
              value={
                selectedTrial
                  ? selectedTrial.student.name.split(" ")[0]
                  : ""
              }
              className="w-full px-4 py-2 dark:bg-[#343434] dark:border-[#5C5C5C] border border-gray-300 rounded-md text-[12px] dark:text-[#FFF] focus:outline-none focus:ring-2 focus:ring-[#576CBC]"
              readOnly
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-[14px] text-[#010E30] dark:text-[#FFF] mb-1">
              Last name
            </label>
            <input
              type="text"
              name="lastName"
              value={
                selectedTrial
                  ? selectedTrial.student.name.split(" ").slice(1).join(" ")
                  : ""
              }
              className="w-full px-4 py-2 dark:bg-[#343434] dark:border-[#5C5C5C] border border-gray-300 rounded-md text-[12px] dark:text-[#FFF] focus:outline-none focus:ring-2 focus:ring-[#576CBC]"
              readOnly
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[14px] text-[#010E30] dark:text-[#FFF] mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={selectedTrial?.student.email || ""}
              className="w-full px-4 py-2 dark:bg-[#343434] dark:border-[#5C5C5C] border border-gray-300 rounded-md text-[12px] dark:text-[#FFF] focus:outline-none focus:ring-2 focus:ring-[#576CBC]"
              readOnly
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-[14px] text-[#010E30] dark:text-[#FFF] mb-1">
              Phone number
            </label>
            <input
              type="text"
              name="phone"
              value={selectedTrial?.student.phonenumber || ""}
              className="w-full px-4 py-2 dark:bg-[#343434] dark:border-[#5C5C5C] border border-gray-300 rounded-md text-[12px] dark:text-[#FFF] focus:outline-none focus:ring-2 focus:ring-[#576CBC]"
              readOnly
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-[14px] text-[#010E30] dark:text-[#FFF] mb-1">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={selectedTrial?.student.country}
              className="w-full px-4 py-2 dark:bg-[#343434] dark:border-[#5C5C5C] border border-gray-300 rounded-md text-[12px] dark:text-[#FFF] focus:outline-none focus:ring-2 focus:ring-[#576CBC]"
              readOnly
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-[14px] text-[#010E30] dark:text-[#FFF] mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={selectedTrial?.student.city}
              className="w-full px-4 py-2 dark:bg-[#343434] dark:border-[#5C5C5C] border border-gray-300 rounded-md text-[12px] dark:text-[#FFF] focus:outline-none focus:ring-2 focus:ring-[#576CBC]"
              readOnly
            />
          </div>

          {/* Trial ID */}
          <div>
            <label className="block text-[14px] text-[#010E30] dark:text-[#FFF] mb-1">
              Trial ID
            </label>
            <input
              type="text"
              name="trialId"
              value={selectedTrial?.trialId}
              className="w-full px-4 py-2 dark:bg-[#343434] dark:border-[#5C5C5C] border border-gray-300 rounded-md text-[12px] dark:text-[#FFF] focus:outline-none focus:ring-2 focus:ring-[#576CBC]"
              readOnly
            />
          </div>

          {/* Course */}
          <div>
            <label className="block text-[14px] text-[#010E30] dark:text-[#FFF] mb-1">
              Course
            </label>
            <input
              name="course"
              value={selectedTrial?.course.courseName}
              className="w-full px-4 py-2 dark:bg-[#343434] dark:border-[#5C5C5C] border border-gray-300 rounded-md text-[12px] dark:text-[#FFF] focus:outline-none focus:ring-2 focus:ring-[#576CBC]"
              readOnly
            />
          </div>

          {/* Class Status */}
          <div>
            <label className="block text-[14px] text-[#010E30] dark:text-[#FFF] mb-1">
              Class Status
            </label>
            <select
              name="trialClassStatus"
              value={trialClassStatus}
              onChange={handleChange("TrialClassStatus")}
              className="w-full px-4 py-2 dark:bg-[#343434] dark:border-[#5C5C5C] border border-gray-300 rounded-md text-[12px] dark:text-[#FFF] focus:outline-none focus:ring-2 focus:ring-[#576CBC]"
            >
              {options.trialClassStatus.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Student Status */}
          <div>
            <label className="block text-[14px] text-[#010E30] dark:text-[#FFF] mb-1">
              Student Status
            </label>
            <select
              name="studentStatus"
              value={studentStatus}
              onChange={handleChange("studentStatus")}
              className="w-full px-4 py-2 dark:bg-[#343434] dark:border-[#5C5C5C] border border-gray-300 rounded-md text-[12px] dark:text-[#FFF] focus:outline-none focus:ring-2 focus:ring-[#576CBC]"
            >
              {options.studentStatus.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-6">
          <label className="block text-[14px] text-[#010E30] dark:text-[#FFF] mb-1">
            Additional Comments (Optional)
          </label>
          <textarea
            name="comments"
            placeholder="Write your comment here..."
            className="w-full px-4 py-2 dark:bg-[#343434] dark:border-[#5C5C5C] border border-gray-300 rounded-md text-[12px] dark:text-[#FFF] h-24 resize-none focus:outline-none focus:ring-2 focus:ring-[#576CBC]"
          />
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            className="px-6 py-2 rounded-md dark:bg-[#343434] dark:border-[#5C5C5C] border border-gray-300 text-sm dark:text-[#FFF] text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={() => updateClick(selectedTrial?._id)}
            className="px-6 py-2 rounded-md bg-[#576CBC] text-white text-sm hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
    </>
  ) : (
    <></>
  )}
</div>

    </BaseLayout>
  );
}

export default LiveClass;
