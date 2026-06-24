'use client';
import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import './Calender.css';
import { useRouter } from 'next/navigation';
import { AppApiEndpoints } from '@/app/_components/contents/api-endpoints';
import { AppValidationMessages } from '@/app/_components/contents/validation_message';
import { toast } from 'react-toastify';
import { AppFailureToastMessages } from '@/app/_components/contents/toast_message';
 

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

const Calender: React.FC = () => {
  const [classEvents, setClassEvents] = useState<UnifiedClassSchedule[]>([]);
  const [value, setValue] = useState<Date>(new Date());
  const router = useRouter();

  useEffect(() => {
   
  const fetchClasses = async () => {
    try {
      const teacherId = localStorage.getItem("TeacherPortalId");
      const token = localStorage.getItem("TeacherAuthToken");

      console.log("Fetching classes...");
      console.log("Teacher ID:", teacherId);
      console.log("Auth Token Present:", !!token);

      if (!token) {
  toast.error(
    AppValidationMessages.AUTH.TOKEN_REQUIRED
  );
  return;
}

if (!teacherId) {
  toast.error(
    AppValidationMessages.AUTH.TEACHER_REQUIRED
  );
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

if (
  !response.data.classScheduleList?.length &&
  !response.data.trialclasses?.length
) {
  toast.warning(
    AppValidationMessages.CLASS.NO_CLASS_FOUND
  );
  return;
}

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

      const parseDateTime = (dateStr: string, timeStr?: string) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        if (timeStr) {
          const [hours, minutes] = timeStr.split(":").map(Number);
          date.setHours(hours, minutes, 0, 0);
        }
        return date;
      };

      const upcoming = allClasses
        .filter((cls) => {
          const startDateTime = parseDateTime(
            cls.startDate,
            cls.startTime?.[0]
          );
          return (
            ["Scheduled", "Rescheduled", "Reschedulerequested"].includes(
              cls.scheduleStatus
            ) &&
            startDateTime &&
            startDateTime >= now
          );
        })
        .sort((a, b) => {
          const aDate =
            parseDateTime(a.startDate, a.startTime?.[0]) || new Date(0);
          const bDate =
            parseDateTime(b.startDate, b.startTime?.[0]) || new Date(0);
          return aDate.getTime() - bDate.getTime(); // ascending: closest to now first
        });

      console.log("Upcoming Classes:", upcoming);
      setClassEvents(upcoming);
      console.log("Class data successfully set to state.");
    } catch (error) {
  toast.error(
    AppFailureToastMessages.CLASS_FETCH
  );

  console.error(error);
}
  };

    fetchClasses();
  }, []);

 const isMeetingDate = (date: Date): boolean => {
  if (!Array.isArray(classEvents) || classEvents.length === 0) {
    return false;
  }

  return classEvents.some((event) => {
    if (!event?.startDate) return false;

    const eventStart = new Date(event.startDate);
    return (
      eventStart.getFullYear() === date.getFullYear() &&
      eventStart.getMonth() === date.getMonth() &&
      eventStart.getDate() === date.getDate()
    );
  });
};


  return (
    <div className="dark:bg-[#343434] w-full rounded-xl h-full">
      <Calendar
        onChange={(newValue) => setValue(newValue as Date)}
        value={value}
        navigationLabel={({ date }) =>
          `${date.toLocaleString('default', {
            month: 'long',
          }).toUpperCase()}, ${date.getFullYear()}`
        }
        formatShortWeekday={(locale, date) =>
          date.toLocaleDateString(locale, { weekday: 'short' }).charAt(0) // 👈 First letter only
        }
        onClickDay={() => {
          router.push(`/modules/users/teacher/ui/teacherreschedule`);
        }}
        locale="en-GB"
        calendarType="iso8601"
        className="custom-calendar dark:bg-[#343434]"
        nextLabel="›"
        prevLabel="‹"
        next2Label={null}
        prev2Label={null}
        showNeighboringMonth={true}
        tileClassName={({ date, view }) =>
          view === 'month' && isMeetingDate(date) ? 'event-day' : undefined
        }
      />
    </div>
  );
};

export default Calender;
