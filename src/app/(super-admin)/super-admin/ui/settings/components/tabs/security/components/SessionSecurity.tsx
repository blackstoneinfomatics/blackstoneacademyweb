import React from "react";
import { ShieldCheck } from "lucide-react";
import SecurityCard from "./SecurityCard";

interface Props {
  settings: {
    sessionTimeout: string;
    forceLogoutOnPasswordChange: boolean;
    allowMultipleActiveSessions: boolean;
  };
  onChange: (field: string, value: boolean | string) => void;
}

const SessionSecurity = ({ settings, onChange }: Props) => {
  const selectClass =
    "h-[26px] w-full rounded border border-[#DCDCDC] bg-white px-2 text-[10px] text-[#263755] outline-none focus:border-[#5B70C8] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white";

  return (
    <SecurityCard
      title="Session Security"
      description="Configure session and device security"
      icon={ShieldCheck}
      className="min-h-[250px]"
    >
      <div className="space-y-3">
        {/* Session Timeout */}
        <div>
          <label className="mb-1 block text-[10px] text-[#10204A] dark:text-gray-200">
            Session timeout
          </label>

          <select
            value={settings.sessionTimeout}
            onChange={(e) =>
              onChange("sessionTimeout", e.target.value)
            }
            className={selectClass}
          >
            <option value="15 Minutes">15 Minutes</option>
            <option value="30 Minutes">30 Minutes</option>
            <option value="1 Hour">1 Hour</option>
            <option value="2 Hours">2 Hours</option>
            <option value="4 Hours">4 Hours</option>
          </select>
        </div>

        {/* Force Logout */}
        <div>
          <label className="flex cursor-pointer items-center gap-1.5 text-[10px] font-medium text-[#10204A] dark:text-gray-200">
            <input
              type="checkbox"
              checked={settings.forceLogoutOnPasswordChange}
              onChange={(e) =>
                onChange(
                  "forceLogoutOnPasswordChange",
                  e.target.checked
                )
              }
              className="h-[14px] w-[14px] accent-[#5B70C8]"
            />
            Force Logout on Password Change
          </label>

          <p className="ml-5 mt-1 text-[9px] text-gray-500">
            All active sessions will be logged out.
          </p>
        </div>

        {/* Multiple Sessions */}
        <div>
          <label className="flex cursor-pointer items-center gap-1.5 text-[10px] font-medium text-[#10204A] dark:text-gray-200">
            <input
              type="checkbox"
              checked={settings.allowMultipleActiveSessions}
              onChange={(e) =>
                onChange(
                  "allowMultipleActiveSessions",
                  e.target.checked
                )
              }
              className="h-[14px] w-[14px] accent-[#5B70C8]"
            />
            Allow Multiple Active Sessions
          </label>

          <p className="ml-5 mt-1 text-[9px] text-gray-500">
            Users can stay logged in on multiple devices.
          </p>
        </div>
      </div>
    </SecurityCard>
  );
};

export default SessionSecurity;