"use client";

import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
type AssignmentStats = {
  total: number;
  assigned: number;
  completed: number;
  pending: number;
  overdue: number;
};

type StudentPerformance = {
  completionRate: number;
  accuracy: number;
};

type StudentAssignmentData = {
  studentId: string;
  studentName: string;
  assignments: AssignmentStats;
  performance: StudentPerformance;
};

type TeacherAssignmentsResponse = {
  teacherId: string;
  teacherName: string;
  totalStudents: number;
  assignments: AssignmentStats;
  students: StudentAssignmentData[];
};
function Assignment() {
  const [data, setData] = useState<TeacherAssignmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const searchParams = useSearchParams();
useEffect(() => {
  const fetchData = async () => {
    try {
        const teacherId = localStorage.getItem("TeacherPortalId") ?? "";
      console.log("teacherId:", teacherId);
        const token = localStorage.getItem("TeacherAuthToken") ?? "";

      if (!teacherId) {
          setError(
    AppValidationMessages.ASSIGNMENT.TEACHER_REQUIRED
  );
      }

      if (!token) {
  setError(
    AppValidationMessages.AUTH.TOKEN_REQUIRED
  );
}

      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ASSIGNMENT.GET_TEACHER_ASS_CARD_COUNT}?teacherId=${teacherId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

if (!result?.data) {
  setError(
    AppValidationMessages.ASSIGNMENT.NO_ASSIGNMENT_DATA
  );
  return;
}

setData(result.data);
      
    } catch (err) {
  console.error(
    AppFailureToastMessages.ASSIGNMENT_CARD_FETCH,
    err
  );

  setError(
    AppFailureToastMessages.ASSIGNMENT_CARD_FETCH
  );
}  
finally {
      setLoading(false);
    }
  };

  fetchData();
}, [searchParams]); // Add searchParams to dependency array

  

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!data) return <div className="text-center py-8">No data available</div>;

const cards = [
  {
    title: "Total Assignment Assigned",
    count: data.assignments.assigned,
    percentage:
      data.assignments.total > 0
        ? Math.round((data.assignments.assigned / data.assignments.total) * 100)
        : 0,
    ringColor: "#7DB5CB",
    bgColor: "#CDD5E2",
    pieData:
      data.assignments.total > 0
        ? [
            { value: Math.round((data.assignments.assigned / data.assignments.total) * 100) },
            { value: 100 - Math.round((data.assignments.assigned / data.assignments.total) * 100) },
          ]
        : [{ value: 0 }, { value: 100 }],
  },
  {
    title: "Total Assignment Completed",
    count: data.assignments.completed,
    percentage:
      data.assignments.total > 0
        ? Math.round((data.assignments.completed / data.assignments.total) * 100)
        : 0,
    ringColor: "#88CF9B",
    bgColor: "#CDD5E2",
    pieData:
      data.assignments.total > 0
        ? [
            { value: Math.round((data.assignments.completed / data.assignments.total) * 100) },
            { value: 100 - Math.round((data.assignments.completed / data.assignments.total) * 100) },
          ]
        : [{ value: 0 }, { value: 100 }],
  },
  {
    title: "Total Assignment Pending",
    count: data.assignments.pending,
    percentage:
      data.assignments.total > 0
        ? Math.round((data.assignments.pending / data.assignments.total) * 100)
        : 0,
    ringColor: "#FC6B57",
    bgColor: "#CDD5E2",
    pieData:
      data.assignments.total > 0
        ? [
            { value: Math.round((data.assignments.pending / data.assignments.total) * 100) },
            { value: 100 - Math.round((data.assignments.pending / data.assignments.total) * 100) },
          ]
        : [{ value: 0 }, { value: 100 }],
  },
];


  return (
    <div className="md:p-0 mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((item, idx) => {
          const bgClass =
            idx === 0
              ? "bg-gradient-to-b from-white to-[#F6F7FF] dark:from-[#343434] dark:to-[#343434]"
              : idx === 1
              ? "bg-gradient-to-b from-white to-[#F6FFF9]  dark:from-[#343434] dark:to-[#343434]"
              : "bg-gradient-to-b from-white to-[#FFF6F6]  dark:from-[#343434] dark:to-[#343434]";

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl shadow-md w-full ${bgClass} transition transform hover:scale-[1.02]`}
            >
              <h3 className="text-[#010E30] text-[14px] font-medium mb-2 leading-5 dark:text-[#ffff]">
                {item.title.split(" ").slice(0, 3).join(" ")} <br /> {item.title.split(" ").slice(3).join(" ")}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-[28px] text-[#010E30] font-semibold dark:text-[#ffff]">
                  {item.count}
                </span>
                <div className="relative w-[80px] h-[80px]">
                  <PieChart width={80} height={80}>
                    <Pie
                      data={[{ value: 100 }]}
                      dataKey="value"
                      innerRadius={28}
                      outerRadius={36}
                      startAngle={90}
                      endAngle={-270}
                      isAnimationActive={false}
                      stroke="none"
                    >
                      <Cell fill={item.bgColor} />
                    </Pie>
                    <Pie
                      data={item.pieData}
                      dataKey="value"
                      innerRadius={26}
                      outerRadius={40}
                      startAngle={90}
                      endAngle={-270}
                      cornerRadius={2}
                      isAnimationActive={false}
                      stroke="none"
                    >
                      <Cell fill={item.ringColor} />
                      <Cell fill="transparent" />
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex items-center justify-center text-[14px] font-semibold text-[#333] dark:text-[#ffff]">
                    {item.percentage}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Assignment;