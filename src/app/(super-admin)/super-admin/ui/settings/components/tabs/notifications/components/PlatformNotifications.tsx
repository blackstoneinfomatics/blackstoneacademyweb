import React from "react";
import NotificationCard from "./NotificationCard";

interface Props {
  enabled: boolean;
  onToggle: (value: boolean) => void;
}

const PlatformNotifications = ({ enabled, onToggle }: Props) => {
  return (
    <NotificationCard title="Platform Information">
      <div className="space-y-3">
        {/* Enable Notifications */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium text-[#10204A] dark:text-gray-200">
              Enable Notifications
            </p>
            <p className="mt-0.5 text-[10px] text-gray-500">
              Turn on or off all system notifications.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => onToggle(!enabled)}
            className={`relative h-[13px] w-[22px] shrink-0 rounded-full transition ${
              enabled ? "bg-[#5B70C8]" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-[2px] h-[9px] w-[9px] rounded-full bg-white transition-all ${
                enabled ? "left-[11px]" : "left-[2px]"
              }`}
            />
          </button>
        </div>

        {/* Email Notifications */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium text-[#10204A] dark:text-gray-200">
              Email notifications
            </p>
            <p className="mt-0.5 text-[10px] text-gray-500">
              System notifications will be sent to the configured email address.
            </p>
          </div>

          <span className="shrink-0 rounded-md bg-[#EAFBF0] px-2.5 py-1 text-[9px] font-medium text-[#29964B]">
            Enabled
          </span>
        </div>
      </div>
    </NotificationCard>
  );
};

export default PlatformNotifications;