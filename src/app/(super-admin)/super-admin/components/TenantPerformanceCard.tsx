"use client";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const percentage = 92;

export default function PerformanceCard() {
  return (
    <div className="bg-white dark:bg-[#343434] rounded-2xl  shadow-sm p-4 h-[342px]">

      {/* Header */}
      <h2 className="text-[22px] font-semibold text-[#1E293B] dark:text-white">
Performance        </h2>

      {/* Circle */}
      <div className="w-[150px] h-[150px] mx-auto mt-4">
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          styles={buildStyles({
            textSize: "18px",
            pathColor: "#16A34A",
            trailColor: "#DFF5E8",
            textColor: "#111827",
            strokeLinecap: "round",
          })}
        />
      </div>

      {/* Badge */}
      <div className="flex justify-center mt-5">
        <span className="bg-[#DDF8E8] text-[#16A34A] text-[16px] font-semibold px-3 py-1 rounded-md">
          Excellent
        </span>
      </div>

      {/* Message */}
      <p className="text-center text-[16px] text-[#374151] dark:text-gray-300 mt-5">
        Your tenant is performing great
      </p>

    </div>
  );
}