"use client";

import React from "react";
import Image from "next/image";
const FeatureSummaryCards = () => {
  // Dummy API Response
  const dashboardData = {
    featureSummary: {
      totalFeatures: 28,
      planIncluded: 28,
      customAdded: 4,
      activeFeatures: 24,
      inactiveFeatures: 4,
    },
  };

  const { featureSummary } = dashboardData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ================= Available Features ================= */}
      <div className="bg-white border border-[#E8E8E8] rounded-[24px] shadow-sm p-6 h-[175px]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full  flex items-center justify-center">
  <Image
    src="/assets/images/k (6).png"
    alt="Available Features"
    width={60}
    height={60}
    className="object-contain"
  />
</div>

          <div>
            <h3 className="text-[#5A4CF5] text-[15px] font-semibold">
              Available Features
            </h3>

            <h2 className="text-[30px] font-bold text-[#2C2C2C] leading-none mt-2">
              {featureSummary.totalFeatures}
            </h2>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="flex-1">
            <p className="text-[15px] text-[#666]">Plan Included</p>

            <h3 className="text-[24px] font-bold text-[#2C2C2C] leading-none mt-1">
              {featureSummary.planIncluded}
            </h3>
          </div>

          <div className="w-px h-14 bg-[#E5E5E5]" />

          <div className="flex-1 pl-10">
            <p className="text-[15px] text-[#666]">Custom added</p>

            <h3 className="text-[24px] font-bold text-[#2C2C2C] leading-none mt-1">
              {featureSummary.customAdded.toString().padStart(2, "0")}
            </h3>
          </div>
        </div>
      </div>

      {/* ================= Active Features ================= */}

      <div className="bg-white border border-[#E8E8E8] rounded-[24px] shadow-sm p-6 h-[175px]">
        <div className="flex items-center gap-4">
         <div className="w-14 h-14 rounded-full flex items-center justify-center">
  <Image
    src="/assets/images/k (7).png"
    alt="Available Features"
    width={60}
    height={60}
    className="object-contain"
  />
</div>

          <div>
            <h3 className="text-[#2DBE60] text-[15px] font-semibold">
              Active Features
            </h3>

            <h2 className="text-[30px] font-bold text-[#2C2C2C] leading-none mt-2">
              {featureSummary.activeFeatures}
            </h2>
          </div>
        </div>

        <p className="text-[16px] text-[#666] mt-12">
          <span className="font-semibold">{featureSummary.activeFeatures}</span>{" "}
          features enabled out of{" "}
          <span className="font-semibold">{featureSummary.totalFeatures}</span>
        </p>
      </div>

      {/* ================= Inactive Features ================= */}

      <div className="bg-white border border-[#E8E8E8] rounded-[24px] shadow-sm p-6 h-[175px]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center">
  <Image
    src="/assets/images/k (8).png"
    alt="Available Features"
    width={60}
    height={60}
    className="object-contain"
  />
</div>

          <div>
            <h3 className="text-[#E24C4B] text-[15px] font-semibold">
              Inactive Features
            </h3>

            <h2 className="text-[30px] font-bold text-[#2C2C2C] leading-none mt-2">
              {featureSummary.inactiveFeatures}
            </h2>
          </div>
        </div>

        <p className="text-[16px] text-[#666] mt-12">Due to plan limitations</p>
      </div>
    </div>
  );
};

export default FeatureSummaryCards;
