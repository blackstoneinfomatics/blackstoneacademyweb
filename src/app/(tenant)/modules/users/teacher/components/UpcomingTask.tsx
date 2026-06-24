'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { isToday } from 'date-fns';
import { AppApiEndpoints } from '@/app/_components/contents/api-endpoints';

interface ClassEvent {
  _id: string;
  package: string;
  startDate: string;
  startTime: string[];
  sessionClassType: string;
}


export interface UnifiedClassSchedule {
  _id: string;
  classId?: string;

  classLink: string;
  sessionClassType: "GROUPCLASS" | "REGULARCLASS" | "TRIALCLASS";
  scheduleStatus: string;

  course: {
    courseId: string;
    courseName: string;
  };

  startDate: string;
  endDate: string;

  classDay: string[];
  startTime: string[];
  endTime: string[];

  /* ---------- STUDENTS (WORKS FOR BOTH) ---------- */
  students: UnifiedStudent[];

  /* ---------- TEACHER (NULL FOR GROUP IF NOT SENT) ---------- */
  teacher?: {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
    teacherSessionStart: string | null;
    teacherSessionEnd: string | null;
  };

  /* ---------- OPTIONAL REGULAR CLASS FIELDS ---------- */
  package?: string;
  totalHourse?: number;

  status?: string;
  createdBy?: string;
  teacherAttendee?: string;
  studentAttendee?: string;

  classhour?: string;
  currency?: string;
  amount?: string;
  earnings?: number;
  isSalaryProcessed?: boolean;

  sessionStarttime?: string;
  sessionsEndtime?: string;
  sessionStatus?: string;

  createdDate?: string;
  lastUpdatedDate?: string;
  __v?: number;
}
export interface UnifiedStudent {
  student: {
    id: string;
    studentId: string;
    studentFirstName: string;
    studentLastName: string;
    studentEmail: string;
    gender: string;
    level: string;
    studnetSessionStart: string[] | null;
    studnetSessionEnd: string[] | null;
  };

  /* Group class fields */
  status?: string;
  sessionStatus?: string;
  earnings?: number;
}

export interface TrialClass {
  id: string;
  trialId: string;

  student: {
    id: string;
    studentId: string;
    studentName: string;
  };

  classType: string;
  meetingLink: string;

  course: {
    courseId: string;
    courseName: string;
  };
  scheduledStartDate: string;
  scheduledEndDate: string;
  scheduledFrom: string;
  scheduledTo: string;

  meetingStatus: string;
}

export interface ApiResponse {
  totalCount: number;
  classScheduleList: UnifiedClassSchedule[];
  trialclasses: TrialClass[];
}

const UpcomingTasks: React.FC = () => {
  const [classes, setClasses] = useState<UnifiedClassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const classTypeStyles: Record<string, { dot: string; text: string }> = {
    REGULARCLASS: { dot: 'bg-[#d77277]', text: 'text-[#d77277]' }, 
    GROUPCLASS: { dot: 'bg-[#72B0D7]', text: 'text-[#72B0D7]' },   
    QURAN: { dot: 'bg-[#BF63B3]', text: 'text-[#BF63B3]' },        
    ARABIC: { dot: 'bg-[#6EBF63]', text: 'text-[#6EBF63]' },      
    ISLAMIC: { dot: 'bg-[#BFBC63]', text: 'text-[#BFBC63]' },      
    DEFAULT: { dot: 'bg-gray-400', text: 'text-gray-500' },
  };

  useEffect(() => {
    const fetchClasses = async () => {
    try {
      const teacherId = localStorage.getItem("TeacherPortalId");
      const token = localStorage.getItem("TeacherAuthToken");

      console.log("Fetching classes...");
      console.log("Teacher ID:", teacherId);
      console.log("Auth Token Present:", !!token);

      if (!token || !teacherId) {
        console.warn("Missing token or teacher ID.");
        return;
      }

      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TEACHER_CLASSES}`,
        {
          params: { teacherId },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", response.data);

      // Process regular classes
      const regularClasses: UnifiedClassSchedule[] =
        response.data.classScheduleList.map((cls: any) => {
          // Normalize: if it's a regular class with a single student
          if (cls.student && cls.sessionClassType !== "GROUPCLASS") {
            cls.students = [{ student: cls.student }];
            delete cls.student;
          }
          if (cls.sessionClassType === "GROUPCLASS" && !cls.students) {
            cls.students = cls.student;
          }

          // Ensure session arrays exist for each student
          cls.students?.forEach((s: any) => {
            s.student.studnetSessionStart ||= [];
            s.student.studnetSessionEnd ||= [];
          });

          // Return the unified class object
          return {
            ...cls,
            isTrial: false,
          };
        });

      console.log("Processed Regular Classes:", regularClasses);

      /* ---------------- TRIAL CLASSES ---------------- */

      let trialClasses: UnifiedClassSchedule[] = [];

      if (Array.isArray(response.data.trialclasses)) {
        console.log("Raw Trial Classes Data:", response.data.trialclasses);

        const now = new Date();

        trialClasses = response.data.trialclasses.map((trialClass: any) => {
          // Compute the class start datetime
          const classStartDateTime =
            trialClass.scheduledStartDate && trialClass.scheduledFrom
              ? (() => {
                  const date = new Date(trialClass.scheduledStartDate);
                  const [hours, minutes] = trialClass.scheduledFrom
                    .split(":")
                    .map(Number);
                  date.setHours(hours, minutes, 0, 0);
                  return date;
                })()
              : null;

          const now = new Date();

          let sessionStatus = "Scheduled";
          if (classStartDateTime && classStartDateTime < now) {
            sessionStatus = "Completed";
          }

          return {
            _id: trialClass.id || trialClass.trialId || "",
            classId: "",
            classLink: trialClass.trialId || "",
            sessionClassType: "TRIALCLASS",
            scheduleStatus: sessionStatus,
            course: {
              courseId: trialClass.course?.courseId || "",
              courseName: trialClass.course?.courseName || "",
            },
            startDate: trialClass.scheduledStartDate || "",
            endDate: trialClass.scheduledEndDate || "",
            classDay: trialClass.scheduledStartDate
              ? [
                  new Date(trialClass.scheduledStartDate).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                    }
                  ),
                ]
              : [],
            startTime: [trialClass.scheduledFrom || ""],
            endTime: [trialClass.scheduledTo || ""],
            students: [
              {
                student: {
                  id: trialClass.student?.id || "",
                  studentId: trialClass.student?.studentId || "",
                  studentFirstName:
                    trialClass.student?.studentName?.split(" ")[0] || "Trial",
                  studentLastName:
                    trialClass.student?.studentName
                      ?.split(" ")
                      .slice(1)
                      .join(" ") || "Student",
                  studentEmail: "",
                  gender: "",
                  level: "",
                  studnetSessionStart: [],
                  studnetSessionEnd: [],
                },
                status: "Active",
                sessionStatus: sessionStatus,
                earnings: 0,
              },
            ],
            package: "",
            totalHourse: 0.5,
            status: "Active",
            createdBy: "System",
            classhour: "0.5",
            currency: "$",
            amount: "0",
            earnings: 0,
            isSalaryProcessed: false,
            sessionStarttime: trialClass.scheduledFrom || "",
            sessionsEndtime: trialClass.scheduledTo || "",
          };
        });

        console.log("Processed Trial Classes:", trialClasses);
      } else {
        console.log("No trial classes found or incorrect format.");
      }

      // Combine both types
      const allClasses = [...regularClasses, ...trialClasses];
      console.log("All Classes Combined:", allClasses);

      // Filter completed classes
      const now = new Date();

      const parseDateTime = (dateStr: any, timeStr?: string) => {
        if (!dateStr) return null;

        console.log("parseDateTime - raw dateStr:", dateStr, "timeStr:", timeStr);

        // Handle Mongo {$date}
        if (typeof dateStr === "object" && dateStr.$date) {
          dateStr = dateStr.$date;
        }

        const date = new Date(dateStr);

        if (isNaN(date.getTime())) {
          console.warn("parseDateTime - invalid date:", dateStr);
          return null;
        }

        if (timeStr) {
          const [h, m] = timeStr.split(":").map(Number);
          date.setHours(h, m, 0, 0);
        }

        console.log("parseDateTime - parsed Date:", date);

        return date;
      };

      const upcoming = allClasses.filter((cls) => {
        const start = parseDateTime(cls.startDate, cls.startTime?.[0]);
        const end = parseDateTime(cls.endDate, cls.endTime?.[0]);

        console.log("Filter class - id:", cls._id, {
          startDate: cls.startDate,
          endDate: cls.endDate,
          startTime: cls.startTime?.[0],
          endTime: cls.endTime?.[0],
          parsedStart: start,
          parsedEnd: end,
          status: cls.scheduleStatus,
        });

        if (!start || !end) {
          console.warn("Skipping class due to missing start/end:", cls._id);
          return false;
        }

        const validStatus = [
          "Scheduled",
          "BothAbsent",
          "StudentAbsent",
          "NotCompleted",
        ];

        if (!validStatus.includes(cls.scheduleStatus)) {
          console.warn(
            "Skipping class due to invalid status:",
            cls._id,
            cls.scheduleStatus
          );
          return false;
        }

        // Show until end time
        const keep = now < end;
        console.log("Filter result for class", cls._id, "=>", keep);
        return keep;
      });

      console.log("Upcoming Classes:", upcoming);

      setClasses(upcoming);
      setLoading(false);

      console.log("Class data successfully set to state.");
    } catch (error : any) {
      console.error("Error fetching class data:", error);
      setError(error);
    }
  };

    fetchClasses();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#343434] w-full rounded-xl px-4 pt-4 pb-6">
        <p className="text-center text-gray-500 dark:text-white">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#343434] w-full rounded-xl px-4 pt-4 pb-6">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#343434] w-full rounded-xl px-4 pt-4 pb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="font-semibold text-[16px] text-[#010e30] dark:text-white">
          Upcoming Tasks
        </h2>
        <span className="bg-[#EBEFFF] dark:bg-[#576CBC33] text-[#6B73FF] text-xs font-medium px-2 py-1 rounded-md">
          Today
        </span>
      </div>

      <div className="relative">
        {/* Vertical Dotted Line (Dark mode → white) */}
        <div className="absolute left-[58px] top-0 bottom-0 border-l-2 border-dotted border-black dark:border-white" />

        <div className="space-y-4 pl-[8px]">
          {classes.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-white text-sm p-4">
              No classes scheduled for today.
            </p>
          ) : (
            classes.map((classItem) => {
              const classType = classItem.sessionClassType;
              const style = classTypeStyles[classType] || classTypeStyles.DEFAULT;

              return (
                <div
                  key={classItem._id}
                  className="flex items-start relative w-full"
                >
                  {/* Time */}
                  <div className="w-[45px] text-[13px] text-black dark:text-white mt-[6px] text-right pr-1">
                    {classItem.startTime[0]}
                  </div>

                  {/* Dot centered on line */}
                  <div className="absolute left-[46px] top-[50%] -translate-y-1/2 z-10">
                    <div
                      className={`w-[10px] h-[10px] rounded-full ${style.dot}`}
                    />
                  </div>

                  {/* Card */}
                  <div className="ml-[24px] flex-1 bg-[#f4f4f4] dark:bg-[#404040] rounded-md px-3 py-2 flex justify-between items-center">
                    <span
                      className={`text-[14px] font-bold uppercase ${style.text}`}
                    >
                      {classItem.sessionClassType}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingTasks;
