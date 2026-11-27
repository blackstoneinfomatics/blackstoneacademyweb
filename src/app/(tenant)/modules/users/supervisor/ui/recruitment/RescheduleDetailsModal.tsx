"use client";

import { FileText, X } from "lucide-react";

interface RescheduleScheduleDetails {
  interviewDate?: string;
  interviewTime?: string;
  interviewMode?: string;
  interviewPlatform?: string;
  interviewmeetinglink?: string;
  previousInterviewDate?: string;
  previousInterviewTime?: string;
  previousInterviewMode?: string;
  previousInterviewPlatform?: string;
  rescheduledBy?: string;
  rescheduledAt?: string;
  rescheduledReason?: string;
  updatedAt?: string;
}

interface RescheduleDetailsApplicant {
  candidateFirstName?: string;
  candidateLastName?: string;
  candidateEmail?: string;
  candidatePhoneNumber?: number | string;
  phoneCountryCode?: string;
  teachingExperience?: number | string;
  experience?: number | string;
  teachingMode?: string | string[];
  expectedSalary?: number | string;
  currency?: string;
  address?: string;
  candidateCity?: string;
  candidateCountry?: string;
  uploadResume?: string | { type: string; data: number[] };
  interviewSchedule?: RescheduleScheduleDetails;
  interviewDate?: string;
  interviewTime?: string;
  interviewMode?: string;
  interviewPlatform?: string;
  interviewmeetinglink?: string;
  previousInterviewDate?: string;
  previousInterviewTime?: string;
  previousInterviewMode?: string;
  previousInterviewPlatform?: string;
  rescheduledBy?: string;
  rescheduledAt?: string;
  rescheduledDate?: string;
  rescheduledReason?: string;
}

interface RescheduleDetailsModalProps {
  applicant: RescheduleDetailsApplicant;
  resumeUrl?: string | null;
  onClose: () => void;
}

function display(value?: string | number | null) {
  return value == null || value === "" ? "—" : String(value);
}

function formatDate(value?: string) {
  if (!value) return "—";
  const dateOnly = value.slice(0, 10);
  const date = new Date(`${dateOnly}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function formatTeachingExperience(value?: number | string) {
  if (value == null || value === "") return "—";
  const years = Number(value);
  if (!Number.isFinite(years)) return String(value);
  const wholeYears = Math.floor(years);
  const months = Math.round((years - wholeYears) * 12);
  const normalizedYears = wholeYears + Math.floor(months / 12);
  const normalizedMonths = months % 12;
  return [
    normalizedYears > 0
      ? `${normalizedYears} Year${normalizedYears === 1 ? "" : "s"}`
      : "",
    normalizedMonths > 0
      ? `${normalizedMonths} Month${normalizedMonths === 1 ? "" : "s"}`
      : "",
  ]
    .filter(Boolean)
    .join(" ") || "0 Years";
}

function formatSalary(value?: number | string, currency?: string) {
  if (value == null || value === "") return "—";
  const symbolByCurrency: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "$",
    AUD: "$",
  };
  const currencyCode = currency?.toUpperCase();
  const symbol = symbolByCurrency[currencyCode ?? ""] ?? currency ?? "";
  const amount = Number(value);
  return `${symbol}${Number.isFinite(amount) ? amount.toLocaleString() : value}`;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[13px] font-medium text-[#14203D] dark:text-white">
        {label}
      </dt>
      <dd className="mt-1 break-words text-[11px] text-[#52607A] dark:text-[#D6D6D6]">
        {value}
      </dd>
    </div>
  );
}

export default function RescheduleDetailsModal({
  applicant,
  resumeUrl,
  onClose,
}: RescheduleDetailsModalProps) {
  const schedule = applicant.interviewSchedule;
  const address =
    applicant.address ||
    [applicant.candidateCity, applicant.candidateCountry]
      .filter(Boolean)
      .join(", ");
  const teachingMode = Array.isArray(applicant.teachingMode)
    ? applicant.teachingMode.join(", ")
    : applicant.teachingMode;
  const previousDate =
    schedule?.previousInterviewDate ?? applicant.previousInterviewDate;
  const previousTime =
    schedule?.previousInterviewTime ?? applicant.previousInterviewTime;
  const previousMode =
    schedule?.previousInterviewMode ?? applicant.previousInterviewMode;
  const previousPlatform =
    schedule?.previousInterviewPlatform ?? applicant.previousInterviewPlatform;
  const rescheduledDate =
    schedule?.interviewDate ??
    applicant.interviewDate ??
    applicant.rescheduledDate;
  const rescheduledTime =
    schedule?.interviewTime ?? applicant.interviewTime;
  const rescheduledMode =
    schedule?.interviewMode ?? applicant.interviewMode;
  const platform =
    schedule?.interviewPlatform ?? applicant.interviewPlatform;
  const meetingLink =
    schedule?.interviewmeetinglink ?? applicant.interviewmeetinglink;
  const rescheduledBy =
    schedule?.rescheduledBy ?? applicant.rescheduledBy;
  const rescheduledAt =
    schedule?.rescheduledAt ??
    applicant.rescheduledAt ??
    schedule?.updatedAt;
  const reason =
    schedule?.rescheduledReason ?? applicant.rescheduledReason;
  const hasAttachment = Boolean(applicant.uploadResume);

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-label="Close reschedule details"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="reschedule-details-title"
        className="fixed left-1/2 top-1/2 z-50 max-h-[86vh] w-[760px] max-w-[calc(100%-24px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-3 shadow-xl dark:bg-[#343434]"
      >
        <header className="mb-2 flex items-center justify-between">
          <h2
            id="reschedule-details-title"
            className="text-[14px] font-semibold text-[#111827] dark:text-white"
          >
            Reschedule Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full text-[#8A8A8A] hover:text-[#17243E] dark:hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <section className="rounded-lg border border-[#E5E7EB] p-2.5 dark:border-[#5F5959]">
          <h3 className="mb-2 text-[12px] font-medium text-[#14203D] dark:text-white">
            Teacher Information
          </h3>
          <dl className="grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-3">
            <Detail label="First Name" value={display(applicant.candidateFirstName)} />
            <Detail label="Email" value={display(applicant.candidateEmail)} />
            <Detail
              label="Mobile Number"
              value={display(
                [applicant.phoneCountryCode, applicant.candidatePhoneNumber]
                  .filter(Boolean)
                  .join(" ")
              )}
            />
            <Detail
              label="Teaching Experience"
              value={formatTeachingExperience(
                applicant.teachingExperience ?? applicant.experience
              )}
            />
            <Detail label="Teaching Mode" value={display(teachingMode)} />
            <Detail
              label="Expected Salary"
              value={formatSalary(applicant.expectedSalary, applicant.currency)}
            />
            <Detail label="Address" value={display(address)} />
            <div className="sm:col-span-3">
              <dt className="mb-1.5 text-[12px] font-medium text-[#14203D] dark:text-white">
                Attachment
              </dt>
              {hasAttachment ? (
                <div className="flex items-center justify-between gap-3 rounded-lg bg-[#EDF0FA] px-3 py-2 dark:bg-[#292D3A]">
                  <span className="flex items-center gap-2 text-[10px] text-[#34415F] dark:text-white">
                    <FileText className="h-3.5 w-3.5 text-[#E95B5B]" />
                    Resume
                  </span>
                  {resumeUrl ? (
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      aria-label="Download resume"
                      className="text-[12px] font-medium text-[#5268BB] hover:underline"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="text-[10px] text-[#778196]">
                      Loading attachment…
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-[#778196]">
                  No attachment provided
                </p>
              )}
            </div>
          </dl>
        </section>

        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
          <section className="rounded-lg border border-[#E5E7EB] p-2.5 dark:border-[#5F5959]">
            <h3 className="mb-2 text-[12px] font-medium text-[#14203D] dark:text-white">
              Previous Interview Schedule
            </h3>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
              <Detail label="Interview Date" value={formatDate(previousDate)} />
              <Detail label="Interview Time" value={display(previousTime)} />
              <Detail label="Interview Mode" value={display(previousMode)} />
              <Detail label="Platform" value={display(previousPlatform)} />
            </dl>
          </section>

          <section className="rounded-lg border border-[#E5E7EB] p-2.5 dark:border-[#5F5959]">
            <h3 className="mb-2 text-[12px] font-medium text-[#14203D] dark:text-white">
              Rescheduled Interview Details
            </h3>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
              <Detail label="Interview Date" value={formatDate(rescheduledDate)} />
              <Detail label="Interview Time" value={display(rescheduledTime)} />
              <Detail label="Interview Mode" value={display(rescheduledMode)} />
              <Detail label="Platform" value={display(platform)} />
              <div className="col-span-2 min-w-0">
                <dt className="text-[12px] font-medium text-[#14203D] dark:text-white">
                  Meeting Link
                </dt>
                {meetingLink ? (
                  <dd className="mt-1 break-all text-[11px] text-[#5268BB]">
                    <a href={meetingLink} target="_blank" rel="noreferrer">
                      {meetingLink}
                    </a>
                  </dd>
                ) : (
                  <dd className="mt-1 text-[11px] text-[#52607A] dark:text-[#D6D6D6]">
                    —
                  </dd>
                )}
              </div>
            </dl>
          </section>
        </div>

        <section className="mt-2 rounded-lg border border-[#E5E7EB] p-2.5 dark:border-[#5F5959]">
          <h3 className="mb-2 text-[12px] font-medium text-[#14203D] dark:text-white">
            Reschedule Information
          </h3>
          <dl className="grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-3">
            <Detail label="Rescheduled By" value={display(rescheduledBy)} />
            <Detail label="Rescheduled Date" value={formatDate(rescheduledAt)} />
            <Detail label="Reschedule Reason" value={display(reason)} />
          </dl>
        </section>
      </section>
    </>
  );
}
