"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { toast } from "react-toastify";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";

interface StatsData {
  scheduled: number;
  completed: number;
  absent: number;
}

const COLORS = {
  scheduled: "#B1A7F2", // light purple
  completed: "#6BE6C1", // green
  absent: "#FFA9A9", // pink
};

const ClassAnalyticsChart = () => {
  const [data, setData] = useState<StatsData>({
    scheduled: 0,
    completed: 0,
    absent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const teacherId = localStorage.getItem("TeacherPortalId");
      const token = localStorage.getItem("TeacherAuthToken");

      if (!teacherId) {
  toast.error(
    AppValidationMessages.AUTH.TEACHER_REQUIRED
  );
  setLoading(false);
  return;
}

if (!token) {
  toast.error(
    AppValidationMessages.AUTH.TOKEN_REQUIRED
  );
  setLoading(false);
  return;
}

      const response = await axios.get<StatsData>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TEACHER_COUNT}?teacherId=${teacherId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (
  response.data.scheduled === 0 &&
  response.data.completed === 0 &&
  response.data.absent === 0
) {
  toast.warning(
    AppValidationMessages.CLASS.NO_ANALYTICS_DATA
  );
}

      setData({
        scheduled: response.data.scheduled || 0,
        completed: response.data.completed || 0,
        absent: response.data.absent || 0,
      });
    } catch (err: any) {
  toast.error(
    AppFailureToastMessages.CLASS_ANALYTICS_FETCH
  );

  setError(
    err?.response?.data?.message ||
    err.message ||
    "API Error"
  );
} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="w-full h-full flex items-center justify-center">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="w-full h-full flex items-center justify-center text-red-600">
        {error}
      </div>
    );

  const segments = [
    { label: "Scheduled", value: data.scheduled, color: COLORS.scheduled },
    { label: "Completed", value: data.completed, color: COLORS.completed },
    { label: "Absent", value: data.absent, color: COLORS.absent },
  ];

  const radii = [66, 58, 48];
  const SIZE = 112;
  const CENTER = SIZE / 2;

  const getDashArray = (value: number, radius: number) => {
    const circumference = 2 * Math.PI * radius;
    const percent = Math.min(value, 100);
    const dash = (percent / 100) * circumference;
    const gap = circumference - dash;
    return `${dash} ${gap}`;
  };

  return (
    <div className="w-full h-full bg-white dark:bg-[#343434] rounded-2xl shadow p-4 sm:p-6 flex flex-col">
      <h2 className=" font-semibold text-gray-900 dark:text-white mb-6 text-[16px]">
        Class Analytics
      </h2>

      {/* Chart + Legend */}
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center w-full">
        {/* Donut Chart */}
        <div className="relative w-[40vw] max-w-[220px] aspect-square">
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="w-full h-full overflow-visible"
          >
            {segments.map((seg, i) => {
              const radius = radii[i];
              return (
                <circle
                  key={i}
                  cx={CENTER}
                  cy={CENTER}
                  r={radius}
                  stroke={seg.color}
                  strokeWidth={6}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={getDashArray(seg.value, radius)}
                  transform={`rotate(-90 ${CENTER} ${CENTER})`}
                  style={{ transition: "stroke-dasharray 0.8s ease-in-out" }}
                />
              );
            })}
          </svg>

          {/* Center value */}
          <div className="absolute -mt-7 inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-[18px] font-extrabold text-gray-900 dark:text-white">
              {data.scheduled + data.completed + data.absent}
            </div>
            <div className="text-[7px] text-gray-500 dark:text-gray-300 uppercase text-center -mt-1 leading-tight">
              TOTAL CLASS <br /> ASSIGNED
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col space-y-2 mt-6 sm:mt-0 sm:ml-10 w-[70%] sm:w-40">
          {segments.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between w-full -mt-6 gap-6"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700 dark:text-white text-[12px] font-medium">
                  {item.label}
                </span>
              </div>
              <span className="text-gray-900 dark:text-white text-[13px] font-semibold text-right">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassAnalyticsChart;
