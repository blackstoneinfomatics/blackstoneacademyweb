"use client";

import { X } from "lucide-react";

interface DetailItem {
  label: string;
  value: React.ReactNode;
  status?: boolean;
}

interface ViewDetailsModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  data: DetailItem[];
}

export default function ViewDetailsModal({
  title,
  open,
  onClose,
  data,
}: ViewDetailsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 dark:bg-black/70">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-details-modal-title"
        className="max-h-[calc(100dvh-2rem)] w-full overflow-y-scroll scrollbar-none rounded-xl bg-white shadow-xl dark:bg-[#2F2F2F]"
        style={{
          maxWidth: "min(720px, 100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] px-4 py-3 dark:border-[#454545]">
          <h2
            id="view-details-modal-title"
            className="font-medium text-[#010E30] dark:text-white"
            style={{
              fontSize: "clamp(13px,.9vw,15px)",
            }}
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="shrink-0 rounded-md p-1 transition-colors hover:bg-gray-100 dark:hover:bg-[#414141]"
          >
            <X
              size={22}
              className="text-[#9C9C9C] hover:text-gray-700 dark:hover:text-white"
            />
          </button>
        </div>

        {/* Body */}

        <div className="px-4 py-4">
          <div className="rounded-lg border border-[#D4D4D4] p-4 dark:border-[#555555]">
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              {data.map((item, index) => (
                <div key={`${item.label}-${index}`} className="min-w-0">
                  <label
                    className="mb-1.5 block font-normal text-[#010E30] dark:text-[#E2E6EE]"
                    style={{
                      fontSize: "clamp(12px,.8vw,14px)",
                    }}
                  >
                    {item.label}
                  </label>

                  <div
                    className="flex min-h-[40px] items-center rounded-md border border-[#D4D4D4] bg-[#ffffff] px-3 py-1.5 dark:border-[#555555] dark:bg-[#383838]"
                    style={{
                      fontSize: "clamp(12px,.78vw,14px)",
                    }}
                  >
                    <span
                      className={`min-w-0 break-words ${
                        item.status
                          ? "font-normal text-[#16A34A] dark:text-green-400"
                          : "font-normal text-[#010E30CC]/80 dark:text-[#D1D5DB]"
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}