'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";

interface ClassItem {
  id: string;
  date: string;
  time: string;
  title: string;
  color: {
    bg: string;
    text: string;
    dot: string;
  };
  startTime: string;
}

const UpcomingClasses: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('AdminAuthToken');
      if (token) {
        fetchMeetings(token);
      } else {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      }
    }
  }, []);

  const fetchMeetings = async (token: string) => {
    try {
      const response = await axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ADMIN_MEETING.GET_LIST}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const meetingsData = response.data?.data?.meetings || [];
      // The API response groups duplicates by meetingId within 'records'.
      // We take only the first record from each group to display unique meetings.
      const meetings = meetingsData.flatMap((group: any) =>
        group.records && group.records.length > 0 ? [group.records[0]] : []
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filteredMeetings = meetings.filter((meeting: any) => {
        const meetingDate = new Date(meeting.selectedDate);
        meetingDate.setHours(0, 0, 0, 0);
        return meetingDate >= today;
      });

      const colorVariants = [
        { bg: "bg-red-50", text: "text-red-500", dot: "bg-red-500" },
        { bg: "bg-blue-50", text: "text-blue-500", dot: "bg-blue-500" },
        { bg: "bg-purple-50", text: "text-purple-500", dot: "bg-purple-500" },
        { bg: "bg-yellow-50", text: "text-yellow-600", dot: "bg-yellow-500" },
        { bg: "bg-pink-50", text: "text-pink-500", dot: "bg-pink-500" },
        { bg: "bg-indigo-50", text: "text-indigo-500", dot: "bg-indigo-500" },
        { bg: "bg-green-50", text: "text-green-500", dot: "bg-green-500" },
        { bg: "bg-teal-50", text: "text-teal-500", dot: "bg-teal-500" },
      ];

      const mappedMeetings: ClassItem[] = filteredMeetings.map((meeting: any, index: number) => {
        const start = meeting.startTime;
        const end = meeting.endTime;
        const rawTitle = meeting.meetingName || "Untitled";
        // Format title: First letter capital, rest lowercase
        const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1).toLowerCase();

        const date = new Date(meeting.selectedDate).toLocaleDateString();
        // Select color sequentially to ensure variety
        const color = colorVariants[index % colorVariants.length];

        return {
          id: meeting._id,
          date,
          time: `${start} - ${end}`,
          title,
          color,
          startTime: start,
        };
      });

      mappedMeetings.sort((a, b) => a.startTime.localeCompare(b.startTime));

      setClasses(mappedMeetings);
    } catch (err) {
      setError("Failed to load meeting data");
      console.error("API Error:", err);
    }
  };

  if (error) {
    return <div className="text-center text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="bg-white dark:bg-[#343434] w-full h-[365px] rounded-xl px-4 pt-4 pb-6">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="font-semibold text-[14px] text-[#010e30] dark:text-white">Upcoming Classes</h2>
        <span className="bg-[#EBEFFF] dark:bg-[#576CBC33] text-[#6B73FF] text-xs font-medium px-2 py-1 rounded-md">
          Today
        </span>
      </div>

      {classes.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-white text-sm p-4">No upcoming classes scheduled.</p>
      ) : (
        <div className="relative">
          {/* Vertical dotted line only if there are classes */}
          <div className="absolute left-[55px] top-0 bottom-0 border-l-2 border-dotted border-black dark:border-white" />

          <div className="space-y-4 pl-[8px]">
            {classes.map((classItem) => (
              <div key={classItem.id} className="flex items-start relative w-full">
                {/* Time */}
                <div className="w-[45px] text-[12px] text-black dark:text-white mt-[7px] text-right pr-4">
                  {classItem.startTime}
                </div>

                {/* Dot */}
                <div className="absolute left-[44px] top-[12px] z-10">
                  <div className={`w-[10px] h-[10px] rounded-full ${classItem.color.dot}`} />
                </div>

                {/* Card */}
                <div className={`ml-[24px] flex-1 bg-[#f4f4f4] dark:bg-[#404040] rounded-md px-3 py-2 flex justify-between items-center`}>
                  <span className={`text-[11px] font-medium ${classItem.color.text} dark:text-white`}>
                    {classItem.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingClasses;
