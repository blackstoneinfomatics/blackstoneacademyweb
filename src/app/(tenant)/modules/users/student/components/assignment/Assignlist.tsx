"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";
import { toast , ToastContainer } from "react-toastify";

function Assignment() {
  const [assignmentData, setAssignmentData] = useState({
    totalAssignments: 0,
    totalCompleted: 0,
    totalPending: 0,
  });


  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
       const token =
    typeof window !== "undefined" ? localStorage.getItem("StudentAuthToken") : null;
      if (!token) {
    console.error("❌ StudentAuthToken not found");
    return;
  }
        const studentId = localStorage.getItem("StudentPortalId");

        if (!token || !studentId) {
          console.error("Missing token or teacher ID");
          return;
        }

        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ASSIGNMENT.ASS_CARD_COUNT}?studentId=${studentId}`
          , {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        // Log the full API response for debugging
        console.log("API response:", response);

        if (response.data.status === "success") {
          // Bind the response data to state
          console.log("Setting assignment data:", response.data.data);
          setAssignmentData(response.data.data);
        } else {
          console.error("Failed to fetch data:", response.data.message);
        }
      }catch (error) {
  console.error("API error:", error);
  toast.error(
    AppFailureToastMessages.ASSIGNMENT_CARD_FETCH
  );
}
    };

    fetchAssignmentData();
  }, []);

  const { totalAssignments, totalCompleted, totalPending } = assignmentData;

  console.log("Current assignment data:", { totalAssignments, totalCompleted, totalPending });

  const completionPercentage = totalAssignments
    ? Math.round((totalCompleted / totalAssignments) * 100)
    : 0;

  const pendingPercentage = totalAssignments
    ? Math.round((totalPending / totalAssignments) * 100)
    : 0;

  console.log("Calculated percentages:", { completionPercentage, pendingPercentage });

  const cards = [
    {
      title: "Total Assignment Assigned",
      count: totalAssignments,
      percentage: 100,
      ringColor: "#88A2CF",
      bgColor: "#CDD5E2",
      pieData: [{ value: 100 }],
    },
    {
      title: "Total Assignment Completed",
      count: totalCompleted,
      percentage: completionPercentage,
      ringColor: "#88CF9B",
      bgColor: "#CDD5E2",
      pieData: [
        { value: completionPercentage },
        { value: 100 - completionPercentage },
      ],
    },
    {
      title: "Total Assignment Pending",
      count: totalPending,
      percentage: pendingPercentage,
      ringColor: "#D58484",
      bgColor: "#CDD5E2",
      pieData: [
        { value: pendingPercentage },
        { value: 100 - pendingPercentage },
      ],
    },
  ];



  return (
    <div className="md:p-0 mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((item, idx) => {
          const bgClass =
            idx === 0
              ? "bg-gradient-to-b from-white to-[#F6FCFF] dark:from-[#343434] dark:to-[#343434]"
              : idx === 1
              ? "bg-gradient-to-b from-white to-[#F6FFFF] dark:from-[#343434] dark:to-[#343434]"
              : "bg-gradient-to-b from-white to-[#F8F6FF] dark:from-[#343434] dark:to-[#343434]";

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl shadow-md w-full ${bgClass} transition transform hover:scale-[1.02]`}
            >
              <h3 className="text-[#010E30] text-[14px] font-medium mb-2 leading-5 dark:text-[#ffff]">
                {item.title.split(" ").slice(0, 3).join(" ")} <br />
                {item.title.split(" ").slice(3).join(" ")}
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
