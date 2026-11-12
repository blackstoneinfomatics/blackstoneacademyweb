import React from "react";
import { Lock } from "lucide-react";
import SecurityCard from "./SecurityCard";

interface Props {
  settings: {
    maximumFailedAttempts: string;
    accountLockoutDuration: string;
    notifySuspiciousLogin: boolean;
  };
  onChange: (field: string, value: boolean | string) => void;
}

const LoginProtection = ({ settings, onChange }: Props) => {
  const selectClass =
    "h-[26px] w-full rounded border border-[#DCDCDC] bg-white px-2 text-[10px] text-[#263755] outline-none focus:border-[#5B70C8] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white";

  return (
    <SecurityCard
      title="Login Protection"
      description="Protect unauthorized access."
      icon={Lock}
      className="min-h-[250px]"
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-[10px] text-[#10204A] dark:text-gray-200">
            Maximum failed attempts
          </label>

          <select
            value={settings.maximumFailedAttempts}
            onChange={(e) =>
              onChange("maximumFailedAttempts", e.target.value)
            }
            className={selectClass}
          >
            {[3, 5, 7, 10, 15].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[10px] text-[#10204A] dark:text-gray-200">
            Account logout duration
          </label>

          <select
            value={settings.accountLockoutDuration}
            onChange={(e) =>
              onChange("accountLockoutDuration", e.target.value)
            }
            className={selectClass}
          >
            <option value="5 minutes">5 minutes</option>
            <option value="15 minutes">15 minutes</option>
            <option value="30 minutes">30 minutes</option>
            <option value="1 hour">1 hour</option>
            <option value="24 hours">24 hours</option>
          </select>
        </div>

        {/* Suspicious Login */}
        <div>
          <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-[#10204A] dark:text-gray-200">
            <input
              type="checkbox"
              checked={settings.notifySuspiciousLogin}
              onChange={(e) =>
                onChange("notifySuspiciousLogin", e.target.checked)
              }
              className="h-[14px] w-[14px] accent-[#5B70C8]"
            />
            Notify Suspicious Login
          </label>

          <p className="ml-5 mt-1 text-[9px] text-gray-500">
            Send email alert on suspicious login attempts.
          </p>
        </div>
      </div>
    </SecurityCard>
  );
};

export default LoginProtection;