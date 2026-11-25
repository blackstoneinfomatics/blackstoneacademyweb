"use client";

import { useCallback, useEffect, useState } from "react";
import {
  GraduationCap,
  Mail,
  Phone,
  Users,
} from "lucide-react";
import BaseLayout3 from "@/app/(tenant)/modules/users/supervisor/components/BaseLayout3";
import SupervisorHeader from "../../components/supervisorHeader";
import TeacherDetailsTabs from "./TeacherDetailsTabs";
import {
  TeacherClass,
  TeacherProfile,
  TeacherStats,
} from "./teacherDetailsTypes";

const cardClass =
  "rounded-xl border border-[#E2E8F0] bg-[#F2F3FA] p-5 shadow-[0_2px_8px_0_rgba(153,153,153,0.08)] dark:shadow-sm dark:border-[#454a57] dark:bg-[#30343f]";

const MOCK_TEACHER: TeacherProfile = {
  _id: "TCH-1001",
  teacherId: "TCH-1001",
  candidateFirstName: "Arjun",
  candidateLastName: "Kumar",
  candidateEmail: "arjun.kumar@academia.in",
  candidatePhoneNumber: "98765 43210",
  phoneCountryCode: "+91",
  candidateCountry: "India",
  candidateCity: "Mumbai",
  positionApplied: "UI/UX Design",
  specialization: "UI/UX Design",
  highestQualification: "M.Des, Interaction Design",
  university: "National Institute of Design",
  completionYear: 2018,
  teachingExperience: "6 years",
  expectedSalary: 35000,
  currency: "₹",
  preferedWorkingHours: "Full-time",
  employmentType: "Full-time",
  status: "Present",
  applicationStatus: "Present",
  dateOfJoining: "2026-02-12",
  overallRating: 4.8,
  gender: "Male",
  dateOfBirth: "1992-06-18",
  address: "Andheri West, Mumbai",
  experienceType: "Experienced",
  skills: ["Figma", "Typography", "Design Systems", "Prototyping"],
};

const MOCK_STATS: TeacherStats = {
  totalstudents: 48,
  totalclasses: 126,
  totalhours: 684,
  totalearnings: 24500,
  overallPerformance: 72,
};

const MOCK_CLASSES: TeacherClass[] = [
  {
    _id: "CLS-2001",
    course: { courseName: "Typography Principles" },
    sessionClassType: "REGULARCLASS",
    classMode: "Online",
    scheduleStatus: "Live",
    startDate: "2026-11-23",
    startTime: ["14:15"],
    classDay: ["Monday"],
  },
  {
    _id: "CLS-2002",
    course: { courseName: "Typography Principles" },
    sessionClassType: "REGULARCLASS",
    classMode: "Online",
    scheduleStatus: "Completed",
    startDate: "2026-11-22",
    endDate: "2026-11-22",
    startTime: ["11:00"],
    classDay: ["Sunday"],
  },
  {
    _id: "CLS-2003",
    course: { courseName: "Design Handoff & Specs" },
    sessionClassType: "REGULARCLASS",
    classMode: "Offline",
    scheduleStatus: "Scheduled",
    startDate: "2026-11-24",
    startTime: ["10:00"],
    classDay: ["Tuesday"],
  },
  {
    _id: "CLS-2004",
    course: { courseName: "Usability Testing Basics" },
    sessionClassType: "REGULARCLASS",
    scheduleStatus: "Scheduled",
    startDate: "2026-11-26",
    startTime: ["10:00"],
    classDay: ["Thursday"],
  },
  {
    _id: "CLS-2005",
    course: { courseName: "Usability Testing Basics" },
    sessionClassType: "REGULARCLASS",
    scheduleStatus: "Scheduled",
    startDate: "2026-11-26",
    startTime: ["13:00"],
    classDay: ["Thursday"],
  },
];

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function createResumeUrl(
  resume?: TeacherProfile["uploadResume"]
): string | undefined {
  if (!resume) return undefined;

  if (typeof resume === "string") {
    const dataUrlMatch = resume.match(/^data:([^;]+);base64,(.+)$/);
    const base64Data = dataUrlMatch ? dataUrlMatch[2] : resume;
    const contentType = dataUrlMatch?.[1] || "application/pdf";
    const binary = atob(base64Data);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return URL.createObjectURL(new Blob([bytes], { type: contentType }));
  }

  if (resume.data && resume.type) {
    return URL.createObjectURL(
      new Blob([new Uint8Array(resume.data)], { type: resume.type })
    );
  }

  return undefined;
}

export default function TeacherDetails() {
  const [teacher, setTeacher] = useState<TeacherProfile>(MOCK_TEACHER);
  const stats = MOCK_STATS;
  const classes = MOCK_CLASSES;
  const [resumeObjectUrl, setResumeObjectUrl] = useState<string | null>(null);

  // API requests are disabled here while the page uses local mock data.
  useEffect(
    () => () => {
      if (resumeObjectUrl) URL.revokeObjectURL(resumeObjectUrl);
    },
    [resumeObjectUrl]
  );

  const handleViewResume = useCallback(() => {
    if (!teacher.uploadResume) return;

    try {
      const url = createResumeUrl(teacher.uploadResume);
      if (!url) throw new Error("The teacher resume could not be opened.");
      setResumeObjectUrl(url);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error opening teacher resume:", error);
    }
  }, [teacher]);

  const fullName = `${teacher.candidateFirstName || ""} ${
    teacher.candidateLastName || ""
  }`.trim();
  const initials = fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const performance =
    stats.overallPerformance != null
      ? `${stats.overallPerformance.toFixed(0)}%`
      : "—";

  return (
    <BaseLayout3>
      <SupervisorHeader
        currentSection="Teachers Manage"
        showBackButton
        showBackPath="/modules/users/supervisor/ui/teachers"
      />
      <main className="space-y-3 pb-5">
        <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className={`${cardClass} flex min-w-0 items-center gap-5 sm:gap-6`}>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-[16px] font-semibold text-[#1D4ED8] sm:h-[70px] sm:w-[70px]">
              {initials}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-[#0F172A] dark:text-white sm:text-[22px]">
                  {fullName}
                </h2>
                <span className="rounded-sm bg-[#c7e6d5] px-3 py-1 text-[11px] font-medium capitalize text-[#377E36]">
                  {teacher.status}
                </span>
                <span className="rounded-sm bg-[#E2E8F0] px-3 py-1 text-[11px] text-[#475569] dark:bg-[#424957] dark:text-[#e0e4ec]">
                  {teacher.employmentType}
                </span>
                <span className="text-[11px] text-[#63738C] dark:text-[#c2c7d2]">
                  Joined {formatDate(teacher.dateOfJoining)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-[#475569] dark:text-[#c2c7d2]">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {teacher.teacherId}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {teacher.specialization}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {teacher.candidateEmail}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {teacher.phoneCountryCode} {teacher.candidatePhoneNumber}
                </span>
              </div>
            </div>
          </div>

          <section className={`${cardClass} flex flex-col justify-center`}>
            <h2 className="text-[14px] font-medium text-[#010E30] dark:text-white">
              Overall Performance
            </h2>
            <div className="mt-2 flex items-center justify-between gap-4">
              <p className="text-[26px] font-bold leading-none text-[#377E36]">
                {performance}
              </p>
              <p className="text-[11px] text-[#353535] dark:text-[#c2c7d2]">
                60% increase than Last Month
              </p>
            </div>
          </section>
        </section>

        <TeacherDetailsTabs
          teacher={teacher}
          stats={stats}
          classes={classes}
          classesLoading={false}
          onViewResume={handleViewResume}
          onChangeTab={() => undefined}
          onTeacherUpdate={setTeacher}
        />
      </main>
    </BaseLayout3>
  );
}
