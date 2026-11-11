import React from "react";
import SettingsCard from "./SettingsCard";

const inputClass =
  "h-[27px] w-full rounded border border-[#D8D8D8] bg-white px-2 text-[11px] text-[#263755] outline-none focus:border-[#6178D1] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white";

const labelClass =
  "mb-1 block text-[12px] font-medium text-[#10204A] dark:text-gray-200";

const PlatformInformation = () => {
  return (
    <SettingsCard title="Platform Information"> 
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Platform Name</label>
          <input className={inputClass} defaultValue="Blackstone Nexus" />
        </div>

        <div>
          <label className={labelClass}>Platform Tagline</label>
          <input className={inputClass} defaultValue="Blackstone Nexus" />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Support Email</label>
          <input
            className={inputClass}
            defaultValue="support@blackstone.com"
          />
        </div>

        <div>
          <label className={labelClass}>Default Language</label>
          <select className={inputClass} defaultValue="English">
            <option>English</option>
            <option>Tamil</option>
            <option>Hindi</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Default Currency</label>
          <select className={inputClass} defaultValue="INR">
            <option value="INR">INR (₹) - Indian Rupee</option>
            <option value="USD">USD ($) - US Dollar</option>
            <option value="EUR">EUR (€) - Euro</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Currency Position</label>
          <input
            className={inputClass}
            defaultValue="Before Amount (₹1,234.56)"
          />
        </div>
      </div>
    </SettingsCard>
  );
};

export default PlatformInformation;