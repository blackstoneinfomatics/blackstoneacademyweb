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
    <div className="grid grid-cols-1 overflow-hidden rounded-t-lg border border-[#E8E8E8] bg-white md:grid-cols-3">
      {/* Search */}
      <div
        className="flex items-center border-b border-[#E8E8E8] md:border-b-0 md:border-r"
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
          className="w-full bg-transparent outline-none placeholder:text-[#A0A0A0]"
          style={{
            fontSize: "clamp(14px, 0.9vw, 15px)",
            color: "#242424",
          }}
        />
      </div>

      {/* Filter */}
      <button
        onClick={onFilterClick}
        className="flex items-center justify-between border-b border-[#E8E8E8] transition hover:bg-gray-50 md:border-b-0 md:border-r"
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
            className="text-[#A5A5A5]"
            style={{
              width: "clamp(15px, 1.1vw, 18px)",
              height: "clamp(15px, 1.1vw, 18px)",
            }}
          />

          <span
            style={{
              fontSize: "clamp(14px, 0.9vw, 15px)",
              color: "#757575",
            }}
          >
            Filter
          </span>
        </div>

        <ChevronDown
          className="text-[#A5A5A5]"
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
          style={{
            fontSize: "clamp(14px, 0.9vw, 15px)",
            color: "#909090",
          }}
        >
          Showing {showing} of {total}
        </span>
      </div>
    </div>
  );
}