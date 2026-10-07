"use client";

import { FiSearch } from "react-icons/fi";

export function ChatRoomSearch({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (query: string) => void;
}) {
  return (
    <div className="px-3 pt-3">
      <div className="relative flex-1">
        <FiSearch
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9EA3AE] dark:text-[#8a8a8a]"
        />
        <input
          type="text"
          placeholder="Search by keyword"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="w-full h-8 pl-9 pr-3 border border-[#DDDFE6] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] rounded-md text-[12px] text-[#252B3A] dark:text-[#E2E2E2] outline-none focus:border-[#576CBC]"
        />
      </div>
    </div>
  );
}
