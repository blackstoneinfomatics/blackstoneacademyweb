"use client";

import type { ReactNode } from "react";
import { Download, FileText, X } from "lucide-react";

interface ApprovedApplicant {
  candidateFirstName: string;
  candidateLastName: string;
  candidateEmail: string;
  candidatePhoneNumber: number | string;
  phoneCountryCode?: string;
  teachingExperience?: number | string;
  experience?: number | string;
  teachingMode?: string | string[];
  expectedSalary?: number | string;
  approvedSalary?: number | string;
  currency?: string;
  address?: string;
  candidateCity?: string;
  candidateCountry?: string;
  employmentType?: string;
  joiningAvailability?: string;
  assignedSubject?: string;
  position?: string;
  positionApplied?: string;
  createdBy?: string;
  approvedBy?: string;
  approvedDate?: string;
  approvedAt?: string;
  approvalRemarks?: string;
  comments?: string;
  uploadResume?: string | { type: string; data: number[] };
}

interface ApprovedApplicantDetailsModalProps {
  applicant: ApprovedApplicant;
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

export default function ApprovedApplicantDetailsModal({
  applicant,
  resumeContent,
  onClose,
}: ApprovedApplicantDetailsModalProps) {
  const fullName = [applicant.candidateFirstName, applicant.candidateLastName]
    .filter(Boolean)
    .join(" ");
  const address =
    applicant.address ||
    [applicant.candidateCity, applicant.candidateCountry]
      .filter(Boolean)
      .join(", ");
  const teachingMode = displayValue(applicant.teachingMode);
  const approvedSalary =
    applicant.approvedSalary ?? applicant.expectedSalary;
  const formattedApprovedSalary =
    approvedSalary === undefined || approvedSalary === ""
      ? "—"
      : `${applicant.currency ?? ""}${applicant.currency ? " " : ""}${approvedSalary}`;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-label="Close approved applicant details"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="approved-applicant-details-title"
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[92vh] w-[700px] max-w-[calc(100%-24px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-white p-3 shadow-xl dark:bg-[#343434]"
      >
        <header className="mb-2 flex shrink-0 items-center justify-between border-b border-[#E5E7EB] pb-2 dark:border-[#5F5959]">
          <h2
            id="approved-applicant-details-title"
            className="text-[16px] font-semibold text-[#111827] dark:text-white"
          >
            Approved Details
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
                  formatExperience(applicant.teachingExperience ?? applicant.experience),
                ],
                ["Teaching Mode", teachingMode],
                ["Expected Salary", formattedApprovedSalary],
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
            </dl>
          </section>

          <section className="rounded-lg border border-[#E5E7EB] p-2.5 dark:border-[#5F5959]">
            <h3 className="mb-3 text-[13px] font-medium text-[#10203F] dark:text-white">
              Employment Details
            </h3>
            <dl className="space-y-2">
              {[
                ["Employment Type", applicant.employmentType],
                ["Approved Salary", formattedApprovedSalary],
                ["Teaching Mode", teachingMode],
                ["Joining Type", applicant.joiningAvailability],
                [
                  "Assigned Subject",
                  applicant.assignedSubject ??
                    applicant.positionApplied ??
                    applicant.position,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 text-[12px]"
                >
                  <dt className="font-medium text-[#10203F] dark:text-white">
                    {label}
                  </dt>
                  <dd className="text-right text-[11px] text-[#3D4A64] dark:text-[#D6D6D6]">
                    {displayValue(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-lg border border-[#E5E7EB] p-2.5 dark:border-[#5F5959]">
            <h3 className="mb-3 text-[13px] font-medium text-[#10203F] dark:text-white">
              Approval Information
            </h3>
            <dl className="grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2 md:grid-cols-3">
              {[
                ["Approved By", applicant.approvedBy ?? applicant.createdBy],
                ["Approval Date", formatDate(applicant.approvedAt)],
                ["Approval Remarks", applicant.approvalRemarks ?? applicant.comments],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className={label === "Approval Remarks" ? "md:col-span-1" : ""}
                >
                  <dt className="mb-1 text-[12px] font-medium text-[#10203F] dark:text-white">
                    {label}
                  </dt>
                  <dd className="break-words text-[11px] text-[#3D4A64] dark:text-[#D6D6D6]">
                    {displayValue(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </section>
    </>
  );
}
