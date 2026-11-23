"use client";

import { ClassList, titleClass } from "./teacherDetailsTabShared";
import { TeacherDetailsTabProps } from "./teacherDetailsTypes";

export default function ClassesScheduleTab({
  classes,
  classesLoading,
}: TeacherDetailsTabProps) {
  return (
    <section className="rounded-lg border border-[#e7eaf2] bg-white p-4 dark:border-[#454a57] dark:bg-[#30343f]">
      <h3 className={`${titleClass} mb-2`}>Classes &amp; Schedule</h3>
      <ClassList
        classes={classes}
        loading={classesLoading}
        emptyMessage="No classes or schedule details are available."
      />
    </section>
  );
}
