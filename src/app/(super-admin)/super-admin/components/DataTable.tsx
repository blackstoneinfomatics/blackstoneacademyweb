"use client";

import React, { useEffect, useState } from "react";

interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  selectable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  selectable = false,
  loading = false,
  emptyMessage = "No records found",
}: TableProps<T>) {

    const [selectedRows, setSelectedRows] = useState<string[]>([]);

const allSelected =
  data.length > 0 && selectedRows.length === data.length;

const isSelected = (id: string) => selectedRows.includes(id);
const handleSelectAll = () => {
  if (allSelected) {
    setSelectedRows([]);
  } else {
    setSelectedRows(data.map((row) => row.id));
  }
};
const handleRowSelect = (id: string) => {
  setSelectedRows((prev) =>
    prev.includes(id)
      ? prev.filter((item) => item !== id)
      : [...prev, id]
  );
};
  return (
   <div className="w-full overflow-hidden shadow-sm">
  <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1200px] border-separate border-spacing-0">
          {/* Header */}
          <thead className="sticky top-0 z-10">
            <tr className="h-[48px] bg-[#566F97] ">
              {selectable && (
                <th className="w-14 px-3">
                  <div className="flex items-center justify-center">
                    <label className="relative flex h-5 w-5 cursor-pointer items-center justify-center">
<input
  type="checkbox"
  checked={allSelected}
  onChange={handleSelectAll}
  className="peer sr-only"
/>
                      <div
                        className="
          h-5
          w-5
          rounded-[6px]
          border-2
          border-[#ffffff]
          bg-[#566F97]
          transition-all
          duration-200
          peer-checked:border-[#ffffff]
          peer-checked:bg-[#ffffff]
        "
                      />

                      <svg
          className="absolute hidden h-3 w-3 text-[#576CBC] peer-checked:block"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17L4 12" />
                      </svg>
                    </label>
                  </div>
                </th>
              )}

              {columns.map((column) => (
                <th
                  key={column.header}
                  style={{ width: column.width }}
                  className={`
                px-3
                py-3
                text-[13px]
                bg-[#566F97]
border-0
outline-none
    shadow-none

                font-medium
                text-white
                whitespace-nowrap
                ${
                  column.align === "center"
                    ? "text-center"
                    : column.align === "right"
                      ? "text-right"
                      : "text-left"
                }
              `}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-20 text-center text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-20 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={row.id}
                  className={`
                h-[64px]
                border-b
                border-[#F2F4F7]
                transition-all
                hover:bg-[#F8FAFC]
                ${index % 2 === 0 ? "bg-white" : "bg-[#FCFCFD]"}
              `}
                >
                  {selectable && (
                    <td className="px-3">
                      <div className="flex items-center justify-center">
                        <label className="relative flex h-5 w-5 cursor-pointer items-center justify-center">
<input
  type="checkbox"
  checked={isSelected(row.id)}
  onChange={() => handleRowSelect(row.id)}
  className="peer sr-only"
/>
                          <div
                            className="
          h-5
          w-5
          rounded-[6px]
          border
          border-[#576CBC]
          bg-white
          transition-all
          duration-200
          peer-checked:border-[#576CBC]
          peer-checked:bg-[#576CBC]
        "
                          />

                          <svg
  className="absolute hidden h-3 w-3 text-white peer-checked:block"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6L9 17L4 12" />
                          </svg>
                        </label>
                      </div>
                    </td>
                  )}

                  {columns.map((column) => (
                    <td
                      key={column.header}
                      className={`
                    px-3
                    py-3
                    text-[14px]
                    font-normal
                    text-[#010E30E5]/90
                    whitespace-nowrap
                    ${
                      column.align === "center"
                        ? "text-center"
                        : column.align === "right"
                          ? "text-right"
                          : "text-left"
                    }
                  `}
                    >
                      {column.render
                        ? column.render(row)
                        : (row[column.key as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
