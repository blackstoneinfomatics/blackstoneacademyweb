"use client";
import "./DateRange.css";

import React, { useState, useEffect } from "react";
import { DateRange, Range } from "react-date-range";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
// import "../../../../public/assets/css/supervisordashcalendar.css";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ApplicationChart = () => {
  const [range, setRange] = useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [showCalendar, setShowCalendar] = useState(false);

  const [fromDate, setFromDate] = useState<string>(
    format(new Date(new Date().setDate(new Date().getDate() - 6)), "yyyy-MM-dd")
  );
  const [toDate, setToDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [applicationData, setApplicationData] = useState([]);

  const fetchData = async (from: string, to: string) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("SupervisorAuthToken")
          : null;

      if (!token) {
        console.error("❌ SupervisorAuthToken not found");
        return;
      }

      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.APPLICANTS.GET_APPLICATION_SUPERVISOR}?fromDate=${from}&toDate=${to}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();

      const transformed = data.map((item: any) => ({
        date: format(new Date(item.date), "dd MMM"),
        applied: item.totalApplied || 0,
        shortlisted: item.shortlisted || 0,
      }));

      setApplicationData(transformed);
    } catch (error) {
      console.error("Failed to fetch application data:", error);
      setApplicationData([]);
    }
  };

  useEffect(() => {
    fetchData(fromDate, toDate);
  }, []);

useEffect(() => {
  if (!fromDate || !toDate) return;

  const from = new Date(fromDate);
  const to = new Date(toDate);

  if (from > to) {
    toast.error("From Date cannot be greater than To Date");
    return;
  }

  fetchData(fromDate, toDate);
}, [fromDate, toDate]);

const validateDateRange = (
  startDate: Date | undefined,
  endDate: Date | undefined
) => {
  if (!startDate || !endDate) {
    toast.error("Please select both From Date and To Date");
    return false;
  }

  if (startDate > endDate) {
    toast.error("From Date cannot be greater than To Date");
    return false;
  }

  const today = new Date();

  if (endDate > today) {
    toast.error("Future dates are not allowed");
    return false;
  }

  return true;
};

  return (
    <div className="w-full relative">
      <div className="bg-white rounded-xl h-[270px] dark:bg-[#343434] shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 px-4">
          <h3 className="text-[#010E30] text-[14px] mt-0 font-semibold dark:text-[#ffff]">
            Application
          </h3>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-[10px] h-[10px] rounded-[2px] bg-[#a6c1ff]" />
              <span className="text-[9px] font-light text-[#010E30] dark:text-white">
                Applied
              </span>
            </div>

            <div className="flex items-center gap-1">
              <div className="w-[10px] h-[10px] rounded-[2px] bg-[#d5e0ff]" />
              <span className="text-[9px] font-light text-[#010E30] dark:text-white">
                Shortlisted
              </span>
            </div>
          </div>

          {/* Date pickers */}
          <div className="relative flex flex-col gap-0 p-1">
            <div
              className="flex items-center gap-1 px-2 py-1 mb-1 bg-[#efefef] dark:bg-[#565656] rounded-md cursor-pointer text-[8px]"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <span className="dark:text-white">
                {format(range[0].startDate!, "dd MMM")} -{" "}
                {format(range[0].endDate!, "dd MMM")}
              </span>
            </div>

            {showCalendar && (
              <div className="absolute z-50">
                <div className="scale-[0.80] origin-top-left ">
                  <DateRange
                    editableDateInputs={true}
                    onChange={(item) => {
  const selection = item.selection;

  const startDate = selection.startDate;
  const endDate = selection.endDate;

  if (!validateDateRange(startDate, endDate)) {
    return;
  }

  setRange([selection]);
  setFromDate(format(startDate!, "yyyy-MM-dd"));
  setToDate(format(endDate!, "yyyy-MM-dd"));

  setShowCalendar(false);

  toast.success("Date range updated");
}}
                    moveRangeOnFirstSelection={false}
                    ranges={range}
                    months={1}
                    direction="horizontal"
                    className="shadow-lg rounded-md"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="text-black dark:text-white/80">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={applicationData}
              margin={{ top: 0, right: 10, left: 0, bottom: 5 }}
              barCategoryGap="25%"
            >
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "currentColor" }}
                padding={{ left: 4, right: 20 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 8, fill: "currentColor" }}
                domain={[0, 20]}
                ticks={[0, 5, 10, 15, 20]}
              />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar
                dataKey="applied"
                stackId="a"
                fill="#a6c1ff"
                radius={[0, 0, 12, 12]}
              />
              <Bar
                dataKey="shortlisted"
                stackId="a"
                fill="#d5e0ff"
                radius={[12, 12, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop
  closeOnClick
  pauseOnHover
  draggable
  theme="colored"
/>
    </div>
  );
};

export default ApplicationChart;
