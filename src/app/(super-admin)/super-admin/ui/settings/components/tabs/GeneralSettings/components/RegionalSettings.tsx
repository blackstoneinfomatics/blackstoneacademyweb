import React from "react";
import SettingsCard from "./SettingsCard";

const RegionalSettings = () => {
  const selectClass =
    "h-[27px] w-full rounded border border-[#D8D8D8] bg-white px-2 text-[11px] text-[#263755] outline-none focus:border-[#6178D1] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white";

  const labelClass =
    "mb-1 block text-[12px] font-medium text-[#10204A] dark:text-gray-200";

  return (
    <SettingsCard title="Regional Settings">
      <div className="space-y-3">
        <div>
          <label className={labelClass}>Default Country</label>
          <select className={selectClass} defaultValue="India">
            <option>India</option>
            <option>United States</option>
            <option>United Kingdom</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Default State</label>
          <select className={selectClass} defaultValue="Karnataka">
            <option>Karnataka</option>
            <option>Tamil Nadu</option>
            <option>Kerala</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Default City</label>
          <select className={selectClass} defaultValue="Bengaluru">
            <option>Bengaluru</option>
            <option>Coimbatore</option>
            <option>Chennai</option>
          </select>
        </div>
      </div>
    </SettingsCard>
  );
};

export default RegionalSettings;