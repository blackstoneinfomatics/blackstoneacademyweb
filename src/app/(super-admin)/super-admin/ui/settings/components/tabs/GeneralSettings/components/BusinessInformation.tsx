import React from "react";
import SettingsCard from "./SettingsCard";

const inputClass =
  "h-[27px] w-full rounded border border-[#D8D8D8] bg-white px-2 text-[11px] text-[#263755] outline-none focus:border-[#6178D1] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white";

const labelClass =
  "mb-1 block text-[12px] font-medium text-[#10204A] dark:text-gray-200";

const BusinessInformation = () => {
  return (
    <SettingsCard title="Business Information">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Company Name</label>
          <input
            className={inputClass}
            defaultValue="Blackstone Technologies Pvt. Ltd."
          />
        </div>

        <div>
          <label className={labelClass}>
            Company Registration Number
          </label>
          <input
            className={inputClass}
            defaultValue="U72900KA2018PTC123456"
          />
        </div>

        <div>
          <label className={labelClass}>Contact Number</label>
          <input
            className={inputClass}
            defaultValue="+91 80 1234 5678"
          />
        </div>

        <div>
          <label className={labelClass}>Website</label>
          <input
            className={inputClass}
            defaultValue="https://blackstone.com"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Company Address</label>
          <textarea
            className="min-h-[115px] w-full resize-none rounded border border-[#D8D8D8] bg-white p-2 text-[11px] text-[#263755] outline-none focus:border-[#6178D1] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white"
            defaultValue="123, BSI, Marakadail, Coimbatore"
          />
        </div>
      </div>
    </SettingsCard>
  );
};

export default BusinessInformation;