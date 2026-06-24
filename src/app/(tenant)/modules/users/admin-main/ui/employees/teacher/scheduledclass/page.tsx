"use client";

import React, { useEffect, useState } from "react";
import AdminHeader from "@/app/(tenant)/modules/users/admin-main/components/AdminHeader";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { MdTune } from "react-icons/md";
import Pagination from "@/components/Pagination";
import BaseLayout4 from "../../../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

/* ---------------- TYPES ---------------- */

interface Course {
  courseId: string;
  courseName: string;
}

interface TableRow {
  id: string;

  students: {
    id: string;
    name: string;
    status: string;
  }[];


  courseName: string;

  classType: string;

  date: string;

  startTime: string;
  endTime: string;

  status: string;
}

/* ---------------- COMPONENT ---------------- */

export default function Page() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("teacherId");

  const [tableData, setTableData] = useState<TableRow[]>([]);

  /* UI STATES */
  const [searchText, setSearchText] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openRow, setOpenRow] = useState<string | null>(null);

  const [filterStudent, setFilterStudent] = useState("");
  const [filterClassType, setFilterClassType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  /* PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    const token = localStorage.getItem("AdminAuthToken");

    if (!token || !employeeId) return;

    fetchSchedule(token);
  }, [employeeId]);

  const fetchSchedule = async (token: string) => {
    try {
      const res = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TEACHER_CLASSES}?teacherId=${employeeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const normalized = normalizeData(res.data);

      const sorted = sortByDateTime(normalized);

      setTableData(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- NORMALIZER ---------------- */

  const normalizeData = (apiData: any): TableRow[] => {
    const map = new Map<string, TableRow>();

    /* REGULAR + GROUP */

    apiData.classScheduleList.forEach((item: any) => {
      const key = `${item._id}-${item.startDate}-${item.startTime?.[0]}`;

      if (!map.has(key)) {
        map.set(key, {
          id: key,

          students: [],

          courseName: item.course?.courseName || "-",

          classType: item.sessionClassType,

          date: item.startDate,

          startTime: item.startTime?.[0] || "-",
          endTime: item.endTime?.[0] || "-",

          status: item.scheduleStatus,
        });
      }

      const row = map.get(key)!;

      /* REGULAR STUDENT */
      if (!Array.isArray(item.student)) {
        row.students.push({
          id: item.student.studentId,

          name: `${item.student.studentFirstName} ${item.student.studentLastName}`,

          // student status
          status: item.student.status || item.scheduleStatus,
        });
      }

      /* GROUP STUDENTS */
      else {
        item.student.forEach((s: any) => {
          row.students.push({
            id: s.student.studentId,

            name: `${s.student.studentFirstName}`,

            // student status (fallback to class status)
            status: item.scheduleStatus,
          });
        });
      }
    });

    /* TRIAL CLASSES */

    apiData.trialclasses.forEach((trial: any) => {
      const key = `trial-${trial.id}`;

      if (!map.has(key)) {
        map.set(key, {
          id: key,

          students: [
            {
              id: trial.student.studentId,

              name: trial.student.studentName,

              status: trial.meetingStatus,
            },
          ],

          courseName: trial.course?.courseName || "-",

          classType: "TRIAL",

          date: trial.scheduledStartDate,

          startTime: trial.scheduledFrom,
          endTime: trial.scheduledTo,

          status: trial.meetingStatus,
        });
      }
    });

    return Array.from(map.values());
  };



  /* ---------------- SORTER ---------------- */

  const toTimestamp = (row: TableRow) => {
    const datePart = row.date ? new Date(row.date) : new Date(0);
    const [h = "00", m = "00"] =
      row.startTime && row.startTime !== "-" ? row.startTime.split(":") : [];

    datePart.setHours(Number(h), Number(m), 0, 0);

    return datePart.getTime();
  };

  const sortByDateTime = (data: TableRow[]) =>
    [...data].sort((a, b) => {
      const t1 = toTimestamp(a);
      const t2 = toTimestamp(b);

      // 1. Sort by Date + Time
      if (t1 !== t2) return t1 - t2;

      // 2. Then by Course Name
      if (a.courseName !== b.courseName)
        return a.courseName.localeCompare(b.courseName);

      // 3. Then by First Student Name (for stable order)
      const nameA = a.students[0]?.name || "";
      const nameB = b.students[0]?.name || "";

      return nameA.localeCompare(nameB);
    });


  /* ---------------- FILTER OPTIONS ---------------- */

  const studentNames = Array.from(
    new Set(
      tableData.flatMap((r) => r.students.map((s) => s.name))
    )
  );

  const classTypes = Array.from(new Set(tableData.map((r) => r.classType)));

  const statuses = Array.from(new Set(tableData.map((r) => r.status)));

  /* ---------------- FILTER + SEARCH ---------------- */

  const filteredData = tableData.filter((row) => {
    const q = searchText.toLowerCase();

    /* SEARCH */
    const matchesSearch =
      row.students.some(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)
      )

    row.courseName.toLowerCase().includes(q) ||
      row.classType.toLowerCase().includes(q);

    /* FILTERS */
    const matchesStudent = filterStudent
      ? row.students.some((s) => s.name === filterStudent)
      : true;


    const matchesClass = filterClassType
      ? row.classType === filterClassType
      : true;

    const matchesStatus = filterStatus ? row.status === filterStatus : true;

    const matchesDate =
      (!filterStartDate || new Date(row.date) >= new Date(filterStartDate)) &&
      (!filterEndDate || new Date(row.date) <= new Date(filterEndDate));

    return (
      matchesSearch &&
      matchesStudent &&
      matchesClass &&
      matchesStatus &&
      matchesDate
    );
  });

  /* RESET PAGE ON FILTER */
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchText,
    filterStudent,
    filterClassType,
    filterStatus,
    filterStartDate,
    filterEndDate,
  ]);

  /* ---------------- PAGINATION ---------------- */

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const currentItems = filteredData.slice(indexOfFirst, indexOfLast);

  /* ---------------- HELPERS ---------------- */

  const formatTime = (time: string) => {
    if (time === "-") return "-";

    const [h, m] = time.split(":");

    const d = new Date();
    d.setHours(Number(h), Number(m));

    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const statusClass = (status: string) => {
    const normalized = status.toLowerCase();

    if (
      normalized.includes("completed") ||
      normalized.includes("complete") ||
      normalized.includes("scheduled") ||
      normalized.includes("schedule")
    ) {
      return "bg-green-100 text-green-800";
    }

    if (normalized.includes("absent") || normalized.includes("missed")) {
      return "bg-red-100 text-red-800";
    }

    return "bg-gray-100 text-gray-800";
  };

  /* ---------------- UI ---------------- */

  return (
    <BaseLayout4>
      <AdminHeader
        currentSection="Scheduled Classes"
        showBackButton
        showBackPath={`/modules/users/admin-main/ui/employees/teacher?teacherId=${employeeId}`}
      />
      <div>
        <div className="rounded-xl overflow-hidden">
          {/* SEARCH BAR */}
          <div className="flex flex-row sm:flex-row justify-between items-stretch px-16 gap-4 py-0 bg-[#FAFAFB] dark:bg-[#343434]">
            {/* Search */}
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none text-[12px] w-32 py-3"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            {/* Filter Button */}
            <div
              className="flex items-center gap-2 text-[12px] text-gray-400 py-3 border-r-2 border-l-2 px-48 cursor-pointer"
              onClick={() => setIsFilterOpen(true)}
            >
              <MdTune className="w-4 h-4" />
              <span>Filter</span>
            </div>

            {/* Showing Count */}
            <span className="text-[12px] text-gray-400 py-3">
              Showing {filteredData.length}
            </span>
          </div>

          {/* FILTER MODAL */}
          {isFilterOpen && (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

            <div className="bg-white p-5 rounded-xl w-96 shadow-lg text-sm">
          
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-base">Filter By</h3>
          
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setIsFilterOpen(false)}
                >
                  ✕
                </button>
              </div>
          
              {/* Student */}
              <select
                className="w-full mb-3 p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filterStudent}
                onChange={(e) => setFilterStudent(e.target.value)}
              >
                <option value="">All Students</option>
                {studentNames.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
          
              {/* Class */}
              <select
                className="w-full mb-3 p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filterClassType}
                onChange={(e) => setFilterClassType(e.target.value)}
              >
                <option value="">All Classes</option>
                {classTypes.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
          
              {/* Status */}
              <select
                className="w-full mb-3 p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                {statuses.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
          
              {/* Dates */}
              <div className="flex gap-2 mb-4">
          
                <input
                  type="date"
                  className="w-1/2 border rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                />
          
                <input
                  type="date"
                  className="w-1/2 border rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                />
          
              </div>
          
              {/* Buttons */}
              <div className="flex justify-end gap-3">
          
                <button
                  className="px-3 py-1.5 border rounded text-gray-600 hover:bg-gray-100"
                  onClick={() => {
                    setFilterStudent("");
                    setFilterClassType("");
                    setFilterStatus("");
                    setFilterStartDate("");
                    setFilterEndDate("");
          
                    // Close popup on reset
                    setIsFilterOpen(false);
                  }}
                >
                  Reset
                </button>
          
                <button
                  className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => setIsFilterOpen(false)}
                >
                  Apply
                </button>
          
              </div>
          
            </div>
          </div>
          
          )}

          {/* TABLE */}

          <div className="overflow-x-auto max-h-none">
            <table
              className="w-full min-w-[900px] text-sm text-left table-auto"
              style={{ width: "100%", tableLayout: "fixed" }}
            >
              <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                <tr className="font-medium">
                  <th className="p-4 font-semibold text-[12px] text-left">
                    Student ID
                  </th>
                  <th className="p-4 font-semibold text-[12px] text-left">
                    Name
                  </th>
                  <th className="p-4 font-semibold text-[12px] text-left">
                    Course
                  </th>
                  <th className="p-4 font-semibold text-[12px] text-left">
                    Class
                  </th>
                  <th className="p-4 font-semibold text-[12px] text-left">
                    Date
                  </th>
                  <th className="p-4 font-semibold text-[12px] text-left">
                    Time
                  </th>
                  <th className="p-4 font-semibold text-[12px] text-left">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="text-[10px] text-[#1D2939]">
                {currentItems.length > 0 ? (
                  currentItems.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`text-left dark:text-white ${index % 2 === 0
                          ? "bg-[#fff] dark:bg-[#2C2C2C]"
                          : "bg-[#F8F8F8] dark:bg-[#303030]"
                        }`}
                    >
                      {/* STUDENT ID */}
                      <td className="p-3 text-left">

                        {/* If only ONE student → show directly */}
                        {row.students.length === 1 && (
                          <span className="text-xs">
                            {row.students[0].id}
                          </span>
                        )}

                        {/* If MORE than one → show View List */}
                        {row.students.length > 1 && (

                          <>
                            <button
                              className="text-[#576CBC]  hover:text-[#3a4f8a] text-xs  mb-1 block"
                              onClick={() =>
                                setOpenRow(openRow === row.id ? null : row.id)
                              }
                            >
                              {openRow === row.id
                                ? "Hide List"
                                : `View List (${row.students.length})`}
                            </button>

                            {openRow === row.id && (
                              <div className="space-y-1 mt-1">

                                {row.students.map((s) => (
                                  <div key={s.id} className="text-xs">
                                    {s.id}
                                  </div>
                                ))}

                              </div>
                            )}
                          </>
                        )}

                      </td>


                      {/* STUDENT NAME */}
                      <td className="p-3 text-left">

                        {row.students.length === 1 && (
                          <span className="text-xs">
                            {row.students[0].name}
                          </span>
                        )}

                        {row.students.length > 1 && openRow === row.id && (

                          <div className="space-y-1 mt-6">

                            {row.students.map((s) => (
                              <div key={s.id} className="text-xs">
                                {s.name}
                              </div>
                            ))}

                          </div>
                        )}

                        {row.students.length > 1 && openRow !== row.id && (
                          <button
                            className="text-[#576CBC]  hover:text-[#3a4f8a] text-xs "
                            onClick={() =>
                              setOpenRow(openRow === row.id ? null : row.id)
                            }
                          >
                            View List
                          </button>
                        )}



                      </td>


                      {/* COURSE */}
                      <td className="p-3 text-left">{row.courseName}</td>

                      {/* CLASS */}
                      <td className="p-3 text-left">{row.classType}</td>

                      {/* DATE */}
                      <td className="p-3 text-left">
                        {new Date(row.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </td>

                      {/* TIME */}
                      <td className="p-3 text-left">
                        {formatTime(row.startTime)} – {formatTime(row.endTime)}
                      </td>

                      {/* STATUS */}
                      <td className="p-3 text-left">

                        {/* Single student */}
                        {row.students.length === 1 && (
                          <span
                            className={`px-3 py-1 rounded-md text-[10px] font-semibold ${statusClass(
                              row.students[0].status
                            )}`}
                          >
                            {row.students[0].status}
                          </span>
                        )}

                        {/* Multiple students */}
                        {row.students.length > 1 && openRow === row.id && (

                          <div className="space-y-1 mt-6">

                            {row.students.map((s) => (
                              <div key={s.id}>

                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${statusClass(
                                    s.status
                                  )}`}
                                >
                                  {s.status}
                                </span>

                              </div>
                            ))}

                          </div>
                        )}

                        {row.students.length > 1 && openRow !== row.id && (
                          <span
                            className={`px-3 py-1 rounded-md text-[10px] font-semibold ${statusClass(
                              row.status
                            )}`}
                          >
                            {row.status}
                          </span>
                        )}

                      </td>

                    </tr>

                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-4 text-center">
                      No Data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          {totalPages > 1 && (
            <div className="flex justify-end p-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </BaseLayout4>
  );
}
