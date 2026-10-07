"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface FeatureSummary {
  totalFeatures: number;
  customFeatures: number;
  defaultFeatures: number;
  enabledFeatures: number;
  disabledFeatures: number;
}

interface FeatureSummaryCardsProps {
  tenantId?: string;
}

const FeatureSummaryCards = ({
  tenantId: propTenantId,
}: FeatureSummaryCardsProps) => {
  const searchParams = useSearchParams();
  const tenantId = propTenantId ?? searchParams.get("tenantCode") ?? "";

  const [featureSummary, setFeatureSummary] = useState<FeatureSummary | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeatureSummary = async () => {
      if (!tenantId) {
        setFeatureSummary(null);
        setLoading(false);
        setError("Tenant not selected.");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.FEATURE_CONTROL.GET_FEATURE_SUMMARY_BY_TENANT.replace("{tenantId}", encodeURIComponent(tenantId))}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          setFeatureSummary(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch feature summary");
        }
      } catch (error) {
        console.error("Error fetching feature summary:", error);
        setError("Failed to load feature summary");
      } finally {
        setLoading(false);
      }
    };

    fetchFeatureSummary();
  }, [tenantId]);

  // ================= Loading =================
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-white dark:bg-[#323232] rounded-2xl shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] p-6 h-[175px] animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700" />

              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>

            <div className="mt-8 w-full h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // ================= Error =================
  if (error || !featureSummary) {
    return (
      <div className="bg-white dark:bg-[#323232] rounded-2xl p-6 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)]">
        <p className="text-red-500 text-sm font-medium">
          {error || "Feature summary not available"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ================= Available Features ================= */}
      <div className="bg-white dark:bg-[#323232] rounded-2xl shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] p-6 h-[175px]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center">
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

            <h2 className="text-xl font-semibold text-[#242424] dark:text-white leading-none mt-2">
              {featureSummary.totalFeatures}
            </h2>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="flex-1">
            <p className="text-[15px] font-medium text-[#646464] dark:text-gray-300">
              Plan Included
            </p>

            <h3 className="text-xl font-semibold text-[#242424] dark:text-white leading-none mt-1">
              {featureSummary.defaultFeatures}
            </h3>
          </div>

          <div className="w-[2px] h-14 bg-[#E6E6E6]" />

          <div className="flex-1 pl-10">
            <p className="text-[15px] font-medium text-[#646464] dark:text-gray-300">
              Custom added
            </p>

            <h3 className="text-xl font-semibold text-[#242424] dark:text-white leading-none mt-1">
              {featureSummary.customFeatures.toString().padStart(2, "0")}
            </h3>
          </div>
        </div>
      </div>

      {/* ================= Active Features ================= */}
      <div className="bg-white dark:bg-[#323232] rounded-2xl shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] p-6 h-[175px]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center">
            <Image
              src="/assets/images/k (7).png"
              alt="Active Features"
              width={60}
              height={60}
              className="object-contain"
            />
          </div>

          <div>
            <h3 className="text-[#2DBE60] text-[15px] font-semibold">
              Active Features
            </h3>

            <h2 className="text-xl font-semibold text-[#2C2C2C] dark:text-white leading-none mt-2">
              {featureSummary.enabledFeatures}
            </h2>
          </div>
        </div>

        <p className="text-[15px] font-medium text-[#646464] dark:text-gray-300 mt-12">
          <span className="font-semibold">
            {featureSummary.enabledFeatures}
          </span>{" "}
          features enabled out of{" "}
          <span className="font-semibold">{featureSummary.totalFeatures}</span>
        </p>
      </div>

      {/* ================= Inactive Features ================= */}
      <div className="bg-white dark:bg-[#323232] rounded-2xl shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] p-6 h-[175px]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center">
            <Image
              src="/assets/images/k (8).png"
              alt="Inactive Features"
              width={60}
              height={60}
              className="object-contain"
            />
          </div>

          <div>
            <h3 className="text-[#E24C4B] text-[15px] font-semibold">
              Inactive Features
            </h3>

            <h2 className="text-xl font-semibold text-[#2C2C2C] dark:text-white leading-none mt-2">
              {featureSummary.disabledFeatures}
            </h2>
          </div>
        </div>

        <p className="text-[15px] text-[#646464] font-medium dark:text-gray-300 mt-12">
          Due to plan limitations
        </p>
      </div>
    </div>
  );
};

export default FeatureSummaryCards;
