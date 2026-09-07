"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  valueTooltip?: string;
  comparisonLabel?: string;
  percentage: number;
  isPositive?: boolean;
  image?: string;
  icon?: string | LucideIcon | React.ComponentType<any>;
  imageAlt?: string;
  iconBg: string;
  titleColor: string;
}

const StatsCard = ({
  title,
  value,
  valueTooltip,
  comparisonLabel = "vs last Month",
  percentage,
  isPositive = true,
  image,
  icon: Icon,
  imageAlt,
  iconBg,
  titleColor,
}: StatsCardProps) => {
  return (
    <div
      className="w-full rounded-2xl border border-transparent bg-white transition-all duration-300 hover:shadow-lg dark:border-[#454545] dark:bg-[#343434]"
      style={{
        padding: "clamp(14px, 1.2vw, 20px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <div
        className="flex items-start"
        style={{
          gap: "clamp(10px, 1vw, 16px)",
        }}
      >
        <div
          className={`flex items-center justify-center rounded-full ${iconBg}`}
          style={{
            width: "clamp(42px, 3vw, 48px)",
            height: "clamp(42px, 3vw, 48px)",
          }}
        >
          {Icon ? (
            <Icon
              className={titleColor}
              style={{
                width: "clamp(18px,1.4vw,24px)",
                height: "clamp(18px,1.4vw,24px)",
              }}
            />
          ) : image ? (
            <Image
              src={image}
              alt={imageAlt ?? title}
              width={24}
              height={24}
              className="object-contain"
              style={{
                width: "clamp(18px,1.4vw,24px)",
                height: "clamp(18px,1.4vw,24px)",
              }}
            />
          ) : null}
        </div>

        <div className="flex-1">
          <h3
            className={`whitespace-pre-line font-normal ${titleColor}`}
            style={{
              fontSize: "clamp(14px, 1vw, 16px)",
              lineHeight: "1.4",
            }}
          >
            {title}
          </h3>

          <p
            className="font-semibold text-[#232323] dark:text-[#ccc]"
            title={valueTooltip}
            style={{
              fontSize: "clamp(18px, 1.8vw, 24px)",
              marginTop: "clamp(4px, 0.5vw, 8px)",
            }}
          >
            {value}
          </p>

          <div
            className="flex items-center"
            style={{
              gap: "clamp(6px,0.6vw,10px)",
              marginTop: "clamp(8px,0.8vw,12px)",
              fontSize: "clamp(14px,0.8vw,16px)",
            }}
          >
            <span
              className={`flex items-center font-semibold ${
                isPositive ? "text-[#2E9E44]" : "text-[#EF4444]"
              }`}
            >
              {isPositive ? (
                <ArrowUp
                  style={{
                    width: "clamp(12px,1vw,16px)",
                    height: "clamp(12px,1vw,16px)",
                    marginRight: "4px",
                  }}
                />
              ) : (
                <ArrowDown
                  style={{
                    width: "clamp(12px,1vw,16px)",
                    height: "clamp(12px,1vw,16px)",
                    marginRight: "4px",
                  }}
                />
              )}
              {percentage}%
            </span>

            <span className="text-[#666666] dark:text-[#AEB6C5]">
              {comparisonLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
