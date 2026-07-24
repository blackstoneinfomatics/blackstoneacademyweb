"use client";

import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface ActionItem<T> {
  label: string;
  onClick: (row: T) => void;
  className?: string;
}

interface ActionDropdownProps<T> {
  row: T;
  items: ActionItem<T>[];
}

export default function ActionDropdown<T>({
  row,
  items,
}: ActionDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  console.log("itenms", items);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative flex justify-center border ">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-md p-1 hover:bg-gray-100"
      >
       <MoreVertical
                         style={{
                           width: "clamp(14px,1vw,18px)",
                           height: "clamp(14px,1vw,18px)",
                         }}
                       />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-44 overflow-hidden rounded-lg border border-[#E8E8E8] bg-white shadow-lg">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick(row);
                setOpen(false);
              }}
              className={`w-full border-b last:border-b-0 px-4 py-3 text-left text-sm hover:bg-gray-50 ${item.className ?? ""}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}