import React from "react";
import { PortalRole, portalRoles } from "./PortalData";

type Props = {
  activeRole: PortalRole;
  onChange: (role: PortalRole) => void;
};

export default function PortalSidebar({
  activeRole,
  onChange,
}: Props) {
  return (
    <aside className="rounded-lg border border-[#e2e7f0] bg-white p-3 dark:border-[#414141] dark:bg-[#303030]">
      <h3 className="mb-3 text-sm font-medium dark:text-white">
        Portal
      </h3>

      <div className="flex gap-1 overflow-x-auto md:flex-col">
        {portalRoles.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            className={`shrink-0 rounded-md px-3 py-2.5 text-left text-[11px] transition-colors md:w-full ${
              activeRole === role
                ? "bg-gradient-to-b border border-blue-300 from-[#fcfdff] to-[#dbe2fd] text-black"
                : "text-[#1E293B] dark:text-gray-300 hover:bg-[#F5F6FA] dark:hover:bg-[#3A3A3A]"
            }`}
          >
            {role}
          </button>
        ))}
      </div>
    </aside>
  );
}