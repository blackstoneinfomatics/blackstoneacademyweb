"use client";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  TooltipProps,
} from "recharts";

interface AttendanceResponse {
  totalTeachers: number;
  maleTeachers: number;
  femaleTeachers: number;
  maleAttendancePresent: number;
  maleAttendanceAbsent: number;
  femaleAttendancePresent: number;
  femaleAttendanceAbsent: number;
}

interface PieChartData {
  name: string;
  value: number;
  color: string;
}


const Teacherscard: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceResponse | null>(null);
  const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
    const isDark = typeof window !== "undefined" && document.documentElement.classList.contains("dark");
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-2 rounded shadow-md text-[12px] border ${
            isDark
              ? "bg-[#22223b] text-white border-[#444]"
              : "bg-white text-[#22223b] border-gray-200"
          }`}
        >
          <div className={`font-normal ${isDark ? 'text-white' : 'text-[#22223b]'}`}>{payload[0].payload.name}</div>
          <div>
            {payload.map((entry: any, idx: number) => (
              <div key={idx} className={isDark ? 'text-white text-[10px]' : 'text-[#22223b] text-[10px]'}>
                {entry.payload.value} 
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const COLORS = ["#9FD0FF", "#F3A8FF"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("AcademicCoachAuthToken");

        const res = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.DASHBOARD.GET_TEACHERS_ATTENDANCE}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch attendance data");

        const data: AttendanceResponse = await res.json();
        setAttendanceData(data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchData();
  }, []);

  const pieData: PieChartData[] = attendanceData
    ? [
        {
          name: "Male",
          value: attendanceData.maleTeachers,
          color: "#9FD0FF",
        },
        {
          name: "Female",
          value: attendanceData.femaleTeachers,
          color: "#F3A8FF",
        },
      ]
    : [];

  const getPercent = (count: number, total: number) =>
    total > 0 ? `${Math.round((count / total) * 100)}%` : "0%";

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#343434] rounded-xl p-2 h-[270px]">
      <div className="w-full flex justify-between items-center">
        <h3 className="text-[#010E30] text-[16px] mb-2 px-3 py-2 font-semibold dark:text-[#ffff]">
          Teachers
        </h3>
        <div className="flex gap-1 px-4">
          <div className="flex items-center gap-[3px]">
            <div className="w-[10px] h-[10px] bg-[#EF95F4] rounded-[2px]"></div>
            <span className="text-[9px] text-[#010E30] opacity-70 dark:text-white/70">Female</span>
          </div>
          <div className="flex items-center gap-[3px]">
            <div className="w-[10px] h-[10px] bg-[#9fd0ff] rounded-[2px]"></div>
            <span className="text-[9px] text-[#010E30] opacity-70 dark:text-white/70">Male</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center mt-0 dark:text-[#242424]">
        <PieChart width={200} height={200}>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={90}
            dataKey="value"
            stroke="none"
            labelLine={false}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
              const RADIAN = Math.PI / 180;
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              const item = pieData[index];
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[13px] font-medium fill-[#010E30]"
                >
                  {item.value}
                </text>
              );
            }}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>

          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[14px] font-semibold fill-[#010E30] dark:fill-white dark:text-white/80"
          >
            {attendanceData?.totalTeachers ?? 0}
          </text>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
        </PieChart>
      </div>

      <div className="grid grid-cols-2 mt-6 gap-4 text-[11px] font-medium">
        {/* Total Present */}
        <div className="flex flex-col items-center">
          <span className="text-[#010E30] dark:text-[#fff]">Total Present</span>
          <div className="flex gap-2 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-[4px] h-[12px] rounded-sm bg-[#F3A8FF]" />
              <span>
                {getPercent(
                  attendanceData?.femaleAttendancePresent || 0,
                  attendanceData?.femaleTeachers || 0
                )}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-[4px] h-[12px] rounded-sm bg-[#9FD0FF]" />
              <span>
                {getPercent(
                  attendanceData?.maleAttendancePresent || 0,
                  attendanceData?.maleTeachers || 0
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Total Absent */}
        <div className="flex flex-col items-center">
          <span className="text-[#010E30] dark:text-[#fff]">Total Absent</span>
          <div className="flex gap-2 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-[4px] h-[12px] rounded-sm bg-[#F3A8FF]" />
              <span>
                {getPercent(
                  attendanceData?.femaleAttendanceAbsent || 0,
                  attendanceData?.femaleTeachers || 0
                )}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-[4px] h-[12px] rounded-sm bg-[#9FD0FF]" />
              <span>
                {getPercent(
                  attendanceData?.maleAttendanceAbsent || 0,
                  attendanceData?.maleTeachers || 0
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teacherscard;
