"use client";

import Image from "next/image";
import { Check } from "lucide-react";

const features = [
  "Unlimited students",
  "Unlimited teachers",
  "Unlimited admins",
  "Unlimited storage",
  "Fully customized system based on client requirements",
  "Priority support",
  "Custom branding",
  "Advanced analytics",
  "API integration",
  "API integration",
  "API integration",
  "API integration",
];

export default function SubscriptionCard() {
  return (
    <div className="w-full rounded-[24px] bg-white dark:bg-[#343434] p-7 shadow-sm">
      <div className="flex gap-8 flex-wrap xl:flex-nowrap">

        {/* LEFT SECTION */}
        <div className="w-[340px] shrink-0">

          {/* Icon + Details */}
          <div className="flex gap-5">

            {/* Icon */}
            <div className="flex h-[112px] w-[112px] items-center justify-center rounded-[24px] bg-[#ECEBFF] dark:bg-[#3A3A5C]">
              <Image
                src="/assets/images/Vectors%20(2).png"
                alt="Enterprise"
                width={60}
                height={60}
                className="dark:brightness-90"
              />
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center">

              <span className="w-fit rounded-full bg-[#E9FAEF] dark:bg-green-900/30 px-4 py-[5px] text-[12px] font-semibold text-[#27AE60] dark:text-green-400">
                Active
              </span>

              <h2 className="mt-3 text-[18px] leading-none text-[#16213E] font-semibold dark:text-white">
                Enterprise
              </h2>

              <p className="mt-2 text-[12px] font-medium text-[#545454] dark:text-gray-300">
                Yearly Subscription
              </p>

              <div className="mt-4 flex items-end">
                <span className="text-[28px] font-bold leading-none text-[#111827] dark:text-white">
                  $8,500
                </span>

                <span className="ml-2 mb-[4px] text-[14px] text-[#111827] dark:text-gray-300">
                  / year
                </span>
              </div>

              <p className="mt-4 text-[14px] text-[#111827] dark:text-gray-300">
                Next Billing on{" "}
                <span className="font-semibold text-[#5669D8] dark:text-[#8296E6]">
                  15 Aug, 2026
                </span>
              </p>

            </div>
          </div>
        </div>

        {/* RIGHT SECTION START */}
        <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4">

          {features.map((feature, index) => (
            <div
              key={index}
              className="flex h-[40px] items-center rounded-md bg-[#EEF9F2] dark:bg-[#2C3A3A] px-2"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center">
                <Check
                  size={16}
                  strokeWidth={4}
                  className="text-[#2DBE60] dark:text-[#4ADE80]"
                />
              </div>

              <p
                className={`ml-3 text-[12px] font-semibold leading-4 text-[#24324B] dark:text-gray-200 ${
                  feature.length < 22 ? "whitespace-nowrap" : ""
                }`}
              >
                {feature}
              </p>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}