"use client";

import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import axios from "axios";
import React, { useState, useEffect } from "react";

interface Student {
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentPhone: number;
  studentCountry: string;
  preferredTeacher: string;
  learningInterest: string;
}

interface Evaluation {
  _id: string;
  classStartDate: string;
  classStartTime: string;
  classEndTime: string;
  student: Student;
}

const UpcomingClasses: React.FC = () => {
  const [classes, setClasses] = useState<
    { id: string; date: string; time: string; title: string; color: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const colorCycle = [
    "blue-400",
    "emerald-400",
    "purple-400",
    "rose-400",
    "amber-400",
  ];

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("AcademicCoachAuthToken")
            : null;

        if (!token) {
          console.error("❌ AcademicCoachAuthToken not found");
          return;
        }

        const academicId = localStorage.getItem("AcademicCoachPortalId");

        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.DASHBOARD.GET_AC_UPCOMING_CLASSES}?academicCoachId=${academicId}`,
          {
            params: { academicCoachId: academicId },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.data || !Array.isArray(response.data)) {
          throw new Error(`Failed to fetch classes: ${response.statusText}`);
        }

        const now = new Date();
        const toDateTime = (item: any) => {
          const datePart = new Date(item.scheduledStartDate);
          if (item.scheduledFrom) {
            const [h = 0, m = 0] = String(item.scheduledFrom)
              .split(":")
              .map((x: string) => parseInt(x, 10));
            const combined = new Date(datePart);
            combined.setHours(h || 0, m || 0, 0, 0);
            return combined;
          }
          return datePart;
        };

        const upcomingClasses = response.data
          .filter((item: any) => toDateTime(item) > now)
          .sort(
            (a: any, b: any) =>
              toDateTime(a).getTime() - toDateTime(b).getTime()
          )
          .map((item: any, index: number) => ({
            id: item._id,
            date: new Date(item.scheduledStartDate)
              .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
              .replace(/\//g, "-"),
            time: `${item.scheduledFrom} - ${item.scheduledTo}`,
            title: item.student?.name || item.classType || "Class",
            color: colorCycle[index % colorCycle.length],
          }));

        setClasses(upcomingClasses);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      }
    };

    fetchClasses();
  }, []);

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="pl-4 py-4">
      {/* ✅ FIXED: Only show timeline border when classes exist */}
      {classes.length === 0 ? (
        <p className="text-center text-gray-600 text-sm p-4">
          No upcoming classes.
        </p>
      ) : (
        <div className="relative border-l-2 border-dotted border-[#000] dark:border-[#fff] ml-5 space-y-6">
          {classes.map((classItem, index) => {
            const colors = [
              "bg-[#d77277]",
              "bg-[#72B0D7]",
              "bg-[#BF63B3]",
              "bg-[#BFBC63]",
              "bg-[#BF8C63]",
              "bg-[#6EBF63]",
            ];
            const textColors = [
              "text-[#d77277]",
              "text-[#72B0D7]",
              "text-[#BF63B3]",
              "text-[#BFBC63]",
              "text-[#BF8C63]",
              "text-[#6EBF63]",
            ];
            const currentColor = colors[index % colors.length];
            const currentTextColor = textColors[index % textColors.length];

            return (
              <div key={classItem.id} className="relative flex items-start">
                <div className="absolute -left-[46px] top-1/2 -translate-y-1/2 flex flex-row items-center gap-2">
                  <span className="text-xs font-medium text-gray-700 dark:text-[#fff]">
                    {classItem.time.split(" ")[0]}
                  </span>

                  <div
                    className={`w-[10px] h-[10px] ml-[3px] rounded-full ${currentColor}`}
                  />
                  
                </div>

                {/* Card */}
                <div className="bg-[#f4f4f4] dark:bg-[#404040] rounded-md p-2 w-full shadow-sm ml-4">
                  <h4 className={`text-[14px] font-medium ${currentTextColor}`}>
                    {(() => {
                      const val = classItem.title;
                      return val
                        ? `${val.charAt(0).toUpperCase()}${val
                            .slice(1)
                            .toLowerCase()}`
                        : "-";
                    })()}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingClasses;
