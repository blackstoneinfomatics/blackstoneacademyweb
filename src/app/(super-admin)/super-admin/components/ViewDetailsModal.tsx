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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div
        className="w-full rounded-xl bg-white shadow-xl"
        style={{
          maxWidth: "clamp(760px,65vw,980px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <h2
            className="font-medium text-[#010E30]"
            style={{
              fontSize: "clamp(12px,1vw,16px)",
            }}
          >
            {title}
          </h2>

          <button onClick={onClose}>
            <X
              size={22}
              className="text-[#9C9C9C] hover:text-gray-700"
            />
          </button>
        </div>

        {/* Body */}

        <div className="px-6 pb-6">
          <div className="rounded-xl border-2 border-[#D4D4D4] p-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {data.map((item, index) => (
                <div key={index}>
                  <label
                    className="mb-2 block font-normal text-[#010E30]"
                    style={{
                      fontSize: "clamp(14px,.95vw,16px)",
                    }}
                  >
                    {item.label}
                  </label>

                  <div
                    className="flex items-center rounded-md border border-[#D4D4D4] bg-[#ffffff] px-4"
                    style={{
                      height: "clamp(46px,3vw,50px)",
                      fontSize: "clamp(14px,.9vw,15px)",
                    }}
                  >
                    <span
                      className={
                        item.status
                          ? "font-normal text-[#16A34A]"
                          : "text-[#010E30CC]/80 font-normal"
                      }
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