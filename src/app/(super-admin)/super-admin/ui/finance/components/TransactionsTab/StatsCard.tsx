"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  percentage: number;
  isPositive?: boolean;
  image: string;
  imageAlt?: string;
  iconBg: string;
  titleColor: string;
}

const StatsCard = ({
  title,
  value,
  percentage,
  isPositive = true,
  image,
  imageAlt,
  iconBg,
  titleColor,
}: StatsCardProps) => {
  return (
    <div className="w-full rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}
        >
          <Image
            src={image}
            alt={imageAlt ?? title}
            width={24}
            height={24}
            className="object-contain"
          />
        </div>

        <div className="flex-1">
          <h3 className={`text-base font-normal leading-6 ${titleColor}`}>
            {title}
          </h3>

          <p className="mt-1 text-xl font-semibold text-[#232323]">
            {value}
          </p>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <span
              className={`flex items-center font-semibold ${
                isPositive ? "text-[#2E9E44]" : "text-[#EF4444]"
              }`}
            >
              {isPositive ? (
                <ArrowUp size={16} className="mr-1" />
              ) : (
                <ArrowDown size={16} className="mr-1" />
              )}
              {percentage}%
            </span>

            <span className="text-[#666666]">
              vs last Month
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;