"use client";

import { ArrowRight } from "lucide-react";
import {
  ClassList,
  InfoRows,
  mockStudentFeedback,
  SalaryTable,
  titleClass,
} from "./teacherDetailsTabShared";
import { TeacherOverviewProps } from "./teacherDetailsTypes";

export default function OverviewTab({
  teacher,
  classes,
  classesLoading,
  onChangeTab,
}: TeacherOverviewProps) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const upcomingClasses = classes
    .filter((item) => {
      if (!item.startDate) return false;
      const date = new Date(item.startDate);
      return (
        !Number.isNaN(date.getTime()) &&
        date >= today &&
        !/completed|cancelled/i.test(item.scheduleStatus || "")
      );
    })
    .slice(0, 3);
  const recentClasses = classes
    .filter((item) => {
      if (/completed|cancelled/i.test(item.scheduleStatus || "")) return true;
      const endDate = new Date(item.endDate || item.startDate || 0);
      return !Number.isNaN(endDate.getTime()) && endDate <= now;
    })
    .sort(
      (a, b) =>
        new Date(b.startDate || 0).getTime() -
        new Date(a.startDate || 0).getTime()
    )
    .slice(0, 3);
  const fullName = `${teacher.candidateFirstName || ""} ${
    teacher.candidateLastName || ""
  }`.trim();

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-3">
        <section className="rounded-lg border border-[#efefef] bg-[#ffffff] p-4 dark:border-[#454a57] dark:bg-[#30343f]">
          <h3 className={`${titleClass} mb-2`}>Teacher Information</h3>
          <InfoRows
            rows={[
              ["Teacher ID", teacher.teacherId || teacher._id],
              ["Full Name", fullName],
              ["Specialization", teacher.specialization || teacher.positionApplied],
              ["Qualification", teacher.highestQualification || teacher.qualification],
              ["Experience", teacher.teachingExperience || teacher.experience],
              [
                "Expected Salary",
                teacher.expectedSalary != null
                  ? `${teacher.currency || ""} ${teacher.expectedSalary}`.trim()
                  : "—",
              ],
            ]}
          />
        </section>

        <section className="rounded-lg border border-[#efefef] bg-[#ffffff] p-4 dark:border-[#454a57] dark:bg-[#30343f]">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h3 className={titleClass}>Recent Class Activity</h3>
            <button
              type="button"
              onClick={() => onChangeTab("classes")}
              className="text-[13px] font-medium text-[#5268bb] hover:underline"
            >
              View
            </button>
          </div>
          <ClassList
            classes={recentClasses}
            loading={classesLoading}
            emptyMessage="No recent class activity available."
          />
        </section>

        <section className="rounded-lg border border-[#efefef] bg-[#ffffff] p-4 dark:border-[#454a57] dark:bg-[#30343f]">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h3 className={titleClass}>Upcoming Classes</h3>
            <button
              type="button"
              onClick={() => onChangeTab("classes")}
              className="text-[13px] font-medium text-[#5268bb] hover:underline"
            >
              View
            </button>
          </div>
          <ClassList
            classes={upcomingClasses}
            loading={classesLoading}
            emptyMessage="No upcoming classes scheduled."
          />
        </section>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-lg border border-[#efefef] bg-[#ffffff] p-4 dark:border-[#454a57] dark:bg-[#30343f]">
          <div className="mb-2 flex items-center justify-between">
            <h3 className={titleClass}>Recent Student Feedback</h3>
            <button
              type="button"
              onClick={() => onChangeTab("classes")}
              className="text-[13px] font-medium text-[#5268bb] hover:underline"
            >
              View
            </button>
          </div>
          <div className="divide-y divide-[#edf0f5] dark:divide-[#454a57] px-1">
            {mockStudentFeedback.map((feedback) => (
              <article
                key={`${feedback.student}-${feedback.course}`}
                className="py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    aria-label="5 out of 5 stars"
                    className="text-[16px] tracking-wide text-[#F59E0B]"
                  >
                    ★★★★★
                  </span>
                  <span className="text-[11px] text-[#64748B] dark:text-[#c2c7d2]">
                    {feedback.student} · {feedback.course} · {feedback.posted}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-[#0F172A] dark:text-[#d6d9e2]">
                  {feedback.comment}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[#efefef] bg-[#ffffff] p-4 dark:border-[#454a57] dark:bg-[#30343f]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className={titleClass}>Recent Salary Payments</h3>
            <button
              type="button"
              onClick={() => onChangeTab("salary")}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#183d8b] hover:underline dark:text-[#aebdf6]"
            >
              View salary history <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <SalaryTable />
        </section>
      </div>
    </div>
  );
}
