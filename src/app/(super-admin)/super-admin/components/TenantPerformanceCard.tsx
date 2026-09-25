
"use client";

import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useState, useEffect } from "react";

interface PerformanceData {
  percentage: number;
  label: string;
  message: string;
}

interface PerformanceCardProps {
  tenantId: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    performance: PerformanceData;
  };
}

export default function PerformanceCard({
  tenantId,
}: PerformanceCardProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [performance, setPerformance] =
    useState<PerformanceData | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDarkMode = () => {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark");

      setIsDarkMode(isDark);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);

        if (!tenantId) {
          console.error("Tenant ID is missing");
          return;
        }

        const response = await fetch(
          `http://localhost:5001/tenant/analytics/dashboard/summary?tenantId=${encodeURIComponent(
            tenantId
          )}`
        );

        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status}`
          );
        }

        const result: ApiResponse = await response.json();

        console.log("Performance API:", result);

        if (result.success && result.data?.performance) {
          setPerformance(result.data.performance);
        }
      } catch (error) {
        console.error(
          "Failed to fetch performance:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [tenantId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#343434] rounded-2xl shadow-sm p-4 h-[342px] border border-transparent dark:border-gray-700/50 flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-300">
          Loading...
        </span>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="bg-white dark:bg-[#343434] rounded-2xl shadow-sm p-4 h-[342px] border border-transparent dark:border-gray-700/50 flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-300">
          Failed to load performance data.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#343434] rounded-2xl shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] p-4 h-[338px] border border-transparent dark:border-gray-700/50 transition-colors">

      {/* Header */}
      <h2 className="text-[15px] font-semibold text-[#0B1533] dark:text-white">
        Performance
      </h2>

      {/* Circle */}
      <div className="w-[150px] h-[150px] mx-auto mt-4">
        <CircularProgressbar
          value={performance.percentage}
          text={`${performance.percentage}%`}
          styles={buildStyles({
            textSize: "15px",
            pathColor: "#16A34A",
            trailColor: "#DFF5E8",
            textColor: isDarkMode ? "#FFFFFF" : "#111827",
            strokeLinecap: "round",
          })}
          className="[&_.CircularProgressbar-text]:font-bold"
        />
      </div>

      {/* Badge */}
      <div className="flex justify-center mt-5">
        <span className="bg-[#DDF8E8] dark:bg-[#1D3A2A] text-[#16A34A] dark:text-[#4ADE80] text-[14px] font-medium px-3 py-1 rounded-md transition-colors">
          {performance.label}
        </span>
      </div>

      {/* Message */}
      <p className="text-center text-[12px] font-semibold text-[#374151] dark:text-gray-300 mt-5 transition-colors">
        {performance.message}
      </p>

    </div>
  );
}
