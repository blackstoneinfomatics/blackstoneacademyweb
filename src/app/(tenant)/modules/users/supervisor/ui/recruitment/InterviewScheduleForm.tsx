"use client";

import { UserRound } from "lucide-react";

interface ScheduleApplicant {
  candidateFirstName: string;
  candidateLastName: string;
  position: string;
  experience?: number | string;
  supervisor?: {
    teachingExperience?: number | string;
  };
}

interface InterviewScheduleFormProps {
  applicant: ScheduleApplicant;
  date: string;
  time: string;
  platform: string;
  isSubmitting: boolean;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onPlatformChange: (platform: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function InterviewScheduleForm({
  applicant,
  date,
  time,
  platform,
  isSubmitting,
  onDateChange,
  onTimeChange,
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
        className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[450px] max-w-[calc(100%-24px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-[#343434]"
      >
        <h2
          id="schedule-interview-title"
          className="mb-6 text-lg font-semibold leading-tight text-[#0A1737] dark:text-white"
        >
          Interview Schedule
        </h2>
        <div className="rounded-2xl border-2 border-[#E0E4EA] p-5 dark:border-[#5F5959]">
          <div className="mb-6 flex items-center gap-5 rounded-2xl bg-[#eff1f9] p-5 dark:bg-[#292D3A]">
            <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-white text-[#5B6FC4] dark:bg-[#343434]">
              <UserRound className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold leading-tight text-[#010E30] dark:text-white">
                {applicant.candidateFirstName} {applicant.candidateLastName}
              </h3>
              <div className="mt-1 text-sm text-[#313b58] dark:text-[#D6D6D6]">
                Applied for{" "}
                <span className="text-[#F3A13B]">
                  {applicant.position || "—"}
                </span>
              </div>
              <p className="mt-1 text-sm text-[#747476] dark:text-[#D6D6D6]">
                Experience:{" "}
                {applicant.experience ??
                  applicant.supervisor?.teachingExperience ??
                  "—"}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <label className="block text-sm font-semibold text-[#0A1737] dark:text-white">
              Interview Date
              <input
                type="date"
                required
                min={today}
                value={date}
                onChange={(event) => onDateChange(event.target.value)}
                className="mt-2 w-full rounded-lg border-2 border-[#E0E4EA] px-2 py-1.5 text-[10px] font-normal text-[#34415F] dark:border-[#5F5959] dark:bg-[#343434] dark:text-white"
              />
            </label>
            <label className="block text-sm font-semibold text-[#0A1737] dark:text-white">
              Interview Time
              <input
                type="time"
                required
                value={time}
                onChange={(event) => onTimeChange(event.target.value)}
                className="mt-2 w-full rounded-lg border-2 border-[#E0E4EA] px-2 py-1.5 text-[10px] font-normal text-[#34415F] dark:border-[#5F5959] dark:bg-[#343434] dark:text-white"
              />
            </label>
            <label className="block text-sm font-semibold text-[#0A1737] dark:text-white">
              Interview Platform
              <select
                value={platform}
                onChange={(event) => onPlatformChange(event.target.value)}
                className="mt-2 w-full rounded-lg border-2 border-[#E0E4EA] bg-white px-2 py-1.5 text-[10px] font-normal text-[#34415F] dark:border-[#5F5959] dark:bg-[#343434] dark:text-white"
              >
                <option>Google Meet</option>
                <option>Zoom</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-5">
          <button
            type="button"
            onClick={onClose}
            className="min-w-[150px] rounded-xl border-2 border-[#5B6FC4] bg-[#F0F2FB] px-6 py-3 text-[16px] font-semibold text-[#5B6FC4] dark:bg-[#292D3A]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="min-w-[178px] rounded-xl bg-[#5B6FC4] px-6 py-3 text-[16px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Scheduling..." : "Submit"}
          </button>
        </div>
      </div>
    </>
  );
}
