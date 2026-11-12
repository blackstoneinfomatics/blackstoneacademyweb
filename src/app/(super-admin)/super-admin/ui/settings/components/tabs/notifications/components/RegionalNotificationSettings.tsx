import React from "react";
import NotificationCard from "./NotificationCard";

interface Props {
  supportEmail: string;
  country: string;
  emailSignature: string;
  onEmailChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onSignatureChange: (value: string) => void;
}

const RegionalNotificationSettings = ({
  supportEmail,
  country,
  emailSignature,
  onEmailChange,
  onCountryChange,
  onSignatureChange,
}: Props) => {
  const labelClass =
    "mb-1 block text-[11px] font-medium text-[#10204A] dark:text-gray-200";

  const inputClass =
    "h-[26px] w-full rounded border border-[#DCDCDC] bg-white px-2 text-[10px] text-[#263755] outline-none focus:border-[#5B70C8] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white";

  return (
    <NotificationCard title="Regional Settings" className="h-full">
      <div className="space-y-3">
        {/* Support Email */}
        <div>
          <label className={labelClass}>
            Support Email address
          </label>

          <select
            value={supportEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            className={inputClass}
          >
            <option value="noreply@blackstone.com">
              noreply@blackstone.com
            </option>
            <option value="support@blackstone.com">
              support@blackstone.com
            </option>
          </select>
        </div>

        {/* Country */}
        <div>
          <label className={labelClass}>Default Country</label>

          <select
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            className={inputClass}
          >
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
          </select>
        </div>

        {/* SMTP Status */}
        <div>
          <label className={labelClass}>SMTP Status</label>

          <div className="flex items-start gap-2 rounded-md border border-[#D4F5DF] bg-[#F0FCF4] p-2.5 dark:border-green-900 dark:bg-[#193526]">
            <div className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#24C466] text-[10px] text-white">
              ✓
            </div>

            <div>
              <p className="text-[10px] font-semibold text-[#239B4E]">
                Connected
              </p>

              <p className="mt-0.5 text-[8px] text-[#66B982]">
                Last verified: 2 minutes ago
              </p>
            </div>
          </div>
        </div>

        {/* Email Signature */}
        <div>
          <label className={labelClass}>Email Signature</label>

          <textarea
            value={emailSignature}
            onChange={(e) => onSignatureChange(e.target.value)}
            rows={4}
            className="w-full resize-none rounded border border-[#DCDCDC] bg-white p-2 text-[10px] leading-5 text-[#263755] outline-none focus:border-[#5B70C8] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white"
          />
        </div>
      </div>
    </NotificationCard>
  );
};

export default RegionalNotificationSettings;