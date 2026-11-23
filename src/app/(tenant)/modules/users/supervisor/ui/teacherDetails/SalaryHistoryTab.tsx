"use client";

import { SalaryTable, titleClass } from "./teacherDetailsTabShared";
import { TeacherDetailsTabProps } from "./teacherDetailsTypes";

export default function SalaryHistoryTab({
  stats,
  teacher,
}: TeacherDetailsTabProps) {
  return (
    <div className="space-y-4">
      <section className="grid gap-4 rounded-lg border border-[#e7eaf2] bg-white p-4 sm:grid-cols-2 dark:border-[#454a57] dark:bg-[#30343f]">
        <div>
          <p className="text-[13px] text-[#74809a]">Total earnings</p>
          <p className="mt-1 text-xl font-semibold text-[#15213e] dark:text-white">
            {stats?.totalearnings != null
              ? stats.totalearnings.toLocaleString()
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-[13px] text-[#74809a]">Expected salary</p>
          <p className="mt-1 text-xl font-semibold text-[#15213e] dark:text-white">
            {teacher.expectedSalary != null
              ? `${teacher.currency || ""} ${teacher.expectedSalary}`.trim()
              : "—"}
          </p>
        </div>
      </section>
      <section className="rounded-lg border border-[#e7eaf2] bg-white p-4 dark:border-[#454a57] dark:bg-[#30343f]">
        <h3 className={`${titleClass} mb-3`}>Salary Payment History</h3>
        <SalaryTable />
      </section>
    </div>
  );
}
