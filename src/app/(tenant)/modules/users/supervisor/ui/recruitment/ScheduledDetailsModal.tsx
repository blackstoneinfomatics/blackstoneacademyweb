"use client";

import type { ReactNode } from "react";
import { Download, FileText, X } from "lucide-react";

interface ScheduledDetailsApplicant {
  candidateFirstName: string;
  candidateLastName: string;
  candidateEmail: string;
  candidatePhoneNumber: number | string;
  phoneCountryCode?: string;
  highestQualification?: string;
  specialization?: string;
  teachingExperience?: number | string;
  experience?: number | string;
  previousInstitutionName?: string;
  teachingMode?: string | string[];
  expectedSalary?: number | string;
  currency?: string;
  address?: string;
  candidateCity?: string;
  candidateCountry?: string;
  interviewDate?: string;
  interviewScheduledDate?: string;
  scheduledDate?: string;
  interviewTime?: string;
  time?: string;
  interviewMode?: string;
  platform?: string;
  interviewLink?: string;
  interviewmeetinglink?: string;
  link?: string;
  interviewSchedule?: {
    interviewDate?: string;
    interviewTime?: string;
    interviewMode?: string;
    interviewPlatform?: string;
    interviewmeetinglink?: string;
    createdAt?: string;
  };
}

interface ScheduledDetailsModalProps {
  applicant: ScheduledDetailsApplicant;
  resumeContent?: ReactNode;
  onClose: () => void;
}

function displayValue(value?: string | number | string[]) {
  if (Array.isArray(value)) return value.join(", ") || "—";
  return value || "—";
}

function getMeetingHref(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(
      /^https?:\/\//i.test(value) ? value : `https://${value}`
    );
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
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

function DetailSection({
  title,
  fields,
  children,
}: {
  title: string;
  fields: Array<[string, ReactNode]>;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#E5E7EB] p-3 dark:border-[#5F5959]">
      <h3 className="mb-3 text-[14px] font-medium text-[#10203F] dark:text-white">
        {title}
      </h3>
      <dl className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2 md:grid-cols-3">
        {fields.map(([label, value]) => (
          <div
            key={label}
            className={label === "Address" ? "md:col-span-3" : ""}
          >
            <dt className="mb-1 text-[13px] font-medium text-[#10203F] dark:text-white">
              {label}
            </dt>
            <dd className="break-words text-[11px] text-[#3D4A64] dark:text-[#D6D6D6]">
              {typeof value === "string" || typeof value === "number"
                ? value || "—"
                : value ?? "—"}
            </dd>
          </div>
        ))}
        {children}
      </dl>
    </section>
  );
}

export default function ScheduledDetailsModal({
  applicant,
  resumeContent,
  onClose,
}: ScheduledDetailsModalProps) {
  const schedule = applicant.interviewSchedule;
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
    : undefined;
  const interviewDate =
    schedule?.interviewDate ??
    applicant.interviewDate ??
    applicant.interviewScheduledDate ??
    applicant.scheduledDate;
  const scheduledDate =
    schedule?.createdAt ??
    applicant.scheduledDate ??
    applicant.interviewScheduledDate;
  const meetingLink =
    schedule?.interviewmeetinglink ??
    applicant.interviewmeetinglink ??
    applicant.interviewLink ??
    applicant.link;
  const meetingHref = getMeetingHref(meetingLink);

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-label="Close scheduled details"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="scheduled-details-title"
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[92vh] w-[700px] max-w-[calc(100%-24px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-white p-3 shadow-xl dark:bg-[#343434]"
      >
        <header className="mb-2 flex shrink-0 items-center justify-between border-b border-[#E5E7EB] pb-2 dark:border-[#5F5959]">
          <h2
            id="scheduled-details-title"
            className="text-[16px] font-semibold text-[#111827] dark:text-white"
          >
            Scheduled Details
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

        <div className="min-h-0 space-y-3 overflow-y-auto pr-0.5">
          <DetailSection
            title="Teacher Information"
            fields={[
              ["First Name", fullName],
              ["Email", applicant.candidateEmail],
              [
                "Mobile Number",
                [applicant.phoneCountryCode, applicant.candidatePhoneNumber]
                  .filter(Boolean)
                  .join(" "),
              ],
              ["Qualification", applicant.highestQualification],
              ["Specialization", applicant.specialization],
              [
                "Teaching Experience",
                formatExperience(
                  applicant.teachingExperience ?? applicant.experience
                ),
              ],
              ["Previous Institution", applicant.previousInstitutionName],
              ["Teaching Mode", displayValue(applicant.teachingMode)],
              ["Expected Salary", expectedSalary],
              ["Address", address],
            ]}
          >
            <div className="col-span-full">
              <dt className="mb-1 text-[13px] font-medium text-[#10203F] dark:text-white">
                Attachment
              </dt>
              {resumeContent ? (
                <div className="flex items-center justify-between rounded-lg bg-[#EEF0FA] px-3 py-2 dark:bg-[#292D3A]">
                  <span className="flex items-center gap-2 text-[10px] text-[#10203F] dark:text-white">
                    <FileText className="h-5 w-5 text-[#E95B5B]" />
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
          </DetailSection>

          <DetailSection
            title="Interview Schedule Details"
            fields={[
              ["Interview Date", formatDate(interviewDate)],
              [
                "Interview Mode",
                schedule?.interviewMode ?? applicant.interviewMode,
              ],
              ["Scheduled Date", formatDate(scheduledDate)],
              [
                "Interview Time",
                schedule?.interviewTime ??
                  applicant.interviewTime ??
                  applicant.time,
              ],
              [
                "Platform",
                schedule?.interviewPlatform ?? applicant.platform,
              ],
              [
                "Meeting Link",
                meetingHref ? (
                  <a
                    href={meetingHref}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-[#5268BB] underline hover:text-[#3D4A9A]"
                  >
                    {meetingLink}
                  </a>
                ) : (
                  meetingLink
                ),
              ],
            ]}
          />
        </div>
      </section>
    </>
  );
}
