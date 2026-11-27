"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Clock3, FileText, Mail, Phone } from "lucide-react";
import { IoPerson } from "react-icons/io5";


export type ScheduledApplicantUpdate = {
  employmentType: string;
  availableWorkingDays: string[];
  preferedWorkingHours: string;
  salaryType: string;
  expectedSalary: number;
  currentSalary?: number;
  joiningAvailability: string;
  comments: string;
  applicationStatus: "SHORTLISTED" | "REJECTED" | "WAITING";
};

interface ScheduledApplicant {
  _id: string;
  candidateFirstName: string;
  candidateLastName: string;
  candidateEmail: string;
  candidatePhoneNumber: number | string;
  phoneCountryCode?: string;
  applicationDate?: string;
  createdDate?: string;
  position: string;
  applicationStatus?: string;
  teachingExperience?: number | string;
  previousInstitutionName?: string;
  previousDesignation?: string;
  experience?: number | string;
  currentSalary?: number | string;
  expectedSalary?: number | string;
  employmentType?: string;
  availableWorkingDays?: string[] | string;
  preferedWorkingDays?: string;
  preferedWorkingHours?: string;
  salaryType?: string;
  joiningAvailability?: string;
  comments?: string;
  technicalSkills?: string[];
  teachingSkills?: string[];
  languages?: string[];
  skills?: string;
  currency?: string;
  uploadResume?: string | { type: string; data: number[] };
  interviewSchedule?: {
    interviewDate?: string;
  };
}

interface EditScheduledApplicantFormProps {
  applicant: ScheduledApplicant;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ScheduledApplicantUpdate) => void;
  resumeContent?: ReactNode;
}

const dayOptions = [
  { label: "Monday-Friday", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] },
  { label: "Monday-Saturday", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] },
  { label: "Monday-Sunday", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
];

const fieldClassName =
  "mt-1 h-[31px] w-full rounded-[4px] border border-[#DDE2EC] bg-white px-2 text-[10px] text-[#5D6680] outline-none focus:border-[#5B6FC4] dark:border-[#5F5959] dark:bg-[#343434] dark:text-white";

function normalizeDays(value?: string[] | string, legacyValue?: string) {
  if (Array.isArray(value)) return value;
  const raw = value || legacyValue;
  if (!raw) return [];
  return raw.split(/[,;]|\s+-\s+/).map((day) => day.trim()).filter(Boolean);
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }).toUpperCase();
}

function statusLabel(status?: string) {
  if (!status) return "New Application";
  return status
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function EditScheduledApplicantForm({
  applicant,
  isSubmitting,
  onClose,
  onSubmit,
  resumeContent,
}: EditScheduledApplicantFormProps) {
  const initialDays = normalizeDays(
    applicant.availableWorkingDays,
    applicant.preferedWorkingDays
  );
  const matchingPreset = dayOptions.find(
    (option) =>
      option.days.length === initialDays.length &&
      option.days.every((day) => initialDays.includes(day))
  );
  const initialDayValue =
    matchingPreset?.label ?? (initialDays.length ? `custom:${initialDays.join(",")}` : "");

  const [employmentType, setEmploymentType] = useState(
    applicant.employmentType ?? ""
  );
  const [daySelection, setDaySelection] = useState(initialDayValue);
  const [availableWorkingDays, setAvailableWorkingDays] = useState(initialDays);
  const [preferredWorkingHours, setPreferredWorkingHours] = useState(
    applicant.preferedWorkingHours ?? ""
  );
  const [salaryType, setSalaryType] = useState(applicant.salaryType ?? "Monthly");
  const [expectedSalary, setExpectedSalary] = useState(
    String(applicant.expectedSalary ?? "")
  );
  const [currentSalary, setCurrentSalary] = useState(
    String(applicant.currentSalary ?? "")
  );
  const [joiningAvailability, setJoiningAvailability] = useState(
    applicant.joiningAvailability ?? ""
  );
  const [comments, setComments] = useState(applicant.comments ?? "");
  const [applicationStatus, setApplicationStatus] =
    useState<ScheduledApplicantUpdate["applicationStatus"]>(
      applicant.applicationStatus === "REJECTED" ||
        applicant.applicationStatus === "WAITING"
        ? applicant.applicationStatus
        : "SHORTLISTED"
    );
  const [validationMessage, setValidationMessage] = useState("");

  const handleDayChange = (value: string) => {
    setDaySelection(value);
    setValidationMessage("");
    const preset = dayOptions.find((option) => option.label === value);
    if (preset) {
      setAvailableWorkingDays(preset.days);
    } else if (value.startsWith("custom:")) {
      setAvailableWorkingDays(value.slice("custom:".length).split(","));
    } else {
      setAvailableWorkingDays([]);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (availableWorkingDays.length === 0) {
      setValidationMessage("Select preferred working days.");
      return;
    }

    onSubmit({
      employmentType,
      availableWorkingDays,
      preferedWorkingHours: preferredWorkingHours.trim(),
      salaryType,
      expectedSalary: Number(expectedSalary),
      ...(currentSalary.trim()
        ? { currentSalary: Number(currentSalary) }
        : {}),
      joiningAvailability: joiningAvailability.trim(),
      comments: comments.trim(),
      applicationStatus,
    });
  };

  const skills = [
    ...(applicant.technicalSkills ?? []),
    ...(applicant.teachingSkills ?? []),
    ...(applicant.languages ?? []),
    ...(applicant.skills ? applicant.skills.split(",").map((skill) => skill.trim()) : []),
  ].filter((skill, index, list) => skill && list.indexOf(skill) === index);
  const applicationDate = formatDate(applicant.applicationDate ?? applicant.createdDate);
  const currencySymbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "$",
    AUD: "$",
  };
  const currencySymbol =
    currencySymbols[applicant.currency?.toUpperCase() ?? ""] ||
    applicant.currency ||
    "$";

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-label="Close applicant editor"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="scheduled-applicant-edit-title"
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[92vh] w-[760px] max-w-[calc(100%-20px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-white p-3 shadow-xl dark:bg-[#343434]"
      >
        <header className="mb-3 flex shrink-0 items-center justify-between">
          <h2
            id="scheduled-applicant-edit-title"
            className="text-sm font-semibold text-[#0A1737] dark:text-white"
          >
            Interview Evaluation
          </h2>
          <span className="mr-3 text-[12px] font-medium text-[#40BD5F]">
            {statusLabel(applicant.applicationStatus)}
          </span>
        </header>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto md:grid-cols-[260px_minmax(0,1fr)] md:overflow-hidden">
            <aside className="flex border border-[#E1E5EE] p-2 rounded-lg min-h-0 flex-col gap-2 md:overflow-y-auto">
              <section className="flex items-center gap-2 rounded-lg p-2 dark:border-[#5F5959]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDF0FA] text-[#5B6FC4]">
                  <IoPerson className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-[#0A1737] dark:text-white">
                    {applicant.candidateFirstName} {applicant.candidateLastName}
                  </h3>
                  <p className="text-[9px] text-[#34415F] dark:text-[#D6D6D6]">
                    Applied for{" "}
                    <span className="text-[#D28F35]">{applicant.position}</span>
                  </p>
                </div>
              </section>

              <section className="rounded-lg border border-[#E1E5EE] p-3 dark:border-[#5F5959]">
                <h3 className="mb-2 text-[11px] font-semibold text-[#0A1737] dark:text-white">
                  Personal details
                </h3>
                <dl className="space-y-2 text-[9px]">
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#34415F] dark:text-[#D6D6D6]">FULL NAME</dt>
                    <dd className="text-right text-[#17243E] dark:text-white">
                      {applicant.candidateFirstName} {applicant.candidateLastName}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="flex shrink-0 items-center gap-1 text-[#34415F] dark:text-[#D6D6D6]">
                      <Mail className="h-3 w-3" /> E-MAIL
                    </dt>
                    <dd className="break-all text-right text-[#17243E] dark:text-white">
                      {applicant.candidateEmail || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="flex shrink-0 items-center gap-1 text-[#34415F] dark:text-[#D6D6D6]">
                      <Phone className="h-3 w-3" /> PHONE
                    </dt>
                    <dd className="text-right text-[#17243E] dark:text-white">
                      {[applicant.phoneCountryCode, applicant.candidatePhoneNumber]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#34415F] dark:text-[#D6D6D6]">APPLIED</dt>
                    <dd className="text-right text-[#17243E] dark:text-white">
                      {applicationDate}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="min-h-0 rounded-lg border border-[#E1E5EE] p-3 dark:border-[#5F5959]">
                <h3 className="mb-2 text-[11px] font-semibold text-[#0A1737] dark:text-white">
                  Experience
                </h3>
                <dl className="space-y-2 text-[9px]">
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#010e30] dark:text-[#D6D6D6]">
                      Total Teaching Experience
                    </dt>
                    <dd className="text-right text-[#17243E] dark:text-white">
                      {applicant.teachingExperience ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#010e30] dark:text-[#D6D6D6]">
                      Previous Institution Name
                    </dt>
                    <dd className="break-all text-right text-[#17243E] dark:text-white">
                      {applicant.previousInstitutionName || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#010e30] dark:text-[#D6D6D6]">
                      Previous Designation
                    </dt>
                    <dd className="break-all text-right text-[#17243E] dark:text-white">
                      {applicant.previousDesignation || "—"}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-lg border border-[#E1E5EE] p-3 dark:border-[#5F5959]">
                <h3 className="mb-2 text-[11px] font-semibold text-[#0A1737] dark:text-white">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-[#34415F] dark:text-[#D6D6D6]">
                  {skills.length ? (
                    skills.map((skill, index) => <span key={`${skill}-${index}`}>{skill}</span>)
                  ) : (
                    <span>—</span>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-[#E1E5EE] p-3 dark:border-[#5F5959]">
                <h3 className="mb-2 text-[11px] font-semibold text-[#0A1737] dark:text-white">
                  Documents
                </h3>
                {applicant.uploadResume ? (
                  resumeContent ?? (
                    <span className="flex items-center gap-1 text-[9px] text-[#38619A]">
                      <FileText className="h-3 w-3" /> Resume
                    </span>
                  )
                ) : (
                  <span className="text-[9px] text-[#888]">No resume uploaded</span>
                )}
              </section>
            </aside>

            <div className="flex min-h-0 flex-col gap-2 md:overflow-y-auto">
              <div className="flex h-9 shrink-0 items-center justify-center rounded-full border-[3px] border-r-[8px] border-l-[8px] border-[#EDF0F8] text-[10px] font-medium text-[#5B6FC4]">
                Employment &amp; Salary Details
              </div>

              <section className="rounded-lg border border-[#E1E5EE] p-3 dark:border-[#5F5959]">
                <h3 className="mb-3 text-[11px] font-semibold text-[#0A1737] dark:text-white">
                  Employment &amp; Salary Details
                </h3>
                <div className="grid grid-cols-1 gap-x-2 gap-y-2 sm:grid-cols-2">
                  <label className="text-[9px] font-medium text-[#0A1737] dark:text-white">
                    Employment Type
                    <select
                      required
                      value={employmentType}
                      onChange={(event) => setEmploymentType(event.target.value)}
                      className={fieldClassName}
                    >
                      <option value="">Select type</option>
                      <option value="hour">Hour</option>
                      <option value="hourly">Hour</option>
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </label>

                  <label className="text-[9px] font-medium text-[#0A1737] dark:text-white">
                    Preferred Working Days
                    <select
                      required
                      value={daySelection}
                      onChange={(event) => handleDayChange(event.target.value)}
                      className={fieldClassName}
                    >
                      <option value="">Select working days</option>
                      {dayOptions.map((option) => (
                        <option key={option.label} value={option.label}>
                          {option.label}
                        </option>
                      ))}
                      {daySelection.startsWith("custom:") && (
                        <option value={daySelection}>
                          {daySelection.slice("custom:".length).replace(/,/g, ", ")}
                        </option>
                      )}
                    </select>
                  </label>

                  <label className="text-[9px] font-medium text-[#0A1737] dark:text-white">
                    Preferred Working Hours
                    <span className="relative block">
                      <input
                        required
                        value={preferredWorkingHours}
                        onChange={(event) =>
                          setPreferredWorkingHours(event.target.value)
                        }
                        placeholder="9AM - 3PM"
                        className={`${fieldClassName} pr-7`}
                      />
                      <Clock3 className="absolute right-2 top-[9px] h-3 w-3 text-[#667085]" />
                    </span>
                  </label>

                  <label className="text-[9px] font-medium text-[#0A1737] dark:text-white">
                    Salary Type
                    <select
                      value={salaryType}
                      onChange={(event) => setSalaryType(event.target.value)}
                      className={fieldClassName}
                    >
                      <option>Monthly</option>
                      <option>Hourly</option>
                      <option>Yearly</option>
                    </select>
                  </label>

                  <label className="text-[9px] font-medium text-[#0A1737] dark:text-white">
                    Expected Salary
                    <span className="relative block">
                      <span className="absolute left-2 top-[8px] text-[10px] text-[#667085]">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        required
                        value={expectedSalary}
                        onChange={(event) => setExpectedSalary(event.target.value)}
                        className={`${fieldClassName} pl-6`}
                      />
                    </span>
                  </label>

                  <label className="text-[9px] font-medium text-[#0A1737] dark:text-white">
                    Fixed Salary
                    <span className="relative block">
                      <span className="absolute left-2 top-[8px] text-[10px] text-[#667085]">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={currentSalary}
                        onChange={(event) => setCurrentSalary(event.target.value)}
                        className={`${fieldClassName} pl-6`}
                      />
                    </span>
                  </label>

                  <label className="text-[9px] font-medium text-[#0A1737] dark:text-white sm:col-span-2">
                    Joining Availability
                    <input
                      required
                      value={joiningAvailability}
                      onChange={(event) =>
                        setJoiningAvailability(event.target.value)
                      }
                      placeholder="Immediate"
                      className={fieldClassName}
                    />
                  </label>
                  <label className="text-[9px] font-medium text-[#0A1737] dark:text-white sm:col-span-2">
                    Interview Remarks
                    <textarea
                      value={comments}
                      onChange={(event) => setComments(event.target.value)}
                      className="mt-1 min-h-[96px] w-full resize-y rounded-[4px] border border-[#DDE2EC] bg-white p-2 text-[10px] text-[#5D6680] outline-none focus:border-[#5B6FC4] dark:border-[#5F5959] dark:bg-[#343434] dark:text-white"
                    />
                  </label>
                </div>
                {validationMessage && (
                  <p className="mt-2 text-[10px] text-red-600" role="alert">
                    {validationMessage}
                  </p>
                )}
              </section>

              <fieldset className="rounded-lg border border-[#E1E5EE] p-3 dark:border-[#5F5959]">
                <legend className="px-1 text-[11px] font-semibold text-[#0A1737] dark:text-white">
                  Action
                </legend>
                <div className="space-y-2">
                  {(["SHORTLISTED", "REJECTED", "WAITING"] as const).map(
                    (status) => (
                      <label
                        key={status}
                        className="flex items-center gap-2 text-[9px] text-[#5D6680] dark:text-[#D6D6D6]"
                      >
                        <input
                          type="radio"
                          name="applicationStatus"
                          value={status}
                          checked={applicationStatus === status}
                          onChange={() => setApplicationStatus(status)}
                          className="h-3 w-3 accent-[#5B6FC4]"
                        />
                        {status[0] + status.slice(1).toLowerCase()}
                      </label>
                    )
                  )}
                </div>
              </fieldset>
            </div>
          </div>

          <footer className="mt-2 flex shrink-0 justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-w-[60px] rounded-md border border-[#5B6FC4] bg-[#F0F2FB] px-3 py-1.5 text-[10px] font-semibold text-[#5B6FC4] dark:bg-[#292D3A]"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[70px] rounded-md bg-[#5B6FC4] px-3 py-1.5 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Submit"}
            </button>
          </footer>
        </form>
      </section>
    </>
  );
}
