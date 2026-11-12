"use client";

import React, { useState } from "react";

import PasswordSecurity from "./components/PasswordSecurity";
import LoginProtection from "./components/LoginProtection";
import SecurityScore from "./components/SecurityScore";
import SessionSecurity from "./components/SessionSecurity";

import { SecuritySettings } from "./components/securityTypes";

const initialSettings: SecuritySettings = {
  enforceStrongPassword: true,
  minimumPasswordLength: "8",
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialCharacters: true,

  maximumFailedAttempts: "5",
  accountLockoutDuration: "15 minutes",
  notifySuspiciousLogin: true,

  sessionTimeout: "30 Minutes",
  forceLogoutOnPasswordChange: true,
  allowMultipleActiveSessions: true,
};

interface SecurityProps {
  onSave?: (settings: SecuritySettings) => void;
}

const Security = ({ onSave }: SecurityProps) => {
  const [settings, setSettings] =
    useState<SecuritySettings>({ ...initialSettings });

  const handleChange = (
    field: string,
    value: boolean | string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    setSettings({ ...initialSettings });
  };

  const handleSave = () => {
    onSave?.(settings);
  };

  return (
    <div className="w-full space-y-0.5">

      {/* Header */}
      <div className="mb-5 space-y-[2px]">
        <h2 className="text-[15px] font-semibold text-[#10204A] dark:text-white">
          Security
        </h2>

        <p className="mt-0.5 text-[11px] text-gray-500">
          Manage security settings to protect your platform and data.
        </p>
      </div>

      {/* Security Cards */}
      <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-2 xl:grid-cols-3">

        {/* Password Security */}
        <PasswordSecurity
          settings={settings}
          onChange={handleChange}
        />

        {/* Login Protection */}
        <LoginProtection
          settings={settings}
          onChange={handleChange}
        />

        {/* Security Score */}
        <SecurityScore score={92} />

        {/* Session Security */}
        <SessionSecurity
          settings={settings}
          onChange={handleChange}
        />

      </div>

      {/* Footer */}
      <div className="mt-3 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-md border border-[#6379D3] px-4 py-1.5 text-[11px] font-medium text-[#536AC4] transition hover:bg-[#E9ECFA] dark:hover:bg-[#414B70]"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="rounded-md bg-[#5B70C8] px-4 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#485DB5]"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Security;