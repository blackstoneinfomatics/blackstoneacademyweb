"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type TimeFrame = "Weekly" | "Monthly" | "Yearly";

interface ClassRecord {
  date: string;
  classCompleted: number;
  classScheduled: number;
  classRescheduled: number;
  classCancelled: number;
}

interface ChartItem {
  type: string;
  count: number;
  color: string;
}

const getDateRangeParam = (timeFrame: TimeFrame) => {
  switch (timeFrame) {
    case "Monthly":
      return "monthly";
    case "Yearly":
      return "yearly";
    default:
      return "weekly";
  }
};

export default function TotalClasses() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("Monthly");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [classData, setClassData] = useState<ChartItem[]>([]);
  const [totalClasses, setTotalClasses] = useState(0);

  const fetchClassData = async (token: string, range: TimeFrame) => {
    try {
      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.DASHBOARD.DASHBOARD_ADMIN_TOTAL_CLASSES}?dateRange=${getDateRangeParam(
          range
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const totals: ClassRecord = await res.json();
      console.log("Fetched class data:", totals); // Log the fetched data

      const chartData: ChartItem[] = [
        { type: "Completed", count: totals.classCompleted, color: "#4CAF50" },
        {
          type: "Rescheduled",
          count: totals.classRescheduled,
          color: "#9B82FF",
        },
        { type: "Scheduled", count: totals.classScheduled, color: "#FBC02D" },
        { type: "Cancelled", count: totals.classCancelled, color: "#F44336" },
      ];

      setClassData(chartData);
      setTotalClasses(
        totals.classCompleted +
          totals.classScheduled +
          totals.classRescheduled +
          totals.classCancelled
      );
    } catch (error) {
      console.error("Failed to fetch class data:", error);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("AdminAuthToken");
      if (token) {
        fetchClassData(token, timeFrame);
      }
    }
  }, [timeFrame]);


  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectTimeFrame = (selected: TimeFrame) => {
    setTimeFrame(selected);
    setIsDropdownOpen(false);
  };
  return (
    <div className="bg-[#fff] rounded-xl p-5 shadow-sm w-full dark:bg-[#343434]">
      {/* Header */}
      <div className="flex items-center justify-between ">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-[#fff]">Total Classes</h2>
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center text-xs font-medium bg-[#EFEFEF] color-[#747474] border border-gray-300 rounded px-3 py-1 dark:bg-[#565656] dark:text-[#FFFFFF]"
          >
            {timeFrame}
            <ChevronDown className="ml-1 h-4 w-4" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-[#EFEFEF] color-[#747474] rounded shadow-lg z-10 ">
              {(["Weekly", "Monthly", "Yearly"] as TimeFrame[]).map(
                (option) => (
                  <button
                    key={option}
                    onClick={() => selectTimeFrame(option)}
                    className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 dark:bg-[#565656] dark:text-[#FFFFFF]"
                  >
                    {option}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        {/* Chart Container with Y-axis */}
        <div className="flex items-end justify-center gap-2 h-56">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between h-48 pr-2 text-[11px] text-gray-500 dark:text-[#fff]">
            {[300, 250, 200, 150, 100, 50, 0].map((label) => (
              <div key={label} className="h-full flex items-center justify-end">
                {label}
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-center gap-6 h-46">
            {classData.map((item) => (
              <div key={item.type} className="flex flex-col items-center">
                {/* Bar background container */}
                <div className="w-7 md:w-7 h-48 bg-gray-200 rounded-lg flex flex-col justify-end overflow-hidden dark:bg-[#505050]">
                  {/* Fill bar */}
                  <div
                    className="w-full rounded-lg transition-all duration-500 "
                    style={{
                      height: `${(item.count / 300) * 100}%`, // Use 300 as max for fixed scale
                      backgroundColor: item.color,
                    }}
                    title={`${item.count} ${item.type}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total + breakdown */}
        <div className="flex flex-col items-center gap-10 w-full md:w-auto">
          {/* Total Classes Box */}
          <div className="bg-[#7D8597] text-white rounded-md mt-16 px-4 py-2 font-medium text-sm text-center w-full md:w-48">
            Total Classes - {totalClasses}
          </div>

          {/* Two-column breakdown */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-48">
            {/* Left column */}
            <div className="flex flex-col items-center gap-3">
              {/* Completed */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span
                    className="inline-block w-3 h-3 rounded"
                    style={{ backgroundColor: "#79BA89" }}
                  ></span>
                  <span className="text-gray-600 text-xs dark:text-[#7A7A7A]">Completed</span>
                </div>
                <span className="font-semibold mr-11 text-gray-900 text-xs dark:text-[#fff]">
                  {classData.find((item) => item.type === "Completed")?.count}
                </span>
              </div>

              {/* Pending */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span
                    className="inline-block w-3 h-3 rounded"
                    style={{ backgroundColor: "#F9C479" }}
                  ></span>
                  <span className="text-gray-600 mr-4 text-xs dark:text-[#7A7A7A]">Pending</span>
                </div>
                <span className="font-semibold mr-11 text-gray-900 text-xs dark:text-[#fff]">
                  {classData.find((item) => item.type === "Scheduled")?.count}
                </span>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col items-center gap-3">
              {/* Completed */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span
                    className="inline-block w-3 h-3 rounded"
                    style={{ backgroundColor: "#968AEA" }}
                  ></span>
                  <span className="text-gray-600 text-xs dark:text-[#7A7A7A]">Rescheduled</span>
                </div>
                <span className="font-semibold mr-12 text-gray-900 text-xs dark:text-[#fff]">
                  {classData.find((item) => item.type === "Rescheduled")?.count}
                </span>
              </div>

              {/* Pending */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span
                    className="inline-block w-3 h-3 rounded"
                    style={{ backgroundColor: "#F87F7F" }}
                  ></span>
                  <span className="text-gray-600 mr-4 text-xs dark:text-[#7A7A7A]">Cancelled</span>
                </div>
                <span className="font-semibold mr-12 text-gray-900 text-xs dark:text-[#fff]">
                  {classData.find((item) => item.type === "Cancelled")?.count}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
