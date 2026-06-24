"use client";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

interface ApiResponse {
  genderBreakdownBySubject: GenderDataItem[];
}

interface GenderDataItem {
  subject: string;
  male: number;
  female: number;
  malePercentage: string;
  femalePercentage: string;
}

interface PieChartData {
  name: string;
  male: number;
  female: number;
  totalCount: number;
  value: number;
  color: string;
}

const COLORS = ["#AFC0FF", "#9FD0FF", "#B9DDFF"]; // Customize as needed

const GenderPieChart: React.FC = () => {
  const [genderData, setGenderData] = useState<PieChartData[]>([]);
  const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
useEffect(() => {
  const fetchGenderData = async () => {
    setLoading(true);
    setError("");

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("SupervisorAuthToken")
          : null;

      if (!token) {
        setError("Authentication token not found");
        return;
      }

      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.DASHBOARD.GET_TEACHER_FEMALEMALE}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        switch (response.status) {
          case 401:
            setError("Session expired. Please login again.");
            break;
          case 403:
            setError("Permission denied.");
            break;
          case 404:
            setError("Gender statistics not found.");
            break;
          case 500:
            setError("Server error.");
            break;
          default:
            setError("Failed to load chart data.");
        }

        return;
      }

      const data: ApiResponse = await response.json();

      if (
        !data ||
        !Array.isArray(data.genderBreakdownBySubject)
      ) {
        setError("Invalid API response");
        return;
      }

      if (data.genderBreakdownBySubject.length === 0) {
        setGenderData([]);
        return;
      }

      const transformed: PieChartData[] =
        data.genderBreakdownBySubject.map(
          (item: GenderDataItem, index: number) => {
            const total = item.male + item.female;

            return {
              name: item.subject.replace(" Teacher", ""),
              male: item.male,
              female: item.female,
              totalCount: total,
              value: total,
              color: COLORS[index % COLORS.length],
            };
          }
        );

      setGenderData(transformed);
    } catch (error) {
      console.error("Gender API Error:", error);

      setError("Unable to load gender statistics.");
      setGenderData([]);
    } finally {
      setLoading(false);
    }
  };

  fetchGenderData();
}, []);

if (error) {
  return (
    <div className="bg-white dark:bg-[#343434] rounded-xl shadow-lg p-4 h-[270px] flex items-center justify-center">
      <span className="text-sm text-red-500">
        {error}
      </span>
    </div>
  );
}

if (genderData.length === 0) {
  return (
    <div className="bg-white dark:bg-[#343434] rounded-xl shadow-lg p-4 h-[270px] flex items-center justify-center">
      <span className="text-sm text-gray-500">
        No data available
      </span>
    </div>
  );
}

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#343434] rounded-xl shadow-lg p-4 h-[270px]">
      <div className="w-full flex justify-between items-center">
        <h3 className="text-[#010E30] text-[13px] font-semibold dark:text-[#ffff]">
          Subject
        </h3>
        <div className="flex gap-1">
          <div className="flex items-center gap-[3px]">
            <div className="w-[6px] h-[6px] bg-pink-400 rounded-sm"></div>
            <span className="text-[9px] text-[#010E30] dark:text-white/70">
              Female
            </span>
          </div>
          <div className="flex items-center gap-[3px]">
            <div className="w-[6px] h-[6px] bg-blue-400 rounded-sm"></div>
            <span className="text-[9px] text-[#010E30] dark:text-white/70">
              Male
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center mt-1 dark:text-[#242424]">
        <PieChart width={150} height={150}>
          <Pie
            data={genderData}
            cx="50%"
            cy="50%"
            innerRadius={28}
            outerRadius={70}
            dataKey="value"
            labelLine={false}
            stroke="none"
            label={({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
              const RADIAN = Math.PI / 180;
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);

              const data = genderData[index ?? 0];

if (!data) return null;
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[12px] font-medium fill-[#010E30]"
                >
                  {`${data.totalCount}`}%
                </text>
              );
            }}
          >
            {genderData.map((item) => (
              <Cell key={item.name} fill={item.color} />
            ))}
          </Pie>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[14px] font-semibold fill-[#010E30] dark:fill-white dark:text-white/80"
          >
            100%
          </text>
          <Tooltip
            wrapperStyle={{
              fontSize: "10px",
              padding: "4px 6px",
            }}
          />
        </PieChart>
      </div>

      <div className="grid grid-cols-3 gap-1 w-full mt-6">
        {genderData.map((item) => (
          <div
            key={item.name}
            className="flex flex-col items-center text-center"
          >
            <div className="flex items-center gap-[1px]">
              <div
                className="w-[10px] h-[10px] rounded-[2px]"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-[9px] font-semibold text-[#010E30] dark:text-[#FFFF]">
                {item.name}
              </span>
            </div>
            <div className="flex gap-1 mt-[2px]">
              <div className="flex flex-col items-center gap-[1px]">
                <div className="w-[3px] h-[8px] bg-pink-400 rounded-[2px]"></div>
                <span className="text-[8px] font-medium">
                  {item.female}
                </span>
              </div>
              <div className="flex flex-col items-center gap-[1px]">
                <div className="w-[3px] h-[8px] bg-blue-400 rounded-sm"></div>
                <span className="text-[8px] font-medium">
                  {item.male}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenderPieChart;
