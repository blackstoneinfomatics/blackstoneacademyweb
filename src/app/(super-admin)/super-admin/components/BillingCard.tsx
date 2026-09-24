"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp } from "lucide-react";

interface BillingCardProps {
  title: string;
  value: string | number;
  percentage: number;
  isPositive?: boolean;
  image: string;
  imageAlt?: string;
  iconBg: string;
  titleColor: string;
}

const BillingCard = ({
  title,
  value,
  percentage,
  isPositive = true,
  image,
  imageAlt,
  iconBg,
  titleColor,
}: BillingCardProps) => {
  return (
    <div
      className="w-full rounded-2xl bg-white transition-all duration-300 hover:shadow-lg"
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
            className="font-semibold text-[#232323]"
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

            <span className="text-[#666666]">
              vs last Month
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};  

export default BillingCard;