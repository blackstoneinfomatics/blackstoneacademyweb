"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";

const CourseOverview = () => {
  const [dashboardCounts, setDashboardCounts] = useState({
    totalLevel: 0,
    totalAttendance: 0,
    totalClasses: 0,
    presentCount: 0,
    totalDuration: 0,
  });
  const [courseName, setCourseName] = useState<string>("");
  const [maxDuration, setMaxDuration] = useState<number | undefined>(undefined); // No default value
  const [maxClasses, setMaxClasses] = useState<number | undefined>(undefined); // No default value
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // detect dark mode
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const storedCourseName = localStorage.getItem("StudentcourseName"); // Check the casing
    if (storedCourseName) {
      setCourseName(storedCourseName);
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

        if (!token) {
  console.error(
    AppValidationMessages.AUTH.TOKEN_REQUIRED
  );
  return;
}

if (!studentId) {
  console.error(
    AppValidationMessages.AUTH.STUDENT_REQUIRED
  );
  return;
}

if (!courseName) {
  console.error(
    AppValidationMessages.AUTH.COURSE_REQUIRED
  );
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
              if (
  !response.data ||
  (
    Number(response.data.totalLevel) === 0 &&
    Number(response.data.totalAttendance) === 0 &&
    Number(response.data.totalClasses) === 0 &&
    Number(response.data.totalDuration) === 0
  )
) {
  console.log(
    AppValidationMessages.COURSE
      .NO_COURSE_OVERVIEW_DATA
  );
}
        // Set maximum values based on current totals
        setMaxDuration(Number(response.data.totalDuration)); // Set maxDuration to current totalDuration
        setMaxClasses(Number(response.data.totalClasses)); // Set maxClasses to current totalClasses

      } catch (error) {
  console.error(
    AppFailureToastMessages.COURSE_OVERVIEW_FETCH,
    error
  );
}
    };

    fetchData();
  }, []);

  const data = [
    {
      title: "Level",
      value: `${Math.floor(dashboardCounts.totalLevel)}`,
      percentage: Math.floor(dashboardCounts.totalLevel),
      ringColor: "#7DB5CB",
      bgColor: "#E7EFF2",
    },
    {
      title: "Attendance",
      value: `${Math.floor(dashboardCounts.totalAttendance)}%`,
      percentage: Math.floor(dashboardCounts.totalAttendance),
      ringColor: "#9AD7D6",
      bgColor: "#E7EFF2",
    },
    {
      title: "Total Classes",
      value: `${Math.floor(dashboardCounts.totalClasses)}`, // No % sign here
      percentage: maxClasses ? Math.max(0, Math.min(100, Math.floor((dashboardCounts.totalClasses / maxClasses) * 100))) : 0, // Calculate percentage
      ringColor: "#8B93D2",
      bgColor: "#E7EFF2",
    },
    {
      title: "Duration",
      value: `${Math.floor(dashboardCounts.totalDuration)} Hr`,
      percentage: maxDuration ? Math.max(0, Math.floor((dashboardCounts.totalDuration / maxDuration) * 100)) : 0, // Calculate percentage
      ringColor: "#B690D5",
      bgColor: "#E7EFF2",
    },
  ];

  return (
    <div>
      <h5 className="text-[16px] font-semibold text-[#010E30] dark:text-white mb-4">
        Course Overview{" "}
        {courseName && <span className="text-[#6786FB]">({courseName})</span>}
      </h5>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl shadow-lg w-full bg-gradient-to-b from-white to-[#F9FAFB] dark:from-[#343434] dark:to-[#2A2A2A]"
          >
            <h3 className="text-[#010E30] dark:text-white text-[14px] font-medium mb-2">
              {item.title}
            </h3>
            <div className="flex justify-center">
              <div className="relative w-[80px] h-[80px]">
                <PieChart width={80} height={80}>
                  <Pie
                    data={[{ value: 100 }]} // Inner circle always 100%
                    dataKey="value"
                    innerRadius={26}
                    outerRadius={35}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    <Cell fill={isDark? "#4d4d4d" : item.bgColor} />
                  </Pie>
                  <Pie
                    data={[
                      { value: item.percentage }, // Outer circle based on total classes
                      { value: 100 - item.percentage }, // Remaining part to complete 100%
                    ]}
                    dataKey="value"
                    innerRadius={24}
                    outerRadius={38}
                    startAngle={90}
                    endAngle={-270}
                    cornerRadius={2}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    <Cell fill={item.ringColor} />
                    <Cell fill="transparent" />
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex items-center justify-center text-[14px] font-semibold text-[#010E30] dark:text-white">
                  {item.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseOverview;
