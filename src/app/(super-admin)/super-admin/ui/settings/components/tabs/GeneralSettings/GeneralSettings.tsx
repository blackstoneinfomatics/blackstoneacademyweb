"use client";

import React from "react";

import PlatformInformation from "./components/PlatformInformation";
import BusinessInformation from "./components/BusinessInformation";
import PlatformLogo from "./components/PlatformLogo";
import RegionalSettings from "./components/RegionalSettings";
import AdditionalPreferences from "./components/AdditionalPreferences";

const GeneralSettings = () => {
  return (
    <div className="w-full space-y-1.5">
      {/* Page Header */}
      <div className="mb-5 space-y-[2px]">
        <h1 className="text-sm font-semibold text-[#10204A] dark:text-white">
          General Settings
        </h1>

        <p className="text-[12px] text-gray-500">
          Make basic information and default platform settings
        </p>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[1.65fr_1fr]">
        {/* Left Column */}
        <div className="space-y-3">
          <PlatformInformation />
          <BusinessInformation />
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <PlatformLogo />
          <RegionalSettings />
          <AdditionalPreferences />
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;