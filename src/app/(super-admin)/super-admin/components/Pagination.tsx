"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
 const getPages = (): (number | string)[] => {
  const pages: (number | string)[] = [];

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

  return (
    <div className="flex items-end justify-end gap-2 mt-3">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-[#98A2B3] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          width: "clamp(34px,2.3vw,40px)",
          height: "clamp(34px,2.3vw,40px)",
        }}
      >
        <ChevronLeft
          style={{
            width: "clamp(16px,1vw,18px)",
            height: "clamp(16px,1vw,18px)",
          }}
        />
      </button>

     {getPages().map((page, index) =>
  page === "..." ? (
    <div
      key={`ellipsis-${index}`}
      className="flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-[#98A2B3]"
      style={{
        width: "clamp(34px,2.3vw,40px)",
        height: "clamp(34px,2.3vw,40px)",
        fontSize: "clamp(12px,0.8vw,14px)",
      }}
    >
      <MoreHorizontal size={16} />
    </div>
  ) : (
    <button
      key={`page-${page}`}
      onClick={() => onPageChange(Number(page))}
      className={`rounded-lg border transition ${
        currentPage === page
          ? "border-[#0B3B8F] bg-[#F8FAFF] text-[#0B3B8F]"
          : "border-[#E5E7EB] bg-[#F9FAFB] text-[#667085] hover:bg-gray-100"
      }`}
      style={{
        width: "clamp(34px,2.3vw,40px)",
        height: "clamp(34px,2.3vw,40px)",
        fontSize: "clamp(12px,0.8vw,14px)",
        fontWeight: 500,
      }}
    >
      {page}
    </button>
  )
)}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-[#98A2B3] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          width: "clamp(34px,2.3vw,40px)",
          height: "clamp(34px,2.3vw,40px)",
        }}
      >
        <ChevronRight
          style={{
            width: "clamp(16px,1vw,18px)",
            height: "clamp(16px,1vw,18px)",
          }}
        />
      </button>
    </div>
  );
}