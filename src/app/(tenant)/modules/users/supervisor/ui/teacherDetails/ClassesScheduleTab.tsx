"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { TeacherDetailsTabProps } from "./teacherDetailsTypes";

type ClassRow = {
  id: string;
  batch: string;
  courseName: string;
  classType: string;
  classTopic: string;
  date: string;
  time: string;
  type: string;
  link: string;
  status: string;
};

type ClassFilters = Omit<ClassRow, "id">;

const emptyFilters = (): ClassFilters => ({
  batch: "",
  courseName: "",
  classType: "",
  classTopic: "",
  date: "",
  time: "",
  type: "",
  link: "",
  status: "",
});

const toText = (value: unknown): string => {
  return value == null ? "" : String(value);
};

const PAGE_SIZE = 5;

export default function ClassesScheduleTab({
  classes,
  classesLoading,
}: TeacherDetailsTabProps) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ClassFilters>(emptyFilters);
  const [filterDraft, setFilterDraft] = useState<ClassFilters>(emptyFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Map API response to table data
  const classList: ClassRow[] = useMemo(() => {
    if (!Array.isArray(classes)) return [];

    return classes.map((item, index) => {
      const data = item as Record<string, unknown>;

      return {
        id: toText(data._id || data.id || index),
        batch: toText(data.batchName || data.batch),
        courseName: toText(data.courseName || data.course),
        classType: toText(data.classType || data.sessionClassType),
        classTopic: toText(data.classTopic || data.topic),
        date: toText(data.date || data.classDate || data.startDate),
        time: toText(
          data.time ||
            [data.startTime, data.endTime]
              .filter(Boolean)
              .join(" - ")
        ),
        type: toText(data.type || data.classMode),
        link: toText(data.classLink || data.link),
        status: toText(
          data.attendanceStatus ||
            data.scheduleStatus ||
            data.status
        ),
      };
    });
  }, [classes]);

  // Search and filter
  const filteredClasses = useMemo(() => {
    return classList.filter((item) => {
      const matchesSearch = [
        item.batch,
        item.courseName,
        item.classType,
        item.classTopic,
        item.date,
        item.type,
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesField = (field: keyof ClassFilters) => {
        const filterValue = filters[field].trim().toLowerCase();
        if (!filterValue) return true;
        const itemValue = item[field];

        if (field === "date") {
          const itemDate = new Date(itemValue);
          if (!Number.isNaN(itemDate.getTime())) {
            return itemDate.toISOString().slice(0, 10) === filterValue;
          }
        }

        return itemValue.toLowerCase().includes(filterValue);
      };

      return (
        matchesSearch &&
        (Object.keys(filters) as (keyof ClassFilters)[]).every(matchesField)
      );
    });
  }, [classList, search, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredClasses.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
    setActiveMenu(null);
  }, [search, filters]);

  const openFilters = () => {
    setFilterDraft(filters);
    setIsFilterOpen(true);
  };

  const applyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilters(filterDraft);
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    const clearedFilters = emptyFilters();
    setFilterDraft(clearedFilters);
    setFilters(clearedFilters);
  };

  const handleAction = (action: string, item: ClassRow) => {
    setActiveMenu(null);

    console.log(action, item);

    // Bind your View, Reschedule and Cancel actions here.
  };

  return (
    <div className="w-full space-y-3">
      <section className="rounded-xl bg-[#f0f1f8] dark:bg-[#272b35]">
        {/* Search and Filter Header */}
        <div className="grid grid-cols-1 overflow-hidden rounded-t-lg bg-[#f8f8f8] dark:bg-[#30343f] md:grid-cols-3">

          {/* Search */}
          <div className="flex items-center gap-2 border-b border-[#e7e7e7] px-3 py-2.5 dark:border-[#454a57] md:border-b-0 md:border-r">
            <Search
              size={18}
              className="shrink-0 text-[#a5a5a5]"
            />

            <input
              type="text"
              placeholder="Search by keyword"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-[#35415e] outline-none placeholder:text-[#999999] dark:text-white"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center border-b border-[#e7e7e7] px-3 py-2.5 dark:border-[#454a57] md:border-b-0 md:border-r">
            <button
              type="button"
              onClick={openFilters}
              className="flex w-full items-center gap-2 text-left text-xs text-[#999999] hover:text-[#5268bb] dark:text-gray-300"
            >
              <SlidersHorizontal size={17} className="shrink-0 text-[#a5a5a5]" />
              <span>Filter</span>
              {Object.values(filters).some(Boolean) && (
                <span className="ml-auto rounded-full bg-[#5268bb] px-1.5 py-0.5 text-[10px] text-white">
                  {Object.values(filters).filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Showing Count */}
          <div className="flex items-center px-4 py-2.5">
            <p className="text-xs text-[#999999] dark:text-gray-400">
              Showing {paginatedClasses.length} Of{" "}
              {filteredClasses.length}
            </p>
          </div>
        </div>

        {/* Classes Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left">

            {/* Table Header */}
            <thead>
              <tr className="bg-[#49658d] text-white dark:bg-[#3d4e70]">
                {[
                  "Batch",
                  "Course Name",
                  "Class Type",
                  "Class Topic",
                  "Date",
                  "Time",
                  "Type",
                  "Link",
                  "Attendance Status",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`whitespace-nowrap px-3 py-3 text-[11px] font-medium ${
                      heading === "Action" ? "text-center" : ""
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {classesLoading ? (
                <tr>
                  <td
                    colSpan={10}
                    className="bg-white py-12 text-center text-sm text-gray-500 dark:bg-[#30343f]"
                  >
                    Loading classes...
                  </td>
                </tr>
              ) : paginatedClasses.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="bg-white py-12 text-center text-sm text-gray-500 dark:bg-[#30343f]"
                  >
                    No classes or schedule details are available.
                  </td>
                </tr>
              ) : (
                paginatedClasses.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`text-[11px] text-[#17223e] dark:text-gray-300 ${
                      index % 2 === 0
                        ? "bg-white dark:bg-[#30343f]"
                        : "bg-[#f6f6f6] dark:bg-[#292d37]"
                    }`}
                  >
                    <td className="whitespace-nowrap px-3 py-3">
                      {item.batch || "-"}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3">
                      {item.courseName || "-"}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3">
                      {item.classType || "-"}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3">
                      {item.classTopic || "-"}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3">
                      {formatDate(item.date)}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3">
                      {item.time || "-"}
                    </td>

                    {/* Online / Offline */}
                    <td className="whitespace-nowrap px-3 py-3">
                      <span
                        className={`font-medium ${
                          item.type.toLowerCase() === "offline"
                            ? "text-[#00a63e] dark:text-green-400"
                            : "text-[#576CBC] dark:text-[#9aabef]"
                        }`}
                      >
                        {item.type || "-"}
                      </span>
                    </td>

                    {/* Join Link */}
                    <td className="whitespace-nowrap px-3 py-3">
                      {/^https?:\/\//i.test(item.link) ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 font-medium text-[#173b9b] hover:underline dark:text-[#9aabef]"
                        >
                          <LinkIcon size={13} />
                          Join
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Attendance Status */}
                    <td className="whitespace-nowrap px-3 py-3">
                      <AttendanceStatus status={item.status} />
                    </td>

                    {/* Action Menu */}
                    <td className="relative px-3 py-3 text-center">
                      <button
                        type="button"
                        aria-label="Class actions"
                        aria-expanded={activeMenu === item.id}
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === item.id ? null : item.id
                          )
                        }
                        className="inline-flex rounded-md p-1 text-[#626870] hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-[#454a57]"
                      >
                        <MoreVertical size={18} strokeWidth={2.5} />
                      </button>

                      {activeMenu === item.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setActiveMenu(null)}
                          />

                          <div
                            className={`absolute right-8 z-50 w-32 rounded-lg border border-[#e7eaf2] bg-white p-1 text-left shadow-md dark:border-[#454a57] dark:bg-[#30343f] ${
                              index >= paginatedClasses.length - 2
                                ? "bottom-9"
                                : "top-9"
                            }`}
                          >
                            {["View", "Reschedule", "Cancel"].map(
                              (action) => (
                                <button
                                  key={action}
                                  type="button"
                                  onClick={() =>
                                    handleAction(action, item)
                                  }
                                  className={`block w-full rounded-md px-3 py-2 text-left text-xs hover:bg-[#f0f1f8] dark:hover:bg-[#454a57] ${
                                    action === "Cancel"
                                      ? "text-red-500"
                                      : "text-[#35415e] dark:text-gray-300"
                                  }`}
                                >
                                  {action}
                                </button>
                              )
                            )}
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isFilterOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsFilterOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="class-filter-title"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-[#30343f]"
          >
            <header className="flex items-center justify-between border-b border-[#e7eaf2] px-5 py-4 dark:border-[#454a57]">
              <h2
                id="class-filter-title"
                className="text-base font-semibold text-[#14203c] dark:text-white"
              >
                Filter Classes
              </h2>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                aria-label="Close filters"
                className="rounded-md p-1.5 text-[#64748b] hover:bg-[#f1f5f9] dark:hover:bg-[#424957]"
              >
                <X size={18} />
              </button>
            </header>
            <form onSubmit={applyFilters} className="p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FilterField
                  label="Batch"
                  value={filterDraft.batch}
                  onChange={(value) =>
                    setFilterDraft((current) => ({ ...current, batch: value }))
                  }
                />
                <FilterField
                  label="Course Name"
                  value={filterDraft.courseName}
                  onChange={(value) =>
                    setFilterDraft((current) => ({
                      ...current,
                      courseName: value,
                    }))
                  }
                />
                <FilterField
                  label="Class Type"
                  value={filterDraft.classType}
                  onChange={(value) =>
                    setFilterDraft((current) => ({
                      ...current,
                      classType: value,
                    }))
                  }
                />
                <FilterField
                  label="Class Topic"
                  value={filterDraft.classTopic}
                  onChange={(value) =>
                    setFilterDraft((current) => ({
                      ...current,
                      classTopic: value,
                    }))
                  }
                />
                <FilterField
                  label="Date"
                  type="date"
                  value={filterDraft.date}
                  onChange={(value) =>
                    setFilterDraft((current) => ({ ...current, date: value }))
                  }
                />
                <FilterField
                  label="Time"
                  value={filterDraft.time}
                  onChange={(value) =>
                    setFilterDraft((current) => ({ ...current, time: value }))
                  }
                />
                <FilterField
                  label="Type"
                  value={filterDraft.type}
                  onChange={(value) =>
                    setFilterDraft((current) => ({ ...current, type: value }))
                  }
                />
                <FilterField
                  label="Link"
                  value={filterDraft.link}
                  onChange={(value) =>
                    setFilterDraft((current) => ({ ...current, link: value }))
                  }
                />
                <FilterField
                  label="Attendance Status"
                  value={filterDraft.status}
                  onChange={(value) =>
                    setFilterDraft((current) => ({ ...current, status: value }))
                  }
                  options={[
                    ...Array.from(
                      new Set(classList.map((item) => item.status).filter(Boolean))
                    ),
                  ]}
                />
              </div>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-md border border-[#5268bb] px-4 py-2 text-xs font-medium text-[#5268bb] hover:bg-[#f4f6ff] dark:hover:bg-[#424957]"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#596fbe] px-5 py-2 text-xs font-medium text-white hover:bg-[#485eae]"
                >
                  Apply
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={(value) => {
          setPage(value);
          setActiveMenu(null);
        }}
      />
    </div>
  );
}

function FilterField({
  label,
  value,
  onChange,
  options,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options?: string[];
  type?: "text" | "date";
}) {
  const fieldClass =
    "h-9 w-full rounded-md border border-[#d8deea] bg-white px-2.5 text-xs text-[#475569] outline-none focus:border-[#596fbe] focus:ring-1 focus:ring-[#596fbe] dark:border-[#555b68] dark:bg-[#383d48] dark:text-white";

  return (
    <label className="block text-xs font-medium text-[#14203c] dark:text-white">
      <span className="mb-1.5 block">{label}</span>
      {options ? (
        <select
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          className={fieldClass}
        >
          <option value="">All</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          className={fieldClass}
        />
      )}
    </label>
  );
}

/* Attendance Status Component */

function AttendanceStatus({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    cancelled:
      "bg-[#f9e5e5] text-[#ef4444] dark:bg-red-500/10 dark:text-red-400",

    completed:
      "bg-[#eef1f4] text-[#626870] dark:bg-gray-500/10 dark:text-gray-300",

    ongoing:
      "bg-[#e8fbf1] text-[#218838] dark:bg-green-500/10 dark:text-green-400",

    scheduled:
      "bg-[#e8ebf6] text-[#576CBC] dark:bg-blue-500/10 dark:text-blue-400",

    rescheduled:
      "bg-[#dfe7eb] text-[#35677d] dark:bg-cyan-500/10 dark:text-cyan-400",
  };

  const normalizedStatus = status.trim().toLowerCase();

  return (
    <span
      className={`inline-flex min-w-[65px] items-center justify-center rounded-md px-2 py-1.5 text-[10px] font-medium capitalize ${
        statusStyles[normalizedStatus] ||
        "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
      }`}
    >
      {status || "-"}
    </span>
  );
}

/* Pagination Component */

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages: (number | string)[] =
    totalPages <= 5
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : page <= 3
        ? [1, 2, 3, "...", totalPages]
        : page >= totalPages - 2
          ? [1, "...", totalPages - 2, totalPages - 1, totalPages]
          : [1, "...", page - 1, page, page + 1, "...", totalPages];

  const buttonClass =
    "flex h-8 min-w-8 items-center justify-center rounded-md " +
    "bg-[#f6f6f6] px-2 text-xs text-[#999999] transition-colors " +
    "hover:bg-white dark:bg-[#30343f] dark:text-gray-300";

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((item, index) =>
        typeof item === "number" ? (
          <button
            key={`${item}-${index}`}
            type="button"
            onClick={() => onPageChange(item)}
            className={`${buttonClass} ${
              page === item
                ? "border border-[#576CBC] !text-[#173b9b] dark:!text-[#9aabef]"
                : "border border-transparent"
            }`}
          >
            {item}
          </button>
        ) : (
          <span key={`dots-${index}`} className={buttonClass}>
            ...
          </span>
        )
      )}

      <button
        type="button"
        aria-label="Next page"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

/* Date Formatter */

function formatDate(value: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}