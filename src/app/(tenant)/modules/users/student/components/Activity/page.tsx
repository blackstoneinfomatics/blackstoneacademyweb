"use client";
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
  ChartOptions,
  TooltipItem,
} from "chart.js";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler
);

const TeachingActivity = () => {
  const [chartData, setChartData] = useState<number[]>(Array(12).fill(0));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTeachingActivity = async () => {
      try {
        const studentId = localStorage.getItem("StudentPortalId");
    const token =
    typeof window !== "undefined" ? localStorage.getItem("StudentAuthToken") : null;

  if (!token) {
    console.error("❌ StudentAuthToken not found");
    return;
  }
        if (!studentId || !token) {
          console.warn(
            "Missing StudentPortalId or StudentAuthToken in localStorage."
          );
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET_CLASSSCHEDULE_ACTIVITY}`,
          {
            params: { studentId },
            headers:{
              "Authorization":`Bearer ${token}`,
            }
          }
        );

        console.log("API Response Data:", response.data);

        if (!response.data || !Array.isArray(response.data)) {
          console.warn("No valid class schedule data received:", response.data);
          setLoading(false);
          return;
        }

        // Get the current year
        const currentYear = new Date().getFullYear();
        const monthlyData = Array(12).fill(0);

        response.data.forEach((entry: any) => {
          if (!entry.month || !entry.totalHours) return;

          const [year, month] = entry.month.split("-"); // "2025-01" → ["2025", "01"]
          const monthIndex = parseInt(month, 10) - 1; // Convert "01" to index 0
          const entryYear = parseInt(year, 10);

          if (entryYear === currentYear && monthIndex >= 0 && monthIndex < 12) {
            monthlyData[monthIndex] = entry.totalHours; // Store total hours only for the current year
          }
        });

        console.log(`📅 Filtered data for ${currentYear}:`, monthlyData);

        setChartData([...monthlyData]); // Update state
      } catch (error) {
        console.error("Error fetching teaching activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachingActivity();
  }, []);

  const chartConfig = {
    labels: [
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
    ],
    datasets: [
      {
        label: "Teaching Activity",
        data: chartData,
        borderColor: "#ffffff",
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );
          gradient.addColorStop(0, "#536680");
          gradient.addColorStop(1, "#FEFEFE");
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBorderColor: "#012A4A",
        pointBackgroundColor: "white",
        pointRadius: 0,
        hoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: true,
        usePointStyle: true,
        callbacks: {
          title: () => "Selected Date",
          label: (context: TooltipItem<"line">) => {
            if (context.raw && typeof context.raw === "number") {
              return `${context.raw} Hours`;
            }
            return "";
          },
        },
        displayColors: false,
        backgroundColor: "white",
        titleColor: "#FF5C5C",
        bodyColor: "#333",
        borderWidth: 1,
        borderColor: "#FF5C5C",
        padding: 10,
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 12 },
        caretPadding: 10,
        caretSize: 6,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#333", font: { size: 12 } },
      },
      y: {
        min: 0,
        max: Math.max(...chartData) + 100, // Dynamic max value
        ticks: { stepSize: 500, color: "#333", font: { size: 12 } },
        grid: { color: "#E0E0E0", borderDash: [5, 5], drawBorder: false },
      },
    },
    elements: { line: { borderWidth: 2 } },
  };

  return (
    <div
      className="col-span-12 p-6 py-2 rounded-sm -mt-3"
      style={{
        background: "linear-gradient(180deg, #FFFFFF, #F4F4F4)",
        height: "240px",
        border: "1px solid #c8c8c8",
        borderRadius: "15px",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[14px] font-semibold text-gray-700">
          Teaching Activity ({new Date().getFullYear()})
        </h2>
        <select
          className="p-1 border border-gray-300 rounded-md text-[10px] text-gray-600"
          defaultValue="monthly"
        >
          <option value="monthly">Monthly</option>
          <option value="weekly" className="hidden">
            Weekly
          </option>
        </select>
      </div>
      <div style={{ height: "190px" }}>
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <Line data={chartConfig} options={options} />
        )}
      </div>
    </div>
  );
};

export default TeachingActivity;
