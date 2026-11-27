"use client";

import type { ReactNode } from "react";
import { Download, FileText, X } from "lucide-react";

interface RejectedApplicant {
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
  rejectedBy?: string;
  rejectedByEmail?: string;
  rejectedReason?: string;
  InterviewRemarks?: string;
  createdBy?: string;
  supervisor?: {
    supervisorName?: string;
    supervisorEmail?: string;
  };
}

interface RejectedApplicantDetailsModalProps {
  applicant: RejectedApplicant;
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

function displayValue(value?: string | number | string[]) {
  if (Array.isArray(value)) return value.join(", ") || "—";
  return value || "—";
}

export default function RejectedApplicantDetailsModal({
  applicant,
  resumeContent,
  onClose,
}: RejectedApplicantDetailsModalProps) {
  const fullName = [applicant.candidateFirstName, applicant.candidateLastName]
    .filter(Boolean)
    .join(" ");
  const address =
    applicant.address ||
    [applicant.candidateCity, applicant.candidateCountry]
      .filter(Boolean)
      .join(", ");
  const expectedSalary = applicant.expectedSalary
    ? `${applicant.currency ?? ""}${applicant.currency ? " " : ""}${applicant.expectedSalary}`
    : "—";
  const rejectedBy =
    applicant.rejectedBy ?? applicant.createdBy ?? applicant.supervisor?.supervisorName;
  const rejectedByEmail =
    applicant.rejectedByEmail ??
    applicant.supervisor?.supervisorEmail ??
    applicant.candidateEmail;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-label="Close rejected applicant details"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="rejected-applicant-details-title"
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[92vh] w-[600px] max-w-[calc(100%-24px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-white p-3 shadow-xl dark:bg-[#343434]"
      >
        <header className="mb-2 flex shrink-0 items-center justify-between">
          <h2
            id="rejected-applicant-details-title"
            className="text-[15px] font-semibold text-[#111827] dark:text-white"
          >
            Rejected Details
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

        <div className="min-h-0 space-y-2.5 overflow-y-auto">
          <section className="rounded-lg border border-[#E5E7EB] p-2.5 dark:border-[#5F5959]">
            <h3 className="mb-3 text-[13px] font-medium text-[#10203F] dark:text-white">
              Teacher Information
            </h3>
            <dl className="grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2 md:grid-cols-3">
              {[
                ["First Name", fullName],
                ["Email", applicant.candidateEmail],
                [
                  "Mobile Number",
                  [applicant.phoneCountryCode, applicant.candidatePhoneNumber]
                    .filter(Boolean)
                    .join(" "),
                ],
                [
                  "Teaching Experience",
                  formatExperience(
                    applicant.teachingExperience ?? applicant.experience
                  ),
                ],
                ["Teaching Mode", displayValue(applicant.teachingMode)],
                ["Expected Salary", expectedSalary],
                ["Address", address || "—"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className={label === "Address" ? "md:col-span-3" : ""}
                >
                  <dt className="mb-1 text-[12px] font-medium text-[#10203F] dark:text-white">
                    {label}
                  </dt>
                  <dd className="break-words text-[11px] text-[#3D4A64] dark:text-[#D6D6D6]">
                    {displayValue(value)}
                  </dd>
                </div>
              ))}
              {resumeContent && (
                <div className="col-span-full">
                  <dt className="mb-1 text-[12px] font-medium text-[#10203F] dark:text-white">
                    Attachment
                  </dt>
                  <dd className="flex items-center justify-between rounded-lg bg-[#EEF0FA] px-3 py-2 dark:bg-[#292D3A]">
                    <span className="flex items-center gap-2 text-[12px] text-[#10203F] dark:text-white">
                      <FileText className="h-4 w-4 text-[#E95B5B]" />
                      Resume
                    </span>
                    <span className="flex items-center gap-2 text-[#91A5DC]">
                      {resumeContent}
                      <Download aria-hidden="true" className="h-4 w-4" />
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-xl border border-[#E5E7EB] p-4 dark:border-[#5F5959]">
            <h3 className="mb-5 text-[13px] font-medium text-[#10203F] dark:text-white">
              Rejection Information
            </h3>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="mb-1 text-[12px] font-medium text-[#10203F] dark:text-white">
                  Rejected By
                </dt>
                <dd className="text-[11px] text-[#3D4A64] dark:text-[#D6D6D6]">
                  {displayValue(rejectedBy)}
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-[12px] font-medium text-[#10203F] dark:text-white">
                  Email
                </dt>
                <dd className="break-words text-[11px] text-[#3D4A64] dark:text-[#D6D6D6]">
                  {displayValue(rejectedByEmail)}
                </dd>
              </div>
              <div className="col-span-full">
                <dt className="mb-1 text-[12px] font-medium text-[#10203F] dark:text-white">
                  Rejection Reason
                </dt>
                <dd className="break-words text-[11px] text-[#3D4A64] dark:text-[#D6D6D6]">
                  {displayValue(applicant.InterviewRemarks)}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </section>
    </>
  );
}
