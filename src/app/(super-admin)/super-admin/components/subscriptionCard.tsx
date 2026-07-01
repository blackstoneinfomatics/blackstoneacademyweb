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
      <div className="flex gap-8">

        {/* LEFT SECTION */}
        <div className="w-[340px] shrink-0">

          {/* Icon + Details */}
          <div className="flex gap-5">

            {/* Icon */}
            <div className="flex h-[112px] w-[112px] items-center justify-center rounded-[24px] bg-[#ECEBFF]">
              <Image
                src="/assets/images/Vectors%20(2).png"
                alt="Enterprise"
                width={60}
                height={60}
              />
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center">

              <span className="w-fit rounded-full bg-[#E9FAEF] px-4 py-[5px] text-[12px] font-semibold text-[#27AE60]">
                Active
              </span>

              <h2 className="mt-3 text-[18px] font-bold leading-none text-[#16213E] dark:text-white">
                Enterprise
              </h2>

              <p className="mt-2 text-[12px] font-medium text-[#7C8799] dark:text-gray-300">
                Yearly Subscription
              </p>

              <div className="mt-4 flex items-end">
                <span className="text-[28px] font-bold leading-none text-[#111827] dark:text-white">
                  $8,500
                </span>

                <span className="ml-2 mb-[4px] text-[14px] text-[#6B7280] dark:text-gray-300">
                  / year
                </span>
              </div>

              <p className="mt-4 text-[14px] text-[#8A94A6] dark:text-gray-300">
                Next Billing on{" "}
                <span className="font-semibold text-[#5669D8]">
                  15 Aug, 2026
                </span>
              </p>

            </div>
          </div>
        </div>

        {/* RIGHT SECTION START */}
{/* RIGHT SECTION START */}
<div className="grid flex-1 grid-cols-3 gap-x-4 gap-y-4">

  {features.map((feature, index) => (
    <div
      key={index}
      className="flex h-[40px] items-center rounded-md bg-[#EEF9F2] dark:bg-[#2D3B4A] px-2"
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#DDF5E6]">
        <Check
          size={14}
          strokeWidth={3}
          className="text-[#2DBE60]"
        />
      </div>

      <p
        className={`ml-3 text-[12px] font-medium leading-4 text-[#24324B] dark:text-gray-200 ${
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