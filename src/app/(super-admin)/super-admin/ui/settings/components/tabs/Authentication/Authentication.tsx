"use client";

import React, { useState } from "react";

import SignInAccess from "./components/SignInAccess";
import EmailVerification from "./components/EmailVerification";
import SessionManagement from "./components/SessionManagement";

import {
  AuthSettings,
  BooleanSettingKey,
  SelectSettingKey,
} from "./components/authTypes";

const defaultSettings: AuthSettings = {
  enableEmailPassword: true,
  enableTwoFactor: true,
  enforceAdmin2FA: true,
  rememberDevice: true,
  maxLoginAttempts: 5,
  lockoutDuration: "15 Minutes",

  requireEmailVerification: true,
  verifyOnSignup: true,
  verificationLinkExpiry: "24 Hours",

  sessionTimeout: "15 Minutes",
  idleWarning: "15 Minutes",
  sessionRememberDevice: true,
};

interface AuthenticationProps {
  onSave?: (settings: AuthSettings) => void;
}

const Authentication = ({ onSave }: AuthenticationProps) => {
  const [settings, setSettings] =
    useState<AuthSettings>(defaultSettings);

  const handleToggle = (
    key: BooleanSettingKey,
    value: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSelect = (
    key: SelectSettingKey,
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNumberChange = (value: number) => {
    setSettings((prev) => ({
      ...prev,
      maxLoginAttempts: value,
    }));
  };

  const handleCancel = () => {
    setSettings({ ...defaultSettings });
  };

  const handleSave = () => {
    onSave?.(settings);
  };

  return (
    <div className="w-full space-y-1.5">

      {/* Page Heading */}
      <div className="mb-5 space-y-[2px]">
        <h2 className="text-sm font-semibold text-[#10204A] dark:text-white">
          Authentication
        </h2>

        <p className="mt-0.5 text-[11px] text-[#777777] dark:text-gray-400">
          Configure how users sign in and access the platform.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">

        {/* Left Column */}
        <div className="space-y-3">
          <SignInAccess
            settings={settings}
            onToggle={handleToggle}
            onSelect={handleSelect}
            onNumberChange={handleNumberChange}
          />

          <SessionManagement
            settings={settings}
            onToggle={handleToggle}
            onSelect={handleSelect}
          />
        </div>

        {/* Right Column */}
        <div>
          <EmailVerification
            settings={settings}
            onToggle={handleToggle}
            onSelect={handleSelect}
          />
        </div>

      </div>

      {/* Footer Actions */}
      <div className="mt-3 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-md border border-[#6379D3] bg-transparent px-4 py-1.5 text-[11px] font-medium text-[#536AC4] transition hover:bg-[#E9ECFA] dark:hover:bg-[#414B70]"
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

export default Authentication;