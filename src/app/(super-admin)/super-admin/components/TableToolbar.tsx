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
    <div className="grid grid-cols-1 overflow-hidden rounded-t-2xl border border-[#E8E8E8] bg-white md:grid-cols-3">
      {/* Search */}
      <div className="flex h-14 items-center border-b border-[#E8E8E8] px-4 md:border-b-0 md:border-r">
        <Search className="mr-3 h-5 w-5 text-[#B3B3B3]" />

        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-transparent text-[15px] text-[#2F2F2F] placeholder:text-[#A0A0A0] outline-none"
        />
      </div>

      {/* Filter */}
      <button
        onClick={onFilterClick}
        className="flex h-14 items-center justify-between border-b border-[#E8E8E8] px-4 transition hover:bg-gray-50 md:border-b-0 md:border-r"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            size={18}
            className="text-[#A5A5A5]"
          />

          <span className="text-[15px] text-[#757575]">
            Filter
          </span>
        </div>

        <ChevronDown
          size={16}
          className="text-[#A5A5A5]"
        />
      </button>

      {/* Showing */}
      <div className="flex h-14 items-center px-5">
        <span className="text-[15px] text-[#909090]">
          Showing {showing} Of {total}
        </span>
      </div>
    </div>
  );
}