"use client";

import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";

interface TableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  total: number;
  showing: number;
  searchPlaceholder?: string;
  onFilterClick?: () => void;
}

export default function TableToolbar({
  search,
  onSearchChange,
  total,
  showing,
  searchPlaceholder = "Search by keyword",
  onFilterClick,
}: TableToolbarProps) {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-t-lg border border-[#E8E8E8] bg-white dark:border-[#454545] dark:bg-[#343434] md:grid-cols-3">
      {/* Search */}
      <div
        className="flex items-center border-b border-[#E8E8E8] dark:border-[#454545] md:border-b-0 md:border-r"
        style={{
          height: "clamp(36px, 4vw, 42px)",
          paddingInline: "clamp(12px, 1vw, 16px)",
        }}
      >
        <Search
          className="mr-2 text-[#B3B3B3] shrink-0"
          style={{
            width: "clamp(16px, 1.2vw, 20px)",
            height: "clamp(16px, 1.2vw, 20px)",
          }}
        />

        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-transparent outline-none placeholder:text-[#8F98A8] dark:placeholder:text-[#8F98A8]"
          style={{
            fontSize: "clamp(14px, 0.9vw, 15px)",
          }}
        />
      </div>

      {/* Filter */}
      <button
        onClick={onFilterClick}
        className="flex items-center justify-between border-b border-[#E8E8E8] transition hover:bg-gray-50 dark:border-[#454545] dark:hover:bg-[#3B3B3B] md:border-b-0 md:border-r"
        style={{
          height: "clamp(36px, 4vw, 42px)",
          paddingInline: "clamp(12px, 1vw, 16px)",
        }}
      >
        <div
          className="flex items-center"
          style={{
            gap: "clamp(6px, 0.8vw, 10px)",
          }}
        >
          <SlidersHorizontal
            className="text-[#A5A5A5] dark:text-[#AEB6C5]"
            style={{
              width: "clamp(15px, 1.1vw, 18px)",
              height: "clamp(15px, 1.1vw, 18px)",
            }}
          />

          <span
            className="text-[#757575] dark:text-[#CBD5E1]"
            style={{
              fontSize: "clamp(14px, 0.9vw, 15px)",
            }}
          >
            Filter
          </span>
        </div>

        <ChevronDown
          className="text-[#A5A5A5] dark:text-[#AEB6C5]"
          style={{
            width: "clamp(14px, 1vw, 16px)",
            height: "clamp(14px, 1vw, 16px)",
          }}
        />
      </button>

      {/* Showing */}
      <div
        className="flex items-center"
        style={{
          height: "clamp(36px, 4vw, 42px)",
          paddingInline: "clamp(14px, 1.2vw, 20px)",
        }}
      >
        <span
          className="text-[#909090] dark:text-[#AEB6C5]"
          style={{
            fontSize: "clamp(14px, 0.9vw, 15px)",
          }}
        >
          Showing {showing} of {total}
        </span>
      </div>
    </div>
  );
}