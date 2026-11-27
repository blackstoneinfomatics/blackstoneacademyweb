"use client";

import { UserRound } from "lucide-react";

interface ScheduleApplicant {
  candidateFirstName: string;
  candidateLastName: string;
  position: string;
  interviewMode?: string;
  experience?: number | string;
  teachingExperience?: number | string;
  supervisor?: {
    teachingExperience?: number | string;
  };
}

interface InterviewScheduleFormProps {
  applicant: ScheduleApplicant;
  date: string;
  time: string;
  mode: string;
  platform: string;
  isSubmitting: boolean;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onModeChange: (mode: string) => void;
  onPlatformChange: (platform: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}
function formatExperience(value?: number | string) {
  if (value === undefined || value === null || value === "") return "—";
  const numericValue = Number(value);
  return Number.isNaN(numericValue)
    ? value
    : numericValue.toFixed(1);
}
export default function InterviewScheduleForm({
  applicant,
  date,
  time,
  mode,
  platform,
  isSubmitting,
  onDateChange,
  onTimeChange,
  onModeChange,
  onPlatformChange,
  onClose,
  onSubmit,
}: InterviewScheduleFormProps) {
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-label="Close schedule interview dialog"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-interview-title"
        className="fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[380px] max-w-[calc(100%-24px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-4 shadow-xl dark:bg-[#343434]"
      >
        <h2
          id="schedule-interview-title"
          className="mb-3 text-base font-medium leading-tight text-[#010E30] dark:text-white"
        >
          Interview Schedule
        </h2>
        <div className="rounded-xl border border-[#E0E4EA] p-3 dark:border-[#5F5959]">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#eff1f9] p-3 dark:bg-[#292D3A]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#5B6FC4] dark:bg-[#343434]">
              <UserRound className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold leading-tight text-[#010E30] dark:text-white">
                {applicant.candidateFirstName} {applicant.candidateLastName}
              </h3>
              <div className="mt-1 text-xs text-[#313b58] dark:text-[#D6D6D6]">
                Applied for{" "}
                <span className="text-[#F3A13B]">
                  {applicant.position || "—"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#747476] dark:text-[#D6D6D6]">
                Experience:{" "}
                {formatExperience(
                  applicant.teachingExperience ??
                    applicant.experience ??
                    applicant.supervisor?.teachingExperience ??
                    "—"
                )}
              </p>
            </div>
          </div>
          <div className="space-y-3">
                      <label className="block text-xs font-medium text-[#010E30] dark:text-white">
              Interview Mode
              <select
                value={mode}
                onChange={(event) => onModeChange(event.target.value)}
                className="mt-1.5 h-8 w-full rounded-md border border-[#E0E4EA] bg-white px-2 text-xs font-normal text-[#34415F] dark:border-[#5F5959] dark:bg-[#343434] dark:text-white"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </label>
            <label className="block text-xs font-medium text-[#010E30] dark:text-white">
              Interview Date
              <input
                type="date"
                required
                min={today}
                value={date}
                onChange={(event) => onDateChange(event.target.value)}
                className="mt-1.5 h-8 w-full rounded-md border border-[#E0E4EA] px-2 text-xs font-normal text-[#34415F] dark:border-[#5F5959] dark:bg-[#343434] dark:text-white"
              />
            </label>
            <label className="block text-xs font-medium text-[#010E30] dark:text-white">
              Interview Time
              <input
                type="time"
                required
                value={time}
                onChange={(event) => onTimeChange(event.target.value)}
                className="mt-1.5 h-8 w-full rounded-md border border-[#E0E4EA] px-2 text-xs font-normal text-[#34415F] dark:border-[#5F5959] dark:bg-[#343434] dark:text-white"
              />
            </label>
            
            {mode === "online" && (
            <label className="block text-xs font-medium text-[#010E30] dark:text-white">
              Interview Platform
              <select
                value={platform}
                onChange={(event) => onPlatformChange(event.target.value)}
                className="mt-1.5 h-8 w-full rounded-md border border-[#E0E4EA] bg-white px-2 text-xs font-normal text-[#34415F] dark:border-[#5F5959] dark:bg-[#343434] dark:text-white"
              >
                <option>-- Select Platform --</option>
                <option>Zoom</option>
              </select>
            </label>
            )}
          </div>
        </div>

        <div className="mt-3 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-w-[80px] rounded-md border border-[#5B6FC4] bg-[#F0F2FB] px-3 py-1.5 text-xs font-semibold text-[#5B6FC4] dark:bg-[#292D3A]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="min-w-[90px] rounded-md bg-[#5B6FC4] px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Scheduling..."
              : "Submit"}
          </button>
        </div>
      </div>
    </>
  );
}
