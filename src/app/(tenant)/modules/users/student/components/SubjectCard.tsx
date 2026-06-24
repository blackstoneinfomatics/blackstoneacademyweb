"use client";
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface ApiResponse {
  totalCount: number;
  classSchedule: {
    scheduleStatus: string;
    totalHourse: number;
  }[];
}

const COLORS = {
  Completed: "#9FD0FF", // light blue
  Pending: "#AFC0FF",   // light purple
};

const Subjectcard: React.FC = () => {
  const [data, setData] = useState<PieChartData[]>([]);
  const [totalHours, setTotalHours] = useState<number>(0);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const studentId = localStorage.getItem("StudentPortalId");
        const token = localStorage.getItem("StudentAuthToken");

        if (!studentId || !token) return;

        const response = await axios.get<ApiResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET_CLASSSHEDULE_STUDENTS}`,
          {
            params: { studentId },
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const classes = response.data.classSchedule;

        let completedHours = 0;
        let pendingHours = 0;

        classes.forEach((cls) => {
          if (cls.scheduleStatus === "Completed") {
            completedHours += cls.totalHourse;
          } else if (
            ["Scheduled", "Rescheduled", "Reschedulerequested"].includes(
              cls.scheduleStatus
            )
          ) {
            pendingHours += cls.totalHourse;
          }
        });

        const total = completedHours;

        setTotalHours(total);

        const chartData: PieChartData[] = [
          {
            name: "Completed",
            value: completedHours,
            color: COLORS.Completed,
          },
          {
            name: "Pending",
            value: pendingHours,
            color: COLORS.Pending,
          },
        ];

        setData(chartData);
      } catch (error) {
        console.error("Failed to fetch class data:", error);
      }
    };

    fetchClasses();
  }, []);

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const [dashboardCounts, setDashboardCounts] = useState({
    totalLevel: 0,
    totalAttendance: 0,
    totalClasses: 0,
    presentCount: 0,
    totalDuration: 0,
  });
  useEffect(() => {
    const storedCourseName = localStorage.getItem("StudentcourseName"); // Check the casing
    if (storedCourseName) {
      console.log(storedCourseName);
    } else {
      console.warn("⚠️ No courseName found in localStorage");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("StudentAuthToken");
        const studentId = localStorage.getItem("StudentPortalId");
        const courseName = localStorage.getItem("StudentcourseName"); // check exact key

        if (!token || !studentId || !courseName) {
          console.error("❌ studentId or courseName missing in localStorage");
          return;
        }

        const response = await axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.DASHBOARD.DASHBOARD_STUDENT_COUNTS}`, {
          params: { studentId, courseName },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        setDashboardCounts({
          totalLevel: Number(response.data.totalLevel) || 0,
          totalAttendance: Number(response.data.totalAttendance) || 0,
          totalClasses: Number(response.data.totalClasses) || 0,
          presentCount: 0,
          totalDuration: Number(response.data.totalDuration) || 0,
        });

      

      } catch (error) {
        console.error("❌ Error fetching dashboard counts:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white dark:bg-[#343434] rounded-xl shadow p-4 h-[265px] w-[320px]">
      {/* Title & Legend */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-[#010E30] text-[16px] font-semibold dark:text-white">
          Class Hours
        </h3>
        <div className="flex gap-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-[2px]">
              <div
                className="w-[10px] h-[10px] rounded-[3px] -mt-1"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-[10px] text-[#010E30] dark:text-white">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Donut Chart */}
      <div className="flex justify-center items-center relative">
        <PieChart width={180} height={180}>
          <Pie
      data={data}
      cx="50%"
      cy="50%"
      innerRadius={45}
      outerRadius={90}
      dataKey="value"
      stroke="none"
      labelLine={false}
      label={({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5; // centered position
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        const percent =
          totalValue > 0
            ? ((data[index].value / totalValue) * 100).toFixed(0)
            : "0";
      
        return (
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-[10px] font-semibold fill-[#010E30]"
          >
            {percent}%
          </text>
        );
      }}
      
    >
      {data.map((entry) => (
        <Cell key={entry.name} fill={entry.color} />
      ))}
    </Pie>
        </PieChart>

        {/* Center Label */}
        <div className="absolute text-center text-[#010E30] dark:text-white text-[20px] font-semibold">
          100%
        </div>
      </div>

      {/* Bottom Summary */}
      <p className="text-center text-[12px] text-[#4178C4] dark:text-white mt-2">
        Total Class Hours - {Math.floor(dashboardCounts.totalDuration)} {""}
        Hours
      </p>
    </div>
  );
};

export default Subjectcard;
