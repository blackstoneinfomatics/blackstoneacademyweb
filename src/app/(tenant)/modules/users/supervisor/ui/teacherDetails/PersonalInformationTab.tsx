"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { TeacherDetailsTabProps } from "./teacherDetailsTypes";
import { InfoRows, titleClass } from "./teacherDetailsTabShared";

const cardClass =
  "rounded-lg border border-[#efefef] bg-white p-3 " +
  "shadow-[0_2px_8px_0_rgba(153,153,153,0.08)] " +
  "dark:border-[#454a57] dark:bg-[#30343f]";

type PersonalInformationTabProps = TeacherDetailsTabProps & {
  onTeacherUpdate: (teacher: TeacherDetailsTabProps["teacher"]) => void;
};

export default function PersonalInformationTab({
  teacher,
  onTeacherUpdate,
}: PersonalInformationTabProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [draft, setDraft] = useState(teacher);
  const [subjectEntries, setSubjectEntries] = useState<string[]>([
    teacher.specialization || teacher.positionApplied || "",
  ]);

  useEffect(() => {
    if (!isEditOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsEditOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditOpen]);

  const openEditor = () => {
    setDraft(teacher);
    setSubjectEntries(
      (teacher.specialization || teacher.positionApplied || "")
        .split(",")
        .map((subject) => subject.trim())
    );
    setIsEditOpen(true);
  };

  const updateDraft = <K extends keyof typeof draft>(
    key: K,
    value: (typeof draft)[K]
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const saveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subjects = subjectEntries
      .map((subject) => subject.trim())
      .filter(Boolean)
      .join(", ");
    onTeacherUpdate({
      ...draft,
      specialization: subjects,
      positionApplied: subjects,
    });
    setIsEditOpen(false);
  };

  const fullName = `${teacher.candidateFirstName || ""} ${
    teacher.candidateLastName || ""
  }`.trim();
  const address = [
    teacher.address,
    teacher.candidateCity,
    teacher.candidateCountry,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <section className={cardClass}>
          <h3 className={`${titleClass} mb-3`}>Personal Information</h3>
          <InfoRows
            rows={[
              ["First Name", teacher.candidateFirstName],
              ["Last Name", teacher.candidateLastName],
              ["Email", teacher.candidateEmail],
              [
                "Mobile Number",
                [teacher.phoneCountryCode, teacher.candidatePhoneNumber]
                  .filter(Boolean)
                  .join(" "),
              ],
              ["Emergency Contact", teacher.emergencyContact],
              ["ID Type", teacher.idType],
              ["ID Proof", teacher.idProof],
              ["Gender", teacher.gender],
              ["Date of Birth", teacher.dateOfBirth],
              ["Blood Group", teacher.bloodGroup],
              ["Marital Status", teacher.maritalStatus],
              ["Address", address],
            ]}
          />
        </section>

        <div className="grid grid-cols-1 gap-4 lg:grid-rows-2">
          <section className={cardClass}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className={titleClass}>Professional Details</h3>
              <button
                type="button"
                onClick={openEditor}
                className="flex items-center gap-1.5 text-xs font-medium text-[#576CBC] hover:text-[#4055a5] dark:text-[#9aabef]"
              >
                <Pencil size={12} />
                Edit Profile
              </button>
            </div>
            <InfoRows
              rows={[
                ["Teacher ID", teacher.teacherId],
                ["Role", teacher.role],
                ["Subject", teacher.specialization || teacher.positionApplied],
                ["Employment Type", teacher.employmentType],
                ["Salary Type", teacher.salaryType],
                [
                  "Salary Amount",
                  teacher.currentSalary != null
                    ? `₹${Number(teacher.currentSalary).toLocaleString("en-IN")}`
                    : "-",
                ],
              ]}
            />
          </section>
          <section className={cardClass}>
            <h3 className={`${titleClass} mb-3`}>Skills &amp; Expertise</h3>
            <div className="space-y-2">
              <SkillGroup
                title="Technical Skills"
                skills={teacher.technicalSkills}
              />
              <SkillGroup
                title="Teaching Skills"
                skills={teacher.teachingSkills}
              />
              <SkillGroup
                title="Language Proficiency"
                skills={teacher.languages}
              />
            </div>
          </section>
          </div>
      </div>

      {isEditOpen && (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/20 p-3 sm:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsEditOpen(false);
            }}
        >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="teacher-edit-title"
              className="my-auto max-h-[calc(100vh-24px)] w-full max-w-[740px] overflow-y-auto rounded-xl bg-white p-3 shadow-2xl dark:bg-[#30343f] sm:p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2
                  id="teacher-edit-title"
                  className="text-[18px] font-semibold text-[#111827] dark:text-white"
                >
                  Teacher Information
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  aria-label="Close edit profile"
                  className="rounded-md p-1 text-[#64748b] hover:bg-[#f1f5f9] dark:hover:bg-[#424957]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={saveProfile}>
                <section className="rounded-lg border border-[#e7eaf2] p-3 dark:border-[#454a57] sm:p-4">
                  <h3 className="mb-4 text-[15px] font-medium text-[#14203c] dark:text-white">
                    Teacher Details
                  </h3>
                  <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailValue label="Full Name" value={fullName} />
                    <DetailValue
                      label="Last Name"
                      value={teacher.candidateLastName}
                    />
                    <DetailValue
                      label="Email Address"
                      value={teacher.candidateEmail}
                    />
                    <DetailValue
                      label="Date Of Birth"
                      value={teacher.dateOfBirth}
                    />
                    <DetailValue
                      label="Mobile Number"
                      value={`${teacher.phoneCountryCode || ""} ${
                        teacher.candidatePhoneNumber || ""
                      }`.trim()}
                    />
                    <DetailValue
                      label="Emergency Number"
                      value={teacher.emergencyContact}
                    />
                    <DetailValue label="ID Type" value={teacher.idType} />
                    <DetailValue label="ID Proof" value={teacher.idProof} />
                    <DetailValue label="Gender" value={teacher.gender} />
                    <DetailValue label="Blood Group" value={teacher.bloodGroup} />
                    <DetailValue
                      label="Marital Status"
                      value={teacher.maritalStatus}
                    />
                    <div className="sm:col-span-2 lg:col-span-3">
                      <DetailValue label="Address" value={address} />
                    </div>
                  </div>
                </section>

                <section className="mt-3 rounded-lg border border-[#e7eaf2] p-3 dark:border-[#454a57] sm:p-4">
                  <h3 className="mb-4 text-[15px] font-medium text-[#14203c] dark:text-white">
                    Professional Details
                  </h3>
                  <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                    <EditField
                      label="Teacher ID"
                      value={draft.teacherId}
                      onChange={(value) => updateDraft("teacherId", value)}
                    />
                    <EditField
                      label="Role"
                      value={draft.role}
                      onChange={(value) => updateDraft("role", value)}
                      options={["Teacher", "Teachers", "Supervisor", "Admin"]}
                    />
                    <div className="min-w-0">
                      <span className="mb-1 block text-[13px] font-medium text-[#14203c] dark:text-white">
                        Subject
                      </span>
                      <div className="space-y-2">
                        {subjectEntries.map((subject, index) => (
                          <div key={index} className="relative">
                            <input
                              value={subject}
                              onChange={(event) => {
                                const value = event.currentTarget.value;
                                setSubjectEntries((current) =>
                                  current.map((entry, entryIndex) =>
                                    entryIndex === index
                                      ? value
                                      : entry
                                  )
                                );
                              }}
                              aria-label={`Subject ${index + 1}`}
                              className="h-9 w-full min-w-0 rounded-md border border-[#d8deea] bg-white px-2.5 pr-10 text-[12px] text-[#475569] outline-none focus:border-[#596fbe] focus:ring-1 focus:ring-[#596fbe] dark:border-[#555b68] dark:bg-[#383d48] dark:text-white"
                            />
                            {index === subjectEntries.length - 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setSubjectEntries((current) => [...current, ""])
                                }
                                aria-label="Add subject"
                                className="absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-r-md text-[#596fbe] hover:bg-[#f4f6ff] dark:hover:bg-[#424957]"
                              >
                                <Plus size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <EditField
                      label="Employment Type"
                      value={draft.employmentType}
                      onChange={(value) => updateDraft("employmentType", value)}
                      options={["Full-time", "Part-time", "Contract", "Freelance"]}
                    />
                    <EditField
                      label="Salary Type"
                      value={draft.salaryType}
                      onChange={(value) => updateDraft("salaryType", value)}
                      options={["Monthly", "Hourly", "Yearly"]}
                    />
                    <EditField
                      label="Salary Amount"
                      value={draft.currentSalary}
                      onChange={(value) => updateDraft("currentSalary", value)}
                      inputMode="decimal"
                    />
                  </div>
                </section>

                <div className="mt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="min-w-[90px] rounded-md border border-[#5268bb] px-5 py-2 text-sm font-medium text-[#5268bb] bg-[#eff1f9] hover:bg-[#f4f6ff] dark:hover:bg-[#424957]"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="min-w-[90px] rounded-md bg-[#596fbe] px-5 py-2 text-sm font-medium text-white hover:bg-[#485eae]"
                  >
                    Save
                  </button>
                </div>
              </form>
            </section>
          </div>
      )}
    </>
  );
}

function DetailValue({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[13px] font-medium text-[#14203c] dark:text-white">
        {label}
      </p>
      <p className="break-words text-[12px] leading-5 text-[#475569] dark:text-[#c2c7d2]">
        {value == null || value === "" ? "—" : String(value)}
      </p>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  options,
  inputMode,
}: {
  label: string;
  value?: string | number;
  onChange: (value: string) => void;
  options?: string[];
  inputMode?: "decimal";
}) {
  const fieldClass =
    "h-9 w-full rounded-md border border-[#d8deea] bg-white px-2.5 text-[12px] text-[#475569] outline-none focus:border-[#596fbe] focus:ring-1 focus:ring-[#596fbe] dark:border-[#555b68] dark:bg-[#383d48] dark:text-white";

  return (
    <label className="block min-w-0 text-[13px] font-medium text-[#14203c] dark:text-white">
      <span className="mb-1 block">{label}</span>
      {options ? (
        <select
        value={value ?? ""}
        onChange={(event) => onChange(event.currentTarget.value)}
        className={fieldClass}
        >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        </select>
      ) : (
        <input
        value={value ?? ""}
        onChange={(event) => onChange(event.currentTarget.value)}
        inputMode={inputMode}
        className={fieldClass}
        />
      )}
    </label>
  );
}

type SkillGroupProps = {
  title: string;
  skills?: string[] | string | null;
};

function SkillGroup({ title, skills }: SkillGroupProps) {
  const skillList = Array.isArray(skills)
    ? skills
    : skills
      ? skills.split(",").map((skill) => skill.trim()).filter(Boolean)
      : [];

  return (
    <div>
      <h4 className="mb-1 text-[13px] font-medium text-[#47536e]
                     dark:text-gray-300">
        {title}
      </h4>

      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {skillList.length > 0 ? (
          skillList.map((skill, index) => (
            <span
              key={`${skill}-${index}`}
              className="text-xs text-[#576CBC] dark:text-[#9aabef]"
            >
              {skill}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </div>
    </div>
  );
}