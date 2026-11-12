import React from "react";
import { ShieldCheck } from "lucide-react";
import SecurityCard from "./SecurityCard";

interface Props {
  score: number;
}

const SecurityScore = ({ score }: Props) => {
  const radius = 47;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const status =
    score >= 90
      ? "Excellent"
      : score >= 70
        ? "Good"
        : score >= 50
          ? "Fair"
          : "Needs Improvement";

  const scoreColor =
    score >= 90
      ? "#39BD62"
      : score >= 70
        ? "#5B70C8"
        : score >= 50
          ? "#E5A33A"
          : "#E05252";

  return (
    <SecurityCard
      title="Security Score"
      description="Overall platform security health"
      icon={ShieldCheck}
      className="min-h-[250px]"
    >
      <div className="flex flex-col items-center justify-center pt-0.5">
        {/* Circular Progress */}
        <div className="relative flex h-[110px] w-[110px] items-center justify-center">
          <svg
            width="110"
            height="110"
            viewBox="0 0 110 110"
            className="-rotate-90"
          >
            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="none"
              stroke="#E8E8E8"
              strokeWidth="10"
            />

            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth="10"
              strokeLinecap="butt"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-500"
            />
          </svg>

          <span className="absolute text-[20px] font-bold text-[#111111] dark:text-white">
            {score}%
          </span>
        </div>

        {/* Status */}
        <span
          className="mt-3 rounded-lg px-2.5 py-1 text-[9px] font-semibold"
          style={{
            backgroundColor: `${scoreColor}20`,
            color: scoreColor,
          }}
        >
          {status}
        </span>

        <p className="mt-2 text-center text-[10px] font-medium text-[#333333] dark:text-gray-200">
          {score >= 90
            ? "Your platform security is strong"
            : score >= 70
              ? "Your platform security is good"
              : "Your platform needs security improvements"}
        </p>
      </div>
    </SecurityCard>
  );
};

export default SecurityScore;