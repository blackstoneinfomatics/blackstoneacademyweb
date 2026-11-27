"use client";

import type { ReactNode } from "react";
import { Download, FileText, X } from "lucide-react";

interface ShortlistedApplicantDetails {
  candidateFirstName: string;
  candidateLastName: string;
  candidateEmail: string;
  candidatePhoneNumber: number | string;
  phoneCountryCode?: string;
  teachingExperience?: number | string;
  experience?: number | string;
  teachingMode?: string | string[];
  expectedSalary?: number | string;
  currency?: string;
  address?: string;
  candidateCity?: string;
  candidateCountry?: string;
  employmentType?: string;
  availableWorkingDays?: string[];
  preferedWorkingDays?: string;
  preferedWorkingHours?: string;
  salaryType?: string;
  interviewSchedule?: {
    interviewPlatform?: string;
  };
  platform?: string;
  InterviewRemarks?: string;
  shortlistedBy?: string;
  createdBy?: string;
  shortlistedDate?: string;
  shortlistedAt?: string;
  applicationStatus?: string;
}

interface ShortlistedApplicantDetailsModalProps {
  applicant: ShortlistedApplicantDetails;
  resumeContent?: ReactNode;
  onClose: () => void;
}

function formatExperience(value?: number | string) {
  if (value === undefined || value === null || value === "") return "—";
  const numericValue = Number(value);
  if (!Number.isNaN(numericValue)) {
    return `${numericValue} ${numericValue === 1 ? "Year" : "Years"}`;
  }
  return value;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function displayValue(value?: string | number | string[]) {
  if (Array.isArray(value)) return value.join(", ") || "—";
  return value || "—";
}

function formatStatus(status?: string) {
  if (!status) return "—";
  return status
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ShortlistedApplicantDetailsModal({
  applicant,
  resumeContent,
  onClose,
}: ShortlistedApplicantDetailsModalProps) {
  const fullName = [applicant.candidateFirstName, applicant.candidateLastName]
    .filter(Boolean)
    .join(" ");
  const address =
    applicant.address ||
    [applicant.candidateCity, applicant.candidateCountry]
      .filter(Boolean)
      .join(", ");
  const preferredDays =
    applicant.preferedWorkingDays ||
    applicant.availableWorkingDays?.join(", ");
  const expectedSalary = applicant.expectedSalary
    ? `${applicant.currency ?? ""}${applicant.currency ? " " : ""}${applicant.expectedSalary}`
    : "—";
  const teachingMode = displayValue(applicant.teachingMode);
  const platform =
    applicant.platform ?? applicant.interviewSchedule?.interviewPlatform;
  const sections = [
    {
      title: "Teacher Information",
      fields: [
        ["First Name", fullName || "—"],
        ["Email", applicant.candidateEmail],
        [
          "Mobile Number",
          [applicant.phoneCountryCode, applicant.candidatePhoneNumber]
            .filter(Boolean)
            .join(" "),
        ],
        [
          "Teaching Experience",
          formatExperience(applicant.teachingExperience ?? applicant.experience),
        ],
        ["Teaching Mode", teachingMode],
        ["Expected Salary", expectedSalary],
        ["Address", address || "—"],
      ],
    },
    {
      title: "Employment & Salary Details",
      fields: [
        ["Employment Type", applicant.employmentType],
        ["Preferred Working Days", preferredDays],
        ["Preferred Working Hours", applicant.preferedWorkingHours],
        ["Salary Type", applicant.salaryType],
        ["Fixed Salary", expectedSalary],
        ["Platform", platform],
        ["Interview Remarks", applicant.InterviewRemarks],
      ],
    },
    {
      title: "Shortlisting Information",
      fields: [
        [
          "Shortlisted By",
          applicant.shortlistedBy ?? applicant.createdBy,
        ],
        [
          "Shortlisted Date",
          formatDate(applicant.shortlistedAt ?? applicant.shortlistedDate),
        ],
        ["Final Decision", formatStatus(applicant.applicationStatus)],
      ],
    },
  ];

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-label="Close scheduled applicant details"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="scheduled-applicant-details-title"
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[92vh] w-[700px] max-w-[calc(100%-24px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-white p-3 shadow-xl dark:bg-[#343434]"
      >
        <header className="mb-2 flex shrink-0 items-center justify-between border-b border-[#E5E7EB] pb-2 dark:border-[#5F5959]">
          <h2
            id="scheduled-applicant-details-title"
            className="text-[16px] font-semibold text-[#111827] dark:text-white"
          >
            Shortlisting Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full text-[#9A9A9A] hover:text-[#17243E] dark:hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 space-y-2.5 overflow-y-auto pr-0.5">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-lg border border-[#E5E7EB] p-2.5 dark:border-[#5F5959]"
            >
              <h3 className="mb-3 text-[13px] font-medium text-[#10203F] dark:text-white">
                {section.title}
              </h3>
              <dl className="grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2 md:grid-cols-3">
                {section.fields.map(([label, value]) => (
                  <div
                    key={label}
                    className={
                      label === "Interview Remarks"
                        ? "col-span-full"
                        : label === "Address"
                          ? "md:col-span-3"
                          : ""
                    }
                  >
                    <dt className="mb-1 text-[12px] font-medium text-[#10203F] dark:text-white">
                      {label}
                    </dt>
                    <dd
                      className={`break-words text-[11px] ${
                        label === "Final Decision" &&
                        String(value).toUpperCase() === "SHORTLISTED"
                          ? "text-[#40BD5F]"
                          : "text-[#3D4A64] dark:text-[#D6D6D6]"
                      }`}
                    >
                      {displayValue(value)}
                    </dd>
                  </div>
                ))}
                {section.title === "Teacher Information" && (
                  <div className="col-span-full">
                    <dt className="mb-1 text-[12px] font-medium text-[#10203F] dark:text-white">
                      Attachment
                    </dt>
                    {resumeContent ? (
                      <div className="flex items-center justify-between rounded-lg bg-[#EEF0FA] px-3 py-2 dark:bg-[#292D3A]">
                        <span className="flex items-center gap-2 text-[10px] text-[#10203F] dark:text-white">
                          <FileText className="h-4 w-4 text-[#E95B5B]" />
                          Resume
                        </span>
                        <div className="flex items-center gap-2 text-[#91A5DC]">
                          {resumeContent}
                          <Download aria-hidden="true" className="h-4 w-4" />
                        </div>
                      </div>
                    ) : (
                      <dd className="text-[11px] text-[#3D4A64] dark:text-[#D6D6D6]">
                        No attachment provided
                      </dd>
                    )}
                  </div>
                )}
              </dl>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
