"use client";

import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import { getSocket } from "@/app/utils/socket";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import {
  CalendarDays,
  CheckCircle,
  Clock3,
  PlusCircle,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

type Props = {
  readonly onClose: () => void;
};

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface ScheduleItem {
  day: string;
  times: TimeSlot[];
  isSelected: boolean;
}
interface TeacherList {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
}
type WeeklySlotMap = {
  [day: string]: { from: string; to: string }[];
};
interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface ScheduleItem {
  day: string;
  times: TimeSlot[];
  isSelected: boolean;
}
export default function UpgradeClassForm({ onClose }: Readonly<Props>) {
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [suggestedSlots, setSuggestedSlots] = useState<WeeklySlotMap>({});
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherList | null>(
    null
  );
  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].map((day) => ({
      day,
      times: [],
      isSelected: false,
    }))
  );
  const weeklyHourLimit = 2;
  useEffect(() => {
    const academicId =
      typeof window !== "undefined"
        ? localStorage.getItem("AcademicCoachPortalId")
        : null;
    if (!academicId || !startDate) return;
    const socket = getSocket(academicId);
    console.log("📤 Sending academicTeacherWeeklySlotsListRequest");
    socket.emit("academicTeacherWeeklySlotsListRequest", {
      requestId: academicId,
      startDate: startDate,
      teacherId: selectedTeacher?.teacherId,
    });

    const handleResponse = (data: WeeklySlotMap) => {
      console.log("weekyl", data);
      setSuggestedSlots(data);
    };

    socket.on("academicTeacherWeeklySlotsListResponse", handleResponse);
    return () => {
      socket.off("academicTeacherWeeklySlotsListResponse", handleResponse);
    };
  }, [startDate, selectedTeacher]);
  const buildWeeklySlots = () => {
    const map: WeeklySlotMap = {};
    schedule.forEach((item) => {
      if (item.isSelected && item.times.length > 0) {
        map[item.day] = item.times.map((t) => ({
          from: t.startTime,
          to: t.endTime,
        }));
      }
    });
    return map;
  };

  const calculateTotalHours = () => {
    let totalHours = 0;

    schedule.forEach((item) => {
      if (item.isSelected) {
        item.times.forEach((time) => {
          if (time.startTime && time.endTime) {
            const start = new Date(`2023-01-01T${time.startTime}`);
            const end = new Date(`2023-01-01T${time.endTime}`);
            const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Convert to hours
            totalHours += diff;
          }
        });
      }
    });

    return totalHours;
  };
  const showRemainingHoursPopup = () => {
    const totalHours = calculateTotalHours();
    const remainingHours = weeklyHourLimit - totalHours;

    if (remainingHours === 0) {
      toast.warning(AppValidationMessages.EVALUATION.WEEKLY_HOUR_LIMIT, {
        className:
          "w-[340px] px-4 py-3 text-sm rounded-lg shadow bg-yellow-600 text-white",
      });
    } else {
      toast.info(
        `You have ${remainingHours.toFixed(2)} hours remaining this week.`,
        {
          className:
            "w-[340px] px-4 py-3 text-sm rounded-lg shadow bg-blue-600 text-white",
        }
      );
    }
  };

  const normalizeTime = (time: string) => time.slice(0, 5);

  const handleAddSuggestedSlot = (day: string, from: string, to: string) => {
    if (calculateTotalHours() >= weeklyHourLimit) {
      toast.warning(AppValidationMessages.EVALUATION.WEEKLY_HOUR_LIMIT);
      return;
    }
    const index = schedule.findIndex((item) => item.day === day);
    if (index === -1) return;

    const updated = [...schedule];
    const times = updated[index].times;

    const isDuplicate = times.some(
      (t) =>
        normalizeTime(t.startTime) === normalizeTime(from) &&
        normalizeTime(t.endTime) === normalizeTime(to)
    );

    if (isDuplicate) {
      toast.error(AppValidationMessages.EVALUATION.DUPLICATE_SLOT);
      return;
    }

    updated[index].isSelected = true;
    updated[index].times.push({
      startTime: normalizeTime(from),
      endTime: normalizeTime(to),
    });

    updated[index].times.sort((a, b) => a.startTime.localeCompare(b.startTime));

    setSchedule(updated);
    showRemainingHoursPopup();
  };

  const handleRemoveSlot = (day: string, from: string, to: string) => {
    const index = schedule.findIndex((item) => item.day === day);
    if (index === -1) return;

    const updated = [...schedule];

    updated[index].times = updated[index].times.filter(
      (t) =>
        !(
          normalizeTime(t.startTime) === normalizeTime(from) &&
          normalizeTime(t.endTime) === normalizeTime(to)
        )
    );

    if (updated[index].times.length === 0) {
      updated[index].isSelected = false;
    }

    setSchedule(updated);
    showRemainingHoursPopup();
  };

  const handleTimeChange = (
    dayIndex: number,
    timeIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[dayIndex].times[timeIndex][field] = value;
    setSchedule(updatedSchedule);
  };

  const handleSubmit = () => {
    console.log("sunmbit");
  };

  return (
    <div>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
        <form
          className="bg-white dark:bg-[#1D1D1D] rounded-lg shadow-xl p-5 w-full max-w-lg mx-3 text-sm border border-[#DFE0EB] dark:border-[#444] scrollbar-none"
          style={{ maxHeight: "90vh", overflowY: "auto" }}
        >
          <h2 className="text-[16px] font-semibold text-[#010E30] dark:text-white">
            Upgrade Classes
          </h2>

          {/* Teacher & Join Date */}
          <div className="flex items-center justify-between my-5">
            <div className="flex items-center gap-1">
              <label
                htmlFor="ugcuc"
                className="font-medium text-[#010E30] dark:text-white text-sm"
              >
                Teacher:
              </label>
              <input
                type="text"
                id="ugcuc"
                className="border rounded text-xs px-2 py-1  w-full bg-white/5 dark:bg-[#2c2c2c] border-[#4f5154] text-[#010E30] dark:text-white"
                value={selectedTeacher?.teacherName}
              />
            </div>

            <div className="flex items-center gap-1">
              <label
                htmlFor="ugcuc"
                className="font-medium text-[#010E30] dark:text-white text-sm"
              >
                Join Date:
              </label>
              <input
                type="date"
                id="ugcuc"
                className="border rounded text-xs px-2 py-1 bg-white/5 dark:bg-[#2c2c2c] border-[#4f5154] text-[#010E30] dark:text-white dark:[color-scheme:dark]"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          {/* Weekly Slots */}
          <div className="flex flex-col gap-4">
            {schedule.map((item, index) => (
              <div
                key={item.day}
                className="flex flex-col justify-between bg-white/10 dark:bg-[#2a2d3b] border border-[#2c3444] rounded-2xl p-4 shadow-lg transition-transform hover:scale-[1.01] duration-200"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-[#010E30] dark:text-white font-semibold text-sm tracking-wide">
                    <CalendarDays size={18} className="text-blue-400" />
                    {item.day}
                  </div>
                </div>

                {/* Added Slots */}
                {item.times.length > 0 && (
                  <div className="flex flex-col gap-2 mb-3 max-h-28 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {item.times.map((time, timeIndex) => (
                      <div
                        key={`${time.startTime}-${timeIndex}`}
                        className="flex items-center gap-2 bg-[#8a9dc7] dark:bg-[#3a4158] px-3 py-2 rounded-xl"
                      >
                        <input
                          type="time"
                          value={time.startTime}
                          onChange={(e) =>
                            handleTimeChange(
                              index,
                              timeIndex,
                              "startTime",
                              e.target.value
                            )
                          }
                          className="bg-[#f4f5f7] dark:bg-[#2a2a2a] border border-gray-600 text-[#010E30] dark:text-white text-xs rounded-lg px-1 py-1 w-15 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-[#010E30] dark:text-white text-xs">
                          ⏤
                        </span>
                        <input
                          type="time"
                          value={time.endTime}
                          onChange={(e) =>
                            handleTimeChange(
                              index,
                              timeIndex,
                              "endTime",
                              e.target.value
                            )
                          }
                          className="bg-[#f4f5f7] dark:bg-[#2a2a2a] border border-gray-600 text-[#010E30] dark:text-white text-xs rounded-lg px-1 py-1 w-15 focus:ring-2 focus:ring-blue-500"
                        />

                        {/* Remove Button */}
                        <button
                          onClick={() =>
                            handleRemoveSlot(
                              item.day,
                              time.startTime,
                              time.endTime
                            )
                          }
                          className="ml-auto text-xs px-2 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-[#010E30] dark:text-white flex items-center gap-1"
                          title="Remove slot"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested Slots */}
                {suggestedSlots[item.day] && (
                  <div className="flex flex-col gap-2 max-h-32 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {suggestedSlots[item.day].map((slot, i) => {
                      const isAlready = item.times.some(
                        (t) =>
                          normalizeTime(t.startTime) ===
                            normalizeTime(slot.from) &&
                          normalizeTime(t.endTime) === normalizeTime(slot.to)
                      );

                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-[#798db1] dark:bg-[#3c455c] px-3 py-2 rounded-xl"
                        >
                          <div className="flex items-center gap-1 text-[#181818] dark:text-white font-medium text-xs">
                            <Clock3
                              size={14}
                              className="text-blue-800 dark:text-blue-300"
                            />
                            {slot.from} - {slot.to}
                          </div>
                          <button
                            disabled={isAlready}
                            onClick={() =>
                              handleAddSuggestedSlot(
                                item.day,
                                slot.from,
                                slot.to
                              )
                            }
                            className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-lg transition-all ${
                              isAlready
                                ? "bg-gray-600 text-[#010E30] dark:text-white cursor-not-allowed"
                                : "bg-[#576CBC] hover:bg-[#4459A9] text-[#010E30] dark:text-white"
                            }`}
                          >
                            {isAlready ? (
                              <>
                                <CheckCircle size={14} /> Added
                              </>
                            ) : (
                              <>
                                <PlusCircle size={14} /> Add
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="border-t border-[#DFE0EB] dark:border-[#444] pt-4 mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 border border-[#576CBC] text-[#576CBC] hover:border-[#4459A9] rounded hover:bg-[#E6E9F5] dark:hover:bg-[#333] dark:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-3 py-1 bg-[#576CBC] text-white rounded hover:bg-[#4459A9]"
            >
              Submit
            </button>
          </div>
        </form>

        {/* Popups */}
        {success && (
          <SuccessPopup
            onClose={() => setSuccess(false)}
            title="Upgrade Class"
          />
        )}
        {failed && (
          <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
        )}
      </div>
    </div>
  );
}
