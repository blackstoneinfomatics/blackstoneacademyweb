"use client";

import React, { useEffect, useMemo, useState } from "react";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import axios, { AxiosError } from "axios";
import { getSocket } from "@/app/utils/socket";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import dayjs from "dayjs";
import { X, ChevronDown, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

export interface Student {
  _id: string;
  teacherName: string;
  sessionClassType: string;
  username: string;
  password: string;
  role: string;
  status: string;
  createdDate: string | number | Date;
  createdBy: string;
  updatedDate: string | number | Date;
  __v: number;
  student: {
    studentId: string;
    studentEmail: string;
    studentPhone: string | number;
    course: string;
    package: string;
    city: string;
    country: string;
    gender: string;
  };
}
export interface StudentInfo {
  id: string;
  studentName: string;
  studentEmail: string;
}

export interface TeacherInfo {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
}

export interface TimeOption {
  value: string;
  label: string;
}

export interface DayOption {
  value: string;
  label: string;
}

export interface ScheduleData {
  students: StudentInfo[];
  teacher: TeacherInfo;
  package: string;
  preferedTeacher: string;
  sessionClassType: string;
  sessionStarttime: string;
  sessionsEndtime: string;
  totalHourse: number;
  weeklySlots: WeeklySlotMap;
  startDate: string;
  endDate: string;
  classDay: DayOption[];
  startTime: TimeOption[];
  endTime: TimeOption[];
  scheduleStatus: string;
  studentAttendee: string;
  teacherAttendee: string;
}

type Props = {
  readonly onClose: () => void;
  students: Student[];
  packageName?: string;
  totalHours?: number;
  course?: string;
};
interface TeacherList {
  teacherId: string;
  teacherName: string;
}
interface TimeSlots {
  startTime: string;
  endTime: string;
}

interface ScheduleItem {
  day: string;
  times: TimeSlots[];
  isSelected: boolean;
}
type WeeklySlotMap = {
  [day: string]: { from: string; to: string }[];
};

export default function AddGroupAssignClass({
  onClose,
  students,
  course,
  packageName,
  totalHours,
}: Readonly<Props>) {
  const [teachers, setTeachers] = useState<TeacherList[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherList | null>(
    null
  );
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [studentInfos, setStudentInfos] = useState<StudentInfo[]>([]);
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  useEffect(() => {
    console.log(JSON.stringify(students));
  }, [students]);

  const [startDate, setStartDate] = useState("");
  const [suggestedSlots, setSuggestedSlots] = useState<WeeklySlotMap>({});
  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].map((day) => ({
      day,
      times: [],
      isSelected: false,
    }))
  );

  const weeklyHourLimit = totalHours || 0;

  const buildWeeklySlots = () => {
    const map: WeeklySlotMap = {};
    schedule.forEach((item) => {
      if (item.isSelected && item.times.length > 0) {
        map[item.day] = item.times.map((t) => ({
          from: t.startTime,
          to: t.endTime,
        }));
      }
    });
    return map;
  };
  useEffect(() => {
    const mapped = students.map((stu) => ({
      id: stu._id,
      studentName: stu.username,
      studentEmail: stu.student.studentEmail,
    }));
    setStudentInfos(mapped);

    const fetchTeachers = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("AcademicCoachAuthToken")
            : null;

        const url = `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.USER.GET}?role=TEACHER`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        let teachersList = [];
        if (Array.isArray(response.data)) {
          teachersList = response.data;
        } else if (Array.isArray(response.data.users)) {
          teachersList = response.data.users;
        } else if (Array.isArray(response.data.teachers)) {
          teachersList = response.data.teachers;
        }

        if (course && teachersList.length > 0) {
          const adjustedPosition =
            course === "Islamic Studies" ? "Islamic" : course;
          const expectedPosition =
            `${adjustedPosition.trim()} Teacher`.toLowerCase();
          teachersList = teachersList.filter(
            (t: any) => t.position?.toLowerCase() === expectedPosition
          );
           const formattedTeachers = teachersList.map((t: any) => ({
          teacherId: t.userId,
          teacherName: t.userName,
        }));

        setTeachers(formattedTeachers);
        }
       
      } catch (err) {
        console.error("Error fetching teachers", err);
        setTeachers([]); 
      }
    };

    fetchTeachers();
  }, [students, course]);

  const calculateTotalHours = () => {
    let totalHours = 0;

    schedule.forEach((item) => {
      if (item.isSelected) {
        item.times.forEach((time) => {
          if (time.startTime && time.endTime) {
            const start = new Date(`2023-01-01T${time.startTime}`);
            const end = new Date(`2023-01-01T${time.endTime}`);
            const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60); 
            totalHours += diff;
          }
        });
      }
    });

    return totalHours;
  };
  const showRemainingHoursPopup = () => {
    const totalHours = calculateTotalHours();
    const remainingHours = Number(weeklyHourLimit) - totalHours;
    console.log("remaining", remainingHours);
    if (remainingHours === 0) {
      toast.warning(AppValidationMessages.EVALUATION.WEEKLY_HOUR_LIMIT, {
        className:
          "w-[340px] px-4 py-3 text-sm rounded-lg shadow bg-yellow-600 text-white",
      });
    } else {
      toast.info(
        `You have ${remainingHours.toFixed(2)} hours remaining this week.`,
        {
          className:
            "w-[340px] px-4 py-3 text-sm rounded-lg shadow bg-blue-600 text-white",
        }
      );
    }
  };
  useEffect(() => {
    const academicId =
      typeof window !== "undefined"
        ? localStorage.getItem("AcademicCoachPortalId")
        : null;
    if (!academicId || !startDate) return;
    const socket = getSocket(academicId);
    console.log("📤 Sending academicTeacherWeeklySlotsListRequest");
    socket.emit("academicTeacherWeeklySlotsListRequest", {
      requestId: academicId,
      startDate: startDate,
      teacherId: selectedTeacher?.teacherId,
    });

    const handleResponse = (data: WeeklySlotMap) => {
      console.log("weekyl", data);
      setSuggestedSlots(data);
    };

    socket.on("academicTeacherWeeklySlotsListResponse", handleResponse);
    return () => {
      socket.off("academicTeacherWeeklySlotsListResponse", handleResponse);
    };
  }, [startDate, selectedTeacher]);
  const normalizeTime = (time: string) => time.slice(0, 5);

  const handleAddSuggestedSlot = (day: string, from: string, to: string) => {
    if (calculateTotalHours() >= Number(weeklyHourLimit)) {
      toast.warning(AppValidationMessages.EVALUATION.WEEKLY_HOUR_LIMIT);
      return;
    }
    const index = schedule.findIndex((item) => item.day === day);
    if (index === -1) return;

    const updated = [...schedule];
    const times = updated[index].times;

    const isDuplicate = times.some(
      (t) =>
        normalizeTime(t.startTime) === normalizeTime(from) &&
        normalizeTime(t.endTime) === normalizeTime(to)
    );

    if (isDuplicate) {
      toast.error(AppValidationMessages.EVALUATION.DUPLICATE_SLOT);
      return;
    }

    updated[index].isSelected = true;
    updated[index].times.push({
      startTime: normalizeTime(from),
      endTime: normalizeTime(to),
    });

    updated[index].times.sort((a, b) => a.startTime.localeCompare(b.startTime));

    setSchedule(updated);
    showRemainingHoursPopup();
  };

  const handleRemoveSlot = (day: string, from: string, to: string) => {
    const index = schedule.findIndex((item) => item.day === day);
    if (index === -1) return;

    const updated = [...schedule];

    updated[index].times = updated[index].times.filter(
      (t) =>
        !(
          normalizeTime(t.startTime) === normalizeTime(from) &&
          normalizeTime(t.endTime) === normalizeTime(to)
        )
    );

    if (updated[index].times.length === 0) {
      updated[index].isSelected = false;
    }

    setSchedule(updated);
    showRemainingHoursPopup();
  };

  const handleSubmit = async () => {
    console.log(startDate);
    console.log(selectedTeacher);
    console.log(studentInfos);
    if (!startDate || !selectedTeacher?.teacherId || !studentInfos) {
      alert("Please fill all required fields!");
      return;
    }
    const formattedStartDate = dayjs(startDate).format("YYYY-MM-DD");
    const formattedEndDate = dayjs(startDate)
      .add(28, "day")
      .format("YYYY-MM-DD");
    const requestData: ScheduleData = {
      students: studentInfos,
      teacher: {
        teacherId: selectedTeacher?.teacherId ?? "",
        teacherName: selectedTeacher?.teacherName ?? "",
        teacherEmail: "",
      },
      package: "",
      preferedTeacher: selectedTeacher?.teacherName ?? "",
      sessionClassType: "GROUPCLASS",
      sessionStarttime: "",
      sessionsEndtime: "",
      totalHourse: 0,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      weeklySlots: buildWeeklySlots(),
      classDay: schedule
        .filter((item) => item.isSelected)
        .map((item) => ({ label: item.day, value: item.day })),
      startTime: schedule
        .filter((item) => item.isSelected)
        .flatMap((item) =>
          item.times.map((time) => ({
            label: time.startTime,
            value: time.startTime,
          }))
        ),
      endTime: schedule
        .filter((item) => item.isSelected)
        .flatMap((item) =>
          item.times.map((time) => ({
            label: time.endTime,
            value: time.endTime,
          }))
        ),
      scheduleStatus: "Scheduled",
      studentAttendee: "absent",
      teacherAttendee: "absent",
    };
    console.log("payload", requestData);
    try {
      const token = localStorage.getItem("AcademicCoachAuthToken");
      if (!token) {
        console.error("❌ AcademicCoachAuthToken not found");
        return;
      }

      const response = await axios.post(
        `   ${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.GROUPCLASS.CREATE}`,
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
          setTeachers([]);
          setSchedule([]);
          onClose();
        }, 2000);
      }
    } catch (err) {
      const error = err as AxiosError;
      const status = error.response?.status;
      if (Number(status === 400)) {
        const message =
          (error.response?.data as any)?.message ??
          "Please check the form inputs.";
        setFailedMessage(message);
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
      <div
        className="w-full max-w-xl mx-auto 
    bg-white dark:bg-[#1F1F1F] rounded-xl shadow-xl 
    p-10 my-6 overflow-y-auto max-h-[90vh] transition-all duration-300 scrollbar-none"
      >
        {/* Title */}
        <h1 className="text-lg font-semibold text-[#1E1E1E] dark:text-white mb-6">
          Schedule Classes
        </h1>

        <div className="space-y-5">
          {/* Assigned Students */}
          <div className="relative">
            <label className="block text-[15px] font-extralight text-[#010E30] dark:text-[#E4E4E7] mb-3">
              Assigned Students
            </label>

            {/* Dropdown Header */}
            <div
              onClick={() => setShowStudentDropdown(!showStudentDropdown)}
              className={`flex text-xs justify-between items-center gap-2 border border-[#D4D4D4] dark:border-[#3F3F46] 
    rounded-lg p-2 bg-white dark:bg-[#2A2A2A] cursor-pointer transition-all duration-300 relative z-30 ${
      showStudentDropdown ? "bg-[#F4F4F5] dark:bg-[#3A3A3A]" : ""
    }`}
            >
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {studentInfos.length > 0 ? (
                  studentInfos.map((student) => (
                    <span
                      key={student.id}
                      className="px-3 py-1 bg-[#F4F4F5] dark:bg-[#3A3A3A] text-[#3F3F46] dark:text-[#E4E4E7] text-xs rounded-full"
                    >
                      {student.studentName}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
                    Select students...
                  </span>
                )}
              </div>

              {/* Chevron icon on right */}
              <ChevronDown
                size={18}
                className={`text-gray-400 transform transition-transform duration-300 ${
                  showStudentDropdown ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* Floating Dropdown */}
            {showStudentDropdown && (
              <div
                className="absolute left-0 top-full mt-2 w-full border border-[#E4E4E7] dark:border-[#3F3F46] 
      rounded-lg shadow-lg bg-white dark:bg-[#2A2A2A] max-h-[200px] overflow-y-auto z-40 animate-fadeIn"
              >
                {studentInfos.length > 0 ? (
                  studentInfos.map((student) => {
                    const isSelected = studentInfos.some(
                      (s) => s.id === student.id
                    );

                    return (
                      <div
                        key={student.id}
                        className={`flex justify-between items-center px-4 py-2 border-b last:border-none cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#EEF2FF] dark:bg-[#3F3F46]"
                            : "hover:bg-[#F4F4F5] dark:hover:bg-[#3A3A3A]"
                        }`}
                      >
                        <span className="text-xs text-[#3F3F46] dark:text-[#E4E4E7]">
                          {student.studentName}
                        </span>

                        {isSelected && (
                          <span className="text-xs text-[#6366F1]">
                            Selected
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-2 text-xs text-[#71717A] dark:text-[#A1A1AA]">
                    No students available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Course */}
          <div>
            <label className="block text-[15px] font-extralight text-[#010E30] dark:text-[#E4E4E7] mb-3">
              Course
            </label>
            <input
              type="text"
              defaultValue={course}
              readOnly
              className="w-full text-xs border border-[#D4D4D4] dark:border-[#3F3F46] rounded-lg px-3 py-2 
          focus:outline-none focus:ring-1 focus:ring-[#6366F1] bg-white dark:bg-[#2A2A2A] 
          text-[#1E1E1E] dark:text-[#E4E4E7]"
            />
          </div>

          {/* Package + Hours */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Package", value: packageName },
              { label: "Hours", value: totalHours },
            ].map((item) => (
              <div key={item.label}>
                <label className="block text-[15px] font-extralight text-[#010E30] dark:text-[#E4E4E7] mb-3">
                  {item.label}
                </label>
                <input
                  type="text"
                  defaultValue={item.value}
                  readOnly
                  className="w-full text-xs border border-[#E4E4E7] dark:border-[#3F3F46] rounded-lg px-3 py-2 
              focus:outline-none focus:ring-1 focus:ring-[#6366F1] bg-white dark:bg-[#2A2A2A] 
              text-[#1E1E1E] dark:text-[#E4E4E7]"
                />
              </div>
            ))}
          </div>

          {/* Join Date */}
          <div>
            <label
              htmlFor="join-date"
              className="text-[15px] font-extralight text-[#010E30] dark:text-[#E4E4E7] mb-2 block"
            >
              Start Date
            </label>
            <input
              type="date"
              id="join-date"
              className="w-full border text-xs border-[#D4D4D4] dark:border-[#3F3F46] rounded-lg px-3 py-2 
          bg-white dark:bg-[#2A2A2A] text-[#1E1E1E] dark:text-[#E4E4E7] dark:[color-scheme:dark]"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* Teacher */}
          <div className="relative">
            <label className="text-[15px] font-extralight text-[#010E30] dark:text-[#E4E4E7] mb-2 block">
              Teacher
            </label>

            {/* Dropdown Header */}
            <div
              onClick={() => setShowTeacherDropdown(!showTeacherDropdown)}
              className={`flex justify-between items-center border border-[#D4D4D4] dark:border-[#3F3F46]
    rounded-lg px-3 py-2 text-xs cursor-pointer transition-all duration-300 
    bg-white dark:bg-[#2A2A2A] ${
      showTeacherDropdown ? "bg-[#F4F4F5] dark:bg-[#3A3A3A]" : ""
    }`}
            >
              <span
                className={`text-xs ${
                  selectedTeacher
                    ? "text-[#3F3F46] dark:text-[#E4E4E7]"
                    : "text-[#71717A] dark:text-[#A1A1AA]"
                }`}
              >
                {selectedTeacher
                  ? selectedTeacher.teacherName
                  : "Select a teacher"}
              </span>

              <ChevronDown
                size={18}
                className={`text-gray-400 transform transition-transform duration-300 ${
                  showTeacherDropdown ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* Floating Dropdown */}
            {showTeacherDropdown && (
              <div
                className="absolute text-xs left-0 top-full mt-2 w-full border border-[#E4E4E7] dark:border-[#3F3F46]
      rounded-lg shadow-lg bg-white dark:bg-[#2A2A2A] max-h-[200px] overflow-y-auto z-40 animate-fadeIn"
              >
                {Array.isArray(teachers) && teachers.length > 0 ? (
                  teachers.map((teacher) => (
                    <div
                      key={teacher.teacherId}
                      className={`px-4 py-2 text-xs cursor-pointer border-b last:border-none
            transition-colors ${
              selectedTeacher?.teacherId === teacher.teacherId
                ? "bg-[#EEF2FF] dark:bg-[#3F3F46] text-xs"
                : "hover:bg-[#F4F4F5] dark:hover:bg-[#3A3A3A]"
            }`}
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setShowTeacherDropdown(false);
                      }}
                    >
                      {teacher.teacherName}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-xs text-[#71717A] dark:text-[#A1A1AA]">
                    No teachers available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preferred day & time */}
          <div>
            <label className="block text-[15px] font-extralight text-[#010E30] dark:text-[#E4E4E7] mb-2">
              Preferred day & time
            </label>

            <div className="grid grid-cols-2 gap-4">
              {schedule.map((day) => {
                const selectedTimes = day.times.map(
                  (t) => `${t.startTime} - ${t.endTime}`
                );
                const preview =
                  selectedTimes.length > 2
                    ? `${selectedTimes.slice(0, 2).join(", ")} ...`
                    : selectedTimes.join(", ");

                return (
                  <div key={day.day} className="relative">
                    {/* Header Row */}
                    <div
                      onClick={() =>
                        setOpenDay(openDay === day.day ? null : day.day)
                      }
                      className={`flex justify-between items-center border border-[#D4D4D4] dark:border-[#3F3F46] 
            rounded-lg px-3 py-2 text-xs cursor-pointer transition-all duration-300 relative z-30 ${
              openDay === day.day
                ? "bg-[#F4F4F5] dark:bg-[#3A3A3A]"
                : "bg-white dark:bg-[#2A2A2A]"
            }`}
                    >
                      {/* Left side: Day name */}
                      <span className="text-[#3F3F46] dark:text-[#E4E4E7] font-medium">
                        {day.day}
                      </span>

                      {/* Right side: preview text + chevron */}
                      <div className="flex items-center gap-2">
                        {selectedTimes.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {selectedTimes.slice(0, 2).map((time, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 text-sm 
        bg-[#F4F4F5] text-[#3F3F46] rounded-md
        dark:bg-[#3A3A3A] dark:text-[#E4E4E7]"
                              >
                                {time}
                              </span>
                            ))}

                            {selectedTimes.length > 2 && (
                              <span
                                className="inline-flex items-center px-2 py-0.5 text-xs 
        bg-[#E4E4E7] text-[#3F3F46] rounded-md
        dark:bg-[#3F3F46] dark:text-[#A1A1AA]"
                              >
                                +{selectedTimes.length - 2} more
                              </span>
                            )}
                          </div>
                        )}

                        <ChevronDown
                          size={16}
                          className={`text-gray-400 transform transition-transform duration-300 ${
                            openDay === day.day ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* Floating Dropdown */}
                    {openDay === day.day && (
                      <div
                        className="absolute left-0 top-full mt-2 w-full border border-[#E4E4E7] dark:border-[#3F3F46]
              rounded-lg shadow-lg bg-white dark:bg-[#2A2A2A] max-h-[200px] overflow-y-auto z-40 animate-fadeIn"
                      >
                        {suggestedSlots[day.day]?.map(
                          (slot: any, i: number) => {
                            const isAdded = day.times.some(
                              (t) =>
                                normalizeTime(t.startTime) ===
                                  normalizeTime(slot.from) &&
                                normalizeTime(t.endTime) ===
                                  normalizeTime(slot.to)
                            );

                            return (
                              <div
                                key={i}
                                className={`flex justify-between items-center px-4 py-2 border-b last:border-none transition-colors ${
                                  isAdded
                                    ? "bg-[#EEF2FF] dark:bg-[#3F3F46]"
                                    : "bg-white dark:bg-[#2A2A2A]"
                                }`}
                              >
                                <span className="text-sm text-[#3F3F46] dark:text-[#E4E4E7]">
                                  {slot.from} - {slot.to}
                                </span>

                                <div className="flex items-center gap-2">
                                  {isAdded ? (
                                    <>
                                      <button className="text-xs bg-[#576CBC] dark:bg-[#3F3F46] text-[#FFFFFF] dark:text-[#E4E4E7] px-2 py-1 rounded-md">
                                        Added
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleRemoveSlot(
                                            day.day,
                                            slot.from,
                                            slot.to
                                          )
                                        }
                                        className="bg-red-500 text-white p-1 rounded-md"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        handleAddSuggestedSlot(
                                          day.day,
                                          slot.from,
                                          slot.to
                                        )
                                      }
                                      className="text-xs border border-[#6366F1] text-[#6366F1] px-3 py-1 rounded-md hover:bg-[#6366F1] hover:text-white transition"
                                    >
                                      Add
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E4E4E7] dark:border-[#3F3F46] mt-8 mb-6"></div>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium border border-[#576CBC] text-[#576CBC] rounded-lg hover:bg-[#E6E9F5] dark:hover:bg-[#2B2B2B]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            type="button"
            className="px-4 py-2 text-xs font-medium bg-[#576CBC] hover:bg-[#4459A9] text-white rounded-lg"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Popups */}
      {success && (
        <SuccessPopup onClose={() => setSuccess(false)} title="Group Class" />
      )}
      {failed && (
        <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
      )}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </div>
  );
}
