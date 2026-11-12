import React from "react";
import AuthSettingsCard from "./AuthSettingsCard";
import AuthToggleRow from "./AuthToggleRow";
import AuthSelectRow from "./AuthSelectRow";
import AuthNumberRow from "./AuthNumberRow";

import {
  AuthSettings,
  BooleanSettingKey,
  SelectSettingKey,
} from "./authTypes";

interface Props {
  settings: AuthSettings;
  onToggle: (key: BooleanSettingKey, value: boolean) => void;
  onSelect: (key: SelectSettingKey, value: string) => void;
  onNumberChange: (value: number) => void;
}

const SignInAccess = ({
  settings,
  onToggle,
  onSelect,
  onNumberChange,
}: Props) => {
  return (
    <AuthSettingsCard title="Sign-in & Access">
      <AuthToggleRow
        label="Enable Email/Password Login"
        description="Allow users to sign in using email address and password."
        checked={settings.enableEmailPassword}
        onChange={(v) => onToggle("enableEmailPassword", v)}
      />

      <AuthToggleRow
        label="Enable Two-Factor Authentication (2FA)"
        description="Require users to verify with a second factor during sign in."
        checked={settings.enableTwoFactor}
        onChange={(v) => onToggle("enableTwoFactor", v)}
      />

      <AuthToggleRow
        label="Enforce 2FA for Admins Only"
        description="2FA will be mandatory only for Super Admins and Admins."
        checked={settings.enforceAdmin2FA}
        onChange={(v) => onToggle("enforceAdmin2FA", v)}
      />

      <AuthToggleRow
        label="Remember Device"
        description="Allow users to remember trusted devices for 30 days."
        checked={settings.rememberDevice}
        onChange={(v) => onToggle("rememberDevice", v)}
      />

      <AuthNumberRow
        label="Maximum Login Attempts"
        description="Allow users to remember trusted devices for 30 days."
        value={settings.maxLoginAttempts}
        onChange={onNumberChange}
      />

      <AuthSelectRow
        label="Account Lockout Duration"
        description="Allow users to remember trusted devices for 30 days."
        value={settings.lockoutDuration}
        options={["5 Minutes", "15 Minutes", "30 Minutes", "1 Hour", "24 Hours"]}
        onChange={(v) => onSelect("lockoutDuration", v)}
      />
    </AuthSettingsCard>
  );
};

export default SignInAccess;