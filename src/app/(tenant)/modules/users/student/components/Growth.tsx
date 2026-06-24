"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";

type ViewMode = "weekly" | "monthly" | "yearly";

interface StudentLevel {
  studentId: string;
  level: string;
  monthLabel: string;
  weekLabel: string;
}

interface APIResponse {
  studentCount: number;
  studentCountByLevel: StudentLevel[];
  fromDate: string;
  toDate: string;
}

const Growth: React.FC = () => {
  const [levels, setLevels] = useState<number[]>([]);
  const [maxLevel, setMaxLevel] = useState<number>(5);
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");

  const width = 1000;
  const height = 160;
  const padding = 0;

  const labels =
    viewMode === "weekly"
      ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      : viewMode === "monthly"
      ? [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ]
      : Array.from({ length: 5 }, (_, i) =>
          (new Date().getFullYear() - 4 + i).toString()
        );

  const points = levels.map((val, i) => {
    const x = (i / (labels.length - 1)) * width;
    const y = height - (val / maxLevel) * (height - padding);
    return { x, y, val };
  });

  const getLinearPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return "";
    return `M${pts.map((p) => `${p.x},${p.y}`).join(" L")}`;
  };

  const linePath = getLinearPath(points);
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  useEffect(() => {
    const studentId = localStorage.getItem("StudentPortalId");
   if (!studentId) {
  console.error(
    AppValidationMessages.AUTH.STUDENT_REQUIRED
  );
  return;
}

  const token = localStorage.getItem("StudentAuthToken");

if (!token) {
  console.error(
    AppValidationMessages.AUTH.TOKEN_REQUIRED
  );
  return;
}
    const fetchData = async () => {
      try {
        const res = await axios.get<APIResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.ALSTUDENTS_STUDENTS_LEVEL}?studentId=${studentId}`,{
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
        );
        const data = res.data.studentCountByLevel;
           if (!data || data.length === 0) {
  console.log(
    AppValidationMessages.GROWTH.NO_PROGRESS_DATA
  );

  setLevels([]);
  return;
}
        let updatedLevels: number[] = [];
        let highestLevel = 5;    

        if (viewMode === "monthly") {
          updatedLevels = Array(12).fill(0);
          const monthMap: { [key: string]: number } = {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11,
          };

          data.forEach((entry) => {
            const [month] = entry.monthLabel.split(" ");
            const idx = monthMap[month];
            const levelNum = parseInt(entry.level);
            if (idx !== undefined) {
              updatedLevels[idx] = levelNum;
              if (levelNum > highestLevel) highestLevel = levelNum;
            }
          });
        }

        if (viewMode === "weekly") {
          updatedLevels = Array(7).fill(0);
          data.forEach((entry) => {
            const date = new Date(entry.weekLabel);
            const idx = date.getDay();
            const levelNum = parseInt(entry.level);
            updatedLevels[idx] = levelNum;
            if (levelNum > highestLevel) highestLevel = levelNum;
          });
        }

        if (viewMode === "yearly") {
          const currentYear = new Date().getFullYear();
          updatedLevels = Array(5).fill(0);
          data.forEach((entry) => {
            const year =
              parseInt(entry.monthLabel.split(" ")[1]) || currentYear;
            const idx = year - (currentYear - 4);
            const levelNum = parseInt(entry.level);
            if (idx >= 0 && idx < 5) {
              updatedLevels[idx] = levelNum;
              if (levelNum > highestLevel) highestLevel = levelNum;
            }
          });
        }

        setLevels(updatedLevels);
        setMaxLevel(highestLevel);
      }catch (err) {
  console.error(
    AppFailureToastMessages.GROWTH_FETCH,
    err
  );
}
    };

    fetchData();
  }, [viewMode]);

  return (
    <div className="bg-white dark:bg-[#343434] rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[16px] dark:text-white font-semibold text-[#0f172a]">
        Learning Progress
        </h2>
        <div className="w-20">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            className="w-full px-1 py-1 text-[10px] rounded-md border border-gray-300 dark:border-[#343434] bg-white dark:bg-[#565656] text-[#3E5E8A] dark:text-white"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      <div className="flex">
        <div className="flex flex-col justify-between text-xs text-slate-400 dark:text-gray-400 mr-3 h-[160px] pt-2 pb-4">
          {Array.from({ length: maxLevel }, (_, i) => maxLevel - i).map(
            (label) => (
              <div
                key={label}
                className="h-[26px] flex items-center justify-end pr-1"
              >
                <span className="block leading-none">L{label}</span>
              </div>
            )
          )}
        </div>

        <div className="relative flex-1 h-[150px] -ml-1">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#86efac" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Background horizontal grid lines */}
            {Array.from({ length: maxLevel }, (_, i) => {
              const y = height - ((i + 1) / maxLevel) * (height - padding);
              return (
                <line
                  key={`h-${i}`}
                  x1={0}
                  y1={y}
                  x2={width}
                  y2={y}
                  stroke="#d9d9d9"
                  strokeOpacity={0.2}
                  strokeWidth={1}
                  // strokeDasharray="4 4"
                />
              );
            })}

            {/* Background vertical grid lines */}
            {labels.map((_, i) => {
              const x = (i / (labels.length - 1)) * width;
              return (
                <line
                  key={`v-${i}`}
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={height}
                  stroke="#d9d9d9"
                  strokeOpacity={0.2}
                  strokeWidth={1}
                  // strokeDasharray="4 4"
                />
              );
            })}

            <path d={areaPath} fill="url(#greenGradient)" stroke="none" />
            <path
              d={linePath}
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#22c55e"
                stroke="#fff"
                strokeWidth="1.5"
              />
            ))}
          </svg>
        </div>
      </div>

      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-300 mt-2 px-4">
        {labels.map((label, i) => (
          <span key={i} className="text-center">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Growth;
