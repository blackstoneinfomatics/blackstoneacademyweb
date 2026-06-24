// components/Pagination.tsx
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const generatePageNumbers = (current: number, total: number): (number | string)[] => {
  const pages: (number | string)[] = [];

  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  pages.push(1);

  if (current > 3) pages.push("...");

  const startPage = Math.max(2, current - 1);
  const endPage = Math.min(total - 1, current + 1);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pages = generatePageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-end justify-end space-x-2 mt-6 ">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center dark:bg-[#565665] dark:border dark:border-[#717171] dark:text-[#9a9a9a] text-[#999fac] rounded-md bg-[#f5f5f2] shadow hover:cursor-pointer disabled:opacity-50"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page, index) =>
        typeof page === "number" ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 text-sm flex items-center justify-center rounded-md ${
              currentPage === page
                ? "bg-[#F5F5F2] border border-[#203F78] text-[#203F78] dark:text-[#fff] dark:bg-[#939393] dark:border dark:border-[#717171]"
                : "bg-[#f5f5f2] text-[#252525] text-opacity-[40%] dark:border dark:border-[#717171] dark:bg-[#565656] dark:text-[#9a9a9a]"
            }`}
          >
            {page}
          </button>
        ) : (
          <span
            key={index}
            className="w-8 h-8 flex items-center justify-center text-[#999fac]"
          >
            ...
          </span>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center dark:bg-[#565665] dark:border dark:border-[#717171] dark:text-[#9a9a9a] text-[#999fac] rounded-md bg-[#f5f5f2] shadow  disabled:opacity-50"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
