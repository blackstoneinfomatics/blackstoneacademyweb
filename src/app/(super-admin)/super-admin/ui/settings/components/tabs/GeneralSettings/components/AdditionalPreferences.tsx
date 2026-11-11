"use client";

import React, { useState } from "react";
import SettingsCard from "./SettingsCard";

const Toggle = ({ defaultChecked = true }: { defaultChecked?: boolean }) => {
  const [enabled, setEnabled] = useState(defaultChecked);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => setEnabled(!enabled)}
      className={`relative h-[13px] w-[21px] shrink-0 rounded-full transition-colors ${
        enabled ? "bg-[#6075CD]" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-[2px] h-[9px] w-[9px] rounded-full bg-white transition-all ${
          enabled ? "left-[10px]" : "left-[2px]"
        }`}
      />
    </button>
  );
};

const AdditionalPreferences = () => {
  const preferences = [
    "Enable welcome email for new tenants",
    "Enable system maintenance notifications",
    "Allow tenants to change date format",
  ];

  return (
    <SettingsCard title="Additional Preferences">
      <div className="space-y-4">
        {preferences.map((item) => (
          <div
            key={item}
            className="flex items-center justify-between gap-2"
          >
            <span className="text-[11px] text-[#10204A] dark:text-gray-200">
              {item}
            </span>

            <Toggle />
          </div>
        ))}
      </div>
    </SettingsCard>
  );
};

export default AdditionalPreferences;