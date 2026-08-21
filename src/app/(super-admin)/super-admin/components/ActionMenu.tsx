"use client";

import { MoreVertical } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();

    const menuWidth = 112; // w-28
    const menuHeight = items.length * 50;

    let top = rect.bottom + 6;

    // Open upward if no space below
    if (top + menuHeight > window.innerHeight) {
      top = rect.top - menuHeight - 6;
    }

    let left = rect.right - menuWidth;

    // Prevent overflow on the right
    if (left + menuWidth > window.innerWidth) {
      left = window.innerWidth - menuWidth - 10;
    }

    // Prevent overflow on the left
    if (left < 10) {
      left = 10;
    }

    setPosition((previous) =>
      previous.top === top && previous.left === left ? previous : { top, left },
    );
  }, [open, items.length]);

  return (
    <>
      <div ref={triggerRef} className="flex justify-center">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-[#343434]"
        >
          <MoreVertical
            style={{
              width: "clamp(14px,1vw,18px)",
              height: "clamp(14px,1vw,18px)",
            }}
          />
        </button>
      </div>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[9999] flex w-28 flex-col overflow-hidden rounded-lg border border-[#E8E8E8] bg-white text-gray-900 shadow-lg dark:border-[#4A4A4A] dark:bg-[#343434] dark:text-white"
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick(row);
                  setOpen(false);
                }}
                className={`block w-full border-b-2 border-[#D4D4D4] px-3 py-2 text-center text-xs font-medium last:border-b-0 hover:bg-gray-50 dark:border-[#343434] dark:hover:bg-[#343434] ${
                  item.className ?? ""
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
