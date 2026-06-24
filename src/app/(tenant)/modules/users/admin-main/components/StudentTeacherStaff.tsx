"use client";

import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";
import React, { useEffect, useState } from "react";
import {
  Tooltip,
  PieChart,
  Pie,
  TooltipProps,
} from "recharts";

interface DashboardCount {
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  totalTeachers: number;
  maleTeachers: number;
  femaleTeachers: number;
  totalStaffs: number;
  maleStaffs: number;
  femaleStaffs: number;
}

interface GroupedData {
  title: string;
  count: number;
  male: number;
  female: number;
}

const StudentTeacherStaff = () => {
  const COLORS = ["#72DAF3", "#EF95F4", "#E5E5E5"];
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [data, setData] = useState<GroupedData[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("AdminAuthToken");
      if (token) {
        fetchData(token);
      } else {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      }
    }
  }, []);

  const fetchData = async (token: string) => {
    try {
      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.DASHBOARD.GET_ADMIN_COUNT}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const json: DashboardCount = await res.json();

      const grouped: GroupedData[] = [
        {
          title: "Students",
          count: json.totalStudents,
          male: json.maleStudents,
          female: json.femaleStudents,
        },
        {
          title: "Teachers",
          count: json.totalTeachers,
          male: json.maleTeachers,
          female: json.femaleTeachers,
        },
        {
          title: "Staffs",
          count: json.totalStaffs,
          male: json.maleStaffs,
          female: json.femaleStaffs,
        },
      ];

      setData(grouped);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<any, any>) => {
    const isDark =
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark");
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-2 flex gap-1 rounded shadow-md text-[10px] border ${
            isDark
              ? "bg-[#343434] text-white border-[#444]"
              : "bg-white text-[#22223b] border-gray-200"
          }`}
        >
          <div
            className={`font-normal ${
              isDark ? "text-white" : "text-[#22223b]"
            }`}
          >
            {payload[0].payload.name}
          </div>
          <div>
            {payload.map((entry: any, idx: number) => (
              <div
                key={idx}
                className={
                  isDark
                    ? "text-white text-[10px]"
                    : "text-[#22223b] text-[10px]"
                }
              >
                [{entry.payload.value}]
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex gap-4 p-0 w-full">
      {data.map((item) => (
        <div
          key={item.title}
          className="bg-white dark:bg-[#343434] flex flex-row justify-between items-center p-4 rounded-2xl shadow-lg h-[120px] w-full"
        >
          <div>
            <div className="text-[14px] text-black mt-1 dark:text-white">
              {item.title}
            </div>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-semibold">
                {(item.count ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center mt-2">
              <div className="flex flex-col sm:flex-row text-sm gap-2">
                <div className="flex items-center text-[12px]">
                  <span className="w-2 h-2 bg-[#EF95F4] rounded-[2px] mr-2" />
                  <span>Female</span>
                </div>
                <div className="flex items-center text-[12px]">
                  <span className="w-2 h-2 bg-[#72DAF3] rounded-[2px] mr-2" />
                  <span>Male</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center w-[88px] h-[88px]">
            <PieChart width={90} height={90}>
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "transparent" }}
              />

              {/* Outer ring for male only */}
              <Pie
                data={[{ name: "male-ring", value: item.male }]}
                cx={44}
                cy={44}
                innerRadius={37}
                outerRadius={40}
                startAngle={90}
                endAngle={90 + (item.male / (item.male + item.female)) * 360}
                fill={isDarkMode ? "#555555" : COLORS[2]}
                stroke="none"
                dataKey="value"
              />

              {/* Male segment */}
              <Pie
                data={[{ name: "male", value: item.male }]}
                cx={44}
                cy={44}
                innerRadius={0}
                outerRadius={34}
                startAngle={90}
                endAngle={90 + (item.male / (item.male + item.female)) * 360}
                fill={COLORS[0]}
                stroke="none"
                dataKey="value"
              />

              {/* Female segment */}
              <Pie
                data={[{ name: "female", value: item.female }]}
                cx={44}
                cy={44}
                innerRadius={0}
                outerRadius={34}
                startAngle={90 + (item.male / (item.male + item.female)) * 360}
                endAngle={450}
                fill={COLORS[1]}
                stroke="none"
                dataKey="value"
              />
            </PieChart>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentTeacherStaff;
