"use client";

import { InfoRows, titleClass } from "./teacherDetailsTabShared";
import { TeacherDetailsTabProps } from "./teacherDetailsTypes";

export default function PersonalInformationTab({
  teacher,
}: TeacherDetailsTabProps) {
  return (
    <section className="max-w-4xl rounded-lg border border-[#e7eaf2] bg-white p-4 dark:border-[#454a57] dark:bg-[#30343f]">
      <h3 className={`${titleClass} mb-3`}>Personal Information</h3>
      <InfoRows
        rows={[
          [
            "Full Name",
            `${teacher.candidateFirstName || ""} ${teacher.candidateLastName || ""}`.trim(),
          ],
          ["Email", teacher.candidateEmail],
          [
            "Mobile Number",
            [teacher.phoneCountryCode, teacher.candidatePhoneNumber]
              .filter(Boolean)
              .join(" "),
          ],
          ["Gender", teacher.gender],
          ["Date of Birth", teacher.dateOfBirth],
          ["Address", teacher.address],
          ["City", teacher.candidateCity],
          ["Country", teacher.candidateCountry],
          ["Qualification", teacher.highestQualification || teacher.qualification],
          ["Specialization", teacher.specialization || teacher.positionApplied],
          ["University / Institution", teacher.university],
          ["Completion Year", teacher.completionYear],
          ["Experience", teacher.teachingExperience || teacher.experience],
          ["Employment Type", teacher.employmentType],
          ["Preferred Working Hours", teacher.preferedWorkingHours],
          ["Skills", teacher.skills],
        ]}
      />
    </section>
  );
}
