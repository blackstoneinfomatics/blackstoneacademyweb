"use client";

import { FileText } from "lucide-react";
import { titleClass } from "./teacherDetailsTabShared";
import { TeacherDocumentsProps } from "./teacherDetailsTypes";

export default function DocumentsTab({
  teacher,
  onViewResume,
}: TeacherDocumentsProps) {
  return (
    <section className="max-w-4xl rounded-lg border border-[#e7eaf2] bg-white p-4 dark:border-[#454a57] dark:bg-[#30343f]">
      <h3 className={`${titleClass} mb-3`}>Documents</h3>
      {teacher.uploadResume ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#f3f5fb] p-4 dark:bg-[#272b35]">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-[#5268bb]" />
            <div>
              <p className="text-sm font-medium text-[#17223e] dark:text-white">
                Resume
              </p>
              <p className="text-xs text-[#74809a]">
                Teacher application document
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onViewResume}
            className="rounded-md bg-[#5268bb] px-4 py-2 text-sm font-medium text-white hover:bg-[#4358a8]"
          >
            View / Download
          </button>
        </div>
      ) : (
        <p className="py-5 text-sm text-[#74809a]">
          No documents have been uploaded.
        </p>
      )}
    </section>
  );
}
