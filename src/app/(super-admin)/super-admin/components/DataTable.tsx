"use client";

import React, { useEffect, useState } from "react";
import TableToolbar from "./TableToolbar";
import Pagination from "./Pagination";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  minWidth?: string;
  align?: "left" | "center" | "right";
  className?: string;
  headerClassName?: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T extends Record<string, any>> {
  heading?: string;
  columns: Column<T>[];
  data: T[];
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, any>>({
  heading,
  columns,
  data,
  selectable = false,
  onSelectionChange,
  loading = false,
  emptyMessage = "No records found",
}: TableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const getRowId = (row: T, index: number) => {
    const rawId = (row as Record<string, unknown>).id;
    return typeof rawId === "string" && rawId ? rawId : `row-${index}`;
  };

  useEffect(() => {
    setSelectedRows((prev) =>
      prev.filter((id) =>
        data.some((row, index) => getRowId(row, index) === id),
      ),
    );
  }, [data]);

  useEffect(() => {
    onSelectionChange?.(selectedRows);
  }, [onSelectionChange, selectedRows]);

  const allSelected = data.length > 0 && selectedRows.length === data.length;

  const isSelected = (id: string) => selectedRows.includes(id);

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map((row, index) => getRowId(row, index)));
    }
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <div className="w-full overflow-visible">
      <div className="w-full max-w-full overflow-x-auto">
        <div className="origin-top-left lg:scale-95 xl:scale-100">
          <table className="w-full min-w-full border-separate border-spacing-0">
            {/* Header */}

            <thead className="sticky top-0 z-20 bg-[#566F97]">
              <tr
                style={{
                  height: "clamp(44px, 3vw, 52px)",
                }}
              >
                {" "}
                {selectable && (
                  <th className="sticky left-0 z-30 w-14 bg-[#566F97] px-3">
                    <div className="flex items-center justify-center">
                      <label className="relative flex h-5 w-5 cursor-pointer items-center justify-center">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={handleSelectAll}
                          className="peer sr-only"
                          style={{
                            width: "clamp(16px,1.2vw,20px)",
                            height: "clamp(16px,1.2vw,20px)",
                          }}
                        />

                        <div
                          className="
                          h-4
                          w-4
                          rounded-md
                          border-2
                          border-white
                          bg-[#566F97]
                          transition-all
                          duration-200
                          peer-checked:bg-white
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
                    className={`
bg-[#566F97]
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
${column.headerClassName ?? ""}
`}
                    style={{
                      width: column.width,
                      minWidth: column.minWidth ?? column.width,
                      fontSize: "clamp(12px, 0.75vw, 14px)",
                      padding: "clamp(8px, 0.8vw, 12px)",
                    }}
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
                    className="py-20 text-center text-gray-500 dark:text-[#AEB6C5]"
                  >
                    Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="py-20 text-center text-gray-500 dark:text-[#AEB6C5]"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, index) => {
                  const rowId = getRowId(row, index);

                  return (
                    <tr
                      key={rowId}
                      className={`
                    border-b
                    border-[#F2F4F7] dark:border-[#454545]
                    transition-colors
                    duration-200
                    hover:bg-[#F8FAFC] dark:hover:bg-[#3B3B3B]
                    ${index % 2 === 0 ? "bg-[#FFFFFF] dark:bg-[#343434]" : "bg-[#F8F8F8] dark:bg-[#2F2F2F]"}
                  `}
                    >
                      {selectable && (
                        <td className="sticky left-0 z-10 bg-inherit px-3 py-4">
                          <div className="flex items-center justify-center">
                            <label className="relative flex h-5 w-5 cursor-pointer items-center justify-center">
                              <input
                                type="checkbox"
                                checked={isSelected(rowId)}
                                onChange={() => handleRowSelect(rowId)}
                                className="peer sr-only"
                                style={{
                                  width: "clamp(16px,1.2vw,20px)",
                                  height: "clamp(16px,1.2vw,20px)",
                                }}
                              />

                              <div
                                className="
                              h-4
                              w-4
                              rounded-md
                              border
                              border-[#576CBC]
                              bg-white dark:bg-[#343434]
                              transition-all
                              duration-200
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
text-[#010E30E5]/90 dark:text-[#E2E6EE]
align-middle
whitespace-nowrap
${
  column.align === "center"
    ? "text-center"
    : column.align === "right"
      ? "text-right"
      : "text-left"
}
${column.className ?? ""}
`}
                          style={{
                            fontSize: "clamp(12px, 0.75vw, 14px)",
                            padding: "clamp(8px, 0.8vw, 12px)",
                          }}
                        >
                          {column.render
                            ? column.render(row)
                            : (row[column.key as keyof T] as React.ReactNode)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />
    </div>
  );
}
