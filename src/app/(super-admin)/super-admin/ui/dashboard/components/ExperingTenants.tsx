"use client";

import React from "react";
import { TbCalendarTime } from "react-icons/tb";


interface ExpiringTenant {
  id: number;
  name: string;
  daysLeft: number;
}

const expiringTenants: ExpiringTenant[] = [
  { id: 1, name: "Sri Ram Institute", daysLeft: 3 },
  { id: 2, name: "Alpha Training Institute", daysLeft: 1 },
  { id: 3, name: "Greenfield Learning Institute", daysLeft: 2 },
  { id: 4, name: "Ram Institute", daysLeft: 1 },
  { id: 5, name: "Greenfield Learning Institute", daysLeft: 2 },
  { id: 6, name: "Alpha Training Institute", daysLeft: 3 },
  { id: 7, name: "Sri Ram Institute", daysLeft: 3 },
  { id: 8, name: "Greenfield Learning Institute", daysLeft: 3 },
  { id: 9, name: "Sri Ram Institute", daysLeft: 3 },
];

const ExpiringTenants = () => {
  return (
    <div
      className="
        h-[423px]
        w-full
        overflow-hidden
        rounded-[18px]
        bg-white
        p-4
        shadow-[0_6px_19px_rgba(153,153,153,0.15)]
        dark:bg-[#343434]
      "
    >
<div
  className="
    flex
    h-[82px]
    w-full
    items-center
    gap-2
    rounded-[14px]
    bg-white
    px-2.5
    shadow-[4px_4px_10px_0px_rgba(0,0,0,0.08)]
    dark:bg-[#3b3b3b]
  "
>
  {/* Calendar Icon */}
  <div
    className="
      flex
      h-[38px]
      w-[38px]
      shrink-0
      items-center
      justify-center
      rounded-full
      bg-[#FFF0E1]
    "
  >
    <TbCalendarTime
      size={17}
      strokeWidth={2}
      className="text-[#FF922E]"
    />
  </div>

  {/* Text */}
  <div className="min-w-0 flex-1 space-y-2">
    <p className="whitespace-nowrap text-[13px] font-medium leading-[15px] text-[#FF922E]">
      In 3 Days
    </p>

    <h3 className="mt-0.5 whitespace-nowrap text-[16px] font-medium leading-[18px] text-[#010e30] dark:text-white">
      Expiring Tenants
    </h3>

    <p className="mt-0.5 whitespace-nowrap text-[9px] font-normal leading-[13px] text-[#848484]">
      Will expire in next 3 days
    </p>
  </div>

{/* Number */}
<div
  className="
    flex
    h-[52px]
    w-[52px]
    shrink-0
    items-center
    justify-center
    rounded-[10px]
    bg-gradient-to-br
    from-[#FAA031]
    via-[#F48218]
    to-[#E26901]
    shadow-[inset_1px_1.5px_2px_rgba(255,255,255,0.45),inset_-1.5px_-2px_4px_rgba(0,0,0,0.22),4px_4px_10px_rgba(0,0,0,0.18)]
  "
>
  <span className="text-[28px] font-medium leading-none text-white tracking-tight -translate-x-[0.5px]">
    07
  </span>
</div>
</div>

      {/* ================= HEADER ================= */}
      <div className="mt-5 flex items-center justify-between px-2">
        <h2
          className="
            text-[16px]
            font-semibold
            leading-[28px]
            text-[#07133D]
            dark:text-white
          "
        >
          Tenants
        </h2>
      </div>

      {/* ================= TENANTS ================= */}
      <div
        className="
          mt-2
          h-[240px]
          overflow-y-auto
          p-1
          scrollbar-none
        "
      >
        <div className="flex flex-col">
          {expiringTenants.map((tenant) => (
            <div
              key={tenant.id}
              className="
                flex
                min-h-[46px]
                w-full
                items-center
                justify-between
                gap-5 pb-2
              "
            >
              {/* Name */}
              <p
                className="
                  min-w-0
                  flex-1
                  
                  text-[13px]
                  font-medium
                  leading-[24px]
                  text-[#292929]
                  dark:text-[#F1F1F1]
                "
                title={tenant.name}
              >
                {tenant.name}
              </p>  

              {/* Badge */}
              <span
                className="
                  flex
                  h-[25px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-[6px]
                  bg-[#FFF4E5]
                  px-2
                  text-[9px]
                  font-medium
                  leading-none
                  text-[#FF922E]
                  dark:bg-[#4A3A2D]
                  dark:text-[#FFA85C]
                "
              >
                {tenant.daysLeft} Days left
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpiringTenants;